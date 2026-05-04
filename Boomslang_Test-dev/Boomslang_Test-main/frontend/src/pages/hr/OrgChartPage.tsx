import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { employeeApi } from '../../api/hrApi'
import { Employee } from '../../types/hr'

interface OrgNode {
  employee: Employee
  children: OrgNode[]
}

function buildTree(employees: Employee[]): OrgNode[] {
  const map = new Map<string, OrgNode>()
  employees.forEach((e) => map.set(e.id, { employee: e, children: [] }))

  const roots: OrgNode[] = []
  employees.forEach((e) => {
    if (e.managerId && map.has(e.managerId)) {
      map.get(e.managerId)!.children.push(map.get(e.id)!)
    } else {
      roots.push(map.get(e.id)!)
    }
  })
  return roots
}

const NodeCard: React.FC<{ node: OrgNode; depth: number }> = ({ node, depth }) => {
  const { employee: e, children } = node

  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-center w-36 hover:shadow-md transition-shadow"
        style={{ borderTopWidth: depth === 0 ? '3px' : '1px', borderTopColor: depth === 0 ? '#3b82f6' : undefined }}
      >
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {e.firstName[0]}{e.lastName[0]}
        </div>
        <p className="text-xs font-semibold text-slate-800 leading-tight">
          {e.firstName} {e.lastName}
        </p>
        <p className="mt-0.5 text-xs text-slate-400 truncate" title={e.email}>{e.email}</p>
        {e.employeeCode && (
          <p className="mt-0.5 text-xs text-slate-300">{e.employeeCode}</p>
        )}
      </div>

      {children.length > 0 && (
        <>
          <div className="w-px h-6 bg-slate-300" />
          <div className="relative flex gap-8">
            {children.length > 1 && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-slate-300"
                style={{ width: `${(children.length - 1) * 11}rem` }}
              />
            )}
            {children.map((child) => (
              <div key={child.employee.id} className="flex flex-col items-center">
                <div className="w-px h-6 bg-slate-300" />
                <NodeCard node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const OrgChartPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['employees-all'],
    queryFn: () => employeeApi.getAll(0, 200),
  })

  const employees: Employee[] = data?.data?.data?.content ?? []

  const roots = useMemo(() => buildTree(employees), [employees])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Org Chart</h1>
        <p className="text-sm text-slate-500">Organizational hierarchy based on reporting lines</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading...</div>
      ) : employees.length === 0 ? (
        <div className="py-20 text-center text-slate-400">No employee data available</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-8">
          <div className="flex gap-16 justify-start">
            {roots.map((root) => (
              <NodeCard key={root.employee.id} node={root} depth={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrgChartPage
