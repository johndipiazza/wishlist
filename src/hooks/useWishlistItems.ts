import { useState, useEffect } from 'react'
import { db } from '../assets/firebase'
import { collection, query, where, onSnapshot, serverTimestamp, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { type WishlistItem } from '../schemas/schemas'

/**
 * Real-time list of wishlist items for the specified user ID.
 * Returns the items array and a setter for manual modifications if needed.
 */
export function useWishlistItems(userId?: string) {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    if (!userId) {
      setItems([])
      return
    }

    const q = query(collection(db, 'wishlistItems'), where('user', '==', userId))
    const unsub = onSnapshot(q, (snapshot) => {
      const arr: WishlistItem[] = []
      snapshot.forEach(docSnap => {
        const data = docSnap.data()
        arr.push({ ...(data as any), id: docSnap.id })
      })
      setItems(arr)
    }, (err) => console.error('wishlistItems listener error', err))

    return () => unsub()
  }, [userId])

  return items
}

// helper CRUD functions attached as simple exports
export async function addWishlistItem(userId: string, title: string, description: string) {
  return addDoc(collection(db, 'wishlistItems'), { title, description, user: userId, createdAt: serverTimestamp() })
}

export async function updateWishlistItem(itemId: string, title: string, description: string) {
  const itemRef = doc(db, 'wishlistItems', itemId)
  return updateDoc(itemRef, { title, description, updatedAt: serverTimestamp() })
}

export async function deleteWishlistItem(itemId: string) {
  const itemRef = doc(db, 'wishlistItems', itemId)
  return deleteDoc(itemRef)
}
