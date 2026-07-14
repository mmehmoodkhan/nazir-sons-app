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

  // Backend uploaded image
  return `http://149.104.79.29/${image}`;
};