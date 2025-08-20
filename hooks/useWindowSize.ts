// hooks/useWindowSize.ts
import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 핸들러 함수
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // resize 이벤트 리스너 추가
    window.addEventListener("resize", handleResize);
    // 컴포넌트가 마운트될 때 즉시 사이즈를 설정
    handleResize();

    // 클린업 함수: 컴포넌트가 언마운트될 때 리스너 제거
    return () => window.removeEventListener("resize", handleResize);
  }, []); // 빈 배열은 이 effect가 마운트/언마운트 시에만 실행되도록 함

  return windowSize;
}
