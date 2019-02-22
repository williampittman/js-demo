const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");

//MIDDLEWARE
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.render("index");
});

//ROUTING
const payments = require("./routes/payments");
const ec = require("./routes/ec");
const ba = require("./routes/ba");
//app.set("views", path.join(__dirname, "views"));
app.use("/payments", payments);
app.use("/ec", ec);
app.use("/ba", ba);

//VIEW ENGINE
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

const PORT = 5000;

app.listen(process.env.PORT || PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
