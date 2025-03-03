require("dotenv").config();
const express = require("express");
const path = require("path");
const db = require("./services/db");

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("static"));

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT 1 + 1 AS solution");
    res.send(`Database test passed! 1 + 1 = ${result[0].solution}`);
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).send("Database connection failed.");
  }
});

app.get("/users", function(req, res) {
  var sql = "SELECT * FROM Users";
  db.query(sql).then(results => {
      res.render("users", { users: results });
  }).catch(error => {
      console.error("Error fetching users:", error);
      res.status(500).send("Internal Server Error");
  });
});


// User Profile Page Route
app.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user details
    const userQuery = "SELECT * FROM Users WHERE userID = ?";
    const user = await db.query(userQuery, [userId]);

    if (user.length === 0) return res.status(404).send("User not found");

    // Fetch user's hobbies
    const hobbiesQuery = `
      SELECT Hobbies.hobbyName, Categories.name AS category 
      FROM Hobbies 
      JOIN Categories ON Hobbies.categoryID = Categories.categoryID 
      WHERE Hobbies.ownerID = ?`;
    const hobbies = await db.query(hobbiesQuery, [userId]);

    // Fetch user's highest or most common tag
    const tagQuery = `
      SELECT Tags.name AS tagName
      FROM Hobby_Tags
      JOIN Tags ON Hobby_Tags.tagID = Tags.tagID
      JOIN Hobbies ON Hobby_Tags.hobbyID = Hobbies.hobbyID
      WHERE Hobbies.ownerID = ?
      GROUP BY Tags.name
      ORDER BY COUNT(Tags.name) DESC
      LIMIT 1`;
    const tagResult = await db.query(tagQuery, [userId]);

    const userTag = tagResult.length > 0 ? tagResult[0].tagName : "No tag assigned";

    // Fetch messages related to the user
    const messagesQuery = `
      SELECT sender.name AS senderName, receiver.name AS receiverName, Messages.content 
      FROM Messages 
      JOIN Users AS sender ON Messages.senderID = sender.userID 
      JOIN Users AS receiver ON Messages.receiverID = receiver.userID 
      WHERE sender.userID = ? OR receiver.userID = ?`;
    const messages = await db.query(messagesQuery, [userId, userId]);

    res.render("user", { user: user[0], hobbies, userTag, messages: messages || [] });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Fetch all hobbies with their categories, owners, and tags
app.get("/listings", async (req, res) => {
  try {
    const listingsQuery = `
      SELECT Hobbies.hobbyID, Hobbies.hobbyName, Categories.name AS category, Users.name AS owner,
             GROUP_CONCAT(Tags.name SEPARATOR ', ') AS tags
      FROM Hobbies
      JOIN Categories ON Hobbies.categoryID = Categories.categoryID
      JOIN Users ON Hobbies.ownerID = Users.userID
      LEFT JOIN Hobby_Tags ON Hobbies.hobbyID = Hobby_Tags.hobbyID
      LEFT JOIN Tags ON Hobby_Tags.tagID = Tags.tagID
      GROUP BY Hobbies.hobbyID`;
    const listings = await db.query(listingsQuery);
    res.render("listings", { listings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Fetch hobby details and associated tags
app.get("/listing/:id", async (req, res) => {
  try {
    const hobbyId = req.params.id;

    // Step 1: Fetch Hobby Details (Without Tags)
    const hobbyQuery = `
      SELECT Hobbies.hobbyName, Hobbies.description, Categories.name AS category, Users.name AS owner
      FROM Hobbies
      JOIN Categories ON Hobbies.categoryID = Categories.categoryID
      JOIN Users ON Hobbies.ownerID = Users.userID
      WHERE Hobbies.hobbyID = ?`;
    const hobby = await db.query(hobbyQuery, [hobbyId]);

    if (hobby.length === 0) return res.status(404).send("Hobby not found");

    // Step 2: Fetch Tags Separately
    const tagsQuery = `
      SELECT Tags.name
      FROM Hobby_Tags
      JOIN Tags ON Hobby_Tags.tagID = Tags.tagID
      WHERE Hobby_Tags.hobbyID = ?`;
    const tags = await db.query(tagsQuery, [hobbyId]);

    res.render("detail", { hobby: hobby[0], tags });
  } catch (error) {
    console.error("Error fetching hobby details:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log(`Server running at http://127.0.0.1:3000/`);
});
