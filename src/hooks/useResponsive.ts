import { useEffect, useState } from "react";

type Breakpoint = {
  value: number;
  type: "MAX" | "MIN";
  setState: React.Dispatch<React.SetStateAction<boolean>>;
};

const mobileWidth = 480;

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMax1240, setIsMax1240] = useState(false);
  const [isMax1280, setIsMax1280] = useState(false);

  const breakpoints: Breakpoint[] = [];

  const addBreakpoint = (newBreakpoint: Breakpoint | Breakpoint[]) => {
    if (Array.isArray(newBreakpoint)) {
      newBreakpoint.forEach((breakpoint) => {
        breakpoints.push(breakpoint);
      });
    } else {
      breakpoints.push(newBreakpoint);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      window.innerWidth >= mobileWidth ? setIsMobile(false) : setIsMobile(true);
      window.innerWidth < 1240 ? setIsMax1240(true) : setIsMax1240(false);
      window.innerWidth < 1280 ? setIsMax1280(true) : setIsMax1280(false);

      breakpoints.forEach((breakpoint) => {
        breakpoint.setState(
          (breakpoint.type === "MAX" && window.innerWidth < breakpoint.value) ||
            (breakpoint.type === "MIN" && window.innerWidth >= breakpoint.value)
        );
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array ensures the effect runs once on mount

  useEffect(() => {
    if (window.innerWidth <= mobileWidth) {
      setIsMobile(true);
    }

    if (window.innerWidth < 1240) {
      setIsMax1240(true);
    }

    if (window.innerWidth < 1280) {
      setIsMax1280(true);
    }

    breakpoints.forEach((breakpoint) => {
      if (
        (breakpoint.type === "MAX" && window.innerWidth < breakpoint.value) ||
        (breakpoint.type === "MIN" && window.innerWidth >= breakpoint.value)
      ) {
        breakpoint.setState(true);
      }
    });
  }, []); // Empty dependency array ensures the effect runs once on mount

  return {
    isMobile,
    isMax1240,
    isMax1280,
    addBreakpoint,
  };
};
