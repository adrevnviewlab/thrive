import { useEffect, useState } from 'react'
import { NavSection } from '../App'
import ThemeToggle from '../theme'

function useDesktopNav() {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const onChange = () => setDesktop(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return desktop
}

interface SidebarProps {
  current: NavSection
  onNavigate: (s: NavSection) => void
  open: boolean
  onClose: () => void
}

function Icon({ path, path2 }: { path: string; path2?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
      {path2 && <path d={path2} />}
    </svg>
  )
}

const icons: Record<string, { path: string; path2?: string }> = {
  dashboard: { path: 'M3 3h7v7H3V3zM14 3h7v7h-7V3zM14 14h7v7h-7v-7zM3 14h7v7H3v-7z' },
  inventory: {
    path: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  scanner: {
    path: 'M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2',
    path2: 'M7 8h10M7 12h10M7 16h10',
  },
  receive: {
    path: 'M8 17l4 4 4-4m-4 4V3',
    path2: 'M3 9l9-6 9 6v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  },
  orders: {
    path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2',
    path2: 'M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  vendors: {
    path: 'M3 9l9-6 9 6v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    path2: 'M9 22V12h6v10',
  },
  counts: {
    path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2',
    path2: 'M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  reports: { path: 'M18 20V10M12 20V4M6 20v-6' },
  employees: {
    path: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2',
    path2: 'M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  },
  settings: {
    path: 'M12 15a3 3 0 100-6 3 3 0 000 6z',
    path2:
      'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  },
}

const navGroups = [
  {
    label: 'Overview',
    items: [{ id: 'dashboard' as NavSection, label: 'Dashboard', icon: 'dashboard' }],
  },
  {
    label: 'Operations',
    items: [
      { id: 'inventory' as NavSection, label: 'Inventory', icon: 'inventory' },
      { id: 'scanner' as NavSection, label: 'Scanner', icon: 'scanner' },
      { id: 'receive' as NavSection, label: 'Receive Stock', icon: 'receive' },
    ],
  },
  {
    label: 'Ordering',
    items: [
      { id: 'purchase-orders' as NavSection, label: 'Purchase Orders', icon: 'orders' },
      { id: 'vendors' as NavSection, label: 'Vendors', icon: 'vendors' },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'stock-counts' as NavSection, label: 'Stock Counts', icon: 'counts' },
      { id: 'reports' as NavSection, label: 'Reports', icon: 'reports' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: 'employees' as NavSection, label: 'Employees', icon: 'employees' },
      { id: 'settings' as NavSection, label: 'Settings', icon: 'settings' },
    ],
  },
]

export default function Sidebar({ current, onNavigate, open, onClose }: SidebarProps) {
  const desktop = useDesktopNav()
  const visible = desktop || open

  return (
    <aside
      aria-hidden={!visible}
      inert={!visible || undefined}
      className={`fixed inset-y-0 left-0 z-40 flex flex-col h-full w-[min(16rem,86vw)] shrink-0 bg-sidebar border-r border-sidebar-border overflow-y-auto transition-transform duration-200 ease-out md:static md:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-accent text-accent-fg flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-sidebar-fg font-semibold text-sm tracking-wide leading-none">STACKR</div>
              <div className="text-sidebar-muted text-[10px] mt-0.5 leading-none">Smoke Shop</div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = current === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors text-left ${
                      isActive
                        ? 'bg-sidebar-active text-sidebar-fg font-medium'
                        : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg'
                    }`}
                  >
                    <span className={isActive ? 'text-accent' : ''}>
                      <Icon {...icons[item.icon]} />
                    </span>
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-sidebar-border">
        <ThemeToggle />
      </div>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-sidebar-muted text-xs font-medium">Clover Connected</span>
        </div>
        <div className="text-sidebar-muted text-[11px]">
          Last sync: <span className="text-sidebar-fg">2m ago</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-sidebar-hover flex items-center justify-center">
            <span className="text-accent text-[10px] font-bold">C</span>
          </div>
          <div>
            <div className="text-sidebar-fg text-[11px] font-medium leading-none">{"Hassan's Smoke Shop"}</div>
            <div className="text-sidebar-muted text-[10px] mt-0.5">Owner</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
