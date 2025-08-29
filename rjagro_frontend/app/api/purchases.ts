import { Purchase, PurchasePayload } from '../types/interfaces';
import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchPurchases = async (): Promise<Purchase[]> => {
    const response = await api.get('/getall/purchases');
    return response.data;
};

export const handleAddPurchase = async (
    payload: PurchasePayload,
    queryClient: any,
    setLoading: (loading: boolean) => void
) => {
    if (
        !payload.item_code ||
        !payload.cost_per_unit ||
        !payload.total_cost ||
        !payload.purchase_date ||
        !payload.supplier ||
        !payload.created_by ||
        !payload.inventory_account_id ||
        !payload.payment_account_id
    ) {
        toast.error('Please fill in all required fields');
        return;
    }

    setLoading(true);
    toast.info('Adding purchase...');

    try {
        await api.post('/insert/purchases', payload);
        // Invalidate cache -> refetch purchases
        queryClient.invalidateQueries(['purchases']);
        toast.success('Purchase added successfully!');
    } catch (error) {
        console.error('Error adding purchase:', error);
        toast.error('Error adding purchase');
    } finally {
        setLoading(false);
    }
};

