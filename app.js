const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDb();

//API 1

app.get("/todos/", async (request, response) => {
  const { priority, status, search_q = "" } = request.query;
  const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
  };

  const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };

  const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };
  let query = "";
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      query = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      query = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      query = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      query = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }
  const data = await db.all(query);
  response.send(data);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo WHERE id=${todoId}`;
  const data = await db.get(query);
  response.send(data);
});

//API 3

app.post("/todos/", async (request, response) => {
  const body = request.body;
  const { status, priority, id, todo } = body;
  const query = `INSERT INTO todo(id,todo,priority,status)
       VALUES('${id}','${todo}','${priority}','${status}')`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let query = "";
  let data = "";
  switch (true) {
    case status != undefined:
      query = `UPDATE todo SET status='${status}'
            WHERE id=${todoId}`;
      await db.run(query);
      response.send("Status Updated");
      break;

    case priority != undefined:
      query = `UPDATE todo SET priority='${priority}'
           WHERE id=${todoId}`;
      await db.run(query);
      response.send("Priority Updated");
      break;

    case todo != undefined:
      query = `UPDATE todo SET todo='${todo}'
           WHERE id=${todoId}`;
      await db.run(query);
      response.send("Todo Updated");
      break;
  }
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo WHERE id=${todoId}`;
  await db.run(query);
  response.send("Todo Deleted");
});

//API 6
app.get("/todos/", async (request, response) => {
  let q = `SELECT * FROM todo`;
  const data = await db.all(q);
  response.send(data);
});

module.exports = app;
