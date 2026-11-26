import Ajv from 'ajv';
import { JSONPath } from 'jsonpath-plus';

function inferTsType(value: unknown, name: string, interfaces: string[]): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const itemType = inferTsType(value[0], `${name}Item`, interfaces);
    return `${itemType}[]`;
  }
  if (typeof value === 'object') {
    const ifaceName = name.charAt(0).toUpperCase() + name.slice(1);
    const props = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
        const propType = inferTsType(v, `${ifaceName}${k.charAt(0).toUpperCase() + k.slice(1)}`, interfaces);
        return `  ${safeKey}: ${propType};`;
      })
      .join('\n');
    interfaces.push(`export interface ${ifaceName} {\n${props}\n}`);
    return ifaceName;
  }
  return typeof value;
}

export function jsonToTypeScript(
  input: string,
  rootName = 'RootObject'
): { ok: true; output: string } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(input);
    const interfaces: string[] = [];
    const rootType = inferTsType(parsed, rootName, interfaces);
    if (interfaces.length === 0) {
      return { ok: true, output: `export type ${rootName} = ${rootType};` };
    }
    return { ok: true, output: interfaces.reverse().join('\n\n') };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid JSON.' };
  }
}

export function validateJsonSchema(
  jsonInput: string,
  schemaInput: string
): { valid: boolean; errors: string[] } {
  try {
    const data = JSON.parse(jsonInput);
    const schema = JSON.parse(schemaInput);
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const valid = Boolean(validate(data));
    const errors = (validate.errors ?? []).map(
      (e) => `${e.instancePath || '/'} ${e.message ?? 'validation error'}`
    );
    return { valid, errors };
  } catch (err) {
    return {
      valid: false,
      errors: [err instanceof Error ? err.message : 'Invalid JSON or Schema.'],
    };
  }
}

export function evaluateJsonPath(
  jsonInput: string,
  expression: string
): { ok: true; output: string } | { ok: false; error: string } {
  try {
    const data = JSON.parse(jsonInput);
    const result = JSONPath({ path: expression, json: data });
    return { ok: true, output: JSON.stringify(result, null, 2) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Invalid JSON or JSONPath expression.',
    };
  }
}
