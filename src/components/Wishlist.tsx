import { useState } from 'react'
import { type WishlistItem } from '../schemas/schemas'
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
  items: WishlistItem[]
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

  // Determine a unique key for each item, prioritizing id if available
  const getItemKey = (item: WishlistItem): string => {
    return item.id || item.title
  }

  const toggleItem = (item: WishlistItem) => {
    const key = getItemKey(item)
    setExpandedItem(prev => (prev === key ? null : key))
  }

  const hasUserAdded = (key: string) => {
    return currentUser ? supporters[key]?.includes(currentUser) ?? false : false
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
        {(items || []).map(item => {
          const itemKey = getItemKey(item)
          const itemTitle = item.title
          const description = item.description || 'No additional details.'

          return (
            <ListItem
              key={itemKey}
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
                <ListItemText primary={itemTitle} />
                {!isFriendView && (onEditClick || onDeleteItem) && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {onEditClick && (
                      <IconButton size="small" onClick={(e) => {
                        e.stopPropagation()
                        onEditClick(itemKey)
                      }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDeleteItem && (
                      <IconButton size="small" onClick={(e) => {
                        e.stopPropagation()
                        onDeleteItem(itemKey)
                      }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                )}
              </ListItemButton>
              <Collapse in={expandedItem === itemKey} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 4, py: 2 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {description}
                  </Typography>
                </Box>
              </Collapse>

              {isFriendView && (
                <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', py: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', px: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, mr: 1 }}>
                      Volunteers:
                    </Typography>
                    {supporters[itemKey]?.map(friend => (
                      <Chip
                        key={friend}
                        label={friend}
                        size="small"
                        variant="outlined"
                        onDelete={
                          friend === currentUser && onRemoveSupporter
                            ? () => onRemoveSupporter(itemKey)
                            : undefined
                        }
                      />
                    ))}
                    {!hasUserAdded(itemKey) && onAddSupporter && (
                      <IconButton
                        size="small"
                        onClick={() => onAddSupporter(itemKey)}
                        sx={{ ml: 1 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              )}
            </ListItem>
          )
        })}
      </List>
    </>
  )
}
