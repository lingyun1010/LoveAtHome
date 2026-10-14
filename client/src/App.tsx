import { useEffect, useState } from "react";
import { HomePage } from "./pages/HomePage";

export function App() {
  const [language, setLanguage] = useState<"en" | "zh">(() => {
    try { return localStorage.getItem("lah-language") === "zh" ? "zh" : "en"; }
    catch { return "en"; }
  });
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    try { localStorage.setItem("lah-language", language); } catch { /* Storage may be disabled */ }
  }, [language]);
  return <HomePage language={language} setLanguage={setLanguage} />;
}
