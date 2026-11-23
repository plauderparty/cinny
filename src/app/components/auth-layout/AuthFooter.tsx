/*
Cinny Project
Copyright 2021-present Ajay Bura
SPDX-License-Identifier: AGPL-3.0-only
https://cinny.in

Please see LICENSE file in root of repository for full details.
*/

import React from 'react';
import { Box, Text } from 'folds';
import * as css from './styles.css';
import { SOURCE_URL, VERSION, WEBSITE_URL } from '../../branding';

export function AuthFooter() {
  return (
    <Box className={css.AuthFooter} justifyContent="Center" gap="400" wrap="Wrap">
      <Text as="a" size="T300" href={WEBSITE_URL} target="_blank" rel="noreferrer">
        About
      </Text>
      <Text as="a" size="T300" href={`${SOURCE_URL}/releases`} target="_blank" rel="noreferrer">
        {VERSION}
      </Text>
      <Text as="a" size="T300" href="https://matrix.org" target="_blank" rel="noreferrer">
        Powered by Matrix
      </Text>
    </Box>
  );
}
