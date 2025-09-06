import { BatchSale, BatchSalePayload } from "../types/interfaces";
import api from "../utils/api";
import { toast } from "react-toastify";

export const fetchBatchSales = async (): Promise<BatchSale[]> => {
  const response = await api.get("/getall/batch_sales");
  return response.data;
};

export const handleAddBatchSale = async (
  payload: BatchSalePayload,
  queryClient: any,
  setLoading: (loading: boolean) => void,
  onSuccess?: () => void
) => {
  if (
    !payload.item_code ||
    !payload.batch_id ||
    !payload.trader_id ||
    !payload.avg_weight ||
    !payload.rate ||
    !payload.quantity ||
    !payload.value
  ) {
    toast.error("Please fill in all required fields");
    return;
  }

  setLoading(true);
  toast.info("Adding batch sale...");

  try {
    await api.post("/insert/batch_sales", payload);

    queryClient.invalidateQueries(["batch_sales"]);

    toast.success("Batch sale added successfully!");
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error adding batch sale:", error);
    toast.error("Error adding batch sale");
  } finally {
    setLoading(false);
  }
};
