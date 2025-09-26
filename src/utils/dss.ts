import { modPow, modInverse, isPrime, generatePrime, hexToBigInt, sha256 } from './crypto';
import { DSSParameters, DSSKeyPair, DSSSignature, SigningResult, VerificationResult } from '../types/dss';

export class DSS {
  static generateParameters(): DSSParameters {
    // Generate very small toy parameters for demonstration to prevent UI freezing
    // In practice, these would be much larger (1024-3072 bits for p, 160-256 bits for q)
    
    // Generate q (small prime for demo)
    let q: bigint;
    do {
      q = generatePrime(16); // Very small for demo performance
    } while (q < 2n ** 8n);
    
    // Generate p such that (p-1) is divisible by q
    let p: bigint;
    let attempts = 0;
    do {
      if (attempts++ > 100) {
        // Use fallback values if generation takes too long
        q = 1009n; // Known prime
        p = 2n * q + 1n;
        while (!isPrime(p)) {
          p += 2n * q;
        }
        break;
      }
      const k = 2n + BigInt(Math.floor(Math.random() * 100));
      p = k * q + 1n;
    } while (!isPrime(p) || p < 2n ** 16n);
    
    // Generate g
    const h = 2n + BigInt(Math.floor(Math.random() * Number(p - 3n)));
    const g = modPow(h, (p - 1n) / q, p);
    
    return { p, q, g };
  }

  static generateKeyPair(params: DSSParameters): DSSKeyPair {
    const { p, q, g } = params;
    
    // Ensure q is not too small
    if (q <= 2n) {
      throw new Error('Invalid parameters: q must be greater than 2');
    }
    
    // Generate private key x (1 < x < q)
    const maxX = q > 1000n ? 1000n : q - 2n; // Limit range for performance
    const privateKey = 1n + BigInt(Math.floor(Math.random() * Number(maxX)));
    
    // Compute public key y = g^x mod p
    const publicKey = modPow(g, privateKey, p);
    
    return { privateKey, publicKey };
  }

  static async sign(
    message: string,
    params: DSSParameters,
    privateKey: bigint,
    useRandomK: boolean = true,
    fixedK?: bigint
  ): Promise<SigningResult> {
    const { p, q, g } = params;
    
    // Hash the message
    const hashHex = await sha256(message);
    const hashBigInt = hexToBigInt(hashHex) % q;
    
    let k: bigint;
    let r: bigint;
    let s: bigint;
    
    do {
      // Generate k
      if (!useRandomK && fixedK) {
        k = fixedK;
      } else {
        k = 1n + BigInt(Math.floor(Math.random() * Number(q - 2n)));
      }
      
      // Compute r = (g^k mod p) mod q
      r = modPow(g, k, p) % q;
      
      if (r === 0n) continue; // Try again if r = 0
      
      // Compute s = (k^-1 * (H(m) + x*r)) mod q
      const kInverse = modInverse(k, q);
      s = (kInverse * (hashBigInt + privateKey * r)) % q;
      
      if (s === 0n) continue; // Try again if s = 0
      
      break;
    } while (true);
    
    return {
      signature: { r, s },
      hash: hashHex,
      k,
      intermediateValues: {
        hashBigInt,
        kInverse: modInverse(k, q),
        r,
        s
      }
    };
  }

  static async verify(
    message: string,
    signature: DSSSignature,
    params: DSSParameters,
    publicKey: bigint
  ): Promise<VerificationResult> {
    const { p, q, g } = params;
    const { r, s } = signature;
    
    // Verify r and s are in valid range
    if (r <= 0n || r >= q || s <= 0n || s >= q) {
      return {
        isValid: false,
        steps: { w: 0n, u1: 0n, u2: 0n, v: 0n, r },
        message: 'Invalid signature values (r or s out of range)'
      };
    }
    
    // Hash the message
    const hashHex = await sha256(message);
    const hashBigInt = hexToBigInt(hashHex) % q;
    
    // Compute w = s^-1 mod q
    const w = modInverse(s, q);
    
    // Compute u1 = (H(m) * w) mod q
    const u1 = (hashBigInt * w) % q;
    
    // Compute u2 = (r * w) mod q
    const u2 = (r * w) % q;
    
    // Compute v = ((g^u1 * y^u2) mod p) mod q
    const v = (modPow(g, u1, p) * modPow(publicKey, u2, p) % p) % q;
    
    return {
      isValid: v === r,
      steps: { w, u1, u2, v, r },
      message: v === r ? 'Signature is valid' : 'Signature is invalid'
    };
  }

  static recoverPrivateKeyFromReusedK(
    message1: string,
    signature1: DSSSignature,
    message2: string,
    signature2: DSSSignature,
    params: DSSParameters
  ): { privateKey: bigint | null; k: bigint | null } {
    const { q } = params;
    const { r: r1, s: s1 } = signature1;
    const { r: r2, s: s2 } = signature2;
    
    // Check if same r (indicating same k)
    if (r1 !== r2) {
      return { privateKey: null, k: null };
    }
    
    try {
      // Hash messages
      const hash1 = hexToBigInt(message1.split('').map(c => c.charCodeAt(0).toString(16)).join('')) % q;
      const hash2 = hexToBigInt(message2.split('').map(c => c.charCodeAt(0).toString(16)).join('')) % q;
      
      // k = (H(m1) - H(m2)) / (s1 - s2) mod q
      const numerator = (hash1 - hash2 + q) % q;
      const denominator = (s1 - s2 + q) % q;
      const k = (numerator * modInverse(denominator, q)) % q;
      
      // x = (s*k - H(m)) / r mod q
      const privateKey = ((s1 * k - hash1 + q * q) % q * modInverse(r1, q)) % q;
      
      return { privateKey, k };
    } catch {
      return { privateKey: null, k: null };
    }
  }
}