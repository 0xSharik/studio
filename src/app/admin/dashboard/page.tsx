"use client";

import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ImageCropper } from "@/components/ui/ImageCropper";

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "news" | "update" | "event" | "game_release" | "coming_soon";
}

interface Game {
  id: string;
  title: string;
  genre: string;
  status: string;
  imageUrl: string;
  downloadUrl: string;
  featured: boolean;
}

interface FeaturedGame {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  trailerUrl: string;
  downloadUrl: string;
}

interface JournalEntry {
  id: string;
  week: string;
  title: string;
  content: string;
  date: string;
}

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"announcements" | "games" | "featured" | "journal">("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGame, setFeaturedGame] = useState<FeaturedGame | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showGameForm, setShowGameForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [finalImage, setFinalImage] = useState<string>("");

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    description: "",
    type: "news" as "news" | "update" | "event" | "game_release" | "coming_soon",
  });

  const [gameForm, setGameForm] = useState({
    title: "",
    genre: "",
    status: "Coming Soon",
    downloadUrl: "",
  });

  const [featuredForm, setFeaturedForm] = useState({
    title: "",
    subtitle: "",
    trailerUrl: "",
    downloadUrl: "",
  });
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [featuredShowCropper, setFeaturedShowCropper] = useState(false);
  const [featuredCropImageSrc, setFeaturedCropImageSrc] = useState<string>("");
  const [featuredFinalImage, setFeaturedFinalImage] = useState<string>("");
  
  const [journalForm, setJournalForm] = useState({
    week: "",
    title: "",
    content: "",
  });

  const gameImageRef = useRef<HTMLInputElement>(null);
  const [gameImage, setGameImage] = useState<File | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        setUser(user);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Announcement[];
      setAnnouncements(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "games"), orderBy("title", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Game[];
      setGames(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "featured"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as FeaturedGame;
        setFeaturedGame({ ...data, id: snapshot.docs[0].id });
        setFeaturedForm({
          title: data.title || "",
          subtitle: data.subtitle || "",
          trailerUrl: data.trailerUrl || "",
          downloadUrl: data.downloadUrl || "",
        });
        setFeaturedImagePreview(data.imageUrl || "");
        setFeaturedFinalImage(data.imageUrl || "");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "journal"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as JournalEntry[];
      setJournalEntries(data);
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setFinalImage(croppedImageUrl);
    setImagePreview(croppedImageUrl);
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropImageSrc("");
    if (gameImageRef.current) {
      gameImageRef.current.value = "";
    }
  };

  const uploadToCloudinary = async (file: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.url) {
      return data.url;
    }
    throw new Error(data.error || "Upload failed");
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "announcements"), {
        ...announcementForm,
        date: new Date().toISOString().split("T")[0],
      });
      setAnnouncementForm({ title: "", description: "", type: "news" });
      setShowAnnouncementForm(false);
    } catch (err) {
      console.error("Error adding announcement:", err);
    }
  };

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalImage) {
      alert("Please select and crop an image");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(finalImage);

      await addDoc(collection(db, "games"), {
        ...gameForm,
        imageUrl,
        createdAt: new Date().toISOString(),
      });

      setGameForm({ title: "", genre: "", status: "Coming Soon", downloadUrl: "" });
      setGameImage(null);
      setFinalImage("");
      setImagePreview("");
      if (gameImageRef.current) gameImageRef.current.value = "";
      setShowGameForm(false);
    } catch (err) {
      console.error("Error adding game:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "journal"), {
        ...journalForm,
        date: new Date().toISOString(),
      });
      setJournalForm({ week: "", title: "", content: "" });
      setShowJournalForm(false);
    } catch (err) {
      console.error("Error adding journal entry:", err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm("Delete this announcement?")) {
      await deleteDoc(doc(db, "announcements", id));
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (confirm("Delete this game?")) {
      await deleteDoc(doc(db, "games", id));
    }
  };

  const handleDeleteJournal = async (id: string) => {
    if (confirm("Delete this journal entry?")) {
      await deleteDoc(doc(db, "journal", id));
    }
  };

  const handleSetFeatured = async (gameId: string, isFeatured: boolean) => {
    try {
      const gamesSnapshot = await onSnapshot(query(collection(db, "games"), orderBy("title", "asc")), (snapshot) => {
        snapshot.docs.forEach(async (d) => {
          const g = d.data() as Game;
          if (g.featured && d.id !== gameId) {
            await updateDoc(doc(db, "games", d.id), { featured: false });
          }
        });
      });
      
      await updateDoc(doc(db, "games", gameId), { featured: isFeatured });
    } catch (err) {
      console.error("Error setting featured:", err);
    }
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedCropImageSrc(reader.result as string);
        setFeaturedShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeaturedCropComplete = (croppedImageUrl: string) => {
    setFeaturedFinalImage(croppedImageUrl);
    setFeaturedImagePreview(croppedImageUrl);
    setFeaturedShowCropper(false);
  };

  const handleFeaturedCropCancel = () => {
    setFeaturedShowCropper(false);
    setFeaturedCropImageSrc("");
  };

  const handleFeaturedSave = async () => {
    if (!featuredFinalImage) {
      alert("Please select an image");
      return;
    }
    if (!featuredForm.title) {
      alert("Please enter a game title");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = featuredFinalImage;
      
      if (featuredFinalImage.startsWith("data:")) {
        imageUrl = await uploadToCloudinary(featuredFinalImage);
      }

      if (featuredGame?.id) {
        await updateDoc(doc(db, "featured", featuredGame.id), {
          ...featuredForm,
          imageUrl,
        });
      } else {
        await addDoc(collection(db, "featured"), {
          ...featuredForm,
          imageUrl,
        });
      }
      alert("Featured game saved!");
    } catch (err) {
      console.error("Error saving featured:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFeaturedDelete = async (id: string) => {
    if (confirm("Remove this game from Featured?")) {
      try {
        await deleteDoc(doc(db, "featured", id));
        setFeaturedGame(null);
        setFeaturedForm({
          title: "",
          subtitle: "",
          trailerUrl: "",
          downloadUrl: "",
        });
        setFeaturedImagePreview("");
        setFeaturedFinalImage("");
        alert("Featured game removed!");
      } catch (err) {
        console.error("Error deleting featured:", err);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {showCropper && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      {featuredShowCropper && (
        <ImageCropper
          imageSrc={featuredCropImageSrc}
          onCropComplete={handleFeaturedCropComplete}
          onCancel={handleFeaturedCropCancel}
        />
      )}
      <header className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            Admin <span className="text-cyan-400">Dashboard</span>
          </h1>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === "announcements"
              ? "bg-cyan-400 text-black"
              : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab("games")}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === "games"
              ? "bg-cyan-400 text-black"
              : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            Games
          </button>
          <button
            onClick={() => setActiveTab("featured")}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === "featured"
              ? "bg-gradient-to-r from-cyan-400 to-magenta-500 text-black"
              : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            ★ Featured Game
          </button>
          <button
            onClick={() => setActiveTab("journal")}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === "journal"
              ? "bg-cyan-400 text-black"
              : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            Journal
          </button>
        </div>

        {activeTab === "announcements" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Announcements</h2>
              <button
                onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                className="bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors"
              >
                {showAnnouncementForm ? "Cancel" : "Add New"}
              </button>
            </div>

            {showAnnouncementForm && (
              <form onSubmit={handleAnnouncementSubmit} className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Title</label>
                    <input
                      type="text"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Description</label>
                    <textarea
                      value={announcementForm.description}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none h-24"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Type</label>
                    <select
                      value={announcementForm.type}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value as any })}
                      className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="news" className="bg-[#1a1a2e] text-white">News</option>
                      <option value="update" className="bg-[#1a1a2e] text-white">Update</option>
                      <option value="event" className="bg-[#1a1a2e] text-white">Event</option>
                      <option value="game_release" className="bg-[#1a1a2e] text-white">Game Release</option>
                      <option value="coming_soon" className="bg-[#1a1a2e] text-white">Coming Soon</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="bg-cyan-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-cyan-500 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start justify-between"
                >
                  <div>
                    <span className="text-cyan-400 text-sm uppercase">{item.type}</span>
                    <h3 className="text-white font-bold mt-1">{item.title}</h3>
                    <p className="text-gray-400 mt-1">{item.description}</p>
                    <span className="text-gray-500 text-sm">{item.date}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-gray-500 text-center py-8">No announcements yet.</p>
              )}
            </div>
          </>
        )}

        {activeTab === "games" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Games</h2>
              <button
                onClick={() => setShowGameForm(!showGameForm)}
                className="bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors"
              >
                {showGameForm ? "Cancel" : "Add New Game"}
              </button>
            </div>

            {showGameForm && (
              <form onSubmit={handleGameSubmit} className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Game Title</label>
                    <input
                      type="text"
                      value={gameForm.title}
                      onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Genre</label>
                    <input
                      type="text"
                      value={gameForm.genre}
                      onChange={(e) => setGameForm({ ...gameForm, genre: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                      placeholder="e.g., Action RPG, Racing, Platformer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Status</label>
                    <select
                      value={gameForm.status}
                      onChange={(e) => setGameForm({ ...gameForm, status: e.target.value })}
                      className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="Released" className="bg-[#1a1a2e] text-white">Released</option>
                      <option value="In Development" className="bg-[#1a1a2e] text-white">In Development</option>
                      <option value="Coming Soon" className="bg-[#1a1a2e] text-white">Coming Soon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Download/Website URL</label>
                    <input
                      type="url"
                      value={gameForm.downloadUrl}
                      onChange={(e) => setGameForm({ ...gameForm, downloadUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                      placeholder="https://game-website.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Game Image</label>
                    <input
                      ref={gameImageRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:bg-cyan-400 file:text-black file:font-semibold"
                      required
                    />
                    {imagePreview && (
                      <div className="mt-4">
                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-cyan-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-cyan-500 transition-colors disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Save Game"}
                  </button>
                </div>
              </form>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Show Featured Hero Game first if it exists */}
              {featuredGame && (
                <div className="bg-white/5 border border-cyan-400/30 rounded-xl overflow-hidden ring-1 ring-cyan-400/20">
                  <div className="relative">
                    {featuredGame.imageUrl && (
                      <img
                        src={featuredGame.imageUrl}
                        alt={featuredGame.title}
                        className="w-full h-48 object-cover opacity-60"
                      />
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-cyan-400 to-magenta-500 text-black text-xs font-bold rounded shadow-lg">
                        ★ HERO FEATURED
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">SPECIAL FEATURE</span>
                    </div>
                    <h3 className="text-white font-bold text-xl mt-1">{featuredGame.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-1">{featuredGame.subtitle}</p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={() => {
                          setActiveTab("featured");
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center gap-1 px-4 py-2 bg-white/10 text-white font-semibold text-sm rounded-lg hover:bg-white/20 transition-all"
                      >
                        Edit in Featured Tab
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {games.map((game) => (
                <div
                  key={game.id}
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                >
                  {game.imageUrl && (
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 text-sm">{game.genre}</span>
                      {game.featured && (
                        <span className="px-2 py-1 bg-gradient-to-r from-cyan-400 to-magenta-500 text-black text-xs font-bold rounded">
                          ★ FEATURED
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-xl mt-1">{game.title}</h3>
                    <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-white text-sm">
                      {game.status}
                    </span>
                    <div className="flex flex-wrap gap-3 mt-4">
                      {game.downloadUrl && (
                        <a
                          href={game.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-4 py-2 bg-cyan-400 text-black font-semibold text-sm rounded-lg hover:bg-cyan-500 transition-all transform hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Visit
                        </a>
                      )}
                      <button
                        onClick={() => handleSetFeatured(game.id, !game.featured)}
                        className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all transform hover:scale-105 ${
                          game.featured 
                            ? "bg-white/20 text-white hover:bg-white/30 border border-white/30" 
                            : "bg-magenta-500/20 text-magenta-400 hover:bg-magenta-500/30 border border-magenta-500/30"
                        }`}
                      >
                        <svg className="w-4 h-4" fill={game.featured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {game.featured ? "Featured" : "Feature"}
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold rounded-lg hover:bg-red-500/30 transition-all transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {games.length === 0 && (
                <p className="text-gray-500 text-center py-8 col-span-2">No games yet. Add your first game!</p>
              )}
            </div>
          </>
        )}

        {activeTab === "featured" && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Featured Game</h2>
              <p className="text-gray-400 mb-6">This game will be displayed prominently on the homepage.</p>
            </div>

            {/* List and Form View */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form Side */}
              <div className="lg:col-span-2">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">
                    {featuredGame ? "Edit Featured Game" : "Set Featured Game"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 mb-2">Game Title *</label>
                      <input
                        type="text"
                        value={featuredForm.title}
                        onChange={(e) => setFeaturedForm({ ...featuredForm, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="e.g., REALM RIVALS"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">Subtitle</label>
                      <input
                        type="text"
                        value={featuredForm.subtitle}
                        onChange={(e) => setFeaturedForm({ ...featuredForm, subtitle: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="e.g., Hero Shooter • Competitive • Multiplayer"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">Trailer URL</label>
                      <input
                        type="url"
                        value={featuredForm.trailerUrl}
                        onChange={(e) => setFeaturedForm({ ...featuredForm, trailerUrl: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">Wishlist / Download URL</label>
                      <input
                        type="url"
                        value={featuredForm.downloadUrl}
                        onChange={(e) => setFeaturedForm({ ...featuredForm, downloadUrl: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="https://store.steampowered.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">Game Image (1920x1080 recommended) *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-cyan-400 file:text-black file:font-semibold"
                      />
                      {featuredImagePreview && (
                        <div className="mt-4">
                          <img src={featuredImagePreview} alt="Preview" className="w-full rounded-lg border border-white/10 shadow-2xl" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleFeaturedSave}
                      disabled={uploading}
                      className="w-full bg-gradient-to-r from-cyan-400 to-magenta-500 text-black font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {uploading ? "Saving..." : "Save Featured Game"}
                    </button>
                  </div>
                </div>
              </div>

              {/* List / Selection Side */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    Current List
                  </h3>
                  
                  {featuredGame ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-cyan-400/30">
                        <div className="aspect-video mb-3 rounded-lg overflow-hidden border border-white/10">
                          <img src={featuredGame.imageUrl} alt={featuredGame.title} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="text-white font-bold">{featuredGame.title}</h4>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{featuredGame.subtitle}</p>
                        
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleFeaturedDelete(featuredGame.id)}
                            className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
                      <p className="text-gray-500 text-sm">No game is currently featured on the hero section.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "journal" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Developer Journal</h2>
              <button
                onClick={() => setShowJournalForm(!showJournalForm)}
                className="bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors"
              >
                {showJournalForm ? "Cancel" : "Add Entry"}
              </button>
            </div>

            {showJournalForm && (
              <form onSubmit={handleJournalSubmit} className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-2">Week</label>
                      <input
                        type="text"
                        value={journalForm.week}
                        onChange={(e) => setJournalForm({ ...journalForm, week: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="e.g., Week 1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">Title</label>
                      <input
                        type="text"
                        value={journalForm.title}
                        onChange={(e) => setJournalForm({ ...journalForm, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="e.g., Combat System Prototype"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Full Content (Supports plain text)</label>
                    <textarea
                      value={journalForm.content}
                      onChange={(e) => setJournalForm({ ...journalForm, content: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none h-48"
                      placeholder="Describe what happened this week..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-cyan-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-cyan-500 transition-colors"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {journalEntries.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start justify-between"
                >
                  <div>
                    <span className="text-cyan-400 text-sm font-bold uppercase tracking-widest">{item.week}</span>
                    <h3 className="text-white font-bold text-xl mt-1">{item.title}</h3>
                    <p className="text-gray-400 mt-2 line-clamp-2">{item.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteJournal(item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {journalEntries.length === 0 && (
                <p className="text-gray-500 text-center py-8">No journal entries yet.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
