// src/pages/ChecklistTemplateForm.jsx
import React, { useState } from "react";
import {
    Container,
    Typography,
    TextField,
    Button,
    IconButton,
    MenuItem,
    Box,
    Paper,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import api from "../services/api";

export default function ChecklistTemplateForm() {
    const [templateName, setTemplateName] = useState("");
    const [fields, setFields] = useState([
        { label: "", type: "text" },
    ]);

    const handleAddField = () => {
        setFields([...fields, { label: "", type: "text" }]);
    };

    const handleRemoveField = (index) => {
        const copy = [...fields];
        copy.splice(index, 1);
        setFields(copy);
    };

    const handleFieldChange = (index, key, value) => {
        const copy = [...fields];
        copy[index][key] = value;
        setFields(copy);
    };

    const handleSubmit = async () => {
        if (!templateName.trim() || fields.some(f => !f.label.trim())) {
            alert("Preencha nome do template e todos os labels.");
            return;
        }
        try {
            const payload = {
                name: templateName,
                client_id: /* ID do cliente (pode vir de contexto ou rota) */ 1,
                fields,
            };
            await api.post("/checklist/templates", payload);
            alert("Template criado com sucesso!");
            setTemplateName("");
            setFields([{ label: "", type: "text" }]);
        } catch (err) {
            console.error(err);
            alert("Erro ao criar template.");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Criar Template de Checklist
            </Typography>

            <TextField
                fullWidth
                label="Nome do Template"
                margin="normal"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
            />

            {fields.map((field, idx) => (
                <Paper
                    key={idx}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        mb: 2,
                    }}
                    variant="outlined"
                >
                    <TextField
                        label="Label"
                        value={field.label}
                        onChange={(e) =>
                            handleFieldChange(idx, "label", e.target.value)
                        }
                        sx={{ flex: 1, mr: 2 }}
                    />

                    <TextField
                        select
                        label="Tipo"
                        value={field.type}
                        onChange={(e) =>
                            handleFieldChange(idx, "type", e.target.value)
                        }
                        sx={{ width: 140, mr: 2 }}
                    >
                        <MenuItem value="text">Texto</MenuItem>
                        <MenuItem value="number">Número</MenuItem>
                        <MenuItem value="boolean">Checkbox</MenuItem>
                    </TextField>

                    <IconButton
                        color="error"
                        onClick={() => handleRemoveField(idx)}
                        disabled={fields.length === 1}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Paper>
            ))}

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddField}
                >
                    Adicionar Campo
                </Button>
            </Box>

            <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
            >
                Salvar Template
            </Button>
        </Container>
    );
}
