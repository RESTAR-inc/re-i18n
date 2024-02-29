import type { StringLiteral } from "@babel/types";
import type { I18nCompiler } from "../types.js";
export interface I18nTraverseFileParams {
    /**
     * The path of the file to traverse.
     */
    file: string;
    /**
     * The name of the function to look for during traversal.
     */
    funcName: string;
    /**
     * The name of the composable function to look for during traversal.
     */
    composableName: string;
    /**
     * The name of the component to look for during traversal.
     */
    componentName: string;
    /**
     * An array of compilers to apply based on the file extension.
     */
    compilers: Array<I18nCompiler>;
    /**
     * A callback function to handle errors.
     */
    onEnter(target: StringLiteral): void;
    /**
     * A callback function to execute when encountering the specified function call.
     */
    onError(error: unknown): void;
}
/**
 * Traverses a file and calls the onEnter callback when funcName is encountered.
 */
export declare function traverseFile(params: I18nTraverseFileParams): void;
//# sourceMappingURL=traverseFile.d.ts.map