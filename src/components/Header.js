/**
 * Header component with app title, current date, and theme toggle.
 * 
 * Features:
 * - Responsive design that works on mobile and desktop
 * - Shows current date and day of week
 * - Theme toggle button for light/dark mode
 * - Clean, modern styling
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';

const Header = ({ isDarkMode, toggleTheme }) => {
  // Format current date for display
  const formatDate = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
  };

  return (
    <header style={headerStyles}>
      <div style={headerContentStyles}>
        {/* App title and date */}
        <div style={titleSectionStyles}>
          <h1 style={titleStyles}>Habit Tracker</h1>
          <p style={dateStyles}>{formatDate()}</p>
        </div>

        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          style={themeButtonStyles}
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? (
            <Sun size={20} style={iconStyles} />
          ) : (
            <Moon size={20} style={iconStyles} />
          )}
        </button>
      </div>
    </header>
  );
};

// Styles using CSS-in-JS for component isolation
const headerStyles = {
  backgroundColor: 'var(--bg-card)',
  borderBottom: '1px solid var(--border-color)',
  padding: '1rem 0',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

const headerContentStyles = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
};

const titleSectionStyles = {
  flex: 1,
};

const titleStyles = {
  fontSize: 'clamp(1.5rem, 4vw, 2rem)', // Responsive font size
  fontWeight: '700',
  color: 'var(--text-primary)',
  margin: 0,
  lineHeight: 1.2,
};

const dateStyles = {
  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
  color: 'var(--text-secondary)',
  margin: '0.25rem 0 0 0',
  fontWeight: '400',
};

const themeButtonStyles = {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
  padding: '0.75rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  minWidth: '48px', // Ensure minimum touch target size
  minHeight: '48px',
  
  // Hover and focus states
  ':hover': {
    backgroundColor: 'var(--accent-secondary)',
    borderColor: 'var(--accent-primary)',
  },
  
  ':focus': {
    outline: '2px solid var(--accent-primary)',
    outlineOffset: '2px',
  },
};

const iconStyles = {
  color: 'var(--text-primary)',
  transition: 'color 0.3s ease',
};

export default Header;