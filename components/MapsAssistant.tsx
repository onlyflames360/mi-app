
import React, { useState, useEffect } from 'react';
import { queryMaps } from '../services/geminiService';
import { GroundingLink } from '../types';

const MapsAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<{ text: string; links: GroundingLink[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.warn('Geolocation access denied or failed.', err)
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      const result = await queryMaps(prompt, location || undefined);
      setResponse(result);
    } catch (error) {
      console.error('Maps error:', error);
      alert('Failed to get map data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-map-location-dot text-2xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">Maps Grounding</h2>
            <p className="text-gray-500 text-sm">Real-time local data powered by Google Maps</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="What are you looking for? (e.g., Best ramen near me)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {location && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <i className="fa-solid fa-location-crosshairs"></i>
                LOC ACTIVE
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !prompt}
            className={`px-8 rounded-xl font-bold transition-all flex items-center gap-2 ${
              isLoading || !prompt ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
            Search
          </button>
        </div>

        {response && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Gemini Insights</h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{response.text}</p>
            </div>

            {response.links.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Verified Map Sources</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {response.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 group-hover:bg-blue-100">
                        <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 truncate">{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl shadow-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold mb-1">Local Context Enabled</h3>
            <p className="text-blue-100 text-sm">The assistant uses your current GPS coordinates to find highly relevant local results and reviews.</p>
          </div>
          <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg border border-white/30 text-xs font-mono">
            {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Waiting for GPS...'}
          </div>
        </div>
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default MapsAssistant;
