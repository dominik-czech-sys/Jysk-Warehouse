import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/data/stores";
import { useArticles } from "@/data/articles";
import { useShelfRacks } from "@/data/shelfRacks";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const ExportDataPage: React.FC = () => {
  const { allUsers } = useAuth();
  const { stores } = useStores();
  const { allArticles } = useArticles();
  const { allShelfRacks } = useShelfRacks();
  const { t } = useTranslation();

  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [dataToExport, setDataToExport] = useState({
    users: false,
    stores: false,
    articles: false,
    racks: false,
  });

  const handleCheckboxChange = (dataType: keyof typeof dataToExport) => {
    setDataToExport((prev) => ({ ...prev, [dataType]: !prev[dataType] }));
  };

  const convertToCsv = (data: any[], headers: string[]): string => {
    const csvRows = [];
    csvRows.push(headers.join(',')); // Add headers

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`; // Escape commas and double quotes
        }
        if (Array.isArray(value)) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`; // Stringify arrays
        }
        return value;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const selectedDataTypes = Object.keys(dataToExport).filter(
      (key) => dataToExport[key as keyof typeof dataToExport]
    );

    if (selectedDataTypes.length === 0) {
      toast.error(t("common.noDataSelected"));
      return;
    }

    try {
      selectedDataTypes.forEach((dataType) => {
        let data: any[] = [];
        let filename = "";
        let headers: string[] = [];

        switch (dataType) {
          case "users":
            data = allUsers.map(({ password, ...rest }) => rest); // Exclude password
            filename = "users";
            headers = ["username", "role", "storeId", "permissions", "firstLogin"];
            break;
          case "stores":
            data = stores;
            filename = "stores";
            headers = ["id", "name"];
            break;
          case "articles":
            data = allArticles;
            filename = "articles";
            headers = ["id", "name", "rackId", "shelfNumber", "storeId", "status", "quantity"];
            break;
          case "racks":
            data = allShelfRacks;
            filename = "racks";
            headers = ["id", "rowId", "rackId", "shelves", "storeId"];
            break;
          default:
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const fullFilename = `${filename}_${timestamp}.${exportFormat}`;

        if (exportFormat === "csv") {
          const csvData = convertToCsv(data, headers);
          downloadFile(csvData, fullFilename, "text/csv");
        } else { // json
          downloadFile(JSON.stringify(data, null, 2), fullFilename, "application/json");
        }
      });
      toast.success(t("common.exportSuccess"));
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(t("common.exportFailed"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 space-y-4 sm:space-y-0">
          <Link to="/admin/site-dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToMainPage")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("common.exportDataPageTitle")}</h1>
          <div className="w-full sm:w-auto"></div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.selectDataToExport")}</CardTitle>
            <CardDescription>{t("common.exportDataPageDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.keys(dataToExport).map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={dataToExport[key as keyof typeof dataToExport]}
                    onCheckedChange={() => handleCheckboxChange(key as keyof typeof dataToExport)}
                  />
                  <Label htmlFor={key} className="capitalize">
                    {t(`common.export${key.charAt(0).toUpperCase() + key.slice(1)}`)}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Label htmlFor="exportFormat">{t("common.exportFormat")}</Label>
              <Select onValueChange={(value: "csv" | "json") => setExportFormat(value)} value={exportFormat}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t("common.exportFormat")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport} className="w-full bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              <Download className="h-4 w-4 mr-2" /> {t("common.exportSelected")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportDataPage;