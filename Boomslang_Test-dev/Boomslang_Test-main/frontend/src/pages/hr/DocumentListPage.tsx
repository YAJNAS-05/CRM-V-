import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '../../api/hrApi'
import { HrDocument } from '../../types/hr'
import { toast } from 'sonner'

const DocumentListPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [employeeId, setEmployeeId] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['hr-documents', page, employeeId, documentType],
    queryFn: () =>
      documentApi.getAll(page, 20, {
        employeeId: employeeId || undefined,
        documentType: documentType || undefined,
      }),
  })

  const verifyMutation = useMutation({
    mutationFn: documentApi.verify,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-documents'] })
      toast.success('Document verified')
    },
    onError: () => toast.error('Failed to verify document'),
  })

  const deleteMutation = useMutation({
    mutationFn: documentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-documents'] })
      toast.success('Document deleted')
    },
    onError: () => toast.error('Failed to delete document'),
  })

  const documents = data?.data?.data?.content ?? []
  const totalPages = data?.data?.data?.totalPages ?? 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Documents</h1>
          <p className="text-sm text-slate-500">Employee document management</p>
        </div>
        <Link
          to="/hr/documents/upload"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Upload Document
        </Link>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Filter by employee ID..."
          value={employeeId}
          onChange={(e) => { setEmployeeId(e.target.value); setPage(0) }}
          className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Document type..."
          value={documentType}
          onChange={(e) => { setDocumentType(e.target.value); setPage(0) }}
          className="w-48 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Uploaded</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No documents found
                  </td>
                </tr>
              ) : (
                documents.map((doc: HrDocument) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {doc.fileName}
                        </a>
                      ) : (
                        <span className="font-medium text-slate-800">{doc.fileName}</span>
                      )}
                      {doc.notes && <p className="text-xs text-slate-400 mt-0.5">{doc.notes}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{doc.documentType ?? '—'}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{doc.employeeId.slice(0, 8)}…</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {doc.isVerified ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Verified</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!doc.isVerified && (
                          <button
                            onClick={() => verifyMutation.mutate(doc.id)}
                            className="text-sm font-medium text-green-600 hover:underline"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Delete this document?')) deleteMutation.mutate(doc.id)
                          }}
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default DocumentListPage
