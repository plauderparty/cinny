/** Central brand strings for the Plauder.Party Cinny fork. */
export const APP_NAME = 'Plauder.Party App';
export const TITLE_SUFFIX = 'Plauder.Party';
export const DEVICE_DISPLAY_NAME = 'Plauder.Party Web';
export const WEBSITE_URL = 'https://plauder.party';
export const SOURCE_URL = 'https://github.com/plauderparty/cinny';
/** Keep in sync with package.json — scripts/update-version.js patches this. */
export const VERSION = 'v4.12.6';

export const documentTitleFor = (contextName?: string): string => {
  const name = contextName?.trim();
  return name ? `${name} - ${TITLE_SUFFIX}` : APP_NAME;
};
