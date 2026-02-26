import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'

interface AddItemModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (title: string, description: string) => void
  title: string
  description: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  isEditing?: boolean
}

export default function AddItemModal({
  open,
  onClose,
  onSubmit,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  isEditing = false,
}: AddItemModalProps) {
  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title, description)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Wishlist Item</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          autoFocus
          fullWidth
          label="Title"
          placeholder="Enter item name..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Description (optional)"
          placeholder="Add any details..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim()}
        >
          {isEditing ? 'Update Item' : 'Add Item'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
