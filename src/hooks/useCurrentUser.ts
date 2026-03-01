import { useState, useEffect } from 'react'
import { auth, db } from '../assets/firebase'
import { onSnapshot, doc, getDoc } from 'firebase/firestore'
import { UserSchema, FriendSchema, type User, type Friend } from '../schemas/schemas'

/**
 * Hook that returns the current authenticated user's document and their friends list.
 * The returned values update in real time.
 */
export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])

  useEffect(() => {
    if (!auth.currentUser?.uid) return

    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), async (snapshot) => {
      if (!snapshot.exists()) return

      try {
        const userData = snapshot.data()
        const validatedUser = UserSchema.parse(userData)
        setCurrentUser(validatedUser)

        const friendIds = validatedUser.friends || []
        const friendsList: Friend[] = []
        for (const friendId of friendIds) {
          const friendDoc = await getDoc(doc(db, 'users', friendId))
          if (friendDoc.exists()) {
            const validatedFriend = FriendSchema.parse(friendDoc.data())
            friendsList.push(validatedFriend)
          }
        }
        setFriends(friendsList)
      } catch (err) {
        console.error('Failed to validate user data:', err)
      }
    })

    return () => unsub()
  }, [])

  return { currentUser, friends }
}
