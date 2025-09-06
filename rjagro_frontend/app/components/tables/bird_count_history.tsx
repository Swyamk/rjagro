import React from 'react';
import { Edit, Filter, ChevronLeft, ChevronRight, Plus, X, Save, TrendingDown, TrendingUp } from 'lucide-react';
import { Batch, BirdCountHistory, NewBirdCountHistory } from '@/app/types/interfaces';

interface BirdCountHistoryTableProps {
    birdCountHistory: BirdCountHistory[];
    batches: Batch[];
    loading: boolean;
    showAddForm: boolean;
    newRecord: NewBirdCountHistory;
    setShowAddForm: (show: boolean) => void;
    setNewRecord: React.Dispatch<React.SetStateAction<NewBirdCountHistory>>;
    handleAddRecord: () => void;
}

const BirdCountHistoryTable: React.FC<BirdCountHistoryTableProps> = ({
    birdCountHistory,
    batches,
    loading,
    showAddForm,
    newRecord,
    setShowAddForm,
    setNewRecord,
    handleAddRecord,
}) => {
    const getNetChange = (deaths: number, additions: number) => {
        const net = additions - deaths;
        return {
            value: net,
            isPositive: net > 0,
            isNeutral: net === 0
        };
    };

    const getBatchInfo = (batchId: number) => {
        const batch = batches.find(b => b.batch_id === batchId);
        return batch ? `Batch ${batchId} - ${batch.farmer_name}` : `Batch ${batchId}`;
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Bird Count History</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add Record
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Add Record Form */}
            {showAddForm && (
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Add New Bird Count Record</h3>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Batch *
                            </label>
                            <select
                                value={newRecord.batch_id}
                                onChange={(e) => setNewRecord(prev => ({ 
                                    ...prev, 
                                    batch_id: e.target.value ? parseInt(e.target.value) : '' 
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select Batch</option>
                                {batches.map((batch) => (
                                    <option key={batch.batch_id} value={batch.batch_id}>
                                        {getBatchInfo(batch.batch_id)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Record Date *
                            </label>
                            <input
                                type="date"
                                value={newRecord.record_date}
                                onChange={(e) => setNewRecord(prev => ({ ...prev, record_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">
                                Deaths *
                            </label>
                            <input
                                type="number"
                                value={newRecord.deaths}
                                onChange={(e) => setNewRecord(prev => ({ 
                                    ...prev, 
                                    deaths: e.target.value ? parseInt(e.target.value) : '' 
                                }))}
                                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">
                                Additions *
                            </label>
                            <input
                                type="number"
                                value={newRecord.additions}
                                onChange={(e) => setNewRecord(prev => ({ 
                                    ...prev, 
                                    additions: e.target.value ? parseInt(e.target.value) : '' 
                                }))}
                                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Net Change
                            </label>
                            <input
                                type="text"
                                value={(() => {
                                    const deaths = typeof newRecord.deaths === 'number' ? newRecord.deaths : 0;
                                    const additions = typeof newRecord.additions === 'number' ? newRecord.additions : 0;
                                    const net = additions - deaths;
                                    return net > 0 ? `+${net}` : net.toString();
                                })()}
                                readOnly
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-center font-medium ${
                                    (() => {
                                        const deaths = typeof newRecord.deaths === 'number' ? newRecord.deaths : 0;
                                        const additions = typeof newRecord.additions === 'number' ? newRecord.additions : 0;
                                        const net = additions - deaths;
                                        return net > 0 ? 'text-green-700' : net < 0 ? 'text-red-700' : 'text-gray-700';
                                    })()
                                }`}
                            />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <input
                                type="text"
                                value={newRecord.notes}
                                onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Optional notes about this record..."
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleAddRecord}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Save size={18} />
                                Save Record
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
                                Record ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Batch
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Record Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                                Deaths
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">
                                Additions
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net Change
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Notes
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created At
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : birdCountHistory.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                    No bird count records found
                                </td>
                            </tr>
                        ) : (
                            birdCountHistory.map((record) => {
                                const netChange = getNetChange(record.deaths, record.additions);
                                return (
                                    <tr key={record.record_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.record_id}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getBatchInfo(record.batch_id)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.record_date}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <span className="inline-flex items-center gap-1 text-red-700">
                                                <TrendingDown size={14} />
                                                {record.deaths}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <span className="inline-flex items-center gap-1 text-green-700">
                                                <TrendingUp size={14} />
                                                {record.additions}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                                netChange.isPositive 
                                                    ? 'bg-green-100 text-green-800'
                                                    : netChange.isNeutral
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {netChange.isPositive && <TrendingUp size={12} />}
                                                {!netChange.isPositive && !netChange.isNeutral && <TrendingDown size={12} />}
                                                {netChange.value > 0 ? `+${netChange.value}` : netChange.value}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {record.notes || '-'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(record.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-500">
                    Showing {birdCountHistory.length} of {birdCountHistory.length} results
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

export default BirdCountHistoryTable;