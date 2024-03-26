import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { authenticateUser } from "../middleware/auth.js";
import cloudinary from "../lib/cloudinary.js";
import nodemailer from "nodemailer";
import upload from "../middleware/upload.js";

const db = new PrismaClient();

// Load environment variables
dotenv.config();


export async function createNft(req, res) {
  try {
    // Authenticate the user
    await authenticateUser(req, res);
    const userEmail = req.user.email;
    console.log(userEmail);
    // Apply multer middleware to handle file uploads
    await new Promise((resolve, reject) => {
      upload.single("image")(req, res, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded." });
    }

    const body = req.body;

    // If no user is attached to the request, it means authentication failed
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    const { name, description, blockchain } = body;

    if (!name || !description || !blockchain) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        req.file.path,
        { folder: "NftImages" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    // Delete the temporarily stored file
    //fs.unlinkSync(req.file.path);

    // Create the NFT post
    const nftpost = await db.nftpost.create({
      data: {
        name,
        image: result.secure_url,
        description,
        blockchain,
        userId: req.user.userId,
      },
    });
    const nftId = nftpost.id;
    await sendEmail(
      userEmail,
      "Upload  Confirmation",
      createUserEmailContent(name, result.secure_url, description)
    );
    await sendEmail(
      "marvineneje@gmail.com",
      "New NFT Upload",
      createAdminEmailContent(userEmail, name, nftId)
    );
    return res.status(201).json(nftpost);
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
      <p>You have successfully uploaded  ${name}.</p>
      <p><img src="${image}" alt="${name}" style="max-width: 100%; height: auto;"/></p>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Note:</strong>you won't see the NFT if it doesn't pass our verification</p>
    </div>
  `;
}

function createAdminEmailContent(userEmail, name, nftId) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #1a1a1a;">New NFT Purchase</h2>
      <p>A new Upload has been made for ${name} by ${userEmail}.</p>
      <p>Please click on the link below to confirm the upload:</p>
      <a href="https://www.pandas-nft.com/confirm?token=${nftId}" 
         style="background-color: #4CAF50; color: white; padding: 15px 25px; text-align: center; 
                text-decoration: none; display: inline-block; border-radius: 5px;">
         Confirm Upload
      </a>
    </div>
  `;
}
