export {};

declare global {
  interface Window {
    /** Set true by the Preloader when the intro completes (WebGL assemble trigger). */
    __preloaderDone?: boolean;
  }
}
