#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

BASE_BRANCH="plauder"
UPSTREAM_REPO="cinnyapp/cinny"
UPSTREAM_URL="${UPSTREAM_URL:-https://github.com/${UPSTREAM_REPO}.git}"
UPSTREAM_DEV_REF="refs/remotes/upstream/dev"
AUTO_MERGE="${AUTO_MERGE:-true}"

export GH_REPO="${GH_REPO:-${GITHUB_REPOSITORY:?GITHUB_REPOSITORY must be set}}"

# Auto-merge needs PR CI. PRs created with GITHUB_TOKEN do not trigger it.
if [ -z "${SYNC_TOKEN:-}" ]; then
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    echo "::error::SYNC_TOKEN is not configured. Add a fine-grained PAT with Contents, Pull requests, and Workflows read/write."
    exit 1
  fi
  echo "::warning::SYNC_TOKEN is not set; disabling auto-merge because GITHUB_TOKEN-created PRs do not trigger pull_request workflows."
  AUTO_MERGE=false
else
  # Outside Actions, actions/checkout is not there to configure git auth.
  # Use SYNC_TOKEN for both git and gh so a local run matches Actions.
  export GH_TOKEN="${GH_TOKEN:-$SYNC_TOKEN}"
  if [ -z "${GITHUB_ACTIONS:-}" ] && [ -z "${GIT_CONFIG_COUNT:-}" ]; then
    AUTH="$(printf 'x-access-token:%s' "$SYNC_TOKEN" | base64 | tr -d '\n')"
    export GIT_CONFIG_COUNT=1
    export GIT_CONFIG_KEY_0="http.https://github.com/.extraheader"
    export GIT_CONFIG_VALUE_0="AUTHORIZATION: basic ${AUTH}"
  fi
fi

push_or_explain() {
  if git push "$@"; then
    return 0
  fi
  cat >&2 <<'EOF'
::error::Git push failed. If GitHub rejected it for workflow permissions, the git token cannot update .github/workflows/*.
Use a token with "Workflows: Read and write" (fine-grained PAT or GitHub App) or the "workflow" scope (classic PAT).
Local run: SYNC_TOKEN=<token> bash .github/scripts/sync-upstream.sh
GitHub Actions: store the token as the SYNC_TOKEN secret.
EOF
  return 1
}

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

enable_auto_merge() {
  local pr="$1"
  local meta state is_draft auto_requested

  if [ "$AUTO_MERGE" != "true" ]; then
    echo "Auto-merge is disabled."
    return 0
  fi

  meta="$(gh pr view "$pr" --json isDraft,autoMergeRequest \
    --jq '[.isDraft, (.autoMergeRequest != null)] | @tsv')"
  IFS=$'\t' read -r is_draft auto_requested <<< "$meta"

  if [ "$is_draft" = "true" ]; then
    echo "PR #${pr} is a draft; skipping auto-merge."
    return 0
  fi
  if [ "$auto_requested" = "true" ]; then
    echo "Auto-merge is already enabled for PR #${pr}."
    return 0
  fi

  for _ in {1..12}; do
    state="$(gh pr view "$pr" --json mergeable --jq .mergeable 2>/dev/null || echo UNKNOWN)"
    if [ "$state" = "MERGEABLE" ] || [ "$state" = "CONFLICTING" ]; then
      break
    fi
    sleep 5
  done

  if [ "${state:-UNKNOWN}" != "MERGEABLE" ]; then
    echo "PR #${pr} is not mergeable (${state:-UNKNOWN}); leaving it open."
    return 1
  fi

  if gh pr merge "$pr" --auto --merge --delete-branch; then
    echo "Auto-merge enabled for PR #${pr}."
    return 0
  fi

  echo "::warning::Could not enable auto-merge for PR #${pr}. Check repository auto-merge settings and required checks."
  return 1
}

# Fetch only upstream dev, with full history, without adding a remote or tags.
git fetch --no-tags "$UPSTREAM_URL" "+refs/heads/dev:${UPSTREAM_DEV_REF}"
TARGET_SHA="$(git rev-parse "${UPSTREAM_DEV_REF}")"
TARGET_SHORT="$(git rev-parse --short=8 "$TARGET_SHA")"

# Keep fork dev as a strict fast-forward mirror.
if git fetch origin dev --prune >/dev/null 2>&1 \
  && ! git merge-base --is-ancestor origin/dev "$TARGET_SHA"; then
  echo "::error::origin/dev has commits that are not in upstream/dev. Refusing to overwrite it."
  exit 1
fi
push_or_explain origin "${TARGET_SHA}:refs/heads/dev"

if git merge-base --is-ancestor "$TARGET_SHA" "refs/heads/${BASE_BRANCH}"; then
  echo "${BASE_BRANCH} already contains upstream dev (${TARGET_SHORT})."
  exit 0
fi

OPEN_PR="$(gh pr list --base "$BASE_BRANCH" --state open --limit 100 \
  --json number,headRefName \
  --jq '[.[] | select(.headRefName | startswith("sync/"))][0].number // empty')"
if [ -n "$OPEN_PR" ]; then
  echo "Open sync PR #${OPEN_PR} already exists; leaving it untouched."
  enable_auto_merge "$OPEN_PR" || true
  exit 0
fi

BRANCH="sync/dev-${TARGET_SHORT}"
git checkout -B "$BRANCH" "refs/heads/${BASE_BRANCH}"

BASE_SHA="$(git merge-base "refs/heads/${BASE_BRANCH}" "$TARGET_SHA")"
BASE_SHORT="$(git rev-parse --short=8 "$BASE_SHA")"
COMMIT_COUNT="$(git rev-list --count "${BASE_SHA}..${TARGET_SHA}")"
COMPARE_URL="https://github.com/${UPSTREAM_REPO}/compare/${BASE_SHA}...${TARGET_SHA}"

# Only paths that are safe to keep from our side may be auto-resolved.
ALLOW_OURS=(
  ".github/workflows/prod-deploy.yml"
)

MERGED=false
CONFLICT_PATHS=()

if git merge --no-ff --no-commit "$TARGET_SHA" >/tmp/sync-merge.log 2>&1; then
  git commit --allow-empty -m "chore: merge upstream dev (${TARGET_SHORT}) into ${BASE_BRANCH}"
  MERGED=true
else
  mapfile -t CONFLICT_PATHS < <(git diff --name-only --diff-filter=U)

  if [ "${#CONFLICT_PATHS[@]}" -eq 0 ]; then
    echo "::error::Merge failed without conflict paths."
    cat /tmp/sync-merge.log
    git merge --abort >/dev/null 2>&1 || true
    exit 1
  fi

  UNEXPECTED=()
  for path in "${CONFLICT_PATHS[@]}"; do
    for allowed in "${ALLOW_OURS[@]}"; do
      if [ "$path" = "$allowed" ]; then
        continue 2
      fi
    done
    UNEXPECTED+=("$path")
  done

  if [ "${#UNEXPECTED[@]}" -gt 0 ]; then
    echo "Unexpected conflicts; opening a draft PR for manual resolution:"
    printf ' - %s\n' "${UNEXPECTED[@]}"
    git merge --abort >/dev/null 2>&1 || true
    git reset --hard "$TARGET_SHA"
  else
    echo "All conflicts are allowlisted; retrying with -X ours."
    git merge --abort

    set +e
    git merge --no-ff --no-commit -X ours "$TARGET_SHA" >/tmp/sync-merge-ours.log 2>&1
    set -e

    if git rev-parse --verify --quiet MERGE_HEAD >/dev/null; then
      # prod-deploy.yml is intentionally removed from the fork.
      git rm -f --ignore-unmatch .github/workflows/prod-deploy.yml >/dev/null 2>&1 || true

      REMAIN="$(git diff --name-only --diff-filter=U)"
      if [ -n "$REMAIN" ]; then
        echo "::warning::Auto-resolution left conflicts; opening a draft PR."
        printf '%s\n' "$REMAIN"
        git merge --abort >/dev/null 2>&1 || true
        git reset --hard "$TARGET_SHA"
      else
        git add -A
        git commit --allow-empty -m "chore: merge upstream dev (${TARGET_SHORT}) into ${BASE_BRANCH}"
        MERGED=true
      fi
    else
      echo "::warning::Auto-resolution failed; opening a draft PR."
      git merge --abort >/dev/null 2>&1 || true
      git reset --hard "$TARGET_SHA"
    fi
  fi
fi

# Keep the displayed fork version aligned with package.json. This only touches
# a fork-owned file, so it never conflicts with upstream.
if [ "$MERGED" = true ] && [ -f src/app/branding.ts ]; then
  PKG_VERSION="$(node -p "require('./package.json').version" 2>/dev/null || true)"
  if [ -n "$PKG_VERSION" ] && [ "$PKG_VERSION" != "undefined" ]; then
    NEW_VERSION="v${PKG_VERSION}"
    sed -i -E "s#^(export const VERSION = ).*#\1'${NEW_VERSION}';#" src/app/branding.ts
    if ! git diff --quiet -- src/app/branding.ts; then
      git add src/app/branding.ts
      git commit -m "chore: set Plauder version to ${NEW_VERSION}"
    fi
  fi
fi

# The branch is bot-owned and only reused after a failed run, so force-with-lease
# after a fetch is safe and avoids stale branches.
git fetch origin "$BRANCH" >/dev/null 2>&1 || true
push_or_explain --force-with-lease origin "$BRANCH"

STATUS="needs manual conflict resolution"
if [ "$MERGED" = true ]; then
  STATUS="clean merge"
  if [ "${#CONFLICT_PATHS[@]}" -gt 0 ]; then
    STATUS="merged with auto-resolved conflicts"
  fi
fi

AUTO_MERGE_NOTE="not enabled"
if [ "$MERGED" = true ] && [ "$AUTO_MERGE" = "true" ]; then
  AUTO_MERGE_NOTE="requested; requires repository auto-merge and a passing \`Plauder build\` check"
fi

CONFLICT_LIST="none"
if [ "${#CONFLICT_PATHS[@]}" -gt 0 ]; then
  # Backticks are literal Markdown, not command substitution.
  # shellcheck disable=SC2016
  CONFLICT_LIST="$(printf -- '- `%s`\n' "${CONFLICT_PATHS[@]}")"
fi

BODY="$(cat <<EOF
## Upstream

- \`${UPSTREAM_REPO}:dev\` at [\`${TARGET_SHORT}\`](https://github.com/${UPSTREAM_REPO}/commit/${TARGET_SHA})
- Commits since \`${BASE_SHORT}\`: **${COMMIT_COUNT}**
- Compare: ${COMPARE_URL}

## Merge

- Status: **${STATUS}**
- Auto-merge: ${AUTO_MERGE_NOTE}

Conflicts:
${CONFLICT_LIST}
EOF
)"

PR_ARGS=(
  --base "$BASE_BRANCH"
  --head "$BRANCH"
  --title "Sync upstream dev (${TARGET_SHORT})"
  --body "$BODY"
)
if [ "$MERGED" = false ]; then
  PR_ARGS+=(--draft)
fi

PR_URL="$(gh pr create "${PR_ARGS[@]}")"
PR_NUMBER="$(gh pr view "$PR_URL" --json number --jq .number)"
echo "Created PR #${PR_NUMBER}: ${PR_URL}"

if [ "$MERGED" = false ]; then
  gh pr comment "$PR_NUMBER" --body "$(cat <<EOF
This sync PR has conflicts. Resolve them locally:

\`\`\`sh
git fetch origin
git checkout "${BRANCH}"
git merge "origin/${BASE_BRANCH}"
# resolve conflicts, then:
git push origin "${BRANCH}"
\`\`\`

Or use GitHub's "Resolve conflicts" button. Mark the PR ready for review when it is clean and \`Plauder build\` is green; the next scheduled run enables auto-merge.
EOF
)" >/dev/null
else
  enable_auto_merge "$PR_NUMBER" || true
fi
