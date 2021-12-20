const db = require('../db.js')
const utils = require('../utils.js')
const express = require('express');
const router = express.Router();

router.get('/', utils.isLoggedIn, async (req, res) => {
    try {
        result = await db.getUserRooms(req.session.userId)
        res.json(result)
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
        room_id = await utils.generateRandomId()
        await db.createRoom(name, req.session.userId, room_id)
        res.send({id: room_id})
    } catch (err) {
        console.log(err);
        res.sendStatus(500)
    }
})

router.post('/update', utils.isLoggedIn, async (req, res) => {
    const { id, name } = req.body
    room = []
    try {
        room = await db.getRoomById(id)
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
            await db.updateRoomName(id, name)
            res.sendStatus(200)
        } catch (err) {
            res.sendStatus(500)
        }
    }
})


router.post('/remove', utils.isLoggedIn, async (req, res) => {
    const { id } = req.body
    if (!id) {
        res.sendStatus(406)
        return
    }
    room = []
    try {
        room = await db.getRoomById(id)
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
        await db.removeRoom(id)
        res.sendStatus(200)
    }
})

router.post('/add-user', utils.isLoggedIn, async (req, res) => {
    const { id, users } = req.body
    if (!id || (!users || users.length == 0)) {
        res.sendStatus(406)
        return
    }
    room = []
    try {
        room = await db.getRoomById(id)
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
        for (let i = 0; i < users.length; i++) {
            user = users[i]
            if (await db.isFriend(req.session.userId, user.id)) {
                await db.addUserToRoom(id, user.id)
            }
        }
        res.sendStatus(200)
    }
})

router.post('/remove-user', utils.isLoggedIn, async (req, res) => {
    const { id, users } = req.body
    if (!id || (!users || users.length == 0)) {
        res.sendStatus(406)
        return
    }
    room = []
    try {
        room = await db.getRoomById(id)
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
        for (let i = 0; i < users.length; i++) {
            user = users[i]
            await db.removeUserFromRoom(id, user.id)
        }
        res.sendStatus(200)
    }
})

router.get('/messages', utils.isLoggedIn, async (req, res) => {
    let { id, start, size } = req.body
    if (!id) {
        res.sendStatus(406)
        return
    }
    start = start || 0
    size = size || 100
    try {
        result = await db.getMessages(id, start, size)
        res.json(result)
    } catch (err) {
        console.log(err);
        res.status(405).send("Room not found")
    }
})

router.post('/messages/send', utils.isLoggedIn, async (req, res) => {
    let { roomId, text, replay_to } = req.body
    if (!text || !roomId) {
        res.sendStatus(406)
        return
    }
    if (!replay_to)
        replay_to = null
    try {
        res.json({ id: (await db.addMessage(roomId, req.session.userId, text, replay_to)) })
    } catch (err) {
        console.log(err);
        res.status(405).send("Something went wrong")
    }
})


router.post('/messages/remove', utils.isLoggedIn, async (req, res) => {
    let { id } = req.body
    if (!id) {
        res.sendStatus(406)
        return
    }
    try {
        await db.removeMessage(id)
        res.sendStatus(200)
    } catch (err) {
        console.log(err);
        res.status(405).send("Something went wrong")
    }
})


module.exports = router