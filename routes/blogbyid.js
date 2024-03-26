import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

const db = new PrismaClient();
dotenv.config();



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
