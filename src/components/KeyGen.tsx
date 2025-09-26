import React, { useState } from 'react';
import { Key, RefreshCw, Copy, Check } from 'lucide-react';
import { DSS } from '../utils/dss';
import { DSSParameters, DSSKeyPair } from '../types/dss';

interface KeyGenProps {
  onParametersGenerated: (params: DSSParameters, keyPair: DSSKeyPair) => void;
}

export function KeyGen({ onParametersGenerated }: KeyGenProps) {
  const [parameters, setParameters] = useState<DSSParameters | null>(null);
  const [keyPair, setKeyPair] = useState<DSSKeyPair | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const generateKeys = async () => {
    setGenerating(true);
    
    try {
      // Add small delay and yield to prevent UI blocking
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const params = DSS.generateParameters();
      
      // Yield to UI thread
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const keys = DSS.generateKeyPair(params);
      
      setParameters(params);
      setKeyPair(keys);
      onParametersGenerated(params, keys);
    } catch (error) {
      console.error('Key generation failed:', error);
      // You could add error state handling here if needed
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatBigInt = (value: bigint, label: string) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>
        <button
          onClick={() => copyToClipboard(value.toString(), label)}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Copy to clipboard"
        >
          {copied === label ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>
      <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">
        {value.toString()}
      </code>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Bit length: {value.toString(2).length}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Key className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">DSS Key Generation</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Generate DSS parameters and key pair</p>
          </div>
        </div>

        <button
          onClick={generateKeys}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
        >
          <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating...' : 'Generate Keys'}
        </button>

        {parameters && keyPair && (
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">DSS Parameters</h3>
              <div className="grid gap-4">
                {formatBigInt(parameters.p, 'Prime modulus (p)')}
                {formatBigInt(parameters.q, 'Prime divisor (q)')}
                {formatBigInt(parameters.g, 'Generator (g)')}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Pair</h3>
              <div className="grid gap-4">
                {formatBigInt(keyPair.privateKey, 'Private key (x)')}
                {formatBigInt(keyPair.publicKey, 'Public key (y = g^x mod p)')}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Key Generation Complete</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Keys and parameters have been generated successfully. You can now use them for signing and verification.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}