const app = require('./app');
const config = require('./config/config');


process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});
const server = app.listen(config.PORT, () => {
  console.log(`Server running on ${config.PORT}`);
});
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
