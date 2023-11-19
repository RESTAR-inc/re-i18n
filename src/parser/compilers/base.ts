export interface Precompiler {
  match(ext: string): boolean;
  compile(code: string): string;
}
