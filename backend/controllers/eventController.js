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
      organizer: req.body,
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
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? { title: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const category = req.query.category ? { category: req.query.category } : {};

    const query = { ...keyword, ...category };

    const count = await Event.countDocuments(query);
    const events = await Event.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ date: 1 });

    res.json({ events, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru" });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
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

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = req.body.title || event.title;
      event.description = req.body.description || event.description;
      event.date = req.body.date || event.date;
      event.location = req.body.location || event.location;
      event.category = req.body.category || event.category;
      event.organizer = req.body.organizer || event.organizer;

      if (req.body.ticketTypes && typeof req.body.ticketTypes === "string") {
        event.ticketTypes = JSON.parse(req.body.ticketTypes);
      }

      if (req.file) {
        event.image = `/${req.file.path.replace(/\\/g, "/")}`;
      } else if (req.body.image) {
        event.image = req.body.image;
      }

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: "Događaj nije pronađen" });
    }
  } catch (error) {
    console.error("--- GREŠKA U updateEvent ---", error);
    res.status(400).json({
      message: "Greška pri ažuriranju događaja",
      error: error.message,
    });
  }
};
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await Event.deleteOne({ _id: event._id });
      res.json({ message: "Događaj uspješno obrisan" });
    } else {
      res.status(404).json({ message: "Događaj nije pronađen" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Greška na serveru", error: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
