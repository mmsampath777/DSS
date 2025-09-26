export interface DSSParameters {
  p: bigint;  // prime modulus
  q: bigint;  // prime divisor
  g: bigint;  // generator
}

export interface DSSKeyPair {
  privateKey: bigint;  // x
  publicKey: bigint;   // y
}

export interface DSSSignature {
  r: bigint;
  s: bigint;
}

export interface SigningResult {
  signature: DSSSignature;
  hash: string;
  k: bigint;
  intermediateValues: {
    hashBigInt: bigint;
    kInverse: bigint;
    r: bigint;
    s: bigint;
  };
}

export interface VerificationResult {
  isValid: boolean;
  steps: {
    w: bigint;
    u1: bigint;
    u2: bigint;
    v: bigint;
    r: bigint;
  };
  message: string;
}

export type Theme = 'light' | 'dark';