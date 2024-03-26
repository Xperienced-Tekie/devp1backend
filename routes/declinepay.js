import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/auth.js";

const db = new PrismaClient();

dotenv.config;

/**
 * @swagger
 * /decline-payment/{tokenId}:
 *   patch:
 *     tags:
 *       - NFT
 *     security:
 *       - bearerAuth: []
 *     description: decline the payment of an NFT based on token ID
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         description: ID of the NFT token to confirm payment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       400:
 *         description: Bad request - Token ID is required
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal Server Error
 */
export async function declinepay(req, res) {
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

    if (!nft.isPaid) {
      return res.status(400).json({ message: "Payment not declined" });
    }

    const updatedNft = await db.nftpost.update({
      where: { id: tokenId },
      data: { isPaid: false },
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
