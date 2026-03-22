import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ⭐ Background Images (same as Home) */
const bgImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
];

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const dashboardRef = useRef(null); // Ref for PDF capture

  const [savedPredictions, setSavedPredictions] = useState([]);
  const [loading, setLoading] = useState(true); // Added Loading State
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  const displayedPredictions = activeTab === "saved"
    ? savedPredictions.filter(p => p.is_saved)
    : savedPredictions;

  /* ---------------- BACKGROUND SLIDER ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(i => (i + 1) % bgImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- DOWNLOAD PDF ---------------- */
  const downloadPDF = async () => {
    if (!dashboardRef.current) return;

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // High resolution
        useCORS: true, // Handle images
        backgroundColor: "#1a1a1a" // Dark background for PDF
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First Page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Multi-page support if content is long
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const dateStr = new Date().toISOString().split("T")[0];
      pdf.save(`Dashboard_Report_${user.firstName}_${dateStr}.pdf`);

    } catch (err) {
      console.error("PDF Export Failed", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          "https://homepredictioniq.onrender.com/api/saved_predictions/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Clerk-User-ID": user.id
            }
          }
        );

        if (res.ok) {
          const data = await res.json();
          setSavedPredictions(Array.isArray(data) ? data : []); // Safe check
        } else {
          console.error("Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, getToken]);

  /* ---------------- BASIC STATS ---------------- */
  const totalSaved = savedPredictions.length;

  const avgPrice =
    totalSaved > 0
      ? (
        savedPredictions.reduce(
          (sum, p) => sum + p.predicted_price,
          0
        ) / totalSaved
      ).toFixed(1)
      : 0;

  const lastPrediction = savedPredictions.length > 0 ? savedPredictions[0] : null;

  /* ---------------- CHART DATA ---------------- */
  const bhkCount = {};
  const areaBuckets = { "<500": 0, "500-800": 0, "800-1200": 0, "1200+": 0 };
  const priceByDate = {};
  const countByDate = {};

  savedPredictions.forEach(p => {
    bhkCount[p.bhk] = (bhkCount[p.bhk] || 0) + 1;

    if (p.area < 500) areaBuckets["<500"]++;
    else if (p.area <= 800) areaBuckets["500-800"]++;
    else if (p.area <= 1200) areaBuckets["800-1200"]++;
    else areaBuckets["1200+"]++;

    const date = new Date(p.created_at).toLocaleDateString();

    if (!priceByDate[date]) priceByDate[date] = { total: 0, count: 0 };
    priceByDate[date].total += p.predicted_price;
    priceByDate[date].count++;

    countByDate[date] = (countByDate[date] || 0) + 1;
  });

  const priceTrend = Object.entries(priceByDate)
    .map(([date, v]) => ({
      date,
      price: (v.total / v.count).toFixed(0)
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const predictionTrend = Object.entries(countByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#fff" } }
    },
    scales: {
      x: { ticks: { color: "#fff" } },
      y: { ticks: { color: "#fff" } }
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="relative min-h-screen text-white px-6 py-12">

      {/* ⭐ Background Slider - ALWAYS VISIBLE */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${bgImages[currentImage]})` }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Page Content wrapped in ref for PDF */}
      <div className="relative z-10" ref={dashboardRef}>

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">Dashboard</h1>

          <button
            onClick={downloadPDF}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            ⬇ Download PDF
          </button>
        </div>

        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <p className="text-xl font-semibold animate-pulse">Loading Dashboard...</p>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl">
                <p className="text-sm opacity-80">Saved Predictions</p>
                <p className="text-3xl font-bold">{totalSaved}</p>
              </div>

              <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl">
                <p className="text-sm opacity-80">Average Price</p>
                <p className="text-3xl font-bold">₹ {avgPrice} Lakhs</p>
              </div>

              <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl">
                <p className="text-sm opacity-80">Last Prediction</p>
                {lastPrediction ? (
                  <p className="text-sm leading-6">
                    {lastPrediction.region_label} <br />
                    {lastPrediction.bhk} BHK • {lastPrediction.area} sqft <br />
                    ₹ {lastPrediction.predicted_price} Lakhs
                  </p>
                ) : (
                  <p className="text-sm leading-6 mt-2 opacity-60">No recent activity</p>
                )}
              </div>
            </div>

            {/* CHARTS */}
            <div className="grid md:grid-cols-2 gap-10 mb-16">

              <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl">
                <h3 className="mb-4 text-lg font-semibold">
                  Most Predicted Home Sizes (BHK)
                </h3>
                <Bar
                  data={{
                    labels: Object.keys(bhkCount).map(b => `${b} BHK`),
                    datasets: [{
                      data: Object.values(bhkCount),
                      backgroundColor: "#60a5fa"
                    }]
                  }}
                  options={chartOptions}
                />
              </div>

              <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl">
                <h3 className="mb-4 text-lg font-semibold">
                  Average Predicted Price Over Time
                </h3>
                <Line
                  data={{
                    labels: priceTrend.map(p => p.date),
                    datasets: [{
                      data: priceTrend.map(p => p.price),
                      borderColor: "#4ade80",
                      tension: 0.4
                    }]
                  }}
                  options={chartOptions}
                />
              </div>

              <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl">
                <h3 className="mb-4 text-lg font-semibold">
                  Prediction Activity Over Time
                </h3>
                <Bar
                  data={{
                    labels: predictionTrend.map(p => p.date),
                    datasets: [{
                      data: predictionTrend.map(p => p.count),
                      backgroundColor: "#38bdf8"
                    }]
                  }}
                  options={chartOptions}
                />
              </div>

              <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl">
                <h3 className="mb-4 text-lg font-semibold">
                  Area Size Distribution (sqft)
                </h3>
                <Bar
                  data={{
                    labels: Object.keys(areaBuckets),
                    datasets: [{
                      data: Object.values(areaBuckets),
                      backgroundColor: "#c084fc"
                    }]
                  }}
                  options={chartOptions}
                />
              </div>

            </div>

            {/* TABLE */}
            <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl">Prediction History</h2>

                {/* TABS */}
                <div className="flex bg-black/30 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-md transition-all ${activeTab === "all" ? "bg-indigo-600 text-white" : "hover:bg-white/10"}`}
                  >
                    All Predictions
                  </button>
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={`px-4 py-2 rounded-md transition-all ${activeTab === "saved" ? "bg-indigo-600 text-white" : "hover:bg-white/10"}`}
                  >
                    Saved Only
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm table-fixed">
                  <colgroup>
                    <col className="w-1/4" />
                    <col className="w-1/12" />
                    <col className="w-1/6" />
                    <col className="w-1/6" />
                    <col className="w-1/6" />
                    <col className="w-1/12" />
                  </colgroup>

                  <thead className="sticky top-0 bg-black/40">
                    <tr>
                      <th className="p-3 text-left">Region</th>
                      <th className="p-3 text-center">BHK</th>
                      <th className="p-3 text-center">Area</th>
                      <th className="p-3 text-center">Price (Lakhs)</th>
                      <th className="p-3 text-center">Date</th>
                      <th className="p-3 text-center">Saved</th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedPredictions.length > 0 ? (
                      displayedPredictions.map(p => (
                        <tr key={p.id} className="border-b border-white/10">
                          <td className="p-3 text-left">{p.region_label}</td>
                          <td className="p-3 text-center">{p.bhk}</td>
                          <td className="p-3 text-center">{p.area}</td>
                          <td className="p-3 text-center">{p.predicted_price}</td>
                          <td className="p-3 text-center">
                            {new Date(p.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-center">
                            {p.is_saved ? "★" : ""}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-6 text-center opacity-60">
                          {activeTab === "saved" ? "No saved predictions yet." : "No predictions found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
