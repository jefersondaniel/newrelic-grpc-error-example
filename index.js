const express = require("express")
const app = express()
const {CloudTasksClient} = require('@google-cloud/tasks');
const client = new CloudTasksClient();

app.get("/", async (request, reply) => {
  const project = 'my-project-id';
  const queue = 'my-queue';
  const location = 'us-central1';

  const parent = client.queuePath(project, location, queue);

  const task = {
    appEngineHttpRequest: {
      httpMethod: 'POST',
      relativeUri: '/log_payload',
    },
  };

  const createTaskRequest = {
    parent: parent,
    task: task,
  };

  try {
    const [response] = await client.createTask(createTaskRequest);
    const name = response.name;

    reply.send(`Created task ${name}`);
  } catch (error) {
    if (
      error.code === "ENOENT" ||
      /Could not load the default credentials/.test(error.message)
    ) {
      throw error;
    }

    /**
     * The above code will fail because the project does not exists,
     * but the error should be ignored here.
     */
    reply.send(`Error was ignored`);
  }
})

app.listen(3000, () => {
  console.log("Server started")
})
