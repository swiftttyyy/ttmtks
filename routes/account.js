const express = require("express")
const router = express.Router()
const User = require("../models/user")
const jwt = require('jsonwebtoken');


function verifyToken(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    req.flash('error', 'You have to be logged in to access that page');
    return res.redirect('/login');
  }

  jwt.verify(token, "dkmshcchuweiekgdcyd", (err, decoded) => {
    if (err) {
      req.flash('error', 'You have to be logged in to access that page');
      return res.redirect('/login');
    }
    console.log(req.cookies)
    console.log("req")
    req.userId = decoded.userId;
    next();
  });
}
async function fetchUserData(req, res, next) {
  if (!req.userId) {
    return next();
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/login');
    }
    res.locals.user = user; // Attach user data to res.locals
    next();
  } catch (error) {
    console.error("Error fetching user:", error);
    req.flash('error', 'An error occurred');
    res.redirect('/login');
  }
}

router.use('/', verifyToken, fetchUserData);

router.get("/", async(req,res)=>{

    res.render("dashboard", { useraccount: res.locals.user })
   
  })



  router.get("/deposit", async(req,res)=>{
    if (!res.locals.user) {
      req.flash('error', 'User not found');
      return res.redirect('/login');
    }
  
    res.render("deposit", { user: res.locals.user });
   
  })





  module.exports = router;