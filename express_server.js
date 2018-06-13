var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

function generateRandomString() {
    var shortID = Math.random().toString(36).substr(2, 6);
    return shortID;
}

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.post("/login", (req, res) => {
    var username = req.body.username;
    res.cookie('Username', username);
    res.redirect("/urls");// Respond with 'Ok' (we will replace this)
});

app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase
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
        longURL: longURL
    };
    res.render("urls_show", templateVars);
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

app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {

    let newURL = req.body.NewURL
    urlDatabase[req.params.id] = newURL

    res.redirect("/urls");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});