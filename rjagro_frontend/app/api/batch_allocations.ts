import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchBatchAllocations = async (
    setBatchAllocations: (data: BatchAllocation[]) => void,
    setLoading: (loading: boolean) => void
) => {
    setLoading(true);
    try {
        const response = await api.get('/getall/batch_allocations');
        setBatchAllocations(response.data);
    } catch (error) {
        console.error('Error fetching batch allocations:', error);
    } finally {
        setLoading(false);
    }
};
