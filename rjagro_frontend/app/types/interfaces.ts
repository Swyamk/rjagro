interface Item {
  item_code: string;
  item_name: string;
  unit: string;
}

interface Purchase {
  purchase_id: number;
  item_code: string;
  item_name: string;
  cost_per_unit: number;
  total_cost: number;
  purchase_date: string;
  supplier: string;
  created_by: number;
}

interface NewPurchase {
  item_code: string;
  item_name: string;
  cost_per_unit: number | '';
  quantity: number | '';
  supplier: string;
}

interface Farmer {
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

interface NewFarmer {
  name: string;
  phone_number: string;
  address: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
  area_size: number | '';
}

interface Supplier {
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

interface SupplierPayload {
  supplier_type: SupplierType;
  name: string;
  phone_number: string;
  address: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
}
enum SupplierType {
  Feed = 'Feed',
  Chick = 'Chick',
  Medicine = 'Medicine',
}


interface Trader {
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

interface NewTrader {
  name: string;
  phone_number: string;
  address: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
  area: string;
}

interface ProductionLine {
  line_id: number;
  line_name: string;
  supervisor_id: number;
  supervisor_name: string;
  created_at: string; 
}

interface ProductionLinePayload {
  line_name: string;
  supervisor_id: number | '';
}

interface SupervisorSimplified {
    user_id: number;
    name: string;
    role: string;
}

interface Batch {
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

interface BatchPayload {
  line_id: number | '';
  supervisor_id: number | '';
  farmer_id: number | '';
  start_date: string;
  end_date: string;
  initial_bird_count: number | '';
  current_bird_count: number | '';
}

interface BatchRequirement {
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

interface NewBatchRequirement {
  batch_id: number | '';
  line_id: number | '';
  farmer_id: number | '';
  supervisor_id: number | '';
  item_code: string;
  quantity: number | '';
}

interface BatchAllocation {
  allocation_id: number;
  requirement_id: number;
  allocated_qty: string;
  allocation_date: string;
  allocated_by: number;
}

interface NewBatchAllocation {
  requirement_id: number | '';
  allocated_qty: number | '';
  allocated_by: number | '';
}
