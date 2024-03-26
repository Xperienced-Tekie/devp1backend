import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

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

        // Broadcast the message to all users in the chatChannelId room
        req.io.to(chatChannelId.toString()).emit('message', message);

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post message' });
    }
}

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
