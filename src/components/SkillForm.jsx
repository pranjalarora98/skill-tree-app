import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Paper,
} from '@mui/material';

function SkillForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
  });

  const [errors, setErrors] = useState({ name: '', description: '' });

  const nameInputRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = { name: '', description: '' };
    let hasError = false;

    if (!formData.name.trim()) {
      newErrors.name = 'Skill name is required';
      nameInputRef.current?.focus();
      hasError = true;
    } else if (!formData.description.trim()) {
      newErrors.description = 'Skill description is required';
      descriptionRef.current?.focus();
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      cost: formData.cost ? Number(formData.cost) : 0,
    });

    setFormData({ name: '', description: '', cost: '' });
    setErrors({ name: '', description: '' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
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
        aria-labelledby="skill-form-heading"
        noValidate
      >
        {Object.entries(errors).map(([field, msg]) =>
          msg ? (
            <Typography
              key={field}
              color="error"
              role="alert"
              id={`${field}-error`}
              sx={{ mb: 1, textAlign: 'center' }}
            >
              {msg}
            </Typography>
          ) : null
        )}

        <Stack spacing={2.5}>
          <TextField
            id="skill-name"
            label="Skill Name"
            placeholder="Skill Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            inputRef={nameInputRef}
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={!!errors.name}
          />
          <TextField
            id="skill-description"
            label="Description"
            placeholder="Description"
            name="description"
            value={formData.description}
            inputRef={descriptionRef}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            error={!!errors.description}
            helperText={errors.description}
            aria-describedby={
              errors.description ? 'description-error' : undefined
            }
            aria-invalid={!!errors.description}
          />
          <TextField
            id="skill-cost"
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
              sx={{ color: 'white', background: '#03dac6' }}
            >
              Add Skill
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}

export default SkillForm;
