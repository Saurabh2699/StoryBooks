const express = require("express");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const { formatDate, stripTags, truncate, editIcon, select } = require("./helpers/hbs");

//load config
dotenv.config({ path: "./config/config.env" });

// Passport config
require("./config/passport")(passport)

//connect to DB
connectDB();

// initialize app
const app = express();

// Body parser 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(
    methodOverride(function (req, res) {
        if (req.body && typeof req.body === "object" && "_method" in req.body) {
            // look in urlencoded POST bodies and delete it
            let method = req.body._method
            delete req.body._method
            return method
        }
    })
)

// logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// set handlerbars view engine  
app.engine('.hbs', exphbs.engine({ helpers: { formatDate, stripTags, truncate, select, editIcon }, defaultLayout: 'main', extname: '.hbs', }));
app.set('view engine', '.hbs');

// session config
app.use(session({
    secret: "sessionstories1234",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// set global user
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next();
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

//routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Server running on PORT: " + PORT));