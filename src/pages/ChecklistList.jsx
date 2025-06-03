import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    CircularProgress,
    Box,
    IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';

export default function ChecklistList() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();

    // 1. Lê o estado do auth salvo pelo Zustand na chave "auth-storage":
    //    Estrutura típica de "auth-storage" é { state: { user: {...}, accessToken: "...", ... }, version: 0 }
    const rawAuth = localStorage.getItem('auth-storage') || '{}';
    let isAdmin = false;

    try {
        const parsedAuth = JSON.parse(rawAuth);
        // parsedAuth.state.user deve existir se o usuário estiver logado
        const user = parsedAuth.state?.user;
        if (user && user.role === 'admin') {
            isAdmin = true;
        }
    } catch (e) {
        console.warn('Não foi possível parsear auth-storage', e);
    }

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const res = await api.get('/checklist/entries');
            setEntries(res.data);
        } catch (err) {
            console.error('Erro ao buscar checklists:', err);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (id) => {
        navigate(`/checklist/${id}`);
    };

    const handleDeleteEntry = async (id) => {
        if (!window.confirm('Deseja realmente excluir este checklist?')) return;
        try {
            setLoading(true);
            await api.delete(`/checklist/entries/${id}`);
            showSuccess('Checklist excluído com sucesso');
            fetchEntries();
        } catch (err) {
            console.error('Erro ao excluir checklist:', err.response?.data);
            showError(err.response?.data?.error || 'Erro ao excluir checklist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Histórico de Checklists
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : entries.length === 0 ? (
                <Typography sx={{ mt: 2 }}>Nenhum checklist encontrado.</Typography>
            ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Equipamento</TableCell>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Data de Criação</TableCell>
                                {isAdmin && <TableCell align="right">Excluir</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {entries.map((entry) => (
                                <TableRow
                                    key={entry.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => handleRowClick(entry.id)}
                                >
                                    <TableCell>{entry.equipment_name}</TableCell>
                                    <TableCell>{entry.client_name || '—'}</TableCell>
                                    <TableCell>
                                        {entry.entry_type === 'entrada' ? 'Entrada' : 'Saída'}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(entry.created_at).toLocaleString('pt-BR')}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell align="right" sx={{ cursor: 'default' }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteEntry(entry.id);
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}
