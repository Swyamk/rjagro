import api from "../utils/api";
import { toast } from "react-toastify";
export const fetchFarmers = async (): Promise<Farmer[]> => {
    const response = await api.get("/getall/farmers");
    return response.data;
};


export const handleAddFarmer = async (
    payload: NewFarmer,
    queryClient: any,
    setLoading: (loading: boolean) => void
) => {
    if (!payload.name || !payload.phone_number || !payload.address) {
        toast.error("Please fill in all required fields");
        return;
    }

    setLoading(true);
    toast.info("Adding farmer...");

    try {
        await api.post("/insert/farmers", payload);

        // Invalidate cache -> triggers refetch
        queryClient.invalidateQueries(["farmers"]);

        toast.success("Farmer added successfully!");
    } catch (error) {
        console.error("Error adding farmer:", error);
        toast.error("Error adding farmer");
    } finally {
        setLoading(false);
    }
};