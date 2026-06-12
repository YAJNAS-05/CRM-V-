import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { reportApi } from '@/api/reportApi'

interface Template {
  id: string
  name: string
  module: string
  description: string
  icon: string
}

const TEMPLATES: Template[] = [
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline',
    module: 'CRM',
    description: 'View your sales pipeline by stage and forecast revenue',
    icon: '📊'
  },
  {
    id: 'lead-conversion',
    name: 'Lead Conversion',
    module: 'CRM',
    description: 'Track lead conversion rates and sources',
    icon: '🎯'
  },
  {
    id: 'customer-activity',
    name: 'Customer Activity',
    module: 'CRM',
    description: 'Monitor customer interactions and touchpoints',
    icon: '📞'
  },
  {
    id: 'inventory-stock',
    name: 'Inventory Stock',
    module: 'ERP',
    description: 'Real-time inventory levels and stock movements',
    icon: '📦'
  },
  {
    id: 'purchase-orders',
    name: 'Purchase Orders',
    module: 'ERP',
    description: 'Track purchase orders and supplier performance',
    icon: '🛒'
  },
  {
    id: 'financial-summary',
    name: 'Financial Summary',
    module: 'FINANCE',
    description: 'Overview of income, expenses, and cash flow',
    icon: '💰'
  },
  {
    id: 'invoices-aging',
    name: 'Invoices Aging',
    module: 'FINANCE',
    description: 'Outstanding invoices by aging bucket',
    icon: '📄'
  },
  {
    id: 'expense-analysis',
    name: 'Expense Analysis',
    module: 'FINANCE',
    description: 'Breakdown of expenses by category and department',
    icon: '💸'
  }
]

export const TemplateReportPage = () => {
  const navigate = useNavigate()

  const handleUseTemplate = async (templateName: string) => {
    try {
      const template = TEMPLATES.find((t) => t.name === templateName)
      if (!template) {
        toast.error('Template not found')
        return
      }

      const response = await reportApi.listReports(undefined, 0, 100)
      const page = response.data?.data as { content?: Array<{ reportId: number; reportKey?: string }> } | undefined
      const catalog = page?.content || []

      const match = catalog.find((row) => row.reportKey === template.id)
      if (match?.reportId) {
        navigate(`/reports/view/${match.reportId}`)
        toast.success(`Opened template: ${templateName}`)
        return
      }

      toast.error('Template report is not seeded yet. Restart the backend to load the catalog.')
    } catch (error) {
      console.error('Error opening template report:', error)
      toast.error('Failed to open template report')
    }
  }

  const moduleGroups = TEMPLATES.reduce((groups, template) => {
    if (!groups[template.module]) {
      groups[template.module] = []
    }
    groups[template.module].push(template)
    return groups
  }, {} as Record<string, Template[]>)

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/reports')}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Reports
      </button>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Report Templates</h1>
          <p className="text-muted-foreground">
            Choose from our pre-built templates and customize them for your needs
          </p>
        </div>

        {Object.entries(moduleGroups).map(([module, templates]) => (
          <div key={module}>
            <h2 className="text-lg font-semibold mb-4 text-foreground">{module}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all"
                >
                  <div className="text-3xl mb-3">{template.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <button
                    onClick={() => handleUseTemplate(template.name)}
                    className="w-full px-3 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
