import Page from "@/components/Page";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Roadmap from "@/components/Roadmap";
import GuestbookPreview from "@/components/GuestbookPreview";
import Contact from "@/components/Contact";
import { skills, projects, roadmap } from "@/lib/content";

export default function Home() {
  return (
    <div className="portfolio">
      <Page id="home" className="hero-page">
        <Hero />
      </Page>

      <Page id="about">
        <About />
      </Page>

      <Page id="stack" className="stack-page">
        <Skills items={skills.categories} />
      </Page>

      <Page id="work">
        <Projects items={projects} />
      </Page>

      <Page id="roadmap" className="roadmap-page">
        <Roadmap items={roadmap} />
      </Page>

      <Page id="guestbook">
        <GuestbookPreview />
      </Page>

      <Page id="contact" className="contact-page">
        <Contact />
      </Page>
    </div>
  );
}
