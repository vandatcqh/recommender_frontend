export function setAuthSession({ token, username, userId, isAdmin }) {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  localStorage.setItem('user_id', String(userId));
  localStorage.setItem('is_admin', isAdmin ? '1' : '0');
}

export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('user_id');
  localStorage.removeItem('is_admin');
}

export function isAdmin() {
  return localStorage.getItem('is_admin') === '1';
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
