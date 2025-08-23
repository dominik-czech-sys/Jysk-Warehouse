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
import { Html5QrcodeScanner } from "html5-qrcode";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShelfRacks, ShelfRack } from "@/data/shelfRacks";

interface ShelfDetails {
  rackId: string;
  shelfNumber: string;
  location: string;
  floor: string;
  storeId: string; // Renamed from warehouseId
}

const MassAddArticlesPage: React.FC = () => {
  const { userStoreId, user } = useAuth();
  const { addArticle, updateArticle, getArticleById } = useArticles();
  const { addLogEntry } = useLog();
  const { shelfRacks } = useShelfRacks();
  const navigate = useNavigate();

  const [shelfDetails, setShelfDetails] = useState<ShelfDetails>({
    rackId: "",
    shelfNumber: "",
    location: "",
    floor: "",
    storeId: userStoreId || "",
  });
  const [isShelfDetailsLocked, setIsShelfDetailsLocked] = useState(false);
  const [articlesToProcess, setArticlesToProcess] = useState<Article[]>([]);
  const [manualArticleId, setManualArticleId] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);

  const [selectedRackId, setSelectedRackId] = useState<string>("");
  const [selectedShelfNumber, setSelectedShelfNumber] = useState<string>("");

  useEffect(() => {
    if (isScannerActive && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      const onScanSuccess = (decodedText: string) => {
        toast.success(`Čárový kód naskenován: ${decodedText}`);
        addLogEntry("Čárový kód naskenován pro hromadné přidání", { scannedCode: decodedText, shelfDetails }, user?.username);
        addArticleToProcess(decodedText);
      };

      const onScanError = (errorMessage: string) => {
        // console.warn(`Chyba skenování: ${errorMessage}`);
      };

      scannerRef.current.render(onScanSuccess, onScanError);
    } else if (!isScannerActive && scannerRef.current) {
      scannerRef.current.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner", error);
      });
      scannerRef.current = null;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner on unmount", error);
        });
        scannerRef.current = null;
      }
    };
  }, [isScannerActive, shelfDetails, user?.username]);

  useEffect(() => {
    const currentRack = shelfRacks.find(rack => rack.id === selectedRackId && rack.storeId === userStoreId);
    if (currentRack) {
      // Update location, floor, and storeId from the selected rack
      setShelfDetails({
        rackId: currentRack.id,
        shelfNumber: selectedShelfNumber,
        location: currentRack.location,
        floor: currentRack.floor,
        storeId: currentRack.storeId,
      });
    } else {
      setShelfDetails({
        rackId: "",
        shelfNumber: "",
        location: "",
        floor: "",
        storeId: userStoreId || "",
      });
    }
  }, [selectedRackId, selectedShelfNumber, shelfRacks, userStoreId]);

  const handleRackSelect = (value: string) => {
    setSelectedRackId(value);
    setSelectedShelfNumber(""); // Reset shelf number when rack changes
  };

  const handleShelfNumberSelect = (value: string) => {
    setSelectedShelfNumber(value);
  };

  const handleLockShelfDetails = () => {
    if (!selectedRackId || !selectedShelfNumber) {
      toast.error("Prosím, vyberte regál a číslo police před uzamčením.");
      return;
    }
    setIsShelfDetailsLocked(true);
    toast.info("Detaily regálu uzamčeny. Nyní můžete přidávat články.");
  };

  const addArticleToProcess = (articleId: string) => {
    if (!isShelfDetailsLocked) {
      toast.error("Nejprve uzamkněte detaily regálu.");
      return;
    }
    if (!articleId.trim()) {
      toast.error("ID článku nemůže být prázdné.");
      return;
    }

    const existingArticle = getArticleById(articleId.trim().toUpperCase());
    const newArticleData: Article = {
      id: articleId.trim().toUpperCase(),
      name: existingArticle?.name || `Neznámý článek ${articleId.trim().toUpperCase()}`, // Default name if not found
      status: existingArticle?.status || "21", // Default status
      ...shelfDetails, // Apply preset shelf details
    };

    // Check if this article is already in the current session's list
    if (articlesToProcess.some(a => a.id === newArticleData.id && a.storeId === newArticleData.storeId)) {
      toast.warning(`Článek ${newArticleData.id} je již v seznamu pro zpracování pro tento sklad.`);
      return;
    }

    setArticlesToProcess((prev) => [...prev, newArticleData]);
    setManualArticleId(""); // Clear manual input after adding
    toast.success(`Článek ${newArticleData.id} přidán do seznamu.`);
  };

  const handleManualAddArticle = () => {
    addArticleToProcess(manualArticleId);
  };

  const handleRemoveArticleFromList = (idToRemove: string) => {
    setArticlesToProcess((prev) => prev.filter(article => article.id !== idToRemove));
    toast.info(`Článek ${idToRemove} odstraněn ze seznamu.`);
  };

  const handleSaveAllArticles = () => {
    if (articlesToProcess.length === 0) {
      toast.error("Žádné články k uložení.");
      return;
    }

    articlesToProcess.forEach(article => {
      const existing = getArticleById(article.id); // This will check only within the current user's store
      if (existing && existing.storeId === article.storeId) {
        updateArticle(article); // Update existing article with new location
        addLogEntry("Článek aktualizován (hromadné přidání)", { articleId: article.id, newRackId: article.rackId, newShelfNumber: article.shelfNumber, storeId: article.storeId }, user?.username);
      } else {
        addArticle(article); // Add new article
        addLogEntry("Článek přidán (hromadné přidání)", { articleId: article.id, rackId: article.rackId, shelfNumber: article.shelfNumber, storeId: article.storeId }, user?.username);
      }
    });

    toast.success(`${articlesToProcess.length} článků bylo úspěšně uloženo.`);
    setArticlesToProcess([]);
    setIsShelfDetailsLocked(false);
    setSelectedRackId("");
    setSelectedShelfNumber("");
    navigate("/spravovat-clanky"); // Redirect to manage articles after saving
  };

  const availableShelves = selectedRackId
    ? shelfRacks.find(r => r.id === selectedRackId && r.storeId === userStoreId)?.shelves || []
    : [];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 space-y-4 sm:space-y-0">
          <Link to="/spravovat-clanky" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Zpět na správu článků
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">Hromadné přidávání článků</h1>
          <div className="w-full sm:w-auto"></div> {/* Placeholder for alignment */}
        </div>

        {/* Shelf Details Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">Detaily regálu</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shelfRack">Regál (Řada-Regál)</Label>
              <Select onValueChange={handleRackSelect} value={selectedRackId} disabled={isShelfDetailsLocked}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Vyberte regál" />
                </SelectTrigger>
                <SelectContent>
                  {shelfRacks.filter(rack => !userStoreId || rack.storeId === userStoreId).map((rack) => (
                    <SelectItem key={rack.id} value={rack.id}>
                      {rack.rowId}-{rack.rackId} ({rack.shelves.map(s => s.description).join(', ')}) - {rack.storeId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="shelfNumber">Číslo police</Label>
              <Select onValueChange={handleShelfNumberSelect} value={selectedShelfNumber} disabled={!selectedRackId || isShelfDetailsLocked}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Vyberte číslo police" />
                </SelectTrigger>
                <SelectContent>
                  {availableShelves.map((shelf) => (
                    <SelectItem key={shelf.shelfNumber} value={shelf.shelfNumber}>
                      Police {shelf.shelfNumber} ({shelf.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Umístění</Label>
              <Input id="location" value={shelfDetails.location} readOnly className="mt-1 bg-gray-100 dark:bg-gray-700" />
            </div>
            <div>
              <Label htmlFor="floor">Patro</Label>
              <Input id="floor" value={shelfDetails.floor} readOnly className="mt-1 bg-gray-100 dark:bg-gray-700" />
            </div>
            <div>
              <Label htmlFor="storeId">ID Skladu</Label>
              <Input id="storeId" value={shelfDetails.storeId} readOnly className="mt-1 bg-gray-100 dark:bg-gray-700" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={handleLockShelfDetails} disabled={isShelfDetailsLocked || !selectedRackId || !selectedShelfNumber} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                {isShelfDetailsLocked ? <><Lock className="h-4 w-4 mr-2" /> Detaily uzamčeny</> : <><Unlock className="h-4 w-4 mr-2" /> Uzamknout detaily regálu</>}
              </Button>
              {isShelfDetailsLocked && (
                <Button variant="outline" onClick={() => setIsShelfDetailsLocked(false)} className="ml-2">
                  Odemknout
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isShelfDetailsLocked && (
          <>
            <Separator className="my-6" />

            {/* Article Input Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">Přidat články</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Barcode Scanner */}
                <div className="flex flex-col items-center space-y-2">
                  <Button onClick={() => setIsScannerActive(prev => !prev)} className="w-full sm:w-auto bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                    <Scan className="h-4 w-4 mr-2" /> {isScannerActive ? "Zastavit skenování" : "Spustit skenování"}
                  </Button>
                  {isScannerActive && (
                    <div id="reader" className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-muted-foreground mt-4">
                      {/* QR Code Scanner will render here */}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Zadejte ID článku ručně"
                    value={manualArticleId}
                    onChange={(e) => setManualArticleId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleManualAddArticle()}
                    className="flex-grow"
                  />
                  <Button onClick={handleManualAddArticle} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                    <PlusCircle className="h-4 w-4 mr-2" /> Přidat
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-6" />

            {/* Articles to Process List */}
            <Card className="mb-6 flex flex-col flex-grow">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">Články k uložení ({articlesToProcess.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-0">
                {articlesToProcess.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">Žádné články nebyly přidány.</p>
                ) : (
                  <ScrollArea className="h-full max-h-[300px] w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {articlesToProcess.map((article) => (
                        <div key={article.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <span className="font-medium">{article.id} - {article.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveArticleFromList(article.id)}>
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
                  <Save className="h-4 w-4 mr-2" /> Uložit všechny ({articlesToProcess.length})
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