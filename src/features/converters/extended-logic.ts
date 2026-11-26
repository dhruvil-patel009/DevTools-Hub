import yaml from 'js-yaml';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

export function jsonToYaml(
  input: string
): { ok: true; output: string } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, output: yaml.dump(parsed, { indent: 2, noRefs: true }) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid JSON input.' };
  }
}

export function yamlToJson(
  input: string
): { ok: true; output: string } | { ok: false; error: string } {
  try {
    // js-yaml v4 load() is safe by default (no arbitrary JS tag execution)
    const parsed = yaml.load(input, { schema: yaml.JSON_SCHEMA });
    return { ok: true, output: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid YAML input.' };
  }
}

export function jsonToXml(
  input: string
): { ok: true; output: string } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(input);
    const builder = new XMLBuilder({ format: true, indentBy: '  ', ignoreAttributes: false });
    const wrapped =
      typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? parsed
        : { root: parsed };
    return { ok: true, output: builder.build(wrapped) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid JSON input.' };
  }
}

export function xmlToJson(
  input: string
): { ok: true; output: string } | { ok: false; error: string } {
  // Explicitly reject DOCTYPE / ENTITY declarations to prevent XXE & Billion Laughs
  if (/<!DOCTYPE\b|<!ENTITY\b/i.test(input)) {
    return {
      ok: false,
      error: 'DOCTYPE and ENTITY declarations are disabled for XXE security.',
    };
  }
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      processEntities: false,
      allowBooleanAttributes: true,
    });
    const parsed = parser.parse(input);
    return { ok: true, output: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid XML input.' };
  }
}
