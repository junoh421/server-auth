const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const fullName = req.body.fullName;
  const userName = req.body.userName;
  const password = req.body.password;

  if (!email || !fullName || !userName || !password) {
  	return res.status(422).send({error: "You must provide information" });
  }

  User.findOne({ email: email}, function(error, existingUser) {
    if (error) { return next(err); }

    if (existingUser) {
      return res.status(422).send({error: "Email is in use"})
    }

    User.findOne({ userName: userName}, function(error, existingUser) {
      if (error) { return next(err); }

      if (existingUser) {
        return res.status(422).send({error: "Username is in use"})
      }
    })

    const user = new User({
      email: email,
      fullName: fullName,
      userName: userName,
      password: password
    });

    user.save(function(err) {
      if (err) {return next(err); }
      res.json({ token: tokenForUser(user) });
    });
  });
}
