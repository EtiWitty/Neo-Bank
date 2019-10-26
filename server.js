const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
// const path = require("path");

const users = require("./routes/api/users");
const synapse = require("./routes/api/synapse");

const app = express();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

//serve up static assets (on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  // app.use("*", (req, res) => {
  //   res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  // });
}

// DB Config
const db = process.env.mongoURI || require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes
app.use("/api/users", users);
app.use("/api/synapse", synapse);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
