const User = require("../models/User");
const Event = require("../models/Event");
const Order = require("../models/Order");

const getStats = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      userCount,
      newUsersThisMonth,
      activeEventCount,
      totalSalesData,
      topSellingEvents,
      monthlySales,
    ] = await Promise.all([
      User.countDocuments({}),

      User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),

      Event.countDocuments({ date: { $gte: today } }),

      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),

      Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.event",
            totalTicketsSold: { $sum: "$orderItems.quantity" },
          },
        },
        { $sort: { totalTicketsSold: -1 } },
        { $limit: 5 },

        {
          $lookup: {
            from: "events",
            localField: "_id",
            foreignField: "_id",
            as: "eventDetails",
          },
        },
        { $unwind: "$eventDetails" },
        { $project: { title: "$eventDetails.title", totalTicketsSold: 1 } },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$totalPrice" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    const totalSales = totalSalesData.length > 0 ? totalSalesData[0].total : 0;

    res.json({
      userCount,
      newUsersThisMonth,
      activeEventCount,
      totalSales,
      topSellingEvents,
      monthlySales,
    });
  } catch (error) {
    console.error("Greška pri dohvaćanju analitike:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

module.exports = { getStats };
