import { type PropType } from "vue";
import type { I18nFormatter, I18nLocaleKeyset, I18nParams } from "../../types.js";
import type { UseLocaleLocator } from "./types.js";
export declare function createI18n<L extends string, K extends string>(localeKeyset: I18nLocaleKeyset<L, K>, formatter: I18nFormatter<L>, useLocaleLocator: UseLocaleLocator<L>, defaultLocale: L): {
    Component: import("vue").DefineComponent<{
        msg: {
            type: PropType<K>;
            required: true;
        };
    }, (() => (string | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>)[]) | null, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
        msg: {
            type: PropType<K>;
            required: true;
        };
    }>>, {}, {}>;
    useI18nInternal: (key: K, params?: I18nParams) => import("vue").ComputedRef<string>;
    locale: import("vue").WritableComputedRef<L>;
    translate: {
        (key: K, params?: I18nParams): string;
        $: (key: K, params?: I18nParams) => import("vue").ComputedRef<string>;
    };
};
//# sourceMappingURL=createI18n.d.ts.map