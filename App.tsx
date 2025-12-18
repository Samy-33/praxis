import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AtomicHabitsView } from './modules/atomic-habits/AtomicHabitsView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Onboarding } from './components/Onboarding';
import { Habit, ViewState, UserProfile } from './types';

const STORAGE_KEY = 'book-to-action-habits';
const USER_STORAGE_KEY = 'book-to-action-user';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Load user on mount
  useEffect(() => {
    const loadUser = () => {
        try {
            const savedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error("Failed to load user", e);
        } finally {
            setLoadingUser(false);
        }
    };
    loadUser();
  }, []);

  // Initialize habits state
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse habits from local storage", e);
      return [];
    }
  });

  // Save habits on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const addHabit = (habit: Habit) => {
    setHabits(prev => [...prev, habit]);
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;

      const today = new Date().toISOString().split('T')[0];
      const isCompleted = h.completedDates.includes(today);
      
      let newDates = [...h.completedDates];
      let newStreak = h.streak;

      if (isCompleted) {
        newDates = newDates.filter(d => d !== today);
        newStreak = Math.max(0, newStreak - 1); // Simple decrement for undo
      } else {
        newDates.push(today);
        newStreak += 1;
      }

      return {
        ...h,
        completedDates: newDates,
        streak: newStreak
      };
    }));
  };

  const requestDeleteHabit = (id: string) => {
    setHabitToDelete(id);
  };

  const confirmDeleteHabit = () => {
    if (habitToDelete) {
      setHabits(prev => prev.filter(h => h.id !== habitToDelete));
      setHabitToDelete(null);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard habits={habits} userProfile={user} />;
      case 'atomic-habits':
        return (
          <AtomicHabitsView 
            habits={habits} 
            onAddHabit={addHabit}
            onToggleHabit={toggleHabit}
            onDeleteHabit={requestDeleteHabit}
          />
        );
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
            <p className="mb-4">Settings module coming in Phase 2</p>
            {user && (
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-left w-full max-w-md">
                    <h3 className="text-white font-medium mb-2">User Profile</h3>
                    <p className="text-sm">Name: <span className="text-slate-300">{user.name}</span></p>
                    <p className="text-sm">API Key: <span className="text-slate-300">{user.apiKey ? '••••••••' + user.apiKey.slice(-4) : 'Not set'}</span></p>
                    <button 
                        onClick={() => {
                            localStorage.removeItem(USER_STORAGE_KEY);
                            setUser(null);
                        }}
                        className="mt-4 text-xs text-red-400 hover:text-red-300 underline"
                    >
                        Reset Profile
                    </button>
                </div>
            )}
          </div>
        );
      default:
        return <Dashboard habits={habits} userProfile={user} />;
    }
  };

  if (loadingUser) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!user) {
    return <Onboarding onComplete={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <ConfirmationModal 
        isOpen={!!habitToDelete}
        title="Delete Habit?"
        message="This action cannot be undone. All streak history for this habit will be lost forever."
        onConfirm={confirmDeleteHabit}
        onCancel={() => setHabitToDelete(null)}
      />
    </div>
  );
};

export default App;