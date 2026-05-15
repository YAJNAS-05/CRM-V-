import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { erpMappingApi } from '../../api/erpMappingApi'
import toast from 'react-hot-toast'

interface FieldMapping {
  id: string
  sourceModule: string
  targetModule: string
  sourceField: string
  targetField: string
  isRequired: boolean
  isAutoPopulated: boolean
  mappingType: string
  lookupValues?: string
  description?: string
  isActive: boolean
}

const ERPFieldMappingPage: React.FC = () => {
  const [mappings, setMappings] = useState<FieldMapping[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    sourceModule: '',
    targetModule: '',
    sourceField: '',
    targetField: '',
    isRequired: false,
    isAutoPopulated: false,
    mappingType: 'DIRECT',
    lookupValues: '',
    description: '',
  })

  const modules = ['INVENTORY', 'EQUIPMENT', 'SALES_ORDER', 'PURCHASE_ORDER', 'SPARE_PARTS', 'SUPPLIER']
  const mappingTypes = ['DIRECT', 'LOOKUP', 'FORMULA', 'STATIC']

  useEffect(() => {
    loadMappings()
  }, [])

  const loadMappings = async () => {
    setLoading(true)
    try {
      const response = await erpMappingApi.getAllMappings(0, 50)
      if (response.success) {
        setMappings(response.data.content || [])
      }
    } catch (error) {
      toast.error('Failed to load mappings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!formData.sourceModule || !formData.targetModule || !formData.sourceField || !formData.targetField) {
      setValidationError('All fields are required')
      return
    }

    try {
      if (editingId) {
        await erpMappingApi.updateMapping(editingId, {
          sourceField: formData.sourceField,
          targetField: formData.targetField,
          isRequired: formData.isRequired,
          isAutoPopulated: formData.isAutoPopulated,
          mappingType: formData.mappingType,
          lookupValues: formData.lookupValues,
          description: formData.description,
        })
        toast.success('Mapping updated successfully')
      } else {
        await erpMappingApi.createMapping(formData)
        toast.success('Mapping created successfully')
      }
      resetForm()
      loadMappings()
    } catch (error) {
      toast.error('Failed to save mapping')
      console.error(error)
    }
  }

  const handleEdit = (mapping: FieldMapping) => {
    setFormData({
      sourceModule: mapping.sourceModule,
      targetModule: mapping.targetModule,
      sourceField: mapping.sourceField,
      targetField: mapping.targetField,
      isRequired: mapping.isRequired,
      isAutoPopulated: mapping.isAutoPopulated,
      mappingType: mapping.mappingType,
      lookupValues: mapping.lookupValues || '',
      description: mapping.description || '',
    })
    setEditingId(mapping.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this mapping?')) {
      try {
        await erpMappingApi.deleteMapping(id)
        toast.success('Mapping deleted successfully')
        loadMappings()
      } catch (error) {
        toast.error('Failed to delete mapping')
        console.error(error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      sourceModule: '',
      targetModule: '',
      sourceField: '',
      targetField: '',
      isRequired: false,
      isAutoPopulated: false,
      mappingType: 'DIRECT',
      lookupValues: '',
      description: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ERP Field Mappings</h1>
            <p className="text-sm text-gray-600 mt-1">Configure field mappings between ERP modules</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Mapping
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Mapping' : 'Create New Mapping'}</h2>
            
            {validationError && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4" />
                {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Module *</label>
                <select
                  value={formData.sourceModule}
                  onChange={(e) => setFormData({ ...formData, sourceModule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select source module</option>
                  {modules.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Module *</label>
                <select
                  value={formData.targetModule}
                  onChange={(e) => setFormData({ ...formData, targetModule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select target module</option>
                  {modules.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Field *</label>
                <input
                  type="text"
                  value={formData.sourceField}
                  onChange={(e) => setFormData({ ...formData, sourceField: e.target.value })}
                  placeholder="e.g., itemCode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Field *</label>
                <input
                  type="text"
                  value={formData.targetField}
                  onChange={(e) => setFormData({ ...formData, targetField: e.target.value })}
                  placeholder="e.g., productCode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mapping Type</label>
                <select
                  value={formData.mappingType}
                  onChange={(e) => setFormData({ ...formData, mappingType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mappingTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this mapping"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lookup Values (JSON)</label>
                <textarea
                  value={formData.lookupValues}
                  onChange={(e) => setFormData({ ...formData, lookupValues: e.target.value })}
                  placeholder='["VALUE1", "VALUE2"]'
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Required Field</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAutoPopulated}
                    onChange={(e) => setFormData({ ...formData, isAutoPopulated: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-Populate</span>
                </label>
              </div>

              <div className="col-span-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Create'} Mapping
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mappings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading mappings...</div>
          ) : mappings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No mappings configured yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Source</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Target</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Source Field</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Target Field</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Requirements</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping) => (
                  <tr key={mapping.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{mapping.sourceModule}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{mapping.targetModule}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{mapping.sourceField}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{mapping.targetField}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {mapping.mappingType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {mapping.isRequired && <span className="text-red-600 font-medium">Required</span>}
                      {mapping.isAutoPopulated && <span className="text-green-600 font-medium"> Auto-Pop</span>}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(mapping)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mapping.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default ERPFieldMappingPage
