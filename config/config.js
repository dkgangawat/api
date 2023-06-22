require('dotenv').config()

const PORT = process.env.PORT || 8000
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const MONGO_URI = process.env.MONGO_URI



module.exports = { PORT, JWT_SECRET_KEY, MONGO_URI }