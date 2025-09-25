import React from 'react';
import { Button, TextField, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const Header = ({
  isSearchVisible,
  searchTerm,
  setSearchTerm,
  addSkillButtonRef,
  handleAddSkillKeyDown,
  setShowForm,
  handleReset,
}) => {
  return (
    <header className="header-container" role="banner">
      <h1 className="welcome-text">Welcome to SkillBuilder</h1>

      <Box
        className="search-controls"
        display="flex"
        alignItems="center"
        component="nav"
        aria-label="Skill controls"
        gap={1}
      >
        {isSearchVisible && (
          <TextField
            className="search-field"
            variant="outlined"
            placeholder="Search by skill name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search skills by name"
          />
        )}

        <Button
          ref={addSkillButtonRef}
          variant="contained"
          onClick={() => setShowForm(true)}
          onKeyDown={handleAddSkillKeyDown}
          startIcon={<AddIcon />}
          sx={{ color: 'white' }}
          aria-label="Add new skill"
        >
          Add New Skill
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={handleReset}
          sx={{ ml: 1 }}
          aria-label="Clear all skills"
        >
          Clear
        </Button>
      </Box>
    </header>
  );
};

export default Header;
