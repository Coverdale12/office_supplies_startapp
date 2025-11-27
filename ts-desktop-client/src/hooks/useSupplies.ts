import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliesApi } from '../services/api';
import { CreateSupplyData } from '../types/types';
import { useSnackbar } from '../context/SnackbarContext';

export const useSupplies = () => {
  return useQuery({
    queryKey: ['supplies'],
    queryFn: suppliesApi.getAll,
  });
};

export const useSupply = (id: number) => {
  return useQuery({
    queryKey: ['supplies', id],
    queryFn: () => suppliesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSupply = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: suppliesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      showSnackbar('Материал успешно создан', 'success');
    },
    onError: () => {
      showSnackbar('Ошибка при создании материала', 'error');
    },
  });
};

export const useUpdateSupply = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSupplyData> }) =>
      suppliesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      showSnackbar('Материал успешно обновлен', 'success');
    },
    onError: () => {
      showSnackbar('Ошибка при обновлении материала', 'error');
    },
  });
};

export const useDeleteSupply = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: suppliesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      showSnackbar('Материал успешно удален', 'success');
    },
    onError: () => {
      showSnackbar('Ошибка при удалении материала', 'error');
    },
  });
};

export const useLowStockSupplies = () => {
  return useQuery({
    queryKey: ['supplies', 'low-stock'],
    queryFn: suppliesApi.getLowStock,
  });
};