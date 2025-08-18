import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchBatchAllocations = async (): Promise<BatchAllocation[]> => {
  const response = await api.get("/getall/batch_allocations");
  return response.data;
};
