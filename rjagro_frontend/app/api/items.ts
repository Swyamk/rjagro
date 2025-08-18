import api from '../utils/api';

export const fetchItems = async (): Promise<Item[]> => {
    console.log('Fetching items...');
    const response = await api.get('/getall/items');
    return response.data;
};

export const handleAddItem = async (
    item: Item,
    queryClient: any, 
    setLoading: (loading: boolean) => void
) => {
    try {
        setLoading(true);
        await api.post('/insert/items', {
            item_code: item.item_code,
            item_name: item.item_name,
            unit: item.unit.trim() === '' ? null : item.unit,
        });

        // Invalidate cache -> refetch items automatically
        queryClient.invalidateQueries(['items']);
    } catch (error) {
        console.error('Error adding item:', error);
    } finally {
        setLoading(false);
    }
};