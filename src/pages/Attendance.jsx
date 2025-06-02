// src/pages/Attendance.jsx
import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Tooltip,
    Pagination,
    Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Attendance() {
    const [attendances, setAttendances] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    // Converte "HH:MM" em minutos para validar conflitos (mesma lógica que antes)
    const timeStringToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
    };

    // Fetch inicial
    useEffect(() => {
        fetchAttendances();
    }, []);

    const fetchAttendances = async () => {
        try {
            const res = await api.get("/attendances");
            setAttendances(res.data);
        } catch (err) {
            console.error("Erro ao buscar atendimentos:", err);
            setAttendances([]);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Deseja realmente excluir este atendimento?")) return;
        try {
            await api.delete(`/attendances/${id}`);
            fetchAttendances();
        } catch (err) {
            console.error("Erro ao deletar atendimento:", err);
            alert("Falha ao excluir. Confira o console.");
        }
    };

    // Paginação
    const totalPages = Math.ceil(attendances.length / itemsPerPage);
    const paginated = attendances.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
            >
                <Typography variant="h4">Ordens de Serviço</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/attendances/new")}
                >
                    Nova O.S.
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Cliente</strong></TableCell>
                            <TableCell><strong>Técnico</strong></TableCell>
                            <TableCell><strong>Data</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Descrição</strong></TableCell>
                            <TableCell align="center"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginated.map((a) => (
                            <TableRow key={a.id}>
                                <TableCell>{a.client_name}</TableCell>
                                <TableCell>{a.technician_name || "—"}</TableCell>
                                <TableCell>
                                    <Tooltip
                                        title={
                                            <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                                                Horário: {a.start_time} – {a.end_time}
                                            </span>
                                        }
                                    >
                                        <span>
                                            {a.attendance_date.split("-").reverse().join("/")}
                                        </span>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={a.status}
                                        color={
                                            a.status === "Concluída"
                                                ? "success"
                                                : a.status === "Cancelada"
                                                    ? "error"
                                                    : "warning"
                                        }
                                    />
                                </TableCell>
                                <TableCell>{a.description || "—"}</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => navigate(`/attendances/${a.id}`)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton onClick={() => navigate(`/attendances/${a.id}/edit`)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(a.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(e, page) => setCurrentPage(page)}
                        color="primary"
                    />
                </Box>
            )}
        </Container>
    );
}
