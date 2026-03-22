import { useState, useEffect } from "react";
import ResultCard from "./ResultCard";

export default function PredictionForm() {
  const [formData, setFormData] = useState({
    bhk: "",
    area: "",
    region: "",
    status: "",
    age: "",
    type: "",
  });

  const [options, setOptions] = useState({
    region: [],
    status: [],
    age: [],
    type: [],
    bhk: []
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch options from backend
    fetch("http://127.0.0.1:8000/api/options/")
      .then((res) => res.json())
      .then((data) => {
         setOptions(data);
      })
      .catch((err) => console.error("Failed to fetch options", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const FIND_LABEL = (category, value) => {
      const opt = options[category].find(o => String(o.value) === String(value));
      return opt ? opt.label : "";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Prepare Payload with Labels
    const payload = {
        bhk: Number(formData.bhk),
        area: Number(formData.area),
        
        region: Number(formData.region),
        status: Number(formData.status),
        age: Number(formData.age),
        type: Number(formData.type),

        // Send Labels explicitly as Backend expects them
        region_label: FIND_LABEL("region", formData.region),
        status_label: FIND_LABEL("status", formData.status),
        age_label: FIND_LABEL("age", formData.age),
        type_label: FIND_LABEL("type", formData.type),
    };

    console.log("Sending Payload:", payload);

    try {
        const response = await fetch("http://127.0.0.1:8000/api/predict/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        
        if (response.ok) {
            setResult(data);
        } else {
            setError(data);
        }
    } catch (err) {
        setError({ error: "Network Error" });
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          maxWidth: "600px",
        }}
      >
        <div style={{ display: "grid", gap: "16px" }}>
            
            <div>
                <label style={{display:"block", marginBottom:"8px", fontWeight:500}}>Area (sq.ft)</label>
                <input 
                    name="area" 
                    type="number"
                    value={formData.area}
                    placeholder="e.g. 850" 
                    onChange={handleChange} 
                    style={{width: "100%", padding:"10px", borderRadius:"6px", border:"1px solid #ddd"}}
                    required
                />
            </div>

            <div>
                 <label style={{display:"block", marginBottom:"8px", fontWeight:500}}>BHK</label>
                 <select 
                    name="bhk" 
                    value={formData.bhk}
                    onChange={handleChange}
                    style={{width: "100%", padding:"10px", borderRadius:"6px", border:"1px solid #ddd"}}
                    required
                 >
                    <option value="">Select BHK</option>
                    {options.bhk && options.bhk.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label} BHK</option>
                    ))}
                 </select>
            </div>

            <div>
                 <label style={{display:"block", marginBottom:"8px", fontWeight:500}}>Location</label>
                 <select 
                    name="region" 
                    value={formData.region}
                    onChange={handleChange}
                    style={{width: "100%", padding:"10px", borderRadius:"6px", border:"1px solid #ddd"}}
                    required
                 >
                    <option value="">Select Region</option>
                    {options.region && options.region.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                 </select>
            </div>

             <div>
                 <label style={{display:"block", marginBottom:"8px", fontWeight:500}}>Property Status</label>
                 <select 
                    name="status" 
                    value={formData.status}
                    onChange={handleChange}
                    style={{width: "100%", padding:"10px", borderRadius:"6px", border:"1px solid #ddd"}}
                    required
                 >
                    <option value="">Select Status</option>
                    {options.status && options.status.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                 </select>
            </div>

             <div>
                 <label style={{display:"block", marginBottom:"8px", fontWeight:500}}>Property Age</label>
                 <select 
                    name="age" 
                    value={formData.age}
                    onChange={handleChange}
                    style={{width: "100%", padding:"10px", borderRadius:"6px", border:"1px solid #ddd"}}
                    required
                 >
                    <option value="">Select Age</option>
                    {options.age && options.age.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                 </select>
            </div>

             <div>
                 <label style={{display:"block", marginBottom:"8px", fontWeight:500}}>Property Type</label>
                 <select 
                    name="type" 
                    value={formData.type}
                    onChange={handleChange}
                    style={{width: "100%", padding:"10px", borderRadius:"6px", border:"1px solid #ddd"}}
                    required
                 >
                    <option value="">Select Type</option>
                    {options.type && options.type.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                 </select>
            </div>
            
            <button 
                type="submit"
                style={{
                    background: "#2563eb",
                    color: "white",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginTop: "10px"
                }}
            >
                Predict Price
            </button>
        </div>

        {error && (
            <div style={{marginTop: "20px", color: "red", padding: "10px", background: "#fee2e2", borderRadius: "6px"}}>
                Error: {JSON.stringify(error)}
            </div>
        )}
      </form>

      {result && <ResultCard price={result.predicted_price_lakhs} confidence={result.confidence} min={result.min_price} max={result.max_price} />}
    </>
  );
}
