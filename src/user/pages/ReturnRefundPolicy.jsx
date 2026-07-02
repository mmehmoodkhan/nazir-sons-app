import "./ReturnRefundPolicy.css";
import Header from "../components/header";
import { Footer } from "../components/Footer";

const ReturnRefundPolicy = () => {
  return (
    <>
      <Header />
      <main className="refund_page">
        <section className="refund_hero">
          <div className="refund_hero_inner">
            <h1>Return & Refund Policy</h1>
            <p>
              Customer satisfaction matters to us. Please read our return and
              refund policy before placing an order.
            </p>
          </div>
        </section>

        <section className="refund_top_cards">
          <div className="refund_cards_inner">
            <article className="refund_card">
              <h3>Contact Support</h3>
              <p>Easy Support</p>
              <p>Contact our team quickly for damaged, wrong, or missing items.</p>
            </article>

            <article className="refund_card">
              <h3>Replacement Review</h3>
              <p>Eligible complaints may be reviewed for replacement or adjustment.</p>
            </article>

            <article className="refund_card">
              <h3>Fresh Product Care</h3>
              <p>Fresh products are checked and handled with care before delivery.</p>
            </article>
          </div>
        </section>

        <section className="refund_rules_section">
          <div className="refund_rules_inner">
            <h2>Return & Refund Rules</h2>
            <div className="refund_rules_grid">
              <div className="refund_rule">
                <h4>Damaged or Wrong Product</h4>
                <p>
                  If you receive a damaged, incorrect, or missing item, please
                  contact our support team as soon as possible.
                </p>
              </div>
              <div className="refund_rule">
                <h4>Fresh Products</h4>
                <p>
                  Fruits, vegetables, meat, dairy, and other fresh items are
                  perishable. Complaints must be reported immediately after
                  delivery.
                </p>
              </div>
              <div className="refund_rule">
                <h4>Proof Required</h4>
                <p>
                  Customers may be asked to share order details, photos, or
                  videos of the issue for verification.
                </p>
              </div>
              <div className="refund_rule">
                <h4>Replacement</h4>
                <p>
                  Eligible products may be replaced depending on stock
                  availability and complaint verification.
                </p>
              </div>
              <div className="refund_rule">
                <h4>Refund/Adjustment</h4>
                <p>
                  If replacement is not available, Nazir son's Cash & Carry Lahore may offer
                  an adjustment, partial refund, or order correction where
                  applicable.
                </p>
              </div>
              <div className="refund_rule">
                <h4>Electronic Items</h4>
                <p>
                  Electronic items are non-returnable and non-replaceable once
                  purchased. Warranty or service claims will be handled by
                  the brand/company policy.
                </p>
              </div>
              <div className="refund_rule">
                <h4>Non-Returnable Items</h4>
                <p>
                  Opened, used, customer-damaged, incorrectly stored items, and
                  electronic items may not be eligible for return or
                  replacement.
                </p>
              </div>
              <div className="refund_rule">
                <h4>Order Cancellation</h4>
                <p>
                  Customers can request cancellation before the order is
                  dispatched.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="refund_help_section">
          <div className="refund_help_inner">
            <div>
              <h2>Need Help?</h2>
              <p>
                For order support, delivery updates, complaints, or product-
                related questions, contact Nazir son's Cash & Carry Lahore.
              </p>
              <div className="refund_help_list">
                <p>
                  <strong>Chat on WhatsApp:</strong> +92 301 3827812
                </p>
                <p>
                  <strong>Phone / WhatsApp:</strong> +92 301 3827812
                </p>
                <p>
                  <strong>Location:</strong> Eden Palace Villas Raiwind Road, Lahore
                </p>
                <p>
                  <strong>Delivery:</strong> Selected Lahore/eden palace nearby areas
                </p>
                <p>
                  <strong>Payment:</strong> Cash on Delivery available
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ReturnRefundPolicy;
