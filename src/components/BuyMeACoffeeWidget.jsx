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
    script.setAttribute("data-x_margin", isMobileScreen ? "10" : "18");
    script.setAttribute("data-y_margin", isMobileScreen ? "10" : "18");

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
          className="inline-flex items-center px-4 py-2 bg-paci-green text-white rounded-lg hover:opacity-80 transition-opacity"
        >
          ☕ Support PaciFinance
        </a>
      )}
    </>
  );
}