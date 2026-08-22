"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  // Target date: September 2, 2026 at 6:00 PM local time
  const targetDate = new Date("2026-09-02T18:00:00").getTime();

  // States
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  const [rsvp, setRsvp] = useState({
    name: "",
    attending: "yes",
    note: "",
  });

  const [guestbook, setGuestbook] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "" });
  const [isPlaying, setIsPlaying] = useState(false);
  const [petals, setPetals] = useState([]);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [envelopeFaded, setEnvelopeFaded] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);

  const audioRef = useRef(null);

  const handleEnvelopeOpen = () => {
    if (envelopeOpen) return;
    setEnvelopeOpen(true);
    
    // Autoplay audio on user interaction gesture
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log("Audio play prevented by browser policy", err);
      });
    }

    // Delay showing the main invitation
    setTimeout(() => {
      setShowInvitation(true);
    }, 1200);

    // Delay hiding the envelope wrapper completely
    setTimeout(() => {
      setEnvelopeFaded(true);
    }, 2000);
  };

  // Initialize petals
  useEffect(() => {
    const newPetals = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${10 + Math.random() * 15}s`,
      size: `${10 + Math.random() * 15}px`,
    }));
    setPetals(newPetals);
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Load guestbook data dynamically from MongoDB API
  useEffect(() => {
    const fetchGuestbook = async () => {
      try {
        const res = await fetch("/api/guestbook");
        if (res.ok) {
          const data = await res.json();
          setGuestbook(data);
        }
      } catch (err) {
        console.error("Failed to load guestbook messages:", err);
      }
    };
    fetchGuestbook();
  }, []);

  // Try to play audio automatically on load (if allowed by browser policy)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log("Autoplay blocked by browser. Music will play upon envelope interaction.", err);
      });
    }
  }, []);

  // Handle music play/pause
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.log("Audio play prevented by browser policy", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Show customized alert message
  const showAlert = (message) => {
    setAlert({ show: true, message });
    setTimeout(() => {
      setAlert({ show: false, message: "" });
    }, 4000);
  };

  // Submit RSVP to MongoDB database API
  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!rsvp.name.trim()) {
      showAlert("يرجى إدخال الاسم الكريم لتأكيد الحضور.");
      return;
    }

    try {
      // 1. Submit RSVP to API
      const rsvpRes = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rsvp.name,
          attending: rsvp.attending,
          note: rsvp.note,
        }),
      });

      if (!rsvpRes.ok) {
        throw new Error("Failed to save RSVP");
      }

      // 2. If note is present, submit to guestbook API
      if (rsvp.note.trim()) {
        const gbRes = await fetch("/api/guestbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: rsvp.name,
            note: rsvp.note,
            status: rsvp.attending,
          }),
        });

        if (gbRes.ok) {
          // Dynamically refresh congratulations list
          const refreshGb = await fetch("/api/guestbook");
          if (refreshGb.ok) {
            const freshData = await refreshGb.json();
            setGuestbook(freshData);
          }
        }
      }

      showAlert(
        rsvp.attending === "yes"
          ? "تم تسجيل حضورك بنجاح! نسعد بلقائك قريباً 🎉"
          : "نشكرك على إعلامنا، تمنينا حضورك وسنسعد بدعواتك الطيبة لنا 🤍"
      );

      // Reset Form
      setRsvp({
        name: "",
        attending: "yes",
        note: "",
      });
    } catch (err) {
      console.error("Submission failed:", err);
      showAlert("حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <>
      {/* 3D Envelope Opener */}
      {!envelopeFaded && (
        <div className={`envelope-wrapper ${envelopeOpen ? "fade-out" : ""}`}>
          <div className="envelope-container">
            <div className={`envelope ${envelopeOpen ? "open" : ""}`} onClick={handleEnvelopeOpen}>
              <div className="envelope-flap flap-top"></div>
              <div className="envelope-flap flap-left"></div>
              <div className="envelope-flap flap-right"></div>
              <div className="envelope-flap flap-bottom"></div>
              
              <div className="envelope-card">
                <h4>عقد قران</h4>
                <h3>سالي & مصطفى</h3>
                <p>٢ سبتمبر ٢٠٢٦</p>
              </div>
              
              <div className="wax-seal">S&M</div>
            </div>
          </div>
          
          <div className="envelope-prompt">
            <h2>دعوة عقد قران</h2>
            <p>مصطفى الخطيب & سالي السيد</p>
            <button className="open-btn" onClick={handleEnvelopeOpen}>
              اضغط لفتح الدعوة ✉️
            </button>
          </div>
        </div>
      )}

      {/* Hidden audio element - ALWAYS rendered in DOM so it can autoplay or play on envelope click */}
      <audio
        ref={audioRef}
        src="/sound.mp3"
        loop
      />

      {/* Floating Music player toggle button (Moved outside transform container) */}
      {showInvitation && (
        <button
          onClick={toggleMusic}
          className={`music-toggle-btn ${isPlaying ? "playing" : ""}`}
          aria-label="تشغيل / إيقاف الموسيقى"
        >
          <div className="sound-visualizer">
            <div className="visualizer-bar"></div>
            <div className="visualizer-bar"></div>
            <div className="visualizer-bar"></div>
            <div className="visualizer-bar"></div>
          </div>
        </button>
      )}

      {/* Main Invitation Layout */}
      <div 
        className={`invitation-layout ${showInvitation ? "visible" : ""}`} 
        style={{ display: showInvitation ? "block" : "none" }}
      >
        {/* Subtle Watermark Drawings in the background */}
        <div className="bg-watermark watermark-names" style={{ color: "#d9a941", opacity: 0.14 }}>مصطفى & سالي</div>
        <div className="bg-watermark watermark-date" style={{ color: "#d9a941", opacity: 0.12 }}>٢ سبتمبر ٢٠٢٦</div>
        <div className="bg-watermark" style={{ top: "35%", right: "4%", fontSize: "5.5rem", transform: "rotate(-8deg)", opacity: 0.08, color: "#d9a941", fontStyle: "italic" }}>عقد قران</div>
        <div className="bg-watermark" style={{ bottom: "35%", left: "5%", fontSize: "6rem", transform: "rotate(12deg)", opacity: 0.08, color: "#d9a941" }}>سالي & مصطفى</div>
        <div className="bg-watermark" style={{ top: "65%", left: "3%", fontSize: "4.5rem", transform: "rotate(-15deg)", opacity: 0.07, color: "#d9a941" }}>فرحة العمر</div>
        <div className="bg-watermark" style={{ bottom: "20%", right: "9%", fontSize: "5rem", transform: "rotate(5deg)", opacity: 0.07, color: "#d9a941" }}>عقد قران</div>
        
        {/* Top-Left Floral Draw */}
        <svg className="watermark-draw draw-top-left" viewBox="0 0 100 100" stroke="#d9a941" strokeWidth="1" fill="none" style={{ opacity: 0.16 }}>
          <path d="M 0 0 C 30 10, 60 40, 60 70 C 60 85, 45 95, 30 90 C 15 85, 10 60, 25 45 C 35 35, 55 35, 65 50 C 75 65, 70 85, 80 100" />
          <path d="M 0 0 C 10 30, 40 60, 70 60 C 85 60, 95 45, 90 30 C 85 15, 60 10, 45 25 C 35 35, 35 55, 50 65 C 65 75, 85 70, 100 80" />
          <circle cx="60" cy="70" r="1.5" fill="#d9a941" />
          <circle cx="70" cy="60" r="1.5" fill="#d9a941" />
          <path d="M 30 90 C 25 95, 15 95, 10 90 C 5 85, 5 75, 10 70" />
          <path d="M 90 30 C 95 25, 95 15, 90 10 C 85 5, 75 5, 70 10" />
        </svg>

        {/* Bottom-Right Floral Draw */}
        <svg className="watermark-draw draw-bottom-right" viewBox="0 0 100 100" stroke="#d9a941" strokeWidth="1" fill="none" style={{ opacity: 0.16 }}>
          <path d="M 0 0 C 30 10, 60 40, 60 70 C 60 85, 45 95, 30 90 C 15 85, 10 60, 25 45 C 35 35, 55 35, 65 50 C 75 65, 70 85, 80 100" />
          <path d="M 0 0 C 10 30, 40 60, 70 60 C 85 60, 95 45, 90 30 C 85 15, 60 10, 45 25 C 35 35, 35 55, 50 65 C 65 75, 85 70, 100 80" />
          <circle cx="60" cy="70" r="1.5" fill="#d9a941" />
          <circle cx="70" cy="60" r="1.5" fill="#d9a941" />
          <path d="M 30 90 C 25 95, 15 95, 10 90 C 5 85, 5 75, 10 70" />
          <path d="M 90 30 C 95 25, 95 15, 90 10 C 85 5, 75 5, 70 10" />
        </svg>

        <div className="container animate-fade-in">
          {/* Floating flower petals */}
          <div className="petals-container">
            {petals.map((petal) => (
              <div
                key={petal.id}
                className="petal"
                style={{
                  left: petal.left,
                  animationDelay: petal.delay,
                  animationDuration: petal.duration,
                  width: petal.size,
                  height: petal.size,
                }}
              />
            ))}
          </div>

          {/* Floating custom alert banner */}
          <div className={`alert-popup ${alert.show ? "show" : ""}`}>
            {alert.message}
          </div>



      {/* Hero Invitation Section */}
      <section className="card-wedding animate-slide-up">
        <div className="corner-ornament top-right"></div>
        <div className="corner-ornament top-left"></div>
        <div className="corner-ornament bottom-right"></div>
        <div className="corner-ornament bottom-left"></div>
        {/* Quranic Verse */}
        <p className="quran-verse">
          وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً
        </p>

        {/* Traditional Line Divider */}
        <div className="gold-divider">
          <div className="gold-divider-line"></div>
          <div className="gold-divider-center">💍</div>
          <div className="gold-divider-line"></div>
        </div>

        <h3 className="bismillah-text">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </h3>
        <h2 className="gold-text-shine title-wedding-invitation">
          دعوة لحضور عقد قران
        </h2>

        {/* Couple Frame Photo */}
        <div className="couple-frame-container">
          <div className="couple-frame-ring-1"></div>
          <div className="couple-frame-ring-2"></div>
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">💖</div>
          <div className="sparkle sparkle-3">✨</div>
          <div className="couple-frame-inner">
            <Image
              src="/images/couple.jpg"
              alt="سالي ومصطفى"
              fill
              className="couple-image"
              priority
            />
          </div>
        </div>

        {/* Names of Bride & Groom */}
        <h1 className="gold-text-shine names-wedding">
          مصطفى الخطيب & سالي السيد
        </h1>

        <p className="desc-wedding">
          يسعدنا ويشرفنا دعوتكم لحضور حفل كتب كتابنا ومشاركتنا فرحة العمر وسماع قول المأذون
          <br />
          <strong className="verse-strong">
            "بارك الله لكما وبارك عليكما وجمع بينكما في خير"
          </strong>
        </p>
      </section>

      {/* Countdown Timer Section */}
      <section className="card-wedding animate-slide-up">
        <div className="corner-ornament top-right"></div>
        <div className="corner-ornament top-left"></div>
        <div className="corner-ornament bottom-right"></div>
        <div className="corner-ornament bottom-left"></div>
        <h3 className="gold-text-shine" style={{ fontSize: "1.8rem", marginBottom: "15px" }}>
          {timeLeft.isOver ? "فرحتنا اكتملت بحضوركم 🎉" : "العد التنازلي لليوم المنتظر"}
        </h3>
        {!timeLeft.isOver && (
          <div className="countdown-grid">
            <div className="countdown-box">
              <div className="countdown-value">{timeLeft.seconds}</div>
              <div className="countdown-label">ثانية</div>
            </div>
            <div className="countdown-box">
              <div className="countdown-value">{timeLeft.minutes}</div>
              <div className="countdown-label">دقيقة</div>
            </div>
            <div className="countdown-box">
              <div className="countdown-value">{timeLeft.hours}</div>
              <div className="countdown-label">ساعة</div>
            </div>
            <div className="countdown-box">
              <div className="countdown-value">{timeLeft.days}</div>
              <div className="countdown-label">يوم</div>
            </div>
          </div>
        )}
      </section>

      {/* Details Section */}
      <section className="card-wedding animate-slide-up">
        <div className="corner-ornament top-right"></div>
        <div className="corner-ornament top-left"></div>
        <div className="corner-ornament bottom-right"></div>
        <div className="corner-ornament bottom-left"></div>
        <h3 className="gold-text-shine" style={{ fontSize: "1.8rem", marginBottom: "25px" }}>
          تفاصيل المناسبة
        </h3>

        <div className="details-list">
          {/* Date */}
          <div className="details-item">
            <div className="details-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="details-content">
              <h4>التاريخ واليوم</h4>
              <p>الأربعاء، ٢ سبتمبر ٢٠٢٦ م (2 / 9 / 2026)</p>
            </div>
          </div>

          {/* Time */}
          <div className="details-item">
            <div className="details-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="details-content">
              <h4>التوقيت</h4>
              <p>في تمام الساعة السادسة مساءً (06:00 مساءً)</p>
            </div>
          </div>

          {/* Location */}
          <div className="details-item">
            <div className="details-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="details-content">
              <h4>المكان</h4>
              <p>أمام منزل العروسة - كفر أبو شوارب</p>
            </div>
          </div>
        </div>

        {/* Google Maps link */}
        <a
          href="https://www.google.com/maps/search/?api=1&query=كفر+ابو+شوارب"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-maps"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
            <line x1="9" y1="3" x2="9" y2="18"></line>
            <line x1="15" y1="6" x2="15" y2="21"></line>
          </svg>
          موقع الحفل على الخريطة
        </a>
      </section>

      {/* RSVP Section */}
      <section className="card-wedding animate-slide-up">
        <div className="corner-ornament top-right"></div>
        <div className="corner-ornament top-left"></div>
        <div className="corner-ornament bottom-right"></div>
        <div className="corner-ornament bottom-left"></div>
        <h3 className="gold-text-shine" style={{ fontSize: "1.8rem", marginBottom: "15px" }}>
          تأكيد الحضور (RSVP)
        </h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "25px" }}>
          يسعدنا تأكيد حضورك الكريم لمشاركتنا هذه الفرحة ومساعدتنا في التجهيز بالشكل الأكمل.
        </p>

        <form onSubmit={handleRsvpSubmit} className="rsvp-form">
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="guest-name">
              الاسم الكريم *
            </label>
            <input
              id="guest-name"
              type="text"
              className="input-field"
              placeholder="يرجى كتابة الاسم الثلاثي"
              value={rsvp.name}
              onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })}
              required
            />
          </div>

          {/* Attending Toggle */}
          <div className="form-group">
            <label className="form-label">هل ستشرفنا بالحضور؟</label>
            <div className="radio-group">
              <div
                className={`radio-card ${rsvp.attending === "yes" ? "active" : ""}`}
                onClick={() => setRsvp({ ...rsvp, attending: "yes" })}
              >
                نعم، سأحضر بكل سرور 🎉
              </div>
              <div
                className={`radio-card ${rsvp.attending === "no" ? "active" : ""}`}
                onClick={() => setRsvp({ ...rsvp, attending: "no" })}
              >
                أعتذر، متمنياً لكما حياة سعيدة ✨
              </div>
            </div>
          </div>


          {/* Congratulations Note */}
          <div className="form-group">
            <label className="form-label" htmlFor="guest-note">
              تهنئة خاصة للعروسين (ستُعرض في دفتر التهاني)
            </label>
            <textarea
              id="guest-note"
              className="input-field"
              rows="3"
              placeholder="اكتب كلمة طيبة أو دعاءً للعروسين..."
              value={rsvp.note}
              onChange={(e) => setRsvp({ ...rsvp, note: e.target.value })}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary">
            إرسال تأكيد الحضور
          </button>
        </form>
      </section>

      {/* Guestbook Section */}
      <section className="card-wedding animate-slide-up">
        <div className="corner-ornament top-right"></div>
        <div className="corner-ornament top-left"></div>
        <div className="corner-ornament bottom-right"></div>
        <div className="corner-ornament bottom-left"></div>
        <h3 className="gold-text-shine" style={{ fontSize: "1.8rem", marginBottom: "15px" }}>
          دفتر تهاني العروسين
        </h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
          شاركونا كلماتكم الطيبة ودعواتكم الصادقة التي ستظل ذكرى جميلة في قلوبنا.
        </p>

        {/* Divider */}
        <div className="gold-divider" style={{ margin: "15px 0" }}>
          <div className="gold-divider-line"></div>
          <div className="gold-divider-center">✍️</div>
          <div className="gold-divider-line"></div>
        </div>

        {/* Message Wall */}
        <div className="guestbook-list">
          {guestbook.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>
              كن أول من يكتب تهنئة للعروسين!
            </p>
          ) : (
            guestbook.map((item) => (
              <div key={item.id} className="guestbook-item">
                <div className="guestbook-header">
                  <span className="guestbook-sender">{item.name}</span>
                  <span className="guestbook-date">
                    {new Date(item.date).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="guestbook-message">{item.note}</p>
                {item.status && (
                  <span className="guestbook-status">{item.status}</span>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="wedding-footer animate-fade-in">
        <p>عقبال عندكم جميعاً، ودامت دياركم بالمسرات عامرة 🤍</p>
        <p style={{ fontSize: "1rem", marginTop: "10px", color: "var(--gold-primary)", fontFamily: "var(--font-cairo)" }}>
          مصطفى الخطيب & سالي السيد | عقد القران ٢ سبتمبر ٢٠٢٦
        </p>
      </footer>
        </div>
      </div>
    </>
  );
}
