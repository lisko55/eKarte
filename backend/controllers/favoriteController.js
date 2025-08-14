const User = require("../models/User");

const addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.eventId;

    if (!user.favorites.includes(eventId)) {
      user.favorites.push(eventId);
      await user.save();
    }
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru" });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.eventId;

    user.favorites = user.favorites.filter((id) => id.toString() !== eventId);
    await user.save();

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru" });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru" });
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites };
