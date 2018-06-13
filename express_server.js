var express = require("express");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

var app = express();

var PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("view engine", "ejs");

function generateRandomString() {
    var shortID = Math.random().toString(36).substr(2, 6);
    return shortID;
}

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"],
        };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id];
    let templateVars = {
        shortURL: req.params.id,
        longURL: longURL,
        username: req.cookies["username"],
    };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.post("/login", (req, res) => {
    var username = req.body.username;
    res.cookie('username', username);
    res.redirect("/urls");// Respond with 'Ok' (we will replace this)
});

app.post("/urls", (req, res) => {
    let longURL = (req.body);
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = longURL["longURL"];
    //console.log(urlDatabase); // debug statement to see POST parameters
    res.redirect("/urls/"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {

    let newURL = req.body.NewURL
    urlDatabase[req.params.id] = newURL

    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie("username");
    res.redirect("/urls");// Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

//if (!username) {
//    show login form and button
//} else {
//    show username
//}