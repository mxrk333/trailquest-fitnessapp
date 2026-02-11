import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { saveNutritionLog } from '@/services/firestore/nutrition'

export function NutritionLogger() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    calories: string
    protein: string
    carbs: string
    fats: string
    water: string
    notes: string
  }>({
    mealType: 'lunch',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    water: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)
      await saveNutritionLog({
        userId: user.uid,
        timestamp: new Date(),
        mealType: formData.mealType,
        calories: parseFloat(formData.calories) || 0,
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fats: parseFloat(formData.fats) || 0,
        water: parseFloat(formData.water) || 0,
        notes: formData.notes,
      })

      // Reset form
      setFormData({
        mealType: 'lunch',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        water: '',
        notes: '',
      })

      alert('Nutrition logged successfully!')
    } catch (error) {
      console.error('Failed to log nutrition:', error)
      alert('Failed to log nutrition. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-dark border border-primary/10 p-6 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-4">Log Nutrition</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Meal Type</label>
          <select
            value={formData.mealType}
            onChange={e =>
              setFormData({
                ...formData,
                mealType: e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack',
              })
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
              value={formData.calories}
              onChange={e => setFormData({ ...formData, calories: e.target.value })}
              placeholder="500"
              className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Protein (g)</label>
            <input
              type="number"
              value={formData.protein}
              onChange={e => setFormData({ ...formData, protein: e.target.value })}
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
              value={formData.carbs}
              onChange={e => setFormData({ ...formData, carbs: e.target.value })}
              placeholder="60"
              className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Fats (g)</label>
            <input
              type="number"
              value={formData.fats}
              onChange={e => setFormData({ ...formData, fats: e.target.value })}
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
            value={formData.water}
            onChange={e => setFormData({ ...formData, water: e.target.value })}
            placeholder="0.5"
            className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Chicken breast with rice and vegetables"
            rows={3}
            className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging...' : 'Log Meal'}
        </button>
      </form>
    </div>
  )
}
