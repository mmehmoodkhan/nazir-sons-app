import { useState, useEffect, useRef } from "react";
import "../components/HeroSlider.css";

// Use Vite base URL so images placed in `public/images` resolve correctly
const BASE = import.meta.env.BASE_URL || "/";

const SLIDES = [
  {
    id: 1,
    image: `${BASE}images/banner1.jpeg`,
    title: "Fresh Groceries",
    subtitle: "Delivered to your door in 30 minutes",
    btn: "Shop Now",
    link: "/",
  },
  {
    id: 2,
    image: `${BASE}images/banner2.jpeg`,
    title: "Daily Essentials",
    subtitle: "Best prices on everyday items",
    btn: "Explore",
    link: "/",
  },
  {
    id: 3,
    image: `${BASE}images/banner3.jpeg`,
    title: "Special Offers",
    subtitle: "Up to 30% off on selected products",
    btn: "View Deals",
    link: "/",
  },
];

// ── Hero Slider component
export const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const goTo = (index) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 600);
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  // auto-play every 4 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, []); // ← empty deps, runs once

  return (
    <div className="hero_slider">
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={`hero_slide ${i === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero_overlay" />
          <div className="hero_content">
            <h1 className="hero_title">{slide.title}</h1>
            <p className="hero_subtitle">{slide.subtitle}</p>
            <a href={slide.link} className="hero_btn">
              {slide.btn}
            </a>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      <button className="hero_arrow hero_arrow_left" onClick={prev}>
        &#8592;
      </button>
      <button className="hero_arrow hero_arrow_right" onClick={next}>
        &#8594;
      </button>

      {/* Dot indicators */}
      <div className="hero_dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero_dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
};
