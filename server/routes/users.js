const db = require('../db.js')
const utils = require('../utils.js')
const bcrypt = require('bcrypt')
const express = require('express');
const router = express.Router();

router.post("/update", utils.isLoggedIn, async (req, res) => {
    result = []
    try {
        result = await db.getUserById(req.session.userId)
    } catch (err) {
        console.log(err);
        res.sendStatus(500)
        return
    }
    const user = result[0]
    let { name, email, password, username, lname } = req.body
    name = name || user.name
    username = username || user.username
    email = email || user.email
    lname = lname || user.lname
    if (password && password.length > 0) {
        password = await bcrypt.hash(password, await bcrypt.genSalt(10))
    } else {
        password = user.password
    }
    try {
        await db.updateUser(req.session.userId, { name, email, password, lname, username })
        res.sendStatus(200)
    } catch (err) {
        console.log(err);
        res.sendStatus(500)
    }
})

router.get("/search", utils.isLoggedIn, async (req, res) => {
    const { query } = req.body
    if (query && query.length > 0) {
        try {
            result = await db.searchUsers(query)
            res.json(JSON.stringify(result))
        } catch (err) {
            console.log(err);
            res.sendStatus(405)
        }
    } else {
        res.sendStatus(405);
    }
})

router.post('/login', utils.isNotLoggedIn, async (req, res) => {
    const {
        email, password
    } = req.body
    result = []
    try {
        result = await db.getUserByEmail(email)
    } catch (err) {
        console.log(err);
        res.status(405).send("Email not found")
    }
    userPass = result[0].password
    if (await bcrypt.compare(password, userPass)) {
        req.session.userId = parseInt(result[0].id)
        res.sendStatus(200)
    } else {
        res.status(401).send("Wrong password")
    }
})

router.post('/register', utils.isNotLoggedIn, async (req, res) => {
    const { name, email, password, username, lname } = req.body
    if ((!name || name.length == 0) ||
        (!email || email.length == 0) ||
        (!password || password.length == 0) ||
        (!username || username.length == 0) ||
        (!lname || lname.length == 0)) {
        res.sendStatus(406)
        return
    }
    try {
        result = await db.addUser(req.body)
        req.session.userId = parseInt(result)
        res.sendStatus(200)
    } catch (err) {
        console.log(err);
        res.sendStatus(405)
    }
})

router.post('/logout', utils.isLoggedIn, (req, res) => {
    req.session.destroy(err => {
        res.clearCookie('session')
        res.sendStatus(200)
    })
})

module.exports = router