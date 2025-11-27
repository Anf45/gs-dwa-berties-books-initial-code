const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

//8
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('./login') // redirect to the login page
    } else { 
        next (); // move to the next function
    } 
}
//8

// Show registration form
router.get("/register", function (req, res, next) {
  res.render("register.ejs");
});

// Show login form
router.get("/login", function (req, res, next) {
  res.render("login.ejs");
});

// Handle registration form submit
// Hash password and store user in DB
router.post("/registered", function (req, res, next) {
  const plainPassword = req.body.password;

  bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
    if (err) {
      return next(err);
    }

    // Store user details in the database
    const sqlquery =
      "INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES (?,?,?,?,?)";
    const newrecord = [
      req.body.username,
      req.body.first,
      req.body.last,
      req.body.email,
      hashedPassword,
    ];

    db.query(sqlquery, newrecord, (err, result) => {
      if (err) {
        return next(err);
      }

      let resultMsg =
        "Hello " +
        req.body.first +
        " " +
        req.body.last +
        " you are now registered! We will send an email to you at " +
        req.body.email;

      // DEBUG 
      resultMsg +=
        "<br>Your password is: " +
        req.body.password +
        " and your hashed password is: " +
        hashedPassword;

      res.send(resultMsg);
    });
  });
});

// Handle login form submit
// Compare supplied password with stored hash
// Also log SUCCESS / FAILED attempts to audit table
router.post("/loggedin", function (req, res, next) {
  const username = req.body.username;
  const plainPassword = req.body.password;

  // get hashedPassword for this username from DB
  const sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";

  db.query(sqlquery, [username], (err, result) => {
    if (err) {
      return next(err);
    }

    // no such user
    if (result.length === 0) {
      const auditQuery =
        "INSERT INTO audit (username, loginStatus) VALUES (?, ?)";
      return db.query(auditQuery, [username, "FAILED"], (err2) => {
        if (err2) return next(err2);
        return res.send("Login failed: incorrect username or password.");
      });
    }

    const hashedPassword = result[0].hashedPassword;

    // compare entered password with hashed password
    bcrypt.compare(plainPassword, hashedPassword, function (err, match) {
      if (err) {
        return next(err);
      }

      const auditQuery =
        "INSERT INTO audit (username, loginStatus) VALUES (?, ?)";

      if (match === true) {
        ////8
        // Save user session here, when login is successful
        req.session.userId = req.body.username;
///8
        // log successful login
        db.query(auditQuery, [username, "SUCCESS"], (err2) => {
          if (err2) return next(err2);
          res.send("Login successful! Welcome, " + username + ".");
        });
      } else {
        // log failed login (wrong password)
        db.query(auditQuery, [username, "FAILED"], (err2) => {
          if (err2) return next(err2);
          res.send("Login failed: incorrect username or password.");
        });
      }
    });
  });
});

// List all registered users (no passwords shown)
// 8: protected by redirectLogin
router.get("/list", redirectLogin, function (req, res, next) {
  const sqlquery =
    "SELECT username, firstName, lastName, email FROM users";

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("user-list.ejs", { users: result });
  });
});

// Show audit log of logins
router.get("/audit", redirectLogin, function (req, res, next) {
  const sqlquery =
    "SELECT username, loginStatus, loginTime FROM audit ORDER BY loginTime DESC";

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("audit.ejs", { logs: result });
  });
});

module.exports = router;
