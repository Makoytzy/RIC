import api from './api.js';

export async function signUp({ email, password, fullName, position }) {
  const { data } = await api.post('/auth/signup', { email, password, fullName, position });
  return data;
}

export async function signIn({ email, password }) {
  const { data } = await api.post('/auth/signin', { email, password });
  return data;
}

export async function signOut() {
  await api.post('/auth/signout');
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data;
}
