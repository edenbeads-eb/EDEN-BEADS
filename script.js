/* script.js — cart + whatsapp checkout */

/* WHATSAPP: owner number in international format without + (Pakistan example) */
const WHATSAPP_NUMBER = "923248037329"; // <--- your number

/* Optional: You can change these links to a page showing your QR code if you prefer */
const PAYMENT_LINKS = {
  easypaisa: "https://easypaisa.com.pk/sendmoney",
  jazzcash: "https://www.jazzcash.com.pk/",
  bank: ""  // optional: add a page with bank details or QR
};

/* cart storage (items are {name, price, qty}) */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* save to localStorage */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadges();
}

/* add to cart (from index) */
function addToCart(name, price) {
  const found = cart.find(i => i.name === name && i.price === price);
  if (found) found.qty++;
  else cart.push({ name, price, qty: 1 });
  saveCart();
  alert(`${name} added to cart`);
}

/* update cart count badges */
function updateCartBadges() {
  const count = cart.reduce((s,i) => s + i.qty, 0);
  document.querySelectorAll("#cart-count, #cart-count-2, .cart-count").forEach(el => {
    if (el) el.textContent = count;
  });
}

/* CART PAGE: render items */
function renderCartPage() {
  const list = document.getElementById("cart-items");
  const totalSpan = document.getElementById("cart-total");
  if (!list) return;
  list.innerHTML = "";
  if (cart.length === 0) {
    list.innerHTML = "<li style='color:#6b4b57;padding:8px'>Your cart is empty — add something cute ✨</li>";
    totalSpan.textContent = 0;
    return;
  }
  let total = 0;
  cart.forEach((it, idx) => {
    total += it.price * it.qty;
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <div style="font-weight:700">${it.name}</div>
        <div style="font-size:0.9rem;color:#6b4b57">Rs.${it.price} × ${it.qty}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">Rs.${it.price * it.qty}</div>
        <div style="margin-top:6px">
          <button onclick="decreaseQty(${idx})" class="btn ghost">−</button>
          <button onclick="increaseQty(${idx})" class="btn ghost">+</button>
          <button onclick="removeItem(${idx})" style="background:transparent;border:none;color:#e05a7b;cursor:pointer">Remove</button>
        </div>
      </div>
    `;
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.padding = "8px";
    li.style.marginBottom = "8px";
    li.style.background = "#fff8fb";
    li.style.borderRadius = "10px";
    list.appendChild(li);
  });
  totalSpan.textContent = total;
}

/* qty control & remove */
function increaseQty(i){ cart[i].qty++; saveCart(); renderCartPage(); }
function decreaseQty(i){ if (cart[i].qty>1) cart[i].qty--; else removeItem(i); saveCart(); renderCartPage(); }
function removeItem(i){ cart.splice(i,1); saveCart(); renderCartPage(); }

/* clear cart */
function clearCart(){ if (!confirm("Clear all items from cart?")) return; cart = []; saveCart(); renderCartPage(); }

/* handle payment selection - show quick open link */
function handlePaymentChange() {
  const sel = document.getElementById("cx-payment");
  const instr = document.getElementById("payment-instructions");
  if (!sel || !instr) return;
  const val = sel.value;
  if (val === "easypaisa" || val === "jazzcash") {
    const link = PAYMENT_LINKS[val] || "#";
    instr.innerHTML = `
      <div style="font-weight:600;margin-bottom:8px;color:#6b4b57">
        You can open the payment page/app to pay now, then attach screenshot in WhatsApp.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <a class="btn ghost" href="${link}" target="_blank">Open Payment</a>
        <div style="align-self:center;color:#6b4b57">After payment, attach screenshot in WhatsApp before sending.</div>
      </div>
    `;
  } else if (val === "bank") {
    instr.innerHTML = `<div style="color:#6b4b57">Please transfer to our bank account (add details here) and attach screenshot in WhatsApp.</div>`;
  } else if (val === "cod") {
    instr.innerHTML = `<div style="color:#6b4b57">Cash on delivery selected — no online payment required.</div>`;
  } else instr.innerHTML = `<div class="hint">Select a payment method to see quick actions.</div>`;
}

/* Build WhatsApp message and open chat */
function placeOrderOnWhatsApp(e) {
  e.preventDefault();
  if (cart.length === 0) { alert("Your cart is empty."); return; }

  const name = document.getElementById("cx-name").value.trim();
  const phone = document.getElementById("cx-phone").value.trim();
  const address = document.getElementById("cx-address").value.trim();
  const payment = document.getElementById("cx-payment").value;
  const screenshot = document.getElementById("cx-screenshot").files[0];

  if (!name || !phone || !address || !payment) {
    alert("Please complete name, phone, address and payment method.");
    return;
  }

  // Build items list
  const itemsText = cart.map(i => `- ${i.name} × ${i.qty} — Rs.${i.price * i.qty}`).join("%0A");
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);

  // Message template
  const message = `Hi! I placed an order.%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AAddress: ${encodeURIComponent(address)}%0A%0AItems:%0A${itemsText}%0A%0ATotal: Rs.${total}%0A%0APayment method: ${encodeURIComponent(payment)}%0A%0APlease find my payment screenshot attached (if paid).`;

  // WhatsApp web/mobile URL
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  // NOTE: Browsers cannot auto-attach files to WhatsApp for security reasons.
  // We open WhatsApp chat with the message. Ask the customer to attach screenshot manually and send.
  // To help, if a screenshot file was chosen we also open it in a new tab so they can save/attach quickly.
  window.open(waUrl, "_blank");

  if (screenshot) {
    // open image preview in new tab so user can easily download/attach
    const fileURL = URL.createObjectURL(screenshot);
    window.open(fileURL, "_blank");
  }

  // Optional: show receipt on the page and clear cart
  showReceiptAndClear(name, phone, address, payment);
}

/* show receipt locally after order placed */
function showReceiptAndClear(name, phone, address, payment) {
  const receipt = document.getElementById("receipt");
  if (!receipt) return;
  const total = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  const itemsHtml = cart.map(i => `<li>${i.name} × ${i.qty} — Rs.${i.price * i.qty}</li>`).join("");
  receipt.classList.remove("hidden");
  receipt.innerHTML = `
    <h3 style="margin-top:0;color:#6b4b57">Order sent to WhatsApp</h3>
    <p><strong>${escapeHtml(name)}</strong> · ${escapeHtml(phone)}</p>
    <p>${escapeHtml(address)}</p>
    <p><strong>Payment:</strong> ${escapeHtml(payment)}</p>
    <h4 style="margin-bottom:6px;color:#6b4b57">Items</h4>
    <ul style="padding-left:18px">${itemsHtml}</ul>
    <p style="font-weight:700">Total: Rs.${total}</p>
    <p style="color:#6b4b57">Please attach your payment screenshot in WhatsApp if you paid online. We'll confirm and arrange delivery.</p>
    <div style="margin-top:10px"><button class="btn" onclick="closeReceipt()">Close</button></div>
  `;
  // clear cart
  cart = []; saveCart(); renderCartPage();
}

/* helper to close receipt */
function closeReceipt(){
  const r = document.getElementById("receipt"); if (r) r.classList.add("hidden");
}

/* escape small bits for receipt display (not for building WA message) */
function escapeHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

/* init on load */
window.addEventListener("load", function(){
  updateCartBadges();
  if (document.getElementById("cart-items")) {
    renderCartPage();
    // bind payment select handler
    const sel = document.getElementById("cx-payment");
    if (sel) sel.addEventListener("change", handlePaymentChange);
    // bind form submit
    const form = document.getElementById("checkout-form");
    if (form) form.addEventListener("submit", placeOrderOnWhatsApp);
  }
});
