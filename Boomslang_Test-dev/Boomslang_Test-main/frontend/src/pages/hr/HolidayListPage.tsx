import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { holidayApi } from '../../api/hrApi'
import { Holiday } from '../../types/hr'

const defaultForm = {
  holidayDate: '',
  name: '',
  region: '',
  optional: false,
  description: '',
}

type HolidayForm = typeof defaultForm

const HolidayListPage: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Holiday | null>(null)
  const [formData, setFormData] = useState<HolidayForm>(defaultForm)
  const [regionFilter, setRegionFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadHolidays()
  }, [regionFilter, startDate, endDate])

  const loadHolidays = async () => {
    try {
      setLoading(true)
      const response = await holidayApi.getAll(0, 200, {
        region: regionFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setHolidays(response.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load holidays', error)
      toast.error('Failed to load holidays')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (holiday: Holiday) => {
    setEditing(holiday)
    setFormData({
      holidayDate: holiday.holidayDate,
      name: holiday.name,
      region: holiday.region || '',
      optional: Boolean(holiday.optional),
      description: holiday.description || '',
    })
  }

  const resetForm = () => {
    setEditing(null)
    setFormData(defaultForm)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.holidayDate || !formData.name.trim()) {
      toast.error('Holiday date and name are required')
      return
    }

    try {
      setSaving(true)
      const payload = {
        holidayDate: formData.holidayDate,
        name: formData.name.trim(),
        region: formData.region || null,
        optional: formData.optional,
        description: formData.description || null,
      }

      if (editing) {
        await holidayApi.update(editing.id, payload)
        toast.success('Holiday updated')
      } else {
        await holidayApi.create(payload)
        toast.success('Holiday created')
      }

      resetForm()
      loadHolidays()
    } catch (error) {
      console.error('Failed to save holiday', error)
      toast.error('Failed to save holiday')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Holiday Master</h1>
          <p className="text-sm text-gray-500">Manage holiday calendars across regions.</p>
        </div>
        {editing && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel editing
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Holiday Date *</label>
            <input
              type="date"
              value={formData.holidayDate}
              onChange={(event) => setFormData((prev) => ({ ...prev, holidayDate: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Holiday Name *</label>
            <input
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Region</label>
            <input
              value={formData.region}
              onChange={(event) => setFormData((prev) => ({ ...prev, region: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. AU, NZ"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.optional}
              onChange={(event) => setFormData((prev) => ({ ...prev, optional: event.target.checked }))}
            />
            Optional holiday
          </label>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : editing ? 'Save changes' : 'Create holiday'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          value={regionFilter}
          onChange={(event) => setRegionFilter(event.target.value)}
          placeholder="Filter by region"
          className="min-w-[200px] rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            setRegionFilter('')
            setStartDate('')
            setEndDate('')
          }}
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Clear filters
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Optional</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : holidays.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    No holidays yet.
                  </td>
                </tr>
              ) : (
                holidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{holiday.holidayDate}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{holiday.name}</div>
                      <div className="text-xs text-gray-500">{holiday.description || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{holiday.region || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{holiday.optional ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => startEdit(holiday)}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HolidayListPage
