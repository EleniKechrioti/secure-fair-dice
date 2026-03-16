/**
 * Cryptographic Utilities for the Client (Browser)
 * Utilizes the native Web Crypto API for secure, client-side operations.
 */
const CryptoUtils = {
    
    /**
     * Generates a Cryptographically Secure Pseudo-Random Number (CSPRNG) string (Nonce).
     * Used to add high entropy to the commitment hash, preventing brute-force attacks.
     * * @param {number} length - The number of bytes to generate (default is 16 bytes).
     * @returns {string} A secure random string represented in hexadecimal format.
     */
    generateNonce(length = 16) {
        // Create an array to hold the raw random bytes
        const array = new Uint8Array(length);
        
        // Fill the array with cryptographically strong random values
        crypto.getRandomValues(array);
        
        // Convert the byte array to a 2-character hexadecimal string representation
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Calculates the SHA-256 cryptographic hash of a given plaintext message.
     * Used to create the binding commitment payload: Hash(Roll || rA || rB).
     * * @param {string} message - The plaintext string to be hashed.
     * @returns {Promise<string>} A promise that resolves to the SHA-256 hash in hexadecimal format.
     */
    async sha256(message) {
        // Encode the plaintext string into a Uint8Array (required by the SubtleCrypto API)
        const msgBuffer = new TextEncoder().encode(message);
        
        // Generate the SHA-256 hash (returns an ArrayBuffer)
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        
        // Convert the ArrayBuffer back to a readable byte array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        
        // Map each byte to a 2-character hexadecimal string and join them
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
};