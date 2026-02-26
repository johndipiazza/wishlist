import { useState } from 'react'
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  Box,
  IconButton,
  Chip,
  Typography,
  Button,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'

interface WishlistProps {
  // common props
  items: string[]
  itemDetails?: Record<string, string>

  // friend-specific
  friendName?: string
  supporters?: Record<string, string[]>
  currentUser?: string
  onAddSupporter?: (item: string) => void
  onRemoveSupporter?: (item: string) => void

  // user-specific (CRUD)
  onAddClick?: () => void
  onEditClick?: (item: string) => void
  onDeleteItem?: (item: string) => void

  // explicit title override
  title?: string
}

export default function Wishlist({
  items,
  itemDetails = {},
  friendName,
  supporters = {},
  currentUser,
  onAddSupporter,
  onRemoveSupporter,
  onAddClick,
  onEditClick,
  onDeleteItem,
  title,
}: WishlistProps) {
  const isFriendView = Boolean(friendName)
  const headerText = isFriendView
    ? `${friendName}'s Wishlist`
    : title || 'My Wishlist'

  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const toggleItem = (item: string) => {
    setExpandedItem(prev => (prev === item ? null : item))
  }

  const hasUserAdded = (item: string) => {
    return currentUser ? supporters[item]?.includes(currentUser) ?? false : false
  }

  return (
    <>
      <Box
        sx={{
          mb: isFriendView ? 0 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ m: 0 }}>
          {headerText}
        </Typography>
        {!isFriendView && onAddClick && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddClick}>
            Add Item
          </Button>
        )}
      </Box>

      <List>
        {(items || []).map(item => (
          <ListItem
            key={item}
            disablePadding
            sx={{
              flexDirection: 'column',
              alignItems: 'stretch',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemButton onClick={() => toggleItem(item)}>
              <ListItemText primary={item} />
							{!isFriendView && (onEditClick || onDeleteItem) && (
								<Box sx={{ display: 'flex', gap: 1 }}>
									{onEditClick && (
										<IconButton size="small" onClick={() => onEditClick(item)}>
											<EditIcon fontSize="small" />
										</IconButton>
									)}
									{onDeleteItem && (
										<IconButton size="small" onClick={() => onDeleteItem(item)}>
											<DeleteIcon fontSize="small" />
										</IconButton>
									)}
								</Box>
							)}
            </ListItemButton>
            <Collapse in={expandedItem === item} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, py: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {itemDetails[item] || 'No additional details.'}
                </Typography>
              </Box>
            </Collapse>

            {isFriendView && (
              <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', py: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', px: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mr: 1 }}>
                    Volunteers:
                  </Typography>
                  {supporters[item]?.map(friend => (
                    <Chip
                      key={friend}
                      label={friend}
                      size="small"
                      variant="outlined"
                      onDelete={
                        friend === currentUser && onRemoveSupporter
                          ? () => onRemoveSupporter(item)
                          : undefined
                      }
                    />
                  ))}
                  {!hasUserAdded(item) && onAddSupporter && (
                    <IconButton
                      size="small"
                      onClick={() => onAddSupporter(item)}
                      sx={{ ml: 1 }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            )}
          </ListItem>
        ))}
      </List>
    </>
  )
}
