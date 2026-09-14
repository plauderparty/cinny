import { createTheme } from '@vanilla-extract/css';
import { color } from 'folds';

/** Plauder.Party light palette — tokens from plauder.party site params. */
export const plauderLightTheme = createTheme(color, {
  Background: {
    Container: '#FDFEFC',
    ContainerHover: '#F5F9F3',
    ContainerActive: '#E8F4E4',
    ContainerLine: '#D4E3CF',
    OnContainer: '#1A2E18',
  },

  Surface: {
    Container: '#F5F9F3',
    ContainerHover: '#E8F4E4',
    ContainerActive: '#D4E3CF',
    ContainerLine: '#C5D7BE',
    OnContainer: '#1A2E18',
  },

  SurfaceVariant: {
    Container: '#E8F4E4',
    ContainerHover: '#D4E3CF',
    ContainerActive: '#C5D7BE',
    ContainerLine: '#B5C7AE',
    OnContainer: '#1A2E18',
  },

  Primary: {
    Main: '#4A9B32',
    MainHover: '#3D8229',
    MainActive: '#367324',
    MainLine: '#2F6420',
    OnMain: '#FFFFFF',
    Container: '#E8F4E4',
    ContainerHover: '#D4E3CF',
    ContainerActive: '#C5D7BE',
    ContainerLine: '#B5C7AE',
    OnContainer: '#1A3318',
  },

  Secondary: {
    Main: '#1A2E18',
    MainHover: '#2A3D28',
    MainActive: '#4A5C47',
    MainLine: '#6B7B68',
    OnMain: '#FDFEFC',
    Container: '#D4E3CF',
    ContainerHover: '#C5D7BE',
    ContainerActive: '#B5C7AE',
    ContainerLine: '#A5B79E',
    OnContainer: '#0F1A0E',
  },

  Success: {
    Main: '#3D8229',
    MainHover: '#367324',
    MainActive: '#2F6420',
    MainLine: '#28551C',
    OnMain: '#FFFFFF',
    Container: '#E8F4E4',
    ContainerHover: '#D4E3CF',
    ContainerActive: '#C5D7BE',
    ContainerLine: '#B5C7AE',
    OnContainer: '#1A3318',
  },

  Warning: {
    Main: '#C9932E',
    MainHover: '#B58429',
    MainActive: '#A87725',
    MainLine: '#9B6A21',
    OnMain: '#FFFFFF',
    Container: '#F5EBD8',
    ContainerHover: '#F0E2C8',
    ContainerActive: '#EBD9B8',
    ContainerLine: '#E6D0A8',
    OnContainer: '#5E3F20',
  },

  Critical: {
    Main: '#9D0F0F',
    MainHover: '#8D0E0E',
    MainActive: '#850D0D',
    MainLine: '#7E0C0C',
    OnMain: '#FFFFFF',
    Container: '#E7C3C3',
    ContainerHover: '#E2B7B7',
    ContainerActive: '#DDABAB',
    ContainerLine: '#D89F9F',
    OnContainer: '#6E0B0B',
  },

  Other: {
    FocusRing: 'rgba(26 46 24 / 50%)',
    Shadow: 'rgba(26 46 24 / 20%)',
    Overlay: 'rgba(15 26 14 / 50%)',
  },
});

/** Plauder.Party dark palette — green-tinted counterpart of the light brand. */
export const plauderDarkTheme = createTheme(color, {
  Background: {
    Container: '#0F1A0E',
    ContainerHover: '#162315',
    ContainerActive: '#1C2C1A',
    ContainerLine: '#2A3D28',
    OnContainer: '#E8F4E4',
  },

  Surface: {
    Container: '#162315',
    ContainerHover: '#1C2C1A',
    ContainerActive: '#2A3D28',
    ContainerLine: '#354B32',
    OnContainer: '#E8F4E4',
  },

  SurfaceVariant: {
    Container: '#1C2C1A',
    ContainerHover: '#2A3D28',
    ContainerActive: '#354B32',
    ContainerLine: '#40593C',
    OnContainer: '#E8F4E4',
  },

  Primary: {
    Main: '#5CB03C',
    MainHover: '#4A9B32',
    MainActive: '#3D8229',
    MainLine: '#367324',
    OnMain: '#0F1A0E',
    Container: '#1A3318',
    ContainerHover: '#214020',
    ContainerActive: '#284D28',
    ContainerLine: '#2F5A30',
    OnContainer: '#E8F4E4',
  },

  Secondary: {
    Main: '#E8F4E4',
    MainHover: '#D4E3CF',
    MainActive: '#B8C9B4',
    MainLine: '#8A9A86',
    OnMain: '#0F1A0E',
    Container: '#2A3D28',
    ContainerHover: '#354B32',
    ContainerActive: '#40593C',
    ContainerLine: '#4B6746',
    OnContainer: '#E8F4E4',
  },

  Success: {
    Main: '#85E0BA',
    MainHover: '#70DBAF',
    MainActive: '#66D9A9',
    MainLine: '#5CD6A3',
    OnMain: '#0F3D2A',
    Container: '#175C3F',
    ContainerHover: '#1A6646',
    ContainerActive: '#1C704D',
    ContainerLine: '#1F7A54',
    OnContainer: '#CCF2E2',
  },

  Warning: {
    Main: '#D4A43A',
    MainHover: '#C9932E',
    MainActive: '#B58429',
    MainLine: '#A87725',
    OnMain: '#3F2A15',
    Container: '#5E3F20',
    ContainerHover: '#694624',
    ContainerActive: '#734D27',
    ContainerLine: '#7D542B',
    OnContainer: '#F3E2D1',
  },

  Critical: {
    Main: '#E69D9D',
    MainHover: '#E28D8D',
    MainActive: '#E08585',
    MainLine: '#DE7D7D',
    OnMain: '#401C1C',
    Container: '#602929',
    ContainerHover: '#6B2E2E',
    ContainerActive: '#763333',
    ContainerLine: '#803737',
    OnContainer: '#F5D6D6',
  },

  Other: {
    FocusRing: 'rgba(232, 244, 228, 0.5)',
    Shadow: 'rgba(0, 0, 0, 1)',
    Overlay: 'rgba(0, 0, 0, 0.8)',
  },
});
