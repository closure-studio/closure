declare global {
  interface Window {
    skadi: (input: string) => string;
    idaks: string[];
  }
}

export {};
