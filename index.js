// const express = require("express");
// const cors = require("cors");
// const dbConnect = require("./config/database");
// const userRouter = require("./router/userRoutes");
// const conversationRouter = require("./router/conversationRoutes");
// const messageRouter= require('./router/messageRouter')
// require("dotenv").config();

// const io = require("socket.io")(8000, {
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });

// dbConnect();

// const app = express();

// const corsOptions = {
//   origin: "http://localhost:3000",
//   methods: "GET,PUT,POST,DELETE",
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// // app.use(express.urlencoded({ extended: false }));

// //Socket->

// io.on('connection', socket=>{
//   console.log('user Connected', socket.id)
// })

// app.use("/api/v1", userRouter);
// app.use("/api/v1", conversationRouter);
// app.use("/api/v1", messageRouter)

// const PORT = process.env.PORT || 5000;

// app.get("/", (req, res) => {
//   res.send("API is running");
// });

// app.use((req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: "API route not found",
//   });
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: "An unexpected error occurred",
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/database");
const userRouter = require("./router/userRoutes");
const conversationRouter = require("./router/conversationRoutes");
const messageRouter = require("./router/messageRouter");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

dbConnect();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

//Socket-->
let users = []

users.map((user) => console.log("All", user));
console.log("All array user",users)
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on('addUser', userId =>{
    console.log("User id",userId)
    const isUserExist = users.find(user => user.userId === userId)
    if(!isUserExist){
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit("getUsers", users);
    }
  })

  socket.on("sendMessage", ({ senderId, conversationId, message, receiverId })=>{
    const receiver = users.find(user => user.userId === receiverId);
    const sender = users.find(user => user.userId === senderId);
    if(receiver){
      io.to(receiver.socketId).to(sender.socketId).emit("getMessage", {
        senderId,
        receiverId,
        message,
        conversationId,
      });
    }
  });

  socket.on("typing", ({ conversationId, senderId }) => {
    const conversationUsers = users.filter((user) => user.userId !== senderId);
    conversationUsers.forEach((user) => {
      io.to(user.socketId).emit("typing", { senderId });
    });
  });


  socket.on('disconnect',() =>{
    users = users.filter(user =>user.socketId != socket.id);
    io.emit('getUsers', users)
  })
  
});


app.use("/api/v1", userRouter);
app.use("/api/v1", conversationRouter);
app.use("/api/v1", messageRouter);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("API is running");
});


app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
