import { createMuiTheme } from '@material-ui/core/styles';
export const theme = createMuiTheme({
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
  },
});
