import express from "express";
import cors from "cors";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const PORT = 3000;


import { registerUser } from "./routes/registerUser.js";
import { POST } from "./routes/loginUser.js";



const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NFT API",
      version: "1.0.0",
      description: "A simple Express NFT API",
    },
    servers: [
      {
        url: "http://localhost:5000",
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


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
