/**
 * Main App component for the Habit Tracker application.
 * 
 * Features:
 * - Dark/light theme management with localStorage persistence
 * - Responsive layout that adapts to mobile and desktop
 * - Integration of all major components
 * - Error boundary handling
 * - Loading states and error handling
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HabitCard from './components/HabitCard';
import AddHabitForm from './components/AddHabitForm';
import ProgressSummary from './components/ProgressSummary';
import AITips from './components/AITips';
import { useHabits, useTodayEntries } from './hooks/useApi';

function App() {
  // Theme management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage and system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Add habit form visibility
  const [showAddForm, setShowAddForm] = useState(false);

  // Habit management
  const {
    habits,
    loading: habitsLoading,
    error: habitsError,
    addHabit,
    removeHabit,
    refreshHabits,
    clearError: clearHabitsError,
  } = useHabits();

  // Today's entries management
  const {
    entries,
    loading: entriesLoading,
    error: entriesError,
    toggleHabit,
    refreshEntries,
    clearError: clearEntriesError,
  } = useTodayEntries(habits);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Handle habit actions
  const handleAddHabit = async (habitData) => {
    try {
      await addHabit(habitData);
      // Refresh entries to include the new habit
      refreshEntries();
    } catch (error) {
      console.error('Failed to add habit:', error);
      throw error;
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      try {
        await removeHabit(habitId);
        // Refresh entries after deleting habit
        refreshEntries();
      } catch (error) {
        console.error('Failed to delete habit:', error);
      }
    }
  };

  const handleToggleHabit = async (habitId) => {
    try {
      await toggleHabit(habitId);
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  // Clear all errors
  const clearAllErrors = () => {
    clearHabitsError();
    clearEntriesError();
  };

  return (
    <div style={appStyles}>
      {/* Header */}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      {/* Main content */}
      <main style={mainStyles}>
        <div style={containerStyles}>
          {/* Error messages */}
          {(habitsError || entriesError) && (
            <div style={errorContainerStyles}>
              <div style={errorMessageStyles}>
                {habitsError || entriesError}
              </div>
              <button onClick={clearAllErrors} style={errorCloseStyles}>
                ×
              </button>
            </div>
          )}

          {/* Progress Summary */}
          <ProgressSummary />

          {/* AI Tips */}
          <AITips />

          {/* Today's Habits Section */}
          <section style={sectionStyles}>
            <div style={sectionHeaderStyles}>
              <h2 style={sectionTitleStyles}>Today's Habits</h2>
              {habits.length > 0 && (
                <div style={summaryStyles}>
                  {Object.values(entries).filter(Boolean).length} of {habits.length} completed
                </div>
              )}
            </div>

            {/* Loading state */}
            {(habitsLoading || entriesLoading) && (
              <div style={loadingStyles}>
                <div style={loadingSpinnerStyles}></div>
                Loading habits...
              </div>
            )}

            {/* Habits list */}
            {!habitsLoading && habits.length > 0 && (
              <div style={habitsGridStyles}>
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={entries[habit.id] || false}
                    onToggle={() => handleToggleHabit(habit.id)}
                    onDelete={() => handleDeleteHabit(habit.id)}
                    disabled={entriesLoading}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!habitsLoading && habits.length === 0 && (
              <div style={emptyStateStyles}>
                <h3 style={emptyTitleStyles}>No habits yet!</h3>
                <p style={emptyDescriptionStyles}>
                  Start your self-improvement journey by adding your first habit.
                </p>
              </div>
            )}

            {/* Add habit form */}
            <div style={addHabitSectionStyles}>
              <AddHabitForm
                onAdd={handleAddHabit}
                isVisible={showAddForm}
                onToggleVisibility={() => setShowAddForm(!showAddForm)}
              />
            </div>
          </section>
        </div>
      </main>

      {/* CSS animations and responsive styles */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* Responsive grid adjustments */
          @media (max-width: 768px) {
            .habits-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 480px) {
            .container {
              padding: 0.75rem !important;
            }
            
            .section {
              padding: 1rem !important;
            }
          }

          /* Focus visible for better accessibility */
          *:focus-visible {
            outline: 2px solid var(--accent-primary) !important;
            outline-offset: 2px !important;
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }
        `}
      </style>
    </div>
  );
}

// Styles
const appStyles = {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  transition: 'background-color 0.3s ease, color 0.3s ease',
};

const mainStyles = {
  paddingBottom: '2rem',
};

const containerStyles = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1rem',
  animation: 'fadeIn 0.5s ease-out',
};

const errorContainerStyles = {
  backgroundColor: 'rgba(245, 101, 101, 0.1)',
  border: '1px solid var(--danger)',
  borderRadius: '0.5rem',
  padding: '1rem',
  marginBottom: '1.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  animation: 'slideIn 0.3s ease-out',
};

const errorMessageStyles = {
  color: 'var(--danger)',
  fontSize: '0.875rem',
  flex: 1,
};

const errorCloseStyles = {
  backgroundColor: 'transparent',
  border: 'none',
  color: 'var(--danger)',
  fontSize: '1.25rem',
  cursor: 'pointer',
  padding: '0.25rem',
  borderRadius: '0.25rem',
  lineHeight: 1,
  
  ':hover': {
    backgroundColor: 'var(--danger)',
    color: 'white',
  },
};

const sectionStyles = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  marginBottom: '1.5rem',
};

const sectionHeaderStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const sectionTitleStyles = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  margin: 0,
};

const summaryStyles = {
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  fontWeight: '500',
  backgroundColor: 'var(--bg-secondary)',
  padding: '0.5rem 1rem',
  borderRadius: '1rem',
};

const loadingStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  padding: '2rem',
  color: 'var(--text-secondary)',
  fontSize: '1rem',
};

const loadingSpinnerStyles = {
  width: '20px',
  height: '20px',
  border: '2px solid var(--border-color)',
  borderTop: '2px solid var(--accent-primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const habitsGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const emptyStateStyles = {
  textAlign: 'center',
  padding: '3rem 1rem',
  color: 'var(--text-secondary)',
};

const emptyTitleStyles = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  marginBottom: '0.5rem',
};

const emptyDescriptionStyles = {
  fontSize: '1rem',
  lineHeight: 1.5,
  maxWidth: '400px',
  margin: '0 auto',
};

const addHabitSectionStyles = {
  borderTop: '1px solid var(--border-color)',
  paddingTop: '1.5rem',
};

export default App;