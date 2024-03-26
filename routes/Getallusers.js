import { authenticateUser } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";


const db = new PrismaClient();

dotenv.config;
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 details:
 *                   type: string
 *                   example: Error details
 * 
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID.
 *         email:
 *           type: string
 *           description: The user's email address.
 *         username:
 *           type: string
 *           description: The user's username.
 *         balance:
 *           type: number
 *           format: float
 *           description: The user's account balance.
 *         NFTs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NFT'
 *           description: The NFTs owned by the user.
 *     NFT:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The NFT ID.
 *         name:
 *           type: string
 *           description: The name of the NFT.
 *         image:
 *           type: string
 *           description: The URL to the NFT's image.
 *         description:
 *           type: string
 *           description: A description of the NFT.
 *         blockchain:
 *           type: string
 *           description: The blockchain on which the NFT exists.
 *         isPaid:
 *           type: boolean
 *           description: Indicates if the NFT has been paid for.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the NFT was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the NFT was last updated.
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
  