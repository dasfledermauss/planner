import { Sparkles, Music, Heart, Star, Flame, Coffee, Check, Lightbulb } from 'lucide-react';
import './StickersPanel.css';

export const STICKER_TEMPLATES = [
  {
    id: 'st-spend-time',
    category: 'prompts',
    stickerType: 'prompt',
    color: 'blue',
    prompt: 'HOJE VOU DEDICAR 30 MIN A:',
    text: 'organizar minhas finanças',
    bg: '#E7F0F8',
    textColor: '#2C4960',
  },
  {
    id: 'st-reward',
    category: 'prompts',
    stickerType: 'prompt',
    color: 'yellow',
    prompt: 'MINHA RECOMPENSA HOJE SERÁ:',
    text: 'caminhada ao pôr do sol',
    bg: '#FEF4DA',
    textColor: '#664B11',
  },
  {
    id: 'st-i-got-this',
    category: 'badges',
    stickerType: 'badge',
    variant: 'bubble',
    text: 'I GOT THIS. 💪',
    bg: '#334E68',
    textColor: '#FFFFFF',
  },
  {
    id: 'st-love-what-u-do',
    category: 'quotes',
    stickerType: 'quote',
    author: 'Lembrete do dia',
    text: 'Ame o que você faz e coloque seu coração nisso ✨',
    bg: '#FFF8E7',
    textColor: '#574116',
  },
  {
    id: 'st-right-path',
    category: 'quotes',
    stickerType: 'quote',
    author: '@anotetoself',
    text: 'Você está no caminho certo. Respire fundo e continue.',
    bg: '#243B53',
    textColor: '#F0F4F8',
  },
  {
    id: 'st-music-player',
    category: 'widgets',
    stickerType: 'player',
    title: 'Good Vibrations',
    artist: 'Beach Boys',
    duration: '3:35',
    bg: '#D9E2EC',
    textColor: '#102A43',
  },
  {
    id: 'st-priority',
    category: 'badges',
    stickerType: 'badge',
    variant: 'pill',
    text: '★ PRIORIDADE MÁXIMA',
    bg: '#FEEBC8',
    textColor: '#7B341E',
  },
  {
    id: 'st-focus',
    category: 'badges',
    stickerType: 'badge',
    variant: 'pill',
    text: '☕ FOCO TOTAL',
    bg: '#E2E8F0',
    textColor: '#1E293B',
  },
  {
    id: 'st-done',
    category: 'badges',
    stickerType: 'badge',
    variant: 'pill',
    text: '✔ FEITO COM SUCESSO',
    bg: '#DEF7EC',
    textColor: '#03543F',
  },
  {
    id: 'st-idea',
    category: 'badges',
    stickerType: 'badge',
    variant: 'pill',
    text: '✦ GRANDE IDEIA',
    bg: '#E9D8FD',
    textColor: '#44337A',
  },
];

export default function StickersPanel({ onAddSticker }) {
  return (
    <div className="stickers-panel">
      <div className="stickers-panel__intro">
        <span>Clique em um adesivo para colar na página do seu diário:</span>
      </div>

      {/* Prompts / Post-its */}
      <div className="stickers-section">
        <div className="stickers-section__title">Post-its Interativos</div>
        <div className="stickers-grid stickers-grid--cards">
          {STICKER_TEMPLATES.filter(s => s.category === 'prompts').map(st => (
            <div
              key={st.id}
              className="sticker-preview-card"
              style={{ background: st.bg, color: st.textColor }}
              onClick={() => onAddSticker && onAddSticker(st)}
              title="Colar no diário"
            >
              <div className="sticker-preview__prompt">{st.prompt}</div>
              <div className="sticker-preview__text"><u>{st.text}</u></div>
              <span className="sticker-preview__add-chip">+ Colar</span>
            </div>
          ))}
        </div>
      </div>

      {/* Frases & Lembretes */}
      <div className="stickers-section">
        <div className="stickers-section__title">Lembretes & Frases</div>
        <div className="stickers-grid stickers-grid--cards">
          {STICKER_TEMPLATES.filter(s => s.category === 'quotes').map(st => (
            <div
              key={st.id}
              className="sticker-preview-card sticker-preview-card--quote"
              style={{ background: st.bg, color: st.textColor }}
              onClick={() => onAddSticker && onAddSticker(st)}
              title="Colar no diário"
            >
              <div className="sticker-preview__author">✦ {st.author}</div>
              <div className="sticker-preview__quote-text">"{st.text}"</div>
              <span className="sticker-preview__add-chip">+ Colar</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges / Selos */}
      <div className="stickers-section">
        <div className="stickers-section__title">Selos & Badges</div>
        <div className="stickers-chips">
          {STICKER_TEMPLATES.filter(s => s.category === 'badges').map(st => (
            <button
              key={st.id}
              className="sticker-badge-chip"
              style={{ background: st.bg, color: st.textColor }}
              onClick={() => onAddSticker && onAddSticker(st)}
              title="Colar selo"
            >
              {st.text}
            </button>
          ))}
        </div>
      </div>

      {/* Widgets (Música) */}
      <div className="stickers-section">
        <div className="stickers-section__title">Mini Player de Música</div>
        {STICKER_TEMPLATES.filter(s => s.category === 'widgets').map(st => (
          <div
            key={st.id}
            className="sticker-player-preview"
            style={{ background: st.bg, color: st.textColor }}
            onClick={() => onAddSticker && onAddSticker(st)}
            title="Colar widget de música"
          >
            <div className="sticker-player__icon">
              <Music size={14} />
            </div>
            <div className="sticker-player__info">
              <span className="sticker-player__title">{st.title}</span>
              <span className="sticker-player__artist">{st.artist}</span>
            </div>
            <span className="sticker-preview__add-chip" style={{ marginLeft: 'auto' }}>+ Colar</span>
          </div>
        ))}
      </div>
    </div>
  );
}
