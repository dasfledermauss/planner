import { useState } from 'react';
import { ExternalLink, Plus, Link2 } from 'lucide-react';

const INITIAL_LINKS = [
  { id: 1, emoji: '📝', title: 'Notion',   url: 'https://notion.so' },
  { emoji: '🎵', title: 'Spotify',  url: 'https://open.spotify.com' },
  { emoji: '🐙', title: 'GitHub',   url: 'https://github.com' },
  { emoji: '📺', title: 'YouTube',  url: 'https://youtube.com' },
  { emoji: '✉️', title: 'Gmail',    url: 'https://mail.google.com' },
  { emoji: '🗂️', title: 'Drive',   url: 'https://drive.google.com' },
];

export default function LinksContent() {
  const [links, setLinks] = useState(INITIAL_LINKS);

  const addLink = () => {
    const title = prompt('Nome do site:');
    if (!title) return;
    const url = prompt('URL:') || 'https://';
    const emoji = prompt('Emoji (ex: 🚀):') || '🔗';
    setLinks(prev => [...prev, { id: Date.now(), title, url, emoji }]);
  };

  return (
    <div className="links-widget">
      <div className="links-grid">
        {links.map(l => (
          <a
            key={l.title}
            href={l.url.startsWith('http') ? l.url : `https://${l.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-card-chip"
            title={`Abrir ${l.title}`}
          >
            <span className="link-card-chip__emoji">{l.emoji}</span>
            <div className="link-card-chip__texts">
              <span className="link-card-chip__title">{l.title}</span>
              <span className="link-card-chip__url">{l.url.replace(/^https?:\/\//, '')}</span>
            </div>
            <ExternalLink size={11} className="link-card-chip__arrow" />
          </a>
        ))}
      </div>

      <button className="link-add-btn" onClick={addLink}>
        <Plus size={12} />
        <span>Adicionar link</span>
      </button>
    </div>
  );
}
