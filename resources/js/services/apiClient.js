export class ApiClient {
  constructor(baseURL = '/api', token = null) {
    this.baseURL = baseURL;
    this.token = token;
    this.onUnauthorized = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        data,
      };
    }

    return data;
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  register(name, email, password, password_confirmation) {
    return this.post('/auth/register', { name, email, password, password_confirmation });
  }

  logout() {
    return this.post('/auth/logout', {});
  }

  getMe() {
    return this.get('/auth/me');
  }

  // Rooms
  getRooms(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/rooms${query ? '?' + query : ''}`);
  }

  getRoom(id) {
    return this.get(`/rooms/${id}`);
  }

  createRoom(data) {
    return this.post('/rooms', data);
  }

  updateRoom(id, data) {
    return this.put(`/rooms/${id}`, data);
  }

  deleteRoom(id) {
    return this.delete(`/rooms/${id}`);
  }

  checkAvailability(data) {
    return this.post('/rooms/check-availability', data);
  }

  // Room Types
  getRoomTypes() {
    return this.get('/room-types');
  }

  getRoomType(id) {
    return this.get(`/room-types/${id}`);
  }

  createRoomType(data) {
    return this.post('/room-types', data);
  }

  updateRoomType(id, data) {
    return this.put(`/room-types/${id}`, data);
  }

  deleteRoomType(id) {
    return this.delete(`/room-types/${id}`);
  }

  // Promotions
  getPromotions() {
    return this.get('/promotions');
  }

  getPromotion(id) {
    return this.get(`/promotions/${id}`);
  }

  validatePromotion(code) {
    return this.post('/promotions/validate', { code });
  }

  createPromotion(data) {
    return this.post('/promotions', data);
  }

  updatePromotion(id, data) {
    return this.put(`/promotions/${id}`, data);
  }

  deletePromotion(id) {
    return this.delete(`/promotions/${id}`);
  }

  // Reservations
  getReservations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/reservations${query ? '?' + query : ''}`);
  }

  getReservation(id) {
    return this.get(`/reservations/${id}`);
  }

  createReservation(data) {
    return this.post('/reservations', data);
  }

  cancelReservation(id) {
    return this.put(`/reservations/${id}/cancel`, {});
  }

  confirmReservation(id) {
    return this.put(`/reservations/${id}/confirm`, {});
  }

  // Payments
  getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/payments${query ? '?' + query : ''}`);
  }

  getPayment(id) {
    return this.get(`/payments/${id}`);
  }

  createPayment(data) {
    return this.post('/payments', data);
  }

  refundPayment(id) {
    return this.put(`/payments/${id}/refund`, {});
  }

  // Users
  getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/users${query ? '?' + query : ''}`);
  }

  getUser(id) {
    return this.get(`/users/${id}`);
  }

  updateUser(id, data) {
    return this.put(`/users/${id}`, data);
  }

  deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  // Activity Logs
  getActivityLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/activity-logs${query ? '?' + query : ''}`);
  }

  getActivityLog(id) {
    return this.get(`/activity-logs/${id}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
