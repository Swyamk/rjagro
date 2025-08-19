import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchInventory = async (): Promise<Inventory[]> => {
    const response = await api.get('/getall/inventory');
    return response.data;
};

export const handleAddInventory = async (
    payload: InventoryPayload,
    queryClient: any,
    setLoading: (loading: boolean) => void,
    onSuccess?: () => void
) => {
    if (!payload.item_code || !payload.current_qty) {
        toast.error('Please fill in all required fields');
        return;
    }

    setLoading(true);
    toast.info('Adding inventory...');

    try {
        await api.post('/insert/inventory', payload);

        queryClient.invalidateQueries(['inventory']);

        toast.success('Inventory added successfully!');
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error('Error adding inventory:', error);
        toast.error('Error adding inventory');
    } finally {
        setLoading(false);
    }
};

export const handleUpdateInventory = async (
    item_code: string,
    payload: { current_qty: number },
    queryClient: any
) => {
    try {
        await api.put(`/update/inventory/${item_code}`, payload);

        queryClient.invalidateQueries(['inventory']);

        toast.success('Inventory updated successfully!');
    } catch (error) {
        console.error('Error updating inventory:', error);
        toast.error('Error updating inventory');
    }
};
