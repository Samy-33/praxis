import React, { useState, useCallback } from 'react';
import { Habit, LoadingState } from '../../types';
import { Plus, Sparkles, Check, Trash2, ArrowRight, Calendar, ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';
import { generateHabitSuggestions } from '../../services/geminiService';

interface AtomicHabitsViewProps {
  habits: Habit[];
  onAddHabit: (habit: Habit) => void;
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

// Helper to get days for calendar
const getCalendarDays = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
  return days;
};

const HabitHistory: React.FC<{ habit: Habit; onBack: () => void; onDelete: (id: string) => void }> = ({ habit, onBack, onDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = getCalendarDays(year, month);
  
  const isCompleted = (date: Date) => {
     const iso = date.toISOString().split('T')[0];
     return habit.completedDates.includes(iso);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const getDayClass = (date: Date | null) => {
      if (!date) return "invisible";
      const completed = isCompleted(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      let classes = "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ";
      if (completed) {
          classes += "text-white shadow-lg shadow-indigo-500/20 scale-105 ";
      } else {
          classes += "bg-slate-800 text-slate-500 ";
      }
      if (isToday && !completed) {
          classes += "border border-slate-600 ";
      }
      return classes;
  };

  return (
     <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Habits
            </button>
            <button 
                onClick={() => onDelete(habit.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete Habit</span>
            </button>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: habit.color}}></span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-1 rounded">{habit.identity}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{habit.action}</h2>
                    <div className="flex items-center gap-2 text-slate-400">
                        <ArrowRight className="w-4 h-4" />
                        <span>Cue: {habit.cue}</span>
                    </div>
                </div>
                <div className="flex items-center gap-8 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white tabular-nums">{habit.streak}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Streak</div>
                    </div>
                    <div className="w-px h-10 bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white tabular-nums">{habit.completedDates.length}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={prevMonth}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-semibold text-slate-200">{monthNames[month]} {year}</h3>
                    <button 
                        onClick={nextMonth}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-4 mb-4 text-center">
                    {['S','M','T','W','T','F','S'].map(d => (
                        <div key={d} className="text-xs font-bold text-slate-600 uppercase">{d}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-4">
                    {calendarDays.map((date, i) => {
                        if (!date) return <div key={`empty-${i}`} className="aspect-square"></div>;
                        
                        const completed = isCompleted(date);
                        
                        return (
                            <div 
                                key={date.toISOString()}
                                className={getDayClass(date)}
                                style={{
                                    backgroundColor: completed ? habit.color : undefined
                                }}
                            >
                                {date.getDate()}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
     </div>
  )
}

export const AtomicHabitsView: React.FC<AtomicHabitsViewProps> = ({ 
  habits, 
  onAddHabit, 
  onToggleHabit,
  onDeleteHabit
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [identityInput, setIdentityInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<Array<{action: string, cue: string}>>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const closeCreationFlow = () => {
    setIsExiting(true);
    setTimeout(() => {
        setIsCreating(false);
        setIsExiting(false);
    }, 300);
  };

  const handleToggleCreation = () => {
    if (isCreating) {
        closeCreationFlow();
    } else {
        setIsCreating(true);
    }
  };

  const fetchSuggestions = async () => {
    if (!identityInput.trim()) return;
    
    setLoadingState(LoadingState.LOADING);
    const suggestions = await generateHabitSuggestions(identityInput, contextInput);
    setAiSuggestions(suggestions);
    setLoadingState(LoadingState.SUCCESS);
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuggestions();
  };

  const addSuggestion = (suggestion: { action: string, cue: string }) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      identity: identityInput,
      action: suggestion.action,
      cue: suggestion.cue,
      streak: 0,
      completedDates: [],
      color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
    };
    onAddHabit(newHabit);
    setAiSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  if (selectedHabit) {
      return (
        <HabitHistory 
            habit={selectedHabit} 
            onBack={() => setSelectedHabitId(null)} 
            onDelete={onDeleteHabit}
        />
      );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            Atomic Habits <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">Module</span>
          </h1>
          <p className="text-slate-400">"Every action you take is a vote for the type of person you wish to become."</p>
        </div>
        <button 
          onClick={handleToggleCreation}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Identity
        </button>
      </header>

      {/* Creation Flow */}
      {isCreating && (
        <div className={`relative bg-slate-800 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl shadow-indigo-900/20 transition-all duration-300 ease-in-out ${isExiting ? 'opacity-0 -translate-y-4 pointer-events-none' : 'animate-fade-in'}`}>
          <button 
            onClick={closeCreationFlow}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Who do you want to become?</h2>
            
            <form onSubmit={handleIdentitySubmit} className="space-y-4 mb-8">
              <div>
                 <label className="block text-sm font-medium text-slate-400 mb-1">Identity Goal</label>
                 <input
                  type="text"
                  value={identityInput}
                  onChange={(e) => setIdentityInput(e.target.value)}
                  placeholder="e.g. A runner, A prolific writer, A healthy eater..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-slate-400 mb-1">Personal Context (Optional)</label>
                 <textarea
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="e.g. I work 9-5 and have a gym membership I never use. I have 20 minutes free in the mornings."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loadingState === LoadingState.LOADING}
                className="w-full bg-indigo-600 disabled:opacity-50 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loadingState === LoadingState.LOADING ? 'Thinking...' : 'Generate Habits'}
                <Sparkles className="w-4 h-4" />
              </button>
            </form>

            {/* AI Suggestions Results */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Suggested Atomic Habits</h3>
                    <button 
                        onClick={() => fetchSuggestions()}
                        disabled={loadingState === LoadingState.LOADING}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3 h-3 ${loadingState === LoadingState.LOADING ? 'animate-spin' : ''}`} /> 
                        Refresh Suggestions
                    </button>
                </div>
                <div className="grid gap-4">
                  {aiSuggestions.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                      <div>
                        <p className="font-medium text-white">{s.action}</p>
                        <p className="text-sm text-slate-500">Cue: {s.cue}</p>
                      </div>
                      <button 
                        onClick={() => addSuggestion(s)}
                        className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Habits List */}
      <div className="grid gap-6">
        {habits.map(habit => {
          const isCompletedToday = habit.completedDates.includes(getTodayISO());
          return (
            <div key={habit.id} className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 p-5 rounded-2xl transition-all duration-200">
              <div className="flex items-center gap-6">
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                      e.stopPropagation();
                      onToggleHabit(habit.id);
                  }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 z-10 ${
                    isCompletedToday 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105' 
                      : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
                  }`}
                >
                  <Check className={`w-6 h-6 transition-transform ${isCompletedToday ? 'scale-100' : 'scale-0'}`} />
                </button>

                {/* Content - Clickable for history */}
                <div 
                    onClick={() => setSelectedHabitId(habit.id)}
                    className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-300">
                      {habit.identity}
                    </span>
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" /> {habit.cue}
                    </span>
                  </div>
                  <h3 className={`text-lg font-medium transition-colors ${isCompletedToday ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {habit.action}
                  </h3>
                </div>

                {/* Metrics */}
                <div className="text-right px-4 border-l border-slate-700">
                  <div className="text-2xl font-bold text-white tabular-nums">{habit.streak}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Streak</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setSelectedHabitId(habit.id)}
                        className="p-2 text-slate-600 hover:text-indigo-400 transition-all relative z-20"
                        title="View History"
                    >
                        <Calendar className="w-5 h-5" />
                    </button>
                    <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHabit(habit.id);
                    }}
                    className="p-2 text-slate-600 hover:text-red-400 transition-all relative z-20"
                    title="Delete Habit"
                    >
                    <Trash2 className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {habits.length === 0 && !isCreating && (
          <div className="text-center py-20 bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700">
            <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">No habits tracked yet</h3>
            <p className="text-slate-500 max-w-md mx-auto">Start by creating a new identity above. The AI will help you break it down.</p>
          </div>
        )}
      </div>
    </div>
  );
};