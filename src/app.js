const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepository(id) {
  if(!isUuid(id)) {
    return { valid: false, statusCode: 400, message: 'Invalid repository!' };
  }

  return { valid: true };
}

function getRepositoryIndex(id) {
  const repoIndex = repositories.findIndex(repo => repo.id === id);

  return {
    repoIndex,
    statusCode: repoIndex < 0 ?  400 : undefined,
    message: repoIndex < 0 ? 'Repository not found!' : undefined
  };
}

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const validRepositoryId = validateRepository(id);
  if(!validRepositoryId.valid) {
    return response.status(validRepositoryId.statusCode).json({ message: validRepositoryId.message });
  }

  const { repoIndex, statusCode, message } = getRepositoryIndex(id);
  if(repoIndex < 0) {
    return response.status(statusCode).json({ message });
  }

  const repoToBeUpdated = { ...repositories[repoIndex], title, url, techs };
  repositories[repoIndex] = repoToBeUpdated;

  return response.json(repoToBeUpdated);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const validRepositoryId = validateRepository(id);
  if(!validRepositoryId.valid) {
    return response.status(validRepositoryId.statusCode).json({ message: validRepositoryId.message });
  }
  
  const { repoIndex, statusCode, message } = getRepositoryIndex(id);
  if(repoIndex < 0) {
    return response.status(statusCode).json({ message });
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).json(true);
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const validRepositoryId = validateRepository(id);
  if(!validRepositoryId.valid) {
    return response.status(validRepositoryId.statusCode).json({ message: validRepositoryId.message });
  }

  const { repoIndex, statusCode, message } = getRepositoryIndex(id);
  if(repoIndex < 0) {
    return response.status(statusCode).json({ message });
  }

  const repoToBeUpdated = { ...repositories[repoIndex], likes: repositories[repoIndex].likes + 1 };
  repositories[repoIndex] = repoToBeUpdated;

  return response.json(repoToBeUpdated);
});

module.exports = app;
