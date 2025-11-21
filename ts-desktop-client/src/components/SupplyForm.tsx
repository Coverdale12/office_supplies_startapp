import React from 'react';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { CreateSupplyData } from '../types/types';
import { useCreateSupply } from '../hooks/useSupplies';

interface SupplyFormProps {
  onSuccess: () => void;
}

const SupplyForm: React.FC<SupplyFormProps> = ({ onSuccess }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<CreateSupplyData>({
    defaultValues: {
      name: '',
      type: '',
      model: '',
      quantity: 0,
      min_quantity: 0,
      unit: 'шт',
      location: ''
    }
  });

  const createMutation = useCreateSupply();

  const onSubmit = (data: CreateSupplyData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  const unitTypes = ['шт', 'пачка', 'упаковка', 'литр', 'кг'];
  const supplyTypes = ['Картридж', 'Тонер', 'Бумага', 'Ролик', 'Другое'];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Название обязательно' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Название"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Тип обязателен' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Тип"
                fullWidth
                error={!!errors.type}
                helperText={errors.type?.message}
              >
                {supplyTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="model"
            control={control}
            rules={{ required: 'Модель обязательна' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Модель"
                fullWidth
                error={!!errors.model}
                helperText={errors.model?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="unit"
            control={control}
            rules={{ required: 'Единица измерения обязательна' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Единица измерения"
                fullWidth
                error={!!errors.unit}
                helperText={errors.unit?.message}
              >
                {unitTypes.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="quantity"
            control={control}
            rules={{ 
              required: 'Количество обязательно',
              min: { value: 0, message: 'Количество не может быть отрицательным' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Количество"
                fullWidth
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="min_quantity"
            control={control}
            rules={{ 
              required: 'Минимальное количество обязательно',
              min: { value: 0, message: 'Минимальное количество не может быть отрицательным' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Минимальный запас"
                fullWidth
                error={!!errors.min_quantity}
                helperText={errors.min_quantity?.message}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Местоположение"
                fullWidth
                error={!!errors.location}
                helperText={errors.location?.message}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Создание...' : 'Создать'}
        </Button>
      </Box>
    </Box>
  );
};

export default SupplyForm;