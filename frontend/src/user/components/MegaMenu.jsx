const menuData = [
  {
    title: "Electronics",
    sub: ["Mobiles", "Laptops", "Headphones"],
  },
  {
    title: "Clothing",
    sub: ["Men", "Women", "Kids"],
  },
];
import { useState } from "react";

function MegaMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ position: "relative" }}
    >
      <button>Categories</button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: 0,
            background: "#fff",
            display: "flex",
            gap: "40px",
            padding: "20px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
          }}
        >
          {menuData.map((item) => (
            <div key={item.title}>
              <h4>{item.title}</h4>

              {item.sub.map((subItem) => (
                <p key={subItem}>{subItem}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MegaMenu;
