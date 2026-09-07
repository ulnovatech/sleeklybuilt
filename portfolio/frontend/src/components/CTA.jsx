import { useEffect, useState } from "react";

export default function CTA() {
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    // Detect template name dynamically (like in your JS)
    const name =
      document.body.getAttribute("data-template") || document.title.trim();
    setTemplateName(name);
  }, []);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center bg-white px-6 py-3 rounded-full shadow-md w-[400px] max-sm:w-[80%]">
      {/* WhatsApp */}
      <a
        href="https://wa.me/0749594464"
        target="_blank"
        rel="noopener noreferrer"
        className="w-6 h-6 mx-2 bg-cover bg-center"
        style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg')" }}
        title="WhatsApp"
      ></a>

      {/* Order button */}
      <a
        id="order-btn"
        href={`/portfolio-app/order?template=${encodeURIComponent(templateName)}`}
        className="bg-green-600 text-white font-bold px-4 py-2 rounded-full text-base mx-2 max-sm:text-sm"
        title="Order This Website"
      >
        Order This Website
      </a>

      {/* Phone */}
      <a
        href="tel:+256791779448"
        className="w-6 h-6 mx-2 bg-cover bg-center"
        style={{ backgroundImage: "url('https://img.icons8.com/ios-filled/50/007bff/phone.png')" }}
        title="Call"
      ></a>
    </div>
  );
}
