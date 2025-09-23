import React, { useState } from 'react';

function SkillForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      cost: formData.cost || 0,
    });
    setFormData({ name: '', description: '', cost: '' });
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h3>Add New Skill</h3>
        <input
          type="text"
          name="name"
          placeholder="Skill Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="number"
          name="cost"
          placeholder="Cost/Level (optional)"
          value={formData.cost}
          onChange={handleChange}
        />
        <div className="form-actions">
          <button type="submit">Add</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default SkillForm;
