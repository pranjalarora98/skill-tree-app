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
          sx={{
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1rem',
            borderRadius: '8px',
            padding: '8px 16px',
            color: 'white',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 2px 4px 1px rgba(33, 203, 243, .3)',
            marginLeft: '10px',
            transition:
              'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #00B8D4 90%)',
              boxShadow: '0 4px 6px 2px rgba(33, 203, 243, .4)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Add New Skill
        </Button>
        <Button
          variant="contained"
          onClick={handleReset}
          sx={{
            background: 'linear-gradient(45deg, #e63946 30%, #f77f00 90%)',
            boxShadow: '0 2px 4px 1px rgba(230, 57, 70, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #d62828 30%, #e57300 90%)',
              boxShadow: '0 4px 6px 2px rgba(230, 57, 70, .4)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default Header;
