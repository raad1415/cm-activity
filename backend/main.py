"""
Main FastAPI application for the habit tracking system.

This module defines all the API endpoints and serves as the entry point
for the backend application.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from datetime import date, timedelta
from typing import List, Optional
import os
import csv
import tempfile
from pathlib import Path

# Import OpenAI for AI tips
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

from models import (
    Habit, HabitCreate, HabitEntry, HabitEntryCreate, 
    AITip, ProgressSummary, HabitWithEntries
)
from storage import JSONStorage

# Import for lifespan events
from contextlib import asynccontextmanager

# Initialize storage
storage = JSONStorage()

# Initialize OpenAI client if API key is available
openai_client = None
if OpenAI and os.getenv("OPENAI_API_KEY"):
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize default habits using lifespan event
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup: Create default habits if none exist
    existing_habits = storage.get_all_habits()
    
    if not existing_habits:
        default_habits = [
            HabitCreate(
                name="Morning Exercise",
                description="30 minutes of physical activity",
                category="fitness"
            ),
            HabitCreate(
                name="8 Hours Sleep",
                description="Get adequate sleep for recovery",
                category="health"
            ),
            HabitCreate(
                name="Daily Journaling",
                description="Write down thoughts and reflections",
                category="mental"
            ),
            HabitCreate(
                name="Read for 30 Minutes",
                description="Read books, articles, or educational content",
                category="learning"
            )
        ]
        
        for habit_data in default_habits:
            storage.create_habit(habit_data)
    
    yield
    # Shutdown: cleanup if needed

# Initialize FastAPI app
app = FastAPI(
    title="Habit Tracker API",
    description="A simple API for tracking daily habits and getting AI-powered improvement tips",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Utility functions

def calculate_streak(entries: List[HabitEntry]) -> int:
    """
    Calculate current streak for a habit based on its entries.
    
    Args:
        entries: List of habit entries (should be sorted by date desc)
        
    Returns:
        Current consecutive days streak
    """
    if not entries:
        return 0
    
    # Sort entries by date (newest first)
    sorted_entries = sorted(entries, key=lambda x: x.date, reverse=True)
    
    current_date = date.today()
    streak = 0
    
    # Check if completed today or yesterday (account for "grace period")
    for entry in sorted_entries:
        if entry.completed and (current_date - entry.date).days == streak:
            streak += 1
            current_date = entry.date
        else:
            break
    
    return streak


def analyze_patterns(habits_with_entries: List[HabitWithEntries]) -> dict:
    """
    Analyze habit patterns for AI tip generation.
    
    Args:
        habits_with_entries: List of habits with their recent entries
        
    Returns:
        Dictionary with analysis results
    """
    analysis = {
        "missed_habits": [],
        "consistent_habits": [],
        "declining_habits": [],
        "categories_needing_attention": set(),
    }
    
    for habit in habits_with_entries:
        if not habit.entries:
            analysis["missed_habits"].append(habit.name)
            analysis["categories_needing_attention"].add(habit.category.value)
            continue
        
        # Calculate completion rate for last 3 days
        completed_count = sum(1 for entry in habit.entries if entry.completed)
        completion_rate = completed_count / len(habit.entries) if habit.entries else 0
        
        if completion_rate == 1.0:
            analysis["consistent_habits"].append(habit.name)
        elif completion_rate < 0.5:
            analysis["declining_habits"].append(habit.name)
            analysis["categories_needing_attention"].add(habit.category.value)
    
    return analysis


# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Habit Tracker API is running!"}


@app.get("/habits", response_model=List[Habit])
async def get_habits():
    """Get all habits."""
    return storage.get_all_habits()


@app.post("/habits", response_model=Habit)
async def create_habit(habit: HabitCreate):
    """Create a new habit."""
    return storage.create_habit(habit)


@app.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str):
    """Delete a habit and all its entries."""
    success = storage.delete_habit(habit_id)
    if not success:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"message": "Habit deleted successfully"}


@app.get("/habits/{habit_id}/entries", response_model=List[HabitEntry])
async def get_habit_entries(
    habit_id: str, 
    days_back: Optional[int] = Query(None, description="Number of days to look back")
):
    """Get entries for a specific habit."""
    # Verify habit exists
    habit = storage.get_habit(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    return storage.get_habit_entries(habit_id, days_back)


@app.post("/habits/{habit_id}/entries", response_model=HabitEntry)
async def create_habit_entry(habit_id: str, entry: HabitEntryCreate):
    """Mark a habit as completed for a specific date."""
    # Verify habit exists
    habit = storage.get_habit(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    return storage.create_entry(habit_id, entry)


@app.delete("/habits/{habit_id}/entries")
async def delete_habit_entry(
    habit_id: str, 
    entry_date: date = Query(..., description="Date of entry to delete")
):
    """Remove a habit completion entry for a specific date."""
    success = storage.delete_entry(habit_id, entry_date)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Entry deleted successfully"}


@app.get("/progress", response_model=ProgressSummary)
async def get_progress_summary():
    """Get overall progress summary and statistics."""
    habits = storage.get_all_habits()
    today = date.today()
    
    # Get today's entries
    today_entries = {}
    for habit in habits:
        entries = storage.get_habit_entries(habit.id, days_back=1)
        today_entries[habit.id] = any(
            entry.date == today and entry.completed 
            for entry in entries
        )
    
    # Calculate 7-day completion rate
    week_entries = storage.get_all_entries(days_back=7)
    total_possible_completions = len(habits) * 7
    actual_completions = len([e for e in week_entries if e.completed])
    completion_rate = (actual_completions / total_possible_completions) if total_possible_completions > 0 else 0
    
    # Calculate streaks and find most consistent habit
    streak_counts = {}
    max_streak = 0
    most_consistent_habit = None
    
    for habit in habits:
        entries = storage.get_habit_entries(habit.id, days_back=30)
        streak = calculate_streak(entries)
        streak_counts[habit.id] = streak
        
        if streak > max_streak:
            max_streak = streak
            most_consistent_habit = habit.name
    
    # Find habits needing attention (not completed today)
    needs_attention = [
        habit.name for habit in habits 
        if not today_entries.get(habit.id, False)
    ]
    
    return ProgressSummary(
        total_habits=len(habits),
        habits_completed_today=sum(today_entries.values()),
        completion_rate_last_7_days=round(completion_rate, 2),
        streak_counts=streak_counts,
        most_consistent_habit=most_consistent_habit,
        needs_attention=needs_attention
    )


@app.get("/ai-tips", response_model=List[AITip])
async def get_ai_tips(days_back: int = Query(3, description="Number of days to analyze")):
    """Get personalized AI tips based on recent habit patterns."""
    if not openai_client:
        # Return some default tips if OpenAI is not configured
        return [
            AITip(
                category="general",
                tip="Set up your OpenAI API key to get personalized tips based on your habits!",
                priority="medium",
                based_on=["system_configuration"]
            )
        ]
    
    # Get habits with recent entries
    habits = storage.get_all_habits()
    habits_with_entries = []
    
    for habit in habits:
        entries = storage.get_habit_entries(habit.id, days_back=days_back)
        habits_with_entries.append(HabitWithEntries(
            **habit.model_dump(),
            entries=entries
        ))
    
    if not habits_with_entries:
        return [
            AITip(
                category="getting_started",
                tip="Start by adding some habits you'd like to track! Try beginning with 2-3 simple habits.",
                priority="high",
                based_on=["no_habits"]
            )
        ]
    
    # Analyze patterns
    analysis = analyze_patterns(habits_with_entries)
    
    # Prepare context for OpenAI
    context = f"""
    User's habit tracking data for the last {days_back} days:
    
    Total habits being tracked: {len(habits_with_entries)}
    
    Habits with consistent completion: {', '.join(analysis['consistent_habits']) if analysis['consistent_habits'] else 'None'}
    
    Habits that were missed or declined: {', '.join(analysis['missed_habits'] + analysis['declining_habits']) if analysis['missed_habits'] or analysis['declining_habits'] else 'None'}
    
    Categories needing attention: {', '.join(analysis['categories_needing_attention']) if analysis['categories_needing_attention'] else 'None'}
    
    Individual habit details:
    """
    
    for habit in habits_with_entries:
        completed_days = len([e for e in habit.entries if e.completed])
        total_days = len(habit.entries)
        context += f"\n- {habit.name} ({habit.category.value}): {completed_days}/{total_days} days completed"
    
    try:
        # Generate AI tips using OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a helpful habit tracking assistant. Provide 2-3 specific, actionable tips based on the user's habit data. Focus on encouragement and practical advice. Return your response as a list of tips, each on a new line starting with '- '. Keep tips concise (max 100 words each)."
                },
                {
                    "role": "user",
                    "content": context
                }
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        tips_text = response.choices[0].message.content.strip()
        tips_lines = [line.strip('- ').strip() for line in tips_text.split('\n') if line.strip().startswith('-')]
        
        # Convert to AITip objects
        ai_tips = []
        for i, tip_text in enumerate(tips_lines[:3]):  # Limit to 3 tips
            priority = "high" if analysis['missed_habits'] or analysis['declining_habits'] else "medium"
            
            # Determine category based on content
            category = "general"
            if any(cat in tip_text.lower() for cat in ['sleep', 'rest']):
                category = "health"
            elif any(cat in tip_text.lower() for cat in ['exercise', 'workout', 'physical']):
                category = "fitness"
            elif any(cat in tip_text.lower() for cat in ['stress', 'mental', 'mindfulness']):
                category = "mental"
            
            based_on = []
            if analysis['missed_habits']:
                based_on.extend(analysis['missed_habits'])
            if analysis['declining_habits']:
                based_on.extend(analysis['declining_habits'])
            if not based_on:
                based_on = ["overall_patterns"]
            
            ai_tips.append(AITip(
                category=category,
                tip=tip_text,
                priority=priority,
                based_on=based_on[:3]  # Limit to 3 items
            ))
        
        return ai_tips
        
    except Exception as e:
        # Fallback tips if OpenAI fails
        fallback_tips = []
        
        if analysis['missed_habits']:
            fallback_tips.append(AITip(
                category="motivation",
                tip=f"You missed these habits: {', '.join(analysis['missed_habits'][:2])}. Try setting reminders or reducing the difficulty to build consistency.",
                priority="high",
                based_on=analysis['missed_habits'][:3]
            ))
        
        if analysis['consistent_habits']:
            fallback_tips.append(AITip(
                category="encouragement",
                tip=f"Great job maintaining {', '.join(analysis['consistent_habits'][:2])}! Consider adding a new complementary habit.",
                priority="medium",
                based_on=analysis['consistent_habits'][:3]
            ))
        
        if not fallback_tips:
            fallback_tips.append(AITip(
                category="general",
                tip="Keep tracking your habits consistently. Small daily actions lead to big changes over time!",
                priority="medium",
                based_on=["general_encouragement"]
            ))
        
        return fallback_tips


@app.get("/export")
async def export_data():
    """Export all habit data to CSV format."""
    habits = storage.get_all_habits()
    all_entries = storage.get_all_entries()
    
    # Create temporary CSV file
    temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv')
    
    try:
        writer = csv.writer(temp_file)
        
        # Write header
        writer.writerow([
            'Date', 'Habit', 'Category', 'Completed', 'Notes', 'Habit_ID'
        ])
        
        # Create a lookup for habit details
        habit_lookup = {habit.id: habit for habit in habits}
        
        # Write data rows
        for entry in sorted(all_entries, key=lambda x: x.date):
            habit = habit_lookup.get(entry.habit_id)
            if habit:
                writer.writerow([
                    entry.date.isoformat(),
                    habit.name,
                    habit.category.value,
                    'Yes' if entry.completed else 'No',
                    entry.notes or '',
                    entry.habit_id
                ])
        
        temp_file.close()
        
        # Return file for download
        return FileResponse(
            temp_file.name,
            media_type='text/csv',
            filename=f'habit_tracker_export_{date.today().isoformat()}.csv'
        )
        
    except Exception as e:
        # Clean up temp file if error occurs
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )