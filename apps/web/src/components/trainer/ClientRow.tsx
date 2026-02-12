import { User } from '@repo/shared'
import { useClientMetrics } from '@/hooks/useClientMetrics'
import { useNavigate } from 'react-router-dom'
import { useChat } from '@/providers/ChatProvider'

interface ClientRowProps {
  client: User
}

export function ClientRow({ client }: ClientRowProps) {
  const { data: metrics, isLoading } = useClientMetrics(client.uid)
  const navigate = useNavigate()
  const { openChat } = useChat()

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation()
    openChat({ uid: client.uid, displayName: client.displayName || 'Client' })
  }

  if (isLoading) {
    return (
      <tr className="hover:bg-white/5 transition-colors">
        <td className="px-6 py-4" colSpan={6}>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </div>
        </td>
      </tr>
    )
  }

  const formatLastActive = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getMuscleLoadColor = (load: number) => {
    if (load > 85) return 'text-red-400'
    if (load > 50) return 'text-orange-400'
    return 'text-primary'
  }

  return (
    <tr
      onClick={() => navigate(`/trainer/client/${client.uid}`)}
      className="hover:bg-white/5 transition-all cursor-pointer group"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/30">
            <img
              src={
                client.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(client.displayName || 'User')}&background=13EC5B&color=0a0f0d&bold=true`
              }
              alt={client.displayName || 'User'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-semibold text-white group-hover:text-primary transition-colors">
              {client.displayName || 'Unknown User'}
            </div>
            <div className="text-xs text-gray-500">{client.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-300 capitalize font-medium">{client.role || 'trainee'}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-400">{formatLastActive(metrics?.lastActiveDate || null)}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-black/30 rounded-full h-2 overflow-hidden border border-white/10">
            <div
              className={`h-full ${getMuscleLoadColor(metrics?.muscleLoad || 0)} bg-current transition-all duration-500 shadow-lg`}
              style={{ width: `${metrics?.muscleLoad || 0}%` }}
            ></div>
          </div>
          <span
            className={`text-xs font-bold ${getMuscleLoadColor(metrics?.muscleLoad || 0)} min-w-[3rem] text-right`}
          >
            {metrics?.muscleLoad || 0}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        {metrics?.status === 'Active' ? (
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/30">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Inactive
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleMessage}
            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110 mr-2"
            title="Message Client"
          >
            <span className="material-icons">chat</span>
          </button>
          <span className="material-icons text-slate-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            arrow_forward
          </span>
        </div>
      </td>
    </tr>
  )
}
