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
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { getTechnicians, createTechnician } from '../services/technicianService';
import { useSnackbar } from '../hooks/useSnackbar';

function Technicians() {
    const [techs, setTechs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
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

    const onSubmit = async (form) => {
        try {
            setLoading(true);
            const newTech = await createTechnician(form);
            showSuccess(`Técnico ${newTech.name} criado com sucesso`);
            setDialogOpen(false);
            reset();
            fetchTechs();
        } catch (err) {
            if (err.validationErrors) {
                Object.entries(err.validationErrors).forEach(([field, msgs]) => {
                    setError(field, { type: 'server', message: msgs.join(' ') });
                });
            } else if (err.originalError?.response?.status === 400) {
                showError(err.originalError.response.data.error);
            } else {
                showError(err.message || 'Erro ao criar técnico');
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
                    onClick={() => setDialogOpen(true)}
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
                    </TableRow>
                </TableHead>
                <TableBody>
                    {techs.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell>{t.name}</TableCell>
                            <TableCell>{t.email}</TableCell>
                            <TableCell>{t.cpf_cnpj}</TableCell>
                            <TableCell>{t.phone}</TableCell>
                        </TableRow>
                    ))}
                    {!loading && techs.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
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
                <DialogTitle>Novo Técnico</DialogTitle>
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

                        <Controller
                            name="cpf_cnpj"
                            control={control}
                            rules={{ required: 'CPF/CNPJ é obrigatório' }}
                            render={({ field }) => {
                                // remove tudo que não é dígito para contar
                                const digits = (field.value || '').replace(/\D/g, '');
                                // CPF = 11 dígitos, CNPJ = 14
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
