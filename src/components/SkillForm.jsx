import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea',
    },
    secondary: {
      main: '#03dac6',
    },
    background: {
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h6: {
      fontWeight: 600,
      color: '#424242',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
  },
});

function SkillForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
  });
  const [error, setError] = useState('');
  const nameInputRef = useRef(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'name' && value.trim()) {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Skill name is required');
      nameInputRef.current.focus();
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      cost: formData.cost ? Number(formData.cost) : 0,
    });

    setFormData({ name: '', description: '', cost: '' });
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 500,
          mx: 'auto',
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          align="center"
          sx={{ mb: 3 }}
        >
          Add New Skill 🚀
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          sx={{ mt: 1 }}
        >
          {error && (
            <Typography
              color="error"
              role="alert"
              sx={{ mb: 2, textAlign: 'center' }}
            >
              {error}
            </Typography>
          )}
          <Stack spacing={2.5}>
            <TextField
              label="Skill Name"
              placeholder="Skill Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              inputRef={nameInputRef}
              required
              fullWidth
              error={!!error}
              helperText={error}
            />
            <TextField
              label="Description"
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
            />
            <TextField
              placeholder="Cost / Level"
              label="Cost / Level (optional)"
              name="cost"
              type="number"
              value={formData.cost}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
              fullWidth
            />
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 3 }}
            >
              <Button variant="outlined" color="primary" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                sx={{ color: 'white' }}
              >
                Add Skill
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </ThemeProvider>
  );
}

export default SkillForm;
