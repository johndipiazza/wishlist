import {
  List,
  ListItem,
  ListItemText,
  Box,
  IconButton,
  Typography,
  Button,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'

interface UserWishlistProps {
  userWishlist: string[]
  onAddClick: () => void
  onEditClick: (item: string) => void
  onDeleteItem: (item: string) => void
}

export default function UserWishlist({
  userWishlist,
  onAddClick,
  onEditClick,
  onDeleteItem,
}: UserWishlistProps) {
  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" gutterBottom sx={{ m: 0 }}>
          My Wishlist
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddClick}
        >
          Add Item
        </Button>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {userWishlist.map((item) => (
          <ListItem key={item} disablePadding>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <ListItemText primary={item} sx={{ flex: 1 }} />
              <IconButton size="small" onClick={() => onEditClick(item)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDeleteItem(item)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </ListItem>
        ))}
        </List>
      </Box>
    </>
  )
}
