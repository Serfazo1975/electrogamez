'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Lock, User, Mail, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

export default function PortalLoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({ username: '', email: '', password: '' })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/portal/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) router.push('/portal')
    else setError(data.error || 'Error al ingresar')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    if (regForm.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); setLoading(false); return }
    const res = await fetch('/api/portal/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regForm),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) router.push('/portal')
    else setError(data.error || 'Error al registrarse')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">Acceso al Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Necesitas una cuenta para descargar archivos</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button onClick={() => { setTab('login'); setError('') }} className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${tab === 'login' ? 'text-white border-b-2 border-blue-500 bg-gray-900' : 'text-gray-500 hover:text-gray-300'}`}>
              <LogIn className="w-4 h-4" /> Iniciar Sesion
            </button>
            <button onClick={() => { setTab('register'); setError('') }} className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${tab === 'register' ? 'text-white border-b-2 border-blue-500 bg-gray-900' : 'text-gray-500 hover:text-gray-300'}`}>
              <UserPlus className="w-4 h-4" /> Registrarse
            </button>
          </div>

          <div className="p-6">
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Email o usuario</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pl-9 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input required type={showPwd ? 'text' : 'password'} value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pl-9 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 py-2.5 rounded-xl font-semibold text-sm transition-all">
                  {loading ? 'Verificando...' : 'Ingresar'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Nombre de usuario</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input required value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })}
                      placeholder="miusuario"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pl-9 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input required type="email" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pl-9 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Contraseña (min. 6 caracteres)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input required type={showPwd ? 'text' : 'password'} value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pl-9 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 py-2.5 rounded-xl font-semibold text-sm transition-all">
                  {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
                </button>
                <p className="text-xs text-gray-600 text-center">Al registrarte aceptas las condiciones de uso del portal</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
