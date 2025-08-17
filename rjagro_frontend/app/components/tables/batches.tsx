import React from 'react';
import { Plus, X, Save } from 'lucide-react';

interface BatchesTableProps {
    batches: Batch[];
    farmers: Farmer[];
    supervisors: SupervisorSimplified[];
    loading: boolean;
    showAddForm: boolean;
    newBatch: BatchPayload;
    setShowAddForm: (show: boolean) => void;
    setNewBatch: React.Dispatch<React.SetStateAction<BatchPayload>>;
    handleAddBatch: () => void;
}

const BatchesTable: React.FC<BatchesTableProps> = ({
    batches, farmers, supervisors,
    loading, showAddForm, newBatch,
    setShowAddForm, setNewBatch,
    handleAddBatch
}) => (
    <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Batches</h2>
            <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                <Plus size={18} /> Add Batch
            </button>
        </div>

        {/* Add Batch Form */}
        {showAddForm && (
            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Add New Batch</h3>
                    <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-black">
                    {/* Supervisor Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor *</label>
                        <select
                            value={newBatch.supervisor_id}
                            onChange={(e) => setNewBatch(prev => ({ ...prev, supervisor_id: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select Supervisor</option>
                            {supervisors.map(s => (
                                <option key={s.user_id} value={s.user_id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Farmer Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farmer *</label>
                        <select
                            value={newBatch.farmer_id}
                            onChange={(e) => setNewBatch(prev => ({ ...prev, farmer_id: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select Farmer</option>
                            {farmers.map(f => (
                                <option key={f.farmer_id} value={f.farmer_id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Line ID *</label>
                        <input
                            type="number"
                            value={newBatch.line_id}
                            onChange={(e) => setNewBatch(prev => ({ ...prev, line_id: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                        <input
                            type="date"
                            value={newBatch.start_date}
                            onChange={(e) => setNewBatch(prev => ({
                                ...prev,
                                start_date: e.target.value,
                                end_date: e.target.value // keep same as start_date 
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Bird Count *</label>
                        <input
                            type="number"
                            value={newBatch.initial_bird_count}
                            onChange={(e) => setNewBatch(prev => ({
                                ...prev,
                                initial_bird_count: Number(e.target.value),
                                current_bird_count: Number(e.target.value)
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleAddBatch}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Save size={18} /> Save Batch
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
                            Batch ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Line ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Supervisor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Farmer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Initial Bird Count
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Bird Count
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created At
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                Loading...
                            </td>
                        </tr>
                    ) : batches.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                No batches found
                            </td>
                        </tr>
                    ) : (
                        batches.map((batch) => (
                            <tr key={batch.batch_id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {batch.batch_id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {batch.line_id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {batch.supervisor_name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {batch.farmer_name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {batch.initial_bird_count}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {batch.current_bird_count}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {batch.status}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(batch.created_at).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>


    </div>
);

export default BatchesTable;
