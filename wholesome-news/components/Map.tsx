"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";

// ── Types ────────────────────────────────────────────────────────────────────

interface Story {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  category: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  published_at: string;
}

interface CountryGroup {
  country_code: string;
  country: string;
  lat: number;
  lng: number;
  stories: Story[];
}

// ── Map style ────────────────────────────────────────────────────────────────

const MAP_STYLE = process.env.NEXT_PUBLIC_MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
  : "https://tiles.openfreemap.org/styles/liberty";

// ── Data fetching ────────────────────────────────────────────────────────────

async function fetchCountryGroups(): Promise<CountryGroup[]> {
  const res = await fetch("/api/stories");
  if (!res.ok) throw new Error("fetch-failed");
  const data: Story[] = await res.json();

  const groups: Record<string, CountryGroup> = {};

  for (const story of data) {
    if (!story.country_code || story.lat == null || story.lng == null) continue;
    if (!groups[story.country_code]) {
      groups[story.country_code] = {
        country_code: story.country_code,
        country: story.country,
        lat: story.lat,
        lng: story.lng,
        stories: [],
      };
    }
    groups[story.country_code].stories.push(story);
  }

  return Object.values(groups);
}

// ── URL sanitisation ─────────────────────────────────────────────────────────

function safeUrl(url: string): string {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : "#";
  } catch {
    return "#";
  }
}

// ── Pin element factory ──────────────────────────────────────────────────────

function createPinElement(
  group: CountryGroup,
  onClick: () => void
): HTMLElement {
  const count = group.stories.length;
  const label = String(count);

  // 44×50px touch-target button — SVG aligns to bottom so the pin tip = anchor point
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "map-pin";
  btn.setAttribute(
    "aria-label",
    `${resolveCountryName(group.country_code, group.country)}: ${count} positive ${count === 1 ? "story" : "stories"}`
  );
  Object.assign(btn.style, {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    width: "44px",
    height: "50px",
    background: "transparent",
    border: "none",
    padding: "0",
    cursor: "pointer",
    userSelect: "none",
    touchAction: "manipulation",
  });

  // SVG teardrop pin — 28×40, tip at bottom-center
  const NS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 28 40");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "40");
  svg.setAttribute("aria-hidden", "true");
  Object.assign(svg.style, {
    display: "block",
    overflow: "visible",
    transformOrigin: "50% 100%",
    transition:
      "transform 200ms cubic-bezier(0,0,0.2,1), filter 200ms cubic-bezier(0,0,0.2,1)",
    filter: "drop-shadow(0 2px 7px var(--color-pin-shadow))",
  });

  // Teardrop body
  const path = document.createElementNS(NS, "path");
  path.setAttribute(
    "d",
    "M14 3C20 3 25 8 25 14C24 32 14 40 14 40C14 40 4 32 3 14C3 8 8 3 14 3Z"
  );
  path.style.fill = "var(--color-pin-fill)";

  // Badge circle — top-right corner of teardrop, white pill
  const badge = document.createElementNS(NS, "circle");
  badge.setAttribute("cx", "23");
  badge.setAttribute("cy", "5");
  badge.setAttribute("r", "5.5");
  badge.setAttribute("fill", "white");

  // Badge count
  const badgeText = document.createElementNS(NS, "text");
  badgeText.setAttribute("x", "23");
  badgeText.setAttribute("y", "5");
  badgeText.setAttribute("text-anchor", "middle");
  badgeText.setAttribute("dominant-baseline", "central");
  badgeText.setAttribute("font-size", label.length > 1 ? "5" : "6");
  badgeText.setAttribute("font-weight", "700");
  badgeText.style.fill = "var(--color-pin-badge-text)";
  badgeText.setAttribute("font-family", "system-ui, sans-serif");
  badgeText.textContent = label;

  const highlight = document.createElementNS(NS, "circle");
  highlight.setAttribute("cx", "14");
  highlight.setAttribute("cy", "14");
  highlight.setAttribute("r", "4");
  highlight.setAttribute("fill", "rgba(255,255,255,0.22)");

  svg.appendChild(path);
  svg.appendChild(highlight);
  svg.appendChild(badge);
  svg.appendChild(badgeText);
  btn.appendChild(svg);

  // Hover: scale up from tip, stronger glow
  btn.addEventListener("mouseenter", () => {
    svg.style.transform = "scale(1.2) translateY(-4px)";
    svg.style.filter = "drop-shadow(0 4px 12px var(--color-pin-shadow-hover))";
  });
  btn.addEventListener("mouseleave", () => {
    svg.style.transform = "";
    svg.style.filter = "drop-shadow(0 2px 7px var(--color-pin-shadow))";
  });
  // Press feedback (SKILL §2)
  btn.addEventListener("mousedown", () => {
    svg.style.transform = "scale(0.92)";
    svg.style.transition = "transform 100ms ease-in";
  });
  btn.addEventListener("mouseup", () => {
    svg.style.transition =
      "transform 200ms cubic-bezier(0,0,0.2,1), filter 200ms cubic-bezier(0,0,0.2,1)";
    svg.style.transform = "scale(1.2) translateY(-4px)";
  });

  btn.addEventListener("click", onClick);
  return btn;
}

// ── Category colours (editorial palette for light panel) ─────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  environment: '#166534',
  community:   '#1e3a5f',
  animals:     '#065f46',
  science:     '#4c1d95',
  achievement: '#1d4ed8',
  culture:     '#92400e',
}

// ── Country name resolver ─────────────────────────────────────────────────────

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
function resolveCountryName(code: string, fallback: string): string {
  return regionNames.of(code) ?? fallback
}

// ── Map component ────────────────────────────────────────────────────────────

export default function Map() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  // Prevent double-init (React Strict Mode or hot-reload)
  const initedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [selected, setSelected] = useState<CountryGroup | null>(null);

  const closePanel = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!containerRef.current || initedRef.current) return;
    initedRef.current = true;

    const container = containerRef.current;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container,
        style: MAP_STYLE,
        center: [0, 20],
        zoom: 1.5,
        minZoom: 1,
        maxZoom: 8,
        maxPitch: 0,
        pitchWithRotate: false,
        dragRotate: false,
        attributionControl: false,
      });
      map.touchZoomRotate.disableRotation();
    } catch (err) {
      const msg = (err as Error).message;
      console.error("[map] init threw:", msg);
      setMapError("Init error: " + msg);
      return;
    }

    mapRef.current = map;
    map.setPadding({ top: 64, bottom: 0, left: 0, right: 0 });

    map.on("error", (e) => {
      const msg = (e.error as Error)?.message ?? String(e);
      console.error("[map] error:", msg);
      setMapError(msg);
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("load", async () => {
      let groups: CountryGroup[];
      try {
        groups = await fetchCountryGroups();
      } catch {
        setMapError("fetch-failed");
        return;
      }

      if (groups.length === 0) {
        setIsEmpty(true);
        setMapReady(true);
        return;
      }

      for (const group of groups) {
        const el = createPinElement(group, () => setSelected(group));
        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([group.lng, group.lat])
          .addTo(map);

        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -46],
          anchor: "bottom",
          className: "pin-tooltip",
        }).setText(resolveCountryName(group.country_code, group.country));

        el.addEventListener("mouseenter", () =>
          popup.setLngLat([group.lng, group.lat]).addTo(map)
        );
        el.addEventListener("mouseleave", () => popup.remove());

        let tooltipTimeout: ReturnType<typeof setTimeout>;
        el.addEventListener("touchstart", () => {
          clearTimeout(tooltipTimeout);
          popup.setLngLat([group.lng, group.lat]).addTo(map);
          tooltipTimeout = setTimeout(() => popup.remove(), 1200);
        }, { passive: true });

        markersRef.current.push(marker);
      }
      setMapReady(true);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <>
      {/* Map canvas — position:fixed fills viewport, bypasses all parent layout */}
      <div
        id="main-content"
        ref={containerRef}
        style={{ position: "fixed", inset: 0, zIndex: 0 }}
        role="region"
        aria-label="World map showing positive news stories by country. Click a pin to read stories."
      />

      {/* Loading overlay */}
      {!mapReady && !mapError && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 10,
            background: "var(--color-bg)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "12px",
          }}
          aria-live="polite"
        >
          <div className="map-spinner" aria-hidden="true" />
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Loading stories…
          </p>
        </div>
      )}

      {/* Error state */}
      {mapError && (
        <div
          aria-live="polite"
          style={{
            position: "fixed", inset: 0, zIndex: 10,
            background: "var(--color-bg)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "12px", padding: "24px", textAlign: "center",
          }}
        >
          <p style={{ color: "#f87171", fontSize: "14px", fontWeight: 600 }}>
            Something went wrong
          </p>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "12px", maxWidth: 400 }}>
            The map could not load. Please refresh the page.
          </p>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 24px",
            pointerEvents: "none",
          }}
        >
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", textAlign: "center" }}>
            No stories available right now. Check back soon.
          </p>
        </div>
      )}

      {/* Wordmark */}
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 20,
          display: "flex", alignItems: "center", padding: "16px 20px 0",
          paddingTop: "max(16px, env(safe-area-inset-top))",
          pointerEvents: "none",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 95"
          height="36"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--color-brand-gold)", flexShrink: 0, userSelect: "none" }}
          aria-label="Solas logo"
        >
          {/* Outer faceted heart boundary */}
          <polygon
            strokeWidth="3"
            points="50,21 62,10 72,5 84,8 93,20 95,36 90,52 80,67 66,80 50,92 34,80 20,67 10,52 5,36 7,20 16,8 28,5 38,10"
          />
          <g strokeWidth="2">
            {/* Center ridge */}
            <line x1="50" y1="21" x2="50" y2="92" />
            {/* Left lobe facets radiating from ~(25,25) */}
            <line x1="25" y1="25" x2="38" y2="10" />
            <line x1="25" y1="25" x2="28" y2="5" />
            <line x1="25" y1="25" x2="16" y2="8" />
            <line x1="25" y1="25" x2="7" y2="20" />
            <line x1="25" y1="25" x2="5" y2="36" />
            <line x1="25" y1="25" x2="50" y2="21" />
            {/* Right lobe facets radiating from ~(75,25) */}
            <line x1="75" y1="25" x2="62" y2="10" />
            <line x1="75" y1="25" x2="72" y2="5" />
            <line x1="75" y1="25" x2="84" y2="8" />
            <line x1="75" y1="25" x2="93" y2="20" />
            <line x1="75" y1="25" x2="95" y2="36" />
            <line x1="75" y1="25" x2="50" y2="21" />
            {/* Lower body facets */}
            <line x1="5" y1="36" x2="50" y2="52" />
            <line x1="95" y1="36" x2="50" y2="52" />
            <line x1="10" y1="52" x2="50" y2="52" />
            <line x1="50" y1="52" x2="90" y2="52" />
            <line x1="10" y1="52" x2="50" y2="92" />
            <line x1="90" y1="52" x2="50" y2="92" />
            <line x1="20" y1="67" x2="50" y2="52" />
            <line x1="80" y1="67" x2="50" y2="52" />
            {/* World map — continent outlines */}
            {/* North America */}
            <path d="M16,31 L22,24 L33,21 L39,27 L36,34 L29,39 L20,37 Z" />
            {/* South America */}
            <path d="M18,47 L27,43 L36,47 L38,57 L34,67 L26,72 L18,65 L14,54 Z" />
            {/* Europe */}
            <path d="M44,27 L50,21 L57,25 L55,32 L49,33 Z" />
            {/* Africa */}
            <path d="M45,37 L54,35 L60,41 L59,57 L53,66 L46,63 L42,52 Z" />
            {/* Asia */}
            <path d="M57,22 L67,18 L78,20 L86,28 L85,42 L76,47 L64,47 L56,41 L55,31 Z" />
            {/* Australia */}
            <path d="M70,59 L78,57 L80,63 L74,67 L68,64 Z" />
          </g>
        </svg>
        <span
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "13px",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--color-brand-gold)",
            marginLeft: "10px",
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          good news, worldwide
        </span>
      </header>

      {/* Story panel */}
      {selected && (
        <div
          onClick={closePanel}
          style={{ position: "fixed", inset: 0, zIndex: 25 }}
          aria-hidden="true"
        />
      )}
      {selected && <StoryPanel group={selected} onClose={closePanel} />}
    </>
  );
}

// ── Story panel ───────────────────────────────────────────────────────────────

function StoryPanel({
  group,
  onClose,
}: {
  group: CountryGroup;
  onClose: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? group.stories : group.stories.slice(0, 8);
  const hasMore = group.stories.length > 8;

  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const dragY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    dragY.current = 0;
    if (panelRef.current) panelRef.current.style.transition = "none";
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta < 0) return;
    dragY.current = delta;
    if (panelRef.current) panelRef.current.style.transform = `translateY(${delta}px)`;
  };

  const handleTouchEnd = () => {
    if (dragY.current > 80) {
      onClose();
    } else if (panelRef.current) {
      panelRef.current.style.transition = "transform 200ms ease-out";
      panelRef.current.style.transform = "";
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus trap: move focus inside on open, cycle Tab within panel, restore on close
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const FOCUSABLE =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));

    const prevFocus = document.activeElement as HTMLElement | null;
    getFocusable()[0]?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (els.length === 0) { e.preventDefault(); return; }
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    panel.addEventListener("keydown", trap);
    return () => {
      panel.removeEventListener("keydown", trap);
      prevFocus?.focus();
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className="story-panel"
      role="dialog"
      aria-modal="true"
      aria-label={`Stories from ${resolveCountryName(group.country_code, group.country)}`}
    >
      <div
        className="story-panel__handle"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      <div className="story-panel__header">
        <div>
          <p className="story-panel__eyebrow">
            {group.stories.length}{" "}
            {group.stories.length === 1 ? "story" : "stories"}
          </p>
          <h2 className="story-panel__title">{resolveCountryName(group.country_code, group.country)}</h2>
        </div>
        <button
          className="story-panel__close"
          onClick={onClose}
          aria-label="Close panel"
          type="button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M15 5L5 15M5 5l10 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <ul className="story-panel__list" role="list">
        {visible.map((story) => (
          <li key={story.id}>
            <a
              href={safeUrl(story.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="story-card"
            >
              <div className="story-card__title-row">
                <h3 className="story-card__title">{story.title}</h3>
                <svg className="story-card__arrow" aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              {story.summary && (
                <p className="story-card__summary">{story.summary}</p>
              )}
              <p className="story-card__source">{story.source}</p>
              <span
                className="story-card__category"
                style={{ color: CATEGORY_COLORS[story.category] ?? '#92400e' }}
              >
                {story.category}
              </span>
            </a>
          </li>
        ))}
        {hasMore && !showAll && (
          <li>
            <button
              type="button"
              onClick={() => setShowAll(true)}
              style={{
                display: "block",
                width: "100%",
                padding: "16px 0",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: CATEGORY_COLORS.community,
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif",
                textAlign: "left",
              }}
            >
              Show all {group.stories.length} stories
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
