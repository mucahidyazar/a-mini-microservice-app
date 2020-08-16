const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const app = express();
const axios = require("axios");

app.use(express.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  try {
    res.send(posts);
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/posts", async (req, res) => {
  try {
    const id = randomBytes(4).toString("hex");
    const { title } = req.body;
    posts[id] = {
      id,
      title,
    };

    await axios.post("http://localhost:4005/events", {
      type: "PostCreated",
      data: { id, title },
    });

    res.status(201).send(posts[id]);
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/events", (req, res) => {
  try {
    res.send({});
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(4000, () => {
  console.log("Listening on 4000");
});
