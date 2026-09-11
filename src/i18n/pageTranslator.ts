import { LanguageCode } from '../types';

const translatedNodes = new WeakMap<Text, string>();
const translationCache = new Map<string, string>();
let observer: MutationObserver | null = null;
let activeLanguage: LanguageCode = 'en';

const getTextNodes = (root: HTMLElement): Text[] => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'OPTION'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      const value = node.textContent?.trim() ?? '';
      return value.length > 1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes: Text[] = [];
  let node: Node | null = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }
  return nodes;
};

const restoreEnglish = (root: HTMLElement) => {
  getTextNodes(root).forEach((node) => {
    const original = translatedNodes.get(node);
    if (original) node.textContent = original;
  });
};

const translateBatch = async (texts: string[], language: LanguageCode): Promise<string[]> => {
  const uncached = texts.filter((text) => !translationCache.has(`${language}:${text}`));
  if (uncached.length) {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: uncached, language }),
    });
    if (!response.ok) throw new Error('Translation service unavailable');
    const payload = await response.json() as { translations?: string[] };
    (payload.translations ?? []).forEach((translation, index) => {
      translationCache.set(`${language}:${uncached[index]}`, translation);
    });
  }
  return texts.map((text) => translationCache.get(`${language}:${text}`) ?? text);
};

export const translatePage = async (language: LanguageCode, lowDataMode: boolean) => {
  activeLanguage = language;
  const root = document.getElementById('root');
  if (!root) return;

  observer?.disconnect();
  restoreEnglish(root);
  if (language === 'en' || lowDataMode) return;

  const nodes = getTextNodes(root);
  const originals = nodes.map((node) => node.textContent?.trim() ?? '');
  try {
    for (let index = 0; index < nodes.length; index += 40) {
      const batchNodes = nodes.slice(index, index + 40);
      const batchTexts = originals.slice(index, index + 40);
      const translations = await translateBatch(batchTexts, language);
      batchNodes.forEach((node, batchIndex) => {
        translatedNodes.set(node, batchTexts[batchIndex]);
        node.textContent = translations[batchIndex];
      });
    }
  } catch {
    restoreEnglish(root);
  }

  observer = new MutationObserver(() => {
    if (activeLanguage !== 'en') void translatePage(activeLanguage, lowDataMode);
  });
  observer.observe(root, { childList: true, subtree: true });
};
