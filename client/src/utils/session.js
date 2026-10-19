// Single source of truth for what we keep in localStorage.
// (Before, Login wrote "user" but Navbar / ProtectedRoute / AuthContext read
// "currentUser" — so after logging in the app still thought you were logged out.)
const TOKEN_KEY = "token";
const USER_KEY = "user";
const LEGACY_USER_KEY = "currentUser";

export const normalizeUser = (u) =>
  u ? { ...u, _id: u._id ?? u.id, id: u.id ?? u._id } : null;

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getStoredUser = () => {
  try {
    const raw =
      localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

export const saveUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(LEGACY_USER_KEY);
  } catch {
    /* storage unavailable (private mode) — session just won't persist */
  }
};

export const saveSession = (token, user) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
  saveUser(user);
};

export const clearSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  } catch {
    /* ignore */
  }
};
