const { getDatabase } = require("../config/database");

function findById(id) {
  return getDatabase().prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function findByUsername(username) {
  return getDatabase()
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
}

function findAll() {
  return getDatabase().prepare("SELECT * FROM users").all();
}

function create(data) {
  const { username, password, role = "user" } = data;
  if (!username || !password) {
    throw new Error("Username and password são obrigatórios");
  }

  const result = getDatabase()
    .prepare(
      "INSERT INTO users (username, password, role) VALUES (@username, @password, @role)",
    )
    .run({ username, password, role });

  return findById(result.lastInsertRowid);
}
function update(id, data) {
  const existing = findById(id)
  if (!existing) return undefined

  const fields = Object.keys(data)
    .filter(key => key !== 'id')
    .map(key => `${key} = @${key}`)
    .join(', ')

  if (!fields) return existing

  getDatabase()
    .prepare(`UPDATE users SET ${fields} WHERE id = @id`)
    .run({ ...data, id })

  return findById(id)
}

function deleteById(id) {
  const result = getDatabase()
    .prepare('DELETE FROM users WHERE id = ?')
    .run(id)

  return { deleted: result.changes > 0 }
}

module.exports = { findById, findByUsername, findAll, create, update, deleteById }