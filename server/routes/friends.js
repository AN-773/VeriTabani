const db = require('../db.js')
const utils = require('../utils.js')
const express = require('express');
const router = express.Router();

router.get("/", utils.isLoggedIn, async (req, res) => {
    try {
        result = await db.getFriends(req.session.userId)
        res.json(JSON.stringify(result))
    } catch (err) {
        res.sendStatus(500)
    }
})

router.get('/pending', utils.isLoggedIn, async (req, res) => {
    try {
        reuslt = await db.getPendingFriendRequests(req.session.userId)
        res.json(JSON.stringify(result))
    } catch (err) {
        res.sendStatus(500)
    }
})

router.get('/requests', utils.isLoggedIn, async (req, res) => {
    try {
        result = await db.getFriendRequests(req.session.userId)
        res.json(JSON.stringify(result))
    } catch (err) {
        res.sendStatus(500)
    }
})

router.post('/requests/add', utils.isLoggedIn, async (req, res) => {
    const {
        to
    } = req.body
    try {
        await db.addFriendRequest(req.session.userId, to)
        res.sendStatus(200)
    } catch (err) {
        res.status(405).send("Friend request already sent")
    }
})

router.post('/requests/remove', utils.isLoggedIn, async (req, res) => {
    const {
        req_id
    } = req.body
    if (!req_id) {
        res.status(405).send("Id must be provided")
        return
    }
    result = []
    try {
        result = await db.getFriendRequestById(req_id)
    } catch (err) {
        console.log(err);
        res.status(405).send("Id not found")
        return
    }
    if (result.length == 0) {
        res.status(405).send("Id not found")
    } else if (result[0].sender == req.session.userId || result[0].receiver == req.session.userId) {
        try {
            await db.removeFriendRequest(req_id)
            res.sendStatus(200)
        } catch (err) {
            console.log(err);
            res.sendStatus(500)
        }
    } else {
        res.sendStatus(401)
    }

})

router.post('/requests/accept', utils.isLoggedIn, async (req, res) => {
    const { req_id } = req.body
    if (!req_id) {
        res.status(405).send("Id must be provided")
        return
    }
    try {
        result = await db.getFriendRequestById(req_id)
        if (result.length == 0) {
            res.status(406).send("request id not found")
        } else if (result[0].receiver != req.session.userId) {
            res.sendStatus(401)
        } else {
            await db.acceptFriendRequest(req_id, req.session.userId)
            res.sendStatus(200)
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500)
    }
})

module.exports = router