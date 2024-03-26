import { authenticateUser } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /mynfts:
 *   get:
 *     tags:
 *       - User NFTs
 *     description: Get NFTs of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the NFTs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   image:
 *                     type: string
 *                   description:
 *                     type: string
 *                   blockchain:
 *                     type: string
 *                   userId:
 *                     type: string
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Internal Server Error
 */

export async function getUserNFTs(req, res) {
  try {
    // Authenticate the user
    await authenticateUser(req, res);

    // Get user ID from the authenticated user object
    const userId = req.user.userId;

    // If no userId is found, return a 401 error
    if (!userId) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    // Fetch NFTs associated with the authenticated user ID
    const userNfts = await db.nftpost.findMany({
      where: {
        userId: userId,
      },
    });

    // Return the fetched NFTs
    return res.status(200).json(userNfts);
  } catch (error) {
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(500).json({
      message: errorMessage,
      details: error instanceof Error ? error.message : error,
    });
  }
}
