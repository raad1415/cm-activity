"""
JSON-based storage system for habit tracking data.

This module provides a simple file-based storage solution using JSON files.
It's designed to be easily replaceable with a database backend later.
"""

import json
import os
from datetime import date, datetime
from typing import List, Optional, Dict, Any
from pathlib import Path
import uuid

from models import Habit, HabitEntry, HabitCreate, HabitEntryCreate


class JSONStorage:
    """
    Simple JSON-based storage for habits and entries.
    
    This class manages two JSON files:
    - habits.json: Contains all habit definitions
    - entries.json: Contains all habit completion entries
    """
    
    def __init__(self, data_dir: str = "data"):
        """
        Initialize the storage system.
        
        Args:
            data_dir: Directory to store JSON files
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        self.habits_file = self.data_dir / "habits.json"
        self.entries_file = self.data_dir / "entries.json"
        
        # Initialize files if they don't exist
        self._init_files()
    
    def _init_files(self):
        """Initialize JSON files with empty data if they don't exist."""
        if not self.habits_file.exists():
            self._write_json(self.habits_file, [])
        
        if not self.entries_file.exists():
            self._write_json(self.entries_file, [])
    
    def _read_json(self, file_path: Path) -> List[Dict[str, Any]]:
        """Read and parse JSON file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    def _write_json(self, file_path: Path, data: List[Dict[str, Any]]):
        """Write data to JSON file."""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str, ensure_ascii=False)
    
    # Habit CRUD operations
    
    def create_habit(self, habit_data: HabitCreate) -> Habit:
        """
        Create a new habit.
        
        Args:
            habit_data: Habit creation data
            
        Returns:
            Created habit with generated ID
        """
        habits = self._read_json(self.habits_file)
        
        # Generate unique ID
        habit_id = str(uuid.uuid4())
        
        # Create habit object
        habit = Habit(
            id=habit_id,
            name=habit_data.name,
            description=habit_data.description,
            category=habit_data.category,
            target_frequency=habit_data.target_frequency,
            created_at=date.today()
        )
        
        # Add to habits list
        habits.append(habit.model_dump())
        self._write_json(self.habits_file, habits)
        
        return habit
    
    def get_all_habits(self) -> List[Habit]:
        """Get all habits."""
        habits_data = self._read_json(self.habits_file)
        return [Habit(**habit) for habit in habits_data]
    
    def get_habit(self, habit_id: str) -> Optional[Habit]:
        """Get a specific habit by ID."""
        habits = self.get_all_habits()
        for habit in habits:
            if habit.id == habit_id:
                return habit
        return None
    
    def delete_habit(self, habit_id: str) -> bool:
        """
        Delete a habit and all its entries.
        
        Args:
            habit_id: ID of habit to delete
            
        Returns:
            True if habit was deleted, False if not found
        """
        habits_data = self._read_json(self.habits_file)
        original_length = len(habits_data)
        
        # Remove habit
        habits_data = [h for h in habits_data if h['id'] != habit_id]
        
        if len(habits_data) == original_length:
            return False  # Habit not found
        
        # Save updated habits
        self._write_json(self.habits_file, habits_data)
        
        # Remove all entries for this habit
        entries_data = self._read_json(self.entries_file)
        entries_data = [e for e in entries_data if e['habit_id'] != habit_id]
        self._write_json(self.entries_file, entries_data)
        
        return True
    
    # Entry CRUD operations
    
    def create_entry(self, habit_id: str, entry_data: HabitEntryCreate) -> HabitEntry:
        """
        Create or update a habit entry for a specific date.
        
        Args:
            habit_id: ID of the habit
            entry_data: Entry data
            
        Returns:
            Created or updated entry
        """
        entries = self._read_json(self.entries_file)
        
        # Convert date to string for comparison
        entry_date_str = entry_data.date.isoformat()
        
        # Check if entry already exists for this habit and date
        existing_entry_idx = None
        for i, entry in enumerate(entries):
            if (entry['habit_id'] == habit_id and 
                entry['date'] == entry_date_str):
                existing_entry_idx = i
                break
        
        # Create entry object
        entry = HabitEntry(
            habit_id=habit_id,
            date=entry_data.date,
            completed=entry_data.completed,
            notes=entry_data.notes
        )
        
        entry_dict = entry.model_dump()
        entry_dict['date'] = entry_date_str  # Ensure date is stored as string
        
        if existing_entry_idx is not None:
            # Update existing entry
            entries[existing_entry_idx] = entry_dict
        else:
            # Add new entry
            entries.append(entry_dict)
        
        self._write_json(self.entries_file, entries)
        return entry
    
    def get_habit_entries(self, habit_id: str, days_back: Optional[int] = None) -> List[HabitEntry]:
        """
        Get entries for a specific habit.
        
        Args:
            habit_id: ID of the habit
            days_back: If specified, only return entries from last N days
            
        Returns:
            List of habit entries
        """
        entries_data = self._read_json(self.entries_file)
        
        # Filter by habit_id
        habit_entries = [e for e in entries_data if e['habit_id'] == habit_id]
        
        # Convert to HabitEntry objects
        entries = []
        for entry_data in habit_entries:
            try:
                entry = HabitEntry(**entry_data)
                entries.append(entry)
            except Exception:
                continue  # Skip invalid entries
        
        # Filter by date if specified
        if days_back is not None:
            cutoff_date = date.today()
            from datetime import timedelta
            cutoff_date = cutoff_date - timedelta(days=days_back)
            entries = [e for e in entries if e.date >= cutoff_date]
        
        # Sort by date (newest first)
        entries.sort(key=lambda x: x.date, reverse=True)
        
        return entries
    
    def delete_entry(self, habit_id: str, entry_date: date) -> bool:
        """
        Delete a habit entry for a specific date.
        
        Args:
            habit_id: ID of the habit
            entry_date: Date of the entry to delete
            
        Returns:
            True if entry was deleted, False if not found
        """
        entries_data = self._read_json(self.entries_file)
        original_length = len(entries_data)
        
        entry_date_str = entry_date.isoformat()
        
        # Remove entry
        entries_data = [
            e for e in entries_data 
            if not (e['habit_id'] == habit_id and e['date'] == entry_date_str)
        ]
        
        if len(entries_data) == original_length:
            return False  # Entry not found
        
        self._write_json(self.entries_file, entries_data)
        return True
    
    def get_all_entries(self, days_back: Optional[int] = None) -> List[HabitEntry]:
        """
        Get all entries across all habits.
        
        Args:
            days_back: If specified, only return entries from last N days
            
        Returns:
            List of all habit entries
        """
        entries_data = self._read_json(self.entries_file)
        
        # Convert to HabitEntry objects
        entries = []
        for entry_data in entries_data:
            try:
                entry = HabitEntry(**entry_data)
                entries.append(entry)
            except Exception:
                continue  # Skip invalid entries
        
        # Filter by date if specified
        if days_back is not None:
            cutoff_date = date.today()
            from datetime import timedelta
            cutoff_date = cutoff_date - timedelta(days=days_back)
            entries = [e for e in entries if e.date >= cutoff_date]
        
        return entries