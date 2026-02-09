import React, { useEffect } from "react";

export default function Buymeacoffee({ isMobileScreen, showLink = false }) {
  useEffect(() => {
    const div = document.getElementById("supportByBMC");
    // Check if the script is already there
    const existingScript = div.querySelector('script[data-name="BMC-Widget"]');
    if (existingScript) {
      // if the script is already there, doing nothing
      return;
    }

    const script = document.createElement("script");
    script.setAttribute(
      "src",
      "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
    );
    script.setAttribute("data-name", "BMC-Widget");
    script.setAttribute("data-cfasync", "false");
    script.setAttribute("data-id", "pacifinance");
    script.setAttribute("data-description", "Support me on Buy me a coffee!");
    script.setAttribute(
      "data-message",
      ""
    );
    script.setAttribute("data-color", "#079164");
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");

    script.onload = function () {
      var evt = document.createEvent("Event");
      evt.initEvent("DOMContentLoaded", false, false);
      window.dispatchEvent(evt);
    };

    div.appendChild(script);
  }, []);

  return (
    <>
      <div id="supportByBMC"></div>
      {showLink && (
        <a 
          href="https://www.buymeacoffee.com/pacifinance" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #079164 0%, #0ba374 100%)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 25px rgba(7, 145, 100, 0.4)',
          }}
          data-umami-event="landing-support-pacifinance"
        >
          ☕ Support PaciFinance
        </a>
      )}
    </>
  );
}