import api from "../utils/api";

export const fetchSuppliers = async (setSuppliers: (data: Supplier[]) => void, setLoading?: (loading: boolean) => void) => {
  try {
    if (setLoading) setLoading(true);
    const response = await api.get('/getall/suppliers');
    setSuppliers(response.data);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const handleAddSupplier = async (
  payload: SupplierPayload,
  setSuppliers: (data: Supplier[]) => void,
  setLoading?: (loading: boolean) => void
) => {
  try {
    if (setLoading) setLoading(true);
    await api.post('/insert/suppliers', payload);

    // Refresh list
    const response = await api.get('/getall/suppliers');
    setSuppliers(response.data);
  } catch (error) {
    console.error('Error adding supplier:', error);
  } finally {
    if (setLoading) setLoading(false);
  }
};