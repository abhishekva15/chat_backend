const Conversations = require('../models/Conversations')
const Users = require('../models/User')

exports.conversationUser = async(req,res) =>{
    try {
        const {senderId,recevirId} = req.body;
        const newConversation = new Conversations({members:[senderId, recevirId]});
        await newConversation.save();
        res.status(200).json({
          success: true,
          data: newConversation,
          message: "Conversation create successfully",
        });
    } catch (error) {
        console.log(error);
        console.error(error.message);
        res.status(500).json({
          success: false,
          data: null,
          message: "Server error",
        });
    }
}



exports.conversationGetUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "User ID is required",
      });
    }

    const conversations = await Conversations.find({
      members: { $in: [userId] },
    });

    const conversationUserData = await Promise.all(
      conversations.map(async (conversation) => {
        const receiverId = conversation.members.find(
          (member) => member !== userId
        );
        const user = await Users.findById(receiverId);
        return {
          user: {
            receiverId:user._id,
            email: user.email,
            fullname: user.fullname,
          },
          conversationId: conversation._id,
        };
      })
    );

    res.status(200).json(await conversationUserData);
  } catch (error) {
    console.error("Error fetching conversations:", error.message);
    res.status(500).json({
      success: false,
      data: null,
      message: "Server error",
    });
  }
};
