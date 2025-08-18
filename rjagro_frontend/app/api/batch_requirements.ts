import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchBatchRequirements = async (setRequirements: (data: BatchRequirement[]) => void, setLoading: (loading: boolean) => void) => {
  setLoading(true);
  try {
    const response = await api.get('/getall/batch_requirements');
    console.log("respinse is ", response);
    setRequirements(response.data);
  } catch (error) {
    console.error('Error fetching batch requirements:', error);
  } finally {
    setLoading(false);
  }
};

export const handleAddBatchRequirement = async (
  payload: any,
  setRequirements: (data: BatchRequirement[]) => void,
  setLoading: (loading: boolean) => void,
  onSuccess?: () => void
) => {
  if (!payload.batch_id || !payload.line_id || !payload.farmer_id || !payload.supervisor_id || !payload.item_code || !payload.quantity) {
    toast.error('Please fill in all required fields');
    return;
  }

  setLoading(true);
  toast.info('Adding requirement...');
  try {
    const response = await api.post('/insert/batch_requirements', {
      ...payload,
      request_date: new Date().toISOString().slice(0, 10), // force current date
    });

    await fetchBatchRequirements(setRequirements, setLoading);
    toast.success('Requirement added!');
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error adding batch requirement:', error);
    toast.error('Error adding requirement');
  } finally {
    setLoading(false);
  }
};

export const handleRejectRequirement = async (requirement_id: number) => {
  try {
    await api.put(`admin/decline_batch_requirement/${requirement_id}`);
    toast.success(`Requirement #${requirement_id} rejected!`);
  } catch (error) {
    console.error("Error rejecting requirement:", error);
    toast.error("Error rejecting requirement");
  }
};

export const handleApproveRequirement = async (requirement: BatchRequirement, allocatedQty: number,user_id?:number) => {
  try {
    const payload = {
      requirement_id: requirement.requirement_id,
      allocated_qty: allocatedQty,
      allocation_date: new Date().toISOString().slice(0, 10),
      allocated_by: user_id || 1, // Default to 1 if user_id is not provided
    };

    await api.post('/admin/approve_batch_requirement', payload);
    toast.success(`Requirement #${requirement.requirement_id} approved!`);
  } catch (error) {
    console.error('Error approving requirement:', error);
    toast.error('Error approving requirement');
  }
};