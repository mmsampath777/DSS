import React, { useState } from 'react';
import { Shield, Key, PenTool, Bug, ArrowRight } from 'lucide-react';
import { KeyGen } from './components/KeyGen';
import { Sign } from './components/Sign';
import { Verify } from './components/Verify';
import { EdgeCases } from './components/EdgeCases';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { DSSParameters, DSSKeyPair, SigningResult } from './types/dss';

type Tab = 'keygen' | 'sign' | 'verify' | 'edge-cases';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('keygen');
  const [parameters, setParameters] = useState<DSSParameters | null>(null);
  const [keyPair, setKeyPair] = useState<DSSKeyPair | null>(null);
  const [verifyData, setVerifyData] = useState<{
    message: string;
    signature: { r: string; s: string };
  } | null>(null);
  const { theme } = useTheme();

  const handleParametersGenerated = (params: DSSParameters, keys: DSSKeyPair) => {
    setParameters(params);
    setKeyPair(keys);
  };

  const handleVerifyFromSign = (message: string, signingResult: SigningResult) => {
    setVerifyData({
      message,
      signature: {
        r: signingResult.signature.r.toString(),
        s: signingResult.signature.s.toString()
      }
    });
    setActiveTab('verify');
  };

  const tabs = [
    { id: 'keygen' as const, name: 'Key Generation', icon: Key, component: KeyGen },
    { id: 'sign' as const, name: 'Sign', icon: PenTool, component: Sign },
    { id: 'verify' as const, name: 'Verify', icon: Shield, component: Verify },
    { id: 'edge-cases' as const, name: 'Edge Cases', icon: Bug, component: EdgeCases },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  DSS Virtual Lab
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Digital Signature Standard (DSA) Implementation & Security Analysis
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'keygen' && (
            <KeyGen onParametersGenerated={handleParametersGenerated} />
          )}
          {activeTab === 'sign' && (
            <Sign 
              parameters={parameters} 
              keyPair={keyPair} 
              onVerifyFromSign={handleVerifyFromSign}
            />
          )}
          {activeTab === 'verify' && (
            <Verify 
              parameters={parameters} 
              keyPair={keyPair} 
              initialData={verifyData}
              onDataUsed={() => setVerifyData(null)}
            />
          )}
          {activeTab === 'edge-cases' && (
            <EdgeCases parameters={parameters} keyPair={keyPair} />
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Educational DSS/DSA Implementation • Built with React & TypeScript
            </p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              ⚠️ For educational purposes only. Do not use in production systems.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;