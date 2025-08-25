import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface AuditTemplateItem {
  id?: string;
  template_id?: string;
  question: string;
  item_type: 'yes_no' | 'rating_1_5' | 'text';
  item_order: number;
}

export interface AuditTemplate {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
  audit_template_items: AuditTemplateItem[];
}

export interface CompletedAudit {
  id: string;
  completed_at: string;
  store_id: string;
  audit_templates: { name: string } | null;
  profiles: { username: string } | null;
}

export interface AuditResult {
    item_id: string;
    result: string;
    notes?: string;
}

type NewAuditTemplate = Omit<AuditTemplate, 'id' | 'created_at' | 'audit_template_items'> & {
  audit_template_items: Omit<AuditTemplateItem, 'id' | 'template_id'>[];
};

const fetchAuditTemplates = async (): Promise<AuditTemplate[]> => {
  const { data, error } = await supabase
    .from("audit_templates")
    .select("*, audit_template_items(*)")
    .order('item_order', { referencedTable: 'audit_template_items', ascending: true });
  if (error) throw new Error(error.message);
  return data as AuditTemplate[];
};

const addAuditTemplateToDb = async (newTemplate: NewAuditTemplate) => {
  const { data: templateData, error: templateError } = await supabase
    .from("audit_templates")
    .insert({
      name: newTemplate.name,
      description: newTemplate.description,
      created_by: newTemplate.created_by,
    })
    .select()
    .single();
  if (templateError) throw templateError;

  const itemsToInsert = newTemplate.audit_template_items.map(item => ({
    ...item,
    template_id: templateData.id,
  }));
  const { error: itemsError } = await supabase
    .from("audit_template_items")
    .insert(itemsToInsert);
  if (itemsError) {
    await supabase.from("audit_templates").delete().eq("id", templateData.id);
    throw itemsError;
  }
  return templateData;
};

const updateAuditTemplateInDb = async (updatedTemplate: AuditTemplate) => {
  const { error: templateError } = await supabase
    .from("audit_templates")
    .update({
      name: updatedTemplate.name,
      description: updatedTemplate.description,
    })
    .eq("id", updatedTemplate.id);
  if (templateError) throw templateError;

  const { error: deleteError } = await supabase
    .from("audit_template_items")
    .delete()
    .eq("template_id", updatedTemplate.id);
  if (deleteError) throw deleteError;

  const itemsToInsert = updatedTemplate.audit_template_items.map(item => ({
    template_id: updatedTemplate.id,
    question: item.question,
    item_type: item.item_type,
    item_order: item.item_order,
  }));
  if (itemsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("audit_template_items")
      .insert(itemsToInsert);
    if (insertError) throw insertError;
  }
  return updatedTemplate;
};

const deleteAuditTemplateFromDb = async (templateId: string) => {
  const { error } = await supabase.from("audit_templates").delete().eq("id", templateId);
  if (error) throw new Error(error.message);
  return templateId;
};

const fetchCompletedAudits = async (): Promise<CompletedAudit[]> => {
    const { data, error } = await supabase
    .from("audits")
    .select(`
      id,
      completed_at,
      store_id,
      audit_templates ( name ),
      profiles ( username )
    `)
    .order('completed_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as unknown as CompletedAudit[];
};

const submitAuditToDb = async ({ template_id, store_id, user_id, results }: { template_id: string; store_id: string; user_id: string; results: AuditResult[] }) => {
    // 1. Create the main audit record
    const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .insert({ template_id, store_id, user_id })
        .select()
        .single();

    if (auditError) throw auditError;

    // 2. Prepare and insert the results
    const resultsToInsert = results.map(result => ({
        audit_id: auditData.id,
        ...result
    }));

    const { error: resultsError } = await supabase
        .from('audit_results')
        .insert(resultsToInsert);

    if (resultsError) {
        // Clean up if results fail
        await supabase.from('audits').delete().eq('id', auditData.id);
        throw resultsError;
    }

    return auditData;
};

export const useAuditTemplates = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: templates, isLoading, error } = useQuery<AuditTemplate[]>({
    queryKey: ["auditTemplates"],
    queryFn: fetchAuditTemplates,
  });

  const addTemplateMutation = useMutation({
    mutationFn: addAuditTemplateToDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditTemplates"] });
      toast.success(t("common.audit.templateAddedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const updateTemplateMutation = useMutation({
    mutationFn: updateAuditTemplateInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditTemplates"] });
      toast.success(t("common.audit.templateUpdatedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteAuditTemplateFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditTemplates"] });
      toast.success(t("common.audit.templateDeletedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    templates: templates || [],
    isLoading,
    error,
    addTemplate: addTemplateMutation.mutateAsync,
    updateTemplate: updateTemplateMutation.mutateAsync,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
  };
};

export const useCompletedAudits = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const { data: audits, isLoading, error } = useQuery<CompletedAudit[]>({
        queryKey: ["completedAudits"],
        queryFn: fetchCompletedAudits,
    });

    const submitAuditMutation = useMutation({
        mutationFn: submitAuditToDb,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["completedAudits"] });
            toast.success(t("common.audit.submitSuccess"));
        },
        onError: (err) => toast.error(err.message),
    });

    return {
        audits: audits || [],
        isLoading,
        error,
        submitAudit: submitAuditMutation.mutateAsync,
    };
};