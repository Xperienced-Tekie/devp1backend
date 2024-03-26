import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

/**
 * @swagger
 * /chat/message:
 *   post:
 *     summary: Posts a new chat message to a specific chat channel.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content of the message.
 *                 example: Hello, how are you?
 *               userId:
 *                 type: integer
 *                 description: ID of the user posting the message.
 *                 example: 1
 *               chatChannelId:
 *                 type: integer
 *                 description: ID of the chat channel.
 *                 example: 1
 *     responses:
 *       201:
 *         description: Chat message posted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 *       500:
 *         description: Failed to post message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                 details:
 *                   type: string
 *                   description: Detailed error information.
 */


export async function postChatMessage(req, res) {
    const { content, userId, chatChannelId } = req.body;

    try {
        const message = await db.chatMessage.create({
            data: {
                content,
                userId,
                chatChannelId,
            },
        });

        req.io.to(chatChannelId.toString()).emit('message', message);

        res.status(201).json(message);
    } catch (error) {
        console.error("Error in postChatMessage:", error);
        let errorMessage = "Failed to post message";
        if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
        }
        res.status(500).json({ error: errorMessage, details: error });
    }
    
}



/**
 * @swagger
 * /chat/messages/{chatChannelId}:
 *   get:
 *     summary: Retrieves all messages from a specific chat channel.
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatChannelId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the chat channel.
 *     responses:
 *       200:
 *         description: List of chat messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 *       500:
 *         description: Failed to get messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */



export async function getChatMessages(req, res) {
    const { chatChannelId } = req.params;

    try {
        const messages = await db.chatMessage.findMany({
            where: { chatChannelId: parseInt(chatChannelId) },
            orderBy: { createdAt: 'asc' },
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get messages' });
    }
}