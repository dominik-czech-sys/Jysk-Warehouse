import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAuditDetail } from "@/data/audits";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const AuditDetailPage: React.FC = () => {
  const { auditId } = useParams<{ auditId: string }>();
  const { t } = useTranslation();
  const { audit, isLoading, error } = useAuditDetail(auditId!);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !audit) {
    return <div>{t("common.audit.errorLoadingDetail")}</div>;
  }

  const getResultIcon = (result: string) => {
    if (result.toLowerCase() === 'yes') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (result.toLowerCase() === 'no') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return null;
    if (score >= 90) return <Badge className="bg-green-500 text-white hover:bg-green-600 text-lg">{score.toFixed(1)}%</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 text-lg">{score.toFixed(1)}%</Badge>;
    return <Badge variant="destructive" className="text-lg">{score.toFixed(1)}%</Badge>;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link to="/audity">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> {t("common.audit.backToList")}</Button>
        </Link>
        <h1 className="text-lg font-semibold md:text-2xl">{t("common.audit.auditDetail")}</h1>
        <div />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>{audit.audit_templates?.name}</CardTitle>
            {getScoreBadge(audit.score)}
          </div>
          <CardDescription>
            {t("common.audit.completedOn", { date: format(new Date(audit.completed_at), "d. M. yyyy 'v' HH:mm", { locale: cs }) })}
            <br />
            {t("common.audit.completedBy")}: {audit.profiles?.username} | {t("common.storeId")}: {audit.store_id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {audit.audit_results
            .sort((a, b) => (a.audit_template_items?.item_order || 0) - (b.audit_template_items?.item_order || 0))
            .map((result, index) => (
            <div key={index} className="p-4 border rounded-md bg-muted/40">
              <div className="flex justify-between items-start">
                <p className="font-semibold">{result.audit_template_items?.item_order}. {result.audit_template_items?.question}</p>
                <div className="flex items-center gap-2">
                  {getResultIcon(result.result)}
                  <Badge variant={result.result.toLowerCase() === 'yes' ? 'default' : 'destructive'}>
                    {t(`common.${result.result.toLowerCase()}`)}
                  </Badge>
                </div>
              </div>
              {result.notes && (
                <p className="text-sm text-muted-foreground mt-2 pl-6 border-l-2 ml-2">{result.notes}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditDetailPage;