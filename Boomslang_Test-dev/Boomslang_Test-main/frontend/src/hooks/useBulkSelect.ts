import { useState, useCallback } from 'react'

/**
 * Generic multi-select / bulk operations hook.
 *
 * Usage:
 *   const bulk = useBulkSelect(rows, r => r.id)
 *   <input type="checkbox" checked={bulk.allSelected} onChange={bulk.toggleAll} />
 *   {rows.map(r => <input type="checkbox" checked={bulk.isSelected(r.id)} onChange={() => bulk.toggle(r.id)} />)}
 *   <BulkActionBar count={bulk.count} onClear={bulk.clearAll} actions={[...]} />
 */
export function useBulkSelect<T>(
  items: T[],
  getId: (item: T) => string,
) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelected(prev => {
      if (prev.size === items.length && items.length > 0) return new Set()
      return new Set(items.map(getId))
    })
  }, [items, getId])

  const clearAll = useCallback(() => setSelected(new Set()), [])

  const isSelected = useCallback((id: string) => selected.has(id), [selected])

  const selectedItems = items.filter(item => selected.has(getId(item)))

  const allSelected = items.length > 0 && selected.size === items.length
  const someSelected = selected.size > 0 && !allSelected

  return {
    selected,
    selectedItems,
    count: selected.size,
    isSelected,
    toggle,
    toggleAll,
    clearAll,
    allSelected,
    someSelected,
  }
}

export default useBulkSelect
