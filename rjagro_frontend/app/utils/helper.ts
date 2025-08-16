export function calculateTotalCost(costPerUnit: string | number, quantity: string | number): number {
    const cost = Number(costPerUnit) || 0;
    const qty = Number(quantity) || 0;
    return cost * qty;
}