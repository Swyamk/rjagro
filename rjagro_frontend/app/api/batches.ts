import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchBatches = async (setBatches: (data: Batch[]) => void, setLoading?: (loading: boolean) => void) => {
    setLoading?.(true);
    try {
        const response = await api.get('/getall/batches');
        setBatches(response.data);
    } catch (error) {
        console.error('Error fetching batches:', error);
    } finally {
        setLoading?.(false);
    }
};

export const handleAddBatch = async (
    payload: BatchPayload,
    setBatches: (data: Batch[]) => void,
    setLoading: (loading: boolean) => void,
    onSuccess?: () => void,
    onError?: (error: any) => void
) => {
    if (!payload.line_id || !payload.supervisor_id || !payload.farmer_id || !payload.initial_bird_count) {
        toast.error('Please fill in all required fields');
        return;
    }

    setLoading(true);
    toast.info('Adding batch...');
    try {
        const response = await api.post('/insert/batches', payload);
        console.log('Batch added:', response.data);

        await fetchBatches(setBatches, setLoading);

        toast.success('Batch added successfully!');
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error('Error adding batch:', error);
        toast.error('Error adding batch');
        if (onError) onError(error);
    } finally {
        setLoading(false);
    }
};
