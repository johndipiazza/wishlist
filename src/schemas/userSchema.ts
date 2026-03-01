import { z } from 'zod'

export const UserSchema = z.object({
  uid: z.string(),
  email: z.email(),
  username: z.string(),
  createdAt: z.any(), // Firestore Timestamp
  friends: z.array(z.string()).default([]),
  wishlist: z.array(z.string()).default([]),
})

export type User = z.infer<typeof UserSchema>

export const FriendSchema = UserSchema.omit({ friends: true })

export type Friend = z.infer<typeof FriendSchema>
