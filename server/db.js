const bcrypt = require('bcrypt');
const utils = require('./utils');
const Pool = require('pg').Pool;
const pool = new Pool({
    user: process.env.user,
    host: process.env.lhost,
    database: process.env.db,
    password: process.env.pass,
    port: process.env.port,
});

//Rooms

const getUserRooms = async (userId) => {
    return (await pool.query('SELECT ro.id, ro.name, ro.owner, ' +
        'to_milli_sec(last_active_time) as last_active_time ' +
        'FROM public.rooms AS ro INNER JOIN public.user_rooms as urs ON ro.id = urs.room_id ' +
        'WHERE urs.user_id = $1 ORDER BY ro.last_active_time DESC', [userId])).rows
}

const getRoomById = async (id) => (await pool.query("SELECT * FROM public.rooms WHERE id = $1 ", [id])).rows

const removeRoom = async (id) => await pool.query("DELETE FROM public.rooms WHERE id = $1", [id])

const createRoom = async (name, owner, room_id) => {
    pool.query("CALL public.create_group($1, $2, $3)", [room_id, name, owner])
}

const updateRoomName = async (roomId, newName) =>
    await pool.query('UPDATE public.rooms SET name = $1 WHERE id = $2',
        [newName, roomId])

const addUserToRoom = async (roomId, userId) =>
    await pool.query('INSERT INTO public.user_rooms (room_id, user_id) ' +
        'VALUES ($1, $2)', [roomId, userId])

const removeUserFromRoom = async (roomId, userId) =>
    await pool.query('DELETE FROM public.user_rooms AS ur ' +
        'WHERE ur.room_id = $1 AND ur.user_id = $2', [roomId, userId])

const getMessages = async (roomId, pageStart, pageSize) => {
    return (await pool.query('SELECT m.id, u.username as writer, m.text, substring( mm.text from 0 for 25 ) as replay, ' +
        'm.replay_to, (EXTRACT(epoch FROM m.time) * 1000)::BigInt as time ' +
        'FROM public.messages AS m JOIN public.users AS u ON m.writer = u.id ' +
        'LEFT OUTER JOIN public.messages as mm on m.replay_to = mm.id ' +
        'WHERE m.room = $1 AND m.id > $2 ORDER BY m.id LIMIT $3', [roomId, pageStart, pageSize])).rows
}

const addMessage = async (roomId, userId, text, replayTo) => {
    return (await pool.query("INSERT INTO public.messages (room, text, writer, replay_to) " +
        "VALUES ($1, $2, $3, $4) RETURNING id", [roomId, text, userId, replayTo])).rows[0].id
}

const removeMessage = async (id) => {
    await pool.query("DELETE FROM public.messages WHERE id = $1", [id])
}

//Follows
const addFriendRequest = async (sender, receiver) =>
    await pool.query("INSERT INTO public.follow_req (sender, receiver) " +
        "VALUES ($1, $2)", [sender, receiver])

const removeFriendRequest = async (id) =>
    await pool.query('DELETE FROM public.follow_req as fr WHERE fr.id = $1', [id])

const getFriendRequests = async (userId) =>
    (await pool.query("SELECT fr.id, fr.sender, u.username AS username " +
        "FROM public.follow_req AS fr JOIN public.users AS u ON fr.sender = u.id " +
        "WHERE receiver = $1", [userId])).rows

const getPendingFriendRequests = async (userId) =>
    (await pool.query("SELECT fr.id, fr.receiver, u.username AS username " +
        "FROM public.follow_req AS fr JOIN public.users AS u ON fr.receiver = u.id " +
        "WHERE sender = $1", [userId])).rows

const getFriendRequestById = async (id) =>
(await pool.query("SELECT * FROM public.follow_req WHERE id = $1", [id])).rows

const getFriends = async (userId) =>
    (await pool.query("SELECT u.id AS friend_id, u.username FROM public.follows AS f " +
        "INNER JOIN public.users AS u on f.follower = u.id " +
        "WHERE follower = $1", [userId])).rows

const isFriend = async (userId, friendId) =>
    (await pool.query("SELECT * FROM public.follows " +
        "WHERE follower = $1 AND followed = $2", [userId, friendId])).rows.length > 0

const acceptFriendRequest = async (reqId) =>
    pool.query("CALL accept_follow_req($1)", [reqId])

//Users
const addUser = async (user) =>
    (await pool.query('SELECT public.add_user($1, $2, $3, $4, $5)',
        [user.email, user.name,
            (await bcrypt.hash(user.password, await bcrypt.genSalt(10))),
            user.username, user.lname,])).rows[0].add_user

const updateUser = async (userId, user) =>
(await pool.query('UPDATE public.users SET ' +
    'email = $1, name=$2, lname=$3, username=$4, password=$5 WHERE id = $6',
    [user.email, user.name, user.lname, user.username, user.password, userId]))

const searchUsers = async (queryStr) =>
    (await pool.query("SELECT id, username, name, lname " +
        "FROM public.users WHERE username LIKE  $1 || '%'", [queryStr])).rows

const getUserByEmail = async (email) =>
    (await pool.query("SELECT * FROM public.users WHERE email=$1", [email])).rows

const getUserById = async (id) =>
    (await pool.query("SELECT * FROM public.users WHERE id=$1", [id])).rows

module.exports = {
    getUserRooms,
    getRoomById,
    createRoom,
    removeRoom,
    updateRoomName,
    addUserToRoom,
    removeUserFromRoom,
    getMessages,
    addMessage,
    removeMessage,
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

