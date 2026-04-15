import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supplierApi } from '../../api/erpApi'
import { Supplier } from '../../types/erp'

export default function SuppliersListPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await supplierApi.getAll(0, 100)
      if (response.data.success) {
        setSuppliers(response.data.data.content)
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading suppliers...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <button onClick={() => navigate('/erp/suppliers/new')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Supplier</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.companyName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{supplier.country}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{supplier.contactName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{supplier.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{supplier.supplierType}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {suppliers.length === 0 && <div className="text-center py-12 text-gray-500">No suppliers found</div>}
      </div>
    </div>
  )
}
