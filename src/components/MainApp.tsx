import { useState } from 'react'
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
  const friends = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eric']
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const [currentLoggedInUser] = useState<string>('John')  // The currently logged in user
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const wishlists: Record<string, string[]> = {
    Alice: ['New laptop', 'Noise-cancelling headphones', 'Backpack'],
    Bob: ['Electric guitar', 'Guitar picks', 'Amp'],
    Charlie: ['Cooking class', 'Mixer', 'Knife set'],
    Diana: ['Yoga mat', 'Meditation cushion'],
    Eric: ['Gaming chair', 'Mechanical keyboard'],
    [currentLoggedInUser]: ['Reading lamp', 'Coffee maker', ],
  }
  const [userWishlist, setUserWishlist] = useState<string[]>(wishlists[currentLoggedInUser] || [])


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

  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [itemSupporters, setItemSupporters] = useState<Record<string, string[]>>({})
  const [currentUser] = useState<string>('You')
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false)
  const [addFormTitle, setAddFormTitle] = useState<string>('')
  const [addFormDescription, setAddFormDescription] = useState<string>('')
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const toggleItem = (item: string) => {
    setExpandedItem(prev => (prev === item ? null : item))
  }

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
            onClick={onLogout}
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
              friends={friends}
              currentUser={currentLoggedInUser}
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
            friends={friends}
            currentUser={currentLoggedInUser}
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
