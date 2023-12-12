const langs = ["ja", "en"] as const;

type Lang = (typeof langs)[number];

export default function getLang(): Lang {
  const lang = navigator.language.split(/-|_/)[0];

  if (langs.includes(lang as Lang)) {
    return lang as Lang;
  }

  return "ja";
}
