const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const API_URL = `${API_BASE}/api/v1`;
const AUTH_TOKEN_KEY = 'hotel_auth_token';

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {})
    }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}
export const api = {
  login: async (username: string, password: string) => {
    const result = await request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    localStorage.setItem(AUTH_TOKEN_KEY, result.data.token);
    return result;
  },
  me: () => request<any>('/auth/me'),
  updateLanguage: (language: 'en' | 'vi') =>
    request<any>('/auth/preferences/language', {
      method: 'PATCH',
      body: JSON.stringify({ language })
    }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  users: () => request<any>('/admin/users'),
  createUser: (data: {
    username: string;
    name: string;
    jobTitle: string;
    password: string;
    role: string;
    propertyIds: string[];
  }) => request<any>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateUser: (id: string, data: {
    name: string;
    jobTitle: string;
    role: string;
    propertyIds: string[];
  }) => request<any>(`/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  resetUserPassword: (id: string, password: string) =>
    request<any>(`/admin/users/${encodeURIComponent(id)}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password })
    }),
  deleteUser: (id: string) =>
    request<any>(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }),
  overview: (propertyId = 'all') => request<any>(`/dashboard/overview?property_id=${propertyId}`),
  roomPopularity: (propertyId = 'all', period = '30') => request<any>(`/dashboard/room-popularity?property_id=${encodeURIComponent(propertyId)}&period=${encodeURIComponent(period)}`),
  properties: () => request<any>('/properties'),
  reservations: (q = '', propertyId = 'all') => request<any>(`/reservations?q=${encodeURIComponent(q)}&property_id=${encodeURIComponent(propertyId)}`),
  createReservation: (data: any) => request<any>('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  updateReservation: (id: string, data: any) => request<any>(`/reservations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteReservation: (id: string) => request<any>(`/reservations/${id}`, { method: 'DELETE' }),
  rooms: (q = '') => request<any>(`/rooms?q=${encodeURIComponent(q)}`),
  createRoom: (data: { propertyId: string; number: string; type: string; floor: string }) =>
    request<any>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  updateRoomStatus: (id: string, field: 'occupancyStatus' | 'housekeepingStatus', status: string) => request<any>(`/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify({ [field]: status }) }),
  updateRoomNote: (id: string, note: string) => request<any>(`/rooms/${id}/note`, { method: 'PATCH', body: JSON.stringify({ note }) }),
  employees: (q = '') => request<any>(`/employees?q=${encodeURIComponent(q)}`),
  createEmployee: (data: any) => request<any>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  deleteEmployee: (id: string) => request<any>(`/employees/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  expenses: (q = '') => request<any>(`/finance/expenses?q=${encodeURIComponent(q)}`),
  createExpense: (data: any) => request<any>('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  billing: () => request<any>('/billing'),
  updateBillingSettings: (id: string, data: any) => request<any>(`/billing/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),
  recordPayment: (data: any) => request<any>('/billing/payments', { method: 'POST', body: JSON.stringify(data) }),
  updatePayment: (id: string, data: any) => request<any>(`/billing/payments/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePayment: (id: string) => request<any>(`/billing/payments/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  tasks: () => request<any>('/housekeeping/tasks'),
  activity: () => request<any>('/audit-logs'),
  backupEmail: () => request<any>('/backup/email', { method: 'POST' }),
};
export const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
