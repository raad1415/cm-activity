/**
 * ProgressSummary component for displaying habit tracking statistics.
 * 
 * Features:
 * - Today's completion progress
 * - Weekly completion rate
 * - Current streaks for habits
 * - Most consistent habit highlight
 * - Responsive grid layout
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Flame, Award, Download } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const ProgressSummary = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  // Load progress data
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const data = await api.getProgress();
        setProgress(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [api]);

  // Handle export
  const handleExport = async () => {
    try {
      await api.exportData();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div style={loadingStyles}>
        Loading progress...
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorStyles}>
        Failed to load progress: {error}
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  // Calculate progress percentage for today
  const todayCompletionPercentage = progress.total_habits > 0 
    ? Math.round((progress.habits_completed_today / progress.total_habits) * 100)
    : 0;

  // Get the highest streak
  const maxStreak = Math.max(...Object.values(progress.streak_counts), 0);

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Progress Summary</h2>
        <button
          onClick={handleExport}
          style={exportButtonStyles}
          title="Export data to CSV"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Progress grid */}
      <div style={gridStyles}>
        {/* Today's Progress */}
        <div style={cardStyles}>
          <div style={cardHeaderStyles}>
            <div style={iconContainerStyles}>
              <Target size={20} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h3 style={cardTitleStyles}>Today's Progress</h3>
              <p style={cardSubtitleStyles}>
                {progress.habits_completed_today} of {progress.total_habits} completed
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div style={progressBarContainerStyles}>
            <div 
              style={{
                ...progressBarStyles,
                width: `${todayCompletionPercentage}%`,
              }}
            />
          </div>
          
          <div style={progressTextStyles}>
            {todayCompletionPercentage}% Complete
          </div>
        </div>

        {/* Weekly Completion Rate */}
        <div style={cardStyles}>
          <div style={cardHeaderStyles}>
            <div style={iconContainerStyles}>
              <TrendingUp size={20} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <h3 style={cardTitleStyles}>7-Day Average</h3>
              <p style={cardSubtitleStyles}>Overall completion rate</p>
            </div>
          </div>
          
          <div style={metricValueStyles}>
            {Math.round(progress.completion_rate_last_7_days * 100)}%
          </div>
        </div>

        {/* Current Streak */}
        <div style={cardStyles}>
          <div style={cardHeaderStyles}>
            <div style={iconContainerStyles}>
              <Flame size={20} style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <h3 style={cardTitleStyles}>Best Streak</h3>
              <p style={cardSubtitleStyles}>Longest current streak</p>
            </div>
          </div>
          
          <div style={metricValueStyles}>
            {maxStreak} {maxStreak === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Most Consistent Habit */}
        <div style={cardStyles}>
          <div style={cardHeaderStyles}>
            <div style={iconContainerStyles}>
              <Award size={20} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div>
              <h3 style={cardTitleStyles}>Star Habit</h3>
              <p style={cardSubtitleStyles}>Most consistent performer</p>
            </div>
          </div>
          
          <div style={metricValueStyles}>
            {progress.most_consistent_habit || 'None yet'}
          </div>
        </div>
      </div>

      {/* Habits needing attention */}
      {progress.needs_attention && progress.needs_attention.length > 0 && (
        <div style={attentionSectionStyles}>
          <h3 style={attentionTitleStyles}>Needs Attention Today</h3>
          <div style={attentionListStyles}>
            {progress.needs_attention.map((habitName, index) => (
              <span key={index} style={attentionItemStyles}>
                {habitName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyles = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  marginBottom: '1.5rem',
};

const headerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const titleStyles = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  margin: 0,
};

const exportButtonStyles = {
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s ease',
  
  ':hover': {
    backgroundColor: 'var(--accent-primary)',
    color: 'white',
    borderColor: 'var(--accent-primary)',
  },
};

const gridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const cardStyles = {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
  padding: '1rem',
  transition: 'all 0.3s ease',
};

const cardHeaderStyles = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  marginBottom: '1rem',
};

const iconContainerStyles = {
  backgroundColor: 'var(--bg-card)',
  borderRadius: '0.5rem',
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const cardTitleStyles = {
  fontSize: '1rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  margin: 0,
  lineHeight: 1.2,
};

const cardSubtitleStyles = {
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  margin: '0.25rem 0 0 0',
  lineHeight: 1.3,
};

const progressBarContainerStyles = {
  backgroundColor: 'var(--border-color)',
  borderRadius: '0.375rem',
  height: '8px',
  marginBottom: '0.5rem',
  overflow: 'hidden',
};

const progressBarStyles = {
  backgroundColor: 'var(--success)',
  height: '100%',
  borderRadius: '0.375rem',
  transition: 'width 0.5s ease',
};

const progressTextStyles = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  textAlign: 'center',
};

const metricValueStyles = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  textAlign: 'center',
  lineHeight: 1.2,
};

const attentionSectionStyles = {
  backgroundColor: 'rgba(237, 137, 54, 0.1)',
  border: '1px solid var(--warning)',
  borderRadius: '0.5rem',
  padding: '1rem',
};

const attentionTitleStyles = {
  fontSize: '1rem',
  fontWeight: '600',
  color: 'var(--warning)',
  margin: '0 0 0.75rem 0',
};

const attentionListStyles = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const attentionItemStyles = {
  backgroundColor: 'var(--warning)',
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: '500',
  padding: '0.25rem 0.75rem',
  borderRadius: '1rem',
  whiteSpace: 'nowrap',
};

const loadingStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  color: 'var(--text-secondary)',
  fontSize: '1rem',
};

const errorStyles = {
  backgroundColor: 'rgba(245, 101, 101, 0.1)',
  color: 'var(--danger)',
  padding: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--danger)',
  fontSize: '0.875rem',
  textAlign: 'center',
};

export default ProgressSummary;