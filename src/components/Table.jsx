/**
 * Table Component
 * Reusable data table with sorting, pagination, and actions
 */
const Table = ({
    columns = [],
    data = [],
    loading = false,
    emptyMessage = 'No data available',
    onRowClick,
    className = '',
}) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-secondary-500">
                {emptyMessage}
            </div>
        )
    }

    return (
        <div className={`table-container ${className}`}>
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={column.key || index}
                                className={column.headerClassName || ''}
                                style={{ width: column.width }}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={row.id || rowIndex}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={onRowClick ? 'cursor-pointer' : ''}
                        >
                            {columns.map((column, colIndex) => (
                                <td
                                    key={`${row.id || rowIndex}-${column.key || colIndex}`}
                                    className={column.cellClassName || ''}
                                >
                                    {column.render
                                        ? column.render(row[column.key], row, rowIndex)
                                        : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Table
