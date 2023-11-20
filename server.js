const app = require("./src/app");

PORT = 3055

const server = app.listen(PORT, () => {
    console.log(`WSV started on port ${PORT}`);
})

// process.on('SIGINT', () => {
//     server.close(() => console.log(`EXIT SERVER EXPRESS`))
// })