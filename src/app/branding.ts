/** Central brand strings for the Plauder.Party Cinny fork. */
export const APP_NAME = 'Plauder.Party App';
export const TITLE_SUFFIX = 'Plauder.Party';
export const DEVICE_DISPLAY_NAME = 'Plauder.Party Web';

export const documentTitleFor = (contextName?: string): string => {
  if (contextName && contextName.trim().length > 0) {
    return `${contextName.trim()} - ${TITLE_SUFFIX}`;
  }
  return APP_NAME;
};
