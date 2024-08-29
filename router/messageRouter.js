const express = require("express");
const router = express.Router();

const{messageSent, messageGet} = require('../controller/messageController')

router.post("/message", messageSent);
router.get("/message/:conversationId", messageGet);

module.exports = router;