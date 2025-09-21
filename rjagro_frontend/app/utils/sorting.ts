import { SortableValue, SortConfig } from "../types/sorting";

export class TableSortingUtils {

    static sortData<T>(
        data: T[],
        sortConfig: SortConfig,
        getValueFn?: (item: T, key: string) => SortableValue
    ): T[] {
        if (!sortConfig.key || !sortConfig.direction) {
            return data;
        }

        return [...data].sort((a, b) => {
            const aValue = getValueFn ? getValueFn(a, sortConfig.key) : (a as any)[sortConfig.key];
            const bValue = getValueFn ? getValueFn(b, sortConfig.key) : (b as any)[sortConfig.key];

            const comparison = this.compareValues(aValue, bValue);
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }
    private static compareValues(a: SortableValue, b: SortableValue): number {
        if (a == null && b == null) return 0;
        if (a == null) return -1;
        if (b == null) return 1;

        if (this.isDateLike(a) || this.isDateLike(b)) {
            const dateA = new Date(a as string | Date);
            const dateB = new Date(b as string | Date);
            return dateA.getTime() - dateB.getTime();
        }

        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        }

        const stringA = String(a).toLowerCase();
        const stringB = String(b).toLowerCase();

        if (stringA < stringB) return -1;
        if (stringA > stringB) return 1;
        return 0;
    }

 
    private static isDateLike(value: SortableValue): boolean {
        if (!value) return false;

        if (value instanceof Date) return true;

        if (typeof value === 'string') {
            // Common date patterns
            const datePatterns = [
                /^\d{4}-\d{2}-\d{2}/, 
                /^\d{2}\/\d{2}\/\d{4}/, 
                /^\d{2}-\d{2}-\d{4}/, 
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 
            ];

            return datePatterns.some(pattern => pattern.test(value)) && !isNaN(Date.parse(value));
        }

        return false;
    }

   
    static toggleSort(currentSort: SortConfig, columnKey: string): SortConfig {
        if (currentSort.key === columnKey) {
            // Same column - cycle through: asc -> desc -> null
            switch (currentSort.direction) {
                case 'asc':
                    return { key: columnKey, direction: 'desc' };
                case 'desc':
                    return { key: '', direction: null };
                default:
                    return { key: columnKey, direction: 'asc' };
            }
        } else {
            return { key: columnKey, direction: 'asc' };
        }
    }

   
    static getSortIcon(currentSort: SortConfig, columnKey: string): 'ArrowUpDown' | 'ArrowUp' | 'ArrowDown' {
        if (currentSort.key !== columnKey) {
            return 'ArrowUpDown';
        }

        return currentSort.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
    }
}

