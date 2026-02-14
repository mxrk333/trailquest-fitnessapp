import { Exercise, Set } from '@repo/shared'
import exercisesData from '@/data/exercises.json'

interface ExerciseRowProps {
  index: number
  exercise: Exercise
  onUpdate: (index: number, exercise: Exercise) => void
  onRemove: (index: number) => void
}

export function ExerciseRow({ index, exercise, onUpdate, onRemove }: ExerciseRowProps) {
  const handleNameChange = (newName: string) => {
    // Find matching exercise in JSON data
    const match = exercisesData.find(ex => ex.name.toLowerCase() === newName.toLowerCase())

    if (match) {
      // Auto-populate data
      onUpdate(index, {
        ...exercise,
        name: match.name, // Use exact casing from JSON
        muscles: match.muscles,
      })
    } else {
      // Just update name
      onUpdate(index, { ...exercise, name: newName })
    }
  }

  const handleAddSet = () => {
    const newSetNumber = exercise.sets.length + 1
    const previousSet = exercise.sets[exercise.sets.length - 1]

    const newSet: Set = {
      setNumber: newSetNumber,
      weight: previousSet ? previousSet.weight : 0,
      reps: previousSet ? previousSet.reps : 0,
      rpe: 8,
      completed: false,
    }

    onUpdate(index, {
      ...exercise,
      sets: [...exercise.sets, newSet],
    })
  }

  const handleUpdateSet = (setIndex: number, updatedSet: Set) => {
    const newSets = [...exercise.sets]
    newSets[setIndex] = updatedSet
    onUpdate(index, { ...exercise, sets: newSets })
  }

  return (
    <div className="bg-surface-dark/80 rounded-xl p-6 shadow-sm border border-primary/20 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-icons">fitness_center</span>
          </div>
          <div className="flex-grow relative">
            <input
              type="text"
              list={`exercise-suggestions-${index}`}
              value={exercise.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Exercise Name"
              className="text-lg font-bold text-white bg-transparent border-none focus:ring-0 p-0 w-full placeholder-gray-500"
            />
            <datalist id={`exercise-suggestions-${index}`}>
              {exercisesData.map(ex => (
                <option key={ex.id} value={ex.name} />
              ))}
            </datalist>
            <div className="flex items-center gap-2 mt-1">
              {/* Placeholder for tags - could be dynamic later */}
              {exercise.muscles?.map(m => (
                <span
                  key={m}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary capitalize"
                >
                  {m}
                </span>
              ))}
              {!exercise.muscles?.length && (
                <span className="text-xs text-gray-500">No muscle groups tagged</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10 self-end sm:self-auto"
        >
          <span className="material-icons">delete_outline</span>
        </button>
      </div>

      {/* Sets Header */}
      <div className="grid grid-cols-10 gap-4 mb-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
        <div className="col-span-1">Set</div>
        <div className="col-span-3">kg</div>
        <div className="col-span-3">Reps</div>
        <div className="col-span-2">RPE</div>
        <div className="col-span-1"></div>
      </div>

      {/* Set Rows */}
      <div className="space-y-3">
        {exercise.sets.map((set, setIndex) => (
          <div
            key={setIndex}
            className="grid grid-cols-10 gap-4 items-center bg-surface-darker/50 p-2 rounded-lg border border-transparent hover:border-primary/20 transition-all"
          >
            <div className="col-span-1 text-center font-bold text-gray-400">{set.setNumber}</div>
            <div className="col-span-3">
              <input
                type="number"
                value={set.weight}
                onChange={e =>
                  handleUpdateSet(setIndex, { ...set, weight: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-surface-dark border border-gray-700 rounded text-center py-1.5 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-white"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                value={set.reps}
                onChange={e =>
                  handleUpdateSet(setIndex, { ...set, reps: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-surface-dark border border-gray-700 rounded text-center py-1.5 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-white"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                max="10"
                value={set.rpe || ''}
                onChange={e =>
                  handleUpdateSet(setIndex, {
                    ...set,
                    rpe: parseFloat(e.target.value) || undefined,
                  })
                }
                className="w-full bg-surface-dark border border-gray-700 rounded text-center py-1.5 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-primary"
              />
            </div>
            <div className="col-span-1 text-center flex justify-center gap-1">
              <button
                onClick={() => handleUpdateSet(setIndex, { ...set, completed: !set.completed })}
                className={`transition-colors ${set.completed ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
              >
                <span className="material-icons text-base">check_circle</span>
              </button>
              {/* Optional delete set button if needed */}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleAddSet}
          className="text-xs font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary py-1.5 px-4 rounded-full transition-all flex items-center gap-1"
        >
          <span className="material-icons text-sm">add</span> Add Set
        </button>
      </div>
    </div>
  )
}
