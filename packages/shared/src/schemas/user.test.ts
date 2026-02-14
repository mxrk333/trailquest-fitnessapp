import { describe, it, expect } from 'vitest'
import { UserSchema, UserRoleSchema, FitnessLevelSchema } from './user'

describe('UserRoleSchema', () => {
  it('accepts valid roles', () => {
    expect(UserRoleSchema.safeParse('trainee').success).toBe(true)
    expect(UserRoleSchema.safeParse('hiker').success).toBe(true)
    expect(UserRoleSchema.safeParse('trainer').success).toBe(true)
    expect(UserRoleSchema.safeParse('admin').success).toBe(true)
  })

  it('rejects invalid roles', () => {
    expect(UserRoleSchema.safeParse('student').success).toBe(false)
    expect(UserRoleSchema.safeParse('').success).toBe(false)
  })
})

describe('FitnessLevelSchema', () => {
  it('accepts valid fitness levels', () => {
    expect(FitnessLevelSchema.safeParse('beginner').success).toBe(true)
    expect(FitnessLevelSchema.safeParse('intermediate').success).toBe(true)
    expect(FitnessLevelSchema.safeParse('advanced').success).toBe(true)
  })

  it('rejects invalid fitness levels', () => {
    expect(FitnessLevelSchema.safeParse('expert').success).toBe(false)
  })
})

describe('UserSchema', () => {
  const validUser = {
    uid: '123',
    email: 'test@example.com',
    createdAt: new Date(),
  }

  it('validates a minimal user (uid + email)', () => {
    const result = UserSchema.safeParse(validUser)
    expect(result.success).toBe(true)
  })

  it('validates a complete trainee/hiker profile', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      displayName: 'Alex Venture',
      role: 'hiker',
      age: 25,
      weight: 75,
      height: 180,
      fitnessLevel: 'intermediate',
      onboardingCompleted: true,
    })
    expect(result.success).toBe(true)
  })

  it('validates a complete trainer profile with credentials', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      displayName: 'Coach Smith',
      role: 'trainer',
      isApproved: false,
      age: 35,
      weight: 80,
      height: 175,
      certifications: 'NASM CPT, ACE Certified',
      specialization: 'strength_training',
      onboardingCompleted: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing uid', () => {
    const result = UserSchema.safeParse({
      email: 'test@example.com',
      createdAt: new Date(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'invalid-email',
      createdAt: new Date(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid role value', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      role: 'superuser',
    })
    expect(result.success).toBe(false)
  })

  it('allows optional fields to be omitted', () => {
    const result = UserSchema.safeParse(validUser)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.displayName).toBeUndefined()
      expect(result.data.role).toBeUndefined()
      expect(result.data.age).toBeUndefined()
      expect(result.data.onboardingCompleted).toBeUndefined()
      expect(result.data.certifications).toBeUndefined()
      expect(result.data.specialization).toBeUndefined()
    }
  })

  it('accepts onboardingCompleted as boolean', () => {
    const resultTrue = UserSchema.safeParse({ ...validUser, onboardingCompleted: true })
    const resultFalse = UserSchema.safeParse({ ...validUser, onboardingCompleted: false })
    expect(resultTrue.success).toBe(true)
    expect(resultFalse.success).toBe(true)
  })

  it('rejects non-boolean onboardingCompleted', () => {
    const result = UserSchema.safeParse({ ...validUser, onboardingCompleted: 'yes' })
    expect(result.success).toBe(false)
  })

  it('accepts certifications as a string', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      certifications: 'NASM CPT, CSCS',
    })
    expect(result.success).toBe(true)
  })

  it('accepts specialization as a string', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      specialization: 'hiking_outdoor',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid photoURL', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      photoURL: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid photoURL', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      photoURL: 'https://example.com/photo.jpg',
    })
    expect(result.success).toBe(true)
  })
})
