import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Calculator } from 'lucide-react';
import { DSS } from '../utils/dss';
import { DSSParameters, DSSKeyPair, VerificationResult } from '../types/dss';

interface VerifyProps {
  parameters: DSSParameters | null;
  keyPair: DSSKeyPair | null;
  initialData?: {
    message: string;
    signature: { r: string; s: string };
  } | null;
  onDataUsed?: () => void;
}

export function Verify({ parameters, keyPair, initialData, onDataUsed }: VerifyProps) {
  const [message, setMessage] = useState('');
  const [rValue, setRValue] = useState('');
  const [sValue, setSValue] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setMessage(initialData.message);
      setRValue(initialData.signature.r);
      setSValue(initialData.signature.s);
      onDataUsed?.();
    }
  }, [initialData, onDataUsed]);

  const verifySignature = async () => {
    if (!parameters || !keyPair) {
      setError('Please generate keys first');
      return;
    }

    if (!message.trim() || !rValue.trim() || !sValue.trim()) {
      setError('Please enter message, r, and s values');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const r = BigInt(rValue);
      const s = BigInt(sValue);
      
      const result = await DSS.verify(
        message,
        { r, s },
        parameters,
        keyPair.publicKey
      );
      
      setVerificationResult(result);
    } catch (err) {
      setError('Invalid signature values');
    } finally {
      setVerifying(false);
    }
  };

  const formatBigInt = (value: bigint, label: string, description?: string) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">{label}:</div>
      {description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</div>
      )}
      <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">
        {value.toString()}
      </code>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Signature Verification</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Verify DSS/DSA signatures</p>
          </div>
        </div>

        {!parameters || !keyPair ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                Please generate keys first in the Key Generation tab
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label htmlFor="verify-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original Message
                </label>
                <textarea
                  id="verify-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white resize-none"
                  placeholder="Enter the original message..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="r-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Signature r value
                  </label>
                  <input
                    id="r-value"
                    type="text"
                    value={rValue}
                    onChange={(e) => setRValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter r value..."
                  />
                </div>
                <div>
                  <label htmlFor="s-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Signature s value
                  </label>
                  <input
                    id="s-value"
                    type="text"
                    value={sValue}
                    onChange={(e) => setSValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter s value..."
                  />
                </div>
              </div>

              <button
                onClick={verifySignature}
                disabled={verifying}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                <Calculator className={`w-5 h-5 ${verifying ? 'animate-pulse' : ''}`} />
                {verifying ? 'Verifying...' : 'Verify Signature'}
              </button>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {verificationResult && (
              <div className="mt-8 space-y-6">
                <div className={`border rounded-lg p-4 ${
                  verificationResult.isValid 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {verificationResult.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`font-medium ${
                      verificationResult.isValid 
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {verificationResult.isValid ? 'Signature Valid' : 'Signature Invalid'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    verificationResult.isValid 
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {verificationResult.message}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification Steps</h3>
                  <div className="grid gap-4">
                    {formatBigInt(verificationResult.steps.w, 'w = s^(-1) mod q', 'Modular inverse of s')}
                    {formatBigInt(verificationResult.steps.u1, 'u1 = (H(m) × w) mod q', 'Hash times w')}
                    {formatBigInt(verificationResult.steps.u2, 'u2 = (r × w) mod q', 'r times w')}
                    {formatBigInt(verificationResult.steps.v, 'v = ((g^u1 × y^u2) mod p) mod q', 'Final verification value')}
                    
                    <div className={`rounded-lg p-4 border-2 ${
                      verificationResult.isValid 
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                        : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
                    }`}>
                      <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Verification: v = r ?
                      </div>
                      <div className="text-sm font-mono">
                        <div className="mb-1">v = {verificationResult.steps.v.toString()}</div>
                        <div className="mb-2">r = {verificationResult.steps.r.toString()}</div>
                        <div className={`font-bold ${
                          verificationResult.isValid 
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          Result: {verificationResult.isValid ? 'v = r ✓' : 'v ≠ r ✗'}
                        </div>
                      </div>
                    </div>
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