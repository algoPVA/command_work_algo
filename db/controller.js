import sqlite3 from "sqlite3";
import { hashPassword } from "./utils.js";
import argon2 from "argon2";
import randomstring from "randomstring"
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});



class ChatsDB{
    constructor(db) {
        this.db = db;
        db.serialize(() => {
        
            db.run(`CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY,
                create_time INTEGER,
                name TEXT,
                owner_id INTEGER, 
                FOREIGN KEY(owner_id) REFERENCES users(id))`);
            // fuck sqlite
            db.run(`CREATE TABLE IF NOT EXISTS chat_members (
                id INTEGER PRIMARY KEY,
                chat_id INTEGER,
                user_id INTEGER,
                FOREIGN KEY(chat_id) REFERENCES chats(id),
                FOREIGN KEY(user_id) REFERENCES users(id))`);
});
    }

    async createChat(name, owner_id) {
        const query = "INSERT INTO chats (name, owner_id, create_time) VALUES (?, ?, ?)";
        const params = [name, owner_id, Date.now()];

        return new Promise((resolve, reject) => {
            this.lastID = this.db.run(query, params, (error) => {error? reject(error): null;}).lastID;
            try {
                self.addMember(this.lastID, owner_id);
                resolve(this.lastID);
            }
            catch(error) {
                reject(error)
            }
        }
    );
    }

    async getChat(id) {
        const query = "SELECT * FROM chats WHERE id = ?";
        const params = [id];

        return new Promise((resolve, reject) => {
          this.db.get(query, params, (error, row) => {error? reject(error) : resolve(row);});
      });
    }


    async deleteChat(id) {
        const query = "DELETE FROM chats WHERE id = ?";
        const params = [id];

        return new Promise((resolve, reject) => {
            this.db.run(query, params, (error) => {error? reject(error) : resolve()});
        });
    }

    async addMember(chat_id, user_id) {
        const query = "INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)";
        const params = [chat_id, user_id];

        return new Promise((resolve, reject) => {
            this.db.run(query, params, (error) => {error? reject(error) : resolve()});
        });
    }

    async deleteMember(chat_id, user_id) {
        const query = "DELETE FROM chat_members WHERE chat_id = ? AND user_id = ?";
        const params = [chat_id, user_id];

        return new Promise((resolve, reject) => {
            this.db.run(query, params, (error) => {error? reject(error) : resolve()});
        });
    }
    
    async getMembersFromChat(chat_id) {
        const query = "SELECT user_id FROM chat_members WHERE chat_id = ?";
        const params = [chat_id];

        return new Promise((resolve, reject) => {
            this.db.all(query, params, (error, rows) => {error? reject(error) : resolve(rows)});
        });
    }

    async getChatsFromUser(user_id) {
        const query = "SELECT chat_id FROM chat_members WHERE user_id = ?";
        const params = [user_id];

        return new Promise((resolve, reject) => {
            this.db.all(query, params, (error, rows) => {error? reject(error) : resolve(rows)});
        });
    }

}

class MessagesDB {
    constructor(db) {
        this.db = db;
        this.db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                chat_id INTEGER,
                sender_id INTEGER,
                send_time INTEGER,
                message TEXT,
                FOREIGN KEY(sender_id) REFERENCES users(id),
                FOREIGN KEY(chat_id) REFERENCES chats(id)
            )
        `);
    }

    async createMessage(chat_id, sender_id, message) {
        const query = "INSERT INTO messages (chat_id, sender_id, send_time, message) VALUES (?, ?, ?, ?)";
        const params = [chat_id, sender_id, Date.now(), message];

        return new Promise((resolve, reject) => {
            this.db.run(query, params, (error) => {error? reject(error) : resolve(this.lastID)});
        });
    }

    async getMessage(id) {
        const query = "SELECT * FROM messages WHERE id = ?";
        const params = [id];

        return new Promise((resolve, reject) => {
            this.db.get(query, params, (error, row) => {error? reject(error) : resolve(row)});
        });
    }
}

class TokensDB {
    constructor(db) {
        this.db = db
        this.db.run(`
            CREATE TABLE IF NOT EXISTS tokens (
                token_id INTEGER PRIMARY KEY,
                user_id INTEGER,
                token TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `)

    }
    /**
     * Creates a new token and saves it to the database
     * @public
     * @param {number} id - The id of the user who owns the token
     * @returns {Promise<string>} - The newly created token
     */
    async createToken(id) {
        const token = randomstring.generate(64)
        const query = "INSERT INTO tokens (user_id, token) VALUES (?, ?)"
        const params = [id, token]
        
        return new Promise((resolve, reject) => {
            this.db.run(query, params, (error) => {error? reject(error) : resolve(token)});
        })
    }

    async getToken(id) {
        const query = "SELECT token FROM tokens WHERE user_id = ?"
        const params = [id]

        return new Promise((resolve, reject) => {
            this.db.get(query, params, (error, row) => {error? reject(error) : resolve(!row? null : row.token)});
        })
    }

    async deleteToken(token) {
        const query = "DELETE FROM tokens WHERE token = ?"
        const params = [token]

        return new Promise((resolve, reject) => {
            this.db.run(query, params, (error) => {error? reject(error) : resolve()});
        })
    }

    async matchesToken(token) {
        const query = "SELECT user_id FROM tokens WHERE token = ?"
        const params = [token]

        return new Promise((resolve, reject) => {
            this.db.get(query, params, (error, row) => {
                if(error) reject(error)
                else resolve(!row? null : row.user_id)
            });
        })
    }
}
class UsersDB {
    constructor(db) {
        this.db = db;
        this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
                    username TEXT UNIQUE,
                    hash TEXT
                )
            `);
    }

    async createUser(name, password) {
        const query = "INSERT INTO users (username, hash) VALUES (?, ?)";


        return new Promise(async (resolve, reject) => {
            try{
                const hash = await hashPassword(password);
                this.db.run(query, [name, hash], function(error) {
                        if(error) reject(error);
                        else resolve(this.lastID);
                    });
                
            }
            catch(error){
                reject(error)
            }
        });
    }

    async delUser(id) {
        const query = "DELETE FROM users WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.run(query, [id], (error) => {error? reject(error) : resolve()});
        });
    }

    async matchesPassword(id, password) {
        const query = "SELECT hash FROM users WHERE id = ?";
        const params = [id];

        return new Promise((resolve, reject) => {
            this.db.get(query, params, (error, row) => {
                if (error) {reject(error); return}
                if (!row) {resolve(false); return}
                argon2.verify(row.hash, password).then((result) => resolve(result)).catch((error) => reject(error));});
        });
    }

    async getIdByName(name) {
        const query = "SELECT id FROM users WHERE username = ?";
        const params = [name];

        return new Promise((resolve, reject) => {
            this.db.get(query, params, (error, row) => {error? reject(error) : resolve(row? row.id : null)});
        });
    }

    async changePassword(id, password) {
        const query = "UPDATE users SET hash = ? WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.run(query, [hashPassword(password), id], (error) => {error? reject(error) : resolve()});
        });
    }

    async getUser(id) {
        const query = "SELECT * FROM users WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.get(query, id, (error, row) => {error? reject(error) : resolve(row)});
        });
    }
}
const users = new UsersDB(db)
const tokens = new TokensDB(db)
const chats = new ChatsDB(db)
const messages = new MessagesDB(db)
export {users, tokens, chats, messages}