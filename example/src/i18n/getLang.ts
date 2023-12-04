type Lang = "ja" | "en";

export default function getLang(): Lang {
  const lang = navigator.language.split(/-|_/)[0];

  if (lang) {
    return lang as Lang;
  }

  return "ja";
}
