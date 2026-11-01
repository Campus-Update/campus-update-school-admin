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
  const multipart = typeof FormData !== 'undefined' && rest.body instanceof FormData
  const headers = { ...(multipart ? {} : { 'Content-Type': 'application/json' }), ...(rest.headers || {}) }
  if (multipart) delete headers['Content-Type']
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`
  const requestBody = multipart ? rest.body : rest.body ? JSON.stringify(rest.body) : undefined
  let res = await fetch(API_BASE + path, { ...rest, headers, body: requestBody })
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
      res = await fetch(API_BASE + path, { ...rest, headers, body: requestBody })
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
  uploadPhoto: (body) => api('/api/v1/auth/profile/photo', { method: 'POST', body }),
  changePassword: (b) => api('/api/v1/auth/change-password', { method: 'POST', body: b }),
  sessions: () => api('/api/v1/auth/sessions'),
  updateAcademicSettings: (b) => api('/api/v1/auth/academic-settings', { method: 'PUT', body: b }),
}

export const schoolsApi = {
  list: () => api('/api/v1/schools', { auth: false }),
}

export const contentApi = {
  list: (params) => api(qs('/api/v1/content', params)),
  create: (b) => api('/api/v1/content/json', { method: 'POST', body: b }), // JSON route; /content is multipart-only now
  update: (id, b) => api(`/api/v1/content/${id}`, { method: 'PUT', body: b }),
  setStatus: (id, status) => api(`/api/v1/content/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: (id) => api(`/api/v1/content/${id}`, { method: 'DELETE' }),
}

export const calendarApi = {
  list: () => api('/api/v1/calendar'),
  manage: (institutionId) => api(qs('/api/v1/calendar/manage', { institutionId })),
  create: (b) => api('/api/v1/calendar/json', { method: 'POST', body: b }), // JSON route; /calendar is multipart-only now
  media: (id, body) => api(`/api/v1/calendar/${id}/media`, { method: 'POST', body }),
  submit: (id) => api(`/api/v1/calendar/${id}/submit`, { method: 'POST' }),
  unpublish: (id) => api(`/api/v1/calendar/${id}/unpublish`, { method: 'POST' }),
  update: (id, b) => api(`/api/v1/calendar/${id}`, { method: 'PUT', body: b }),
  upload: (body) => api('/api/v1/calendar/upload', { method: 'POST', body }),
  publish: (id) => api(`/api/v1/calendar/${id}/publish`, { method: 'POST' }),
  remove: (id) => api(`/api/v1/calendar/${id}`, { method: 'DELETE' }),
}

export const departmentsApi = {
  list: () => api('/api/v1/departments'),
}

export const mediaApi = {
  content: (id, body) => api(`/api/v1/media/content/${id}`, { method: 'POST', body }),
}

export const notificationsApi = {
  list: () => api('/api/v1/notifications'),
  read: (id) => api(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),
  ack: (id) => api(`/api/v1/notifications/${id}/ack`, { method: 'POST' }),
}

// GET /institutions — list institutions visible to the token (school token sees its own row when allowed).
export const institutionsApi = {
  list: (params = {}) => api(qs('/api/v1/institutions', params)),
  mine: async () => { const r = await api('/api/v1/institutions'); return Array.isArray(r) ? r : (r?.items || []); },
};

// Institution statistics (standup 01/11): school tokens are scoped to their own institution.
export const statsApi = {
  registrationsByDepartment: () => api('/api/v1/institution/stats/registrations-by-department'),
  weeklyActiveStudents: () => api('/api/v1/institution/stats/weekly-active-students'),
};
