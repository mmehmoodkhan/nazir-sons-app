const mergeCart = async (userId) => {
  const localCart = JSON.parse(localStorage.getItem("cart")) || [];

  await fetch("/api/cart/merge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, items: localCart }),
  });

  localStorage.removeItem("cart");
};