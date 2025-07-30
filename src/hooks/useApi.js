/**
 * Custom hook for making API calls to the habit tracker backend.
 * 
 * This hook provides methods for all the main API operations:
 * - Managing habits (get, create, delete)
 * - Managing habit entries (get, create, delete)
 * - Getting AI tips and progress summaries
 * - Exporting data
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Production API endpoint
  : 'http://localhost:8000';  // Development backend

/**
 * Main API hook providing all backend operations
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic API call function with error handling
  const apiCall = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle different response types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType && contentType.includes('text/csv')) {
        return response; // Return response object for file downloads
      } else {
        return await response.text();
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Habit management
  const getHabits = useCallback(() => {
    return apiCall('/habits');
  }, [apiCall]);

  const createHabit = useCallback((habitData) => {
    return apiCall('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  }, [apiCall]);

  const deleteHabit = useCallback((habitId) => {
    return apiCall(`/habits/${habitId}`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Habit entries management
  const getHabitEntries = useCallback((habitId, daysBack = null) => {
    const params = daysBack ? `?days_back=${daysBack}` : '';
    return apiCall(`/habits/${habitId}/entries${params}`);
  }, [apiCall]);

  const createHabitEntry = useCallback((habitId, entryData) => {
    return apiCall(`/habits/${habitId}/entries`, {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }, [apiCall]);

  const deleteHabitEntry = useCallback((habitId, entryDate) => {
    return apiCall(`/habits/${habitId}/entries?entry_date=${entryDate}`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Progress and AI features
  const getProgress = useCallback(() => {
    return apiCall('/progress');
  }, [apiCall]);

  const getAITips = useCallback((daysBack = 3) => {
    return apiCall(`/ai-tips?days_back=${daysBack}`);
  }, [apiCall]);

  // Export functionality
  const exportData = useCallback(async () => {
    const response = await apiCall('/export');
    
    // Create download link for CSV file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from response headers or use default
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `habit_tracker_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  }, [apiCall]);

  return {
    loading,
    error,
    clearError: () => setError(null),
    
    // Habit operations
    getHabits,
    createHabit,
    deleteHabit,
    
    // Entry operations
    getHabitEntries,
    createHabitEntry,
    deleteHabitEntry,
    
    // Analysis operations
    getProgress,
    getAITips,
    
    // Export operations
    exportData,
  };
};

/**
 * Hook for managing habits with automatic refresh
 */
export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const api = useApi();

  const refreshHabits = useCallback(async () => {
    try {
      const data = await api.getHabits();
      setHabits(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    }
  }, [api]);

  const addHabit = useCallback(async (habitData) => {
    try {
      const newHabit = await api.createHabit(habitData);
      setHabits(prev => [...prev, newHabit]);
      return newHabit;
    } catch (error) {
      console.error('Failed to create habit:', error);
      throw error;
    }
  }, [api]);

  const removeHabit = useCallback(async (habitId) => {
    try {
      await api.deleteHabit(habitId);
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Failed to delete habit:', error);
      throw error;
    }
  }, [api]);

  // Load habits on mount
  useEffect(() => {
    refreshHabits();
  }, [refreshHabits]);

  return {
    habits,
    loading: api.loading,
    error: api.error,
    lastUpdated,
    refreshHabits,
    addHabit,
    removeHabit,
    clearError: api.clearError,
  };
};

/**
 * Hook for managing habit entries for today
 */
export const useTodayEntries = (habits) => {
  const [entries, setEntries] = useState({});
  const api = useApi();
  const today = new Date().toISOString().split('T')[0];

  // Load today's entries for all habits
  const refreshEntries = useCallback(async () => {
    if (!habits.length) return;

    try {
      const entriesData = {};
      
      // Get entries for each habit
      await Promise.all(
        habits.map(async (habit) => {
          try {
            const habitEntries = await api.getHabitEntries(habit.id, 1);
            const todayEntry = habitEntries.find(entry => entry.date === today);
            entriesData[habit.id] = todayEntry?.completed || false;
          } catch (error) {
            console.error(`Failed to fetch entries for habit ${habit.id}:`, error);
            entriesData[habit.id] = false;
          }
        })
      );
      
      setEntries(entriesData);
    } catch (error) {
      console.error('Failed to refresh entries:', error);
    }
  }, [habits, api, today]);

  // Toggle a habit completion for today
  const toggleHabit = useCallback(async (habitId) => {
    const currentlyCompleted = entries[habitId] || false;
    const newCompleted = !currentlyCompleted;

    try {
      if (newCompleted) {
        // Mark as completed
        await api.createHabitEntry(habitId, {
          date: today,
          completed: true,
        });
      } else {
        // Remove completion
        await api.deleteHabitEntry(habitId, today);
      }

      // Update local state
      setEntries(prev => ({
        ...prev,
        [habitId]: newCompleted,
      }));
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      throw error;
    }
  }, [entries, api, today]);

  // Load entries when habits change
  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  return {
    entries,
    loading: api.loading,
    error: api.error,
    toggleHabit,
    refreshEntries,
    clearError: api.clearError,
  };
};