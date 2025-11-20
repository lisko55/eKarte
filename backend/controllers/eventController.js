const Event = require("../models/Event");
const Order = require("../models/Order");
const mongoose = require("mongoose");

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
      ticketTypes = JSON.parse(ticketTypes);
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
      ticketTypes,
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
    let sortOption = { date: 1 };

    if (req.query.sort) {
      switch (req.query.sort) {
        case "date_desc":
          sortOption = { date: -1 };
          break;
        case "price_asc":
          sortOption = { "ticketTypes.0.price": 1 };
          break;
        case "price_desc":
          sortOption = { "ticketTypes.0.price": -1 };
          break;
        default:
          sortOption = { date: 1 };
      }
    }

    const count = await Event.countDocuments({ ...keyword, ...category });
    const events = await Event.find({ ...keyword, ...category })
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      events,
      page,
      pages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    console.error("Greška u getEvents:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: "Događaj nije pronađen" });
    }
  } catch (error) {
    console.error("Greška u getEventById:", error);
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

const getEventAnalytics = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId).lean();
    if (!event)
      return res.status(404).json({ message: "Događaj nije pronađen" });

    const analyticsData = await Order.aggregate([
      { $match: { "orderItems.event": new mongoose.Types.ObjectId(eventId) } },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.event": new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
          totalTicketsSold: { $sum: "$orderItems.quantity" },
          salesByTicketType: {
            $push: {
              name: "$orderItems.name",
              quantity: "$orderItems.quantity",
            },
          },
        },
      },
    ]);

    let salesByType = {};
    if (analyticsData.length > 0 && analyticsData[0].salesByTicketType) {
      analyticsData[0].salesByTicketType.forEach((item) => {
        const typeName = item.name.split(" - ")[0];
        salesByType[typeName] = (salesByType[typeName] || 0) + item.quantity;
      });
    }

    const finalStats = {
      eventName: event.title,
      totalRevenue:
        analyticsData.length > 0 ? analyticsData[0].totalRevenue : 0,
      totalTicketsSold:
        analyticsData.length > 0 ? analyticsData[0].totalTicketsSold : 0,
      salesByTicketType: Object.entries(salesByType).map(([name, count]) => ({
        name,
        count,
      })),
    };
    res.json(finalStats);
  } catch (error) {
    console.error("Greška pri dohvaćanju analitike događaja:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
};
