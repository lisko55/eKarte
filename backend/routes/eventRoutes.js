const path = require("path");
const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
} = require("../controllers/eventController");

const { protect, authorize } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `event-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Dozvoljene su samo slike (jpg, jpeg, png)!");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router
  .route("/")
  .get(getEvents)
  .post(
    protect,
    authorize("admin", "superadmin"),
    upload.single("image"),
    createEvent
  );

router
  .route("/:id/analytics")
  .get(protect, authorize("admin", "superadmin"), getEventAnalytics);

router
  .route("/:id")
  .get(getEventById)
  .put(
    protect,
    authorize("admin", "superadmin"),
    upload.single("image"),
    updateEvent
  )
  .delete(protect, authorize("admin", "superadmin"), deleteEvent);

module.exports = router;
