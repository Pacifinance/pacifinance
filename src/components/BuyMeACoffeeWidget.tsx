/**
 * BuyMeACoffeeWidget — plain static "support us" link.
 *
 * Deliberately NOT the Buy Me a Coffee floating widget script anymore: that
 * script injects a persistent `#bmc-wbtn` button directly into the page
 * outside React's tree, so once loaded on any page (footer, pricing, info)
 * it kept floating on every subsequent page for the rest of the session —
 * including inside the authenticated app. For a privacy-first product that's
 * the wrong kind of persistent, so this is now a normal contextual link
 * placed only where a "support us" section actually appears, with GitHub
 * Sponsors as the primary channel once the project is open source (see
 * todo.md) and this as the secondary one.
 */
import React from "react";

export default function BuyMeACoffeeWidget() {
  return (
    <a
      href="https://www.buymeacoffee.com/pacifinance"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.75rem',
        fontWeight: 700,
        fontSize: '1.05rem',
        textDecoration: 'none',
        color: 'white',
        background: 'linear-gradient(135deg, #079164 0%, #0ba374 100%)',
        boxShadow: '0 8px 25px rgba(7, 145, 100, 0.35)',
      }}
      data-umami-event="support-pacifinance-bmc"
    >
      ☕ Support Pacifinance
    </a>
  );
}
