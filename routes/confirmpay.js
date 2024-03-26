import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/auth.js";

const db = new PrismaClient();

dotenv.config;

export async function confirmPayment(req, res) {
  const tokenId = parseInt(req.params.id);
  console.log("faith", tokenId);

  if (!tokenId) {
    return res.status(400).json({ message: "Token ID is required" });
  }

  try {
    await authenticateUser(req, res);

    const nft = await db.nftpost.findUnique({
      where: { id: tokenId },
    });

    if (!nft) {
      return res.status(404).json({ message: "NFT not found" });
    }

    if (nft.isPaid) {
      return res.status(400).json({ message: "Payment already confirmed" });
    }

    const updatedNft = await db.nftpost.update({
      where: { id: tokenId },
      data: { isPaid: true },
    });

    return res.status(200).json(updatedNft);
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
