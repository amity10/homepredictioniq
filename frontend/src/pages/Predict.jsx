import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import GlassDropdown from "../components/GlassDropdown";

export default function Predict() {

  const { getToken } = useAuth();
  const { user } = useUser();

  /* ---------------- Background Slider ---------------- */

  const images = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
  ];

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- State ---------------- */

  const [options, setOptions] = useState({});
  const [result, setResult] = useState(null);
  const [showContact, setShowContact] = useState(false);

  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    bhk: "",
    type: "",
    region: "",
    status: "",
    age: "",
    area: ""
  });

  /* ---------------- AUTO-CALCULATE AREA (Realism Fix) ---------------- */
  // If user changes BHK, we auto-update Area to a realistic range.
  useEffect(() => {
    if (form.bhk) {
      const bhkVal = Number(form.bhk);
      if (!isNaN(bhkVal) && bhkVal > 0) {
        // Heuristic: 1BHK ~ 450sqft base + var
        // 2BHK ~ 850
        // 3BHK ~ 1250
        const estimatedArea = (bhkVal * 400) + 50;
        setForm(prev => ({ ...prev, area: estimatedArea }));
      }
    }
  }, [form.bhk]);

  /* ---------------- Load Dropdown Options ---------------- */

  useEffect(() => {
    fetch("https://homepredictioniq.onrender.com/api/options/")
      .then(res => res.json())
      .then(data => setOptions(data))
      .catch(console.log);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const isFormComplete = Object.values(form).every(v => v !== "");

  /* ⭐ GET REGION LABEL */
  const getRegionLabel = () => {
    const match = options.region?.find(
      r => String(r.value) === String(form.region)
    );
    return match ? match.label : "Unknown";
  };

  const getStatusLabel = () => {
    const match = options.status?.find(
      s => String(s.value) === String(form.status)
    );
    return match ? match.label : "Unknown";
  };

  const getAgeLabel = () => {
    const match = options.age?.find(
      a => String(a.value) === String(form.age)
    );
    return match ? match.label : "Unknown";
  };

  const getTypeLabel = () => {
    const match = options.type?.find(
      t => String(t.value) === String(form.type)
    );
    return match ? match.label : "Unknown";
  };


  /* ---------------- Prediction API ---------------- */

  const handlePredict = async () => {

    try {

      if (!user) return alert("User not loaded");

      const token = await getToken();

      const res = await fetch("https://homepredictioniq.onrender.com/api/predict//", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Clerk-User-ID": user.id,
          "X-Clerk-Email": user.primaryEmailAddress.emailAddress
        },
        body: JSON.stringify({
          bhk: Number(form.bhk),
          type: Number(form.type),
          region: Number(form.region),
          region_label: getRegionLabel(),
          status: Number(form.status),
          age: Number(form.age),
          area: Number(form.area),
          status_label: getStatusLabel(),
          age_label: getAgeLabel(),
          type_label: getTypeLabel(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.error || "Prediction failed. Please check inputs.");
      }

      // Removed Confidence Score (User requested removal)

      setResult({
        ...data,
      });

    } catch {
      alert("Backend connection error");
    }
  };



  /* ---------------- Save Prediction ---------------- */

  const handleSavePrediction = async () => {

    try {

      if (!result?.id) return alert("No prediction to save");

      const token = await getToken();

      const res = await fetch("https://homepredictioniq.onrender.com/api/save_prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Clerk-User-ID": user.id
        },
        body: JSON.stringify({
          id: result.id
        })
      });

      if (res.ok) {
        alert("Prediction Saved Successfully!");
      } else {
        alert("Failed to save");
      }

    } catch {
      alert("Save failed");
    }
  };

  /* ---------------- CONTACT AGENT API ---------------- */

  const handleContactSubmit = async () => {

    try {

      if (!phone) return alert("Please enter phone number");

      const token = await getToken();

      await fetch("https://homepredictioniq.onrender.com/api/contact_agent/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Clerk-User-ID": user.id,
          "X-Clerk-Email": user.primaryEmailAddress.emailAddress
        },
        body: JSON.stringify({
          phone,
          message,
          bhk: form.bhk,
          area: form.area,
          region: form.region,
          region_label: getRegionLabel(),
          predicted_price: result.predicted_price_lakhs
        })
      });

      alert("Agent will contact you soon!");

      setShowContact(false);
      setPhone("");
      setMessage("");

    } catch {
      alert("Failed to send request");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    // Remvoed overflow-hidden to allow dropdowns (z-index) to show
    <div className="relative min-h-screen">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${images[bgIndex]})` }}
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 text-white">

        <h1 className="text-4xl font-bold mb-10 text-center">
          Property Price Prediction
        </h1>

        {/* FORM */}
        <div className="bg-white/20 backdrop-blur-xl p-8 rounded-3xl shadow-lg grid md:grid-cols-2 gap-6 relative z-30">

          {["bhk", "type", "region", "status", "age"].map(field => (
            <GlassDropdown
              key={field}
              label={field}
              id={field}
              name={field}
              value={form[field]}
              options={options[field] || []}
              onChange={handleChange}
              placeholder={`Select ${field}`}
            />
          ))}

          {/* Area - NOW READ ONLY / AUTO COMPUTED but user can edit if needed (User wanted unrealistic inputs blocked, but maybe slight edit is okay? I'll make it readonly-ish or just auto-fill) 
             User Request: "User should NOT manually enter area" -> "Area must be auto-calculated"
             So providing READ ONLY input for visibility.
          */}
          <div>
            <label>Area (sqft) <span className="text-xs opacity-70 ml-2">(Auto-calculated based on BHK)</span></label>
            <input
              type="number"
              name="area"
              value={form.area}
              onChange={handleChange}
              readOnly
              className="w-full border border-white/30 bg-white/10 p-3 rounded-lg cursor-not-allowed opacity-80"
            />
          </div>

          <button
            onClick={handlePredict}
            disabled={!isFormComplete}
            className={`md:col-span-2 py-3 rounded-xl font-semibold ${isFormComplete
              ? "bg-white text-indigo-700 hover:bg-gray-200"
              : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            Predict Price
          </button>

        </div>

        {/* RESULT */}
        {result && (
          <div className="mt-12 bg-white/20 backdrop-blur-xl p-10 rounded-3xl shadow-xl space-y-6 animate-fadeIn relative z-20">

            <p className="text-5xl font-bold text-green-300">
              ₹ {result.predicted_price_lakhs} Lakhs
            </p>

            <div className="flex items-center space-x-4 bg-black/20 p-4 rounded-xl w-fit">
              <span className="text-xl font-semibold">Estimated Price Range:</span>
              <span className="text-xl text-yellow-300">
                ₹ {result.min_price} — ₹ {result.max_price} Lakhs
              </span>
            </div>

            {/* Property Summary */}
            <div className="bg-white/20 p-6 rounded-xl">
              <p>BHK: {form.bhk}</p>
              <p>Area: {form.area} sqft</p>
              <p>Region: {getRegionLabel()}</p>
            </div>

            {/* CTA */}
            <div className="flex gap-4">

              <button
                onClick={() => setShowContact(true)}
                className="bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition"
              >
                Contact Agent
              </button>

              <button
                onClick={handleSavePrediction}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition"
              >
                Save Prediction
              </button>

            </div>

          </div>
        )}

        {/* ⭐ PREMIUM GLASS CONTACT MODAL */}
        {showContact && (
          <div className="fixed inset-0 backdrop-blur-md bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white p-8 rounded-3xl shadow-2xl w-[400px] animate-fadeIn">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">
                  Contact Property Expert
                </h2>

                <button
                  onClick={() => setShowContact(false)}
                  className="text-xl hover:text-red-400"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm opacity-80 mb-6">
                Our expert will contact you regarding this property in {getRegionLabel()}.
              </p>

              <input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/20 border border-white/30 mb-4"
              />

              <textarea
                placeholder="Message (Optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/20 border border-white/30 mb-6"
              />

              <button
                onClick={handleContactSubmit}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
              >
                Submit Request
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
