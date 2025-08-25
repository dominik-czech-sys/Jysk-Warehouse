import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useArticles } from "@/data/articles";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react"; // Changed to named import QRCodeSVG
import { Printer } from "lucide-react";
import { toast } from "sonner";

interface ArticleBarcodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  storeId: string;
}

export const ArticleBarcodeGenerator: React.FC<ArticleBarcodeGeneratorProps> = ({
  isOpen,
  onClose,
  articleId,
  storeId,
}) => {
  const { getArticleById } = useArticles();
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  const article = getArticleById(articleId, storeId);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Barcode</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: sans-serif; margin: 20px; }
          .print-container { text-align: center; padding: 10px; border: 1px solid #ccc; display: inline-block; }
          .article-id { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .article-name { font-size: 18px; margin-bottom: 5px; }
          .store-info { font-size: 14px; color: #555; margin-bottom: 15px; }
          @media print {
            body { margin: 0; }
            .print-container { border: none; page-break-after: always; }
          }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      } else {
        toast.error(t("common.printBlocked"));
      }
    }
  };

  if (!article) {
    return null; // Or show a loading/error state
  }

  const qrCodeValue = JSON.stringify({ articleId: article.id, storeId: article.storeId });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("common.generateBarcode")}</DialogTitle>
          <DialogDescription>{t("common.generateBarcodeDescription")}</DialogDescription>
        </DialogHeader>
        <div className="py-4 flex flex-col items-center space-y-4">
          <div ref={printRef} className="print-container p-4 border rounded-md">
            <div className="article-id">{article.id}</div>
            <div className="article-name">{article.name}</div>
            <div className="store-info">{t("common.storeId")}: {article.storeId}</div>
            <QRCodeSVG value={qrCodeValue} size={256} level="H" includeMargin={true} /> {/* Used QRCodeSVG directly */}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePrint} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
            <Printer className="h-4 w-4 mr-2" /> {t("common.print")}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};