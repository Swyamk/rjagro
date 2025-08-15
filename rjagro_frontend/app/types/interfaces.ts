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