import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Scan } from "lucide-react";
import { toast } from "sonner";
import { useLog } from "@/contexts/LogContext"; // Import useLog
import { useAuth } from "@/hooks/useAuth"; // Import useAuth to get current user
import { useTranslation } from "react-i18next"; // Import useTranslation

const CteckaCarkoduPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addLogEntry } = useLog(); // Použití useLog
  const { user, userStoreId } = useAuth(); // Get current user and storeId
  const { t } = useTranslation(); // Initialize useTranslation

  useEffect(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const onScanSuccess = (decodedText: string) => {
      html5QrcodeScanner.clear();
      setScanResult(decodedText);
      toast.success(t("common.scannedBarcode", { decodedText }));
      addLogEntry(t("common.barcodeScanned"), { scannedCode: decodedText, storeId: userStoreId }, user?.username); // Pass username and storeId
      navigate(`/?articleId=${decodedText}`);
    };

    const onScanError = (errorMessage: string) => {
      // console.warn(`Chyba skenování: ${errorMessage}`);
    };

    html5QrcodeScanner.render(onScanSuccess, onScanError);

    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner", error);
      });
    };
  }, [navigate, addLogEntry, user?.username, userStoreId, t]); // Add t to dependencies

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 space-y-4 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToMainPage")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("common.scanBarcodeTitle")}</h1>
        </div>

        <Card className="w-full text-center p-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light flex items-center justify-center">
              <Scan className="h-6 w-6 mr-2" /> {t("common.scanBarcodeTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div id="reader" className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-muted-foreground">
              {/* QR Code Scanner will render here */}
            </div>
            {scanResult && (
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {t("common.scannedBarcode", { decodedText: scanResult })}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {t("common.ensureBarcodeVisible")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CteckaCarkoduPage;