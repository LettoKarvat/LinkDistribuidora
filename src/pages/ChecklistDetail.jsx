// src/pages/ChecklistDetail.jsx

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    Grid,
    Dialog,
    DialogContent,
    IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ChecklistDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado para controlar o Dialog de imagem ampliada
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [currentImage, setCurrentImage] = useState('');

    useEffect(() => {
        fetchEntry();
        // eslint-disable-next-line
    }, [id]);

    const fetchEntry = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/checklist/entries/${id}`);
            setEntry(res.data);
        } catch (err) {
            console.error('Erro ao buscar detalhe do checklist:', err);
            navigate('/checklist/list');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenImage = (dataUrl) => {
        setCurrentImage(dataUrl);
        setOpenImageDialog(true);
    };

    const handleCloseImage = () => {
        setOpenImageDialog(false);
        setCurrentImage('');
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!entry) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Typography>Checklist não encontrado.</Typography>
            </Container>
        );
    }

    // Converte entry.values em array de [ [label, valor], ... ]
    const fields = Object.entries(entry.values);
    // entry.attachments agora é lista de data-URIs (strings base64)
    const attachments = entry.attachments || [];

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Detalhes do Checklist (ID: {entry.id})
            </Typography>
            <Paper sx={{ p: 2, mt: 2, backgroundColor: '#262626', color: '#fff' }}>
                <Typography variant="subtitle1" gutterBottom>
                    Equipamento: {entry.equipment_name}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Cliente: {entry.client_name || '—'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Tipo:{' '}
                    {entry.entry_type === 'entrada' ? 'Entrada' : 'Saída'}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                    Criado em:{' '}
                    {new Date(entry.created_at).toLocaleString('pt-BR')}
                </Typography>

                <Divider sx={{ my: 2, borderColor: '#555' }} />

                <Typography variant="subtitle1" gutterBottom>
                    Campos Preenchidos:
                </Typography>
                <List>
                    {fields.map(([label, valor], idx) => (
                        <ListItem key={idx} disablePadding>
                            <ListItemText
                                primary={label}
                                secondary={
                                    typeof valor === 'boolean'
                                        ? valor
                                            ? 'Sim'
                                            : 'Não'
                                        : String(valor)
                                }
                            />
                        </ListItem>
                    ))}
                </List>

                {attachments.length > 0 && (
                    <>
                        <Divider sx={{ my: 2, borderColor: '#555' }} />
                        <Typography variant="subtitle1" gutterBottom>
                            Anexos:
                        </Typography>
                        <Grid container spacing={2}>
                            {attachments.map((dataUrl, idx) => (
                                <Grid item xs={12} sm={6} key={idx}>
                                    {/* 
                    Quando o usuário clicar na imagem, abrimos o Dialog
                    passando a própria string base64 (dataUrl) para currentImage
                  */}
                                    <Box
                                        component="img"
                                        src={dataUrl}
                                        alt={`Anexo ${idx + 1}`}
                                        onClick={() => handleOpenImage(dataUrl)}
                                        sx={{
                                            width: '100%',
                                            maxHeight: 200,
                                            objectFit: 'contain',
                                            border: '1px solid #444',
                                            borderRadius: 1,
                                            p: 0.5,
                                            backgroundColor: '#000',
                                            cursor: 'pointer', // indica que é clicável
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'block',
                                            mt: 0.5,
                                            textAlign: 'center',
                                        }}
                                    >
                                        Anexo {idx + 1}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
            </Paper>

            {/* -------------------------------------------------------------
          Dialog para exibir a imagem em tamanho maior
      -------------------------------------------------------------- */}
            <Dialog
                open={openImageDialog}
                onClose={handleCloseImage}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                    },
                }}
            >
                {/* Botão de fechar no canto superior direito */}
                <IconButton
                    onClick={handleCloseImage}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: '#fff',
                        zIndex: 1,
                    }}
                >
                    <CloseIcon fontSize="large" />
                </IconButton>

                <DialogContent
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        p: 0,
                    }}
                >
                    {/* Exibe a imagem em maior dimensão, mantendo proporção */}
                    <Box
                        component="img"
                        src={currentImage}
                        alt="Imagem ampliada"
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
}
