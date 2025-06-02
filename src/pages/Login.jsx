import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockIcon,
} from '@mui/icons-material';
import { useSnackbar } from '../hooks/useSnackbar';
import { useAuthStore } from '../stores/useAuth';  // <-- ajuste aqui
import api from '../services/api';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showError } = useSnackbar();
  const { setTokens } = useAuthStore();           // <-- agora é named hook
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', data);

      // Salva tokens no estado
      setTokens(response.data.access_token, response.data.refresh_token);

      // Redireciona para dashboard
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        showError('Email ou senha incorretos. Por favor, tente novamente.');
      } else {
        showError('Erro ao fazer login. Por favor, tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            py: 4,
            px: { xs: 2, sm: 4 },
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: '50%',
                p: 1,
                mb: 2,
                display: 'flex',
              }}
            >
              <LockIcon fontSize="large" />
            </Box>
            <Typography component="h1" variant="h5" fontWeight="bold">
              ServicePro
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Faça login para acessar o sistema
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
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
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter no mínimo 6 caracteres',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
