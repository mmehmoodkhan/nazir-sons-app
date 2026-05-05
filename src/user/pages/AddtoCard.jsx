function AddToCart(product, cart, setCart) {
  const existing = cart.find(item => item._id === product._id);
  let next;
  if (existing) {
    next = cart.map(item =>
      item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
    );
  } else {
    next = [...cart, { ...product, quantity: 1 }];
  }
  setCart(next);
  localStorage.setItem("cart", JSON.stringify(next));
}