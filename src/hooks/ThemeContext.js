import { createContext } from 'react';
import { lightTheme, darkTheme } from '../theme'; // Import your light theme

export const ThemeContext = createContext({
  theme: darkTheme,
  toggleTheme: () => {},
});