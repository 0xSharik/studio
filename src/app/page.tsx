import { Scene } from "@/components/3d/Scene";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Hero } from "@/components/sections/Hero";
import { Games } from "@/components/sections/Games";
import { Announcements } from "@/components/sections/Announcements";

export default function Home() {
  return (
    <SmoothScroll>
      <Scene />
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <Announcements />
        <Games />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
