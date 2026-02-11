import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { UserSchema } from '@repo/shared'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
})

export const userRouter = router({
  create: publicProcedure
    .input(CreateUserSchema)
    .output(UserSchema)
    .mutation(({ input }) => ({
      uid: 'dummy-id',
      email: input.email,
      displayName: input.name,
      role: 'trainee',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),

  byId: publicProcedure
    .input(z.string())
    .output(UserSchema)
    .query(({ input }) => ({
      uid: input,
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'trainee',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),

  list: publicProcedure.output(z.array(UserSchema)).query(() => [
    {
      uid: 'user-1',
      email: 'user1@example.com',
      displayName: 'User One',
      role: 'trainee',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      uid: 'user-2',
      email: 'user2@example.com',
      displayName: 'User Two',
      role: 'trainer',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
})
