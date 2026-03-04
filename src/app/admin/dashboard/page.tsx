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
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ImageCropper } from "@/components/ui/ImageCropper";

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "news" | "update" | "event";
}

interface Game {
  id: string;
  title: string;
  genre: string;
  status: string;
  imageUrl: string;
  downloadUrl: string;
}

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"announcements" | "games">("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showGameForm, setShowGameForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [finalImage, setFinalImage] = useState<string>("");

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    description: "",
    type: "news" as "news" | "update" | "event",
  });

  const [gameForm, setGameForm] = useState({
    title: "",
    genre: "",
    status: "Coming Soon",
    downloadUrl: "",
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
                    <span className="text-cyan-400 text-sm">{game.genre}</span>
                    <h3 className="text-white font-bold text-xl mt-1">{game.title}</h3>
                    <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-white text-sm">
                      {game.status}
                    </span>
                    <div className="flex justify-between items-center mt-4">
                      {game.downloadUrl && (
                        <a
                          href={game.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Visit Website →
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
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
      </main>
    </div>
  );
}
