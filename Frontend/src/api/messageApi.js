import client from './client';
import { DEFAULT_ROOM } from '../utils/constants';

/**
 * POST /api/messages
 * Save a message to MongoDB. The server broadcasts it via Socket.io after saving.
 * @param {{ senderId, senderUsername, senderDisplayName, senderAvatarColor, text, room }} payload
 */
export const sendMessage = async (payload) => {
  const { data } = await client.post('/api/messages', {
    room: DEFAULT_ROOM,
    ...payload
  });
  return data.data; // saved Message document
};

/**
 * GET /api/messages
 * Fetch chat history, optionally paginated.
 * @param {{ room?, limit?, before? }} params
 */
export const getMessages = async (params = {}) => {
  const { room = DEFAULT_ROOM, limit = 50, before } = params;
  const queryParams = { room, limit };
  if (before) queryParams.before = before;

  const { data } = await client.get('/api/messages', { params: queryParams });
  return data.data; // array of Message documents in chronological order
};

/**
 * POST /api/messages/:id/read
 * Mark a message as read by the current user.
 * @param {string} messageId
 * @param {{ userId, username }} reader
 */
export const markMessageRead = async (messageId, reader) => {
  const { data } = await client.post(`/api/messages/${messageId}/read`, reader);
  return data.data;
};
