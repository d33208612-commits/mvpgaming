import { getInitDataRaw } from './telegram.js';

const BASE = '/api';

function authHeader() {
  const raw = getInitDataRaw();
  if (raw) return `tma ${raw}`;
  // Dev fallback (browser without Telegram). Stable per-browser id so the
  // same "account" persists across reloads. Change ?dev=ID in URL to switch.
  const urlDev = new URLSearchParams(location.search).get('dev');
  if (urlDev) localStorage.setItem('devUserId', urlDev);
  let devId = localStorage.getItem('devUserId');
  if (!devId) {
    devId = String(1000 + Math.floor(Math.random() * 9000));
    localStorage.setItem('devUserId', devId);
  }
  return `dev ${devId}`;
}

async function request(path, { method = 'GET', body, params } = {}) {
  let url = BASE + path;
  if (params) {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') usp.set(k, v);
    }
    const qs = usp.toString();
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.error || `HTTP ${res.status}`);
    e.code = err.error;
    e.data = err;
    e.status = res.status;
    throw e;
  }
  return res.json();
}

export const api = {
  auth: () => request('/auth', { method: 'POST' }),
  me: () => request('/me'),
  setRole: (role) => request('/role', { method: 'POST', body: { role } }),
  setLang: (lang) => request('/lang', { method: 'POST', body: { lang } }),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: data }),

  feed: () => request('/feed'),
  adminLogin: (password) => request('/admin/login', { method: 'POST', body: { password } }),
  adminVacancies: () => request('/admin/vacancies'),
  adminModerate: (id, action) =>
    request(`/admin/vacancies/${id}/moderate`, { method: 'POST', body: { action } }),
  adminUpdate: (id, data) => request(`/admin/vacancies/${id}`, { method: 'PUT', body: data }),
  adminDelete: (id) => request(`/admin/vacancies/${id}`, { method: 'DELETE' }),

  listVacancies: (filters) => request('/vacancies', { params: filters }),
  getVacancy: (id) => request(`/vacancies/${id}`),
  createVacancy: (data) => request('/vacancies', { method: 'POST', body: data }),
  myVacancies: () => request('/my/vacancies'),
  setVacancyStatus: (id, status) =>
    request(`/vacancies/${id}/status`, { method: 'POST', body: { status } }),
  apply: (id, text) => request(`/vacancies/${id}/apply`, { method: 'POST', body: { text } }),

  chats: () => request('/chats'),
  chatMessages: (vacancyId, peerId) => request(`/chats/${vacancyId || 0}/${peerId}`),
  sendMessage: (data) => request('/messages', { method: 'POST', body: data }),
};
