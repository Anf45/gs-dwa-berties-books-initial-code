// Create a new router
const express = require("express")
const router = express.Router()

//8
const redirectLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    // if not logged in, send them to login page
    return res.redirect("/users/login");
  }
  next();
};

///8
// Handle routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

//8
    router.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })
//8
// Export the router object so index.js can access it
module.exports = router