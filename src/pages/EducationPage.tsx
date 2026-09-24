import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db, EducationContent } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

const CATEGORIES = [
  { key: 'all', emoji: '📚', label: 'All' },
  { key: 'hygiene', emoji: '🧼', label: 'Hygiene' },
  { key: 'nutrition', emoji: '🥗', label: 'Nutrition' },
  { key: 'pregnancy', emoji: '🤰', label: 'Pregnancy' },
  { key: 'newborn', emoji: '🍼', label: 'Newborn' },
  { key: 'diabetes', emoji: '🩺', label: 'Diabetes' },
  { key: 'firstaid', emoji: '🩹', label: 'First Aid' },
  { key: 'vaccination', emoji: '💉', label: 'Vaccination' },
  { key: 'mental', emoji: '🧠', label: 'Mental Health' },
];

export default function EducationPage() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<EducationContent[]>([]);
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState<number | null>(null);

  useEffect(() => {
    const q = category === 'all' ? db.education : db.education.where('category').equals(category);
    q.toArray().then(setArticles);
  }, [category]);

  const speakText = (text: string, id: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.85;
      utterance.onend = () => setSpeaking(null);
      window.speechSynthesis.speak(utterance);
      setSpeaking(id);
    } else {
      alert('Text-to-speech not supported on this device.');
    }
  };

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setSpeaking(null); };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">📚 {t('education.title')}</h1>
          <DemoDataBadge />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${category === cat.key ? 'bg-sky-600 text-white shadow' : 'bg-gray-100 text-gray-600'}`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">📚</div>
            <p>No articles in this category yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map(article => (
              <div key={article.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === article.id ? null : article.id!)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <span className="text-2xl">{CATEGORIES.find(c => c.key === article.category)?.emoji || '📄'}</span>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{article.title}</div>
                    <div className="text-xs text-sky-600 capitalize mt-0.5">{article.category}</div>
                  </div>
                  <span className="text-gray-400">{expanded === article.id ? '▲' : '▼'}</span>
                </button>

                {expanded === article.id && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-line">{article.content}</p>
                    {article.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.map((tag, i) => (
                          <span key={i} className="bg-sky-50 text-sky-600 text-xs px-2 py-0.5 rounded-full border border-sky-200">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => speaking === article.id ? stopSpeaking() : speakText(article.content, article.id!)}
                        className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all ${speaking === article.id ? 'bg-red-500 text-white' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}`}
                      >
                        {speaking === article.id ? '⏹ Stop' : '🔊 ' + t('education.listen')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
