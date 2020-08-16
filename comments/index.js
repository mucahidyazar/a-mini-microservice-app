const express = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");
const axios = require("axios");
const app = express();

app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  try {
    res.send(commentsByPostId[req.params.id] || []);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/posts/:id/comments", async (req, res) => {
  try {
    const commentId = randomBytes(4).toString("hex");
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];
    comments.push({ id: commentId, content, status: "pending" });

    commentsByPostId[req.params.id] = comments;

    await axios.post("http://localhost:4005/events", {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId: req.params.id,
        status: "pending",
      },
    });

    res.status(201).send(comments);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/events", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "CommentModerated") {
      const { postId, id, status, content } = data;
      const comments = commentsByPostId[postId];

      const comment = comments.find((comment) => comment.id === id);
      comment.status = status;

      await axios.post("http://localhost:4005/events", {
        type: "CommentUpdated",
        data: { id, status, postId, content },
      });
    }

    res.send({});
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(4001, () => {
  console.log("Listenin on 4001");
});
