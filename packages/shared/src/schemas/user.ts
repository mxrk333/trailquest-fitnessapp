import { z } from 'zod'

export const UserRoleSchema = z.enum(['trainee', 'trainer'])
export const FitnessLevelSchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  role: UserRoleSchema.optional(), // Optional initially, set during onboarding
  fitnessLevel: FitnessLevelSchema.optional(),
  createdAt: z.any(), // Firebase Timestamp
  updatedAt: z.any(),
})

export type User = z.infer<typeof UserSchema>
export type UserRole = z.infer<typeof UserRoleSchema>
export type FitnessLevel = z.infer<typeof FitnessLevelSchema>
