const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.user,
  host: process.env.lhost,
  database: process.env.db,
  password: process.env.pass,
  port: process.env.port,
})