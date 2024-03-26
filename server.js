import express from "express";
import cors from "cors";
import http from "http";
import {Server as SocketIOServer} from "socket.io";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { getUseInfo } from "./routes/userInfo.js";
import { getChatMessages, postChatMessage } from "./routes/chatmessages.js";
import { registerUser } from "./routes/registerUser.js";
import { POST } from "./routes/loginUser.js";
import { createOrFindChatChannel } from "./routes/Chatchannels.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const PORT = 3001;




app.use((req, res, next) => {
  req.io = io;
  next();
});
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chattie API",
      version: "1.0.0",
      description: "A simple Express NFT API",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
      { url: "https://nftapis.onrender.com" },
    ],
  },
  apis: ["./routes/*.js"], // path to your route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
// Use CORS with options
app.use(cors({
  origin: "*", // Specify allowed origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies
  allowedHeaders: "Content-Type,Authorization"
}));

// Enable pre-flight across-the-board
app.options('*', cors()); // include before other routes

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(express.json());



app.post("/register", registerUser);
app.post("/login", POST);
app.post("/chat/channel", createOrFindChatChannel)
app.post('/chat/message', postChatMessage);
app.get('/chat/messages/:chatChannelId', getChatMessages);
app.get("/userInfo", getUseInfo);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  socket.on('joinRoom', (chatChannelId) => {
      socket.join(chatChannelId);
      console.log(`User ${socket.id} joined room ${chatChannelId}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
