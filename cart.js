// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");

// Display items in cart
function displayCart() {
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.innerHTML = `${item.name} - Rs. ${item.price} 
      <button onclick="removeItem(${index})">❌</button>`;
    cartList.appendChild(li);
  });

  cartTotal.innerText = total;
}
displayCart();

// Remove item from cart
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

// Clear cart
function clearCart() {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

// Checkout form submission
document.getElementById("checkout-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const paymentMethod = document.getElementById("payment-method").value;
  const paymentSS = document.getElementById("payment-ss").value;

  // Cart summary
  let orderDetails = cart.map(item => `${item.name} - Rs.${item.price}`).join(", ");
  let total = document.getElementById("cart-total").innerText;

  // WhatsApp message
  let message = `🛍️ New Order!\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n🏠 Address: ${address}\n\n🛒 Items: ${orderDetails}\n💰 Total: Rs.${total}\n\n💳 Payment: ${paymentMethod}\n📷 Screenshot: ${paymentSS || "N/A"}`;

  // Redirect to WhatsApp
  let whatsappURL = `https://wa.me/923248037329?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, "_blank");

  // Clear cart after order
  clearCart();
});
