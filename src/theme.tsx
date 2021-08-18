import { createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Rota',
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundColor: '#121838',
          background:
            'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 61.99%)',
          transform: 'transform: matrix(-1, 0, 0, 1, 0, 0)',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
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
        backgroundColor: '#77E3EF',
      },
    },
    MuiTab: {
      textColorPrimary: {
        fontWeight: 700,
        fontSize: 18,
        color: '#FFFFFF',
        '&$selected': {
          color: '#77E3EF',
          fontWeight: 700,
          fontSize: 18,
        },
      },
    },
    MuiOutlinedInput: {
      input: {
        height: 20,
      },
    },
    MuiTableCell: {
      root: {
        border: '1px transparent',
        borderBottom: 'none',
        '&:first-child': {
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
        },
        '&:last-child': {
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
        },
      },
    },
    MuiTable: {
      root: {
        borderSpacing: '0px 3px',
        borderCollapse: 'separate',
      },
    },
  },
});
