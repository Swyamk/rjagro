import React from 'react';
import { Edit, Filter, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { BatchAllocation } from '@/app/types/interfaces';

interface BatchAllocationsTableProps {
    batchAllocations: BatchAllocation[];
    loading: boolean;
    showAddForm: boolean;
    setShowAddForm: (show: boolean) => void;
}

const BatchAllocationsTable: React.FC<BatchAllocationsTableProps> = ({
    batchAllocations,
    loading,
    // showAddForm,
    setShowAddForm,
}) => (
    <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Batch Allocations</h2>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus size={18} />
                    Add Allocation
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
                            Allocation ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Requirement ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Allocated Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Allocation Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Allocated By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                Loading...
                            </td>
                        </tr>
                    ) : batchAllocations.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                No batch allocations found
                            </td>
                        </tr>
                    ) : (
                        batchAllocations.map((allocation) => (
                            <tr key={allocation.allocation_id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {allocation.allocation_id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {allocation.requirement_id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {allocation.allocated_qty}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {allocation.allocation_date}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {allocation.allocated_by}
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
                Showing {batchAllocations.length} of {batchAllocations.length} results
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

export default BatchAllocationsTable;