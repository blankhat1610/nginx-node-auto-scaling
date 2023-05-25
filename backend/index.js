const express = require("express");
const cors = require("cors");
const os = require("os");

// Constants
const PORT = 3000;
const HOST = "0.0.0.0";

// App
const app = express();
app.use(cors());

app.get("/", (req, res) => {
  console.log(`[HOSTNAME]: ~~~ ${os.hostname()}`);
  res.send({ hostname: os.hostname() });
});

app.get("/health", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
