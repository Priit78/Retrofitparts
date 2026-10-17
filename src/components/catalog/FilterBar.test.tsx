import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchField } from "./FilterBar";

/**
 * Stands in for the catalog: `query` is what the URL holds, updated a little after each search
 * (as the router does), and "Clear" bumps the reset signal like the catalog's Clear buttons.
 */
function Harness({ onSearch, urlDelay = 0 }: { onSearch: (q: string) => void; urlDelay?: number }) {
  const [query, setQuery] = useState("");
  const [reset, setReset] = useState(0);
  return (
    <>
      <SearchField
        locale="et"
        query={query}
        resetSignal={reset}
        onSearch={(q) => {
          onSearch(q);
          setTimeout(() => setQuery(q), urlDelay);
        }}
      />
      <button type="button" onClick={() => setReset((n) => n + 1)}>
        clear
      </button>
      <button type="button" onClick={() => setQuery("hella")}>
        link
      </button>
    </>
  );
}

function type(value: string) {
  fireEvent.change(screen.getByRole("searchbox"), { target: { value } });
}

beforeEach(() => {
  vi.useFakeTimers();
  // Enter checks for a touch screen (to close the on-screen keyboard); jsdom has no matchMedia.
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("SearchField", () => {
  it("applies what is typed after a 200 ms pause", () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    type("e46");
    act(() => vi.advanceTimersByTime(150));
    expect(onSearch).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(60));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("e46");
  });

  it("applies at once on Enter", () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    type("koito");
    fireEvent.submit(screen.getByRole("search"));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("koito");
  });

  it("Clear cancels a query that is still waiting out the pause", () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    type("e46");
    act(() => vi.advanceTimersByTime(100));
    fireEvent.click(screen.getByText("clear"));
    act(() => vi.advanceTimersByTime(1000));
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("keeps characters typed while its own query is still reaching the URL", () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} urlDelay={50} />);
    type("e4");
    act(() => vi.advanceTimersByTime(200)); // "e4" is applied; the URL follows 50 ms later
    type("e46");
    act(() => vi.advanceTimersByTime(50)); // the URL now says "e4"
    expect(screen.getByRole("searchbox")).toHaveValue("e46");
    act(() => vi.advanceTimersByTime(250));
    expect(onSearch.mock.calls.map(([q]) => q)).toEqual(["e4", "e46"]);
  });

  it("adopts a query that changes from elsewhere", () => {
    render(<Harness onSearch={vi.fn()} />);
    fireEvent.click(screen.getByText("link"));
    expect(screen.getByRole("searchbox")).toHaveValue("hella");
  });
});
