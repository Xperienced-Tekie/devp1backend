import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/auth.js";

const db = new PrismaClient();

dotenv.config;


export async function updateUserBalance(req, res) {
    try {
        // Authenticate the user - ensure only authorized access
        await authenticateUser(req, res);

        const { email, balance } = req.body;

        if (!email || balance === undefined) {
            return res.status(400).json({ message: "Email and balance are required." });
        }

        const user = await db.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const updatedUser = await db.user.update({
            where: { email: email },
            data: { balance: balance }
        });

        res.status(200).json(updatedUser);
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
