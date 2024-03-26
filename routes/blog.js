import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";
import upload from "../middleware/upload.js";

const db = new PrismaClient();

// Load environment variables
dotenv.config();

/**
 * @swagger
 * /createBlogPost:
 *   post:
 *     tags:
 *       - Blog
 *     description: Create a new blog post
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - title
 *               - content
 *               - image
 *     responses:
 *       201:
 *         description: Successfully created the blog post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 image:
 *                   type: string
 *                 content:
 *                   type: string
 *       400:
 *         description: Bad request - Missing required fields or No image uploaded
 *       500:
 *         description: Internal Server Error
 */

export async function createBlogPost(req, res) {
  try {
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

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        req.file.path,
        { folder: "BlogImages" },
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
    fs.unlinkSync(req.file.path);

    // Create the blog post
    const blogPost = await db.blogPost.create({
      data: {
        title,
        image: result.secure_url,
        content,
      },
    });

    return res.status(201).json(blogPost);
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
