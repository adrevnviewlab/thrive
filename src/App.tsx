import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Inventory from './components/Inventory'
import Scanner from './components/Scanner'
import ReceiveStock from './components/ReceiveStock'
import PurchaseOrders from './components/PurchaseOrders'
import Vendors from './components/Vendors'
import StockCounts from './components/StockCounts'
import Reports from './components/Reports'
import Employees from './components/Employees'
import Settings from './components/Settings'
import ThemeToggle from './theme'

export type NavSection =
  | 'dashboard'
  | 'inventory'
  | 'scanner'
  | 'receive'
  | 'purchase-orders'
  | 'vendors'
  | 'stock-counts'
  | 'reports'
  | 'employees'
  | 'settings'

export default function App() {
  const [section, setSection] = useState<NavSection>('dashboard')
  const [navOpen, setNavOpen] = useState(false)

  function handleNavigate(next: NavSection) {
    setSection(next)
    setNavOpen(false)
  }

  return (
    <div className="flex h-full min-h-0 bg-bg text-fg overflow-hidden">
      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-overlay md:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <Sidebar current={section} onNavigate={handleNavigate} open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="md:hidden flex items-center justify-between gap-3 page-pad py-3 border-b border-border bg-card shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-border text-fg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-accent text-accent-fg flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-fg font-semibold text-sm tracking-wide leading-none">STACKR</div>
              <div className="text-muted-fg text-[10px] mt-0.5 leading-none truncate">Smoke Shop</div>
            </div>
          </div>
          <ThemeToggle compact />
        </header>

        <main className="flex-1 overflow-auto min-w-0 min-h-0">
          {section === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {section === 'inventory' && <Inventory />}
          {section === 'scanner' && <Scanner />}
          {section === 'receive' && <ReceiveStock />}
          {section === 'purchase-orders' && <PurchaseOrders />}
          {section === 'vendors' && <Vendors />}
          {section === 'stock-counts' && <StockCounts />}
          {section === 'reports' && <Reports />}
          {section === 'employees' && <Employees />}
          {section === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}
