// src/pages/Stock.jsx

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useForm, Controller } from 'react-hook-form';
import api from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';

function Stock() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  // Diálogo de movimentação existente
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Diálogo “Adicionar Peça” (novo)
  const [newDialogOpen, setNewDialogOpen] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  // Formulário para movimentação
  const {
    control: movControl,
    handleSubmit: handleMovSubmit,
    reset: resetMov,
    formState: { errors: movErrors },
  } = useForm({
    defaultValues: {
      item_id: '',
      quantity: 0,
      operation_type: 'add',
      notes: '',
    },
  });

  // Formulário para criar nova peça
  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm({
    defaultValues: {
      filial: '',
      description: '',
      quantity: 0,
      price: '',
    },
  });

  // ─── 1) FETCH DOS ITENS DO ESTOQUE ─────────────────────────────────────────
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stock/items');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch stock items:', error);
      showError('Não foi possível carregar os itens do estoque');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ─── 2) FILTRO DE BUSCA (pela descrição) ─────────────────────────────────
  const filteredItems = items.filter((item) =>
    item.description.toLowerCase().includes(filter.toLowerCase())
  );

  // ─── 3) MOVIMENTAÇÃO DE ESTOQUE ────────────────────────────────────────────
  const handleOpenMovementDialog = (item) => {
    setSelectedItem(item);
    resetMov({
      item_id: item.id,
      quantity: 1,
      operation_type: 'add',
      notes: '',
    });
    setDialogOpen(true);
  };

  const onSubmitMovement = async (data) => {
    try {
      const quantity =
        data.operation_type === 'remove'
          ? -Math.abs(data.quantity)
          : Math.abs(data.quantity);

      await api.post('/stock/movements', {
        ...data,
        quantity,
      });

      showSuccess('Movimentação de estoque registrada com sucesso');
      await fetchItems();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save stock movement:', error);
      showError('Erro ao registrar movimentação de estoque');
    }
  };

  // ─── 4) CRIAÇÃO DE NOVA PEÇA ────────────────────────────────────────────────
  const handleOpenNewDialog = () => {
    resetCreate({
      filial: '',
      description: '',
      quantity: 0,
      price: '',
    });
    setNewDialogOpen(true);
  };

  const onSubmitCreate = async (data) => {
    try {
      // Monta payload conforme o backend espera
      const payload = {
        filial: data.filial,
        description: data.description,
        quantity: data.quantity,
        price: parseFloat(data.price),
      };

      await api.post('/stock/items', payload);
      showSuccess('Nova peça cadastrada com sucesso');
      await fetchItems();
      setNewDialogOpen(false);
    } catch (error) {
      console.error('Failed to create stock item:', error);
      showError('Erro ao cadastrar nova peça');
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* ─── CABEÇALHO COM BUSCA E BOTÕES ────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={500}>
          Estoque
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Campo de busca */}
          <TextField
            size="small"
            placeholder="Buscar item..."
            variant="outlined"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />

          {/* Botão “Adicionar Peça” */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenNewDialog}
          >
            Adicionar Peça
          </Button>
        </Box>
      </Box>

      {/* ─── TABELA DE ITENS ────────────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Filial</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Estoque</TableCell>
                <TableCell align="right">Preço</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.filial}</TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(item.price)}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<InventoryIcon />}
                      onClick={() => handleOpenMovementDialog(item)}
                    >
                      Movimentar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhum item encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ─── DIÁLOGO “Adicionar Peça” ───────────────────────────────────────── */}
      <Dialog
        open={newDialogOpen}
        onClose={() => setNewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Adicionar Nova Peça</DialogTitle>
        <form onSubmit={handleCreateSubmit(onSubmitCreate)}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Filial */}
              <Grid item xs={12}>
                <Controller
                  name="filial"
                  control={createControl}
                  rules={{ required: 'Filial é obrigatória' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Filial"
                      error={!!createErrors.filial}
                      helperText={createErrors.filial?.message}
                    />
                  )}
                />
              </Grid>

              {/* Descrição */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={createControl}
                  rules={{ required: 'Descrição é obrigatória' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Descrição"
                      error={!!createErrors.description}
                      helperText={createErrors.description?.message}
                    />
                  )}
                />
              </Grid>

              {/* Estoque inicial */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="quantity"
                  control={createControl}
                  rules={{
                    required: 'Quantidade inicial é obrigatória',
                    min: { value: 0, message: 'Quantidade ≥ 0' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Estoque Inicial"
                      error={!!createErrors.quantity}
                      helperText={createErrors.quantity?.message}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  )}
                />
              </Grid>

              {/* Preço */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="price"
                  control={createControl}
                  rules={{
                    required: 'Preço é obrigatório',
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: 'Formato inválido (ex: 10.50)',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Preço (R$)"
                      error={!!createErrors.price}
                      helperText={createErrors.price?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">R$</InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setNewDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" type="submit">
              Criar Peça
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ─── DIÁLOGO “Movimentação de Estoque” (existente) ──────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Movimentação de Estoque: {selectedItem?.description}
        </DialogTitle>
        <form onSubmit={handleMovSubmit(onSubmitMovement)}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Tipo de operação */}
              <Grid item xs={12}>
                <Controller
                  name="operation_type"
                  control={movControl}
                  rules={{ required: 'Operação é obrigatória' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!movErrors.operation_type}>
                      <InputLabel id="operation-type-label">
                        Operação
                      </InputLabel>
                      <Select
                        {...field}
                        labelId="operation-type-label"
                        label="Operação"
                      >
                        <MenuItem value="add">Entrada</MenuItem>
                        <MenuItem value="remove">Saída</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Quantidade */}
              <Grid item xs={12}>
                <Controller
                  name="quantity"
                  control={movControl}
                  rules={{
                    required: 'Quantidade é obrigatória',
                    min: { value: 1, message: 'Quantidade deve ser ≥ 1' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Quantidade"
                      required
                      error={!!movErrors.quantity}
                      helperText={movErrors.quantity?.message}
                      InputProps={{
                        inputProps: { min: 1 },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Observações */}
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={movControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Observações"
                      multiline
                      rows={3}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" type="submit">
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Stock;
