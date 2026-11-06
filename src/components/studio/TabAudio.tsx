import React, { useEffect, useState } from 'react';
import {
  Bell,
  BookOpen,
  Drum,
  Gift,
  MessageSquareQuote,
  Music,
  Plus,
  Repeat,
  RotateCcw,
  SkipForward,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AnswerRevealSfxPreset,
  BgmTrackItem,
  ClassroomGiftEventId,
  DharmaArticleItem,
  GameConfig,
  TTSEngineType,
} from '../../types/game';
import { CLASSROOM_GIFT_EVENTS_META } from '../../config/constants';
import { soundEngine } from '../../services/soundEngine';

interface TabAudioProps {
  config: GameConfig;
  ttsStatus: { text: string; active: boolean };
  eventTtsQueue?: {
    waitingCount: number;
    isPlayingEvent: boolean;
    currentEventText: string | null;
    queueItems: string[];
  };
  onClearEventTtsQueue?: () => void;
  onUpdateConfig: (patch: Partial<GameConfig>) => void;
  onSpeakHostLiveText: (
    text: string,
    options?: {
      interrupt?: boolean;
      speakerRole?: 'abbot' | 'senior_novice' | 'junior_novice' | 'none';
    }
  ) => void;
  onPlayBell: () => void;
  onPlayWoodenFish: () => void;
  onPanicMute: () => void;
  onTestTTS: () => void;
  onNextDharmaArticle: () => void;
}

export const TabAudio: React.FC<TabAudioProps> = ({
  config,
  ttsStatus,
  eventTtsQueue,
  onClearEventTtsQueue,
  onUpdateConfig,
  onSpeakHostLiveText,
  onPlayBell,
  onPlayWoodenFish,
  onPanicMute,
  onTestTTS,
  onNextDharmaArticle,
}) => {
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);

  const scanVoices = () => {
    if (!('speechSynthesis' in window)) return;
    const list = window.speechSynthesis.getVoices() || [];
    const sorted = [...list].sort((a, b) => {
      const aVi = a.lang.toLowerCase().includes('vi') ? 1 : 0;
      const bVi = b.lang.toLowerCase().includes('vi') ? 1 : 0;
      return bVi - aVi;
    });
    setSystemVoices(sorted);
  };

  useEffect(() => {
    scanVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = scanVoices;
    }
  }, []);

  const bgmTracks = config.bgmTracks || [];
  const activeBgmTrack =
    bgmTracks.find((t) => t.id === config.activeBgmTrackId) || bgmTracks[0];

  const handleUploadBgmMp3 = (file: File) => {
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newTrack: BgmTrackItem = {
          id: `bgm-custom-${Date.now()}`,
          title: cleanName || 'Nhạc Thiền MP3 Mới',
          url: reader.result,
        };
        const nextTracks = [...bgmTracks, newTrack];
        onUpdateConfig({
          bgmTracks: nextTracks,
          activeBgmTrackId: newTrack.id,
          bgmEnabled: true,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRenameActiveBgm = (newTitle: string) => {
    if (!activeBgmTrack) return;
    const nextTracks = bgmTracks.map((t) =>
      t.id === activeBgmTrack.id ? { ...t, title: newTitle } : t
    );
    onUpdateConfig({ bgmTracks: nextTracks });
  };

  const handleDeleteActiveBgm = () => {
    if (!activeBgmTrack || bgmTracks.length <= 1) return;
    const nextTracks = bgmTracks.filter((t) => t.id !== activeBgmTrack.id);
    onUpdateConfig({
      bgmTracks: nextTracks,
      activeBgmTrackId: nextTracks[0].id,
    });
  };

  const dharmaArticles = config.dharmaArticles || [];
  const activeDharma =
    dharmaArticles.find((a) => a.id === config.activeDharmaId) ||
    dharmaArticles[0];

  const handleUpdateActiveDharma = (patch: Partial<DharmaArticleItem>) => {
    if (!activeDharma) return;
    const nextList = dharmaArticles.map((item) =>
      item.id === activeDharma.id ? { ...item, ...patch } : item
    );
    onUpdateConfig({ dharmaArticles: nextList });
  };

  const handleAddDharmaArticle = () => {
    const idx = dharmaArticles.length + 1;
    const newItem: DharmaArticleItem = {
      id: `dharma-${Date.now()}`,
      title: `Bài ${idx}: Ôn Tập & Đố Vui Mới`,
      content:
        'Chào mừng các em đến với tiết sinh hoạt lớp 12A1. Chúc cả lớp học tập chăm chỉ, đạt nhiều Hoa Điểm 10 và đỗ Nguyện vọng 1 đại học mơ ước.',
    };
    onUpdateConfig({
      dharmaArticles: [...dharmaArticles, newItem],
      activeDharmaId: newItem.id,
    });
  };

  const handleDeleteActiveDharma = () => {
    if (!activeDharma || dharmaArticles.length <= 1) return;
    const nextList = dharmaArticles.filter((a) => a.id !== activeDharma.id);
    onUpdateConfig({
      dharmaArticles: nextList,
      activeDharmaId: nextList[0].id,
    });
  };

  const isAutoNext = config.dharmaAutoNext ?? true;
  const waitingCount = eventTtsQueue?.waitingCount ?? 0;
  const isPlayingEvent = eventTtsQueue?.isPlayingEvent ?? false;
  const currentEventText = eventTtsQueue?.currentEventText ?? null;
  const queueItems = eventTtsQueue?.queueItems ?? [];

  return (
    <div className="space-y-3.5">
      {/* 1. HÀNG CHỜ ÂM THANH SỰ KIỆN */}
      <section className="p-3 rounded-xl bg-stone-900/85 border border-amber-500/40 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-xs font-bold text-amber-200">
              Hàng Chờ Đọc Sự Kiện ({waitingCount}/{config.maxTtsQueueSize ?? 30})
            </h2>
          </div>

          {waitingCount > 0 && onClearEventTtsQueue && (
            <button
              type="button"
              onClick={onClearEventTtsQueue}
              className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-[10px] font-bold text-rose-200 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Xóa chờ ({waitingCount})</span>
            </button>
          )}
        </div>

        {/* Bộ đếm */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-1.5 rounded-lg bg-stone-950/90 border border-amber-500/30 text-center">
            <div className="text-[10px] text-stone-400">Chờ đọc</div>
            <div
              className={`text-base font-extrabold font-mono ${
                waitingCount > 0 ? 'text-amber-300' : 'text-stone-400'
              }`}
            >
              {waitingCount}
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-stone-950/90 border border-emerald-500/30 text-center">
            <div className="text-[10px] text-stone-400">Đang phát</div>
            <div
              className={`text-base font-extrabold font-mono ${
                isPlayingEvent ? 'text-emerald-400' : 'text-stone-400'
              }`}
            >
              {isPlayingEvent ? 1 : 0}
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-stone-950/90 border border-sky-500/30 text-center">
            <div className="text-[10px] text-stone-400">Tổng sự kiện</div>
            <div
              className={`text-base font-extrabold font-mono ${
                waitingCount + (isPlayingEvent ? 1 : 0) > 0
                  ? 'text-sky-300'
                  : 'text-stone-400'
              }`}
            >
              {waitingCount + (isPlayingEvent ? 1 : 0)}
            </div>
          </div>
        </div>

        {/* Chi tiết câu đang đọc & danh sách chờ */}
        {(isPlayingEvent || waitingCount > 0) && (
          <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1.5">
            {isPlayingEvent && currentEventText && (
              <div className="flex items-start gap-1.5 text-[10.5px]">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[9.5px] shrink-0">
                  ĐANG ĐỌC
                </span>
                <span className="text-emerald-200 line-clamp-2">
                  “{currentEventText}”
                </span>
              </div>
            )}

            {queueItems.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {queueItems.slice(0, 8).map((item, idx) => (
                  <div
                    key={`${idx}-${item.slice(0, 16)}`}
                    className="text-[10px] text-stone-300 bg-stone-900/90 border border-stone-800/80 rounded px-2 py-1 truncate"
                  >
                    <span className="text-amber-400 font-bold mr-1">
                      #{idx + 1}:
                    </span>
                    {item}
                  </div>
                ))}
                {queueItems.length > 8 && (
                  <div className="text-[9.5px] text-stone-500 italic pl-1">
                    ... +{queueItems.length - 8} câu đang chờ
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Giới hạn hàng chờ (đạt giới hạn tự xóa làm mới) & Giới hạn số chữ mỗi câu */}
        <div className="grid grid-cols-1 gap-2">
          <div className="p-2 rounded-lg bg-stone-950/90 border border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-cyan-200">
                🔄 Giới hạn hàng chờ (Đạt mốc tự xóa làm mới)
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={200}
                  step={1}
                  value={config.maxTtsQueueSize ?? 30}
                  onChange={(e) =>
                    onUpdateConfig({
                      maxTtsQueueSize: Math.max(
                        1,
                        Math.min(200, parseInt(e.target.value, 10) || 30)
                      ),
                    })
                  }
                  className="w-12 px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700 text-xs font-mono font-bold text-cyan-300 text-right"
                />
                <span className="text-[10.5px] font-mono text-cyan-300">câu</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[10, 20, 30, 50].map((limit) => (
                <button
                  key={limit}
                  type="button"
                  onClick={() => onUpdateConfig({ maxTtsQueueSize: limit })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
                    (config.maxTtsQueueSize ?? 30) === limit
                      ? 'bg-cyan-400 text-stone-950 font-bold'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  {limit}
                </button>
              ))}
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={Math.min(100, Math.max(5, config.maxTtsQueueSize ?? 30))}
                onChange={(e) =>
                  onUpdateConfig({
                    maxTtsQueueSize: Math.max(1, parseInt(e.target.value, 10) || 30),
                  })
                }
                className="flex-1 accent-cyan-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="p-2 rounded-lg bg-stone-950/90 border border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-amber-200">
                ✂️ Số chữ tối đa mỗi câu đọc
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={5}
                  max={60}
                  step={1}
                  value={config.maxTtsWords ?? 25}
                  onChange={(e) =>
                    onUpdateConfig({
                      maxTtsWords: Math.max(
                        5,
                        Math.min(60, parseInt(e.target.value, 10) || 25)
                      ),
                    })
                  }
                  className="w-12 px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700 text-xs font-mono font-bold text-amber-300 text-right"
                />
                <span className="text-[10.5px] font-mono text-amber-300">chữ</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[12, 18, 25, 35, 50].map((words) => (
                <button
                  key={words}
                  type="button"
                  onClick={() => onUpdateConfig({ maxTtsWords: words })}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
                    (config.maxTtsWords ?? 25) === words
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  {words}
                </button>
              ))}
              <input
                type="range"
                min={5}
                max={60}
                step={1}
                value={Math.min(60, Math.max(5, config.maxTtsWords ?? 25))}
                onChange={(e) =>
                  onUpdateConfig({
                    maxTtsWords: Math.max(5, parseInt(e.target.value, 10) || 25),
                  })
                }
                className="flex-1 accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. NHẠC NỀN, TRỐNG TRƯỜNG, GÕ THƯỚC & CÔ GIÁO */}
      <section className="p-3 rounded-xl bg-stone-900/85 border border-stone-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-amber-300">
              Nhạc Nền, Trống Trường & Thước Gỗ
            </h2>
            <span className="text-[10.5px] text-stone-400">
              ({ttsStatus.text})
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onTestTTS}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[11px] font-semibold text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3 h-3" />
              <span>Đọc thử</span>
            </button>
            <button
              type="button"
              onClick={onPanicMute}
              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer"
            >
              <VolumeX className="w-3 h-3" />
              <span>Ngắt đọc</span>
            </button>
          </div>
        </div>

        {/* Nhạc nền */}
        <div className="p-2 rounded-lg bg-stone-950/90 border border-stone-800 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-stone-100">Nhạc nền</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-amber-300 flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>+ MP3</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadBgmMp3(f);
                  }}
                />
              </label>
              <label className="flex items-center gap-1 text-xs font-bold text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bgmEnabled}
                  onChange={(e) =>
                    onUpdateConfig({ bgmEnabled: e.target.checked })
                  }
                  className="accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span>{config.bgmEnabled ? 'Bật' : 'Tắt'}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1.5 items-center">
            <select
              value={activeBgmTrack?.id || ''}
              onChange={(e) =>
                onUpdateConfig({ activeBgmTrackId: e.target.value })
              }
              className="col-span-6 px-2 py-1 rounded bg-stone-900 border border-stone-800 text-[11px] text-stone-200 focus:outline-none"
            >
              {bgmTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} {t.url ? '(MP3)' : ''}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={activeBgmTrack?.title || ''}
              onChange={(e) => handleRenameActiveBgm(e.target.value)}
              placeholder="Tên bài nhạc..."
              className="col-span-5 px-2 py-1 rounded bg-stone-900 border border-stone-800 text-[11px] text-amber-200 focus:outline-none"
            />

            <button
              type="button"
              onClick={handleDeleteActiveBgm}
              disabled={bgmTracks.length <= 1}
              className="col-span-1 h-7 rounded bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-300 disabled:opacity-30 flex items-center justify-center cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10.5px] text-stone-400">
            <span className="shrink-0">Âm lượng:</span>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={config.bgmVolume ?? 0.4}
              onChange={(e) =>
                onUpdateConfig({ bgmVolume: parseFloat(e.target.value) })
              }
              className="flex-1 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-stone-200 w-9 text-right">
              {Math.round((config.bgmVolume ?? 0.4) * 100)}%
            </span>
          </div>
        </div>

        {/* Tiếng trống trường */}
        <div className="p-2 rounded-lg bg-stone-950/90 border border-stone-800 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-stone-100">Trống trường</span>
              <span className="text-[10px] text-amber-300 truncate">
                ({config.bellMp3Title || 'Mặc định'})
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onPlayBell}
                className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-[10px] font-semibold text-amber-200 cursor-pointer"
              >
                Thử
              </button>
              <label className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-amber-300 flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>MP3</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          onUpdateConfig({
                            bellMp3Url: reader.result,
                            bellMp3Title: f.name,
                          });
                        }
                      };
                      reader.readAsDataURL(f);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              {config.bellMp3Url && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({
                      bellMp3Url: null,
                      bellMp3Title: 'Mặc định',
                    })
                  }
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
              <label className="flex items-center gap-1 text-xs font-bold text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bellEnabled}
                  onChange={(e) =>
                    onUpdateConfig({ bellEnabled: e.target.checked })
                  }
                  className="accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span>{config.bellEnabled ? 'Bật' : 'Tắt'}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] text-stone-300">
            <span>Chu kỳ gõ tự động:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min={2}
                max={180}
                step={1}
                value={config.bellIntervalSec || 25}
                onChange={(e) =>
                  onUpdateConfig({
                    bellIntervalSec: Math.max(
                      2,
                      parseInt(e.target.value, 10) || 25
                    ),
                  })
                }
                className="w-24 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min={2}
                max={600}
                value={config.bellIntervalSec || 25}
                onChange={(e) =>
                  onUpdateConfig({
                    bellIntervalSec: Math.max(
                      2,
                      parseInt(e.target.value, 10) || 25
                    ),
                  })
                }
                className="w-12 px-1 py-0.5 rounded bg-stone-900 border border-stone-800 text-center font-mono text-amber-300 text-[11px]"
              />
              <span className="text-[10px] text-stone-400">s</span>
            </div>
          </div>
        </div>

        {/* Tiếng gõ thước gỗ */}
        <div className="p-2 rounded-lg bg-stone-950/90 border border-stone-800 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Drum className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-stone-100">Thước gỗ</span>
              <span className="text-[10px] text-amber-300 truncate">
                ({config.woodenFishMp3Title || 'Mặc định'})
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onPlayWoodenFish}
                className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-[10px] font-semibold text-amber-200 cursor-pointer"
              >
                Thử
              </button>
              <label className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-amber-300 flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>MP3</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          onUpdateConfig({
                            woodenFishMp3Url: reader.result,
                            woodenFishMp3Title: f.name,
                          });
                        }
                      };
                      reader.readAsDataURL(f);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              {config.woodenFishMp3Url && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({
                      woodenFishMp3Url: null,
                      woodenFishMp3Title: 'Mặc định',
                    })
                  }
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
              <label className="flex items-center gap-1 text-xs font-bold text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.woodenFishEnabled}
                  onChange={(e) =>
                    onUpdateConfig({ woodenFishEnabled: e.target.checked })
                  }
                  className="accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span>{config.woodenFishEnabled ? 'Bật' : 'Tắt'}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] text-stone-300">
            <span>Chu kỳ gõ tự động:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min={0.5}
                max={30}
                step={0.5}
                value={config.woodenFishIntervalSec || 3}
                onChange={(e) =>
                  onUpdateConfig({
                    woodenFishIntervalSec: Math.max(
                      0.5,
                      parseFloat(e.target.value) || 3
                    ),
                  })
                }
                className="w-24 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min={0.5}
                max={120}
                step={0.5}
                value={config.woodenFishIntervalSec || 3}
                onChange={(e) =>
                  onUpdateConfig({
                    woodenFishIntervalSec: Math.max(
                      0.5,
                      parseFloat(e.target.value) || 3
                    ),
                  })
                }
                className="w-12 px-1 py-0.5 rounded bg-stone-900 border border-stone-800 text-center font-mono text-amber-300 text-[11px]"
              />
              <span className="text-[10px] text-stone-400">s</span>
            </div>
          </div>
        </div>

        {/* Âm thanh hiển thị câu trả lời 2s ("Đáp án là:") */}
        <div className="p-2 rounded-lg bg-stone-950/90 border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-emerald-200">
                Âm Thanh Câu Trả Lời (2s Đáp Án)
              </span>
              {config.answerRevealMp3Url && (
                <span className="text-[10px] text-amber-300 truncate max-w-[110px]">
                  ({config.answerRevealMp3Title || 'File MP3'})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  soundEngine.playAnswerRevealSfx(
                    config.ttsVolume || 1,
                    config.answerRevealSfxPreset || 'chime_sparkle',
                    config.answerRevealMp3Url,
                    true
                  )
                }
                className="px-2 py-0.5 rounded bg-emerald-600/35 hover:bg-emerald-500/45 border border-emerald-400/60 text-[10px] font-bold text-emerald-200 cursor-pointer"
              >
                Thử
              </button>
              <label className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-amber-300 flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>Upload MP3</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          onUpdateConfig({
                            answerRevealMp3Url: reader.result,
                            answerRevealMp3Title: f.name,
                            answerRevealSfxEnabled: true,
                          });
                          soundEngine.playAnswerRevealSfx(
                            config.ttsVolume || 1,
                            config.answerRevealSfxPreset || 'chime_sparkle',
                            reader.result,
                            true
                          );
                        }
                      };
                      reader.readAsDataURL(f);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              {config.answerRevealMp3Url && (
                <button
                  type="button"
                  title="Quay về dùng 3 hiệu ứng có sẵn"
                  onClick={() =>
                    onUpdateConfig({
                      answerRevealMp3Url: null,
                      answerRevealMp3Title: 'Hiệu ứng mặc định',
                    })
                  }
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
              <label className="flex items-center gap-1 text-xs font-bold text-emerald-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.answerRevealSfxEnabled !== false}
                  onChange={(e) =>
                    onUpdateConfig({ answerRevealSfxEnabled: e.target.checked })
                  }
                  className="accent-emerald-500 w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span>
                  {config.answerRevealSfxEnabled !== false ? 'Bật' : 'Tắt'}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10.5px] text-stone-400 flex items-center justify-between">
              <span>Chọn 1 trong 3 hiệu ứng thiết kế sẵn:</span>
              {config.answerRevealMp3Url && (
                <span className="text-[9.5px] text-amber-300">
                  Đang ưu tiên phát file MP3 đã tải lên
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  {
                    id: 'chime_sparkle' as AnswerRevealSfxPreset,
                    label: '1. Chuông Sao ✨',
                  },
                  {
                    id: 'victory_fanfare' as AnswerRevealSfxPreset,
                    label: '2. Kèn Chiến Thắng 🎺',
                  },
                  {
                    id: 'retro_levelup' as AnswerRevealSfxPreset,
                    label: '3. Pixel Level-Up 🎮',
                  },
                ] as const
              ).map((item) => {
                const isSelected =
                  !config.answerRevealMp3Url &&
                  (config.answerRevealSfxPreset || 'chime_sparkle') === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onUpdateConfig({
                        answerRevealSfxPreset: item.id,
                        answerRevealMp3Url: null,
                        answerRevealSfxEnabled: true,
                      });
                      soundEngine.playAnswerRevealSfx(
                        config.ttsVolume || 1,
                        item.id,
                        null,
                        true
                      );
                    }}
                    className={`px-2 py-1.5 rounded-lg border text-[10.5px] font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Âm thanh Zombie gầm gừ (Sự kiện Zombie tấn công - Luồng 2) */}
        <div className="p-2 rounded-lg bg-stone-950/90 border border-lime-500/40 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-lime-400 shrink-0" />
              <span className="text-xs font-bold text-lime-300">
                🧟 Âm Thanh Zombie Gầm Gừ (Event Luồng 2)
              </span>
              <span className="text-[10px] text-amber-300 truncate max-w-[120px]">
                ({config.zombieGrowlMp3Title || 'Mặc định'})
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => soundEngine.playZombieGrowlSfx(config, true)}
                className="px-2 py-0.5 rounded bg-lime-600/30 hover:bg-lime-500/45 border border-lime-400/50 text-[10px] font-bold text-lime-200 cursor-pointer"
              >
                Thử
              </button>
              <label className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-amber-300 flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>Upload MP3</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          const nextCfg: GameConfig = {
                            ...config,
                            zombieGrowlMp3Url: reader.result,
                            zombieGrowlMp3Title: f.name,
                          };
                          onUpdateConfig({
                            zombieGrowlMp3Url: reader.result,
                            zombieGrowlMp3Title: f.name,
                          });
                          soundEngine.playZombieGrowlSfx(nextCfg, true);
                        }
                      };
                      reader.readAsDataURL(f);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              {config.zombieGrowlMp3Url && (
                <button
                  type="button"
                  title="Khôi phục tiếng Zombie mặc định"
                  onClick={() =>
                    onUpdateConfig({
                      zombieGrowlMp3Url: null,
                      zombieGrowlMp3Title: 'Mặc định',
                    })
                  }
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bong bóng chat cảm ơn quà của Cô Giáo & Thầy Giám Thị */}
        <label className="p-2 rounded-lg bg-pink-950/30 border border-pink-400/40 flex items-center justify-between gap-2 cursor-pointer">
          <span className="text-xs font-bold text-pink-200 flex items-center gap-1.5">
            <MessageSquareQuote className="w-3.5 h-3.5 text-pink-400" />
            <span>
              Chatbox Phản Ứng Khi Nhận Quà ("Cảm ơn bạn A nhé /-heart")
            </span>
          </span>
          <input
            type="checkbox"
            checked={config.abbotBubbleEnabled}
            onChange={(e) =>
              onUpdateConfig({ abbotBubbleEnabled: e.target.checked })
            }
            className="accent-pink-400 w-4 h-4 rounded shrink-0 cursor-pointer"
          />
        </label>
      </section>

      {/* 2B. ÂM THANH 7 MÓN QUÀ SỰ KIỆN LỚP HỌC (NGHE THỬ & CHÈN FILE MP3) */}
      <section className="p-3 rounded-xl bg-stone-900/90 border border-pink-500/40 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Gift className="w-4 h-4 text-pink-400 shrink-0" />
            <h2 className="text-xs font-extrabold text-pink-200 truncate">
              Âm Thanh 7 Món Quà Sự Kiện (Play Sound & Chèn MP3)
            </h2>
          </div>

          <label className="flex items-center gap-1 text-xs font-bold text-pink-300 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.giftSoundEnabled !== false}
              onChange={(e) =>
                onUpdateConfig({ giftSoundEnabled: e.target.checked })
              }
              className="accent-pink-500 w-3.5 h-3.5 rounded cursor-pointer"
            />
            <span>{config.giftSoundEnabled !== false ? 'Đang Bật' : 'Đã Tắt'}</span>
          </label>
        </div>

        <div className="space-y-1.5">
          {CLASSROOM_GIFT_EVENTS_META.map((giftMeta) => {
            const giftId: ClassroomGiftEventId = giftMeta.id;
            const customUrl = config.giftSoundMp3Urls?.[giftId] || null;
            const customTitle =
              config.giftSoundMp3Titles?.[giftId] || 'Sound mặc định';

            return (
              <div
                key={giftId}
                className="p-2 rounded-lg bg-stone-950/90 border border-stone-800 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-200 truncate">
                      {giftMeta.giftLabel}: {giftMeta.actionTitle}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/40 text-[9.5px] font-mono font-bold text-emerald-300 shrink-0">
                      +{giftMeta.bonusPoints}đ
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    Audio:{' '}
                    <span
                      className={
                        customUrl
                          ? 'text-pink-300 font-semibold'
                          : 'text-stone-400'
                      }
                    >
                      {customUrl ? `MP3: ${customTitle}` : 'Mặc định (Synth hợp lý)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      soundEngine.playGiftEventSound(giftId, config, true)
                    }
                    className="px-2 py-1 rounded bg-pink-600/30 hover:bg-pink-500/45 border border-pink-400/50 text-[10px] font-bold text-pink-200 cursor-pointer transition"
                  >
                    Nghe thử
                  </button>

                  <label className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-amber-300 flex items-center gap-1 cursor-pointer transition">
                    <Upload className="w-3 h-3" />
                    <span>MP3</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              const nextUrls = {
                                ...(config.giftSoundMp3Urls || {}),
                                [giftId]: reader.result,
                              };
                              const nextTitles = {
                                ...(config.giftSoundMp3Titles || {}),
                                [giftId]: f.name,
                              };
                              const nextConfig: GameConfig = {
                                ...config,
                                giftSoundEnabled: true,
                                giftSoundMp3Urls: nextUrls,
                                giftSoundMp3Titles: nextTitles,
                              };
                              onUpdateConfig({
                                giftSoundEnabled: true,
                                giftSoundMp3Urls: nextUrls,
                                giftSoundMp3Titles: nextTitles,
                              });
                              soundEngine.playGiftEventSound(
                                giftId,
                                nextConfig,
                                true
                              );
                            }
                          };
                          reader.readAsDataURL(f);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>

                  {customUrl && (
                    <button
                      type="button"
                      title="Khôi phục sound mặc định"
                      onClick={() => {
                        const nextUrls = { ...(config.giftSoundMp3Urls || {}) };
                        const nextTitles = {
                          ...(config.giftSoundMp3Titles || {}),
                        };
                        delete nextUrls[giftId];
                        delete nextTitles[giftId];
                        onUpdateConfig({
                          giftSoundMp3Urls: nextUrls,
                          giftSoundMp3Titles: nextTitles,
                        });
                      }}
                      className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ENGINE TIẾT HỌC TIẾNG ANH (ĐIỀU CHỈNH NỘI DUNG / FORMAT CÂU NÓI & THỜI GIAN CÁC LUỒNG GIỌNG ĐỌC CỦA CÔ GIÁO) */}
      <section className="p-3 rounded-xl bg-stone-900/90 border border-emerald-500/40 space-y-2.5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-stone-800">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <h2 className="text-xs font-extrabold text-emerald-300">
              Engine Tiết Học Tiếng Anh
            </h2>
          </div>
          <span className="text-[10px] text-amber-300 font-mono bg-stone-950 px-2 py-0.5 rounded border border-amber-500/30">
            Đồng bộ giọng đọc Cô Giáo (Luồng 0 → 6)
          </span>
        </div>

        {/* LUỒNG 0: BẮT ĐẦU CHẠY TIẾT HỌC */}
        <div className="p-2.5 rounded-lg bg-stone-950/90 border border-amber-500/35 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono font-black text-[10px]">
                Luồng 0
              </span>
              <span className="text-[11px] font-bold text-amber-200">
                Bắt đầu chạy tiết học (Chỉ nói 1 lần khi bắt đầu)
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                soundEngine.enqueueLessonFlowItems(
                  [
                    {
                      text:
                        config.lessonStartTtsText ||
                        'Chào mừng các em đến với tiết Tiếng Anh lớp 12A1! Các em hãy chú ý lên bảng và bình luận đáp án thật nhanh để giành ghế ngồi trong lớp nhé!',
                      lang: 'vi',
                    },
                  ],
                  config
                )
              }
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-amber-300 cursor-pointer shrink-0"
            >
              Nghe thử
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-stone-400">
              Nội dung câu nói & hiển thị chữ lớn trên bảng (Edit được):
            </div>
            <textarea
              rows={2}
              value={
                config.lessonStartTtsText ??
                'Chào mừng các em đến với tiết Tiếng Anh lớp 12A1! Các em hãy chú ý lên bảng và bình luận đáp án thật nhanh để giành ghế ngồi trong lớp nhé!'
              }
              onChange={(e) =>
                onUpdateConfig({ lessonStartTtsText: e.target.value })
              }
              className="w-full px-2 py-1.5 rounded bg-stone-900 border border-stone-700 text-[11px] text-stone-100 focus:outline-none focus:border-amber-400 resize-y"
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] bg-stone-900/70 px-2 py-1 rounded border border-stone-800/80">
            <span className="text-stone-400">Thời gian luồng:</span>
            <span className="font-mono font-bold text-emerald-300">
              🔒 Tự động: Nói xong chuyển sang Luồng 1
            </span>
          </div>
        </div>

        {/* LUỒNG 1: ĐỌC "CHUẨN BỊ" */}
        <div className="p-2.5 rounded-lg bg-stone-950/90 border border-emerald-500/35 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono font-black text-[10px]">
                Luồng 1
              </span>
              <span className="text-[11px] font-bold text-emerald-200">
                Đọc "Chuẩn bị" (Bảng Chuẩn Bị)
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                soundEngine.enqueueLessonFlowItems(
                  [
                    {
                      text: config.lessonPrepareTtsText || 'Chuẩn bị',
                      lang: 'vi',
                    },
                  ],
                  config
                )
              }
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-emerald-300 cursor-pointer shrink-0"
            >
              Nghe thử
            </button>
          </div>

          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-8 space-y-1">
              <div className="text-[10px] text-stone-400">
                Nội dung câu nói (Edit được):
              </div>
              <input
                type="text"
                value={config.lessonPrepareTtsText ?? 'Chuẩn bị'}
                onChange={(e) =>
                  onUpdateConfig({ lessonPrepareTtsText: e.target.value })
                }
                className="w-full px-2 py-1 rounded bg-stone-900 border border-stone-700 text-[11px] text-stone-100 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="col-span-4 space-y-1">
              <div className="text-[10px] text-stone-400">
                Thời gian (Mặc định 3s):
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={config.lessonPrepareDurationSec ?? 3}
                  onChange={(e) =>
                    onUpdateConfig({
                      lessonPrepareDurationSec: Math.max(
                        1,
                        Math.min(15, Number(e.target.value) || 3)
                      ),
                    })
                  }
                  className="w-full px-2 py-1 rounded bg-stone-900 border border-emerald-500/50 text-center font-mono font-bold text-[11px] text-emerald-300 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 shrink-0">giây</span>
              </div>
            </div>
          </div>
        </div>

        {/* LUỒNG 2: ĐỌC CÂU HỎI */}
        <div className="p-2.5 rounded-lg bg-stone-950/90 border border-sky-500/35 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-400/50 text-sky-300 font-mono font-black text-[10px]">
                Luồng 2
              </span>
              <span className="text-[11px] font-bold text-sky-200">
                Đọc câu hỏi (Bảng Câu Hỏi)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[10.5px] font-semibold text-emerald-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hudLayout.classBoardTtsReadQuestion ?? true}
                  onChange={(e) =>
                    onUpdateConfig({
                      hudLayout: {
                        ...config.hudLayout,
                        classBoardTtsReadQuestion: e.target.checked,
                      },
                    })
                  }
                  className="accent-emerald-500 w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span>Bật đọc</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  const preview = (
                    config.lessonQuestionTtsTemplate ||
                    'Câu hỏi số [SốCâu]: [NghĩaViệt] tiếng Anh là gì, gồm [SốChữ] chữ cái?'
                  )
                    .replace(/\[SốCâu\]|\{index\}/gi, '1')
                    .replace(/\[NghĩaViệt\]|\{vi\}/gi, 'Con mèo')
                    .replace(/\[SốChữ\]|\{len\}/gi, '3')
                    .replace(/\[ĐápÁn\]|\{en\}/gi, 'CAT');
                  soundEngine.enqueueLessonFlowItems(
                    [{ text: preview, lang: 'vi' }],
                    config
                  );
                }}
                className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-sky-300 cursor-pointer shrink-0"
              >
                Nghe thử
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-stone-400">
              <span>Format câu nói (Edit được):</span>
              <span className="font-mono text-[9.5px] text-sky-300">
                Biến: [SốCâu], [NghĩaViệt], [SốChữ]
              </span>
            </div>
            <input
              type="text"
              value={
                config.lessonQuestionTtsTemplate ??
                'Câu hỏi số [SốCâu]: [NghĩaViệt] tiếng Anh là gì, gồm [SốChữ] chữ cái?'
              }
              onChange={(e) =>
                onUpdateConfig({ lessonQuestionTtsTemplate: e.target.value })
              }
              className="w-full px-2 py-1 rounded bg-stone-900 border border-stone-700 text-[11px] text-stone-100 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] bg-stone-900/70 px-2 py-1 rounded border border-stone-800/80">
            <span className="text-stone-400">Thời gian luồng:</span>
            <span className="font-mono font-bold text-amber-300">
              🔒 Tính chung thời gian với Luồng 3 ({config.hudLayout.classBoardQuestionDurationSec || 12}s)
            </span>
          </div>
        </div>

        {/* LUỒNG 3: ĐỢI TRẢ LỜI / GỢI Ý */}
        <div className="p-2.5 rounded-lg bg-stone-950/90 border border-amber-500/35 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono font-black text-[10px]">
                Luồng 3
              </span>
              <span className="text-[11px] font-bold text-amber-200">
                Đợi trả lời / Gợi ý (Duy trì Bảng Câu Hỏi)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] bg-stone-900/70 px-2 py-1 rounded border border-stone-800/80">
            <span className="text-stone-400">Nội dung câu nói:</span>
            <span className="font-mono text-stone-400">
              🔒 Không phát lời cố định (Đợi học sinh trả lời & mở chữ gợi ý)
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[10.5px] text-amber-200 font-semibold">
              Thời gian Luồng 2 & 3 tính chung (Edit được - Mặc định 12s):
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={5}
                max={90}
                value={config.hudLayout.classBoardQuestionDurationSec || 12}
                onChange={(e) =>
                  onUpdateConfig({
                    hudLayout: {
                      ...config.hudLayout,
                      classBoardQuestionDurationSec: Math.max(
                        5,
                        Math.min(90, Number(e.target.value) || 12)
                      ),
                    },
                  })
                }
                className="w-16 px-2 py-1 rounded bg-stone-900 border border-amber-500/50 text-center font-mono font-bold text-[11px] text-amber-300 focus:outline-none"
              />
              <span className="text-[10px] text-stone-400">giây</span>
            </div>
          </div>
        </div>

        {/* LUỒNG 4: ĐỌC CÂU TRẢ LỜI */}
        <div className="p-2.5 rounded-lg bg-stone-950/90 border border-emerald-500/35 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono font-black text-[10px]">
                Luồng 4
              </span>
              <span className="text-[11px] font-bold text-emerald-200">
                Đọc câu trả lời (Bảng Câu Trả Lời)
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                soundEngine.enqueueLessonFlowItems(
                  [
                    {
                      text: config.lessonAnswerTtsTemplate || 'Đáp án là',
                      lang: 'vi',
                    },
                    { text: 'Butterfly', lang: 'en' },
                  ],
                  config
                )
              }
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-emerald-300 cursor-pointer shrink-0"
            >
              Nghe thử
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-stone-400">
              <span>Lời dẫn trước khi phát âm từ Tiếng Anh (Edit được):</span>
              <span className="font-mono text-[9.5px] text-emerald-300">
                Tự động đọc kèm từ Tiếng Anh chuẩn [ĐápÁn]
              </span>
            </div>
            <input
              type="text"
              value={config.lessonAnswerTtsTemplate ?? 'Đáp án là'}
              onChange={(e) =>
                onUpdateConfig({ lessonAnswerTtsTemplate: e.target.value })
              }
              className="w-full px-2 py-1 rounded bg-stone-900 border border-stone-700 text-[11px] text-stone-100 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="p-2 rounded bg-stone-900/90 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="text-emerald-200 font-semibold">
                🇬🇧 Tốc độ đọc riêng khi phát âm từ Tiếng Anh:
              </span>
              <span className="font-mono font-bold text-emerald-300">
                {(config.englishTtsRate ?? 0.95).toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={config.englishTtsRate ?? 0.95}
              onChange={(e) =>
                onUpdateConfig({ englishTtsRate: parseFloat(e.target.value) })
              }
              className="w-full accent-emerald-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] bg-stone-900/70 px-2 py-1 rounded border border-stone-800/80">
            <span className="text-stone-400">Thời gian luồng:</span>
            <span className="font-mono font-bold text-emerald-300">
              🔒 Tự động: Nói xong chuyển sang Luồng 5
            </span>
          </div>
        </div>

        {/* LUỒNG 5: ĐỌC KẾT QUẢ & CẬP NHẬT CHỖ NGỒI */}
        <div className="p-2.5 rounded-lg bg-stone-950/90 border border-cyan-500/35 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono font-black text-[10px]">
                Luồng 5
              </span>
              <span className="text-[11px] font-bold text-cyan-200">
                Đọc kết quả (Bảng Kết Quả • Bắt đầu Luồng 5 cập nhật chỗ ngồi)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[10.5px] font-semibold text-emerald-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.quizResultTtsEnabled !== false}
                  onChange={(e) =>
                    onUpdateConfig({ quizResultTtsEnabled: e.target.checked })
                  }
                  className="accent-emerald-500 w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span>Bật đọc</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  const preview = (
                    config.quizResultTtsTemplate ||
                    'Có [HọcKé] bạn học ké và [TrongLớp] bạn trong lớp trả lời đúng, chúc mừng bạn [Top1] trả lời nhanh nhất!'
                  )
                    .replace(/\[HọcKé\]|\{outsideCount\}/gi, '5')
                    .replace(/\[TrongLớp\]|\{classCount\}/gi, '8')
                    .replace(/\[Top1Lớp\]|\[Top1\]|\{fastestName\}/gi, 'Bảo Ngọc');
                  soundEngine.enqueueLessonFlowItems(
                    [{ text: preview, lang: 'vi' }],
                    config
                  );
                }}
                className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-cyan-300 cursor-pointer shrink-0"
              >
                Nghe thử
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-stone-400">
              <span>Format câu nói (Edit được):</span>
              <span className="font-mono text-[9.5px] text-cyan-300">
                Biến: [HọcKé], [TrongLớp], [Top1]
              </span>
            </div>
            <textarea
              rows={2}
              value={
                config.quizResultTtsTemplate ??
                'Có [HọcKé] bạn học ké và [TrongLớp] bạn trong lớp trả lời đúng, chúc mừng bạn [Top1] trả lời nhanh nhất!'
              }
              onChange={(e) =>
                onUpdateConfig({
                  quizResultTtsTemplate: e.target.value,
                  quizResultTtsTemplates: [e.target.value],
                })
              }
              className="w-full px-2 py-1.5 rounded bg-stone-900 border border-stone-700 text-[11px] text-stone-100 focus:outline-none focus:border-cyan-400 resize-y"
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] bg-stone-900/70 px-2 py-1 rounded border border-stone-800/80">
            <span className="text-stone-400">Thời gian luồng:</span>
            <span className="font-mono font-bold text-emerald-300">
              🔒 Tự động: Nói xong chuyển sang Luồng 6
            </span>
          </div>
        </div>

        {/* LUỒNG 6: ĐỌC XẾP HẠNG TRONG LỚP */}
        <div className="p-2.5 rounded-lg bg-stone-950/90 border border-purple-500/35 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-400/50 text-purple-300 font-mono font-black text-[10px]">
                Luồng 6
              </span>
              <span className="text-[11px] font-bold text-purple-200">
                Đọc xếp hạng (Bảng Xếp Hạng Trong Lớp)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const preview = (
                  config.lessonRankingTtsTemplate ||
                  'Top 1 bảng xếp hạng là bạn [Top1Rank] với [ĐiểmTop1] điểm, chúng ta đến với câu hỏi tiếp theo nhé!'
                )
                  .replace(/\[Top1Rank\]|\[Top1BXH\]|\[Top1\]|\{top1Name\}/gi, 'Bảo Ngọc')
                  .replace(/\[ĐiểmTop1\]|\[Điểm\]|\{top1Points\}/gi, '50');
                soundEngine.enqueueLessonFlowItems(
                  [{ text: preview, lang: 'vi' }],
                  config
                );
              }}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-semibold text-purple-300 cursor-pointer shrink-0"
            >
              Nghe thử
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-stone-400">
              <span>Format câu nói (Edit được):</span>
              <span className="font-mono text-[9.5px] text-purple-300">
                Biến: [Top1Rank], [ĐiểmTop1]
              </span>
            </div>
            <textarea
              rows={2}
              value={
                config.lessonRankingTtsTemplate ??
                'Top 1 bảng xếp hạng là bạn [Top1Rank] với [ĐiểmTop1] điểm, chúng ta đến với câu hỏi tiếp theo nhé!'
              }
              onChange={(e) =>
                onUpdateConfig({ lessonRankingTtsTemplate: e.target.value })
              }
              className="w-full px-2 py-1.5 rounded bg-stone-900 border border-stone-700 text-[11px] text-stone-100 focus:outline-none focus:border-purple-400 resize-y"
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] bg-stone-900/70 px-2 py-1 rounded border border-stone-800/80">
            <span className="text-stone-400">Thời gian luồng:</span>
            <span className="font-mono font-bold text-emerald-300">
              🔒 Tự động: Hiện 6 top đầu 3s, mỗi 2s lật trang • Nói xong kết thúc câu hỏi
            </span>
          </div>
        </div>

        {/* LUỒNG PHẠT ĐẶC BIỆT (SAU LUỒNG 6): KHI CÓ AI TẶNG QUÀ 5 / 10 / 10+ */}
        <div className="p-2.5 rounded-lg bg-stone-950/90 border border-rose-500/40 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-400/50 text-rose-300 font-mono font-black text-[10px]">
                Sau Luồng 6
              </span>
              <span className="text-[11px] font-bold text-rose-200">
                Luồng Thông Báo Phạt Quà 5 / 10 / 10+ (Tối đa 5 bạn/lượt • Buff x3 / x6 / x9)
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1 text-[10px] text-stone-400">
                <span>Khi có 1 bạn bị phạt (Biến: [Tên]):</span>
                <button
                  type="button"
                  onClick={() => {
                    const preview = (
                      config.lessonPunishmentSingleTtsTemplate ||
                      'Mời bạn [Tên] mới quậy trong lớp lên đây đứng 1 lượt!'
                    ).replace(/\[Tên\]|\[DanhSáchTên\]/gi, 'Bảo Ngọc');
                    soundEngine.enqueueLessonFlowItems(
                      [{ text: preview, lang: 'vi' }],
                      config
                    );
                  }}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[9.5px] font-semibold text-rose-300 cursor-pointer"
                >
                  Nghe thử (1 bạn)
                </button>
              </div>
              <input
                type="text"
                value={
                  config.lessonPunishmentSingleTtsTemplate ??
                  'Mời bạn [Tên] mới quậy trong lớp lên đây đứng 1 lượt!'
                }
                onChange={(e) =>
                  onUpdateConfig({
                    lessonPunishmentSingleTtsTemplate: e.target.value,
                  })
                }
                className="w-full px-2 py-1 rounded bg-stone-900 border border-stone-700 text-[11px] text-stone-100 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1 text-[10px] text-stone-400">
                <span>Khi có nhiều bạn bị phạt (Biến: [DanhSáchTên]):</span>
                <button
                  type="button"
                  onClick={() => {
                    const preview = (
                      config.lessonPunishmentMultiTtsTemplate ||
                      'Mời các bạn [DanhSáchTên] mới quậy trong lớp lên đây đứng 1 lượt!'
                    ).replace(
                      /\[DanhSáchTên\]|\[Tên\]/gi,
                      'Bảo Ngọc, Minh Khang, Gia Huy'
                    );
                    soundEngine.enqueueLessonFlowItems(
                      [{ text: preview, lang: 'vi' }],
                      config
                    );
                  }}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[9.5px] font-semibold text-rose-300 cursor-pointer"
                >
                  Nghe thử (Nhiều bạn)
                </button>
              </div>
              <input
                type="text"
                value={
                  config.lessonPunishmentMultiTtsTemplate ??
                  'Mời các bạn [DanhSáchTên] mới quậy trong lớp lên đây đứng 1 lượt!'
                }
                onChange={(e) =>
                  onUpdateConfig({
                    lessonPunishmentMultiTtsTemplate: e.target.value,
                  })
                }
                className="w-full px-2 py-1 rounded bg-stone-900 border border-stone-700 text-[11px] text-stone-100 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] bg-stone-900/70 px-2 py-1 rounded border border-stone-800/80">
            <span className="text-stone-400">Cơ chế:</span>
            <span className="font-mono font-bold text-amber-300">
              ⚡ Đứng hàng ngang 5 chỗ • Quà 5=x3, 10=x6, 10+=x9 • Sai ra khỏi lớp luôn
            </span>
          </div>
        </div>
      </section>

      {/* 5. CẤU HÌNH GIỌNG ĐỌC THƯỜNG (HỌC SINH / COMMENT / SỰ KIỆN) */}
      <section className="p-3 rounded-xl bg-stone-900/85 border border-stone-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold text-amber-200">
            Giọng Đọc Thường — Học Sinh & Sự Kiện
          </h2>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-[9.5px] font-bold text-emerald-300">
            Tách biệt với Giọng Chủ Phòng
          </span>
        </div>

        {/* Nguồn phát xếp theo thứ tự ổn định nhất từ trên xuống */}
        <div className="space-y-1">
          <div className="text-[10px] text-stone-400 font-medium">
            Nguồn phát giọng thường (Xếp hạng ổn định 1 → 3):
          </div>
          <select
            value={config.ttsEngine === 'monk_zen' ? 'web_speech' : config.ttsEngine}
            onChange={(e) =>
              onUpdateConfig({ ttsEngine: e.target.value as TTSEngineType })
            }
            className="w-full px-2 py-1.5 rounded-lg bg-stone-950 border border-amber-500/40 text-xs text-stone-100 font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="web_speech">
              1. [Ổn định #1 - 0ms] Web Speech Hệ Thống (Microsoft An / Google VN)
            </option>
            <option value="google_stream">
              2. [Ổn định #2 - Chuẩn OBS/TLS] Google Cloud Stream Đa Máy Chủ (GTX + Cache)
            </option>
            <option value="node_edge">
              3. [Ổn định #3 - Local Node] Node.js TTS (Google GTX / Edge AI HoaiMy, NamMinh)
            </option>
          </select>
        </div>

        {/* Lựa chọn giọng đọc chi tiết cho Google Cloud Stream */}
        {config.ttsEngine === 'google_stream' && (
          <div className="space-y-1">
            <div className="text-[10px] text-stone-400 font-medium">
              Chọn máy chủ & màu giọng Google Stream cho Học sinh / Sự kiện:
            </div>
            <select
              value={
                config.nodeVoice?.startsWith('google-')
                  ? config.nodeVoice
                  : 'google-vi-gtx'
              }
              onChange={(e) => onUpdateConfig({ nodeVoice: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-[11px] text-amber-200 font-medium"
            >
              <option value="google-vi-gtx">
                1. Google Cloud GTX — Nữ Chuẩn Rõ Chữ (Mặc định cho Học sinh)
              </option>
              <option value="google-vi-twob">
                2. Google Translate TW-OB — Nữ Dịu Dàng (Máy chủ độc lập #2)
              </option>
              <option value="google-vi-bright">
                3. Google Nữ Cao Trong Trẻo — Giọng Học Sinh Sáng Rõ
              </option>
              <option value="google-vi-slow">
                4. Google Nữ Trang Nghiêm — Nhịp Chậm Rõ Chữ
              </option>
              <option value="google-vi-warm">
                5. Google Trầm Ấm — Hạ Tần Số Ấm & Dày Giọng
              </option>
              <option value="google-vi-male-deep">
                6. Google Nam Trầm — Giọng Trầm Sâu
              </option>
            </select>
          </div>
        )}

        {/* Lựa chọn giọng đọc chi tiết cho Node.js Local TTS */}
        {config.ttsEngine === 'node_edge' && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-stone-400 font-medium">
              Chọn giọng Node.js cho Học sinh / Sự kiện:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <select
                value={config.nodeVoice}
                onChange={(e) => onUpdateConfig({ nodeVoice: e.target.value })}
                className="px-2 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-[11px] text-amber-200 font-medium"
              >
                <option value="google-vi-gtx">
                  1. Google Cloud GTX (Ổn định #1 - Nữ chuẩn)
                </option>
                <option value="google-vi-twob">
                  2. Google Translate TW-OB (Ổn định #2 - Nữ dịu)
                </option>
                <option value="google-vi-bright">
                  3. Google Nữ Cao Trong Trẻo (Sáng tiếng)
                </option>
                <option value="google-vi-slow">
                  4. Google Nữ Trang Nghiêm (Nhịp chậm)
                </option>
                <option value="google-vi-warm">
                  5. Google Trầm Ấm (Dày tiếng)
                </option>
                <option value="google-vi-male-deep">
                  6. Google Nam Trầm (Giọng trầm sâu)
                </option>
                <option value="vi-VN-HoaiMyNeural">
                  7. Edge AI - Hoài My Neural (Nữ truyền cảm)
                </option>
                <option value="vi-VN-NamMinhNeural">
                  8. Edge AI - Nam Minh Neural (Nam trầm ấm)
                </option>
              </select>
              <input
                type="text"
                value={config.nodeTtsEndpoint}
                onChange={(e) =>
                  onUpdateConfig({ nodeTtsEndpoint: e.target.value })
                }
                placeholder="http://localhost:3000/tts"
                className="px-2 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-[11px] text-amber-300 font-mono"
              />
            </div>
          </div>
        )}

        {/* Lựa chọn giọng hệ thống khi dùng Web Speech */}
        {(config.ttsEngine === 'web_speech' ||
          config.ttsEngine === 'monk_zen') && (
          <div className="space-y-1">
            <div className="text-[10px] text-stone-400 font-medium">
              Chọn giọng Tiếng Việt trong máy ({systemVoices.length} giọng khả dụng):
            </div>
            <div className="flex items-center gap-1.5">
              <select
                value={config.selectedSystemVoiceURI}
                onChange={(e) =>
                  onUpdateConfig({ selectedSystemVoiceURI: e.target.value })
                }
                className="flex-1 px-2 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-[11px] text-stone-200"
              >
                <option value="">
                  ★ Tự động chọn giọng Tiếng Việt tốt nhất (vi-VN)
                </option>
                {systemVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.lang.toLowerCase().includes('vi') ? '🇻🇳 ' : ''}
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={scanVoices}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10.5px] font-semibold text-amber-300 shrink-0 cursor-pointer"
              >
                Quét giọng
              </button>
            </div>
          </div>
        )}

        {/* Preset Tông Giọng 1-chạm */}
        <div className="space-y-1 pt-0.5">
          <div className="text-[10px] text-stone-400 font-medium">
            Chọn nhanh Tông Giọng mẫu:
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() =>
                onUpdateConfig({
                  ttsRate: 1.05,
                  ttsPitch: 1.0,
                  ttsReverb: 0,
                })
              }
              className="px-1.5 py-1 rounded bg-stone-950 hover:bg-stone-800 border border-stone-800 text-[10px] font-semibold text-stone-200 cursor-pointer truncate"
            >
              Nữ Chuẩn
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateConfig({
                  ttsRate: 0.95,
                  ttsPitch: 1.1,
                  ttsReverb: 0,
                })
              }
              className="px-1.5 py-1 rounded bg-stone-950 hover:bg-stone-800 border border-stone-800 text-[10px] font-semibold text-pink-300 cursor-pointer truncate"
            >
              Nữ Dịu
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateConfig({
                  ttsRate: 0.95,
                  ttsPitch: 0.82,
                  ttsReverb: 0,
                })
              }
              className="px-1.5 py-1 rounded bg-stone-950 hover:bg-stone-800 border border-stone-800 text-[10px] font-semibold text-sky-300 cursor-pointer truncate"
            >
              Nam Trầm
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="flex justify-between text-[10.5px] text-stone-400">
              <span>Tốc độ Tiếng Việt</span>
              <span className="text-stone-200 font-mono">
                {config.ttsRate.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.7}
              max={2.0}
              step={0.05}
              value={config.ttsRate}
              onChange={(e) =>
                onUpdateConfig({ ttsRate: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-2 rounded-lg bg-stone-950/80 border border-emerald-500/35">
            <div className="flex justify-between text-[10.5px] text-emerald-200">
              <span className="font-semibold">Tốc độ từ Tiếng Anh</span>
              <span className="text-emerald-300 font-mono font-bold">
                {(config.englishTtsRate ?? 0.95).toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={config.englishTtsRate ?? 0.95}
              onChange={(e) =>
                onUpdateConfig({ englishTtsRate: parseFloat(e.target.value) })
              }
              className="w-full accent-emerald-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="flex justify-between text-[10.5px] text-stone-400">
              <span>Cao độ</span>
              <span className="text-stone-200 font-mono">
                {config.ttsPitch.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.4}
              step={0.05}
              value={config.ttsPitch}
              onChange={(e) =>
                onUpdateConfig({ ttsPitch: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="flex justify-between text-[10.5px] text-stone-400">
              <span>Âm lượng</span>
              <span className="text-stone-200 font-mono">
                {Math.round(config.ttsVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={config.ttsVolume}
              onChange={(e) =>
                onUpdateConfig({ ttsVolume: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
