// src/pages/Stock.jsx
import { useState, useEffect, useMemo } from 'react';
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
  TablePagination,
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

  // ── filtros ─────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filialFilter, setFilialFilter] = useState('all');

  // ── paginação ───────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // diálogos
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newDialogOpen, setNewDialogOpen] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  // form movimentação
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

  // form criar peça
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

  // ─── 1) fetch itens ─────────────────────────────────────
  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/stock/items');
      setItems(data);
    } catch (err) {
      console.error(err);
      showError('Não foi possível carregar os itens do estoque');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // lista de filiais para dropdown
  const filiais = useMemo(
    () => Array.from(new Set(items.map((i) => i.filial))).sort(),
    [items]
  );

  // ─── 2) filtro local ────────────────────────────────────
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      String(item.id).includes(search);
    const matchesFilial =
      filialFilter === 'all' || item.filial === filialFilter;
    return matchesSearch && matchesFilial;
  });

  // dados paginados
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // handlers paginação
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // ─── 3) movimentação ────────────────────────────────────
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

      await api.post('/stock/movements', { ...data, quantity });
      showSuccess('Movimentação registrada com sucesso');
      await fetchItems();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      showError('Erro ao registrar movimentação');
    }
  };

  // ─── 4) criação peça ────────────────────────────────────
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
      await api.post('/stock/items', {
        filial: data.filial,
        description: data.description,
        quantity: data.quantity,
        price: parseFloat(data.price),
      });
      showSuccess('Peça criada com sucesso');
      await fetchItems();
      setNewDialogOpen(false);
    } catch (err) {
      console.error(err);
      showError('Erro ao cadastrar peça');
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* cabeçalho */}
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
          {/* busca texto */}
          <TextField
            size="small"
            placeholder="Buscar por descrição ou ID..."
            variant="outlined"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 280 }}
          />

          {/* filtro filial */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filial</InputLabel>
            <Select
              value={filialFilter}
              label="Filial"
              onChange={(e) => {
                setFilialFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">Todas</MenuItem>
              {filiais.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* botão nova peça */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenNewDialog}
          >
            Adicionar Peça
          </Button>
        </Box>
      </Box>

      {/* tabela */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ overflow: 'auto' }}>
          <TableContainer>
            <Table stickyHeader>
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
                {paginatedItems.map((item) => (
                  <TableRow hover key={item.id}>
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

                {paginatedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* paginação */}
          <TablePagination
            component="div"
            count={filteredItems.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Paper>
      )}

      {/* diálogo nova peça */}
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
              {/* filial */}
              <Grid item xs={12}>
                <Controller
                  name="filial"
                  control={createControl}
                  rules={{ required: 'Filial é obrigatória' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Filial"
                      fullWidth
                      error={!!createErrors.filial}
                      helperText={createErrors.filial?.message}
                    />
                  )}
                />
              </Grid>
              {/* descrição */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={createControl}
                  rules={{ required: 'Descrição é obrigatória' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descrição"
                      fullWidth
                      error={!!createErrors.description}
                      helperText={createErrors.description?.message}
                    />
                  )}
                />
              </Grid>
              {/* estoque inicial */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="quantity"
                  control={createControl}
                  rules={{
                    required: 'Quantidade inicial é obrigatória',
                    min: { value: 0, message: '≥ 0' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Estoque Inicial"
                      fullWidth
                      error={!!createErrors.quantity}
                      helperText={createErrors.quantity?.message}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  )}
                />
              </Grid>
              {/* preço */}
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
                      label="Preço (R$)"
                      fullWidth
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

      {/* diálogo movimentação */}
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
              {/* operação */}
              <Grid item xs={12}>
                <Controller
                  name="operation_type"
                  control={movControl}
                  rules={{ required: 'Operação é obrigatória' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!movErrors.operation_type}>
                      <InputLabel>Operação</InputLabel>
                      <Select {...field} label="Operação">
                        <MenuItem value="add">Entrada</MenuItem>
                        <MenuItem value="remove">Saída</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              {/* quantidade */}
              <Grid item xs={12}>
                <Controller
                  name="quantity"
                  control={movControl}
                  rules={{
                    required: 'Quantidade é obrigatória',
                    min: { value: 1, message: '≥ 1' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Quantidade"
                      fullWidth
                      error={!!movErrors.quantity}
                      helperText={movErrors.quantity?.message}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  )}
                />
              </Grid>
              {/* observações */}
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
