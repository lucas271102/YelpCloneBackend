var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const db = require("./db");

var app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
app.use((req, res, next) => {
  console.log("Middleware");
  next();
});

//Get all restaurants
app.get("/api/v1/restaurants", async (req, res) => {
  try {
    const results = await db.query("select * from restaurants");
    console.log(results);
    res.json({
      success: true,
      results: results.rows.length,
      data: {
        restaurants: results.rows,
      },
    });
  } catch (error) {
    console.log(error);
  }
  console.log("get all restaurants");
});

//Get one restaurant
app.get("/api/v1/restaurants/:id",async  (req, res) => {
  console.log(req.params);
  try {
    const results = await db.query('select * from restaurants where id = $1', [req.params.id])
    console.log(results.rows[0])
    res.status(200).json({
      status: "success",
      data: {
        restaurant: results.rows[0],
      },
    });
  } catch (error) {
    console.log(error)
  }
});

//Create a restaurant
app.post("/api/v1/restaurants", async (req, res) => {
  try {
    const results = await db.query('INSERT INTO restaurants (name, location, price_range) values($1, $2, $3) returning *', [req.body.name, req.body.location, req.body.price_range])
    console.log(results);
    res.status(201).json({
      status: "success",
      data: {
        restaurant: results.rows[0],
      },
    });
  } catch (error) {
    console.log(error)
  }
});

//Update restaurants

app.put("/api/v1/restaurants/:id", (req, res) => {
  console.log(req.params.id);
  console.log(req.body);
  res.status(200).json({
    status: "success",
    data: {
      restaurant: "mcdonalds",
    },
  });
});

//Delete restaurants
app.delete("/api/v1/restaurants/:id", (req, res) => {
  res.status(204).json({
    status: "Successfully deleted",
  });
});

console.log("test");
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
