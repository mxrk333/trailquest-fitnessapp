import { z } from 'zod'

export const HikeSchema = z.object({
  userId: z.string(),
  timestamp: z.date(),
  distance: z.number().min(0), // in miles or km
  elevationGain: z.number().min(0), // in feet or meters
  duration: z.number().min(0), // in minutes
  mountain: z.string().optional(), // Mountain name
  activeMuscles: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.enum(['completed', 'pending', 'missed']).default('completed'),
  assignedBy: z.string().optional(), // Trainer ID
})

export type Hike = z.infer<typeof HikeSchema>
