const express = require('express')
var exphbs = require('express-handlebars');
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const path = require('path')
const passport = require('passport')

const app = express()
const port = 5000


//get rid of warning
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/vidjot-dev', {
  // useMongoClient: true
  useNewUrlParser: true
})
  .then(() => console.log('Mongodb Connected...'))
  .catch(err => console.log(err))



// Handlebars middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// method override middleware
app.use(methodOverride('_method'))

// body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// flash middleware
app.use(flash());

// express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}))


// passport session middleware (must under express session middleware)
app.use(passport.initialize());
app.use(passport.session());


// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
  next()
})



// static folder
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  const title = 'Welcome'
  res.render('index', {
    title: title
  })
})

app.get('/about', (req, res) => {
  res.render('about')
})


// load routes
const ideas = require('./routes/ideas')
const users = require('./routes/users')

// use routes
app.use('/ideas', ideas)
app.use('/users', users)

// passport config
require('./config/passport')(passport)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})