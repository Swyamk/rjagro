import { Supplier, SupplierPayload } from "../types/interfaces";
import api from "../utils/api";
import { toast } from "react-toastify";
export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const response = await api.get('/getall/suppliers');
  return response.data;
};


export const handleAddSupplier = async (
  payload: SupplierPayload,
  queryClient: any,
  setLoading: (loading: boolean) => void
) => {
  if (!payload.name || !payload.supplier_type) {
    toast.error("Please fill in all required fields");
    return;
  }

  setLoading(true);
  toast.info("Adding supplier...");

  try {
    await api.post('/insert/suppliers', payload);

    // Invalidate cache -> triggers auto-refetch
    queryClient.invalidateQueries(['suppliers']);

    toast.success("Supplier added successfully!");
  } catch (error) {
    console.error("Error adding supplier:", error);
    toast.error("Error adding supplier");
  } finally {
    setLoading(false);
  }
};