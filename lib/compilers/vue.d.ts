import type { I18nCompiler } from "../types.js";
export declare class VueCompiler implements I18nCompiler {
    fileName: string;
    constructor(fileName: string);
    match(ext: string): boolean;
    compile(code: string): [string, Array<Error>];
}
//# sourceMappingURL=vue.d.ts.map