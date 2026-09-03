import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTranslate } from "../../hooks/useTranslate";
import { Check } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import "./ThreeTicketShowcase.css";

// ============================================
// Brand logo (base64-encoded SVG monogram)
// ============================================
// Generates an elegant "GB" monogram badge used as the receipt header.
// Returns a base64-encoded SVG data URL so the same artifact can be drawn
// into the 3D canvas texture and rendered by the HTML <img> fallback.
function buildLogoSvg(color: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<circle cx="32" cy="32" r="29" fill="none" stroke="${color}" stroke-width="2.5"/>` +
    `<circle cx="32" cy="32" r="25" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.4"/>` +
    `<text x="32" y="40" font-family="Georgia, serif" font-weight="700" font-size="22" ` +
    `text-anchor="middle" fill="${color}" letter-spacing="2">GB</text>` +
    `</svg>`
  );
}

function getLogoDataUrl(color: string): string {
  const svg = buildLogoSvg(color);
  // btoa is browser-only; this component only renders client-side.
  const base64 = typeof btoa !== "undefined" ? btoa(svg) : "";
  return `data:image/svg+xml;base64,${base64}`;
}

function loadLogoImage(color: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = getLogoDataUrl(color);
  });
}

// Helper function to draw the receipt ticket texture on a 2D Canvas
function drawTicketCanvas(
  canvas: HTMLCanvasElement,
  translate: any,
  isDark: boolean,
  status: "preparing" | "completed",
  logoImage: HTMLImageElement | null = null,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Design Tokens / Palette matching Orderly systems
  const bgColor = isDark ? "#152028" : "#F6F8F4"; // Sage Linen High
  const borderCol = isDark ? "#2F3D48" : "#B8C0B2"; // Linen Edge Strong
  const textColor = isDark ? "#ECF0F2" : "#0E141A"; // Carbon Ink
  const tealColor = isDark ? "#4A8B98" : "#1F4254"; // Tilled Teal
  const accentColor = isDark ? "#FF8A5A" : "#F26A3A"; // Burnt Tangerine
  const mutedTextColor = isDark ? "#8A95A5" : "#707A8A";
  const successColor = isDark ? "#52B788" : "#2D6A4F";

  // 1. Draw Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // 2. Draw outer border
  ctx.strokeStyle = borderCol;
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // 3. Draw top jagged edge (receipt tear)
  ctx.fillStyle = isDark ? "#0E141A" : "#EFF1ED"; // Page background Sage Linen
  ctx.beginPath();
  ctx.moveTo(10, 10);
  for (let x = 10; x <= w - 10; x += 16) {
    ctx.lineTo(x + 8, 25);
    ctx.lineTo(x + 16, 10);
  }
  ctx.fill();

  // Draw bottom jagged edge
  ctx.beginPath();
  ctx.moveTo(10, h - 10);
  for (let x = 10; x <= w - 10; x += 16) {
    ctx.lineTo(x + 8, h - 25);
    ctx.lineTo(x + 16, h - 10);
  }
  ctx.fill();

  // 3.5. Draw Brand Logo (centered, just below the top jagged tear)
  if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
    const logoSize = 64;
    const logoX = (w - logoSize) / 2;
    const logoY = 32;
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
  }

  // 4. Draw Header
  ctx.fillStyle = mutedTextColor;
  ctx.textAlign = "center";
  ctx.font = "bold 18px Urbanist, sans-serif";
  ctx.fillText(translate("home.threeTicketShowcase.ticket.header"), w / 2, 118);

  // Restaurant Brand Title
  ctx.fillStyle = textColor;
  ctx.font = "bold 30px MuseoModerno, sans-serif";
  ctx.fillText(translate("home.threeTicketShowcase.ticket.bistro"), w / 2, 158);

  // Server metadata row
  ctx.fillStyle = mutedTextColor;
  ctx.font = "500 14px Urbanist, monospace";
  ctx.fillText(translate("home.threeTicketShowcase.ticket.metadata"), w / 2, 191);

  // 5. Draw Separator Line
  ctx.strokeStyle = borderCol;
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, 211);
  ctx.lineTo(w - 30, 211);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // 6. Draw Title (Order Number) & Table Info
  ctx.fillStyle = status === "completed" ? successColor : tealColor;
  ctx.font = "bold 32px MuseoModerno, sans-serif";
  ctx.fillText(translate("home.threeTicketShowcase.ticket.order"), w / 2, 248);

  ctx.fillStyle = textColor;
  ctx.font = "600 20px Urbanist, sans-serif";
  ctx.fillText(translate("home.threeTicketShowcase.ticket.table"), w / 2, 285);

  // 7. Draw Separator Line
  ctx.strokeStyle = borderCol;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(30, 303);
  ctx.lineTo(w - 30, 303);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // 8. Draw Items list
  ctx.textAlign = "left";
  ctx.font = "bold 18px Urbanist, sans-serif";

  const items = [
    translate("home.threeTicketShowcase.ticket.item1"),
    translate("home.threeTicketShowcase.ticket.item2"),
    translate("home.threeTicketShowcase.ticket.item3"),
  ];

  const mods = [
    translate("home.threeTicketShowcase.ticket.item1Mod"),
    translate("home.threeTicketShowcase.ticket.item2Mod"),
    translate("home.threeTicketShowcase.ticket.item3Mod"),
  ];

  let currentY = 343;
  items.forEach((item, index) => {
    // Checkbox square
    ctx.strokeStyle = status === "completed" ? successColor : borderCol;
    ctx.lineWidth = 2;
    ctx.strokeRect(35, currentY - 15, 16, 16);

    if (status === "completed") {
      // Draw Checkmark
      ctx.strokeStyle = successColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(38, currentY - 7);
      ctx.lineTo(43, currentY - 2);
      ctx.lineTo(49, currentY - 11);
      ctx.stroke();

      // Draw text line-through
      ctx.fillStyle = mutedTextColor;
      ctx.font = "bold 18px Urbanist, sans-serif";
      ctx.fillText(item, 65, currentY);

      ctx.strokeStyle = mutedTextColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(65, currentY - 5);
      ctx.lineTo(65 + ctx.measureText(item).width, currentY - 5);
      ctx.stroke();
    } else {
      // Unchecked box (except first one as active in KDS)
      if (index === 0) {
        ctx.fillStyle = tealColor;
        ctx.fillRect(38, currentY - 12, 10, 10);
      }
      ctx.fillStyle = textColor;
      ctx.fillText(item, 65, currentY);
    }

    // Draw modifier
    ctx.fillStyle = mutedTextColor;
    ctx.font = "500 14px Urbanist, sans-serif";
    ctx.fillText(mods[index], 65, currentY + 22);

    ctx.font = "bold 18px Urbanist, sans-serif"; // Reset
    currentY += 62;
  });

  // 9. Draw another separator line
  ctx.strokeStyle = borderCol;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(30, currentY + 10);
  ctx.lineTo(w - 35, currentY + 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // 10. Summary block
  ctx.textAlign = "right";
  ctx.font = "500 16px Urbanist, sans-serif";
  ctx.fillStyle = mutedTextColor;
  ctx.fillText(translate("home.threeTicketShowcase.ticket.subtotal"), w - 40, currentY + 40);
  ctx.fillText(translate("home.threeTicketShowcase.ticket.tax"), w - 40, currentY + 65);

  ctx.textAlign = "left";
  ctx.fillStyle = textColor;

  // 11. Draw Status Badge / Pill
  const badgeX = w / 2;
  const badgeY = currentY + 115;
  const badgeW = 200;
  const badgeH = 38;

  const badgeBg =
    status === "completed"
      ? isDark
        ? "rgba(82, 183, 136, 0.12)"
        : "rgba(45, 106, 79, 0.12)"
      : isDark
        ? "rgba(152, 201, 176, 0.12)"
        : "rgba(122, 184, 158, 0.12)";
  const badgeStroke =
    status === "completed"
      ? isDark
        ? "rgba(82, 183, 136, 0.3)"
        : "rgba(45, 106, 79, 0.3)"
      : isDark
        ? "rgba(152, 201, 176, 0.3)"
        : "rgba(122, 184, 158, 0.3)";
  const badgeText =
    status === "completed" ? (isDark ? "#52B788" : "#2D6A4F") : isDark ? "#98C9B0" : "#7AB89E";

  ctx.fillStyle = badgeBg;
  ctx.beginPath();
  ctx.roundRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 19);
  ctx.fill();

  ctx.strokeStyle = badgeStroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Status Dot
  ctx.fillStyle = badgeText;
  ctx.beginPath();
  ctx.arc(badgeX - 70, badgeY, 5, 0, Math.PI * 2);
  ctx.fill();

  // Status Label Text
  ctx.font = "bold 15px Urbanist, sans-serif";
  ctx.fillStyle = badgeText;
  ctx.textAlign = "center";
  const statusLabel =
    status === "completed"
      ? translate("home.threeTicketShowcase.ticket.statusCompleted")
      : translate("home.threeTicketShowcase.ticket.status");
  ctx.fillText(statusLabel, badgeX + 8, badgeY + 5);

  // 12. Draw Total Price or Completed Stamp
  if (status === "completed") {
    ctx.save();
    ctx.translate(w / 2, currentY + 185);
    ctx.rotate((-8 * Math.PI) / 180);
    ctx.strokeStyle = "rgba(45, 106, 79, 0.65)";
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-80, -20, 160, 40);
    ctx.fillStyle = "rgba(45, 106, 79, 0.65)";
    ctx.font = "bold 20px MuseoModerno, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(translate("home.threeTicketShowcase.ticket.qcStamp"), 0, 6);
    ctx.restore();
  } else {
    ctx.fillStyle = accentColor;
    ctx.font = "bold 28px MuseoModerno, sans-serif";
    ctx.fillText(translate("home.threeTicketShowcase.ticket.total"), w / 2, currentY + 190);
  }

  // 13. Simulated Barcode
  const barcodeY = currentY + 230;
  const barcodeHeight = 28;
  const startX = 60;
  const endX = w - 60;
  ctx.fillStyle = textColor;
  for (let x = startX; x < endX; x += 2) {
    const barWidth = (Math.sin(x) > 0.0 ? 3 : 1) + (Math.cos(x * 1.5) > 0.5 ? 2 : 0);
    ctx.fillRect(x, barcodeY, barWidth, barcodeHeight);
    x += barWidth;
  }

  // 14. Footer Note
  ctx.fillStyle = mutedTextColor;
  ctx.font = "bold 14px Urbanist, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(translate("home.threeTicketShowcase.ticket.thanks"), w / 2, h - 35);
}

interface TicketMeshProps {
  scrollProgress: number;
}

function TicketMesh({ scrollProgress }: TicketMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const translate = useTranslate("common");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tealColor = isDark ? "#4A8B98" : "#1F4254";

  // Load brand logo (base64 SVG) for theme-aware coloring on the canvas texture
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadLogoImage(tealColor)
      .then((img) => {
        if (!cancelled) setLogoImage(img);
      })
      .catch(() => {
        // Logo failure is non-fatal: receipt still renders without the monogram.
      });
    return () => {
      cancelled = true;
    };
  }, [tealColor]);

  // Create front (preparing) canvas texture
  const texturePrep = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 960; // Increased height for realistic metadata
    drawTicketCanvas(canvas, translate, isDark, "preparing", logoImage);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [translate, isDark, logoImage]);

  // Create back (completed) canvas texture
  const textureCompleted = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 960; // Increased height for realistic metadata
    drawTicketCanvas(canvas, translate, isDark, "completed", logoImage);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [translate, isDark, logoImage]);

  // Update canvas textures on switches
  useEffect(() => {
    if (texturePrep.image) {
      drawTicketCanvas(
        texturePrep.image as HTMLCanvasElement,
        translate,
        isDark,
        "preparing",
        logoImage,
      );
      texturePrep.needsUpdate = true;
    }
    if (textureCompleted.image) {
      drawTicketCanvas(
        textureCompleted.image as HTMLCanvasElement,
        translate,
        isDark,
        "completed",
        logoImage,
      );
      textureCompleted.needsUpdate = true;
    }
  }, [translate, isDark, texturePrep, textureCompleted, logoImage]);

  // Shared geometry so both faces wave and bend identically (resized to be slightly smaller)
  const geometry = useMemo(() => new THREE.PlaneGeometry(1.4, 2.4, 32, 32), []);

  // Keep track of smooth interpolated progress
  const smoothProgress = useRef(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.08);
    const p = smoothProgress.current;

    if (groupRef.current) {
      // 1. Position Translation:
      // Y: translates from top (0.7) to bottom (-0.7)
      // X: drifts diagonally from right (1.5) to left (-1.5)
      // Z: floats forward slightly
      const x = 1.5 - p * 3.0 + Math.sin(time * 0.4) * 0.03;
      const y = 0.7 - p * 1.4;
      const z = -0.1 + p * 0.2;
      groupRef.current.position.set(x, y, z);

      // 2. Dynamic Rotation:
      // X: flips 180 degrees vertically
      // Y: side sway for depth profile during scrolling
      // Z: organic twist orientation
      groupRef.current.rotation.x = p * Math.PI + Math.sin(time * 0.6) * 0.02;
      groupRef.current.rotation.y = Math.sin(p * Math.PI) * 0.25;
      groupRef.current.rotation.z = -0.05 + p * 0.1 + Math.cos(time * 0.4) * 0.01;

      // 3. Shared Geometry Wave & Bend Deformation:
      const position = geometry.attributes.position;
      const width = 1.4;
      const height = 2.4;

      for (let i = 0; i < position.count; i++) {
        const vx = position.getX(i);
        const vy = position.getY(i);

        const u = (vx + width / 2) / width;
        const v = (vy + height / 2) / height;

        const flutter = Math.sin(u * 5.0 - time * 2.5) * 0.02 * (1.0 - v);
        const curl = Math.sin(v * Math.PI) * 0.08 * p;

        position.setZ(i, flutter + curl);
      }

      position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  });

  return (
    <group ref={groupRef}>
      {/* Front Face */}
      <mesh geometry={geometry} position={[0, 0, 0.002]}>
        <meshPhysicalMaterial
          map={texturePrep}
          roughness={0.7}
          metalness={0.05}
          clearcoat={0.1}
          clearcoatRoughness={0.3}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Back Face (flipped vertically) */}
      <mesh geometry={geometry} position={[0, 0, -0.002]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial
          map={textureCompleted}
          roughness={0.7}
          metalness={0.05}
          clearcoat={0.1}
          clearcoatRoughness={0.3}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}

interface TimelineStepProps {
  title: string;
  description: string;
  time?: string;
  status: "completed" | "active" | "pending";
  isLast?: boolean;
  align?: "left" | "right";
}

function TimelineStep({
  title,
  description,
  time,
  status,
  isLast,
  align = "left",
}: TimelineStepProps) {
  const isRight = align === "right";

  return (
    <div
      className={`relative flex flex-col pb-5 last:pb-0 ${
        isRight ? "items-start pr-0 pl-7 md:items-end md:pr-7 md:pl-0" : "items-start pr-0 pl-7"
      }`}
    >
      {/* Connector line */}
      {!isLast && (
        <div
          className={`absolute top-5.5 bottom-0 w-[2px] ${
            status === "completed" ? "bg-success/50" : "bg-border-subtle"
          } ${isRight ? "right-auto left-2 md:right-2 md:left-auto" : "right-auto left-2"}`}
        />
      )}

      {/* Circle indicator */}
      <div
        className={`absolute top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border shadow-sm transition-all duration-300 ${
          status === "completed"
            ? "border-success bg-success/15 text-success"
            : status === "active"
              ? "border-accent bg-accent/15 text-accent animate-pulse"
              : "border-border-strong bg-surface-elevated text-ink-subtle"
        } ${isRight ? "right-auto left-0 md:right-0 md:left-auto" : "right-auto left-0"}`}
      >
        {status === "completed" ? (
          <Check className="h-2.5 w-2.5" />
        ) : status === "active" ? (
          <div className="bg-accent h-1.5 w-1.5 rounded-full" />
        ) : (
          <div className="bg-border-strong h-1 w-1 rounded-full" />
        )}
      </div>

      {/* Text Content */}
      <div
        className={`flex flex-col ${isRight ? "items-start text-left md:items-end md:text-right" : "items-start text-left"}`}
      >
        <div className="flex items-baseline gap-2">
          {isRight ? (
            <>
              {time && (
                <span className="text-ink-subtle order-2 font-mono text-[10px] font-medium md:order-1">
                  {time}
                </span>
              )}
              <span
                className={`order-1 text-sm font-bold md:order-2 ${
                  status === "pending" ? "text-ink-muted font-semibold" : "text-primary"
                }`}
              >
                {title}
              </span>
            </>
          ) : (
            <>
              <span
                className={`text-sm font-bold ${
                  status === "pending" ? "text-ink-muted font-semibold" : "text-primary"
                }`}
              >
                {title}
              </span>
              {time && (
                <span className="text-ink-subtle font-mono text-[10px] font-medium">{time}</span>
              )}
            </>
          )}
        </div>
        <span className="text-ink-muted mt-0.5 text-xs font-medium">{description}</span>
      </div>
    </div>
  );
}

export function ThreeTicketShowcase() {
  const translate = useTranslate("common");
  const { ref, progress } = useScrollProgress();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tealColor = isDark ? "#4A8B98" : "#1F4254";
  const logoSrc = useMemo(() => getLogoDataUrl(tealColor), [tealColor]);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const supportsWebGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setHasWebGL(supportsWebGL);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  return (
    <section ref={ref} className="three-ticket-showcase-container">
      {/* Sticky viewport covering the active scroll state */}
      <div className="three-ticket-sticky">
        {/* Full-screen overlay canvas */}
        {hasWebGL && (
          <div className="three-canvas-container">
            <Canvas
              key={resolvedTheme}
              camera={{ fov: 40, position: [0, 0, 5.8] }}
              style={{
                width: "100%",
                height: "100%",
                background: "transparent",
              }}
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[5, 6, 4]} intensity={1.4} />
              <pointLight position={[-4, 3, 2]} intensity={1.2} color="#F26A3A" />
              <TicketMesh scrollProgress={progress} />
            </Canvas>
          </div>
        )}

        {/* Content overlays matching the two virtual sections */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {/* Section 1: Active KDS Preparation */}
          <div
            className="absolute inset-0 flex items-center transition-all duration-100 ease-out"
            style={{
              opacity: Math.max(0, 1 - progress * 2.5),
              transform: `translateY(-${progress * 40}px)`,
              pointerEvents: progress < 0.4 ? "auto" : "none",
            }}
          >
            <div className="three-ticket-layout">
              {/* Column 1: Text */}
              <div className="three-text-content bg-surface/90 border-border-subtle/50 pointer-events-auto max-w-lg rounded-2xl border p-6 backdrop-blur-md md:max-w-none md:border-none md:bg-transparent md:p-0 md:backdrop-blur-none">
                <span className="text-accent font-mono text-xs font-bold tracking-widest uppercase">
                  {translate("home.threeTicketShowcase.badge")}
                </span>
                <h2 className="font-display text-primary mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  {translate("home.threeTicketShowcase.heading")}
                </h2>
                <p className="text-ink-muted mt-4 font-sans text-base leading-relaxed">
                  {translate("home.threeTicketShowcase.description")}
                </p>

                {/* Timeline Section */}
                <div className="mt-8 flex w-full max-w-sm flex-col">
                  <h3 className="text-primary mb-4 text-xs font-bold tracking-wider uppercase">
                    {translate("home.threeTicketShowcase.timelineTitle")}
                  </h3>
                  <div className="flex flex-col">
                    <TimelineStep
                      title={translate("home.threeTicketShowcase.timeline.step1Title")}
                      description={translate("home.threeTicketShowcase.timeline.step1Desc")}
                      time={translate("home.threeTicketShowcase.timeline.step1Time")}
                      status="completed"
                    />
                    <TimelineStep
                      title={translate("home.threeTicketShowcase.timeline.step2Title")}
                      description={translate("home.threeTicketShowcase.timeline.step2Desc")}
                      time={translate("home.threeTicketShowcase.timeline.step2Time")}
                      status="completed"
                    />
                    <TimelineStep
                      title={translate("home.threeTicketShowcase.timeline.step3Title")}
                      description={translate("home.threeTicketShowcase.timeline.step3Desc")}
                      time={translate("home.threeTicketShowcase.timeline.step3Time")}
                      status="active"
                    />
                    <TimelineStep
                      title={translate("home.threeTicketShowcase.timeline.step4Title")}
                      description={translate("home.threeTicketShowcase.timeline.step4Desc")}
                      status="pending"
                      isLast
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 font-mono text-xs">
                  <span className="bg-service-aqua/10 text-service-aqua border-service-aqua/20 rounded-full border px-2.5 py-1">
                    {translate("home.threeTicketShowcase.ticket.status")}
                  </span>
                  <span className="text-ink-subtle">•</span>
                  <span className="text-ink-muted">
                    {translate("home.threeTicketShowcase.ticket.table")}
                  </span>
                </div>
              </div>

              {/* Column 2: Placeholder for WebGL Ticket / Fallback Card */}
              <div className="flex items-center justify-center py-8">
                {!hasWebGL && (
                  <FallbackTicketCard status="preparing" translate={translate} logoSrc={logoSrc} />
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Served & Completed */}
          <div
            className="absolute inset-0 flex items-center transition-all duration-100 ease-out"
            style={{
              opacity: Math.max(0, (progress - 0.6) * 2.5),
              transform: `translateY(${(1 - progress) * 40}px)`,
              pointerEvents: progress > 0.6 ? "auto" : "none",
            }}
          >
            <div className="three-ticket-layout">
              {/* Column 1: Placeholder for WebGL Ticket / Fallback Card */}
              <div className="flex items-center justify-center py-8">
                {!hasWebGL && (
                  <FallbackTicketCard status="completed" translate={translate} logoSrc={logoSrc} />
                )}
              </div>

              {/* Column 2: Text */}
              <div className="three-text-content bg-surface/90 border-border-subtle/50 pointer-events-auto flex max-w-lg flex-col rounded-2xl border p-6 text-left backdrop-blur-md md:max-w-none md:items-end md:border-none md:bg-transparent md:p-0 md:text-right md:backdrop-blur-none">
                <span className="text-success font-mono text-xs font-bold tracking-widest uppercase">
                  {translate("home.scrollShowcase.served.label")}
                </span>
                <h2 className="font-display text-primary mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  {translate("home.scrollShowcase.served.title")}
                </h2>
                <p className="text-ink-muted mt-4 font-sans text-base leading-relaxed">
                  {translate("home.scrollShowcase.served.description")}
                </p>

                {/* Timeline Section (no header) */}
                <div className="mt-8 flex w-full max-w-sm flex-col">
                  <div className="flex flex-col">
                    <TimelineStep
                      title={translate("home.threeTicketShowcase.timeline.step1Title")}
                      description={translate("home.threeTicketShowcase.timeline.step1Desc")}
                      time={translate("home.threeTicketShowcase.timeline.step1Time")}
                      status="completed"
                      align="right"
                    />
                    <TimelineStep
                      title={translate("home.threeTicketShowcase.timeline.step2Title")}
                      description={translate("home.threeTicketShowcase.timeline.step2Desc")}
                      time={translate("home.threeTicketShowcase.timeline.step2Time")}
                      status="completed"
                      align="right"
                    />
                    <TimelineStep
                      title={translate("home.threeTicketShowcase.timeline.step3Title")}
                      description={translate("home.threeTicketShowcase.timeline.step3Desc")}
                      time={translate("home.threeTicketShowcase.timeline.step3Time")}
                      status="completed"
                      align="right"
                    />
                    <TimelineStep
                      title={translate("home.threeTicketShowcase.timeline.step4Title")}
                      description={translate("home.threeTicketShowcase.timeline.step4Desc")}
                      time={translate("home.threeTicketShowcase.timeline.step4Time")}
                      status="completed"
                      isLast
                      align="right"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 font-mono text-xs">
                  <span className="bg-success/10 text-success border-success/20 rounded-full border px-2.5 py-1 font-bold">
                    {translate("home.threeTicketShowcase.ticket.statusCompleted")}
                  </span>
                  <span className="text-ink-subtle">•</span>
                  <span className="text-ink-muted">
                    {translate("home.threeTicketShowcase.ticket.archivedTag")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Fallback HTML static ticket card rendering for environments without WebGL
function FallbackTicketCard({
  status,
  translate,
  logoSrc,
}: {
  status: "preparing" | "completed";
  translate: any;
  logoSrc: string;
}) {
  const successColor = "text-success border-success bg-success/10";
  const aquaColor = "text-service-aqua border-service-aqua/20 bg-service-aqua/10";

  return (
    <div className="bg-surface-elevated border-border-strong text-ink shadow-elevation-card relative flex h-[400px] w-[260px] flex-col overflow-hidden rounded-xl border p-5 transition-all duration-300 select-none">
      <div
        className="bg-surface absolute top-0 right-0 left-0 h-2.5"
        style={{
          clipPath:
            "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
        }}
      />

      {status === "completed" && (
        <div className="border-success/70 text-success/70 bg-surface-overlay absolute top-[45%] left-[50%] z-20 -translate-x-[50%] -translate-y-[50%] -rotate-12 rounded border-2 border-dashed px-3 py-1 font-mono text-sm font-black shadow-sm select-none">
          {translate("home.threeTicketShowcase.ticket.qcStamp")}
        </div>
      )}

      <div
        className={`flex h-full flex-col justify-between pt-1.5 ${status === "completed" ? "opacity-50" : ""}`}
      >
        <div>
          {/* Brand Logo */}
          <div className="mb-2 flex justify-center">
            <img src={logoSrc} alt="" aria-hidden="true" className="h-12 w-12" draggable={false} />
          </div>

          <div className="border-border-strong mb-2 flex items-start justify-between border-b border-dashed pb-2">
            <div className="text-left">
              <span className="text-ink font-mono text-sm font-bold">
                {translate("home.threeTicketShowcase.ticket.order")}
              </span>
              <p className="text-ink-subtle mt-0.5 font-mono text-[10px]">
                {translate("home.threeTicketShowcase.ticket.header")}
              </p>
            </div>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                status === "completed" ? successColor : aquaColor
              }`}
            >
              {status === "completed"
                ? translate("home.threeTicketShowcase.ticket.statusCompleted")
                : translate("home.threeTicketShowcase.ticket.status")}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-ink-subtle text-left font-mono text-[11px]">
              {translate("home.threeTicketShowcase.ticket.table")}
            </div>
            <ul className="text-ink-muted space-y-1.5 text-left">
              {status === "completed" ? (
                <>
                  <li className="flex items-center gap-2 line-through">
                    <span className="border-success bg-success/10 text-success flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="truncate text-[11px]">
                      {translate("home.threeTicketShowcase.ticket.item1")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 line-through">
                    <span className="border-success bg-success/10 text-success flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="truncate text-[11px]">
                      {translate("home.threeTicketShowcase.ticket.item2")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 line-through">
                    <span className="border-success bg-success/10 text-success flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="truncate text-[11px]">
                      {translate("home.threeTicketShowcase.ticket.item3")}
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <span className="border-border-strong flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border" />
                    <span className="truncate text-[11px]">
                      {translate("home.threeTicketShowcase.ticket.item1")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="border-border-strong flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border" />
                    <span className="truncate text-[11px]">
                      {translate("home.threeTicketShowcase.ticket.item2")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="border-border-strong flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border" />
                    <span className="truncate text-[11px]">
                      {translate("home.threeTicketShowcase.ticket.item3")}
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-border-strong text-ink-subtle mt-2 flex items-center justify-between border-t border-dashed pt-2 font-mono text-[11px]">
          <span>
            {status === "completed"
              ? translate("home.threeTicketShowcase.ticket.kdsArchived")
              : translate("home.threeTicketShowcase.ticket.kdsActive")}
          </span>
          <span
            className={`${
              status === "completed"
                ? "text-success font-bold"
                : "text-accent animate-pulse font-semibold"
            }`}
          >
            {status === "completed"
              ? translate("home.threeTicketShowcase.ticket.statusCompleted")
              : translate("home.threeTicketShowcase.ticket.total")}
          </span>
        </div>
      </div>
    </div>
  );
}
