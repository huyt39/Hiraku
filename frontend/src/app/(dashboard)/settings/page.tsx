"use client";
import { useEffect, useState } from "react";
import API_URL from "@/lib/api";

const STUDENT_ID = "student_001";

interface Profile {
  id?: string;
  name: string;
  email: string;
  school: string;
  year: string;
  target_domain: string;
}

const fallbackProfile: Profile = {
  id: STUDENT_ID,
  name: "Nguyễn Văn A",
  email: "nguyenvana@student.edu.vn",
  school: "Đại học Công nghệ",
  year: "Năm 3",
  target_domain: "web",
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>(fallbackProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/auth/profile/${STUDENT_ID}`)
      .then((res) => res.ok ? res.json() : fallbackProfile)
      .then((data) => setProfile({ ...fallbackProfile, ...data }))
      .catch(() => setProfile(fallbackProfile));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${STUDENT_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          school: profile.school,
          year: profile.year,
          target_domain: profile.target_domain,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setProfile(await res.json());
      setMessage("Đã lưu hồ sơ.");
    } catch {
      setMessage("Chưa lưu được lên server, dữ liệu vẫn được giữ trên màn hình.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Quản lý tài khoản, hồ sơ cá nhân và mục tiêu học tập</p>
      </div>

      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Thông tin cá nhân</h3>
          {[
            { key: "name", label: "Họ và tên" },
            { key: "email", label: "Email", disabled: true },
            { key: "school", label: "Trường" },
            { key: "year", label: "Năm học" },
          ].map((field) => (
            <label key={field.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ width: 120, fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{field.label}</span>
              <input
                value={String(profile[field.key as keyof Profile] || "")}
                disabled={field.disabled}
                onChange={(e) => setProfile((prev) => ({ ...prev, [field.key]: e.target.value }))}
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", padding: "10px 12px", fontSize: 13 }}
              />
            </label>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Mục tiêu học tập</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { value: "web", label: "Web Developer" },
              { value: "ai", label: "AI/ML Engineer" },
              { value: "data", label: "Data Engineer" },
              { value: "devops", label: "DevOps Engineer" },
            ].map((d) => (
              <button key={d.value} onClick={() => setProfile((prev) => ({ ...prev, target_domain: d.value }))} style={{
                flex: "1 1 150px", padding: "12px", borderRadius: 10, border: `1px solid ${profile.target_domain === d.value ? "var(--accent-purple)" : "var(--border)"}`,
                background: profile.target_domain === d.value ? "rgba(108,99,255,0.12)" : "rgba(255,255,255,0.04)",
                color: profile.target_domain === d.value ? "var(--accent-purple)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>{d.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={saveProfile} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? "Đang lưu..." : "Lưu hồ sơ"}
          </button>
          {message && <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{message}</span>}
        </div>
      </div>
    </div>
  );
}
