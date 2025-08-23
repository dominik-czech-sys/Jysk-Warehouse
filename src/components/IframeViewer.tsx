import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface IframeViewerProps {
  src: string | null;
  onClose: () => void;
}

export const IframeViewer: React.FC<IframeViewerProps> = ({ src, onClose }) => {
  const { t } = useTranslation(); // Initialize useTranslation

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
        // Přidání atributu sandbox pro lepší kontrolu nad obsahem iframe
        // Umožňuje navigaci, skripty, formuláře atd. uvnitř iframe
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-pointer-lock allow-orientation-lock allow-presentation allow-top-navigation-by-user-activation"
      ></iframe>
    </div>
  );
};