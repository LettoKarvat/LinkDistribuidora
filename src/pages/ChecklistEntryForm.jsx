// src/pages/ChecklistEntryForm.jsx

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    MenuItem,
    Box,
    Paper,
    Autocomplete,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import api from '../services/api';

export default function ChecklistEntryForm() {
    const [templates, setTemplates] = useState([]);
    const [selectedTpl, setSelectedTpl] = useState(null);
    const [equipmentName, setEquipmentName] = useState('');
    const [entryType, setEntryType] = useState('entrada');
    const [values, setValues] = useState({});
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        fetchTemplates();
        fetchClients();
        // eslint-disable-next-line
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/checklist/templates');
            setTemplates(res.data);
        } catch (err) {
            console.error('Erro ao buscar templates:', err);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients');
            setClients(res.data);
        } catch (err) {
            console.error('Erro ao buscar clientes:', err);
        }
    };

    const handleTemplateChange = (e) => {
        const tpl = templates.find((t) => t.id === Number(e.target.value));
        setSelectedTpl(tpl);

        if (tpl) {
            const initial = {};
            tpl.fields.forEach((f) => {
                initial[f.label] = f.type === 'boolean' ? false : '';
            });
            setValues(initial);
        } else {
            setValues({});
        }
    };

    const handleValueChange = (label, type, raw) => {
        let v = raw;
        if (type === 'number') v = raw === '' ? '' : Number(raw);
        if (type === 'boolean') v = raw;
        setValues({ ...values, [label]: v });
    };

    const handleSubmit = async () => {
        if (!selectedTpl || !equipmentName.trim()) {
            alert('Selecione um template e informe equipamento.');
            return;
        }
        const invalid = selectedTpl.fields.some((f) => {
            if (f.type === 'boolean') return false;
            const v = values[f.label];
            return v === undefined || v === '';
        });
        if (invalid) {
            alert('Preencha todos os campos do checklist.');
            return;
        }

        try {
            const payload = {
                template_id: selectedTpl.id,
                equipment_name: equipmentName,
                entry_type: entryType,
                values,
                client_id: selectedClient ? selectedClient.id : null,
            };
            await api.post('/checklist/entries', payload);
            alert('Checklist enviado!');
            setSelectedTpl(null);
            setEquipmentName('');
            setEntryType('entrada');
            setValues({});
            setSelectedClient(null);
        } catch (err) {
            console.error('Erro ao enviar checklist:', err);
            alert('Falha ao enviar checklist.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Preencher Checklist
            </Typography>

            <TextField
                select
                fullWidth
                margin="normal"
                label="Template"
                value={selectedTpl?.id || ''}
                onChange={handleTemplateChange}
            >
                {templates.map((tpl) => (
                    <MenuItem key={tpl.id} value={tpl.id}>
                        {tpl.name}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                fullWidth
                margin="normal"
                label="Equipamento"
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
            />

            <TextField
                select
                fullWidth
                margin="normal"
                label="Tipo"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
            >
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
            </TextField>

            <Autocomplete
                options={clients}
                getOptionLabel={(option) => option.name}
                value={selectedClient}
                onChange={(_, newValue) => setSelectedClient(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Atribuir a Cliente (opcional)"
                        margin="normal"
                        fullWidth
                    />
                )}
                sx={{ mt: 2, mb: 2 }}
            />

            {selectedTpl?.fields.map((field, idx) => (
                <Paper
                    key={idx}
                    sx={{
                        p: 2,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    variant="outlined"
                >
                    <Typography sx={{ width: 140 }}>{field.label}</Typography>

                    {field.type === 'text' && (
                        <TextField
                            fullWidth
                            value={values[field.label] || ''}
                            onChange={(e) =>
                                handleValueChange(field.label, field.type, e.target.value)
                            }
                        />
                    )}

                    {field.type === 'number' && (
                        <TextField
                            fullWidth
                            type="number"
                            value={values[field.label] || ''}
                            onChange={(e) =>
                                handleValueChange(field.label, field.type, e.target.value)
                            }
                        />
                    )}

                    {field.type === 'boolean' && (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={values[field.label] || false}
                                    onChange={(e) =>
                                        handleValueChange(field.label, field.type, e.target.checked)
                                    }
                                />
                            }
                            label="Sim"
                        />
                    )}
                </Paper>
            ))}

            <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={!selectedTpl}
            >
                Enviar Checklist
            </Button>
        </Container>
    );
}
