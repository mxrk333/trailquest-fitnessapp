import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/providers/AuthProvider'
import { saveRestDay, getRestDayById, updateRestDay } from '@/features/rest-days/services/restDays'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface RestDayLoggerProps {
  mode?: 'log' | 'assign'
  targetUserId?: string
}

export function RestDayLogger({ mode = 'log', targetUserId }: RestDayLoggerProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')

  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'complete_rest' | 'active_recovery'>('complete_rest')
  const [activities, setActivities] = useState<string[]>([])
  const [newActivity, setNewActivity] = useState('')
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))

  const { data: editRest } = useQuery({
    queryKey: ['rest-day', editId],
    queryFn: async () => {
      if (!editId) return null
      return await getRestDayById(editId)
    },
    enabled: !!editId,
  })

  // Populate form when data arrives
  useEffect(() => {
    if (editRest) {
      setType(editRest.type)
      setActivities(editRest.activities || [])
      setNotes(editRest.notes || '')
      setDuration(editRest.duration?.toString() || '')

      const d = new Date(editRest.timestamp)
      const formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setDate(formattedDate)
    }
  }, [editRest])

  const addActivity = () => {
    if (newActivity.trim()) {
      setActivities([...activities, newActivity.trim()])
      setNewActivity('')
    }
  }

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const restData = {
        userId: targetUserId || user.uid,
        timestamp: new Date(date),
        type,
        activities: type === 'active_recovery' ? activities : [],
        duration: type === 'active_recovery' ? Number(duration) : null,
        notes,
        status: (mode === 'assign' ? 'pending' : 'completed') as 'pending' | 'completed' | 'missed',
        assignedBy: mode === 'assign' ? user.uid : editRest?.assignedBy || null,
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any

      if (editId) {
        await updateRestDay(editId, restData)
        console.log('✅ Rest day updated')
        navigate(-1)
      } else {
        await saveRestDay(restData)
        console.log('✅ Rest day saved')
        if (mode === 'assign') {
          alert('Rest day assigned successfully!')
          navigate(`/trainer/client/${targetUserId}`)
        } else {
          navigate('/')
        }
      }

      // Invalidate queries so dashboard updates immediately
      await queryClient.invalidateQueries({ queryKey: ['recent-rest-days'] })
      navigate('/')
    } catch (error) {
      console.error('Failed to log rest day:', error)
      alert('Failed to log rest day. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-dark border border-primary/10 p-6 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-4">
        {editId ? 'Edit Rest Day' : 'Log Rest Day'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Rest Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('complete_rest')}
              className={`py-3 px-4 rounded-lg border transition-colors ${
                type === 'complete_rest'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-background-dark border-white/10 text-gray-400 hover:border-primary/50'
              }`}
            >
              <div className="font-bold">Complete Rest</div>
              <div className="text-xs mt-1">No physical activity</div>
            </button>
            <button
              type="button"
              onClick={() => setType('active_recovery')}
              className={`py-3 px-4 rounded-lg border transition-colors ${
                type === 'active_recovery'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-background-dark border-white/10 text-gray-400 hover:border-primary/50'
              }`}
            >
              <div className="font-bold">Active Recovery</div>
              <div className="text-xs mt-1">Light activity</div>
            </button>
          </div>
        </div>

        {type === 'active_recovery' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Activities</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newActivity}
                  onChange={e => setNewActivity(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addActivity())}
                  placeholder="e.g., Yoga, Walking, Stretching"
                  className="flex-1 bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={addActivity}
                  className="bg-primary/20 text-primary px-4 rounded-lg hover:bg-primary/30 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activities.map((activity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    {activity}
                    <button
                      type="button"
                      onClick={() => removeActivity(idx)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <span className="material-icons text-xs">close</span>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="30"
                className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How are you feeling? Any soreness?"
            rows={3}
            className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-green-400 text-background-dark font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
          ) : editId ? (
            'Update Rest Day'
          ) : mode === 'assign' ? (
            'Assign Rest Day'
          ) : (
            'Log Rest Day'
          )}
        </button>
      </form>
    </div>
  )
}
