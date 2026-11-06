export type TTSEngineType = 'node_edge' | 'google_stream' | 'web_speech' | 'monk_zen';

export type SafetyActionMode = 'purify' | 'block' | 'mask';

export type OfferingGiftType =
  | 'incense'
  | 'rose'
  | 'lotus'
  | 'tray'
  | 'special_tray'
  | 'icecream'
  | 'cat'
  | 'gg'
  | 'heart'
  | 'pig'
  | 'vip';

export type ClassroomGiftEventId =
  | 'rose'      // (1) Hoa hồng: Tặng hoa cho cô (+10đ)
  | 'icecream'  // (1) Kem: Tặng hoa cho thầy (+10đ)
  | 'cat'       // (1) Con mèo: Nuôi mèo (+10đ)
  | 'gg'        // (1) GG: Ăn vụn (+10đ)
  | 'heart'     // (5) Bắn tim: Điện thoại reo - Đổi skin bàn PC Gaming (+20đ)
  | 'pig'       // (10) Heo: Thả heo hù dọa (+40đ, thả 5 heo trừ -20đ 5 bạn top đầu)
  | 'vip';      // (10+) VIP: Tôi là Rich Kid (+99đ bản thân, +30đ cả lớp, nhảy trên bàn + mưa tiền 5s)

export interface GiftModelScalesConfig {
  roseBouquet: number;
  deskCat: number;
  snackBag: number;
  pcGamingDesk: number;
  runningPig: number;
  fallingMoney: number;
}

export type GiftSoundMp3Map = Partial<Record<ClassroomGiftEventId, string | null>>;
export type GiftSoundTitleMap = Partial<Record<ClassroomGiftEventId, string>>;

export type ZombieProjectileKind =
  | 'pencil_case'
  | 'book'
  | 'chair'
  | 'desk_mate';

export type ZombieEventPhase =
  | 'idle'
  | 'queued'
  | 'z_flow_1_intro'
  | 'z_flow_2_spawn'
  | 'z_flow_3_teacher'
  | 'z_flow_4_supervisor'
  | 'z_flow_5_combat'
  | 'z_flow_5b_dying'
  | 'z_flow_6_celebration';

export interface ZombieEntityState {
  visible: boolean;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isWalking: boolean;
  facing: 'left' | 'right' | 'down' | 'up';
  recoilOffsetX: number;
  recoilOffsetY: number;
  isDying: boolean;
  dyingProgress: number;
  animTime: number;
  hitFlashUntil: number;
}

export interface ZombieProjectileFX {
  id: string;
  kind: ZombieProjectileKind;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  createdAt: number;
  durationMs: number;
  damage: number;
  attackerUsername?: string;
  username?: string;
}

export interface ZombieSpikyDamageFX {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx?: number;
  ty?: number;
  damage: number;
  scale: number;
  createdAt: number;
}

export interface FlyingMilkTeaFX {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  createdAt: number;
  durationMs: number;
}

export interface ZombieDamageEntry {
  username: string;
  damage: number;
  avatarUrl?: string | null;
  avatarColor?: string;
  isSeated?: boolean;
}

export interface ZombieEventRuntimeState {
  isActive: boolean;
  isQueued: boolean;
  phase: ZombieEventPhase;
  level: number;
  hp: number;
  maxHp: number;
  trailHp: number;
  hpShakeKey: number;
  topDamagers: ZombieDamageEntry[];
  activeFlowToken?: string;
  ttsFinishedForPhase?: boolean;
  elapsedPhaseMs?: number;
  timeLeftMs: number;
  totalDurationMs: number;
  resumeLessonAfterEvent?: boolean;
}

export interface RectBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface GridConfig {
  rows: number;
  cols: number; // Số chỗ ngồi mỗi hàng (luôn = deskCols * 2)
  vipCount: number; // Tổng số chỗ ngồi bàn đầu VIP (luôn = vipDesks * 2)
  vipRows?: number;
  deskCols?: number; // Số dãy bàn đôi ngang mỗi hàng (1..5, mặc định 3 dãy bàn đôi)
  vipDesks?: number; // Tổng số bàn đôi VIP đầu lớp (mỗi bàn = 2 chỗ ngồi)
  normalDesks?: number; // Tổng số bàn đôi thường (mỗi bàn = 2 chỗ ngồi)
  yTop: number;
  yBottom: number;
  topWidth: number;
  bottomWidth: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface HudBoxPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BgmTrackItem {
  id: string;
  title: string;
  url: string | null;
  presetType?: 'zen_bowl' | 'lotus_flute';
}

export interface DharmaArticleItem {
  id: string;
  title: string;
  content: string;
}

export interface GuideTaskItem {
  id: string;
  label: string;
  shortDesc: string;
  modelType?: OfferingGiftType | 'none';
  colorTheme?: 'pink' | 'amber' | 'yellow' | 'emerald' | 'stone' | 'cyan';
}

export type ClassBoardEngineId = 'english_quiz' | 'result_board' | 'notice';

export type ClassBoardLetterMode = 'hint' | 'blank' | 'full';

export interface EnglishQuizItem {
  id: string;
  vi: string;
  en: string;
  phonetic?: string;
  luckyStars?: 1 | 2 | 3;
  deckName?: string;
}

export interface ClassBoardQuizWinner {
  username: string;
  elapsedSec: number;
  points?: number;
  isSeated?: boolean;
  avatarUrl?: string | null;
  avatarColor?: string;
  pilgrimId?: number;
  isBot?: boolean;
}

export type AnswerRevealSfxPreset =
  | 'chime_sparkle'
  | 'victory_fanfare'
  | 'retro_levelup';

export type ClassBoardLessonPhase =
  | 'lesson_start'    // Luồng 0: Bắt đầu chạy tiết học (chỉ nói 1 lần khi bắt đầu tiết học) [Nói xong chuyển luồng next]
  | 'preparing'       // Luồng 1: Đọc "chuẩn bị" - Bảng chuẩn bị + bắt đầu sau 3,2,1 (mặc định 3s) [Thời gian 3s]
  | 'asking'          // Luồng 2 & 3: Đọc câu hỏi + Đợi trả lời / Gợi ý (tính chung, mặc định 12s)
  | 'answer_flash'    // Luồng 4: Đọc câu trả lời - Bảng câu trả lời [Nói xong chuyển luồng next]
  | 'result_summary'  // Luồng 5: Đọc kết quả & Cập nhật chỗ ngồi ngay khi bắt đầu luồng 5 [Nói xong chuyển luồng next]
  | 'ranking_board'   // Luồng 6: Đọc xếp hạng - Bảng xếp hạng trong lớp (6 top đầu 3s, sau đó mỗi 2s load 6 top tiếp theo) [Nói xong kết thúc luồng]
  | 'punishment_notice' // Luồng Thông Báo Phạt (sau Luồng 6 nếu có quà 5 / 10 / 10+)
  | 'reveal';

export interface ClassBoardRuntimeState {
  engine: ClassBoardEngineId;
  isRunning: boolean;
  questionIndex: number;
  totalQuestions?: number;
  currentQuestion?: EnglishQuizItem;
  phase: ClassBoardLessonPhase;
  lessonStepNumber?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  lessonStartText?: string;
  punishmentNoticeText?: string;
  punishedStudents?: Array<{ username: string; multiplier: 3 | 6 | 9 }>;
  activeFlowToken?: string;
  ttsFinishedForPhase?: boolean;
  elapsedPhaseMs?: number;
  timeLeftMs: number;
  totalDurationMs: number;
  winners: ClassBoardQuizWinner[];
  classWinners?: ClassBoardQuizWinner[];
  outsideWinners?: ClassBoardQuizWinner[];
  showResultEngine?: boolean;
  seatUpdateTriggered?: boolean;
}

export type HudCycleAnimMode = 'slide_right' | 'fade';

export interface HudBoxCycleConfig {
  enabled: boolean;
  hiddenSec: number; // x giây: thời gian ẩn
  visibleSec: number; // y giây: thời gian hiển thị ở vị trí ban đầu
  mode: HudCycleAnimMode; // 'slide_right' (đẩy sang phải ra ngoài màn hình) | 'fade' (fade biến mất)
  animSpeedSec: number; // tốc độ animation (giây)
}

export interface HudLayoutConfig {
  templeSign: HudBoxPosition;
  classBoardBox: HudBoxPosition;
  lotusLeaderboardBox: HudBoxPosition;
  guideBox: HudBoxPosition;
  toastBox: HudBoxPosition;
  grandEventBox: HudBoxPosition;
  pilgrimCountBox: HudBoxPosition;
  waitingQueueBox?: HudBoxPosition;
  noticeBoardBox: HudBoxPosition;
  note1Box?: HudBoxPosition;
  lotusLeaderboardTitle: string;
  guideTitle: string;
  grandEventTitle: string;
  pilgrimCountTitle: string;
  waitingQueueTitle?: string;
  noticeBoardTitle: string;
  noticeBoardContent: string;
  noticeBoardFontSize: number;
  note1Title?: string;
  note1Content?: string;
  note1FontSize?: number;
  note1Opacity?: number;
  showNote1Box?: boolean;
  guideCycle?: HudBoxCycleConfig;
  lotusLeaderboardCycle?: HudBoxCycleConfig;
  noticeBoardCycle?: HudBoxCycleConfig;
  classBoardFontSize?: number;
  classBoardOpacity?: number;
  classBoardBlur?: number;
  classBoardEngine?: ClassBoardEngineId;
  classBoardLetterMode?: ClassBoardLetterMode;
  classBoardQuestionDurationSec?: number;
  classBoardRevealDurationSec?: number;
  classBoardNpcParticipate?: boolean;
  classBoardTtsReadQuestion?: boolean;
  showClassBoardBox?: boolean;
  grandEventFontSize?: number;
  lotusLeaderboardFontSize?: number;
  guideFontSize?: number;
  pilgrimCountFontSize?: number;
  waitingQueueFontSize?: number;
  toastFontSize?: number;
  showTempleSign?: boolean;
  showGrandEventBox?: boolean;
  showPilgrimCountBox?: boolean;
  showQueueInPilgrimCountBox?: boolean;
  showWaitingQueueBox?: boolean;
  showLotusLeaderboardBox?: boolean;
  showGuideBox?: boolean;
  showNoticeBoardBox?: boolean;
  showToastBox?: boolean;
  showNewPilgrimToast?: boolean;
  lotusLeaderboardMaxRanks?: number;
  waitingQueueMaxRanks?: number;
  lotusFloatingScoreFontSize?: number;
  hudOpacity?: number;
  noticeBoardOpacity?: number;
  grandEventOpacity?: number;
  lotusLeaderboardOpacity?: number;
  guideOpacity?: number;
  pilgrimCountOpacity?: number;
  waitingQueueOpacity?: number;
  toastOpacity?: number;
  templeSignOpacity?: number;
  guideItems?: GuideTaskItem[];
  editLayoutMode: boolean;
}

export interface CustomAssetsConfig {
  customBgUrl: string | null;
  deskModelUrl?: string | null;
  templeSignPngUrl: string | null;
  pilgrimFemaleSpritesheetUrl: string | null;
  pilgrimMaleSpritesheetUrl: string | null;
  abbotSpritesheetUrl: string | null;
  seniorNoviceSpritesheetUrl: string | null;
  juniorNoviceSpritesheetUrl: string | null;
  offeringIncenseUrl: string | null;
  offeringRoseUrl: string | null;
  offeringLotusUrl: string | null;
  offeringTrayUrl: string | null;
  // 6 Model hình ảnh sự kiện Quà Tặng Lớp Học (vẽ sẵn + cho phép upload thay thế)
  roseBouquetUrl?: string | null;
  deskCatUrl?: string | null;
  snackBagUrl?: string | null;
  pcGamingDeskUrl?: string | null;
  runningPigUrl?: string | null;
  fallingMoneyUrl?: string | null;
  // Các Model Sự Kiện Zombie Tấn Công
  zombieSpriteUrl?: string | null;
  projPencilCaseUrl?: string | null;
  projBookUrl?: string | null;
  projChairUrl?: string | null;
  projDeskMateUrl?: string | null;
  milkTeaCupUrl?: string | null;
}

export interface GameConfig {
  ttsEnabled: boolean;
  ttsVipOnly: boolean;
  ttsEngine: TTSEngineType;
  nodeVoice: string;
  nodeTtsEndpoint: string;
  selectedSystemVoiceURI: string;
  ttsRate: number;
  englishTtsRate?: number;
  ttsPitch: number;
  ttsVolume: number;
  ttsReverb?: number;
  ttsTemplate: string;
  maxTtsWords: number;
  maxTtsQueueSize?: number;

  // Nhạc nền, Trống trường & Gõ thước
  bgmEnabled: boolean;
  bgmVolume: number;
  bgmTracks: BgmTrackItem[];
  activeBgmTrackId: string;

  bellEnabled: boolean;
  bellMp3Url: string | null;
  bellMp3Title: string;
  bellIntervalSec: number;

  woodenFishEnabled: boolean;
  woodenFishMp3Url: string | null;
  woodenFishMp3Title: string;
  woodenFishIntervalSec: number;

  // Âm thanh hiệu ứng khi hiển thị Đáp Án 2s ("Đáp án là:")
  answerRevealSfxEnabled?: boolean;
  answerRevealSfxPreset?: AnswerRevealSfxPreset;
  answerRevealMp3Url?: string | null;
  answerRevealMp3Title?: string;

  // Âm thanh khi bắt đầu thực hiện tặng quà (7 món quà sự kiện)
  giftSoundEnabled?: boolean;
  giftSoundMp3Urls?: GiftSoundMp3Map;
  giftSoundMp3Titles?: GiftSoundTitleMap;

  // Kích thước (size scale) của 6 Model Sự Kiện Quà Tặng
  giftModelScales?: GiftModelScalesConfig;

  // Chế độ Giảng bài / Đố vui trên lớp
  dharmaEnabled: boolean;
  dharmaAutoNext: boolean;
  dharmaArticles: DharmaArticleItem[];
  activeDharmaId: string;

  // Mẫu câu đọc sự kiện (Vào lớp, Tặng quà, Phát biểu)
  realWelcomeTtsEnabled: boolean;
  realWelcomeTtsTemplate: string;
  npcWelcomeTtsEnabled: boolean;
  npcWelcomeTtsTemplate: string;
  welcomeTtsTemplates: string[];

  realGiftTtsEnabled: boolean;
  realGiftTtsTemplate: string;
  npcGiftTtsEnabled: boolean;
  npcGiftTtsTemplate: string;
  giftTtsTemplates: string[];

  realPrayerTtsEnabled: boolean;
  realPrayerTtsTemplate: string;
  npcPrayerTtsEnabled: boolean;
  npcPrayerTtsTemplate: string;
  prayerTtsTemplates: string[];

  // Luồng lời nói của Cô Giáo cho Tiết Học (Luồng 0 -> 6) & Bộ câu hỏi tùy chỉnh (.txt)
  lessonStartTtsText?: string;
  lessonPrepareTtsText?: string;
  lessonPrepareDurationSec?: number;
  lessonQuestionTtsTemplate?: string;
  lessonAnswerTtsTemplate?: string;
  quizResultTtsEnabled?: boolean;
  quizResultTtsTemplate?: string;
  quizResultTtsTemplates?: string[];
  lessonRankingTtsTemplate?: string;
  lessonPunishmentSingleTtsTemplate?: string;
  lessonPunishmentMultiTtsTemplate?: string;
  customQuizQuestions?: EnglishQuizItem[];
  quizDecks?: Array<{ id: string; name: string; questions: EnglishQuizItem[] }>;
  activeQuizDeckId?: string;
  quizQueueLimitDisplay?: number;
  shuffleBeforeEnqueue?: boolean;
  luckyStarRatio1?: number; // % câu hỏi 1 sao (x1 điểm)
  luckyStarRatio2?: number; // % câu hỏi 2 sao (x2 điểm)
  luckyStarRatio3?: number; // % câu hỏi 3 sao (x3 điểm)

  // Tốc độ di chuyển của học sinh (sắp xếp lớp vs lên tặng hoa Thầy/Cô)
  studentSeatingSpeed?: number; // Tốc độ di chuyển vào lớp / xếp chỗ ngồi (default: 110)
  studentGiftSpeed?: number; // Tốc độ di chuyển lên tặng hoa cho Thầy và Cô (default: 185)

  // Bong bóng lời giảng của Giáo viên
  abbotBubbleEnabled: boolean;
  teacherBubbleScale?: number;
  supervisorBubbleScale?: number;

  // Live Text-to-Audio (Giọng đọc riêng ưu tiên của Chủ Phòng / Giáo Viên)
  hostTtsEngine: TTSEngineType;
  hostNodeVoice: string;
  hostSystemVoiceURI: string;
  hostTtsRate: number;
  hostTtsPitch: number;
  hostTtsVolume: number;
  hostTtsReverb: number;
  hostTtsInterrupt: boolean;
  hostTtsSpeakerRole: 'abbot' | 'senior_novice' | 'junior_novice' | 'none';
  hostQuickPhrases: string[];

  showWaypoints: boolean;
  showZoneBounds: boolean;
  maxStageCapacity: number;
  autoCrowd: boolean;
  botTargetCrowd: number;
  botVipPercent: number;
  npcCorrectAnswerPercent?: number;
  npcSpawnIntervalSec: number;
  npcPrayIntervalSec: number;
  prayDurationSec: number;
  vipPrayDurationSec: number;
  normalPrayDurationSec: number;

  // Camera thông minh bám theo giọng đọc TTS
  cameraFollowCommentEnabled: boolean;
  cameraFollowRealUser: boolean;
  cameraFollowNpc: boolean;
  cameraHoldDurationSec: number;
  cameraPushOnGiftEnabled: boolean;
  cameraSpecialGiftLockSec: number;
  cameraZoomScale: number;
  cameraSmoothSpeed: number;
  cameraFocusOffsetX: number;
  cameraFocusOffsetY: number;

  deskScale?: number;
  studentDeskGap?: number;
  characterScale: number;
  femaleTeacherScale?: number;
  maleTeacherScale?: number;
  useDefaultPngModels?: boolean;
  teacherAboveClassBoard?: boolean;
  nameTagFontFamily: string;
  nameTagScale: number;
  nameTagMaxChars?: number;
  nameTagOffsetY?: number;
  chatBubbleFontFamily: string;
  chatBubbleScale: number;
  chatBubbleDurationSec: number;
  chatBubbleMaxChars?: number;
  chatBubbleMaxWidth?: number;
  chatBubbleMaxHeight?: number;
  chatBubbleFontSize?: number;
  chatBubbleOffsetY?: number;
  chatBubbleOffsetX?: number;
  grandEventTarget: number;
  maxFlyingLotuses: number;
  spawnPoint: Point2D;
  exitPoint: Point2D;
  doorCrowdPos?: Point2D; // Vị trí nhóm học sinh đứng chùm ngay cửa lớp
  doorCrowdCount?: number; // Số lượng học sinh đứng chùm ở cửa lớp (5-10)
  doorCrowdSpread?: number; // Độ phân bố / giãn cách giữa các học sinh đứng chùm cửa lớp
  punishmentLinePos?: Point2D; // Tâm hàng ngang 5 chỗ phạt trước bục giảng
  punishmentLineSpacing?: number; // Khoảng cách ngang giữa 5 chỗ phạt
  // Cấu hình Sự Kiện "Zombie tấn công"
  zombieEventEnabled?: boolean;
  zombieMaxHp?: number;
  zombieLevel?: number;
  zombieScale?: number;
  zombieSpawnPos?: Point2D;
  zombieStandPos?: Point2D;
  zombieTeacherPos?: Point2D;
  zombieSupervisorPos?: Point2D;
  zombieHeartBatchIntervalMs?: number;
  zombieNpcAutoAttack?: boolean;
  zombieGrowlMp3Url?: string | null;
  zombieGrowlMp3Title?: string;
  // Cấu hình chi tiết lời thoại & thời gian các luồng Sự Kiện Zombie (Luồng 1 -> 6)
  zombieFlow1Title?: string;
  zombieFlow1Subtitle?: string;
  zombieFlow1MinDurationSec?: number;
  zombieFlow2LockCameraSec?: number;
  zombieFlow2MaxDurationSec?: number;
  zombieFlow3TeacherDialog?: string;
  zombieFlow3MinDurationSec?: number;
  zombieFlow4SupervisorDialog?: string;
  zombieFlow4MinDurationSec?: number;
  zombieFlow5bDyingDurationSec?: number;
  zombieFlow6BoardTitle?: string;
  zombieFlow6Speech1Template?: string;
  zombieFlow6Speech2Template?: string;
  zombieFlow6MinDurationSec?: number;
  incenseBurner: Point2D; // Vị trí học sinh đứng trước bàn Giáo viên để nộp bài / tặng quà
  offeringTrayPos: Point2D; // Vị trí đặt quà trên bàn Giáo viên
  monkZone: RectBounds; // Khu vực bục giảng của Cô Giáo
  supervisorZone?: RectBounds; // Khu vực di chuyển của Thầy Giám Thị
  redPrayZones: {
    left: RectBounds;
    right: RectBounds;
  };
  grid: GridConfig;
  hudLayout: HudLayoutConfig;
}

/**
 * Vị trí chỗ ngồi trên bàn đôi (2 chỗ / 1 bàn đôi)
 */
export interface KneelSlot {
  id: string;
  x: number;
  y: number;
  side: 'left' | 'right';
  deskId?: string;
  seatSide?: 'left' | 'right';
  deskCenterX?: number;
  deskCenterY?: number;
  aisleX?: number;
  row?: number;
  col?: number;
  deskCol?: number;
  isVip: boolean;
  occupiedById: number | null;
}

export type PilgrimState =
  | 'walk_in_up'
  | 'throw_offering_at_burner'
  | 'ceremony_at_burner'
  | 'walk_to_teacher_gift'
  | 'throw_flower_at_teacher'
  | 'return_to_seat_from_gift'
  | 'walk_to_punishment_spot'
  | 'stand_punishment'
  | 'return_from_punishment_to_seat'
  | 'walk_to_vip_check'
  | 'wait_for_vip_slot'
  | 'walk_carpet_to_slot_y'
  | 'walk_side_to_slot'
  | 'walk_vert_to_slot'
  | 'pray_seated'
  | 'leave_side_to_aisle'
  | 'leave_down_exit';

export type PilgrimFrameIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PilgrimData {
  id: number;
  username: string;
  prayer: string;
  gender: 'female' | 'male';
  isVip: boolean;
  isBot: boolean;
  coins: number;
  offeringType: OfferingGiftType;
  slotId: string | null;
  x: number;
  y: number;
  laneX: number;
  slotX: number;
  slotY: number;
  speed: number;
  state: PilgrimState;
  stateTimer: number;
  prayTimer: number;
  totalPrayDuration: number;
  animTime: number;
  facingLeft: boolean;
  avatarColor: string;
  avatarUrl?: string | null;
  hairSeed: number;
  hasGoldenAura?: boolean;
  isCarryingGift?: boolean;
  hasComment?: boolean;
  comboCount?: number;
  comboUntil?: number;
  giftName?: string;
  comboPopKey?: number;
  totalFlowersToThrow?: number;
  flowersThrownCount?: number;
  flowerBurstsDoneCount?: number;
  lotusBurstUntil?: number;
  lotusBurstKey?: number;
  chatBubbleUntil?: number;
  woodenFishRippleUntil?: number;
  hasSatOnce?: boolean;
  pendingGiftCoins?: number;
  isSimulatedTest?: boolean;
  answeredCurrentQuestion?: boolean;
  quizResultStatus?: 'correct' | 'wrong' | null;
  quizResultUntil?: number;
  quizEarnedPoints?: number;
  pathWaypoints?: Point2D[];
  // Các trạng thái Sự Kiện Quà Tặng Lớp Học:
  isGoldenPriority?: boolean;
  giftTargetPos?: Point2D;
  giftTargetRole?: 'abbot' | 'senior_novice';
  giftActionKind?: ClassroomGiftEventId;
  hasDeskCat?: boolean;
  deskCatDropAt?: number;
  hasDeskSnack?: boolean;
  deskSnackDropAt?: number;
  hasPcGamingDesk?: boolean;
  pcGamingDeskAt?: number;
  richKidDanceUntil?: number;
  floatingScoreText?: string;
  floatingScoreColor?: 'green' | 'gold' | 'red';
  floatingScoreUntil?: number;
  floatingScoreKey?: number;
  punishmentMultiplier?: 3 | 6 | 9;
  punishmentSpotIndex?: number;
  punishmentSpotPos?: Point2D;
  isPunishedInCurrentRound?: boolean;
  isDetachedFlowerRunner?: boolean;
  leaveAfterGiftAction?: boolean;
  giftActionBusyUntil?: number;
}

export interface RunningPigAgent {
  id: string;
  x: number;
  y: number;
  targetPilgrimId: number;
  targetUsername: string;
  targetX?: number;
  targetY?: number;
  waypoints: Point2D[];
  waypointIndex: number;
  speed: number;
  facingLeft: boolean;
  animTime: number;
}

export interface FlyingFlowerFX {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  createdAt: number;
  durationMs?: number;
  donorUsername?: string;
  targetRole?: 'abbot' | 'senior_novice';
}

export interface SimpleExplosionFX {
  id: string;
  x: number;
  y: number;
  kind: 'flower' | 'pig';
  label?: string;
  createdAt: number;
}

export interface BurnerLotusBurstFX {
  id: string;
  x: number;
  y: number;
  lotusPoints?: number;
  createdAt: number;
}

export interface FlyingLotusFX {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  createdAt: number;
}

export type CameraFocusReason = 'comment' | 'gift' | 'special_gift' | 'manual' | 'host_live';

export interface CameraQueueItem {
  id: string;
  pilgrimId: number;
  username: string;
  reason: CameraFocusReason;
  isBot: boolean;
  holdSec: number;
  lockSec: number;
  addedAt: number;
}

export interface CameraFocusState {
  pilgrimId: number | null;
  focusRole?: 'zombie' | 'abbot' | 'senior_novice' | null;
  customZoom?: number;
  username?: string;
  reason?: CameraFocusReason;
  isBot?: boolean;
  startedAt?: number;
  until: number;
  lockedUntil?: number;
}

export type MonkFrameIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type MonkRole = 'abbot' | 'senior_novice' | 'junior_novice';

export type ControlledNpcRole = 'abbot' | 'senior_novice' | 'student' | null;

export interface TempleMonkData {
  id: string;
  role: MonkRole;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  moveAxis: 'x' | 'y' | 'idle' | 'chant_wooden_fish';
  facingLeft: boolean;
  pauseTimer: number;
  animTime: number;
  speed: number;
  chatText?: string;
  chatBubbleUntil?: number;
  woodenFishRippleUntil?: number;
}

export interface FloatingToastItem {
  id: string;
  text: string;
  isVip: boolean;
  createdAt: number;
  replaceKey?: string;
}

export interface QueuedPilgrimRequest {
  id?: string;
  username: string;
  prayer: string;
  gender?: 'female' | 'male';
  isVip: boolean;
  coins: number;
  isBot: boolean;
  avatarUrl?: string | null;
  comboCount?: number;
  giftName?: string;
  addedAt?: number;
  points?: number;
  rank?: number;
  answeredCorrectInRound?: boolean;
  lastElapsedSec?: number;
  idleRounds?: number;
  isGoldenPriority?: boolean;
  goldenPriorityAt?: number;
}

export type WaitingQueueItem = QueuedPilgrimRequest;

export interface SafetyCategory {
  key: string;
  name: string;
  enabled: boolean;
  words: string[];
}

export interface SafetyLogEntry {
  id: string;
  time: string;
  user: string;
  detail: string;
}

export interface DonorEntry {
  username: string;
  coins: number;
}

export type DevTabId =
  | 'control'
  | 'event'
  | 'camera'
  | 'audio'
  | 'npc'
  | 'safety'
  | 'map'
  | 'tiktok';

export interface StudioBackupData {
  version?: number;
  exportedAt?: string;
  config?: Partial<GameConfig>;
  incenseBurner?: Point2D;
  offeringTrayPos?: Point2D;
  monkZone?: RectBounds;
  supervisorZone?: RectBounds;
  redPrayZones?: { left: RectBounds; right: RectBounds };
  hudLayout?: Partial<HudLayoutConfig>;
  grid?: Partial<GridConfig>;
  vipSlots?: Array<{ id: string; x: number; y: number; side?: 'left' | 'right' }>;
  normalSlots?: Array<{
    id: string;
    x: number;
    y: number;
    side?: 'left' | 'right';
    row?: number;
    col?: number;
  }>;
  npcNames?: string[];
  npcPrayers?: string[];
  npcAvatars?: string[];
  customAssets?: Partial<CustomAssetsConfig>;
  safetyActionMode?: SafetyActionMode;
  safetyCategories?: SafetyCategory[];
  customWords?: string[];
}

export interface SyncPacket {
  type: 'ADMIN_SYNC';
  action:
    | 'SPAWN_PILGRIM'
    | 'SPAWN_BATCH'
    | 'LEAVE_ALL'
    | 'PLAY_BELL'
    | 'PLAY_WOODEN_FISH'
    | 'PANIC_MUTE'
    | 'TEST_TTS'
    | 'HOST_LIVE_TTS'
    | 'UPDATE_CONFIG'
    | 'UPDATE_GRID'
    | 'UPDATE_SLOTS'
    | 'UPDATE_WAYPOINT'
    | 'UPDATE_WAYPOINTS_BATCH'
    | 'UPDATE_SAFETY'
    | 'UPDATE_HUD_LAYOUT'
    | 'UPDATE_ZONES'
    | 'UPDATE_NPC_LISTS'
    | 'CAMERA_CMD'
    | 'TRIGGER_LIKE'
    | 'TRIGGER_FOLLOW'
    | 'TRIGGER_GRAND_EVENT'
    | 'TRIGGER_CLASSROOM_GIFT'
    | 'ENTITY_CHAT'
    | 'CONTROL_STATE'
    | 'NPC_PRAY_EVENT'
    | 'NEXT_DHARMA'
    | 'CLEAR_TTS_QUEUE'
    | 'UPDATE_LOTUS_DONORS'
    | 'CLEAR_LOTUS_DONORS'
    | 'UPDATE_CUSTOM_ASSETS'
    | 'SYNC_CLASS_BOARD_STATE'
    | 'TRIGGER_ZOMBIE_EVENT'
    | 'SYNC_ZOMBIE_EVENT_STATE'
    | 'REQUEST_FULL_SYNC'
    | 'RESTORE_BACKUP';
  payload: Record<string, any>;
  ts: number;
}
