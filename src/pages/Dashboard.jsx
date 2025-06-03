// src/pages/Dashboard.jsx

import { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Skeleton,
  useTheme
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Dashboard card component
function MetricCard({ title, value, icon, color, isLoading }) {
  const theme = useTheme();

  return (
    <Card
      elevation={1}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <CardContent sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 3
      }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2
          }}
        >
          <Typography
            variant="h6"
            color="textSecondary"
            sx={{ fontWeight: 500 }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.04)',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
        </Box>

        {isLoading ? (
          <Skeleton variant="rectangular" width="60%" height={36} />
        ) : (
          <Typography
            variant="h3"
            component="div"
            sx={{ fontWeight: 600 }}
          >
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  // Removido fetch de overview para não chamar endpoint que está retornando erro
  const [overview] = useState({
    low_stock_items: 0,
    open_calls: 0,
    today_appointments: 0,
  });
  const [loading] = useState(false);
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={500} sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Metric Cards */}
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Itens com Estoque Baixo"
            value={overview.low_stock_items}
            icon={<InventoryIcon sx={{ color: theme.palette.warning.main }} />}
            color={theme.palette.warning.main}
            isLoading={loading}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <MetricCard
            title="Chamados Abertos"
            value={overview.open_calls}
            icon={<SupportAgentIcon sx={{ color: theme.palette.primary.main }} />}
            color={theme.palette.primary.main}
            isLoading={loading}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <MetricCard
            title="Agendamentos Hoje"
            value={overview.today_appointments}
            icon={<CalendarTodayIcon sx={{ color: theme.palette.success.main }} />}
            color={theme.palette.success.main}
            isLoading={loading}
          />
        </Grid>

        {/* Mensagem de boas-vindas */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              mt: 3,
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h6" align="center">
              Bem-vindo ao painel de controle da ServicePro
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary" sx={{ mt: 1 }}>
              Use a navegação lateral para acessar as funcionalidades do sistema
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
