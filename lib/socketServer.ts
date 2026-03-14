import { Server } from "socket.io";
import { createServer } from "http";
import { prisma } from "@/lib/prisma";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join service request room
  socket.on("join_request", (ServiceRequestID) => {
    socket.join(`request_${ServiceRequestID}`);
  });

  // Send message
  socket.on("send_message", async (data) => {
    const { message, ReplyByID, Status, ServiceRequestID } = data;

    const reply = await prisma.serviceRequestReply.create({
      data: {
        Message: message,
        RepliedByID: Number(ReplyByID),
        StatusID: Number(Status),
        ServiceRequestID: Number(ServiceRequestID),
      },
      include: {
        Users: true, // matches schema.prisma
      },
    });

    io.to(`request_${ServiceRequestID}`).emit("receive_message", reply);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

httpServer.listen(4000, () => {
  console.log("WebSocket running on port 4000");
});