import { afterEach, describe, expect, it, vi } from "vitest";
import { jumpTo, registerScroller } from "./scroller";

afterEach(() => vi.unstubAllGlobals());

describe("jumpTo", () => {
  it("scrolls the window natively, at once, when no scroller is registered", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    jumpTo(1200);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: "instant" });
  });

  it("goes through the registered scroller, immediately and even while it is stopped", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    const lenis = { scrollTo: vi.fn() };
    const unregister = registerScroller(lenis);
    jumpTo(800);
    expect(lenis.scrollTo).toHaveBeenCalledWith(800, { immediate: true, force: true });
    expect(scrollTo).not.toHaveBeenCalled();
    unregister();
  });

  it("falls back to the window once the scroller is unregistered", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    const lenis = { scrollTo: vi.fn() };
    registerScroller(lenis)();
    jumpTo(300);
    expect(lenis.scrollTo).not.toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalledWith({ top: 300, behavior: "instant" });
  });

  it("keeps a newer scroller when an older one unregisters", () => {
    const older = { scrollTo: vi.fn() };
    const newer = { scrollTo: vi.fn() };
    const unregisterOlder = registerScroller(older);
    const unregisterNewer = registerScroller(newer);
    unregisterOlder();
    jumpTo(50);
    expect(newer.scrollTo).toHaveBeenCalledWith(50, { immediate: true, force: true });
    expect(older.scrollTo).not.toHaveBeenCalled();
    unregisterNewer();
  });
});
