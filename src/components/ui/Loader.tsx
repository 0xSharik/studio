"use client";

import { useState, useEffect } from "react";

const loadingSteps = [
  "Initializing system...",
  "Welcome to GAMESTUDIO",
  "Loading 3D assets...",
  "Fetching games data...",
  "Fetching announcements...",
  "Preparing experience...",
];

export function Loader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStep >= loadingSteps.length) {
      setTimeout(() => setIsComplete(true), 500);
      return;
    }

    const timer = setTimeout(() => {
      setVisibleSteps((prev) => [...prev, loadingSteps[currentStep]]);
      setCurrentStep((prev) => prev + 1);
    }, 600);

    return () => clearTimeout(timer);
  }, [currentStep]);

  if (isComplete) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.terminal}>
        <div style={styles.header}>
          <span style={styles.title}>Status</span>
          <div style={styles.controls}>
            <div style={{ ...styles.control, backgroundColor: "#e33" }} />
            <div style={{ ...styles.control, backgroundColor: "#ee0" }} />
            <div style={{ ...styles.control, backgroundColor: "#0b0" }} />
          </div>
        </div>
        <div style={styles.content}>
          {visibleSteps.map((step, index) => (
            <div key={index} style={styles.line}>
              <span style={styles.prompt}>›</span> {step}
            </div>
          ))}
          <div style={styles.cursor}>▊</div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    inset: 0,
    backgroundColor: "#0a0a0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  terminal: {
    width: "400px",
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
    border: "1px solid #333",
  },
  header: {
    backgroundColor: "#333",
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #222",
  },
  title: {
    color: "#eee",
    fontSize: "12px",
    fontFamily: "Courier New, monospace",
  },
  controls: {
    display: "flex",
    gap: "6px",
  },
  control: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  content: {
    padding: "20px 16px",
    fontFamily: "Courier New, monospace",
    fontSize: "14px",
    color: "#00ff00",
    minHeight: "150px",
  },
  line: {
    marginBottom: "8px",
    whiteSpace: "nowrap",
  },
  prompt: {
    color: "#00ff00",
    marginRight: "8px",
  },
  cursor: {
    display: "inline-block",
    animation: "blink 0.8s step-end infinite",
  },
};
