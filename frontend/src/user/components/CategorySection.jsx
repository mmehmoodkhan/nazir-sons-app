import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./CategorySection.css";
import { getImageUrl } from "../../utils/imageUrl";
export const CategorySection = ({ products }) => {
  const [searchParams] = useSearchParams();
  const [categoriesData, setCategoriesData] = useState([]);
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategoriesData(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadCategories();
  }, []);
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );
  const { cart, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const categories = [
    {
      _id: "all",
      name: "All",
      image: "images/cart-icon.png"
    },
    ...categoriesData
  ];
  const BASE = import.meta.env.BASE_URL || "/";
  const tabsTrackRef = useRef(null);
  const tabRefs = useRef({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setActiveCategory(cat);
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const updateScrollButtons = () => {
    const track = tabsTrackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft < maxScroll - 4);
  };

  useEffect(() => {
    updateScrollButtons();
    const track = tabsTrackRef.current;
    if (!track) return;
    track.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      track.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [products]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const activeTab = tabRefs.current[activeCategory];
      const track = tabsTrackRef.current;
      if (!activeTab || !track) return;

      const trackRect = track.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const currentOffset = tabRect.left - trackRect.left;
      const targetScrollLeft =
        track.scrollLeft +
        currentOffset -
        trackRect.width / 2 +
        tabRect.width / 2;

      track.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    });

    return () => cancelAnimationFrame(frame);
  }, [activeCategory, products]);

  const scrollByAmount = (amount) => {
    tabsTrackRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  const AUTOPLAY_INTERVAL_MS = 3000;
  const categoriesKey = categories
    .map((c) => c.name)
    .join("|");

  useEffect(() => {
    if (isAutoplayPaused || categories.length <= 1) return;

    const timer = setInterval(() => {
      setActiveCategory((current) => {
        const currentIndex = categories.indexOf(current);
        const nextIndex = (currentIndex + 1) % categories.length;
        return categories[nextIndex];
      });
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isAutoplayPaused, categoriesKey]);

  const pauseAutoplay = () => setIsAutoplayPaused(true);
  const resumeAutoplay = () => setIsAutoplayPaused(false);

  const handlePointerDown = (e) => {
    const track = tabsTrackRef.current;
    if (!track) return;
    pauseAutoplay();
    dragState.current.isDown = true;
    dragState.current.moved = false;
    dragState.current.startX = e.pageX ?? e.touches?.[0]?.pageX ?? 0;
    dragState.current.scrollLeft = track.scrollLeft;
  };

  const handlePointerMove = (e) => {
    if (!dragState.current.isDown) return;
    const track = tabsTrackRef.current;
    if (!track) return;
    const x = e.pageX ?? e.touches?.[0]?.pageX ?? 0;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 5) dragState.current.moved = true;
    track.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const endDrag = () => {
    dragState.current.isDown = false;
    resumeAutoplay();
  };

  const getQty = (productId) => {
    const item = cart.find((i) => i._id === productId);
    return item ? item.quantity : 0;
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) =>
            String(product.category || "").trim().toLowerCase() ===
            String(selectedCategory).trim().toLowerCase(),
        );

  // fallback static names (kept for backwards compatibility)
  const categoryImages = {
    All: "images/cart-icon.png",
    Breakfast: "images/bran-bread.jpg",
    Cooking: "images/dalda.jpg",
    Dairy: "images/asli-milk.jpg",
    Beverages: "images/juices.jpg",
  };

  return (
    <section className="cat_section">
      <div
        className="cat_tabs_slider"
        onMouseEnter={pauseAutoplay}
        onMouseLeave={() => {
          endDrag();
          resumeAutoplay();
        }}
      >
        <button
          type="button"
          className={`cat_tabs_arrow cat_tabs_arrow_left ${!canScrollLeft ? "is-hidden" : ""}`}
          onClick={() => scrollByAmount(-240)}
          aria-label="Scroll categories left"
        >
          ‹
        </button>

        <div
          className="cat_tabs"
          ref={tabsTrackRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={endDrag}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={endDrag}
        >
          {categories.map((category) => (
            <button
              key={category._id || category.name}
              ref={(el) => (tabRefs.current[category.name] = el)}
              onClick={() => {
                setActiveCategory(category.name);
                setSelectedCategory(category.name);
              }}
              className={`cat_tab ${activeCategory === category.name ? "active" : ""
                }`}
            >
              <img
                src={getImageUrl(category.image)}
                alt={category.name}
                className="cat_tab_img"
                draggable={false}
              />
              <span className="cat_tab_overlay"></span>

              <span className="cat_tab_label">
                {category.name}
              </span>

            </button>
          ))}
        </div>

        <button
          type="button"
          className={`cat_tabs_arrow cat_tabs_arrow_right ${!canScrollRight ? "is-hidden" : ""}`}
          onClick={() => scrollByAmount(240)}
          aria-label="Scroll categories right"
        >
          ›
        </button>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p>No products found</p>
        ) : (
          filteredProducts.map((product) => {
            const qty = getQty(product._id);
            return (
              <div
                className="product-card"
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                style={{ cursor: "pointer" }}
              >
                <span className="product-img">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                  />
                </span>
                <div className="product-detail">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price-wrapper">
                    <span className="product-price">Rs {product.price} /-</span>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="product-original-price">
                          Rs {product.originalPrice} /-
                        </span>
                      )}
                  </div>
                  <p
                    className="product-stock"
                    style={{
                      color: product.stock === 0 ? "red" : "inherit",
                      fontWeight: product.stock === 0 ? "bold" : "normal",
                    }}
                  >
                    {product.stock === 0
                      ? "Sold Out"
                      : `Stock: ${product.stock}`}
                  </p>
                  <div
                    className="add_to_card_wrapper"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.stock === 0 ? (
                      <button className="btn_soldout" disabled>
                        Sold Out
                      </button>
                    ) : qty === 0 ? (
                      <button
                        className="btn_add_to"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="qty_controls">
                        <button
                          className="qty_btn"
                          onClick={() => removeFromCart(product._id)}
                        >
                          −
                        </button>
                        <span className="qty_count">{qty}</span>
                        <button
                          className="qty_btn"
                          onClick={() => addToCart(product)}
                          disabled={qty >= product.stock}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
