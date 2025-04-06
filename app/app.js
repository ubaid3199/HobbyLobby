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

app.get("/signout", function (req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Error signing out");
      }
      res.redirect("/signin");
    });
  });
  
app.get("/home", async function(req, res) {
    try {
      // Verify session
      if (!req.session.userID) {
        return res.redirect("/signin");
      }
  
      const userId = req.session.userID;
      
      // Get user data with null check
      const userQuery = "SELECT travel_locations FROM Users WHERE userID = ?";
      const userResult = await db.query(userQuery, [userId]);
      
      if (!userResult || userResult.length === 0) {
        req.session.destroy(); // Clear invalid session
        return res.redirect("/signin");
      }
  
      const user = userResult[0];
      const travelLocations = user.travel_locations 
        ? user.travel_locations.split(',').map(loc => loc.trim()).filter(loc => loc)
        : [];
  
      // Build query safely
      let hobbiesQuery = `
        SELECT 
          H.hobbyID, 
          H.hobbyName, 
          C.name AS category, 
          U.name AS owner, 
          H.description, 
          U.userID,
          GROUP_CONCAT(DISTINCT T.name SEPARATOR ', ') AS tags
        FROM Hobbies H
        JOIN Categories C ON H.categoryID = C.categoryID
        JOIN User_Hobbies UH ON H.hobbyID = UH.hobbyID
        JOIN Users U ON UH.userID = U.userID
        LEFT JOIN Hobby_Tags HT ON H.hobbyID = HT.hobbyID
        LEFT JOIN Tags T ON HT.tagID = T.tagID
      `;
  
      let whereClauses = [];
      let queryParams = [];
  
      if (travelLocations.length > 0) {
        whereClauses.push(`U.location IN (${travelLocations.map(() => '?').join(',')})`);
        queryParams.push(...travelLocations);
      }
  
      if (whereClauses.length > 0) {
        hobbiesQuery += ' WHERE ' + whereClauses.join(' AND ');
      }
  
      hobbiesQuery += ' GROUP BY H.hobbyID ORDER BY H.hobbyID DESC';
  
      const hobbies = await db.query(hobbiesQuery, queryParams);
  
      res.render("home", { 
        hobbies: hobbies || [],
        user: req.session.user || null
      });
  
    } catch (error) {
      console.error("Home route error:", error);
      res.status(500).render("error", {
        message: "Failed to load home page",
        error: process.env.NODE_ENV === 'development' ? error : null
      });
    }
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

app.get("/post_hobby", async function(req, res) {
  const categories = await db.query("SELECT * FROM Categories");
  const tags = await db.query("SELECT * FROM Tags");
  res.render("post_hobby", { categories, tags });
});

app.get("/signup", async function(req, res) {
  const categories = await db.query("SELECT * FROM Categories");
  const tags = await db.query("SELECT * FROM Tags");
  res.render("signup", { categories, tags });
});

app.post("/post_hobby", async function(req, res) {
  try {
    console.log("Post hobby form data:", req.body);
    const { hobbyName, description, categoryID } = req.body;

    const insertHobbyQuery = `
      INSERT INTO Hobbies (hobbyName, description, categoryID)
      VALUES (?, ?, ?)`;
    const hobbyResult = await db.query(insertHobbyQuery, [hobbyName, description, categoryID]);

    res.redirect("/home");
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).send("Error signing up");
  }
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

    const { name, email, dob, gender, location } = req.body;
    let travel_locations = req.body.travel_locations;

    if (typeof travel_locations === 'string') {
      travel_locations = [travel_locations];
    }

    const travelLocationsString = travel_locations ? travel_locations.join(', ') : '';

    const updateQuery = `
      UPDATE Users
      SET name = ?, email = ?, dob = ?, gender = ?, location = ?, travel_locations = ?
      WHERE userID = ?`;
    const values = [name, email, dob, gender, location, travelLocationsString, userId];

    await db.query(updateQuery, values);

    res.redirect("/profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Error updating profile");
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

  try {
    const insertQuery = `
      INSERT INTO Messages (senderID, receiverID, content)
      VALUES (?, ?, ?)`;

    await db.query(insertQuery, [senderID, receiverID, content]);

    res.redirect(`/user/${receiverID}`);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).send("Failed to send message.");
  }
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
      SELECT U.userID, U.name,
        GROUP_CONCAT(DISTINCT H.hobbyName SEPARATOR ', ') AS hobbies,
        COALESCE(T.name, 'No tag') AS tag
      FROM Users U
      LEFT JOIN User_Hobbies UH ON U.userID = UH.userID
      LEFT JOIN Hobbies H ON UH.hobbyID = H.hobbyID
      LEFT JOIN Hobby_Tags HT ON H.hobbyID = HT.hobbyID
      LEFT JOIN Tags T ON HT.tagID = T.tagID
    `;

    const queryParams = [];

    if (selectedTag) {
      usersQuery += " WHERE T.name = ?";
      queryParams.push(selectedTag);
    }

    usersQuery += " GROUP BY U.userID, U.name, T.name ORDER BY U.userID";

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

app.get("/listing/:id", async (req, res) => {
  try {
    const hobbyId = req.params.id;

    // Fetch Hobby Details
    const hobbyQuery = `
      SELECT H.hobbyName, H.description, C.name AS category, U.name AS owner
      FROM Hobbies H
      JOIN Categories C ON H.categoryID = C.categoryID
      JOIN User_Hobbies UH ON H.hobbyID = UH.hobbyID
      JOIN Users U ON UH.userID = U.userID
      WHERE H.hobbyID = ?`;
    const hobbyResult = await db.query(hobbyQuery, [hobbyId]);

    if (hobbyResult.length === 0) {
      return res.status(404).send("Hobby not found");
    }

    // Fetch Tags
    const tagsQuery = `
      SELECT T.name 
      FROM Hobby_Tags HT
      JOIN Tags T ON HT.tagID = T.tagID
      WHERE HT.hobbyID = ?`;
    const tags = await db.query(tagsQuery, [hobbyId]);

    res.render("detail", {
      hobby: hobbyResult[0],
      tags
    });
  } catch (error) {
    console.error("Error fetching hobby details:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/test-bcrypt", async (req, res) => {
  const testPassword = "test123";
  const hashed = await bcrypt.hash(testPassword, 10);
  const match = await bcrypt.compare("test123", hashed);

  res.send(match ? "✅ Bcrypt is working!" : "❌ Bcrypt failed.");
});

// Messages route
app.get("/messages", async function (req, res) {
  try {
    const userId = req.session.userID;
    if (!userId) return res.status(401).send("Unauthorized");

    const users = await db.query(`
      SELECT DISTINCT
        CASE
          WHEN sender.userID = ? THEN receiver.userID
          ELSE sender.userID
        END AS otherUserID,
        CASE
          WHEN sender.userID = ? THEN receiver.name
          ELSE sender.name
        END AS otherUserName
      FROM Messages
      JOIN Users AS sender ON Messages.senderID = sender.userID
      JOIN Users AS receiver ON Messages.receiverID = receiver.userID
      WHERE sender.userID = ? OR receiver.userID = ?
    `, [userId, userId, userId, userId]);

    res.render("messages", { users });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/reply/:receiverID", async (req, res) => {
  const senderID = req.session.userID;
  const receiverID = req.params.receiverID;
  const { content } = req.body;

  if (!senderID) {
    return res.redirect("/signin");
  }

  try {
    const insertQuery = `
      INSERT INTO Messages (senderID, receiverID, content)
      VALUES (?, ?, ?)`;

    await db.query(insertQuery, [senderID, receiverID, content]);

    res.redirect("/messages");
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).send("Failed to send message.");
  }
});
app.get("/messages/:userId", async function (req, res) {
  try {
    const userId = req.session.userID;
    const otherUserId = req.params.userId;
    if (!userId) return res.status(401).send("Unauthorized");

    const messages = await db.query(`
      SELECT sender.name AS senderName, sender.userID AS senderID, receiver.name AS receiverName, receiver.userID AS receiverID, Messages.content
      FROM Messages
      JOIN Users AS sender ON Messages.senderID = sender.userID
      JOIN Users AS receiver ON Messages.receiverID = receiver.userID
      WHERE (sender.userID = ? AND receiver.userID = ?) OR (sender.userID = ? AND receiver.userID = ?)
      ORDER BY Messages.messageID
    `, [userId, otherUserId, otherUserId, userId]);

    res.render("message_thread", { messages, otherUserId });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/messages/:userId", async (req, res) => {
  const senderID = req.session.userID;
  const receiverID = req.params.userId;
  const { content } = req.body;

  if (!senderID) {
    return res.redirect("/signin");
  }

  try {
    const insertQuery = `
      INSERT INTO Messages (senderID, receiverID, content)
      VALUES (?, ?, ?)`;

    await db.query(insertQuery, [senderID, receiverID, content]);

    res.redirect(`/messages/${receiverID}`);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).send("Failed to send message.");
  }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  });
app.listen(3000, () => {
  console.log(`Server running at http://127.0.0.1:3000/`);
});
