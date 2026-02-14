import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/providers/AuthProvider'
import { getDailyHabits, saveDailyHabits, toDateString } from '../services/habits'

const HABITS = [
  {
    key: 'water' as const,
    label: '4L Water',
    icon: '💧',
    color: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/30',
  },
  {
    key: 'sleep' as const,
    label: '8h Sleep',
    icon: '😴',
    color: 'from-indigo-500 to-purple-500',
    glow: 'shadow-indigo-500/30',
  },
  {
    key: 'stretching' as const,
    label: 'Stretching',
    icon: '🧘',
    color: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/30',
  },
]

export function HabitCheckins() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = new Date()
  const dateStr = toDateString(today)

  const { data: habits } = useQuery({
    queryKey: ['daily-habits', user?.uid, dateStr],
    queryFn: () => getDailyHabits(user!.uid, today),
    enabled: !!user?.uid,
  })

  const mutation = useMutation({
    mutationFn: (updated: { water: boolean; sleep: boolean; stretching: boolean }) =>
      saveDailyHabits(user!.uid, today, updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-habits', user?.uid, dateStr] })
    },
  })

  const toggleHabit = (key: 'water' | 'sleep' | 'stretching') => {
    const current = {
      water: habits?.water ?? false,
      sleep: habits?.sleep ?? false,
      stretching: habits?.stretching ?? false,
    }
    mutation.mutate({ ...current, [key]: !current[key] })
  }

  const completedCount = HABITS.filter(h => habits?.[h.key]).length

  return (
    <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-indigo-900/10 border border-primary/20 p-6 rounded-2xl backdrop-blur-xl shadow-xl hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden isolate">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">
            Daily Habits
          </h3>
          <p className="text-lg font-bold text-white">
            {completedCount}/{HABITS.length} completed
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
            completedCount === HABITS.length
              ? 'bg-primary/10 border-primary/30'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color: completedCount === HABITS.length ? '#13EC5B' : '#94a3b8',
            }}
          >
            {completedCount === HABITS.length ? '🎉 All Done' : 'In Progress'}
          </span>
        </div>
      </div>

      {/* Habit Toggles */}
      <div className="space-y-3">
        {HABITS.map(habit => {
          const isChecked = habits?.[habit.key] ?? false
          return (
            <button
              key={habit.key}
              onClick={() => toggleHabit(habit.key)}
              disabled={mutation.isPending}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 border ${
                isChecked
                  ? `bg-gradient-to-r ${habit.color} bg-opacity-10 border-white/20 shadow-lg ${habit.glow}`
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  isChecked ? 'bg-white/30 text-white' : 'bg-white/10 text-transparent'
                }`}
              >
                {isChecked && <span className="material-icons text-sm">check</span>}
              </div>

              {/* Icon */}
              <span className="text-xl flex-shrink-0">{habit.icon}</span>

              {/* Label */}
              <span
                className={`font-semibold text-sm transition-colors ${
                  isChecked ? 'text-white' : 'text-slate-400'
                }`}
              >
                {habit.label}
              </span>

              {/* Status */}
              <span
                className={`ml-auto text-xs font-bold uppercase tracking-wider ${
                  isChecked ? 'text-white/70' : 'text-slate-600'
                }`}
              >
                {isChecked ? 'Done' : 'Tap'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
