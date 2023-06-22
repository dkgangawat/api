const express = require("express");
const cors = require("cors");
const app = express();
require("./config/db");
require("dotenv").config();

app.use(cors());
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config({ path: "config/config.env" });
// }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require("path");


app.use("/seller", require('./routers/sellerRoute'));
app.use('/item', require('./routers/GeneralListing'))
app.use('/buyer', require('./routers/buyerRoute'))
app.use('/add-to-cart', require('./routers/addToCart'))

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));
//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname, "..", "client", "build", "index.html"))
//   );
// }

module.exports = app;