// Web Crypto API utilities
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBigInt(hex: string): bigint {
  return BigInt('0x' + hex);
}

export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  let result = 1n;
  base = base % modulus;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    exponent = exponent >> 1n;
    base = (base * base) % modulus;
  }
  return result;
}

export function modInverse(a: bigint, m: bigint): bigint {
  if (m === 1n) return 0n;
  
  const m0 = m;
  let x0 = 0n, x1 = 1n;
  
  while (a > 1n) {
    const q = a / m;
    let t = m;
    m = a % m;
    a = t;
    t = x0;
    x0 = x1 - q * x0;
    x1 = t;
  }
  
  if (x1 < 0n) x1 += m0;
  return x1;
}

export function isPrime(n: bigint, k: number = 5): boolean {
  if (n === 2n || n === 3n) return true;
  if (n < 2n || n % 2n === 0n) return false;
  
  // Write n-1 as 2^r * d
  let r = 0;
  let d = n - 1n;
  while (d % 2n === 0n) {
    d /= 2n;
    r++;
  }
  
  // Miller-Rabin test
  for (let i = 0; i < k; i++) {
    const a = 2n + BigInt(Math.floor(Math.random() * Number(n - 4n)));
    let x = modPow(a, d, n);
    
    if (x === 1n || x === n - 1n) continue;
    
    let composite = true;
    for (let j = 0; j < r - 1; j++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    
    if (composite) return false;
  }
  
  return true;
}

export function generatePrime(bitLength: number): bigint {
  // Use smaller bit lengths for demo to prevent UI freezing
  const actualBitLength = Math.min(bitLength, 32); // Cap at 32 bits for performance
  const min = 2n ** BigInt(actualBitLength - 1);
  const max = 2n ** BigInt(actualBitLength) - 1n;
  
  let candidate;
  let attempts = 0;
  const maxAttempts = 1000; // Prevent infinite loops
  
  do {
    if (attempts++ > maxAttempts) {
      // Fallback to a known small prime if generation takes too long
      return bitLength <= 16 ? 65537n : 1048583n;
    }
    candidate = min + BigInt(Math.floor(Math.random() * Number(max - min)));
    if (candidate % 2n === 0n) candidate += 1n;
  } while (!isPrime(candidate));
  
  return candidate;
}