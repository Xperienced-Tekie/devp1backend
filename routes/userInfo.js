import { PrismaClient } from "@prisma/client";
import { authenticateUser } from "../middleware/auth.js";

const db = new PrismaClient();

/**
 * @swagger
 * /user-info:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns user info based on JWT token
 *     responses:
 *       200:
 *         description: Successfully retrieved user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

export async function getUseInfo(req, res) {
  try {
    await authenticateUser(req, res);
    // The user's ID should be attached to the request in the validateToken middleware
    const { userId } = req.user;
  
    const user = await db.user.findUnique({
      where: { id: userId },
    });
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    return res.status(200).json({
      id: user.id,
      email: user.email,
      balance:user.balance
      // Add other user details you want to return
    });
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
