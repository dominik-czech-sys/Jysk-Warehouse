import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Scan, PlusCircle, Save, XCircle, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { useArticles, Article } from "@/data/articles";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext";
import { Html5Qrcode } from "html5-qrcode";
import { Html5QrcodeScanner } from "html5-qrcode/esm/html5-qrcode-scanner";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShelfRacks } from "@/data/shelfRacks";
import { useTranslation } from "react-i18next";

interface ShelfDetails {
  rack_id: string;
  shelf_number: string;
  store_id: string;
}

const MassAddArticlesPage: React.FC = () => {
  const { userStoreId, user } = useAuth();
  const { articles, addArticle, updateArticle } = useArticles();
  const { addLogEntry } = useLog();
  const { shelfRacks } = useShelfRacks();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getArticleById = (articleNumber: string, storeId: string) => {
    return articles.find(a => a.article_number === articleNumber && a.store_id === storeId);
  };

  const [shelfDetails, setShelfDetails] = useState<ShelfDetails>({
    rack_id: "",
    shelf_number: "",
    store_id: userStoreId || "",
  });
  const [isShelfDetailsLocked, setIsShelfDetailsLocked] = useState(false);
  const [articlesToProcess, setArticlesToProcess] = useState<Partial<Article>[]>([]);
  const [manualArticleId, setManualArticleId] = useState("");
  const [manualArticleQuantity, setManualArticleQuantity] = useState<number>(1);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);

  const [selectedRackId, setSelectedRackId] = useState<string>("");
  const [selectedShelfNumber, setSelectedShelfNumber] = useState<string>("");

  useEffect(() => {
    const scannerId = "reader-mass-add";
    
    const startScanner = async () => {
      if (!isScannerActive || scannerRef.current) return;

      try {
        const devices = await Html5Qrcode.getVideoDevices();
        if (devices && devices.length) {
          scannerRef.current = new Html5QrcodeScanner(scannerId, { fps: 10, qrbox: { width: 250, height: 250 } }, false);
          const onScanSuccess = (decodedText: string) => {
            toast.success(t("common.scannedBarcode", { decodedText }));
            addLogEntry(t("common.barcodeScannedMassAdd"), { scannedCode: decodedText, shelfDetails, quantity: manualArticleQuantity }, user?.email);
            addArticleToProcess(decodedText, manualArticleQuantity);
          };
          scannerRef.current.render(onScanSuccess, () => {});
        } else {
          toast.error(t("common.noCameraFound"));
          setIsScannerActive(false);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast.error(t("common.cameraAccessError"));
        setIsScannerActive(false);
      }
    };

    const stopScanner = () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };

    if (isScannerActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => stopScanner();
  }, [isScannerActive, shelfDetails, user?.email, manualArticleQuantity, t]);

  useEffect(() => {
    const currentRack = shelfRacks.find(rack => rack.id === selectedRackId && rack.store_id === userStoreId);
    if (currentRack) {
      setShelfDetails({
        rack_id: currentRack.id,
        shelf_number: selectedShelfNumber,
        store_id: currentRack.store_id,
      });
    } else {
      setShelfDetails({
        rack_id: "",
        shelf_number: "",
        store_id: userStoreId || "",
      });
    }
  }, [selectedRackId, selectedShelfNumber, shelfRacks, userStoreId]);

  const handleRackSelect = (value: string) => {
    setSelectedRackId(value);
    setSelectedShelfNumber("");
  };

  const handleShelfNumberSelect = (value: string) => {
    setSelectedShelfNumber(value);
  };

  const handleLockShelfDetails = () => {
    if (!selectedRackId || !selectedShelfNumber) {
      toast.error(t("common.firstLockShelfDetails"));
      return;
    }
    setIsShelfDetailsLocked(true);
    toast.info(t("common.detailsLocked"));
  };

  const addArticleToProcess = (articleId: string, quantity: number) => {
    if (!isShelfDetailsLocked) {
      toast.error(t("common.firstLockShelfDetails"));
      return;
    }
    if (!articleId.trim()) {
      toast.error(t("common.articleIdCannotBeEmpty"));
      return;
    }
    if (quantity <= 0) {
      toast.error(t("common.quantityMustBePositive"));
      return;
    }

    const articleNumber = articleId.trim().toUpperCase();
    const existingArticle = getArticleById(articleNumber, userStoreId || '');
    const newArticleData: Partial<Article> = {
      article_number: articleNumber,
      name: existingArticle?.name || `${t("common.unknownArticle")} ${articleNumber}`,
      status: existingArticle?.status || "21",
      quantity: quantity,
      ...shelfDetails,
    };

    if (articlesToProcess.some(a => a.article_number === newArticleData.article_number && a.store_id === newArticleData.store_id)) {
      toast.warning(t("common.articleAlreadyInList", { articleId: newArticleData.article_number }));
      return;
    }

    setArticlesToProcess((prev) => [...prev, newArticleData]);
    setManualArticleId("");
    setManualArticleQuantity(1);
    toast.success(t("common.articleAddedToList", { articleId: newArticleData.article_number }));
  };

  const handleManualAddArticle = () => {
    addArticleToProcess(manualArticleId, manualArticleQuantity);
  };

  const handleRemoveArticleFromList = (idToRemove: string) => {
    setArticlesToProcess((prev) => prev.filter(article => article.article_number !== idToRemove));
    toast.info(t("common.articleRemovedFromList", { articleId: idToRemove }));
  };

  const handleSaveAllArticles = () => {
    if (articlesToProcess.length === 0) {
      toast.error(t("common.noArticlesToSave"));
      return;
    }

    articlesToProcess.forEach(article => {
      const existing = getArticleById(article.article_number!, article.store_id!);
      if (existing) {
        updateArticle({ ...existing, ...article });
        addLogEntry(t("common.articleUpdatedMassAdd"), { articleId: article.article_number, newRackId: article.rack_id, newShelfNumber: article.shelf_number, storeId: article.store_id, quantity: article.quantity }, user?.email);
      } else {
        addArticle(article as any);
        addLogEntry(t("common.articleAddedMassAdd"), { articleId: article.article_number, rackId: article.rack_id, shelfNumber: article.shelf_number, storeId: article.store_id, quantity: article.quantity }, user?.email);
      }
    });

    toast.success(t("common.articlesSavedSuccess", { count: articlesToProcess.length }));
    setArticlesToProcess([]);
    setIsShelfDetailsLocked(false);
    setSelectedRackId("");
    setSelectedShelfNumber("");
    navigate("/spravovat-artikly");
  };

  const availableShelves = selectedRackId
    ? shelfRacks.find(r => r.id === selectedRackId && r.store_id === userStoreId)?.shelves || []
    : [];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <Link to="/spravovat-artikly" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToArticleManagement")}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("common.massAdd")} {t("common.articles")}</h1>
          <div className="w-full sm:w-auto"></div>
        </div>

        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.shelfDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shelfRack">{t("common.rackRowRack")}</Label>
              <Select onValueChange={handleRackSelect} value={selectedRackId} disabled={isShelfDetailsLocked}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t("common.selectRack")} />
                </SelectTrigger>
                <SelectContent>
                  {shelfRacks.filter(rack => !userStoreId || rack.store_id === userStoreId).map((rack) => (
                    <SelectItem key={rack.id} value={rack.id}>
                      {rack.row_id}-{rack.rack_id} ({rack.shelves.map(s => s.description).join(', ')}) - {rack.store_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="shelfNumber">{t("common.shelfNumberLabel")}</Label>
              <Select onValueChange={handleShelfNumberSelect} value={selectedShelfNumber} disabled={!selectedRackId || isShelfDetailsLocked}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t("common.selectShelfNumber")} />
                </SelectTrigger>
                <SelectContent>
                  {availableShelves.map((shelf) => (
                    <SelectItem key={shelf.shelfNumber} value={shelf.shelfNumber}>
                      {t("common.shelf")} {shelf.shelfNumber} ({shelf.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="storeId">{t("common.storeId")}</Label>
              <Input id="storeId" value={shelfDetails.store_id} readOnly className="mt-1 bg-gray-100 dark:bg-gray-700" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={handleLockShelfDetails} disabled={isShelfDetailsLocked || !selectedRackId || !selectedShelfNumber} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                {isShelfDetailsLocked ? <><Lock className="h-4 w-4 mr-2" /> {t("common.detailsLocked")}</> : <><Unlock className="h-4 w-4 mr-2" /> {t("common.lockDetails")}</>}
              </Button>
              {isShelfDetailsLocked && (
                <Button variant="outline" onClick={() => setIsShelfDetailsLocked(false)} className="ml-2">
                  {t("common.unlock")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isShelfDetailsLocked && (
          <>
            <Separator className="my-4 sm:my-6" />
            <Card className="mb-4 sm:mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.addArticle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <Button onClick={() => setIsScannerActive(prev => !prev)} className="w-full sm:w-auto bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                    <Scan className="h-4 w-4 mr-2" /> {isScannerActive ? t("common.stopScanning") : t("common.startScanning")}
                  </Button>
                  {isScannerActive && (
                    <div id="reader-mass-add" className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-muted-foreground mt-4">
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    type="text"
                    placeholder={t("common.enterArticleIdManually")}
                    value={manualArticleId}
                    onChange={(e) => setManualArticleId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleManualAddArticle()}
                    className="flex-grow"
                  />
                  <Input
                    type="number"
                    placeholder={t("common.enterQuantity")}
                    value={manualArticleQuantity}
                    onChange={(e) => setManualArticleQuantity(parseInt(e.target.value, 10) || 1)}
                    min="1"
                    className="w-full sm:w-24"
                  />
                  <Button onClick={handleManualAddArticle} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full sm:w-auto">
                    <PlusCircle className="h-4 w-4 mr-2" /> {t("common.add")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-4 sm:my-6" />

            <Card className="mb-4 sm:mb-6 flex flex-col flex-grow">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.articlesToSave")} ({articlesToProcess.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-0">
                {articlesToProcess.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">{t("common.noArticlesAdded")}</p>
                ) : (
                  <ScrollArea className="h-full max-h-[300px] w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {articlesToProcess.map((article) => (
                        <div key={article.article_number} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <span className="font-medium text-sm sm:text-base">{article.article_number} - {article.name} ({t("common.quantity")}: {article.quantity})</span>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveArticleFromList(article.article_number!)}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <div className="p-4 border-t flex justify-end">
                <Button onClick={handleSaveAllArticles} disabled={articlesToProcess.length === 0} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="h-4 w-4 mr-2" /> {t("common.saveAll")} ({articlesToProcess.length})
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MassAddArticlesPage;