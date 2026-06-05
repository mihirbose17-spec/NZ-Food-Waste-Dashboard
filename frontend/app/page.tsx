"use client";
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

interface Prediction { sector: string; flagged_category: string; predicted_excess_tonnes: number; ai_recommendation: string; }
interface Redistribution { source: string; available_tonnes: number; matched_buyer: string; logistics_status: string; }
interface Conversion { waste_type: string; volume_tonnes: number; destination: string; environmental_impact: string; }
interface Brief { title: string; executive_summary: string; action_steps: string[]; projected_impact: string; }

const baseHistoricalData = [
  { year: '2018', "Primary Production": 410, "Household Spoilage": 320, "Retail & Logistics": 360 },
  { year: '2019', "Primary Production": 425, "Household Spoilage": 335, "Retail & Logistics": 365 },
  { year: '2020', "Primary Production": 450, "Household Spoilage": 380, "Retail & Logistics": 340 },
  { year: '2021', "Primary Production": 460, "Household Spoilage": 360, "Retail & Logistics": 350 },
  { year: '2022', "Primary Production": 465, "Household Spoilage": 355, "Retail & Logistics": 355 },
  { year: '2023', "Primary Production": 455, "Household Spoilage": 365, "Retail & Logistics": 365 },
  { year: '2024', "Primary Production": 460, "Household Spoilage": 366, "Retail & Logistics": 396 },
  { year: '2025', "Primary Production": 458, "Household Spoilage": 362, "Retail & Logistics": 390 },
  { year: '2026 (Live)', "Primary Production": 461, "Household Spoilage": 364, "Retail & Logistics": 393 },
];

export default function AppContainer() {
  const [activeView, setActiveView] = useState<'dashboard' | 'about' | 'architecture'>('dashboard');

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [redistribution, setRedistribution] = useState<Redistribution | null>(null);
  const [conversion, setConversion] = useState<Conversion | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [graphData, setGraphData] = useState(baseHistoricalData);

  // Securely fetch the backend URL from the vault, falling back to localhost if not found
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const fetchLiveData = () => {
    setPrediction(null); setRedistribution(null); setConversion(null); setBrief(null);
    // Notice the backticks (`) used here to properly inject the API_URL variable
    fetch(`${API_URL}/api/predict`).then(res => res.json()).then(setPrediction).catch(console.error);
    fetch(`${API_URL}/api/redistribute`).then(res => res.json()).then(setRedistribution).catch(console.error);
    fetch(`${API_URL}/api/convert`).then(res => res.json()).then(setConversion).catch(console.error);
  };

  const generateAIBrief = () => {
    setIsGenerating(true);
    setBrief(null);
    fetch(`${API_URL}/api/generate-brief`)
      .then(res => res.json())
      .then(data => { setBrief(data); setIsGenerating(false); })
      .catch(err => { console.error(err); setIsGenerating(false); });
  };

  const downloadDocx = async () => {
    if (!brief) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: brief.title, heading: HeadingLevel.TITLE, spacing: { after: 300 } }),
            new Paragraph({ children: [new TextRun({ text: "Executive Summary", bold: true })], spacing: { after: 100 } }),
            new Paragraph({ text: brief.executive_summary, spacing: { after: 300 } }),
            new Paragraph({ text: "Execution Steps", heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
            ...brief.action_steps.map(step => new Paragraph({ text: step, bullet: { level: 0 }, spacing: { after: 100 } })),
            new Paragraph({ text: "Projected Business Impact", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 } }),
            new Paragraph({ text: brief.projected_impact }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ACFS_Strategy_${new Date().toISOString().split('T')[0]}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => { fetchLiveData(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGraphData(currentData => {
        const newData = [...currentData];
        const liveIndex = newData.length - 1;
        newData[liveIndex] = {
          ...newData[liveIndex],
          "Primary Production": Math.round(461 + (Math.random() * 6 - 3)),
          "Household Spoilage": Math.round(364 + (Math.random() * 4 - 2)),
          "Retail & Logistics": Math.round(393 + (Math.random() * 8 - 4)),
        };
        return newData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderDashboard = () => (
    <div className="p-8 animate-in fade-in duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">System Control Tower</h1>
          <p className="text-slate-500 mt-2 text-lg">Live AI-Enabled Value Chain Metrics</p>
        </div>
        <button onClick={fetchLiveData} className="bg-[#00529B] text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors shadow-sm font-semibold flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Refresh Live Feeds
        </button>
      </header>

      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm mb-10 relative">
        <div className="absolute top-8 right-8 flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-200 shadow-sm">
           <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
           Live Feed Active
        </div>
        <h2 className="text-2xl font-bold text-[#00529B] mb-2">Macro View: Real-Time National Tracking (2018 - 2026)</h2>
        <p className="text-slate-600 text-sm mb-8">Aggregating historical systemic data alongside live, simulated IoT sensor feeds across Aotearoa.</p>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b' }} dy={10} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} domain={['dataMin - 20', 'dataMax + 20']} label={{ value: 'Tonnes (Thousands)', angle: -90, position: 'insideLeft', offset: -10, style: { fill: '#64748b', fontWeight: 'bold' } }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="Primary Production" name="1. Farm Rejects" stroke="#00529B" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} animationDuration={500} />
              <Line type="monotone" dataKey="Household Spoilage" name="2. Household" stroke="#00AEEF" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} animationDuration={500} />
              <Line type="monotone" dataKey="Retail & Logistics" name="3. Retail Overstock" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} animationDuration={500} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[#00529B] mb-4">Micro View: Active AI Interventions</h2>
      <p className="text-slate-600 text-sm mb-6">AI filters anomalies from the national data stream to generate actionable node-level alerts.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
          <h2 className="text-xl font-semibold text-red-600 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live Alert: Retail Overstock
          </h2>
          {prediction ? (
            <div className="space-y-3 text-sm">
              <p><strong className="text-slate-600">Sector:</strong> {prediction.sector}</p>
              <p><strong className="text-slate-600">Flagged:</strong> {prediction.flagged_category}</p>
              <p><strong className="text-slate-600">Predicted Excess:</strong> <span className="text-red-600 font-bold">{prediction.predicted_excess_tonnes} Tonnes</span></p>
              <div className="mt-4 bg-[#00529B]/5 p-3 rounded-md border border-[#00529B]/20">
                <p className="text-slate-700"><strong className="text-[#00529B]">AI Action:</strong> {prediction.ai_recommendation}</p>
              </div>
            </div>
          ) : <p className="text-slate-400 animate-pulse">Connecting to node...</p>}
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <h2 className="text-xl font-semibold text-orange-500 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            Live Alert: Farm Surplus
          </h2>
          {redistribution ? (
            <div className="space-y-3 text-sm">
              <p><strong className="text-slate-600">Source:</strong> {redistribution.source}</p>
              <p><strong className="text-slate-600">Available:</strong> {redistribution.available_tonnes} Tonnes</p>
              <p><strong className="text-slate-600">Matched Buyer:</strong> <span className="text-green-700 font-bold">{redistribution.matched_buyer}</span></p>
              <div className="mt-4 bg-orange-500/5 p-3 rounded-md border border-orange-500/20">
                <p className="text-slate-700"><strong className="text-orange-600">Logistics:</strong> {redistribution.logistics_status}</p>
              </div>
            </div>
          ) : <p className="text-slate-400 animate-pulse">Routing logistics...</p>}
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
          <h2 className="text-xl font-semibold text-yellow-600 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            Live Alert: Bioconversion
          </h2>
          {conversion ? (
            <div className="space-y-3 text-sm">
              <p><strong className="text-slate-600">Waste Type:</strong> {conversion.waste_type}</p>
              <p><strong className="text-slate-600">Volume:</strong> {conversion.volume_tonnes} Tonnes</p>
              <p><strong className="text-slate-600">Destination:</strong> <span className="text-yellow-700 font-bold">{conversion.destination}</span></p>
              <div className="mt-4 bg-yellow-500/5 p-3 rounded-md border border-yellow-500/20">
                <p className="text-slate-700"><strong className="text-yellow-700">Impact:</strong> {conversion.environmental_impact}</p>
              </div>
            </div>
          ) : <p className="text-slate-400 animate-pulse">Calculating yield...</p>}
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center mb-8">
        <h2 className="text-2xl font-bold text-[#00529B] mb-4">Strategic Intervention Engine</h2>
        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">Compile active data feeds into a localized, step-by-step implementation brief.</p>
        <button onClick={generateAIBrief} disabled={isGenerating || !prediction} className="bg-[#00529B] text-white px-8 py-3 rounded-md hover:bg-blue-800 transition-colors shadow-md font-bold text-lg disabled:opacity-50">
          {isGenerating ? "Synthesizing Strategy..." : "Generate AI Implementation Brief"}
        </button>
        {brief && (
          <div className="mt-8 text-left bg-slate-50 p-6 rounded-md border border-gray-200 max-w-4xl mx-auto shadow-inner relative">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{brief.title}</h3>
            <p className="text-slate-600 italic mb-6">{brief.executive_summary}</p>
            <h4 className="font-semibold text-[#00529B] mb-3 border-b border-gray-200 pb-1">Execution Steps:</h4>
            <ul className="space-y-2 mb-6">
              {brief.action_steps.map((step, index) => <li key={index} className="text-slate-700 bg-white p-2 rounded border border-gray-100">{step}</li>)}
            </ul>
            <h4 className="font-semibold text-[#00529B] mb-2 border-b border-gray-200 pb-1">Projected Business Impact:</h4>
            <p className="text-green-700 font-bold bg-green-50 p-3 rounded mb-6">{brief.projected_impact}</p>

            <div className="border-t border-gray-200 pt-4 text-center">
              <button
                onClick={downloadDocx}
                className="inline-flex items-center gap-2 bg-white border-2 border-[#00529B] text-[#00529B] px-6 py-2 rounded-md hover:bg-[#00529B] hover:text-white transition-colors font-bold shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export as Word Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold text-slate-800 mb-6 tracking-tight">About the Project</h1>
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm space-y-6 text-slate-700 text-lg leading-relaxed">
        <p>
          <strong className="text-[#00529B]">The Crisis:</strong> Aotearoa New Zealand wastes approximately 1.22 million tonnes of food annually. This represents a catastrophic failure of the supply chain, creating massive economic losses and driving significant greenhouse gas emissions through landfill methane.
        </p>
        <p>
          <strong className="text-[#00529B]">The Solution:</strong> The Aotearoa Circular Food Systems (ACFS) dashboard is a digital venture prototype built for the <em>Managing in Global Context</em> curriculum. It treats food waste not as an inevitability, but as a solvable data problem.
        </p>
        <div className="bg-slate-50 p-6 rounded-md border border-slate-200 my-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Our Three-Pillar Approach:</h3>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Predict (Retail):</strong> Intervening before waste occurs by dynamically adjusting supermarket procurement orders based on AI-driven localized demand trends.</li>
            <li><strong>Redistribute (Farms):</strong> Creating an automated secondary market to catch cosmetically imperfect "Grade-B" produce that would normally be left to rot, routing it instantly to commercial bioprocessors or juiceries.</li>
            <li><strong>Convert (End of Life):</strong> Ensuring unavoidable organic waste bypasses landfills entirely, automatically calculating logistics for regional anaerobic digestion plants to capture energy.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderArchitecture = () => (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold text-slate-800 mb-6 tracking-tight">Dashboard Architecture</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <div className="h-12 w-12 bg-blue-100 text-blue-700 flex items-center justify-center rounded-lg mb-4 text-2xl font-bold">1</div>
          <h3 className="text-2xl font-bold text-[#00529B] mb-3">The Frontend Face</h3>
          <p className="text-slate-600 mb-4">Built on <strong>React & Next.js 14</strong>, this Single Page Application acts as the control tower. It uses standard API fetch logic to poll the backend, while dynamically animating state changes using <strong>Recharts</strong> to simulate live IoT sensors.</p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <div className="h-12 w-12 bg-green-100 text-green-700 flex items-center justify-center rounded-lg mb-4 text-2xl font-bold">2</div>
          <h3 className="text-2xl font-bold text-[#00529B] mb-3">The Python Brain</h3>
          <p className="text-slate-600 mb-4">The engine runs on <strong>FastAPI (Python)</strong>. It hosts four distinct digital addresses (endpoints) that act as the middleman between the web browser and the artificial intelligence, securely managing traffic.</p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm md:col-span-2">
          <div className="h-12 w-12 bg-purple-100 text-purple-700 flex items-center justify-center rounded-lg mb-4 text-2xl font-bold">3</div>
          <h3 className="text-2xl font-bold text-[#00529B] mb-3">Gemini LLM Integration & Security</h3>
          <p className="text-slate-600 mb-4">The data shown is not static. The Python backend communicates directly with the <strong>Google Gemini 1.5 API</strong>. Every time a refresh is requested, strict JSON schema prompts are sent to the AI to generate completely unique, mathematically sound New Zealand supply chain scenarios on the fly. The API credentials are encrypted locally via a <strong>.env vault</strong>, isolating configuration from the main codebase for enterprise-grade deployment readiness.</p>
        </div>

      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      <aside className="w-72 bg-[#00529B] text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-blue-800/50 flex flex-col items-center text-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag_of_New_Zealand.svg"
            alt="New Zealand Flag"
            className="w-24 mb-4 rounded shadow-md border border-white/10"
          />
          <h2 className="text-2xl font-bold tracking-tight">ACFS Hub</h2>
          <p className="text-blue-200 text-sm mt-1">Aotearoa Circular Food</p>
        </div>

        <nav className="flex-1 p-4 space-y-3 mt-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full text-left px-5 py-3 rounded-lg transition-all duration-200 ${activeView === 'dashboard' ? 'bg-white text-[#00529B] font-bold shadow-md transform scale-105' : 'hover:bg-blue-800/80 text-blue-50'}`}
          >
            System Dashboard
          </button>

          <button
            onClick={() => setActiveView('about')}
            className={`w-full text-left px-5 py-3 rounded-lg transition-all duration-200 ${activeView === 'about' ? 'bg-white text-[#00529B] font-bold shadow-md transform scale-105' : 'hover:bg-blue-800/80 text-blue-50'}`}
          >
            About the Project
          </button>

          <button
            onClick={() => setActiveView('architecture')}
            className={`w-full text-left px-5 py-3 rounded-lg transition-all duration-200 ${activeView === 'architecture' ? 'bg-white text-[#00529B] font-bold shadow-md transform scale-105' : 'hover:bg-blue-800/80 text-blue-50'}`}
          >
            Dashboard Architecture
          </button>
        </nav>

        <div className="p-4 border-t border-blue-800/50 text-xs text-blue-300 text-center">
          Managing in Global Context
          <br/>Venture Prototype v1.0
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'about' && renderAbout()}
        {activeView === 'architecture' && renderArchitecture()}
      </main>

    </div>
  );
}