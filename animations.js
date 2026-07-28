(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 768px)");
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  const videoStage = document.querySelector("[data-video-reveal]");
  const launchRing = document.querySelector("[data-launch-ring]");
  const drawSvgs = [...document.querySelectorAll("[data-svg-draw]")];

  const activateDrawSvg = (element) => {
    if (!element) return;
    element.dataset.svgDrawActive = "true";
    element.contentDocument?.documentElement.classList.add("active");
  };

  drawSvgs.forEach((element) => {
    element.addEventListener("load", () => {
      if (element.dataset.svgDrawActive === "true") activateDrawSvg(element);
    });
  });

  const activateLaunchRing = () => {
    if (!launchRing) return;
    launchRing.dataset.ringActive = "true";

    const activateSvg = () => {
      const svg = launchRing.contentDocument?.documentElement;
      svg?.querySelector('[id="Vector 24 fill"]')?.classList.add("svg-elem-1");
      svg?.querySelector('[id="Vector 24 stroke"]')?.classList.add("svg-elem-2");
      svg?.classList.add("active");
    };
    if (launchRing.contentDocument?.documentElement) activateSvg();
  };

  launchRing?.addEventListener("load", () => {
    const svg = launchRing.contentDocument?.documentElement;
    svg?.querySelector('[id="Vector 24 fill"]')?.classList.add("svg-elem-1");
    svg?.querySelector('[id="Vector 24 stroke"]')?.classList.add("svg-elem-2");
    if (launchRing.dataset.ringActive === "true") svg?.classList.add("active");
  });

  if (!desktop.matches || reduceMotion.matches || !window.anime?.animate || !("IntersectionObserver" in window)) {
    activateLaunchRing();
    drawSvgs.forEach(activateDrawSvg);
    root.classList.remove("motion-ready");
    return;
  }

  const { animate } = window.anime;
  const distances = {
    up: ["0px", "-72px"],
    right: ["88px", "0px"],
    down: ["0px", "72px"],
    left: ["-88px", "0px"],
  };

  const reveal = (element) => {
    if (element.dataset.revealPlayed === "true") return;
    element.dataset.revealPlayed = "true";

    animate(element, {
      opacity: { from: 0, to: 1 },
      "--motion-x": { from: getComputedStyle(element).getPropertyValue("--motion-x").trim() || "0px", to: "0px" },
      "--motion-y": { from: getComputedStyle(element).getPropertyValue("--motion-y").trim() || "0px", to: "0px" },
      duration: 900,
      delay: Number(element.dataset.revealDelay || 0),
      ease: "out(4)",
      onBegin: () => {
        if (element.classList.contains("hero__cta")) {
          window.setTimeout(activateLaunchRing, 100);
        }
        if (element.querySelector("[data-svg-draw]")) {
          window.setTimeout(() => {
            element.querySelectorAll("[data-svg-draw]").forEach(activateDrawSvg);
          }, 100);
        }
      },
      onComplete: () => {
        element.classList.add("is-revealed");
      },
    });

  };

  const revealVideo = () => {
    if (!videoStage || videoStage.dataset.revealPlayed === "true") return;
    videoStage.dataset.revealPlayed = "true";

    const topChrome = videoStage.querySelector(".studio__chrome--top");
    const bottomChrome = videoStage.querySelector(".studio__chrome--bottom");
    const topCurtain = videoStage.querySelector(".studio__curtain--top");
    const bottomCurtain = videoStage.querySelector(".studio__curtain--bottom");

    animate(topChrome, {
      "--studio-cover-y": { from: "330px", to: "0px" },
      duration: 1250,
      ease: "inOut(3)",
    });
    animate(bottomChrome, {
      "--studio-cover-y": { from: "-330px", to: "0px" },
      duration: 1250,
      ease: "inOut(3)",
    });
    animate(topCurtain, {
      translateY: ["0%", "-102%"],
      duration: 1150,
      delay: 120,
      ease: "inOut(3)",
    });
    animate(bottomCurtain, {
      translateY: ["0%", "102%"],
      duration: 1150,
      delay: 120,
      ease: "inOut(3)",
      onComplete: () => videoStage.classList.add("is-video-revealed"),
    });
  };

  revealItems.forEach((element) => {
    const [x, y] = distances[element.dataset.reveal] || distances.up;
    element.style.setProperty("--motion-x", x);
    element.style.setProperty("--motion-y", y);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (entry.target === videoStage) {
        revealVideo();
      } else {
        reveal(entry.target);
      }
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px",
  });

  revealItems.forEach((element) => observer.observe(element));
  if (videoStage) observer.observe(videoStage);

  desktop.addEventListener("change", (event) => {
    if (event.matches) return;
    observer.disconnect();
    window.anime.remove(revealItems);
    drawSvgs.forEach(activateDrawSvg);
    revealItems.forEach((element) => {
      element.style.removeProperty("opacity");
      element.style.removeProperty("--motion-x");
      element.style.removeProperty("--motion-y");
    });
    root.classList.remove("motion-ready");
  }, { once: true });
})();
