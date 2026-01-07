"use client";
import { NextIntlClientProvider } from "next-intl";

import { useEffect, useState } from "react";

export default function IntlProviderWrapper({ locale, messages, children }: { locale: string, messages: any, children: React.ReactNode }) {
  const [lang, setLang] = useState(locale);
  const [msgs, setMsgs] = useState(messages);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paramLang = params.get("lang");
      if (!paramLang || paramLang === "ko") {
        setLang("ko");
        setMsgs(require("../../messages/ko.json"));
      } else if (paramLang === "en") {
        setLang("en");
        setMsgs(require("../../messages/en.json"));
      } else if (paramLang === "ja") {
        setLang("ja");
        setMsgs(require("../../messages/ja.json"));
      } else {
        setLang("ko");
        setMsgs(require("../../messages/ko.json"));
      }
    }
  }, []);

  return (
    <NextIntlClientProvider locale={lang} messages={msgs} timeZone="Asia/Seoul">
      {children}
    </NextIntlClientProvider>
  );
}
