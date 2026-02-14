import { useQuery } from '@tanstack/react-query'
import { getPersonalBests, PersonalBest } from '../services/personalBests'

interface TrophyRoomProps {
  userId: string
}

function getMedalStyle(index: number) {
  if (index === 0)
    return {
      bg: 'from-yellow-500/30 to-amber-500/10',
      border: 'border-yellow-500/40',
      icon: '🥇',
      glow: 'shadow-yellow-500/20',
    }
  if (index === 1)
    return {
      bg: 'from-slate-300/20 to-slate-400/5',
      border: 'border-slate-400/30',
      icon: '🥈',
      glow: 'shadow-slate-400/10',
    }
  if (index === 2)
    return {
      bg: 'from-orange-700/25 to-orange-800/10',
      border: 'border-orange-600/30',
      icon: '🥉',
      glow: 'shadow-orange-600/10',
    }
  return {
    bg: 'from-white/5 to-white/0',
    border: 'border-white/10',
    icon: '🏋️',
    glow: '',
  }
}

function PBCard({ pb, index }: { pb: PersonalBest; index: number }) {
  const medal = getMedalStyle(index)
  const date = pb.date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      className={`bg-gradient-to-br ${medal.bg} border ${medal.border} rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] ${medal.glow} ${medal.glow ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{medal.icon}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
          #{index + 1}
        </span>
      </div>

      <h3 className="font-bold text-white text-sm mb-1 truncate">{pb.exerciseName}</h3>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-black text-white">{pb.weight}</span>
        <span className="text-sm text-slate-400 font-semibold">kg</span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{pb.reps} reps</span>
        <span className="flex items-center gap-1">
          <span className="material-icons text-[12px]">calendar_today</span>
          {date}
        </span>
      </div>
    </div>
  )
}

export function TrophyRoom({ userId }: TrophyRoomProps) {
  const {
    data: personalBests = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['personal-bests', userId],
    queryFn: () => getPersonalBests(userId),
    enabled: !!userId,
  })

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <span className="material-icons text-yellow-400">emoji_events</span>
          </div>
          <h2 className="text-xl font-bold text-white">Personal Bests</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-5 animate-pulse h-36" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <span className="material-icons text-yellow-400">emoji_events</span>
          </div>
          <h2 className="text-xl font-bold text-white">Personal Bests</h2>
        </div>
        <p className="text-red-400 text-sm">Failed to load personal bests.</p>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <span className="material-icons text-yellow-400">emoji_events</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Personal Bests</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your heaviest lifts</p>
          </div>
        </div>
        {personalBests.length > 0 && (
          <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-yellow-500/30">
            {personalBests.length} Records
          </span>
        )}
      </div>

      {personalBests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="material-icons text-5xl text-white/10">emoji_events</span>
          </div>
          <p className="text-lg font-semibold text-white mb-1">No personal bests yet</p>
          <p className="text-sm text-slate-500">
            Log workouts with weights to start tracking your PRs!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {personalBests.map((pb, index) => (
            <PBCard key={pb.exerciseName} pb={pb} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}
