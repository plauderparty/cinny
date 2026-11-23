/*
Cinny Project
Copyright 2021-present Ajay Bura
SPDX-License-Identifier: AGPL-3.0-only
https://cinny.in

Please see LICENSE file in root of repository for full details.
*/

import React from 'react';
import { Box, Button, Icon, Icons, Text, config, toRem } from 'folds';
import { Page, PageHero, PageHeroSection } from '../../components/page';
import CinnySVG from '../../../../public/res/svg/cinny.svg';
import { APP_NAME, SOURCE_URL, VERSION, WEBSITE_URL } from '../../branding';

export function WelcomePage() {
  return (
    <Page>
      <Box
        grow="Yes"
        style={{ padding: config.space.S400, paddingBottom: config.space.S700 }}
        alignItems="Center"
        justifyContent="Center"
      >
        <PageHeroSection>
          <PageHero
            icon={<img width="70" height="70" src={CinnySVG} alt={`${APP_NAME} Logo`} />}
            title={`Welcome to ${APP_NAME}`}
            subTitle={
              <span>
                Plauder.Party Matrix client.{' '}
                <a href={`${SOURCE_URL}/releases`} target="_blank" rel="noreferrer noopener">
                  {VERSION}
                </a>
              </span>
            }
          >
            <Box justifyContent="Center">
              <Box grow="Yes" style={{ maxWidth: toRem(300) }} direction="Column" gap="300">
                <Button
                  as="a"
                  href={SOURCE_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  before={<Icon size="200" src={Icons.Code} />}
                >
                  <Text as="span" size="B400" truncate>
                    Source Code
                  </Text>
                </Button>
                <Button
                  as="a"
                  href={WEBSITE_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  fill="Soft"
                  before={<Icon size="200" src={Icons.Heart} />}
                >
                  <Text as="span" size="B400" truncate>
                    Website
                  </Text>
                </Button>
              </Box>
            </Box>
          </PageHero>
        </PageHeroSection>
      </Box>
    </Page>
  );
}
