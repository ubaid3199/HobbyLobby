// Import express.js
const express = require("express");
const session = require('express-session');
const bcrypt = require("bcryptjs"); 

// Create express app
var app = express();

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Add static files location
app.use(express.static("static"));

app.use(session({
  secret: 'your-secret-key', // Replace with a strong, random key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production if using HTTPS
}));

// Middleware to expose user to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root
app.get("/", function(req, res) {
  res.redirect("/home");
});

app.get("/signin", function(req, res) {
  res.render("signin");
});

app.get("/home", function(req, res) {
  res.render("home");
});

app.get("/profile", async function (req, res) {
  try {
    const userId = req.session.userID;
    if (!userId) return res.status(401).send("Unauthorized");

    // User info
    const [user] = await db.query("SELECT userID, name, email, dob, gender, location, travel_locations FROM Users WHERE userID = ?", [userId]);

    // Hobbies
    const hobbies = await db.query(`
      SELECT H.hobbyName, C.name AS category 
      FROM User_Hobbies UH
      JOIN Hobbies H ON UH.hobbyID = H.hobbyID
      JOIN Categories C ON H.categoryID = C.categoryID
      WHERE UH.userID = ?
    `, [userId]);

    // Tag
    const tagResult = await db.query(`
      SELECT T.name AS tagName
      FROM User_Hobbies UH
      JOIN Hobby_Tags HT ON UH.hobbyID = HT.hobbyID
      JOIN Tags T ON HT.tagID = T.tagID
      WHERE UH.userID = ?
      GROUP BY T.name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `, [userId]);

    const userTag = tagResult.length > 0 ? tagResult[0].tagName : "No tag assigned";

    // Messages
    const messages = await db.query(`
      SELECT sender.name AS senderName, receiver.name AS receiverName, Messages.content 
      FROM Messages 
      JOIN Users AS sender ON Messages.senderID = sender.userID 
      JOIN Users AS receiver ON Messages.receiverID = receiver.userID 
      WHERE sender.userID = ? OR receiver.userID = ?
    `, [userId, userId]);

    // Reviews
    const reviews = await db.query("SELECT rating, comments FROM Reviews WHERE userID = ?", [userId]);

    res.render("profile", { user, hobbies, userTag, messages, reviews });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/edit-profile", async function (req, res) {
  try {
    const userId = req.session.userID;
    if (!userId) return res.status(401).send("Unauthorized");

    const userQuery = "SELECT userID, name, email, dob, gender, location, travel_locations FROM Users WHERE userID = ?";
    const user = await db.query(userQuery, [userId]);

    if (user.length === 0) return res.status(404).send("User not found");

    res.render("edit-profile", { user: user[0] });
  } catch (error) {
    console.error("Error fetching profile for edit:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/message/:id", async (req, res) => {
  const receiverID = req.params.id;
  const senderID = req.session.userID;

  if (!senderID) return res.redirect("/signin");

  // Get receiver's name to show in the form
  const receiverQuery = "SELECT name FROM Users WHERE userID = ?";
  const receiverResult = await db.query(receiverQuery, [receiverID]);
  const receiver = receiverResult[0];

  res.render("message", { receiverID, receiverName: receiver.name });
});

// Show message form
app.get("/message/:receiverID", async (req, res) => {
  const receiverID = req.params.receiverID;

  if (!req.session.userID) {
    return res.redirect("/signin");
  }

  // Fetch receiver info to display on the form
  const receiverQuery = "SELECT name FROM Users WHERE userID = ?";
  const receiverResult = await db.query(receiverQuery, [receiverID]);

  if (receiverResult.length === 0) {
    return res.status(404).send("User not found");
  }

  res.render("message_form", {
    receiverID,
    receiverName: receiverResult[0].name
  });
});

app.get("/signup", async function(req, res) {
  const categories = await db.query("SELECT * FROM Categories");
  const tags = await db.query("SELECT * FROM Tags");
  res.render("signup", { categories, tags });
});


app.get("/1", function(req, res) {
  res.render("1", { user: {}, userTag: "", hobbies: [], messages: [] });
});

app.post("/signup", async function(req, res) {
  console.log("Sign up form data:", req.body);
  const {
    firstName, lastName, email, password, dob, gender, locationBased, travelLocation,
    hobbyName, description, categoryID, tagID
  } = req.body;

  let travelLocations = [];
  if (req.body.travelLocation) {
    if (Array.isArray(req.body.travelLocation)) {
      travelLocations = req.body.travelLocation;
    } else {
      travelLocations = [req.body.travelLocation];
    }
  }
  const travelLocationsString = travelLocations.join(', ');
  const fullName = `${firstName} ${lastName}`;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const insertUserQuery = `
      INSERT INTO Users (name, email, password, dob, gender, location, travel_locations)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const userValues = [fullName, email, hashedPassword, dob, gender, locationBased, travelLocationsString];
    const result = await db.query(insertUserQuery, userValues);
    const newUserID = result.insertId;

    const insertHobbyQuery = `
      INSERT INTO Hobbies (hobbyName, description, categoryID)
      VALUES (?, ?, ?)`;
    const hobbyResult = await db.query(insertHobbyQuery, [hobbyName, description, categoryID]);
    const newHobbyID = hobbyResult.insertId;

    const linkUserHobby = `INSERT INTO User_Hobbies (userID, hobbyID) VALUES (?, ?)`;
    await db.query(linkUserHobby, [newUserID, newHobbyID]);

    const linkTag = `INSERT INTO Hobby_Tags (hobbyID, tagID) VALUES (?, ?)`;
    await db.query(linkTag, [newHobbyID, tagID]);

    res.redirect("/signin");
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).send("Error signing up");
  }
});


app.post("/signin", async function(req, res) {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM Users WHERE email = ?";
    const results = await db.query(query, [email]);

    if (results.length > 0) {
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        console.log("Sign in successful");

        req.session.userID = user.userID;
        req.session.user = {
          name: user.name,
          email: user.email
        };

        console.log("User ID stored in session:", req.session.userID);
        return res.redirect("/home");
      } else {
        console.log("Incorrect password");
        return res.status(401).send("Incorrect password");
      }
    } else {
      console.log("User not found");
      return res.status(404).send("User not found");
    }
  } catch (err) {
    console.error("Error signing in:", err);
    return res.status(500).send("Error signing in");
  }
});

app.post("/edit-profile", async function (req, res) {
  try {
    const userId = req.session.userID;
    if (!userId) return res.status(401).send("Unauthorized");

    const { name, email, dob, gender, location, travel_locations } = req.body;

    const updateQuery = `
      UPDATE Users
      SET name = ?, email = ?, dob = ?, gender = ?, location = ?, travel_locations = ?
      WHERE userID = ?`;
    const values = [name, email, dob, gender, location, travel_locations, userId];

    await db.query(updateQuery, values);

    res.redirect("/profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Error updating profile");
  }
});

app.post("/message/:id", async (req, res) => {
  const receiverID = req.params.id;
  const senderID = req.session.userID;
  const { content } = req.body;

  if (!senderID) return res.redirect("/signin");

  try {
    const insertMessage = `
      INSERT INTO Messages (senderID, receiverID, content)
      VALUES (?, ?, ?)`;
    await db.query(insertMessage, [senderID, receiverID, content]);
    res.redirect(`/user/${receiverID}`);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).send("Failed to send message.");
  }
});

// Handle message submission
app.post("/message/:receiverID", async (req, res) => {
  const senderID = req.session.userID;
  const receiverID = req.params.receiverID;
  const { content } = req.body;

  if (!senderID) {
    return res.redirect("/signin");
  }

  const insertQuery = `
    INSERT INTO Messages (senderID, receiverID, content)
    VALUES (?, ?, ?)`;

  await db.query(insertQuery, [senderID, receiverID, content]);

  res.redirect(`/user/${receiverID}`);
});

app.get("/detail", function(req, res) {
    res.render("detail", { hobby: {}, tags: [] });
});

app.get("/users", async function (req, res) {
  try {
    const selectedTag = req.query.tag || "";

    // Fetch all available tags
    const tagsQuery = "SELECT * FROM Tags ORDER BY tagID";
    const tags = await db.query(tagsQuery);

    let usersQuery = `
      SELECT Users.userID, Users.name, COALESCE(Tags.name, 'No tag') AS tag
      FROM Users
      LEFT JOIN User_Hobbies ON Users.userID = User_Hobbies.userID
      LEFT JOIN Hobby_Tags ON User_Hobbies.hobbyID = Hobby_Tags.hobbyID
        LEFT JOIN Tags ON Hobby_Tags.tagID = Tags.tagID
    `;


    // If a tag is selected, filter users by it
    let queryParams = [];
    if (selectedTag) {
      usersQuery += " WHERE Tags.name = ?";
      queryParams.push(selectedTag);
    }

    const users = await db.query(usersQuery, queryParams);

    res.render("users", { users, tags, selectedTag });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
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
      SELECT H.hobbyName, C.name AS category 
      FROM User_Hobbies UH
      JOIN Hobbies H ON UH.hobbyID = H.hobbyID
      JOIN Categories C ON H.categoryID = C.categoryID
      WHERE UH.userID = ?`;
    const hobbies = await db.query(hobbiesQuery, [userId]);

    // Fetch user's highest or most common tag
    const tagQuery = `
      SELECT T.name AS tagName
      FROM User_Hobbies UH
      JOIN Hobby_Tags HT ON UH.hobbyID = HT.hobbyID
      JOIN Tags T ON HT.tagID = T.tagID
      WHERE UH.userID = ?
      GROUP BY T.name
      ORDER BY COUNT(T.name) DESC
      LIMIT 1`;
    const tagResult = await db.query(tagQuery, [userId]);

    const userTag = tagResult.length > 0 ? tagResult[0].tagName : "No tag assigned";

    const messagesQuery = `
      SELECT sender.name AS senderName, receiver.name AS receiverName, Messages.content 
      FROM Messages 
      JOIN Users AS sender ON Messages.senderID = sender.userID 
      JOIN Users AS receiver ON Messages.receiverID = receiver.userID 
      WHERE sender.userID = ? OR receiver.userID = ?`;
    const messages = await db.query(messagesQuery, [userId, userId]);

    res.render("user", {
      user: user[0],
      hobbies,
      userTag,
      messages: messages || [],
      userSessionID: req.session.userID
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Internal Server Error");
  }
});


    

app.get("/listings", async function (req, res) {
  const selectedCategory = req.query.category || "";

  let listingsQuery = `
    SELECT Hobbies.hobbyID, Hobbies.hobbyName, Categories.name AS category, Users.name AS owner,
           GROUP_CONCAT(Tags.name SEPARATOR ', ') AS tags
    FROM Hobbies
    JOIN Categories ON Hobbies.categoryID = Categories.categoryID
    JOIN User_Hobbies ON Hobbies.hobbyID = User_Hobbies.hobbyID
    JOIN Users ON User_Hobbies.userID = Users.userID
    LEFT JOIN Hobby_Tags ON Hobbies.hobbyID = Hobby_Tags.hobbyID
    LEFT JOIN Tags ON Hobby_Tags.tagID = Tags.tagID`;

  let listingsParams = [];

  if (selectedCategory) {
    listingsQuery += " WHERE Categories.name = ?";
    listingsParams.push(selectedCategory);
  }

  listingsQuery += " GROUP BY Hobbies.hobbyID, Hobbies.hobbyName, Categories.name, Users.name";

  const categoriesQuery = "SELECT DISTINCT name FROM Categories";
  const categories = await db.query(categoriesQuery);
  const listings = await db.query(listingsQuery, listingsParams);

  res.render("listings", { listings, categories, selectedCategory });
});


app.get("/test-bcrypt", async (req, res) => {
  const testPassword = "test123";
  const hashed = await bcrypt.hash(testPassword, 10);
  const match = await bcrypt.compare("test123", hashed);

  res.send(match ? "✅ Bcrypt is working!" : "❌ Bcrypt failed.");
});

app.listen(3000, () => {
  console.log(`Server running at http://127.0.0.1:3000/`);
});
