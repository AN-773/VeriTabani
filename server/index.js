require('dotenv').config()
const bcrypt = require('bcrypt');
const db = require('./db.js')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
