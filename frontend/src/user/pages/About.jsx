import "./About.css";
import { Link } from "react-router-dom";
import Header from "../components/header";
import { Footer } from "../components/Footer";

const About = () => {
  return (
    <>
      <Header />
      <div className="about_page">
      <section className="about_hero">
        <div className="about_hero_inner">
          <h1>About Nazir son's Cash & Carry</h1>
          <p>
            Nazir son's Cash & Carry Lahore is your trusted grocery and daily
            essentials store in eden palace villas Raiwind road lahore. We provide fresh products, affordable prices, and fast
            delivery in selected Lahore/eden palace areas.
          </p>
        </div>
      </section>

      <section className="about_content">
            <div className="about_two_col">
              <div className="about_who">
                <h2>Who We Are</h2>
                <p>
                  Nazir son's Cash & Carry Lahore is built to make everyday shopping
                  easier for families, students, offices, and households in
                  Lahore. Our goal is to provide quality groceries, fresh fruits
                  and vegetables, household items, personal care products, dairy,
                  beverages, and daily-use essentials at competitive prices.
                </p>
                <p>
                  We focus on reliable service, updated product availability, Cash
                  on Delivery, and fast local delivery. Our team works to confirm
                  orders quickly and deliver fresh products with care.
                </p>
              </div>

              <div className="about_cards">
                <div className="info_card">
                  <div className="card_icon">
                    <img src="/images/cart-icon.png" alt="Local Grocery" className="card_icon_img" />
                  </div>
                  <h3>Local Grocery Store</h3>
                  <p>
                    Located on Eden Palace Villas Raiwind Road,
                    Lahore.
                  </p>
                </div>

                <div className="info_card">
                  <div className="card_icon">
                    <img src="/images/fast-delivery.png" alt="Fast Delivery" className="card_icon_img" />
                  </div>
                  <h3>Fast Delivery</h3>
                  <p>Serving selected Lahore and eden palace nearby areas with quick delivery.</p>
                </div>
              </div>
            </div>
          </section>

      {/* Four feature cards */}
      <section className="features_section">
        <div className="features_inner">
          <div className="features_grid">
            <div className="feature_card">
              <div className="feature_icon"><img src="/images/best-quality.png" alt="Best Quality" className="feature_icon_img"/></div>
              <h4>Best Quality</h4>
              <p>We focus on fresh, reliable, and daily-use products.</p>
            </div>

            <div className="feature_card">
              <div className="feature_icon"><img src="/images/low-price.png" alt="Lowest Prices" className="feature_icon_img"/></div>
              <h4>Lowest Prices</h4>
              <p>Competitive pricing for grocery and household essentials.</p>
            </div>

            <div className="feature_card">
              <div className="feature_icon"><img src="/images/safe-payment.png" alt="Safe Payment" className="feature_icon_img"/></div>
              <h4>Safe Payment</h4>
              <p>Secure checkout and trusted payment options.</p>
            </div>

            <div className="feature_card">
              <div className="feature_icon"><img src="/images/customer-support.png" alt="Customer Support" className="feature_icon_img"/></div>
              <h4>Customer Support</h4>
              <p>Friendly support to help with orders and inquiries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Why Choose Us */}
      <section className="mission_section">
        <div className="mission_inner">
          <div className="mission_col">
            <h3>Our Mission</h3>
            <p>
              Our mission is to make quality groceries and daily essentials
              accessible and affordable to local communities by offering
              fresh products, reliable service, and fast delivery.
            </p>
          </div>

          <div className="mission_col">
            <h3>Why Choose Us?</h3>
            <ul>
              <li>Fresh and reliable product selection</li>
              <li>Competitive pricing and regular offers</li>
              <li>Cash on Delivery and secure payments</li>
              <li>Fast local delivery and responsive support</li>
            </ul>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
};

export default About;
