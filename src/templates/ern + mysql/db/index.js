const mysql = require("mysql");

// The Pool is for connection and createing queries to the MySQL db
const pool = mysql.createPool({
  connectionLimit: 10,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  database: process.env.DATABASE,
  host: process.env.HOST,
  port: process.env.DB_PORT,
});

let dbData = {};

// Query example (get all from table);
/*
    dbData.all = () => {
      return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM <TABLE NAME>`, (err, results) => {
          if (err) {
            return reject(err);
          }
          return resolve(results);
        });
      });
    };
*/

module.exports = dbData;
