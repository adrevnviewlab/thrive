import { useState } from 'react'
import { useDataSource, useEmployees, usePermissions } from '../data/provider'
import { formatDateTime } from '../lib/format'
import type { Employee, Role } from '../types'
import { EmptyState, ErrorState, LoadingRows } from './States'

const roleConfig: Record<Role, { label: string; cls: string; desc: string }> = {
  owner: { label: 'Owner', cls: 'bg-accent/10 text-accent', desc: 'Full system access including settings, cost data, and delete operations.' },
  admin: { label: 'Admin', cls: 'bg-accent/10 text-accent', desc: 'Support access across the merchant, including settings and employees.' },
  manager: { label: 'Manager', cls: 'bg-info-bg text-info', desc: 'Inventory, reports, purchase orders, and stock count approvals.' },
  employee: { label: 'Employee', cls: 'bg-muted text-muted-fg', desc: 'Scan, receive stock, stock counts, and basic inventory view.' },
}

const rolePermissions: Record<Role, { name: string; allowed: boolean }[]> = {
  admin: [
    { name: 'View Inventory', allowed: true },
    { name: 'Edit Inventory', allowed: true },
    { name: 'Delete Products', allowed: true },
    { name: 'View Cost/Margin', allowed: true },
    { name: 'Receive Stock', allowed: true },
    { name: 'Adjustments (any size)', allowed: true },
    { name: 'Purchase Orders', allowed: true },
    { name: 'Approve Stock Counts', allowed: true },
    { name: 'View Reports', allowed: true },
    { name: 'Manage Employees', allowed: true },
    { name: 'Settings / Clover', allowed: true },
  ],
  owner: [
    { name: 'View Inventory', allowed: true },
    { name: 'Edit Inventory', allowed: true },
    { name: 'Delete Products', allowed: true },
    { name: 'View Cost/Margin', allowed: true },
    { name: 'Receive Stock', allowed: true },
    { name: 'Adjustments (any size)', allowed: true },
    { name: 'Purchase Orders', allowed: true },
    { name: 'Approve Stock Counts', allowed: true },
    { name: 'View Reports', allowed: true },
    { name: 'Manage Employees', allowed: true },
    { name: 'Settings / Clover', allowed: true },
  ],
  manager: [
    { name: 'View Inventory', allowed: true },
    { name: 'Edit Inventory', allowed: true },
    { name: 'Delete Products', allowed: false },
    { name: 'View Cost/Margin', allowed: true },
    { name: 'Receive Stock', allowed: true },
    { name: 'Adjustments (any size)', allowed: true },
    { name: 'Purchase Orders', allowed: true },
    { name: 'Approve Stock Counts', allowed: true },
    { name: 'View Reports', allowed: true },
    { name: 'Manage Employees', allowed: false },
    { name: 'Settings / Clover', allowed: false },
  ],
  employee: [
    { name: 'View Inventory', allowed: true },
    { name: 'Edit Inventory', allowed: false },
    { name: 'Delete Products', allowed: false },
    { name: 'View Cost/Margin', allowed: false },
    { name: 'Receive Stock', allowed: true },
    { name: 'Adjustments (any size)', allowed: false },
    { name: 'Purchase Orders', allowed: false },
    { name: 'Approve Stock Counts', allowed: false },
    { name: 'View Reports', allowed: false },
    { name: 'Manage Employees', allowed: false },
    { name: 'Settings / Clover', allowed: false },
  ],
}

export default function Employees() {
  const source = useDataSource()
  const { canManageEmployees } = usePermissions()
  const { data, loading, error, refresh } = useEmployees()
  const employees = data ?? []

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'details' | 'permissions'>('details')
  const [editingRole, setEditingRole] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)
  const [invite, setInvite] = useState<{ name: string; email: string; role: Role }>({
    name: '',
    email: '',
    role: 'employee',
  })
  const [saving, setSaving] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  async function submitInvite(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setInviteError(null)
    try {
      await source.inviteEmployee(invite)
      setInvite({ name: '', email: '', role: 'employee' })
      setInviting(false)
      refresh()
    } catch (cause) {
      setInviteError(cause instanceof Error ? cause.message : 'Could not send that invite')
    } finally {
      setSaving(false)
    }
  }

  const selected = employees.find((employee) => employee.id === selectedId) ?? null

  async function updateSelected(patch: { role?: Role; status?: Employee['status'] }) {
    if (!selected) return
    setUpdating(true)
    setUpdateError(null)
    try {
      await source.updateEmployee(selected.id, patch)
      setEditingRole(false)
      refresh()
    } catch (cause) {
      setUpdateError(cause instanceof Error ? cause.message : 'Could not update this employee')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Employees</h1>
            <p className="text-sm text-muted-fg mt-0.5">
              {employees.filter((e) => e.status === 'active').length} active · Role-based access control
            </p>
          </div>
          <button
            type="button"
            disabled={!canManageEmployees}
            title={canManageEmployees ? undefined : 'Only an owner can invite employees'}
            onClick={() => setInviting((current) => !current)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {inviting ? 'Cancel' : '+ Invite Employee'}
          </button>
        </div>

        {inviting && (
          <form onSubmit={submitInvite} className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              required
              placeholder="Full name"
              value={invite.name}
              onChange={(e) => setInvite({ ...invite, name: e.target.value })}
              className="px-3 py-2 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary"
            />
            <input
              type="email"
              required
              placeholder="Work email"
              value={invite.email}
              onChange={(e) => setInvite({ ...invite, email: e.target.value })}
              className="px-3 py-2 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary"
            />
            <select
              value={invite.role}
              onChange={(e) => setInvite({ ...invite, role: e.target.value as Role })}
              className="px-3 py-2 text-sm rounded-md border border-border bg-bg text-fg"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </select>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Inviting…' : 'Send invite'}
            </button>
            {inviteError && <p className="sm:col-span-4 text-xs text-danger">{inviteError}</p>}
          </form>
        )}
      </div>

      <div className="page-pad py-5 grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Employee list */}
        <div className="xl:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          {error && <ErrorState message={error} onRetry={refresh} />}
          {loading && !data && <LoadingRows rows={5} label="Loading employees" />}
          {!loading && employees.length === 0 && <EmptyState title="No employees yet" detail="Invite your first teammate." />}
          <div className="table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-subtle/50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Employee</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Role</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Last Login</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => {
                    setSelectedId(emp.id === selectedId ? null : emp.id)
                    setTab('details')
                    setEditingRole(false)
                    setUpdateError(null)
                  }}
                  className={`group border-b border-border hover:bg-subtle/40 transition-colors cursor-pointer ${selectedId === emp.id ? 'bg-subtle/60' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-fg">{emp.name}</div>
                        <div className="text-[11px] text-muted-fg">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${roleConfig[emp.role].cls}`}>
                      {roleConfig[emp.role].label}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-sm text-muted-fg">{formatDateTime(emp.lastLoginAt)}</td>
                  <td className="px-3 py-3.5">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${emp.status === 'active' ? 'text-success' : 'text-muted-fg'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-success' : 'bg-muted-fg'}`} />
                      {emp.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedId(emp.id)
                        setTab('details')
                        setEditingRole(false)
                        setUpdateError(null)
                      }}
                      className="text-xs text-primary font-medium opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      Open<span className="sr-only"> {emp.name}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary">
                    {selected.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-display text-[15px] font-medium text-fg">{selected.name}</div>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium mt-0.5 ${roleConfig[selected.role].cls}`}>
                      {roleConfig[selected.role].label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex border-b border-border">
                {(['details', 'permissions'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${tab === t ? 'text-fg border-b-2 border-primary' : 'text-muted-fg hover:text-fg'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === 'details' && (
                <div className="px-5 py-4 space-y-3">
                  <div className="text-xs text-muted-fg">{roleConfig[selected.role].desc}</div>
                  <div className="space-y-2 pt-1">
                    {[
                      { label: 'Email', value: selected.email },
                      { label: 'Employee ID', value: selected.id.slice(0, 8) },
                      { label: 'Last Login', value: formatDateTime(selected.lastLoginAt) },
                      { label: 'Status', value: selected.status === 'active' ? 'Active' : 'Disabled' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-2 text-sm">
                        <span className="text-muted-fg shrink-0">{label}</span>
                        <span className="font-medium text-fg text-right text-xs">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2">
                    <div className="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-2">Permissions</div>
                    <div className="flex flex-wrap gap-1">
                      {rolePermissions[selected.role]
                        .filter((permission) => permission.allowed)
                        .map((permission) => (
                          <span key={permission.name} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-fg">
                            {permission.name}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'permissions' && (
                <div className="px-5 py-4">
                  <div className="space-y-1.5">
                    {rolePermissions[selected.role].map((p) => (
                      <div key={p.name} className="flex items-center justify-between py-1">
                        <span className="text-xs text-fg">{p.name}</span>
                        {p.allowed ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-fg">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-5 py-3 border-t border-border space-y-2">
                {editingRole ? (
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor="employee-role">
                      Role for {selected.name}
                    </label>
                    <select
                      id="employee-role"
                      defaultValue={selected.role}
                      onChange={(e) => updateSelected({ role: e.target.value as Role })}
                      disabled={updating}
                      className="flex-1 px-2 py-1.5 text-xs rounded-md border border-border bg-bg text-fg"
                    >
                      {(['owner', 'manager', 'employee'] as const).map((role) => (
                        <option key={role} value={role}>
                          {roleConfig[role].label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setEditingRole(false)}
                      className="px-3 py-1.5 rounded-md text-xs text-muted-fg hover:text-fg transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!canManageEmployees}
                      title={canManageEmployees ? undefined : 'Only an owner can change roles'}
                      onClick={() => setEditingRole(true)}
                      className="flex-1 py-2 rounded-md border border-border text-xs text-muted-fg hover:text-fg disabled:opacity-50 transition-colors"
                    >
                      Edit Role
                    </button>
                    <button
                      type="button"
                      disabled={updating || !canManageEmployees}
                      onClick={() => updateSelected({ status: selected.status === 'active' ? 'disabled' : 'active' })}
                      className={`flex-1 py-2 rounded-md border text-xs transition-colors disabled:opacity-50 ${
                        selected.status === 'active'
                          ? 'border-danger/30 text-danger hover:bg-danger-bg'
                          : 'border-border text-muted-fg hover:text-fg'
                      }`}
                    >
                      {selected.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                )}
                {updateError && <p className="text-xs text-danger">{updateError}</p>}
                <p className="text-[11px] text-muted-fg">Role and status changes are owner-only and audited.</p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-fg text-sm">
              Select an employee to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
