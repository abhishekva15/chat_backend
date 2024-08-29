const express = require("express");
const router = express.Router();

const {conversationUser, conversationGetUser} = require('../controller/conversationController');

router.post('/conversation', conversationUser);
router.get("/conversation/:userId",conversationGetUser);

module.exports = router;