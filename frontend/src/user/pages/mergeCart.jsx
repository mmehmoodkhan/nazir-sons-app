async function mergeCartWithServer(userId, localCart) {
  // In production: await fetch("/api/cart/merge", { method:"POST", ... })
  console.log("Merging cart for user:", userId, localCart);
  localStorage.removeItem("cart");
}