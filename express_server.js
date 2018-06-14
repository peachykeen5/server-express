var express = require("express");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

var app = express();

var PORT = 8080;

app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("view engine", "ejs");

function generateRandomString() {
    var shortID = Math.random().toString(36).substr(2, 6);
    return shortID;
};


function findUserByEmail(email) {
    for (id in users) {
        if (email === users[id]['email']) {
            return user[id];
        }
    }
}

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
}

app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        user: users[req.cookies["user_id"]],
    };
    res.render("urls_index", templateVars);
});

app.get("/urls/login", (req, res) => {
    res.render("urls_login");
});

app.get("/urls/new", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        user: users[req.cookies["user_id"]],
    };
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id];
    let templateVars = {
        shortURL: req.params.id,
        longURL: longURL,
        user: users[req.cookies["user_id"]],
    };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.get("/register", (req, res) => {
    res.render("urls_register");
});

app.post("/register", (req, res) => {
    let id = generateRandomString();
    let email = req.body.email;
    let password = req.body.password;
    users[id] = {
        email: email,
        password: password
    };

    if (!email || !password) {
        res.statusCode = 400;
    }
    for (email in users) {
        if (email === users[email]["email"]) {
            res.statusCode = 400;
        } else {
            users[id] = {
                id: id,
                email: email,
                password: password
            }
            res.cookie("user_id", id)
            res.redirect("/urls");
        }
    }
});

app.post("/login", (req, res) => {
    let user = (req.body.user_id)
    res.cookie('user_id', user);
    res.redirect("/urls");
});

app.post("/urls", (req, res) => {
    let longURL = (req.body);
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = longURL["longURL"];
    res.redirect("/urls/");
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
    res.clearCookie("user_id", users);
    res.redirect("/urls/login");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});