// src/router/AppRoutes.jsx

import { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import useAuthStore from '../stores/useAuth';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Clients from '../pages/Clients';
import Tasks from '../pages/Tasks';
import Stock from '../pages/Stock';
import Agenda from '../pages/Agenda';
import Technicians from '../pages/Technicians';

// Novos imports para checklist
import ChecklistTemplateForm from '../pages/ChecklistTemplateForm';
import ChecklistEntryForm from '../pages/ChecklistEntryForm';
import ChecklistList from '../pages/ChecklistList';
import ChecklistDetail from '../pages/ChecklistDetail';

// Novos imports para atendimentos
import AttendanceList from '../pages/Attendance';          // Tela de listagem (atual "Attendance")
import AttendanceForm from '../pages/AttendanceForm';      // Criação/Edição de O.S.
import AttendanceDetail from '../pages/AttendanceDetail';  // Detalhes da O.S.

import Layout from '../components/Layout';
import PrivateRoute from '../components/PrivateRoute';

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionamentos simples
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <Routes>
      {/* ——— PÚBLICO ——— */}
      <Route path="/login" element={<Login />} />

      {/* ——— AUTENTICADO (qualquer role) ——— */}
      <Route
        element={
          <PrivateRoute allowedRoles={['admin', 'technician']}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/agenda" element={<Agenda />} />

        {/* ——— ROTAS DE CHECKLIST ——— */}
        <Route
          path="/checklist/templates/create"
          element={<ChecklistTemplateForm />}
        />
        <Route path="/checklist/fill" element={<ChecklistEntryForm />} />
        <Route path="/checklist/list" element={<ChecklistList />} />
        <Route path="/checklist/:id" element={<ChecklistDetail />} />

        {/* ——— ROTAS DE ATENDIMENTOS (Ordem de Serviço) ——— */}
        <Route path="/attendances" element={<AttendanceList />} />
        <Route path="/attendances/new" element={<AttendanceForm />} />
        <Route path="/attendances/:id" element={<AttendanceDetail />} />
        <Route path="/attendances/:id/edit" element={<AttendanceForm />} />

        {/* ——— SOMENTE ADMIN ——— */}
        <Route
          path="/technicians"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Technicians />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
