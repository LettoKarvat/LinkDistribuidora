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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ChecklistList() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // para navegar ao clicar

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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}
