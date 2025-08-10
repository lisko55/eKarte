const User = require("../models/User");
const Event = require("../models/Event");
const Order = require("../models/Order");

const getStats = async (req, res) => {
  try {
    const [
      userCount,
      eventCount,
      orderCount,
      totalSalesData,
      recentUsers,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments({}),
      Event.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),

      User.find({}).sort({ createdAt: -1 }).limit(5).select("name createdAt"),

      Order.find({}).sort({ createdAt: -1 }).limit(5).populate("user", "name"),
    ]);

    const totalSales = totalSalesData.length > 0 ? totalSalesData[0].total : 0;

    res.json({
      userCount,
      eventCount,
      orderCount,
      totalSales,
      recentUsers,
      recentOrders,
    });
  } catch (error) {
    console.error("Greška pri dohvaćanju statistike:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

module.exports = { getStats };
