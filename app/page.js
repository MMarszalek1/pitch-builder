'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, Users, DollarSign, Link2, Newspaper, Wine, Check, X, RefreshCw, Copy, Sparkles, Wand2, Edit3, Loader2, ArrowRight, Zap, Trash2, Save, RotateCcw, FileText } from 'lucide-react';

const BUZZWORDS = ['platform', 'leverage', 'synergy', 'disrupt', 'paradigm', 'ecosystem', 'scalable', 'innovative', 'cutting-edge', 'revolutionary', 'game-changing', 'world-class', 'next-gen', 'ai-powered', 'blockchain', 'web3', 'holistic', 'robust', 'seamless'];
const SUPERLATIVES = ['first', 'only', 'best', 'biggest', 'fastest', 'cheapest', 'most', 'leading', 'top', 'premier', 'ultimate', 'unrivaled', 'unique'];
const VAGUE_AUDIENCES = ['everyone', 'businesses', 'companies', 'people', 'users', 'consumers', 'customers', 'organizations', 'individuals'];

export default function PitchBuilder() {
  const [inputs, setInputs] = useState({
    companyName: '',
    offering: '',
    audience: '',
    problemStatement: '',
    outcome: '',
    secretSauce: '',
    analogy: ''
  });
  const [audienceMode, setAudienceMode] = useState('investor');
  const [lengthMode, setLengthMode] = useState('sentence');
  const [warnings, setWarnings] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showEmailTest, setShowEmailTest] = useState(false);
  
  const [generatedPitch, setGeneratedPitch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIterating, setIsIterating] = useState(false);
  const [iterateMode, setIterateMode] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [editablePitch, setEditablePitch] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const [drafts, setDrafts] = useState([]);
  const [savedNotification, setSavedNotification] = useState(false);

  const audienceModes = [
    { id: 'investor', label: 'Investors', icon: DollarSign, desc: 'Focus on opportunity & traction' },
    { id: 'customer', label: 'Customers', icon: Users, desc: 'Focus on their problem & solution' },
    { id: 'partner', label: 'Partners', icon: Link2, desc: 'Focus on mutual value' },
    { id: 'press', label: 'Press', icon: Newspaper, desc: 'Focus on the story angle' },
    { id: 'casual', label: 'Casual', icon: Wine, desc: 'Simple, relatable explanation' }
  ];

  const lengthModes = [
    { id: '6words', label: '6 Words', desc: 'Tagline / Twitter bio', maxWords: 6 },
    { id: '10words', label: '10 Words', desc: 'Memorable hook', maxWords: 10 },
    { id: 'sentence', label: 'One Sentence', desc: '~20 words, full context', maxWords: 25 },
    { id: 'full', label: 'Two Sentences', desc: 'With specific example', maxWords: 50 }
  ];

  const steps = [
    { field: 'companyName', label: 'Company Name', placeholder: 'e.g., Airbnb', tip: 'Just your company name.' },
    { field: 'offering', label: 'What are you building?', placeholder: 'e.g., a website and mobile app for booking accommodations', tip: 'Describe the type of product simply.' },
    { field: 'audience', label: 'Who is it for?', placeholder: 'e.g., travelers looking for affordable, unique places to stay', tip: 'Be specific about demographics or role.' },
    { field: 'problemStatement', label: 'What problem are you solving?', placeholder: 'e.g., hotels are expensive and impersonal, while spare rooms sit empty', tip: 'Describe the pain point or gap in the market.' },
    { field: 'outcome', label: 'What outcome do you enable?', placeholder: 'e.g., book unique local homes and earn money by sharing extra space', tip: 'Focus on what they can now do or achieve.' },
    { field: 'secretSauce', label: 'What makes you different?', placeholder: 'e.g., verified reviews, secure payments, and host guarantees', tip: 'Your unique approach or technology.' },
    { field: 'analogy', label: 'Simple analogy (optional)', placeholder: 'e.g., like eBay for renting spare rooms', tip: 'Helps with casual explanations.' }
  ];

  useEffect(() => {
    const allText = Object.values(inputs).join(' ').toLowerCase();
    const newWarnings = [];
    
    BUZZWORDS.forEach(word => {
      if (allText.includes(word.toLowerCase())) {
        newWarnings.push({ type: 'buzzword', word, message: `"${word}" is jargon—be more specific` });
      }
    });
    
    SUPERLATIVES.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(allText)) {
        newWarnings.push({ type: 'superlative', word, message: `"${word}" signals inexperience—let others say it` });
      }
    });
    
    if (inputs.audience) {
      VAGUE_AUDIENCES.forEach(word => {
        if (inputs.audience.toLowerCase() === word || 
            inputs.audience.toLowerCase().split(/\s+/).includes(word)) {
          newWarnings.push({ type: 'vague', word, message: `"${word}" is too vague as an audience` });
        }
      });
    }
    
    setWarnings(newWarnings);
  }, [inputs]);

  useEffect(() => {
    if (generatedPitch && !iterateMode) {
      setEditablePitch(generatedPitch);
    }
  }, [generatedPitch, iterateMode]);

  const saveToDrafts = () => {
    if (!editablePitch) return;
    
    const draftEntry = {
      id: Date.now(),
      pitch: editablePitch,
      audience: audienceMode,
      length: lengthMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    };
    setDrafts(prev => [draftEntry, ...prev].slice(0, 20));
    
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const removeFromDrafts = (id) => {
    setDrafts(prev => prev.filter(entry => entry.id !== id));
  };

  const restoreFromDrafts = (entry) => {
    setEditablePitch(entry.pitch);
    setGeneratedPitch(entry.pitch);
    setAudienceMode(entry.audience);
    setLengthMode(entry.length);
    setHasGenerated(true);
  };

  const generateWithAI = async () => {
    if (!inputs.companyName || !inputs.offering || !inputs.audience || !inputs.problemStatement || !inputs.outcome) {
      return;
    }

    setIsGenerating(true);
    setSuggestions([]);
    setIterateMode(false);

    const lengthGuide = {
      '6words': 'exactly 6 words or fewer—a punchy tagline',
      '10words': 'approximately 10 words—a memorable hook',
      'sentence': 'one clear sentence of about 15-25 words',
      'full': 'two sentences: the first explains what you do, the second gives a specific vivid example'
    };

    const audienceGuide = {
      'investor': 'an investor who cares about market opportunity, clarity, and why this will succeed',
      'customer': 'a potential customer who wants to know how this solves their problem',
      'partner': 'a potential partner interested in mutual value and collaboration opportunities',
      'press': 'a journalist looking for a compelling human-interest angle',
      'casual': 'someone at a party who just asked "what do you do?" - keep it relatable and jargon-free'
    };

    const prompt = `You are an expert startup pitch coach trained on Y Combinator, Founder Institute, and Sequoia Capital methodologies.

A founder needs help crafting a startup introduction. Here are their inputs:

Company Name: ${inputs.companyName}
What they're building: ${inputs.offering}
Target audience: ${inputs.audience}
Problem they're solving: ${inputs.problemStatement}
Outcome they enable: ${inputs.outcome}
What makes them unique: ${inputs.secretSauce || 'not specified'}
Simple analogy: ${inputs.analogy || 'not provided'}

TASK: Write a ${lengthGuide[lengthMode]} pitch tailored for ${audienceGuide[audienceMode]}.

CRITICAL RULES:
1. The pitch must flow naturally as a complete, polished sentence—NOT a fill-in-the-blank template
2. NO buzzwords like "platform", "leverage", "synergy", "disrupt", "innovative", "revolutionary"
3. NO superlatives like "first", "only", "best", "leading" 
4. Be specific and concrete—avoid vague language
5. If the length is "6 words" or "10 words", be ruthlessly concise
6. For "casual" audience, use the analogy if provided and make it conversational
7. For "investor" audience, emphasize clarity about what the company does
8. The pitch should be immediately understandable by someone with no context

OUTPUT: Return ONLY the pitch text, nothing else. No quotes, no explanation, no preamble.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, max_tokens: 300 })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate');
      }
      
      const data = await response.json();
      const pitch = data.content[0].text.trim().replace(/^["']|["']$/g, '');
      setGeneratedPitch(pitch);
      setEditablePitch(pitch);
      setHasGenerated(true);
    } catch (error) {
      console.error("Generation error:", error);
      setGeneratedPitch("Error generating pitch. Please try again.");
    }
    
    setIsGenerating(false);
  };

  const iterateWithAI = async () => {
    if (!editablePitch) return;
    
    setIsIterating(true);

    const prompt = `You are an expert startup pitch coach. Analyze this pitch and suggest specific improvements.

CURRENT PITCH: "${editablePitch}"

CONTEXT:
- Company: ${inputs.companyName}
- Target length: ${lengthMode === '6words' ? '6 words' : lengthMode === '10words' ? '10 words' : lengthMode === 'sentence' ? 'one sentence' : 'two sentences'}
- Target audience: ${audienceMode}

TASK: Provide 3-4 specific, actionable suggestions to improve this pitch. For each suggestion:
1. Identify the specific word or phrase to change
2. Explain why it should change (too vague, jargon, too long, unclear, etc.)
3. Provide a concrete alternative

Also provide one fully rewritten "improved version" that incorporates all suggestions.

FORMAT YOUR RESPONSE AS JSON:
{
  "suggestions": [
    {
      "original": "the specific word or phrase",
      "issue": "brief explanation of the problem",
      "replacement": "suggested replacement",
      "priority": "high" or "medium" or "low"
    }
  ],
  "improvedVersion": "the complete rewritten pitch"
}

Return ONLY valid JSON, no other text.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, max_tokens: 600 })
      });
      
      if (!response.ok) {
        throw new Error('Failed to iterate');
      }
      
      const data = await response.json();
      let responseText = data.content[0].text;
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const parsed = JSON.parse(responseText);
      setSuggestions(parsed.suggestions || []);
      
      if (parsed.improvedVersion) {
        setSuggestions(prev => [...prev, { 
          type: 'rewrite', 
          improvedVersion: parsed.improvedVersion 
        }]);
      }
    } catch (error) {
      console.error("Iteration error:", error);
      setSuggestions([{ 
        original: "Error", 
        issue: "Could not analyze pitch. Please try again.", 
        replacement: "",
        priority: "high"
      }]);
    }
    
    setIsIterating(false);
  };

  const applyImprovedVersion = (newPitch) => {
    setEditablePitch(newPitch);
    setGeneratedPitch(newPitch);
    setSuggestions([]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editablePitch || generatedPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = (editablePitch || '').split(/\s+/).filter(w => w.length > 0).length;
  const isComplete = inputs.companyName && inputs.offering && inputs.audience && inputs.problemStatement && inputs.outcome;

  const emailTestQuestions = [
    inputs.offering?.toLowerCase().includes('platform') && "What kind of platform exactly?",
    inputs.audience && VAGUE_AUDIENCES.some(v => inputs.audience.toLowerCase().includes(v)) && "Who specifically are you targeting?",
    !inputs.secretSauce && "What makes this different from existing solutions?",
    editablePitch && editablePitch.split(' ').length > 30 && "Can you say this more concisely?"
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            One-Sentence Pitch Builder
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Your Startup
              </h2>
              
              {steps.map((s, idx) => (
                <div key={s.field} className="mb-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {s.label} {idx < 5 && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={inputs[s.field]}
                    onChange={(e) => setInputs({ ...inputs, [s.field]: e.target.value })}
                    placeholder={s.placeholder}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-0.5">{s.tip}</p>
                </div>
              ))}
            </div>

            {warnings.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <h3 className="text-amber-400 font-medium text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Watch Out
                </h3>
                <ul className="space-y-1">
                  {warnings.slice(0, 3).map((w, i) => (
                    <li key={i} className="text-xs text-amber-200/80 flex items-start gap-1.5">
                      <X className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-500" />
                      {w.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                <h3 className="text-xs font-medium text-slate-400 mb-2">Who are you pitching to?</h3>
                <div className="flex flex-wrap gap-1.5">
                  {audienceModes.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = audienceMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setAudienceMode(mode.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  {audienceModes.find(m => m.id === audienceMode)?.desc}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                <h3 className="text-xs font-medium text-slate-400 mb-2">How long?</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {lengthModes.map((mode) => {
                    const isActive = lengthMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setLengthMode(mode.id)}
                        className={`px-2.5 py-2 rounded-lg text-left transition-all ${
                          isActive 
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="font-medium text-xs">{mode.label}</div>
                        <div className="text-xs opacity-70">{mode.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={generateWithAI}
              disabled={!isComplete || isGenerating}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                isComplete && !isGenerating
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Crafting your pitch...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Pitch with AI
                </>
              )}
            </button>

            {(hasGenerated || editablePitch) && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl p-4 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Your Pitch
                    <span className="text-xs text-slate-500 font-normal">({wordCount} words)</span>
                  </h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded text-xs transition-all"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                
                <textarea
                  value={editablePitch}
                  onChange={(e) => setEditablePitch(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                  rows={lengthMode === 'full' ? 4 : 2}
                  placeholder="Your generated pitch will appear here. You can edit it directly."
                />

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button
                    onClick={saveToDrafts}
                    disabled={!editablePitch}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      savedNotification
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                    } ${!editablePitch ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {savedNotification ? (
                      <>
                        <Check className="w-3 h-3" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3" />
                        Save to Drafts
                      </>
                    )}
                  </button>

                  <button
                    onClick={generateWithAI}
                    disabled={!isComplete || isGenerating}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-slate-500 hover:bg-slate-700 ${
                      (!isComplete || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3 h-3" />
                    )}
                    Try Again
                  </button>

                  <div className="h-4 w-px bg-slate-600 mx-1"></div>

                  <button
                    onClick={() => {
                      setIterateMode(!iterateMode);
                      if (!iterateMode && editablePitch) {
                        iterateWithAI();
                      }
                    }}
                    disabled={!editablePitch || isIterating}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      iterateMode 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-slate-500'
                    } ${(!editablePitch || isIterating) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isIterating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                    {isIterating ? 'Analyzing...' : iterateMode ? 'Iterate Mode ON' : 'Get AI Suggestions'}
                  </button>

                  {iterateMode && !isIterating && (
                    <button
                      onClick={iterateWithAI}
                      className="flex items-center gap-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs font-medium transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Re-analyze
                    </button>
                  )}
                </div>
              </div>
            )}

            {iterateMode && suggestions.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/30">
                <h3 className="font-semibold text-purple-400 text-sm mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  AI Suggestions
                </h3>
                
                <div className="space-y-2">
                  {suggestions.filter(s => !s.type).map((s, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-lg border ${
                        s.priority === 'high' 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : s.priority === 'medium'
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-slate-700/30 border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                              &quot;{s.original}&quot;
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="text-xs font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400">
                              &quot;{s.replacement}&quot;
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{s.issue}</p>
                        </div>
                        <button
                          onClick={() => {
                            const newPitch = editablePitch.replace(s.original, s.replacement);
                            setEditablePitch(newPitch);
                          }}
                          className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-xs font-medium transition-all flex-shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}

                  {suggestions.find(s => s.type === 'rewrite') && (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-purple-400">✨ Fully Rewritten Version</span>
                        <button
                          onClick={() => applyImprovedVersion(suggestions.find(s => s.type === 'rewrite').improvedVersion)}
                          className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-xs font-medium transition-all"
                        >
                          Use This
                        </button>
                      </div>
                      <p className="text-sm text-white">
                        {suggestions.find(s => s.type === 'rewrite').improvedVersion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasGenerated && (
              <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
                <button 
                  onClick={() => setShowEmailTest(!showEmailTest)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium text-slate-400">📧 The Email Test</span>
                  <span className="text-xs text-slate-500">{showEmailTest ? 'Hide' : 'Show'}</span>
                </button>
                
                {showEmailTest && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-2">
                      Would a friend ask any clarifying questions?
                    </p>
                    {emailTestQuestions.length > 0 ? (
                      <ul className="space-y-1">
                        {emailTestQuestions.map((q, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 rounded p-2">
                            <span>❓</span> {q}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 rounded p-2 text-xs">
                        <Check className="w-4 h-4" />
                        Looking good! Clear and understandable.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Pro Tip</h4>
              <p className="text-xs text-slate-400">
                {audienceMode === 'investor' && "Investors fund what they understand. If they can't explain your business to their partners, they can't write a check."}
                {audienceMode === 'customer' && "Focus on the transformation: what can they do now that they couldn't before?"}
                {audienceMode === 'partner' && "Lead with shared mission, then explain how you complement each other."}
                {audienceMode === 'press' && "Find the human story. Why should their readers care about this problem?"}
                {audienceMode === 'casual' && "Use an analogy they already know. If they nod, you've nailed it."}
              </p>
            </div>
          </div>
        </div>

        {drafts.length > 0 && (
          <div className="mt-8 bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-slate-200">
              <FileText className="w-5 h-5 text-slate-400" />
              Saved Drafts
              <span className="text-xs text-slate-500 font-normal ml-2">({drafts.length} saved)</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {drafts.map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 group hover:border-slate-500 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                        {audienceModes.find(a => a.id === entry.audience)?.label}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                        {lengthModes.find(l => l.id === entry.length)?.label}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromDrafts(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded transition-all"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-3 mb-3">{entry.pitch}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{entry.date} at {entry.timestamp}</span>
                    <button
                      onClick={() => restoreFromDrafts(entry)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Use this
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center space-y-1">
          <p className="text-xs text-slate-500">Built by Megan Marszalek</p>
          <p className="text-xs text-slate-600">Based on frameworks from Y Combinator, Founder Institute & Sequoia Capital</p>
        </div>
      </div>
    </div>
  );
}
