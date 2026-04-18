import React from "react";

export default function ProcessingBackground() {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div className="absolute top-[-12%] left-[-12%] w-[52%] h-[52%] bg-blue-400 rounded-full blur-[140px] opacity-25"></div>
      <div className="absolute bottom-[-12%] right-[-12%] w-[52%] h-[52%] bg-indigo-500 rounded-full blur-[140px] opacity-25"></div>
    </div>
  );
}
