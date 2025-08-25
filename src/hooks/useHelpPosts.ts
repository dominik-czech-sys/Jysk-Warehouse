import { useState, useEffect } from "react";
import { useLog } from "@/contexts/LogContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { HelpPost, helpPosts as initialHelpPosts } from "@/data/helpPosts"; // Import initial data

export const useHelpPosts = () => {
  const { user, isAdmin, hasPermission } = useAuth();
  const { addLogEntry } = useLog();
  const { t } = useTranslation();

  const [helpPosts, setHelpPosts] = useState<HelpPost[]>(() => {
    const storedHelpPosts = localStorage.getItem("helpPosts");
    if (storedHelpPosts) {
      return JSON.parse(storedHelpPosts);
    }
    return initialHelpPosts; // Use initial data if nothing in localStorage
  });

  useEffect(() => {
    localStorage.setItem("helpPosts", JSON.stringify(helpPosts));
  }, [helpPosts]);

  const getHelpPostById = (id: string) => {
    return helpPosts.find((post) => post.id === id);
  };

  const addHelpPost = (newPost: HelpPost) => {
    if (!hasPermission("help_posts:manage")) {
      toast.error(t("common.noPermissionToManageHelpPosts"));
      return false;
    }
    if (helpPosts.some(post => post.id === newPost.id)) {
      toast.error(t("common.helpPostExists", { postId: newPost.id }));
      addLogEntry(t("common.attemptToAddExistingHelpPost"), { postId: newPost.id }, user?.email);
      return false;
    }
    setHelpPosts((prev) => [...prev, newPost]);
    toast.success(t("common.helpPostAddedSuccess", { postId: newPost.id }));
    addLogEntry(t("common.helpPostAdded"), { postId: newPost.id, title: newPost.title }, user?.email);
    return true;
  };

  const updateHelpPost = (updatedPost: HelpPost) => {
    if (!hasPermission("help_posts:manage")) {
      toast.error(t("common.noPermissionToManageHelpPosts"));
      return false;
    }
    setHelpPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
    toast.success(t("common.helpPostUpdatedSuccess", { postId: updatedPost.id }));
    addLogEntry(t("common.helpPostUpdated"), { postId: updatedPost.id, title: updatedPost.title }, user?.email);
    return true;
  };

  const deleteHelpPost = (id: string) => {
    if (!hasPermission("help_posts:manage")) {
      toast.error(t("common.noPermissionToManageHelpPosts"));
      return false;
    }
    setHelpPosts((prev) => prev.filter((post) => post.id !== id));
    toast.success(t("common.helpPostDeletedSuccess", { postId: id }));
    addLogEntry(t("common.helpPostDeleted"), { postId: id }, user?.email);
    return true;
  };

  return { helpPosts, getHelpPostById, addHelpPost, updateHelpPost, deleteHelpPost };
};