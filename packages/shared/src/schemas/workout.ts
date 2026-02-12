import { z } from 'zod'

export const SetSchema = z.object({
  setNumber: z.number(),
  weight: z.number(),
  reps: z.number(),
  rpe: z.number().optional(),
  completed: z.boolean().default(false),
})

export const ExerciseSchema = z.object({
  name: z.string(),
  muscles: z.array(z.string()).optional(),
  sets: z.array(SetSchema).default([]),
})

export const WorkoutStatusSchema = z.enum(['completed', 'partial', 'skipped', 'pending', 'missed'])

export const WorkoutSchema = z.object({
  userId: z.string(),
  timestamp: z.date(),
  name: z.string().optional(),
  exercises: z.array(ExerciseSchema),
  isRestDay: z.boolean().default(false),
  notes: z.string().optional(),
  status: WorkoutStatusSchema.default('completed'), // completed, partial, skipped, pending, missed
  assignedBy: z.string().optional(), // Trainer ID
})

export type Set = z.infer<typeof SetSchema>
export type Exercise = z.infer<typeof ExerciseSchema>
export type Workout = z.infer<typeof WorkoutSchema>
export type WorkoutStatus = z.infer<typeof WorkoutStatusSchema>
