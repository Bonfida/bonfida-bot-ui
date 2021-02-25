import { createMuiTheme } from '@material-ui/core/styles';
import background from './assets/background.svg';
export const theme = createMuiTheme({
  typography: {
    fontFamily: ['IBM Plex Mono', 'monospace'].join(','),
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          background: '#E5E5E5',
          backgroundImage: `url(${background})`,
          backgroundPosition: '50% 50%',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        },
      },
    },
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
