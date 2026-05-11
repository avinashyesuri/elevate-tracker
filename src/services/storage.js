const SESSION_KEY = 'elevate_session';
const USERS_KEY = 'elevate_users';

function hashPassword(pwd) {
  return btoa(unescape(encodeURIComponent(pwd + '_elevate_salt')));
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function signup({ name, email, password }) {
  const users = getUsers();
  const emailKey = email.toLowerCase().trim();
  if (users[emailKey]) return { success: false, error: 'An account with this email already exists.' };
  if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };
  const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  users[emailKey] = { userId, name: name.trim(), email: emailKey, passwordHash: hashPassword(password), createdAt: Date.now() };
  saveUsers(users);
  const session = { userId, name: name.trim(), email: emailKey };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, session };
}

export function login({ email, password }) {
  const users = getUsers();
  const emailKey = email.toLowerCase().trim();
  const user = users[emailKey];
  if (!user) return { success: false, error: 'No account found with this email.' };
  if (user.passwordHash !== hashPassword(password)) return { success: false, error: 'Incorrect password.' };
  const session = { userId: user.userId, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, session };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

// Per-user data keys
export function userKey(userId, type) {
  const uid = userId || 'none';
  return `elevate_${uid}_${type}`;
}

export function getUserData(userId, type) {
  try { return JSON.parse(localStorage.getItem(userKey(userId, type))) || null; } catch { return null; }
}

export function setUserData(userId, type, data) {
  localStorage.setItem(userKey(userId, type), JSON.stringify(data));
}

export function appendHistory(userId, entry) {
  const key = userKey(userId, 'history');
  let history = [];
  try { history = JSON.parse(localStorage.getItem(key)) || []; } catch { history = []; }
  history.unshift({ ...entry, id: Date.now() + Math.random(), timestamp: Date.now() });
  if (history.length > 500) history = history.slice(0, 500);
  localStorage.setItem(key, JSON.stringify(history));
}
