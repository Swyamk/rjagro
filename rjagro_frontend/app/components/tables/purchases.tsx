import React from 'react';
import { Edit, Filter, ChevronLeft, ChevronRight, Plus, X, Save } from 'lucide-react';
import { calculateTotalCost } from '../../utils/helper';
import { Item, LedgerAccountType, NewPurchase, Purchase } from '@/app/types/interfaces';
import { INVENTORY_ACCOUNT_MAP, PAYMENT_ACCOUNT_MAP } from '@/app/types/constants';


interface ExtendedNewPurchase extends NewPurchase {
  category?: string;
  inventory_account_id?: number;
  payment_account_id?: number;
}

interface PurchasesTableProps {
    purchases: Purchase[];
    items: Item[];
    loading: boolean;
    showAddForm: boolean;
    newPurchase: ExtendedNewPurchase;
    setShowAddForm: (show: boolean) => void;
    setNewPurchase: React.Dispatch<React.SetStateAction<ExtendedNewPurchase>>;
    handleItemCodeSelect: (itemCode: string) => void;
    handleAddPurchase: () => void;
}

const PurchasesTable: React.FC<PurchasesTableProps> = ({
    purchases,
    items,
    loading,
    showAddForm,
    newPurchase,
    setShowAddForm,
    setNewPurchase,
    handleItemCodeSelect,
    handleAddPurchase,
}) => {
    const handlePaymentMethodChange = (paymentMethod: string) => {
        const paymentAccount = paymentMethod === 'Cash' ? LedgerAccountType.Asset : LedgerAccountType.Liability;
        const paymentAccountId = PAYMENT_ACCOUNT_MAP[paymentMethod as keyof typeof PAYMENT_ACCOUNT_MAP];
        
        setNewPurchase(prev => ({ 
            ...prev, 
            payment_method: paymentMethod,
            payment_account: paymentAccount as LedgerAccountType | undefined,
            payment_account_id: paymentAccountId
        }));
    };

    const handleCategoryChange = (category: string) => {
        const inventoryAccountId = INVENTORY_ACCOUNT_MAP[category as keyof typeof INVENTORY_ACCOUNT_MAP];
        
        setNewPurchase(prev => ({
            ...prev,
            category: category,
            inventory_account_id: inventoryAccountId
        }));
    };

    const categories = [
        { value: 'feed', label: 'Feed' },
        { value: 'medicine', label: 'Medicine' },
        { value: 'chicks', label: 'Chicks' }
    ];

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Purchases</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add Purchase
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Add Purchase Form */}
            {showAddForm && (
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Add New Purchase</h3>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                value={newPurchase.category || ''}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Item Code *
                            </label>
                            <select
                                value={newPurchase.item_code}
                                onChange={(e) => handleItemCodeSelect(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select Item Code</option>
                                {items.map((item) => (
                                    <option key={item.item_code} value={item.item_code}>
                                        {item.item_code} - {item.item_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Item Name
                            </label>
                            <input
                                type="text"
                                value={newPurchase.item_name}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                                placeholder="Auto-filled"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cost Per Unit *
                            </label>
                            <input
                                type="number"
                                value={newPurchase.cost_per_unit}
                                onChange={(e) => setNewPurchase(prev => ({ ...prev, cost_per_unit: e.target.value ? parseFloat(e.target.value) : '' }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                value={newPurchase.quantity}
                                onChange={(e) => setNewPurchase(prev => ({ ...prev, quantity: e.target.value ? parseInt(e.target.value) : '' }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Supplier *
                            </label>
                            <input
                                type="text"
                                value={newPurchase.supplier}
                                onChange={(e) => setNewPurchase(prev => ({ ...prev, supplier: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Supplier name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Method *
                            </label>
                            <select
                                value={newPurchase.payment_method || ''}
                                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select Payment Method</option>
                                <option value="Cash">Cash</option>
                                <option value="Payable">Payable</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Cost
                            </label>
                            <input
                                type="text"
                                value={calculateTotalCost(newPurchase.cost_per_unit, newPurchase.quantity).toFixed(2)}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleAddPurchase}
                                disabled={!newPurchase.category || !newPurchase.payment_method}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                Save Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Purchase ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item Code
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cost Per Unit
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Cost
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Purchase Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Supplier
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment Method
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created By
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : purchases.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                    No purchases found
                                </td>
                            </tr>
                        ) : (
                            purchases.map((purchase) => (
                                <tr key={purchase.purchase_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.purchase_id}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.item_code}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.item_name}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.cost_per_unit}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.total_cost}
                                    </td>
                                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.quantity}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.purchase_date}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.supplier}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.payment_method || 'N/A'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.created_by}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-500">
                    Showing {purchases.length} of {purchases.length} results
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
                    <button className="flex items-center gap-1 px-3 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchasesTable;