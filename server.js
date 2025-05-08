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
const initDatabase = require("./app/seeder");
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);

// Configure Socket.IO with CORS and other options
const io = require("socket.io")(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-vercel-domain.vercel.app"]
        : "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-vercel-domain.vercel.app"]
        : "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(flash());

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "resources/views"));

// Database connection and initialization
const startServer = async () => {
  try {
    await initDatabase();
    console.log("Database initialized successfully");

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
        secret: process.env.COOKIE_SECRET || "your-secret-key",
        resave: false,
        store: mongoStore,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
      })
    );

    // Passport config
    const passportInit = require("./app/config/passport");
    passportInit(passport);
    app.use(passport.initialize());
    app.use(passport.session());

    // Method override for PUT/DELETE
    app.use(methodOverride("_method"));

    // Global middleware
    app.use((req, res, next) => {
      res.locals.session = req.session;
      res.locals.user = req.user;
      res.locals.path = req.path;
      next();
    });

    // set Template engine
    app.use(expressLayout);

    require("./routes/web")(app);
    app.use("/customer", require("./routes/customer"));
    app.use((req, res) => {
      res.status(404).render("errors/404");
    });

    // Socket.io connection
    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      // Join admin room
      socket.on("join-admin", () => {
        socket.join("adminRoom");
      });

      // Join order room
      socket.on("join-order", (orderId) => {
        socket.join(`order_${orderId}`);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
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

    // Start server
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
