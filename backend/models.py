"""
Data models for the habit tracking application.

This module defines the Pydantic models used for data validation
and serialization throughout the application.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from enum import Enum


class HabitCategory(str, Enum):
    """Predefined categories for habits to help with organization."""
    HEALTH = "health"
    FITNESS = "fitness"
    MENTAL = "mental"
    PRODUCTIVITY = "productivity"
    SOCIAL = "social"
    LEARNING = "learning"
    CUSTOM = "custom"


class HabitBase(BaseModel):
    """Base model for habit data."""
    name: str
    description: Optional[str] = None
    category: HabitCategory = HabitCategory.CUSTOM
    target_frequency: int = 1  # How many times per day (for future use)


class HabitCreate(HabitBase):
    """Model for creating a new habit."""
    pass


class Habit(HabitBase):
    """Complete habit model with ID."""
    id: str
    created_at: date
    
    class Config:
        """Pydantic configuration."""
        from_attributes = True


class HabitEntryCreate(BaseModel):
    """Model for creating a habit entry (completion record)."""
    date: date
    completed: bool = True
    notes: Optional[str] = None


class HabitEntry(HabitEntryCreate):
    """Complete habit entry model."""
    habit_id: str
    
    class Config:
        """Pydantic configuration."""
        from_attributes = True


class HabitWithEntries(Habit):
    """Habit model that includes recent entries for analysis."""
    entries: List[HabitEntry] = []


class AITipRequest(BaseModel):
    """Model for requesting AI tips."""
    days_back: int = 3  # Number of days to analyze


class AITip(BaseModel):
    """Model for AI-generated tips."""
    category: str
    tip: str
    priority: str  # "high", "medium", "low"
    based_on: List[str]  # What habits/patterns this tip is based on


class ProgressSummary(BaseModel):
    """Model for progress summary statistics."""
    total_habits: int
    habits_completed_today: int
    completion_rate_last_7_days: float
    streak_counts: dict  # habit_id -> current_streak_days
    most_consistent_habit: Optional[str] = None
    needs_attention: List[str] = []  # habit names that need attention


class ExportData(BaseModel):
    """Model for CSV export data."""
    habits: List[Habit]
    entries: List[HabitEntry]
    export_date: date