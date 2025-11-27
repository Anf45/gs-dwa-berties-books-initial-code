// Create a new router
const express = require("express")
const router = express.Router()

//8
const redirectLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/users/login');
  }
  next();
};
///8

// Route to display all books (locked)
router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM books";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("list.ejs", {availableBooks:result})
    });
});

// Show add book form (locked)
router.get('/addbook', redirectLogin, function(req, res, next) {
    res.render("addbook.ejs");
});

// Bargain books (locked)
router.get('/bargainbooks', redirectLogin, function (req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("bargainbooks.ejs", { bargainBooks: result });
        }
    });
});

// Handle add book form submit (locked)
router.post('/bookadded', redirectLogin, function (req, res, next) {

    // ✅ 8b: sanitise user inputs
    let cleanName  = req.sanitize(req.body.name);
    let cleanPrice = req.sanitize(req.body.price);

    let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    let newrecord = [cleanName, cleanPrice];

    db.query(sqlquery, newrecord, (err, result) => {
        if (err) next(err);
        else res.send("This book is added to database, name: " 
            + cleanName + " price " + cleanPrice);
    });
});

// Search form (public)
router.get('/search', function(req, res, next) {
    res.render("search.ejs")
});

// Search results (public)
router.get('/search-result', function (req, res, next) {

  // ✅ 8b: sanitise search keyword
  let keyword = req.sanitize(req.query.keyword);

  let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
  db.query(sqlquery, ['%' + keyword + '%'], (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render('search-results.ejs', { 
        results: result, 
        searchTerm: keyword   // now safe to display
      });
    }
  });
});

// Export the router object so index.js can access it
module.exports = router
