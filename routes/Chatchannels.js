import { PrismaClient } from "@prisma/client";
import { authenticateUser } from "../middleware/auth.js";

const db = new PrismaClient();

/**
 * @swagger
 * /chat/channel:
 *   post:
 *     summary: Create or find a one-on-one chat channel
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partnerId:
 *                 type: integer
 *                 description: The ID of the partner user to chat with.
 *                 example: 2
 *     responses:
 *       200:
 *         description: Returns the existing chat channel details between the two users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Chat channel already exists.
 *                 channel:
 *                   $ref: '#/components/schemas/ChatChannel'
 *       201:
 *         description: Successfully created a new chat channel and returns its details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Chat channel created successfully.
 *                 channel:
 *                   $ref: '#/components/schemas/ChatChannel'
 *       400:
 *         description: Missing or invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Partner user ID is required.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 details:
 *                   type: string
 * 
 * components:
 *   schemas:
 *     ChatChannel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the chat channel.
 *           example: 1
 *         isDirect:
 *           type: boolean
 *           description: Indicates if the chat channel is direct (one-on-one).
 *           example: true
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the user.
 *           example: 1
 *         username:
 *           type: string
 *           description: The username of the user.
 *           example: john_doe
 *         email:
 *           type: string
 *           description: The email of the user.
 *           example: john_doe@example.com
 */


// Function to create or find a one-on-one chat channel
export async function createOrFindChatChannel(req, res) {
  try {
    // Authenticate the user
    await authenticateUser(req, res);
    const myId = req.user.userId;
    const partnerId = req.body.partnerId;

    if (!partnerId) {
      return res.status(400).json({ message: "Partner user ID is required." });
    }

    // Check if a one-on-one channel already exists between the two users
    const existingChannel = await db.chatChannel.findFirst({
      where: {
        AND: [
          { users: { some: { id: myId } } },
          { users: { some: { id: partnerId } } },
          { isDirect: true }
        ],
      },
      include: {
        users: true, // Include user details
      },
    });

    if (existingChannel) {
      return res.status(200).json({ message: "Chat channel already exists.", channel: existingChannel });
    }

    // If not, create a new chat channel
    const newChannel = await db.chatChannel.create({
      data: {
        isDirect: true,
        users: {
          connect: [{ id: myId }, { id: partnerId }],
        },
      },
      include: {
        users: true, // Include user details
      },
    });

    return res.status(201).json({ message: "Chat channel created successfully.", channel: newChannel });
  } catch (error) {
    console.error("Error creating or finding chat channel:", error);
    return res.status(500).json({ message: "Internal server error", details: error.message });
  }
}
