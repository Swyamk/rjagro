import { Trader } from '../types/interfaces';
import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchTraders = async (): Promise<Trader[]> => {
  const response = await api.get('/getall/traders');
  return response.data;
};

export const handleAddTrader = async (
  payload: TraderPayload,
  queryClient: any,
  setLoading: (loading: boolean) => void
) => {
  if (
    !payload.name ||
    !payload.phone_number ||
    !payload.address ||
    !payload.bank_account_no ||
    !payload.bank_name ||
    !payload.ifsc_code ||
    !payload.area
  ) {
    toast.error('Please fill in all required fields');
    return;
  }

  setLoading(true);
  toast.info('Adding trader...');

  try {
    await api.post('/insert/traders', payload);

    // Invalidate cache so traders list refetches automatically
    queryClient.invalidateQueries(['traders']);

    toast.success('Trader added successfully!');
  } catch (error) {
    console.error('Error adding trader:', error);
    toast.error('Error adding trader');
  } finally {
    setLoading(false);
  }
};


export interface TraderPayload {
  name: string;
  phone_number: string;
  address: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
  area: string;
}
