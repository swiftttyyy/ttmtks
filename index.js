const express = require("express")
const app = express()
const path = require("path")
const User =require("./models/user")
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const account = require("./routes/account")
const dbURL = "mongodb+srv://davidmiller4504:qhzHzN7If4bdOjCa@cluster0.pgfivl2.mongodb.net/cryptDB?retryWrites=true&w=majority&appName=Cluster0" 
const flash = require("connect-flash")
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require("cookie-parser");


const secretKey = "dkmshcchuweiekgdcyd"


app.use(cookieParser());
app.use(session({
    secret: secretKey, // Replace with a secure secret key
    resave: false,
    saveUninitialized: true
  }));

app.use(flash()) 
app.use((req,res,next)=>{
  res.locals.error = req.flash("error")
  next()
})
app.use((req,res,next)=>{
  res.locals.success = req.flash("success")
  next()
})
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.raw());
// parse text
app.use(bodyParser.text());
app.use(express.static("public"))
app.use(express.static(path.join(__dirname, '/public')));
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "/views",))
app.use("/dashboard", account)

mongoose.connect( dbURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(()=>{
    console.log("connection open")
  } )
  .catch((error)=>{
    console.log(error,"oh no error")
  })

//   function verifyToken(req, res, next) {
//     const authHeader = req.headers.authorization;
  
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }
  
//     const token = authHeader.split(' ')[1];
  
//     try {
//       const decoded = jwt.verify(token, secretKey);
//       req.user = decoded; 
//       const now = Date.now() / 1000; 
//       if (decoded.exp < now) {
//         console.warn('JWT has expired!');
//         return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
//       }
//       else{
//       }
//       next();
//     } catch (error) {
//       return res.status(403).json({ message: 'Invalid token' });
//     }
//   }

function verifyToken(req, res, next) {
    const token = req.cookies.authToken;
  
    if (!token) {
      req.flash('error', 'You have to be logged in to access this');
      return res.redirect('/login');
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        req.flash('error', 'You have to be logged in to access this');
        return res.redirect('/login');
      }
  
      req.userId = decoded.id;
      next();
    });
  }
  

app.get("/", (req,res)=>{
    res.render("home")
})
app.get("/home", (req,res)=>{
    res.render("home")
})



app.get("/register", (req,res)=> {
    res.render("register")
})
app.post("/register",verifyToken, async(req,res)=>{
    const {name,username,email,phone,password} = req.body
    const user = new User({
      name,
      username,
      email,
      phone,
      password
    })
    await user.save()
    req.flash("success", "signup success, you can now login")
    res.redirect("/login")
  })




app.get("/login", (req,res)=> {
    res.render("login")
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
 const user = await User.findOne({email,password})
      if (!user) {        
        req.flash('error', 'User not found');
        res.redirect("/")
        return res.json({ success: false, message: 'Invalid username or password' });

      }
      const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '4d' });
      res.cookie('authToken', token, { httpOnly: true });
      console.log("successful")
      res.redirect("/dashboard")
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  app.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/login');
    });
  });
  


app.listen(5002, ()=>{
    console.log("Listening on port 5002")
})