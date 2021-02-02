import { createMuiTheme } from '@material-ui/core/styles';
export const theme = createMuiTheme({
  typography: {
    fontFamily: ['IBM Plex Mono', 'monospace'].join(','),
  },
  overrides: {
    MuiCardContent: {
      root: {
        '&:last-child': {
          paddingBottom: 0,
        },
      },
    },
    MuiInputBase: {
      input: {
        fontSize: '36px',
      },
    },
    MuiTabs: {
      indicator: {
        backgroundColor: '#838383',
      },
    },
    MuiTab: {
      textColorPrimary: {
        '&$selected': {
          color: '#BA0202',
          fontWeight: 700,
        },
      },
    },
  },
});
