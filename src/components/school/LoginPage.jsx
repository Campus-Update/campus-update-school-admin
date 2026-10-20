import { useState } from 'react'
import { LogoMark } from './Icons.jsx'
import { authApi, setAuth, setProfile } from '../../lib/api.js'

export default function LoginPage({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const auth = await authApi.login(email.trim(), password)
      setAuth(auth)
      try {
        setProfile(await authApi.profile())
      } catch {
        setProfile(null)
      }
      onLoggedIn()
    } catch (err) {
      setError(err.status === 401 ? 'Invalid email or password.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#E9E9EA] p-4">
      <div className="w-full max-w-[440px] rounded-2xl border border-[#DBDBDB] bg-white p-8">
        <div className="flex items-center gap-3">
          <LogoMark className="h-9 w-8" />
          <span className="text-xl font-bold tracking-[-0.3px] text-[#17171B]">Campus Update</span>
        </div>
        <h1 className="mt-7 text-2xl font-semibold leading-8 text-[#111827]">School Admin sign in</h1>
        <p className="mt-1.5 text-sm leading-5 text-[#6B7280]">Publish news, events and announcements to your campus.</p>

        <form className="mt-7 flex flex-col gap-5" onSubmit={submit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-5 text-[#374151]" htmlFor="sa-email">Email</label>
            <input
              id="sa-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-lg border border-[#D1D5DC] bg-white px-4 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEEDFD]"
              placeholder="you@institution.edu.ng"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-5 text-[#374151]" htmlFor="sa-pass">Password</label>
            <input
              id="sa-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-lg border border-[#D1D5DC] bg-white px-4 text-sm text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEEDFD]"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="rounded-lg bg-[#FEE4E2] px-4 py-3 text-sm leading-5 text-[#D92D20]">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="h-12 rounded-lg bg-[#4F46E5] text-sm font-semibold leading-5 text-white hover:bg-[#4338CA] disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
