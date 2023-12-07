import path from "path";

export function getLocaleFilePath(
  locale: string,
  file: string,
  lookupDir: string
) {
  const dirName = path.dirname(file);
  const dtargetDir = path.resolve(path.join(dirName, lookupDir));
  const fileName = path.basename(file, path.extname(file));

  return path.join(dtargetDir, `${locale}.${fileName}.json`);
}
