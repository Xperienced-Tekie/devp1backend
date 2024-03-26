import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

const db = new PrismaClient();
dotenv.config();

// ... [existing code for getAllBlogPosts]

/**
 * @swagger
 * /blogposts/{id}:
 *   get:
 *     tags:
 *       - BlogPosts
 *     description: Retrieve a specific blog post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the blog post to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the blog post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Blog post not found
 *       500:
 *         description: Internal Server Error
 */

export async function getBlogPostById(req, res) {
  const { id } = req.params;

  try {
    const blogPost = await db.blogPost.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        createdAt: true,
      },
    });

    if (blogPost) {
      res.status(200).json(blogPost);
    } else {
      res.status(404).json({ message: "Blog post not found" });
    }
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
