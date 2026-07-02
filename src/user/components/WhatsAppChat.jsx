import "./WhatsAppChat.css";

const whatsappNumber = "03013827812";
const whatsappLink = `https://wa.me/92${whatsappNumber.replace(/\D/g, "")}`;

export default function WhatsAppChat() {
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noreferrer noopener"
      className="whatsapp-chat-button"
      aria-label="Chat with Nazir Son's on WhatsApp"
    >
      <span className="whatsapp-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M20.5 3.5A10.5 10.5 0 0 0 9.5 20.94l-1.9.5a1 1 0 0 1-1.17-1.17l.5-1.9A10.5 10.5 0 1 0 20.5 3.5Zm-1.32 14.9c-.26.74-1.2 1.36-1.88 1.45-.5.06-1.12.1-2.06-.03a9.38 9.38 0 0 1-4.76-2.08 7.42 7.42 0 0 1-2.73-4.08c-.34-1.14-.28-1.98.08-2.06.33-.06.7-.1 1.05-.1.31 0 .77.01 1.16.52.36.45 1.14 1.77 1.24 1.9.11.14.18.31.04.52l-.02.03a.34.34 0 0 1-.08.12c-.14.1-.3.22-.43.33-.14.12-.29.24-.18.47.1.22.45.73.97 1.18.67.63 1.23.82 1.49.93.47.19.9.16 1.24-.1.34-.27 1.35-1.57 1.3-2.4-.05-.83-.61-1.26-1.1-1.57-.28-.17-.6-.37-.84-.55-.28-.2-.61-.41-.5-.74.12-.34.52-.55.93-.56.42-.02 1.05.02 1.55.24.5.21.92.52 1.28.85.4.37.73.8.96 1.26.24.47.27.89.18 1.03Z"
          />
        </svg>
      </span>
      <span className="whatsapp-label">
        Chat on WhatsApp
        <span className="whatsapp-number">+92 301 3827812</span>
      </span>
    </a>
  );
}
