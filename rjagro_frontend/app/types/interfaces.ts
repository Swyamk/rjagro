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
