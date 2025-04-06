const db = require('./db');

async function createMessage(senderId, receiverId, content) {
  const sql = 'INSERT INTO Messages (senderID, receiverID, content) VALUES (?, ?, ?)';
  const params = [senderId, receiverId, content];
  const result = await db.query(sql, params);
  return result.insertId;
}

async function getMessages(senderId, receiverId) {
  const sql = 'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at';
  const params = [senderId, receiverId, receiverId, senderId];
  const rows = await db.query(sql, params);
  return rows;
}

module.exports = {
  createMessage,
  getMessages,
};