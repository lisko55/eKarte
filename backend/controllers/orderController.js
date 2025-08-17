const Order = require("../models/Order");
const User = require("../models/User");
const Event = require("../models/Event");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const sendEmail = require("../utils/sendEmail");
const { generateTicketPDF } = require("../utils/ticketGenerator");

const createPaymentIntent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "cart.event",
      model: "Event",
    });

    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: "Košarica je prazna." });
    }

    let totalAmount = 0;
    for (const item of user.cart) {
      if (
        item &&
        item.event &&
        Array.isArray(item.event.ticketTypes) &&
        item.ticketType
      ) {
        const ticketType = item.event.ticketTypes.find((t) =>
          t._id.equals(item.ticketType)
        );
        if (ticketType && ticketType.price) {
          totalAmount += ticketType.price * item.quantity;
        }
      }
    }

    if (totalAmount === 0) {
      return res
        .status(400)
        .json({ message: "Nije moguće procesuirati narudžbu s iznosom 0." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "bam",
      automatic_payment_methods: { enabled: true },
      metadata: { userId: req.user.id.toString() },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe greška:", error);
    res
      .status(500)
      .json({ message: "Greška pri kreiranju plaćanja", error: error.message });
  }
};

const addOrderItems = async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId)
      return res.status(400).json({ message: "Nedostaje ID plaćanja." });

    const existingOrder = await Order.findOne({
      "paymentResult.id": paymentId,
    });
    if (existingOrder) return res.status(200).json(existingOrder);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    const userId = paymentIntent.metadata.userId;

    const user = await User.findById(userId).populate({
      path: "cart.event",
      model: "Event",
    });

    if (!user || user.cart.length === 0) {
      return res
        .status(400)
        .json({ message: "Košarica je prazna ili korisnik nije pronađen." });
    }

    const orderItems = user.cart
      .map((item) => {
        if (!item.event || !item.event.ticketTypes) return null;
        const ticketType = item.event.ticketTypes.find((t) =>
          t._id.equals(item.ticketType)
        );
        if (!ticketType) return null;

        return {
          name: `${ticketType.name} - ${item.event.title}`,
          quantity: item.quantity,
          price: ticketType.price,
          image: item.event.image,
          event: item.event._id,
          ticketType: item.ticketType,
        };
      })
      .filter((item) => item !== null);

    if (orderItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Nema validnih stavki u košarici za narudžbu." });
    }

    const totalPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const order = new Order({
      user: userId,
      orderItems,
      totalPrice,
      isPaid: true,
      paidAt: Date.now(),
      paymentResult: { id: paymentId, status: "succeeded" },
    });
    const createdOrder = await order.save();

    for (const item of order.orderItems) {
      await Event.updateOne(
        { _id: item.event, "ticketTypes._id": item.ticketType },
        { $inc: { "ticketTypes.$.quantity": -item.quantity } }
      );
    }
    await User.updateOne({ _id: userId }, { $set: { cart: [] } });

    try {
      const attachments = [];
      for (const item of createdOrder.orderItems) {
        for (let i = 0; i < item.quantity; i++) {
          const ticketPDF = await generateTicketPDF(item, createdOrder);
          attachments.push({
            filename: `ulaznica-${item.name.replace(/\s/g, "_")}-${i + 1}.pdf`,
            content: ticketPDF,
            contentType: "application/pdf",
          });
        }
      }

      await sendEmail({
        email: user.email,
        subject: `Vaše ulaznice za: ${createdOrder.orderItems[0].name}`,
        message: `<h1>Hvala na kupovini!</h1><p>U privitku se nalaze vaše ulaznice. Pokažite QR kod na ulazu.</p>`,
        attachments: attachments,
      });

      console.log(
        `Email s ${attachments.length} ulaznicom/a poslan na ${user.email}`
      );
    } catch (emailError) {
      console.error(
        "GREŠKA PRI SLANJU EMAILA (narudžba je uspješna):",
        emailError
      );
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("--- GREŠKA PRI KREIRANJU NARUDŽBE ---", error);
    res
      .status(500)
      .json({ message: "Greška na serveru", error: error.message });
  }
};
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error("Greška pri dohvaćanju narudžbi:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const filter = {};

    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    if (req.query.eventId) {
      filter["orderItems.event"] = req.query.eventId;
    }

    if (req.query.startDate) {
      filter.createdAt = {
        ...filter.createdAt,
        $gte: new Date(req.query.startDate),
      };
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter.createdAt = { ...filter.createdAt, $lte: endDate };
    }

    const count = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("user", "id name")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    console.error("Greška pri dohvaćanju svih narudžbi:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      if (
        order.user._id.toString() !== req.user.id &&
        req.user.role !== "admin" &&
        req.user.role !== "superadmin"
      ) {
        return res
          .status(401)
          .json({ message: "Niste autorizirani za pregled ove narudžbe" });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: "Narudžba nije pronađena" });
    }
  } catch (error) {
    console.error("Greška pri dohvaćanju narudžbe po ID-u:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

module.exports = {
  createPaymentIntent,
  addOrderItems,
  getMyOrders,
  getAllOrders,
  getOrderById,
};
