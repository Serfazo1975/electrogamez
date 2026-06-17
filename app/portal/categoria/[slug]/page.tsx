'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CategoriaPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  useEffect(() => {
    router.replace(`/portal?categoria=${params.slug}`)
  }, [params.slug, router])
  return null
}
