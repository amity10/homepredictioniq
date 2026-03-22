
import React from 'react';


export default function About() {
 

  return (
    <div className="relative min-h-screen text-white px-6 py-12 font-sans">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1973&q=80')" }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            About the Model
          </h1>
          <p className="text-lg opacity-70">
            A technical deep-dive into the Machine Learning engine powering these predictions.
          </p>
        </div>

        {/* Section 1: Problem */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-blue-300 mb-4 flex items-center gap-2">
            <span>🎯</span> The Problem
          </h2>
          <div className="bg-black/30 p-6 rounded-xl border-l-4 border-blue-500">
            <p className="opacity-90 leading-relaxed mb-4">
              Real estate markets are complex. Prices fluctuate based on hundreds of factors, making traditional "gut feeling" valuations inaccurate and biased.
              A simple "Average Price per Sqft" fails to account for luxuries, building age, or specific location premiums.
            </p>
            <p className="font-semibold text-white">
              Solution: A data-driven Machine Learning model that learns non-linear pricing patterns from thousands of historical transactions.
            </p>
          </div>
        </section>

        {/* Section 2: Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-6 flex items-center gap-2">
            <span>📊</span> Dataset & Features
          </h2>
          <p className="opacity-80 mb-6">
            Our model doesn't guess. It analyzes 6 specific data points for every prediction:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "BHK", desc: "Configuration (Bedrooms, Hall, Kitchen)." },
              { title: "Total Area (sq.ft)", desc: "Log-transformed to handle scale differences between studios and villas." },
              { title: "Region", desc: "Historical price trends of the specific locality (Encoded)." },
              { title: "Status", desc: "'Ready to Move' vs 'Under Construction'." },
              { title: "Age", desc: "'New' vs 'Resale'." },
              { title: "Type", desc: "Apartment, Villa, Independent House, etc." }
            ].map((f, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition">
                <h3 className="font-bold text-blue-200">{f.title}</h3>
                <p className="text-sm opacity-70">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Architecture */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-300 mb-4 flex items-center gap-2">
            <span>🧠</span> Model Architecture
          </h2>
          <div className="space-y-4 opacity-90 leading-relaxed">
            <p>
              We use a <strong className="text-white">Decision Tree Regressor</strong> algorithm.
            </p>
            <p>
              While Linear Regression assumes a straight-line relationship (e.g., "Double the area = Double the price"), real estate often follows a hierarchical structure.
              A Decision Tree splits data into thousands of branches (decision nodes) based on feature thresholds (e.g., <em>"Is Area > 1200? Is Region = Bandra?"</em>) to capture complex, non-linear market behaviors.
            </p>
          </div>
        </section>

        {/* Section 4: Workflow */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-300 mb-6 flex items-center gap-2">
            <span>⚙️</span> How It Works
          </h2>
          <div className="relative border-l-2 border-white/20 pl-8 space-y-8">
            {[
              { step: "1. Input", text: "You enter property details (Area, BHK, Location, etc)." },
              { step: "2. Preprocessing & Encoding", text: "Text inputs are converted to numerical IDs (e.g., 'Andheri' → 8) using our strict encoder mapping." },
              { step: "3. Feature Engineering", text: "Area is log-transformed (np.log1p) to normalize the distribution." },
              { step: "4. Inference", text: "The trained Decision Tree traverses its nodes to find the matching 'leaf', outputting the predicted price." },
              { step: "5. Result", text: "Output is formatted into Lakhs/Crores and presented on your dashboard." }
            ].map((item, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[41px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-xs font-bold">
                  {i + 1}
                </span>
                <h3 className="font-bold text-white">{item.step}</h3>
                <p className="text-sm opacity-70">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Limitations */}
        <section>
          <h2 className="text-2xl font-bold text-red-300 mb-4 flex items-center gap-2">
            <span>⚠️</span> Limitations
          </h2>
          <ul className="list-disc list-inside opacity-75 space-y-2">
            <li><strong>Historical Bias:</strong> Predictions are based on past data and may lag behind sudden market booms.</li>
            <li><strong>Standard Amenities:</strong> The model assumes standard unit finish; it does not account for "Italian Marble" or "Sea View" premiums.</li>
            <li><strong>Estimation:</strong> This is a tool for <em>Fair Market Probability</em>, not a certified valuation for bank loans.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
