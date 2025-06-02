import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress
} from '@mui/material';
import { useState } from 'react';

function ClientForm({ client, onSave, onCancel }) {
  const [loading, setLoading] = useState(false);
  
  // Initialize form with client data or empty values
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      city: client?.city || '',
      state: client?.state || '',
      zip: client?.zip || '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await onSave(data);
    if (!result) {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Nome é obrigatório' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nome"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Telefone é obrigatório' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Telefone"
                fullWidth
                required
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Endereço"
                fullWidth
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cidade"
                fullWidth
                error={!!errors.city}
                helperText={errors.city?.message}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Estado"
                fullWidth
                error={!!errors.state}
                helperText={errors.state?.message}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Controller
            name="zip"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="CEP"
                fullWidth
                error={!!errors.zip}
                helperText={errors.zip?.message}
              />
            )}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </Box>
    </Box>
  );
}

export default ClientForm;