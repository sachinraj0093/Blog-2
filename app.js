//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const lodash = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


// const partialPath = path.join(__dirname + "views/partials");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: 'Our LOcal Secret.',
    resave: false,
    saveUninitialized: true,

}));

app.use(passport.initialize());
app.use(passport.session());



// mongoose.connect("mongodb+srv://Sachinraj_0093:SachinMinde_9359@cluster0.mmrcr.mongodb.net/MyBlogDB");
mongoose.connect("mongodb://localhost:27017/MyBlogDB_1");


const blogSchema = new mongoose.Schema({


    title: String,
    description: String
});

const userDataSchema = new mongoose.Schema({
    posts: []
})


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    user_data: []
});


userSchema.plugin(passportLocalMongoose);



const blog_posts = mongoose.model("posts", blogSchema);

let Myposts = [];


const User = mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// const posts = [];
app.get("/", function (req, res) {
    res.render("login");
})

app.get("/home", (req, res) => {



    if (req.isAuthenticated()) {
        blog_posts.find(function (err, post_data) {
            if (err) {
                console.log(err);
            } else {


                blog_posts.find(function (err, post_data) {
                    if (err) {
                        console.log(err);
                    } else {

                        Myposts = post_data;
                        res.render("home", { pData: homeStartingContent, posts: post_data });

                    }
                })

            }
        });
    } else {
        res.redirect("/login");
    }



});

app.get("/about", (req, res) => {
    res.render("about", { pData: aboutContent });
});

app.get("/contact", (req, res) => {
    res.render("contact", { pData: contactContent });
});

app.get("/compose", (req, res) => {
    res.render("compose");
});
app.get("/login", (req, res) => {
    res.render("login");
});


app.get("/register", (req, res) => {
    res.render("register");
});





app.get("/userpost", function (req, res) {
    User.findOne({ username: userName }, function (err, post_data) {
        if (err) {
            console.log(err);
        } else {

            console.log(post_data.user_data);
        }
    })

})






app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.post("/register", function (req, res) {



    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");

        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/home");
            });
        }
    });

});

let userName = "";

app.post("/login", function (req, res) {

    userName = req.body.username;

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/home");
            });
        }
    })

});

app.post("/compose", (req, res) => {



    const blog_post = new blog_posts({
        title: req.body.postTitle,
        description: req.body.postDescription
    })

    blog_post.save();
    console.log(userName);
    User.updateOne({ username: userName }, { $addToSet: { user_data: [blog_post] } }, function (err) {
        if (err) {
            console.log(err);
            console.log(userName);
        }
    })

    const post = {
        title: req.body.postTitle,
        descri: req.body.postDescription,
    }

    res.redirect("/");

})


app.get("/posts/:postTitle", function (req, res) {


    // route params 
    const urlTitle = req.params.postTitle;

    for (let i = 0; i < Myposts.length; i++) {

        if (lodash.lowerCase(urlTitle) === lodash.lowerCase(Myposts[i].title)) {
            res.render("post", { title: Myposts[i].title, description: Myposts[i].description });
        };
    }


});




app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000");
});
