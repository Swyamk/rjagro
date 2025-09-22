import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortableHeaderProps {
  columnKey: string;
  children: React.ReactNode;
  className?: string;
  requestSort: (key: string) => void;
  getSortIcon: (columnKey: string) => string | null;
  isSortable?: boolean;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  columnKey,
  children,
  className = "",
  requestSort,
  getSortIcon,
  isSortable = false
}) => {
  const IconComponent = getSortIcon(columnKey) === 'ArrowUp' ? ArrowUp :
    getSortIcon(columnKey) === 'ArrowDown' ? ArrowDown : ArrowUpDown;

  if (!isSortable) {
    return (
      <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
        {children}
      </th>
    );
  }

  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => requestSort(columnKey)}
    >
      <div className="flex items-center justify-between group">
        <span>{children}</span>
        <IconComponent
          size={14}
          className="ml-1 text-gray-400 group-hover:text-gray-600 transition-colors"
        />
      </div>
    </th>
  );
};

export default SortableHeader;