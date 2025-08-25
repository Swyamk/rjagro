'use client'
import React, { useState } from 'react';
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
import { fetchBatchAllocations } from '../api/batch_allocations';
import BatchAllocationsTable from '../components/tables/batch_allocations';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchInventory, handleAddInventory, handleUpdateInventory } from '../api/inventory';
import InventoryTable from '../components/tables/inventory';
import { fetchInventoryMovements, handleAddInventoryMovement } from '../api/inventory_movement';
import InventoryMovementsTable from '../components/tables/inventory_movement';
import { BatchPayload, InventoryMovementPayload, InventoryPayload, Item, LedgerAccountType, LedgerEntryPayload, MovementType, NewBatchRequirement, NewFarmer, NewInventory, NewInventoryMovement, NewLedgerEntry, NewPurchase, NewTrader, ProductionLinePayload, SupplierPayload, SupplierType } from '../types/interfaces';
import { fetchLedgerEntries, handleAddLedgerEntry } from '../api/ledger_entries';
import LedgerEntriesTable from '../components/tables/ledger_entries';

const Dashboard = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();


    const [activeTab, setActiveTab] = useState('Purchases');
    const { data: purchases = [], 
        // isLoading: loadingPurchases 
    } = useQuery({
        queryKey: ['purchases'],
        queryFn: fetchPurchases,
        staleTime: 5 * 60 * 1000,
    });
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPurchase, setNewPurchase] = useState<NewPurchase>({
        item_code: '',
        item_name: '',
        cost_per_unit: '',
        quantity: '',
        supplier: '',
        payment_method: '',
        payment_account: undefined
    });

    const final: PurchasePayload = {
        item_code: newPurchase.item_code,
        cost_per_unit: Number(newPurchase.cost_per_unit),
        total_cost: Number(newPurchase.cost_per_unit) * Number(newPurchase.quantity),
        quantity: Number(newPurchase.quantity),
        purchase_date: new Date().toISOString().slice(0, 10),
        supplier: newPurchase.supplier,
        payment_account: newPurchase.payment_account ?? LedgerAccountType.Asset,
        // fix this shit
        created_by: user ? user.user_id : 9999,
    };
    // items
    const { data: items = [],
        //  isLoading: loadingItems 
        } = useQuery({
        queryKey: ['items'],
        queryFn: fetchItems,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
    const [newItem, setNewItem] = useState<Item>({
        item_code: '',
        item_name: '',
        unit: '',
    });
    const [showAddItemForm, setShowAddItemForm] = useState(false);

    // Farmers state
    const { data: farmers = [],
        //  isLoading: loadingFarmers 
        } = useQuery({
        queryKey: ["farmers"],
        queryFn: fetchFarmers,
        staleTime: 5 * 60 * 1000,
    });
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
    const { data: suppliers = [], 
        // isLoading: loadingSuppliers 
    } = useQuery({
        queryKey: ['suppliers'],
        queryFn: fetchSuppliers,
        staleTime: 5 * 60 * 1000, // cache 5 min
    });
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
    const { data: traders = [], 
        // isLoading: loadingTraders
     } = useQuery({
        queryKey: ['traders'],
        queryFn: fetchTraders,
        staleTime: 5 * 60 * 1000, // cache for 5 minutes
    });

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
    const [newProductionLine, setNewProductionLine] = useState<ProductionLinePayload>({
        line_name: '',
        supervisor_id: 0,
    });

    const { data: productionLines = [],
        //  isLoading: loadingProductionLines 
        } = useQuery({
        queryKey: ['production_lines'],
        queryFn: fetchProductionLines,
        staleTime: 5 * 60 * 1000,
    });

    const { data: supervisors = [],
        //  isLoading: loadingSupervisors
         } = useQuery({
        queryKey: ['supervisors'],
        queryFn: fetchSupervisors,
        staleTime: 5 * 60 * 1000,
    });
    const finalProductionLine: ProductionLinePayload = {
        line_name: newProductionLine.line_name,
        supervisor_id: Number(newProductionLine.supervisor_id),
    };

    // Batches state
    const { data: batches = [], 
        // isLoading: loadingBatches 
    } = useQuery({
        queryKey: ["batches"],
        queryFn: fetchBatches,
        staleTime: 5 * 60 * 1000,
    });

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
    const { data: requirements = [], 
        // isLoading: loadingRequirements 
    } = useQuery({
        queryKey: ["batch_requirements"],
        queryFn: fetchBatchRequirements,
        staleTime: 5 * 60 * 1000,
    });
    const [newRequirement, setNewRequirement] = useState<NewBatchRequirement>({
        batch_id: '',
        line_id: '',
        farmer_id: '',
        supervisor_id: '',
        item_code: '',
        quantity: ''
    });

    // Batch Allocations state
    const { data: allocations = [],
        //  isLoading: loadingAllocations 
        } = useQuery({
        queryKey: ["batch_allocations"],
        queryFn: fetchBatchAllocations,
        staleTime: 5 * 60 * 1000,
    });

    // Inventory state
    const { data: inventory = [], 
        // isLoading: loadingInventory 
    } = useQuery({
        queryKey: ['inventory'],
        queryFn: fetchInventory,
        staleTime: 5 * 60 * 1000,
    });

    const [newInventory, setNewInventory] = useState<NewInventory>({
        item_code: '',
        item_name: '',
        current_qty: ''
    });

    // Add this function to handle item code selection for inventory
    const handleInventoryItemCodeSelect = (itemCode: string) => {
        const selectedItem = items.find(item => item.item_code === itemCode);
        if (selectedItem) {
            setNewInventory(prev => ({
                ...prev,
                item_code: itemCode,
                item_name: selectedItem.item_name
            }));
        }
    };

    // Create final payload for inventory
    const finalInventory: InventoryPayload = {
        item_code: newInventory.item_code,
        current_qty: Number(newInventory.current_qty),
    };

    // Add this function to handle inventory updates
    const handleInventoryUpdate = (item_code: string, current_qty: number) => {
        handleUpdateInventory(item_code, { current_qty }, queryClient);
    };

    // Fetch inventory movements
    const { data: inventoryMovements = [], 
        // isLoading: loadingInventoryMovements 
    } = useQuery({
        queryKey: ["inventory_movements"],
        queryFn: fetchInventoryMovements,
        staleTime: 5 * 60 * 1000,
    });
    const [newMovement, setNewMovement] = useState<NewInventoryMovement>({
        item_code: '',
        item_name: '',
        qty_change: '',
        movement_type: MovementType.PURCHASE,
        reference_id: '',
        movement_date: new Date().toISOString().slice(0, 10)
    });

    const handleMovementItemCodeSelect = (itemCode: string) => {
        const selectedItem = items.find(item => item.item_code === itemCode);
        if (selectedItem) {
            setNewMovement(prev => ({
                ...prev,
                item_code: itemCode,
                item_name: selectedItem.item_name
            }));
        }
    };
    const movementPayload: InventoryMovementPayload = {
        item_code: newMovement.item_code,
        qty_change: Number(newMovement.qty_change),
        movement_type: newMovement.movement_type,
        reference_id: newMovement.reference_id ? Number(newMovement.reference_id) : undefined,
        movement_date: newMovement.movement_date,
    };

    // Ledger Entries state
    const { data: ledgerEntries = [], 
        // isLoading: loadingLedgerEntries
     } = useQuery({
        queryKey: ["ledger_entries"],
        queryFn: fetchLedgerEntries,
        staleTime: 5 * 60 * 1000,
    });

    const [newLedgerEntry, setNewLedgerEntry] = useState<NewLedgerEntry>({
        transaction_type: '',
        debit: '',
        credit: '',
        txn_date: new Date().toISOString().slice(0, 10),
        reference_table: '',
        reference_id: '',
        narration: ''
    });
    const finalLedgerEntry: LedgerEntryPayload = {
        transaction_type: newLedgerEntry.transaction_type as LedgerAccountType,
        debit: newLedgerEntry.debit ? Number(newLedgerEntry.debit) : undefined,
        credit: newLedgerEntry.credit ? Number(newLedgerEntry.credit) : undefined,
        txn_date: newLedgerEntry.txn_date,
        reference_table: newLedgerEntry.reference_table || undefined,
        reference_id: newLedgerEntry.reference_id ? Number(newLedgerEntry.reference_id) : undefined,
        narration: newLedgerEntry.narration || undefined,
        created_by: user ? user.user_id : undefined,
    };



    const tabs = [
        'Users','Ledger Entries', 'Production Lines', 'Purchases', 'Items', 'Inventory', 'Inventory Movements', 'Batches', 'Batch Requirements',
        'Batch Allocations', 'Farmers', 'Traders', 'Suppliers', 'Bird Count History', 'Bird Sell History'
    ];



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
                            handleAddProductionLine(finalProductionLine, queryClient, setLoading)
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
                        handleAddPurchase={() =>
                            handleAddPurchase(final, queryClient, setLoading)
                        }
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
                            handleAddItem(newItem, queryClient, setLoading)
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
                        handleAddFarmer={() => handleAddFarmer(newFarmer, queryClient, setLoading)}
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
                        handleAddSupplier={() =>
                            handleAddSupplier(newSupplier, queryClient, setLoading)
                        }
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
                        handleAddTrader={() =>
                            handleAddTrader(newTrader, queryClient, setLoading)
                        }
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
                        handleAddBatch={() => handleAddBatch(newBatch, queryClient, setLoading)}
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
                        handleAddRequirement={() => handleAddBatchRequirement(newRequirement, queryClient, setLoading)}
                    />
                )}

                {activeTab === 'Batch Allocations' && (
                    <BatchAllocationsTable
                        batchAllocations={allocations}
                        loading={loading}
                        showAddForm={showAddForm}
                        setShowAddForm={setShowAddForm}
                    />
                )}

                {activeTab === 'Inventory' && (
                    <InventoryTable
                        inventory={inventory}
                        items={items}
                        loading={loading}
                        showAddForm={showAddForm}
                        newInventory={newInventory}
                        setShowAddForm={setShowAddForm}
                        setNewInventory={setNewInventory}
                        handleItemCodeSelect={handleInventoryItemCodeSelect}
                        handleAddInventory={() =>
                            handleAddInventory(finalInventory, queryClient, setLoading, () => {
                                setNewInventory({ item_code: '', item_name: '', current_qty: '' });
                                setShowAddForm(false);
                            })
                        }
                        handleUpdateInventory={handleInventoryUpdate}
                    />
                )}

                {activeTab === 'Inventory Movements' && (
                    <InventoryMovementsTable
                        inventoryMovements={inventoryMovements}
                        items={items}
                        loading={loading}
                        showAddForm={showAddForm}
                        newMovement={newMovement}
                        setShowAddForm={setShowAddForm}
                        setNewMovement={setNewMovement}
                        handleItemCodeSelect={handleMovementItemCodeSelect}
                        handleAddMovement={() =>
                            handleAddInventoryMovement(movementPayload, queryClient, setLoading, () => {
                                setShowAddForm(false);
                                setNewMovement({
                                    item_code: '',
                                    item_name: '',
                                    qty_change: '',
                                    movement_type: MovementType.PURCHASE,
                                    reference_id: '',
                                    movement_date: new Date().toISOString().slice(0, 10)
                                });
                            })
                        }
                    />
                )}

                {activeTab === 'Ledger Entries' && (
                    <LedgerEntriesTable
                        ledgerEntries={ledgerEntries}
                        loading={loading}
                        showAddForm={showAddForm}
                        newLedgerEntry={newLedgerEntry}
                        setShowAddForm={setShowAddForm}
                        setNewLedgerEntry={setNewLedgerEntry}
                        handleAddLedgerEntry={() =>
                            handleAddLedgerEntry(finalLedgerEntry, queryClient, setLoading, () => {
                                setShowAddForm(false);
                                setNewLedgerEntry({
                                    transaction_type: '',
                                    debit: '',
                                    credit: '',
                                    txn_date: new Date().toISOString().slice(0, 10),
                                    reference_table: '',
                                    reference_id: '',
                                    narration: ''
                                });
                            })
                        }
                    />
                )}

                {activeTab !== 'Purchases' && activeTab !== 'Items' && activeTab !== 'Farmers' && activeTab !== 'Suppliers' &&
                    activeTab !== 'Traders' &&
                    activeTab !== 'Production Lines' &&
                    activeTab !== 'Batches' &&
                    activeTab !== 'Batch Requirements' &&
                    activeTab !== 'Batch Allocations' &&
                    activeTab !== 'Inventory' &&
                    activeTab !== 'Inventory Movements' &&
                    activeTab !== 'Ledger Entries' && (
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