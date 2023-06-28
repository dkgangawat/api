require('dotenv').config();

let PORT = process.env.PORT || 8000;
let JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
let MONGO_URI = process.env.MONGO_URI;
let GOOGLE_MAP_KEY = "AIzaSy88621sdOZY-lEwqTJcCeWHSTdZ0eypqdfY"

module.exports = { PORT, JWT_SECRET_KEY, MONGO_URI, GOOGLE_MAP_KEY };