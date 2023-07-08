socket = io();

// Add the "createRoom" event listener when the socket connects
socket.on("connect", () => {
  console.log("Socket connected");

  // Remove any existing "createRoom" event listeners
  socket.off("createRoom");

  // Add the "createRoom" event listener
  socket.on("createRoom", (roomName) => {
    console.log(`Room created: ${roomName}`);
  });
});

// Function to create a new room
function createRoom(roomName) {
  // Emit a "createRoom" signal to the server
  socket.emit("createRoom", roomName);
}

// Example usage
createRoom("myRoom");