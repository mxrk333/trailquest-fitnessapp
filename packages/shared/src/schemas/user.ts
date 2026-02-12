import { z } from 'zod'

export const UserRoleSchema = z.enum(['trainee', 'hiker', 'trainer', 'admin'])
export const FitnessLevelSchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  role: UserRoleSchema.optional(), // Optional initially, set during onboarding
  isApproved: z.boolean().optional(), // For trainers: true if approved by admin
  trainerId: z.string().optional(), // ID of the assigned trainer
  pendingTrainerId: z.string().optional(), // ID of trainer requested by trainee
  fitnessLevel: FitnessLevelSchema.optional(),
  age: z.number().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  createdAt: z.any(), // Firebase Timestamp
  updatedAt: z.any(),
})

export type User = z.infer<typeof UserSchema>
export type UserRole = z.infer<typeof UserRoleSchema>
export type FitnessLevel = z.infer<typeof FitnessLevelSchema>
