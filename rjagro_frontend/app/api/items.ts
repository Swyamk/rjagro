import api from '../utils/api';

export const fetchItems = async (setItems: (data: any) => void) => {
    console.log('Fetching items...');
    try {
        const response = await api.get('/getall/items');
        setItems(response.data);
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};
export const handleAddItem = async (
    item: Item,
    setItems: (data: any) => void,
    setLoading: (loading: boolean) => void
) => {
    try {
        setLoading(true);
        await api.post('/insert/items', {
            item_code: item.item_code,
            item_name: item.item_name,
            unit: item.unit.trim() === '' ? null : item.unit,
        });
        // refresh after insert
        fetchItems(setItems);
    } catch (error) {
        console.error('Error adding item:', error);
    } finally {
        setLoading(false);
    }
};