import Hero from "@/sections/Hero";
import Thesis from "@/sections/Thesis";
import Strategies from "@/sections/Strategies";
import TrackRecord from "@/sections/TrackRecord";
import CaseStudies from "@/sections/CaseStudies";
import Platform from "@/sections/Platform";
import Statement from "@/sections/Statement";
import Footer from "@/sections/Footer";
import LockedPortal from "@/components/LockedPortal";
import ContactForm from "@/components/ContactForm";
import { dataRoom, contact } from "@/lib/content";

export default function Home() {
  return (
    <main>
      <Hero />
      <Thesis />
      <Strategies />
      <TrackRecord />
      <CaseStudies />
      <Statement />
      <Platform />

      <section id="portal" className="shell section-pad">
        <span className="eyebrow">{dataRoom.eyebrow}</span>
        <h2 className="measure-sub">{dataRoom.title}</h2>
        <LockedPortal />
      </section>

      <section id="contact" className="shell section-pad">
        <div className="contact__inner">
          <div>
            <span className="eyebrow">{contact.eyebrow}</span>
            <h2>{contact.title}</h2>
            <p style={{ color: "var(--ink-dim)" }}>{contact.body}</p>
          </div>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
