import { LedgerAccount, LedgerEntry } from "../types/interfaces";
import { useTableSorting } from "./sorting";

export function useLedgerAccountsSorting(ledgerAccounts: LedgerAccount[]) {
    return useTableSorting<LedgerAccount>(
        ledgerAccounts,
        { key: 'account_id', direction: 'asc' },
        (item: LedgerAccount, key: string) => {
            switch (key) {
                case 'current_balance':
                    return parseFloat(String(item.current_balance)) || 0;
                case 'account_id':
                    return item.account_id;
                case 'name':
                    return item.name.toLowerCase();
                case 'account_type':
                    return item.account_type.toLowerCase();
                case 'created_at':
                    return new Date(item.created_at);
                default:
                    return item[key as keyof LedgerAccount] as string | number;
            }
        }
    );
}

export function useLedgerEntriesSorting(ledgerEntries: LedgerEntry[]) {
    return useTableSorting<LedgerEntry>(
        ledgerEntries,
        { key: 'txn_date', direction: 'desc' }, // Default to newest first
        (item: LedgerEntry, key: string) => {
            switch (key) {
                case 'txn_date':
                    return new Date(item.txn_date);
                case 'entry_id':
                    return item.entry_id;
                case 'account_id':
                    return item.account_id;
                case 'debit':
                    return parseFloat(String(item.debit)) || 0;
                case 'credit':
                    return parseFloat(String(item.credit)) || 0;
                case 'created_at':
                    return new Date(item.created_at);
                default:
                    return item[key as keyof LedgerEntry] as string | number;
            }
        }
    );
}


