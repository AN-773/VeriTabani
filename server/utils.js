const crypto = require('crypto');

const generateRandomId = async () => (await crypto.randomBytes(9)).toString('base64').replace(/\//g, '_').replace(/\+/g, '-').replace(/\=/g, '')

module.exports = {
    generateRandomId
}