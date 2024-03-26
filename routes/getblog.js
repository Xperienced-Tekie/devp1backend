import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

const db = new PrismaClient();
dotenv.config();


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
