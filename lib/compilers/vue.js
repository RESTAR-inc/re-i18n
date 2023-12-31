import * as compiler from "@vue/compiler-sfc";
import fs from "fs";
import { CompilerError } from "../error.js";
export class VueCompiler {
    constructor(fileName) {
        this.fileName = fileName;
    }
    match(ext) {
        return ext === ".vue";
    }
    compile(code) {
        var _a;
        const parsed = compiler.parse(code, {
            filename: this.fileName,
        });
        const result = [];
        const errors = [];
        try {
            const { content } = compiler.compileScript(parsed.descriptor, {
                fs: {
                    fileExists: (file) => {
                        return fs.existsSync(file);
                    },
                    readFile: (file) => {
                        return fs.readFileSync(file, "utf-8");
                    },
                },
                id: "script",
            });
            result.push(content);
        }
        catch (error) {
            errors.push(new CompilerError(`unable to parse "${this.fileName}" script: ${error instanceof Error ? error.message : error}`));
        }
        try {
            const { code } = compiler.compileTemplate({
                id: "template",
                source: ((_a = parsed.descriptor.template) === null || _a === void 0 ? void 0 : _a.content) || "",
                filename: "template",
                compilerOptions: {
                    inline: true,
                },
            });
            result.push(code);
        }
        catch (error) {
            errors.push(new CompilerError(`unable to parse "${this.fileName}" template: ${error instanceof Error ? error.message : error}`));
        }
        return [result.join(";"), errors];
    }
}
//# sourceMappingURL=vue.js.map