import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IframeViewerProps {
  src: string | null;
  onClose: () => void;
}

export const IframeViewer: React.FC<IframeViewerProps> = ({ src, onClose }) => {
  if (!src) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background p-4">
      <div className="flex justify-end mb-2">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground hover:bg-muted">
          <X className="h-6 w-6" />
        </Button>
      </div>
      <iframe
        src={src}
        title="External Content"
        className="flex-grow w-full border-none rounded-lg shadow-lg"
        allowFullScreen
      ></iframe>
    </div>
  );
};