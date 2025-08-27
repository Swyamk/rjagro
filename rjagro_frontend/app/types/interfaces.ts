export interface Item {
  item_code: string;
  item_name: string;
  unit: string;
}

export interface Purchase {
  payment_method: string;
  purchase_id: number;
  item_code: string;
  item_name: string;
  cost_per_unit: number;
  total_cost: number;
  purchase_date: string;
  supplier: string;
  created_by: number;
  payment_account?: LedgerAccountType;
}

export interface NewPurchase {
  item_code: string;
  item_name: string;
  cost_per_unit: number | '';
  quantity: number | '';
  supplier: string;
  payment_method?: string;
  payment_account?: LedgerAccountType;
}

export interface Farmer {
  farmer_id: number;
  name: string;
  phone_number: string;
  address: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
  area_size: number;
  created_at: string;
}

export interface NewFarmer {
  name: string;
  phone_number: string;
  address: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
  area_size: number | '';
}

export interface Supplier {
  supplier_id: number;
  supplier_type: SupplierType;
  name: string;
  phone_number: string;
  address: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
  created_at: string;
}

export interface SupplierPayload {
  supplier_type: SupplierType;
  name: string;
  phone_number: string;
  address: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
}
export enum SupplierType {
  Feed = 'Feed',
  Chick = 'Chick',
  Medicine = 'Medicine',
}


export interface Trader {
  trader_id: number;
  name: string;
  phone_number: string;
  address: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
  area: string;
  created_at: string;
}

export interface NewTrader {
  name: string;
  phone_number: string;
  address: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
  area: string;
}

export interface ProductionLine {
  line_id: number;
  line_name: string;
  supervisor_id: number;
  supervisor_name: string;
  created_at: string;
}

export interface ProductionLinePayload {
  line_name: string;
  supervisor_id: number | '';
}

export interface SupervisorSimplified {
  user_id: number;
  name: string;
  role: string;
}

export interface Batch {
  batch_id: number;
  line_id: number;
  supervisor_id: number;
  supervisor_name: string;
  farmer_id: number;
  farmer_name: string;
  start_date: string;
  end_date: string;
  initial_bird_count: number;
  current_bird_count: number;
  status: string;
  created_at: string;
}

export interface BatchPayload {
  line_id: number | '';
  supervisor_id: number | '';
  farmer_id: number | '';
  start_date: string;
  end_date: string;
  initial_bird_count: number | '';
  current_bird_count: number | '';
}

export interface BatchRequirement {
  requirement_id: number;
  line_id: number;
  line_name: string;
  batch_id: number;
  supervisor_name: string;
  farmer_name: string;
  item_code: string;
  item_name: string;
  item_unit: string;
  quantity: string;
  status: string;
  request_date: string;
}

export interface NewBatchRequirement {
  batch_id: number | '';
  line_id: number | '';
  farmer_id: number | '';
  supervisor_id: number | '';
  item_code: string;
  quantity: number | '';
}

export interface BatchAllocation {
  allocation_id: number;
  requirement_id: number;
  allocated_qty: string;
  allocation_date: string;
  allocated_value: string;
  allocated_by: number;
}

export interface NewBatchAllocation {
  requirement_id: number | '';
  allocated_qty: number | '';
  allocated_by: number | '';
}


export interface Inventory {
  item_code: string;
  current_qty: number;
  last_updated: string;
}

export interface InventoryWithItemDetails extends Inventory {
  item_name?: string; // Joined from items table on frontend
  unit?: string; // Joined from items table on frontend
}

export interface NewInventory {
  item_code: string;
  item_name: string;
  current_qty: number | '';
}

export interface InventoryPayload {
  item_code: string;
  current_qty: number;
}

export enum MovementType {
  PURCHASE = 'purchase',
  ALLOCATION = 'allocation',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer'
}

export interface InventoryMovement {
  movement_id: number;
  item_code: string;
  qty_change: number;
  movement_type: MovementType;
  reference_id?: number;
  movement_date: string;
}

export interface InventoryMovementPayload {
  item_code: string;
  qty_change: number;
  movement_type: MovementType;
  reference_id?: number;
  movement_date: string;
}

export interface NewInventoryMovement {
  item_code: string;
  item_name: string;
  qty_change: number | '';
  movement_type: MovementType;
  reference_id: number | '';
  movement_date: string;
}

export enum LedgerAccountType {
  Asset = "Asset",
  Liability = "Liability",
  Equity = "Equity",
  Revenue = "Revenue",
  Expense = "Expense"
}

export interface LedgerEntry {
  entry_id: number;
  transaction_type: LedgerAccountType;
  debit?: number;
  credit?: number;
  txn_date: string;
  reference_table?: string;
  reference_id?: number;
  narration?: string;
  created_at: string;
  created_by?: number;
  created_by_name?: string;
}

export interface LedgerEntryPayload {
  transaction_type: LedgerAccountType;
  debit?: number;
  credit?: number;
  txn_date: string;
  reference_table?: string;
  reference_id?: number;
  narration?: string;
  created_by?: number;
}

export interface NewLedgerEntry {
  transaction_type: LedgerAccountType | '';
  debit: number | '';
  credit: number | '';
  txn_date: string;
  reference_table: string;
  reference_id: number | '';
  narration: string;
}
