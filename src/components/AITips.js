/**
 * AITips component for displaying AI-generated personalized tips.
 * 
 * Features:
 * - Fetches tips based on recent habit data
 * - Color-coded priority indicators
 * - Expandable tip cards
 * - Refresh functionality
 * - Mobile-friendly design
 */

import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const AITips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedTips, setExpandedTips] = useState(new Set());
  const api = useApi();

  // Load AI tips
  const loadTips = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await api.getAITips(3); // Analyze last 3 days
      setTips(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load tips on component mount
  useEffect(() => {
    loadTips();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    loadTips(true);
  };

  // Toggle tip expansion
  const toggleTipExpansion = (index) => {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTips(newExpanded);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'var(--danger)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--text-secondary)';
    }
  };

  // Get category icon color
  const getCategoryColor = (category) => {
    const colors = {
      health: '#48bb78',
      fitness: '#ed8936',
      mental: '#9f7aea',
      productivity: '#4299e1',
      social: '#ed64a6',
      learning: '#38b2ac',
      motivation: '#f56565',
      encouragement: '#68d391',
      general: '#718096',
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={headerStyles}>
          <div style={titleSectionStyles}>
            <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={titleStyles}>AI Tips</h2>
          </div>
        </div>
        <div style={loadingStyles}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Generating personalized tips...
        </div>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div style={titleSectionStyles}>
          <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={titleStyles}>AI Tips</h2>
        </div>
        <button
          onClick={handleRefresh}
          style={refreshButtonStyles}
          disabled={refreshing}
          title="Refresh tips"
        >
          <RefreshCw 
            size={16} 
            style={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }} 
          />
          {refreshing ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={errorStyles}>
          Failed to load tips: {error}
        </div>
      )}

      {tips.length === 0 && !error ? (
        <div style={emptyStateStyles}>
          <Lightbulb size={48} style={{ color: 'var(--text-muted)' }} />
          <p style={emptyTextStyles}>
            No tips available yet. Add some habits and track them for a few days to get personalized suggestions!
          </p>
        </div>
      ) : (
        <div style={tipsListStyles}>
          {tips.map((tip, index) => (
            <div key={index} style={tipCardStyles}>
              {/* Tip header */}
              <div style={tipHeaderStyles}>
                <div style={tipMetaStyles}>
                  <span 
                    style={{
                      ...categoryBadgeStyles,
                      backgroundColor: getCategoryColor(tip.category),
                    }}
                  >
                    {tip.category}
                  </span>
                  <span 
                    style={{
                      ...priorityBadgeStyles,
                      backgroundColor: getPriorityColor(tip.priority),
                    }}
                  >
                    {tip.priority} priority
                  </span>
                </div>
                
                {tip.tip.length > 100 && (
                  <button
                    onClick={() => toggleTipExpansion(index)}
                    style={expandButtonStyles}
                    aria-label={expandedTips.has(index) ? 'Collapse tip' : 'Expand tip'}
                  >
                    {expandedTips.has(index) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                )}
              </div>

              {/* Tip content */}
              <div style={tipContentStyles}>
                <Lightbulb 
                  size={20} 
                  style={{ 
                    color: 'var(--accent-primary)',
                    flexShrink: 0,
                    marginTop: '0.125rem',
                  }} 
                />
                <p style={tipTextStyles}>
                  {tip.tip.length > 100 && !expandedTips.has(index)
                    ? `${tip.tip.substring(0, 100)}...`
                    : tip.tip
                  }
                </p>
              </div>

              {/* Based on info */}
              {tip.based_on && tip.based_on.length > 0 && (
                <div style={basedOnStyles}>
                  <span style={basedOnLabelStyles}>Based on:</span>
                  <span style={basedOnItemsStyles}>
                    {tip.based_on.join(', ')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
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
  gap: '0.75rem',
};

const titleSectionStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const titleStyles = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  margin: 0,
};

const refreshButtonStyles = {
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
  
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.6,
  },
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

const errorStyles = {
  backgroundColor: 'rgba(245, 101, 101, 0.1)',
  color: 'var(--danger)',
  padding: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--danger)',
  fontSize: '0.875rem',
  marginBottom: '1rem',
};

const emptyStateStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  textAlign: 'center',
};

const emptyTextStyles = {
  color: 'var(--text-secondary)',
  fontSize: '1rem',
  lineHeight: 1.5,
  marginTop: '1rem',
  maxWidth: '400px',
};

const tipsListStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const tipCardStyles = {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
  padding: '1rem',
  transition: 'all 0.3s ease',
  
  ':hover': {
    borderColor: 'var(--accent-primary)',
    boxShadow: `0 2px 8px var(--shadow)`,
  },
};

const tipHeaderStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '0.75rem',
  gap: '0.5rem',
};

const tipMetaStyles = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
};

const categoryBadgeStyles = {
  fontSize: '0.75rem',
  fontWeight: '500',
  color: 'white',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.375rem',
  textTransform: 'capitalize',
};

const priorityBadgeStyles = {
  fontSize: '0.75rem',
  fontWeight: '500',
  color: 'white',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.375rem',
  textTransform: 'capitalize',
};

const expandButtonStyles = {
  backgroundColor: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '0.25rem',
  borderRadius: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.2s ease',
  
  ':hover': {
    color: 'var(--text-primary)',
  },
};

const tipContentStyles = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'flex-start',
  marginBottom: '0.75rem',
};

const tipTextStyles = {
  fontSize: '0.95rem',
  lineHeight: 1.5,
  color: 'var(--text-primary)',
  margin: 0,
};

const basedOnStyles = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
  flexWrap: 'wrap',
  paddingTop: '0.75rem',
  borderTop: '1px solid var(--border-color)',
};

const basedOnLabelStyles = {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: 'var(--text-secondary)',
};

const basedOnItemsStyles = {
  fontSize: '0.875rem',
  color: 'var(--text-muted)',
  fontStyle: 'italic',
};

export default AITips;