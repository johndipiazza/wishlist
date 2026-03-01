import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth, db } from '../assets/firebase'
import { doc, getDoc, collection, onSnapshot, updateDoc, serverTimestamp, getDocs, addDoc, deleteDoc, query, where } from 'firebase/firestore'
import { UserSchema, FriendSchema, type User, type Friend, type WishlistItem } from '../schemas/userSchema'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Paper,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import FriendSidebar from './FriendSidebar'
import Wishlist from './Wishlist'
import AddItemModal from './AddItemModal'

interface MainAppProps {
  onLogout: () => void
}

export default function MainApp({ onLogout }: MainAppProps) {
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState<User | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Listen to current user document for live updates
  useEffect(() => {
    if (!auth.currentUser?.uid) return

    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), async (snapshot) => {
      if (!snapshot.exists()) return

      try {
        const userData = snapshot.data()
        const validatedUser = UserSchema.parse(userData)
        setCurrentLoggedInUser(validatedUser)

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

  const [userWishlist, setUserWishlist] = useState<WishlistItem[]>([])
  const [friendWishlist, setFriendWishlist] = useState<WishlistItem[]>([])

  const setupWishlistListener = (userId: string, setItems: (items: WishlistItem[]) => void) => {
    const q = query(collection(db, 'wishlistItems'), where('user', '==', userId))
    const unsub = onSnapshot(q, (snapshot) => {
      const items: WishlistItem[] = []
      snapshot.forEach(docSnap => {
        const data = docSnap.data()
        items.push({ ...(data as any), id: docSnap.id })
      })
      setItems(items)
    }, (err) => console.error('wishlistItems listener error', err))

    return unsub
  }

  // Listen to wishlistItems collection for current user (live updates)
  useEffect(() => {
    if (!auth.currentUser?.uid) return
    const unsub = setupWishlistListener(auth.currentUser.uid, setUserWishlist)
    return () => unsub()
  }, [auth.currentUser?.uid])

  // Listen to selected friend's wishlist items
  useEffect(() => {
    if (!selectedFriend) {
      setFriendWishlist([])
      return
    }
    
    // Find the friend's UID from the friends list
    const friend = friends.find(f => f.username === selectedFriend)
    if (!friend?.uid) return
    
    const unsub = setupWishlistListener(friend.uid, setFriendWishlist)
    return () => unsub()
  }, [selectedFriend, friends])

  const [itemSupporters, setItemSupporters] = useState<Record<string, string[]>>({})
  const [currentUser] = useState<string>('You')
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false)
  const [addFormTitle, setAddFormTitle] = useState<string>('')
  const [addFormDescription, setAddFormDescription] = useState<string>('')
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const addToItem = (item: string) => {
    setItemSupporters((prev: Record<string, string[]>) => ({
      ...prev,
      [item]: [...(prev[item] || []), currentUser],
    }))
  }

  const removeFromItem = (item: string) => {
    setItemSupporters((prev: Record<string, string[]>) => ({
      ...prev,
      [item]: (prev[item] || []).filter((name: string) => name !== currentUser),
    }))
  }

  // Firestore-backed wishlist operations
  const submitWishlistItem = async (title: string, description: string) => {
    if (!auth.currentUser) return
    // const userRef = doc(db, 'users', auth.currentUser.uid)

    try {
      if (editingItem) {
        // editing by id
        const itemRef = doc(db, 'wishlistItems', editingItem)
        await updateDoc(itemRef, { title: title.trim(), description: description?.trim() || '', updatedAt: serverTimestamp() })
      } else {
        await addDoc(collection(db, 'wishlistItems'), { title: title.trim(), description: description?.trim() || '', user: auth.currentUser.uid, createdAt: serverTimestamp() })
      }
    } catch (err) {
      console.error('Failed to submit wishlist item:', err)
    } finally {
      handleAddModalClose()
      setEditingItem(null)
      setAddFormTitle('')
      setAddFormDescription('')
    }
  }

  const deleteUserWishlistItem = async (itemId: string) => {
    if (!auth.currentUser) return
    try {
      await deleteDoc(doc(db, 'wishlistItems', itemId))
    } catch (err) {
      console.error('Failed to delete wishlist item:', err)
    }
  }


  const handleAddModalOpen = () => {
    setEditingItem(null)
    setAddFormTitle('')
    setAddFormDescription('')
    setAddModalOpen(true)
  }

  const handleAddModalClose = () => {
    setAddModalOpen(false)
    setAddFormTitle('')
    setAddFormDescription('')
    setEditingItem(null)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f9fafb' }}>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isSmall && (
              <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div">
              Wishlist
            </Typography>
          </Box>
          <Button
            color="inherit"
            onClick={async () => {
              await signOut(auth)
              onLogout()
            }}
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {isSmall ? (
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            ModalProps={{ keepMounted: true }}
          >
            <FriendSidebar
              friends={friends.map(friend => friend.username)}
              currentUser={currentLoggedInUser?.username || 'User'}
              onSelect={(name) => {
                setSelectedFriend(name)
                setDrawerOpen(false)
              }}
              onSelectCurrentUser={() => {
                setSelectedFriend(null)
                setDrawerOpen(false)
              }}
            />
          </Drawer>
        ) : (
          <FriendSidebar
            friends={friends.map(friend => friend.username)}
            currentUser={currentLoggedInUser?.username || 'User'}
            onSelect={setSelectedFriend}
            onSelectCurrentUser={() => setSelectedFriend(null)}
          />
        )}
        <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {selectedFriend === null ? (
              <Wishlist
                items={userWishlist}
                onAddClick={handleAddModalOpen}
                onEditClick={itemId => {
                  const existingItem = userWishlist.find(item => item.id === itemId);
                  if (!existingItem) return
                  setEditingItem(existingItem.id)
                  setAddFormTitle(existingItem.title)
                  setAddFormDescription(existingItem.description || '')
                  setAddModalOpen(true)
                }}
                onDeleteItem={deleteUserWishlistItem}
              />
            ) : selectedFriend ? (
              <Wishlist
                friendName={selectedFriend}
                items={friendWishlist}
                supporters={itemSupporters}
                currentUser={currentUser}
                onAddSupporter={addToItem}
                onRemoveSupporter={removeFromItem}
              />
            ) : (
              <Typography variant="h5">Select a friend or open your wishlist from the sidebar</Typography>
            )}
          </Paper>
        </Container>

        <AddItemModal
          open={addModalOpen}
          onClose={handleAddModalClose}
          isEditing={!!editingItem}
          onSubmit={(title, description) => submitWishlistItem(title, description)}
          title={addFormTitle}
          description={addFormDescription}
          onTitleChange={setAddFormTitle}
          onDescriptionChange={setAddFormDescription}
        />
      </Box>
    </Box>
  )
}
