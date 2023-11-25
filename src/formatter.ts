import { I18nFormatter } from "./types";

export const formatter: I18nFormatter = {
  raw<T, U>(msg: string, options: T): U {
    // TODO: implement me
    return msg as U;
  },
  str<T>(msg: string, options: T): string {
    // TODO: implement me
    return msg;
  },
};
