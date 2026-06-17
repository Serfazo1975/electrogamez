'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Eye, EyeOff, Loader2, Save, X } from 'lucide-react'

interface Category { id: string; name: string; icon: string | null }
interface Project {
  id: string
  title: string
  published: boolean
  category: { name: string }
  _count: { files: number; downloads: number }
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tab, setTab] = useState<'projects' | 'new-project' | 'new-category'>('projects')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const [projForm, setProjForm] = useState({
    title: '', description: '', thumbnail: '', version: '', categoryId: '',
    tags: '', featured: false, published: true,
    files: [{ name: '', fileUrl: '', fileSize: '', platform: '' }],
  })
  const [catForm, setCatForm] = useState({ name: '', icon: '', description: '' })

  function refreshData() {
    fetch('/api/portal/categorias').then(r => r.json()).then(setCategories)
    fetch('/api/portal/admin/proyectos').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setProjects(d)
    })
  }

  useEffect(() => {
    fetch('/api/portal/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') { router.push('/portal/login'); return }
      setLoading(false)
    })
    refreshData()
  }, [router])

  async function saveProject(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaveMsg('')
    const tags = projForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    const files = projForm.files.filter(f => f.name && f.fileUrl)
    const res = await fetch('/api/portal/admin/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...projForm, tags, files }),
    })
    setSaving(false)
    if (res.ok) {
      setSaveMsg('✅ Proyecto creado')
      setProjForm({ title: '', description: '', thumbnail: '', version: '', categoryId: '', tags: '', featured: false, published: true, files: [{ name: '', fileUrl: '', fileSize: '', platform: '' }] })
      refreshData()
      setTimeout(() => setTab('projects'), 1000)
    } else {
      const d = await res.json()
      setSaveMsg(`❌ Error: ${d.error}`)
    }
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/portal/admin/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catForm),
    })
    if (res.ok) {
      refreshData()
      setCatForm({ name: '', icon: '', description: '' })
      setTab('projects')
    }
  }

  async function deleteProject(id: string) {
    if (!confirm('¿Eliminar este proyecto?')) return
    await fetch(`/api/portal/admin/proyectos/${id}`, { method: 'DELETE' })
    setProjects(p => p.filter(x => x.id !== id))
  }

  function addFile() {
    setProjForm(f => ({ ...f, files: [...f.files, { name: '', fileUrl: '', fileSize: '', platform: '' }] }))
  }
  function removeFile(i: number) {
    setProjForm(f => ({ ...f, files: f.files.filter((_, idx) => idx !== i) }))
  }
  function updateFile(i: number, field: string, value: string) {
    setProjForm(f => ({ ...f, files: f.files.map((file, idx) => idx === i ? { ...file, [field]: value } : file) }))
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Panel de Administración</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('new-category')}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Categoría
          </button>
          <button
            onClick={() => setTab('new-project')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo Proyecto
          </button>
        </div>
      </div>

      {tab === 'projects' && (
        <div className="space-y-3">
          {projects.length === 0 && (
            <p className="text-gray-600 text-sm py-8 text-center">No hay proyectos aún. Creá el primero.</p>
          )}
          {projects.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-xs text-gray-500">{p.category.name} · {p._count.files} archivos · {p._count.downloads} descargas</p>
              </div>
              <div className="flex items-center gap-3">
                {p.published
                  ? <Eye className="w-4 h-4 text-green-400" />
                  : <EyeOff className="w-4 h-4 text-gray-600" />
                }
                <button onClick={() => deleteProject(p.id)} className="text-red-500 hover:text-red-400 p-1 rounded transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'new-project' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold">Nuevo Proyecto</h2>
            <button onClick={() => setTab('projects')} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={saveProject} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Título *</label>
                <input
                  required
                  value={projForm.title}
                  onChange={e => setProjForm({ ...projForm, title: e.target.value })}
                  placeholder="Nombre del proyecto"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Versión</label>
                <input
                  value={projForm.version}
                  onChange={e => setProjForm({ ...projForm, version: e.target.value })}
                  placeholder="1.0.0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Categoría *</label>
              <select
                required
                value={projForm.categoryId}
                onChange={e => setProjForm({ ...projForm, categoryId: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Seleccioná una categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-yellow-500 mt-1">⚠ Primero creá una categoría</p>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Descripción *</label>
              <textarea
                required
                rows={4}
                value={projForm.description}
                onChange={e => setProjForm({ ...projForm, description: e.target.value })}
                placeholder="Descripción detallada del proyecto..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">URL Thumbnail (opcional)</label>
                <input
                  value={projForm.thumbnail}
                  onChange={e => setProjForm({ ...projForm, thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Tags (separados por coma)</label>
                <input
                  value={projForm.tags}
                  onChange={e => setProjForm({ ...projForm, tags: e.target.value })}
                  placeholder="arduino, sensor, IoT"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" checked={projForm.featured} onChange={e => setProjForm({ ...projForm, featured: e.target.checked })} />
                Destacado
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" checked={projForm.published} onChange={e => setProjForm({ ...projForm, published: e.target.checked })} />
                Publicado
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400">Archivos para descargar</label>
                <button type="button" onClick={addFile} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Agregar archivo
                </button>
              </div>
              <div className="space-y-3">
                {projForm.files.map((file, i) => (
                  <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 space-y-2">
                    <div className="grid md:grid-cols-2 gap-2">
                      <input
                        value={file.name}
                        onChange={e => updateFile(i, 'name', e.target.value)}
                        placeholder="Nombre del archivo (ej: Firmware v1.0)"
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500 w-full"
                      />
                      <input
                        value={file.platform}
                        onChange={e => updateFile(i, 'platform', e.target.value)}
                        placeholder="Plataforma (ej: Arduino, Windows)"
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500 w-full"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      <input
                        value={file.fileUrl}
                        onChange={e => updateFile(i, 'fileUrl', e.target.value)}
                        placeholder="URL del archivo (Google Drive, Dropbox, etc)"
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500 w-full"
                      />
                      <div className="flex gap-2">
                        <input
                          value={file.fileSize}
                          onChange={e => updateFile(i, 'fileSize', e.target.value)}
                          placeholder="Tamaño (ej: 2.4 MB)"
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                        {projForm.files.length > 1 && (
                          <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-400 p-1.5 rounded transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {saveMsg && (
              <p className="text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">{saveMsg}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Publicar Proyecto'}
            </button>
          </form>
        </div>
      )}

      {tab === 'new-category' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold">Nueva Categoría</h2>
            <button onClick={() => setTab('projects')} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={saveCategory} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Nombre *</label>
              <input
                required
                value={catForm.name}
                onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="Ej: Arduino, Proyectos IoT"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Emoji/Icono</label>
              <input
                value={catForm.icon}
                onChange={e => setCatForm({ ...catForm, icon: e.target.value })}
                placeholder="🔧"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Descripción</label>
              <input
                value={catForm.description}
                onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                placeholder="Descripción breve"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
              <Save className="w-4 h-4" /> Crear Categoría
            </button>
          </form>
          {categories.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2">Categorías existentes:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <span key={c.id} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{c.icon} {c.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
