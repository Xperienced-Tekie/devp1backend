import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const db = new PrismaClient();

dotenv.config;

export async function withdraw(req, res) {
  try {
    await authenticateUser(req, res);
    const userId = req.user.userId;
    const userEmail = req.user.email;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    // Fetch user's current balance
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Deduct amount from user's balance
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { balance: user.balance - amount },
    });
    await sendEmail(
      userEmail,
      "withdrawal Confirmation",
      createUserEmailContent(amount)
    );
    await sendEmail(
      "marvineneje@gmail.com",
      "withdrawal Alert",
      createAdminEmailContent(userEmail, amount)
    );
    // Implement logic to handle the actual money transfer process

    return res.status(200).json({ balance: updatedUser.balance });
  } catch (error) {
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(500).json({
      message: errorMessage,
      details: error.message || error,
    });
  }
}
async function sendEmail(to, subject, htmlContent) {
  let transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: "support@pandas-nft.com",
      pass: process.env.PASS_KEY,
    },
  });

  let info = await transporter.sendMail({
    from: '"Pandas Nft" support@pandas-nft.com', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: htmlContent, // HTML body content
  });

  console.log("Message sent: %s", info.messageId);
}

function createUserEmailContent(amount) {
  return `
  <div style="font-family: Arial, sans-serif; color: #333;">
  <h2 style="color: #1a1a1a;">Withdrawal Confirmation</h2>
  <p>You have successfully withdrawn an amount of ${amount}.</p>
  <p>This amount has been deducted from your account balance.</p>
  <p>If you did not initiate this withdrawal, please contact our support team immediately.</p>
</div>
    `;
}

function createAdminEmailContent(userEmail, amount) {
  return `
  <div style="font-family: Arial, sans-serif; color: #333;">
  <h2 style="color: #1a1a1a;">Withdrawal Notification</h2>
  <p>A withdrawal request has been made by ${userEmail}.</p>
  <p>Amount Requested: ${amount} ETH</p>
  <p>Please review this transaction as soon as possible.</p>
</div>
    `;
}
