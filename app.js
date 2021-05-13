const express = require('express');
const logger = require('morgan');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();
const MongoStore = require('connect-mongo');
const mongoUrl = process.env.DB_URL;
const app = express();
const { cookiesCleaner } = require('./middleware/auth');
const errorMiddleware = require('./middleware/error');
const indexRouter = require('./routes/index');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(logger('dev'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

const options = {
  // store: new FileStore(),
  key: 'user_sid',
  secret: 'fsjdhfsdg89dsghg',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 10000 * 60 * 10,
  },
  store: MongoStore.create({ mongoUrl }),
};

app.use(session(options));
app.use(cookiesCleaner);
app.use((req, res, next) => {
  res.locals.userLogined = req.session?.user;
  next();
});

app.use('/', indexRouter);
// errorMiddleware(app);

module.exports = app;
