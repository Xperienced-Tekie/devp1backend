import { authenticateUser } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";


const db = new PrismaClient();

dotenv.config;


export async function getAllUsers(req, res) {
    try {
      // Authenticate the user - ensure only authorized access
      await authenticateUser(req, res);
  
      // Retrieve all users from the database including their balance
      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          balance: true,
          NFTs:true
        }
      });
  
      res.status(200).json(users);
    } catch (error) {
      let errorMessage = "Internal Server Error";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({
        message: errorMessage,
        details: error instanceof Error ? error.message : error,
      });
    }
  }
  