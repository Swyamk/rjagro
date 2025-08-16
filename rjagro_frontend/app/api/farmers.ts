import api from "../utils/api";

export const fetchFarmers = async (setFarmers: (data: Farmer[]) => void, setLoading?: (loading: boolean) => void) => {
    try {
        if (setLoading) setLoading(true);
        const response = await api.get('/getall/farmers');
        setFarmers(response.data);
    } catch (error) {
        console.error('Error fetching farmers:', error);
    } finally {
        if (setLoading) setLoading(false);
    }
};

export const handleAddFarmer = async (
    payload: NewFarmer,
    setFarmers: (data: Farmer[]) => void,
    setLoading?: (loading: boolean) => void
) => {
    try {
        if (setLoading) setLoading(true);
        await api.post('/insert/farmers', payload);

        // Refresh farmers after inserting
        const response = await api.get('/getall/farmers');
        setFarmers(response.data);
    } catch (error) {
        console.error('Error adding farmer:', error);
    } finally {
        if (setLoading) setLoading(false);
    }
};