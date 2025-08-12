'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { Edit, Save, X, ChevronLeft, ChevronRight, Filter, Eye } from 'lucide-react';
import api from '../utils/api';

type TableColumn = {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'email' | 'select';
    editable?: boolean;
    options?: string[];
};

type FilterState = {
    [key: string]: string;
};

type PaginationState = {
    page: number;
    limit: number;
    total: number;
};

// const VISIBILITY_URL = 'http://127.0.0.1:8000/visibility';
// const GETALL_URL = 'http://127.0.0.1:8000/getall'; // will append /{table}

const inferType = (val: any): TableColumn['type'] => {
    if (val === null || val === undefined) return 'text';
    if (typeof val === 'number') return 'number';
    if (typeof val === 'string') {
        // ISO date-ish
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(val) || /^\d{4}-\d{2}-\d{2}$/.test(val)) {
            return 'date';
        }
        if (val.includes('@') && val.indexOf(' ') === -1) return 'email';
        // fallback
        return 'text';
    }
    return 'text';
};

const humanLabel = (key: string) =>
    key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (ch) => ch.toUpperCase());

const detectPrimaryKey = (keys: string[]) => {
    // prefer 'id', then '<table>_id', then any '*_id', then first key
    const lower = keys.map(k => k.toLowerCase());
    if (lower.includes('id')) return keys[lower.indexOf('id')];
    const idx = lower.findIndex(k => k.endsWith('_id'));
    if (idx !== -1) return keys[idx];
    return keys[0];
};

const Dashboard: React.FC = () => {
    const [visibleTables, setVisibleTables] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [columns, setColumns] = useState<TableColumn[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editedData, setEditedData] = useState<any>({});
    const [filters, setFilters] = useState<FilterState>({});
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 10, total: 0 });
    const [primaryKey, setPrimaryKey] = useState<string | null>(null);

    // fetch visibility list from backend
    const fetchVisibility = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/visibility", { withCredentials: true });
            const json = res.data;
            setVisibleTables(json);
            // auto-select first table if none selected
            if (json.length > 0 && !selectedTable) {
                setSelectedTable(json[0]);
            }
        } catch (err) {
            console.error('Error fetching visibility:', err);
            setVisibleTables([]);
        } finally {
            setLoading(false);
        }
    }, [selectedTable]);

    // fetch table rows from backend
    const fetchTableData = useCallback(async (tableName: string) => {
        setLoading(true);
        try {
            const res = await api.get(`getall/${encodeURIComponent(tableName)}`, { withCredentials: true });
            const json = res.data;

            // infer columns from first row (or fallback to empty)
            const keys = json.length > 0 ? Object.keys(json[0]) : [];
            const pk = detectPrimaryKey(keys);
            setPrimaryKey(pk);

            const inferred: TableColumn[] = keys.map((k) => {
                const sample = json.find((r: any) => r && r[k] !== undefined && r[k] !== null);
                const sampleVal = sample ? sample[k] : undefined;
                const type = inferType(sampleVal);
                const editable = !(k.toLowerCase() === 'password' || k.toLowerCase().endsWith('_at') || k === pk);
                return {
                    key: k,
                    label: humanLabel(k),
                    type,
                    editable,
                };
            });

            setColumns(inferred);
            setTableData(json);
            setPagination(prev => ({ ...prev, page: 1, total: json.length }));
            setFilters({}); // reset filters on table change
        } catch (err) {
            console.error('Error fetching table data:', err);
            setColumns([]);
            setTableData([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    }, []);

    // Effects: load visibility on mount
    useEffect(() => {
        fetchVisibility();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When selectedTable changes, fetch it
    useEffect(() => {
        if (selectedTable) {
            fetchTableData(selectedTable);
        }
    }, [selectedTable, fetchTableData]);

    // filtering + pagination computed view
    const filteredData = tableData.filter(item => {
        return Object.entries(filters).every(([k, v]) => {
            if (!v) return true;
            const val = item[k];
            return String(val ?? '').toLowerCase().includes(v.toLowerCase());
        });
    });

    const totalFiltered = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pagination.limit));
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginatedData = filteredData.slice(startIndex, startIndex + pagination.limit);

    // handlers
    const handleTableSelect = (tableName: string) => {
        setSelectedTable(tableName);
        setEditedData({});
        setEditingRow(null);
        setPagination(prev => ({ ...prev, page: 1 }));
        setShowFilters(false);
    };

    const handleEdit = (rowIndex: number) => {
        setEditingRow(rowIndex);
        setEditedData({ ...paginatedData[rowIndex] }); // we edit the paginated view item
    };

    const handleSave = async () => {
        if (editingRow === null) return;
        // apply edit locally (client-side). If you have an update endpoint, call it here.
        const globalIndex = startIndex + editingRow;
        const allDataCopy = [...tableData];
        allDataCopy[globalIndex] = { ...allDataCopy[globalIndex], ...editedData };
        setTableData(allDataCopy);

        setEditingRow(null);
        setEditedData({});
    };

    const handleCancel = () => {
        setEditingRow(null);
        setEditedData({});
    };

    const handleInputChange = (key: string, value: any) => {
        setEditedData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const renderCell = (item: any, column: TableColumn, rowIndex: number) => {
        const isEditing = editingRow === rowIndex;
        const value = isEditing ? editedData[column.key] : item[column.key];

        if (isEditing && column.editable) {
            if (column.type === 'select' && column.options) {
                return (
                    <select
                        value={value ?? ''}
                        onChange={(e) => handleInputChange(column.key, e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
                        {column.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            }

            return (
                <input
                    type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                    value={value ?? ''}
                    onChange={(e) => handleInputChange(column.key, e.target.value)}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            );
        }

        // display formatting for dates
        if (column.type === 'date' && value) {
            // try to display YYYY-MM-DD if ISO
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                return <span>{d.toISOString().split('T')[0]}</span>;
            }
        }

        return <span>{value ?? ''}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>

                    {/* Table Selector */}
                    {visibleTables.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {visibleTables.map(tableName => (
                                <button
                                    key={tableName}
                                    onClick={() => handleTableSelect(tableName)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTable === tableName
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </button>
                            ))}
                        </div>
                    ) : loading ? (
                        <div>Loading tables...</div>
                    ) : (
                        <div className="text-sm text-gray-500">No visible tables.</div>
                    )}
                </div>

                {/* Main Content */}
                {selectedTable && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {/* Table Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {selectedTable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h2>
                                <button
                                    onClick={() => setShowFilters(s => !s)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <Filter size={16} />
                                    Filters
                                </button>
                            </div>

                            {/* Filters */}
                            {showFilters && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {columns.map(column => (
                                            <div key={column.key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{column.label}</label>
                                                <input
                                                    type="text"
                                                    value={filters[column.key] ?? ''}
                                                    onChange={(e) => handleFilterChange(column.key, e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder={`Filter by ${column.label.toLowerCase()}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading...</div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {columns.map(col => (
                                                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {col.label}
                                                </th>
                                            ))}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedData.map((item, rowIndex) => (
                                            <tr key={String(item[primaryKey ?? columns[0]?.key] ?? rowIndex)} className="hover:bg-gray-50">
                                                {columns.map(column => (
                                                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {renderCell(item, column, rowIndex)}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {editingRow === rowIndex ? (
                                                        <div className="flex gap-2">
                                                            <button onClick={handleSave} className="text-green-600 hover:text-green-900">
                                                                <Save size={16} />
                                                            </button>
                                                            <button onClick={handleCancel} className="text-red-600 hover:text-red-900">
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleEdit(rowIndex)} className="text-blue-600 hover:text-blue-900">
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {filteredData.length === 0 ? 0 : (startIndex + 1)} to {Math.min(startIndex + paginatedData.length, totalFiltered)} of {totalFiltered} results
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.page <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = pagination.page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-2 text-sm rounded-lg ${pagination.page === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === totalPages}
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!selectedTable && !loading && (
                    <div className="text-center py-12">
                        <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Table Selected</h3>
                        <p className="text-gray-500">Select a table from above to view and manage its data.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
