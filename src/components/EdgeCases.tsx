import React, { useState } from 'react';
import { AlertTriangle, Bug, Target, RefreshCw } from 'lucide-react';
import { DSS } from '../utils/dss';
import { DSSParameters, DSSKeyPair } from '../types/dss';

interface EdgeCasesProps {
  parameters: DSSParameters | null;
  keyPair: DSSKeyPair | null;
}

export function EdgeCases({ parameters, keyPair }: EdgeCasesProps) {
  const [message1, setMessage1] = useState('Hello World');
  const [message2, setMessage2] = useState('Secret Message');
  const [fixedK, setFixedK] = useState('123456789');
  const [results, setResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const demonstrateKReuse = async () => {
    if (!parameters || !keyPair) return;

    setTesting(true);
    try {
      const k = BigInt(fixedK);
      
      // Sign both messages with the same k
      const result1 = await DSS.sign(message1, parameters, keyPair.privateKey, false, k);
      const result2 = await DSS.sign(message2, parameters, keyPair.privateKey, false, k);
      
      // Attempt to recover private key
      const recovery = DSS.recoverPrivateKeyFromReusedK(
        message1, result1.signature,
        message2, result2.signature,
        parameters
      );
      
      setResults({
        type: 'k-reuse',
        sig1: result1,
        sig2: result2,
        recovery,
        originalPrivateKey: keyPair.privateKey
      });
    } catch (error) {
      console.error('K-reuse demonstration failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const demonstrateInvalidSignature = async () => {
    if (!parameters || !keyPair) return;

    setTesting(true);
    try {
      // Create various invalid signatures
      const validSig = await DSS.sign(message1, parameters, keyPair.privateKey);
      
      // Test cases: r=0, s=0, out of range values
      const testCases = [
        { r: 0n, s: validSig.signature.s, description: 'r = 0 (invalid)' },
        { r: validSig.signature.r, s: 0n, description: 's = 0 (invalid)' },
        { r: parameters.q, s: validSig.signature.s, description: 'r = q (out of range)' },
        { r: validSig.signature.r, s: parameters.q, description: 's = q (out of range)' },
        { r: validSig.signature.r + 1n, s: validSig.signature.s, description: 'Tampered r value' },
        { r: validSig.signature.r, s: validSig.signature.s + 1n, description: 'Tampered s value' }
      ];
      
      const verifications = await Promise.all(
        testCases.map(async (testCase) => {
          const verification = await DSS.verify(
            message1,
            { r: testCase.r, s: testCase.s },
            parameters,
            keyPair.publicKey
          );
          return { ...testCase, verification };
        })
      );
      
      setResults({
        type: 'invalid-signatures',
        validSignature: validSig,
        testCases: verifications
      });
    } catch (error) {
      console.error('Invalid signature demonstration failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const demonstrateLargeMessage = async () => {
    if (!parameters || !keyPair) return;

    setTesting(true);
    try {
      // Create a large message (10,000+ characters)
      const largeMessage = 'A'.repeat(15000) + ' This is a very large message for testing DSS with big inputs.';
      
      const result = await DSS.sign(largeMessage, parameters, keyPair.privateKey);
      const verification = await DSS.verify(largeMessage, result.signature, parameters, keyPair.publicKey);
      
      setResults({
        type: 'large-message',
        messageLength: largeMessage.length,
        result,
        verification
      });
    } catch (error) {
      console.error('Large message demonstration failed:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Bug className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edge Case Demonstrations</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Explore vulnerabilities and edge cases in DSS</p>
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
          <div className="grid gap-6">
            {/* K-Reuse Attack */}
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">K-Reuse Attack</h3>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Demonstrates how reusing the same nonce k for multiple signatures can lead to private key recovery.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                    Message 1
                  </label>
                  <input
                    type="text"
                    value={message1}
                    onChange={(e) => setMessage1(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                    Message 2
                  </label>
                  <input
                    type="text"
                    value={message2}
                    onChange={(e) => setMessage2(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                  Fixed k value (same for both messages)
                </label>
                <input
                  type="text"
                  value={fixedK}
                  onChange={(e) => setFixedK(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <button
                onClick={demonstrateKReuse}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Testing...' : 'Demonstrate K-Reuse Attack'}
              </button>
            </div>

            {/* Invalid Signatures */}
            <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-6 bg-orange-50 dark:bg-orange-900/10">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Invalid Signatures</h3>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                Tests various invalid signature scenarios including r=0, s=0, out-of-range values, and tampered signatures.
              </p>
              
              <button
                onClick={demonstrateInvalidSignature}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Testing...' : 'Test Invalid Signatures'}
              </button>
            </div>

            {/* Large Message */}
            <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-6 bg-blue-50 dark:bg-blue-900/10">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Large Message Handling</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                Tests DSS performance and correctness with very large messages (15,000+ characters).
              </p>
              
              <button
                onClick={demonstrateLargeMessage}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Testing...' : 'Test Large Message'}
              </button>
            </div>

            {/* Results Display */}
            {results && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Results</h3>
                
                {results.type === 'k-reuse' && (
                  <div className="space-y-4">
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Private Key Recovery Attack</h4>
                      <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                        <div>Original Private Key: <code className="font-mono">{results.originalPrivateKey.toString()}</code></div>
                        {results.recovery.privateKey && (
                          <div>Recovered Private Key: <code className="font-mono">{results.recovery.privateKey.toString()}</code></div>
                        )}
                        <div className={`font-bold ${results.recovery.privateKey === results.originalPrivateKey ? 'text-red-800' : 'text-green-800'}`}>
                          {results.recovery.privateKey === results.originalPrivateKey 
                            ? '⚠️ ATTACK SUCCESSFUL - Private key recovered!' 
                            : '✓ Attack failed (keys don\'t match)'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {results.type === 'invalid-signatures' && (
                  <div className="space-y-4">
                    {results.testCases.map((testCase: any, index: number) => (
                      <div key={index} className={`rounded-lg p-4 border ${
                        testCase.verification.isValid 
                          ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          : 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      }`}>
                        <div className="font-medium mb-2">{testCase.description}</div>
                        <div className={`text-sm ${
                          testCase.verification.isValid 
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          {testCase.verification.isValid ? '⚠️ Incorrectly validated' : '✓ Correctly rejected'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results.type === 'large-message' && (
                  <div className="space-y-4">
                    <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                        <div>Message Length: <strong>{results.messageLength.toLocaleString()} characters</strong></div>
                        <div>Hash: <code className="font-mono text-xs">{results.result.hash}</code></div>
                        <div className={`font-bold ${results.verification.isValid ? 'text-green-700' : 'text-red-700'}`}>
                          Verification: {results.verification.isValid ? '✓ Passed' : '✗ Failed'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}