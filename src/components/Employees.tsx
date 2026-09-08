import { useState } from 'react'

type Role = 'owner' | 'manager' | 'employee'

interface Employee {
  id: string
  name: string
  email: string
  role: Role
  lastLogin: string
  status: 'active' | 'inactive'
  permissions: string[]
}

const employees: Employee[] = [
  {
    id: 'EMP-01',
    name: 'Hassan M.',
    email: 'hassan@hassansmokeshop.com',
    role: 'owner',
    lastLogin: 'Today, 9:44 PM',
    status: 'active',
    permissions: ['Full access'],
  },
  {
    id: 'EMP-02',
    name: 'Marcus T.',
    email: 'marcus@hassansmokeshop.com',
    role: 'manager',
    lastLogin: 'Today, 4:12 PM',
    status: 'active',
    permissions: ['Inventory', 'Reports', 'Purchase Orders', 'Approve Stock Counts'],
  },
  {
    id: 'EMP-03',
    name: 'Aisha R.',
    email: 'aisha@hassansmokeshop.com',
    role: 'employee',
    lastLogin: 'Today, 1:30 PM',
    status: 'active',
    permissions: ['Scan', 'Receive Stock', 'Stock Count', 'Inventory View'],
  },
  {
    id: 'EMP-04',
    name: 'Jordan K.',
    email: 'jordan@hassansmokeshop.com',
    role: 'employee',
    lastLogin: 'Yesterday, 6:00 PM',
    status: 'active',
    permissions: ['Scan', 'Receive Stock', 'Stock Count', 'Inventory View'],
  },
  {
    id: 'EMP-05',
    name: 'Tariq B.',
    email: 'tariq@hassansmokeshop.com',
    role: 'employee',
    lastLogin: 'Sep 2, 2026',
    status: 'inactive',
    permissions: ['Scan', 'Inventory View'],
  },
]

const roleConfig: Record<Role, { label: string; cls: string; desc: string }> = {
  owner: { label: 'Owner', cls: 'bg-accent/10 text-accent', desc: 'Full system access including settings, cost data, and delete operations.' },
  manager: { label: 'Manager', cls: 'bg-info-bg text-info', desc: 'Inventory, reports, purchase orders, and stock count approvals.' },
  employee: { label: 'Employee', cls: 'bg-muted text-muted-fg', desc: 'Scan, receive stock, stock counts, and basic inventory view.' },
}

const rolePermissions: Record<Role, { name: string; allowed: boolean }[]> = {
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
  const [selected, setSelected] = useState<Employee | null>(null)
  const [tab, setTab] = useState<'details' | 'permissions'>('details')

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Employees</h1>
            <p className="text-sm text-muted-fg mt-0.5">
              {employees.filter(e => e.status === 'active').length} active · Role-based access control
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors">
            + Invite Employee
          </button>
        </div>
      </div>

      <div className="page-pad py-5 grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Employee list */}
        <div className="xl:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
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
                  onClick={() => { setSelected(emp === selected ? null : emp); setTab('details') }}
                  className={`border-b border-border hover:bg-subtle/40 transition-colors cursor-pointer ${selected?.id === emp.id ? 'bg-subtle/60' : ''}`}
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
                  <td className="px-3 py-3.5 text-sm text-muted-fg">{emp.lastLogin}</td>
                  <td className="px-3 py-3.5">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${emp.status === 'active' ? 'text-success' : 'text-muted-fg'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-success' : 'bg-muted-fg'}`} />
                      {emp.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="opacity-0 group-hover:opacity-100 text-xs text-primary font-medium transition-opacity">Edit</span>
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
                      { label: 'Employee ID', value: selected.id },
                      { label: 'Last Login', value: selected.lastLogin },
                      { label: 'Status', value: selected.status === 'active' ? 'Active' : 'Inactive' },
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
                      {selected.permissions.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-fg">{p}</span>
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

              <div className="px-5 py-3 border-t border-border flex gap-2">
                <button className="flex-1 py-2 rounded-md border border-border text-xs text-muted-fg hover:text-fg transition-colors">
                  Edit Role
                </button>
                <button className="flex-1 py-2 rounded-md border border-danger/30 text-xs text-danger hover:bg-danger-bg transition-colors">
                  Deactivate
                </button>
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
