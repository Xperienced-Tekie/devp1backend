import nftData from "../nftData.json" assert { type: "json" };

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function getNFTs(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const randomizedData = shuffleArray([...nftData]);  // Shuffle the nftData

    const filteredData = randomizedData.map((asset) => ({
      name: asset.name,
      description: asset.description,
      token_id: asset.token_id,
      address: asset.address,
      image: asset.image,
      video: asset.video,
      date: asset.date,
      blockchain: asset.blockchain,
      price: asset.price * 0.0001,
    }));

    return res.status(200).json(filteredData);
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
