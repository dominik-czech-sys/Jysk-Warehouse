import React from "react";
import { useCompletedAudits, CompletedAudit } from "@/data/audits";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Link } from "react-router-dom";

const AuditListPage: React.FC = () => {
  const { t } = useTranslation();
  const { audits, isLoading } = useCompletedAudits();
  const { hasPermission } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{t("common.audit.audits")}</h1>
        {hasPermission("audit:perform") && (
          <Button disabled>
            <PlusCircle className="h-4 w-4 mr-2" /> {t("common.audit.startNewAudit")}
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("common.audit.completedAudits")}</CardTitle>
          <CardDescription>{t("common.audit.completedAuditsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.audit.templateName")}</TableHead>
                  <TableHead>{t("common.storeId")}</TableHead>
                  <TableHead>{t("common.audit.completedBy")}</TableHead>
                  <TableHead>{t("common.audit.completionDate")}</TableHead>
                  <TableHead className="text-right">{t("common.action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">{t("common.audit.loadingAudits")}</TableCell></TableRow>
                ) : (
                  audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-medium">{audit.audit_templates?.name || t("common.unknown")}</TableCell>
                      <TableCell>{audit.store_id}</TableCell>
                      <TableCell>{audit.profiles?.username || t("common.unknown")}</TableCell>
                      <TableCell>{format(new Date(audit.completed_at), "d. M. yyyy HH:mm", { locale: cs })}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>
                            <Eye className="h-4 w-4 mr-2" /> {t("common.viewDetails")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditListPage;