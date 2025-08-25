import React from 'react';
import { Edit, Filter, ChevronLeft, ChevronRight, Plus, X, Save } from 'lucide-react';
import { NewTrader, Trader } from '@/app/types/interfaces';

interface TradersTableProps {
  traders: Trader[];
  loading: boolean;
  showAddForm: boolean;
  newTrader: NewTrader;
  setShowAddForm: (show: boolean) => void;
  setNewTrader: React.Dispatch<React.SetStateAction<NewTrader>>;
  handleAddTrader: () => void;
}

const TradersTable: React.FC<TradersTableProps> = ({
  traders,
  loading,
  showAddForm,
  newTrader,
  setShowAddForm,
  setNewTrader,
  handleAddTrader,
}) => (
  <div className="bg-white rounded-lg shadow">
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-xl font-semibold text-gray-800">Traders</h2>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          Add Trader
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter size={18} />
          Filters
        </button>
      </div>
    </div>

    {/* Add Trader Form */}
    {showAddForm && (
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Add New Trader</h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={newTrader.name}
              onChange={(e) => setNewTrader(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Trader name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="text"
              value={newTrader.phone_number}
              onChange={(e) => setNewTrader(prev => ({ ...prev, phone_number: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              value={newTrader.address}
              onChange={(e) => setNewTrader(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account No *</label>
            <input
              type="text"
              value={newTrader.bank_account_no}
              onChange={(e) => setNewTrader(prev => ({ ...prev, bank_account_no: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
            <input
              type="text"
              value={newTrader.bank_name}
              onChange={(e) => setNewTrader(prev => ({ ...prev, bank_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Bank name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
            <input
              type="text"
              value={newTrader.ifsc_code}
              onChange={(e) => setNewTrader(prev => ({ ...prev, ifsc_code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="IFSC Code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
            <input
              type="text"
              value={newTrader.area}
              onChange={(e) => setNewTrader(prev => ({ ...prev, area: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Area"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAddTrader}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save size={18} />
              Save Trader
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trader ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Account No</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IFSC Code</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={10} className="px-4 py-8 text-center text-gray-500">Loading...</td>
            </tr>
          ) : traders.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-8 text-center text-gray-500">No traders found</td>
            </tr>
          ) : (
            traders.map((trader) => (
              <tr key={trader.trader_id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">{trader.trader_id}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{trader.name}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{trader.phone_number}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{trader.address}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{trader.bank_account_no}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{trader.bank_name}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{trader.ifsc_code}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{trader.area}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{trader.created_at}</td>
                <td className="px-4 py-4 text-sm text-gray-500">
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
      <div className="text-sm text-gray-500">Showing {traders.length} of {traders.length} results</div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1 px-3 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
          <ChevronLeft size={16} /> Previous
        </button>
        <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
        <button className="flex items-center gap-1 px-3 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  </div>
);

export default TradersTable;
