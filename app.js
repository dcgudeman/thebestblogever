var express = require("express"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  passportLocal = require("passport-local"),
  cookieParser = require("cookie-parser"),
  session = require("cookie-session"),
  db = require("./models/index"),
  async = require("async")
  flash = require('connect-flash'),
  routeMiddleware = require("./config/routes.js"),
  app = express();

// Middleware for ejs, grabbing HTML and including static files
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}) );
app.use(express.static(__dirname + '/public'));

// we are going to create a cookie that will store our session data
// ideally we want this secret to be a string of random numbers
// we use the secret to parse the data from the cookie
// This is cookie-based session middleware so technically this creates a session
// This session can expire and doesn't live on our server

// The session middleware implements generic session functionality with in-memory storage by default. It allows you to specify other storage formats, though.
// The cookieSession middleware, on the other hand, implements cookie-backed storage (that is, the entire session is serialized to the
  //cookie, rather than just a session key. It should really only be used when session data is going to stay relatively small.
// And, as I understand, it (cookie-session) should only be used when session data isn't sensitive.
// It is assumed that a user could inspect the contents of the session, but the middleware will detect when the data has been modified.
app.use(session( {
  secret: 'thisismysecretkey',
  name: 'chocolate chip',
  // this is in milliseconds
  maxage: 3600000
  })
);

// get passport started
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// prepare our serialize functions
passport.serializeUser(function(user, done){
  console.log("SERIALIZED JUST RAN!");
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  console.log("DESERIALIZED JUST RAN!");
  db.User.find({
      where: {
        id: id
      }
    })
    .done(function(error,user){
      done(error, user);
    });
});
app.get('/', function(req,res){
  // check if the user is logged in
  if(!req.user) {
    res.render("index");
  }
  else{
    res.redirect('/home');
  }
});

/*app.get('/', routeMiddleware.preventLoginSignup, function(req,res){
    res.render('index');
});*/

app.get('/signup', function(req,res){
  if(!req.user) {
    res.render("signup", { username: "", firstname: "", lastname: ""});
  }
  else{
    res.redirect('/home');
  }
});

/*app.get('/signup', routeMiddleware.preventLoginSignup, function(req,res){
    res.render('signup', { username: "", firstname: "", lastname: ""});
});*/


app.get('/login', function(req,res){
  // check if the user is logged in
  if(!req.user) {
    res.render("login", {message: req.flash('loginMessage'), username: ""});
  }
  else{
    res.redirect('/home');
  }
});

/*app.get('/home', function(req,res){
  res.render("home", {
  //runs a function to see if the user is authenticated - returns true or false
  isAuthenticated: req.isAuthenticated(),
  //this is our data from the DB which we get from deserializing
  user: req.user
  });
});*/
/*


need a function that can convert the array:
[(28,null),(29,null),(30,28),(31,null),(32,30),(33,32),(34,29),(35,31),(36,28),(37,36),(38,null),(39,38),(40,38),(41,38),(42,39),(43,null)]
to:
[ [(28,null),[(30,28),[(32,30),(33,32)]],[(36,28),(37,36)]] , [(29,null),(34,29)] , [(31,null),(35,31)] , [(38,null),[(39,38),(42,39)],(40,38),(41,38)] , (43,null) ]

*/

app.get('/home', routeMiddleware.checkAuthentication, function(req,res){

  var fullname = req.user.firstname + " " + req.user.lastname;

    db.Post.findAll({include: [db.User]/*, order: 'title DESC'*/}).done(function(err,posts){
    if (err)
    {
      var errMsg = "Something went wrong!";
      console.log(errMsg);    
    }
    else
    {
      //console.log(posts);



      res.render("home", {
      //this is our data from the DB which we get from deserializing
      user: req.user,
      fullname: fullname,
      posts:posts
      }); 
    }
  });

});


app.post('/newPost', routeMiddleware.checkAuthentication, function(req, res){


  db.Post.create({
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    UserId: req.user.id

  }).done(function(err, post){

    if(err)
      console.log("ERROR" + err);
    else
    {
      res.redirect('/home');
    }
  });

});


app.post('/newComment', routeMiddleware.checkAuthentication, function(req, res){

  var parent_comment_id = req.body.parent_comment_id;

  if(req.body.parent_comment_id === undefined)
    parent_comment_id = null;


  db.Comment.create({

    content: req.body.content,
    score: 0,
    UserId: req.user.id,
    PostId: req.body.post_id,
    ParentCommentId: parent_comment_id

  }).done(function(err, post){

    if(err)
    {
      console.log("HOLY SHITBALLS2");
      console.log("ERROR" + err);
    }
    else
    {
      res.redirect('/post/' + req.body.post_id);
    }
  });

});


app.post('/editCommentNew', routeMiddleware.checkAuthentication, function(req, res){

  var id = req.body.comment_id;
  var content = req.body.comment_content;
  console.log("HERE IS THE COMMENT ID", id);
  console.log("HERE IS THE COMMENT Content", content);

  db.Comment.find({where: {id:id}}).done(function(err, comment){

    if(err)
    {
      console.log("HOLY SHITBALLS2");
      console.log("ERROR" + err);
    }
    else
    {

      comment.dataValues.content = content;
      comment.save().success(function(){

        var strComment = JSON.stringify(comment.dataValues);
        res.send(strComment);

      });
/*      var strComment = JSON.stringify(comment.dataValues);
      res.send(strComment);*/
    }
  });

});










app.post('/editComment', routeMiddleware.checkAuthentication, function(req, res){

  var id = req.body.comment_id;
  console.log("HERE IS THE COMMENT ID", id);

  db.Comment.find({where: {id:id}}).done(function(err, comment){

    if(err)
    {
      console.log("HOLY SHITBALLS2");
      console.log("ERROR" + err);
    }
    else
    {
      console.log("HERE IS THE COMMENT", comment);
      comment.content = req.body.content;
      comment.save().success(function() {
        res.redirect('/post/' + req.body.post_id);
      });
      
    }
  });

});


app.post('/editPost', routeMiddleware.checkAuthentication, function(req, res){

  var id = req.body.post_id;
  console.log("HERE IS THE COMMENT ID", id);

  db.Post.find({where: {id:id}}).done(function(err, post){

    if(err)
    {
      console.log("HOLY SHITBALLS2");
      console.log("ERROR" + err);
    }
    else
    {
      //console.log("HERE IS THE COMMENT", comment);
      post.content = req.body.content;
      post.save().success(function() {
        res.redirect('/post/' + req.body.post_id);
      });
      
    }
  });

});

app.post('/deleteCommentNew', routeMiddleware.checkAuthentication, function(req, res){

  var id = req.body.comment_id;
  console.log("HERE IS THE COMMENT ID", id);

  db.Comment.find({where: {id:id}}).done(function(err, comment){

    if(err)
    {
      console.log("HOLY SHITBALLS2");
      console.log("ERROR" + err);
    }
    else
    {

      comment.dataValues.content = "Deleted";
      comment.save().success(function(){

        var strComment = JSON.stringify(comment.dataValues);
        res.send(strComment);

      });
 
    }
  });

});

/*app.post('/deleteComment', routeMiddleware.checkAuthentication, function(req, res){

   var id = req.body.comment_id;
  console.log("HERE IS THE COMMENT ID", id);

  db.Comment.find({where: {id:id}}).done(function(err, comment){

    if(err)
    {
      console.log("HOLY SHITBALLS2");
      console.log("ERROR" + err);
    }
    else
    {
      console.log("HERE IS THE COMMENT", comment);
      comment.content = "Deleted";
      comment.save().success(function() {
        res.redirect('/post/' + req.body.post_id);
      });
      
    }
  });

});
*/


app.post('/deletePost', routeMiddleware.checkAuthentication, function(req, res){

  var id = req.body.post_id;
  console.log("HERE IS THE COMMENT ID", id);

  db.Post.find({where: {id:id}}).done(function(err, post){

    if(err)
    {
      console.log("HOLY SHITBALLS2");
      console.log("ERROR" + err);
    }
    else
    {
      //console.log("HERE IS THE COMMENT", comment);
      post.content = "Deleted";
      post.title= "Deleted";
      post.summary= "Deleted";
      post.save().success(function() {
        res.redirect('/post/' + req.body.post_id);
      });
      
    }
  });

});



























app.get('/user/:id', routeMiddleware.checkAuthentication, function(req, res){

  var id = req.params.id;
  console.log(id);

  db.Post.findAll({where: {UserId:id}, include: [db.User]}).done(function(err,posts){

    console.log("THIS IS THE POSTS");
    //console.log(posts);
    //console.log("THIS IS CREATED");
    //console.log(created);

    res.render('usersPosts',{posts:posts});
  });

  
});

app.get('/profile', routeMiddleware.checkAuthentication, function(req, res){

  var id = req.user.dataValues.id;
  console.log(id);

  db.Post.findAll({where: {UserId:id}, include: [db.User]}).done(function(err,posts){

    console.log("THIS IS THE POSTS");
    //console.log(posts);
    //console.log("THIS IS CREATED");
    //console.log(created);

    res.render('usersPosts',{posts:posts});
  });

  
});


app.get('/post/:id', routeMiddleware.checkAuthentication, function(req, res){

  var id = req.params.id;

  db.Post.find({where: {id:id}, include: [db.User]}).done(function(err,post){

    db.Comment.findAll({where: {PostId:id}, order: 'id DESC', include: [db.User]}).done(function(error,comments){


      var getChildren = function (parent_comment_id) {
        var results = [];
        for (var i = 0; i < comments.length; i++) {
          var comment = comments[i];
          if (comment.ParentCommentId === parent_comment_id) {

            var newObj ={
              me: comment.dataValues,
              children: [],
              level: 0
            };
            results.push(newObj);
            comments.splice(i, 1);
            i--;
          }
        }
        return results;
      };

      var dig = function (vertex) {
        var id = vertex.me.id;
        vertex.children = getChildren(id);
        vertex.children.forEach(function(element){
        element.level = vertex.level+1;
        });
        vertex.children.forEach(dig);
      };




      var topLevel = getChildren(null);
      topLevel.forEach(dig);

      console.log("IT WORKS",req.user.dataValues);

      res.render('fullPostView',{post:post,topLevel:topLevel,viewingUser:req.user.dataValues});


    });
  });
});








// on submit, create a new users using form values
app.post('/submit', function(req,res){

  db.User.createNewUser(req.body.username, req.body.password, req.body.firstname, req.body.lastname,
  function(err){
    res.render("signup", {message: err.message, username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname});
  },
  function(success){
    res.render("index", {message: success.message});
  });
});

// authenticate users when logging in - no need for req,res passport does this for us
app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', function(req,res){
  //req.logout added by passport - delete the user id/session
  req.logout();
  res.redirect('/');
});

// catch-all for 404 errors
app.get('*', function(req,res){
  res.status(404);
  res.render('404');
});


app.listen(3000, function(){
  console.log("get this party started on port 3000");
});