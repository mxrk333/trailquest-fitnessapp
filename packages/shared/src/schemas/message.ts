import { z } from 'zod'

export const MessageSchema = z.object({
  id: z.string().optional(),
  participants: z.array(z.string()), // [uid1, uid2]
  senderId: z.string(),
  senderName: z.string().optional(),
  content: z.string().min(1, 'Message cannot be empty'),
  createdAt: z.any(), // Firestore Timestamp
  expiresAt: z.any(), // Firestore Timestamp
})

export type Message = z.infer<typeof MessageSchema>
