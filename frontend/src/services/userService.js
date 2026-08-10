import api from './api.js';

export async function listUsers() {
  const { data } = await api.get('/users');
  return data.users;
}

export async function createUser({ fullName, email, password, roles }) {
  const { data } = await api.post('/users', { fullName, email, password, roles });
  return data.user;
}

export async function setUserActive(userId, isActive) {
  await api.patch(`/users/${userId}/active`, { isActive });
}

export async function assignRole(userId, roleName) {
  await api.post('/roles/assign', { userId, roleName });
}

export async function removeRole(userId, roleName) {
  await api.post('/roles/remove', { userId, roleName });
}
