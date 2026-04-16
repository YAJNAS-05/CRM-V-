// src/components/dashboard/DashboardGrid.tsx
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { DashboardWidget } from '@/api/dashboardApi'
import WidgetCard from './WidgetCard'
import './DashboardGrid.css'

interface DashboardGridProps {
  widgets: DashboardWidget[]
  gridColumns?: number
  onDeleteWidget: (widgetId: number) => void
  onToggleVisibility: (widget: DashboardWidget) => void
  onToggleLock: (widget: DashboardWidget) => void
}

export const DashboardGrid = ({
  widgets,
  gridColumns = 12,
  onDeleteWidget,
  onToggleVisibility,
  onToggleLock,
}: DashboardGridProps) => {
  const sortedWidgets = [...widgets].sort((a, b) => (a.widgetOrder || 0) - (b.widgetOrder || 0))

  return (
    <Droppable droppableId="dashboard-grid" type="WIDGET">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`grid-container ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            gap: '1.5rem',
            minHeight: '100vh',
            padding: '1rem',
            backgroundColor: snapshot.isDraggingOver ? '#f5f5f5' : 'transparent',
            transition: 'background-color 0.2s ease',
          }}
        >
          {sortedWidgets.map((widget, index) => (
            <Draggable
              key={`widget-${widget.widgetId}`}
              draggableId={`widget-${widget.widgetId}`}
              index={index}
              isDragDisabled={widget.isLocked}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    gridColumn: `span ${widget.colSpan || 3}`,
                    gridRow: `span ${widget.rowSpan || 2}`,
                    opacity: snapshot.isDragging ? 0.5 : 1,
                    transition: 'opacity 0.2s ease',
                    ...provided.draggableProps.style,
                  }}
                >
                  {!widget.isVisible ? (
                    <div className="w-full h-full bg-muted rounded-lg border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Hidden Widget</span>
                    </div>
                  ) : (
                    <WidgetCard
                      widget={widget}
                      onDelete={onDeleteWidget}
                      onToggleVisibility={onToggleVisibility}
                      onToggleLock={onToggleLock}
                    />
                  )}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

export default DashboardGrid
