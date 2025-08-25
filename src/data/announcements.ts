import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id?: string;
  target_audience: string;
  urgency: 'normal' | 'important' | 'critical';
  created_at: string;
  profiles: { username: string } | null;
}

type NewAnnouncement = Omit<Announcement, 'id' | 'created_at' | 'profiles'>;

const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await supabase
    .from("announcements")
    .select("*, profiles(username)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Announcement[];
};

const addAnnouncementToDb = async (newAnnouncement: NewAnnouncement) => {
  const { data, error } = await supabase.from("announcements").insert(newAnnouncement).select();
  if (error) throw new Error(error.message);
  return data;
};

const updateAnnouncementInDb = async (updatedAnnouncement: Partial<Announcement> & { id: string }) => {
  const { data, error } = await supabase.from("announcements").update(updatedAnnouncement).eq("id", updatedAnnouncement.id).select();
  if (error) throw new Error(error.message);
  return data;
};

const deleteAnnouncementFromDb = async (announcementId: string) => {
  const { error } = await supabase.from("announcements").delete().eq("id", announcementId);
  if (error) throw new Error(error.message);
  return announcementId;
};

export const useAnnouncements = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: announcements, isLoading, error } = useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const addAnnouncementMutation = useMutation({
    mutationFn: addAnnouncementToDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success(t("common.announcement.addSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: updateAnnouncementInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success(t("common.announcement.updateSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: deleteAnnouncementFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success(t("common.announcement.deleteSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    announcements: announcements || [],
    isLoading,
    error,
    addAnnouncement: addAnnouncementMutation.mutateAsync,
    updateAnnouncement: updateAnnouncementMutation.mutateAsync,
    deleteAnnouncement: deleteAnnouncementMutation.mutateAsync,
  };
};