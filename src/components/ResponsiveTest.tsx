import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ResponsiveTest = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getBreakpoint = () => {
    if (screenSize.width < 475) return "xs";
    if (screenSize.width < 640) return "sm";
    if (screenSize.width < 768) return "md";
    if (screenSize.width < 1024) return "lg";
    if (screenSize.width < 1280) return "xl";
    return "2xl";
  };

  const getDeviceType = () => {
    if (screenSize.width < 768) return "Mobile";
    if (screenSize.width < 1024) return "Tablet";
    return "Desktop";
  };

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-background/95 backdrop-blur-sm border shadow-lg z-50 max-w-xs">
      <div className="space-y-2 text-xs">
        <div className="font-semibold text-primary">Screen Info</div>
        <div>
          Size: {screenSize.width} × {screenSize.height}
        </div>
        <div>Device: {getDeviceType()}</div>
        <div>Breakpoint: {getBreakpoint()}</div>
        <div className="pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full text-xs"
          >
            Refresh Test
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ResponsiveTest;
