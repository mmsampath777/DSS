import React, { useState } from 'react';
import { PenTool, Hash, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { DSS } from '../utils/dss';
import { DSSParameters, DSSKeyPair, SigningResult } from '../types/dss';

interface SignProps {
  parameters: DSSParameters | null;
  keyPair: DSSKeyPair | null;
  onVerifyFromSign?: (message: string, signingResult: SigningResult) => void;
}

export function Sign({ parameters, keyPair, onVerifyFromSign }: SignProps) {
  const [message, setMessage] = useState('');
  const [useRandomK, setUseRandomK] = useState(true);
  const [fixedK, setFixedK] = useState('');
  const [signingResult, setSigningResult] = useState<SigningResult | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');

  const signMessage = async () => {
    if (!parameters || !keyPair) {
      setError('Please generate keys first');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message to sign');
      return;
    }

    setSigning(true);
    setError('');

    try {
      let fixedKBigInt: bigint | undefined;
      if (!useRandomK && fixedK) {
        try {
          fixedKBigInt = BigInt(fixedK);
          if (fixedKBigInt <= 0n || fixedKBigInt >= parameters.q) {
            throw new Error('k must be in range (0, q)');
          }
        } catch {
          setError('Invalid fixed k value');
          setSigning(false);
          return;
        }
      }

      const result = await DSS.sign(
        message,
        parameters,
        keyPair.privateKey,
        useRandomK,
        fixedKBigInt
      );
      
      setSigningResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signing failed');
    } finally {
      setSigning(false);
    }
  };

  const formatBigInt = (value: bigint, label: string) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">{label}:</div>
      <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">
        {value.toString()}
      </code>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <PenTool className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Message Signing</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sign messages with DSS/DSA</p>
          </div>
        </div>

        {!parameters || !keyPair ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                Please generate keys first in the Key Generation tab
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message to Sign
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white resize-none"
                  placeholder="Enter your message here... (supports up to 10,000+ characters)"
                  maxLength={50000}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.length} characters
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={useRandomK}
                    onChange={() => setUseRandomK(true)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Random nonce (k)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!useRandomK}
                    onChange={() => setUseRandomK(false)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Fixed nonce (k)</span>
                </label>
              </div>

              {!useRandomK && (
                <div>
                  <label htmlFor="fixedK" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fixed k value
                  </label>
                  <input
                    id="fixedK"
                    type="text"
                    value={fixedK}
                    onChange={(e) => setFixedK(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter k value (1 < k < q)"
                  />
                </div>
              )}

              <button
                onClick={signMessage}
                disabled={signing}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                <Hash className={`w-5 h-5 ${signing ? 'animate-pulse' : ''}`} />
                {signing ? 'Signing...' : 'Sign Message'}
              </button>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {signingResult && (
              <div className="mt-8 space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-800 dark:text-green-200 font-medium">Message Signed Successfully</span>
                  </div>
                  {onVerifyFromSign && (
                    <button
                      onClick={() => onVerifyFromSign(message, signingResult)}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm text-sm"
                      style={{ background: 'var(--color-secondary)' }}
                    >
                      <ArrowRight className="w-4 h-4" />
                      Verify This Signature
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Signature</h3>
                  <div className="grid gap-4">
                    {formatBigInt(signingResult.signature.r, 'r')}
                    {formatBigInt(signingResult.signature.s, 's')}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Intermediate Values</h3>
                  <div className="grid gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">SHA-256 Hash:</div>
                      <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">
                        {signingResult.hash}
                      </code>
                    </div>
                    {formatBigInt(signingResult.intermediateValues.hashBigInt, 'Hash as BigInt (mod q)')}
                    {formatBigInt(signingResult.k, 'Nonce (k)')}
                    {formatBigInt(signingResult.intermediateValues.kInverse, 'k^(-1) mod q')}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}