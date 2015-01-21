"use strict";

var bcrypt = require("bcrypt");
var passport = require("passport");
var passportLocal = require("passport-local");
var salt = bcrypt.genSaltSync(10);

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate:{
        len: [6,30]
      }
    } ,
    password: DataTypes.STRING,
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Post);
        User.hasMany(models.Comment);
      },
      encryptPass: function(password) {
        var hash = bcrypt.hashSync(password, salt);
        return hash;
    },
      comparePass: function(userpass, dbpass) {
      // don't salt twice when you compare....watch out for this
        return bcrypt.compareSync(userpass, dbpass);
    },
      createNewUser:function(username, password, firstname, lastname, err, success ) {
        if(password.length < 6) {
          err({message: "Password should be more than six characters"});
        }
        else{
        User.create({
            username: username,
            password: this.encryptPass(password),
            firstname: firstname,
            lastname: lastname
          }).done(function(error,user) {
            if(error) {
              console.log(error);
              if(error.name === 'SequelizeValidationError'){
              err({message: 'Your username should be at least 6 characters long', username: username});
            }
              else if(error.name === 'SequelizeUniqueConstraintError') {
              err({message: 'An account with that username already exists', username: username});
              }
            }
            else{
              success({message: 'Account created, please log in now'});
            }
          });
        }
      }
    }//
  });

  passport.use(new passportLocal.Strategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback : true
    },

    function(req, username, password, loginCallback) {
      // find a user in the DB
      User.find({
          where: {
            username: username
          }
        })
        // when that's done,
        .done(function(error,user){
          if(error){
            console.log(error);
            return loginCallback(error, req.flash('loginMessage', 'Oops! Something went wrong.'));
          }
          if (user === null){
            return loginCallback(null, false, req.flash('loginMessage', 'Username does not exist.'));
          }
          if ((User.comparePass(password, user.password)) !== true){
            return loginCallback(null, false, req.flash('loginMessage', 'Invalid Password'));
          }
          loginCallback(null, user);
        });
    }));


  return User;
};