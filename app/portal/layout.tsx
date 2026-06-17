'use client'

import { useState, useEffect } from 'react'
import { Zap, Search, LogIn, LogOut, User, ChevronRight, Home, Upload, Menu, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  _count: { projects: number }
}

interface PortalUser {
  id: string
  username: string
  role: string
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/portal/auth/me').then(r => r.json()).then(d => setUser(d.user))
    fetch('/api/portal/categorias').then(r => r.json()).then(setCategories)
  }, [])

  async function logout() {
    await fetch('/api/portal/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/portal'
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) window.location.href = `/portal?q=${encodeURIComponent(search)}`
  }

  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0">
      {/* Search */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar proyectos..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Categories */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Categorias</h3>
        <ul className="space-y-1">
          <li>
            <a href="/portal" className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-sm group">
              <span className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5" /> Todos
              </span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
            </a>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <a href={`/portal/categoria/${cat.slug}`} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-sm group">
                <span className="flex items-center gap-2">
                  <span>{cat.icon || '📁'}</span>
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="text-xs text-gray-600 group-hover:text-gray-400">{cat._count.projects}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Admin panel link */}
      {user?.role === 'admin' && (
        <div className="bg-blue-950/50 border border-blue-800/50 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">Admin</h3>
          <a href="/portal/admin" className="flex items-center gap-2 text-blue-300 hover:text-white text-sm transition-colors">
            <Upload className="w-4 h-4" /> Subir Proyecto
          </a>
        </div>
      )}
    </aside>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ElectroGamez</span>
            </a>
            <span className="text-gray-600">|</span>
            <a href="/portal" className="text-sm text-gray-400 hover:text-white transition-colors">Portal</a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.username}</span>
                  {user.role === 'admin' && <span className="text-xs bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded">Admin</span>}
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            ) : (
              <a href="/portal/login" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                <LogIn className="w-4 h-4" /> Ingresar
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)}>
              <div className="w-72 h-full bg-gray-950 p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <Sidebar />
              </div>
            </div>
          )}

          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Main */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      <footer className="border-t border-gray-800/60 py-6 px-4 mt-8">
        <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} ElectroGamez · Portal de Descargas · Requiere registro para descargar
        </div>
      </footer>
    </div>
  )
}
