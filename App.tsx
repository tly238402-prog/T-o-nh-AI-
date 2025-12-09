import React, { useState, useMemo } from 'react';
import { Tab } from './types';
import ExtractionTab from './components/ExtractionTab';
import ModelTab from './components/ModelTab';
import PerspectiveTab from './components/PerspectiveTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Extraction);

  const tabs = useMemo(() => [
    { id: Tab.Extraction, name: 'Bóc tách trang phục' },
    { id: Tab.Model, name: 'Người mẫu' },
    { id: Tab.Perspective, name: 'Góc nhìn khác' },
  ], []);

  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.Extraction:
        return <ExtractionTab />;
      case Tab.Model:
        return <ModelTab />;
      case Tab.Perspective:
        return <PerspectiveTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Trình tạo ảnh thời trang AI
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Công cụ sáng tạo hình ảnh chuyên nghiệp cho ngành thời trang.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base focus:outline-none`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <main className="bg-white dark:bg-gray-800/50 shadow-lg rounded-xl p-6 sm:p-8">
            {renderTabContent()}
          </main>
        </div>
        
        <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Trình tạo ảnh thời trang AI. Được xây dựng với React & Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;