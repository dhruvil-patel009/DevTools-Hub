export interface RegexMatchItem {
  index: number;
  match: string;
  groups: string[];
}

export interface RegexWorkerRequest {
  id: number;
  pattern: string;
  flags: string;
  text: string;
}

export interface RegexWorkerResponse {
  id: number;
  ok: boolean;
  matches?: RegexMatchItem[];
  error?: string;
}

const MAX_MATCHES = 500;

self.onmessage = (event: MessageEvent<RegexWorkerRequest>) => {
  const { id, pattern, flags, text } = event.data;
  try {
    if (!pattern) {
      self.postMessage({ id, ok: true, matches: [] } satisfies RegexWorkerResponse);
      return;
    }

    const regex = new RegExp(pattern, flags);
    const matches: RegexMatchItem[] = [];

    if (regex.global) {
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          index: match.index,
          match: match[0],
          groups: match.slice(1).map((g) => g ?? ''),
        });
        if (match[0].length === 0) {
          regex.lastIndex += 1;
        }
        if (matches.length >= MAX_MATCHES) break;
      }
    } else {
      const match = regex.exec(text);
      if (match) {
        matches.push({
          index: match.index,
          match: match[0],
          groups: match.slice(1).map((g) => g ?? ''),
        });
      }
    }

    self.postMessage({ id, ok: true, matches } satisfies RegexWorkerResponse);
  } catch (err) {
    self.postMessage({
      id,
      ok: false,
      error: err instanceof Error ? err.message : 'Invalid regular expression.',
    } satisfies RegexWorkerResponse);
  }
};
