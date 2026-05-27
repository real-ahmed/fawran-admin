import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/axios";
import { useTranslation } from "react-i18next";
import { getLocalizedText } from "@/utils/localizedText";
import { resolveStorageAssetUrl } from "@/utils/assets";
import { useApplyAppBranding } from "@/hooks/useApplyAppBranding";

interface AppConfig {
  app_name: string;
  app_logo?: string;
  app_logo_white?: string;
  app_icon: string;
  favicon: string;
  currency: string;
}

export const useAppConfig = () => {
  const { i18n } = useTranslation();

  const query = useQuery({
    queryKey: ["appConfig"],
    queryFn: async () => {
      const { data } = await apiClient.get("/public/app-config");
      return data?.data as AppConfig;
    },
    staleTime: Infinity, // don't refetch often
  });

  const getLocalizedAppName = (fallback = "Fawran Admin") => {
    return getLocalizedText(query.data?.app_name, i18n.language, fallback);
  };

  const appName = getLocalizedAppName();
  const appLogoUrl = resolveStorageAssetUrl(getLocalizedText(query.data?.app_logo, i18n.language));
  const appLogoWhiteUrl = resolveStorageAssetUrl(getLocalizedText(query.data?.app_logo_white, i18n.language));
  const appIconUrl = resolveStorageAssetUrl(getLocalizedText(query.data?.app_icon, i18n.language));
  const faviconUrl = resolveStorageAssetUrl(getLocalizedText(query.data?.favicon, i18n.language));

  useApplyAppBranding(appName, faviconUrl);

  return {
    ...query,
    appName,
    appLogoUrl,
    appLogoWhiteUrl,
    appIconUrl,
    faviconUrl,
    currency: query.data?.currency ?? "EGP",
  };
};
