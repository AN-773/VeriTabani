require('dotenv').config()
const utils = require('./utils.js')
const express = require('express')
const session = require('express-session')
const Pool = require('pg').Pool;
const pool = new Pool({
    user: process.env.user,
    host: process.env.lhost,
    database: process.env.db,
    password: process.env.pass,
    port: process.env.port,
});
const friendsRoute = require('./routes/friends'),
    roomsRoute = require('./routes/rooms'),
    usersRoute = require('./routes/users')

const app = express()
const port = 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(session({
    store: new (require('connect-pg-simple')(session))({
        pool: pool,
        schemaName:'server',
        tableName: 'session'
    }),
    name: 'session',
    saveUninitialized: false,
    resave: false,
    secret: `quiet, pal! it's a secret!`,
    cookie: {
        httpOnly: true
    }
}))

app.get("/", utils.isLoggedIn, (req, res) => {
    res.send('Hi')
})

//Friends
app.use("/friends", friendsRoute)
//Rooms
app.use("/rooms", roomsRoute)
//Users
app.use("/user", usersRoute)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
