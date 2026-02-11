import { z } from 'zod'

export const HikeSchema = z.object({
  userId: z.string(),
  timestamp: z.date(),
  distance: z.number().min(0), // in miles or km
  elevationGain: z.number().min(0), // in feet or meters
  duration: z.number().min(0), // in minutes
  trail: z.string().optional(), // Trail name
  activeMuscles: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export type Hike = z.infer<typeof HikeSchema>
