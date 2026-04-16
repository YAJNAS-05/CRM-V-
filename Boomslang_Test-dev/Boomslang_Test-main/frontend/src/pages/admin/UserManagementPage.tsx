import React, { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import { CreateUserRequest, RoleDefinition, UpdateUserRequest, User } from '../../types/auth'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { X, Plus, Edit2, Trash2 } from 'lucide-react'

type LocationOption = {
  name: string
  code?: string
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<Partial<CreateUserRequest>>({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    roles: ['READ_ONLY'],
    officeLocation: 'USA',
    isActive: true,
  })
  const [editFormData, setEditFormData] = useState<Partial<UpdateUserRequest>>({})
  const pageSize = 20

  const roleOptions = useMemo(
    () =>
      roles.length > 0
        ? roles.map((role) => role.name)
        : ['READ_ONLY', 'VIEWER', 'MANAGER', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'SERVICE_TECH', 'ADMIN'],
    [roles]
  )
  const locationOptions = useMemo(
    () => locations.map((location) => location.name),
    [locations]
  )

  useEffect(() => {
    void fetchUsers()
  }, [page])

  useEffect(() => {
    void fetchRoleAndLocationCatalogs()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getUsers(page, pageSize)
      setUsers(response.data.data?.content || [])
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRoleAndLocationCatalogs = async () => {
    try {
      const [rolesResponse, locationsResponse] = await Promise.all([
        adminApi.getRoles(),
        adminApi.getLocations(),
      ])

      const fetchedRoles = rolesResponse.data.data || []
      const fetchedLocations = locationsResponse.data.data || []
      setRoles(fetchedRoles)
      setLocations(fetchedLocations)

      if (fetchedLocations.length > 0 && !formData.officeLocation) {
        setFormData((prev) => ({ ...prev, officeLocation: fetchedLocations[0].name }))
      }
    } catch (error) {
      toast.error('Failed to load role catalog')
    }
  }

  const handleRoleToggle = (
    roleName: string,
    selectedRoles: string[] | undefined,
    onChange: (roles: string[]) => void
  ) => {
    const current = selectedRoles || []
    if (current.includes(roleName)) {
      const next = current.filter((role) => role !== roleName)
      onChange(next)
      return
    }

    onChange([...current, roleName])
  }

  const handleAddUser = async () => {
    try {
      if (!formData.email || !formData.password || !formData.fullName) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!formData.roles || formData.roles.length === 0) {
        toast.error('Please select at least one role')
        return
      }

      const payload: CreateUserRequest = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone || '',
        role: formData.roles[0],
        roles: formData.roles,
        officeLocation: formData.officeLocation || 'USA',
        isActive: formData.isActive ?? true,
      }

      await adminApi.createUser(payload)
      toast.success('User created successfully')
      setShowAddModal(false)
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        roles: ['READ_ONLY'],
        officeLocation: locationOptions[0] || 'USA',
        isActive: true,
      })
      setPage(0)
      await fetchUsers()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create user'
      toast.error(message)
    }
  }

  const handleEditUser = async () => {
    try {
      if (!selectedUser) return

      if (editFormData.roles && editFormData.roles.length === 0) {
        toast.error('Please select at least one role')
        return
      }

      const payload: UpdateUserRequest = {
        ...editFormData,
        role: editFormData.roles && editFormData.roles.length > 0 ? editFormData.roles[0] : editFormData.role,
      }

      await adminApi.updateUser(selectedUser.id, payload)
      toast.success('User updated successfully')
      setShowEditModal(false)
      setSelectedUser(null)
      setEditFormData({})
      await fetchUsers()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update user'
      toast.error(message)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await adminApi.deleteUser(userId)
      toast.success('User deleted successfully')
      await fetchUsers()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete user'
      toast.error(message)
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      await adminApi.toggleUserStatus(userId)
      toast.success('User status updated')
      await fetchUsers()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const openAddModal = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      roles: ['READ_ONLY'],
      officeLocation: locationOptions[0] || 'USA',
      isActive: true,
    })
    setShowAddModal(true)
  }

  const openEditModal = (user: User) => {
    const selectedRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role]

    setSelectedUser(user)
    setEditFormData({
      fullName: user.fullName,
      phone: user.phone,
      role: selectedRoles[0],
      roles: selectedRoles,
      officeLocation: user.officeLocation,
      isActive: user.isActive,
    })
    setShowEditModal(true)
  }

  if (isLoading && users.length === 0) return <div className="p-10 text-center">Loading user records...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity & Access</h1>
          <p className="text-slate-500 font-medium">Manage users, assign multiple roles, and control access.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-200 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Name & Email</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Roles</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Office</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Login</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const userRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role]
              return (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs">
                        {user.fullName
                          .split(' ')
                          .map((name) => name[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                        <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {userRoles.map((roleName) => (
                        <span
                          key={`${user.id}-${roleName}`}
                          className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter"
                        >
                          {roleName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500">{user.officeLocation}</td>
                  <td className="px-6 py-5 text-xs text-slate-400">
                    {user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, HH:mm') : 'Never'}
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                        title="Edit user"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 transition"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="text-xs font-black text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition uppercase tracking-widest"
        >
          &larr; Prev
        </button>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={users.length < pageSize}
          className="text-xs font-black text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition uppercase tracking-widest"
        >
          Next &rarr;
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Password *</label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Roles *</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {roleOptions.map((roleName) => {
                    const checked = (formData.roles || []).includes(roleName)
                    return (
                      <label key={`create-${roleName}`} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            handleRoleToggle(roleName, formData.roles, (nextRoles) =>
                              setFormData((prev) => ({ ...prev, roles: nextRoles }))
                            )
                          }
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <span>{roleName}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Office Location</label>
                <select
                  value={formData.officeLocation || locationOptions[0] || 'USA'}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(locationOptions.length > 0 ? locationOptions : ['USA', 'AUSTRALIA', 'JAPAN']).map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  value={editFormData.fullName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Roles *</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {roleOptions.map((roleName) => {
                    const checked = (editFormData.roles || []).includes(roleName)
                    return (
                      <label key={`edit-${roleName}`} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            handleRoleToggle(roleName, editFormData.roles, (nextRoles) =>
                              setEditFormData((prev) => ({ ...prev, roles: nextRoles }))
                            )
                          }
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <span>{roleName}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Office Location</label>
                <select
                  value={editFormData.officeLocation || locationOptions[0] || 'USA'}
                  onChange={(e) => setEditFormData({ ...editFormData, officeLocation: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(locationOptions.length > 0 ? locationOptions : ['USA', 'AUSTRALIA', 'JAPAN']).map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editFormData.isActive || false}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="editIsActive" className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagementPage
