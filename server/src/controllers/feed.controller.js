import { getDiscoveryFeed } from "../services/connection.service.js";

export const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const developers = await getDiscoveryFeed(userId, page, limit);
    return res.status(200).json({ success: true, count: developers.length, developers });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error fetching feed" });
  }
};
