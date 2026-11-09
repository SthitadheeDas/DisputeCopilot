import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

export const DataMode = {
  Sandbox: "sandbox",
  Fixture: "fixture",
} as const;
export type DataMode = (typeof DataMode)[keyof typeof DataMode] | (string & {});

export const dataModeSchema: EnumSchema<DataMode> = s.enumOf<DataMode>(DataMode);
