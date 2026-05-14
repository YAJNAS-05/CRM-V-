import { ColumnConfig } from '../EnterpriseReportBuilder'
import { Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

const AVAILABLE_FIELDS = {
  Accounts: [
    { name: 'account_id', label: 'Account ID', type: 'string' },
    { name: 'account_name', label: 'Account Name', type: 'string' },
    { name: 'industry', label: 'Industry', type: 'string' },
    { name: 'phone', label: 'Phone', type: 'string' },
    { name: 'annual_revenue', label: 'Annual Revenue', type: 'number' },
    { name: 'employees', label: 'Employees', type: 'number' },
    { name: 'created_date', label: 'Created Date', type: 'date' },
    { name: 'is_active', label: 'Active', type: 'boolean' },
  ],
  Contacts: [
    { name: 'contact_id', label: 'Contact ID', type: 'string' },
    { name: 'first_name', label: 'First Name', type: 'string' },
    { name: 'last_name', label: 'Last Name', type: 'string' },
    { name: 'email', label: 'Email', type: 'string' },
    { name: 'phone', label: 'Phone', type: 'string' },
    { name: 'job_title', label: 'Job Title', type: 'string' },
    { name: 'created_date', label: 'Created Date', type: 'date' },
  ],
  Inventory: [
    { name: 'item_code', label: 'Item Code', type: 'string' },
    { name: 'item_name', label: 'Item Name', type: 'string' },
    { name: 'category', label: 'Category', type: 'string' },
    { name: 'quantity', label: 'Quantity', type: 'number' },
    { name: 'unit_cost', label: 'Unit Cost', type: 'number' },
    { name: 'reorder_level', label: 'Reorder Level', type: 'number' },
    { name: 'location', label: 'Location', type: 'string' },
    { name: 'last_updated', label: 'Last Updated', type: 'date' },
  ],
  Orders: [
    { name: 'order_id', label: 'Order ID', type: 'string' },
    { name: 'customer_name', label: 'Customer Name', type: 'string' },
    { name: 'order_date', label: 'Order Date', type: 'date' },
    { name: 'total_amount', label: 'Total Amount', type: 'number' },
    { name: 'status', label: 'Status', type: 'string' },
    { name: 'items_count', label: 'Items Count', type: 'number' },
    { name: 'discount', label: 'Discount', type: 'number' },
  ],
}

export const FieldSelector = ({ config, onAddColumn, onUpdateColumn, onRemoveColumn, onReorderColumns }: any) => {
  const availableFields = AVAILABLE_FIELDS[config.dataSource as keyof typeof AVAILABLE_FIELDS] || []
  const selectedFieldNames = config.columns.map((col: any) => col.name)
  const unselectedFields = availableFields.filter(f => !selectedFieldNames.includes(f.name))

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // Dropped outside droppable area
    if (!destination) return

    // No change
    if (source.index === destination.index && source.droppableId === destination.droppableId) return

    // Reorder columns
    if (source.droppableId === 'columns' && destination.droppableId === 'columns') {
      onReorderColumns(source.index, destination.index)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Available Fields */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-slate-200 rounded-lg p-6 sticky top-6">
          <h3 className="text-lg font-semibold mb-4">Available Fields</h3>
          <p className="text-xs text-slate-500 mb-4">Click to add fields from {config.dataSource}</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {unselectedFields.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">All fields selected</p>
            ) : (
              unselectedFields.map(field => (
                <button
                  key={field.name}
                  onClick={() => onAddColumn({
                    name: field.name,
                    label: field.label,
                    type: field.type,
                    visible: true,
                    order: config.columns.length
                  })}
                  className="w-full text-left px-3 py-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition"
                >
                  <div className="font-medium text-blue-900">{field.label}</div>
                  <div className="text-xs text-blue-700">{field.type}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Selected Columns - Drag & Drop */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Selected Columns ({config.columns.length})</h3>
          <p className="text-xs text-slate-500 mb-4">Drag to reorder, toggle visibility, or remove columns</p>

          {config.columns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-2">No columns selected yet</p>
              <p className="text-xs text-slate-400">Add fields from the left panel to get started</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="columns" type="COLUMN">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-2 min-h-48 p-2 rounded transition ${
                      snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-300' : 'bg-transparent'
                    }`}
                  >
                    {config.columns.map((col: ColumnConfig, idx: number) => (
                      <Draggable key={col.name} draggableId={col.name} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg transition ${
                              snapshot.isDragging
                                ? 'bg-blue-100 border-blue-400 shadow-lg'
                                : 'hover:border-slate-300'
                            }`}
                          >
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
                              title="Drag to reorder"
                            >
                              <GripVertical size={18} />
                            </div>

                            {/* Column Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 truncate">{col.label}</div>
                              <div className="text-xs text-slate-500 truncate">
                                {col.name} ({col.type})
                              </div>
                            </div>

                            {/* Visibility Toggle */}
                            <button
                              onClick={() => onUpdateColumn(idx, { visible: !col.visible })}
                              className={`flex-shrink-0 p-2 rounded transition ${
                                col.visible
                                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                  : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                              }`}
                              title={col.visible ? 'Hide column' : 'Show column'}
                            >
                              {col.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>

                            {/* Remove */}
                            <button
                              onClick={() => onRemoveColumn(idx)}
                              className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded transition"
                              title="Remove column"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {config.columns.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                ✓ {config.columns.length} column(s) selected and ready for charting
              </p>
              <p className="text-xs text-green-700 mt-1">
                Next, configure filters to refine your data before visualization.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
