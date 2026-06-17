'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download, Eye, Calendar, ArrowRight, Star, Loader2 } from 'lucide-react'

interface Project {
  id: string
  title: string
  slug: string
  description: string
  thumbnail: string | null
  version: string | null
  createdAt: string
  views: number
  featured: boolean
  category: { name: string; slug: string; icon: string | null }
  _count: { files: number; downloads: number }
}

function CategoryBadge({ name, icon }: { name: string; icon: string | null }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-0.5 rounded-full">
      {icon && <span>{icon}</span>}
      {name}
    </span>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl overflow-hidden transition-all duration-200 group flex flex-col">
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-blue-900/40 to-cyan-900/20 relative overflow-hidden flex items-center justify-center">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="text-4xl opacity-30">
            {project.category.icon || '📦'}
          </div>
        )}
        {project.featured && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">
            <Star className="w-3 h-3" /> Destacado
          </div>
        )}
        {project.version && (
          <div className="absolute bottom-2 left-2 text-xs bg-black/60 text-gray-300 px-2 py-0.5 rounded font-mono">
            v{project.version}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <CategoryBadge name={project.category.name} icon={project.category.icon} />
        </div>
        <h3 className="font-semibold text-white mb-1.5 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
          {project.title}
        </h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1 line-clamp-3">
          {project.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {project.views}</span>
          <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {project._count.downloads}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(project.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>

        <a href={`/portal/proyectos/${project.slug}`} className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-600 text-gray-300 hover:text-white py-2 rounded-lg text-sm font-medium transition-all">
          Ver y Descargar <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}

function PortalPageContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const categoria = searchParams.get('categoria') || ''

  const [data, setData] = useState<{ projects: Project[]; total: number; pages: number } | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (q) params.set('q', q)
    if (categoria) params.set('categoria', categoria)
    fetch(`/api/portal/proyectos?${params}`).then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [q, categoria, page])

  return (
    <div>
      {/* Banner */}
      {!q && !categoria && (
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-800/30 rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold mb-1">Portal de Proyectos</h1>
          <p className="text-gray-400 text-sm">Descarga proyectos, herramientas y recursos. Necesitas una cuenta para descargar.</p>
        </div>
      )}

      {q && (
        <div className="mb-4">
          <p className="text-gray-400 text-sm">Resultados para: <span className="text-white font-medium">"{q}"</span></p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : data?.projects.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-lg font-medium text-gray-500">No hay proyectos aún</p>
          <p className="text-sm mt-1">Volvé pronto o buscá otra categoría</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.projects.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function PortalPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-600"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <PortalPageContent />
    </Suspense>
  )
}
