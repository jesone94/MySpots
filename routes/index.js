const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Spot = require('../models/spot');
const multer = require('multer');
const cloudinary = require('cloudinary');
const { storage } = require('../cloudinary');

const upload = multer({ storage });

router.route('/').get((req, res) => {
  res.render('index');
});

router
  .route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post(async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        req.session.user = { id: user._id, name: user.username };
        res.redirect(`/user/${user.username}`);
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      next(error);
    }
  });

router
  .route('/signup')
  .get((req, res) => {
    res.render('signup');
  })
  .post(upload.single('image'), async (req, res, next) => {
    console.log(req.file);
    try {
      const image = req.file;
      const user = req.body;
      user.password = await bcrypt.hash(user.password, Number(process.env.SALT_ROUNDS));
      if (image) {
        user.image = { url: image.path, filename: image.filename };
      }
      const newuser = await User.create(user);

      req.session.user = { id: newuser._id, name: newuser.username };
      res.redirect(`/${newuser.username}`);
    } catch (error) {
      console.log(error);
    }
  });

router.route('/logout').get(async (req, res) => {
  if (req.session.user) {
    try {
      await req.session.destroy();
      res.clearCookie('user_sid');
      res.redirect('/');
    } catch (error) {
      next(error);
    }
  } else {
    res.redirect('/login');
  }
});

router.route('/user/:username').get((req, res) => {
  res.render('user');
});

router.route('/create').get((req, res) => {
  res.render('create');
});

router.route('/user/:username/create').post(async (req, res) => {
  const spot = req.body;

  spot.coords = JSON.parse(spot.coords);
  const newSpot = await Spot.create(spot);
  const user = await User.findOneAndUpdate(
    { username: req.params.username },
    { $push: { spots: newSpot._id } }
  );
  res.render('/user/:username');
});

module.exports = router;
