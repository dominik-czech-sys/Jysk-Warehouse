import React, { useState } from "react";
import { useAuditTemplates, AuditTemplate } from "@/data/audits";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, ArrowLeft } from "lucide-react";
import { AuditTemplateFormDialog } from "@/components/AuditTemplateFormDialog";
import { Link } from "react-router-dom";

const ManageAuditTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const { templates, isLoading, addTemplate, updateTemplate, deleteTemplate } = useAuditTemplates();
  const { hasPermission } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AuditTemplate | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<AuditTemplate | null>(null);

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleEditTemplate = (template: AuditTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDeleteTemplate = (template: AuditTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleFormSubmit = async (formData: Partial<AuditTemplate>) => {
    if (formData.id) {
      await updateTemplate(formData as AuditTemplate);
    } else {
      await addTemplate(formData as any);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 sm:mb-6 space-y-2 sm:space-y-0">
           <Link to="/admin/site-dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToAdminDashboard")}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("common.audit.templateManagement")}</h1>
          {hasPermission("audit:manage_templates") && (
            <Button onClick={handleAddTemplate} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" /> {t("common.audit.addTemplate")}
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("common.audit.templateList")}</CardTitle>
            <CardDescription>{t("common.audit.templateListDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.audit.templateName")}</TableHead>
                    <TableHead>{t("common.description")}</TableHead>
                    <TableHead>{t("common.audit.itemCount")}</TableHead>
                    <TableHead className="text-right">{t("common.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">{t("common.audit.loadingTemplates")}</TableCell></TableRow>
                  ) : (
                    templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.description}</TableCell>
                        <TableCell>{template.audit_template_items?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)} className="mr-2"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      <AuditTemplateFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        template={editingTemplate}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.audit.confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.audit.confirmDeleteDescription", { templateName: templateToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageAuditTemplatesPage;