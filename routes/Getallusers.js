import { authenticateUser } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";


const db = new PrismaClient();

dotenv.config;
/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     description: Retrieve a list of all users
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   username:
 *                     type: string
 *                   balance:
 *                     type: number
 *       401:
 *         description: Unauthorized - Authentication token is missing or invalid
 *       500:
 *         description: Internal Server Error
 */

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
  