const socket = io({
  transports: ["websocket", "polling"],
  path: "/socket.io",
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("Connected to server");

  // Join admin room if on admin page
  if (window.location.pathname.includes("/admin")) {
    socket.emit("join-admin");
  }

  // Join order room if on order page
  const orderId = window.location.pathname.split("/").pop();
  if (orderId && !isNaN(orderId)) {
    socket.emit("join-order", orderId);
  }
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("orderPlaced", (data) => {
  // Handle new order notification
  if (window.location.pathname.includes("/admin")) {
    // Show notification
    showNotification("New Order", `Order #${data._id} has been placed`);
  }
});

socket.on("orderUpdated", (data) => {
  // Handle order update
  if (window.location.pathname.includes(`/order/${data.id}`)) {
    // Update order status
    updateOrderStatus(data);
  }
});

function showNotification(title, message) {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, {
          body: message,
          icon: "/images/pizza-icon.png",
        });
      }
    });
  }
}

function updateOrderStatus(data) {
  const statusElement = document.querySelector(".order-status");
  if (statusElement) {
    statusElement.textContent = data.status;
    statusElement.className = `order-status status-${data.status.toLowerCase()}`;
  }
}
