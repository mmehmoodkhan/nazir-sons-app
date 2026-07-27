import "./Contact.css";
import Header from "../components/header";
import { Footer } from "../components/Footer";
import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState({ sending: false, success: null, error: null });

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ sending: true, success: null, error: null });

    // Simple client-side validation
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setStatus({ sending: false, success: null, error: "Please fill name, phone and message." });
      return;
    }

    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not send message.");

      setStatus({ sending: false, success: data.message || "Message sent.", error: null });
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      setStatus({ sending: false, success: null, error: err.message || "Could not send message. Please try WhatsApp for urgent orders." });
    }
  };

  return (
    <>
      <Header />

      <main className="contact_page">
        <section className="contact_hero">
          <div className="contact_hero_inner">
            <h1>Contact Us</h1>
            <p>
              Have a question about your order, delivery, product prices, or
              stock availability? Contact Nazir son's Cash & Carry Lahore through
              phone, WhatsApp, or the contact form below.
            </p>
          </div>
        </section>

        <section className="contact_info_section">
          <div className="contact_inner">
            <div className="contact_grid">
              <div className="contact_card">
                <div className="card_icon"><img src="/images/chat-icon.png" alt="chat" className="contact_card_icon" /></div>
                <h3>Phone / WhatsApp</h3>
                <p className="highlight">+92 3013827812</p>
                <p>Call or WhatsApp us for order support.</p>
              </div>

              <div className="contact_card">
                <div className="card_icon"><img src="/images/location-icon.png" alt="Location" className="contact_card_icon" /></div>
                <h3>Store Location</h3>
                <p>Eden Palace Villas Raiwind Road Lahore, Pakistan.</p>
              </div>

              <div className="contact_card">
                <div className="card_icon"><img src="/images/cart-icon.png" alt="Delivery" className="contact_card_icon" /></div>
                <h3>Delivery Support</h3>
                <p>Fast grocery delivery in nearby areas.</p>
              </div>

              <div className="contact_card">
                <div className="card_icon"><img src="/images/profile-icon.png" alt="Hours" className="contact_card_icon" /></div>
                <h3>Business Hours</h3>
                <p>Every Day: 9:00 AM – 12:00 PM</p>
                <p>Order Support: Phone / WhatsApp</p>
              </div>
            </div>

            <div className="contact_bottom">
              <div className="contact_form_card">
                <h3 className="heddings">Send Message</h3>
                <p>Fill the form below and our team will contact you as soon as possible. For urgent orders, use WhatsApp.</p>

                <form className="contact_form" onSubmit={handleSubmit}>
                  <label>
                    Name
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
                  </label>

                  <label>
                    Phone / WhatsApp
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="Your phone number" />
                  </label>

                  <label>
                    Email
                    <input name="email" value={form.email} onChange={handleChange} placeholder="Your email address" />
                  </label>

                  <label>
                    Message
                    <textarea name="message" value={form.message} onChange={handleChange} placeholder="Write your message" />
                  </label>

                  <div className="form_actions">
                    <button type="submit" className="send_message_btn" disabled={status.sending}>
                      {status.sending ? "Sending..." : "Send Message"}
                    </button>
                  </div>

                  {status.success && <p className="form_success">{status.success}</p>}
                  {status.error && <p className="form_error">{status.error}</p>}
                </form>
              </div>

              <div className="map_card">
                <h3 className="heddings">Our Location</h3>
                <div className="map_placeholder">
                  <iframe
                    title="Nazir Sons Cash & Carry Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.111146222863!2d74.23678237442132!3d31.438606951179217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391901003d12f4fb%3A0xed33484ad714598!2sMehmood%20Cash%20and%20Carry!5e0!3m2!1sen!2s!4v1784203760047!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <ul className="contact_quick">
                  <li><strong>Phone / WhatsApp:</strong> +92 3013827812</li>
                  <li><strong>Location:</strong> Eden Palace Villas Raiwind Road Lahore, Pakistan</li>
                  <li><strong>Delivery:</strong> Selected Lahore nearby areas</li>
                  <li><strong>Payment:</strong> Cash on Delivery available</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Contact;
