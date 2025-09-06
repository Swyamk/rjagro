'use client'
import React, { useMemo, useState } from 'react';
import { X, Save, IndianRupee, Lock } from 'lucide-react';
import { Batch, BatchAllocation, BatchClosurePayload, BatchRequirement, CreateFarmerCommission, FarmerCommissionHistory } from '@/app/types/interfaces';
import { useAuth } from '@/app/hooks/useAuth';

interface BatchDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    batch: Batch;
    batchAllocations: BatchAllocation[];
    requirements: BatchRequirement[];
    commissionHistory?: FarmerCommissionHistory[];
    onAddCommission?: (commission: CreateFarmerCommission) => Promise<void>;
    commissionLoading?: boolean;
    onCloseBatch?: (batchClosure: BatchClosurePayload) => Promise<void>;
    batchClosureLoading?: boolean;
}

const parseNumberSafe = (v: string | number | undefined) => {
    if (v === undefined || v === null || v === '') return 0;
    if (typeof v === 'number') return v;
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

const BatchDetailsModal: React.FC<BatchDetailsModalProps> = ({
    isOpen,
    onClose,
    batch,
    batchAllocations,
    requirements,
    commissionHistory = [],
    onAddCommission,
    commissionLoading = false,
    onCloseBatch,
    batchClosureLoading = false,
}) => {
    const user = useAuth().user;
    const [activeTab, setActiveTab] = useState<'Feed' | 'Chicks' | 'Medicine' | 'FarmerCommission' | 'Summary'>('Feed');
    const [showCommissionForm, setShowCommissionForm] = useState(false);
    const [showCloseBatchForm, setShowCloseBatchForm] = useState(false);
    const [newCommission, setNewCommission] = useState<CreateFarmerCommission>({
        farmer_id: batch.farmer_id,
        commission_amount: '',
        description: '',
        created_by: user?.user_id
    });

    const [batchClosureData, setBatchClosureData] = useState<BatchClosurePayload>({
        batch_id: batch.batch_id,
        start_date: batch.start_date,
        end_date: new Date().toISOString().slice(0, 10),
        initial_chicken_count: batch.initial_bird_count,
        available_chicken_count: batch.current_bird_count,
        revenue: 0,
        gross_profit: 0
    });

    // accepted requirements for selected batch
    const acceptedRequirements = useMemo(() => {
        return requirements.filter(r =>
            Number(r.batch_id) === Number(batch.batch_id) &&
            String(r.status || '').toLowerCase().includes('accept')
        );
    }, [batch, requirements]);

    // For each accepted requirement, compute allocated_value from batchAllocations
    const acceptedRequirementsWithAllocation = useMemo(() => {
        if (!acceptedRequirements.length) return [];
        return acceptedRequirements.map(req => {
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

    // Commission calculations
    const farmerCommissionData = useMemo(() => {
        const farmerCommissions = commissionHistory.filter(c =>
            Number(c.farmer_id) === Number(batch.farmer_id)
        );

        const totalCommission = farmerCommissions.reduce((sum, c) => sum + parseNumberSafe(c.commission_amount), 0);

        return {
            history: farmerCommissions,
            total: totalCommission
        };
    }, [batch, commissionHistory]);

    // Calculate total expenses for gross profit calculation
    const totalExpenses = useMemo(() => {
        return byCategory.Feed.total + byCategory.Chicks.total + byCategory.Medicine.total + farmerCommissionData.total;
    }, [byCategory, farmerCommissionData]);

    // Update gross profit when expenses change
    React.useEffect(() => {
        setBatchClosureData(prev => ({
            ...prev,
            gross_profit: -totalExpenses // negative of total expense
        }));
    }, [totalExpenses]);

    const handleAddCommission = async () => {
        if (!onAddCommission) return;

        if (!newCommission.commission_amount || parseNumberSafe(newCommission.commission_amount) <= 0) {
            alert('Please enter a valid commission amount');
            return;
        }

        try {
            await onAddCommission({
                ...newCommission,
                farmer_id: batch.farmer_id,
                commission_amount: parseNumberSafe(newCommission.commission_amount),
                created_by: user?.user_id
            });

            // Reset form and hide it
            setNewCommission({
                farmer_id: batch.farmer_id,
                commission_amount: '',
                description: '',
                created_by: user?.user_id
            });
            setShowCommissionForm(false);
        } catch (error) {
            console.error('Error adding commission:', error);
        }
    };

    const handleCloseBatch = async () => {
        console.log("kkee");
        if (!onCloseBatch) return;
        console.log("hee");
        try {
            await onCloseBatch(batchClosureData);
            setShowCloseBatchForm(false);
        } catch (error) {
            console.error('Error closing batch:', error);
        }
    };

    const handleClose = () => {
        setShowCommissionForm(false);
        setShowCloseBatchForm(false);
        setNewCommission({
            farmer_id: batch.farmer_id,
            commission_amount: '',
            description: '',
            created_by: user?.user_id
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Enhanced backdrop with blur effect */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />

            {/* Modal container with better responsive design */}
            <div className="relative z-60 w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in slide-in-from-bottom-4 duration-300">

                {/* Enhanced header with gradient background */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                    <div className="flex items-center justify-between p-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">
                                Allocations for Batch #{batch.batch_id}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Line {batch.line_id}
                                </span>
                                <span>Farmer: <span className="font-medium">{batch.farmer_name}</span></span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-600 bg-white/60 px-3 py-2 rounded-lg backdrop-blur-sm">
                                <span className="font-medium">{batch.start_date}</span>
                                <span className="mx-2">→</span>
                                <span className="font-medium">{batch.end_date}</span>
                            </div>
                            <button
                                onClick={handleClose}
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
                        {(['Feed', 'Chicks', 'Medicine', 'FarmerCommission', 'Summary'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-6 py-4 text-sm font-medium transition-all duration-200 ${activeTab === tab
                                    ? 'text-green-700 bg-white border-b-2 border-green-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                    }`}
                            >
                                {tab === 'FarmerCommission' ? 'Farmer Commission' : tab}
                                {activeTab === tab && (
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-green-600 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'FarmerCommission' ? (
                        /* Farmer Commission Tab Content */
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800">Farmer Commission</h4>
                                    <p className="text-sm text-gray-600">Manage commission payments for {batch.farmer_name}</p>
                                </div>
                                <button
                                    onClick={() => setShowCommissionForm(!showCommissionForm)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <IndianRupee size={18} />
                                    {showCommissionForm ? 'Cancel' : 'Add Commission'}
                                </button>
                            </div>

                            {/* Total Commission Display */}
                            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-green-800">
                                        Total Commission Paid
                                    </span>
                                    <span className="text-2xl font-bold text-green-900">
                                        ₹{farmerCommissionData.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Add Commission Form */}
                            {showCommissionForm && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <h5 className="text-md font-medium text-gray-800 mb-4">Add New Commission Payment</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Commission Amount *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newCommission.commission_amount}
                                                onChange={(e) => setNewCommission(prev => ({
                                                    ...prev,
                                                    commission_amount: e.target.value === '' ? '' : Number(e.target.value)
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                                                placeholder="Enter amount"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <input
                                                type="text"
                                                value={newCommission.description}
                                                onChange={(e) => setNewCommission(prev => ({
                                                    ...prev,
                                                    description: e.target.value
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                                                placeholder="Payment description"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={handleAddCommission}
                                            disabled={commissionLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Save size={16} />
                                            {commissionLoading ? 'Saving...' : 'Save Commission'}
                                        </button>
                                        <button
                                            onClick={() => setShowCommissionForm(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Commission History Table */}
                            <div>
                                <h5 className="text-md font-medium text-gray-800 mb-3">Commission History</h5>
                                <div className="max-h-80 overflow-auto rounded-xl border border-gray-200">
                                    {farmerCommissionData.history.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                <IndianRupee className="text-xl text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium">No commission payments</p>
                                            <p className="text-xs text-gray-400">No commission history available</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr className="text-left">
                                                    <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Description
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {farmerCommissionData.history
                                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                    .map((commission) => (
                                                        <tr key={commission.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                            <td className="px-4 py-4 text-gray-900">
                                                                {new Date(commission.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-4 py-4 text-green-600 font-semibold">
                                                                ₹{parseNumberSafe(commission.commission_amount).toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-4 text-gray-700">
                                                                {commission.description || 'No description'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'Summary' ? (
                        /* Summary Tab Content with Commission and Close Batch */
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Allocation Summary</h4>
                                    <p className="text-sm text-gray-600">Overview of all allocated values for this batch</p>
                                </div>
                                {batch.status !== 'Closed' && (
                                    <button
                                        onClick={() => setShowCloseBatchForm(!showCloseBatchForm)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <Lock size={18} />
                                        {showCloseBatchForm ? 'Cancel Close' : 'Close Batch'}
                                    </button>
                                )}
                            </div>

                            {/* Individual category totals including farmer commission */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

                                {/* Farmer Commission Card */}
                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                    <div className="text-center">
                                        <div className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">
                                            Farmer Commission
                                        </div>
                                        <div className="text-xl font-bold text-green-900">
                                            ₹{farmerCommissionData.total.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                            {farmerCommissionData.history.length} payments
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grand total including farmer commission */}
                            <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-200">
                                <div className="text-center">
                                    <div className="text-sm font-medium text-gray-700 mb-2">GRAND TOTAL (Including Commission)</div>
                                    <div className="text-3xl font-bold text-green-900">
                                        ₹{(byCategory.Feed.total + byCategory.Chicks.total + byCategory.Medicine.total + farmerCommissionData.total).toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-2">
                                        Total allocations: {byCategory.Feed.rows.length + byCategory.Chicks.rows.length + byCategory.Medicine.rows.length} |
                                        Commission payments: {farmerCommissionData.history.length}
                                    </div>
                                </div>
                            </div>

                            {/* Close Batch Form */}
                            {showCloseBatchForm && (
                                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                    <h5 className="text-md font-medium text-red-800 mb-4">Close Batch - Final Summary</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Final Available Chicken Count *
                                            </label>
                                            <input
                                                type="number"
                                                value={batchClosureData.available_chicken_count}
                                                onChange={(e) => setBatchClosureData(prev => ({
                                                    ...prev,
                                                    available_chicken_count: Number(e.target.value)
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                                                placeholder="Final chicken count"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Revenue (₹)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={batchClosureData.revenue}
                                                onChange={(e) => setBatchClosureData(prev => ({
                                                    ...prev,
                                                    revenue: Number(e.target.value)
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                                                placeholder="Total revenue from batch"
                                            />
                                        </div>
                                    </div>

                                    {/* Calculated Summary */}
                                    <div className="mt-4 p-3 bg-white rounded-lg border">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Total Expenses:</span>
                                                <span className="float-right font-semibold text-red-600">₹{totalExpenses.toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Revenue:</span>
                                                <span className="float-right font-semibold text-green-600">₹{batchClosureData.revenue.toFixed(2)}</span>
                                            </div>
                                            <div className="col-span-2 border-t pt-2">
                                                <span className="text-gray-800 font-medium">Gross Profit:</span>
                                                <span className={`float-right font-bold ${(batchClosureData.revenue - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ₹{(batchClosureData.revenue - totalExpenses).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={handleCloseBatch}
                                            disabled={batchClosureLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Lock size={16} />
                                            {batchClosureLoading ? 'Closing...' : 'Confirm Close Batch'}
                                        </button>
                                        <button
                                            onClick={() => setShowCloseBatchForm(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
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
    );
};

export default BatchDetailsModal;