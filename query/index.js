const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const posts = {};
// posts => {
//   'id456': {
//     id: '15asd15asd',
//     title: 'post title',
//     comments: [
//       { id: 'asd5as6d', content: 'comment deneme' }
//     ]
//   }
// }

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    const comment = post.comments.find((comment) => (comment.id = id));

    comment.status = status;
    comment.content = content;
  }
};

app.post("/events", (req, res) => {
  try {
    const { type, data } = req.body;

    handleEvent(type, data);

    res.status(201).send({});
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/posts", (req, res) => {
  try {
    res.send(posts);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(4002, async () => {
  console.log("Listening on 4002");

  const { data } = await axios.get("http://localhost:4005/events");
  for (let event of data) {
    handleEvent(event.type, event.data);
  }
});
