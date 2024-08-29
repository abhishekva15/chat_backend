const Messages = require("../models/Messages");
const Conversations = require("../models/Conversations");
const Users = require("../models/User");

exports.messageSent = async (req, res) => {
  try {
    const { conversationId, senderId, message, receiverId = "" } = req.body;
    console.log(conversationId, senderId, message, receiverId);

    if (!senderId || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide senderId, and message.",
      });
    }

    if (conversationId === "new" && receiverId) {
      const newConversation = new Conversations({
        members: [senderId, receiverId],
      });
      await newConversation.save();
      const newMessage = new Messages({
        conversationId: newConversation._id,
        senderId,
        message,
      });
      await newMessage.save();
      return res.status(200).send("Message sent successfully");
    } else if (!conversationId && !receiverId) {
      return res.status(400).send("Fill all required details");
    }

    const newMessage = new Messages({ conversationId, senderId, message });

    await newMessage.save();

    res.status(200).json({
      success: true,
      data: newMessage,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      data: null,
      message: "Message bhejane me error",
    });
  }

  // try {
  //   const { conversationId, senderId, message } = req.body;
  //   const newMessage = new Messages({ conversationId, senderId, message });
  //   await newMessage.save();
  //   res.status(200).send("Message Sent Successfully");
  // } catch (error) {
  //   console.log(error)
  // }
};

// exports.messageGet = async(req,res) =>{
//     try {
//         const conversationId = req.params.conversationId;
//         const messages = await Messages.find({conversationId});
//         const messageUserData = Promise.all(messages.map(async(message) =>{
//             const user = await Users.find(message.senderId);
//             return {user:{email:user.email, fullname:user.fullname},message:message.message}
//         }))
//         res.status(200).json({
//           success: true,
//           data: messageUserData,
//           message: "Message sent successfully",
//         });
//     } catch (error) {
//         console.error(error.message);

//         // Respond with a server error
//         res.status(500).json({
//           success: false,
//           data: null,
//           message: "Message bhejane me error",
//         });
//     }
// }

// exports.messageGet = async (req, res) => {
//   try {

//     const conversationId = req.params.conversationId;

//     if(conversationId === 'new'){
//       const checkConversation = await Conversations.find({members:{$all:[req.body.senderId, req.body.receiverId]}});
//       if(checkConversation.length>0) return res.status(200).json({ conversationId: checkConversation[0]._id });
//       return res.status(200).json([])
//     }

//     const messages = await Messages.find({ conversationId });

//     const messageUserData = await Promise.all(
//       messages.map(async (message) => {
//         const user = await Users.findById(message.senderId);

//         return {
//           user: {id:user._id, email: user.email, fullname: user.fullname },
//           message: message.message,
//         };
//       })
//     );

//     res.status(200).json(

//       await messageUserData,

//     );
//   } catch (error) {
//     console.error(error.message);

//     res.status(500).json({
//       success: false,
//       data: null,
//       message: "Messages fetch karne me error",
//     });
//   }
// };


//old-->
// exports.messageGet = async (req, res) => {
//   try {
//     const checkMessage = async (conversationId) => {
//       const messages = await Messages.find({ conversationId });

//       const messageUserData = await Promise.all(
//         messages.map(async (message) => {
//           const user = await Users.findById(message.senderId);

//           return {
//             user: { id: user._id, email: user.email, fullname: user.fullname },
//             message: message.message,
//           };
//         })
//       );
//       res.status(200).json(await messageUserData);
//     };
//     const conversationId = req.params.conversationId;

//     if (conversationId === "new") {
//       const checkConversation = await Conversations.find({
//         members: { $all: [req.query.senderId, req.query.receiverId] },
//       });
//       if (checkConversation.length > 0) {
//         checkMessage(checkConversation[0]._id);
//       } else {
//         return res.status(200).json([]);
//       }
//     }else{
//       checkMessage(conversationId)
//     }
//   } catch (error) {
//     console.error(error.message);

//     res.status(500).json({
//       success: false,
//       data: null,
//       message: "Messages fetch karne me error",
//     });
//   }
// };

exports.messageGet = async (req, res) => {
  try {
    const checkMessage = async (conversationId) => {
      const messages = await Messages.find({ conversationId }).sort({
        createdAt: 1,
      });

      // Fetch user data for each message
      const messageUserData = await Promise.all(
        messages.map(async (message) => {
          const user = await Users.findById(message.senderId);
          if (!user) return null;

          return {
            user: { id: user._id, email: user.email, fullname: user.fullname },
            message: message.message,
          };
        })
      );

      // Remove any null entries if a user was not found
      const filteredData = messageUserData.filter((data) => data !== null);

      res.status(200).json(filteredData);
    };

    const conversationId = req.params.conversationId;

    if (conversationId === "new") {
      const checkConversation = await Conversations.find({
        members: { $all: [req.query.senderId, req.query.receiverId] },
      });
      if (checkConversation.length > 0) {
        checkMessage(checkConversation[0]._id);
      } else {
        res.status(200).json([]); // Return an empty array if no conversation found
      }
    } else {
      checkMessage(conversationId);
    }
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      data: null,
      message: "Error fetching messages",
    });
  }
};

