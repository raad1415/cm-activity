/**
 * HabitCard component for displaying and interacting with individual habits.
 * 
 * Features:
 * - Checkbox toggle for marking completion
 * - Category indicator with color coding
 * - Responsive design for mobile and desktop
 * - Smooth animations and transitions
 * - Accessible keyboard navigation
 */

import React from 'react';
import { Check, Trash2 } from 'lucide-react';

const HabitCard = ({ habit, isCompleted, onToggle, onDelete, disabled = false }) => {
  // Category color mapping for visual categorization
  const getCategoryColor = (category) => {
    const colors = {
      health: '#48bb78',      // Green
      fitness: '#ed8936',     // Orange
      mental: '#9f7aea',      // Purple
      productivity: '#4299e1', // Blue
      social: '#ed64a6',      // Pink
      learning: '#38b2ac',    // Teal
      custom: '#718096',      // Gray
    };
    return colors[category] || colors.custom;
  };

  // Handle keyboard interactions for accessibility
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div style={{...cardStyles, opacity: disabled ? 0.6 : 1}}>
      {/* Main content area */}
      <div 
        style={contentStyles}
        onClick={onToggle}
        onKeyPress={handleKeyPress}
        role="button"
        tabIndex={0}
        aria-label={`${isCompleted ? 'Unmark' : 'Mark'} ${habit.name} as completed`}
      >
        {/* Custom checkbox */}
        <div style={{
          ...checkboxStyles,
          backgroundColor: isCompleted ? 'var(--success)' : 'transparent',
          borderColor: isCompleted ? 'var(--success)' : 'var(--border-color)',
        }}>
          {isCompleted && (
            <Check 
              size={16} 
              style={{
                color: 'white',
                animation: 'checkScale 0.2s ease-in-out',
              }} 
            />
          )}
        </div>

        {/* Habit details */}
        <div style={detailsStyles}>
          <div style={habitNameStyles}>
            <h3 style={{
              ...nameStyles,
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
            }}>
              {habit.name}
            </h3>
            
            {/* Category badge */}
            <span style={{
              ...categoryBadgeStyles,
              backgroundColor: getCategoryColor(habit.category),
            }}>
              {habit.category}
            </span>
          </div>

          {/* Description (if available) */}
          {habit.description && (
            <p style={{
              ...descriptionStyles,
              color: isCompleted ? 'var(--text-muted)' : 'var(--text-secondary)',
            }}>
              {habit.description}
            </p>
          )}
        </div>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card toggle
            onDelete();
          }}
          style={deleteButtonStyles}
          aria-label={`Delete ${habit.name} habit`}
          title="Delete habit"
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* CSS animations */}
      <style>
        {`
          @keyframes checkScale {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

// Styles
const cardStyles = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.75rem',
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  
  // Hover effect
  ':hover': {
    borderColor: 'var(--accent-primary)',
    boxShadow: `0 4px 12px var(--shadow)`,
    transform: 'translateY(-1px)',
  },
};

const contentStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  flex: 1,
  minWidth: 0, // Allow text truncation
};

const checkboxStyles = {
  width: '24px',
  height: '24px',
  borderRadius: '0.375rem',
  border: '2px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all 0.2s ease',
};

const detailsStyles = {
  flex: 1,
  minWidth: 0,
};

const habitNameStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.25rem',
  flexWrap: 'wrap',
};

const nameStyles = {
  fontSize: '1rem',
  fontWeight: '600',
  margin: 0,
  transition: 'all 0.3s ease',
  wordBreak: 'break-word',
};

const categoryBadgeStyles = {
  fontSize: '0.75rem',
  fontWeight: '500',
  color: 'white',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.375rem',
  textTransform: 'capitalize',
  flexShrink: 0,
};

const descriptionStyles = {
  fontSize: '0.875rem',
  margin: 0,
  lineHeight: 1.4,
  transition: 'color 0.3s ease',
  wordBreak: 'break-word',
};

const deleteButtonStyles = {
  backgroundColor: 'transparent',
  border: 'none',
  color: 'var(--danger)',
  cursor: 'pointer',
  padding: '0.5rem',
  borderRadius: '0.375rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  minWidth: '32px',
  minHeight: '32px',
  
  ':hover': {
    backgroundColor: 'var(--danger)',
    color: 'white',
  },
  
  ':focus': {
    outline: '2px solid var(--danger)',
    outlineOffset: '2px',
  },
};

export default HabitCard;