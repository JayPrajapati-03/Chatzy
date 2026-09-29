import client from './client';

/**
 * POST /api/users/login
 * Login or auto-create a user. Returns the full user document.
 * @param {string} username
 * @param {string} [displayName]
 */
export const loginUser = async (username, displayName) => {
  const { data } = await client.post('/api/users/login', {
    username,
    displayName: displayName || username
  });
  return data.data; // { _id, username, displayName, avatarColor, isOnline, ... }
};

/**
 * GET /api/users
 * Returns all users sorted by online status then lastSeen.
 */
export const getAllUsers = async () => {
  const { data } = await client.get('/api/users');
  return data.data;
};
