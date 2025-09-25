import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00bcd4',
    },
    secondary: {
      main: '#ffeb3b',
    },
    error: {
      main: '#e63946',
    },
    background: {
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h5: {
      fontWeight: 600,
      color: '#424242',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '&.search-field .MuiOutlinedInput-root': {
            borderRadius: 8,
            color: '#fff',
            background: 'rgba(255, 255, 255, 0.2)',
            width: '200px',

            '& fieldset': {
              borderColor: '#00bcd4',
            },
            '&:hover fieldset': {
              borderColor: '#00e5ff',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00e5ff',
            },
          },
          '&:not(.search-field) .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      },
    },
  },
});

export default theme;
