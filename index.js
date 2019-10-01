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
  
  const allPrefs = db.get("prefs").value();
  const prefMap = {};
  for(const person of names) {
    const prefs = allPrefs[getKey(name, period, person)] || {towards: []};
    if(!(prefs.towards instanceof Array)) prefs.towards = [prefs.towards];

    prefMap[person] = prefs.towards;
  }
  
  res.render("index", {
    title: `${name} #${period}`,
    names,
    layout,
    prefMap,
    seed: db.get("seeds").get(name + "-" + period).value() 
  });
});

const cleanName = name => {
  return name.split(",").join("-").split(" ").join("").toLowerCase();
}

const getKey = (cls, period, name) => {
  return cls + "-" + period + "-" + cleanName(name);
}

app.get("/class/:name/:period/pref", (req, res) => {
  const {name, period} = req.params;
  const dataPath = path.join(dataDir, name, period) + ".json";
  const {names} = require(dataPath);

  res.render("pref", {
    names
  });
});


app.post("/class/:name/:period/pref", (req, res) => {
  let {name, towards} = req.body;
  towards = towards || [];
  if(!(towards instanceof Array)) towards = [towards];

  db.get("prefs")
    .set(getKey(req.params.name, req.params.period, name), 
    {
      towards
    })
    .write();

  res.send("Preferences saved!");
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
