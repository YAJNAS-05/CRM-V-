import React, { useState } from 'react'
import { adminApi } from '../../api/adminApi'
import { toast } from 'sonner'

const InviteUserPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [redirectTo, setRedirectTo] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInvite = async () => {
    if (!email) return toast.error('Please enter an email')
    setIsLoading(true)
    try {
      await adminApi.createUser({
        email,
        password: 'TempPass123!',
        fullName: email,
        phone: '',
        role: 'EMPLOYEE',
        roles: ['EMPLOYEE'],
        isActive: true,
        officeLocation: 'HQ',
      })
      toast.success('Invite sent')
      setEmail('')
      setRedirectTo('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send invite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Invite User</h2>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="user@example.com" />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Redirect URL (optional)</label>
        <input value={redirectTo} onChange={(e) => setRedirectTo(e.target.value)} className="w-full rounded border px-3 py-2" placeholder="https://app.local/finish-signup" />
      </div>
      <button onClick={handleInvite} disabled={isLoading} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded">
        {isLoading ? 'Sending...' : 'Send Invite'}
      </button>
    </div>
  )
}

export default InviteUserPage
