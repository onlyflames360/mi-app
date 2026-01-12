
import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSourceImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt) return;
    setIsLoading(true);
    try {
      const { imageUrl } = await editImageWithGemini(sourceImage, prompt);
      setEditedImage(imageUrl);
    } catch (error) {
      console.error('Editing error:', error);
      alert('Failed to edit image. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-2">Image Editor</h2>
        <p className="text-gray-500 text-sm mb-6">Upload an image and use text prompts to modify it using Gemini 2.5 Flash Image.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Source Image Area */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Original Image</p>
            <div 
              className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-yellow-300 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {sourceImage ? (
                <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <i className="fa-solid fa-image text-3xl text-gray-300 mb-2"></i>
                  <p className="text-xs text-gray-400">Click to upload image</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          {/* Edited Image Area */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Edited Result</p>
            <div className="aspect-square bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-semibold text-gray-700">Re-imagining your image...</p>
                  <p className="text-xs text-gray-500 mt-1">Applying transformations with Gemini</p>
                </div>
              )}
              {editedImage ? (
                <img src={editedImage} alt="Edited" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <i className="fa-solid fa-sparkles text-3xl text-gray-200 mb-2"></i>
                  <p className="text-xs text-gray-400">Results will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all resize-none h-24"
              placeholder="E.g., 'Add a vintage 70s film filter' or 'Make it look like it's raining'..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={!sourceImage || isLoading}
            />
            <div className="absolute top-4 right-4 text-gray-300">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
          </div>
          
          <button
            onClick={handleEdit}
            disabled={!sourceImage || !prompt || isLoading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              !sourceImage || !prompt || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-lg shadow-yellow-400/20'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                Processing...
              </span>
            ) : (
              <>
                <i className="fa-solid fa-bolt"></i>
                Apply AI Edit
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: 'fa-sun', label: 'Improve Lighting', prompt: 'Brighten the scene and make the lighting warmer' },
          { icon: 'fa-mountain', label: 'Change Background', prompt: 'Place the subject in a lush tropical jungle' },
          { icon: 'fa-user-slash', label: 'Object Removal', prompt: 'Remove any distracting people in the background' },
        ].map((suggest, idx) => (
          <button
            key={idx}
            onClick={() => setPrompt(suggest.prompt)}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:border-yellow-200 text-left transition-all hover:shadow-sm"
          >
            <i className={`fa-solid ${suggest.icon} text-yellow-500 mb-2`}></i>
            <p className="text-xs font-bold text-gray-900">{suggest.label}</p>
            <p className="text-[10px] text-gray-500 mt-1 truncate">{suggest.prompt}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageEditor;
