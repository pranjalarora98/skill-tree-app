import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import SkillBuilder from './components/SkillBuilder';
import './App.css';

function App() {
  return (
    <div className="app" role="application" aria-label="Skill Tree Application">
      <ThemeProvider theme={theme}>
        <SkillBuilder />
      </ThemeProvider>
    </div>
  );
}

export default App;
