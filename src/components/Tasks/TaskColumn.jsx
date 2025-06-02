import {
  Paper,
  Typography,
  Box,
  Button,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

// Styled components
const ColumnContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const TaskList = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
}));

function TaskColumn({ id, title, tasks = [], onAddTask, onEditTask }) {
  const taskIds = tasks.map((task) => task.id.toString());

  return (
    <ColumnContainer>
      <Box
        sx={{
          p: 2,
          backgroundColor: 'background.paper',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">
          {title} ({tasks.length})
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={onAddTask}
          size="small"
        >
          Adicionar
        </Button>
      </Box>
      
      <Divider />
      
      <TaskList>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
              />
            ))
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: 0.5,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Sem tarefas
              </Typography>
            </Box>
          )}
        </SortableContext>
      </TaskList>
    </ColumnContainer>
  );
}

export default TaskColumn;