import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchTraders = async (
  setTraders: (data: any) => void,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true);
  try {
    const response = await api.get('/getall/traders');
    setTraders(response.data);
  } catch (error) {
    console.error('Error fetching traders:', error);
  } finally {
    setLoading(false);
  }
};

export const handleAddTrader = async (
  payload: TraderPayload,
  setTraders: (data: any) => void,
  setLoading: (loading: boolean) => void,
  onSuccess?: () => void,
  onError?: (error: any) => void
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
    const response = await api.post('/insert/traders', payload);
    console.log('Trader added:', response.data);

    await fetchTraders(setTraders, setLoading);

    toast.success('Trader added successfully!');
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error adding trader:', error);
    toast.error('Error adding trader');
    if (onError) onError(error);
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
