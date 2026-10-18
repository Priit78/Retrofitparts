import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroZoom } from "./HeroZoom";
import { ChapterProgressProvider } from "./ScrollChapter";

function zoomAt(progress: number, { animated = true, to }: { animated?: boolean; to?: number } = {}) {
  return (
    <ChapterProgressProvider progress={progress} animated={animated}>
      <HeroZoom to={to}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a stand-in for the hero photo */}
        <img alt="Photo" />
      </HeroZoom>
    </ChapterProgressProvider>
  );
}

const wrapper = () => screen.getByAltText("Photo").parentElement!;

describe("HeroZoom", () => {
  it("shows the photo at its own size at p = 0", () => {
    render(zoomAt(0));
    expect(wrapper().style.transform).toBe("none");
  });

  it("scales the wrapper, not the photo, up to 1.22 by the end of the chapter", () => {
    const { unmount } = render(zoomAt(0.5));
    expect(wrapper().style.transform).toBe("scale(1.11)");
    expect(screen.getByAltText("Photo").getAttribute("style")).toBeNull();
    unmount();
    render(zoomAt(1));
    expect(wrapper().style.transform).toBe("scale(1.22)");
  });

  it("takes another end scale", () => {
    render(zoomAt(0.5, { to: 1.5 }));
    expect(wrapper().style.transform).toBe("scale(1.25)");
  });

  it("zooms towards the headlight", () => {
    render(zoomAt(0.5));
    expect(wrapper()).toHaveClass("origin-[72%_48%]");
  });

  it("leaves the photo alone when the chapter does not animate, and drops its scale when it stops", () => {
    const { rerender } = render(zoomAt(0.5, { animated: false }));
    expect(wrapper().style.transform).toBe("");
    rerender(zoomAt(0.5));
    expect(wrapper().style.transform).toBe("scale(1.11)");
    rerender(zoomAt(0.5, { animated: false }));
    expect(wrapper().style.transform).toBe("");
  });
});
