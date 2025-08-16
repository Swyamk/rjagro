// src/components/tables/suppliers.tsx
'use client';
import { SupplierType } from '@/app/dashboard/page';
import { Save, X } from 'lucide-react';
import React from 'react';


interface SuppliersTableProps {
    suppliers: Supplier[];
    loading: boolean;
    showAddForm: boolean;
    newSupplier: SupplierPayload;
    setShowAddForm: (show: boolean) => void;
    setNewSupplier: React.Dispatch<React.SetStateAction<SupplierPayload>>;
    handleAddSupplier: () => void;
}

const SuppliersTable: React.FC<SuppliersTableProps> = ({
    suppliers,
    loading,
    showAddForm,
    newSupplier,
    setShowAddForm,
    setNewSupplier,
    handleAddSupplier,
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Suppliers</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                >
                    {showAddForm ? 'Cancel' : 'Add Supplier'}
                </button>
            </div>

            {showAddForm && (
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Add New Supplier</h3>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Type *</label>
                            <select
                                value={newSupplier.supplier_type}
                                onChange={(e) =>
                                    setNewSupplier({
                                        ...newSupplier,
                                        supplier_type: e.target.value as SupplierType,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Supplier Type</option>
                                {Object.values(SupplierType).map((type) => (
                                    <option key={type} value={type}>
                                        {type.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={newSupplier.name}
                                onChange={(e) =>
                                    setNewSupplier({ ...newSupplier, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Supplier name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                            <input
                                type="text"
                                value={newSupplier.phone_number}
                                onChange={(e) =>
                                    setNewSupplier({ ...newSupplier, phone_number: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Unique phone number"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                            <textarea
                                value={newSupplier.address}
                                onChange={(e) =>
                                    setNewSupplier({ ...newSupplier, address: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Full address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account No *</label>
                            <input
                                type="text"
                                value={newSupplier.bank_account_no}
                                onChange={(e) =>
                                    setNewSupplier({
                                        ...newSupplier,
                                        bank_account_no: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Bank account number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                            <input
                                type="text"
                                value={newSupplier.bank_name}
                                onChange={(e) =>
                                    setNewSupplier({ ...newSupplier, bank_name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Bank name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                            <input
                                type="text"
                                value={newSupplier.ifsc_code}
                                onChange={(e) =>
                                    setNewSupplier({ ...newSupplier, ifsc_code: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="IFSC code"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleAddSupplier}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Save size={18} />
                                Save Supplier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IFSC</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading suppliers...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : suppliers.length === 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IFSC</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No suppliers found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IFSC</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {suppliers.map((s) => (
                                <tr key={s.supplier_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm text-gray-900">{s.supplier_id}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900">{s.supplier_type}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900">{s.name}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900">{s.phone_number}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900">{s.address}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900">{s.bank_name} ({s.bank_account_no})</td>
                                    <td className="px-4 py-4 text-sm text-gray-900">{s.ifsc_code}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900">{new Date(s.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            {/* {loading ? (
                <p className="text-gray-600">Loading suppliers...</p>
            ) : suppliers.length === 0 ? (
                <p className="text-gray-600">No suppliers found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">ID</th>
                                <th className="border p-2">Type</th>
                                <th className="border p-2">Name</th>
                                <th className="border p-2">Phone</th>
                                <th className="border p-2">Address</th>
                                <th className="border p-2">Bank Account</th>
                                <th className="border p-2">Bank Name</th>
                                <th className="border p-2">IFSC</th>
                                <th className="border p-2">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((s) => (
                                <tr key={s.supplier_id} className="text-center">
                                    <td className="border p-2">{s.supplier_id}</td>
                                    <td className="border p-2">{s.supplier_type}</td>
                                    <td className="border p-2">{s.name}</td>
                                    <td className="border p-2">{s.phone_number}</td>
                                    <td className="border p-2">{s.address}</td>
                                    <td className="border p-2">{s.bank_account_no}</td>
                                    <td className="border p-2">{s.bank_name}</td>
                                    <td className="border p-2">{s.ifsc_code}</td>
                                    <td className="border p-2">
                                        {new Date(s.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )} */}
        </div>
    );
};

export default SuppliersTable;
