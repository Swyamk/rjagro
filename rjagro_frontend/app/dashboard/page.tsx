'use client'
import React, { useState, useEffect, useContext } from 'react';
import { fetchPurchases, handleAddPurchase, PurchasePayload } from '../api/purchases';
import { fetchItems, handleAddItem } from '../api/items';
import PurchasesTable from '../components/tables/purchases';
import { useAuth } from '../hooks/useAuth';
import ItemsTable from '../components/tables/items';
import { fetchFarmers, handleAddFarmer } from '../api/farmers';
import FarmersTable from '../components/tables/farmers';
import { fetchSuppliers, handleAddSupplier } from '../api/supplier';
import SuppliersTable from '../components/tables/suppliers';
import { fetchTraders, handleAddTrader } from '../api/traders';
import TradersTable from '../components/tables/traders';
import { fetchProductionLines, handleAddProductionLine } from '../api/production_line';
import ProductionLinesTable from '../components/tables/production_lines';
import { fetchSupervisors } from '../api/supervisors';
import { fetchBatches, handleAddBatch } from '../api/batches';
import BatchesTable from '../components/tables/batches';
import { fetchBatchRequirements, handleAddBatchRequirement } from '../api/batch_requirements';
import BatchRequirementsTable from '../components/tables/batch_requirements';

export enum SupplierType {
    Feed = 'Feed',
    Chick = 'Chick',
    Medicine = 'Medicine',
}

const Dashboard = () => {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('Purchases');
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPurchase, setNewPurchase] = useState<NewPurchase>({
        item_code: '',
        item_name: '',
        cost_per_unit: '',
        quantity: '',
        supplier: ''
    });

    const final: PurchasePayload = {
        item_code: newPurchase.item_code,
        cost_per_unit: Number(newPurchase.cost_per_unit),
        total_cost: Number(newPurchase.cost_per_unit) * Number(newPurchase.quantity),
        purchase_date: new Date().toISOString().slice(0, 10),
        supplier: newPurchase.supplier,
        // fix this shit
        created_by: user ? user.user_id : 9999,
    };

    // items
    const [items, setItems] = useState<Item[]>([]);
    const [newItem, setNewItem] = useState<Item>({
        item_code: '',
        item_name: '',
        unit: '',
    });
    const [showAddItemForm, setShowAddItemForm] = useState(false);

    // Farmers state
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [newFarmer, setNewFarmer] = useState<NewFarmer>({
        name: '',
        phone_number: '',
        address: '',
        bank_account_no: '',
        bank_name: '',
        ifsc_code: '',
        area_size: 0
    });

    //Suppliers state
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [newSupplier, setNewSupplier] = useState<SupplierPayload>({
        supplier_type: SupplierType.Chick,
        name: '',
        phone_number: '',
        address: '',
        bank_account_no: '',
        bank_name: '',
        ifsc_code: ''
    });

    // Traders state
    const [traders, setTraders] = useState<Trader[]>([]);
    const [newTrader, setNewTrader] = useState<NewTrader>({
        name: '',
        phone_number: '',
        address: '',
        bank_account_no: '',
        bank_name: '',
        ifsc_code: '',
        area: ''
    });

    // Production Lines state
    const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
    const [newProductionLine, setNewProductionLine] = useState<ProductionLinePayload>({
        line_name: '',
        supervisor_id: 0,
    });

    const [supervisors, setSupervisors] = useState<SupervisorSimplified[]>([]);
    const finalProductionLine: ProductionLinePayload = {
        line_name: newProductionLine.line_name,
        supervisor_id: Number(newProductionLine.supervisor_id),
    };

    // Batches state
    const [batches, setBatches] = useState<Batch[]>([]);
    const [newBatch, setNewBatch] = useState<BatchPayload>({
        line_id: '',
        supervisor_id: '',
        farmer_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date().toISOString().slice(0, 10),
        initial_bird_count: '',
        current_bird_count: ''
    });

    // Requirements state
    const [requirements, setRequirements] = useState<BatchRequirement[]>([]);
    const [newRequirement, setNewRequirement] = useState<NewBatchRequirement>({
        batch_id: '',
        line_id: '',
        farmer_id: '',
        supervisor_id: '',
        item_code: '',
        quantity: ''
    });


    const tabs = [
        'Users', 'Production Lines', 'Purchases', 'Items', 'Batches', 'Batch Requirements',
        'Batch Allocations', 'Farmers', 'Traders', 'Suppliers', 'Bird Count History', 'Bird Sell History'
    ];

    useEffect(() => {
        // Load items first (needed for dropdown)
        fetchItems(setItems);
        if (activeTab === 'Purchases') {
            fetchPurchases(setPurchases, setLoading);
        }
        if (activeTab === 'Items') {
            fetchItems(setItems);
        }
        if (activeTab === 'Farmers') {
            fetchFarmers(setFarmers, setLoading);
        }
        if (activeTab === 'Suppliers') {
            fetchSuppliers(setSuppliers, setLoading);
        }
        if (activeTab === 'Traders') {
            fetchTraders(setTraders, setLoading);
        }
        if (activeTab === 'Production Lines') {
            fetchProductionLines(setProductionLines, setLoading);
            fetchSupervisors(setSupervisors, setLoading);
        }
        if (activeTab === 'Batches') {
            fetchBatches(setBatches, setLoading);
            fetchFarmers(setFarmers, setLoading);
            fetchSupervisors(setSupervisors, setLoading);
        }
        if (activeTab === 'Batch Requirements') {
            console.log("heeelo");
            fetchBatchRequirements(setRequirements, setLoading);
            fetchItems(setItems);
            fetchFarmers(setFarmers);
            fetchSupervisors(setSupervisors);
            fetchBatches(setBatches)
            fetchProductionLines(setProductionLines);
        }

    }, [activeTab]);

    const handleItemCodeSelect = (itemCode: string) => {
        const selectedItem = items.find(item => item.item_code === itemCode);
        if (selectedItem) {
            setNewPurchase(prev => ({
                ...prev,
                item_code: itemCode,
                item_name: selectedItem.item_name
            }));
        }
    };



    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Production Lines' && (
                    <ProductionLinesTable
                        productionLines={productionLines}
                        supervisors={supervisors}
                        loading={loading}
                        showAddForm={showAddForm}
                        newProductionLine={newProductionLine}
                        setShowAddForm={setShowAddForm}
                        setNewProductionLine={setNewProductionLine}
                        handleAddProductionLine={() =>
                            handleAddProductionLine(finalProductionLine, setProductionLines, setLoading)
                        }
                    />
                )}

                {/* Content */}
                {activeTab === 'Purchases' && (
                    <PurchasesTable
                        purchases={purchases}
                        items={items}
                        loading={loading}
                        showAddForm={showAddForm}
                        newPurchase={newPurchase}
                        setShowAddForm={setShowAddForm}
                        setNewPurchase={setNewPurchase}
                        handleItemCodeSelect={handleItemCodeSelect}
                        handleAddPurchase={() => handleAddPurchase(final, setPurchases, setLoading)}
                    />
                )}

                {activeTab === 'Items' && (
                    <ItemsTable
                        items={items}
                        loading={loading}
                        showAddForm={showAddItemForm}
                        newItem={newItem}
                        setShowAddForm={setShowAddItemForm}
                        setNewItem={setNewItem}
                        handleAddItem={() =>
                            handleAddItem(newItem, setItems, setLoading)
                        }
                    />
                )}

                {activeTab === 'Farmers' && (
                    <FarmersTable
                        farmers={farmers}
                        loading={loading}
                        showAddForm={showAddForm}
                        newFarmer={newFarmer}
                        setShowAddForm={setShowAddForm}
                        setNewFarmer={setNewFarmer}
                        handleAddFarmer={() => handleAddFarmer(newFarmer, setFarmers, setLoading)}
                    />
                )}

                {activeTab === 'Suppliers' && (
                    <SuppliersTable
                        suppliers={suppliers}
                        loading={loading}
                        showAddForm={showAddForm}
                        newSupplier={newSupplier}
                        setShowAddForm={setShowAddForm}
                        setNewSupplier={setNewSupplier}
                        handleAddSupplier={() => handleAddSupplier(newSupplier, setSuppliers, setLoading)}
                    />
                )}
                {activeTab === 'Traders' && (
                    <TradersTable
                        traders={traders}
                        loading={loading}
                        showAddForm={showAddForm}
                        newTrader={newTrader}
                        setShowAddForm={setShowAddForm}
                        setNewTrader={setNewTrader}
                        handleAddTrader={() => handleAddTrader(newTrader, setTraders, setLoading)}
                    />
                )}

                {activeTab === 'Batches' && (
                    <BatchesTable
                        batches={batches}
                        farmers={farmers}
                        supervisors={supervisors}
                        loading={loading}
                        showAddForm={showAddForm}
                        newBatch={newBatch}
                        setShowAddForm={setShowAddForm}
                        setNewBatch={setNewBatch}
                        handleAddBatch={() => handleAddBatch(newBatch as BatchPayload, setBatches, setLoading)}
                    />
                )}

                {activeTab === 'Batch Requirements' && (
                    <BatchRequirementsTable
                        requirements={requirements}
                        batches={batches}
                        lines={productionLines}
                        farmers={farmers}
                        supervisors={supervisors}
                        items={items}
                        loading={loading}
                        showAddForm={showAddForm}
                        newRequirement={newRequirement}
                        setShowAddForm={setShowAddForm}
                        setNewRequirement={setNewRequirement}
                        handleAddRequirement={() => handleAddBatchRequirement(newRequirement, setRequirements, setLoading)}
                    />
                )}

                {activeTab !== 'Purchases' && activeTab !== 'Items' && activeTab !== 'Farmers' && activeTab !== 'Suppliers' &&
                    activeTab !== 'Traders' &&
                    activeTab !== 'Production Lines' &&
                    activeTab !== 'Batches' && 
                     activeTab !== 'Batch Requirements' &&(
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">{activeTab}</h2>
                            <p className="text-gray-600">This section is under development</p>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default Dashboard;