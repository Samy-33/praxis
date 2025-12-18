import React, { useMemo } from 'react';
import { Habit, UserProfile } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Activity, Trophy, Flame, Target } from 'lucide-react';

interface DashboardProps {
  habits: Habit[];
  userProfile: UserProfile | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ habits, userProfile }) => {
  const totalCompletions = useMemo(() => {
    return habits.reduce((acc, habit) => acc + habit.completedDates.length, 0);
  }, [habits]);

  const activeIdentities = useMemo(() => {
    const identities = new Set(habits.map(h => h.identity));
    return identities.size;
  }, [habits]);

  const topStreak = useMemo(() => {
    return habits.reduce((max, h) => Math.max(max, h.streak), 0);
  }, [habits]);

  // Calculate Trends
  const { completionsTrend, completionsTrendDir } = useMemo(() => {
    const now = new Date();
    // Reset to start of day for cleaner comparisons
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    let currentPeriod = 0;
    let previousPeriod = 0;

    habits.forEach(h => {
        h.completedDates.forEach(dateStr => {
            const d = new Date(dateStr);
            if (d >= sevenDaysAgo) {
                currentPeriod++;
            } else if (d >= fourteenDaysAgo && d < sevenDaysAgo) {
                previousPeriod++;
            }
        });
    });

    if (previousPeriod === 0) {
        return { 
            completionsTrend: currentPeriod > 0 ? "+100%" : "0%", 
            completionsTrendDir: currentPeriod > 0 ? "up" : "neutral" 
        };
    }

    const diff = currentPeriod - previousPeriod;
    const percentage = Math.round((diff / previousPeriod) * 100);
    const sign = percentage > 0 ? '+' : '';
    
    return {
        completionsTrend: `${sign}${percentage}%`,
        completionsTrendDir: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
    };
  }, [habits]);

  // Transform data for chart: Completions per Identity
  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    habits.forEach(h => {
      const current = map.get(h.identity) || 0;
      map.set(h.identity, current + h.completedDates.length);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [habits]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const firstName = userProfile?.name?.split(' ')[0] || 'User';

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="text-indigo-400">{firstName}</span>
        </h1>
        <p className="text-slate-400">Aggregated metrics from your active book modules.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={Activity} 
          label="Total Actions" 
          value={totalCompletions} 
          trend={completionsTrend}
          trendDir={completionsTrendDir}
          color="indigo"
          subLabel="vs last 7 days"
        />
        <MetricCard 
          icon={Target} 
          label="Active Identities" 
          value={activeIdentities} 
          trend="neutral"
          trendDir="neutral"
          color="emerald"
        />
        <MetricCard 
          icon={Flame} 
          label="Longest Streak" 
          value={`${topStreak} days`} 
          trend="neutral"
          trendDir="neutral"
          color="orange"
        />
        <MetricCard 
          icon={Trophy} 
          label="Level" 
          value={Math.floor(totalCompletions / 10) + 1} 
          trend="neutral"
          trendDir="neutral"
          color="pink"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Identity Reinforcement</h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    cursor={{ fill: '#334155' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No data available yet. Start tracking habits!
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
             {habits.slice(0, 5).map(habit => (
               <div key={habit.id} className="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }}></div>
                   <div>
                     <p className="text-sm font-medium text-slate-200">{habit.action}</p>
                     <p className="text-xs text-slate-500">{habit.identity}</p>
                   </div>
                 </div>
                 <div className="text-xs font-mono text-slate-400">
                   Streak: {habit.streak}
                 </div>
               </div>
             ))}
             {habits.length === 0 && <p className="text-slate-500 text-sm">No recent activity.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ 
    icon: any, 
    label: string, 
    value: string | number, 
    trend: string, 
    trendDir: string,
    color: string,
    subLabel?: string
}> = ({ 
  icon: Icon, label, value, trend, trendDir, color, subLabel
}) => {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    orange: 'bg-orange-500/10 text-orange-400',
    pink: 'bg-pink-500/10 text-pink-400',
  };

  const trendColor = trendDir === 'up' ? 'text-emerald-400 bg-emerald-500/10' : trendDir === 'down' ? 'text-red-400 bg-red-500/10' : 'hidden';

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trendDir !== 'neutral' && (
            <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendColor}`}>{trend}</span>
            </div>
        )}
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-white">{value}</h4>
        {subLabel && <p className="text-[10px] text-slate-500 mt-1">{subLabel}</p>}
      </div>
    </div>
  );
};