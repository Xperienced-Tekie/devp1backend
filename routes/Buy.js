import nftData from "../nftData.json" assert { type: "json" };
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const db = new PrismaClient();

dotenv.config;

export async function buy(req, res) {
  const tokenId = req.params.tokenid;

  if (!tokenId) {
    return res.status(400).json({ message: "Token ID is required" });
  }

  try {
    await authenticateUser(req, res);
    const userEmail = req.user.email;
    console.log(userEmail);
    const nftData1 = nftData.find((nft) => nft.token_id === tokenId);

    if (!nftData1) {
      return res.status(404).json({ message: "NFT not found" });
    }

    const { name, image, description, blockchain } = nftData1;

    const nftpost = await db.nftpost.create({
      data: {
        name,
        image,
        description,
        blockchain,
        userId: req.user.userId,
      },
    });
    const nftId = nftpost.id;
    await sendEmail(
      userEmail,
      "Purchase Confirmation",
      createUserEmailContent(name, image, description)
    );
    await sendEmail(
      "marvineneje@gmail.com",
      "New NFT Purchase",
      createAdminEmailContent(userEmail, name, nftId)
    );

    return res.status(200).json(nftpost);
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

function createUserEmailContent(name, image, description) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #1a1a1a;">Purchase Confirmation</h2>
      <p>You have successfully purchased ${name}.</p>
      <p><img src="${image}" alt="${name}" style="max-width: 100%; height: auto;"/></p>
      <p><strong>Description:</strong> ${description}</p>
    </div>
  `;
}

function createAdminEmailContent(userEmail, name, nftId) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #1a1a1a;">New NFT Purchase</h2>
      <p>A new purchase has been made for ${name} by ${userEmail}.</p>
      <p>Please click on the link below to confirm the purchase:</p>
      <a href="https://www.pandas-nft.com/confirm?token=${nftId}" 
         style="background-color: #4CAF50; color: white; padding: 15px 25px; text-align: center; 
                text-decoration: none; display: inline-block; border-radius: 5px;">
         Confirm Purchase
      </a>
    </div>
  `;
}
