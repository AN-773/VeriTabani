const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Pool = require('pg').Pool;
const SALT = process.env.salt
const pool = new Pool({
    user: process.env.user,
    host: process.env.lhost,
    database: process.env.db,
    password: process.env.pass,
    port: process.env.port,
});


const queryFun = (err, results) => {
    if (err) {
        throw err;
    }
    if (results && results.rows)
        return results.rows
};

function getUserRooms(userId, callback) {
    pool.query('SELECT ro.name FROM public.rooms AS ro ' +
        'INNER JOIN public.user_rooms as urs ON ro.id = urs.room_id ' +
        'WHERE urs.user_id = $1 ORDER BY ro.last_active_time DESC',
        [userId]).then(result => callback(result.rows)).catch(e => { throw e });
};

function generateRandomId(callback) {
    crypto.randomBytes(9, async (err, buf) => {
        if (err) {
            throw err;
        }
        callback(buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-').replace(/\=/g, ''))
    })
}

function createRoom(name, callback) {
    generateRandomId(str => {
        pool.query('INSERT INTO public.rooms (id, name) VALUES ($1, $2)', [str, name]).then(() => callback(str)).catch(e => { throw e });
    })
}

function updateRoomName(roomId, newName, callback) {
    pool.query('UPDATE public.rooms SET name = $1 WHERE id = $2', [newName, roomId]).then(() => callback("{result:done}")).catch(e => { throw e })
}

function addUserToRoom(roomId, userId, callback) {
    pool.query('INSERT INTO public.user_rooms (room_id, user_id) VALUES ($1, $2)', [roomId, userId]).then(() => callback("{result:done}")).catch(e => { throw e })
}

function removeUserFromRoom(roomId, userId, callback) {
    pool.query('DELETE FROM public.user_rooms AS ur WHERE ur.room_id = $1 AND ur.user_id = $2', [roomId, userId]).then(() => callback("{result:done}")).catch(e => { throw e })
}

function getMessages(roomId, pageStart, pageSize, userId, callback) {
    pool.query('SELECT m.id, u.username, m.text, substring( mm.text from 0 for 25 ) as replay, m.replay_to, m.time FROM public.messages AS m ' +
        'LEFT OUTER JOIN public.users AS u ON m.writer = u.id ' +
        'LEFT OUTER JOIN public.messages as mm on m.replay_to = mm.id ' +
        'WHERE (SELECT count( * ) FROM public.user_rooms AS ur WHERE ur.room_id = $1 AND ur.user_id = $4) = 1 AND m.room = $1 AND m.id > $2 LIMIT $3',
        [roomId, pageStart, pageSize, userId]).then(result => callback(result.rows)).catch(e => { throw e });
};

function addFriendRequest(sender, receiver, callback) {
    pool.query("INSERT INTO public.friend_req (sender, receiver) VALUES ($1, $2)", [sender, receiver])
        .then(() => callback("{result:done}")).catch(e => { throw e })
}

function removeFreintRequest(id, callback) {
    pool.query('DELETE FROM public.friend_req as fr WHERE fr.id = $1', [id])
        .then(() => callback("{result:done}")).catch(e => { throw e });
}

function getFreindRequests(userId, callback) {
    pool.query("SELECT fr.id, fr.sender, u.username AS username FROM public.friend_req AS fr " +
        "JOIN public.users AS u ON fr.sender = u.id WHERE receiver = $1",
        [userId]).then(result => callback(result.rows)).catch(e => { throw e });
}

function getPendingFreindRequests(userId, callback) {
    pool.query("SELECT fr.id, fr.receiver, u.username AS username FROM public.friend_req AS fr " +
        "JOIN public.users AS u ON fr.receiver = u.id WHERE sender = $1",
        [userId]).then(result => callback(result.rows)).catch(e => { throw e });
}

async function hashUsersPassword(user) {
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10))
}

async function addUser(user, callback) {
    await hashUsersPassword(user)
    pool.query('INSERT INTO public.users (email, name, lname, username, password) ' +
        'VALUES ($1, $2, $3, $4, $5)',
        [user.email, user.name, user.lname, user.username, user.password])
        .then(() => callback("{result:done}")).catch(e => { throw e })
}

async function updateUser(userId, user, callback) {
    await hashUsersPassword(user)
    pool.query('UPDATE public.users SET email = $1, name=$2, lname=$3, username=$4, password=$5 WHERE id = $6',
        [user.email, user.name, user.lname, user.username, user.password, userId])
        .then(() => callback("{result:done}")).catch(e => { throw e })
}

function searchUsers(queryStr, callback) {
    pool.query("SELECT id, username FROM public.users WHERE username LIKE  $1 || '%'", [queryStr]).then(result => callback(result.rows)).catch(e => { throw e });
}

function getUserByEmail(email) {
    pool.query("SELECT * FROM public.users WHERE email=$1", [email], queryFun);
}

function getUserById(id) {
    pool.query("SELECT * FROM public.users WHERE id=$1", [id], queryFun);
}

module.exports = {
    getUserRooms,
    createRoom,
    updateRoomName,
    addUserToRoom,
    removeUserFromRoom,
    getMessages,
    addFriendRequest,
    getFreindRequests,
    getPendingFreindRequests,
    removeFreintRequest,
    addUser,
    updateUser,
    searchUsers,
    getUserByEmail,
    getUserById
}

