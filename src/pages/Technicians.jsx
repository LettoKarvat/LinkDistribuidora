// src/pages/Technicians.jsx
import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import InputMask from 'react-input-mask';
import {
    getTechnicians,
    createTechnician,
    updateTechnician,
    deleteTechnician,
} from '../services/technicianService';
import { useSnackbar } from '../hooks/useSnackbar';

function Technicians() {
    const [techs, setTechs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedTech, setSelectedTech] = useState(null);
    const { showSuccess, showError } = useSnackbar();

    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            cpf_cnpj: '',
            phone: '',
        },
    });

    const fetchTechs = async () => {
        try {
            setLoading(true);
            const data = await getTechnicians();
            setTechs(data);
        } catch {
            showError('Erro ao carregar técnicos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechs();
    }, []);

    const openCreateDialog = () => {
        reset({
            name: '',
            email: '',
            password: '',
            cpf_cnpj: '',
            phone: '',
        });
        setIsEdit(false);
        setSelectedTech(null);
        setDialogOpen(true);
    };

    const openEditDialog = (tech) => {
        reset({
            name: tech.name,
            email: tech.email,
            password: '',
            cpf_cnpj: tech.cpf_cnpj,
            phone: tech.phone,
        });
        setIsEdit(true);
        setSelectedTech(tech);
        setDialogOpen(true);
    };

    const handleDelete = async (tech) => {
        if (!window.confirm(`Deseja realmente excluir o técnico ${tech.name}?`)) return;
        try {
            setLoading(true);
            await deleteTechnician(tech.id);
            showSuccess(`Técnico ${tech.name} excluído com sucesso`);
            fetchTechs();
        } catch (err) {
            console.error('Erro ao excluir:', err.response?.data);
            showError(err.response?.data?.error || 'Erro ao excluir técnico');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (form) => {
        try {
            setLoading(true);
            if (isEdit && selectedTech) {
                const payload = {};
                if (form.name !== selectedTech.name) payload.name = form.name;
                if (form.email !== selectedTech.email) payload.email = form.email;
                if (form.cpf_cnpj !== selectedTech.cpf_cnpj) payload.cpf_cnpj = form.cpf_cnpj;
                if (form.phone !== selectedTech.phone) payload.phone = form.phone;
                if (form.password) payload.password = form.password;

                await updateTechnician(selectedTech.id, payload);
                showSuccess(`Técnico ${form.name} atualizado com sucesso`);
            } else {
                await createTechnician(form);
                showSuccess(`Técnico ${form.name} criado com sucesso`);
            }
            setDialogOpen(false);
            reset();
            fetchTechs();
        } catch (err) {
            console.error('Resposta de erro do servidor:', err.response?.data);
            if (err.response?.data?.error) {
                showError(err.response.data.error);
            } else if (err.validationErrors) {
                Object.entries(err.validationErrors).forEach(([field, msgs]) => {
                    setError(field, { type: 'server', message: msgs.join(' ') });
                });
            } else {
                showError(err.message || 'Erro ao salvar técnico');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                >
                    Novo Técnico
                </Button>
                <Tooltip title="Atualizar">
                    <span>
                        <IconButton onClick={fetchTechs} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            <Table sx={{ minWidth: 600 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>E-mail</TableCell>
                        <TableCell>CPF/CNPJ</TableCell>
                        <TableCell>Telefone</TableCell>
                        <TableCell align="right">Ações</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {techs.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell>{t.name}</TableCell>
                            <TableCell>{t.email}</TableCell>
                            <TableCell>{t.cpf_cnpj}</TableCell>
                            <TableCell>{t.phone}</TableCell>
                            <TableCell align="right">
                                <Tooltip title="Editar">
                                    <IconButton onClick={() => openEditDialog(t)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Excluir">
                                    <IconButton onClick={() => handleDelete(t)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    {!loading && techs.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                Nenhum técnico cadastrado
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {isEdit ? 'Editar Técnico' : 'Novo Técnico'}
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent dividers>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'Nome é obrigatório' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nome"
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />

                        <Controller
                            name="email"
                            control={control}
                            rules={{ required: 'E-mail é obrigatório' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="E-mail"
                                    type="email"
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            )}
                        />

                        {!isEdit && (
                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    required: 'Senha é obrigatória',
                                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Senha"
                                        type="password"
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                    />
                                )}
                            />
                        )}
                        {isEdit && (
                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    minLength: {
                                        value: 6,
                                        message: 'Mínimo 6 caracteres',
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Nova Senha (opcional)"
                                        type="password"
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                    />
                                )}
                            />
                        )}

                        <Controller
                            name="cpf_cnpj"
                            control={control}
                            rules={{ required: 'CPF/CNPJ é obrigatório' }}
                            render={({ field }) => {
                                const digits = (field.value || '').replace(/\D/g, '');
                                const isCnpj = digits.length > 11;
                                return (
                                    <InputMask
                                        {...field}
                                        mask={isCnpj ? '99.999.999/9999-99' : '999.999.999-99'}
                                        maskPlaceholder={null}
                                    >
                                        {(inputProps) => (
                                            <TextField
                                                {...inputProps}
                                                label="CPF/CNPJ"
                                                fullWidth
                                                margin="normal"
                                                error={!!errors.cpf_cnpj}
                                                helperText={errors.cpf_cnpj?.message}
                                            />
                                        )}
                                    </InputMask>
                                );
                            }}
                        />

                        <Controller
                            name="phone"
                            control={control}
                            rules={{ required: 'Telefone é obrigatório' }}
                            render={({ field }) => (
                                <InputMask
                                    {...field}
                                    mask="(99) 99999-9999"
                                    maskPlaceholder={null}
                                >
                                    {(inputProps) => (
                                        <TextField
                                            {...inputProps}
                                            label="Telefone"
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    )}
                                </InputMask>
                            )}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button variant="contained" type="submit" disabled={loading}>
                            {loading ? <CircularProgress size={20} /> : 'Salvar'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}

export default Technicians;
