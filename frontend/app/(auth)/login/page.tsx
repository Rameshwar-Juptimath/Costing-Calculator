'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCostingStore } from '@/store/costingStore'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const setToken = useCostingStore(s => s.setToken)
  const setUser = useCostingStore(s => s.setUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        throw new Error('Invalid email or password')
      }
      const data = await res.json()
      
      // Store token in state
      setToken(data.access_token)
      
      // Set token cookie
      await fetch('/api/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.access_token })
      })
      
      // Fetch me
      const meRes = await fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      })
      if (meRes.ok) {
        const meData = await meRes.json()
        setUser(meData, meData.features)
      }
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md p-8 glass" glass>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-accent mb-2">CostCalc</h1>
        <p className="text-slate-400">Precision manufacturing cost estimation</p>
      </div>
      {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Email" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          data-testid="email-input"
        />
        <Input 
          label="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          data-testid="password-input"
        />
        <Button 
          type="submit" 
          className="w-full mt-6" 
          loading={loading}
          data-testid="login-button"
        >
          Sign In
        </Button>
      </form>
    </Card>
  )
}
