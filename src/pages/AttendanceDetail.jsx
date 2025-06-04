// src/pages/AttendanceDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Checkbox,
    FormControlLabel,
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../services/api";

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ p: 2 }}>{children}</Box> : null;
}

export default function AttendanceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);

    // Checklists
    const [allTemplates, setAllTemplates] = useState([]);
    const [entries, setEntries] = useState([]);
    const [openChkDialog, setOpenChkDialog] = useState(false);
    const [templatesFields, setTemplatesFields] = useState({});
    const [templateId, setTemplateId] = useState("");
    const [equipmentName, setEquipmentName] = useState("");
    const [entryType, setEntryType] = useState("entrada");
    const [values, setValues] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Peças
    const [allParts, setAllParts] = useState([]);
    const [attendanceParts, setAttendanceParts] = useState([]);
    const [openPartsDialog, setOpenPartsDialog] = useState(false);
    const [selectedPart, setSelectedPart] = useState(null);
    const [selectedQty, setSelectedQty] = useState(1);

    // Serviços
    const [attendanceServices, setAttendanceServices] = useState([]);
    const [openServiceDialog, setOpenServiceDialog] = useState(false);
    const [newServiceDescription, setNewServiceDescription] = useState("");
    const [newServicePrice, setNewServicePrice] = useState("");

    /* ─────────────── Carrega O.S. ─────────────── */
    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        api
            .get(`/attendances/${id}`)
            .then((res) => {
                setAttendance(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                navigate("/attendances", { replace: true });
            });
    }, [id, navigate]);

    /* ─────────── Carrega dados relacionados ─────────── */
    useEffect(() => {
        if (!attendance) return;

        // Checklists
        api
            .get(`/checklist/templates?client_id=${attendance.client_id}`)
            .then((r) => setAllTemplates(r.data))
            .catch(() => setAllTemplates([]));

        api
            .get(`/attendances/${id}/checklist-entries`)
            .then((r) => setEntries(r.data))
            .catch(() => setEntries([]));

        // Peças (catálogo)
        api
            .get("/stock/items")
            .then((r) =>
                setAllParts(
                    r.data.map((it) => ({
                        id: it.id,
                        description: it.description,
                        stock: it.quantity,
                        unit_price: it.price,
                    }))
                )
            )
            .catch(() => setAllParts([]));
        fetchAttendanceParts();

        // Serviços
        api
            .get("/services")
            .then((r) =>
                setAttendanceServices(
                    r.data.filter((s) => s.attendance_id === Number(id))
                )
            )
            .catch(() => setAttendanceServices([]));
    }, [attendance, id]);

    const fetchAttendanceParts = () => {
        api
            .get(`/attendances/${id}/parts`)
            .then((r) => setAttendanceParts(r.data))
            .catch(() => setAttendanceParts([]));
    };

    /* ──────────── Handlers Tabs ──────────── */
    const handleTabChange = (_, newIndex) => setTabIndex(newIndex);

    /* ──────────── Checklists ──────────── */
    const handleOpenChkDialog = () => setOpenChkDialog(true);
    const handleCloseChkDialog = () => {
        setOpenChkDialog(false);
        setTemplateId("");
        setTemplatesFields({});
        setEquipmentName("");
        setEntryType("entrada");
        setValues({});
        setSelectedFiles([]);
    };

    const handleTemplateChange = (e) => {
        const chosenId = Number(e.target.value);
        setTemplateId(chosenId);
        const tpl = allTemplates.find((t) => t.id === chosenId);
        if (tpl) {
            setTemplatesFields(tpl);
            const initial = {};
            tpl.fields.forEach((f) => {
                initial[f.label] = f.type === "boolean" ? false : "";
            });
            setValues(initial);
        } else {
            setTemplatesFields({});
            setValues({});
        }
    };

    const handleValueChange = (label, type, raw) => {
        const v = type === "number" ? (raw === "" ? "" : Number(raw)) : raw;
        setValues((prev) => ({ ...prev, [label]: v }));
    };

    const handleSubmitChecklist = () => {
        if (!templateId || !equipmentName.trim()) {
            alert("Selecione um template e informe equipamento.");
            return;
        }
        const invalid = templatesFields.fields?.some((f) => {
            if (f.type === "boolean") return false;
            const v = values[f.label];
            return v === undefined || v === "";
        });
        if (invalid) {
            alert("Preencha todos os campos do checklist.");
            return;
        }

        const payload = {
            template_id: templateId,
            equipment_name: equipmentName,
            entry_type: entryType,
            values,
            attendance_id: Number(id),
            client_id: attendance.client_id,
        };

        api
            .post("/checklist/entries", payload)
            .then(async (res) => {
                const entryId = res.data.id;
                if (selectedFiles.length) {
                    const formData = new FormData();
                    selectedFiles.forEach((file) => formData.append("files", file));
                    await api.post(
                        `/checklist/entries/${entryId}/attachments`,
                        formData,
                        { headers: { "Content-Type": "multipart/form-data" } }
                    );
                }
                return api.get(`/attendances/${id}/checklist-entries`);
            })
            .then((r) => {
                setEntries(r.data);
                handleCloseChkDialog();
            })
            .catch(() => alert("Erro ao salvar o checklist."));
    };

    const handleDeleteEntry = (entryId) => {
        if (!window.confirm("Deseja realmente excluir esta entrada?")) return;
        api
            .delete(`/checklist/entries/${entryId}`)
            .then(() => setEntries((arr) => arr.filter((e) => e.id !== entryId)))
            .catch(() => alert("Erro ao excluir entry."));
    };

    /* ──────────── Peças ──────────── */
    const handleOpenPartsDialog = () => setOpenPartsDialog(true);
    const handleClosePartsDialog = () => {
        setOpenPartsDialog(false);
        setSelectedPart(null);
        setSelectedQty(1);
    };

    const handleSubmitPart = () => {
        if (!selectedPart || selectedQty <= 0) {
            alert("Selecione peça e quantidade válida.");
            return;
        }
        api
            .post(`/attendances/${id}/parts`, {
                part_id: selectedPart.id,
                quantity: Number(selectedQty),
            })
            .then(() => {
                fetchAttendanceParts();
                handleClosePartsDialog();
            })
            .catch((err) =>
                alert(err.response?.data?.error || "Erro ao salvar peça.")
            );
    };

    const handleDeletePart = (attendancePartId) => {
        if (!window.confirm("Deseja remover esta peça?")) return;
        api
            .delete(`/attendances/${id}/parts/${attendancePartId}`)
            .then(() => fetchAttendanceParts())
            .catch(() => alert("Erro ao excluir peça."));
    };

    /* ──────────── Serviços ──────────── */
    const handleOpenServiceDialog = () => setOpenServiceDialog(true);
    const handleCloseServiceDialog = () => {
        setOpenServiceDialog(false);
        setNewServiceDescription("");
        setNewServicePrice("");
    };

    const handleSubmitService = () => {
        if (!newServiceDescription.trim() || newServicePrice === "") {
            alert("Informe descrição e preço válidos.");
            return;
        }
        api
            .post("/services", {
                description: newServiceDescription.trim(),
                price: Number(newServicePrice),
                attendance_id: Number(id),
            })
            .then(() =>
                api.get("/services").then((r) =>
                    setAttendanceServices(
                        r.data.filter((s) => s.attendance_id === Number(id))
                    )
                )
            )
            .then(handleCloseServiceDialog)
            .catch(() => alert("Erro ao criar serviço."));
    };

    const handleDeleteService = (serviceId) => {
        if (!window.confirm("Deseja remover este serviço?")) return;
        api
            .delete(`/services/${serviceId}`)
            .then(() =>
                setAttendanceServices((arr) => arr.filter((s) => s.id !== serviceId))
            )
            .catch(() => alert("Erro ao excluir serviço."));
    };

    /* ──────────── Render ──────────── */
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }
    if (!attendance) {
        return <Typography sx={{ mt: 4 }}>Atendimento não encontrado.</Typography>;
    }

    const totalGeral = attendanceParts.reduce((sum, i) => sum + i.subtotal, 0);
    const totalServicos = attendanceServices.reduce(
        (s, srv) => s + srv.price,
        0
    );

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            {/* topo */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">
                    O.S. #{attendance.id} – {attendance.client_name}
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => navigate("/attendances")}
                    >
                        Voltar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() =>
                            api
                                .get(`/attendances/${attendance.id}/report`, {
                                    responseType: "blob",
                                })
                                .then((res) => {
                                    const url = URL.createObjectURL(
                                        new Blob([res.data], { type: "application/pdf" })
                                    );
                                    window.open(url);
                                })
                                .catch(() => alert("Falha ao gerar PDF."))
                        }
                    >
                        Gerar PDF
                    </Button>
                </Box>
            </Box>

            {/* abas */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
                <Tabs value={tabIndex} onChange={handleTabChange}>
                    <Tab label="Dados Gerais" />
                    <Tab label="Checklists" />
                    <Tab label="Peças" />
                    <Tab label="Serviços" />
                </Tabs>
            </Box>

            {/* Aba 0 */}
            <TabPanel value={tabIndex} index={0}>
                <Paper sx={{ p: 2 }}>
                    <Typography>
                        <strong>Cliente:</strong> {attendance.client_name}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                        <strong>Data:</strong>{" "}
                        {attendance.attendance_date.split("-").reverse().join("/")}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                        <strong>Horário:</strong> {attendance.start_time} –{" "}
                        {attendance.end_time}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                        <strong>Técnico:</strong> {attendance.technician_name || "—"}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                        <strong>Status:</strong> {attendance.status}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                        <strong>Descrição:</strong> {attendance.description || "—"}
                    </Typography>
                    <Box mt={2}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(`/attendances/${id}/edit`)}
                        >
                            Editar Dados Básicos
                        </Button>
                    </Box>
                </Paper>
            </TabPanel>

            {/* Aba 1 – Checklists */}
            <TabPanel value={tabIndex} index={1}>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenChkDialog}
                    >
                        Nova Entrada de Checklist
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>ID</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Template</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Equipamento</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Tipo</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Criado Em</strong>
                                </TableCell>
                                <TableCell align="center">
                                    <strong>Ações</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {entries.length ? (
                                entries.map((e) => (
                                    <TableRow
                                        key={e.id}
                                        hover
                                        onClick={() => navigate(`/checklist/${e.id}`)}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        <TableCell>{e.id}</TableCell>
                                        <TableCell>{e.template_id}</TableCell>
                                        <TableCell>{e.equipment_name}</TableCell>
                                        <TableCell>{e.entry_type}</TableCell>
                                        <TableCell>
                                            {new Date(e.created_at).toLocaleString("pt-BR")}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Excluir">
                                                <IconButton
                                                    onClick={(ev) => {
                                                        ev.stopPropagation();
                                                        handleDeleteEntry(e.id);
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Nenhuma entrada de checklist vinculada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Dialog checklist */}
                <Dialog
                    open={openChkDialog}
                    onClose={handleCloseChkDialog}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Nova Entrada de Checklist</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Template</InputLabel>
                            <Select
                                value={templateId}
                                label="Template"
                                onChange={handleTemplateChange}
                            >
                                <MenuItem value="">
                                    <em>Selecione</em>
                                </MenuItem>
                                {allTemplates.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {t.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Equipamento"
                            value={equipmentName}
                            onChange={(e) => setEquipmentName(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={entryType}
                                label="Tipo"
                                onChange={(e) => setEntryType(e.target.value)}
                            >
                                <MenuItem value="entrada">Entrada</MenuItem>
                                <MenuItem value="saida">Saída</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ mb: 2 }}>
                            <Button variant="outlined" component="label">
                                Selecionar Imagens
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                                />
                            </Button>
                            {selectedFiles.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                    {selectedFiles.map((file, idx) => (
                                        <Typography key={idx} variant="body2">
                                            {file.name}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        {templatesFields.fields?.map((field, idx) => (
                            <Paper
                                key={idx}
                                sx={{ p: 2, mb: 2, display: "flex", alignItems: "center" }}
                                variant="outlined"
                            >
                                <Typography sx={{ width: 140 }}>{field.label}</Typography>
                                {field.type === "text" && (
                                    <TextField
                                        fullWidth
                                        value={values[field.label] || ""}
                                        onChange={(e) =>
                                            handleValueChange(
                                                field.label,
                                                field.type,
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                                {field.type === "number" && (
                                    <TextField
                                        fullWidth
                                        type="number"
                                        value={values[field.label] || ""}
                                        onChange={(e) =>
                                            handleValueChange(
                                                field.label,
                                                field.type,
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                                {field.type === "boolean" && (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={values[field.label] || false}
                                                onChange={(e) =>
                                                    handleValueChange(
                                                        field.label,
                                                        field.type,
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Sim"
                                    />
                                )}
                            </Paper>
                        ))}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseChkDialog}>Cancelar</Button>
                        <Button variant="contained" onClick={handleSubmitChecklist}>
                            Salvar
                        </Button>
                    </DialogActions>
                </Dialog>
            </TabPanel>

            {/* Aba 2 – Peças */}
            <TabPanel value={tabIndex} index={2}>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenPartsDialog}
                    >
                        Vincular Peça
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>ID</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Descrição</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Qtd</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Valor Unitário</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Subtotal</strong>
                                </TableCell>
                                <TableCell align="center">
                                    <strong>Ações</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceParts.length ? (
                                attendanceParts.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.id}</TableCell>
                                        <TableCell>{p.description}</TableCell>
                                        <TableCell>{p.quantity}</TableCell>
                                        <TableCell>R$ {p.unit_price.toFixed(2)}</TableCell>
                                        <TableCell>R$ {p.subtotal.toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Excluir">
                                                <IconButton onClick={() => handleDeletePart(p.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Nenhuma peça vinculada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Typography variant="h6">
                        <strong>Total Orçado:</strong> R$ {totalGeral.toFixed(2)}
                    </Typography>
                </Box>

                {/* Dialog Peças */}
                <Dialog
                    open={openPartsDialog}
                    onClose={handleClosePartsDialog}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Vincular Peça à O.S.</DialogTitle>
                    <br />
                    <DialogContent>
                        <Autocomplete
                            fullWidth
                            options={allParts}
                            value={selectedPart}
                            onChange={(_, val) => setSelectedPart(val)}
                            getOptionLabel={(o) =>
                                o ? `${o.id} – ${o.description}` : ""
                            }
                            filterOptions={(opts, state) =>
                                opts.filter((o) =>
                                    `${o.id} ${o.description}`
                                        .toLowerCase()
                                        .includes(state.inputValue.toLowerCase())
                                )
                            }
                            isOptionEqualToValue={(opt, val) => opt.id === val.id}
                            noOptionsText="Nenhuma peça encontrada"
                            renderOption={(props, o) => (
                                <li {...props} key={o.id}>
                                    <Box display="flex" flexDirection="column">
                                        <Typography variant="body2">
                                            {o.id} – {o.description}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Estoque: {o.stock} | R$ {o.unit_price.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField {...params} label="Peça" sx={{ mb: 2 }} />
                            )}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            margin="normal"
                            label="Quantidade"
                            value={selectedQty}
                            onChange={(e) =>
                                setSelectedQty(Math.max(1, Number(e.target.value)))
                            }
                            InputProps={{ inputProps: { min: 1 } }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClosePartsDialog}>Cancelar</Button>
                        <Button variant="contained" onClick={handleSubmitPart}>
                            Adicionar
                        </Button>
                    </DialogActions>
                </Dialog>
            </TabPanel>

            {/* Aba 3 – Serviços */}
            <TabPanel value={tabIndex} index={3}>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenServiceDialog}
                    >
                        Adicionar Serviço
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>ID</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Descrição</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Preço (R$)</strong>
                                </TableCell>
                                <TableCell align="center">
                                    <strong>Ações</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceServices.length ? (
                                attendanceServices.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>{s.id}</TableCell>
                                        <TableCell>{s.description}</TableCell>
                                        <TableCell>{s.price.toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Excluir">
                                                <IconButton onClick={() => handleDeleteService(s.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Nenhum serviço vinculado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Typography variant="h6">
                        <strong>Total Serviços:</strong> R$ {totalServicos.toFixed(2)}
                    </Typography>
                </Box>

                {/* Dialog Serviço */}
                <Dialog
                    open={openServiceDialog}
                    onClose={handleCloseServiceDialog}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Adicionar Serviço à O.S.</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Descrição do Serviço"
                            value={newServiceDescription}
                            onChange={(e) => setNewServiceDescription(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Preço (R$)"
                            type="number"
                            inputProps={{ step: "0.01" }}
                            value={newServicePrice}
                            onChange={(e) => setNewServicePrice(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseServiceDialog}>Cancelar</Button>
                        <Button variant="contained" onClick={handleSubmitService}>
                            Salvar
                        </Button>
                    </DialogActions>
                </Dialog>
            </TabPanel>
        </Container>
    );
}
