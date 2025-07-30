/**
 * AddHabitForm component for creating new habits.
 * 
 * Features:
 * - Form validation and error handling
 * - Category selection with predefined options
 * - Responsive design for mobile and desktop
 * - Accessible form controls
 * - Smooth show/hide animations
 */

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const AddHabitForm = ({ onAdd, isVisible, onToggleVisibility }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Predefined categories with descriptions
  const categories = [
    { value: 'health', label: 'Health', description: 'Sleep, nutrition, medical care' },
    { value: 'fitness', label: 'Fitness', description: 'Exercise, sports, physical activity' },
    { value: 'mental', label: 'Mental', description: 'Meditation, mindfulness, therapy' },
    { value: 'productivity', label: 'Productivity', description: 'Work, organization, planning' },
    { value: 'social', label: 'Social', description: 'Relationships, community, networking' },
    { value: 'learning', label: 'Learning', description: 'Reading, courses, skill development' },
    { value: 'custom', label: 'Custom', description: 'Your own category' },
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Habit name is required');
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('Habit name must be at least 2 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onAdd({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
      });

      // Reset form on success
      setFormData({
        name: '',
        description: '',
        category: 'custom',
      });
      
      // Hide form after successful addition
      onToggleVisibility();
    } catch (err) {
      setError(err.message || 'Failed to add habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      category: 'custom',
    });
    setError('');
    onToggleVisibility();
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        style={addButtonStyles}
        aria-label="Add new habit"
      >
        <Plus size={20} />
        Add New Habit
      </button>
    );
  }

  return (
    <div style={formContainerStyles}>
      <div style={formHeaderStyles}>
        <h3 style={formTitleStyles}>Add New Habit</h3>
        <button
          onClick={handleCancel}
          style={closeButtonStyles}
          aria-label="Cancel adding habit"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={formStyles}>
        {/* Error message */}
        {error && (
          <div style={errorStyles} role="alert">
            {error}
          </div>
        )}

        {/* Habit name input */}
        <div style={fieldStyles}>
          <label htmlFor="habit-name" style={labelStyles}>
            Habit Name *
          </label>
          <input
            id="habit-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Morning walk, Drink water, Read"
            style={inputStyles}
            maxLength={100}
            required
          />
        </div>

        {/* Description input */}
        <div style={fieldStyles}>
          <label htmlFor="habit-description" style={labelStyles}>
            Description (optional)
          </label>
          <textarea
            id="habit-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of your habit..."
            style={{...inputStyles, ...textareaStyles}}
            maxLength={200}
            rows={3}
          />
        </div>

        {/* Category selection */}
        <div style={fieldStyles}>
          <label htmlFor="habit-category" style={labelStyles}>
            Category
          </label>
          <select
            id="habit-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={selectStyles}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label} - {cat.description}
              </option>
            ))}
          </select>
        </div>

        {/* Form actions */}
        <div style={actionsStyles}>
          <button
            type="button"
            onClick={handleCancel}
            style={cancelButtonStyles}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              ...submitButtonStyles,
              opacity: isSubmitting ? 0.6 : 1,
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Habit'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Styles
const addButtonStyles = {
  backgroundColor: 'var(--accent-primary)',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  padding: '1rem 1.5rem',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  width: '100%',
  minHeight: '48px',
  
  ':hover': {
    backgroundColor: 'var(--accent-secondary)',
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px var(--shadow)`,
  },
  
  ':focus': {
    outline: '2px solid var(--accent-primary)',
    outlineOffset: '2px',
  },
};

const formContainerStyles = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  boxShadow: `0 4px 12px var(--shadow)`,
  animation: 'slideIn 0.3s ease-out',
};

const formHeaderStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
};

const formTitleStyles = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  margin: 0,
};

const closeButtonStyles = {
  backgroundColor: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '0.5rem',
  borderRadius: '0.375rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.2s ease',
  
  ':hover': {
    color: 'var(--text-primary)',
  },
};

const formStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const errorStyles = {
  backgroundColor: 'rgba(245, 101, 101, 0.1)',
  color: 'var(--danger)',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--danger)',
  fontSize: '0.875rem',
};

const fieldStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyles = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const inputStyles = {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
  padding: '0.75rem',
  fontSize: '1rem',
  color: 'var(--text-primary)',
  transition: 'border-color 0.2s ease',
  
  ':focus': {
    outline: 'none',
    borderColor: 'var(--accent-primary)',
    boxShadow: '0 0 0 2px rgba(66, 153, 225, 0.2)',
  },
};

const textareaStyles = {
  resize: 'vertical',
  minHeight: '80px',
  fontFamily: 'inherit',
};

const selectStyles = {
  ...inputStyles,
  cursor: 'pointer',
};

const actionsStyles = {
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'flex-end',
  marginTop: '0.5rem',
  flexWrap: 'wrap',
};

const cancelButtonStyles = {
  backgroundColor: 'transparent',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
  padding: '0.75rem 1.5rem',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  ':hover': {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
  },
};

const submitButtonStyles = {
  backgroundColor: 'var(--accent-primary)',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  padding: '0.75rem 1.5rem',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  ':hover': {
    backgroundColor: 'var(--accent-secondary)',
  },
  
  ':disabled': {
    cursor: 'not-allowed',
  },
};

export default AddHabitForm;