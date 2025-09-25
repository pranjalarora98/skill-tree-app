import React from 'react';
import { Button, TextField } from '@mui/material';
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
    <div className="header-container">
      <h1 className="welcome-text">Welcome to SkillBuilder</h1>
      <div className="search-controls">
        {isSearchVisible && (
          <TextField
            className="search-field"
            variant="outlined"
            placeholder="Search by skill name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
        <Button
          ref={addSkillButtonRef}
          variant="contained"
          onClick={() => setShowForm(true)}
          onKeyDown={handleAddSkillKeyDown}
          startIcon={<AddIcon />}
          sx={{ ml: 1 }}
        >
          Add New Skill
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={handleReset}
          sx={{ ml: 1 }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default Header;
