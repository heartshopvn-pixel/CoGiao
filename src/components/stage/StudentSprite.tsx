import React from 'react';
import {
  DEFAULT_BOY_STUDENT_SEATED_IMG,
  DEFAULT_BOY_STUDENT_STANDING_IMG,
  DEFAULT_GIFT_MODEL_SCALES,
  DEFAULT_GIRL_STUDENT_SEATED_IMG,
  DEFAULT_GIRL_STUDENT_STANDING_IMG,
  getCharacterDepthScale,
} from '../../config/constants';
import {
  useProcessedSingleCutout,
  useProcessedSpriteFrames,
} from '../../services/spriteProcessor';
import {
  CustomAssetsConfig,
  GiftModelScalesConfig,
  PilgrimData,
  PilgrimFrameIndex,
} from '../../types/game';
import { RoseBouquetModel, SchoolGiftArt } from './SchoolGiftArt';

interface StudentSpriteProps {
  pilgrim: PilgrimData;
  customAssets: CustomAssetsConfig;
  characterScale: number;
  useDefaultPngModels?: boolean;
  nameTagFontFamily: string;
  nameTagScale: number;
  nameTagMaxChars?: number;
  nameTagOffsetY?: number;
  chatBubbleFontFamily: string;
  chatBubbleScale: number;
  chatBubbleMaxChars?: number;
  chatBubbleMaxWidth?: number;
  chatBubbleMaxHeight?: number;
  chatBubbleFontSize?: number;
  chatBubbleOffsetY?: number;
  chatBubbleOffsetX?: number;
  isLeftSeatmate?: boolean;
  isSpeakingBubble?: boolean;
  giftModelScales?: GiftModelScalesConfig;
}

function getStudentFrameIndex(p: PilgrimData): PilgrimFrameIndex {
  const step = Math.floor(p.animTime * 6.5) % 2;

  if (
    p.pathWaypoints &&
    p.pathWaypoints.length > 0 &&
    p.state !== 'pray_seated' &&
    p.state !== 'throw_offering_at_burner' &&
    p.state !== 'ceremony_at_burner'
  ) {
    const wp = p.pathWaypoints[0];
    const dx = wp.x - p.x;
    const dy = wp.y - p.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return step === 0 ? 8 : 9;
    }
    return dy >= 0 ? (step === 0 ? 0 : 1) : step === 0 ? 2 : 3;
  }

  switch (p.state) {
    case 'walk_in_up':
    case 'walk_to_teacher_gift':
    case 'walk_to_punishment_spot':
      if (p.isCarryingGift || p.coins > 0) return 7;
      return step === 0 ? 2 : 3;
    case 'throw_offering_at_burner':
    case 'throw_flower_at_teacher':
      return 7;
    case 'ceremony_at_burner':
      return 4;
    case 'walk_to_vip_check':
    case 'walk_carpet_to_slot_y':
    case 'return_to_seat_from_gift':
    case 'return_from_punishment_to_seat':
    case 'leave_down_exit':
      return step === 0 ? 0 : 1;
    case 'stand_punishment':
    case 'wait_for_vip_slot':
      return 0;
    case 'walk_side_to_slot':
    case 'leave_side_to_aisle':
      return step === 0 ? 8 : 9;
    case 'walk_vert_to_slot':
      return p.y > p.slotY ? (step === 0 ? 2 : 3) : step === 0 ? 0 : 1;
    case 'pray_seated':
      if (p.stateTimer < 1.8) {
        return Math.floor(p.stateTimer * 3.5) % 2 === 0 ? 6 : 5;
      }
      return 5;
    default:
      return 5;
  }
}

export const StudentSprite: React.FC<StudentSpriteProps> = ({
  pilgrim,
  customAssets,
  characterScale,
  useDefaultPngModels = true,
  nameTagFontFamily,
  nameTagScale,
  nameTagMaxChars = 16,
  nameTagOffsetY = 0,
  chatBubbleFontFamily,
  chatBubbleScale,
  chatBubbleMaxChars = 80,
  chatBubbleMaxWidth = 195,
  chatBubbleMaxHeight = 110,
  chatBubbleFontSize = 11,
  chatBubbleOffsetY = 0,
  chatBubbleOffsetX = 24,
  isLeftSeatmate = false,
  isSpeakingBubble = false,
  giftModelScales = DEFAULT_GIFT_MODEL_SCALES,
}) => {
  const now = Date.now();

  const rawSheetUrl =
    pilgrim.gender === 'female'
      ? customAssets.pilgrimFemaleSpritesheetUrl
      : customAssets.pilgrimMaleSpritesheetUrl;

  const customFrames = useProcessedSpriteFrames(rawSheetUrl, 10, null);
  const frameIdx = getStudentFrameIndex(pilgrim);
  const customFrameSrc =
    rawSheetUrl && customFrames && customFrames[frameIdx]
      ? customFrames[frameIdx]
      : null;

  const depthScale = getCharacterDepthScale(pilgrim.y);
  const finalScale = depthScale * (characterScale || 1);

  const showChatBubble =
    Boolean(pilgrim.prayer && pilgrim.prayer.trim()) &&
    (isSpeakingBubble ||
      (pilgrim.chatBubbleUntil ? now < pilgrim.chatBubbleUntil : false));

  const showQuizResultBadge =
    Boolean(pilgrim.quizResultStatus) &&
    Boolean(pilgrim.quizResultUntil && now < pilgrim.quizResultUntil);

  const showFloatingScore =
    Boolean(pilgrim.floatingScoreText) &&
    Boolean(pilgrim.floatingScoreUntil && now < pilgrim.floatingScoreUntil);

  const isRichKidDancing = Boolean(
    pilgrim.richKidDanceUntil && now < pilgrim.richKidDanceUntil
  );

  const isSeated = pilgrim.state === 'pray_seated' && !isRichKidDancing;
  const defaultModelUrl =
    pilgrim.gender === 'female'
      ? isSeated
        ? DEFAULT_GIRL_STUDENT_SEATED_IMG
        : DEFAULT_GIRL_STUDENT_STANDING_IMG
      : isSeated
      ? DEFAULT_BOY_STUDENT_SEATED_IMG
      : DEFAULT_BOY_STUDENT_STANDING_IMG;
  const processedDefaultModelSrc = useProcessedSingleCutout(defaultModelUrl);
  const isAtDeskSeat =
    pilgrim.state === 'pray_seated' || pilgrim.state === 'walk_side_to_slot';

  // Bạn bên trái cùng bàn luôn cao hơn bạn bên phải 1 mức vừa bằng chiều cao của thẻ tên để thẻ tên 2 bạn không đè lên nhau
  // Khi kích hoạt Rich Kid Dance -> đứng hẳn lên mặt bàn (-24px) và nhảy múa
  const nameTagHeightPx = Math.round(18 * (nameTagScale || 1));
  const seatmateYOffset =
    isLeftSeatmate && isAtDeskSeat ? -nameTagHeightPx : 0;
  const richKidDeskStandOffset = isRichKidDancing ? -24 : 0;
  const renderedY = pilgrim.y + seatmateYOffset + richKidDeskStandOffset;

  const isRaisingHand =
    isRichKidDancing ||
    isSpeakingBubble ||
    showChatBubble ||
    (isSeated && pilgrim.stateTimer < 2.0);
  const isHoldingGiftUp =
    ((pilgrim.state === 'walk_in_up' ||
      pilgrim.state === 'walk_to_teacher_gift') &&
      (pilgrim.isCarryingGift || pilgrim.coins > 0)) ||
    pilgrim.state === 'throw_offering_at_burner' ||
    pilgrim.state === 'throw_flower_at_teacher';
  const isGreetingTeacher = pilgrim.state === 'ceremony_at_burner';

  const stepPhase = Math.sin(pilgrim.animTime * (isRichKidDancing ? 18 : 9));
  const isWalking =
    isRichKidDancing ||
    pilgrim.state === 'walk_in_up' ||
    pilgrim.state === 'walk_to_teacher_gift' ||
    pilgrim.state === 'return_to_seat_from_gift' ||
    pilgrim.state === 'walk_to_punishment_spot' ||
    pilgrim.state === 'return_from_punishment_to_seat' ||
    pilgrim.state === 'walk_to_vip_check' ||
    pilgrim.state === 'walk_carpet_to_slot_y' ||
    pilgrim.state === 'walk_side_to_slot' ||
    pilgrim.state === 'walk_vert_to_slot' ||
    pilgrim.state === 'leave_side_to_aisle' ||
    pilgrim.state === 'leave_down_exit';

  const isFrontView =
    isRichKidDancing ||
    pilgrim.state === 'stand_punishment' ||
    frameIdx === 0 ||
    frameIdx === 1 ||
    pilgrim.id < 0 ||
    pilgrim.state === 'wait_for_vip_slot' ||
    pilgrim.state === 'walk_to_vip_check' ||
    pilgrim.state === 'walk_carpet_to_slot_y' ||
    pilgrim.state === 'return_to_seat_from_gift' ||
    pilgrim.state === 'return_from_punishment_to_seat' ||
    pilgrim.state === 'leave_down_exit';

  const showPunishmentBadge = Boolean(
    pilgrim.isPunishedInCurrentRound && pilgrim.punishmentMultiplier
  );

  const showComboBadge =
    (pilgrim.comboCount || 0) > 1 &&
    ((pilgrim.comboUntil && now < pilgrim.comboUntil) ||
      pilgrim.state === 'walk_to_teacher_gift' ||
      pilgrim.state === 'throw_flower_at_teacher');

  // Khi có bong bóng chat, Rich Kid nhảy trên bàn, hoặc đang đọc TTS -> đẩy toàn bộ nhân vật lên layer đầu tiên
  const activeBubblePriority = showChatBubble
    ? 10000 + Math.floor(((pilgrim.chatBubbleUntil || 0) % 100000) / 10)
    : 0;
  const spriteZIndex = isSpeakingBubble
    ? 20000
    : isRichKidDancing
    ? 18000
    : showChatBubble
    ? activeBubblePriority
    : showFloatingScore || showComboBadge
    ? 9800
    : showQuizResultBadge
    ? 9500
    : showPunishmentBadge
    ? 9200
    : isSeated
    ? Math.max(10, Math.floor(renderedY))
    : Math.max(20, Math.floor(renderedY) + 60);

  const hairColors = ['#1e293b', '#0f172a', '#3f2e21', '#27272a', '#451a03'];
  const hairColor = hairColors[pilgrim.hairSeed % hairColors.length];

  // Khoảng cách thực tế từ tâm chân (anchor 88%) tới đỉnh đầu và mũi chân theo tỉ lệ nhân vật (50% -> 300%)
  const headTopOffsetPx =
    Math.round((isHoldingGiftUp ? 98 : isRaisingHand ? 76 : 71) * finalScale) + 6;
  const quizBadgeTopOffsetPx = Math.round(72 * finalScale) + 6;
  const wrongBadgeCenterOffsetPx = Math.round(40 * finalScale);
  const feetBottomOffsetPx = Math.round((isSeated ? 5 : 9) * finalScale) + 2;

  const safeMaxNameChars = Math.max(
    3,
    Math.min(60, Math.round(nameTagMaxChars || 16))
  );
  const rawUsername = (pilgrim.username || '').trim();
  const displayUsername =
    rawUsername.length > safeMaxNameChars
      ? `${rawUsername.slice(0, safeMaxNameChars)}…`
      : rawUsername;

  const safeMaxBubbleChars = Math.max(
    5,
    Math.min(500, Math.round(chatBubbleMaxChars || 80))
  );
  const rawPrayer = (pilgrim.prayer || '').trim();
  const displayPrayer =
    rawPrayer.length > safeMaxBubbleChars
      ? `${rawPrayer.slice(0, safeMaxBubbleChars)}…`
      : rawPrayer;

  const safeBubbleFontSize = Math.max(
    7,
    Math.min(28, Number(chatBubbleFontSize || 11))
  );
  const safeBubbleMaxW = Math.max(
    64,
    Math.min(480, Math.round(chatBubbleMaxWidth || 195))
  );
  const safeBubbleMaxH = Math.max(
    24,
    Math.min(360, Math.round(chatBubbleMaxHeight || 110))
  );

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: pilgrim.x,
        top: renderedY,
        zIndex: spriteZIndex,
      }}
    >
      {/* THẺ BUFF NHÂN ĐIỂM KHI BỊ PHẠT ĐỨNG TRÊN BỤC (x3 / x6 / x9) */}
      {showPunishmentBadge && (
        <div
          className="absolute left-0 pointer-events-none z-92"
          style={{
            top: -(
              quizBadgeTopOffsetPx +
              (showQuizResultBadge || showFloatingScore ? 26 : 0) +
              (showComboBadge ? 22 : 0)
            ),
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className={`px-2 py-0.5 rounded-md font-mono font-black text-[12px] leading-none whitespace-nowrap border-2 shadow-lg flex items-center gap-0.5 ${
              pilgrim.punishmentMultiplier === 9
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-rose-500 text-slate-950 border-yellow-100 shadow-[0_0_12px_rgba(250,204,21,0.95)]'
                : pilgrim.punishmentMultiplier === 6
                ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white border-amber-200 shadow-[0_0_10px_rgba(249,115,22,0.85)]'
                : 'bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white border-cyan-200 shadow-[0_0_10px_rgba(217,70,239,0.85)]'
            }`}
          >
            <span>⚡</span>
            <span>x{pilgrim.punishmentMultiplier}</span>
          </div>
        </div>
      )}

      {/* THẺ COMBO GẮN LÊN NGƯỜI HỌC SINH KHI TẶNG QUÀ CÓ COMBO */}
      {showComboBadge && (
        <div
          key={`combo_${pilgrim.comboPopKey || pilgrim.comboCount || 2}`}
          className="absolute left-0 pointer-events-none z-96"
          style={{
            top: -Math.round(36 * finalScale),
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="px-2 py-0.5 rounded-md bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 text-white font-mono font-black text-[10.5px] leading-none whitespace-nowrap border-2 border-yellow-200 shadow-[0_0_12px_rgba(251,146,60,0.95)] flex items-center gap-0.5 animate-pulse"
            style={{
              textShadow:
                '-1px -1px 0 #450a0a, 1px -1px 0 #450a0a, -1px 1px 0 #450a0a, 1px 1px 0 #450a0a',
            }}
          >
            <span>🔥</span>
            <span>COMBO x{pilgrim.comboCount}</span>
          </div>
        </div>
      )}

      {/* FLOATING TEXT CỘNG / TRỪ ĐIỂM QUÀ TẶNG (+10đ, +20đ, +40đ, +99đ, +30đ, -20đ) */}
      {showFloatingScore && (
        <div
          key={`fscore_${pilgrim.floatingScoreKey || 1}`}
          className="absolute left-0 pointer-events-none z-95 animate-bounce"
          style={{
            top: -(quizBadgeTopOffsetPx + (showQuizResultBadge ? 24 : 4)),
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className="px-2.5 py-0.5 rounded-full font-mono font-black text-[15px] leading-none whitespace-nowrap shadow-xl"
            style={{
              backgroundColor:
                pilgrim.floatingScoreColor === 'red'
                  ? '#e11d48'
                  : pilgrim.floatingScoreColor === 'green'
                  ? '#16a34a'
                  : '#f59e0b',
              color: '#ffffff',
              border: '2.5px solid #451a03',
              textShadow:
                '-1.2px -1.2px 0 #451a03, 1.2px -1.2px 0 #451a03, -1.2px 1.2px 0 #451a03, 1.2px 1.2px 0 #451a03',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.75)',
            }}
          >
            {pilgrim.floatingScoreText}
          </div>
        </div>
      )}

      {/* HIỆU ỨNG KẾT QUẢ CÂU HỎI (HIỆN 3 GIÂY TRÊN NGƯỜI HỌC SINH - TỰ ĐỘNG CĂN THEO KÍCH THƯỚC NHÂN VẬT) */}
      {showQuizResultBadge && pilgrim.quizResultStatus === 'correct' && (
        <div
          className="absolute left-0 pointer-events-none z-90 animate-bounce"
          style={{
            top: -quizBadgeTopOffsetPx,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className="px-2.5 py-0.5 rounded-full font-mono font-black text-[14px] leading-none whitespace-nowrap shadow-lg"
            style={{
              backgroundColor: '#22c55e',
              color: '#f0fdf4',
              border: '2.5px solid #5c2d0c',
              textShadow:
                '-1.2px -1.2px 0 #5c2d0c, 1.2px -1.2px 0 #5c2d0c, -1.2px 1.2px 0 #5c2d0c, 1.2px 1.2px 0 #5c2d0c, 0 2px 4px rgba(0,0,0,0.65)',
              boxShadow: '0 4px 10px rgba(92, 45, 12, 0.75)',
            }}
          >
            +{pilgrim.quizEarnedPoints || 5}đ
          </div>
        </div>
      )}

      {showQuizResultBadge && pilgrim.quizResultStatus === 'wrong' && (
        <div
          className="absolute left-0 pointer-events-none z-90"
          style={{
            top: -wrongBadgeCenterOffsetPx,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full bg-rose-600/95 border-2 border-white flex items-center justify-center shadow-[0_0_14px_rgba(225,29,72,0.95)] animate-pulse"
            title="Trả lời sai - Mất chỗ ngồi"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* BONG BÓNG CHAT PHÁT BIỂU (Tự động nhận diện ghế ngồi: bên trái đẩy sang trái, bên phải đẩy sang phải để không đè lên nhau) */}
      {showChatBubble && (() => {
        const bubbleTranslateX = isSeated ? (isLeftSeatmate ? '-80%' : '-20%') : '-50%';
        const bubbleOrigin = isSeated ? (isLeftSeatmate ? '80% 100%' : '20% 100%') : '50% 100%';
        const tailLeftPercent = isSeated ? (isLeftSeatmate ? '80%' : '20%') : '50%';
        const spreadPx = Number(chatBubbleOffsetX ?? 24);
        const horizontalShiftPx = isSeated ? (isLeftSeatmate ? -spreadPx : spreadPx) : 0;

        return (
          <div
            className="absolute pointer-events-none"
            style={{
              left: horizontalShiftPx,
              top: -headTopOffsetPx + (chatBubbleOffsetY || 0),
              transform: `translate(${bubbleTranslateX}, -100%) scale(${(chatBubbleScale || 1).toFixed(2)})`,
              transformOrigin: bubbleOrigin,
              zIndex: 9999,
            }}
          >
            <div
              style={{
                fontFamily: chatBubbleFontFamily,
                fontSize: `${safeBubbleFontSize}px`,
                maxWidth: `${safeBubbleMaxW}px`,
                minWidth: `${Math.min(72, safeBubbleMaxW)}px`,
              }}
              className={`relative px-2.5 py-1.5 rounded-xl border font-semibold leading-snug text-center break-words transition-all duration-200 ${
                isSpeakingBubble
                  ? 'bg-slate-950/95 text-pink-200 border-pink-400 shadow-[0_0_16px_rgba(244,114,182,0.85)] z-50 scale-105'
                  : pilgrim.isVip
                  ? 'bg-slate-950/92 text-amber-100 border-amber-400/80 shadow-lg'
                  : 'bg-slate-950/90 text-white border-sky-400/60 shadow-md'
              }`}
            >
              <div
                style={{ maxHeight: `${safeBubbleMaxH}px` }}
                className="overflow-hidden break-words"
              >
                {isSpeakingBubble && (
                  <span className="inline-block mr-1 text-pink-300 font-extrabold">
                    🔊
                  </span>
                )}
                <span>{displayPrayer}</span>
              </div>
              <div
                className={`w-2 h-2 absolute -bottom-1 border-r border-b ${
                  isSpeakingBubble
                    ? 'bg-slate-950 border-pink-400'
                    : pilgrim.isVip
                    ? 'bg-slate-950 border-amber-400/80'
                    : 'bg-slate-950 border-sky-400/60'
                }`}
                style={{
                  left: tailLeftPercent,
                  transform: 'translateX(-50%) rotate(45deg)',
                }}
              />
            </div>
          </div>
        );
      })()}

      {/* KHỐI THÂN NHÂN VẬT HỌC SINH (Phóng to / thu nhỏ 50% -> 300% quanh tâm chân 50% 88%) */}
      <div
        className="pointer-events-none select-none"
        style={{
          transform: `translate(-50%, ${
            isRichKidDancing
              ? `${-88 - Math.abs(Math.sin(pilgrim.animTime * 14)) * 12}%`
              : '-88%'
          }) scale(${finalScale.toFixed(3)}) ${
            isRichKidDancing
              ? `rotate(${Math.sin(pilgrim.animTime * 14) * 9}deg)`
              : ''
          }`,
          transformOrigin: '50% 88%',
        }}
      >
        {/* Vòng sáng chân cho Học sinh VIP / Tặng quà / Rich Kid */}
        {(pilgrim.isVip || pilgrim.hasGoldenAura || isRichKidDancing) && (
          <div
            className={`absolute left-1/2 bottom-1 -translate-x-1/2 rounded-full pointer-events-none ${
              isRichKidDancing
                ? 'w-16 h-6 bg-yellow-400/50 border-2 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.95)] animate-pulse'
                : pilgrim.hasGoldenAura
                ? 'w-14 h-5 bg-amber-400/35 border border-amber-300/80 shadow-[0_0_14px_rgba(251,191,36,0.75)]'
                : 'w-11 h-4 bg-amber-400/20 border border-amber-300/50'
            }`}
          />
        )}

        {/* Quà tặng / Bó hoa hồng cầm trên tay khi học sinh đang đi tặng Cô Giáo / Thầy Giám Thị */}
        {isHoldingGiftUp && (
          <div
            className={`absolute left-1/2 -top-8 -translate-x-1/2 z-30 ${
              pilgrim.state === 'throw_offering_at_burner' ||
              pilgrim.state === 'throw_flower_at_teacher'
                ? 'animate-ping'
                : 'animate-bounce'
            }`}
          >
            {pilgrim.state === 'walk_to_teacher_gift' ||
            pilgrim.state === 'throw_flower_at_teacher' ||
            pilgrim.giftActionKind === 'rose' ||
            pilgrim.giftActionKind === 'icecream' ? (
              <RoseBouquetModel
                customUrl={customAssets.roseBouquetUrl}
                scale={giftModelScales?.roseBouquet ?? 1}
              />
            ) : (
              <div className="p-1 rounded-full bg-amber-400/25 border border-amber-300/70 shadow-md">
                <SchoolGiftArt
                  type={pilgrim.offeringType}
                  customAssets={customAssets}
                  size="md"
                />
              </div>
            )}
          </div>
        )}

        {/* HÌNH NHÂN VẬT HỌC SINH CẤP 3 */}
        {customFrameSrc ? (
          <img
            src={customFrameSrc}
            alt={pilgrim.username}
            className="w-16 h-24 object-contain select-none pointer-events-none"
            style={{
              transform:
                (frameIdx === 8 || frameIdx === 9) && pilgrim.facingLeft
                  ? 'scaleX(-1)'
                  : undefined,
            }}
          />
        ) : useDefaultPngModels && processedDefaultModelSrc ? (
          <div
            className="w-16 h-24 relative flex items-end justify-center"
            style={{
              transform:
                !isSeated && isWalking
                  ? `translateY(${(Math.abs(stepPhase) * -2.2).toFixed(1)}px)`
                  : undefined,
            }}
          >
            <img
              src={processedDefaultModelSrc}
              alt={pilgrim.username}
              className={
                isSeated
                  ? 'w-14 h-[78px] object-contain object-bottom select-none pointer-events-none'
                  : 'w-16 h-24 object-contain object-bottom select-none pointer-events-none'
              }
            />
          </div>
        ) : (
          <div
            className="w-15 h-22 relative flex items-center justify-center"
            style={{
              transform:
                (frameIdx === 8 || frameIdx === 9) && pilgrim.facingLeft
                  ? 'scaleX(-1)'
                  : undefined,
            }}
          >
            <svg viewBox="0 0 64 88" className="w-full h-full overflow-visible">
              {/* Chân & Giày học sinh (Ẩn bớt khi đang ngồi trong hốc bàn đôi) */}
              {!isSeated ? (
                <g>
                  {/* Chân trái */}
                  <rect
                    x="23"
                    y={isWalking ? 58 + stepPhase * 2.8 : 58}
                    width="7"
                    height="19"
                    rx="3"
                    fill="#1e293b"
                  />
                  <ellipse
                    cx="26.5"
                    cy={isWalking ? 78 + stepPhase * 2.8 : 78}
                    rx="4.5"
                    ry="2.5"
                    fill="#ffffff"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* Chân phải */}
                  <rect
                    x="34"
                    y={isWalking ? 58 - stepPhase * 2.8 : 58}
                    width="7"
                    height="19"
                    rx="3"
                    fill="#1e293b"
                  />
                  <ellipse
                    cx="37.5"
                    cy={isWalking ? 78 - stepPhase * 2.8 : 78}
                    rx="4.5"
                    ry="2.5"
                    fill="#ffffff"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                </g>
              ) : (
                /* Khi ngồi ở bàn đôi: phần chân thu gọn dưới ghế */
                <g>
                  <rect x="22" y="54" width="8" height="12" rx="3" fill="#1e293b" />
                  <rect x="34" y="54" width="8" height="12" rx="3" fill="#1e293b" />
                </g>
              )}

              {/* Thân áo sơ mi trắng đồng phục học sinh cấp 3 */}
              <g
                transform={
                  isGreetingTeacher ? 'translate(0, 2) rotate(4 32 50)' : undefined
                }
              >
                <rect
                  x="18"
                  y="32"
                  width="28"
                  height="26"
                  rx="7"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1.4"
                />

                {/* Cổ áo sơ mi & Cà vạt / Nơ cổ (nếu nhìn mặt trước) hoặc Balo / Cổ áo (nếu nhìn từ sau lưng) */}
                {isFrontView ? (
                  <g>
                    <polygon points="25,32 32,39 39,32" fill="#e2e8f0" />
                    {pilgrim.gender === 'female' ? (
                      /* Nữ sinh: Nơ cổ đỏ hồng duyên dáng + Vạt áo eo thon */
                      <g>
                        <polygon points="28,35 32,38 28,41" fill="#f43f5e" />
                        <polygon points="36,35 32,38 36,41" fill="#f43f5e" />
                        <circle cx="32" cy="38" r="1.8" fill="#be123c" />
                        <polygon points="30.8,39 33.2,39 34,49 30,49" fill="#fb7185" />
                      </g>
                    ) : (
                      /* Nam sinh: Cà vạt xanh navy mạnh mẽ */
                      <polygon
                        points="32,35.5 29.2,48 32,52.5 34.8,48"
                        fill="#1d4ed8"
                      />
                    )}
                    {/* Phù hiệu trường trên ngực trái */}
                    <rect
                      x="36"
                      y="38"
                      width="5.5"
                      height="4"
                      rx="1"
                      fill="#facc15"
                      stroke="#b45309"
                      strokeWidth="0.6"
                    />
                  </g>
                ) : (
                  <g>
                    {/* Quai cặp / Balo học sinh đeo sau lưng khi đi bộ, hoặc cổ áo khi ngồi bàn */}
                    {!isSeated ? (
                      <g>
                        <rect
                          x="21"
                          y="35"
                          width="22"
                          height="19"
                          rx="5"
                          fill={pilgrim.gender === 'female' ? '#ec4899' : '#0284c7'}
                          stroke="#0f172a"
                          strokeWidth="1"
                        />
                        <rect
                          x="24"
                          y="42"
                          width="16"
                          height="8"
                          rx="2"
                          fill={pilgrim.gender === 'female' ? '#f9a8d4' : '#38bdf8'}
                          fillOpacity="0.45"
                        />
                      </g>
                    ) : (
                      <g>
                        {/* Bờ vai áo sơ mi trắng học sinh ngồi học nghiêm túc */}
                        <path
                          d="M21 34 Q32 38 43 34"
                          stroke={pilgrim.gender === 'female' ? '#f43f5e' : '#3b82f6'}
                          strokeWidth="1.8"
                          fill="none"
                        />
                      </g>
                    )}
                  </g>
                )}

                {/* Cánh tay trái */}
                <rect
                  x="12"
                  y={isHoldingGiftUp ? 18 : 34}
                  width="6.5"
                  height="18"
                  rx="3"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />

                {/* Cánh tay phải (Giơ cao tay phát biểu ✋ khi có bình luận / đang đọc TTS!) */}
                {isRaisingHand ? (
                  <g>
                    <rect
                      x="44"
                      y="14"
                      width="6.5"
                      height="22"
                      rx="3"
                      fill="#ffffff"
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />
                    {/* Bàn tay giơ cao phát biểu */}
                    <circle cx="47.2" cy="12" r="4" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />
                  </g>
                ) : (
                  <rect
                    x="45.5"
                    y={isHoldingGiftUp ? 18 : 34}
                    width="6.5"
                    height="18"
                    rx="3"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                  />
                )}

                {/* Đầu & Mái tóc học sinh cấp 3 */}
                <circle
                  cx="32"
                  cy="19"
                  r="12.5"
                  fill="#fde68a"
                  stroke="#d97706"
                  strokeWidth="1"
                />

                {isFrontView ? (
                  <g>
                    {/* Mắt & Nụ cười mặt trước */}
                    <circle cx="27.5" cy="19.5" r="1.6" fill="#0f172a" />
                    <circle cx="36.5" cy="19.5" r="1.6" fill="#0f172a" />
                    <path
                      d="M28.5 24 Q32 26.8 35.5 24"
                      stroke="#e11d48"
                      strokeWidth="1.4"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {pilgrim.gender === 'female' ? (
                      /* Mái tóc Nữ sinh mặt trước: Tóc mái mềm + 2 lọn tóc dài hai bên + kẹp nơ hồng */
                      <>
                        <path
                          d="M19 18 C19 5.5 45 5.5 45 18 C42 12 36 10 32 10 C27 10 22 12 19 18 Z"
                          fill={hairColor}
                        />
                        <path
                          d="M19 16 C16 23 16 32 20 35"
                          stroke={hairColor}
                          strokeWidth="4.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M45 16 C48 23 48 32 44 35"
                          stroke={hairColor}
                          strokeWidth="4.2"
                          strokeLinecap="round"
                        />
                        <circle cx="42" cy="11.5" r="2.6" fill="#f43f5e" />
                      </>
                    ) : (
                      /* Mái tóc Nam sinh mặt trước: Tóc ngắn cắt gọn nam tính có chỏm tóc trên đỉnh */
                      <>
                        <path
                          d="M19.5 17.5 C19.5 5 44.5 5 44.5 17.5 C42 11.5 36.5 9.5 32 9.5 C27 9.5 22 11.5 19.5 17.5 Z"
                          fill={hairColor}
                        />
                        <polygon points="29,7 32,2.5 35,7" fill={hairColor} />
                        <polygon points="34,7.5 38,3.5 39,8" fill={hairColor} />
                      </>
                    )}
                  </g>
                ) : (
                  /* Mặt sau mái tóc gọn gàng (Nữ buộc tóc đuôi gà + nơ hồng, Nam cắt gọn có chỏm tóc) */
                  <g>
                    <path
                      d="M19.5 20 C19.5 6 44.5 6 44.5 20 C44.5 26 39 29 32 29 C25 29 19.5 26 19.5 20 Z"
                      fill={hairColor}
                    />
                    {pilgrim.gender === 'female' ? (
                      <g>
                        {/* Nơ buộc tóc nữ sinh */}
                        <polygon points="27,21 32,23.5 27,26" fill="#f43f5e" />
                        <polygon points="37,21 32,23.5 37,26" fill="#f43f5e" />
                        <circle cx="32" cy="23.5" r="2.5" fill="#be123c" />
                        {/* Đuôi tóc dài */}
                        <path
                          d="M32 25 C28.5 32 29.5 39 32 42 C34.5 39 35.5 32 32 25 Z"
                          fill={hairColor}
                        />
                      </g>
                    ) : (
                      <g>
                        {/* Tóc gáy cắt gọn + chỏm tóc nam sinh */}
                        <polygon points="29,7 32,2.5 35,7" fill={hairColor} />
                        <polygon points="34,7.5 38,3.5 39,8" fill={hairColor} />
                      </g>
                    )}
                  </g>
                )}
              </g>
            </svg>
          </div>
        )}
      </div>

      {/* BẢNG TÊN HỌC SINH + AVATAR TIKTOK SÁT MÉP NGOÀI THẺ TÊN */}
      <div
        className="absolute left-0 flex flex-col items-center pointer-events-none"
        style={{
          top: feetBottomOffsetPx + (nameTagOffsetY || 0),
          transform: `translate(-50%, 0) scale(${(nameTagScale || 1).toFixed(2)})`,
          transformOrigin: '50% 0%',
          zIndex: showChatBubble || isSpeakingBubble ? 9998 : 30,
        }}
      >
        <div
          style={{ fontFamily: nameTagFontFamily }}
          className={`pl-0 pr-1.5 py-0 rounded-full flex items-center gap-1 border shadow-sm whitespace-nowrap ${
            pilgrim.isGoldenPriority || isRichKidDancing
              ? 'bg-amber-950/95 border-yellow-300 text-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.85)]'
              : isSpeakingBubble
              ? 'bg-pink-950/95 border-pink-400 text-pink-200 shadow-[0_0_10px_rgba(244,114,182,0.75)]'
              : showChatBubble
              ? 'bg-slate-950/95 border-sky-400 text-sky-100 shadow-[0_0_8px_rgba(56,189,248,0.65)]'
              : pilgrim.isVip
              ? 'bg-amber-950/90 border-amber-400/80 text-amber-200'
              : 'bg-slate-950/85 border-slate-700/80 text-slate-100'
          }`}
        >
          {pilgrim.avatarUrl ? (
            <img
              src={pilgrim.avatarUrl}
              alt=""
              className="w-4 h-4 rounded-full object-cover border border-white/40 shrink-0 -ml-px"
            />
          ) : (
            <span
              className="w-4 h-4 rounded-full shrink-0 inline-block border border-white/30 -ml-px"
              style={{ backgroundColor: pilgrim.avatarColor }}
            />
          )}
          <span
            className={`text-[9.5px] font-bold tracking-tight py-0.5 ${
              pilgrim.isGoldenPriority || isRichKidDancing
                ? 'text-yellow-300 font-black'
                : ''
            }`}
          >
            {displayUsername}
          </span>
          {(pilgrim.isVip || pilgrim.isGoldenPriority || isRichKidDancing) && (
            <span className="text-[8px] font-extrabold text-yellow-300">
              {pilgrim.isGoldenPriority || isRichKidDancing ? '👑' : '★'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
