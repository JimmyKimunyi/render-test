const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

const requestLogger = (req, _res, next) => {
  console.log(" Method :  ", req.method);
  console.log(" Path : ", req.path);
  console.log(" Body : ", req.body);
  console.log(" --- ");
  next();
};

const unknownEndpoint = (req, res) => {
  return res.status(404).send({ error: "unknown endpoint" });
};
app.use(express.json());
app.use(express.static("dist"));
app.use(requestLogger);
app.use(cors());
morgan.token("postData", (req) => {
  if (req.method === "POST") return JSON.stringify(req.body);
  return " - ";
});
app.use(morgan(" :method :url :status :response-time ms - :postData"));

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
  console.log("request 1");
});

app.get("/api/notes", (req, res) => {
  res.json(notes);
  console.log("request no 2");
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (!body.content)
    return response.status(400).json({
      error: "content missing",
    });

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  };

  notes = notes.concat(note);

  response.json(note);
  console.log("Requeest 3");
});

app.get("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);

  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }

  response.json(note);
});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((note) => note.id !== id);

  response.status(204).end();
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
