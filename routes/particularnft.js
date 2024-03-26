import nftData from "../nftData.json" assert { type: "json" };


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
