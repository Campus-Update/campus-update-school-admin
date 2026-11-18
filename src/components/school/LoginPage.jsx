import { useState } from 'react'
import { LogoMark } from './Icons.jsx'
import { authApi, setAuth, setProfile } from '../../lib/api.js'


function ForgotBlock({ onBack }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [np, setNp] = useState('')
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const request = async (e) => { e.preventDefault(); setBusy(true); setErr(''); try { await authApi.forgotPassword(email.trim()); setStep(2); setMsg('If that account exists, a reset code was emailed (valid 15 minutes).'); } catch (e2) { setErr(e2.message); } finally { setBusy(false); } }
  const reset = async (e) => { e.preventDefault(); setBusy(true); setErr(''); try { await authApi.resetPassword({ email: email.trim(), code: code.trim(), newPassword: np }); setMsg('Password changed — sign in with the new password.'); onBack(); } catch (e2) { setErr(e2.message); } finally { setBusy(false); } }
  return (
    <form className="mt-7 flex flex-col gap-4" onSubmit={step === 1 ? request : reset}>
      <p className="text-sm text-[#6B7280]">{step === 1 ? 'Enter your account email to receive a reset code.' : msg}</p>
      <input className="h-12 w-full rounded-lg border border-[#D1D5DC] bg-white px-4 text-sm outline-none focus:border-[#4F46E5]" type="email" required placeholder="you@institution.edu.ng" value={email} onChange={(e) => setEmail(e.target.value)} />
      {step === 2 && (<>
        <input className="h-12 w-full rounded-lg border border-[#D1D5DC] bg-white px-4 text-sm outline-none focus:border-[#4F46E5]" required placeholder="8-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
        <input className="h-12 w-full rounded-lg border border-[#D1D5DC] bg-white px-4 text-sm outline-none focus:border-[#4F46E5]" type="password" required minLength={8} placeholder="New password (8+ chars)" value={np} onChange={(e) => setNp(e.target.value)} />
      </>)}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" className="h-12 rounded-lg bg-[#4F46E5] text-sm font-semibold text-white hover:bg-[#4338CA]" disabled={busy}>{busy ? 'Working…' : step === 1 ? 'Send reset code' : 'Set new password'}</button>
      <button type="button" className="text-sm text-[#4F46E5]" onClick={onBack}>Back to sign in</button>
    </form>
  )
}

export default function LoginPage({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState('login')
  const [code, setCode] = useState('')
  const [np, setNp] = useState('')
  const [info, setInfo] = useState('')

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

        {stage !== 'login' ? <ForgotBlock onBack={() => setStage('login')} /> : (
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
        )}
        {stage === 'login' && (
          <button type="button" className="mt-4 text-sm font-medium text-[#4F46E5] hover:underline" onClick={() => setStage('forgot')}>Forgot password?</button>
        )}
      </div>
    </div>
  )
}
