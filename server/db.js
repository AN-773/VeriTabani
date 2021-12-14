const bcrypt = require('bcrypt');
const utils = require('./utils');
const Pool = require('pg').Pool;
const SALT = process.env.salt
const pool = new Pool({
    user: process.env.user,
    host: process.env.lhost,
    database: process.env.db,
    password: process.env.pass,
    port: process.env.port,
});

//Rooms

const getUserRooms = async (userId) => (await pool.query('SELECT ro.name FROM public.rooms AS ro INNER JOIN public.user_rooms as urs ON ro.id = urs.room_id WHERE urs.user_id = $1 ORDER BY ro.last_active_time DESC', [userId])).rows

const getRoomById = async (id) => (await pool.query("SELECT * FROM public.rooms WHERE id = $1 ", [id])).rows

const createRoom = async (name) => (await pool.query('INSERT INTO public.rooms (id, name) VALUES ($1, $2) RETURNING id', [await utils.generateRandomId(), name])).rows[0].id

const updateRoomName = async (roomId, newName) => await pool.query('UPDATE public.rooms SET name = $1 WHERE id = $2', [newName, roomId])

const addUserToRoom = async (roomId, userId) => await pool.query('INSERT INTO public.user_rooms (room_id, user_id) VALUES ($1, $2)', [roomId, userId])

const removeUserFromRoom = async (roomId, userId) => await pool.query('DELETE FROM public.user_rooms AS ur WHERE ur.room_id = $1 AND ur.user_id = $2', [roomId, userId])

const getMessages = async (roomId, pageStart, pageSize) => (await pool.query('SELECT m.id, u.username, m.text, substring( mm.text from 0 for 25 ) as replay, m.replay_to, m.time FROM public.messages AS m JOIN public.users AS u ON m.writer = u.id LEFT OUTER JOIN public.messages as mm on m.replay_to = mm.id  WHERE m.room = $1 AND m.id > $2 ORDER BY m.id LIMIT $3', [roomId, pageStart, pageSize])).rows

//Friends

const addFriendRequest = async (sender, receiver) => await pool.query("INSERT INTO public.friend_req (sender, receiver) VALUES ($1, $2)", [sender, receiver])

const removeFriendRequest = async (id) => await pool.query('DELETE FROM public.friend_req as fr WHERE fr.id = $1', [id])

const getFriendRequests = async (userId) => (await pool.query("SELECT fr.id, fr.sender, u.username AS username FROM public.friend_req AS fr JOIN public.users AS u ON fr.sender = u.id WHERE receiver = $1", [userId])).rows

const getPendingFriendRequests = async (userId) => (await pool.query("SELECT fr.id, fr.receiver, u.username AS username FROM public.friend_req AS fr JOIN public.users AS u ON fr.receiver = u.id WHERE sender = $1", [userId])).rows

const getFriendRequestById = async (id) => (await pool.query("SELECT * FROM public.friend_req WHERE id = $1", [id])).rows

const getFriends = async (userId) => (await pool.query("SELECT u.id AS friend_id, u.username FROM public.friends AS f INNER JOIN public.users AS u on f.friend_id = u.id WHERE user_id = $1", [userId])).rows

const isFriend = async (userId, friendId) => (await pool.query("SELECT * FROM public.friends WHERE user_id = $1 AND friend_id = $2", [userId, friendId])).rows.length > 0

const acceptFriendRequest = async (reqId, userId) => {
    const client = await pool.connect()
    try {
        const friendId = (await getFriendRequestById(reqId))[0].sender
        await client.query("BEGIN")
        await client.query("INSERT INTO public.friends (user_id, friend_id) VALUES ($1, $2)", [friendId, userId])
        await client.query('DELETE FROM public.friend_req as fr WHERE fr.id = $1', [reqId])
        await client.query('COMMIT')
    } catch (err) {
        await client.query("ROLLBACK")
        throw err
    } finally {
        client.release()
    }
}
//Users

const addUser = async (user) => (await pool.query('INSERT INTO public.users (email, name, lname, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING id', [user.email, user.name, user.lname, user.username, (await bcrypt.hash(user.password, await bcrypt.genSalt(10)))])).rows[0].id

const updateUser = async (userId, user) => (await pool.query('UPDATE public.users SET email = $1, name=$2, lname=$3, username=$4, password=$5 WHERE id = $6', [user.email, user.name, user.lname, user.username, user.password, userId]))

const searchUsers = async (queryStr) => (await pool.query("SELECT id, username FROM public.users WHERE username LIKE  $1 || '%'", [queryStr])).rows

const getUserByEmail = async (email) => (await pool.query("SELECT * FROM public.users WHERE email=$1", [email])).rows

const getUserById = async (id) => (await pool.query("SELECT * FROM public.users WHERE id=$1", [id])).rows

module.exports = {
    getUserRooms,
    getRoomById,
    createRoom,
    updateRoomName,
    addUserToRoom,
    removeUserFromRoom,
    getMessages,
    addFriendRequest,
    getFriendRequests,
    getPendingFriendRequests,
    removeFriendRequest,
    getFriendRequestById,
    getFriends,
    isFriend,
    acceptFriendRequest,
    addUser,
    updateUser,
    searchUsers,
    getUserByEmail,
    getUserById
}

