import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom no implementa window.scrollTo ni window.print
window.scrollTo = vi.fn();
window.print = vi.fn();

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.useRealTimers();
});
