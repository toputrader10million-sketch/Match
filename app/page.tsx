"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const MEAL_SLOTS = { MORNING: "morning", LUNCH: "lunch", DINNER: "dinner" };

// Rice per person per slot (grams)
const RICE_RULES = { morning: 100, lunch: 200, dinner: 170 };

// Side-dish items per slot
const SIDE_DISH_SLOTS = { morning: 1, lunch: 4, dinner: 3 };

// Default ingredient ratios per meal (per person)
const DEFAULT_INGREDIENT_RATIOS = {
  oil:     { label: "তেল",    unit: "মিলি",  perMeal: 15 },
  turmeric:{ label: "হলুদ",   unit: "গ্রাম", perMeal: 1.5 },
  chili:   { label: "মরিচ গুড়া",unit: "গ্রাম",perMeal: 2 },
  garlic:  { label: "রসুন",   unit: "গ্রাম", perMeal: 6 },
  salt:    { label: "লবণ",    unit: "গ্রাম", perMeal: 3 },
  onion:   { label: "পেঁয়াজ", unit: "গ্রাম", perMeal: 25 },
};

// Initial members from Excel
const INITIAL_MEMBERS = [
  { id: 1,  name: "প্রীতিস",       roomNo: "1",  joinDate: "2026-06-01" },
  { id: 2,  name: "তপু",           roomNo: "2",  joinDate: "2026-06-01" },
  { id: 3,  name: "সায়েম ভাই",    roomNo: "3",  joinDate: "2026-06-01" },
  { id: 4,  name: "মানিক ভাই",    roomNo: "4",  joinDate: "2026-06-01" },
  { id: 5,  name: "নাফিস ভাই",    roomNo: "5",  joinDate: "2026-06-01" },
  { id: 6,  name: "হাবিব ভাই",    roomNo: "6",  joinDate: "2026-06-01" },
  { id: 7,  name: "শাহরিয়ার ১",  roomNo: "7",  joinDate: "2026-06-01" },
  { id: 8,  name: "শাহরিয়ার ২",  roomNo: "8",  joinDate: "2026-06-01" },
  { id: 9,  name: "তাহমিদ ভাই",  roomNo: "9",  joinDate: "2026-06-01" },
  { id: 10, name: "আশফাক",        roomNo: "10", joinDate: "2026-06-01" },
  { id: 11, name: "আরমান",        roomNo: "11", joinDate: "2026-06-01" },
  { id: 12, name: "ইব্রাহিম",     roomNo: "12", joinDate: "2026-06-01" },
  { id: 13, name: "মিঠু",         roomNo: "13", joinDate: "2026-06-01" },
  { id: 14, name: "শাহাদাত",      roomNo: "14", joinDate: "2026-06-01" },
  { id: 15, name: "মাহিন",        roomNo: "15", joinDate: "2026-06-01" },
  { id: 16, name: "মারুফ ভাই",   roomNo: "16", joinDate: "2026-06-01" },
  { id: 17, name: "রাসেল ভাই",   roomNo: "17", joinDate: "2026-06-01" },
  { id: 18, name: "গার্ডেন",      roomNo: "18", joinDate: "2026-06-01" },
  { id: 19, name: "রাসু ভাই",    roomNo: "19", joinDate: "2026-06-01" },
  { id: 20, name: "বিল্লাল ভাই", roomNo: "20", joinDate: "2026-06-01" },
];

const TODAY = new Date().toISOString().split("T")[0];
const formatDate = (d: string) => new Date(d).toLocaleDateString("bn-BD");
const avatarColors = [
  { bg: "#E1F5EE", fg: "#085041" }, { bg: "#EEEDFE", fg: "#3C3489" },
  { bg: "#FAEEDA", fg: "#854F0B" }, { bg: "#FAECE7", fg: "#993C1D" },
  { bg: "#EAF3DE", fg: "#27500A" }, { bg: "#E6F1FB", fg: "#0C447C" },
];
const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
const load = (key: string, def: any) => {
  if (typeof window === "undefined") return def;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
};
const save = (key: string, val: any) => {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(val));
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ msg, type }: any) {
  if (!msg) return null;
  const bg = type === "error" ? "#E24B4A" : type === "warn" ? "#EF9F27" : "#1D9E75";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      background: bg, color: "#fff", padding: "10px 20px",
      borderRadius: 10, fontSize: 14, fontWeight: 500,
      boxShadow: "0 4px 16px rgba(0,0,0,.18)", maxWidth: 320,
    }}>{msg}</div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose, width = 480 }: any) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,.45)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 14, padding: "24px 28px",
        width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto",
        position: "relative",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── INPUT COMPONENTS ────────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, type = "text", placeholder = "", min, max, step, required, style = {} }: any) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 500 }}>{label}{required && <span style={{ color: "#E24B4A" }}> *</span>}</label>}
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} min={min} max={max} step={step}
      style={{
        width: "100%", padding: "9px 13px", border: "1px solid #ddd",
        borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
        background: "#fafafa", transition: "border .15s", ...style,
      }}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }: any) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 500 }}>{label}</label>}
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 13px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, background: "#fafafa", outline: "none", cursor: "pointer" }}
    >
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Btn = ({ children, onClick, variant = "secondary", size = "md", style = {}, disabled = false }: any) => {
  const variants: any = {
    primary:  { background: "#1D9E75", color: "#fff", border: "1.5px solid #0F6E56" },
    danger:   { background: "#E24B4A", color: "#fff", border: "1.5px solid #A32D2D" },
    warning:  { background: "#EF9F27", color: "#fff", border: "1.5px solid #BA7517" },
    secondary:{ background: "#fff",    color: "#333", border: "1px solid #ddd" },
    ghost:    { background: "transparent", color: "#555", border: "1px solid #eee" },
  };
  const sizes: any = {
    sm: { padding: "5px 12px", fontSize: 12 },
    md: { padding: "8px 18px", fontSize: 14 },
    lg: { padding: "11px 24px", fontSize: 15 },
  };
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{ ...variants[variant], ...sizes[size], borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 500, opacity: disabled ? .6 : 1, transition: "all .15s", ...style }}
    >{children}</button>
  );
};

// ─── BADGE ───────────────────────────────────────────────────────────────────
const Badge = ({ label, color = "green" }: any) => {
  const colors: any = {
    green:  { bg: "#EAF3DE", fg: "#27500A" },
    amber:  { bg: "#FAEEDA", fg: "#633806" },
    red:    { bg: "#FCEBEB", fg: "#791F1F" },
    blue:   { bg: "#E6F1FB", fg: "#0C447C" },
    purple: { bg: "#EEEDFE", fg: "#3C3489" },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{ background: c.bg, color: c.fg, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{label}</span>
  );
};

// ─── AVATAR ──────────────────────────────────────────────────────────────────
const Avatar = ({ name, id, size = 36 }: any) => {
  const c = getAvatarColor(id);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: c.bg, color: c.fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, flexShrink: 0,
    }}>{name.slice(0, 2)}</div>
  );
};

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, unit = "", color = "#1D9E75", icon }: any) => (
  <div style={{
    background: "#fff", border: "1px solid #eee", borderRadius: 12,
    padding: "14px 18px", display: "flex", flexDirection: "column", gap: 4,
  }}>
    <div style={{ fontSize: 12, color: "#888", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
      {icon && <span>{icon}</span>}{label}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1.1 }}>
      {value}<span style={{ fontSize: 14, fontWeight: 500, marginLeft: 3 }}>{unit}</span>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE: DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function DashboardPage({ members, mealLogs, expenses, mealRate, deposits, onNav }: any) {
  const today = TODAY;
  const todayLog = mealLogs[today] || {};
  const morningCount = members.filter((m: any) => todayLog[m.id]?.morning).length;
  const lunchCount   = members.filter((m: any) => todayLog[m.id]?.lunch).length;
  const dinnerCount  = members.filter((m: any) => todayLog[m.id]?.dinner).length;

  const thisMonth = today.slice(0, 7);
  const monthExpenses = expenses.filter((e: any) => e.date.startsWith(thisMonth));
  const totalSpent = monthExpenses.reduce((s: any, e: any) => s + e.amount, 0);

  // calculate total meals per member this month
  const memberMeals: any = useMemo(() => {
    const map: any = {};
    members.forEach((m: any) => { map[m.id] = 0; });
    Object.entries(mealLogs).forEach(([date, log]: any) => {
      if (!date.startsWith(thisMonth)) return;
      Object.entries(log).forEach(([mid, slots]: any) => {
        const id = parseInt(mid);
        if (map[id] !== undefined) {
          if (slots.morning) map[id] += 0.5;
          if (slots.lunch)   map[id] += 1;
          if (slots.dinner)  map[id] += 0.5;
        }
      });
    });
    return map;
  }, [mealLogs, members, thisMonth]);

  const totalMeals = Object.values(memberMeals).reduce((s: any, v: any) => s + v, 0) as number;
  
  // Calculate total bills and deposits
  let totalMothlyBill = 0;
  let totalMonthlyDeposit = 0;
  members.forEach((m: any) => {
    const rawMeals = memberMeals[m.id] || 0;
    const billedMeals = Math.max(0, rawMeals - (m.isManager ? (m.freeMeals || 0) : 0));
    totalMothlyBill += billedMeals * mealRate;
    
    const key = `${thisMonth}_${m.id}`;
    totalMonthlyDeposit += deposits[key] || 0;
  });
  
  const isPaidCount = members.filter((m: any) => {
    const rawMeals = memberMeals[m.id] || 0;
    const billedMeals = Math.max(0, rawMeals - (m.isManager ? (m.freeMeals || 0) : 0));
    const bill = billedMeals * mealRate;
    const dep = deposits[`${thisMonth}_${m.id}`] || 0;
    return bill > 0 && dep >= bill;
  }).length;

  // Recent 7 days activity
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dk = d.toISOString().split("T")[0];
    const log = mealLogs[dk] || {};
    const total = members.reduce((s: number, m: any) => {
      const sl = log[m.id] || {};
      return s + (sl.morning ? 0.5 : 0) + (sl.lunch ? 1 : 0) + (sl.dinner ? 0.5 : 0);
    }, 0);
    return { date: dk, label: d.toLocaleDateString("bn-BD", { day: "2-digit", month: "2-digit" }), total };
  });

  const maxBar = Math.max(...last7.map(d => d.total), 1);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>ড্যাশবোর্ড</h2>
        <p style={{ color: "#888", fontSize: 13, margin: "4px 0 0" }}>আজ: {formatDate(today)}</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="সকালের মিল" value={morningCount} unit="জন" color="#1D9E75" icon="🌅" />
        <StatCard label="দুপুরের মিল" value={lunchCount}  unit="জন" color="#EF9F27" icon="☀️" />
        <StatCard label="রাতের মিল"  value={dinnerCount} unit="জন" color="#7F77DD" icon="🌙" />
        <StatCard label="মোট সদস্য"  value={members.length} unit="জন" color="#378ADD" icon="👥" />
        <StatCard label="মাসের মিল"  value={totalMeals} unit="টি" color="#D85A30" icon="🍛" />
        <StatCard label="মাসের খরচ"  value={"৳" + totalSpent.toLocaleString("bn-BD")} color="#E24B4A" icon="💰" />
      </div>

      {/* Financial Status Summary */}
      <div style={{ background: "#f8fcfb", border: "1px solid #1D9E75", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F6E56", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span>💳</span> সবার জমা বনাম বিল (চলতি মাস)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>মোট বিল হয়েছে</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#E24B4A" }}>৳{totalMothlyBill.toLocaleString()}</div>
          </div>
          <div style={{ width: 1, background: "#1D9E75", opacity: 0.2 }} className="hidden sm:block" />
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>মোট জমা পড়েছে</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1D9E75" }}>৳{totalMonthlyDeposit.toLocaleString()}</div>
          </div>
          <div style={{ width: 1, background: "#1D9E75", opacity: 0.2 }} className="hidden sm:block" />
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>বকেয়া (মোট)</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: Math.max(0, totalMothlyBill - totalMonthlyDeposit) > 0 ? "#E24B4A" : "#1D9E75" }}>
              ৳{Math.max(0, totalMothlyBill - totalMonthlyDeposit).toLocaleString()}
            </div>
          </div>
          <div style={{ width: 1, background: "#1D9E75", opacity: 0.2 }} className="hidden sm:block" />
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>পেমেন্ট স্ট্যাটাস</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0F6E56", marginTop: 4 }}>
              {isPaidCount} জন পরিশোধ করেছেন
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>⚡ দ্রুত কাজ</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn variant="primary" onClick={() => onNav("meals")}>📋 আজকের মিল আপডেট</Btn>
          <Btn variant="secondary" onClick={() => onNav("bazaar")}>🛒 বাজার লিস্ট তৈরি</Btn>
          <Btn variant="secondary" onClick={() => onNav("expenses")}>💸 খরচ যোগ করুন</Btn>
          <Btn variant="secondary" onClick={() => onNav("members")}>👤 সদস্য ম্যানেজ</Btn>
        </div>
      </div>

      {/* Last 7 days bar chart */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>📊 গত ৭ দিনের মোট মিল</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {last7.map(d => (
            <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 11, color: "#888" }}>{d.total}</div>
              <div style={{
                width: "100%", background: d.date === today ? "#1D9E75" : "#B4E8D2",
                borderRadius: "4px 4px 0 0",
                height: Math.max(6, (d.total / maxBar) * 90) + "px",
              }} />
              <div style={{ fontSize: 10, color: "#999" }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's member status */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>👥 আজকের মিল স্ট্যাটাস (সকল সদস্য)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
          {members.map((m: any) => {
            const sl = todayLog[m.id] || {};
            const active = sl.morning || sl.lunch || sl.dinner;
            return (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 8,
                background: active ? "#f0faf5" : "#fafafa",
                border: `1px solid ${active ? "#9FE1CB" : "#eee"}`,
              }}>
                <Avatar name={m.name} id={m.id} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                    {sl.morning && <span style={{ fontSize: 10, background: "#E1F5EE", color: "#085041", padding: "1px 6px", borderRadius: 8 }}>সকাল</span>}
                    {sl.lunch   && <span style={{ fontSize: 10, background: "#FAEEDA", color: "#633806", padding: "1px 6px", borderRadius: 8 }}>দুপুর</span>}
                    {sl.dinner  && <span style={{ fontSize: 10, background: "#EEEDFE", color: "#3C3489", padding: "1px 6px", borderRadius: 8 }}>রাত</span>}
                    {!active && <span style={{ fontSize: 10, color: "#bbb" }}>কোনো মিল নেই</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE: MEMBERS
// ══════════════════════════════════════════════════════════════════════════════
function MembersPage({ members, setMembers, mealLogs, mealRate, toast }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [editMember, setEditMember] = useState<any>(null);
  const [form, setForm] = useState({ name: "", roomNo: "", joinDate: TODAY, isManager: false, freeMeals: 0 });
  const [search, setSearch] = useState("");

  const thisMonth = TODAY.slice(0, 7);

  const memberMeals = useMemo(() => {
    const map: any = {};
    members.forEach((m: any) => { map[m.id] = 0; });
    Object.entries(mealLogs).forEach(([date, log]: any) => {
      if (!date.startsWith(thisMonth)) return;
      Object.entries(log).forEach(([mid, slots]: any) => {
        const id = parseInt(mid);
        if (map[id] !== undefined) {
          if (slots.morning) map[id] += 0.5;
          if (slots.lunch)   map[id] += 1;
          if (slots.dinner)  map[id] += 0.5;
        }
      });
    });
    return map;
  }, [mealLogs, members, thisMonth]);

  const resetForm = () => setForm({ name: "", roomNo: "", joinDate: TODAY, isManager: false, freeMeals: 0 });

  const openAdd = () => { resetForm(); setEditMember(null); setShowAdd(true); };
  const openEdit = (m: any) => { setForm({ name: m.name, roomNo: m.roomNo, joinDate: m.joinDate, isManager: m.isManager || false, freeMeals: m.freeMeals || 0 }); setEditMember(m); setShowAdd(true); };

  const saveMember = () => {
    if (!form.name.trim()) { toast("নাম দিন!", "error"); return; }
    if (editMember) {
      setMembers((prev: any) => prev.map((m: any) => m.id === editMember.id ? { ...m, ...form } : m));
      toast("সদস্যের তথ্য আপডেট হয়েছে ✓");
    } else {
      const newId = Math.max(0, ...members.map((m: any) => m.id)) + 1;
      setMembers((prev: any) => [...prev, { id: newId, ...form }]);
      toast("নতুন সদস্য যোগ হয়েছে ✓");
    }
    setShowAdd(false);
  };

  const deleteMember = (id: number) => {
    if (!window.confirm("এই সদস্যকে মুছে ফেলবেন?")) return;
    setMembers((prev: any) => prev.filter((m: any) => m.id !== id));
    toast("সদস্য মুছে ফেলা হয়েছে", "warn");
  };

  const filtered = members.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()) || m.roomNo.includes(search));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>সদস্য ম্যানেজমেন্ট</h2>
          <p style={{ color: "#888", fontSize: 13, margin: "4px 0 0" }}>মোট {members.length} জন সদস্য</p>
        </div>
        <Btn variant="primary" onClick={openAdd}>+ নতুন সদস্য</Btn>
      </div>

      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 নাম বা রুম নম্বর দিয়ে খুঁজুন..."
        style={{ width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 14, marginBottom: 16, boxSizing: "border-box", background: "#fafafa", outline: "none" }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {filtered.map((m: any) => {
          const meals = memberMeals[m.id] || 0;
          const billedMeals = Math.max(0, meals - (m.isManager ? (m.freeMeals || 0) : 0));
          const bill = billedMeals * mealRate;
          return (
            <div key={m.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Avatar name={m.name} id={m.id} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                    {m.name} {m.isManager && <Badge label="ম্যানেজার" color="purple" />}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>রুম #{m.roomNo} · যোগদান: {formatDate(m.joinDate)}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "#f8f8f8", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1D9E75" }}>{meals}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>এ মাসের মিল</div>
                </div>
                <div style={{ width: 1, background: "#eee" }} />
                <div style={{ textAlign: "center", position: "relative" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#E24B4A" }}>৳{bill.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>বিল (@৳{mealRate}/মিল)</div>
                  {m.isManager && m.freeMeals > 0 && <span style={{ position: "absolute", top: -8, right: -4, fontSize: 9, background: "#EEEDFE", color: "#3C3489", padding: "1px 4px", borderRadius: 4 }}>-{m.freeMeals} মিল ফ্রি</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" size="sm" onClick={() => openEdit(m)} style={{ flex: 1 }}>✏️ সম্পাদনা</Btn>
                <Btn variant="danger" size="sm" onClick={() => deleteMember(m.id)} style={{ flex: 1 }}>🗑️ মুছুন</Btn>
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <Modal title={editMember ? "সদস্যের তথ্য সম্পাদনা" : "নতুন সদস্য যোগ"} onClose={() => setShowAdd(false)}>
          <InputField label="সদস্যের নাম" value={form.name} onChange={(v: string) => setForm(p => ({ ...p, name: v }))} placeholder="পুরো নাম লিখুন" required />
          <InputField label="রুম নম্বর" value={form.roomNo} onChange={(v: string) => setForm(p => ({ ...p, roomNo: v }))} placeholder="যেমন: 101" />
          <InputField label="যোগদানের তারিখ" type="date" value={form.joinDate} onChange={(v: string) => setForm(p => ({ ...p, joinDate: v }))} />
          
          <div style={{ marginBottom: 14, background: "#f8f8f8", padding: 12, borderRadius: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
              <input type="checkbox" checked={form.isManager} onChange={e => setForm(p => ({ ...p, isManager: e.target.checked }))} />
              এই সদস্য একজন ম্যানেজার
            </label>
            {form.isManager && (
              <div style={{ marginTop: 10 }}>
                <InputField label="বিনামূল্যে মিল (প্রতি মাসে)" type="number" min={0} value={form.freeMeals} onChange={(v: string) => setForm(p => ({ ...p, freeMeals: parseInt(v) || 0 }))} placeholder="0" />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>বাতিল</Btn>
            <Btn variant="primary" onClick={saveMember}>{editMember ? "আপডেট করুন" : "সদস্য যোগ করুন"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE: MEAL MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════
function MealsPage({ members, mealLogs, setMealLogs, toast }: any) {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [copyFrom, setCopyFrom] = useState("");

  const getLog = useCallback((date: string) => mealLogs[date] || {}, [mealLogs]);
  const log = getLog(selectedDate);

  const toggle = (memberId: string, slot: string) => {
    setMealLogs((prev: any) => {
      const dateLog = { ...(prev[selectedDate] || {}) };
      const memberSlots = { ...(dateLog[memberId] || { morning: false, lunch: false, dinner: false }) };
      memberSlots[slot] = !memberSlots[slot];
      dateLog[memberId] = memberSlots;
      return { ...prev, [selectedDate]: dateLog };
    });
  };

  const setAllSlot = (slot: string, val: boolean) => {
    setMealLogs((prev: any) => {
      const dateLog = { ...(prev[selectedDate] || {}) };
      members.forEach((m: any) => {
        dateLog[m.id] = { ...(dateLog[m.id] || { morning: false, lunch: false, dinner: false }), [slot]: val };
      });
      return { ...prev, [selectedDate]: dateLog };
    });
  };

  const setAllMember = (memberId: string, val: boolean) => {
    setMealLogs((prev: any) => {
      const dateLog = { ...(prev[selectedDate] || {}) };
      dateLog[memberId] = { morning: val, lunch: val, dinner: val };
      return { ...prev, [selectedDate]: dateLog };
    });
  };

  const copyDay = () => {
    if (!copyFrom) { toast("তারিখ বেছে নিন!", "error"); return; }
    const fromLog = mealLogs[copyFrom];
    if (!fromLog) { toast("ঐ তারিখের কোনো ডেটা নেই!", "error"); return; }
    setMealLogs((prev: any) => ({ ...prev, [selectedDate]: JSON.parse(JSON.stringify(fromLog)) }));
    toast(`${formatDate(copyFrom)} থেকে কপি হয়েছে ✓`);
  };

  const morningCount = members.filter((m: any) => log[m.id]?.morning).length;
  const lunchCount   = members.filter((m: any) => log[m.id]?.lunch).length;
  const dinnerCount  = members.filter((m: any) => log[m.id]?.dinner).length;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>মিল ম্যানেজমেন্ট</h2>
        <p style={{ color: "#888", fontSize: 13, margin: "4px 0 0" }}>প্রতিটি সদস্যের প্রতিটি মিল নিয়ন্ত্রণ করুন</p>
      </div>

      {/* Date + Copy controls */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 500 }}>তারিখ বেছে নিন</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: "9px 13px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, background: "#fafafa", outline: "none", width: "100%", boxSizing: "border-box" }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5, fontWeight: 500 }}>এই তারিখ থেকে কপি করুন</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="date" value={copyFrom} onChange={e => setCopyFrom(e.target.value)}
              style={{ flex: 1, padding: "9px 13px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, background: "#fafafa", outline: "none", boxSizing: "border-box" }} />
            <Btn variant="secondary" onClick={copyDay}>কপি</Btn>
          </div>
        </div>
      </div>

      {/* Count summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "#E1F5EE", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#085041" }}>{morningCount}</div>
          <div style={{ fontSize: 12, color: "#0F6E56" }}>সকালের মিল</div>
        </div>
        <div style={{ background: "#FAEEDA", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#633806" }}>{lunchCount}</div>
          <div style={{ fontSize: 12, color: "#854F0B" }}>দুপুরের মিল</div>
        </div>
        <div style={{ background: "#EEEDFE", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#3C3489" }}>{dinnerCount}</div>
          <div style={{ fontSize: 12, color: "#534AB7" }}>রাতের মিল</div>
        </div>
      </div>

      {/* Bulk controls */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#555" }}>⚡ বাল্ক কন্ট্রোল</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn size="sm" variant="secondary" onClick={() => { setAllSlot("morning", true); setAllSlot("lunch", true); setAllSlot("dinner", true); toast("সবার সব মিল চালু ✓"); }}>✅ সবার সব মিল চালু</Btn>
          <Btn size="sm" variant="ghost" onClick={() => { setAllSlot("morning", false); setAllSlot("lunch", false); setAllSlot("dinner", false); toast("সবার সব মিল বন্ধ", "warn"); }}>❌ সবার সব মিল বন্ধ</Btn>
          <Btn size="sm" variant="secondary" onClick={() => { setAllSlot("morning", true); toast("সবার সকালের মিল চালু ✓"); }}>🌅 সব সকাল চালু</Btn>
          <Btn size="sm" variant="secondary" onClick={() => { setAllSlot("lunch", true);  toast("সবার দুপুরের মিল চালু ✓"); }}>☀️ সব দুপুর চালু</Btn>
          <Btn size="sm" variant="secondary" onClick={() => { setAllSlot("dinner", true); toast("সবার রাতের মিল চালু ✓"); }}>🌙 সব রাত চালু</Btn>
        </div>
      </div>

      {/* Member meal table */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 110px 80px", gap: 0, background: "#f5f5f5", padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#666" }}>
          <div>সদস্য</div>
          <div style={{ textAlign: "center" }}>🌅 সকাল</div>
          <div style={{ textAlign: "center" }}>☀️ দুপুর</div>
          <div style={{ textAlign: "center" }}>🌙 রাত</div>
          <div style={{ textAlign: "center" }}>সব</div>
        </div>

        {members.map((m: any, idx: number) => {
          const slots = log[m.id] || { morning: false, lunch: false, dinner: false };
          const allOn = slots.morning && slots.lunch && slots.dinner;
          return (
            <div key={m.id} style={{
              display: "grid", gridTemplateColumns: "1fr 110px 110px 110px 80px",
              alignItems: "center", padding: "10px 16px",
              borderTop: idx > 0 ? "1px solid #f0f0f0" : "none",
              background: allOn ? "#f9fffc" : "transparent",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={m.name} id={m.id} size={32} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>রুম #{m.roomNo}</div>
                </div>
              </div>
              {["morning", "lunch", "dinner"].map(slot => (
                <div key={slot} style={{ textAlign: "center" }}>
                  <button
                    onClick={() => toggle(m.id, slot)}
                    style={{
                      width: 44, height: 26, borderRadius: 13,
                      border: "none", cursor: "pointer", transition: "all .2s",
                      background: slots[slot as keyof typeof slots] ? (slot === "morning" ? "#1D9E75" : slot === "lunch" ? "#EF9F27" : "#7F77DD") : "#e5e5e5",
                      position: "relative",
                    }}
                    title={slots[slot as keyof typeof slots] ? "চালু — ক্লিক করে বন্ধ করুন" : "বন্ধ — ক্লিক করে চালু করুন"}
                  >
                    <span style={{
                      position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%",
                      background: "#fff", transition: "all .2s",
                      left: slots[slot as keyof typeof slots] ? "calc(100% - 23px)" : 3,
                    }} />
                  </button>
                </div>
              ))}
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setAllMember(m.id, !allOn)}
                  style={{
                    fontSize: 11, padding: "3px 8px", borderRadius: 6,
                    border: `1px solid ${allOn ? "#E24B4A" : "#1D9E75"}`,
                    background: allOn ? "#FFF0F0" : "#F0FFF8",
                    color: allOn ? "#E24B4A" : "#1D9E75",
                    cursor: "pointer", fontWeight: 600,
                  }}
                >{allOn ? "সব বন্ধ" : "সব চালু"}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE: BAZAAR (Smart Calculator)
// ══════════════════════════════════════════════════════════════════════════════
function BazaarPage({ members, mealLogs, ingredientRatios, setIngredientRatios, toast, reliableCopy }: any) {
  const [morningCount, setMorningCount] = useState(() => {
    const log = mealLogs[TODAY] || {};
    return members.filter((m: any) => log[m.id]?.morning).length || 0;
  });
  const [lunchCount, setLunchCount]   = useState(() => {
    const log = mealLogs[TODAY] || {};
    return members.filter((m: any) => log[m.id]?.lunch).length || 0;
  });
  const [dinnerCount, setDinnerCount] = useState(() => {
    const log = mealLogs[TODAY] || {};
    return members.filter((m: any) => log[m.id]?.dinner).length || 0;
  });
  const [useToday, setUseToday] = useState(true);
  const [editRatios, setEditRatios] = useState(false);
  const [ratioForm, setRatioForm] = useState(ingredientRatios);
  const [showList, setShowList] = useState(false);

  // +1 for "খালা" rule
  const effectiveMorning = morningCount > 0 ? morningCount + 1 : 0;
  const effectiveLunch   = lunchCount   > 0 ? lunchCount   + 1 : 0;
  const effectiveDinner  = dinnerCount  > 0 ? dinnerCount  + 1 : 0;

  useEffect(() => {
    if (useToday) {
      const log = mealLogs[TODAY] || {};
      setMorningCount(members.filter((m: any) => log[m.id]?.morning).length);
      setLunchCount(members.filter((m: any) => log[m.id]?.lunch).length);
      setDinnerCount(members.filter((m: any) => log[m.id]?.dinner).length);
    }
  }, [useToday, mealLogs, members]);

  const formatQty = (qty: number, unit: string) => {
    if (unit === "কেজি" || unit === "লিটার") return qty.toFixed(2) + " " + unit;
    if (qty >= 1000) return (qty / 1000).toFixed(2) + (unit === "মিলি" ? " লিটার" : " কেজি");
    return Math.round(qty) + " " + unit;
  };

  // Rice calculation
  const riceTotal = {
    morning: effectiveMorning * RICE_RULES.morning,
    lunch:   effectiveLunch   * RICE_RULES.lunch,
    dinner:  effectiveDinner  * RICE_RULES.dinner,
    total:   effectiveMorning * RICE_RULES.morning + effectiveLunch * RICE_RULES.lunch + effectiveDinner * RICE_RULES.dinner,
  };

  const saveRatios = () => {
    setIngredientRatios(ratioForm);
    setEditRatios(false);
    toast("উপাদানের পরিমাণ আপডেট হয়েছে ✓");
  };

  const generateListText = () => {
    const lines = [`📋 বাজারের তালিকা — ${formatDate(TODAY)}`, ``, `📊 মিল সংখ্যা:`, `সকাল: ${morningCount}+১ = ${effectiveMorning} জন`, `দুপুর: ${lunchCount}+১ = ${effectiveLunch} জন`, `রাত: ${dinnerCount}+১ = ${effectiveDinner} জন`, ``];
    lines.push(`🍚 চাল:`, `  সকাল: ${formatQty(riceTotal.morning, "গ্রাম")}`, `  দুপুর: ${formatQty(riceTotal.lunch, "গ্রাম")}`, `  রাত: ${formatQty(riceTotal.dinner, "গ্রাম")}`, `  মোট: ${formatQty(riceTotal.total, "গ্রাম")}`, ``);
    lines.push(`🧂 মশলা ও অন্যান্য:`);
    Object.entries(ingredientRatios).forEach(([key, item]: any) => {
      const qty = (effectiveMorning + effectiveLunch + effectiveDinner) * item.perMeal;
      lines.push(`  ${item.label}: ${formatQty(qty, item.unit)}`);
    });
    return lines.join("\n");
  };

  const copyToClipboard = () => {
    reliableCopy(generateListText());
  };

  const addNewIngredient = () => {
    const newId = "item_" + Date.now();
    setRatioForm((p: any) => ({ ...p, [newId]: { label: "নতুন উপাদান", unit: "গ্রাম", perMeal: 1 } }));
  };

  const deleteIngredient = (key: string) => {
    setRatioForm((p: any) => {
      const next = { ...p };
      delete next[key];
      return next;
    });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>স্মার্ট বাজার ক্যালকুলেটর</h2>
          <p style={{ color: "#888", fontSize: 13, margin: "4px 0 0" }}>মিল সংখ্যা দিন — পরিমাণ স্বয়ংক্রিয়ভাবে হিসাব হবে</p>
        </div>
        <Btn variant="secondary" size="sm" onClick={() => setEditRatios(true)}>⚙️ উপাদানের রেশিও পরিবর্তন</Btn>
      </div>

      {/* Auto-fill from today's log toggle */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>মিল সংখ্যা ইনপুট</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={useToday} onChange={e => setUseToday(e.target.checked)} />
            আজকের মিল লগ থেকে স্বয়ংক্রিয়ভাবে নিন
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 14 }}>
          {[
            { label: "🌅 সকালের মিল", val: morningCount, set: setMorningCount, bg: "#E1F5EE", fg: "#085041" },
            { label: "☀️ দুপুরের মিল", val: lunchCount,   set: setLunchCount,   bg: "#FAEEDA", fg: "#633806" },
            { label: "🌙 রাতের মিল",  val: dinnerCount,  set: setDinnerCount,  bg: "#EEEDFE", fg: "#3C3489" },
          ].map(({ label, val, set, bg, fg }) => (
            <div key={label} style={{ background: bg, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, color: fg, fontWeight: 500, marginBottom: 8 }}>{label}</div>
              <input
                type="number" min={0} max={60} value={val}
                onChange={e => { setUseToday(false); set(parseInt(e.target.value) || 0); }}
                disabled={useToday}
                style={{ width: "100%", padding: "8px 10px", border: "none", borderRadius: 7, fontSize: 18, fontWeight: 700, textAlign: "center", background: "rgba(255,255,255,.7)", color: fg, boxSizing: "border-box", outline: "none" }}
              />
              {val > 0 && <div style={{ fontSize: 11, color: fg, marginTop: 4, textAlign: "center" }}>+১ খালার মিল = {val + 1} জন</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Rules info */}
      <div style={{ background: "#f0fff8", border: "1px solid #9FE1CB", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#085041" }}>
        <strong>চালের নিয়ম:</strong> সকাল ১০০গ্রাম/জন · দুপুর ২০০গ্রাম/জন · রাত ১৭০গ্রাম/জন &nbsp;|&nbsp;
        <strong>পদ:</strong> সকাল ১টি · দুপুর ৪টি · রাত ৩টি &nbsp;|&nbsp; প্রতিটি স্লটে +১ (খালার মিল)
      </div>

      {/* Rice calculation */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>🍚 চাল হিসাব</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8f8f8" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#555", borderRadius: "6px 0 0 6px" }}>স্লট</th>
              <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600, color: "#555" }}>জন</th>
              <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600, color: "#555" }}>প্রতিজন</th>
              <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "#555", borderRadius: "0 6px 6px 0" }}>মোট চাল</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "🌅 সকাল", count: effectiveMorning, per: RICE_RULES.morning },
              { label: "☀️ দুপুর", count: effectiveLunch,   per: RICE_RULES.lunch },
              { label: "🌙 রাত",   count: effectiveDinner,  per: RICE_RULES.dinner },
            ].map(row => (
              <tr key={row.label} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "10px 12px" }}>{row.label}</td>
                <td style={{ padding: "10px 12px", textAlign: "center", color: "#888" }}>{row.count} জন</td>
                <td style={{ padding: "10px 12px", textAlign: "center", color: "#888" }}>{row.per}গ্রাম</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#1D9E75" }}>{formatQty(row.count * row.per, "গ্রাম")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f0fff8" }}>
              <td colSpan={3} style={{ padding: "10px 12px", fontWeight: 700 }}>মোট চাল</td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, fontSize: 16, color: "#085041" }}>{formatQty(riceTotal.total, "গ্রাম")}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Ingredients */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>🧂 মশলা ও অন্যান্য উপাদান</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
          {Object.entries(ingredientRatios).map(([key, item]: any) => {
            const totalMeals = effectiveMorning + effectiveLunch + effectiveDinner;
            const qty = totalMeals * item.perMeal;
            return (
              <div key={key} style={{ background: "#f8f8f8", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>প্রতি মিলে {item.perMeal}{item.unit}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#E24B4A" }}>{formatQty(qty, item.unit)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side dishes reminder */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🥘 পদের সংখ্যা মনে করিয়ে দিচ্ছি</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { label: "🌅 সকাল", count: SIDE_DISH_SLOTS.morning, color: "#E1F5EE", fg: "#085041" },
            { label: "☀️ দুপুর", count: SIDE_DISH_SLOTS.lunch,   color: "#FAEEDA", fg: "#633806" },
            { label: "🌙 রাত",   count: SIDE_DISH_SLOTS.dinner,  color: "#EEEDFE", fg: "#3C3489" },
          ].map(s => (
            <div key={s.label} style={{ background: s.color, borderRadius: 10, padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.fg }}>{s.count}</div>
              <div style={{ fontSize: 13, color: s.fg, fontWeight: 500 }}>{s.label} পদ</div>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Btn variant="primary" onClick={copyToClipboard}>📋 WhatsApp-এ পাঠাতে কপি করুন</Btn>
        <Btn variant="secondary" onClick={() => setShowList(true)}>👁️ পূর্ণ তালিকা দেখুন</Btn>
      </div>

      {/* Ratio Editor Modal */}
      {editRatios && (
        <Modal title="⚙️ উপাদানের পরিমাণ পরিবর্তন" onClose={() => { setRatioForm(ingredientRatios); setEditRatios(false); }} width={520}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>প্রতিটি মিলের জন্য প্রতি সদস্যের উপাদানের পরিমাণ</div>
          {Object.entries(ratioForm).map(([key, item]: any) => (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 40px", gap: 8, alignItems: "end", marginBottom: 10, background: "#f8f8f8", borderRadius: 8, padding: "10px 12px" }}>
              <InputField label="নাম" value={item.label} onChange={(v: string) => setRatioForm((p: any) => ({ ...p, [key]: { ...p[key], label: v } }))} style={{ marginBottom: 0 }} />
              <InputField label={`পরিমাণ (${item.unit})`} type="number" step="0.5" value={item.perMeal} onChange={(v: string) => setRatioForm((p: any) => ({ ...p, [key]: { ...p[key], perMeal: parseFloat(v) || 0 } }))} style={{ marginBottom: 0 }} />
              <SelectField label="একক" value={item.unit} onChange={(v: string) => setRatioForm((p: any) => ({ ...p, [key]: { ...p[key], unit: v } }))}
                options={["গ্রাম","কেজি","মিলি","লিটার","টি"].map(u => ({ value: u, label: u }))} />
              <div style={{ marginBottom: 14 }}>
                <Btn variant="danger" size="sm" onClick={() => deleteIngredient(key)} style={{ width: "100%", padding: "9px 0" }}>🗑️</Btn>
              </div>
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <Btn variant="secondary" size="sm" onClick={addNewIngredient}>+ নতুন উপাদান যোগ করুন</Btn>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
            <Btn variant="secondary" onClick={() => { setRatioForm(ingredientRatios); setEditRatios(false); }}>বাতিল</Btn>
            <Btn variant="primary" onClick={saveRatios}>সেভ করুন</Btn>
          </div>
        </Modal>
      )}

      {/* Full List Modal */}
      {showList && (
        <Modal title="📋 সম্পূর্ণ বাজারের তালিকা" onClose={() => setShowList(false)} width={500}>
          <pre style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", background: "#f8f8f8", borderRadius: 10, padding: 16, fontFamily: "monospace" }}>
            {generateListText()}
          </pre>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="primary" onClick={copyToClipboard}>📋 কপি করুন</Btn>
            <Btn variant="secondary" onClick={() => setShowList(false)}>বন্ধ করুন</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE: EXPENSES
// ══════════════════════════════════════════════════════════════════════════════
function ExpensesPage({ expenses, setExpenses, toast }: any) {
  const [form, setForm] = useState({ desc: "", amount: "", type: "বাজার", date: TODAY, paidBy: "ম্যানেজার" });
  const [filter, setFilter] = useState("all");
  const [editId, setEditId] = useState<number | null>(null);

  const months = [...new Set(expenses.map((e: any) => e.date.slice(0, 7)))].sort().reverse() as string[];
  const selectedMonth = filter === "all" ? null : filter;
  const filtered = selectedMonth ? expenses.filter((e: any) => e.date.startsWith(selectedMonth)) : expenses;
  const totalFiltered = filtered.reduce((s: number, e: any) => s + e.amount, 0);

  const byType: any = {};
  filtered.forEach((e: any) => { byType[e.type] = (byType[e.type] || 0) + e.amount; });

  const addExpense = () => {
    if (!form.desc.trim() || !form.amount) { toast("বিবরণ ও পরিমাণ দিন!", "error"); return; }
    if (editId !== null) {
      setExpenses((prev: any) => prev.map((e: any) => e.id === editId ? { ...e, ...form, amount: parseFloat(form.amount) } : e));
      toast("খরচ আপডেট হয়েছে ✓");
      setEditId(null);
    } else {
      const newExp = { id: Date.now(), ...form, amount: parseFloat(form.amount) };
      setExpenses((prev: any) => [newExp, ...prev]);
      toast("খরচ যোগ হয়েছে ✓");
    }
    setForm({ desc: "", amount: "", type: "বাজার", date: TODAY, paidBy: "ম্যানেজার" });
  };

  const deleteExpense = (id: number) => {
    if (!window.confirm("এই খরচ মুছে ফেলবেন?")) return;
    setExpenses((prev: any) => prev.filter((e: any) => e.id !== id));
    toast("খরচ মুছে ফেলা হয়েছে", "warn");
  };

  const startEdit = (e: any) => {
    setForm({ desc: e.desc, amount: String(e.amount), type: e.type, date: e.date, paidBy: e.paidBy });
    setEditId(e.id);
    window.scrollTo(0, 0);
  };

  const typeColors: any = { "বাজার": "green", "গ্যাস": "amber", "বিদ্যুৎ": "blue", "পানি": "blue", "অন্যান্য": "purple" };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>খরচ ম্যানেজমেন্ট</h2>
        <p style={{ color: "#888", fontSize: 13, margin: "4px 0 0" }}>সকল খরচ ট্র্যাক করুন</p>
      </div>

      {/* Add/Edit Form */}
      <div style={{ background: "#fff", border: `1.5px solid ${editId !== null ? "#EF9F27" : "#eee"}`, borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          {editId !== null ? "✏️ খরচ সম্পাদনা" : "➕ নতুন খরচ যোগ করুন"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputField label="বিবরণ" value={form.desc} onChange={(v: string) => setForm(p => ({ ...p, desc: v }))} placeholder="যেমন: আজকের বাজার" required />
          <InputField label="পরিমাণ (৳)" type="number" value={form.amount} onChange={(v: string) => setForm(p => ({ ...p, amount: v }))} placeholder="0.00" required />
          <SelectField label="ধরন" value={form.type} onChange={(v: string) => setForm(p => ({ ...p, type: v }))}
            options={["বাজার","গ্যাস","বিদ্যুৎ","পানি","অন্যান্য"].map(t => ({ value: t, label: t }))} />
          <InputField label="তারিখ" type="date" value={form.date} onChange={(v: string) => setForm(p => ({ ...p, date: v }))} />
        </div>
        <InputField label="পরিশোধ করেছেন" value={form.paidBy} onChange={(v: string) => setForm(p => ({ ...p, paidBy: v }))} placeholder="ম্যানেজার / সদস্যের নাম" />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant={editId !== null ? "warning" : "primary"} onClick={addExpense}>{editId !== null ? "আপডেট করুন" : "খরচ যোগ করুন"}</Btn>
          {editId !== null && <Btn variant="secondary" onClick={() => { setEditId(null); setForm({ desc: "", amount: "", type: "বাজার", date: TODAY, paidBy: "ম্যানেজার" }); }}>বাতিল</Btn>}
        </div>
      </div>

      {/* Type summary */}
      {Object.keys(byType).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 20 }}>
          {Object.entries(byType).map(([type, amt]) => (
            <div key={type} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: "#888" }}>{type}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#E24B4A" }}>৳{(amt as number).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "#bbb" }}>{(((amt as number) / totalFiltered) * 100).toFixed(0)}%</div>
            </div>
          ))}
          <div style={{ background: "#f0fff8", border: "1px solid #9FE1CB", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 12, color: "#0F6E56" }}>মোট খরচ</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#085041" }}>৳{totalFiltered.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Month filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <button onClick={() => setFilter("all")} style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid " + (filter === "all" ? "#1D9E75" : "#ddd"), background: filter === "all" ? "#E1F5EE" : "#fff", color: filter === "all" ? "#085041" : "#555", fontSize: 13, cursor: "pointer", fontWeight: filter === "all" ? 600 : 400 }}>সব</button>
        {months.map(m => (
          <button key={m} onClick={() => setFilter(m)} style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid " + (filter === m ? "#1D9E75" : "#ddd"), background: filter === m ? "#E1F5EE" : "#fff", color: filter === m ? "#085041" : "#555", fontSize: 13, cursor: "pointer", fontWeight: filter === m ? 600 : 400 }}>{m}</button>
        ))}
      </div>

      {/* Expense list */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#bbb", fontSize: 14 }}>কোনো খরচ নেই</div>
        ) : (
          filtered.map((e: any, idx: number) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: idx > 0 ? "1px solid #f5f5f5" : "none", background: editId === e.id ? "#FFFAEE" : "transparent" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{e.desc}</span>
                  <Badge label={e.type} color={typeColors[e.type] || "blue"} />
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{formatDate(e.date)} · {e.paidBy}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#E24B4A" }}>৳{e.amount.toLocaleString()}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="ghost" onClick={() => startEdit(e)}>✏️</Btn>
                <Btn size="sm" variant="ghost" onClick={() => deleteExpense(e.id)} style={{ color: "#E24B4A" }}>🗑️</Btn>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE: ACCOUNTS / BILLS
// ══════════════════════════════════════════════════════════════════════════════
function AccountsPage({ members, mealLogs, expenses, mealRate, setMealRate, deposits, setDeposits, toast }: any) {
  const [selectedMonth, setSelectedMonth] = useState(TODAY.slice(0, 7));
  const [editRate, setEditRate] = useState(false);
  const [rateInput, setRateInput] = useState(String(mealRate));
  
  const [depositModal, setDepositModal] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositAction, setDepositAction] = useState("add");

  const memberMeals = useMemo(() => {
    const map: any = {};
    members.forEach((m: any) => { map[m.id] = { morning: 0, lunch: 0, dinner: 0 }; });
    Object.entries(mealLogs).forEach(([date, log]: any) => {
      if (!date.startsWith(selectedMonth)) return;
      Object.entries(log).forEach(([mid, slots]: any) => {
        const id = parseInt(mid);
        if (map[id]) {
          if (slots.morning) map[id].morning += 0.5;
          if (slots.lunch)   map[id].lunch += 1;
          if (slots.dinner)  map[id].dinner += 0.5;
        }
      });
    });
    return map;
  }, [mealLogs, members, selectedMonth]);

  const totalMeals: number = useMemo(() => Object.values(memberMeals).reduce((s: any, v: any) => s + v.morning + v.lunch + v.dinner, 0) as number, [memberMeals]);
  const totalExpense = useMemo(() => expenses.filter((e: any) => e.date.startsWith(selectedMonth)).reduce((s: any, e: any) => s + e.amount, 0), [expenses, selectedMonth]);
  const calculatedRate = totalMeals > 0 ? totalExpense / totalMeals : 0;

  const months = useMemo(() => {
    const ms = new Set([TODAY.slice(0, 7)]);
    Object.keys(mealLogs).forEach(d => ms.add(d.slice(0, 7)));
    expenses.forEach((e: any) => ms.add(e.date.slice(0, 7)));
    return [...ms].sort().reverse();
  }, [mealLogs, expenses]);

  const handleDepositAction = () => {
    if (!depositModal) return;
    const key = `${selectedMonth}_${depositModal.member.id}`;
    let current = deposits[key] || 0;
    let v = parseFloat(depositAmount) || 0;
    if (depositAction === "add") current += v;
    else if (depositAction === "sub") current -= v;
    else if (depositAction === "set") current = v;
    setDeposits((prev: any) => ({ ...prev, [key]: Math.max(0, current) }));
    setDepositModal(null);
    setDepositAmount("");
    toast("জমা আপডেট হয়েছে ✓");
  };

  const saveRate = () => {
    const r = parseFloat(rateInput);
    if (!r || r <= 0) { toast("সঠিক রেট দিন!", "error"); return; }
    setMealRate(r);
    setEditRate(false);
    toast(`মিল রেট আপডেট: ৳${r}/মিল ✓`);
  };

  const totalBilled = members.reduce((s: number, m: any) => {
    const rawMeals = (memberMeals[m.id]?.morning || 0) + (memberMeals[m.id]?.lunch || 0) + (memberMeals[m.id]?.dinner || 0);
    const billedMeals = Math.max(0, rawMeals - (m.isManager ? (m.freeMeals || 0) : 0));
    return s + billedMeals * mealRate;
  }, 0);
  const totalCollected = members.reduce((s: number, m: any) => {
    const key = `${selectedMonth}_${m.id}`;
    return s + (deposits[key] || 0);
  }, 0);
  const outstanding = Math.max(0, totalBilled - totalCollected);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>হিসাব ও বিল</h2>
          <p style={{ color: "#888", fontSize: 13, margin: "4px 0 0" }}>মাসিক বিল ও সংগ্রহ পরিচালনা</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, background: "#fafafa", cursor: "pointer", outline: "none" }}>
            {months.map((m: string) => <option key={m} value={m}>{m}</option>)}
          </select>
          <Btn variant="secondary" size="sm" onClick={() => setEditRate(true)}>⚙️ মিল রেট</Btn>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="মোট মিল" value={totalMeals} unit="টি" color="#378ADD" icon="🍽️" />
        <StatCard label="মোট খরচ" value={"৳" + totalExpense.toLocaleString()} color="#E24B4A" icon="💸" />
        <StatCard label="হিসাব রেট" value={"৳" + calculatedRate.toFixed(0)} unit="/মিল" color="#EF9F27" icon="📊" />
        <StatCard label="বর্তমান রেট" value={"৳" + mealRate} unit="/মিল" color="#1D9E75" icon="💡" />
        <StatCard label="মোট বিল" value={"৳" + totalBilled.toLocaleString()} color="#7F77DD" icon="🧾" />
        <StatCard label="বাকি আদায়" value={"৳" + outstanding.toLocaleString()} color={outstanding > 0 ? "#E24B4A" : "#1D9E75"} icon="⚠️" />
      </div>

      {calculatedRate > 0 && Math.abs(calculatedRate - mealRate) > 2 && (
        <div style={{ background: "#FAEEDA", border: "1px solid #EF9F27", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#633806" }}>
          ⚠️ হিসাব করা রেট (৳{calculatedRate.toFixed(0)}) এবং বর্তমান রেট (৳{mealRate}) এর মধ্যে পার্থক্য আছে।
          <button onClick={() => saveRate()} style={{ marginLeft: 8, background: "none", border: "none", color: "#854F0B", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
            হিসাব রেট ব্যবহার করুন
          </button>
        </div>
      )}

      {/* Bill table */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 110px", background: "#f5f5f5", padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#666" }}>
          <div>সদস্য</div>
          <div style={{ textAlign: "center" }}>সকাল</div>
          <div style={{ textAlign: "center" }}>দুপুর</div>
          <div style={{ textAlign: "center" }}>রাত</div>
          <div style={{ textAlign: "right" }}>বিল</div>
          <div style={{ textAlign: "right", color: "#1D9E75" }}>জমা</div>
          <div style={{ textAlign: "center" }}>অ্যাকশন</div>
        </div>
        {members.map((m: any, idx: number) => {
          const sl = memberMeals[m.id] || { morning: 0, lunch: 0, dinner: 0 };
          const totalM = sl.morning + sl.lunch + sl.dinner;
          const billedM = Math.max(0, totalM - (m.isManager ? (m.freeMeals || 0) : 0));
          const bill = billedM * mealRate;
          const key = `${selectedMonth}_${m.id}`;
          const currentDep = deposits[key] || 0;
          const due = Math.max(0, bill - currentDep);
          const isPaidOut = bill > 0 && currentDep >= bill;
          return (
            <div key={m.id} style={{
              display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 110px",
              alignItems: "center", padding: "10px 16px",
              borderTop: idx > 0 ? "1px solid #f0f0f0" : "none",
              background: isPaidOut ? "#f8fff8" : bill === 0 ? "#fafafa" : "transparent",
              opacity: bill === 0 ? 0.5 : 1,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={m.name} id={m.id} size={30} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</span>
                {m.isManager && <span style={{ fontSize: 9, background: "#EEEDFE", color: "#3C3489", padding: "2px 4px", borderRadius: 4 }}>মাফি {m.freeMeals}</span>}
              </div>
              <div style={{ textAlign: "center", fontSize: 13, color: "#888" }}>{sl.morning}</div>
              <div style={{ textAlign: "center", fontSize: 13, color: "#888" }}>{sl.lunch}</div>
              <div style={{ textAlign: "center", fontSize: 13, color: "#888" }}>{sl.dinner}</div>
              <div style={{ textAlign: "right", fontSize: 14, fontWeight: 700, color: bill === 0 ? "#bbb" : "#E24B4A" }}>
                {bill === 0 ? "—" : "৳" + bill.toLocaleString()}
              </div>
              <div style={{ textAlign: "right", fontSize: 14, fontWeight: 700, color: currentDep > 0 ? "#1D9E75" : "#bbb" }}>
                {currentDep === 0 ? "—" : "৳" + currentDep.toLocaleString()}
              </div>
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setDepositModal({ member: m })}
                  style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 600, border: "none",
                    background: due === 0 && bill > 0 ? "#EAF3DE" : "#fff",
                    color: due === 0 && bill > 0 ? "#27500A" : "#0F6E56",
                    boxShadow: "0 1px 2px rgba(0,0,0,.05)", borderInline: "1px solid #eee", borderBlock: "1px solid #eee"
                  }}
                >{isPaidOut ? "✓ পেইড" : (currentDep > 0 ? `বাকি ৳${due}` : "+ জমা")}</button>
              </div>
            </div>
          );
        })}
        {/* Footer */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 110px", padding: "12px 16px", background: "#f0fff8", fontWeight: 700, fontSize: 14, borderTop: "2px solid #9FE1CB" }}>
          <div>মোট</div>
          <div style={{ textAlign: "center" }}>{Object.values(memberMeals).reduce((s: any, v: any) => s + v.morning, 0) as number}</div>
          <div style={{ textAlign: "center" }}>{Object.values(memberMeals).reduce((s: any, v: any) => s + v.lunch, 0) as number}</div>
          <div style={{ textAlign: "center" }}>{Object.values(memberMeals).reduce((s: any, v: any) => s + v.dinner, 0) as number}</div>
          <div style={{ textAlign: "right", color: "#E24B4A" }}>৳{totalBilled.toLocaleString()}</div>
          <div style={{ textAlign: "right", color: "#085041" }}>৳{totalCollected.toLocaleString()}</div>
          <div style={{ textAlign: "center", fontSize: 12, color: "#0F6E56" }}>বাকি ৳{outstanding.toLocaleString()}</div>
        </div>
      </div>

      {depositModal && (
        <Modal title={`💰 ${depositModal.member.name}-এর জমা`} onClose={() => setDepositModal(null)} width={380}>
          <div style={{ fontSize: 13, background: "#f9f9f9", padding: "12px", borderRadius: 8, marginBottom: 16 }}>
            বর্তমান জমার পরিমাণ: <strong>৳{deposits[`${selectedMonth}_${depositModal.member.id}`] || 0}</strong><br/>
            এই মাসের বিল: <strong>৳{Math.max(0, ((memberMeals[depositModal.member.id]?.morning || 0) + (memberMeals[depositModal.member.id]?.lunch || 0) + (memberMeals[depositModal.member.id]?.dinner || 0) - (depositModal.member.isManager ? (depositModal.member.freeMeals || 0) : 0)) * mealRate)}</strong>
          </div>
          
          <SelectField label="অ্যাকশন" value={depositAction} onChange={setDepositAction}
            options={[
              { label: "➕ বিদ্যমানে আরও যোগ করুন", value: "add" },
              { label: "✏️ নির্দিষ্ট পরিমাণ সেট করুন", value: "set" },
              { label: "➖ বিদ্যমান থেকে বিয়োগ করুন", value: "sub" }
            ]} />
            
          <InputField label="পরিমাণ (৳)" type="number" step="1" value={depositAmount} onChange={setDepositAmount} placeholder="0" required />
          
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
            <Btn variant="secondary" onClick={() => setDepositModal(null)}>বাতিল</Btn>
            <Btn variant="primary" onClick={handleDepositAction}>আপডেট করুন</Btn>
          </div>
        </Modal>
      )}

      {/* Rate editor modal */}
      {editRate && (
        <Modal title="⚙️ মিল রেট পরিবর্তন" onClose={() => setEditRate(false)} width={360}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>
            বর্তমান রেট: <strong>৳{mealRate}/মিল</strong><br />
            হিসাব করা রেট (এ মাস): <strong>৳{calculatedRate.toFixed(2)}/মিল</strong>
          </div>
          <InputField label="নতুন মিল রেট (৳)" type="number" step="0.5" value={rateInput} onChange={setRateInput} placeholder="যেমন: 101" required />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setEditRate(false)}>বাতিল</Btn>
            <Btn variant="primary" onClick={saveRate}>আপডেট করুন</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

import { db, auth } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN APP COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function AppWrapper() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
    });
  }, []);

  if (user === undefined) return <div style={{ padding: 40, textAlign: "center" }}>লোড হচ্ছে...</div>;

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f4f5f7" }}>
        <div style={{ background: "#fff", padding: "40px 30px", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", textAlign: "center", maxWidth: 360, width: "100%" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🍛</div>
          <h1 style={{ fontSize: 24, margin: "0 0 8px", fontWeight: 700 }}>MealMate BD</h1>
          <p style={{ color: "#666", fontSize: 14, margin: "0 0 24px" }}>আপনার মেস ম্যানেজার অ্যাকাউন্টে লগ ইন করুন</p>
          <button 
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
            style={{ width: "100%", background: "#4285F4", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ background: "#fff", borderRadius: "50%", padding: 2, display: "flex" }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </span>
            Google দিয়ে লগ ইন
          </button>
        </div>
      </div>
    );
  }

  return <MessApp user={user} />;
}

function MessApp({ user }: any) {
  const [isMounted, setIsMounted] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  
  const [members, setMembers] = useState(() => load("mm_members", INITIAL_MEMBERS));
  const [mealLogs, setMealLogs] = useState<any>(() => load("mm_meallogs", {}));
  const [expenses, setExpenses] = useState<any[]>(() => load("mm_expenses", []));
  const [mealRate, setMealRate] = useState(() => load("mm_mealrate", 101));
  const [ingredientRatios, setIngredientRatios] = useState(() => load("mm_ingredient_ratios", DEFAULT_INGREDIENT_RATIOS));
  const [deposits, setDeposits] = useState<any>(() => load("mm_deposits", {}));
  
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [toastTimer, setToastTimer] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const unsub = onSnapshot(doc(db, "appData", "mess1"), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.members) setMembers(d.members);
        if (d.mealLogs) setMealLogs(d.mealLogs);
        if (d.expenses) setExpenses(d.expenses);
        if (d.mealRate) setMealRate(d.mealRate);
        if (d.ingredientRatios) setIngredientRatios(d.ingredientRatios);
        if (d.deposits) setDeposits(d.deposits);
      } else {
        // Bootstrap from localStorage if nothing is in Firebase yet
        setDoc(doc(db, "appData", "mess1"), {
          members: load("mm_members", INITIAL_MEMBERS),
          mealLogs: load("mm_meallogs", {}),
          expenses: load("mm_expenses", []),
          mealRate: load("mm_mealrate", 101),
          ingredientRatios: load("mm_ingredient_ratios", DEFAULT_INGREDIENT_RATIOS),
          deposits: load("mm_deposits", {})
        });
      }
      setDataLoaded(true);
    });
    return () => unsub();
  }, []);

  // Sync back to Firebase on change (only if data is loaded)
  useEffect(() => {
    if (!dataLoaded) return;
    const t = setTimeout(() => {
      setDoc(doc(db, "appData", "mess1"), {
        members, mealLogs, expenses, mealRate, ingredientRatios, deposits
      }, { merge: true });
    }, 1000);
    return () => clearTimeout(t);
  }, [members, mealLogs, expenses, mealRate, ingredientRatios, deposits, dataLoaded]);

  const toast = useCallback((msg: string, type = "success") => {
    if (toastTimer) clearTimeout(toastTimer);
    setToastMsg(msg);
    setToastType(type);
    const t = setTimeout(() => setToastMsg(""), 2800);
    setToastTimer(t);
  }, [toastTimer]);

  const reliableCopy = useCallback((text: string) => {
    const fallback = () => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast("ক্লিপবোর্ডে কপি হয়েছে ✓");
      } catch (err) {
        toast("কপি ব্যর্থ, ম্যানুয়ালি কপি করুন", "error");
      }
      document.body.removeChild(textArea);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => toast("ক্লিপবোর্ডে কপি হয়েছে ✓")).catch(fallback);
    } else {
      fallback();
    }
  }, [toast]);

  const navItems = [
    { id: "dashboard", label: "ড্যাশবোর্ড", icon: "🏠" },
    { id: "meals",     label: "মিল",         icon: "🍛" },
    { id: "bazaar",    label: "বাজার",        icon: "🛒" },
    { id: "expenses",  label: "খরচ",          icon: "💸" },
    { id: "accounts",  label: "হিসাব",        icon: "📊" },
    { id: "members",   label: "সদস্য",        icon: "👥" },
  ];

  const pageProps = { members, setMembers, mealLogs, setMealLogs, expenses, setExpenses, mealRate, setMealRate, ingredientRatios, setIngredientRatios, deposits, setDeposits, toast, reliableCopy, onNav: setActivePage };

  if (!isMounted || !dataLoaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Top header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "#1D9E75", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍛</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>MealMate BD</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>{user?.displayName || "Admin"} · <span style={{ color: "#E24B4A", cursor: "pointer" }} onClick={() => signOut(auth)}>লগ আউট</span></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setActivePage(n.id)}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: activePage === n.id ? "#E1F5EE" : "transparent",
                  color: activePage === n.id ? "#085041" : "#666",
                  fontWeight: activePage === n.id ? 700 : 400, fontSize: 13,
                  transition: "all .15s",
                }}>
                <span style={{ marginRight: 4 }}>{n.icon}</span>
                <span className="hidden sm:inline">{n.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 80px" }}>
        {activePage === "dashboard" && <DashboardPage {...pageProps} />}
        {activePage === "meals"     && <MealsPage     {...pageProps} />}
        {activePage === "bazaar"    && <BazaarPage    {...pageProps} />}
        {activePage === "expenses"  && <ExpensesPage  {...pageProps} />}
        {activePage === "accounts"  && <AccountsPage  {...pageProps} />}
        {activePage === "members"   && <MembersPage   {...pageProps} />}
      </div>

      {/* Bottom mobile nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", display: "flex", zIndex: 100 }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setActivePage(n.id)}
            style={{
              flex: 1, padding: "10px 4px 12px", border: "none", background: "transparent",
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              color: activePage === n.id ? "#1D9E75" : "#aaa",
              borderTop: activePage === n.id ? "2px solid #1D9E75" : "2px solid transparent",
            }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: activePage === n.id ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </div>

      <Toast msg={toastMsg} type={toastType} />
    </div>
  );
}
