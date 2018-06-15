var express = require("express");
var cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcryptjs = require('bcryptjs');


var app = express();
app.use(cookieSession({
    name: 'session',
    keys: [/* secret keys */],
  
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))

var PORT = 8080;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("view engine", "ejs");

function generateRandomString() {
    var shortID = Math.random().toString(36).substr(2, 6);
    return shortID;
};


function findUserByEmail(email) {
    let userData = false;
    for (id in users) {
        if (email === users[id]['email']) {
            userData = users[id];
        }
    }
    return userData;
}

function urlsForUserID(userID) {
    const filteredUrls = {};
    for (shortCode in urlDatabase) {
        if (urlDatabase[shortCode].userID === userID) {
            filteredUrls[shortCode] = urlDatabase[shortCode] //filter out the corresponding URLs
        }
    }
    return filteredUrls;
}

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: bcryptjs.hashSync("1234", 10)
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: bcryptjs.hashSync("dishwasher-funk", 10)
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
    const urls = urlsForUserID(req.cookies.user_id);
    let templateVars = {
        urls,
        user: users[req.cookies.user_id],
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
    let shortURL = urlDatabase[req.params.id];
    let urlUser = shortURL["userID"];
    let longURL = urlDatabase[req.params.id];
    if (user !== urlUser) {
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
    const hashedPassword = bcryptjs.hashSync(password, 10);
    if (!email || !password) {
        res.statusCode = 400;
    } else {
        for (email in users) {
            if (email === users[email]["email"]) {
                res.statusCode = 400;
            } else {
                users[id] = {
                    id: id,
                    email: req.body.email,
                    password: hashedPassword,
                }
                res.cookie("user_id", id)
            }
        }
        res.redirect("/urls");
    }
});

app.post("/login", (req, res) => {
    let user = findUserByEmail(req.body.email);
    if (!req.body.email || !req.body.password) {
        res.redirect("/login");
    } else {
        if (bcryptjs.compareSync(req.body.password, user.password)) {
            res.cookie("user_id", id)
            res.redirect("/urls");
        } else {
            res.redirect("/register");
        }
    }
});

function findUserByEmail(email) {
    let userData = false;
    for (id in users) {
        if (email === users[id]['email']) {
            userData = users[id];
        }
    }
    return userData;
}


app.post("/urls", (req, res) => {
    let longURL = (req.body.longURL);
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
        longURL: longURL,
        userID: req.cookies["user_id"]
    };
    res.redirect("/urls/");
});

app.post("/urls/:id/delete", (req, res) => {
    let user = req.cookies["user_id"]
    let shortURL = urlDatabase[req.params.id];
    let urlUser = shortURL["userID"];
    if (user !== urlUser) {} else {
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