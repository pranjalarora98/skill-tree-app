import React, { useState, useEffect, useRef } from 'react';

function SkillForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
  });
  const [error, setError] = useState('');
  const nameInputRef = useRef(null);

  useEffect(() => {
    nameInputRef.current.focus();
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
    <div
      className="modal"
      role="dialog"
      aria-labelledby="add-skill-title"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      <form onSubmit={handleSubmit}>
        <h3 id="add-skill-title">Add New Skill</h3>
        {error && (
          <div role="alert" className="error">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="skill-name">Skill Name</label>
          <input
            id="skill-name"
            type="text"
            name="name"
            placeholder="Skill Name"
            value={formData.name}
            onChange={handleChange}
            ref={nameInputRef}
            required
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>
        <div>
          <label htmlFor="skill-description">Description</label>
          <textarea
            id="skill-description"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            aria-describedby="description-hint"
          />
          <span id="description-hint" className="sr-only">
            Optional description of the skill
          </span>
        </div>
        <div>
          <label htmlFor="skill-cost">Cost/Level (optional)</label>
          <input
            id="skill-cost"
            type="number"
            name="cost"
            placeholder="Cost/Level (optional)"
            value={formData.cost}
            onChange={handleChange}
            min="0"
          />
        </div>
        <div className="form-actions">
          <button type="submit" aria-label="Submit new skill">
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel adding new skill"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default SkillForm;
