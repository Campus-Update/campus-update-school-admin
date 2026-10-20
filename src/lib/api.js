export const API_BASE = ''

const TOKEN_KEY = 'cu-school-token'
const REFRESH_KEY = 'cu-school-refresh'
const PROFILE_KEY = 'cu-school-profile'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const getAuth = () => (getToken() ? { token: getToken() } : null)
export const getProfile = () => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) } catch { return null }
}
export const setProfile = (p) => localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
export const setAuth = (auth) => {
  localStorage.setItem(TOKEN_KEY, auth.accessToken || auth.token || '')
  if (auth.refreshToken) localStorage.setItem(REFRESH_KEY, auth.refreshToken)
}
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(PROFILE_KEY)
}

async function api(path, opts = {}) {
  const { auth = true, ...rest } = opts
  const headers = { 'Content-Type': 'application/json', ...(rest.headers || {}) }
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`
  let res = await fetch(API_BASE + path, { ...rest, headers, body: rest.body ? JSON.stringify(rest.body) : undefined })
  if (res.status === 401 && auth && localStorage.getItem(REFRESH_KEY)) {
    const rr = await fetch(API_BASE + '/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: localStorage.getItem(REFRESH_KEY) }),
    })
    if (rr.ok) {
      const ra = await rr.json()
      setAuth(ra)
      headers.Authorization = `Bearer ${getToken()}`
      res = await fetch(API_BASE + path, { ...rest, headers, body: rest.body ? JSON.stringify(rest.body) : undefined })
    } else {
      clearAuth()
      window.location.hash = '/login'
      window.location.reload()
    }
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      message = data.message || data.error || data.title || message
    } catch { /* not json */ }
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}

const qs = (base, params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v)
  })
  const s = q.toString()
  return `${base}${s ? `?${s}` : ''}`
}

export const authApi = {
  login: (email, password) => api('/api/v1/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  profile: () => api('/api/v1/auth/profile'),
  updateProfile: (b) => api('/api/v1/auth/profile', { method: 'PUT', body: b }),
  changePassword: (b) => api('/api/v1/auth/change-password', { method: 'POST', body: b }),
  sessions: () => api('/api/v1/auth/sessions'),
  updateAcademicSettings: (b) => api('/api/v1/auth/academic-settings', { method: 'PUT', body: b }),
}

export const schoolsApi = {
  list: () => api('/api/v1/schools', { auth: false }),
}

export const contentApi = {
  list: (params) => api(qs('/api/v1/content', params)),
  create: (b) => api('/api/v1/content', { method: 'POST', body: b }),
  update: (id, b) => api(`/api/v1/content/${id}`, { method: 'PUT', body: b }),
  setStatus: (id, status) => api(`/api/v1/content/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: (id) => api(`/api/v1/content/${id}`, { method: 'DELETE' }),
}

export const calendarApi = {
  list: () => api('/api/v1/calendar'),
  create: (b) => api('/api/v1/calendar', { method: 'POST', body: b }),
  update: (id, b) => api(`/api/v1/calendar/${id}`, { method: 'PUT', body: b }),
  remove: (id) => api(`/api/v1/calendar/${id}`, { method: 'DELETE' }),
}

export const notificationsApi = {
  list: () => api('/api/v1/notifications'),
}
