import React from 'react';
import { Edit, Filter, ChevronLeft, ChevronRight, Plus, X, Save } from 'lucide-react';

import { BatchClosure, CreateBatchClosure, Batch } from '../../types/interfaces';

interface BatchClosureWithJoins extends BatchClosure {
    // Additional fields that might come from joins
    farmer_name?: string;
    line_name?: string;
    supervisor_name?: string;
}

interface BatchClosureSummaryTableProps {
    batchClosures: BatchClosureWithJoins[];
    batches: Batch[];
    loading: boolean;
    showAddForm: boolean;
    setShowAddForm: (show: boolean) => void;
}

const BatchClosureSummaryTable: React.FC<BatchClosureSummaryTableProps> = ({
    batchClosures,
    batches,
    loading,
    setShowAddForm,
}) => {
    const calculateMortality = (initial: number, available: number) => {
        if (initial === 0) return 0;
        return ((initial - available) / initial * 100);
    };

    const calculateProfitMargin = (revenue: number, grossProfit: number) => {
        if (revenue === 0) return 0;
        return (grossProfit / revenue * 100);
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Batch Closure Summary</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add Closure Summary
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Batch ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Farmer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Initial Count
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Available Count
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Revenue
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gross Profit
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Profit Margin %
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : batchClosures.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                                    No batch closure summaries found
                                </td>
                            </tr>
                        ) : (
                            batchClosures.map((closure) => (
                                <tr key={closure.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {closure.id}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        #{closure.batch_id}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {
                                            (() => {
                                                const batch = batches.find(b => b.batch_id === closure.batch_id);
                                                return batch?.farmer_name || 'N/A';
                                            })()
                                        }
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="text-xs">
                                            <div>{closure.start_date}</div>
                                            <div className="text-gray-500">to {closure.end_date}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {closure.initial_chicken_count.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {closure.available_chicken_count.toLocaleString()}
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        ₹{closure.revenue.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <span className={closure.gross_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            ₹{closure.gross_profit.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${calculateProfitMargin(closure.revenue, closure.gross_profit) >= 20
                                            ? 'bg-green-100 text-green-800'
                                            : calculateProfitMargin(closure.revenue, closure.gross_profit) >= 10
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {calculateProfitMargin(closure.revenue, closure.gross_profit).toFixed(1)}%
                                        </span>
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
                    Showing {batchClosures.length} of {batchClosures.length} results
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

export default BatchClosureSummaryTable;