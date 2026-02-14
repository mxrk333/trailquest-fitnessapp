import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/providers/AuthProvider'
import {
  saveNutritionLog,
  getNutritionLogById,
  updateNutritionLog,
} from '@/features/nutrition/services/nutrition'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface NutritionLoggerProps {
  mode?: 'log' | 'assign'
  targetUserId?: string
}

export function NutritionLogger({ mode = 'log', targetUserId }: NutritionLoggerProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')

  const [loading, setLoading] = useState(false)
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fats, setFats] = useState('')
  const [water, setWater] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))

  // Fetch nutrition log data if editing
  const { data: editNutrition } = useQuery({
    queryKey: ['nutrition', editId],
    queryFn: async () => {
      if (!editId) return null
      return await getNutritionLogById(editId)
    },
    enabled: !!editId,
  })

  // Populate form when data arrives
  useEffect(() => {
    if (editNutrition) {
      setMealType(editNutrition.mealType)
      setCalories(editNutrition.calories.toString())
      setProtein(editNutrition.protein.toString())
      setCarbs(editNutrition.carbs.toString())
      setFats(editNutrition.fats.toString())
      setWater(editNutrition.water.toString())
      setNotes(editNutrition.notes || '')

      const d = new Date(editNutrition.timestamp)
      const formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setDate(formattedDate)
    }
  }, [editNutrition])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const nutritionData = {
        userId: targetUserId || user.uid,
        timestamp: new Date(date), // Pass Date object, simpler for service to handle
        mealType,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats),
        water: Number(water),
        notes,
        status: (mode === 'assign' ? 'pending' : 'completed') as 'pending' | 'completed' | 'missed',
        assignedBy: mode === 'assign' ? user.uid : editNutrition?.assignedBy || null,
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any

      if (editId) {
        await updateNutritionLog(editId, nutritionData)
        console.log('✅ Nutrition updated')
        await queryClient.invalidateQueries({ queryKey: ['nutrition', editId] })
        navigate(-1)
      } else {
        await saveNutritionLog(nutritionData)
        console.log('✅ Nutrition saved')
        if (mode === 'assign') {
          alert('Nutrition plan assigned successfully!')
          navigate(`/trainer/client/${targetUserId}`)
        } else {
          navigate('/')
        }
      }

      // Invalidate nutrition queries so dashboard updates immediately
      await queryClient.invalidateQueries({ queryKey: ['nutrition-today'] })
      await queryClient.invalidateQueries({ queryKey: ['recent-nutrition'] })
    } catch (error) {
      console.error('Failed to log nutrition:', error)
      alert('Failed to log nutrition. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-dark border border-primary/10 p-6 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-4">
        {editId ? 'Edit Nutrition Log' : 'Log Nutrition'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Meal Type</label>
          <select
            value={mealType}
            onChange={e =>
              setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack')
            }
            className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Calories</label>
            <input
              type="number"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              placeholder="500"
              className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Protein (g)</label>
            <input
              type="number"
              value={protein}
              onChange={e => setProtein(e.target.value)}
              placeholder="30"
              className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Carbs (g)</label>
            <input
              type="number"
              value={carbs}
              onChange={e => setCarbs(e.target.value)}
              placeholder="60"
              className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Fats (g)</label>
            <input
              type="number"
              value={fats}
              onChange={e => setFats(e.target.value)}
              placeholder="15"
              className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Water (L)</label>
          <input
            type="number"
            step="0.1"
            value={water}
            onChange={e => setWater(e.target.value)}
            placeholder="0.5"
            className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Chicken breast with rice and vegetables"
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
            'Update Log'
          ) : mode === 'assign' ? (
            'Assign Nutrition Plan'
          ) : (
            'Save Log'
          )}
        </button>
      </form>
    </div>
  )
}
