import { z } from 'zod'

export const WishlistItemSchema = z.object({
  id: z.string(),
  user: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.any(),
})

export const UserSchema = z.object({
  uid: z.string(),
  email: z.email(),
  username: z.string(),
  createdAt: z.any(), // Firestore Timestamp
  friends: z.array(z.string()).default([]),
  wishlist: z.array(WishlistItemSchema).default([]),
})

export type User = z.infer<typeof UserSchema>
export type WishlistItem = z.infer<typeof WishlistItemSchema>

export const FriendSchema = UserSchema.omit({ friends: true, wishlist: true })

export type Friend = z.infer<typeof FriendSchema>
