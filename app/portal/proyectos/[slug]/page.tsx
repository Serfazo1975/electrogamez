'use client'

import { useEffect, useState } from 'react'
import { Download, Eye, Calendar, Tag, Lock, Loader2, ArrowLeft, File } from 'lucide-react'

interface ProjectFile {
  id: string
  name: string
  fileSize: string | null
  platform: string | null
}

interface Project {
  id: string
  title: string
  description: string
  thumbnail: string | null
  version: string | null
  views: number
  createdAt: string
  tags: string[]
  category: { name: string; slug: string; icon: string | null }
  files: ProjectFile[]
  _count: { downloads: number }
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [user, setUser] = useState<{ username: string } | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/portal/proyectos/${params.slug}`).then(r => r.ok ? r.json() : null),
      fetch('/api/portal/auth/me').then(r => r.json()).then(d => d.user),
    ]).then(([proj, usr]) => {
      setProject(proj)
      setUser(usr)
      setLoading(false)
    })
  }, [params.slug])

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-600">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
  if (!project) return (
    <div className="text-center py-20 text-gray-500">Proyecto no encontrado</div>
  )

  return (
    <div>
      <a href="/portal" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al portal
      </a>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
        {project.thumbnail && (
          <div className="aspect-video bg-gray-800 overflow-hidden">
            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <span className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-0.5 rounded-full">
              {project.category.icon} {project.category.name}
            </span>
            {project.version && (
              <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full font-mono">
                v{project.version}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-4">{project.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {project.views} vistas</span>
            <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> {project._count.downloads} descargas</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(project.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">{project.description}</p>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <Tag className="w-4 h-4 text-gray-600" />
              {project.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" /> Archivos para descargar
        </h2>

        {user === undefined ? null : !user ? (
          <div className="text-center py-8 bg-gray-800/50 rounded-xl border border-gray-700">
            <Lock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium mb-1">Necesitás una cuenta para descargar</p>
            <p className="text-gray-600 text-sm mb-4">Es gratis y solo toma un minuto</p>
            <a
              href="/portal/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Iniciar sesión / Registrarse
            </a>
          </div>
        ) : project.files.length === 0 ? (
          <p className="text-gray-600 text-sm">No hay archivos disponibles aún</p>
        ) : (
          <div className="space-y-3">
            {project.files.map(file => (
              <div key={file.id} className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {file.platform && <span className="mr-2">📌 {file.platform}</span>}
                      {file.fileSize && <span>{file.fileSize}</span>}
                    </p>
                  </div>
                </div>
                <a
                  href={`/api/portal/download/${file.id}`}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                >
                  <Download className="w-4 h-4" /> Descargar
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
