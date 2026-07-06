import "./Footer.css";
import { Link, useNavigate } from "react-router-dom";
const sitemapLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Return & Refund Policies", href: "/return-refund-policy" },
];

export const Footer = () => {
  return (
    <footer className="site_footer">
      <div className="footer_inner">
        <div className="footer_col footer_col_logo">
          <Link to="/">
            <img
              src="../images/logo_transparent.png"
              alt="ns-logo"
              className="footer_logo"
            />
          </Link>
        </div>

        <div className="footer_col">
          <h3 className="footer_heading">About Us</h3>
          <p className="footer_about_text">
            Since 2017, Nazir son's has been providing its customers with a
            unique shopping experience. Nazir son's is one of a kind of modern
            retail departmental store offering a wide range of good quality
            products at economical rates, cumputerized billing system and full
            security cameras for its customers.
          </p>
        </div>

        <div className="footer_col">
          <h3 className="footer_heading">Get in touch</h3>
          <address className="footer_contact">
            <p className="footer_address">
              Shop # 2 & 3 Eden Palace Villas Raiwind Road,
              Lahore, Pakistan.
            </p>
            <ul className="footer_contact_list">
              <li>
                <Link to="tel:03013827812"> 0301-38-27-812 (Nazir-Son's)</Link>
              </li>
              <li>
                <Link to="mailto:khan@gmail.com">khan@gmail.com</Link>
              </li>
              <li>
                <Link
                  to="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Global Supplier Form
                </Link>
              </li>
            </ul>
          </address>
        </div>

        <div className="footer_col">
          <h3 className="footer_heading">Sitemap</h3>
          <ul className="footer_links_list">
            {sitemapLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer_bottom">
        <p>© {new Date().getFullYear()} Nazir Sons. All rights reserved.</p>
      </div>
    </footer>
  );
};
