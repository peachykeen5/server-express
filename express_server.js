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
            return users[id];
        }
    }
}

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "1234"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
}

var urlDatabase = {
    "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"
    },
    "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "user2RandomID"
    }
};

app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        user: users[req.cookies["user_id"]],
    };
    res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
    res.render("urls_login");
});

app.get("/urls/new", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        user: users[req.cookies["user_id"]],
    };
    if (!req.cookies["user_id"]) {
        res.redirect("/login");
    }
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    let user = req.cookies["user_id"]
    console.log("user", user);
    let shortURL = urlDatabase[req.params.id];
    let urlUser = shortURL["userID"];
    let longURL = urlDatabase[req.params.id];
    if (user !== urlUser) {
        console.log("can't edit");
        res.redirect("/urls")
    } else {
        let templateVars = {
            shortURL: req.params.id,
            longURL: longURL,
            user: users[req.cookies["user_id"]],
        }
        res.render("urls_show", templateVars);
    }
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
    let user = findUserByEmail(req.body.email);
    if (!req.body.email || !req.body.password) {
        res.redirect("/login");
    } else if (req.body.password === user['password']) {
        res.cookie('user_id', user['id']);
        res.redirect("/urls");
    } else {
        res.redirect("/register");
    }
});

app.post("/urls", (req, res) => {
    let longURL = (req.body.longURL);
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
        longURL: longURL,
        userID: req.cookies["user_id"]
    };
    res.redirect("/urls/");
    console.log(urlDatabase);
});

app.post("/urls/:id/delete", (req, res) => {
    let user = req.cookies["user_id"]
    console.log("user", user);
    let shortURL = urlDatabase[req.params.id];
    let urlUser = shortURL["userID"];
    if (user !== urlUser) {
    } else {
        delete urlDatabase[req.params.id];
    }
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
    let updatedURL = req.body.updatedURL
    urlDatabase[req.params.id].longURL = updatedURL;
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/login");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});