import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Check, XCircle } from "lucide-react";

interface FirstLoginTutorialProps {
  onComplete: () => void;
}

const FirstLoginTutorial: React.FC<FirstLoginTutorialProps> = ({ onComplete }) => {
  const { user, changePasswordOnFirstLogin } = useAuth();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  if (!user) {
    return null;
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error(t("common.passwordMismatch"));
      return;
    }
    if (!user) return;

    const success = await changePasswordOnFirstLogin(user.username, newPassword);
    if (success) {
      setCurrentStep(1); // Move to the next step after password change
    } else {
      toast.error(t("common.passwordChangeFailed"));
    }
  };

  const getTutorialSteps = (role: typeof user.role) => {
    const baseSteps = [
      {
        title: t("common.tutorialStep1Title"),
        content: t("common.tutorialStep1Content"),
        permissions: ["article:view", "article:scan"],
      },
      {
        title: t("common.tutorialStep2Title"),
        content: t("common.tutorialStep2Content"),
        permissions: ["article:scan"],
      },
    ];

    switch (role) {
      case "admin":
        return [
          ...baseSteps,
          {
            title: t("common.tutorialStep3Title"),
            content: t("common.tutorialStep3Content"),
            permissions: ["rack:create"],
          },
          {
            title: t("common.tutorialStep4Title"),
            content: t("common.tutorialStep4Content"),
            permissions: ["article:mass_add"],
          },
          {
            title: t("common.tutorialStep5Title"),
            content: t("common.tutorialStep5Content"),
            permissions: ["user:create"],
          },
          {
            title: t("common.tutorialStep6Title"),
            content: t("common.tutorialStep6Content"),
            permissions: ["store:create"],
          },
          {
            title: t("common.tutorialStep7Title"),
            content: t("common.tutorialStep7Content"),
            permissions: ["log:view"],
          },
        ];
      case "vedouci_skladu":
      case "store_manager":
        return [
          ...baseSteps,
          {
            title: t("common.tutorialStep3Title"),
            content: t("common.tutorialStep3Content"),
            permissions: ["rack:create"],
          },
          {
            title: t("common.tutorialStep4Title"),
            content: t("common.tutorialStep4Content"),
            permissions: ["article:mass_add"],
          },
        ];
      case "deputy_store_manager":
      case "skladnik":
        return [
          ...baseSteps,
          {
            title: t("common.tutorialStep4Title"),
            content: t("common.tutorialStep4Content"),
            permissions: ["article:mass_add"],
          },
        ];
      case "ar_assistant_of_sale":
        return baseSteps; // Only search and scan
      default:
        return baseSteps;
    }
  };

  const tutorialContent = getTutorialSteps(user.role);

  const handleNextStep = () => {
    if (currentStep < tutorialContent.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.firstLoginTutorialTitle")}</CardTitle>
          <CardDescription className="mt-2">{t("common.firstLoginTutorialDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.firstLogin && currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{t("common.firstLoginTutorialStep1")}</h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="newPassword">{t("common.newPassword")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmNewPassword">{t("common.confirmNewPassword")}</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handlePasswordChange} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                  {t("common.changePassword")}
                </Button>
              </div>
            </div>
          )}

          {user.firstLogin && currentStep > 0 && currentStep <= tutorialContent.length && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{t("common.firstLoginTutorialStep2")}</h2>
              <Card className="border-jyskBlue-dark dark:border-jyskBlue-light">
                <CardHeader>
                  <CardTitle className="text-xl text-jyskBlue-dark dark:text-jyskBlue-light">
                    {tutorialContent[currentStep - 1].title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {tutorialContent[currentStep - 1].content}
                  </p>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button onClick={handleNextStep} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                  {t("common.nextStep")}
                </Button>
              </div>
            </div>
          )}

          {user.firstLogin && currentStep > tutorialContent.length && (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 flex items-center justify-center">
                <Check className="h-6 w-6 mr-2" /> {t("common.tutorialComplete")}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">{t("common.tutorialCompleteMessage")}</p>
              <Button onClick={onComplete} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                {t("common.finishTutorial")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstLoginTutorial;