import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import api from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';
import TaskCard from '../components/Tasks/TaskCard';
import TaskColumn from '../components/Tasks/TaskColumn';

// Task statuses
const TASK_STATUS = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
};

// Task status labels
const STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'A Fazer',
  [TASK_STATUS.DOING]: 'Em Andamento',
  [TASK_STATUS.DONE]: 'Concluído',
};

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const { showSuccess, showError } = useSnackbar();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Initialize form
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: TASK_STATUS.TODO,
      priority: 'medium',
    },
  });

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      showError('Não foi possível carregar as tarefas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks by status
  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  // Open dialog to add/edit task
  const handleOpenDialog = (task = null) => {
    setCurrentTask(task);
    
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
      });
    } else {
      reset({
        title: '',
        description: '',
        status: TASK_STATUS.TODO,
        priority: 'medium',
      });
    }
    
    setDialogOpen(true);
  };

  // Save task
  const onSubmit = async (data) => {
    try {
      if (currentTask) {
        // Update task
        await api.put(`/tasks/${currentTask.id}`, data);
        showSuccess('Tarefa atualizada com sucesso');
      } else {
        // Create task
        await api.post('/tasks', data);
        showSuccess('Tarefa criada com sucesso');
      }
      
      // Refresh task list and close dialog
      await fetchTasks();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save task:', error);
      showError(`Erro ao ${currentTask ? 'atualizar' : 'criar'} a tarefa`);
    }
  };

  // Handle drag end
  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Find the task
    const task = tasks.find((t) => t.id.toString() === active.id);
    if (!task) return;

    // Get new status from over.id (column id)
    const newStatus = over.id;
    
    if (task.status === newStatus) {
      setActiveId(null);
      return;
    }

    // Optimistically update UI
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id.toString() === active.id ? { ...t, status: newStatus } : t
      )
    );

    // Update on the server
    try {
      await api.put(`/tasks/${task.id}`, {
        ...task,
        status: newStatus,
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
      showError('Erro ao atualizar o status da tarefa');
      
      // Revert on error
      await fetchTasks();
    }

    setActiveId(null);
  };

  // Get active task for drag overlay
  const activeTask = activeId ? tasks.find((t) => t.id.toString() === activeId) : null;

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={500}>
          Tarefas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Tarefa
        </Button>
      </Box>

      {loading && tasks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => setActiveId(event.active.id)}
          onDragEnd={handleDragEnd}
        >
          <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
            {/* To Do Column */}
            <Grid item xs={12} md={4}>
              <TaskColumn 
                id={TASK_STATUS.TODO} 
                title={STATUS_LABELS[TASK_STATUS.TODO]}
                tasks={getTasksByStatus(TASK_STATUS.TODO)}
                onAddTask={() => handleOpenDialog()}
                onEditTask={handleOpenDialog}
              />
            </Grid>

            {/* Doing Column */}
            <Grid item xs={12} md={4}>
              <TaskColumn 
                id={TASK_STATUS.DOING} 
                title={STATUS_LABELS[TASK_STATUS.DOING]}
                tasks={getTasksByStatus(TASK_STATUS.DOING)}
                onAddTask={() => handleOpenDialog({ status: TASK_STATUS.DOING })}
                onEditTask={handleOpenDialog}
              />
            </Grid>

            {/* Done Column */}
            <Grid item xs={12} md={4}>
              <TaskColumn 
                id={TASK_STATUS.DONE} 
                title={STATUS_LABELS[TASK_STATUS.DONE]}
                tasks={getTasksByStatus(TASK_STATUS.DONE)}
                onAddTask={() => handleOpenDialog({ status: TASK_STATUS.DONE })}
                onEditTask={handleOpenDialog}
              />
            </Grid>
          </Grid>

          {/* Drag overlay */}
          <DragOverlay>
            {activeId && activeTask ? (
              <TaskCard task={activeTask} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add/Edit Task Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {currentTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            <IconButton edge="end" onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Título é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Título"
                      fullWidth
                      required
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descrição"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: 'Status é obrigatório' }}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.status}>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        {...field}
                        labelId="status-label"
                        label="Status"
                      >
                        <MenuItem value={TASK_STATUS.TODO}>{STATUS_LABELS[TASK_STATUS.TODO]}</MenuItem>
                        <MenuItem value={TASK_STATUS.DOING}>{STATUS_LABELS[TASK_STATUS.DOING]}</MenuItem>
                        <MenuItem value={TASK_STATUS.DONE}>{STATUS_LABELS[TASK_STATUS.DONE]}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="priority"
                  control={control}
                  rules={{ required: 'Prioridade é obrigatória' }}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.priority}>
                      <InputLabel id="priority-label">Prioridade</InputLabel>
                      <Select
                        {...field}
                        labelId="priority-label"
                        label="Prioridade"
                      >
                        <MenuItem value="low">Baixa</MenuItem>
                        <MenuItem value="medium">Média</MenuItem>
                        <MenuItem value="high">Alta</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="contained" type="submit">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Tasks;