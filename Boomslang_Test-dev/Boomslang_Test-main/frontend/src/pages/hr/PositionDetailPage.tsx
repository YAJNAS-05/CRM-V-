import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { positionApi } from '../../api/hrApi'
import { Position } from '../../types/hr'

const PositionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [position, setPosition] = useState<Position | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchPosition(id)
    }
  }, [id])

  const fetchPosition = async (positionId: string) => {
    try {
      setLoading(true)
      const response = await positionApi.getById(positionId)
      setPosition(response.data.data || null)
    } catch (error) {
      console.error('Failed to load position:', error)
      toast.error('Failed to load position')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('Delete this position?')) return

    try {
      await positionApi.delete(id)
      toast.success('Position deleted')
      navigate('/hr/positions')
    } catch (error) {
      console.error('Failed to delete position:', error)
      toast.error('Failed to delete position')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!position) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Position not found.</div>
        <Link to="/hr/positions" className="inline-flex mt-4 text-sm text-gray-600 hover:text-gray-900">
          Back to Positions
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{position.title}</h1>
          <p className="text-sm text-gray-500">Grade: {position.grade || '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/hr/positions/${position.id}/edit`}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
          <Link to="/hr/positions" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500">Minimum Salary</p>
          <p className="text-gray-900">{position.minSalary ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Maximum Salary</p>
          <p className="text-gray-900">{position.maxSalary ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Currency</p>
          <p className="text-gray-900">{position.currency || '—'}</p>
        </div>
      </div>
    </div>
  )
}

export default PositionDetailPage
