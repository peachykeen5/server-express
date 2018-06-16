var express = require("express");
var cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcryptjs = require('bcryptjs');


var app = express();
app.use(cookieSession({
    name: 'session',
    keys: ["key1", "key2"],
}))

var PORT = 8080;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function userMiddleware(req, res, next) {
    req.user = users[req.session.user_id];
    res.locals.urls = urlDatabase;
    res.locals.user = req.user;
    next();
});

app.param('shortURL', function(req, res, next, shortUrl) {
    req.shortURL = shortUrl;
    req.longURL = urlDatabase[shortUrl];
    res.locals.shortURL = shortUrl;
    res.locals.longURL = urlDatabase[shortUrl];
    if(!req.longURL) {
        res.status('404').send('Unkown URL🤷');
        return;
    }
    next();
})

function mustBeLoggedIn(req, res, next) {
    if(req.user) {
        next();
        return;
    }

    res.redirect('/login');
}

function mustOwnUrl(req, res, next) {
    if(req.user.id !== req.longURL.userID) {
        res.status(403).send("Unauthorized...Is this your URL?");
        return;
    }
    next();
}

app.set("view engine", "ejs");

function generateRandomString() {
    var shortID = Math.random().toString(36).substr(2, 6);
    return shortID;
};


function findUserByEmail(email) {
    let userData = false;
    for (let id in users) {
        if (email === users[id]['email']) {
            userData = users[id];
        }
    }
    return userData;
}

function urlsForUserID(userID) {
    const filteredUrls = {};
    for (let shortCode in urlDatabase) {
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
console.log(users);

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


app.get("/urls", mustBeLoggedIn, (req, res) => {
    const urls = urlsForUserID(req.user.id);
    res.render("urls_index", { urls });
});

app.get("/login", (req, res) => {
    res.render("urls_login");
});

app.get("/urls/new", mustBeLoggedIn, (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:shortURL", mustBeLoggedIn, mustOwnUrl, (req, res) => {
    res.render("urls_show");
});

app.get("/u/:shortURL", (req, res) => {
    res.redirect(req.longURL.longURL);
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
                req.session.user_id = id; //users[id];
            }
        }
        res.redirect("/urls");
    }
    //console.log(users)
});

app.post("/login", (req, res) => {
    let user = findUserByEmail(req.body.email);
    if (!req.body.email || !req.body.password) {
        res.redirect("/login");
    } else {
        if (bcryptjs.compareSync(req.body.password, user.password)) {
            req.session.user_id = user.id;
            res.redirect("/urls");
            return;
        } else {
            res.redirect("/register");
        }
    }
});

app.post("/urls", mustBeLoggedIn, (req, res) => {
    let longURL = (req.body.longURL);
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
        longURL: longURL,
        userID: req.user.id
    };
    res.redirect("/urls/");
});

app.post("/urls/:shortURL/delete", mustBeLoggedIn, mustOwnUrl, (req, res) => {
    delete urlDatabase[req.shortURL];
    res.redirect("/urls");
});

app.post("/urls/:shortURL", mustBeLoggedIn, mustOwnUrl, (req, res) => {
    let updatedURL = req.body.updatedURL
    urlDatabase[req.params.shortURL].longURL = updatedURL;
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});