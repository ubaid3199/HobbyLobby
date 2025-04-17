const db = require('./db');

async function createReview(userID, reviewerID, rating, comments) {
  const sql = `
    INSERT INTO Reviews (reviewID, userID, reviewerID, rating, comments)
    VALUES (NULL, ?, ?, ?, ?)`;
  const params = [userID, reviewerID, rating, comments];
  try {
    await db.query(sql, params);
    return true;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}

async function getReviews(userID) {
  const sql = `
    SELECT
      Reviews.rating,
      Reviews.comments,
      Reviews.reviewerID,
      Users.name AS author
    FROM Reviews
    JOIN Users ON Reviews.reviewerID = Users.userID
    WHERE Reviews.userID = ?
  `;
  const params = [userID];
  try {
    const rows = await db.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error getting reviews:", error);
    throw error;
  }
}

module.exports = {
  createReview,
  getReviews,
};