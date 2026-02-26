import { useState } from 'react'
import { Box, TextField, List, ListItem, ListItemText, ListItemButton, Typography } from '@mui/material'

interface FriendSidebarProps {
  friends: string[]
  currentUser: string
  onSelect?: (name: string) => void
  onSelectCurrentUser?: () => void
}

export default function FriendSidebar({ friends, currentUser, onSelect, onSelectCurrentUser }: FriendSidebarProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = friends.filter(f =>
    f.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <Box
      sx={{
        width: 240,
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        My Wishlist
      </Typography>
      <ListItemButton
        selected={selected === currentUser}
        onClick={() => {
          setSelected(currentUser)
          onSelectCurrentUser && onSelectCurrentUser()
        }}
        sx={{ mb: 2, border: 1, borderColor: 'divider', borderRadius: 1, flexGrow: 0 }}
      >
        <ListItemText sx={{display: 'flex', alignItems: 'center', gap: 1}} primary={currentUser} secondary="(Your wishlist)" />
      </ListItemButton>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Friends
      </Typography>
      <TextField
        size="small"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="outlined"
      />
      <List sx={{ mt: 1, flex: 1, overflow: 'auto' }}>
        {filtered.map((name) => (
          <ListItem key={name} disablePadding>
            <ListItemButton
              selected={selected === name}
              onClick={() => {
                setSelected(name)
                onSelect && onSelect(name)
              }}
            >
              <ListItemText primary={name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
