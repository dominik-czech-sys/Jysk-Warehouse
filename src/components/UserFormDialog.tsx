import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "@/data/users";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: User) => void;
  user?: User | null; // Optional: if provided, it's for editing
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const [formData, setFormData] = useState<User>({
    username: "",
    password: "",
    role: "skladnik",
    warehouseId: "",
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        username: "",
        password: "",
        role: "skladnik",
        warehouseId: "",
      });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRoleChange = (value: "admin" | "skladnik") => {
    setFormData((prev) => ({ ...prev, role: value, warehouseId: value === "admin" ? undefined : prev.warehouseId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.role || (formData.role === "skladnik" && !formData.warehouseId)) {
      toast.error("Prosím, vyplňte všechna pole.");
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Upravit uživatele" : "Přidat nového uživatele"}</DialogTitle>
          <DialogDescription>
            {user ? "Zde můžete upravit údaje uživatele." : "Přidejte nového uživatele do systému."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Uživatelské jméno
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!user} // Make username read-only when editing
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Heslo
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select onValueChange={handleRoleChange} value={formData.role}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Vyberte roli" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="skladnik">Skladník</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.role === "skladnik" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="warehouseId" className="text-right">
                ID Skladu
              </Label>
              <Input
                id="warehouseId"
                value={formData.warehouseId || ""}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Např. Sklad 1"
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {user ? "Uložit změny" : "Přidat uživatele"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};