const db = require('../db.js')
const utils = require('../utils.js')
const express = require('express');
const router = express.Router();

router.get('/', utils.isLoggedIn, async (req, res) => {
    try {
        result = await db.getUserRooms(req.session.userId)
        res.json(JSON.stringify(result))
    } catch (err) {
        console.log(err);
        res.sendStatus(405)
    }
})

router.post('/create', utils.isLoggedIn, async (req, res) => {
    const { name } = req.body
    if (!name || name.length == 0) {
        res.sendStatus(406)
        return
    }
    try {
        result = await db.createRoom(name)
        res.send(result)
    } catch (err) {
        console.log(err);
        res.sendStatus(500)
    }
})

router.post('/update', utils.isLoggedIn, async (req, res) => {
    const { room_id, name } = req.body
    room = []
    try {
        room = await db.getRoomById(room_id)
    } catch (err) {
        console.log(err);
        res.status(405).send("Room id doesn't exist")
        return
    }

    if (room.length == 0) {
        res.status(405).send("Room id doesn't exist")
    } else if (room[0].owner != req.session.userId) {
        res.sendStatus(401)
    } else if (!name || name.length == 0) {
        res.sendStatus(406)
    } else {
        try {
            await db.updateRoomName(room_id, name)
            res.sendStatus(200)
        } catch (err) {
            res.sendStatus(500)
        }
    }
})

router.post('/add-user', utils.isLoggedIn, async (req, res) => {
    const { room_id, user_id } = req.body
    if (!room_id || !user_id) {
        res.sendStatus(406)
        return
    }
    room = []
    try {
        room = await db.getRoomById(room_id)
    } catch (err) {
        console.log(err);
        res.status(405).send("Room id doesn't exist")
        return
    }
    if (room.length == 0) {
        res.status(405).send("Room id doesn't exist")
    } else if (room[0].owner != req.session.userId) {
        res.sendStatus(401)
    } else if (!(await db.isFriend(req.session.userId, user_id))) {
        res.sendStatus(401)
    } else {
        await db.addUserToRoom(room_id, user_id)
        res.sendStatus(200)
    }
})

router.post('/remove-user', utils.isLoggedIn, async (req, res) => {
    const { room_id, user_id } = req.body
    if (!room_id || !user_id) {
        res.sendStatus(406)
        return
    }
    room = []
    try {
        room = await db.getRoomById(room_id)
    } catch (err) {
        console.log(err);
        res.status(405).send("Room id doesn't exist")
        return
    }
    if (room.length == 0) {
        res.status(405).send("Room id doesn't exist")
    } else if (room[0].owner != req.session.userId) {
        res.sendStatus(401)
    } else {
        await db.removeUserFromRoom(room_id, user_id)
        res.sendStatus(200)
    }
})

router.get('/messages', utils.isLoggedIn, async (req, res) => {
    let { room_id, start, size } = req.body
    if (!room_id) {
        res.sendStatus(406)
        return
    }
    start = start || 0
    size = size || 100
    try {
        result = await db.getMessages(room_id, start, size)
        res.json(JSON.stringify(result))
    }catch(err) {
        res.status(405).send("Room not found")
    }
})

module.exports = router