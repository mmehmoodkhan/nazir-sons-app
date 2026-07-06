import "./topNavbar.css";
export default function TopNavbar() {
  const news = [
    "Welcome To Nazir Sons",
    "🛒 Free delivery on orders above Rs 1000",
    "🔥 New arrivals every Monday",
    "⚡ Flash sale this weekend — up to 50% off",
    "📦 Same day delivery available",
  ];
  return (
    <div className="top-navbar">
      <p className="topnav-text">{news.join("   •••   ")}</p>
    </div>
  );
}
