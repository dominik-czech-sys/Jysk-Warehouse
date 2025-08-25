import React, { useState } from "react";
import { useAuditTemplates, AuditTemplate, AuditResult } from "@/data/audits";
import { useCompletedAudits } from "@/data/audits";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

const PerformAuditPage: React.FC = () => {
  const { t } = useTranslation();
  const { templates, isLoading: isLoadingTemplates } = useAuditTemplates();
  const { submitAudit, isLoading: isSubmitting } = useCompletedAudits();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AuditTemplate | null>(null);
  const [results, setResults] = useState<Record<string, { result: string; notes: string }>>({});

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setSelectedTemplate(template);
      // Initialize results state
      const initialResults: Record<string, { result: string; notes: string }> = {};
      template.audit_template_items.forEach(item => {
        if (item.id) {
            initialResults[item.id] = { result: "", notes: "" };
        }
      });
      setResults(initialResults);
    }
  };

  const handleResultChange = (itemId: string, value: string) => {
    setResults(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], result: value },
    }));
  };

  const handleNotesChange = (itemId: string, value: string) => {
    setResults(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes: value },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || !user?.id || !user.store_id) {
        toast.error(t("common.audit.submitErrorGeneric"));
        return;
    }

    // Validate that all questions are answered
    for (const item of selectedTemplate.audit_template_items) {
        if (item.id && !results[item.id]?.result) {
            toast.error(t("common.audit.allQuestionsRequiredError"));
            return;
        }
    }

    const finalResults: AuditResult[] = Object.entries(results).map(([itemId, data]) => ({
        item_id: itemId,
        result: data.result,
        notes: data.notes,
    }));

    await submitAudit({
        template_id: selectedTemplate.id,
        store_id: user.store_id,
        user_id: user.id,
        results: finalResults,
    });

    navigate("/audity");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link to="/audity">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> {t("common.audit.backToList")}</Button>
        </Link>
        <h1 className="text-lg font-semibold md:text-2xl">{t("common.audit.performAudit")}</h1>
        <div />
      </div>

      {!selectedTemplate ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("common.audit.selectTemplateTitle")}</CardTitle>
            <CardDescription>{t("common.audit.selectTemplateDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleTemplateSelect} disabled={isLoadingTemplates}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingTemplates ? t("common.audit.loadingTemplates") : t("common.audit.selectTemplate")} />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTemplate.name}</CardTitle>
            <CardDescription>{selectedTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedTemplate.audit_template_items.map(item => item.id ? (
              <div key={item.id} className="p-4 border rounded-md">
                <Label className="font-semibold">{item.item_order}. {item.question}</Label>
                <div className="mt-2">
                  {item.item_type === 'yes_no' && (
                    <RadioGroup onValueChange={(value) => handleResultChange(item.id!, value)} value={results[item.id]?.result}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`${item.id}-yes`} />
                        <Label htmlFor={`${item.id}-yes`}>{t("common.yes")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`${item.id}-no`} />
                        <Label htmlFor={`${item.id}-no`}>{t("common.no")}</Label>
                      </div>
                    </RadioGroup>
                  )}
                  {/* Add other item types like rating and text later */}
                </div>
                <Textarea
                  placeholder={t("common.audit.notesPlaceholder")}
                  className="mt-4"
                  value={results[item.id]?.notes}
                  onChange={(e) => handleNotesChange(item.id!, e.target.value)}
                />
              </div>
            ) : null)}
            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? t("common.audit.submitting") : t("common.audit.submitAudit")}
                </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformAuditPage;