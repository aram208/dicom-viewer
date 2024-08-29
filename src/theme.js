import { createTheme, ThemeProvider } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Set your primary color (default is blue)
      contrastText: '#fff', // Set text color for primary buttons
    },
    secondary: {
      main: '#dc004e', // Set your secondary color (default is pink)
    },
    background: {
      default: '#f9f9f9', // Adjust background color for light mode
      paper: '#ffffff', // Background color for paper components
    },
  },
  // typography: {
  //   fontFamily: 'Roboto, sans-serif', // Set your default font family
  //   button: {
  //     textTransform: 'none', // Prevent uppercase text transformation on buttons
  //     fontWeight: 'bold', // Set button font weight
  //   },
  // },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Set button border radius
          padding: '8px 16px', // Set padding for buttons
        },
        containedPrimary: {
          backgroundColor: '#1976d2', // Custom color for primary contained buttons
          color: '#fff', // Text color
          '&:hover': {
            backgroundColor: '#155a9e', // Darken on hover
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Set your primary color for dark mode
      contrastText: '#000',
    },
    secondary: {
      main: '#f48fb1', // Set your secondary color for dark mode
    },
    background: {
      default: '#A39992', // Adjust background color for dark mode
      paper: '#1d1d1d',
    },
  },
  typography: {
  //   fontFamily: 'Inter',
  //   fontSize: '56px',
  //   fontStyle: 'normal',
  //   fontWeight: '400',
  //   lineHeight: '64px', 
  //   button: {
  //     textTransform: 'none',
  //     fontWeight: 'bold',
  //   },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '15px',
          padding: '8px 16px',
        },
        containedPrimary: {
          backgroundColor: '#FFFFFF',
          color: '#000',
          '&:hover': {
            backgroundColor: '#81766F', // Darken on hover
          },
        },
      },
    },
  },
});