export const getImageUrl = (image) => {
  if (!image) {
    return "/images/cart-icon.png";
  }

  // Base64 image
  if (
    typeof image === "string" &&
    image.startsWith("data:image")
  ) {
    return image;
  }

  // Full URL
  if (
    typeof image === "string" &&
    image.startsWith("http")
  ) {
    return image;
  }

  // Backend uploaded image. Vite proxies this path in development, while a
  // production reverse proxy can serve it from the same origin.
  return `/${image.replace(/^\/+/, "")}`;
};
