import React from 'react';
import { Edit, Filter, ChevronLeft, ChevronRight, Plus, X, Save, DollarSign } from 'lucide-react';
import { LedgerAccountType, LedgerEntry, NewLedgerEntry } from '@/app/types/interfaces';

interface LedgerEntriesTableProps {
    ledgerEntries: LedgerEntry[];
    loading: boolean;
    showAddForm: boolean;
    newLedgerEntry: NewLedgerEntry;
    setShowAddForm: (show: boolean) => void;
    setNewLedgerEntry: React.Dispatch<React.SetStateAction<NewLedgerEntry>>;
    handleAddLedgerEntry: () => void;
}

const LedgerEntriesTable: React.FC<LedgerEntriesTableProps> = ({
    ledgerEntries,
    loading,
    showAddForm,
    newLedgerEntry,
    setShowAddForm,
    setNewLedgerEntry,
    handleAddLedgerEntry,
}) => {
    const formatCurrency = (amount?: number) => {
        if (!amount || isNaN(amount)) return '-';
        return `₹${Number(amount).toFixed(2)}`;
    };

    // const getBalanceColor = (entry: LedgerEntry) => {
    //     if (entry.debit) return 'text-red-600';
    //     if (entry.credit) return 'text-green-600';
    //     return 'text-gray-600';
    // };

    const resetForm = () => {
        setNewLedgerEntry({
            transaction_type: '',
            debit: '',
            credit: '',
            txn_date: new Date().toISOString().slice(0, 10),
            reference_table: '',
            reference_id: '',
            narration: ''
        });
    };

    const handleFormClose = () => {
        setShowAddForm(false);
        resetForm();
    };

    const handleDebitChange = (value: string) => {
        setNewLedgerEntry(prev => ({
            ...prev,
            debit: value ? parseFloat(value) : '',
            credit: '' // Clear credit when debit is entered
        }));
    };

    const handleCreditChange = (value: string) => {
        setNewLedgerEntry(prev => ({
            ...prev,
            credit: value ? parseFloat(value) : '',
            debit: '' // Clear debit when credit is entered
        }));
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Ledger Entries</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add Entry
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Add Ledger Entry Form */}
            {showAddForm && (
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Add New Ledger Entry</h3>
                        <button
                            onClick={handleFormClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-black">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Transaction Type *
                            </label>
                            <select
                                value={newLedgerEntry.transaction_type}
                                onChange={(e) => setNewLedgerEntry(prev => ({ ...prev, transaction_type: e.target.value as LedgerAccountType }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select Transaction Type</option>
                                {Object.values(LedgerAccountType).map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Transaction Date *
                            </label>
                            <input
                                type="date"
                                value={newLedgerEntry.txn_date}
                                onChange={(e) => setNewLedgerEntry(prev => ({ ...prev, txn_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Debit Amount
                            </label>
                            <input
                                type="number"
                                value={newLedgerEntry.debit}
                                onChange={(e) => handleDebitChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                                disabled={!!newLedgerEntry.credit}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Credit Amount
                            </label>
                            <input
                                type="number"
                                value={newLedgerEntry.credit}
                                onChange={(e) => handleCreditChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                                disabled={!!newLedgerEntry.debit}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Table
                            </label>
                            <input
                                type="text"
                                value={newLedgerEntry.reference_table}
                                onChange={(e) => setNewLedgerEntry(prev => ({ ...prev, reference_table: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="e.g., purchases, sales"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference ID
                            </label>
                            <input
                                type="number"
                                value={newLedgerEntry.reference_id}
                                onChange={(e) => setNewLedgerEntry(prev => ({ ...prev, reference_id: e.target.value ? parseInt(e.target.value) : '' }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Reference record ID"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Narration
                            </label>
                            <input
                                type="text"
                                value={newLedgerEntry.narration}
                                onChange={(e) => setNewLedgerEntry(prev => ({ ...prev, narration: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Transaction description or notes"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleAddLedgerEntry}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Save size={18} />
                                Save Entry
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
                                Entry ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Debit
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Credit
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reference
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Narration
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
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                    Loading ledger entries...
                                </td>
                            </tr>
                        ) : ledgerEntries.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                    No ledger entries found
                                </td>
                            </tr>
                        ) : (
                            ledgerEntries.map((entry) => (
                                <tr key={entry.entry_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{entry.entry_id}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${entry.transaction_type === 'Revenue' ? 'bg-green-100 text-green-800' :
                                            entry.transaction_type === 'Equity' ? 'bg-green-100 text-green-800' :
                                                entry.transaction_type === 'Expense' ? 'bg-red-100 text-red-800' :
                                                    entry.transaction_type === 'Asset' ? 'bg-blue-100 text-blue-800' :
                                                        entry.transaction_type === 'Liability' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-purple-100 text-purple-800'
                                            }`}>
                                            {entry.transaction_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(entry.txn_date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${entry.debit ? 'text-red-600' : 'text-gray-400'
                                        }`}>
                                        {formatCurrency(entry.debit)}
                                    </td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${entry.credit ? 'text-green-600' : 'text-gray-400'
                                        }`}>
                                        {formatCurrency(entry.credit)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {entry.reference_table && entry.reference_id ? (
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {entry.reference_table}#{entry.reference_id}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {entry.narration || '-'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {entry.created_by_name || entry.created_by || '-'}
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

            {/* Summary Footer */}
            {ledgerEntries.length > 0 && (
                <div className="border-t bg-gray-50 px-4 py-3">
                    <div className="flex justify-between text-sm">
                        <div className="text-gray-600">
                            Showing {ledgerEntries.length} entries
                        </div>
                        <div className="flex gap-6">
                            <div className="text-red-600 font-medium">
                                Total Debits: {formatCurrency(
                                    ledgerEntries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0)
                                )}
                            </div>
                            <div className="text-green-600 font-medium">
                                Total Credits: {formatCurrency(
                                    ledgerEntries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-500">
                    Showing {ledgerEntries.length} of {ledgerEntries.length} results
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

export default LedgerEntriesTable;