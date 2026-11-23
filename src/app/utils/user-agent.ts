/*
Cinny Project
Copyright 2021-present Ajay Bura
SPDX-License-Identifier: AGPL-3.0-only
https://cinny.in

Please see LICENSE file in root of repository for full details.
*/

import { UAParser } from 'ua-parser-js';
import { DEVICE_DISPLAY_NAME } from '../branding';

export const ua = () => UAParser(window.navigator.userAgent);

export const isMacOS = () => ua().os.name === 'Mac OS';

export const mobileOrTablet = (): boolean => {
  const userAgent = ua();
  const { os, device } = userAgent;
  if (device.type === 'mobile' || device.type === 'tablet') return true;
  if (os.name === 'Android' || os.name === 'iOS') return true;
  return false;
};

export const getInitialDeviceDisplayName = (): string => {
  const browserName = ua().browser.name;
  const osName = ua().os.name;

  if (browserName && osName) {
    return `${DEVICE_DISPLAY_NAME} - ${ua().browser.name} (${ua().os.name})`;
  }
  if (browserName) {
    return `${DEVICE_DISPLAY_NAME} - ${ua().browser.name}`;
  }
  if (osName) {
    return `${DEVICE_DISPLAY_NAME} (${ua().os.name})`;
  }

  return DEVICE_DISPLAY_NAME;
};
