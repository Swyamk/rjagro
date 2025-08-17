import api from "../utils/api";

export const fetchSupervisors = async (
    setSupervisors: (data: SupervisorSimplified[]) => void,
    setLoading?: (loading: boolean) => void
) => {
    setLoading?.(true);
    try {
        const response = await api.get('/getall/supervisors');
        setSupervisors(response.data);
    } catch (error) {
        console.error('Error fetching supervisors:', error);
    } finally {
        setLoading?.(false);
    }
};