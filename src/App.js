import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ThemeProvider } from '@mui/material';

import AppContainer from './components/layout/app-container_drawer';
import { ThemeContext } from './hooks/ThemeContext';
import { darkTheme, lightTheme } from './theme';

function App() {


  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <Router>
          <AppContainer />
        </Router>
      </ThemeContext.Provider>
    </ThemeProvider>
  );
}

export default App;
