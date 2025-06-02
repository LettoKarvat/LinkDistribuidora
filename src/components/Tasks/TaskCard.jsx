import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Styled components
const TaskContainer = styled(Card)(({ theme, priority }) => ({
  marginBottom: theme.spacing(1.5),
  cursor: 'grab',
  borderLeft: '4px solid',
  borderLeftColor:
    priority === 'high'
      ? theme.palette.error.main
      : priority === 'medium'
      ? theme.palette.warning.main
      : theme.palette.success.main,
}));

// Priority labels
const PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

// Priority colors
const PRIORITY_COLORS = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

function TaskCard({ task, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: task.id.toString(),
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Stop propagation to prevent drag when clicking edit button
  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
  };

  return (
    <TaskContainer
      ref={setNodeRef}
      style={style}
      priority={task.priority}
      {...attributes}
      {...listeners}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={500} noWrap>
            {task.title}
          </Typography>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={handleEditClick}
              sx={{ ml: 1, mt: -0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            maxHeight: 80,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {task.description || 'Sem descrição'}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Chip
            label={PRIORITY_LABELS[task.priority]}
            color={PRIORITY_COLORS[task.priority]}
            size="small"
            variant="outlined"
          />
          
          {task.assignee && (
            <Typography variant="caption\" color="text.secondary">
              {task.assignee}
            </Typography>
          )}
        </Box>
      </CardContent>
    </TaskContainer>
  );
}

export default TaskCard;