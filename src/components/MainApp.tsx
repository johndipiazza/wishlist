import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../assets/firebase'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useWishlistItems, addWishlistItem, updateWishlistItem, deleteWishlistItem } from '../hooks/useWishlistItems'
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
  const { currentUser: currentLoggedInUser, friends } = useCurrentUser()
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)


  // wishlist for current user pulled via hook
  const userWishlist = useWishlistItems(auth.currentUser?.uid || '')

  // compute selected friend's uid then use hook
  const selectedFriendUid = selectedFriend ? friends.find(f => f.username === selectedFriend)?.uid : undefined
  const friendWishlist = useWishlistItems(selectedFriendUid)


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

  // Firestore-backed wishlist operations via service helpers
  const submitWishlistItem = async (title: string, description: string) => {
    if (!auth.currentUser) return

    try {
      if (editingItem) {
        await updateWishlistItem(editingItem, title.trim(), description.trim())
      } else {
        await addWishlistItem(auth.currentUser.uid, title.trim(), description.trim())
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
    try {
      await deleteWishlistItem(itemId)
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
