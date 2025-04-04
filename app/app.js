// Import express.js
const express = require("express");
const session = require('express-session');

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

app.get("/profile", async function(req, res) {
  try {
    const userId = req.session.userID;
    console.log("User ID from session:", userId);
    if (!userId) {
      console.log("User ID not found in session");
      return res.status(401).send("Unauthorized");
    }
    const query = "SELECT userID, name, email, dob, gender, location, travel_locations FROM Users WHERE userID = ?";
    const values = [userId];
    try {
      const results = await db.query(query, values);
      if (results.length > 0) {
        const user = results[0];
        res.render("profile", { user: user });
      } else {
        console.log("User not found in database with ID:", userId);
        res.status(404).send("User not found");
      }
    } catch (dbError) {
      console.error("Error querying database:", dbError);
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/signup", function(req, res) {
  res.render("signup");
});

app.get("/1", function(req, res) {
  res.render("1", { user: {}, userTag: "", hobbies: [], messages: [] });
});

app.post("/signup", async function(req, res) {
  console.log("Sign up form data:", req.body);
  const { firstName, lastName, email, password, dob, gender, locationBased, travelLocation } = req.body;

  let travelLocations = [];
  if (req.body.travelLocation) {
    if (Array.isArray(req.body.travelLocation)) {
      travelLocations = req.body.travelLocation;
    } else {
      travelLocations = [req.body.travelLocation];
    }
  }
  // Convert travelLocations array to a comma-separated string
  const travelLocationsString = travelLocations.join(', ');

  // Combine first and last name into a single name field
  const fullName = `${firstName} ${lastName}`;

  // Database query to insert user data
  const query = "INSERT INTO Users (name, email, password, dob, gender, location, travel_locations) VALUES (?, ?, ?, ?, ?, ?, ?)";
  // TODO: Hash the password before saving it to the database
  const values = [fullName, email, password, dob, gender, locationBased, travelLocationsString];

  // Add password column if it doesn't exist
  const alterTableQuery = "ALTER TABLE Users ADD COLUMN password VARCHAR(255) NOT NULL";
  try {
    await db.query(alterTableQuery);
    console.log("Password column added successfully");
  } catch (alterTableError) {
    console.error("Error adding password column:", alterTableError);
  }

  db.query(query, values)
    .then(() => {
      console.log("User created successfully");
      res.send("Sign up successful!");
    })
    .catch(err => {
      console.error("Error creating user:", err);
      res.status(500).send("Error signing up");
    });
});

app.post("/signin", function(req, res) {
  const { email, password } = req.body;

  // Database query to find user by email
  const query = "SELECT * FROM Users WHERE email = ?";
  const values = [email];

  db.query(query, values)
    .then(results => {
      if (results.length > 0) {
        const user = results[0];
        // Check if the password matches
        if (password === user.password) { // Replace "password" with actual password hashing logic
          console.log("Sign in successful");
          try {
            req.session.userID = user.userID;
            console.log("User ID stored in session:", req.session.userID);
            res.redirect("/home");
          } catch (sessionError) {
            console.error("Error storing user ID in session:", sessionError);
            res.status(500).send("Error signing in");
          }
        } else {
          console.log("Incorrect password");
          res.status(401).send("Incorrect password");
        }
      } else {
        console.log("User not found");
        res.status(404).send("User not found");
      }
    })
    .catch(err => {
      console.error("Error signing in:", err);
      res.status(500).send("Error signing in");
    });
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
      LEFT JOIN Hobby_Tags ON Users.userID = Hobby_Tags.hobbyID
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
app.get("/listings", async function (req, res) {
  const selectedCategory = req.query.category || "";

  let listingsQuery = `
      SELECT Hobbies.hobbyID, Hobbies.hobbyName, Categories.name AS category, Users.name AS owner,
             GROUP_CONCAT(Tags.name SEPARATOR ', ') AS tags
      FROM Hobbies
      JOIN Categories ON Hobbies.categoryID = Categories.categoryID
      JOIN Users ON Hobbies.ownerID = Users.userID
      LEFT JOIN Hobby_Tags ON Hobbies.hobbyID = Hobby_Tags.hobbyID
      LEFT JOIN Tags ON Hobby_Tags.tagID = Tags.tagID`;

  let listingsParams = [];

  if (selectedCategory) {
      listingsQuery += " WHERE Categories.name = ?";
      listingsParams.push(selectedCategory);
  }

  listingsQuery += " GROUP BY Hobbies.hobbyID";

  const categoriesQuery = "SELECT DISTINCT name FROM Categories";
  const categories = await db.query(categoriesQuery);

  const listings = await db.query(listingsQuery, listingsParams);

  res.render("listings", { listings, categories, selectedCategory });
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
