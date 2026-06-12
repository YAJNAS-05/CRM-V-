import React, { useMemo, useState } from 'react'
import type { Lead } from '@/types/crm'
import CompletionStatusBadge from '@/components/forms/CompletionStatusBadge'
import { deriveCompletionStatus, countFilledFields } from '@/lib/formCompletion'

export interface LeadConversionFormState {
  createAccount: boolean
  accountName: string
  createDeal: boolean
  dealName: string
}

interface LeadConversionPanelProps {
  lead: Lead
  onCancel: () => void
  onConvert: (form: LeadConversionFormState) => Promise<void>
}

const LeadConversionPanel: React.FC<LeadConversionPanelProps> = ({
  lead,
  onCancel,
  onConvert,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<LeadConversionFormState>({
    createAccount: true,
    accountName: lead.company || '',
    createDeal: true,
    dealName: `${lead.firstName} ${lead.lastName} - Deal`,
  })

  const contactStatus = 'COMPLETED' as const

  const accountRequired = form.createAccount ? ['accountName'] : []
  const accountStatus = deriveCompletionStatus(
    { accountName: form.accountName },
    accountRequired,
  )
  const accountProgress = countFilledFields({ accountName: form.accountName }, ['accountName'])

  const dealRequired = form.createDeal ? ['dealName'] : []
  const dealStatus = deriveCompletionStatus({ dealName: form.dealName }, dealRequired)
  const dealProgress = countFilledFields({ dealName: form.dealName }, ['dealName'])

  const overallRequired = [
    ...(form.createAccount ? ['accountName'] : []),
    ...(form.createDeal ? ['dealName'] : []),
  ]
  const overallStatus = deriveCompletionStatus(
    { accountName: form.accountName, dealName: form.dealName },
    overallRequired,
  )

  const canConvert = overallStatus === 'COMPLETED'

  const sections = useMemo(
    () => [
      {
        id: 'contact',
        title: 'Contact',
        status: contactStatus,
        description: 'A contact record is always created from this lead.',
      },
      {
        id: 'account',
        title: 'Account',
        status: accountStatus,
        progress: accountProgress,
        enabled: form.createAccount,
      },
      {
        id: 'deal',
        title: 'Deal',
        status: dealStatus,
        progress: dealProgress,
        enabled: form.createDeal,
      },
    ],
    [accountProgress, accountStatus, contactStatus, dealProgress, dealStatus, form.createAccount, form.createDeal],
  )

  const handleSubmit = async () => {
    if (!canConvert) {
      return
    }
    setSubmitting(true)
    try {
      await onConvert(form)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-lg rounded-3xl border border-white/70 bg-white p-6 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Convert Lead</h2>
          <p className="mt-1 text-sm text-gray-500">
            Convert &quot;{lead.firstName} {lead.lastName}&quot; into CRM records.
          </p>
        </div>
        <CompletionStatusBadge status={overallStatus} />
      </div>

      <div className="mb-5 space-y-2">
        {sections.map((section) => (
          <div
            key={section.id}
            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
          >
            <span className="font-medium text-slate-800">{section.title}</span>
            <CompletionStatusBadge
              status={section.status}
              filled={section.progress?.filled}
              total={section.progress?.total}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Contact</p>
            <CompletionStatusBadge status={contactStatus} />
          </div>
          <p className="text-xs text-slate-500">
            {lead.firstName} {lead.lastName} · {lead.email || 'No email'} · {lead.company || 'No company'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={form.createAccount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, createAccount: event.target.checked }))
                }
                className="rounded border-gray-300 text-indigo-600"
              />
              Create account
            </label>
            <CompletionStatusBadge
              status={form.createAccount ? accountStatus : 'COMPLETED'}
              filled={accountProgress.filled}
              total={accountProgress.total}
            />
          </div>
          {form.createAccount && (
            <input
              type="text"
              value={form.accountName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, accountName: event.target.value }))
              }
              placeholder="Account name *"
              className="pm-input text-sm w-full"
            />
          )}
        </div>

        <div className="rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={form.createDeal}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, createDeal: event.target.checked }))
                }
                className="rounded border-gray-300 text-indigo-600"
              />
              Create deal
            </label>
            <CompletionStatusBadge
              status={form.createDeal ? dealStatus : 'COMPLETED'}
              filled={dealProgress.filled}
              total={dealProgress.total}
            />
          </div>
          {form.createDeal && (
            <input
              type="text"
              value={form.dealName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dealName: event.target.value }))
              }
              placeholder="Deal name *"
              className="pm-input text-sm w-full"
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canConvert || submitting}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Converting...' : 'Convert Lead'}
        </button>
      </div>
    </div>
  )
}

export default LeadConversionPanel
