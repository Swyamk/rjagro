'use client';
import React, { useState, useMemo } from 'react';
import { Plus, X, Save, Check, XCircle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { handleApproveRequirement, handleRejectRequirement } from '@/app/api/batch_requirements';
import { useAuth } from '@/app/hooks/useAuth';

interface BatchRequirementsProps {
  requirements: BatchRequirement[];
  batches: Batch[];
  lines: ProductionLine[];
  farmers: Farmer[];
  supervisors: SupervisorSimplified[];
  items: Item[];
  loading: boolean;
  showAddForm: boolean;
  newRequirement: NewBatchRequirement;
  setShowAddForm: (show: boolean) => void;
  setNewRequirement: React.Dispatch<React.SetStateAction<NewBatchRequirement>>;
  handleAddRequirement: () => void;
}

const BatchRequirementsTable: React.FC<BatchRequirementsProps> = ({
  requirements,
  batches,
  lines,
  farmers,
  supervisors,
  items,
  loading,
  showAddForm,
  newRequirement,
  setShowAddForm,
  setNewRequirement,
  handleAddRequirement,
}) => {
  const [approveModalRequirement, setApproveModalRequirement] = useState<BatchRequirement | null>(null);
  const [rejectModalRequirement, setRejectModalRequirement] = useState<BatchRequirement | null>(null);
  const [allocatedQty, setAllocatedQty] = useState<string>('');
  const [processingRequirement, setProcessingRequirement] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { user } = useAuth();

  const isAdmin = user?.role === 'Admin';

  // Filter and sort requirements: pending first, then others by date (newest first, older last)
  const filteredAndSortedRequirements = useMemo(() => {
    let filtered = requirements;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = requirements.filter(r => r.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Sort the filtered results
    return [...filtered].sort((a, b) => {
      const aStatus = a.status?.toLowerCase();
      const bStatus = b.status?.toLowerCase();
      
      // If one is pending and other is not, pending comes first
      if (aStatus === 'pending' && bStatus !== 'pending') return -1;
      if (bStatus === 'pending' && aStatus !== 'pending') return 1;
      
      // If both are pending or both are non-pending, sort by date (newest first)
      const aDate = new Date(a.request_date);
      const bDate = new Date(b.request_date);
      return bDate.getTime() - aDate.getTime();
    });
  }, [requirements, statusFilter]);

  // Get unique statuses for filter dropdown
  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(requirements.map(r => r.status?.toLowerCase()).filter(Boolean))];
    return statuses.sort();
  }, [requirements]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium";

    switch (status?.toLowerCase()) {
      case 'pending':
        return (
          <span className={`${baseClasses} bg-amber-50 text-amber-700 border border-amber-200`}>
            <Clock size={12} />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className={`${baseClasses} bg-green-50 text-green-700 border border-green-200`}>
            <CheckCircle2 size={12} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700 border border-red-200`}>
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`}>
            <AlertCircle size={12} />
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const handleApproveClick = (requirement: BatchRequirement) => {
    setAllocatedQty(requirement.quantity.toString());
    setApproveModalRequirement(requirement);
  };

  const handleRejectClick = (requirement: BatchRequirement) => {
    setRejectModalRequirement(requirement);
  };

  const ActionButtons = ({ requirement }: { requirement: BatchRequirement }) => {
    const isProcessing = processingRequirement === requirement.requirement_id;
    const isPending = requirement.status?.toLowerCase() === 'pending';

    if (!isPending) {
      return (
        <div className="flex items-center gap-1">
          {getStatusBadge(requirement.status)}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {/* Accept Button */}
        <button
          onClick={() => handleApproveClick(requirement)}
          disabled={isProcessing}
          className="group relative inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg
                   bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800
                   border border-green-200 hover:border-green-300
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                   hover:shadow-sm active:scale-95"
          title="Approve requirement"
        >
          <div className="flex items-center gap-1.5">
            {isProcessing ? (
              <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={12} className="group-hover:scale-110 transition-transform duration-200" />
            )}
            <span>Accept</span>
          </div>
        </button>

        {/* Reject Button */}
        <button
          onClick={() => handleRejectClick(requirement)}
          disabled={isProcessing}
          className="group relative inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg
                   bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800
                   border border-red-200 hover:border-red-300
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
                   hover:shadow-sm active:scale-95"
          title="Reject requirement"
        >
          <div className="flex items-center gap-1.5">
            {isProcessing ? (
              <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <XCircle size={12} className="group-hover:scale-110 transition-transform duration-200" />
            )}
            <span>Reject</span>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Batch Requirements</h2>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Show filtered count */}
          {statusFilter !== 'all' && (
            <span className="text-sm text-gray-500">
              ({filteredAndSortedRequirements.length} of {requirements.length} requirements)
            </span>
          )}
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          Add Requirement
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Add New Requirement</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Batch Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
              <select
                value={newRequirement.batch_id}
                onChange={(e) => setNewRequirement(prev => ({ ...prev, batch_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Batch</option>
                {batches.map(b => (
                  <option key={b.batch_id} value={b.batch_id}>Batch {b.batch_id}</option>
                ))}
              </select>
            </div>

            {/* Line Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line *</label>
              <select
                value={newRequirement.line_id}
                onChange={(e) => setNewRequirement(prev => ({ ...prev, line_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Line</option>
                {lines.map(l => (
                  <option key={l.line_id} value={l.line_id}>{l.line_name}</option>
                ))}
              </select>
            </div>

            {/* Supervisor Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor *</label>
              <select
                value={newRequirement.supervisor_id}
                onChange={(e) => setNewRequirement(prev => ({ ...prev, supervisor_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                value={newRequirement.farmer_id}
                onChange={(e) => setNewRequirement(prev => ({ ...prev, farmer_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Farmer</option>
                {farmers.map(f => (
                  <option key={f.farmer_id} value={f.farmer_id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Item Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
              <select
                value={newRequirement.item_code}
                onChange={(e) => setNewRequirement(prev => ({ ...prev, item_code: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Item</option>
                {items.map(i => (
                  <option key={i.item_code} value={i.item_code}>
                    {i.item_code} - {i.item_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                value={newRequirement.quantity}
                onChange={(e) => setNewRequirement(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Save */}
            <div className="flex items-end">
              <button
                onClick={handleAddRequirement}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={18} />
                Save Requirement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Req ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              {isAdmin && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={isAdmin ? 10 : 9} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : filteredAndSortedRequirements.length === 0 ? (
              <tr><td colSpan={isAdmin ? 10 : 9} className="px-4 py-8 text-center text-gray-500">
                {statusFilter !== 'all' ? `No ${statusFilter} requirements found` : 'No requirements found'}
              </td></tr>
            ) : (
              filteredAndSortedRequirements.map((r) => (
                <tr key={r.requirement_id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{r.requirement_id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{r.line_name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{r.batch_id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{r.supervisor_name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{r.farmer_name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{r.item_code} - {r.item_name} ({r.item_unit})</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{r.quantity}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(r.status)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{r.request_date}</td>
                  {isAdmin && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      <ActionButtons requirement={r} />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Approve Modal */}
      {approveModalRequirement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Approve Requirement
                  </h3>
                  <p className="text-sm text-gray-500">
                    Requirement #{approveModalRequirement.requirement_id}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-medium text-gray-900">
                    {approveModalRequirement.item_code} - {approveModalRequirement.item_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requested Quantity:</span>
                  <span className="font-medium text-gray-900">
                    {approveModalRequirement.quantity} {approveModalRequirement.item_unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allocated Quantity *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={allocatedQty}
                    onChange={(e) => setAllocatedQty(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Enter quantity to allocate"
                    min="0"
                    max={approveModalRequirement.quantity}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">{approveModalRequirement.item_unit}</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Maximum: {approveModalRequirement.quantity} {approveModalRequirement.item_unit}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setApproveModalRequirement(null);
                  setAllocatedQty('');
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setProcessingRequirement(approveModalRequirement.requirement_id);
                  try {
                    await handleApproveRequirement(approveModalRequirement, parseInt(allocatedQty));
                  } finally {
                    setProcessingRequirement(null);
                    setApproveModalRequirement(null);
                    setAllocatedQty('');
                  }
                }}
                disabled={!allocatedQty || parseInt(allocatedQty) <= 0}
                className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Check size={16} />
                  Approve Request
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Reject Modal */}
      {rejectModalRequirement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reject Requirement
                  </h3>
                  <p className="text-sm text-gray-500">
                    Requirement #{rejectModalRequirement.requirement_id}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Confirm Rejection</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This action cannot be undone. The requirement will be permanently rejected.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-medium text-gray-900">
                    {rejectModalRequirement.item_code} - {rejectModalRequirement.item_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium text-gray-900">
                    {rejectModalRequirement.quantity} {rejectModalRequirement.item_unit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Farmer:</span>
                  <span className="font-medium text-gray-900">{rejectModalRequirement.farmer_name}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setRejectModalRequirement(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setProcessingRequirement(rejectModalRequirement.requirement_id);
                  try {
                    await handleRejectRequirement(rejectModalRequirement.requirement_id);
                  } finally {
                    setProcessingRequirement(null);
                    setRejectModalRequirement(null);
                  }
                }}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <XCircle size={16} />
                  Reject Request
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchRequirementsTable;