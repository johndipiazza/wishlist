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
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

interface FriendWishlistProps {
  friendName: string
  items: string[]
  itemDetails: Record<string, string>
  supporters: Record<string, string[]>
  currentUser: string
  onAddSupporter: (item: string) => void
  onRemoveSupporter: (item: string) => void
}

export default function FriendWishlist({
  friendName,
  items,
  itemDetails,
  supporters,
  currentUser,
  onAddSupporter,
  onRemoveSupporter,
}: FriendWishlistProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const hasUserAdded = (item: string) => {
    return supporters[item]?.includes(currentUser) ?? false
  }

  const toggleItem = (item: string) => {
    setExpandedItem(prev => (prev === item ? null : item))
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {friendName}'s Wishlist
      </Typography>
      <List>
        {(items || []).map((item) => (
					<ListItem key={item} disablePadding sx={{flexDirection: 'column', alignItems: 'stretch', border: 1, borderColor: 'divider', borderRadius: 1, mb: 1}}>
						<ListItemButton onClick={() => toggleItem(item)}>
							<ListItemText primary={item} />
						</ListItemButton>
						<Collapse in={expandedItem === item} timeout="auto" unmountOnExit>
							<Box sx={{ pl: 4, py: 2 }}>
								<Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
								{itemDetails[item] || 'No additional details.'}
								</Typography>
							</Box>
						</Collapse>
						{/* Volunteer bar always visible */}
						<Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', py: 0.5 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', px: 2 }}>
								<Typography variant="caption" sx={{ fontWeight: 600, mr: 1 }}>
									Volunteers:
								</Typography>
								{supporters[item]?.map((friend: string) => (
									<Chip
										key={friend}
										label={friend}
										size="small"
										variant="outlined"
										onDelete={friend === currentUser ? () => onRemoveSupporter(item) : undefined}
									/>
								))}
								{!hasUserAdded(item) && (
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
					</ListItem>
        ))}
      </List>
    </>
  )
}
