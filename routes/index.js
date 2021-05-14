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
      res.redirect(`/user/${newuser.username}`);
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

router.route('/user/:username').get(async (req, res) => {
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
  res.redirect(`/user/${req.params.username}`);
});

router.route('/user/:username/spots').get(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).populate('spots').lean();
  const spots = user.spots;

  res.json(spots);
});

router.route('/user/:username/friends').get(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).populate('friends').lean();
  const friends = user.friends;
  if (friends.length !== 0) {
    res.render('friends', { friends });
  } else {
    res.render('friends');
  }
});

router.route('/search').post(async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  res.render('search', { user });
});

router.route('/user/:username/spots/:spotid').delete(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).lean();
  console.log(req.params.spotid.toString());
  console.log(user.spots);
  const updateSpots = user.spots.filter((el) => String(el) !== String(req.params.spotid));

  const updateUser = await User.findOneAndUpdate(
    { username: req.params.username },
    { spots: updateSpots }
  );
  res.json('ok');
});

router.route('/user/:username/friends/:friendId').get(async (req, res) => {
  console.log(req.params.friendId);
  const user = await User.findOneAndUpdate(
    { username: req.params.username },
    { $push: { friends: req.params.friendId } }
  );
  res.redirect(`/user/${req.params.username}/friends`);
});

router.route('/spots/:username').get(async (req, res) => {
  const friend = await User.findOne({ username: req.params.username });
  res.render('friendspots', { friend });
});

router.route('/spots/:username/getspots').get(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).populate('spots').lean();
  const spots = user.spots;

  res.json(spots);
});
module.exports = router;
