// src/pages/AttendanceForm.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import api from "../services/api";

export default function AttendanceForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const isEdit = id && id !== "new";

    const [clients, setClients] = useState([]);
    const [technicians, setTechnicians] = useState([]);

    const [formData, setFormData] = useState({
        clientId: "",
        technicianId: "",
        attendanceDate: "",
        startTime: "",
        endTime: "",
        status: "Agendada",
        description: "",
    });

    const timeStringToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
    };

    useEffect(() => {
        api.get("/clients")
            .then((res) => setClients(res.data))
            .catch(() => setClients([]));

        api.get("/technicians")
            .then((res) => setTechnicians(res.data))
            .catch(() => setTechnicians([]));
    }, []);

    useEffect(() => {
        if (!isEdit) {
            return;
        }
        api.get(`/attendances/${id}`)
            .then((res) => {
                const a = res.data;
                setFormData({
                    clientId: a.client_id,
                    technicianId: a.technician_id || "",
                    attendanceDate: a.attendance_date,
                    startTime: a.start_time,
                    endTime: a.end_time,
                    status: a.status,
                    description: a.description || "",
                });
            })
            .catch(() => {
                alert("Atendimento não encontrado ou erro ao carregar dados.");
                navigate("/attendances", { replace: true });
            });
    }, [id, isEdit, navigate]);

    const handleSave = async () => {
        if (!formData.clientId) {
            alert("Escolha um Cliente.");
            return;
        }
        if (!formData.startTime || !formData.endTime) {
            alert("Informe horário de início e término.");
            return;
        }
        const newStartMin = timeStringToMinutes(formData.startTime);
        const newEndMin = timeStringToMinutes(formData.endTime);
        if (newStartMin >= newEndMin) {
            alert("Horário de início deve ser anterior ao término.");
            return;
        }

        const payload = {
            client_id: Number(formData.clientId),
            technician_id: formData.technicianId ? Number(formData.technicianId) : null,
            attendance_date: formData.attendanceDate,
            start_time: formData.startTime,
            end_time: formData.endTime,
            status: formData.status,
            description: formData.description,
        };

        try {
            if (isEdit) {
                await api.patch(`/attendances/${id}`, payload);
                navigate(`/attendances/${id}`);
            } else {
                const res = await api.post("/attendances", payload);
                navigate(`/attendances/${res.data.id}`);
            }
        } catch (err) {
            console.error("Erro ao salvar atendimento:", err);
            alert("Falha ao salvar. Verifique o console para mais detalhes.");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h5" mb={2}>
                {isEdit ? "Editar O.S." : "Nova O.S."}
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="label-client">Cliente</InputLabel>
                <Select
                    labelId="label-client"
                    value={formData.clientId}
                    label="Cliente"
                    onChange={(e) =>
                        setFormData({ ...formData, clientId: e.target.value })
                    }
                >
                    <MenuItem value="">
                        <em>Selecione</em>
                    </MenuItem>
                    {clients.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                            {c.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="label-technician">Técnico (opcional)</InputLabel>
                <Select
                    labelId="label-technician"
                    value={formData.technicianId}
                    label="Técnico (opcional)"
                    onChange={(e) =>
                        setFormData({ ...formData, technicianId: e.target.value })
                    }
                >
                    <MenuItem value="">
                        <em>Sem técnico</em>
                    </MenuItem>
                    {technicians.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                            {t.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
                <DatePicker
                    label="Data"
                    value={
                        formData.attendanceDate
                            ? parseISO(formData.attendanceDate)
                            : null
                    }
                    onChange={(newDate) => {
                        const formatted = newDate
                            ? format(newDate, "yyyy-MM-dd")
                            : "";
                        setFormData({ ...formData, attendanceDate: formatted });
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                        />
                    )}
                />
            </LocalizationProvider>
            <br />
            <br />
            <TextField
                fullWidth
                label="Horário de Início"
                type="time"
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                value={formData.startTime}
                onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                }
            />

            <TextField
                fullWidth
                label="Horário de Término"
                type="time"
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                value={formData.endTime}
                onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                }
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="label-status">Status</InputLabel>
                <Select
                    labelId="label-status"
                    value={formData.status}
                    label="Status"
                    onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                    }
                >
                    <MenuItem value="Agendada">Agendada</MenuItem>
                    <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                    <MenuItem value="Concluída">Concluída</MenuItem>
                    <MenuItem value="Cancelada">Cancelada</MenuItem>
                </Select>
            </FormControl>

            <TextField
                fullWidth
                label="Descrição"
                placeholder="Descreva brevemente o atendimento"
                multiline
                rows={3}
                sx={{ mb: 2 }}
                value={formData.description}
                onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                }
            />

            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    {isEdit ? "Salvar" : "Criar O.S."}
                </Button>
            </Box>
        </Container>
    );
}
