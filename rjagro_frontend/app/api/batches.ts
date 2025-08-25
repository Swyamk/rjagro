import { Batch, BatchPayload } from '../types/interfaces';
import api from '../utils/api';
import { toast } from 'react-toastify';

export const fetchBatches = async (): Promise<Batch[]> => {
    const response = await api.get("/getall/batches");
    return response.data;
};

export const handleAddBatch = async (
    payload: BatchPayload,
    queryClient: any,
    setLoading: (loading: boolean) => void,
    onSuccess?: () => void,
    onError?: (error: any) => void
) => {
    if (
        !payload.line_id ||
        !payload.supervisor_id ||
        !payload.farmer_id ||
        !payload.initial_bird_count
    ) {
        toast.error("Please fill in all required fields");
        return;
    }

    setLoading(true);
    toast.info("Adding batch...");

    try {
        await api.post("/insert/batches", payload);

        // Refresh cache instead of manual refetch
        queryClient.invalidateQueries(["batches"]);

        toast.success("Batch added successfully!");
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error("Error adding batch:", error);
        toast.error("Error adding batch");
        if (onError) onError(error);
    } finally {
        setLoading(false);
    }
};
