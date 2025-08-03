const Event = require("../models/Event");

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      category,
      image: imageUrl,
    } = req.body;
    let { ticketTypes } = req.body;

    if (ticketTypes && typeof ticketTypes === "string") {
      try {
        ticketTypes = JSON.parse(ticketTypes);
      } catch (e) {
        return res
          .status(400)
          .json({ message: "Format 'ticketTypes' nije ispravan JSON." });
      }
    }

    let imagePath = "";

    if (req.file) {
      imagePath = `/${req.file.path.replace(/\\/g, "/")}`;
    } else if (imageUrl) {
      imagePath = imageUrl;
    } else {
      return res
        .status(400)
        .json({ message: "Molimo unesite sliku (upload ili URL)." });
    }

    if (!ticketTypes || ticketTypes.length === 0) {
      return res.status(400).json({
        message: "Potrebno je definirati barem jednu vrstu ulaznice.",
      });
    }

    const event = new Event({
      title,
      description,
      date,
      location,
      category,
      image: imagePath,
      ticketTypes: ticketTypes,
      seller: req.user.id,
    });

    const createdEvent = await event.save();

    res.status(201).json(createdEvent);
  } catch (error) {
    console.error("Greška u createEvent:", error);
    res
      .status(400)
      .json({ message: "Greška pri kreiranju događaja", error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate("seller", "name email")
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error("Greška u getEvents:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "seller",
      "name email"
    );

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: "Događaj nije pronađen" });
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Događaj nije pronađen" });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
};
