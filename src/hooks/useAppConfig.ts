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
  const appLogoUrl = resolveStorageAssetUrl(query.data?.app_logo);
  const appLogoWhiteUrl = resolveStorageAssetUrl(query.data?.app_logo_white);
  const appIconUrl = resolveStorageAssetUrl(query.data?.app_icon);
  const faviconUrl = resolveStorageAssetUrl(query.data?.favicon);

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
