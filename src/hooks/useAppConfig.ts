import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/axios";
import { useTranslation } from "react-i18next";
import { getLocalizedText } from "@/utils/localizedText";

interface AppConfig {
  app_name: string;
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

  return {
    ...query,
    appName: getLocalizedAppName(),
    currency: query.data?.currency ?? "EGP",
  };
};
