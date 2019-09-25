global.__rootdir = __dirname;

const path = require("path");
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

app.get("/class/:name/:period", (req, res) => {
  const {name, period} = req.params;
  const dataPath = path.join(dataDir, name, period);

  if(!name.match(/^[a-z]+$/i) || !period.match(/^[0-9]+$/i)) return res.status(400).end();

  
  
  res.render("index", {
    title: `${name} #${period}`
  });
});

app.use((req, res) => res.redirect("/class/rahlfs/7"))

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
