import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ResourceHeader } from "../../../components/Admin";
import { AdminSettingsForm, type AdminSettingsFormData } from "../../../features/settings";
import { useGetAdminSettingsQuery, useUpdateAdminSettingsMutation } from "../../../app/api/catalog";
import { PATH } from "../../../router/pathNames";

export function AdminSettingsPage() {
  const { t } = useTranslation("admin");
  const { data: settings, isLoading, isError, refetch } = useGetAdminSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateAdminSettingsMutation();

  const handleSave = async (formData: AdminSettingsFormData) => {
    try {
      await updateSettings(formData).unwrap();
      toast.success(t("settings.saveSuccess", "Platform settings saved successfully."));
    } catch {
      toast.error(t("settings.saveError", "Failed to update platform settings."));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <ResourceHeader
        breadcrumbs={[
          { label: "Admin", to: PATH.ADMIN },
          { label: t("settings.title", "Platform settings") },
        ]}
        title={t("settings.title", "Platform settings")}
        subtitle={t(
          "settings.description",
          "Global identity, defaults, reservation rules, and platform feature flags.",
        )}
      />

      {isLoading && (
        <div className="text-ink-subtle flex items-center justify-center p-12 text-sm">
          Loading settings…
        </div>
      )}

      {isError && (
        <div className="border-danger/30 bg-danger/5 flex flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center">
          <p className="text-danger text-sm font-medium">Failed to load platform settings.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-primary text-xs hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {settings && (
        <div className="max-w-4xl">
          <AdminSettingsForm initialData={settings} onSubmit={handleSave} isSubmitting={isSaving} />
        </div>
      )}
    </div>
  );
}
