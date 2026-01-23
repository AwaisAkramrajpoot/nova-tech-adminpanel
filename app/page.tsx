'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin login on root path
    router.push('/admin/login')
  }, [router])

  return null
}
