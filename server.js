require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const expressLayout = require("express-ejs-layouts");
const PORT = process.env.PORT || 3300;
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo")(session);
const passport = require("passport");
const Emitter = require("events");
const methodOverride = require("method-override");
const menuSeeder = require("./app/seeder");

// Database connection
mongoose
  .connect(process.env.MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  .then(() => {
    console.log("Database connected...");
    // Run the menu seeder
    menuSeeder();
  })
  .catch((err) => {
    console.log("Connection failed...", err);
  });

const connection = mongoose.connection;

// Session store
let mongoStore = new MongoDbStore({
  mongooseConnection: connection,
  collection: "sessions",
});

// Event emitter
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

// Session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hour
  })
);

// Passport config
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// Assets
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override for PUT/DELETE
app.use(methodOverride("_method"));

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  res.locals.path = req.path; // Pass current path to templates
  next();
});
// set Template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

require("./routes/web")(app);
app.use("/customer", require("./routes/customer"));
app.use((req, res) => {
  res.status(404).render("errors/404");
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Socket
const io = require("socket.io")(server);
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join
  socket.on("join", (roomName) => {
    console.log(`Socket ${socket.id} joining room:`, roomName);
    socket.join(roomName);
  });
});

eventEmitter.on("orderUpdated", (data) => {
  console.log("Order updated event:", data);
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

eventEmitter.on("orderPlaced", (data) => {
  console.log("Order placed event - emitting to adminRoom:", data._id);
  io.to("adminRoom").emit("orderPlaced", data);
});
