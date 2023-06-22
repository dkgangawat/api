const app = require("./app");
const { PORT } = require("./config/config");



process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});
const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});