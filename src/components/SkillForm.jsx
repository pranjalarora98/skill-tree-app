import React, { useState } from 'react';

function SkillForm({ onSubmit, onCancel }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), description: description.trim(), cost: cost || 0 });
        setName('');
        setDescription('');
        setCost('');
    };

    return (
        <div className="modal">
            <form onSubmit={handleSubmit}>
                <h3>Add New Skill</h3>
                <input
                    type="text"
                    placeholder="Skill Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Cost/Level (optional)"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                />
                <div className="form-actions">
                    <button type="submit">Add</button>
                    <button type="button" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default SkillForm;