import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete, Add, Warning, BorderColor, Close } from '@mui/icons-material';
import { useSupplies, useDeleteSupply } from '../hooks/useSupplies';
import SupplyForm from './SupplyForm';
import { SupplyItem } from '../types/types';

const SupplyList: React.FC = () => {
  const { data: supplies, isLoading, error } = useSupplies();
  const deleteMutation = useDeleteSupply();
  const [openForm, setOpenForm] = useState(false);
  const [changedSupply, setChangedSupply] = useState<SupplyItem | null>(null);

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleChange = (supply: SupplyItem) => {
    setChangedSupply(supply)
  }

  const getStockStatus = (supply: SupplyItem) => {
    if (supply.quantity === 0) return { label: 'Нет в наличии', color: 'error' as const };
    if (supply.quantity <= supply.min_quantity) return { label: 'Мало', color: 'warning' as const };
    return { label: 'В наличии', color: 'success' as const };
  };

  if (isLoading) return <Typography>Загрузка...</Typography>;
  if (error) return <Typography color="error">Ошибка при получении данных!</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Расходные материалы
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          Добавить материал
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Модель</TableCell>
              <TableCell align="center">Количество</TableCell>
              <TableCell align="center">Мин. запас</TableCell>
              <TableCell>Ед. изм.</TableCell>
              <TableCell>Местоположение</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {supplies?.map((supply) => {
              const status = getStockStatus(supply);
              return (
                <TableRow
                  key={supply.id}
                  sx={{
                    backgroundColor: supply.quantity <= supply.min_quantity ? '#fff3e0' : 'inherit',
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {supply.quantity <= supply.min_quantity && (
                        <Warning color="warning" sx={{ mr: 1 }} />
                      )}
                      {supply.name}
                    </Box>
                  </TableCell>
                  <TableCell>{supply.type}</TableCell>
                  <TableCell>{supply.model}</TableCell>
                  <TableCell align="center">
                    <Typography
                      fontWeight="bold"
                      color={supply.quantity <= supply.min_quantity ? 'warning.main' : 'inherit'}
                    >
                      {supply.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{supply.min_quantity}</TableCell>
                  <TableCell>{supply.unit}</TableCell>
                  <TableCell>{supply.location}</TableCell>
                  <TableCell>
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="default"
                      onClick={() => handleChange(supply)}
                      disabled={deleteMutation.isPending}
                    > 
                      <BorderColor />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(supply.id)}
                      disabled={deleteMutation.isPending}
                    >
                      
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Форма для добавления нового материала */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogActions sx={{display: "flex", justifyContent: "space-between"}}>
          <DialogTitle>Добавить новый материал</DialogTitle>
          <Button color="secondary" onClick={() => setOpenForm(false)}><Close sx={{fontSize: 30}} /></Button>
        </DialogActions>
        <DialogContent >
          <SupplyForm onSuccess={() => setOpenForm(false)} />
        </DialogContent>
        
      </Dialog>
      
      {/* Форма для изменения материала */}
      <Dialog
        open={!!changedSupply}
        onClose={() => setChangedSupply(null)}
        maxWidth="md"
        fullWidth
      >
        
        <DialogActions  sx={{display: "flex", justifyContent: "space-between"}}>
          <DialogTitle>Изменение материала</DialogTitle>
          <Button color="secondary" onClick={() => setChangedSupply(null)}><Close sx={{fontSize: 30}} /></Button>
        </DialogActions>
        <DialogContent >
          <SupplyForm defaultValues={changedSupply} onSuccess={() => setChangedSupply(null)} />
        </DialogContent>
        
      </Dialog>
    </Box>
  );
};

export default SupplyList;