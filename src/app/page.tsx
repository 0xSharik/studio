import { Scene } from "@/components/3d/Scene";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Hero } from "@/components/sections/Hero";
import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { FeaturedGame } from "@/components/sections/FeaturedGame";
import { DeveloperJournal } from "@/components/sections/DeveloperJournal";
import { Announcements } from "@/components/sections/Announcements";
import { JoinCommunity } from "@/components/sections/JoinCommunity";
import { StayUpdated } from "@/components/sections/StayUpdated";

export default function Home() {
  return (
    <SmoothScroll>
      <Scene />
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Hero />
          <WhoWeAre />
          <FeaturedGame />
          <DeveloperJournal />
          <Announcements />
          <JoinCommunity />
          <StayUpdated />
        </div>
        <Footer />
      </main>
    </SmoothScroll>
  );
}
