import React from 'react';
import {
  CustomAssetsConfig,
  FlyingMilkTeaFX,
  ZombieEntityState,
  ZombieProjectileFX,
  ZombieSpikyDamageFX,
} from '../../types/game';

interface ZombieCharacterSpriteProps {
  zombie: ZombieEntityState;
  customAssets?: CustomAssetsConfig;
  scale?: number;
}

export const ZombieCharacterSprite: React.FC<ZombieCharacterSpriteProps> = ({
  zombie,
  customAssets,
  scale = 1.15,
}) => {
  if (!zombie.visible) return null;

  const isDying = zombie.isDying;
  const dyingProgress = Math.max(0, Math.min(1, zombie.dyingProgress || 0));
  // Khi hết máu: gục ngã nằm ngang (90 độ) rồi dần tan biến
  const rotationDeg = isDying ? Math.min(90, dyingProgress * 145) : 0;
  const opacity = isDying ? Math.max(0, 1 - Math.max(0, (dyingProgress - 0.25) / 0.75)) : 1;
  const dropY = isDying ? Math.min(26, dyingProgress * 36) : 0;

  const drawX = zombie.x + (zombie.recoilOffsetX || 0);
  const drawY = zombie.y + (zombie.recoilOffsetY || 0) + dropY;
  const isHit = Date.now() < (zombie.hitFlashUntil || 0);

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${drawX}px`,
        top: `${drawY}px`,
        zIndex: Math.max(22, Math.round(zombie.y) + 2),
        transform: `translate(-50%, -100%) scale(${scale})`,
        opacity,
        transition: isDying ? 'opacity 0.15s linear' : undefined,
      }}
    >
      {/* Hào quang độc khí quanh Zombie */}
      {!isDying && (
        <div className="absolute -inset-3 rounded-full bg-emerald-500/15 blur-md animate-pulse pointer-events-none" />
      )}

      {/* Thân Zombie (xoay ngang khi gục ngã) */}
      <div
        className={`relative origin-bottom transition-transform duration-150 ${
          zombie.isWalking && !isDying ? 'animate-bounce' : ''
        }`}
        style={{
          transform: `rotate(${rotationDeg}deg) scaleX(${zombie.facing === 'left' ? -1 : 1})`,
          filter: isHit
            ? 'brightness(2.1) saturate(2.2) drop-shadow(0 0 12px rgba(239, 68, 68, 0.95))'
            : 'drop-shadow(0 6px 10px rgba(0,0,0,0.65))',
        }}
      >
        {customAssets?.zombieSpriteUrl ? (
          <img
            src={customAssets.zombieSpriteUrl}
            alt="Zombie"
            className="w-24 h-28 object-contain"
          />
        ) : (
          <svg
            width="92"
            height="108"
            viewBox="0 0 92 108"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Tóc rối đen tím */}
            <path
              d="M24 14C24 7 33 3 46 3C59 3 68 7 68 14L72 22H20L24 14Z"
              fill="#1E1B2E"
            />
            <path d="M22 10L16 18L26 16L22 10Z" fill="#1E1B2E" />
            <path d="M70 10L76 18L66 16L70 10Z" fill="#1E1B2E" />

            {/* Đầu Zombie xanh tái */}
            <rect
              x="23"
              y="12"
              width="46"
              height="36"
              rx="8"
              fill="#65A34E"
              stroke="#1F2937"
              strokeWidth="3"
            />
            {/* Vết khâu trên trán */}
            <path
              d="M30 19H44M33 16V22M38 16V22M42 16V22"
              stroke="#1F2937"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Mắt đỏ phát sáng dữ tợn */}
            <circle cx="35" cy="29" r="6" fill="#111827" />
            <circle cx="57" cy="29" r="6" fill="#111827" />
            <circle cx="36" cy="29" r="3.5" fill="#EF4444" />
            <circle cx="58" cy="29" r="3.5" fill="#EF4444" />
            <circle cx="37" cy="28" r="1.2" fill="#FEF08A" />
            <circle cx="59" cy="28" r="1.2" fill="#FEF08A" />

            {/* Miệng gầm gừ răng nanh */}
            <rect
              x="32"
              y="38"
              width="28"
              height="7"
              rx="2"
              fill="#450A0A"
              stroke="#111827"
              strokeWidth="2"
            />
            <path d="M36 38V42M42 38V43M48 38V42M54 38V43" stroke="#F8FAFC" strokeWidth="2.2" />

            {/* Áo sơ mi học sinh rách tả tơi + cà vạt đỏ */}
            <path
              d="M24 48H68L72 80L63 77L58 82L49 77L44 82L35 77L28 82L20 79L24 48Z"
              fill="#CBD5E1"
              stroke="#1F2937"
              strokeWidth="3"
            />
            {/* Cà vạt đỏ */}
            <path d="M44 48H49L51 66L46.5 71L42 66L44 48Z" fill="#DC2626" />
            {/* Vết bẩn trên áo */}
            <circle cx="34" cy="60" r="4" fill="#4D7C0F" fillOpacity="0.6" />
            <circle cx="58" cy="66" r="5" fill="#991B1B" fillOpacity="0.55" />

            {/* Hai tay giơ thẳng phía trước kiểu Zombie */}
            <rect
              x="54"
              y="50"
              width="32"
              height="10"
              rx="4"
              fill="#65A34E"
              stroke="#1F2937"
              strokeWidth="2.5"
            />
            <rect
              x="58"
              y="62"
              width="30"
              height="10"
              rx="4"
              fill="#4D7C0F"
              stroke="#1F2937"
              strokeWidth="2.5"
            />

            {/* Quần tối màu */}
            <rect
              x="29"
              y="79"
              width="14"
              height="20"
              rx="3"
              fill="#1E293B"
              stroke="#0F172A"
              strokeWidth="2.5"
            />
            <rect
              x="49"
              y="79"
              width="14"
              height="20"
              rx="3"
              fill="#1E293B"
              stroke="#0F172A"
              strokeWidth="2.5"
            />

            {/* Giày */}
            <rect x="27" y="96" width="18" height="8" rx="3" fill="#0F172A" />
            <rect x="48" y="96" width="18" height="8" rx="3" fill="#0F172A" />
          </svg>
        )}
      </div>

      {/* Nhãn tên Zombie trên đầu */}
      {!isDying && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-red-950/90 border border-red-500/80 text-[10px] font-black text-red-200 shadow-lg font-pixel-vi">
          🧟 ZOMBIE
        </div>
      )}
    </div>
  );
};

interface ZombieProjectileSpriteProps {
  proj: ZombieProjectileFX;
  customAssets?: CustomAssetsConfig;
  nameTagFontFamily?: string;
  nameTagScale?: number;
  nameTagMaxChars?: number;
}

export const ZombieProjectileSprite: React.FC<ZombieProjectileSpriteProps> = ({
  proj,
  customAssets,
  nameTagFontFamily = '"Be Vietnam Pro", system-ui, sans-serif',
  nameTagScale = 1,
  nameTagMaxChars = 16,
}) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let rafId = 0;
    const update = () => {
      const now = Date.now();
      const elapsed = now - proj.createdAt;
      const p = Math.max(0, Math.min(1, elapsed / Math.max(120, proj.durationMs)));
      setProgress(p);
      if (p < 1) {
        rafId = requestAnimationFrame(update);
      }
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [proj.createdAt, proj.durationMs]);

  // Quỹ đạo bay vòng cung parabol
  const curX = proj.startX + (proj.targetX - proj.startX) * progress;
  const linearY = proj.startY + (proj.targetY - proj.startY) * progress;
  const arcHeight = proj.kind === 'desk_mate' ? 95 : proj.kind === 'chair' ? 75 : 50;
  const arcOffset = -Math.sin(progress * Math.PI) * arcHeight;
  const curY = linearY + arcOffset;

  // Điểm đuôi đạn phía trước đó một chút để vẽ vệt đuôi đơn giản
  const prevP = Math.max(0, progress - 0.12);
  const tailX = proj.startX + (proj.targetX - proj.startX) * prevP;
  const tailLinearY = proj.startY + (proj.targetY - proj.startY) * prevP;
  const tailY = tailLinearY - Math.sin(prevP * Math.PI) * arcHeight;

  const dx = curX - tailX;
  const dy = curY - tailY;
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const tailLen = Math.min(58, Math.hypot(dx, dy) * 1.35);

  const spinDeg = progress * (proj.kind === 'desk_mate' ? 1080 : 720);

  const tailColor =
    proj.kind === 'desk_mate'
      ? 'from-fuchsia-500/85 via-amber-300/60 to-transparent'
      : proj.kind === 'chair'
      ? 'from-orange-500/85 via-amber-300/50 to-transparent'
      : proj.kind === 'book'
      ? 'from-sky-400/80 via-cyan-200/40 to-transparent'
      : 'from-yellow-300/80 via-amber-200/40 to-transparent';

  const renderModel = () => {
    if (proj.kind === 'pencil_case') {
      if (customAssets?.projPencilCaseUrl) {
        return <img src={customAssets.projPencilCaseUrl} alt="Hộp bút" className="w-8 h-8 object-contain" />;
      }
      // Icon tượng trưng Hộp bút (Pencil Case)
      return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect
            x="4"
            y="10"
            width="24"
            height="12"
            rx="4"
            fill="#F59E0B"
            stroke="#78350F"
            strokeWidth="2.2"
          />
          <path d="M6 16H26" stroke="#FEF3C7" strokeWidth="2" strokeDasharray="3 2" />
          <rect x="12" y="13" width="8" height="6" rx="1.5" fill="#EF4444" />
        </svg>
      );
    }

    if (proj.kind === 'book') {
      if (customAssets?.projBookUrl) {
        return <img src={customAssets.projBookUrl} alt="Quyển sách" className="w-9 h-9 object-contain" />;
      }
      // Icon tượng trưng Quyển sách dày
      return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path
            d="M7 8C7 6.34315 8.34315 5 10 5H27V27H10C8.34315 27 7 28.3431 7 30V8Z"
            fill="#2563EB"
            stroke="#1E3A8A"
            strokeWidth="2.2"
          />
          <path d="M9 27H28V31H10C8.34315 31 7 29.6569 7 28C7 27.4477 7.44772 27 8 27H9Z" fill="#F8FAFC" stroke="#1E3A8A" strokeWidth="2" />
          <rect x="13" y="10" width="10" height="6" rx="1" fill="#FDE047" />
        </svg>
      );
    }

    if (proj.kind === 'chair') {
      if (customAssets?.projChairUrl) {
        return <img src={customAssets.projChairUrl} alt="Ghế ngồi" className="w-11 h-11 object-contain" />;
      }
      // Icon tượng trưng Ghế gỗ lớp học
      return (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
          <rect x="11" y="6" width="20" height="12" rx="2" fill="#D97706" stroke="#451A03" strokeWidth="2.2" />
          <rect x="9" y="20" width="24" height="6" rx="2" fill="#F59E0B" stroke="#451A03" strokeWidth="2.2" />
          <path d="M13 26V36M29 26V36M16 18V20M26 18V20" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    }

    // desk_mate: Đứa bàn bên bị ném xoay vòng — gắn dính bản sao Thẻ tên của bạn bàn bên vào model đạn để xoay cùng nhau
    const rawSeatmateName = (proj.seatmateName || 'Bạn cùng bàn').trim();
    const maxNameChars = Math.max(4, nameTagMaxChars || 16);
    const displaySeatmateName =
      rawSeatmateName.length > maxNameChars
        ? `${rawSeatmateName.slice(0, maxNameChars)}…`
        : rawSeatmateName;

    return (
      <div className="relative flex flex-col items-center">
        {customAssets?.projDeskMateUrl ? (
          <img
            src={customAssets.projDeskMateUrl}
            alt={rawSeatmateName}
            className="w-14 h-14 object-contain"
          />
        ) : (
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            {/* Tóc */}
            <path d="M15 14C15 8 20 5 26 5C32 5 37 8 37 14H15Z" fill="#1E293B" />
            {/* Mặt học sinh hoảng hốt meme :) */}
            <circle cx="26" cy="18" r="10" fill="#FDE68A" stroke="#1E293B" strokeWidth="2.2" />
            {/* Mắt chữ O miệng chữ A */}
            <circle cx="22.5" cy="16.5" r="2" fill="#1E293B" />
            <circle cx="29.5" cy="16.5" r="2" fill="#1E293B" />
            <ellipse cx="26" cy="22" rx="3.2" ry="2.5" fill="#EF4444" stroke="#1E293B" strokeWidth="1.5" />
            {/* Thân áo trắng khăn quàng đỏ vẫy tay */}
            <rect x="17" y="28" width="18" height="14" rx="4" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.2" />
            <path d="M21 28L26 35L31 28" fill="#EF4444" />
            {/* Tay chân vung vẩy */}
            <path d="M17 31L7 24M35 31L45 24M21 42L16 50M31 42L36 50" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}

        {/* Bản sao Thẻ Tên của bạn bàn bên gắn dính vào model đạn và xoay theo đạn */}
        <div
          style={{
            fontFamily: nameTagFontFamily,
            transform: `scale(${(nameTagScale || 1).toFixed(2)})`,
            transformOrigin: '50% 0%',
          }}
          className={`-mt-1 h-[20px] pl-0 pr-1.5 py-0 rounded-full flex items-center gap-1 whitespace-nowrap ${
            proj.seatmateIsGolden
              ? 'bg-amber-950/95 border border-yellow-300 text-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.85)]'
              : proj.seatmateIsVip
              ? 'bg-amber-950/90 border border-amber-400/80 text-amber-200 shadow-sm'
              : 'bg-slate-950/85 border border-slate-700/80 text-slate-100 shadow-sm'
          }`}
        >
          {proj.seatmateAvatarUrl ? (
            <img
              src={proj.seatmateAvatarUrl}
              alt=""
              className="w-4 h-4 rounded-full object-cover border border-white/40 shrink-0 -ml-px"
            />
          ) : (
            <span
              className="w-4 h-4 rounded-full shrink-0 inline-block border border-white/30 -ml-px"
              style={{ backgroundColor: proj.seatmateAvatarColor || '#38bdf8' }}
            />
          )}
          <span
            className={`text-[9.5px] font-bold tracking-tight py-0.5 ${
              proj.seatmateIsGolden ? 'text-yellow-300 font-black' : ''
            }`}
          >
            {displaySeatmateName}
          </span>
          {(proj.seatmateIsVip || proj.seatmateIsGolden) && (
            <span className="text-[8px] font-extrabold text-yellow-300">
              {proj.seatmateIsGolden ? '👑' : '★'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${curX}px`,
        top: `${curY}px`,
        zIndex: 920,
      }}
    >
      {/* Đuôi đạn bay đơn giản */}
      <div
        className={`absolute right-1/2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-l ${tailColor} blur-[1px]`}
        style={{
          width: `${tailLen}px`,
          height: proj.kind === 'desk_mate' ? '12px' : proj.kind === 'chair' ? '9px' : '6px',
          transformOrigin: 'right center',
          transform: `translateY(-50%) rotate(${angleDeg}deg)`,
        }}
      />

      {/* Model đạn xoay tròn */}
      <div
        className="-translate-x-1/2 -translate-y-1/2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
        style={{
          transform: `translate(-50%, -50%) rotate(${spinDeg}deg)`,
        }}
      >
        {renderModel()}
      </div>
    </div>
  );
};

interface ZombieSpikyDamageBubbleProps {
  fx: ZombieSpikyDamageFX;
}

export const ZombieSpikyDamageBubble: React.FC<ZombieSpikyDamageBubbleProps> = ({ fx }) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let rafId = 0;
    const tick = () => {
      const elapsed = Date.now() - fx.createdAt;
      const p = Math.max(0, Math.min(1, elapsed / 900));
      setProgress(p);
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [fx.createdAt]);

  // Văng ra theo hướng ngẫu nhiên quanh Zombie
  const curX = fx.x + fx.vx * progress;
  const curY = fx.y + fx.vy * progress - Math.sin(progress * Math.PI) * 18;
  const scale = progress < 0.2 ? 0.5 + (progress / 0.2) * 0.75 : 1.25 - (progress - 0.2) * 0.35;
  const opacity = progress > 0.7 ? Math.max(0, 1 - (progress - 0.7) / 0.3) : 1;

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${curX}px`,
        top: `${curY}px`,
        zIndex: 960,
        transform: `translate(-50%, -50%) scale(${scale * (fx.scale || 1)})`,
        opacity,
      }}
    >
      {/* Hình vụ nổ gai nhọn màu kem vàng (Spiky Speech Bubble - viền mỏng, số to rõ dễ đọc) */}
      <div className="relative flex items-center justify-center w-22 h-22">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
        >
          <polygon
            points="50,3 61,21 81,10 75,31 96,35 81,51 97,68 75,70 79,91 59,79 50,97 41,79 21,91 25,70 3,68 19,51 4,35 25,31 19,10 39,21"
            fill="#FEF3C7"
            stroke="#F59E0B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="relative z-10 font-sans font-black text-red-600 text-base sm:text-lg tabular-nums tracking-tight leading-none drop-shadow-[0_1px_0_#ffffff]"
          style={{
            fontFamily: '"Be Vietnam Pro", "Inter", system-ui, -apple-system, sans-serif',
          }}
        >
          -{fx.damage.toLocaleString('vi-VN')}
        </span>
      </div>
    </div>
  );
};

interface FlyingMilkTeaSpriteProps {
  tea: FlyingMilkTeaFX;
  customAssets?: CustomAssetsConfig;
}

export const FlyingMilkTeaSprite: React.FC<FlyingMilkTeaSpriteProps> = ({
  tea,
  customAssets,
}) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let rafId = 0;
    const tick = () => {
      const elapsed = Date.now() - tea.createdAt;
      const p = Math.max(0, Math.min(1, elapsed / Math.max(300, tea.durationMs)));
      setProgress(p);
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [tea.createdAt, tea.durationMs]);

  const curX = tea.startX + (tea.targetX - tea.startX) * progress;
  const linearY = tea.startY + (tea.targetY - tea.startY) * progress;
  const curY = linearY - Math.sin(progress * Math.PI) * 85;

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${curX}px`,
        top: `${curY}px`,
        zIndex: 950,
        transform: `translate(-50%, -50%) scale(${0.85 + Math.sin(progress * Math.PI) * 0.25})`,
      }}
    >
      {customAssets?.milkTeaCupUrl ? (
        <img src={customAssets.milkTeaCupUrl} alt="Trà sữa Matcha Latte" className="w-10 h-12 object-contain" />
      ) : (
        <div className="relative flex flex-col items-center">
          {/* Ly trà sữa Matcha Latte full topping trân châu */}
          <svg width="38" height="46" viewBox="0 0 38 46" fill="none" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            {/* Ống hút */}
            <path d="M23 2L19 14" stroke="#EC4899" strokeWidth="4" strokeLinecap="round" />
            {/* Nắp cầu kem cheese */}
            <path d="M8 15C8 9.5 13 6 19 6C25 6 30 9.5 30 15H8Z" fill="#FEFCE8" stroke="#1F2937" strokeWidth="2" />
            {/* Thân ly Matcha xanh mát */}
            <path d="M8 15H30L27 41C27 42.5 25.5 44 24 44H14C12.5 44 11 42.5 11 41L8 15Z" fill="#86EFAC" stroke="#1F2937" strokeWidth="2.2" />
            {/* Lớp kem sữa trắng phía trên */}
            <path d="M9 16H29L28.3 22H9.7L9 16Z" fill="#ECFCCB" />
            {/* Trân châu đen full topping dưới đáy */}
            <circle cx="14" cy="39" r="2.3" fill="#1F2937" />
            <circle cx="19" cy="40" r="2.3" fill="#1F2937" />
            <circle cx="24" cy="39" r="2.3" fill="#1F2937" />
            <circle cx="16.5" cy="35" r="2.2" fill="#1F2937" />
            <circle cx="21.5" cy="35" r="2.2" fill="#1F2937" />
          </svg>
        </div>
      )}
    </div>
  );
};
