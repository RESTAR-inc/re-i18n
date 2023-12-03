import ejs from "ejs";

import type { I18nTemplateData } from "./schemas/template";

const template = `/* eslint-disable */
// Do not edit, use generator to update
<%_ if (formatterPath) { _%>
import { createI18n, type I18nLangSet } from "vue-re-i18n";

import formatter from "<%- formatterPath %>";
<%_ } else { _%>
import { createI18n, formatter, type I18nLangSet } from "vue-re-i18n";
<% } _%>
<%_ if (getLangPath) { _%>
import getLang from "<%- getLangPath %>";
<% } _%>

<%_ for (const lang of langs) { _%>
import <%- lang %> from "./<%- lang %>.json";
<%_ } _%>

type I18nKey = <%- langs.map((lang) => \`keyof typeof \${lang}\`).join(" & ") %>;

const keyset: I18nLangSet<I18nKey> = {};
<%_ if (multiple) { %>
<%_ for (const lang of langs) { _%>
if (process.env.<%- envVarName %> === "<%- lang %>") keyset["<%- lang %>"] = <%- lang %>;
<%_ } _%>
<% } else { %>
<%_ for (const lang of langs) { _%>
keyset["<%- lang %>"] = <%- lang %>;
<%_ } _%>
<% } _%>

export const <%- funcName %> = createI18n<<%- langs.map(l => \`"\${l}"\`).join(" | ") %>, I18nKey>(keyset, formatter, getLang);
`;

export function renderTsFile(data: I18nTemplateData) {
  return ejs.render(template, data, {});
}
