// Metro module used when @insforge/sdk checks for a Node crypto fallback.
// React Native provides crypto.getRandomValues; it does not provide Node's crypto module.
export const webcrypto = globalThis.crypto;

export default {webcrypto};
