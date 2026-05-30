import Hero from "@/sections/Hero";
import Solutions from "@/sections/Solutions";
import Approach from "@/sections/Approach";
import Footer from "@/sections/Footer";
import LockedPortal from "@/components/LockedPortal";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <main>
      <Hero />
      <Solutions />
      <div className="shell"><div className="divider" /></div>
      <Approach />

      <section id="portal" className="shell section-pad">
        <span className="eyebrow">Data Room</span>
        <h2 className="measure-sub">A locked portal for verified partners.</h2>
        <LockedPortal />
      </section>

      <section id="contact" className="shell section-pad">
        <div className="contact__inner">
          <div>
            <span className="eyebrow">Contact</span>
            <h2>Begin a conversation.</h2>
            <p style={{ color: "var(--ink-dim)" }}>
              Introductions are reviewed by a partner. We respond to every credible
              mandate within one business day.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
