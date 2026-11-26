import { format as formatSqlQuery, type SqlLanguage } from 'sql-formatter';

export async function formatWithPrettier(
  code: string,
  parser: 'html' | 'css' | 'babel' | 'typescript',
  tabWidth = 2
): Promise<{ ok: true; output: string } | { ok: false; error: string }> {
  try {
    const prettier = await import('prettier/standalone');
    const plugins = [];

    if (parser === 'html') {
      plugins.push((await import('prettier/plugins/html')).default);
    } else if (parser === 'css') {
      plugins.push((await import('prettier/plugins/postcss')).default);
    } else if (parser === 'babel') {
      plugins.push((await import('prettier/plugins/babel')).default);
      plugins.push((await import('prettier/plugins/estree')).default);
    } else if (parser === 'typescript') {
      plugins.push((await import('prettier/plugins/typescript')).default);
      plugins.push((await import('prettier/plugins/estree')).default);
    }

    const formatted = await prettier.format(code, {
      parser,
      plugins,
      tabWidth,
      semi: true,
      singleQuote: true,
    });

    return { ok: true, output: formatted };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Formatting failed.',
    };
  }
}

export function formatSql(
  sql: string,
  language: SqlLanguage = 'postgresql',
  tabWidth = 2
): { ok: true; output: string } | { ok: false; error: string } {
  try {
    const output = formatSqlQuery(sql, {
      language,
      tabWidth,
      keywordCase: 'upper',
    });
    return { ok: true, output };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'SQL formatting failed.',
    };
  }
}
