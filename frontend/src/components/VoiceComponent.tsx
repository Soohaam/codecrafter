import VoiceAnalyzer from "./VoiceAnalyzer";

const VoiceComponent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6">
      <header className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-block mb-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium tracking-wide">
          VOICE ANALYSIS
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Voice Threat Analyzer
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Capture voice recordings and instantly analyze speech for potential threats.
          This tool helps identify concerning content with real-time threat level assessment.
        </p>
      </header>

      <main className="pb-12">
        <VoiceAnalyzer />
      </main>

      <footer className="max-w-3xl mx-auto text-center text-sm text-gray-500 mt-16">
        <p className="mb-2">
          Speech analysis is performed locally on your device.
        </p>
        <p>© {new Date().getFullYear()} Voice Threat Analyzer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default VoiceComponent;
