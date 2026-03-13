const Database = require('better-sqlite3')
const path = require('path');

let instance = null;

function getDatabase() {
    if(!instance){
        const dbPth = path.join(__dirname,'..', 'database.db');
        instance = new Database(dbPth);
        instance.pragma('foreign_keys = ON');

    }
    return instance;
}

function initializeDatabase(){
    const db = getDatabase()

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT    UNIQUE NOT NULL,
      password TEXT    NOT NULL,
      role     TEXT    DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS passwords (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      userId       INTEGER NOT NULL,
      site         TEXT    NOT NULL,
      siteUsername TEXT    NOT NULL,
      sitePassword TEXT    NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
}

function seedDatabase(){

    
  const db = getDatabase()

  const count = db.prepare('SELECT COUNT(*) as total FROM users').get()
  if (count.total > 0) return   

  const insertUser = db.prepare(
    'INSERT INTO users (username, password, role) VALUES (@username, @password, @role)'
  )
  const insertPassword = db.prepare(
    'INSERT INTO passwords (userId, site, siteUsername, sitePassword) VALUES (@userId, @site, @siteUsername, @sitePassword)'
  )

  const adminId  = insertUser.run({ username: 'admin', password: 'admin123', role: 'admin' }).lastInsertRowid
  const joaoId   = insertUser.run({ username: 'joao',  password: 'joao123',  role: 'user'  }).lastInsertRowid
  const mariaId  = insertUser.run({ username: 'maria', password: 'maria123', role: 'user'  }).lastInsertRowid

  insertPassword.run({ userId: adminId,  site: 'GitHub',   siteUsername: 'admin',     sitePassword: 'gh_admin_pass'  })
  insertPassword.run({ userId: adminId,  site: 'AWS',      siteUsername: 'admin@org', sitePassword: 'aws_secret123'  })
  insertPassword.run({ userId: joaoId,   site: 'Gmail',    siteUsername: 'joao@mail', sitePassword: 'gmail_joao'     })
  insertPassword.run({ userId: joaoId,   site: 'Netflix',  siteUsername: 'joao',      sitePassword: 'netflix123'     })
  insertPassword.run({ userId: joaoId,   site: 'Spotify',  siteUsername: 'joao',      sitePassword: 'spot_joao'      })
  insertPassword.run({ userId: mariaId,  site: 'LinkedIn', siteUsername: 'maria@job', sitePassword: 'li_maria_pass'  })


}

function setup(){
    initializeDatabase();
    seedDatabase();
}

module.exports = {
    getDatabase,
    setup};