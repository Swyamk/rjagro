import { Farmer, NewFarmer } from '@/app/types/interfaces';
import { Edit, Filter, ChevronLeft, ChevronRight, Plus, X, Save } from 'lucide-react';

interface FarmersTableProps {
    farmers: Farmer[];
    loading: boolean;
    showAddForm: boolean;
    newFarmer: NewFarmer;
    setShowAddForm: (show: boolean) => void;
    setNewFarmer: React.Dispatch<React.SetStateAction<NewFarmer>>;
    handleAddFarmer: () => void;
}

const FarmersTable: React.FC<FarmersTableProps> = ({
    farmers,
    loading,
    showAddForm,
    newFarmer,
    setShowAddForm,
    setNewFarmer,
    handleAddFarmer,
}) => (
    <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Farmers</h2>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus size={18} />
                    Add Farmer
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter size={18} />
                    Filters
                </button>
            </div>
        </div>

        {/* Add Farmer Form */}
        {showAddForm && (
            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Add New Farmer</h3>
                    <button
                        onClick={() => setShowAddForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                            type="text"
                            value={newFarmer.name}
                            onChange={(e) => setNewFarmer(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Farmer name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                            type="text"
                            value={newFarmer.phone_number}
                            onChange={(e) => setNewFarmer(prev => ({ ...prev, phone_number: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Unique phone number"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                        <textarea
                            value={newFarmer.address}
                            onChange={(e) => setNewFarmer(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Full address"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account No *</label>
                        <input
                            type="text"
                            value={newFarmer.bank_account_no}
                            onChange={(e) => setNewFarmer(prev => ({ ...prev, bank_account_no: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Bank account number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                        <input
                            type="text"
                            value={newFarmer.bank_name}
                            onChange={(e) => setNewFarmer(prev => ({ ...prev, bank_name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Bank name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                        <input
                            type="text"
                            value={newFarmer.ifsc_code}
                            onChange={(e) => setNewFarmer(prev => ({ ...prev, ifsc_code: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="IFSC code"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area Size (acres) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={newFarmer.area_size}
                            onChange={(e) => setNewFarmer(prev => ({ ...prev, area_size: e.target.value ? parseFloat(e.target.value) : '' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleAddFarmer}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Save size={18} />
                            Save Farmer
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Farmers Table */}
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area Size</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                        </tr>
                    ) : farmers.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No farmers found</td>
                        </tr>
                    ) : (
                        farmers.map(f => (
                            <tr key={f.farmer_id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 text-sm text-gray-900">{f.farmer_id}</td>
                                <td className="px-4 py-4 text-sm text-gray-900">{f.name}</td>
                                <td className="px-4 py-4 text-sm text-gray-900">{f.phone_number}</td>
                                <td className="px-4 py-4 text-sm text-gray-900">{f.address}</td>
                                <td className="px-4 py-4 text-sm text-gray-900">{f.bank_name} ({f.bank_account_no})</td>
                                <td className="px-4 py-4 text-sm text-gray-900">{f.area_size}</td>
                                <td className="px-4 py-4 text-sm text-gray-900">{new Date(f.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-4 text-sm text-gray-500">
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

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-500">Showing {farmers.length} of {farmers.length} results</div>
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-2 text-gray-500 border rounded-lg hover:bg-gray-50">
                    <ChevronLeft size={16} /> Previous
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
                <button className="flex items-center gap-1 px-3 py-2 text-gray-500 border rounded-lg hover:bg-gray-50">
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
    </div>
);

export default FarmersTable;
