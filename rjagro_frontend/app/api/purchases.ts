import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchPurchases = async (setPurchases: (data: any) => void, setLoading: (loading: boolean) => void) => {
    setLoading(true);
    try {
        const response = await api.get('/getall/purchases');
        setPurchases(response.data);
    } catch (error) {
        console.error('Error fetching purchases:', error);
    } finally {
        setLoading(false);
    }
};

export const handleAddPurchase = async (
    payload: PurchasePayload,
    setPurchases: (data: any) => void,
    setLoading: (loading: boolean) => void,
    onSuccess?: () => void,
    onError?: (error: any) => void
) => {
    // Validate required fields
    if (
        !payload.item_code ||
        !payload.cost_per_unit ||
        !payload.total_cost ||
        !payload.purchase_date ||
        !payload.supplier ||
        !payload.created_by
    ) {
        toast.error('Please fill in all required fields');
        return;
    }

    setLoading(true);
    toast.info('Adding purchase...');
    try {
        const response = await api.post('/insert/purchases', payload);
        console.log('Purchase added:', response.data);

        await fetchPurchases(setPurchases, setLoading);

        toast.success('Purchase added successfully!');
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error('Error adding purchase:', error);
        toast.error('Error adding purchase');
        if (onError) onError(error);
    } finally {
        setLoading(false);
    }
};

export interface PurchasePayload {
    item_code: string;
    cost_per_unit: number;
    total_cost: number;
    purchase_date: string;
    supplier: string;
    created_by: number;
}