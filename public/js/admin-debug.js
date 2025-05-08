// Admin debug script
document.addEventListener("DOMContentLoaded", function() {
  console.log("Admin debug script loaded");

  // Get the admin panel table
  const orderTableBody = document.getElementById("orderTableBody");
  if (!orderTableBody) {
    console.error("Order table body not found!");
    return;
  }

  console.log("Order table body found, fetching orders...");

  // Load orders via AJAX
  fetch("/admin/orders", {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then((response) => response.json())
    .then((orders) => {
      console.log("Orders loaded:", orders.length);

      if (!orders.length) {
        orderTableBody.innerHTML =
          '<tr><td colspan="6" class="text-center py-4">No orders found</td></tr>';
        return;
      }

      // Generate table markup
      const markup = orders
        .map((order) => {
          return `
                <tr>
                <td class="border px-4 py-2 text-green-900">
                    <p>${order._id}</p>
                    <div>${renderItems(order.items)}</div>
                </td>
                <td class="border px-4 py-2">${
                  order.customerId ? order.customerId.name : "Unknown"
                }</td>
                <td class="border px-4 py-2">${order.address || "N/A"}</td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form action="/admin/order/status" method="POST">
                            <input type="hidden" name="orderId" value="${
                              order._id
                            }">
                            <select name="status" onchange="this.form.submit()"
                                class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                <option value="order_placed"
                                    ${
                                      order.status === "order_placed"
                                        ? "selected"
                                        : ""
                                    }>
                                    Placed</option>
                                <option value="confirmed" ${
                                  order.status === "confirmed" ? "selected" : ""
                                }>
                                    Confirmed</option>
                                <option value="prepared" ${
                                  order.status === "prepared" ? "selected" : ""
                                }>
                                    Prepared</option>
                                <option value="delivered" ${
                                  order.status === "delivered" ? "selected" : ""
                                }>
                                    Delivered
                                </option>
                                <option value="completed" ${
                                  order.status === "completed" ? "selected" : ""
                                }>
                                    Completed
                                </option>
                            </select>
                        </form>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20">
                                <path
                                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </td>
                <td class="border px-4 py-2">
                    ${formatDate(order.createdAt)}
                </td>
                <td class="border px-4 py-2">
                    ${order.paymentStatus ? "paid" : "Not paid"}
                </td>
            </tr>
            `;
        })
        .join("");

      orderTableBody.innerHTML = markup;
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
      orderTableBody.innerHTML =
        '<tr><td colspan="6" class="text-center py-4 text-red-500">Error loading orders</td></tr>';
    });

  // Helper functions
  function renderItems(items) {
    if (!items) return "No items";
    let parsedItems = Object.values(items);
    return parsedItems
      .map((menuItem) => {
        return `<p>${menuItem.item.name} - ${menuItem.qty} pcs</p>`;
      })
      .join("");
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  // Listen for socket events
  const socket = io();
  socket.emit("join", "adminRoom");
  console.log("Joined admin room for order notifications");

  socket.on("orderPlaced", function(order) {
    console.log("New order received:", order._id);

    // Show notification
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg";
    notification.textContent = "New order received!";
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
      // Reload the page to show the new order
      window.location.reload();
    }, 3000);
  });
});
