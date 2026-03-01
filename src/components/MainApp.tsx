import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth, db } from '../assets/firebase'
import { doc, getDoc, collection } from 'firebase/firestore'
import { UserSchema, FriendSchema, type User, type Friend } from '../schemas/userSchema'
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

  // Fetch current user data and friends from Firestore
  useEffect(() => {
    const fetchUserDataAndFriends = async () => {
      if (!auth.currentUser?.uid) return
      
      try {
        // Get current user's document
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
        if (!userDoc.exists()) return
        
        const userData = userDoc.data()
        const validatedUser = UserSchema.parse(userData)
        setCurrentLoggedInUser(validatedUser)
        
        const friendIds = validatedUser.friends || []
        
        // Fetch each friend's data
        const friendsList: Friend[] = []
        for (const friendId of friendIds) {
          const friendDoc = await getDoc(doc(db, 'users', friendId))
          if (friendDoc.exists()) {
            const validatedFriend = FriendSchema.parse(friendDoc.data())
            friendsList.push(validatedFriend)
          }
        }
        
        setFriends(friendsList)
      } catch (error) {
        console.error('Error fetching user data and friends:', error)
      }
    }
    
    fetchUserDataAndFriends()
  }, [])

  const wishlists: Record<string, string[]> = {
    ...(currentLoggedInUser ? { [currentLoggedInUser.username]: ['Reading lamp', 'Coffee maker', ] } : {}),
  }

  const [userWishlist, setUserWishlist] = useState<string[]>(currentLoggedInUser ? wishlists[currentLoggedInUser.username] || [] : [])

  // extra details for each wishlist item
  const itemDetails: Record<string, string> = {
    'New laptop': 'Looking for a 16" model with M1 chip.',
    'Noise-cancelling headphones': 'Prefer over-ear, Bluetooth support.',
    Backpack: 'Needs to fit a 15" laptop and accessories.',
    'Electric guitar': 'Fender Stratocaster style, used is fine.',
    'Guitar picks': 'Variety pack, heavy gauge.',
    Amp: 'Small practice amp, 20W or less.',
    'Cooking class': 'Italian cuisine preferred.',
    Mixer: 'Stand mixer with dough hook.',
    'Knife set': 'High-quality stainless steel blades.',
    'Yoga mat': 'Non-slip, eco friendly material.',
    'Meditation cushion': 'Firm and supportive.',
    'Gaming chair': 'Ergonomic with lumbar support.',
    'Mechanical keyboard': 'Cherry MX switches, RGB backlight.',
  }

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

  const updateUserWishlistItem = (oldItem: string, newItem: string) => {
    if (newItem.trim()) {
      setUserWishlist(prev => prev.map(item => item === oldItem ? newItem.trim() : item))
    }
  }

  const deleteUserWishlistItem = (item: string) => {
    setUserWishlist(prev => prev.filter(i => i !== item))
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
                itemDetails={itemDetails}
                onAddClick={handleAddModalOpen}
                onEditClick={(item) => {
                  setEditingItem(item)
                  setAddFormTitle(item)
                  setAddFormDescription(itemDetails[item] || '')
                  setAddModalOpen(true)
                }}
                onDeleteItem={deleteUserWishlistItem}
              />
            ) : selectedFriend ? (
              <Wishlist
                friendName={selectedFriend}
                items={wishlists[selectedFriend] || []}
                itemDetails={itemDetails}
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
          onSubmit={(title, description) => {
            if (editingItem) {
              updateUserWishlistItem(editingItem, title)
            } else {
              setUserWishlist(prev => [...prev, title.trim()])
            }
            handleAddModalClose()
          }}
          title={addFormTitle}
          description={addFormDescription}
          onTitleChange={setAddFormTitle}
          onDescriptionChange={setAddFormDescription}
        />
      </Box>
    </Box>
  )
}
