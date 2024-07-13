const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/getmsg", messageController.getMessages);
router.post("/addmsg", messageController.addMessage);

module.exports = router;
