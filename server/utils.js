const crypto = require('crypto');

const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        res.sendStatus(401)
    } else {
        next()
    }
}

const isNotLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        res.status(405).send("Already logedin")
    } else {
        next()
    }
}

const generateRandomId = async () => (await crypto.randomBytes(9)).toString('base64').replace(/\//g, '_').replace(/\+/g, '-').replace(/\=/g, '')

module.exports = {
    isLoggedIn,
    isNotLoggedIn,
    generateRandomId
}