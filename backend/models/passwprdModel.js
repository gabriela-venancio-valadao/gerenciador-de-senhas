const { getDatabase } = require('../config/database')

function findByUserId(userId) {
  return getDatabase().prepare('SELECT * FROM passwords WHERE userId = ?').all(userId)
}

function findById(id) {
  return getDatabase().prepare('SELECT * FROM passwords WHERE id = ?').get(id)
}

function create(data) {
  const { userId, site, siteUsername, sitePassword } = data
  if (!userId || !site || !siteUsername || !sitePassword) {
    throw new Error('Todos os campos são obrigatórios')
  }
  const result = getDatabase()
    .prepare('INSERT INTO passwords (userId, site, siteUsername, sitePassword) VALUES (@userId, @site, @siteUsername, @sitePassword)')
    .run({ userId, site, siteUsername, sitePassword })
  return findById(result.lastInsertRowid)
}

function update(id, data) {
  const existing = findById(id)
  if (!existing) return undefined

  const fields = Object.keys(data)
    .filter(key => key !== 'id' && key !== 'userId')
    .map(key => `${key} = @${key}`)
    .join(', ')

  if (!fields) return existing

  getDatabase().prepare(`UPDATE passwords SET ${fields} WHERE id = @id`).run({ ...data, id })
  return findById(id)
}

function deleteById(id) {
  const result = getDatabase().prepare('DELETE FROM passwords WHERE id = ?').run(id)
  return { deleted: result.changes > 0 }
}

function findAllGroupedByUser() {
  const passwords = getDatabase().prepare('SELECT * FROM passwords').all()

  return passwords.reduce((map, pw) => {
    const list = map.get(pw.userId) || []
    list.push(pw)
    map.set(pw.userId, list)
    return map
  }, new Map())
}

module.exports = { findByUserId, findById, create, update, deleteById, findAllGroupedByUser }