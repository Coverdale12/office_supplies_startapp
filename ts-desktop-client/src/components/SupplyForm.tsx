import React from 'react';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { CreateSupplyData, SupplyItem } from '../types/types';
import { useCreateSupply, useUpdateSupply } from '../hooks/useSupplies';

interface SupplyFormProps {
  onSuccess: () => void;
  defaultValues?: SupplyItem | null;
}

const SupplyForm: React.FC<SupplyFormProps> = ({ onSuccess, defaultValues }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<CreateSupplyData>(defaultValues ? 
    {defaultValues: defaultValues} : {
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

  const updateMutation = useUpdateSupply();

  const onSubmit = (data: CreateSupplyData) => {
    if(!defaultValues){
      createMutation.mutate(data, {
        onSuccess: () => {
          onSuccess();
        }
      });
      return
    }
    updateMutation.mutate({ id: defaultValues.id, data }, {
      onSuccess: () => {
        onSuccess();
      }
    })
    
  };

  const unitTypes = ['шт', 'пачка', 'упаковка', 'литр', 'кг'];
  const supplyTypes = ['Картридж', 'Тонер', 'Бумага', 'Ролик', 'Другое'];

  return (
    <Box component="form"  onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
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
                color='secondary'
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
                color='secondary'
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
                color='secondary'
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
                color='secondary'
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
                color='secondary'
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
                color='secondary'
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
                color='secondary'
                error={!!errors.location}
                helperText={errors.location?.message}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        
        {!defaultValues ? <Button
          type="submit"
          variant="contained"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Создание...' : 'Создать'}
        </Button> : <Button
          type="submit"
          variant="contained"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Изменение...' : 'Изменить'}
        </Button>}
      </Box>
    </Box>
  );
};

export default SupplyForm;