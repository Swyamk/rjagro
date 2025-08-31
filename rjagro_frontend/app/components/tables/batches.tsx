'use client'
import React, { useMemo, useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { Batch, BatchAllocation, BatchPayload, BatchRequirement, Farmer, Item, SupervisorSimplified } from '@/app/types/interfaces';

interface BatchesTableProps {
    batches: Batch[];
    farmers: Farmer[];
    supervisors: SupervisorSimplified[];
    batchAllocations: BatchAllocation[];
    requirements: BatchRequirement[];
    loading: boolean;
    showAddForm: boolean;
    newBatch: BatchPayload;
    setShowAddForm: (show: boolean) => void;
    setNewBatch: React.Dispatch<React.SetStateAction<BatchPayload>>;
    handleAddBatch: () => void;
}

const parseNumberSafe = (v: string | number | undefined) => {
    if (v === undefined || v === null || v === '') return 0;
    if (typeof v === 'number') return v;
    // remove commas, trim
    const cleaned = (v as string).toString().replace(/,/g, '').trim();
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
};

const classifyName = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('feed')) return 'Feed';
    if (n.includes('chick')) return 'Chicks';
    if (n.includes('medicine')) return 'Medicine';
    // fallback: put into Feed by default (change if you have categories)
    return 'Feed';
};

const BatchesTable: React.FC<BatchesTableProps> = ({
    batches, farmers, supervisors,
    loading, showAddForm, newBatch,
    setShowAddForm, setNewBatch,
    handleAddBatch,
    batchAllocations,
    requirements,
}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [activeTab, setActiveTab] = useState<'Feed' | 'Chicks' | 'Medicine' | 'Summary'>('Feed');

    const openBatchModal = (batch: Batch) => {
        setSelectedBatch(batch);
        setActiveTab('Feed');
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setSelectedBatch(null);
    };

    // accepted requirements for selected batch
    const acceptedRequirements = useMemo(() => {
        if (!selectedBatch) return [];
        return requirements.filter(r =>
            Number(r.batch_id) === Number(selectedBatch.batch_id) &&
            String(r.status || '').toLowerCase().includes('accept') // matches "accepted" or "Accepted"
        );
    }, [selectedBatch, requirements]);

    // For each accepted requirement, compute allocated_value from batchAllocations (sum of allocations for that requirement)
    const acceptedRequirementsWithAllocation = useMemo(() => {
        if (!acceptedRequirements.length) return [];
        return acceptedRequirements.map(req => {
            // find allocations for this requirement_id
            const allocs = batchAllocations.filter(a => Number(a.requirement_id) === Number(req.requirement_id));
            const totalAllocatedValue = allocs.reduce((sum, a) => sum + parseNumberSafe(a.allocated_value), 0);
            const category = classifyName(req.item_name || '');
            return {
                requirement: req,
                allocations: allocs,
                totalAllocatedValue,
                category
            };
        });
    }, [acceptedRequirements, batchAllocations]);

    // group by category
    const byCategory = useMemo(() => {
        const feed = acceptedRequirementsWithAllocation.filter(x => x.category === 'Feed');
        const chicks = acceptedRequirementsWithAllocation.filter(x => x.category === 'Chicks');
        const medicine = acceptedRequirementsWithAllocation.filter(x => x.category === 'Medicine');
        const sum = (arr: typeof acceptedRequirementsWithAllocation) => arr.reduce((s, x) => s + x.totalAllocatedValue, 0);
        return {
            Feed: { rows: feed, total: sum(feed) },
            Chicks: { rows: chicks, total: sum(chicks) },
            Medicine: { rows: medicine, total: sum(medicine) }
        };
    }, [acceptedRequirementsWithAllocation]);

    return (
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
                                <tr key={batch.batch_id} className="hover:bg-gray-50" onDoubleClick={() => openBatchModal(batch)}>
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

            {/* modal */}
            {modalOpen && selectedBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Enhanced backdrop with blur effect */}
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeModal} />

                    {/* Modal container with better responsive design */}
                    <div className="relative z-60 w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in slide-in-from-bottom-4 duration-300">

                        {/* Enhanced header with gradient background */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                            <div className="flex items-center justify-between p-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Allocations for Batch #{selectedBatch.batch_id}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Line {selectedBatch.line_id}
                                        </span>
                                        <span>Farmer: <span className="font-medium">{selectedBatch.farmer_name}</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-gray-600 bg-white/60 px-3 py-2 rounded-lg backdrop-blur-sm">
                                        <span className="font-medium">{selectedBatch.start_date}</span>
                                        <span className="mx-2">→</span>
                                        <span className="font-medium">{selectedBatch.end_date}</span>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 rounded-full hover:bg-white/80 transition-colors duration-200 group"
                                    >
                                        <X size={20} className="text-gray-600 group-hover:text-gray-800" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced tabs with better styling */}
                        <div className="bg-gray-50 border-b border-gray-200">
                            <div className="flex">
                                {(['Feed', 'Chicks', 'Medicine', 'Summary'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative px-6 py-4 text-sm font-medium transition-all duration-200 ${activeTab === tab
                                            ? 'text-green-700 bg-white border-b-2 border-green-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                            }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-green-600 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-6">
                            {activeTab === 'Summary' ? (
                                /* Summary Tab Content */
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Allocation Summary</h4>
                                        <p className="text-sm text-gray-600">Overview of all allocated values for this batch</p>
                                    </div>

                                    {/* Individual category totals */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        {(['Feed', 'Chicks', 'Medicine'] as const).map((category) => (
                                            <div key={category} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                                <div className="text-center">
                                                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                                                        {category}
                                                    </div>
                                                    <div className="text-xl font-bold text-gray-900">
                                                        ₹{byCategory[category].total.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {byCategory[category].rows.length} items
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Grand total */}
                                    <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-200">
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-gray-700 mb-2">GRAND TOTAL</div>
                                            <div className="text-3xl font-bold text-green-900">
                                                ₹{(byCategory.Feed.total + byCategory.Chicks.total + byCategory.Medicine.total).toFixed(2)}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-2">
                                                Total items: {byCategory.Feed.rows.length + byCategory.Chicks.rows.length + byCategory.Medicine.rows.length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Original tab content for Feed, Chicks, Medicine */
                                <>
                                    {/* Enhanced total value display */}
                                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-green-800">
                                                Total {activeTab} Allocated Value
                                            </span>
                                            <span className="text-2xl font-bold text-green-900">
                                                ₹{byCategory[activeTab].total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Enhanced table container */}
                                    <div className="max-h-80 overflow-auto rounded-xl border border-gray-200">
                                        {byCategory[activeTab].rows.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                    <span className="text-xl">📦</span>
                                                </div>
                                                <p className="text-sm font-medium">No {activeTab.toLowerCase()} allocations</p>
                                                <p className="text-xs text-gray-400">No data available for this batch</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 sticky top-0">
                                                    <tr className="text-left">
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Requirement ID
                                                        </th>
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Item Code
                                                        </th>
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Item Name
                                                        </th>
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">
                                                            Requested Qty
                                                        </th>
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">
                                                            Allocated Value
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {byCategory[activeTab].rows.map((row) => {
                                                        const req = row.requirement;
                                                        return (
                                                            <tr
                                                                key={req.requirement_id}
                                                                className="hover:bg-gray-50 transition-colors duration-150"
                                                            >
                                                                <td className="px-4 py-4 text-gray-900 font-mono text-xs">
                                                                    {req.requirement_id}
                                                                </td>
                                                                <td className="px-4 py-4 text-gray-700 font-medium">
                                                                    {req.item_code}
                                                                </td>
                                                                <td className="px-4 py-4 text-gray-900">
                                                                    {req.item_name}
                                                                </td>
                                                                <td className="px-4 py-4 text-gray-700 text-right font-medium">
                                                                    {req.quantity}
                                                                </td>
                                                                <td className="px-4 py-4 text-right">
                                                                    <span className="text-gray-900 font-semibold">
                                                                        ₹{row.totalAllocatedValue.toFixed(2)}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>


                    </div>
                </div>
            )
            }
        </div >
    )
};

export default BatchesTable;
