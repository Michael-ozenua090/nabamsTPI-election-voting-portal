// =============================================================
// iOS 12+ / Safari 12+ Polyfills
// Import this as the VERY FIRST LINE of app/layout.tsx
// =============================================================

// 1. Object.hasOwn (Node 16.9+, Chrome 93, Safari 15.4)
if (typeof Object.hasOwn !== 'function') {
  Object.defineProperty(Object, 'hasOwn', {
    value: function hasOwn(obj: object, prop: PropertyKey): boolean {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

// 2. Array.prototype.at (Chrome 92, Safari 15.4)
if (typeof Array.prototype.at !== 'function') {
  Object.defineProperty(Array.prototype, 'at', {
    value: function at(this: unknown[], index: number): unknown {
      const len = this.length;
      const relativeIndex = Math.trunc(index) || 0;
      const k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
      if (k < 0 || k >= len) return undefined;
      return this[k];
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

// 3. crypto.randomUUID (Chrome 92, Safari 15.4)
//    Fallback: RFC 4122 v4 UUID via Math.random (adequate for reference codes only)
if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID !== 'function') {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: function randomUUID(): string {
      const hex = '0123456789abcdef';
      let uuid = '';
      for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
          uuid += '-';
        } else if (i === 14) {
          uuid += '4';
        } else if (i === 19) {
          uuid += hex[(Math.random() * 4) | 8];
        } else {
          uuid += hex[(Math.random() * 16) | 0];
        }
      }
      return uuid;
    },
    configurable: true,
    writable: true,
  });
}

export {};
