import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { AttributePanel } from './components/business/AttributePanel';
import { ResultSection } from './components/business/ResultSection';

const MainContent: React.FC = () => {
  const { isLoading, userCharacter, updateCharacterAttributes } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-500 font-medium">加载游戏数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <Header />

      <main className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Attribute Inputs */}
        <div className="lg:col-span-6">
          <AttributePanel
            attributes={userCharacter.BaseAttributes}
            onChange={updateCharacterAttributes}
          />
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-24">
            <ResultSection />
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
