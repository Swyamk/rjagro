import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchProductionLines = async (
    setProductionLines: (data: any) => void,
    setLoading?: (loading: boolean) => void
) => {
    setLoading?.(true);
    try {
        const response = await api.get('/getall/production_lines');
        setProductionLines(response.data);
    } catch (error) {
        console.error('Error fetching production lines:', error);
    } finally {
        setLoading?.(false);
    }
};

export const handleAddProductionLine = async (
    payload: ProductionLinePayload,
    setProductionLines: (data: any) => void,
    setLoading: (loading: boolean) => void,
    onSuccess?: () => void,
    onError?: (error: any) => void
) => {
    // Validate required fields
    if (!payload.line_name || !payload.supervisor_id) {
        toast.error('Please fill in all required fields');
        return;
    }

    setLoading(true);
    toast.info('Adding production line...');
    try {
        const response = await api.post('/insert/production_lines', payload);
        console.log('Production line added:', response.data);

        await fetchProductionLines(setProductionLines, setLoading);

        toast.success('Production line added successfully!');
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error('Error adding production line:', error);
        toast.error('Error adding production line');
        if (onError) onError(error);
    } finally {
        setLoading(false);
    }
};