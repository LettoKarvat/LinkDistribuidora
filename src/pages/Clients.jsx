import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Drawer,
    IconButton,
    InputAdornment,
    Divider,
    Paper
} from '@mui/material';
import {
    DataGrid,
    ptBR,
    GridToolbarContainer,
    GridActionsCellItem
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

import api from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';
import ClientForm from '../components/Clients/ClientForm';
import ConfirmDialog from '../components/ConfirmDialog';

function CustomToolbar({ onAdd, onFilterChange, filterValue }) {
    return (
        <GridToolbarContainer
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <TextField
                size="small"
                placeholder="Buscar por nome..."
                variant="outlined"
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
                sx={{ minWidth: 300 }}
            />

            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAdd}
            >
                Novo Cliente
            </Button>
        </GridToolbarContainer>
    );
}

function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);
    const [filter, setFilter] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const { showSuccess, showError } = useSnackbar();

    // Fetch clients
    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            showError('Não foi possível carregar os clientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // Open drawer to add new client
    const handleAddClient = () => {
        setCurrentClient(null);
        setDrawerOpen(true);
    };

    // Open drawer to edit client
    const handleEditClient = (client) => {
        setCurrentClient(client);
        setDrawerOpen(true);
    };

    // Handle client delete
    const handleDeleteClick = (client) => {
        setClientToDelete(client);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!clientToDelete) return;

        try {
            await api.delete(`/clients/${clientToDelete.id}`);
            await fetchClients();
            showSuccess('Cliente excluído com sucesso');
        } catch (error) {
            console.error('Failed to delete client:', error);
            showError('Erro ao excluir o cliente');
        } finally {
            setConfirmOpen(false);
            setClientToDelete(null);
        }
    };

    // Save client (create or update)
    const handleSaveClient = async (formData) => {
        try {
            if (currentClient) {
                await api.patch(`/clients/${currentClient.id}`, formData);
                showSuccess('Cliente atualizado com sucesso');

            } else {
                // Create
                await api.post('/clients', formData);
                showSuccess('Cliente criado com sucesso');
            }

            // Refresh client list
            await fetchClients();
            setDrawerOpen(false);
        } catch (error) {
            console.error('Failed to save client:', error);

            if (error.validationErrors) {
                // Handle validation errors (already displayed in the form)
                return false;
            } else {
                showError(
                    `Erro ao ${currentClient ? 'atualizar' : 'criar'} o cliente`
                );
            }
            return false;
        }

        return true;
    };

    // Filter clients by name
    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(filter.toLowerCase())
    );

    // DataGrid columns (sem o campo "address")
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Nome', flex: 1, minWidth: 200 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
        { field: 'phone', headerName: 'Telefone', width: 150 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Editar"
                    onClick={() => handleEditClient(params.row)}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Excluir"
                    onClick={() => handleDeleteClick(params.row)}
                />
            ],
        },
    ];

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Typography variant="h4" gutterBottom fontWeight={500} mb={3}>
                Clientes
            </Typography>

            <Paper sx={{ height: 'calc(100vh - 180px)', width: '100%' }}>
                <DataGrid
                    rows={filteredClients}
                    columns={columns}
                    loading={loading}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                    disableRowSelectionOnClick
                    slots={{
                        toolbar: CustomToolbar,
                    }}
                    slotProps={{
                        toolbar: {
                            onAdd: handleAddClient,
                            onFilterChange: setFilter,
                            filterValue: filter,
                        },
                    }}
                    sx={{ border: 'none' }}
                />
            </Paper>

            {/* Client Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: 450 },
                        boxSizing: 'border-box',
                        p: 3,
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        {currentClient ? 'Editar Cliente' : 'Novo Cliente'}
                    </Typography>
                    <IconButton onClick={() => setDrawerOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <ClientForm
                    client={currentClient}
                    onSave={handleSaveClient}
                    onCancel={() => setDrawerOpen(false)}
                />
            </Drawer>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                title="Confirmar exclusão"
                message={`Tem certeza que deseja excluir o cliente "${clientToDelete?.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </Box>
    );
}

export default Clients;
