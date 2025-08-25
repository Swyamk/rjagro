import { SupervisorSimplified } from "../types/interfaces";
import api from "../utils/api";

export const fetchSupervisors = async (): Promise<SupervisorSimplified[]> => {
    const response = await api.get('/getall/supervisors');
    return response.data;
};
