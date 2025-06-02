// src/pages/Agenda.jsx

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  DateCalendar,
  PickersDay,
  pickersDayClasses,
} from '@mui/x-date-pickers';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { useForm, Controller } from 'react-hook-form';
import { format, addMonths, subMonths, parseISO, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import api from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';

// ------------------------------------------------------------------------
// 1. Helper para extrair technician_ids de cada dia
//    ← Aqui identificamos os dias que têm compromissos (appointments)
const getTechIdsForDay = (day, appointments) => {
  const dayStr = format(day, 'yyyy-MM-dd');
  return appointments
    .filter(({ date }) => date.slice(0, 10) === dayStr)   // ← filtro por dia
    .map((app) => app.technician_id)
    .filter((id) => id !== null);
};

// ------------------------------------------------------------------------
// 2. Gera cor baseada no technician_id
const getColorByTechId = (techId) => {
  const hue = (techId * 47) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// ------------------------------------------------------------------------
// 3. Styled component ajustado para aceitar techIds e hasAppointment
//    ← Aqui destacamos dias no calendário que têm compromissos
const HighlightedDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== 'hasAppointment' && prop !== 'techIds',
})(({ theme, hasAppointment, techIds }) => {
  const baseStyles = {
    [`&.${pickersDayClasses.root}`]: {
      ...(hasAppointment && {
        backgroundColor: theme.palette.action.selected,         // ← destaque de fundo
        color: theme.palette.primary.contrastText,             // ← cor do texto
        fontWeight: 'bold',
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.action.hover
              : theme.palette.primary.dark,
        },
      }),
    },
  };

  return {
    ...baseStyles,
    position: 'relative',
    '&:after': {
      content: '""',
      display: 'block',
      height: techIds && techIds.length > 0 ? 4 : 0,             // ← barra indicadora abaixo do dia
      marginTop: techIds && techIds.length > 0 ? 22 : 0,
    },
  };
});

function Agenda() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dayAppointments, setDayAppointments] = useState([]);
  const { showSuccess, showError } = useSnackbar();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      client_id: '',
      date: '',
      time: '',
      duration: 60,
      notes: '',
    },
  });

  // Fetch all atendimentos (sem filtrar por técnico)
  const fetchAttendances = async (date = new Date()) => {
    try {
      setLoading(true);

      const response = await api.get('/attendances');
      const all = response.data;

      // Filtra pelo mês/ano corrente no calendário
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const filtered = all.filter((at) => {
        const [y, m] = at.attendance_date.split('-').map(Number);
        return y === year && m === month;
      });

      const mapped = filtered.map((at) => {
        const startISO = `${at.attendance_date}T${at.start_time}:00`;
        const [h1, min1] = at.start_time.split(':').map(Number);
        const [h2, min2] = at.end_time.split(':').map(Number);
        const duration = h2 * 60 + min2 - (h1 * 60 + min1);

        return {
          id: at.id,
          client_name: at.client_name,
          technician_id: at.technician_id, // inclui technician_id
          technician_name: at.technician_name || '—',
          date: startISO,
          duration,
          notes: at.description || '',
        };
      });

      setAppointments(mapped);
    } catch (error) {
      console.error('Falha ao carregar atendimentos:', error);
      showError('Não foi possível carregar os atendimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances(calendarDate);
  }, [calendarDate]);

  // Renderiza cada célula do calendário destacando dias com atendimentos e pontinhos coloridos
  const renderDay = (day, _selectedDates, pickersDayProps) => {
    const techIds = getTechIdsForDay(day, appointments);   // ← identifica se há compromisso neste dia
    const hasAppointment = techIds.length > 0;
    const colors = techIds.map((id) => getColorByTechId(id));

    return (
      <Box key={day.toString()} sx={{ position: 'relative' }}>
        <HighlightedDay
          {...pickersDayProps}
          hasAppointment={hasAppointment}   // ← passa se há compromisso ou não
          techIds={techIds}                 // ← IDs dos técnicos para colorir pontos
        />
        {hasAppointment && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
            }}
          >
            {colors.map((color, i) => (
              <Box
                key={i}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: color,
                  mx: 0.3,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  // Quando o usuário muda a data, atualiza lista de atendimentos do dia
  const handleDateChange = (date) => {
    setSelectedDate(date);

    const dayStr = format(date, 'yyyy-MM-dd');
    const dayApps = appointments.filter((appointment) => {
      const appDayStr = appointment.date.slice(0, 10);       // ← obtenção do dia do compromisso
      return appDayStr === dayStr;
    });

    setDayAppointments(dayApps);
  };

  // Navegação de mês
  const handlePrevMonth = () => {
    setCalendarDate(subMonths(calendarDate, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(addMonths(calendarDate, 1));
  };

  // Abre diálogo de novo atendimento com valores iniciais
  const handleOpenDialog = () => {
    reset({
      client_id: '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '09:00',
      duration: 60,
      notes: '',
    });
    setDialogOpen(true);
  };

  // Envia POST /attendances
  const onSubmit = async (data) => {
    try {
      // Calcula end_time a partir de date, time e duration
      const startDateTime = new Date(`${data.date}T${data.time}:00`);
      const endDateTime = addMinutes(startDateTime, Number(data.duration));
      const endHours = String(endDateTime.getHours()).padStart(2, '0');
      const endMins = String(endDateTime.getMinutes()).padStart(2, '0');

      await api.post('/attendances', {
        client_id: Number(data.client_id),
        technician_id: null, // sem técnico específico
        attendance_date: data.date,
        start_time: data.time,
        end_time: `${endHours}:${endMins}`,
        status: 'Agendada',
        description: data.notes,
      });

      showSuccess('Atendimento criado com sucesso');
      await fetchAttendances(calendarDate);
      setDialogOpen(false);
      handleDateChange(selectedDate);
    } catch (error) {
      console.error('Falha ao criar atendimento:', error);
      showError('Erro ao criar atendimento');
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={500}>
          Agenda de Atendimentos (Todos)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Calendário */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <IconButton onClick={handlePrevMonth}>
                <NavigateBeforeIcon />
              </IconButton>

              <Typography variant="h6">
                {format(calendarDate, 'MMMM yyyy', { locale: ptBR })}
              </Typography>

              <IconButton onClick={handleNextMonth}>
                <NavigateNextIcon />
              </IconButton>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <DateCalendar
                value={selectedDate}
                onChange={handleDateChange}
                renderDay={renderDay}            // ← Função que destaca dias com compromissos
                views={['day']}
                showDaysOutsideCurrentMonth
                dayOfWeekFormatter={(day) => day.charAt(0)}
                sx={{ width: '100%' }}
              />
            )}
          </Paper>
        </Grid>

        {/* Atendimentos do dia selecionado */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                Agendar
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {dayAppointments.length > 0 ? (
              dayAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 6,
                }}
              >
                <Typography color="text.secondary" align="center">
                  Nenhum atendimento nesta data
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog para novo atendimento */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Novo Atendimento</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="client_id"
                  control={control}
                  rules={{ required: 'Cliente é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="ID do Cliente"
                      fullWidth
                      required
                      error={!!errors.client_id}
                      helperText={errors.client_id?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: 'Data é obrigatória' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Data"
                      type="date"
                      fullWidth
                      required
                      error={!!errors.date}
                      helperText={errors.date?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="time"
                  control={control}
                  rules={{ required: 'Hora é obrigatória' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Hora de Início"
                      type="time"
                      fullWidth
                      required
                      error={!!errors.time}
                      helperText={errors.time?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="duration"
                  control={control}
                  rules={{
                    required: 'Duração é obrigatória',
                    min: { value: 15, message: 'Mínimo de 15 minutos' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Duração (minutos)"
                      type="number"
                      fullWidth
                      required
                      error={!!errors.duration}
                      helperText={errors.duration?.message}
                      InputProps={{
                        inputProps: { min: 15, step: 15 },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descrição"
                      multiline
                      rows={3}
                      fullWidth
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" type="submit">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

// Componente que exibe cada atendimento individualmente
function AppointmentCard({ appointment }) {
  const time = format(parseISO(appointment.date), 'HH:mm');

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          boxShadow: 1,
          borderColor: 'primary.main',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" fontWeight={500}>
          {time}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ mt: 1 }}>
        Cliente: {appointment.client_name}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Técnico: {appointment.technician_name}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {appointment.notes || 'Sem descrição'}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: 'block' }}
      >
        Duração: {appointment.duration} minutos
      </Typography>
    </Box>
  );
}

function Divider(props) {
  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        width: '100%',
        ...props.sx,
      }}
    />
  );
}

export default Agenda;
