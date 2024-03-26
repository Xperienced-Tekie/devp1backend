import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

const db = new PrismaClient();
dotenv.config();

/**
 * @swagger
 * /blogposts:
 *   get:
 *     tags:
 *       - BlogPosts
 *     description: Retrieve a list of all blog posts
 *     responses:
 *       200:
 *         description: Successfully retrieved all blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal Server Error
 */

export async function getAllBlogPosts(req, res) {
  try {
    // Retrieve all blog posts from the database
    const blogPosts = await db.blogPost.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        createdAt: true,
      },
    });

    res.status(200).json(blogPosts);
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
