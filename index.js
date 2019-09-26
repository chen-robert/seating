global.__rootdir = __dirname;

const path = require("path");
const FileSync = require('lowdb/adapters/FileSync');
const db = require("lowdb")(
  new FileSync(path.resolve(__dirname, "ext", "db.json"))
);
db.defaults({
  seeds: {},
  prefs: {}
}).write();

const fs = require("fs");
const dataDir = path.resolve(__dirname, "data");

const express = require("express");
const bodyParser = require("body-parser");
const autoprefixer = require('express-autoprefixer');
const lessMiddleware = require('less-middleware');
const cookieSession = require("cookie-session");

const PORT = process.env.PORT || 3000;

const app = express();
app.set("trust proxy", "127.0.0.1");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: false}));

const staticPath = __dirname + '/public';
app.use(lessMiddleware(staticPath));
app.use(autoprefixer({browsers: ["last 3 versions", "> 1%"], cascade: false}));
app.use(express.static(staticPath));

app.use("/class/:name/:period", (req, res, next) => {
  const {name, period} = req.params;
  
  const dataPath = path.join(dataDir, name, period) + ".json";
  if(!name.match(/^[a-z]+$/i) || !period.match(/^[0-9]+$/i)) return res.status(400).end();
  if(!fs.existsSync(dataPath)) return res.status(400).send("Class not found");

  next();
});

app.get("/class/:name/:period", (req, res) => {
  const {name, period} = req.params;
  const dataPath = path.join(dataDir, name, period) + ".json";

  const {names, layout} = require(dataPath);
  
  res.render("index", {
    title: `${name} #${period}`,
    names,
    layout,
    seed: db.get("seeds").get(name + "-" + period).value() 
  });
});

app.get("/class/:name/:period/pref", (req, res) => {
  const {name, period} = req.params;
  const dataPath = path.join(dataDir, name, period) + ".json";
  const {names} = require(dataPath);

  res.render("pref", {
    names
  });
});

const cleanName = name => {
  return name.split(",").join("-").split(" ").join("").toLowerCase();
}

app.post("/class/:name/:period/pref", (req, res) => {
  let {name, towards, away} = req.body;
  towards = towards || [];
  away = away || [];

  db.get("prefs")
    .set(req.params.name + "-" + req.params.period + "-" + cleanName(name), {
      towards,
      away
    })
    .write();

  res.redirect("/class/" + req.params.name + "/" + req.params.period);
});

app.get("/class/:name/:period/reset", (req, res) => {
  const {name, period} = req.params;
  
  const seed = db.get("seeds").value()[name + "-" + period] + 1 || 0;
  db.get("seeds")
    .set(name + "-" + period, seed)
    .write();

  res.send("" + seed);
});
app.use((req, res) => res.redirect("/class/rahlfs/7"));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
