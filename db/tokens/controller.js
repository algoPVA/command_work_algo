import sqlite3 from 'sqlite3'
import random from 'randomstring'
class TokensDB{

    constructor(db) {
        this.db = db;
        db.serialize(() => {
            db.run("CREATE TABLE IF NOT EXISTS tokens (token_id INTEGER PRIMARY KEY, id INTEGER, token TEXT)");
        });
    }
    async createToken(id) {
        const token = random.generate(32);
        this.db.run("INSERT INTO tokens (id, token) VALUES (?, ?)", [id, token]);
        return token;
    }
    async existsToken(id, token) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM tokens WHERE id = ? AND token = ?", [id, token], function(err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row && row.token === token ? true : false);
                }
            });
        });
    }
}

export default new TokensDB(new sqlite3.Database('db.sqlite3'));