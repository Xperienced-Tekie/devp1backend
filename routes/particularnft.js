import nftData from "../nftData.json" assert { type: "json" };

/**
 * @swagger
 * /nft/{tokenid}:
 *   get:
 *     tags:
 *       - NFT
 *     description: Get an NFT based on token ID
 *     parameters:
 *       - in: path
 *         name: tokenid
 *         required: true
 *         description: ID of the NFT token to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the NFT data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 *                 description:
 *                   type: string
 *                 blockchain:
 *                   type: string
 *       400:
 *         description: Bad request - Token ID is required
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal Server Error
 */
export async function getNFT(req, res) {
  const tokenId = req.params.tokenid;

  if (!tokenId) {
    return res.status(400).json({ message: "Token ID is required" });
  }

  try {
    const nftData1 = nftData.find((nft) => nft.token_id === tokenId);

    if (!nftData1) {
      return res.status(404).json({ message: "NFT not found" });
    }

    return res.status(200).json(nftData1);
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
