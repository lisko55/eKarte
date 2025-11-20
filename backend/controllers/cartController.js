const User = require("../models/User");
const Event = require("../models/Event");

const addToCart = async (req, res) => {
  try {
    const { eventId, ticketTypeId, quantity } = req.body;
    const userId = req.user.id;

    if (!eventId || !ticketTypeId || !quantity || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Nedostaju podaci ili su neispravni." });
    }

    const [user, event] = await Promise.all([
      User.findById(userId),
      Event.findById(eventId),
    ]);

    if (!user)
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    if (!event)
      return res.status(404).json({ message: "Događaj nije pronađen." });

    const ticketType = event.ticketTypes.find(
      (t) => t._id.toString() === ticketTypeId
    );
    if (!ticketType)
      return res
        .status(404)
        .json({ message: "Vrsta ulaznice nije pronađena." });
    if (ticketType.quantity < quantity)
      return res.status(400).json({
        message: `Nema dovoljno dostupnih ulaznica. Dostupno: ${ticketType.quantity}`,
      });

    const existingItem = user.cart.find(
      (item) => item.ticketType && item.ticketType.toString() === ticketTypeId
    );

    if (existingItem) {
      existingItem.quantity = parseInt(quantity);
    } else {
      user.cart.push({
        event: eventId,
        ticketType: ticketTypeId,
        quantity: parseInt(quantity),
      });
    }

    user.markModified("cart");

    await user.save();

    const populatedUser = await User.populate(user, {
      path: "cart.event",
      model: "Event",
    });
    const validCart = populatedUser.cart.filter((item) => item.event !== null);

    res.status(200).json(validCart);
  } catch (error) {
    console.error("--- GREŠKA U addToCart ---", error);
    res
      .status(500)
      .json({ message: "Greška na serveru", error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Korisnik nije pronađen" });

    const populatedUser = await User.populate(user, {
      path: "cart.event",
      model: "Event",
    });

    const validCart = populatedUser.cart.filter((item) => item.event !== null);

    res.json(validCart);
  } catch (error) {
    console.error("Greška u getCart:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

const removeFromCart = async (req, res) => {
  const { ticketTypeId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Korisnik nije pronađen" });

    user.cart = user.cart.filter(
      (item) => item.ticketType && item.ticketType.toString() !== ticketTypeId
    );

    user.markModified("cart");
    await user.save();

    res.status(200).json(user.cart);
  } catch (error) {
    console.error("Greška u removeFromCart:", error);
    res
      .status(500)
      .json({ message: "Greška na serveru", error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user.id }, { $set: { cart: [] } });
    res.status(200).json({ message: "Košarica ispražnjena." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Greška na serveru", error: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
};
