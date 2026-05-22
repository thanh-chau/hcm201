import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import HTMLFlipBook from "react-pageflip";

const PAGE_RATIO = 1.414; // Portrait book ratio (A4)

import { CHAPTER3_TOPICS, CHAPTER3_TIMELINE } from "./App";

const getPages = () => {
  const newPages = [];
  
  newPages.push(
    <div className="page-content bg-[#0F766E] text-white flex flex-col justify-center items-center h-full p-8 text-center" style={{ width: '100%', height: '100%' }}>
      <h1 className="text-3xl font-serif font-bold mb-4">Tư Tưởng Hồ Chí Minh</h1>
      <h2 className="text-xl">Về Đại Đoàn Kết Toàn Dân Tộc</h2>
    </div>
  );

  newPages.push(
    <div className="page-content bg-[#F6F1EA] flex flex-col justify-center items-center h-full p-8 text-center" style={{ width: '100%', height: '100%' }}>
      <div className="border-4 border-[#0F766E]/20 p-6 rounded-lg w-full h-full flex flex-col justify-center items-center">
        <h2 className="text-2xl font-black text-[#0F766E] mb-4">Không có gì quý hơn độc lập, tự do</h2>
        <p className="text-lg leading-relaxed text-gray-800">
          Độc lập dân tộc là mục tiêu trước hết, nhưng phải là độc lập thật sự và gắn với tự do, hạnh phúc của nhân dân.
        </p>
      </div>
    </div>
  );

  CHAPTER3_TOPICS.forEach((topic) => {
    newPages.push(
      <div className="page-content bg-white h-full p-8 overflow-y-auto custom-scrollbar" style={{ width: '100%', height: '100%' }}>
        <p className="text-sm font-bold tracking-[0.2em] text-[#0F766E] mb-2 uppercase">Luận điểm {topic.letter}</p>
        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">{topic.title}</h3>
        <blockquote className="border-l-4 border-[#0F766E] pl-4 italic text-lg mb-6 text-gray-700 font-serif">
          “{topic.quote}”
        </blockquote>
        <p className="font-medium text-gray-800 mb-6 leading-relaxed">{topic.meaning}</p>
        <div className="space-y-3">
          {topic.points.map((pt, i) => (
            <p key={i} className="text-sm leading-relaxed text-gray-600 relative pl-4">
              <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-[#0F766E] rounded-full"></span>
              {pt}
            </p>
          ))}
        </div>
      </div>
    );
  });

  newPages.push(
    <div className="page-content bg-[#F9FAFB] h-full p-8 overflow-y-auto custom-scrollbar" style={{ width: '100%', height: '100%' }}>
       <h3 className="text-2xl font-serif font-bold text-[#0F766E] mb-6">Dòng thời gian</h3>
       <div className="space-y-6">
         {CHAPTER3_TIMELINE.map((item, i) => (
           <div key={i} className="border-l-2 border-[#0F766E] pl-4">
             <div className="font-bold text-lg text-[#0F766E]">{item.year}</div>
             <div className="font-serif font-bold text-gray-900 mb-1">{item.title}</div>
             <p className="text-sm text-gray-600">{item.text}</p>
           </div>
         ))}
       </div>
    </div>
  );

  newPages.push(
    <div className="page-content bg-[#0F766E] text-white flex flex-col justify-center items-center h-full p-8 text-center" style={{ width: '100%', height: '100%' }}>
      <h2 className="text-xl italic font-serif leading-relaxed px-4">
        "Đoàn kết, đoàn kết, đại đoàn kết.<br />
        Thành công, thành công, đại thành công"
      </h2>
    </div>
  );

  return newPages;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const FlipBook = React.forwardRef((props = {}, ref) => {
  const {
    audioRef: externalAudioRef,
    audioFiles: externalAudioFiles,
    setIsPlaying,
    setIsAudioAutoPlay,
  } = props;

  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const internalAudioRef = useRef(null);

  const autoPlayTimeoutRef = useRef(null);
  const isStoppingRef = useRef(false);
  const playbackSessionRef = useRef(0);
  const pendingAutoFlipRef = useRef(false);
  const restartFromPageRef = useRef(null);

  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookSize, setBookSize] = useState({ width: 500, height: 281 });

  const pages = useMemo(() => getPages(), []);
  const storyTexts = useMemo(() => [], []);
  const audioFiles = useMemo(() => {
    if (Array.isArray(externalAudioFiles) && externalAudioFiles.length > 0) {
      return externalAudioFiles;
    }
    return [];
  }, [externalAudioFiles]);

  const activeAudioRef =
    externalAudioRef?.current ? externalAudioRef : internalAudioRef;

  const clearAutoPlayTimer = () => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
  };

  const isSessionActive = (sessionId) =>
    playbackSessionRef.current === sessionId && !isStoppingRef.current;

  const stopAudio = () => {
    const audio = activeAudioRef?.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");
    audio.load();
    setIsPlaying?.(false);
  };

  const cancelCurrentPlayback = () => {
    playbackSessionRef.current += 1;
    clearAutoPlayTimer();
    stopAudio();
  };

  const createPlaybackSession = () => {
    playbackSessionRef.current += 1;
    return playbackSessionRef.current;
  };

  const waitForAudioMetadata = (audio, sessionId) =>
    new Promise((resolve) => {
      if (!audio) {
        resolve(false);
        return;
      }

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        resolve(true);
        return;
      }

      let settled = false;

      const cleanup = () => {
        audio.removeEventListener("loadedmetadata", handleLoaded);
        audio.removeEventListener("canplaythrough", handleLoaded);
        audio.removeEventListener("error", handleError);
        clearInterval(intervalId);
      };

      const finish = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };

      const handleLoaded = () => finish(true);
      const handleError = () => finish(false);

      const intervalId = setInterval(() => {
        if (!isSessionActive(sessionId)) finish(false);
      }, 100);

      audio.addEventListener("loadedmetadata", handleLoaded, { once: true });
      audio.addEventListener("canplaythrough", handleLoaded, { once: true });
      audio.addEventListener("error", handleError, { once: true });
    });

  const waitForAudioEnded = (audio, sessionId) =>
    new Promise((resolve) => {
      if (!audio) {
        resolve("cancelled");
        return;
      }

      let settled = false;

      const cleanup = () => {
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
        clearInterval(intervalId);
      };

      const finish = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };

      const handleEnded = () => finish("ended");
      const handleError = () => finish("error");

      const intervalId = setInterval(() => {
        if (!isSessionActive(sessionId)) finish("cancelled");
      }, 100);

      audio.addEventListener("ended", handleEnded, { once: true });
      audio.addEventListener("error", handleError, { once: true });
    });

  const getVisibleSpreadPages = (pageIndex) => {
    const lastPage = pages.length - 1;

    if (pageIndex <= 0) return [0];
    if (pageIndex >= lastPage) return [lastPage];

    const rightPage = Math.min(pageIndex + 1, lastPage);
    return [pageIndex, rightPage];
  };

  const getPageIndicatorText = (pageIndex) => {
    const visiblePages = getVisibleSpreadPages(pageIndex).map((p) => p + 1);
    return visiblePages.length === 1
      ? `Trang ${visiblePages[0]} / ${pages.length}`
      : `Trang ${visiblePages.join(", ")} / ${pages.length}`;
  };

  const getStoryTextForCurrentView = () => {
    const visiblePages = getVisibleSpreadPages(currentPage);
    return visiblePages
      .map((pageIndex) => storyTexts[pageIndex])
      .filter(Boolean)
      .join(" ");
  };

  const playSingleAudio = async (pageIndex, sessionId) => {
    const audio = activeAudioRef?.current;
    const audioFile = audioFiles?.[pageIndex] || `/audio/page${pageIndex}.mp3`;

    if (!audio || !audioFile || !isSessionActive(sessionId)) return false;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = audioFile;
      audio.load();

      const hasMetadata = await waitForAudioMetadata(audio, sessionId);
      if (!hasMetadata || !isSessionActive(sessionId)) return false;

      await audio.play();
      if (!isSessionActive(sessionId)) return false;

      setIsPlaying?.(true);

      const result = await waitForAudioEnded(audio, sessionId);
      return result === "ended";
    } catch (error) {
      console.warn("Audio play failed:", error);
      setIsPlaying?.(false);
      return false;
    }
  };

  const playAudioForSpread = async (pageIndex, sessionId) => {
    const spreadPages = getVisibleSpreadPages(pageIndex);

    for (const p of spreadPages) {
      if (!isSessionActive(sessionId)) return false;

      const played = await playSingleAudio(p, sessionId);
      if (!played) return false;
    }

    if (isSessionActive(sessionId)) {
      setIsPlaying?.(false);
    }

    return true;
  };

  const playSpreadOnce = async (pageIndex) => {
    cancelCurrentPlayback();
    isStoppingRef.current = false;

    const sessionId = createPlaybackSession();
    await playAudioForSpread(pageIndex, sessionId);

    if (isSessionActive(sessionId)) {
      setIsPlaying?.(false);
    }
  };

  const getNextPageForAutoPlay = (pageIndex) => {
    const lastPage = pages.length - 1;
    if (pageIndex <= 0) return 1;
    if (pageIndex >= lastPage) return lastPage;
    return Math.min(pageIndex + 2, lastPage);
  };

  const handleFlip = (e) => {
    const nextPage = e.data;
    const audio = activeAudioRef?.current;
    const wasPlaying = Boolean(audio && !audio.paused);
    const wasInternalAutoFlip = pendingAutoFlipRef.current;

    pendingAutoFlipRef.current = false;
    setCurrentPage(nextPage);

    if (wasInternalAutoFlip) return;
    if (!wasPlaying) return;

    restartFromPageRef.current = nextPage;
    cancelCurrentPlayback();

    if (!isAutoPlay) {
      void playSpreadOnce(nextPage);
    }
  };

  const startAutoPlay = async () => {
    if (isAutoPlay) return;

    setIsAudioAutoPlay?.(true);
    setIsAutoPlay(true);
    isStoppingRef.current = false;
    restartFromPageRef.current = null;

    let pageIndex = currentPage;

    while (!isStoppingRef.current) {
      const sessionId = createPlaybackSession();
      await playAudioForSpread(pageIndex, sessionId);

      if (isStoppingRef.current) break;

      if (restartFromPageRef.current !== null) {
        pageIndex = restartFromPageRef.current;
        restartFromPageRef.current = null;
        continue;
      }

      if (pageIndex >= pages.length - 1) break;

      const nextPage = getNextPageForAutoPlay(pageIndex);

      await wait(200);
      if (isStoppingRef.current) break;

      pendingAutoFlipRef.current = true;
      flipBookRef.current?.pageFlip()?.flip(nextPage);
      pageIndex = nextPage;

      await wait(1050);
      if (isStoppingRef.current) break;
    }

    setIsAudioAutoPlay?.(false);
    setIsAutoPlay(false);
    isStoppingRef.current = false;
    restartFromPageRef.current = null;
    clearAutoPlayTimer();
    setIsPlaying?.(false);
  };

  const stopAutoPlay = () => {
    isStoppingRef.current = true;
    restartFromPageRef.current = null;
    setIsAudioAutoPlay?.(false);
    setIsAutoPlay(false);
    cancelCurrentPlayback();
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (error) {
      console.warn("Fullscreen failed:", error);
    }
  };

  const goPrev = () => {
    cancelCurrentPlayback();
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  const goNext = () => {
    cancelCurrentPlayback();
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const goStart = () => {
    cancelCurrentPlayback();
    flipBookRef.current?.pageFlip()?.flip(0);
  };

  useEffect(() => {
    const updateSize = () => {
      const parentWidth = containerRef.current?.clientWidth || window.innerWidth;
      const stageWidth = Math.min(parentWidth - 100, 1000);

      let pageWidth = stageWidth / 2;
      let pageHeight = pageWidth * PAGE_RATIO;

      const maxHeight = window.innerHeight * 0.75; // Giảm xuống 75% để vừa vặn hơn trên laptop
      if (pageHeight > maxHeight) {
        pageHeight = maxHeight;
        pageWidth = pageHeight / PAGE_RATIO;
      }

      setBookSize({
        width: Math.floor(pageWidth),
        height: Math.floor(pageHeight),
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      cancelCurrentPlayback();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    pageFlip: () => ({
      flipNext: () => flipBookRef.current?.pageFlip()?.flipNext(),
      flipPrev: () => flipBookRef.current?.pageFlip()?.flipPrev(),
      flip: (page) => flipBookRef.current?.pageFlip()?.flip(page),
    }),
    startAutoPlay,
    stopAutoPlay,
    toggleFullscreen,
    getCurrentPage: () => currentPage,
    getTotalPages: () => pages.length,
    getCurrentStoryText: () => getStoryTextForCurrentView(),
  }));

  return (
    <div
      ref={containerRef}
      className={`flipbook-container ${isFullscreen ? "fullscreen" : ""}`}
    >
      <style>{`
        .flipbook-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          background: #121212;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          color: white;
        }

        .flipbook-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .flipbook-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(to right, #fff, #aaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .flipbook-stage {
          display: flex;
          justify-content: center;
          align-items: center;
          perspective: 3000px;
          padding: 20px 0;
          min-height: 400px;
        }

        .dialectic-book {
          position: relative;
          box-shadow: 0 30px 100px rgba(0,0,0,0.8);
        }

        .dialectic-book::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 0;
          width: 10px;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.4) 0%,
            rgba(255,255,255,0.1) 50%,
            rgba(0,0,0,0.4) 100%
          );
          transform: translateX(-50%);
          z-index: 100;
          pointer-events: none;
        }

        .page {
          background: #fff;
          overflow: hidden;
        }

        .page-inner {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .page-inner::before {
          content: "";
          position: absolute;
          top: 0;
          width: 60px;
          height: 100%;
          z-index: 10;
          pointer-events: none;
        }

        .page-left .page-inner::before {
          right: 0;
          background: linear-gradient(to left, rgba(0,0,0,0.4) 0%, transparent 100%);
        }

        .page-right .page-inner::before {
          left: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 100%);
        }

        .page-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .flipbook-footer {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .ui-btn {
          padding: 10px 20px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
          backdrop-filter: blur(5px);
        }

        .ui-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
        }

        .ui-btn.active {
          background: #2563eb;
          border-color: #3b82f6;
        }

        .page-indicator {
          background: rgba(37, 99, 235, 0.2);
          color: #60a5fa;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.9rem;
          margin-left: 20px;
          display: inline-block;
        }

        .story-card {
          margin-top: 24px;
          padding: 18px 20px;
          border-radius: 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
          line-height: 1.7;
        }

        .story-card-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #60a5fa;
          margin-bottom: 8px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .flipbook-container {
            padding: 24px 12px;
            border-radius: 18px;
          }

          .flipbook-title {
            font-size: 1.8rem;
          }

          .flipbook-stage {
            min-height: 260px;
            padding: 12px 0;
          }

          .page-indicator {
            margin-left: 0;
            margin-top: 10px;
          }

          .flipbook-footer {
            gap: 10px;
          }

          .ui-btn {
            width: calc(50% - 8px);
            min-width: 140px;
          }
        }
      `}</style>

      {!externalAudioRef && <audio ref={internalAudioRef} preload="auto" />}

      <div className="flipbook-header">
        <h1 className="flipbook-title">Sức Mạnh Từ Sự Đồng Lòng</h1>
        <p style={{ opacity: 0.7 }}>
          Sử dụng nút cuộn hoặc click để lật trang
        </p>
        <span className="page-indicator">{getPageIndicatorText(currentPage)}</span>
      </div>

      <div className="flipbook-stage">
        <HTMLFlipBook
          width={bookSize.width}
          height={bookSize.height}
          size="fixed"
          minWidth={200}
          maxWidth={800}
          minHeight={150}
          maxHeight={600}
          usePortrait={false}
          startPage={0}
          drawShadow={true}
          flippingTime={1000}
          onFlip={handleFlip}
          className="dialectic-book"
          ref={flipBookRef}
          showCover={true}
          maxShadowOpacity={0.5}
        >
          {pages.map((pageContent, index) => (
            <div
              key={index}
              className={`page ${index % 2 === 0 ? "page-right" : "page-left"}`}
            >
              <div className="page-inner">
                {pageContent}
              </div>
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      <div className="flipbook-footer">
        <button className="ui-btn" onClick={goPrev}>
          ← Trang trước
        </button>
        <button className="ui-btn" onClick={goNext}>
          Trang sau →
        </button>
        <button className="ui-btn" onClick={goStart}>
          Về trang đầu
        </button>
        <button className="ui-btn" onClick={toggleFullscreen}>
          {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
        </button>
      </div>
    </div>
  );
});

export default FlipBook;
