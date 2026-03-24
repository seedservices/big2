﻿﻿const RANKS=['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
const SUITS=[
  {symbol:'♦️',red:true},
  {symbol:'♣️',red:false},
  {symbol:'♥️',red:true},
  {symbol:'♠️',red:false}
];
const DEFAULT_TURN_TIMEOUT_MS=20000;
const ROOM_OFFLINE_MS=15000;
const ROOM_PRUNE_LOBBY_MS=300000;
const ROOM_PRUNE_PLAYING_MS=30000;
const ROOM_STALE_MS=ROOM_PRUNE_PLAYING_MS;
const ROOM_TIMEOUT_GRACE_MS=2000;
const ROOM_HOST_TAKEOVER_MS=45000;
const ROOM_HOST_ACTIVE_MS=20000;
const EMOTE_DURATION_MS=2400;
const FIVE_KIND_POWER={straight:0,flush:1,fullhouse:2,fourofkind:3,straightflush:4};

function roomPruneMs(status=''){
  return status==='playing'?ROOM_PRUNE_PLAYING_MS:ROOM_PRUNE_LOBBY_MS;
}
function isRoomPlayerActive(entry,status,now){
  const lastSeen=Number(entry?.lastSeen)||0;
  if(!lastSeen)return status==='playing';
  return now-lastSeen<=roomPruneMs(status);
}
function isRoomPlayerHuman(entry){
  const uid=String(entry?.uid||'').trim();
  if(!uid)return false;
  if(uid.startsWith('bot:'))return false;
  if(uid.startsWith('uid:')||uid.startsWith('guest:'))return true;
  return true;
}
function selectRoomHostCandidate(players,now){
  const humans=players.filter((p)=>isRoomPlayerHuman(p));
  if(!humans.length)return null;
  const sorted=[...humans].sort((a,b)=>Number(b?.lastSeen||0)-Number(a?.lastSeen||0));
  const best=sorted[0];
  if(!best)return null;
  const lastSeen=Number(best.lastSeen||0);
  if(lastSeen&&now-lastSeen>ROOM_HOST_ACTIVE_MS)return null;
  return best;
}
function matchGuestPlayerId(roomData){
  if(currentAuthUid())return '';
  const players=Array.isArray(roomData?.players)?roomData.players:[];
  if(!players.length)return '';
  const desiredName=String(state.home.name||'Player').slice(0,32);
  const desiredGender=state.home.gender==='female'?'female':'male';
  const desiredPic=String(authPictureUrl()||'').trim();
  const matchGender=(p)=>String(p?.gender||'male')==='female'?'female':'male';
  const matchPic=(p)=>{
    const pic=String(p?.picture||'').trim();
    if(!desiredPic)return true;
    if(!pic)return true;
    return pic===desiredPic;
  };
  const matches=players.filter((p)=>{
    if(!isRoomPlayerHuman(p))return false;
    if(!String(p.uid||'').startsWith('guest:'))return false;
    if(String(p.name||'')!==desiredName)return false;
    if(matchGender(p)!==desiredGender)return false;
    if(!matchPic(p))return false;
    return true;
  });
  if(matches.length===1)return String(matches[0].uid||'');
  const hostId=String(roomData?.hostId||'').trim();
  if(hostId){
    const host=players.find((p)=>String(p?.uid||'')===hostId);
    if(host&&String(host.name||'')===desiredName&&matchGender(host)===desiredGender){
      return hostId;
    }
  }
  return '';
}

const I18N={
  'zh-HK':{
    title:'鋤大D',
    sub:'',
    lang:'語言 / Language',
    zh:'繁體中文',
    en:'English',
    name:'玩家名稱',
    ai:'對手級數',
    gender:'性別',
    playerSettings:'玩家設定',
    systemSettings:'系統設定',
    male:'男',
    female:'女',
    easy:'新手',
    normal:'熟手',
    hard:'老手',
    solo:'開局',
    loginToStart:'請先登入才可以開始遊戲。',
    config:'設定',
    soundFx:'音效',
    voiceMode:'報牌語音',
    calloutDisplay:'報牌顯示',
    calloutDisplayOn:'開',
    calloutDisplayOff:'關',
    voiceAuto:'自動',    voiceOff:'關',
    voicePack:'語音風格',
    voicePackClassic:'經典',
    voicePackEnergetic:'活力',
    voicePackMinimal:'簡約',
    soundOn:'開',
    soundOff:'關',
    home:'返回主頁',
    again:'再玩一局',
    restart:'重新開始',
    play:'出牌',
    pass:'過牌',
    autoSeq:'順子排序',
    autoPattern:'牌型排序',
    suggest:'建議',
    score:'分數',
    suggestCost:'',
    cards:'手牌',
    log:'遊戲紀錄',
    nolog:'未有紀錄',
    rules:'規則重點',
    ruleItems:[
      '以下列出所有合法出牌組合：',
      '一張牌',
      '兩張牌(Pair)',
      '出牌時跟單隻一樣，必須大於上家出的牌。例如紅心A黑桃A是大於紅心K黑桃K。當點數相同時，比較較大的花色。',
      '三張牌(三張牌要同一點數)',
      '五張牌組合',
      '蛇（Straight）：5張點數各差1點的連續牌，牌組以A-2-3-4-5為最大，3-4-5-6-7最小。若是數字相同的蛇，則比較蛇最點數最大那張的花色大小。蛇的任何組合中不能出現J-Q-K-A-2、Q-K-A-2-3和K-A-3-4-5。',
      '花（Flush）：任何5隻牌同花但數字不連續的。以5隻中點數最大的作等級比較，若最大的點數一樣，則繼以第2大的點數比較，如此類推，最後以花色來計算等級。例如黑桃2-4-5-6-8是大於紅心A-K-Q-10-8。',
      '俘虜（Full House）：一對點數相同的牌和3張點數相同的牌所組成的5張牌。以三條排大小。',
      '四條（Four of a Kind）：4張點數全部相同外加任一單張的5張牌，以同點數的牌面大小計算等級。',
      '同花順（Royal Flush）：相同花色的「蛇」。最大的同花順為黑桃A-2-3-4-5。',
      '以上組合大小依次為：蛇 < 花 < 俘虜 < 四條 < 同花順'
    ],
    wait:'等待出牌...',
    free:'而家無上手，話事可任意出牌。',
    last:'上手',
    recentCard:'最近出牌',
    reveal:'完局攤牌',
    revealSub:'有人勝出，所有玩家餘牌如下：',
    drag:'可拖曳手牌重新排序',
    must3:'首圈第一手必須包含♦️3。',
    beat:'你所選牌未能大過上手。',
    cantPass:'話事中不可過牌。',
    retake:'重新話事。',
    pick:'請先揀牌。',
    pair:'雙牌必須同點數。',
    triple:'三條必須同點數。',
    count:'只可出1、2、3或5張。',
    five:'五張牌只接受蛇、花、俘佬、四條、同花順。',
    illegal:'出牌不合法。',
    penalty:'輸家記牌',
    aiTag:'(AI)',
    wins:'勝出！',
    congrats:'恭喜你贏咗哩局！',
    resultTitle:'對局結果',
    resultWinner:'本局勝出',
    resultRemain:'剩餘手牌',
    resultLastDiscard:'最後出牌',
    resultDelta:'本局分數變動',
    resultDetail:'計分明細',
    scoreBase:'基本',
    scoreMul:'加乘',
    scoreDeduct:'扣分',
    scoreGain:'加分',
    scoreAnyTwo:'有2',
    scoreTopTwo:'有頂大♠️2',
    scoreChao2:'雙炒',
    scoreChao3:'三炒',
    scoreChao4:'四炒',
    scoreChaoBig:'大炒',
    scorePenaltyBoost:'加乘罰則',
    lastCardCall:'Last card',
    noSuggest:'暫無建議。',
    needScore:'',
    recPass:'過牌。',
    recReady:'已產生建議，請先出牌或過牌。',
    accept:'接受建議',
    reject:'拒絕建議',
    start:'先出牌。',
    played:'出咗',
    cardBack:'牌背風格',
    blue:'藍色',
    red:'紅色',
    theme:'主題風格',
    themeOcean:'海洋藍',
    themeEmerald:'翡翠綠',
    themeSunset:'晚霞橙',
    themeSlate:'石板灰',
    themeAurora:'極光紫',
    themeSand:'沙岸金',
    themeCyber:'霓虹夜',
    useGoogleName:'使用 Google 名稱',
    signOut:'登出',
    lb:'排行榜',
    opponents:'對手資料',
    dob:'出生日期',
    hobbies:'興趣',
    profile:'簡介',
    zodiac:'星座',
    motto:'座右銘',
    lbHeadingDesc:'根據分數變動、勝場與勝率等表現指標即時更新排名。',
    lbRefresh:'更新排行榜',
    lbSort:'排序',
    lbPeriod:'期間',
    lbNoData:'未有排行資料',
    lbTotalDelta:'總分變動',
    lbWins:'勝場',
    lbGames:'局數',
    lbWinRate:'勝率',
    lbAvgDelta:'平均分差',
    lbAll:'全部',
    lb7d:'7日',
    lb30d:'30日',
    scoreGuide:'計分方法',
    clickProfile:'點擊名稱卡查看',
    scoreGuideTitle:'計分方法',
    scoreGuideItems:[
      '所有玩家起始 5000 分。',
      '有人出清手牌即勝出該局。',
      '基本計分：輸家按剩餘張數扣分：1-9 張 x1、10-12 張 x2、13 張 x3。',
      '加乘罰則：持有任意 2 再 x2；持有 ♠️2（頂大）再 x2，可疊乘。',
      '最後一張規則：若上家冇頂大而令下家出清，上家需兼負其餘兩家輸分。',
      '所有輸家扣分總和加到贏家。'
    ],
    roomLobby:'大堂',
    roomTableTitle:'房間',
    roomSettings:'房間設定',
    roomCreate:'建立房間',
    roomJoin:'加入房間',
    roomEnter:'進入大堂',
    roomCode:'房間代碼',
    roomCopy:'複製代碼',
    roomReady:'準備好',
    roomNotReady:'未準備',
    roomWaiting:'請等待',
    roomStart:'開局',
    roomLeave:'返回大堂',
    roomLoginRequired:'請先登入才可以建立或加入房間。',
    roomFull:'房間已滿。',
    roomNotFound:'找不到房間。',
    roomClosed:'房間已關閉。',
    roomJoinFail:'加入房間失敗。',
    roomCreateFail:'建立房間失敗。',
    roomAlreadyIn:'你已在其他房間，請先離開再加入。',
    roomReadyHint:'等待房主開始。',
    roomDisconnected:'你已離開房間，請重新加入。',
    roomHost:'房主',
    roomHostTag:'房主',
    roomPrivacy:'房間私隱',
    roomPrivate:'私人',
    roomPublic:'公開',
    roomNeedPlayers:'最少需要 2 位玩家',
    roomRoomId:'房間代碼',
    roomRound:'回合',
    roomCountdown:'倒數',
    emote:'表情',
    emoteLabelCool:'大牌',
    emoteLabelThrow:'掟電話',
    emoteLabelRude:'爆粗',
    emoteLabelSweat:'無牌',
    emoteLabelRage:'反枱',
    emoteLabelSmash:'揼枱',
    emoteLabelFire:'着火',
    emoteLabelThink:'諗緊',
    emoteLabelCry:'爆喊',
    emoteLabelCheers:'飲勝',
    emoteLabelThumbs:'讚好',
    emoteLabelCrack:'爆牆',
    emoteLabelSleep:'眼瞓',
    emoteLabelLove:'心心',
    emoteLabelChampagne:'開香濱',
    emoteLabelShock:'Shock',
    seatLabel:'座位 {{n}}',
    roomAvailable:'可加入',
    roomSeatOpen:'吉位',
    roomActiveList:'房間列表',
    roomActiveEmpty:'未有可加入房間。',
    roomActiveRefresh:'更新列表',
    roomStatusLabel:'房間狀態',
    roomStatusPlaying:'戰鬥中',
    roomWaitingReady:'等待玩家準備',
    roomStarted:'遊戲進行中',
    roomWelcomeJoin:'歡迎加入',
    roomWaitingHost:'等待房主開局',
    roomReconnecting:'連線中斷，正在重新連線...',
    roomStale:'房間太久未更新，請返回大堂重試。',
    roomJoinLog:'{{name}} 加入了房間。',
    roomLeaveLog:'{{name}} 離開了房間。',
    roomStarting:'房間準備中...',
    roomReadyCount:'已準備 {{ready}}/{{total}}',
    roomSending:'提交中...',
    roomSendTimeout:'連線較慢，請重試。'
  },
  en:{
    title:'Big Two',
    sub:'',
    lang:'Language',
    zh:'Traditional Chinese',
    en:'English',
    name:'Player Name',
    ai:'Opponent Level',
    gender:'Gender',
    playerSettings:'Player Settings',
    systemSettings:'System Settings',
    male:'Male',
    female:'Female',
    easy:'Novice',
    normal:'Skilled',
    hard:'Veteran',
    solo:'Start Game',
    loginToStart:'Please sign in before starting the game.',
    config:'Config',
    soundFx:'Sound Effects',
    voiceMode:'Callout Voice',
    calloutDisplay:'Callout Display',
    calloutDisplayOn:'On',
    calloutDisplayOff:'Off',
    voiceAuto:'Auto',    voiceOff:'Off',
    voicePack:'Voice Style',
    voicePackClassic:'Classic',
    voicePackEnergetic:'Energetic',
    voicePackMinimal:'Minimal',
    soundOn:'On',
    soundOff:'Off',
    home:'Home',
    again:'Play Again',
    restart:'Restart',
    play:'Play',
    pass:'Pass',
    autoSeq:'Sort Sequence',
    autoPattern:'Sort Pattern',
    suggest:'Recommend',
    score:'Score',
    suggestCost:'',
    cards:'Cards',
    log:'Game Log',
    nolog:'No history yet',
    rules:'Rule Highlights',
    ruleItems:[
      'All legal play combinations are listed below:',
      'Single card',
      'Pair',
      'Pairs follow the single-card rule: must beat the previous pair. Example: ♥️A♠️A beats ♥️K♠️K. If ranks are the same, compare the higher suit.',
      'Triple (three cards must be the same rank)',
      'Five-card hands',
      'Straight: five consecutive ranks. A-2-3-4-5 is the highest, 3-4-5-6-7 is the lowest. If two straights have the same ranks, compare the suit of the highest card. Straights cannot be J-Q-K-A-2, Q-K-A-2-3, or K-A-3-4-5.',
      'Flush: any five cards of the same suit that are not consecutive. Compare by the highest rank, then the second highest, and so on; finally compare suit if still tied. Example: ♠️2-4-5-6-8 beats ♥️A-K-Q-10-8.',
      'Full House: a pair plus three of a kind. Compare by the triple rank.',
      'Four of a Kind: four cards of the same rank plus any single. Compare by the four-card rank.',
      'Straight Flush (Royal Flush): a straight in the same suit. The highest straight flush is ♠️A-2-3-4-5.',
      'Hand order: Straight < Flush < Full House < Four of a Kind < Straight Flush.'
    ],
    wait:'Waiting...',
    free:'No active hand. Lead may play any valid set.',
    last:'Last',
    recentCard:'Recent Card',
    reveal:'Showdown',
    revealSub:'Winner decided. Remaining cards are revealed:',
    drag:'Drag cards to resequence your hand',
    must3:'First turn must include ♦️Diamond 3.',
    beat:'Your selection does not beat last play.',
    cantPass:'Cannot pass while holding lead.',
    retake:'regains lead.',
    pick:'Select cards first.',
    pair:'Pair must match rank.',
    triple:'Triple must match rank.',
    count:'Only 1,2,3,5 cards allowed.',
    five:'Invalid five-card hand.',
    illegal:'Invalid play.',
    penalty:'Penalty',
    aiTag:'(AI)',
    wins:'wins!',
    congrats:'Congratulations! You win!',
    resultTitle:'Round Result',
    resultWinner:'Winner',
    resultRemain:'Remaining Cards',
    resultLastDiscard:'Last Discarded Card',
    resultDelta:'Round Score Change',
    resultDetail:'Scoring Detail',
    scoreBase:'Base',
    scoreMul:'Multiplier',
    scoreDeduct:'Deduction',
    scoreGain:'Gain',
    scoreAnyTwo:'Has 2',
    scoreTopTwo:'Has top ♠️Spade 2',
    scoreChao2:'Chao Two',
    scoreChao3:'Chao Three',
    scoreChao4:'Chao Four',
    scoreChaoBig:'Big Chao',
    scorePenaltyBoost:'Multiplier Penalties',
    lastCardCall:'Last card',
    noSuggest:'No suggestion now.',
    needScore:'',
    recPass:'Pass.',
    recReady:'Already active. Play or pass first.',
    accept:'Accept',
    reject:'Reject',
    start:'starts first.',
    played:'played',
    cardBack:'Card Back',
    blue:'Blue',
    red:'Red',
    theme:'Theme',
    themeOcean:'Ocean Blue',
    themeEmerald:'Emerald Green',
    themeSunset:'Sunset Orange',
    themeSlate:'Slate Gray',
    themeAurora:'Aurora Purple',
    themeSand:'Sand Gold',
    themeCyber:'Neon Night',
    useGoogleName:'Use Google Name',
    signOut:'Sign out',
    lb:'Leaderboard',
    opponents:'Opponents',
    dob:'Date of Birth',
    hobbies:'Hobbies',
    profile:'Profile',
    zodiac:'Zodiac',
    motto:'Motto',
    lbHeadingDesc:'Live ranking updates based on score delta, wins, and win rate.',
    lbRefresh:'Refresh Leaderboard',
    lbSort:'Sort',
    lbPeriod:'Period',
    lbNoData:'No leaderboard data yet',
    lbTotalDelta:'Total Delta',
    lbWins:'Wins',
    lbGames:'Games',
    lbWinRate:'Win Rate',
    lbAvgDelta:'Avg Delta',
    lbAll:'All',
    lb7d:'7D',
    lb30d:'30D',
    scoreGuide:'Scoring',
    clickProfile:'Click name card to view',
    scoreGuideTitle:'Scoring Method',
    scoreGuideItems:[
      'All players start at 5000 points.',
      'A round ends when one player empties their hand.',
      'Base scoring for losers by remaining cards: 1-9 cards x1, 10-12 cards x2, 13 cards x3.',
      'Multiplier penalties: holding any 2 applies x2; holding ♠️Spade 2 (top 2) applies another x2; multipliers stack.',
      'Last-card rule: if you fail to top against a next player on 1 card and they win, you also absorb the other two losers\' deductions.',
      'Total deductions from all losers are added to the winner.'
    ],
    roomLobby:'Lobby',
    roomTableTitle:'Table',
    roomSettings:'Room Settings',
    roomCreate:'Create Table',
    roomJoin:'Join Table',
    roomEnter:'Enter Lobby',
    roomCode:'Table Code',
    roomCopy:'Copy Code',
    roomReady:'Ready',
    roomNotReady:'Not Ready',
    roomWaiting:'Waiting',
    roomStart:'Start',
    roomLeave:'Return to Lobby',
    roomLoginRequired:'Please sign in to create or join rooms.',
    roomFull:'Room is full.',
    roomNotFound:'Room not found.',
    roomClosed:'Room is closed.',
    roomJoinFail:'Failed to join table.',
    roomCreateFail:'Failed to create table.',
    roomAlreadyIn:'You are already in another room. Leave it before joining.',
    roomReadyHint:'Waiting for host to start.',
    roomDisconnected:'You left the room. Please join again.',
    roomHost:'Host',
    roomHostTag:'HOST',
    roomPrivacy:'Room Privacy',
    roomPrivate:'Private',
    roomPublic:'Public',
    roomNeedPlayers:'Need at least 2 players to start.',
    roomRoomId:'Room ID',
    roomRound:'Round',
    roomCountdown:'Countdown',
    emote:'Emote',
    emoteLabelCool:'Cool',
    emoteLabelThrow:'Throw',
    emoteLabelRude:'Rude',
    emoteLabelSweat:'No Card',
    emoteLabelRage:'Rage',
    emoteLabelSmash:'Smash',
    emoteLabelFire:'Fire',
    emoteLabelThink:'Thinking',
    emoteLabelCry:'Cry',
    emoteLabelCheers:'Cheers',
    emoteLabelThumbs:'Thumbs',
    emoteLabelCrack:'Crack',
    emoteLabelSleep:'Sleepy',
    emoteLabelLove:'Love',
    emoteLabelChampagne:'Champagne',
    emoteLabelShock:'Shock',
    seatLabel:'Seat {{n}}',
    roomAvailable:'Available',
    roomSeatOpen:'Open Seat',
    roomActiveList:'Available Tables',
    roomActiveEmpty:'No tables available.',
    roomActiveRefresh:'Refresh',
    roomStatusLabel:'Room status',
    roomStatusPlaying:'In Game',
    roomWaitingReady:'Waiting for players to get ready',
    roomStarted:'Game in progress',
    roomWelcomeJoin:'Welcome to join',
    roomWaitingHost:'Waiting for host to start...',
    roomReconnecting:'Connection lost. Reconnecting...',
    roomStale:'Room is stale. Return to lobby and try again.',
    roomJoinLog:'{{name}} joined the room.',
    roomLeaveLog:'{{name}} left the room.',
    roomStarting:'Room is starting...',
    roomReadyCount:'Ready {{ready}}/{{total}}',
    roomSending:'Sending...',
    roomSendTimeout:'Connection issue — retry.'
  }
};
const KIND={
  'zh-HK':{single:'單張',pair:'一對',triple:'三條',straight:'蛇',flush:'花',fullhouse:'俘佬',fourofkind:'四條',straightflush:'同花順'},
  en:{single:'Single',pair:'Pair',triple:'Triple',straight:'Straight',flush:'Flush',fullhouse:'Full House',fourofkind:'Four Kind',straightflush:'Straight Flush'}
};
const CALLOUT_RESPONSE_TEXT = {
  'zh-HK': {
    pass: ['大', '唔跟', '唔去', '過', 'Pass!'],
    last: [
      '最後一張！',
      '淨翻一張！',
      '埋門一腳！',
      '準備找數💰',
      'Last Card!',
    ],
    play: [
      (kind) => `${kind}！`,
      (kind) => `跟！${kind}`,
      (kind) => `${kind}，頂住。`,
      (kind) => `${kind}，大你少少😏`,
      (kind) => `${kind}，大過你😏`,
    ],
    winner: [
      '\u591A\u8B1D\u6652\u3002',
      '\u904B\u6C23\u597D\u5230\u5187\u670B\u53CB\uD83D\uDE43',
      '\u4ECA\u65E5\u624B\u6C23\u5E7E\u9806\u3002',
      '\u8D0F\u7FFB\u676F\u5976\u8336\u2615',
      '\u4ECA\u92EA\u6211\u8D0F\uff01',
      '\u884C\u904B\u884C\u5230\u8173\u8DBE\u5C3E',
    ],
    winnerRepeat: '\u5514\u597D\u610F\u601D\uff0c\u53C8\u4FC2\u6211\u3002',
  },
  en: {
    pass: ['Pass', 'No beat', 'I pass', 'Pass this round'],
    last: [
      'Last card!',
      'One card left!',
      'Final card!',
      'Get ready to pay up 💰',
      'Last card, watch it 😉',
    ],
    play: [
      (kind) => `${kind}!`,
      (kind) => `${kind}. Beat that.`,
      (kind) => `${kind}. Holding.`,
      (kind) => `${kind}, higher.`,
    ],
    winner: [
      'Thanks a lot.',
      'Just got lucky.',
      'My luck is pretty good today.',
      'Won back bubble tea ☕',
      'This round is mine!',
      'Lucky down to my toes.',
    ],
    winnerRepeat: 'Sorry, me again.',
  },
};
const EMOTE_STICKERS=[
  {id:'cool',file:'emote-cool.png'},
  {id:'throw',file:'emote-throw.png'},
  {id:'rude',file:'emote-rude.png'},
  {id:'sweat',file:'emote-sweat.png'},
  {id:'rage',file:'emote-rage.png'},
  {id:'smash',file:'emote-smash.png'},
  {id:'fire',file:'emote-fire.png'},
  {id:'think',file:'emote-think.png'},
  {id:'cry',file:'emote-cry.png'},
  {id:'cheers',file:'emote-cheers.png'},
  {id:'thumbs',file:'emote-thumbs.png'},
  {id:'crack',file:'emote-crack.png'},
  {id:'sleep',file:'emote-sleep.png'},
  {id:'love',file:'emote-love.png'},
  {id:'champagne',file:'emote-champagne.png'},
  {id:'shock',file:'emote-shock.png'}
];
const app=document.getElementById('app');
const state={language:'zh-HK',screen:'home',screenBeforeConfig:'home',showRules:false,showLog:false,logTouched:false,showScoreGuide:false,opponentProfileName:'',mottoPeekName:'',selected:new Set(),drag:{id:null,moved:false},playAnimKey:'',autoPassKey:'',score:5000,suggestCost:0,recommendation:null,recommendHint:'',home:{mode:'solo',name:'玩家',gender:'male',avatarChoice:'male',aiDifficulty:'normal',backColor:'red',theme:'ocean',showIntro:false,showLeaderboard:false,google:{signedIn:false,provider:'',name:'',email:'',uid:'',sub:'',token:'',picture:'',gender:''},leaderboard:{rows:[],sort:'totalDelta',period:'all',limit:20},activeRooms:{rows:[],loading:false,loadedAt:0,error:''}},room:{id:'',code:'',data:null,joinOpen:false,error:'',started:false,unsub:null,selfSeat:-1,recordedGameKey:'',lastMoveKey:'',playerId:'',pendingReady:false,pendingReadyValue:null,pendingStart:false,lastResultPlayers:null},sessionId:'',solo:{players:[],botNames:[],totals:[5000,5000,5000,5000],currentSeat:0,lastPlay:null,passStreak:0,isFirstTrick:true,gameOver:false,status:'',history:[],aiDifficulty:'normal',lastCardBreach:null},emote:{open:false,active:null}};
const LEADERBOARD_KEY='hkbig2.leaderboard.v2.totalScore';
const GOOGLE_SESSION_KEY='hkbig2.google.session.v1';
const ENV_PASSCODE='4Leaf';
const APP_ENV=String(import.meta.env?.ENV||'DEV').trim().toUpperCase();
const EFFECTIVE_ENV=['DEV','UAT','PROD'].includes(APP_ENV)?APP_ENV:'DEV';
const FIREBASE_CONFIG_ENCODED_BY_ENV={
  DEV:{
    apiKey:'dQUfADVNDTxMPFclSBNfcgZVKCp/JFE+MHN7Dg00VhQ1Iy1NdFJR',
    authDomain:'RykABUtHKRcXD1cpFk8AXT4AAwdHKQQRFhovCgw=',
    projectId:'RykABUtHKRcXD1cpFg==',
    storageBucket:'RykABUtHKRcXD1cpFk8AXT4AAwdHKRYVCUYtAgRIVTwV',
    messagingSenderId:'Bn9UVl8FflFQXwB8',
    appId:'BXZXUlcDdVRTUgV1UVFcQykHW1UGLV1SBAZ/UgBTV30GBQAALwRYUgU=',
    measurementId:'c2EnOF9+DyEnKwN1'
  },
  UAT:{
    apiKey:'dQUfADVNDTxMPFclSBNfcgZVKCp/JFE+MHN7Dg00VhQ1Iy1NdFJR',
    authDomain:'RykABUtHKRcXD1cpFk8AXT4AAwdHKQQRFhovCgw=',
    projectId:'RykABUtHKRcXD1cpFg==',
    storageBucket:'RykABUtHKRcXD1cpFk8AXT4AAwdHKRYVCUYtAgRIVTwV',
    messagingSenderId:'Bn9UVl8FflFQXwB8',
    appId:'BXZXUlcDdVRTUgV1UVFcQykHW1UGLV1SBAZ/UgBTV30GBQAALwRYUgU=',
    measurementId:'c2EnOF9+DyEnKwN1'
  },
  PROD:{
    apiKey:'dQUfADVNDTxMPFclSBNfcgZVKCp/JFE+MHN7Dg00VhQ1Iy1NdFJR',
    authDomain:'RykABUtHKRcXD1cpFk8AXT4AAwdHKQQRFhovCgw=',
    projectId:'RykABUtHKRcXD1cpFg==',
    storageBucket:'RykABUtHKRcXD1cpFk8AXT4AAwdHKRYVCUYtAgRIVTwV',
    messagingSenderId:'Bn9UVl8FflFQXwB8',
    appId:'BXZXUlcDdVRTUgV1UVFcQykHW1UGLV1SBAZ/UgBTV30GBQAALwRYUgU=',
    measurementId:'c2EnOF9+DyEnKwN1'
  }
};
const FIRESTORE_LB_COLLECTION_ENCODED_BY_ENV={
  DEV:'ViUCUypRLQEEFFYjBBMCZCAEGANGPw==',
  UAT:'ViUCUypRLQEEFFYjBBMCZCAEGANGPw==',
  PROD:'ViUCUypRLQEEFFYjBBMCZCAEGANGPw=='
};
function decodeEnvSecret(encoded){
  const raw=String(encoded??'').trim();
  if(!raw)return'';
  try{
    const bytes=atob(raw);
    let out='';
    for(let i=0;i<bytes.length;i+=1){
      const p=ENV_PASSCODE.charCodeAt(i%ENV_PASSCODE.length);
      out+=String.fromCharCode(bytes.charCodeAt(i)^p);
    }
    return out;
  }catch{
    return'';
  }
}
function decodeFirebaseConfigByEnv(envName){
  const safeEnv=['DEV','UAT','PROD'].includes(envName)?envName:'DEV';
  const encoded=FIREBASE_CONFIG_ENCODED_BY_ENV[safeEnv]??FIREBASE_CONFIG_ENCODED_BY_ENV.DEV;
  return{
    apiKey:decodeEnvSecret(encoded.apiKey),
    authDomain:decodeEnvSecret(encoded.authDomain),
    projectId:decodeEnvSecret(encoded.projectId),
    storageBucket:decodeEnvSecret(encoded.storageBucket),
    messagingSenderId:decodeEnvSecret(encoded.messagingSenderId),
    appId:decodeEnvSecret(encoded.appId),
    measurementId:decodeEnvSecret(encoded.measurementId)
  };
}
const FIREBASE_CONFIG=decodeFirebaseConfigByEnv(EFFECTIVE_ENV);
const FIRESTORE_LB_COLLECTION=decodeEnvSecret(
  FIRESTORE_LB_COLLECTION_ENCODED_BY_ENV[EFFECTIVE_ENV]??FIRESTORE_LB_COLLECTION_ENCODED_BY_ENV.DEV
);
const FIRESTORE_ROOMS_COLLECTION='big2Rooms';
const FIRESTORE_USERS_COLLECTION='big2Users';
const FIRESTORE_GAMELOGS_COLLECTION='big2GameLogs';
const THEMES={
  ocean:{'--bg-a':'#071a2f','--bg-b':'#0f4469','--bg-c':'#15808f','--panel':'rgba(255,255,255,0.08)','--panel-2':'rgba(7,22,34,0.62)','--table-a':'#17334f','--table-b':'#1f4468','--table-c':'#1c4262','--seat-a':'rgba(17,44,70,.82)','--seat-b':'rgba(9,33,55,.78)','--line-a':'rgba(126,177,215,.6)','--line-b':'rgba(126,177,215,.35)','--center-a':'rgba(19,88,49,.92)','--center-b':'rgba(12,63,35,.9)','--accent':'#f4a259','--danger':'#ef476f','--ok':'#52d273'},
  emerald:{'--bg-a':'#08261f','--bg-b':'#0f5a43','--bg-c':'#168f6a','--panel':'rgba(255,255,255,0.08)','--panel-2':'rgba(6,31,23,0.64)','--table-a':'#0e3a2e','--table-b':'#13614a','--table-c':'#15795a','--seat-a':'rgba(11,57,41,.82)','--seat-b':'rgba(8,40,29,.78)','--line-a':'rgba(120,196,156,.6)','--line-b':'rgba(120,196,156,.35)','--center-a':'rgba(23,103,62,.92)','--center-b':'rgba(13,73,44,.9)','--accent':'#f6c453','--danger':'#e95f6f','--ok':'#7ad97a'},
  sunset:{'--bg-a':'#2d1022','--bg-b':'#7a2d3f','--bg-c':'#d06b3a','--panel':'rgba(255,255,255,0.09)','--panel-2':'rgba(35,13,26,0.62)','--table-a':'#4b2132','--table-b':'#8a3c4b','--table-c':'#a55346','--seat-a':'rgba(58,25,39,.82)','--seat-b':'rgba(37,16,26,.78)','--line-a':'rgba(220,153,118,.6)','--line-b':'rgba(220,153,118,.35)','--center-a':'rgba(120,68,32,.92)','--center-b':'rgba(78,40,20,.9)','--accent':'#ffd166','--danger':'#ff5a5f','--ok':'#7fd37b'},
  slate:{'--bg-a':'#121a24','--bg-b':'#2b3a4d','--bg-c':'#4e647f','--panel':'rgba(255,255,255,0.08)','--panel-2':'rgba(13,19,30,0.64)','--table-a':'#1f2b3a','--table-b':'#33485f','--table-c':'#4a627f','--seat-a':'rgba(24,35,48,.82)','--seat-b':'rgba(14,23,33,.78)','--line-a':'rgba(139,171,202,.6)','--line-b':'rgba(139,171,202,.35)','--center-a':'rgba(46,86,72,.92)','--center-b':'rgba(30,58,49,.9)','--accent':'#f2b36d','--danger':'#de5c70','--ok':'#7bc99a'},
  aurora:{'--bg-a':'#1a0f3a','--bg-b':'#53328e','--bg-c':'#1f8e9c','--panel':'rgba(255,255,255,0.1)','--panel-2':'rgba(18,11,40,0.66)','--table-a':'#32235c','--table-b':'#4f3b81','--table-c':'#316f80','--seat-a':'rgba(41,27,74,.82)','--seat-b':'rgba(28,18,54,.78)','--line-a':'rgba(172,156,235,.62)','--line-b':'rgba(172,156,235,.35)','--center-a':'rgba(30,120,86,.9)','--center-b':'rgba(18,81,58,.88)','--accent':'#ffc857','--danger':'#f65c93','--ok':'#7fe0c9'},
  sand:{'--bg-a':'#3a2b1f','--bg-b':'#8a623f','--bg-c':'#c99f63','--panel':'rgba(255,255,255,0.1)','--panel-2':'rgba(44,31,20,0.64)','--table-a':'#5d432b','--table-b':'#8a6842','--table-c':'#9f7a4f','--seat-a':'rgba(72,50,30,.82)','--seat-b':'rgba(50,34,20,.78)','--line-a':'rgba(226,193,140,.62)','--line-b':'rgba(226,193,140,.35)','--center-a':'rgba(106,83,37,.92)','--center-b':'rgba(75,55,24,.9)','--accent':'#ffd166','--danger':'#e46a52','--ok':'#95d07a'},
  cyber:{'--bg-a':'#041a25','--bg-b':'#0a3c54','--bg-c':'#0f6378','--panel':'rgba(255,255,255,0.09)','--panel-2':'rgba(6,23,35,0.68)','--table-a':'#0c2f43','--table-b':'#11506a','--table-c':'#16718a','--seat-a':'rgba(8,46,63,.84)','--seat-b':'rgba(7,31,43,.8)','--line-a':'rgba(104,225,255,.62)','--line-b':'rgba(104,225,255,.36)','--center-a':'rgba(17,97,56,.92)','--center-b':'rgba(10,66,38,.9)','--accent':'#ffe66d','--danger':'#ff5d8f','--ok':'#5ce1a7'}
};
const seatCls=['south','east','north','west'];
const PLAYER_COLORS={south:'#ffd166',east:'#ff6b6b',north:'#6bbcff',west:'#a77bff'};
const playerColorByViewClass=(cls)=>PLAYER_COLORS[cls]??'#f4f9fb';
const NPC_COLOR_POOL=['#ff6b6b','#6bbcff','#86d989','#f78fb3','#8bd3dd','#f3a683','#c4a7e7','#f6bd60','#84dcc6','#b8e986'];
function colorDistanceSq(a,b){
  const ra=hexToRgb(a);
  const rb=hexToRgb(b);
  if(!ra||!rb)return 0;
  const dr=ra[0]-rb[0];
  const dg=ra[1]-rb[1];
  const db=ra[2]-rb[2];
  return(dr*dr)+(dg*dg)+(db*db);
}
function randomizeNpcColors(){
  const pool=[...new Set(NPC_COLOR_POOL.filter((c)=>c!==PLAYER_COLORS.south))];
  const fallback=['#ff6b6b','#6bbcff','#a77bff'];
  if(pool.length<3){
    PLAYER_COLORS.east=fallback[0];
    PLAYER_COLORS.north=fallback[1];
    PLAYER_COLORS.west=fallback[2];
    return;
  }
  let bestScore=-1;
  const bestSets=[];
  for(let i=0;i<pool.length-2;i++){
    for(let j=i+1;j<pool.length-1;j++){
      for(let k=j+1;k<pool.length;k++){
        const c1=pool[i],c2=pool[j],c3=pool[k];
        const d12=colorDistanceSq(c1,c2);
        const d13=colorDistanceSq(c1,c3);
        const d23=colorDistanceSq(c2,c3);
        const minPairDist=Math.min(d12,d13,d23);
        if(minPairDist>bestScore){
          bestScore=minPairDist;
          bestSets.length=0;
          bestSets.push([c1,c2,c3]);
        }else if(minPairDist===bestScore){
          bestSets.push([c1,c2,c3]);
        }
      }
    }
  }
  const chosen=bestSets.length?bestSets[Math.floor(Math.random()*bestSets.length)]:fallback;
  const assigned=[...chosen];
  for(let i=assigned.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [assigned[i],assigned[j]]=[assigned[j],assigned[i]];
  }
  PLAYER_COLORS.east=assigned[0]??fallback[0];
  PLAYER_COLORS.north=assigned[1]??fallback[1];
  PLAYER_COLORS.west=assigned[2]??fallback[2];
}
const isIOSDevice=()=>{
  try{
    const ua=String(navigator?.userAgent??'');
    const platform=String(navigator?.platform??'');
    const touchPts=Number(navigator?.maxTouchPoints??0);
    return /iPad|iPhone|iPod/i.test(ua) || (platform==='MacIntel'&&touchPts>1);
  }catch{
    return false;
  }
};
const runtimeProfileStore={players:{}};
let aiTimer=null;
let roomPresenceTimer=null;
let emoteTimer=null;
const BOT_EMOTE_COOLDOWN_MS=5000;
const botEmoteCooldownBySeat=new Map();
let roomCountdownTimer=null;
let roomReadyPendingTimer=null;
let roomStartPendingTimer=null;
let playTypeCallTimer=null;
const playTypeCallState={key:'',seat:0,text:'',until:0,startedAt:0,nonce:'',historyLen:0};
let passCallTimer=null;
const passCallState={key:'',seat:0,text:'',until:0,startedAt:0,nonce:'',historyLen:0};
let recommendHintTimer=null;
let lastCardCallTimer=null;
const lastCardCallState={key:'',seat:0,text:'',until:0,startedAt:0,nonce:'',historyLen:0};
const must3CallState={key:'',seat:0,text:'',until:0,startedAt:0,nonce:''};
const lastCardAnnouncedSeats=new Set();
let calloutExpireTimer=null;
function scheduleCalloutExpiry(until=0){
  const wait=Math.max(0,Number(until||0)-Date.now()+40);
  if(!Number.isFinite(wait))return;
  if(calloutExpireTimer)clearTimeout(calloutExpireTimer);
  calloutExpireTimer=window.setTimeout(()=>{
    calloutExpireTimer=null;
    if(state.screen==='game')render();
  },wait);
}
let lastCardProcessedHistoryLen=0;
let googleInlineRetryTimer=null;
let googleIdentityInitialized=false;
let firebaseApp=null;
let firebaseAuth=null;
let firebaseDb=null;
let leaderboardCloudRefreshInFlight=false;
let leaderboardCloudLoaded=false;
const sound={ctx:null,enabled:true};
let winSfxAudio=null;
let winSfxSeq=0;
let speechPrimed=false;
let lastSpokenCalloutKey='';
let lastSpokenCalloutAt=0;
let calloutSpeechActive=false;
let calloutSpeechUntil=0;
let calloutSpeechEndedAt=0;
let calloutResumePending=false;
let calloutSpeakSeq=0;
let calloutGateUntilPlay=false;
let turnLockUntil=0;
let calloutDisplayEnabled=true;
let calloutVoiceMode='auto'; // auto | recorded | off
let calloutStylePack='energetic'; // forced energetic
let autoSortMode='seq';
let opponentProfileDelegateBound=false;
const calloutAudioCache=new Map();
let iosSharedCalloutAudio=null;
let mobileTapAt=0;
let orientationBlockActive=false;
let lastOrientation=null;
const BOT_PROFILE_POOL=[
  {name:'志明',gender:'male'},
  {name:'俊傑',gender:'male'},
  {name:'家樂',gender:'male'},
  {name:'子朗',gender:'male'},
  {name:'少龍',gender:'male'},
  {name:'天樂',gender:'male'},
  {name:'嘉欣',gender:'female'},
  {name:'芷晴',gender:'female'},
  {name:'穎欣',gender:'female'},
  {name:'佩儀',gender:'female'},
  {name:'詠琪',gender:'female'},
  {name:'秀文',gender:'female'},
  {name:'澄希',gender:'female'},
  {name:'葵芳',gender:'female'},
  {name:'Nova',gender:'female'},
  {name:'Milo',gender:'male'},
  {name:'Jade',gender:'female'},
  {name:'Axel',gender:'male'},
  {name:'Iris',gender:'female'},
  {name:'Luna',gender:'female'},
  {name:'ReXX',gender:'male'},
  {name:'Nora',gender:'female'},
  {name:'Kane',gender:'male'},
  {name:'Skye',gender:'female'},
  {name:'Orion',gender:'male'},
  {name:'葵兄',gender:'male'},
  {name:'Jax',gender:'male'}
];
const BOT_PROFILES={zh:BOT_PROFILE_POOL,en:BOT_PROFILE_POOL};
const OPPONENT_PROFILE_BY_NAME={
  '志明':{
    dob:'1992-05-18',
    hobbies:{'zh-HK':['海釣','桌上遊戲','即影即有'],en:['shore fishing','board games','instant photos']},
    profile:{'zh-HK':['開局像慢煮湯，越拖越香。他最愛說「再等一手」，其實早就算好你會誤判，連你會用哪張牌都猜中。','他最擅長拖你到你自己心急，然後在你出錯那秒收尾。桌上最安靜，但最會算，像老派會計把每張牌都記在心裡。'],en:['Opens like a slow simmer, then flips the table at the perfect time. He says “one more hand” while already reading your next card.','He drags you into impatience and ends it on your mistake. Quiet at the table, loud in the math—every card is already booked.']},
    zodiac:{'zh-HK':'金牛座',en:'Taurus'},
    motto:{'zh-HK':'慢就係快。',en:'Slow is smooth.'}
  },
  '俊傑':{
    dob:'1990-11-03',
    hobbies:{'zh-HK':['跑步','棋類','咖啡拉花'],en:['running','chess variants','latte art']},
    profile:{'zh-HK':['最愛把牌排成棋盤，再用咖啡杯當計時器。輸給他不是輸牌，是輸節奏，連你呼吸的節拍都會被他帶走。','他會記你每一次出錯的節奏，下一局還會重播。對他而言，牌局只是時間管理課，勝負只是加分題。'],en:['Arranges cards like a chessboard and times turns with a coffee cup. You don’t lose to his cards, you lose to his tempo—even your breathing follows it.','He remembers your mistakes by tempo and replays them next round. To him, the game is time management, winning is just extra credit.']},
    zodiac:{'zh-HK':'天蠍座',en:'Scorpio'},
    motto:{'zh-HK':'每步都要值回票價。',en:'Make every move count.'}
  },
  '家樂':{
    dob:'1994-02-27',
    hobbies:{'zh-HK':['街拍','電影海報收藏','模型'],en:['street photography','movie posters','model kits']},
    profile:{'zh-HK':['出牌像快門，咔嚓一聲就爆你節奏。喜歡快攻，偶爾也會浪漫到留最後一張，讓你以為還有機會。','他會在你覺得要爆的時候留一手，然後用最後的浪漫收尾。照片上你還在笑，結果他已經清桌。'],en:['Plays like a camera shutter—click, your rhythm is gone. Loves fast attacks, sometimes keeps one card just for the drama.','He keeps a card when you think he is all-in, then finishes with a dramatic last touch. You are still smiling in the photo while he already cleared the table.']},
    zodiac:{'zh-HK':'雙魚座',en:'Pisces'},
    motto:{'zh-HK':'快一步，靚好多。',en:'One step faster, a lot sharper.'}
  },
  '子朗':{
    dob:'1996-07-09',
    hobbies:{'zh-HK':['籃球','機械鍵盤','城市夜景'],en:['basketball','mechanical keyboards','city nights']},
    profile:{'zh-HK':['看似佛系，其實暗藏殺招。末段一波連出，像球場快攻，快到你還在想就已經結束。','他不多話，卻最愛用一波連出讓你懷疑人生。你以為是運氣，其實是他早就排好的路線。'],en:['Looks chill, hides a dagger. Late game bursts like a fast break—so fast you are still thinking when it ends.','Few words, but a rapid sequence that makes you question everything. What looks like luck is just his route, pre‑planned.']},
    zodiac:{'zh-HK':'巨蟹座',en:'Cancer'},
    motto:{'zh-HK':'留到最後先開火。',en:'Save the strike for last.'}
  },
  '少龍':{
    dob:'1991-03-22',
    hobbies:{'zh-HK':['登山','拳擊訓練','武俠小說'],en:['hiking','boxing drills','wuxia novels']},
    profile:{'zh-HK':['出牌像練拳，先探路再重擊。你一眨眼，他就全桌清空，連你的反應都變慢。','他會先讓你覺得安全，然後突然加速收尾。等你回神，他已經把節奏鎖死。'],en:['Boxes with the deck—probe, feint, then a heavy punch. Blink and the table is empty, and your reactions feel slow.','He lets you feel safe, then hits the accelerator to finish. By the time you notice, the tempo is locked.']},
    zodiac:{'zh-HK':'白羊座',en:'Aries'},
    motto:{'zh-HK':'先手就係王道。',en:'Lead and dominate.'}
  },
  '天樂':{
    dob:'1993-09-14',
    hobbies:{'zh-HK':['吉他','慢跑','旅行計劃'],en:['guitar','jogging','trip planning']},
    profile:{'zh-HK':['說話慢慢，出牌更慢，但每一步都踩在節拍上。你越急，他越穩，像慢歌的鼓點。','他會把節奏拉到你睡著，再用一記乾淨收牌。最後一手很安靜，但你會聽到心碎聲。'],en:['Speaks slow, plays slower—always on beat. The more you rush, the steadier he becomes, like a slow drum.','He slows the tempo until you drift, then closes with clean hands. The last move is quiet, but it lands.']},
    zodiac:{'zh-HK':'處女座',en:'Virgo'},
    motto:{'zh-HK':'穩先，唔好急。',en:'Steady first, speed later.'}
  },
  '嘉欣':{
    dob:'1995-01-30',
    hobbies:{'zh-HK':['烘焙','插畫','香薰'],en:['baking','illustration','aromatherapy']},
    profile:{'zh-HK':['牌桌像烤箱，先升溫再反殺。最怕你亂來，因為她最愛你亂來，越亂越香。','她最愛看你自亂陣腳，因為那是她的甜點時間。你以為她在放水，她其實在量火候。'],en:['Treats the table like an oven—preheat, then serve a surprise. Hopes you overreach, then punishes it.','She waits for you to spiral; that is when dessert is served. What you think is mercy is just heat control.']},
    zodiac:{'zh-HK':'水瓶座',en:'Aquarius'},
    motto:{'zh-HK':'氣定神閒先贏。',en:'Stay cool, win clean.'}
  },
  '芷晴':{
    dob:'1997-06-12',
    hobbies:{'zh-HK':['瑜伽','花藝','攝影'],en:['yoga','floral design','photography']},
    profile:{'zh-HK':['動作輕柔卻刀刀見骨。別被她的微笑騙了，微笑是她的煙幕彈。','你以為她在養牌，其實她在養你。等你以為安全，她就用最小的牌把你推下去。'],en:['Soft moves, sharp results. Don’t let the smile fool you—it is just smoke.','You think she is slow-building, she is just baiting you. When you feel safe, the smallest card pushes you off.']},
    zodiac:{'zh-HK':'雙子座',en:'Gemini'},
    motto:{'zh-HK':'溫柔也可以致命。',en:'Soft can still sting.'}
  },
  '穎欣':{
    dob:'1992-08-05',
    hobbies:{'zh-HK':['爵士樂','手作','陶藝'],en:['jazz','handcrafts','ceramics']},
    profile:{'zh-HK':['喜歡連段節奏，像即興爵士。你以為她迷路，其實她在鋪路，每一手都是節拍器。','她會把最強的組合留到你覺得安全那刻。等你放鬆，她的副歌就上來了。'],en:['Strings combos like jazz riffs. When you think she is lost, she is setting a trap, each hand a metronome.','She saves the strongest combo for the moment you feel safe. Once you relax, the chorus hits.']},
    zodiac:{'zh-HK':'獅子座',en:'Leo'},
    motto:{'zh-HK':'連段先係表演。',en:'Combos are the show.'}
  },
  '佩儀':{
    dob:'1994-12-19',
    hobbies:{'zh-HK':['閱讀','烘焙','拼圖'],en:['reading','baking','puzzles']},
    profile:{'zh-HK':['慢慢拼圖，慢慢拆你手牌。看起來保守，其實很會算，每一張都在她的棋盤裡。','她的牌桌像拼圖桌，最後一塊永遠在她手上。你以為只差一張，她已經收好盒子。'],en:['Builds a puzzle, then disassembles your hand. Conservative on the surface, ruthless underneath, every card has a slot.','Her table is a puzzle; the last piece is always in her hand. When you think you are one card away, she is already packing.']},
    zodiac:{'zh-HK':'射手座',en:'Sagittarius'},
    motto:{'zh-HK':'算清楚先出手。',en:'Count it, then strike.'}
  },
  '詠琪':{
    dob:'1991-10-11',
    hobbies:{'zh-HK':['旅行誌','街頭小吃','畫畫'],en:['travel journals','street food','sketching']},
    profile:{'zh-HK':['喜歡冒險路線，一手牌能走三條路。你猜不透她下一站，因為她自己也想試新路。','她的路線不固定，你的預判卻一直固定。她最愛用你的自信把你帶離正路。'],en:['Always takes the scenic route—one hand, three lines. You never know her next stop because she likes the detour.','Her routes change; your predictions do not. She uses your confidence to pull you off course.']},
    zodiac:{'zh-HK':'天秤座',en:'Libra'},
    motto:{'zh-HK':'隨機應變，最穩。',en:'Adapt fast, stay balanced.'}
  },
  '秀文':{
    dob:'1993-04-02',
    hobbies:{'zh-HK':['園藝','輕音樂','手沖咖啡'],en:['gardening','lo-fi music','pour-over coffee']},
    profile:{'zh-HK':['慢熱型，但一開花就停不下來。最後幾手通常最兇，你會突然發現已經追不回來。','前半場像散步，後半場像開花火。她會等到你放鬆那刻再點火。'],en:['Slow grower, then unstoppable bloom. Most dangerous in the last few hands—you realize too late.','First half is a stroll, second half is fireworks. She waits for your guard to drop, then lights it up.']},
    zodiac:{'zh-HK':'白羊座',en:'Aries'},
    motto:{'zh-HK':'後段先係主場。',en:'Late game is home turf.'}
  },
  '澄希':{
    dob:'1996-09-03',
    hobbies:{'zh-HK':['海邊跑步','城市探店','底片相機'],en:['seaside runs','city food hunts','film cameras']},
    profile:{'zh-HK':['她像海風一樣，來得快、走得也快。前段用節奏把你帶離正軌，後段直接收線。','她最擅長用很普通的牌打出高級感，讓你以為她在省牌，其實她在省你的路。'],en:['She moves like a sea breeze—fast in, fast out. Early tempo pulls you off course; late game she just closes the line.','She makes ordinary cards look premium, so you think she is conserving. She is really conserving your options.']},
    zodiac:{'zh-HK':'處女座',en:'Virgo'},
    motto:{'zh-HK':'風向對，就唔洗出力。',en:'With the right wind, you barely push.'}
  },
  '葵芳':{
    dob:'1995-08-18',
    hobbies:{'zh-HK':['夜間活動','飲酒'],en:['night activities','drinks']},
    profile:{'zh-HK':['夜越深越清醒，出牌節奏像霓虹一樣閃爍。她習慣在你最放鬆時加速收尾。','她愛夜場的節拍，也愛用節拍把你拖入她的節奏裡。'],en:['More awake as night deepens, her tempo flashes like neon. She speeds up when you relax.','She loves the night’s rhythm and pulls you into it with every hand.']},
    zodiac:{'zh-HK':'獅子座',en:'Leo'},
    motto:{'zh-HK':'夜深先係主場。',en:'Night is the home court.'}
  },
  '葵兄':{
    dob:'1992-10-04',
    hobbies:{'zh-HK':['夜生活','深夜食堂','夜跑'],en:['nightlife','late-night eats','night runs']},
    profile:{'zh-HK':['喜歡夜生活，越夜越精神。節奏快狠準，出手唔拖泥帶水。','夜晚先係佢嘅主場，出牌像霓虹閃過，快得你未反應佢已經收尾。'],en:['Lives for the night. Faster tempo, sharper strikes, no hesitation.','Night is his arena—neon-fast plays and clean finishes before you can react.']},
    zodiac:{'zh-HK':'天蠍座',en:'Scorpio'},
    motto:{'zh-HK':'夜晚先係舞台。',en:'Night is the stage.'}
  },
  'Jax':{
    dob:'1990-07-02',
    hobbies:{'zh-HK':['3D 繪圖','打機','童軍','游泳'],en:['3D drawing','gaming','cadet','swimming']},
    profile:{'zh-HK':['做事有條理，習慣先畫模型再落手。節奏穩定，出牌像在校準。','鍾意訓練同耐力運動，牌局一拖長就變成佢嘅節奏。'],en:['Methodical and precise, he models first then executes. Steady tempo, calibrated plays.','He likes drills and endurance—long games turn into his rhythm.']},
    zodiac:{'zh-HK':'巨蟹座',en:'Cancer'},
    motto:{'zh-HK':'先量再落。',en:'Measure, then move.'}
  },
  'Nova':{
    dob:'1998-03-08',
    hobbies:{'zh-HK':['觀星','合成器音樂','魔方'],en:['stargazing','synth music','speed cubing']},
    profile:{'zh-HK':['腦內像星圖，總能預判你下手。出牌乾脆，收尾超快，像導航把你帶進死巷。','她會先清出你能看到的路，再把看不到的路封死。你以為有三條路，其實只有她那條。'],en:['Plays with a star map in mind—predicts your next move. Clean, fast, and surgical, like a GPS into a dead end.','She clears the obvious path, then blocks the hidden one. You think you have three routes; she keeps one.']},
    zodiac:{'zh-HK':'雙魚座',en:'Pisces'},
    motto:{'zh-HK':'看得遠，先著數。',en:'See far, win early.'}
  },
  'Milo':{
    dob:'1991-07-21',
    hobbies:{'zh-HK':['街籃','滑板','拉麵地圖'],en:['streetball','skateboarding','ramen hunts']},
    profile:{'zh-HK':['快攻型選手，第一波就要把你推下坡，讓你從一開始就被迫防守。','他要你跟他跑，但你根本跟不上。等你喘過氣，他已經在終點線上揮手。'],en:['All-in on speed. The first rush is meant to push you downhill and keep you defending.','He wants you to run with him. You cannot. By the time you breathe, he is waving at the finish.']},
    zodiac:{'zh-HK':'獅子座',en:'Leo'},
    motto:{'zh-HK':'快，先贏一半。',en:'Speed wins half.'}
  },
  'Jade':{
    dob:'1996-01-16',
    hobbies:{'zh-HK':['書法','城市散步','黑膠'],en:['calligraphy','city walks','vinyl']},
    profile:{'zh-HK':['出牌像寫字，線條俐落。你以為他慢，其實他只是不亂，筆畫少但每一筆都準。','他討厭浪費牌，因為每張都該有角色。你打亂他的節奏，他會用更簡短的句子回你。'],en:['Plays like calligraphy—clean lines, no wasted strokes. You think he is slow, he just refuses chaos.','He hates wasting cards; every card must play a role. Try to disrupt him and he answers with shorter, cleaner lines.']},
    zodiac:{'zh-HK':'摩羯座',en:'Capricorn'},
    motto:{'zh-HK':'唔亂先贏。',en:'Order beats chaos.'}
  },
  'Axel':{
    dob:'1990-09-27',
    hobbies:{'zh-HK':['滑雪','街機','復古相機'],en:['snowboarding','arcades','retro cameras']},
    profile:{'zh-HK':['敢上高坡就敢滑下來。高風險高回報，輸一次都不介意。','他相信一波翻盤勝過十次小贏。你以為他亂，其實他在等最刺激的角度。'],en:['High slopes, high stakes. He is fine losing once for a big return.','He would rather flip the table once than win small ten times. What looks wild is just his favorite angle.']},
    zodiac:{'zh-HK':'天秤座',en:'Libra'},
    motto:{'zh-HK':'搏一搏，單車變跑車。',en:'Bet big, win big.'}
  },
  'Iris':{
    dob:'1995-05-04',
    hobbies:{'zh-HK':['陶藝','書店咖啡','水彩'],en:['pottery','book cafés','watercolor']},
    profile:{'zh-HK':['喜歡慢慢堆塔，堆好就一口氣推倒。她的耐心比你的手牌還長。','她會把你最愛的路線一點點封起來。等你發現時，你的路已經變成她的路。'],en:['Builds patiently, then knocks the tower down. Her patience outlasts your hand.','She quietly seals off the line you love most. When you notice, your road already belongs to her.']},
    zodiac:{'zh-HK':'金牛座',en:'Taurus'},
    motto:{'zh-HK':'慢功出細貨。',en:'Patience pays.'}
  },
  'Luna':{
    dob:'1997-10-23',
    hobbies:{'zh-HK':['夜市','獨立電影','手帳'],en:['night markets','indie films','journaling']},
    profile:{'zh-HK':['節奏多變，忽快忽慢。你一鬆懈，她就收尾，像突然關燈那一刻。','她會故意慢一拍，讓你先出錯。你以為是錯覺，其實是她的節拍器。'],en:['Switches pace on a dime. Relax once and she finishes, like lights out.','She pauses a beat on purpose, so you blink first. What feels like a glitch is her metronome.']},
    zodiac:{'zh-HK':'天蠍座',en:'Scorpio'},
    motto:{'zh-HK':'變速先係武器。',en:'Tempo is the weapon.'}
  },
  'ReXX':{
    dob:'1989-12-07',
    hobbies:{'zh-HK':['羽毛球','策略遊戲','播客'],en:['badminton','strategy games','podcasts']},
    profile:{'zh-HK':['穩定器型選手，犯錯率極低。你要贏他得靠冒險，但冒險就是他的陷阱。','他會逼你做選擇，然後把兩條路都堵住。你越想贏，越掉進他的節奏。'],en:['Low error rate, high discipline. You beat him by taking risks, but risk is his trap.','He forces a choice, then blocks both roads. The more you chase the win, the deeper you fall into his tempo.']},
    zodiac:{'zh-HK':'射手座',en:'Sagittarius'},
    motto:{'zh-HK':'穩定先係輸少。',en:'Stability saves.'}
  },
  'Nora':{
    dob:'1996-02-10',
    hobbies:{'zh-HK':['烘焙','網球','修圖'],en:['baking','tennis','photo edits']},
    profile:{'zh-HK':['平衡型，節奏舒服但不會放水。她像空調一樣，永遠在你覺得剛好的溫度。','她最會把局勢維持在剛剛好，讓你不敢冒險。等你猶豫，她就已經走完。'],en:['Balanced and steady—friendly pace, no free wins. She is like perfect air‑conditioning, always “just right.”','She keeps the game at just right so you will not risk it. While you hesitate, she is already done.']},
    zodiac:{'zh-HK':'水瓶座',en:'Aquarius'},
    motto:{'zh-HK':'舒服唔代表放鬆。',en:'Calm doesn’t mean soft.'}
  },
  'Kane':{
    dob:'1992-04-15',
    hobbies:{'zh-HK':['拳擊','圖案T','電單車'],en:['boxing','graphic tees','motorbikes']},
    profile:{'zh-HK':['喜歡硬碰硬，越打越亢奮。對他來說，安穩的牌局等於無聊。','他越被壓就越狠，像彈簧。你以為他在撐，其實他在蓄力。'],en:['Prefers head‑on clashes. The longer the fight, the more alive he gets.','The more you press, the harder he snaps back. You think he is surviving; he is charging.']},
    zodiac:{'zh-HK':'白羊座',en:'Aries'},
    motto:{'zh-HK':'硬拼先有戲。',en:'Go hard or go home.'}
  },
  'Skye':{
    dob:'1998-11-29',
    hobbies:{'zh-HK':['皮拉提斯','lo‑fi','文具收藏'],en:['pilates','lo‑fi beats','stationery']},
    profile:{'zh-HK':['表面溫柔，內心精算。最後一手最狠，像畫龍點睛。','她的微笑是陷阱，最後一張是鎖。你以為她在聊天，其實她在收網。'],en:['Soft vibe, sharp math. Deadly on the last card, like the final stroke.','Her smile is bait, her last card is the lock. You think she is chatting; she is closing the net.']},
    zodiac:{'zh-HK':'射手座',en:'Sagittarius'},
    motto:{'zh-HK':'尾段才是真功夫。',en:'The endgame tells all.'}
  },
  'Orion':{
    dob:'1990-02-02',
    hobbies:{'zh-HK':['天文攝影','登高夜景','競技遊戲'],en:['astro photography','city night hikes','competitive games']},
    profile:{'zh-HK':['他像星圖導航，先標記你所有出路，再一個個收掉。你以為還有選擇，其實已經被他圈住。','他不怕慢，怕的是你太快亂來。只要你一急，他就會用最簡單的牌把你關燈。'],en:['He plays like a star chart—marks every exit, then closes them one by one. You think you have options; he has already ringed you.','He is not afraid of slow, only of you rushing. The moment you panic, he ends it with the simplest cards.']},
    zodiac:{'zh-HK':'水瓶座',en:'Aquarius'},
    motto:{'zh-HK':'睇清先落。',en:'See it, then land it.'}
  }
};
const BACK_OPTIONS=[
  {value:'blue',file:'back-blue-clean.png',label:{'zh-HK':'藍色',en:'Blue'}},
  {value:'red',file:'back-red-clean2.png',label:{'zh-HK':'紅色',en:'Red'}},
  {value:'green',file:'back-green-clean.png',label:{'zh-HK':'綠色',en:'Green'}},
  {value:'gold',file:'back-gold-clean.png',label:{'zh-HK':'金色',en:'Gold'}},
  {value:'purple',file:'back-purple-clean2.png',label:{'zh-HK':'紫色',en:'Purple'}}
];
const BASE_URL=(import.meta.env?.BASE_URL??'./').replace(/\/?$/,'/');
const withBase=(p)=>`${BASE_URL}${String(p??'').replace(/^\/+/,'')}`;
const normalizeCalloutVoiceMode=(v)=>{
  const mode=String(v??'').toLowerCase();
  if(mode==='tts')return 'auto';
  return mode==='off'||mode==='recorded'||mode==='auto'?mode:'auto';
};
const normalizeCalloutStylePack=(v)=>{
  void v;
  return 'energetic';
};
const winnerCalloutWinsByName=new Map();

const t=(k)=>I18N[state.language][k]??k;
function formatHobbyList(hobbies){
  const list=Array.isArray(hobbies)?hobbies.map((x)=>String(x??'').trim()).filter(Boolean):[];
  if(!list.length)return'-';
  const joiner=state.language==='zh-HK'?'、':', ';
  return list.join(joiner);
}
function zodiacSymbol(name=''){
  const key=String(name??'').toLowerCase();
  if(!key)return'';
  if(key.includes('aries')||key.includes('白羊'))return'♈';
  if(key.includes('taurus')||key.includes('金牛'))return'♉';
  if(key.includes('gemini')||key.includes('雙子'))return'♊';
  if(key.includes('cancer')||key.includes('巨蟹'))return'♋';
  if(key.includes('leo')||key.includes('獅子'))return'♌';
  if(key.includes('virgo')||key.includes('處女'))return'♍';
  if(key.includes('libra')||key.includes('天秤'))return'♎';
  if(key.includes('scorpio')||key.includes('天蠍'))return'♏';
  if(key.includes('sagittarius')||key.includes('射手'))return'♐';
  if(key.includes('capricorn')||key.includes('摩羯'))return'♑';
  if(key.includes('aquarius')||key.includes('水瓶'))return'♒';
  if(key.includes('pisces')||key.includes('雙魚'))return'♓';
  return'';
}
function hashTextSeed(seed=''){
  const txt=String(seed??'');
  let h=0;
  for(let i=0;i<txt.length;i++){
    h=((h*31)+txt.charCodeAt(i))>>>0;
  }
  return h;
}
function buildResponseCalloutText(type,kind='',seed='',meta={}){
  const lang=state.language==='en'?'en':'zh-HK';
  const bank=CALLOUT_RESPONSE_TEXT[lang]??CALLOUT_RESPONSE_TEXT['zh-HK'];
  if(type==='pass'){
    const opts=bank.pass??[];
    if(!opts.length)return lang==='en'?'Pass':'大';
    let idx=hashTextSeed(`${seed}|pass`) % opts.length;
    if(opts.length>1&&String(opts[idx])===String(passCallState.text??''))idx=(idx+1)%opts.length;
    return String(opts[idx]);
  }
  if(type==='play'){
    const opts=bank.play??[];
    const label=kindLabel(kind);
    if(Boolean(meta?.isRoundLead))return`${label}!`;
    if(!opts.length)return`${label}!`;
    const forcedIdxRaw=Number(meta?.playVariantIndex);
    let idx=Number.isFinite(forcedIdxRaw)
      ?Math.max(0,Math.min(opts.length-1,Math.trunc(forcedIdxRaw)))
      :hashTextSeed(`${seed}|play|${kind}`) % opts.length;
    let fmt=opts[idx];
    let out=typeof fmt==='function'?String(fmt(label)):String(fmt);
    if(opts.length>1&&out===String(playTypeCallState.text??'')){
      idx=(idx+1)%opts.length;
      fmt=opts[idx];
      out=typeof fmt==='function'?String(fmt(label)):String(fmt);
    }
    return out;
  }
  if(type==='last'){
    const opts=bank.last??[];
    if(!opts.length)return t('lastCardCall');
    let idx=hashTextSeed(`${seed}|last`) % opts.length;
    if(opts.length>1&&String(opts[idx])===String(lastCardCallState.text??''))idx=(idx+1)%opts.length;
    return String(opts[idx]);
  }
  return'';
}
function buildWinnerCalloutForSeat(game,seat){
  const lang=state.language==='en'?'en':'zh-HK';
  const bank=CALLOUT_RESPONSE_TEXT[lang]??CALLOUT_RESPONSE_TEXT['zh-HK'];
  const winnerLines=Array.isArray(bank.winner)?bank.winner:[];
  const winnerRepeat=String(bank.winnerRepeat??'').trim();
  const nameRaw=String(game?.players?.[seat]?.name??'').trim();
  const nameKey=nameRaw||`seat-${Number.isFinite(Number(seat))?Number(seat):0}`;
  const wins=(Number(winnerCalloutWinsByName.get(nameKey))||0)+1;
  winnerCalloutWinsByName.set(nameKey,wins);
  if(wins>1&&winnerRepeat)return{text:winnerRepeat,repeat:true};
  if(!winnerLines.length)return{text:'',repeat:false};
  const idx=Math.abs(hashTextSeed(`${nameKey}|winner|${wins}`))%winnerLines.length;
  return{text:String(winnerLines[idx]),repeat:false};
}
function normalizeCalloutText(msg=''){
  return String(msg??'')
    .toLowerCase()
    .replace(/[!！。.,，]/g,'')
    .replace(/\s+/g,' ')
    .trim();
}
function isPassCalloutText(msg=''){
  const norm=normalizeCalloutText(msg);
  if(!norm)return false;
  if(norm==='pass'||norm==='大')return true;
  const lang=state.language==='en'?'en':'zh-HK';
  const bank=CALLOUT_RESPONSE_TEXT[lang]??CALLOUT_RESPONSE_TEXT['zh-HK'];
  const passSet=(bank.pass??[]).map((x)=>normalizeCalloutText(x)).filter(Boolean);
  return passSet.includes(norm);
}
function isLastCalloutText(msg=''){
  const norm=normalizeCalloutText(msg);
  if(!norm)return false;
  const lastNorm=normalizeCalloutText(t('lastCardCall'));
  if(norm===lastNorm||norm.includes('last'))return true;
  const lang=state.language==='en'?'en':'zh-HK';
  const bank=CALLOUT_RESPONSE_TEXT[lang]??CALLOUT_RESPONSE_TEXT['zh-HK'];
  const lastSet=(bank.last??[]).map((x)=>normalizeCalloutText(x)).filter(Boolean);
  return lastSet.includes(norm);
}
function isCanonicalRecordedCalloutText(msg='',clipKey=''){
  const norm=normalizeCalloutText(msg);
  const key=String(clipKey??'').trim().toLowerCase();
  if(!norm||!key)return false;
  if(key==='pass')return norm==='pass'||norm==='\u5927';
  if(key==='last')return norm===normalizeCalloutText(t('lastCardCall'));
  if(key==='winner'){
    const lang=state.language==='en'?'en':'zh-HK';
    const bank=CALLOUT_RESPONSE_TEXT[lang]??CALLOUT_RESPONSE_TEXT['zh-HK'];
    const winnerSet=(bank.winner??[]).map((x)=>normalizeCalloutText(x)).filter(Boolean);
    return winnerSet.includes(norm);
  }
  if(key==='winner-repeat'){
    const lang=state.language==='en'?'en':'zh-HK';
    const bank=CALLOUT_RESPONSE_TEXT[lang]??CALLOUT_RESPONSE_TEXT['zh-HK'];
    return norm===normalizeCalloutText(bank.winnerRepeat??'');
  }
  if(key.startsWith('kind-')){
    const kind=key.slice(5);
    const label=normalizeCalloutText(kindLabel(kind));
    return norm===label||norm===`${label}!`;
  }
  return false;
}

function deriveWinnerVariantClipKey(msg=''){
  const norm=normalizeCalloutText(msg);
  if(!norm)return'';
  const lang=state.language==='en'?'en':'zh-HK';
  const bank=CALLOUT_RESPONSE_TEXT[lang]??CALLOUT_RESPONSE_TEXT['zh-HK'];
  const repeatNorm=normalizeCalloutText(bank.winnerRepeat??'');
  if(repeatNorm&&repeatNorm===norm)return'line-winner-repeat';
  const winnerList=Array.isArray(bank.winner)?bank.winner:[];
  for(let i=0;i<winnerList.length;i+=1){
    if(normalizeCalloutText(winnerList[i])===norm)return`line-winner-${i+1}`;
  }
  return'';
}

async function playWinnerCallout(wc,gender='male',seat=0){
  if(!wc||!wc.text)return;
  if(calloutVoiceMode==='off')return;
  const clipKey=wc.repeat?'winner-repeat':'winner';
  const speakSeq=++calloutSpeakSeq;
  const ok=await playRecordedCalloutClip(clipKey,gender,speakSeq);
  if(!ok)speakCallout(wc.text,gender,{clipKey,seat});
}

function deriveZhHkVariantClipKey(msg='',meta={}){
  if(state.language!=='zh-HK')return'';
  const norm=normalizeCalloutText(msg);
  if(!norm)return'';
  const bank=CALLOUT_RESPONSE_TEXT['zh-HK']??{};
  const passList=Array.isArray(bank.pass)?bank.pass:[];
  for(let i=0;i<passList.length;i+=1){
    if(normalizeCalloutText(passList[i])===norm)return`line-pass-${i+1}`;
  }
  const lastList=Array.isArray(bank.last)?bank.last:[];
  for(let i=0;i<lastList.length;i+=1){
    if(normalizeCalloutText(lastList[i])===norm)return`line-last-${i+1}`;
  }
  const explicit=String(meta?.clipKey??'').trim().toLowerCase();
  let kindKey='';
  if(explicit.startsWith('kind-'))kindKey=explicit.slice(5);
  if(!kindKey){
    const zhKinds=KIND['zh-HK']??{};
    for(const[k,v]of Object.entries(zhKinds)){
      const label=normalizeCalloutText(v);
      if(label&&norm.startsWith(label)){kindKey=k;break;}
    }
  }
  if(!kindKey)return'';
  const playTemplates=Array.isArray(bank.play)?bank.play:[];
  const kindText=(KIND['zh-HK']?.[kindKey])??'';
  if(!kindText)return'';
  for(let i=0;i<playTemplates.length;i+=1){
    const tpl=playTemplates[i];
    const candidate=typeof tpl==='function'?String(tpl(kindText)):String(tpl??'');
    if(normalizeCalloutText(candidate)===norm)return`line-kind-${kindKey}-${i+1}`;
  }
  return'';
}
function deriveEnVariantClipKey(msg='',meta={}){
  if(state.language!=='en')return'';
  const norm=normalizeCalloutText(msg);
  if(!norm)return'';
  const bank=CALLOUT_RESPONSE_TEXT['en']??{};
  const passList=Array.isArray(bank.pass)?bank.pass:[];
  for(let i=0;i<passList.length;i+=1){
    if(normalizeCalloutText(passList[i])===norm){
      return i===0?'':`line-pass-${i+1}`;
    }
  }
  const lastList=Array.isArray(bank.last)?bank.last:[];
  for(let i=0;i<lastList.length;i+=1){
    if(normalizeCalloutText(lastList[i])===norm){
      return i===0?'':`line-last-${i+1}`;
    }
  }
  const explicit=String(meta?.clipKey??'').trim().toLowerCase();
  let kindKey='';
  if(explicit.startsWith('kind-'))kindKey=explicit.slice(5);
  if(!kindKey){
    const enKinds=KIND.en??{};
    for(const[k,v] of Object.entries(enKinds)){
      const label=normalizeCalloutText(v);
      if(label&&norm.startsWith(label)){kindKey=k;break;}
    }
  }
  if(!kindKey)return'';
  const playTemplates=Array.isArray(bank.play)?bank.play:[];
  const kindText=KIND.en?.[kindKey]??'';
  if(!kindText)return'';
  for(let i=0;i<playTemplates.length;i+=1){
    const tpl=playTemplates[i];
    const candidate=typeof tpl==='function'?String(tpl(kindText)):String(tpl??'');
    if(normalizeCalloutText(candidate)===norm){
      return i===0?'':`line-kind-${kindKey}-${i+1}`;
    }
  }
  return'';
}
function deriveZhHkComposedClipKeys(variantClipKey='',clipKey=''){
  if(state.language!=='zh-HK')return[];
  const key=String(variantClipKey??'').trim().toLowerCase();
  const baseClip=String(clipKey??'').trim().toLowerCase();
  if(!key||!baseClip.startsWith('kind-'))return[];
  const match=/^line-kind-[a-z]+-(\d+)$/.exec(key);
  if(!match)return[];
  const variantNum=Number(match[1]);
  if(!Number.isFinite(variantNum)||variantNum<1||variantNum>5)return[];
  if(variantNum===1)return[baseClip];
  const tailMap={
    2:'line-play-tail-2',
    3:'line-play-tail-3',
    4:'line-play-tail-4',
    5:'line-play-tail-5'
  };
  const tailKey=tailMap[variantNum]??'';
  if(!tailKey)return[];
  return[baseClip,tailKey];
}
const kindLabel=(k)=>KIND[state.language][k]??k;
function setSoloStatus(message,{appendLog=true}={}){
  const g=state.solo;
  if(!g)return;
  const text=String(message??'').trim();
  g.status=text;
  if(!appendLog||!text)return;
  if(!Array.isArray(g.systemLog))g.systemLog=[];
  const last=g.systemLog[g.systemLog.length-1];
  if(last&&last.text===text)return;
  g.systemLog.push({text,ts:Date.now()});
  if(g.systemLog.length>200)g.systemLog=g.systemLog.slice(-200);
}
function legalMiniCopy(){
  const zh=state.language==='zh-HK';
  const listHtml=(items,ordered=false)=>`${ordered?'<ol>':'<ul>'}${items.map((x)=>`<li>${esc(x)}</li>`).join('')}${ordered?'</ol>':'</ul>'}`;
  const labels=zh
    ?{privacy:'私隱政策',about:'關於我們',contact:'聯絡我們',terms:'使用條款'}
    :{privacy:'Privacy',about:'About',contact:'Contact',terms:'Terms'};
  const privacyIntro=zh
    ?'我們重視你的私隱並以最少必要原則處理資料。'
    :'We follow a data-minimal approach to protect your privacy.';
  const privacyCollect=zh
    ?[
      '帳戶資料：顯示名稱、登入電郵',
      '遊戲資料：設定、對戰紀錄、分數與排行榜',
      '技術資料：裝置類型、作業系統、瀏覽器版本、語言、基本錯誤記錄'
    ]
    :[
      'Account data: display name, sign-in email',
      'Game data: settings, match records, scores, leaderboard',
      'Technical data: device type, OS, browser version, language, basic error logs'
    ];
  const privacyUse=zh
    ?[
      '維持登入與偏好設定（Cookies 或同類技術）',
      '遊戲運作、排行榜與統計分析',
      '防止濫用、風險控制與技術維護'
    ]
    :[
      'Maintain sign-in and preferences (cookies or similar)',
      'Core gameplay, leaderboard, and statistics',
      'Abuse prevention, risk control, and maintenance'
    ];
  const privacyNotes=zh
    ?'資料不會出售作第三方行銷用途，並會在合理期限內清理。你可在瀏覽器管理 Cookies；停用後可能影響登入或偏好保存。如需查詢或更正／刪除資料，請透過聯絡方式與我們聯絡。'
    :'We do not sell your data for third‑party marketing and retain it only as needed before cleanup. You can manage cookies in your browser; disabling them may affect sign-in or preferences. For questions or correction/removal requests, contact us.';
  const aboutIntro=zh
    ?'《鋤大D（Big Two）》網頁版專注於跨裝置一致體驗。'
    :'This browser-based Big Two focuses on consistent play across devices.';
  const aboutList=zh
    ?[
      '支援手機、平板與桌面快速開局',
      '提供單人對戰與房間對戰',
      '排行榜、個人設定與成績追蹤',
      '清晰出牌提示、即時狀態與計分明細'
    ]
    :[
      'Fast start on phone, tablet, and desktop',
      'Solo and room matches',
      'Leaderboard, personal settings, performance tracking',
      'Clear play cues, live status, and scoring details'
    ];
  const aboutNotes=zh
    ?'我們持續優化效能、互動回饋、版面適配與穩定性，並依玩家回饋改進。'
    :'We continuously improve performance, interaction feedback, responsive layout, and stability based on player feedback.';
  const termsIntro=zh
    ?'使用本網站即表示你同意：'
    :'By using this website, you agree to:';
  const termsList=zh
    ?[
      '合法及公平使用服務，不作弊、濫用或干擾系統',
      '不使用外掛、自動化程式、爬蟲或非正常手段影響對局或排行',
      '帳戶與裝置安全由使用者自行管理',
      '排行榜與戰績以系統記錄為準，異常數據可被修正或移除',
      '維護、安全或法規需要下可調整功能或暫停部分服務',
      '對於網絡、裝置或第三方服務導致的中斷或損失不作保證'
    ]
    :[
      'Use the service lawfully and fairly without cheating or abuse',
      'Avoid plugins, automation, crawlers, or non-standard methods that affect matches or leaderboards',
      'Keep your account/device secure',
      'Leaderboards and records follow system logs and may be corrected for anomalies',
      'Features may change or suspend for maintenance, security, or legal needs',
      'No guarantee against interruptions or data loss from network/device/third-party outages'
    ];
  const termsNotes=zh
    ?'若不同意上述條款，請停止使用本網站。'
    :'Discontinue use if you do not accept these terms.';
  const supportText=zh
    ?'喜歡這個遊戲？歡迎點擊或掃描支持我們一杯咖啡，讓我們持續更新與改善。'
    :'Enjoying the game? Click or scan to support us with a coffee so we can keep improving it.';
  const supportHtml=`<div class="bmac-cta"><div class="bmac-msg">${esc(supportText)}</div><div class="bmac-row"><a href="https://www.buymeacoffee.com/4leafx" target="_blank" rel="noopener noreferrer"><img class="bmac-button" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee"></a><img class="bmac-qr" src="${withBase('bmac-qr.png')}" alt="Buy Me A Coffee QR"></div></div>`;
  const contactHtml=zh
    ?'如有查詢，請電郵至 <a href="mailto:4LeafxCS@gmail.com">4LeafxCS@gmail.com</a>。'
    :'For enquiries, email <a href="mailto:4LeafxCS@gmail.com">4LeafxCS@gmail.com</a>.';
  const contactList=zh
    ?[
      '裝置型號與系統版本',
      '瀏覽器與版本',
      '發生時間與操作步驟',
      '截圖或錄影（如適用）'
    ]
    :[
      'Device model and OS version',
      'Browser and version',
      'Time and steps to reproduce',
      'Screenshots or screen recording (if any)'
    ];
  return{
    labels,
    closeLabel:zh?'關閉':'Close',
      content:{
        privacy:`<h4>${esc(labels.privacy)}</h4><p>${esc(privacyIntro)}</p><p>${zh?'收集資料':'Data we collect'}</p>${listHtml(privacyCollect)}<p>${zh?'使用目的':'How we use data'}</p>${listHtml(privacyUse)}<p>${esc(privacyNotes)}</p>`,
        about:`<h4>${esc(labels.about)}</h4><div class="legal-about-grid"><div class="legal-about-main"><p>${esc(aboutIntro)}</p>${listHtml(aboutList)}<p>${esc(aboutNotes)}</p></div><div class="legal-about-side">${supportHtml}</div></div>`,
        contact:`<h4>${esc(labels.contact)}</h4><p>${contactHtml}</p><p>${zh?'建議提供':'Please include'}</p>${listHtml(contactList)}`,
        terms:`<h4>${esc(labels.terms)}</h4><p>${esc(termsIntro)}</p>${listHtml(termsList,true)}<p>${esc(termsNotes)}</p>`
      }
    };
  }
  function mainPageLegalMiniHtml(){
    const legal=legalMiniCopy();
    return`<section class="legal-mini" id="legal-mini"><div class="legal-mini-links"><button type="button" class="legal-mini-link" data-legal="privacy">${legal.labels.privacy}</button><span class="legal-mini-sep">◦</span><button type="button" class="legal-mini-link" data-legal="about">${legal.labels.about}</button><span class="legal-mini-sep">◦</span><button type="button" class="legal-mini-link" data-legal="contact">${legal.labels.contact}</button><span class="legal-mini-sep">◦</span><button type="button" class="legal-mini-link" data-legal="terms">${legal.labels.terms}</button></div><div class="intro-modal legal-modal" id="legal-modal"><button class="intro-backdrop" id="legal-backdrop" aria-label="close"></button><section class="intro-sheet legal-sheet"><header class="intro-head"><div><h3 id="legal-modal-title"></h3></div><button id="legal-close" class="secondary">${legal.closeLabel}</button></header><div class="legal-modal-body" id="legal-modal-body"></div></section></div></section>`;
  }
const introText=()=>state.language==='en'
  ?{
    btnShow:'Guide',
    btnHide:'Close',
    panelTitle:'Guide',
    panelSub:'Official quick reference covering core rules, hand hierarchy, opening flow, and practical table strategy.',
    historyTitle:'Background',
    historyBody:'Big Two (Cho Dai Di) is a four-player shedding card game using a standard 52-card deck without jokers. Each player receives 13 cards, and the objective is to empty your hand before all opponents. The game is known for high decision density, compact round duration, and strong strategic interaction between tempo control, hand preservation, and timing of power cards.',
    playTitle:'Gameplay Highlights',
    playList:[
      'Opening lead of the first round must contain {{3D}}.',
      'Follow play must match card count: single, pair, triple, or 5-card hand.',
      'Five-card hierarchy: Straight < Flush < Full House < Four of a Kind < Straight Flush.',
      'For equal ranks, suit order is ♦️ < ♣️ < ♥️ < ♠️.',
      'Single-card order: 2 > A > K > ... > 3 (highest: ♠️Spade 2, lowest: ♦️3).',
      'After three consecutive passes, initiative returns to the last successful player.',
      'When you hold initiative, choose a tempo that preserves control and blocks opponent exits.'
    ],
      flowTitle:'Opening Flow',
      flowList:[
        'Deal 13 cards to each of the 4 players.',
        'The player holding {{3D}} must open the first trick.',
        'Other players either beat with matching card count or pass.',
        'After three passes, the previous winning play resets the lead.',
        'Round ends immediately when one player plays all cards.'
      ],
      guideHowTitle:'How to Play',
      guideHowIntro:'Quick start steps to begin a match:',
      guideHowList:[
        'Sign in to enable room play and leaderboard tracking.',
        'From Home, choose Solo or enter the Lobby to create/join a room.',
        'In a room, tap Ready; the host presses Start when at least 2 players are ready.',
        'On your turn, select cards and tap Play; tap Pass when allowed.',
        'Use Suggest for help, and sort/drag to organize your hand.'
      ],
      guideHomeTitle:'Add to Home Screen',
      guideHomeIntro:'Add it to your Home screen for a full-screen, app-like launch.',
      guideAndroidTitle:'Android (Chrome)',
      guideAndroidSteps:[
        'Open this site in Chrome.',
        'Tap the three-dot menu.',
        'Select Add to Home screen.',
        'Confirm the name and tap Add.'
      ],
      guideIosTitle:'iPhone / iPad (Safari)',
      guideIosSteps:[
        'Open this site in Safari.',
        'Tap Share (square with an up arrow).',
        'Choose Add to Home Screen.',
        'Confirm the name and tap Add.'
      ],
      guideHomeNotes:'If you do not see the option, make sure you are using Safari/Chrome rather than an in-app browser.',
      howTitle:'Hand Types',
      howBody:'To follow, card count must match the active play. For 5-card contests, compare hand category first, then compare the relevant high cards and suits under game rules.',
      howList:[]
    }
  :{
    btnShow:'玩法指南',
    btnHide:'關閉',
    panelTitle:'玩法指南',
    panelSub:'提供核心規則、牌型次序、開局流程與實戰節奏的官方速覽。',
    historyTitle:'歷史背景',
    historyBody:'《鋤大D》（Big Two）為四人出清型撲克牌遊戲，使用標準52張牌（不含鬼牌），每位玩家派發13張。玩家的目標是在其他對手之前出清手牌。此遊戲特色在於回合節奏明確、決策密度高，並重視控場、保留關鍵牌與出牌時機的策略取捨。',
    playTitle:'玩法重點',
    playList:[
      '首圈開局第一手必須包含 {{3D}}。',
      '跟牌必須跟相同張數：單張／一對／三條／五張牌型。',
      '五張牌型大小：蛇 < 花 < 俘佬 < 四條 < 同花順。',
      '同點數比較花色：♦️< ♣️ < ♥️< ♠️。',
      '單張大小：2 > A > K > ... > 3（最大單張：♠️2；最小單張：♦️3）。',
      '連續三家過牌後，由最後有效出牌者重新話事。',
      '當你話事時，應平衡節奏控制與大牌保留，避免被對手一手出清。'
    ],
      flowTitle:'開局流程',
      flowList:[
        '4 位玩家每人派發 13 張手牌。',
        '持有 {{3D}} 的玩家必須先開第一手。',
        '其餘玩家需以相同張數壓過，或選擇過牌。',
        '連續三家過牌後，回到上一手有效出牌者重新話事。',
        '直至有玩家先出清手牌，該局立即結束。'
      ],
      guideHowTitle:'玩法教學',
      guideHowIntro:'快速上手，以下步驟可完成開局並開始對戰：',
      guideHowList:[
        '登入後可進行房間對戰與排行榜記錄。',
        '主頁選擇「開局」（單人）或進入大堂建立／加入房間。',
        '房間內先點「準備」，房主在至少 2 位玩家就緒後按「開始」。',
        '輪到你時，選牌後按「出牌」，可過牌時按「過牌」。',
        '需要提示可按「建議」，亦可使用排序或拖曳整理手牌。'
      ],
      guideHomeTitle:'加到主畫面',
      guideHomeIntro:'加到主畫面後可像 App 一樣全螢幕開啟。',
      guideAndroidTitle:'Android（Chrome）',
      guideAndroidSteps:[
        '用 Chrome 開啟本網站。',
        '點右上角「⋮」選單。',
        '選擇「加到主畫面」。',
        '確認名稱後點「新增」。'
      ],
      guideIosTitle:'iPhone / iPad（Safari）',
      guideIosSteps:[
        '用 Safari 開啟本網站。',
        '點下方「分享」按鈕（方形向上箭頭）。',
        '選擇「加入主畫面」。',
        '確認名稱後點「加入」。'
      ],
      guideHomeNotes:'如看不到相關選項，請確認不是在其他 App 的內置瀏覽器內開啟。',
      howTitle:'牌型',
      howBody:'跟牌時必須符合相同張數。若為五張牌對比，先比較牌型等級，再按規則比較相關主牌點數與花色。',
      howList:[]
    };
function introHandSamples(){
  const card=(rank,suit)=>{
    const r=RANKS.indexOf(rank);
    const s=SUITS.findIndex((x)=>x.symbol===suit);
    return{rank:Math.max(0,r),suit:Math.max(0,s)};
  };
  if(state.language==='en'){
    return[
      {name:'Single',desc:'1 card',cards:[card('A','♠️')]},
      {name:'Pair',desc:'2 same rank',cards:[card('9','♦️'),card('9','♣️')]},
      {name:'Triple',desc:'3 same rank',cards:[card('7','♦️'),card('7','♣️'),card('7','♠️')]},
      {name:'Straight (Snake)',desc:'5 consecutive ranks',cards:[card('6','♦️'),card('7','♣️'),card('8','♥️'),card('9','♠️'),card('10','♣️')]},
      {name:'Flush (Flower)',desc:'5 same suit',cards:[card('3','♥️'),card('7','♥️'),card('9','♥️'),card('J','♥️'),card('A','♥️')]},
      {name:'Full House',desc:'Triple + Pair',cards:[card('Q','♣️'),card('Q','♦️'),card('Q','♠️'),card('5','♥️'),card('5','♣️')]},
      {name:'Four of a Kind',desc:'4 same rank + kicker',cards:[card('8','♦️'),card('8','♣️'),card('8','♥️'),card('8','♠️'),card('2','♣️')]},
      {name:'Straight Flush',desc:'Same suit + consecutive',cards:[card('5','♠️'),card('6','♠️'),card('7','♠️'),card('8','♠️'),card('9','♠️')]}
    ];
  }
  return[
    {name:'單張',desc:'1張牌',cards:[card('A','♠️')]},
    {name:'一對',desc:'2張同點數',cards:[card('9','♦️'),card('9','♣️')]},
    {name:'三條',desc:'3張同點數',cards:[card('7','♦️'),card('7','♣️'),card('7','♠️')]},
    {name:'蛇',desc:'5張連續點數',cards:[card('6','♦️'),card('7','♣️'),card('8','♥️'),card('9','♠️'),card('10','♣️')]},
    {name:'花',desc:'5張同花色',cards:[card('3','♥️'),card('7','♥️'),card('9','♥️'),card('J','♥️'),card('A','♥️')]},
    {name:'俘佬',desc:'三條 + 一對',cards:[card('Q','♣️'),card('Q','♦️'),card('Q','♠️'),card('5','♥️'),card('5','♣️')]},
    {name:'四條',desc:'4張同點數 + 腳',cards:[card('8','♦️'),card('8','♣️'),card('8','♥️'),card('8','♠️'),card('2','♣️')]},
    {name:'同花順',desc:'同花色 + 連續點數',cards:[card('5','♠️'),card('6','♠️'),card('7','♠️'),card('8','♠️'),card('9','♠️')]}
  ];
}
function introPanelHtml(){
  const it=introText();
  const formatIntroLine=(text)=>{
    const token='{{3D}}';
    const card3d=state.language==='en'?'♦️Diamond 3':'♦️3';
    return colorizeSuitText(String(text??'').replaceAll(token,card3d));
  };
    const rows=introHandSamples().map((row)=>`<div class="intro-hand-row"><div class="intro-hand-meta"><strong>${esc(row.name)}</strong><span>${esc(row.desc)}</span></div><div class="intro-hand-cards">${row.cards.map((c)=>renderStaticCard(c,true)).join('')}</div></div>`).join('');
    const howList=(it.guideHowList??[]).map((x)=>`<li>${esc(x)}</li>`).join('');
    const androidList=(it.guideAndroidSteps??[]).map((x)=>`<li>${esc(x)}</li>`).join('');
    const iosList=(it.guideIosSteps??[]).map((x)=>`<li>${esc(x)}</li>`).join('');
    return`<div class="intro-modal" id="intro-modal"><button class="intro-backdrop" id="intro-backdrop" aria-label="close"></button><section class="intro-sheet"><header class="intro-head"><div><h3 class="title-with-icon"><span class="title-icon title-icon-guide" aria-hidden="true"></span><span>${esc(it.panelTitle)}</span></h3>${it.panelSub?`<p>${colorizeSuitText(it.panelSub)}</p>`:''}</div><button id="intro-close" class="secondary">${esc(it.btnHide)}</button></header><div class="intro-grid"><article class="intro-block"><h4>${esc(it.historyTitle)}</h4><p>${colorizeSuitText(it.historyBody)}</p></article><article class="intro-block"><h4>${esc(it.howTitle)}</h4><p>${colorizeSuitText(it.howBody)}</p><div class="intro-hand-list">${rows}</div></article><article class="intro-block"><h4>${esc(it.flowTitle)}</h4><ul>${(it.flowList??[]).map((x)=>`<li>${formatIntroLine(x)}</li>`).join('')}</ul></article><article class="intro-block"><h4>${esc(it.playTitle)}</h4><ul>${(it.playList??[]).map((x)=>`<li>${formatIntroLine(x)}</li>`).join('')}</ul></article><article class="intro-block"><h4>${esc(it.guideHowTitle)}</h4><p>${esc(it.guideHowIntro)}</p><ul>${howList}</ul></article><article class="intro-block"><h4>${esc(it.guideHomeTitle)}</h4><p>${esc(it.guideHomeIntro)}</p><p><strong>${esc(it.guideAndroidTitle)}</strong></p><ol>${androidList}</ol><p><strong>${esc(it.guideIosTitle)}</strong></p><ol>${iosList}</ol><p>${esc(it.guideHomeNotes)}</p></article></div></section></div>`;
  }
function leaderboardModalHtml(){
  const closeLabel=state.language==='en'?'Close':'關閉';
  return`<div class="intro-modal lb-modal" id="lb-modal"><button class="intro-backdrop" id="lb-backdrop" aria-label="close"></button><section class="intro-sheet lb-sheet"><header class="intro-head"><div><h3 class="title-with-icon"><span class="title-icon title-icon-leaderboard" aria-hidden="true"></span><span>${t('lb')}</span></h3><p>${esc(t('lbHeadingDesc'))}</p></div><button id="lb-close" class="secondary">${closeLabel}</button></header>${leaderboardPanelHtml()}</section></div>`;
}
const lbText=()=>state.language==='en'
  ?{best:'Best',worst:'Worst',updated:'Updated',wr:'WR',avg:'Avg'}
  :{best:'最佳',worst:'最差',updated:'更新',wr:'勝率',avg:'平均'};
function fmtDateTime(ts){
  const n=Number(ts)||0;
  if(!n)return'-';
  try{return new Date(n).toLocaleString(state.language==='en'?'en-US':'zh-HK',{hour12:false});}catch{return'-';}
}
function fmtPct(n){return `${Math.round((Number(n)||0)*100)}%`;}
function loadLeaderboardStore(){
  return runtimeProfileStore;
}
function saveLeaderboardStore(store){
  if(!store||typeof store!=='object')return;
  runtimeProfileStore.players=store.players&&typeof store.players==='object'?store.players:{};
}
function clampScoreValue(v){
  const n=Number(v);
  if(!Number.isFinite(n))return 5000;
  return Math.max(0,Math.trunc(n));
}
function scoreFromStoredTotal(totalScore){
  return clampScoreValue(totalScore);
}
function collectMainSettings(){
  return{
    language:state.language==='en'?'en':'zh-HK',
    aiDifficulty:['easy','normal','hard'].includes(state.home.aiDifficulty)?state.home.aiDifficulty:'normal',
    backColor:BACK_OPTIONS.some((x)=>x.value===state.home.backColor)?state.home.backColor:'red',
    soundEnabled:Boolean(sound.enabled),
    calloutDisplayEnabled:Boolean(calloutDisplayEnabled),
    calloutVoiceMode:normalizeCalloutVoiceMode(calloutVoiceMode),
    calloutStylePack:normalizeCalloutStylePack(calloutStylePack),
    gender:state.home.gender==='female'?'female':'male',
    avatarChoice:['male','female','google'].includes(state.home.avatarChoice)?state.home.avatarChoice:'male',
    turnTimeout:DEFAULT_TURN_TIMEOUT_MS
  };
}
function applyMainSettings(settings){
  if(!settings||typeof settings!=='object')return;
  const language=String(settings.language??'');
  if(language==='en'||language==='zh-HK')state.language=language;
  const ai=String(settings.aiDifficulty??'');
  if(['easy','normal','hard'].includes(ai))state.home.aiDifficulty=ai;
  const back=String(settings.backColor??'');
  if(BACK_OPTIONS.some((x)=>x.value===back))state.home.backColor=back;
  if(typeof settings.soundEnabled==='boolean')sound.enabled=Boolean(settings.soundEnabled);
  if(typeof settings.calloutDisplayEnabled==='boolean')calloutDisplayEnabled=Boolean(settings.calloutDisplayEnabled);
  calloutVoiceMode=normalizeCalloutVoiceMode(settings.calloutVoiceMode);
  calloutStylePack=normalizeCalloutStylePack(settings.calloutStylePack);
  const gender=String(settings.gender??'');
  if(gender==='male'||gender==='female')state.home.gender=gender;
  const avatarChoice=String(settings.avatarChoice??'');
  if(avatarChoice==='male'||avatarChoice==='female'||avatarChoice==='google')state.home.avatarChoice=avatarChoice;
}
function syncSessionScoreFromStore(store,{force=false}={}){
  if(!store||typeof store!=='object'||!store.players||typeof store.players!=='object')return;
  const identity=currentLeaderboardIdentity();
  const entry=store.players[String(identity.id??'')];
  if(!entry)return;
  const inGame=state.screen==='game'&&Array.isArray(state.solo.players)&&state.solo.players.length>0&&!state.solo.gameOver;
  if(inGame&&!force)return;
  const restored=scoreFromStoredTotal(entry.totalScore);
  state.score=restored;
  state.solo.totals=[restored,5000,5000,5000];
}
async function hydrateProfileFromCloudByIdentity(identity){
  initFirebaseIfReady();
  try{
    const ids=identityLookupIds(identity);
    if(!ids.length)return false;
    let data=null;
    let foundId='';
    for(const id of ids){
      if(firebaseDb){
        try{
          const s=await firebaseDb.collection(FIRESTORE_LB_COLLECTION).doc(id).get();
          if(s.exists){data=s.data()??{};foundId=id;break;}
        }catch{}
      }
      if(!data){
        try{
          const d=await readProfileDocByRest(id);
          if(d){data=d;foundId=id;break;}
        }catch{}
      }
    }
    if(!data)return false;
    const d=data;
    const restoredName=String(d.name??'').trim().slice(0,18);
    const restoredScore=scoreFromStoredTotal(d.totalScore);
    const restoredGender=String(d.gender??state.home.gender??'male')==='female'?'female':'male';
    const restoredPicture=String(d.picture??'').trim();
    applyMainSettings(d.settings);
    const store=loadLeaderboardStore();
    const entry=ensureLeaderboardEntry(store,identity);
    if(entry){
      entry.name=restoredName||entry.name;
      entry.gender=restoredGender;
      entry.settings=collectMainSettings();
      entry.totalScore=restoredScore;
      entry.games=Number(d.games)||Number(entry.games)||0;
      entry.wins=Number(d.wins)||Number(entry.wins)||0;
      entry.updatedAt=Number(d.updatedAt)||Date.now();
      saveLeaderboardStore(store);
    }
    if(restoredName){
      state.home.name=restoredName;
    }
    state.home.gender=restoredGender;
    if(restoredPicture&&state.home.google?.signedIn){
      state.home.google.picture=restoredPicture;
    }
    const inGame=state.screen==='game'&&Array.isArray(state.solo.players)&&state.solo.players.length>0&&!state.solo.gameOver;
    if(!inGame){
      state.score=restoredScore;
      state.solo.totals=[restoredScore,5000,5000,5000];
    }
    const preferredId=String(currentLeaderboardIdentity().id??'');
    if(preferredId&&foundId&&preferredId!==foundId){
      await firebaseDb.collection(FIRESTORE_LB_COLLECTION).doc(preferredId).set({
        id:preferredId,
        name:restoredName||String(identity?.name??'Player').slice(0,32),
        email:String(identity?.email??'').toLowerCase().slice(0,120),
        gender:restoredGender,
        picture:restoredPicture,
        settings:collectMainSettings(),
        totalScore:restoredScore,
        games:Number(d.games)||0,
        wins:Number(d.wins)||0,
        updatedAt:Number(d.updatedAt)||Date.now()
      },{merge:true});
    }
    return true;
  }catch(err){
    console.error('profile hydrate failed',err);
    return false;
  }
}
function initFirebaseIfReady(){
  try{
    if(firebaseDb)return true;
    const fb=window.firebase;
    if(!fb)return false;
    if(!fb.apps?.length)firebaseApp=fb.initializeApp(FIREBASE_CONFIG);else firebaseApp=fb.app();
    firebaseAuth=fb.auth?.();
    firebaseDb=fb.firestore();
    return true;
  }catch{return false;}
}
async function ensureFirebaseWriteAuth(){
  return Boolean(firebaseDb||initFirebaseIfReady());
}
function toFirestoreValue(v){
  if(v===null||v===undefined)return{nullValue:null};
  if(typeof v==='string')return{stringValue:v};
  if(typeof v==='boolean')return{booleanValue:v};
  if(typeof v==='number')return Number.isFinite(v)?{integerValue:String(Math.trunc(v))}:{integerValue:'0'};
  if(Array.isArray(v))return{arrayValue:{values:v.map(toFirestoreValue)}};
  if(typeof v==='object'){
    const fields={};
    Object.entries(v).forEach(([k,val])=>{if(val!==undefined)fields[k]=toFirestoreValue(val);});
    return{mapValue:{fields}};
  }
  return{stringValue:String(v)};
}
function fromFirestoreValue(v){
  if(!v||typeof v!=='object')return null;
  if('stringValue'in v)return String(v.stringValue??'');
  if('booleanValue'in v)return Boolean(v.booleanValue);
  if('integerValue'in v)return Number(v.integerValue??0);
  if('doubleValue'in v)return Number(v.doubleValue??0);
  if('nullValue'in v)return null;
  if('arrayValue'in v)return Array.isArray(v.arrayValue?.values)?v.arrayValue.values.map(fromFirestoreValue):[];
  if('mapValue'in v){
    const out={};
    const f=v.mapValue?.fields??{};
    Object.keys(f).forEach((k)=>{out[k]=fromFirestoreValue(f[k]);});
    return out;
  }
  return null;
}
function firestoreRestDocUrl(collection,docId){
  const projectId=String(FIREBASE_CONFIG.projectId??'').trim();
  const apiKey=String(FIREBASE_CONFIG.apiKey??'').trim();
  if(!projectId||!apiKey)return'';
  return`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}?key=${encodeURIComponent(apiKey)}`;
}
async function writeProfileDocByRest(docId,data){
  const url=firestoreRestDocUrl(FIRESTORE_LB_COLLECTION,docId);
  if(!url)throw new Error('rest url unavailable');
  const fields={};
  Object.entries(data).forEach(([k,v])=>{if(v!==undefined)fields[k]=toFirestoreValue(v);});
  const res=await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields})});
  if(!res.ok){
    const text=await res.text().catch(()=>'');
    throw new Error(`rest write failed ${res.status} ${text}`);
  }
  return true;
}
async function readProfileDocByRest(docId){
  const url=firestoreRestDocUrl(FIRESTORE_LB_COLLECTION,docId);
  if(!url)throw new Error('rest url unavailable');
  const res=await fetch(url,{method:'GET'});
  if(res.status===404)return null;
  if(!res.ok){
    const text=await res.text().catch(()=>'');
    throw new Error(`rest read failed ${res.status} ${text}`);
  }
  const json=await res.json();
  const rawFields=json?.fields??{};
  const out={};
  Object.keys(rawFields).forEach((k)=>{out[k]=fromFirestoreValue(rawFields[k]);});
  return out;
}
function isBotIdentity(identity){return Boolean(identity?.isBot);}
function buildProfilePayload(identity,entry,updatedAt){
  const isBot=isBotIdentity(identity);
  const picture=isBot?'':String(identity?.picture??state.home.google?.picture??'').trim();
  const settings=isBot?{}:(identity?.settings&&typeof identity.settings==='object'?identity.settings:collectMainSettings());
  return{
    id:String(entry.id),
    name:String(identity?.name??entry.name??'Player').slice(0,32),
    email:String(identity?.email??entry.email??'').toLowerCase().slice(0,120),
    gender:String(identity?.gender??entry.gender??'male')==='female'?'female':'male',
    picture,
    settings,
    totalScore:scoreFromStoredTotal(entry.totalScore),
    games:Number(entry.games)||0,
    wins:Number(entry.wins)||0,
    updatedAt:Number(updatedAt)||Date.now()
  };
}
function loadGoogleSession(){
  try{
    const raw=localStorage.getItem(GOOGLE_SESSION_KEY);
    const parsed=raw?JSON.parse(raw):null;
    const email=String(parsed?.email??'').trim().toLowerCase().slice(0,120);
    if(!email)return;
    state.home.google={...state.home.google,signedIn:true,provider:'google',email};
    if(initFirebaseIfReady()){
      void hydrateProfileFromCloudByIdentity(currentLeaderboardIdentity()).then(()=>{if(state.home.showLeaderboard)refreshLeaderboard(true);render();});
    }
  }catch{}
}
function saveGoogleSession(){
  try{
    const email=String(state.home.google.email??'').trim().toLowerCase().slice(0,120);
    if(!email){
      localStorage.removeItem(GOOGLE_SESSION_KEY);
      return;
    }
    localStorage.setItem(GOOGLE_SESSION_KEY,JSON.stringify({email}));
  }catch{}
}
function clearGoogleSession(){
  try{localStorage.removeItem(GOOGLE_SESSION_KEY);}catch{}
}
function normalizeAuthProvider(provider){
  const v=String(provider??'').trim().toLowerCase();
  if(v==='google')return v;
  return 'google';
}
function authProviderPrefix(){
  return normalizeAuthProvider(state.home.google?.provider);
}
function signedInForPlay(){
  const authUser=firebaseAuth?.currentUser;
  if(authUser?.uid)return true;
  const g=state.home.google??{};
  return Boolean(g.signedIn&&(String(g.email??'').trim()||String(g.uid??'').trim()||String(g.sub??'').trim()));
}
function signedInWithEmail(){return Boolean(state.home.google.signedIn&&state.home.google.email);}
function currentAuthUid(){return String(firebaseAuth?.currentUser?.uid??'').trim();}
const LOCAL_ROOM_KEY='big2.currentRoomId';
function baseRoomPlayerId(){
  const uid=currentAuthUid();
  if(uid)return `uid:${uid}`;
  if(!state.sessionId){
    const rand=(()=>{try{return crypto.randomUUID();}catch{return Math.random().toString(36).slice(2,10);}})();
    state.sessionId=`guest:${rand}`;
  }
  return state.sessionId;
}
function currentRoomPlayerId(){
  const pinned=String(state.room?.playerId??'').trim();
  if(pinned)return pinned;
  return baseRoomPlayerId();
}
function isValidDifficulty(value){
  return value==='easy'||value==='normal'||value==='hard';
}
function resetRoomState(){
  if(state.room.unsub){try{state.room.unsub();}catch{}}
  if(roomPresenceTimer){clearInterval(roomPresenceTimer);roomPresenceTimer=null;}
  void updateActiveRoomPointer('');
  clearRoomReadyPending();
  clearRoomStartPending();
  state.room={id:'',code:'',data:null,joinOpen:false,error:'',started:false,unsub:null,selfSeat:-1,recordedGameKey:'',pendingReady:false,pendingReadyValue:null,pendingStart:false};
  state.room.playerId='';
  if(state.home.mode==='room')state.home.mode='solo';
}
function setRoomError(msg){
  state.room.error=msg||'';
  render();
}
function clearRoomReadyPending(){
  state.room.pendingReady=false;
  state.room.pendingReadyValue=null;
  if(roomReadyPendingTimer){clearTimeout(roomReadyPendingTimer);roomReadyPendingTimer=null;}
}
function clearRoomStartPending(){
  state.room.pendingStart=false;
  if(roomStartPendingTimer){clearTimeout(roomStartPendingTimer);roomStartPendingTimer=null;}
}
function generateRoomCode(len=6){
  const chars='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out='';
  for(let i=0;i<len;i++){
    out+=chars[Math.floor(Math.random()*chars.length)];
  }
  return out;
}
function roomPlayerIds(players){
  if(!Array.isArray(players))return[];
  const seen=new Set();
  players.forEach((p)=>{
    const v=String(p?.uid??'').trim();
    if(v)seen.add(v);
  });
  return Array.from(seen);
}
function isRoomPresenceOnlyUpdate(prev,next){
  if(!prev||!next)return false;
  if(String(prev.status||'')!=='playing')return false;
  if(String(next.status||'')!=='playing')return false;
  if(Number(prev.gameVersion||0)!==Number(next.gameVersion||0))return false;
  if(String(prev.code||'')!==String(next.code||''))return false;
  if(String(prev.hostId||'')!==String(next.hostId||''))return false;
  if(String(prev.hostName||'')!==String(next.hostName||''))return false;
  if(Boolean(prev.isPrivate)!==Boolean(next.isPrivate))return false;
  if(Number(prev.maxPlayers||0)!==Number(next.maxPlayers||0))return false;
  if(Number(prev.roundCount||0)!==Number(next.roundCount||0))return false;
  const prevPlayers=Array.isArray(prev.players)?prev.players:[];
  const nextPlayers=Array.isArray(next.players)?next.players:[];
  if(prevPlayers.length!==nextPlayers.length)return false;
  const prevMap=new Map(prevPlayers.map((p)=>[String(p?.uid??''),p]));
  for(const p of nextPlayers){
    const uid=String(p?.uid??'');
    const before=prevMap.get(uid);
    if(!before)return false;
    if(String(before.name||'')!==String(p.name||''))return false;
    if(String(before.gender||'')!==String(p.gender||''))return false;
    if(String(before.picture||'')!==String(p.picture||''))return false;
    if(Boolean(before.ready)!==Boolean(p.ready))return false;
    if(Boolean(before.isHost)!==Boolean(p.isHost))return false;
    if(Number(before.seat)!==Number(p.seat))return false;
  }
  return true;
}
function bumpRoomPlayerLastSeen(players,uid,now){
  if(!uid||!Array.isArray(players))return{players,changed:false};
  let changed=false;
  const next=players.map((p)=>{
    if(String(p?.uid)!==uid)return p;
    const prev=Number(p?.lastSeen)||0;
    if(now-prev<1500)return p;
    changed=true;
    return{...p,lastSeen:now};
  });
  return{players:next,changed};
}
async function findRoomByCode(code){
  if(!firebaseDb)return null;
  const snap=await firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).where('code','==',code).limit(1).get();
  const doc=snap.docs?.[0];
  if(!doc)return null;
  return doc;
}
async function findRoomByPlayerId(playerId){
  if(!firebaseDb||!playerId)return null;
  try{
    const snap=await firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION)
      .where('playerIds','array-contains',String(playerId))
      .limit(1)
      .get();
    const doc=snap.docs?.[0];
    if(!doc)return null;
    return doc;
  }catch{
    return null;
  }
}
async function dropSelfFromRoom(roomDoc,playerId){
  if(!firebaseDb||!roomDoc||!playerId)return;
  const ref=roomDoc.ref??firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(roomDoc.id);
  await firebaseDb.runTransaction(async(tx)=>{
    const snap=await tx.get(ref);
    if(!snap.exists)return;
    const data=snap.data()??{};
    const players=Array.isArray(data.players)?[...data.players]:[];
    const remaining=players.filter((p)=>String(p.uid)!==String(playerId));
    if(remaining.length===players.length)return;
    if(!remaining.length){
      tx.delete(ref);
      return;
    }
    const remainingHumans=remaining.filter((p)=>String(p.uid||'').startsWith('uid:')||String(p.uid||'').startsWith('guest:'));
    if(!remainingHumans.length){
      tx.delete(ref);
      return;
    }
    const hostLeaving=String(data.hostId)===String(playerId);
    const hostUpdate=hostLeaving
      ?{hostId:String(remainingHumans[0]?.uid??remaining[0]?.uid??''),hostName:String(remainingHumans[0]?.name??remaining[0]?.name??'')}
      :{};
    const now=Date.now();
    tx.update(ref,{players:remaining,playerIds:roomPlayerIds(remaining),updatedAt:now,...hostUpdate});
  });
}
async function ensureSingleRoomMembership(targetRoomId=''){
  const playerId=baseRoomPlayerId();
  if(!playerId||!firebaseDb)return{ok:true};
  const existing=await findRoomByPlayerId(playerId);
  if(!existing)return{ok:true};
  const existingId=String(existing.id||'');
  if(targetRoomId&&existingId===String(targetRoomId))return{ok:true,already:true,roomId:existingId};
  const data=existing.data()??{};
  const status=String(data.status||'');
  const players=Array.isArray(data.players)?data.players:[];
  const entry=players.find((p)=>String(p.uid)===String(playerId));
  const lastSeen=Number(entry?.lastSeen)||0;
  const now=Date.now();
  const stale=(status==='lobby'||status==='starting')&&lastSeen>0&&(now-lastSeen>roomPruneMs(status));
  if(stale){
    await dropSelfFromRoom(existing,playerId);
    return{ok:true,cleared:true};
  }
  return{ok:false,roomId:existingId,code:String(data.code||'')};
}
async function gateUserRoomAccess(targetRoomId=''){
  const uid=currentAuthUserUid();
  if(!uid||!firebaseDb)return{ok:true};
  try{
    const ref=firebaseDb.collection(FIRESTORE_USERS_COLLECTION).doc(uid);
    const snap=await ref.get();
    if(!snap.exists)return{ok:true};
    const data=snap.data()??{};
    const active=String(data.currentRoomId??'').trim();
    if(!active)return{ok:true};
    if(targetRoomId&&active===String(targetRoomId))return{ok:true,already:true};
    const roomRef=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(active);
    const roomSnap=await roomRef.get();
    if(!roomSnap.exists){
      await ref.set({currentRoomId:'',updatedAt:Date.now()},{merge:true});
      return{ok:true,cleared:true};
    }
    return{ok:false};
  }catch{
    return{ok:true};
  }
}
async function gateGuestRoomAccess(targetRoomId=''){
  const uid=currentAuthUserUid();
  if(uid)return{ok:true};
  try{
    const active=String(localStorage.getItem(LOCAL_ROOM_KEY)||'').trim();
    if(!active)return{ok:true};
    if(targetRoomId&&active===String(targetRoomId))return{ok:true,already:true};
    if(firebaseDb){
      const roomRef=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(active);
      const roomSnap=await roomRef.get();
      if(!roomSnap.exists){
        localStorage.removeItem(LOCAL_ROOM_KEY);
        return{ok:true,cleared:true};
      }
    }
    return{ok:false};
  }catch{
    return{ok:true};
  }
}
async function loadActiveRooms(attempt=0){
  if(!initFirebaseIfReady()){
    if(attempt<6)window.setTimeout(()=>{void loadActiveRooms(attempt+1);},500);
    return;
  }
  if(!firebaseDb)return;
  if(state.home.activeRooms.loading)return;
  state.home.activeRooms.loading=true;
  state.home.activeRooms.error='';
  render();
  try{
    const statusFilters=['lobby','starting','playing','finished'];
    const roomFetchLimit=20;
    let snap=null;
    try{
      snap=await firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION)
        .where('status','in',statusFilters)
        .orderBy('updatedAt','desc')
        .limit(roomFetchLimit)
        .get();
    }catch{
      try{
        snap=await firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION)
          .where('status','in',statusFilters)
          .limit(roomFetchLimit)
          .get();
      }catch{
        try{
          snap=await firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION)
            .orderBy('updatedAt','desc')
            .limit(roomFetchLimit)
            .get();
        }catch{
          snap=await firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION)
            .limit(roomFetchLimit)
            .get();
        }
      }
    }
      const now=Date.now();
      const rows=[];
      let hiddenRooms=0;
      for(const doc of snap.docs){
        const data=doc.data()??{};
        const status=String(data.status||'');
        if(status!=='lobby'&&status!=='starting'&&status!=='playing'&&status!=='finished'){
          hiddenRooms+=1;
          continue;
        }
          const players=Array.isArray(data.players)?data.players:[];
          const updatedAt=Number(data.updatedAt)||0;
          if(updatedAt>0){
            const staleAge=now-updatedAt;
            if((status==='lobby'||status==='starting'||status==='finished')&&staleAge>ROOM_PRUNE_LOBBY_MS){
              void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(doc.id).delete().catch(()=>{});
              hiddenRooms+=1;
              continue;
            }
            if(status==='playing'&&staleAge>ROOM_PRUNE_PLAYING_MS){
              void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(doc.id).delete().catch(()=>{});
              hiddenRooms+=1;
              continue;
            }
          }
          const isPlaying=status==='playing';
          const activePlayers=isPlaying?players:players.filter((p)=>isRoomPlayerActive(p,status,now));
          const expectedIds=roomPlayerIds(players);
          const existingIds=Array.isArray(data.playerIds)?data.playerIds.map((v)=>String(v)):null;
          const idsMatch=Array.isArray(existingIds)
            && existingIds.length===expectedIds.length
            && expectedIds.every((id)=>existingIds.includes(id));
          if(!isPlaying&&activePlayers.length!==players.length){
            const activeHumans=activePlayers.filter((p)=>String(p.uid||'').startsWith('uid:')||String(p.uid||'').startsWith('guest:'));
            if(!activeHumans.length){
              void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(doc.id).delete().catch(()=>{});
              hiddenRooms+=1;
              continue;
            }
          const hostInfo=resolveRoomHostInfo({...data,players:activePlayers});
          void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(doc.id).update({
            players:activePlayers,
            playerIds:roomPlayerIds(activePlayers),
            hostId:hostInfo.hostId,
            hostName:hostInfo.hostName,
            updatedAt:now
          }).catch(()=>{});
        }else if(!idsMatch){
          void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(doc.id).update({
            playerIds:expectedIds,
            updatedAt:now
          }).catch(()=>{});
        }
          const humans=activePlayers.filter((p)=>isRoomPlayerHuman(p));
          if(!humans.length){
            void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(doc.id).delete().catch(()=>{});
            hiddenRooms+=1;
            continue;
          }
        const recentHumans=activePlayers.filter((p)=>isRoomPlayerHuman(p)&&Number(p.lastSeen)>0&&(now-Number(p.lastSeen)<=ROOM_OFFLINE_MS));
        if(status!=='playing'&&!recentHumans.length){
          // Hide stale lobby rooms even if deletion fails.
          void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(doc.id).delete().catch(()=>{});
          hiddenRooms+=1;
          continue;
        }
        if(status==='playing'&&!recentHumans.length){
          void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(doc.id).delete().catch(()=>{});
          hiddenRooms+=1;
          continue;
        }
        if(status==='finished'&&humans.length>=Number(data.maxPlayers||4)){
          hiddenRooms+=1;
          continue;
        }
        const hostId=String(data.hostId||'').trim();
        const hostPlayer=hostId?humans.find((p)=>String(p.uid)===hostId):humans[0];
        let roster=activePlayers
          .filter((p)=>Number.isFinite(Number(p?.seat))&&Number(p.seat)>=0&&Number(p.seat)<=3)
          .map((p)=>({
            seat:Number(p.seat),
            name:String(p.name||''),
            gender:p.gender==='female'?'female':'male',
            picture:String(p.picture||''),
            uid:String(p.uid||''),
            ready:Boolean(p.ready),
            lastSeen:Number(p.lastSeen)||0,
            isBot:!isRoomPlayerHuman(p),
            avatarColor:'#7aaed8'
          }));
        if(status!=='lobby'&&data.game&&Array.isArray(data.game.players)){
          const gameRoster=data.game.players.map((p,idx)=>{
            const seat=Number.isFinite(Number(p?.seat))?Number(p.seat):idx;
            const safeSeat=Number.isFinite(seat)&&seat>=0&&seat<=3?seat:idx;
            const gender=String(p?.gender||'male')==='female'?'female':'male';
            const isBot=!p?.isHuman;
            return{
              seat:safeSeat,
              name:String(p?.name||`Bot ${safeSeat+1}`),
              gender,
              picture:String(p?.picture||''),
              uid:String(p?.uid||`bot:${safeSeat}`),
              ready:true,
              lastSeen:0,
              isBot,
              avatarColor:isBot?playerColorByViewClass(seatCls[safeSeat]||'south'):'#7aaed8'
            };
          });
          roster=gameRoster.sort((a,b)=>a.seat-b.seat);
        }
        const displayPlayers=Math.max(activePlayers.length,roster.length);
          rows.push({
            id:doc.id,
            code:String(data.code||'').toUpperCase(),
            hostName:String(hostPlayer?.name||data.hostName||''),
            hostId:String(hostPlayer?.uid||data.hostId||''),
            isPrivate:Boolean(data.isPrivate),
            status,
            roundCount:Number(data.roundCount||0),
            players:activePlayers.length,
            displayPlayers,
            maxPlayers:Number(data.maxPlayers||4),
            roster
          });
      }
    state.home.activeRooms.rows=rows.slice(0,4);
    state.home.activeRooms.hiddenCount=hiddenRooms;
    state.home.activeRooms.loadedAt=Date.now();
  }catch{
    state.home.activeRooms.error='load';
  }finally{
    state.home.activeRooms.loading=false;
    render();
  }
}
async function createRoom(){
  if(!initFirebaseIfReady()){
    setRoomError(t('roomCreateFail'));
    return;
  }
  if(!signedInForPlay()){
    setRoomError(t('roomLoginRequired'));
    return;
  }
  setRoomError('');
  try{
    if(state.room.id){
      setRoomError(t('roomAlreadyIn'));
      return;
    }
    const membership=await ensureSingleRoomMembership('');
    if(!membership.ok){
      if(membership.roomId){
        subscribeRoom(membership.roomId,membership.code||'');
        void updateActiveRoomPointer(membership.roomId);
      }
      setRoomError(t('roomAlreadyIn'));
      return;
    }
    const gate=await gateUserRoomAccess('');
    const gateGuest=await gateGuestRoomAccess('');
    if(!gateGuest.ok){
      setRoomError(t('roomAlreadyIn'));
      return;
    }
    if(!gate.ok){
      setRoomError(t('roomAlreadyIn'));
      return;
    }
    let code='';
    for(let i=0;i<5;i++){
      const candidate=generateRoomCode();
      const exists=await findRoomByCode(candidate);
      if(!exists){code=candidate;break;}
    }
    if(!code){setRoomError(t('roomCreateFail'));return;}
    const uid=baseRoomPlayerId();
    state.room.playerId=uid;
    const name=String(state.home.name||'Player').slice(0,32);
    const now=Date.now();
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc();
    const data={
      hostId:uid,
      hostName:name,
      code,
      status:'lobby',
      createdAt:now,
      updatedAt:now,
      expiresAt:now+(2*60*60*1000),
        maxPlayers:4,
        isPrivate:false,
        players:[{uid,name,gender:state.home.gender==='female'?'female':'male',picture:authPictureUrl(),ready:true,isHost:true,seat:0,lastSeen:now}],
      playerIds:[uid],
      settings:collectMainSettings(),
      totals:[5000,5000,5000,5000],
      roundCount:0,
      gameVersion:0
    };
    await ref.set(data);
    subscribeRoom(ref.id,code);
    void updateActiveRoomPointer(ref.id);
  }catch(err){
    console.error('create room failed',err);
    setRoomError(t('roomCreateFail'));
  }
}
async function joinRoomByCode(codeRaw){
  if(!initFirebaseIfReady()){
    setRoomError(t('roomJoinFail'));
    return;
  }
  if(!signedInForPlay()){
    setRoomError(t('roomLoginRequired'));
    return;
  }
  const code=String(codeRaw??'').trim().toUpperCase();
  if(!code)return;
  setRoomError('');
  try{
    const doc=await findRoomByCode(code);
    if(!doc){setRoomError(t('roomNotFound'));return;}
    const data=doc.data()??{};
    const status=String(data.status||'');
    if(status==='playing'){
      setRoomError(t('roomStatusPlaying'));
      return;
    }
    if(status&&status!=='lobby'&&status!=='starting'&&status!=='finished'){
      setRoomError(t('roomClosed'));
      return;
    }
    if(state.room.id){
      const same=String(state.room.id)===String(doc.id);
      if(same){
        subscribeRoom(doc.id,code);
        void updateActiveRoomPointer(doc.id);
        state.room.joinOpen=false;
        render();
        return;
      }
      setRoomError(t('roomAlreadyIn'));
      return;
    }
    const membership=await ensureSingleRoomMembership(doc.id);
    if(!membership.ok){
      if(membership.roomId){
        subscribeRoom(membership.roomId,membership.code||'');
        void updateActiveRoomPointer(membership.roomId);
      }
      setRoomError(t('roomAlreadyIn'));
      return;
    }
    const gate=await gateUserRoomAccess(doc.id);
    const gateGuest=await gateGuestRoomAccess(doc.id);
    if(!gateGuest.ok){
      setRoomError(t('roomAlreadyIn'));
      return;
    }
    if(!gate.ok){
      setRoomError(t('roomAlreadyIn'));
      return;
    }
    if(gate.already){
      subscribeRoom(doc.id,code);
      void updateActiveRoomPointer(doc.id);
      state.room.joinOpen=false;
      render();
      return;
    }
    const uid=baseRoomPlayerId();
    state.room.playerId=uid;
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(doc.ref);
      if(!snap.exists)throw new Error('room missing');
      const data=snap.data()??{};
      if(data.status!=='lobby'&&data.status!=='starting'&&data.status!=='finished')throw new Error('room closed');
      const now=Date.now();
      const players=Array.isArray(data.players)?[...data.players]:[];
      const already=players.find((p)=>String(p.uid)===uid);
      const prevCount=players.length;
      const name=String(state.home.name||'Player').slice(0,32);
      const gender=state.home.gender==='female'?'female':'male';
      const picture=authPictureUrl();
      let hostId=String(data.hostId||'').trim();
      let hostName=String(data.hostName||'').trim();
      let tookOver=false;
      if(!already && uid.startsWith('guest:') && (data.status==='lobby'||data.status==='starting')){
        const candidates=players.filter((p)=>{
          if(!isRoomPlayerHuman(p))return false;
          if(!String(p.uid||'').startsWith('guest:'))return false;
          if(String(p.name||'').trim()!==name)return false;
          const pg=String(p.gender||'male')==='female'?'female':'male';
          if(pg!==gender)return false;
          const pp=String(p.picture||'').trim();
          if(pp&&picture&&pp!==picture)return false;
          if(!isRoomPlayerActive(p,data.status,now))return false;
          return true;
        });
        if(candidates.length===1){
          const idx=players.findIndex((p)=>p===candidates[0]);
          if(idx>=0){
            const oldUid=String(players[idx]?.uid||'');
            const ready=Boolean(players[idx]?.ready);
            players[idx]={...players[idx],uid,name,gender,picture,lastSeen:now,ready};
            if(oldUid&&hostId===oldUid){
              hostId=uid;
              hostName=name;
            }
            tookOver=true;
          }
        }
      }
      if(!already && !tookOver){
        if(players.length>=Number(data.maxPlayers||4))throw new Error('room full');
        const usedSeats=new Set(players.map((p)=>Number(p.seat)));
        let seat=0;
        while(usedSeats.has(seat)&&seat<4)seat+=1;
        if(seat>=4)throw new Error('room full');
        players.push({uid,name,gender,picture,ready:true,isHost:false,seat,lastSeen:now});
      }
      const updates={players,playerIds:roomPlayerIds(players),updatedAt:now,hostId,hostName};
      if(String(data.status)==='finished'){
        updates.gameVersion=Number(data.gameVersion||0)+1;
      }
      if(data.game&&String(data.status)==='playing'&&players.length>prevCount){
        const game=cloneRoomGame(data.game);
        if(game){
          const text=t('roomJoinLog').replace('{{name}}',name);
          addRoomSystemLog(game,text);
          updates.game=game;
          updates.gameVersion=Number(data.gameVersion||0)+1;
        }
      }
      tx.update(doc.ref,updates);
    });
    subscribeRoom(doc.id,code);
    void updateActiveRoomPointer(doc.id);
    state.room.joinOpen=false;
    render();
  }catch(err){
    console.error('join room failed',err);
    if(String(err?.message??'').includes('full'))setRoomError(t('roomFull'));
    else if(String(err?.message??'').includes('closed'))setRoomError(t('roomClosed'));
    else setRoomError(t('roomJoinFail'));
  }
}
function resolveRoomHostInfo(roomData){
  const players=Array.isArray(roomData?.players)?roomData.players:[];
  let hostId=String(roomData?.hostId??'').trim();
  let hostName=String(roomData?.hostName??'').trim();
  const hostExists=hostId&&players.some((p)=>String(p.uid)===hostId);
  if(!hostExists){
    const fallback=players[0];
    hostId=String(fallback?.uid??'');
    hostName=String(fallback?.name??'');
  }else if(hostId&&!hostName){
    const entry=players.find((p)=>String(p.uid)===hostId);
    hostName=String(entry?.name??'');
  }
  return{hostId,hostName};
}
async function syncRoomHostIfNeeded(ref,roomData){
  const status=String(roomData?.status??'');
  if(status==='playing')return;
  const next=resolveRoomHostInfo(roomData);
  const currentId=String(roomData?.hostId??'').trim();
  const currentName=String(roomData?.hostName??'').trim();
  if(!next.hostId)return;
  if(next.hostId===currentId&&(!next.hostName||next.hostName===currentName))return;
  try{
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)return;
      const data=snap.data()??{};
      if(String(data.status??'')==='playing')return;
      const latest=resolveRoomHostInfo(data);
      if(!latest.hostId)return;
      tx.update(ref,{hostId:latest.hostId,hostName:latest.hostName,updatedAt:Date.now()});
    });
  }catch{}
}
function subscribeRoom(roomId,code){
  if(state.room.unsub){try{state.room.unsub();}catch{}}
  const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(roomId);
  const unsub=ref.onSnapshot((snap)=>{
    if(!snap.exists){resetRoomState();render();return;}
    const data=snap.data()??{};
    const now=Date.now();
    const reconnectMsg=t('roomReconnecting');
    const staleMsg=t('roomStale');
    const updatedAt=Number(data.updatedAt)||0;
    const isStale=updatedAt>0&&(now-updatedAt>ROOM_STALE_MS);
    if(isStale){
      setRoomError(staleMsg);
    }else if(state.room.error===reconnectMsg||state.room.error===staleMsg){
      setRoomError('');
    }
      void syncRoomHostIfNeeded(ref,data);
      const prevRoomData=state.room.data;
    let resolvedId=String(state.room.playerId||'').trim();
    if(!resolvedId||!Array.isArray(data.players)||!data.players.some((p)=>String(p?.uid||'')===resolvedId)){
      const guestMatch=matchGuestPlayerId(data);
      resolvedId=guestMatch||baseRoomPlayerId();
    }
    state.room.playerId=resolvedId;
    state.room={...state.room,id:roomId,code:code||String(data.code??''),data,unsub,joinOpen:false,selfSeat:roomSelfSeat(data)};
    const selfEntry=Array.isArray(data.players)
      ?data.players.find((p)=>String(p?.uid||'')===String(resolvedId))
      :null;
    if(state.room.pendingReady&&selfEntry&&Boolean(selfEntry.ready)===Boolean(state.room.pendingReadyValue)){
      clearRoomReadyPending();
    }
    startRoomPresencePing();
    syncRoomSelfProfile();
    void updateActiveRoomPointer(roomId);
    const roomStatus=String(data.status);
    if(state.room.pendingStart&&(roomStatus==='starting'||roomStatus==='playing')){
      clearRoomStartPending();
    }
    const rosterAll=Array.isArray(data.players)?data.players:[];
    const hasHuman=rosterAll.some((p)=>String(p.uid||'').startsWith('uid:')||String(p.uid||'').startsWith('guest:'));
    if((roomStatus==='lobby'||roomStatus==='starting')&&!hasHuman){
      void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(roomId).delete().catch(()=>{});
      resetRoomState();
      render();
      return;
    }
    if(roomStatus==='lobby'||roomStatus==='starting'){
      const rosterAll=Array.isArray(data.players)?data.players:[]; 
      const active=rosterAll.filter((p)=>isRoomPlayerActive(p,roomStatus,now));
      const expectedIds=roomPlayerIds(rosterAll);
      const existingIds=Array.isArray(data.playerIds)?data.playerIds.map((v)=>String(v)):null;
      const idsMatch=Array.isArray(existingIds)
        && existingIds.length===expectedIds.length
        && expectedIds.every((id)=>existingIds.includes(id));
      const hostId=String(data.hostId||'').trim();
      const hostEntry=rosterAll.find((p)=>String(p?.uid||'')===hostId)||null;
      const hostLastSeen=Number(hostEntry?.lastSeen||0);
      const hostStale=!hostEntry|| (hostLastSeen>0 && now-hostLastSeen>ROOM_HOST_TAKEOVER_MS);
      if(active.length!==rosterAll.length){
        const activeHumans=active.filter((p)=>String(p.uid||'').startsWith('uid:')||String(p.uid||'').startsWith('guest:'));
        if(!activeHumans.length){
          void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(roomId).delete().catch(()=>{});
          resetRoomState();
          render();
          return;
        }
        const hostInfo=resolveRoomHostInfo({...data,players:active});
        let nextHostId=hostInfo.hostId;
        let nextHostName=hostInfo.hostName;
        if(hostStale){
          const candidate=selectRoomHostCandidate(active,now);
          if(candidate){
            nextHostId=String(candidate.uid||nextHostId||'');
            nextHostName=String(candidate.name||nextHostName||'');
          }
        }
        void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(roomId).update({
          players:active,
          playerIds:roomPlayerIds(active),
          hostId:nextHostId,
          hostName:nextHostName,
          updatedAt:now
        }).catch(()=>{});
      }else if(!idsMatch){
        void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(roomId).update({
          playerIds:expectedIds,
          updatedAt:now
        }).catch(()=>{});
      }
      if(hostStale){
        const candidate=selectRoomHostCandidate(active,now);
        if(candidate&&String(candidate.uid||'')!==hostId){
          void firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(roomId).update({
            hostId:String(candidate.uid||''),
            hostName:String(candidate.name||''),
            updatedAt:now
          }).catch(()=>{});
        }
      }
    }
      if(roomStatus==='playing'||roomStatus==='finished'){
        const presenceOnly=isRoomPresenceOnlyUpdate(prevRoomData,data);
        state.room.started=true;
        if(data.game){
          const updated=syncRoomGameRoster(data);
          if(updated){
          void firebaseDb.runTransaction(async(tx)=>{
            const fresh=await tx.get(ref);
            if(!fresh.exists)return;
            const latest=fresh.data()??{};
            if(String(latest.status)!=='playing'||!latest.game)return;
            const now=Date.now();
            const roster=Array.isArray(latest.players)?[...latest.players]:[];
            const active=roster.filter((p)=>isRoomPlayerActive(p,latest.status,now));
            const activeHumans=active.filter((p)=>String(p.uid||'').startsWith('uid:')||String(p.uid||'').startsWith('guest:'));
            if(!activeHumans.length){
              tx.delete(ref);
              return;
            }
            let hostId=String(latest.hostId??'');
            let hostName=String(latest.hostName??'');
            if(hostId&&!active.some((p)=>String(p.uid)===hostId)){
              const nextHost=active[0];
              hostId=String(nextHost?.uid??'');
              hostName=String(nextHost?.name??'');
            }
            tx.update(ref,{game:updated,players:active,hostId,hostName,updatedAt:now,gameVersion:Number(latest.gameVersion||0)+1});
          });
          }
        }
        if(!presenceOnly){
          applyRoomGameSnapshot(data);
        }else{
          maybeRunRoomAi();
        }
        return;
      }
    render();
  });
  state.room={...state.room,id:roomId,code,unsub,started:false};
}
async function leaveRoom(toLobby=false){
  const roomId=String(state.room.id||'').trim();
  const uid=currentRoomPlayerId();
  if(roomId){
    resetRoomState();
    state.screen='home';
    state.selected.clear();
    state.recommendation=null;
    setRecommendHint('');
    state.opponentProfileName='';
    if(toLobby){
      state.room.joinOpen=true;
      state.room.error='';
      void loadActiveRooms();
    }
    render();
  }
  if(!roomId||!firebaseDb||!uid)return;
  try{
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(roomId);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)return;
      const data=snap.data()??{};
      const players=Array.isArray(data.players)?[...data.players]:[];
      const remaining=players.filter((p)=>String(p.uid)!==uid);
      const leaving=players.find((p)=>String(p.uid)===uid);
      const hostLeaving=String(data.hostId)===uid;
      const status=String(data.status??'lobby');
      if(!remaining.length){
        tx.delete(ref);
        return;
      }
        const remainingHumans=remaining.filter((p)=>String(p.uid||'').startsWith('uid:')||String(p.uid||'').startsWith('guest:'));
        if(!remainingHumans.length){
          tx.delete(ref);
          return;
        }
      const hostUpdate=hostLeaving?{hostId:String(remainingHumans[0]?.uid??remaining[0]?.uid??''),hostName:String(remainingHumans[0]?.name??remaining[0]?.name??'')}:{};
      const now=Date.now();
      if(status==='playing'&&data.game&&leaving&&Number.isFinite(Number(leaving.seat))){
        const game=cloneRoomGame(data.game);
        const seat=Number(leaving.seat);
        if(game&&game.players&&game.players[seat]){
          const bp=botProfileForSeat(seat);
          const target=game.players[seat];
          target.isHuman=false;
          target.uid=`bot:${seat}:${bp.name}`;
          target.name=bp.name;
          target.gender=bp.gender;
          target.picture='';
        }
        if(game){
          const text=t('roomLeaveLog').replace('{{name}}',String(leaving.name||''));
          addRoomSystemLog(game,text);
        }
        tx.update(ref,{players:remaining,playerIds:roomPlayerIds(remaining),game,updatedAt:now,gameVersion:Number(data.gameVersion||0)+1,...hostUpdate});
        return;
      }
      tx.update(ref,{players:remaining,playerIds:roomPlayerIds(remaining),updatedAt:now,...hostUpdate});
    });
  }catch(err){
    console.error('leave room failed',err);
  }
}
async function setRoomReady(ready){
  if(!state.room.id||!firebaseDb)return;
  try{
    const uid=currentRoomPlayerId();
    if(!uid)return;
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(state.room.id);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)return;
      const data=snap.data()??{};
      if(String(data.status)==='starting')return;
      const players=Array.isArray(data.players)?[...data.players]:[];
      const next=players.map((p)=>String(p.uid)===uid?{...p,ready:Boolean(ready)}:p);
      tx.update(ref,{players:next,updatedAt:Date.now()});
    });
  }catch(err){
    console.error('ready update failed',err);
    clearRoomReadyPending();
    setRoomError(t('roomSendTimeout'));
  }finally{
    if(state.room.pendingReady)clearRoomReadyPending();
  }
}
async function setRoomPrivacy(isPrivate){
  if(!state.room.id||!firebaseDb)return;
  try{
    const uid=currentRoomPlayerId();
    if(!uid)return;
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(state.room.id);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)return;
      const data=snap.data()??{};
      if(String(data.status)==='playing')return;
      const hostId=String(data.hostId??'').trim();
      if(hostId&&hostId!==uid)throw new Error('not host');
      tx.update(ref,{isPrivate:Boolean(isPrivate),updatedAt:Date.now()});
    });
  }catch(err){
    console.error('privacy update failed',err);
  }
}
async function startRoom(){
  if(!state.room.id||!firebaseDb)return;
  const uid=currentRoomPlayerId();
  try{
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(state.room.id);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)return;
      const data=snap.data()??{};
      const players=Array.isArray(data.players)?data.players:[];
      let hostId=String(data.hostId??'').trim();
      let hostName=String(data.hostName??'').trim();
      if(!hostId){
        const fallback=players[0];
        hostId=String(fallback?.uid??'');
        hostName=String(fallback?.name??'');
      }
      if(uid){
        if(String(hostId)!==uid)throw new Error('not host');
      }else if(hostId){
        throw new Error('not host');
      }
      const humanPlayers=players.filter((p)=>String(p.uid||'').startsWith('uid:')||String(p.uid||'').startsWith('guest:'));
      if(humanPlayers.length<2)throw new Error('need players');
      const allReady=humanPlayers.every((p)=>p.ready||String(p.uid)===uid);
      if(!allReady)throw new Error('not ready');
        const now=Date.now();
        const hostUpdate=(hostId&&String(data.hostId??'').trim()!==hostId)?{hostId,hostName}:{};
        const bumped=bumpRoomPlayerLastSeen(players,uid,now);
        const nextPlayers=bumped.changed?bumped.players:players;
        tx.update(ref,{status:'starting',updatedAt:now,playerIds:roomPlayerIds(nextPlayers),players:nextPlayers,...hostUpdate});
      });
    window.setTimeout(async()=>{
      try{
        await firebaseDb.runTransaction(async(tx)=>{
          const snap=await tx.get(ref);
          if(!snap.exists)return;
          const data=snap.data()??{};
          if(String(data.status)!=='starting')return;
        const now=Date.now();
        const game=buildRoomGameState(data);
        const bumped=bumpRoomPlayerLastSeen(Array.isArray(data.players)?data.players:[],String(data.hostId||''),now);
        const nextPlayers=bumped.changed?bumped.players:data.players;
        tx.update(ref,{status:'playing',game,gameVersion:Number(data.gameVersion||0)+1,updatedAt:now,expiresAt:now+(24*60*60*1000),players:nextPlayers});
      });
      }catch(err){
        console.error('start room finalize failed',err);
      }
    },200);
  }catch(err){
    console.error('start room failed',err);
    const msg=String(err?.message??'');
    if(msg.includes('need players'))setRoomError(t('roomNeedPlayers'));
    else setRoomError(t('roomReadyHint'));
    clearRoomStartPending();
  }
}
async function roomReset(){
  if(!state.room.id||!firebaseDb)return;
  const uid=currentRoomPlayerId();
  try{
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(state.room.id);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)return;
      const data=snap.data()??{};
      if(String(data.hostId)!==uid)throw new Error('not host');
      const now=Date.now();
      const players=Array.isArray(data.players)?data.players:[];
      const resetPlayers=players.map((p)=>({...p,ready:false}));
      tx.update(ref,{status:'lobby',game:null,updatedAt:now,expiresAt:now+(2*60*60*1000),players:resetPlayers});
    });
  }catch(err){
    console.error('room reset failed',err);
  }
}
async function restartRoomGame(){
  if(!state.room.id||!firebaseDb)return;
  const uid=currentRoomPlayerId();
  try{
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(state.room.id);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)return;
      const data=snap.data()??{};
      if(String(data.hostId)!==uid)throw new Error('not host');
        const now=Date.now();
        const game=buildRoomGameState(data);
        const bumped=bumpRoomPlayerLastSeen(Array.isArray(data.players)?data.players:[],uid,now);
        const nextPlayers=bumped.changed?bumped.players:data.players;
        tx.update(ref,{status:'playing',game,updatedAt:now,gameVersion:Number(data.gameVersion||0)+1,players:nextPlayers});
      });
  }catch(err){
    console.error('restart room failed',err);
    setSoloStatus(t('roomReadyHint'));
  }
}

function cloneRoomGame(game){
  if(!game||typeof game!=='object')return null;
  try{return structuredClone(game);}catch{return JSON.parse(JSON.stringify(game));}
}
function setGameStatus(game,message,{appendLog=true,now=Date.now()}={}){
  if(!game)return;
  const text=String(message??'').trim();
  game.status=text;
  if(!appendLog||!text)return;
  if(!Array.isArray(game.systemLog))game.systemLog=[];
  const last=game.systemLog[game.systemLog.length-1];
  if(last&&last.text===text)return;
  game.systemLog.push({text,ts:now});
  if(game.systemLog.length>200)game.systemLog=game.systemLog.slice(-200);
}
function roomSeatForPlayer(roomData,playerId){
  const pid=String(playerId??'').trim();
  if(!pid)return-1;
  const roster=Array.isArray(roomData?.players)?roomData.players:[];
  const entry=roster.find((p)=>String(p.uid)===pid);
  return Number.isFinite(Number(entry?.seat))?Number(entry.seat):-1;
}
function roomSelfSeat(roomData){
  return roomSeatForPlayer(roomData,currentRoomPlayerId());
}
function getRoomTurnTimeout(roomData){
  const v=Number(roomData?.settings?.turnTimeout);
  if(Number.isFinite(v)&&v>=5000&&v<=60000)return Math.trunc(v);
  return DEFAULT_TURN_TIMEOUT_MS;
}
function getRoomTurnTimeoutWithGrace(roomData){
  return getRoomTurnTimeout(roomData)+ROOM_TIMEOUT_GRACE_MS;
}
const ROOM_PRESENCE_PING_MS=5000;
async function pruneRoomIfNeeded(){
  if(!state.room.id||!firebaseDb)return;
  try{
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(state.room.id);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)return;
      const data=snap.data()??{};
      if(String(data.status)!=='playing'||!data.game)return;
      const now=Date.now();
      const turnStartedAt=Number(data.game?.turnStartedAt||0);
      const turnStale=turnStartedAt>0&&(now-turnStartedAt>ROOM_PRUNE_PLAYING_MS);
      if(!turnStale)return;
      const roster=Array.isArray(data.players)?[...data.players]:[];
      const active=roster.filter((p)=>isRoomPlayerActive(p,'playing',now));
      if(active.length===roster.length)return;
      const activeHumans=active.filter((p)=>isRoomPlayerHuman(p));
      if(!activeHumans.length){
        tx.delete(ref);
        return;
      }
      let hostId=String(data.hostId??'');
      let hostName=String(data.hostName??'');
      if(hostId&&!active.some((p)=>String(p.uid)===hostId)){
        const nextHost=activeHumans[0]??active[0];
        hostId=String(nextHost?.uid??'');
        hostName=String(nextHost?.name??'');
      }
      const updatedGame=syncRoomGameRoster(data)??data.game;
      tx.update(ref,{
        game:updatedGame,
        players:active,
        playerIds:roomPlayerIds(active),
        hostId,
        hostName,
        updatedAt:now,
        gameVersion:Number(data.gameVersion||0)+1
      });
    });
  }catch{}
}
async function touchRoomPresence(force=false){
  if(!state.room.id||!firebaseDb)return;
  const uid=currentRoomPlayerId();
  if(!uid)return;
  try{
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(state.room.id);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)return;
      const data=snap.data()??{};
      const players=Array.isArray(data.players)?[...data.players]:[];
      let touched=false;
      const now=Date.now();
      const next=players.map((p)=>{
        if(String(p.uid)!==uid)return p;
        const prev=Number(p.lastSeen)||0;
          if(!force&&now-prev<1000)return p;
        touched=true;
        return{...p,lastSeen:now};
      });
      if(touched)tx.update(ref,{players:next,updatedAt:now});
    });
  }catch{}
}
function startRoomPresencePing(){
  if(roomPresenceTimer||!state.room.id||!firebaseDb)return;
  void touchRoomPresence(true);
  roomPresenceTimer=window.setInterval(async()=>{
    if(!state.room.id||!firebaseDb){clearInterval(roomPresenceTimer);roomPresenceTimer=null;return;}
    await touchRoomPresence(false);
    await pruneRoomIfNeeded();
  },ROOM_PRESENCE_PING_MS);
}
function currentAuthUserUid(){
  return String(firebaseAuth?.currentUser?.uid??'').trim();
}
async function updateActiveRoomPointer(roomId){
  const uid=currentAuthUserUid();
  if(!uid){
    try{
      const v=String(roomId||'');
      if(v)localStorage.setItem(LOCAL_ROOM_KEY,v);
      else localStorage.removeItem(LOCAL_ROOM_KEY);
    }catch{}
    return;
  }
  if(!uid||!firebaseDb)return;
  try{
    const ref=firebaseDb.collection(FIRESTORE_USERS_COLLECTION).doc(uid);
    const payload={currentRoomId:String(roomId||''),updatedAt:Date.now()};
    await ref.set(payload,{merge:true});
  }catch{}
}
async function loadActiveRoomPointer(){
  const uid=currentAuthUserUid();
  if(!uid){
    try{
      const local=String(localStorage.getItem(LOCAL_ROOM_KEY)||'').trim();
      if(local&&!state.room.id)subscribeRoom(local,'');
    }catch{}
    return;
  }
  if(!uid||!firebaseDb)return;
  if(state.room.id)return;
  try{
    const ref=firebaseDb.collection(FIRESTORE_USERS_COLLECTION).doc(uid);
    const snap=await ref.get();
    if(!snap.exists)return;
    const data=snap.data()??{};
    const roomId=String(data.currentRoomId??'').trim();
    if(!roomId)return;
    subscribeRoom(roomId,'');
  }catch{}
}
async function syncRoomSelfProfile(){
  if(!state.room.id||!firebaseDb)return;
  const uid=currentRoomPlayerId();
  if(!uid)return;
  const desiredName=String(state.home.name||'Player').slice(0,32);
  const desiredGender=state.home.gender==='female'?'female':'male';
  const desiredPic=authPictureUrl();
  try{
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(state.room.id);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)return;
      const data=snap.data()??{};
      const players=Array.isArray(data.players)?[...data.players]:[];
      let touched=false;
      const now=Date.now();
      const next=players.map((p)=>{
        if(String(p.uid)!==uid)return p;
        const patch={...p};
        if(desiredName&&String(p.name??'')!==desiredName){patch.name=desiredName;touched=true;}
        if(desiredGender&&String(p.gender??'')!==desiredGender){patch.gender=desiredGender;touched=true;}
        if(desiredPic&&String(p.picture??'')!==desiredPic){patch.picture=desiredPic;touched=true;}
        if(now-Number(p.lastSeen||0)>3000){patch.lastSeen=now;touched=true;}
        return patch;
      });
      if(touched)tx.update(ref,{players:next,updatedAt:now});
    });
  }catch{}
}
function botProfileForSeat(seat){
  const list=Array.isArray(BOT_PROFILE_POOL)&&BOT_PROFILE_POOL.length?BOT_PROFILE_POOL:[{name:'Bot',gender:'male'}];
  const idx=Math.abs(Number(seat)||0)%list.length;
  const pick=list[idx]??list[0];
  return{name:String(pick.name??'Bot'),gender:String(pick.gender??'male')==='female'?'female':'male'};
}
function isBotRoomEntry(entry){
  if(!entry||typeof entry!=='object')return false;
  if(entry.isHuman===false)return true;
  const uid=String(entry.uid??'').trim().toLowerCase();
  return uid.startsWith('bot:')||uid.startsWith('ai:');
}
function syncRoomGameRoster(roomData){
  const base=roomData?.game;
  if(!base||!Array.isArray(base.players))return null;
  const game=cloneRoomGame(base);
  const roster=Array.isArray(roomData?.players)?roomData.players:[];
  const now=Date.now();
  const status=String(roomData?.status??'');
  const turnStartedAt=Number(roomData?.game?.turnStartedAt||0);
  const turnStale=turnStartedAt>0&&(now-turnStartedAt>ROOM_PRUNE_PLAYING_MS);
  const activeRoster=roster.filter((p)=>{
    if(status!=='playing')return true;
    if(!turnStale)return true;
    return isRoomPlayerActive(p,status,now);
  });
  const seatMap=new Map();
  activeRoster.forEach((p)=>{
    const seat=Number(p?.seat);
    if(Number.isFinite(seat)&&seat>=0&&seat<4)seatMap.set(seat,p);
  });
  let changed=false;
  for(let seat=0;seat<game.players.length;seat++){
    const player=game.players[seat];
    if(!player)continue;
    const entry=seatMap.get(seat);
    if(entry){
      const entryIsBot=isBotRoomEntry(entry);
      const fallbackBot=botProfileForSeat(seat);
      const entryNameRaw=String(entry.name??'').trim();
      const entryName=entryNameRaw||fallbackBot.name||`Bot ${seat+1}`;
      const entryGender=String(entry.gender??fallbackBot.gender??'male')==='female'?'female':'male';
      const entryUid=String(entry.uid??(entryIsBot?`bot:${seat}:${entryName}`:'')).trim();
      const entryPic=entryIsBot?'':String(entry.picture??'').trim();
      if(entryIsBot){
        if(player.isHuman||String(player.uid??'')!==entryUid||player.name!==entryName||player.gender!==entryGender){
          player.isHuman=false;
          player.uid=entryUid;
          player.name=entryName;
          player.gender=entryGender;
          player.picture='';
          changed=true;
        }
      }else if(!player.isHuman||String(player.uid??'')!==entryUid||player.name!==entryName||player.gender!==entryGender||String(player.picture??'')!==entryPic){
        player.isHuman=true;
        player.uid=entryUid;
        player.name=entryName;
        player.gender=entryGender;
        player.picture=entryPic;
        changed=true;
      }
      continue;
    }
    if(player.isHuman){
      const bp=botProfileForSeat(seat);
      player.isHuman=false;
      player.uid=`bot:${seat}:${bp.name}`;
      player.name=bp.name;
      player.gender=bp.gender;
      player.picture='';
      changed=true;
    }
  }
  return changed?game:null;
}
function buildRoomGameState(roomData){
  const roster=Array.isArray(roomData?.players)?roomData.players:[]; 
  const seatMap=new Map();
  roster.forEach((p)=>{
    const seat=Number(p?.seat);
    if(Number.isFinite(seat)&&seat>=0&&seat<4)seatMap.set(seat,p);
  });
  const players=[];
  for(let seat=0;seat<4;seat++){
    const entry=seatMap.get(seat);
    if(entry){
      const entryIsBot=isBotRoomEntry(entry);
      const fallbackBot=botProfileForSeat(seat);
      const entryNameRaw=String(entry.name??'').trim();
      const entryName=entryNameRaw||fallbackBot.name||`Bot ${seat+1}`;
      const entryGender=String(entry.gender??fallbackBot.gender??'male')==='female'?'female':'male';
      players.push({
        uid:String(entry.uid??(entryIsBot?`bot:${seat}:${entryName}`:'')),
        name:entryName,
        gender:entryGender,
        picture:entryIsBot?'':String(entry.picture??'').trim(),
        hand:[],
        isHuman:!entryIsBot,
        seat
      });
    }else{
      const bp=botProfileForSeat(seat);
      players.push({
        uid:`bot:${seat}:${bp.name}`,
        name:String(bp.name),
        gender:String(bp.gender??'male')==='female'?'female':'male',
        hand:[],
        isHuman:false,
        seat
      });
    }
  }
  const deck=shuffle(createDeck());
  players.forEach((x)=>{x.hand=deck.splice(0,13).sort(cmpCard);});
  const start=players.findIndex((x)=>x.hand.some((c)=>c.rank===0&&c.suit===0));
  const storedTotals=Array.isArray(roomData?.totals)&&roomData.totals.length===4?roomData.totals
    :(Array.isArray(roomData?.game?.totals)&&roomData.game.totals.length===4?roomData.game.totals:null);
  const totals=storedTotals?[...storedTotals]:[5000,5000,5000,5000];
  const difficulty=(roomData?.settings?.aiDifficulty&&isValidDifficulty(roomData.settings.aiDifficulty))?roomData.settings.aiDifficulty:state.home.aiDifficulty;
  const roomBots=players.filter((p)=>!p.isHuman).map((p)=>({name:p.name,gender:p.gender}));
  const game={players,botProfiles:roomBots,botNames:players.filter((p)=>!p.isHuman).map((p)=>p.name),totals,currentSeat:start,lastPlay:null,passStreak:0,isFirstTrick:true,gameOver:false,status:'',systemLog:[],history:[],aiDifficulty:difficulty,lastCardBreach:null,roundSummary:null,startedAt:Date.now(),turnStartedAt:Date.now(),lastMove:null,playerActionLog:[null,null,null,null],handCount:players.map((p)=>p.hand.length)};
  setGameStatus(game,`${players[start].name} ${t('start')}`);
  return game;
}
function applyPlayToGame(game,seat,cards,now=Date.now()){
  const g=cloneRoomGame(game);
  if(!g||!Array.isArray(g.players)||!g.players[seat])return{ok:false,reason:'invalid'};
  const handIds=new Set((g.players[seat].hand??[]).map(cardId));
  const cardIds=cards.map(cardId);
  if(!cardIds.length||cardIds.some((id)=>!handIds.has(id)))return{ok:false,reason:t('illegal')};
  const ev=evaluatePlay(cards);
  if(!ev.valid)return{ok:false,reason:ev.reason||t('illegal')};
  if(g.isFirstTrick&&!has3d(cards))return{ok:false,reason:t('must3')};
  if(g.lastPlay&&!canBeat(ev,g.lastPlay.eval))return{ok:false,reason:t('beat')};
  if(shouldForceMaxAgainstLastCard(g,seat)){
    const legal=legalTurnPlays(g.players[seat].hand,g).sort(cmpStrongPlayDesc);
    const strongest=legal[0];
    const chosen=legal.find((x)=>x.eval.count===ev.count&&x.eval.kind===ev.kind&&comparePower(x.eval.power,ev.power)===0);
    if(chosen&&strongest&&comparePower(chosen.eval.power,strongest.eval.power)!==0){
      g.lastCardBreach={seat,threatenedSeat:(seat+1)%4};
    }
  }
  const ids=new Set(cards.map(cardId));
  g.players[seat].hand=g.players[seat].hand.filter((c)=>!ids.has(cardId(c)));
  g.lastPlay={seat,eval:ev,cards:ev.sorted};
  g.passStreak=0;
  g.isFirstTrick=false;
    g.lastMove={type:'play',seat,uid:String(g.players[seat]?.uid??''),cards:ev.sorted,ts:now};
  if(Array.isArray(g.playerActionLog))g.playerActionLog[seat]={type:'play',cards:ev.sorted,ts:now};
  g.turnStartedAt=now;
  g.history.push({action:'play',seat,name:g.players[seat].name,cards:ev.sorted,kind:ev.kind,ts:now});
  if(Array.isArray(g.handCount))g.handCount[seat]=g.players[seat].hand.length;
  if(g.players[seat].hand.length===0){
    g.gameOver=true;
    const details=g.players.map((p,i)=>i===seat?{remain:0,base:0,multiplier:1,deduction:0,anyTwo:false,topTwo:false,chaoMultiplier:1,chaoKey:''}:calcPenaltyDetail(p.hand));
    let deductions=details.map((d)=>d.deduction);
    if(g.lastCardBreach&&seat===g.lastCardBreach.threatenedSeat){
      const violator=g.lastCardBreach.seat;
      const transferred=deductions.reduce((sum,v)=>sum+v,0);
      deductions=deductions.map((v,i)=>i===violator?transferred:0);
    }
    const winnerGain=deductions.reduce((sum,v)=>sum+v,0);
    g.roundSummary={winnerSeat:seat,deductions:[...deductions],winnerGain,details,lastCardBreach:g.lastCardBreach?{...g.lastCardBreach}:null};
    g.totals=(g.totals??[5000,5000,5000,5000]).map((s,i)=>s+(i===seat?winnerGain:-deductions[i]));
    const remain=g.players.map((p,i)=>`${p.name}:${deductions[i]}`).join(' / ');
    setGameStatus(g,`${g.players[seat].name} ${t('wins')} ${t('penalty')}:${remain}`,{now});
    g.lastMove={type:'win',seat,uid:String(g.players[seat]?.uid??''),cards:[],ts:now};
    return{ok:true,game:g,finished:true};
  }
  if(g.lastCardBreach&&seat===g.lastCardBreach.threatenedSeat)g.lastCardBreach=null;
  g.currentSeat=(seat+1)%4;
  setGameStatus(g,`${g.players[seat].name} ${t('played')} ${kindLabel(ev.kind)}.`,{appendLog:false,now});
  return{ok:true,game:g};
}
function applyPassToGame(game,seat,now=Date.now()){
  const g=cloneRoomGame(game);
  if(!g||!Array.isArray(g.players)||!g.players[seat])return{ok:false,reason:'invalid'};
  if(!g.lastPlay)return{ok:false,reason:t('cantPass')};
  g.passStreak+=1;
  g.history.push({action:'pass',seat,name:g.players[seat].name,ts:now});
  g.lastMove={type:'pass',seat,uid:String(g.players[seat]?.uid??''),cards:[],ts:now};
  if(Array.isArray(g.playerActionLog))g.playerActionLog[seat]={type:'pass',cards:[],ts:now};
  g.turnStartedAt=now;
  if(g.lastCardBreach&&seat===g.lastCardBreach.threatenedSeat)g.lastCardBreach=null;
  if(g.passStreak>=3){
    const lead=g.lastPlay.seat;
    g.currentSeat=lead;
    g.lastPlay=null;
    g.passStreak=0;
    g.turnStartedAt=now;
    setGameStatus(g,`${g.players[lead].name} ${t('retake')}`,{now});
    return{ok:true,game:g};
  }
  g.currentSeat=(seat+1)%4;
  setGameStatus(g,`${g.players[seat].name} ${t('pass')}.`,{appendLog:false,now});
  return{ok:true,game:g};
}
function applyRoomGameSnapshot(roomData){
  const game=roomData?.game;
  if(!game||!Array.isArray(game.players)||!game.players.length)return;
  syncRoomEmote(roomData);
  const move=game.lastMove;
  if(move&&typeof move==='object'){
    const key=`${move.type||''}:${move.seat||0}:${move.ts||0}`;
    if(key&&key!==state.room.lastMoveKey){
      const now=Date.now();
      if(Number(move.ts)&&now-Number(move.ts)<=1000){
        if(move.type==='play')playSound('play');
        if(move.type==='pass')playSound('pass');
        if(move.type==='win')playSound('win');
      }
      state.room.lastMoveKey=key;
    }
  }
  const nextGame=cloneRoomGame(game)||state.solo;
  if(Array.isArray(nextGame.players)&&Array.isArray(nextGame.handCount)){
    nextGame.players.forEach((p,i)=>{nextGame.handCount[i]=p?.hand?.length??nextGame.handCount[i]??0;});
  }
  state.solo=nextGame;
  state.room.selfSeat=roomSelfSeat(roomData);
  if(state.room.selfSeat<0){
    const pid=currentRoomPlayerId();
    const idx=game.players.findIndex((p)=>String(p?.uid??'')===String(pid));
    if(idx>=0)state.room.selfSeat=idx;
    else{
      resetRoomState();
      state.screen='home';
      state.room.joinOpen=true;
      state.room.error=t('roomDisconnected');
      render();
      return;
    }
  }
  state.screen='game';
  state.home.mode='room';
  state.home.showIntro=false;
  state.home.showLeaderboard=false;
  state.showScoreGuide=false;
  state.opponentProfileName='';
  state.logTouched=false;
  state.showLog=false;
  state.recommendation=null;
  setRecommendHint('');
  const selfSeat=Number.isInteger(state.room.selfSeat)?state.room.selfSeat:0;
  const selfHand=state.solo.players?.[selfSeat]?.hand??[];
  const validIds=new Set(selfHand.map(cardId));
  state.selected=new Set([...state.selected].filter((id)=>validIds.has(id)));
  if(game.gameOver){
    const key=`${state.room.id}:${String(roomData?.gameVersion??'')}`;
    if(state.room.recordedGameKey!==key){
      state.room.recordedGameKey=key;
      const roster=Array.isArray(roomData?.players)?roomData.players:[];
      const rosterByUid=new Map(roster.map((p)=>[String(p?.uid||''),p]));
      state.room.lastResultPlayers=game.players.map((p)=>({
        uid:String(p?.uid||''),
        name:String(p?.name||''),
        gender:String(p?.gender||'male'),
        picture:String(p?.picture||rosterByUid.get(String(p?.uid||''))?.picture||'').trim(),
        isHuman:!!p?.isHuman,
        seat:Number(p?.seat)
      }));
      const summary=game.roundSummary;
      const deductions=Array.isArray(summary?.deductions)?summary.deductions:[];
      const winnerSeat=Number(summary?.winnerSeat);
      const winnerGain=Number(summary?.winnerGain)||0;
      const deltas=deductions.map((d,i)=>i===winnerSeat?winnerGain:-Number(d||0));
      const seatValid=Number.isInteger(selfSeat)&&selfSeat>=0;
      const selfPlayer=seatValid?game.players?.[selfSeat]:null;
      const isSelf=String(selfPlayer?.uid??'')===currentRoomPlayerId();
      if(isSelf&&selfPlayer?.isHuman){
        const delta=Number(deltas[selfSeat]??0);
        void recordLeaderboardRound(currentLeaderboardIdentity(),delta,selfSeat===winnerSeat);
      }
      void writeRoomGameLog(roomData,game);
    }
  }else{
    state.room.recordedGameKey='';
    state.room.lastResultPlayers=null;
  }
  render();
  maybeRunRoomAi();
}
async function writeRoomGameLog(roomData,game){
  if(!firebaseDb||!roomData||!game)return;
  const roomId=String(state.room.id||roomData.id||'').trim();
  const gameVersion=Number(roomData?.gameVersion);
  if(!roomId||!Number.isFinite(gameVersion))return;
  try{
    const ref=firebaseDb.collection(FIRESTORE_GAMELOGS_COLLECTION).doc(`${roomId}_${gameVersion}`);
    const payload={
      roomId,
      gameVersion:Math.trunc(gameVersion),
      status:String(roomData.status||''),
      createdAt:Date.now(),
      endedAt:Date.now(),
      settings:roomData.settings||{},
      summary:game.roundSummary||null,
      players:game.players?.map((p)=>({uid:String(p.uid||''),name:String(p.name||''),gender:String(p.gender||'male'),isHuman:!!p.isHuman}))||[],
      totals:game.totals||[],
      history:game.history||[]
    };
    await ref.set(payload,{merge:true});
  }catch{}
}
async function roomSubmitEmote(id,tsOverride=null,byOverride=''){
  if(!state.room.id||!firebaseDb)return;
  const match=EMOTE_STICKERS.find((x)=>x.id===id);
  if(!match)return;
  const now=Number.isFinite(Number(tsOverride))?Number(tsOverride):Date.now();
  try{
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(state.room.id);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)throw new Error('room missing');
      const data=snap.data()||{};
        if(String(data.status)!=='playing')return;
        if(!data.game)return;
        const updated=cloneRoomGame(data.game)||data.game;
        const by=String(byOverride||currentRoomPlayerId()||'');
        updated.emote={id:match.id,ts:Math.trunc(now),by};
        const updates={
          game:updated,
          updatedAt:now,
          gameVersion:Number(data.gameVersion||0)+1
        };
        const actorUid=currentRoomPlayerId();
        const bumped=bumpRoomPlayerLastSeen(Array.isArray(data.players)?data.players:[],actorUid,now);
        if(bumped.changed)updates.players=bumped.players;
        tx.update(ref,updates);
      });
  }catch{}
}
async function roomSubmitPlay(cards,seatOverride=null){
  if(!state.room.id||!firebaseDb)return;
  const roomId=state.room.id;
  const seat=Number.isInteger(seatOverride)?seatOverride:roomSelfSeat(state.room.data);
  if(seat<0)return;
  const now=Date.now();
  try{
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(roomId);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)throw new Error('room missing');
      const data=snap.data()??{};
      if(data.status!=='playing'||!data.game)throw new Error('room not playing');
      const game=data.game;
      if(Number(game.currentSeat)!==seat)throw new Error('not your turn');
      const selfSeat=roomSeatForPlayer(data,currentRoomPlayerId());
      const target=game.players?.[seat];
      const timeout=getRoomTurnTimeoutWithGrace(data);
      const startedAt=Number(game.turnStartedAt)||0;
      const timedOut=startedAt>0&&(Date.now()-startedAt)>=timeout;
      const canAct=(selfSeat===seat)||(target&&!target.isHuman)||(timedOut&&target?.isHuman);
      if(!canAct)throw new Error('not allowed');
        const result=applyPlayToGame(game,seat,cards,now);
        if(!result.ok)throw new Error(result.reason||'invalid');
        const updates={game:result.game,updatedAt:now,gameVersion:Number(data.gameVersion||0)+1};
        const reaction=pickBotReaction(result.game,seat,'play',result);
        if(reaction){
          updates.game={...result.game,emote:{id:reaction.id,ts:Math.trunc(now),by:reaction.by}};
        }
        const actorUid=(selfSeat===seat)?currentRoomPlayerId():'';
        const bumped=bumpRoomPlayerLastSeen(Array.isArray(data.players)?data.players:[],actorUid,now);
        if(bumped.changed)updates.players=bumped.players;
        if(result.finished){
          updates.status='finished';
          updates.expiresAt=now+(10*60*1000);
          updates.totals=result.game.totals||[];
          updates.roundCount=Number(data.roundCount||0)+1;
      }
      tx.update(ref,updates);
    });
    playSound('play');
    return true;
  }catch(err){
    const msg=String(err?.message??'');
    if(msg)setSoloStatus(msg);
  }
  return false;
}
async function roomSubmitPass(seatOverride=null){
  if(!state.room.id||!firebaseDb)return;
  const roomId=state.room.id;
  const seat=Number.isInteger(seatOverride)?seatOverride:roomSelfSeat(state.room.data);
  if(seat<0)return;
  const now=Date.now();
  try{
    const ref=firebaseDb.collection(FIRESTORE_ROOMS_COLLECTION).doc(roomId);
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      if(!snap.exists)throw new Error('room missing');
      const data=snap.data()??{};
      if(data.status!=='playing'||!data.game)throw new Error('room not playing');
      const game=data.game;
      if(Number(game.currentSeat)!==seat)throw new Error('not your turn');
      const selfSeat=roomSeatForPlayer(data,currentRoomPlayerId());
        const target=game.players?.[seat];
        const canAct=(selfSeat===seat)||(target&&!target.isHuman);
        if(!canAct)throw new Error('not allowed');
        const result=applyPassToGame(game,seat,now);
        if(!result.ok)throw new Error(result.reason||'invalid');
        const updates={game:result.game,updatedAt:now,gameVersion:Number(data.gameVersion||0)+1};
        const reaction=pickBotReaction(result.game,seat,'pass',null);
        if(reaction){
          updates.game={...result.game,emote:{id:reaction.id,ts:Math.trunc(now),by:reaction.by}};
        }
        const actorUid=(selfSeat===seat)?currentRoomPlayerId():'';
        const bumped=bumpRoomPlayerLastSeen(Array.isArray(data.players)?data.players:[],actorUid,now);
        if(bumped.changed)updates.players=bumped.players;
        tx.update(ref,updates);
      });
      playSound('pass');
  }catch(err){
    const msg=String(err?.message??'');
    if(msg)setSoloStatus(msg);
  }
}
function roomIsHost(){
  const data=state.room.data;
  if(!data)return false;
  const pid=currentRoomPlayerId();
  return String(data.hostId??'')===String(pid);
}
function maybeRunRoomAi(){
  if(state.home.mode!=='room')return;
  if(!state.room.id||!state.room.data||!state.room.data.game)return;
  if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}
  const g=state.room.data.game;
  const current=g?.players?.[g?.currentSeat];
  if(!g||g.gameOver||!current)return;
  if(current.isHuman){
    const timeout=getRoomTurnTimeoutWithGrace(state.room.data);
    const startedAt=Number(g.turnStartedAt)||0;
    const elapsed=startedAt>0?Date.now()-startedAt:0;
    const remaining=timeout-elapsed;
    const timedOut=startedAt>0&&remaining<=0;
    if(timedOut){
      if(g.lastPlay){
        void roomSubmitPass(g.currentSeat);
      }else{
        const legal=legalTurnPlays(current.hand,g);
        if(legal.length){
          legal.sort((a,b)=>comparePower(a.eval.power,b.eval.power));
          void roomSubmitPlay(legal[0].cards,g.currentSeat);
        }
      }
    }else{
      const wait=Math.min(1000,Math.max(200,Number.isFinite(remaining)?remaining:1000));
      aiTimer=window.setTimeout(()=>{maybeRunRoomAi();},wait);
    }
    return;
  }
  const DEFAULT_AI_DELAY_MS=320;
  const wait=DEFAULT_AI_DELAY_MS;
  aiTimer=window.setTimeout(async()=>{
    const live=state.room.data?.game;
    if(!live||live.gameOver)return;
    const actor=live.players?.[live.currentSeat];
    if(!actor||actor.isHuman)return;
    const ch=chooseAiPlay(actor.hand,live,live.aiDifficulty);
    if(!ch)await roomSubmitPass(live.currentSeat);
    else await roomSubmitPlay(ch.cards,live.currentSeat);
    window.setTimeout(()=>{maybeRunRoomAi();},420);
  },wait);
}
function syncRoomCountdownTicker(){
  const shouldRun=state.screen==='game'&&state.home.mode==='room'&&state.room.data?.game&&!state.room.data.game.gameOver;
  if(!shouldRun){
    if(roomCountdownTimer){clearInterval(roomCountdownTimer);roomCountdownTimer=null;}
    return;
  }
  if(roomCountdownTimer)return;
  roomCountdownTimer=window.setInterval(()=>{
    const active=state.screen==='game'&&state.home.mode==='room'&&state.room.data?.game&&!state.room.data.game.gameOver;
    if(!active){
      clearInterval(roomCountdownTimer);
      roomCountdownTimer=null;
      return;
    }
    const countdownEl=document.getElementById('room-countdown-value');
    if(countdownEl&&state.room.data){
      countdownEl.textContent=roomCountdownText(state.room.data);
    }
  },1000);
}
function currentLeaderboardIdentity(){
  const g=state.home.google;
  const gender=state.home.gender==='female'?'female':'male';
  if(g.signedIn&&g.email){
    const email=String(g.email).toLowerCase();
    return{id:`account:${email}`,name:String(state.home.name||g.name||'Player').slice(0,32),email,gender};
  }
  const fallback=String(state.home.name??'').trim().slice(0,32)||'Player';
  return{id:`name:${fallback.toLowerCase()}`,name:fallback,email:'',gender};
}
function botLeaderboardIdentity(name,gender){
  const safe=String(name??'Bot').trim().slice(0,32)||'Bot';
  const g=String(gender??'male')==='female'?'female':'male';
  return{id:`bot:${safe.toLowerCase()}`,name:safe,email:'',gender:g,isBot:true,picture:'',settings:{}};
}
function identityLookupIds(identity){
  const out=[];
  const id=String(identity?.id??'').trim();
  if(id)out.push(id);
  const email=String(identity?.email??'').trim().toLowerCase();
  if(email){
    out.push(`account:${email}`);
    out.push(`google:${email}`);
  }
  const uid=String(state.home.google?.uid??'').trim();
  if(uid)out.push(`uid:${uid}`);
  const seen=new Set();
  return out.filter((x)=>{if(seen.has(x))return false;seen.add(x);return true;});
}
function syncSessionNameFromStore(store){
  if(!store||typeof store!=='object'||!store.players||typeof store.players!=='object')return;
  const identity=currentLeaderboardIdentity();
  const entry=store.players[String(identity.id??'')];
  if(!entry)return;
  applyMainSettings(entry.settings);
  const savedName=String(entry?.name??'').trim().slice(0,18);
  const savedGender=String(entry?.gender??'male')==='female'?'female':'male';
  state.home.gender=savedGender;
  if(savedName)state.home.name=savedName;
}
function ensureLeaderboardEntry(store,identity){
  const safe=String(identity?.name??identity??'').trim().slice(0,32);
  if(!safe)return null;
  const email=String(identity?.email??'').trim().toLowerCase().slice(0,120);
  const gender=String(identity?.gender??state.home.gender??'male')==='female'?'female':'male';
  const isBot=isBotIdentity(identity);
  const picture=isBot?'':String(identity?.picture??state.home.google?.picture??'').trim();
  const key=String(identity?.id??(email?`account:${email}`:`name:${safe.toLowerCase()}`)).trim().slice(0,180);
  if(!key)return null;
  if(!store.players[key]){
    store.players[key]={id:key,name:safe,email,gender,picture,settings:isBot?{}:collectMainSettings(),games:0,wins:0,totalScore:5000,updatedAt:Date.now()};
  }
  if(safe)store.players[key].name=safe;
  if(email)store.players[key].email=email;
  store.players[key].gender=String(store.players[key].gender??gender)==='female'?'female':'male';
  if(picture)store.players[key].picture=picture;
  if(isBot)store.players[key].picture='';
  store.players[key].settings=isBot?{}:collectMainSettings();
  store.players[key].totalScore=scoreFromStoredTotal(store.players[key].totalScore);
  return store.players[key];
}
async function recordLeaderboardRound(identity,delta,won){
  const store=loadLeaderboardStore();
  const entry=ensureLeaderboardEntry(store,identity);
  if(!entry)return;
  const value=Number.isFinite(Number(delta))?Math.trunc(Number(delta)):0;
  const now=Date.now();
  entry.games+=1;
  if(won)entry.wins+=1;
  entry.totalScore=scoreFromStoredTotal((Number(entry.totalScore)||5000)+value);
  entry.updatedAt=now;
  saveLeaderboardStore(store);
  const payload=buildProfilePayload(identity,entry,now);
  try{
    if(await ensureFirebaseWriteAuth()){
      const ref=firebaseDb.collection(FIRESTORE_LB_COLLECTION).doc(String(entry.id));
      await ref.set(payload,{merge:true});
      return;
    }
    await writeProfileDocByRest(String(entry.id),payload);
  }catch(err){
    console.error('leaderboard round write exception (sdk)',err);
    try{
      await writeProfileDocByRest(String(entry.id),payload);
    }catch(restErr){
      console.error('leaderboard round write exception (rest)',restErr);
    }
  }
}
async function syncLeaderboardProfile(identity){
  const store=loadLeaderboardStore();
  const entry=ensureLeaderboardEntry(store,identity);
  if(!entry)return false;
  entry.updatedAt=Date.now();
  entry.totalScore=scoreFromStoredTotal(entry.totalScore);
  entry.settings=collectMainSettings();
  saveLeaderboardStore(store);
  const payload=buildProfilePayload(identity,entry,entry.updatedAt);
  try{
    if(await ensureFirebaseWriteAuth()){
      const ref=firebaseDb.collection(FIRESTORE_LB_COLLECTION).doc(String(entry.id));
      await ref.set(payload,{merge:true});
      return true;
    }
    await writeProfileDocByRest(String(entry.id),payload);
    return true;
  }catch(err){
    console.error('leaderboard profile sync exception (sdk)',err);
    try{
      await writeProfileDocByRest(String(entry.id),payload);
      return true;
    }catch(restErr){
      console.error('leaderboard profile sync exception (rest)',restErr);
      return false;
    }
  }
}
function computeLeaderboardRowsFromStore(store,period,sort,limit){
  const merged={};
  Object.values(store.players).forEach((entry)=>{
    const name=String(entry.name??'').trim();
    const email=String(entry.email??'').trim().toLowerCase();
    const key=email?`account:${email}`:`name:${name.toLowerCase()}`;
    if(!key)return;
    const current=merged[key];
    if(!current||Number(entry.updatedAt||0)>=Number(current.updatedAt||0)){
      merged[key]={...entry};
    }
  });
  const rows=Object.values(merged).map((entry)=>{
    const id=String(entry.id??'').trim();
    const games=Number(entry.games)||0;
    const wins=Number(entry.wins)||0;
    const totalScore=scoreFromStoredTotal(entry.totalScore);
    return{id,name:String(entry.name??''),email:String(entry.email??''),gender:String(entry.gender??'male')==='female'?'female':'male',picture:String(entry.picture??'').trim(),games,wins,winRate:games?wins/games:0,totalScore,updatedAt:Number(entry.updatedAt)||0};
  }).filter((row)=>row.games>0||period==='all');
  rows.sort((a,b)=>{
    if(sort==='wins')return b.wins-a.wins||b.totalScore-a.totalScore||a.name.localeCompare(b.name);
    if(sort==='games')return b.games-a.games||b.wins-a.wins||a.name.localeCompare(b.name);
    if(sort==='winRate')return b.winRate-a.winRate||b.wins-a.wins||a.name.localeCompare(b.name);
    return b.totalScore-a.totalScore||b.wins-a.wins||a.name.localeCompare(b.name);
  });
  const ranked=rows.map((r,i)=>({...r,rank:i+1}));
  void limit;
  return ranked.slice(0,20);
}
async function refreshLeaderboardCloud(){
  if(!firebaseDb||leaderboardCloudRefreshInFlight)return;
  leaderboardCloudRefreshInFlight=true;
  try{
    const lb=state.home.leaderboard;
    const snap=await firebaseDb.collection(FIRESTORE_LB_COLLECTION).get();
    const store={players:{}};
    snap.forEach((doc)=>{
      const d=doc.data()??{};
      const id=String(d.id??doc.id);
      store.players[id]={id,name:String(d.name??''),email:String(d.email??''),gender:String(d.gender??'male')==='female'?'female':'male',picture:String(d.picture??'').trim(),settings:d.settings&&typeof d.settings==='object'?d.settings:{},games:Number(d.games)||0,wins:Number(d.wins)||0,totalScore:scoreFromStoredTotal(d.totalScore),updatedAt:Number(d.updatedAt)||0};
    });
    saveLeaderboardStore(store);
    syncSessionScoreFromStore(store);
    lb.rows=computeLeaderboardRowsFromStore(store,lb.period,lb.sort,lb.limit);
    leaderboardCloudLoaded=true;
    if(state.home.showLeaderboard&&state.screen==='home')render();
  }catch(err){
    console.error('leaderboard fetch failed',err);
  }finally{leaderboardCloudRefreshInFlight=false;}
}
function refreshLeaderboard(forceCloud=false){
  const lb=state.home.leaderboard;
  const store=loadLeaderboardStore();
  syncSessionScoreFromStore(store);
  lb.rows=computeLeaderboardRowsFromStore(store,lb.period,lb.sort,lb.limit);
  if(firebaseDb&&(forceCloud||(!lb.rows.length&&!leaderboardCloudLoaded)))void refreshLeaderboardCloud();
}
function leaderboardPanelHtml(){
  const lb=state.home.leaderboard;
  const rows=lb.rows??[];
  const lx=lbText();
  const botSource=[...BOT_PROFILES.zh,...BOT_PROFILES.en];
  const botUnique=[];
  const botSeen=new Set();
  botSource.forEach((b)=>{
    const key=`${b.name}|${b.gender||'male'}`;
    if(botSeen.has(key))return;
    botSeen.add(key);
    botUnique.push(b);
  });
  const botRows=botUnique.map((b,i)=>({
    id:`bot:${b.name}:${i}`,
    name:b.name,
    gender:b.gender,
    picture:'',
    games:0,
    wins:0,
    winRate:0,
    totalScore:5000,
    updatedAt:0
  }));
  const hasBotRows=rows.some((r)=>String(r.id??'').startsWith('bot:'));
  const combinedRows=(hasBotRows?rows:[...rows,...botRows]).sort((a,b)=>{
    if(lb.sort==='wins')return b.wins-a.wins||b.totalScore-a.totalScore||a.name.localeCompare(b.name);
    if(lb.sort==='games')return b.games-a.games||b.wins-a.wins||a.name.localeCompare(b.name);
    if(lb.sort==='winRate')return b.winRate-a.winRate||b.wins-a.wins||a.name.localeCompare(b.name);
    return b.totalScore-a.totalScore||b.wins-a.wins||a.name.localeCompare(b.name);
  }).map((r,i)=>({...r,rank:i+1})).slice(0,20);
  const rowHtml=combinedRows.length?combinedRows.map((r)=>{
    const rank=Number(r.rank);
    const rowClass='lb-row';
    const medal=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'';
    const medalClass=rank===1?'gold':rank===2?'silver':rank===3?'bronze':'';
    const avatarClass=`lb-avatar ${rank===1?'gold':rank===2?'silver':rank===3?'bronze':''}`.trim();
    const isBotRow=String(r.id??'').startsWith('bot:');
    const avatarSrc=r.picture?authPictureUrlFrom(r.picture):avatarDataUri(r.name,'#7aaed8',r.gender??'male',isBotRow);
    const botNameAttr=isBotRow?` data-bot-name="${esc(r.name)}"`:'';
    return`<div class="${rowClass}"><div class="lb-rank">${medal?`<span class="lb-badge ${medalClass}" aria-hidden="true">${medal}</span>`:`#${r.rank??'-'}`}</div><div class="lb-main"><div class="lb-name-line"><div class="lb-name-pack"><span class="${avatarClass}"><img src="${avatarSrc}" alt="${esc(r.name)}"${botNameAttr}/></span><div class="lb-name">${esc(r.name)}</div></div><div class="lb-stat">${r.totalScore}</div></div><div class="lb-subline"><span>${t('score')}: ${r.totalScore} · ${r.wins}/${r.games} · ${lx.wr} ${fmtPct(r.winRate)}</span><span>${lx.updated}: ${fmtDateTime(r.updatedAt)}</span></div></div></div>`;
  }).join(''):`<div class="hint">${t('lbNoData')}</div>`;
  return`<section class="lobby-panel leaderboard-panel"><div class="control-row lb-head"><label class="field"><span>${t('lbSort')}</span><select id="lb-sort"><option value="totalDelta" ${lb.sort==='totalDelta'?'selected':''}>${t('lbTotalDelta')}</option><option value="wins" ${lb.sort==='wins'?'selected':''}>${t('lbWins')}</option><option value="games" ${lb.sort==='games'?'selected':''}>${t('lbGames')}</option><option value="winRate" ${lb.sort==='winRate'?'selected':''}>${t('lbWinRate')}</option><option value="avgDelta" ${lb.sort==='avgDelta'?'selected':''}>${t('lbAvgDelta')}</option></select></label><label class="field"><span>${t('lbPeriod')}</span><select id="lb-period"><option value="all" ${lb.period==='all'?'selected':''}>${t('lbAll')}</option><option value="7d" ${lb.period==='7d'?'selected':''}>${t('lb7d')}</option><option value="30d" ${lb.period==='30d'?'selected':''}>${t('lb30d')}</option></select></label></div><div class="lb-list">${rowHtml}</div></section>`;
}
function scoreGuideText(){
  return state.language==='en'
      ?{
        close:'Close',
        headingDesc:'At round end, each loser is deducted based on remaining cards, then multiplied by penalty conditions. The winner receives the total deductions from all losers.',
        baseTitle:'Base Scoring',
        mulTitle:'Multiplier Penalties',
        summary:'Per-loser deduction formula: Base deduction x total multiplier. The winner gains the combined deductions from all losing players.',
      tableHeaders:['Remaining Cards','Base Multiplier','Base Deduction'],
      tableRows:[
        ['1-9','x1','remaining cards x1'],
        ['10-12','x2','remaining cards x2'],
        ['13','x3','13 x3']
      ],
      mulTableHeaders:['Condition','Multiplier','Rule'],
      chaoTableHeaders:['Remaining Cards','Multiplier','Name'],
      chaoTableRows:[
        ['8-9','x2','Chao Two'],
        ['10-11','x3','Chao Three'],
        ['12','x4','Chao Four'],
        ['13','x5','Big Chao']
      ],
      anyTwo:'Holding any 2 card (♦️2/♣️2/♥️2/♠️2) applies x2.',
      topTwo:'Holding ♠️Spade 2 (top 2) applies an additional x2.',
      stack:'If multiple conditions apply, multipliers stack (multiply together).'
    }
      :{
        close:'關閉',
        headingDesc:'每局結算時，先按各輸家剩餘張數計算基本扣分，再套用加乘罰則；最後由贏家獲得所有輸家扣分總和。',
        baseTitle:'基本計分',
        mulTitle:'加乘罰則',
        summary:'每位輸家扣分公式：基本扣分 x 總加乘倍數；贏家加分為所有輸家扣分總和。',
      tableHeaders:['剩餘張數','基本倍數','基本扣分'],
      tableRows:[
        ['1-9 張','x1','按剩餘張數 x1'],
        ['10-12 張','x2','按剩餘張數 x2'],
        ['13 張','x3','13 x3']
      ],
      mulTableHeaders:['條件','倍率','說明'],
      chaoTableHeaders:['剩餘張數','倍率','稱呼'],
      chaoTableRows:[
        ['8-9張','x2','雙炒'],
        ['10-11','x3','三炒'],
        ['12','x4','四炒'],
        ['13張','x5','大炒']
      ],
      anyTwo:'持有任意 2（♦️2/♣️2/♥️2/♠️2）會套用 x2。',
      topTwo:'持有 ♠️2（頂大）會額外再套用 x2。',
      stack:'同時符合多個條件時，倍率會疊乘（相乘計算）。'
    };
}
function scoreGuideModalHtml(){
  const sx=scoreGuideText();
  const twoCards=[
    {rank:12,suit:0},
    {rank:12,suit:1},
    {rank:12,suit:2},
    {rank:12,suit:3}
  ];
  const tableRows=sx.tableRows.map((row)=>`<tr><td>${esc(row[0])}</td><td>${esc(row[1])}</td><td>${esc(row[2])}</td></tr>`).join('');
  const chaoTableRows=sx.chaoTableRows.map((row)=>`<tr><td>${esc(row[0])}</td><td>${esc(row[1])}</td><td>${esc(row[2])}</td></tr>`).join('');
  const anyTwoCards=twoCards.map((c)=>`<img src="${cardImagePath(c)}" alt="2" class="score-guide-card-art"/>`).join('');
  const topTwoCard=`<img src="${cardImagePath({rank:12,suit:3})}" alt="♠️Spade 2" class="score-guide-card-art"/>`;
  const mulTableRows=`<tr><td><div class="score-guide-cards">${anyTwoCards}</div></td><td>x2</td><td>${colorizeSuitText(sx.anyTwo)}</td></tr><tr><td><div class="score-guide-cards">${topTwoCard}</div></td><td>x2</td><td>${colorizeSuitText(sx.topTwo)}</td></tr>`;
  return`<div class="intro-modal" id="score-guide-modal"><button class="intro-backdrop" id="score-guide-backdrop" aria-label="close"></button><section class="intro-sheet"><header class="intro-head"><div><h3 class="title-with-icon"><span class="title-icon title-icon-score" aria-hidden="true"></span><span>${t('scoreGuideTitle')}</span></h3><p class="score-guide-heading">${esc(sx.headingDesc)}</p></div><button id="score-guide-close" class="secondary">${sx.close}</button></header><div class="intro-grid"><article class="intro-block"><h4>${sx.baseTitle}</h4><div class="score-guide-table-wrap"><table class="score-guide-table"><thead><tr><th>${esc(sx.tableHeaders[0])}</th><th>${esc(sx.tableHeaders[1])}</th><th>${esc(sx.tableHeaders[2])}</th></tr></thead><tbody>${tableRows}</tbody></table></div></article><article class="intro-block"><h4>${sx.mulTitle}</h4><div class="score-guide-table-wrap"><table class="score-guide-table"><thead><tr><th>${esc(sx.mulTableHeaders[0])}</th><th>${esc(sx.mulTableHeaders[1])}</th><th>${esc(sx.mulTableHeaders[2])}</th></tr></thead><tbody>${mulTableRows}</tbody></table></div><div class="score-guide-table-wrap"><table class="score-guide-table"><thead><tr><th>${esc(sx.chaoTableHeaders[0])}</th><th>${esc(sx.chaoTableHeaders[1])}</th><th>${esc(sx.chaoTableHeaders[2])}</th></tr></thead><tbody>${chaoTableRows}</tbody></table></div><p class="score-guide-stack">${esc(sx.stack)}</p></article><article class="intro-block"><p class="score-guide-summary">${esc(sx.summary)}</p></article></div></section></div>`;
}
function deriveCalloutClipKey(msg='',meta={}){
  const explicit=String(meta?.clipKey??meta?.key??'').trim().toLowerCase();
  if(explicit)return explicit;
  const raw=String(msg??'').trim();
  if(isPassCalloutText(raw))return'pass';
  if(isLastCalloutText(raw))return'last';
  const kindMap=KIND[state.language]??KIND['zh-HK'];
  for(const[k,v] of Object.entries(kindMap)){
    if(raw.startsWith(String(v)))return`kind-${k}`;
  }
  return'generic';
}
async function playRecordedCalloutClip(clipKey='',gender='male',seq=0,opts={}){
  const key=String(clipKey??'').trim().toLowerCase();
  if(!key)return false;
  const holdResume=Boolean(opts?.holdResume);
  const waitForEnd=Boolean(opts?.waitForEnd);
  const lang=state.language==='en'?'en':'zh-HK';
  const g=String(gender??'male')==='female'?'female':'male';
  const pack=normalizeCalloutStylePack(calloutStylePack);
  const cacheKey=`${lang}|${key}|${g}`;
  const exts=lang==='zh-HK'?['mp3']:['m4a','mp3','wav'];
  const nameCandidates=[
    `${key}-${pack}-${g}`,
    `${key}-${pack}`,
    `${key}-${g}`,
    key
  ];
  for(const baseName of nameCandidates){
    for(const ext of exts){
      const src=withBase(`audio/callout/${lang}/${baseName}.${ext}`);
      const token=`${cacheKey}|${baseName}|${ext}`;
      let a=null;
      if(isIOSDevice()){
        if(!iosSharedCalloutAudio){
          iosSharedCalloutAudio=new Audio();
          iosSharedCalloutAudio.preload='auto';
          iosSharedCalloutAudio.playsInline=true;
          iosSharedCalloutAudio.setAttribute?.('playsinline','');
        }
        a=iosSharedCalloutAudio;
      }else{
        a=calloutAudioCache.get(token);
        if(!a){
          a=new Audio(src);
          a.preload='auto';
          calloutAudioCache.set(token,a);
        }
      }
      a.src=src;
      try{
        if(seq&&seq!==calloutSpeakSeq)return false;
        calloutSpeechActive=true;
        calloutResumePending=false;
        calloutSpeechEndedAt=0;
        let settled=false;
        let settlePlayback;
        const playbackDone=waitForEnd?new Promise((resolve)=>{settlePlayback=resolve;}):null;
        const finish=(ok)=>{
          if(settled)return;
          settled=true;
          if(waitForEnd&&typeof settlePlayback==='function')settlePlayback(Boolean(ok));
        };
        const estimatedMs=Number.isFinite(a.duration)&&a.duration>0
          ?Math.max(200,Math.min(2800,Math.round(a.duration*1000)))
          :1200;
        calloutSpeechUntil=Date.now()+estimatedMs;
        a.onended=()=>{
          if(seq&&seq!==calloutSpeakSeq)return;
          calloutSpeechActive=false;
          calloutSpeechUntil=0;
          calloutSpeechEndedAt=Date.now();
          calloutResumePending=!holdResume;
          if(!holdResume)maybeRunSoloAi();
          finish(true);
        };
        a.onerror=()=>{
          if(seq&&seq!==calloutSpeakSeq)return;
          calloutSpeechActive=false;
          calloutSpeechUntil=0;
          calloutSpeechEndedAt=Date.now();
          calloutResumePending=!holdResume;
          if(!holdResume)maybeRunSoloAi();
          finish(false);
        };
        a.muted=false;
        a.volume=1;
        a.pause?.();
        a.currentTime=0;
        await a.play();
        if(waitForEnd&&playbackDone){
          const endedOk=await playbackDone;
          return Boolean(endedOk);
        }
        return true;
      }catch{
        if(seq&&seq!==calloutSpeakSeq)return false;
        calloutSpeechActive=false;
        calloutSpeechUntil=0;
        calloutSpeechEndedAt=Date.now();
        calloutResumePending=!holdResume;
        // try next extension/name
      }
    }
  }
  return false;
}
async function playRecordedCalloutClipSequence(clipKeys=[],gender='male',seq=0){
  const keys=(Array.isArray(clipKeys)?clipKeys:[])
    .map((k)=>String(k??'').trim().toLowerCase())
    .filter(Boolean);
  if(!keys.length)return false;
  let playedAny=false;
  for(let i=0;i<keys.length;i+=1){
    const isLast=i===keys.length-1;
    const ok=await playRecordedCalloutClip(keys[i],gender,seq,{
      holdResume:!isLast,
      waitForEnd:!isLast
    });
    if(!ok)return playedAny;
    playedAny=true;
  }
  return playedAny;
}
function speakCallout(text,gender='male',meta={}){
  try{
    const msg=String(text??'').trim();
    if(!msg)return;
    if(calloutGateUntilPlay&&state.screen==='game'&&state.home.mode==='solo'&&((state.solo?.history?.length??0)===0)&&!meta?.force)return;
    if(calloutVoiceMode==='off')return;
    const speakSeq=++calloutSpeakSeq;
    try{
      window.speechSynthesis?.cancel?.();
      if(iosSharedCalloutAudio){
        iosSharedCalloutAudio.pause?.();
        iosSharedCalloutAudio.currentTime=0;
      }
    }catch{}
    calloutSpeechActive=false;
    calloutSpeechUntil=0;
    calloutResumePending=false;
    const g=String(gender??'male')==='female'?'female':'male';
    const seatNum=Number(meta?.seat);
    const seatKey=Number.isFinite(seatNum)?`s${(Math.trunc(seatNum)%4+4)%4}`:'sX';
    const key=`${state.language}|${seatKey}|${g}|${msg}`;
    const now=Date.now();
    if(key===lastSpokenCalloutKey&&now-lastSpokenCalloutAt<900)return;
    lastSpokenCalloutKey=key;
    lastSpokenCalloutAt=now;
    const clipKey=deriveCalloutClipKey(msg,meta);
    const variantClipKey=deriveWinnerVariantClipKey(msg)
      ||deriveZhHkVariantClipKey(msg,meta)
      ||deriveEnVariantClipKey(msg,meta);
    const composedClipKeys=deriveZhHkComposedClipKeys(variantClipKey,clipKey);
    const effectiveClipKey=variantClipKey||clipKey;
    const calloutType=clipKey==='pass'
      ?'pass'
      :clipKey==='last'
        ?'last'
        :clipKey.startsWith('kind-')
          ?'play'
          :'generic';
    const playCalloutToneFallback=()=>{
      unlockAudio();
      if(!sound.enabled||!sound.ctx)return;
      if(calloutType==='pass'||isPassCalloutText(msg)){
        playTone(240,0.12,'square',0.05);
        playTone(180,0.12,'square',0.04,0.07);
        return;
      }
      if(calloutType==='last'||isLastCalloutText(msg)){
        playTone(740,0.12,'triangle',0.06);
        playTone(920,0.14,'triangle',0.05,0.06);
        return;
      }
      // play-type callout (pair/straight/etc.)
      playTone(430,0.12,'square',0.055);
      playTone(590,0.13,'triangle',0.05,0.06);
    };
    const tryRecorded=()=>{
      if(composedClipKeys.length){
        return playRecordedCalloutClipSequence(composedClipKeys,g,speakSeq);
      }
      return playRecordedCalloutClip(effectiveClipKey,g,speakSeq);
    };
    const forceExactTts=Boolean(meta?.forceExactTts);
    const useTts=Boolean(meta?.forceTts);
    const useRecorded=(calloutVoiceMode==='auto'||calloutVoiceMode==='recorded');
    const recordedMatchesText=Boolean(variantClipKey)||Boolean(composedClipKeys.length)||isCanonicalRecordedCalloutText(msg,clipKey);
    if(!useTts){
      if(useRecorded){
        void tryRecorded().then((ok)=>{if(!ok)playCalloutToneFallback();});
      }else{
        playCalloutToneFallback();
      }
      return;
    }

    if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance==='undefined'){
      if(useRecorded){
        void tryRecorded().then((ok)=>{if(!ok)playCalloutToneFallback();});
      }else{
        playCalloutToneFallback();
      }
      return;
    }
    if(!useTts&&useRecorded&&recordedMatchesText){
      void tryRecorded().then((ok)=>{if(!ok)playCalloutToneFallback();});
      return;
    }
    const synth=window.speechSynthesis;
    const femaleHint=/(female|woman|girl|zira|samantha|victoria|karen|aria|ava|alloy|ting[-\s]?ting|sin[-\s]?ji|sinji|mei[-\s]?jia|xiaoxiao|xiaoyi|xiaomeng|xiaohan|jia[-\s]?yi|yi[-\s]?ting|tracy|hiumaan|standard[-_\s]?a|standard[-_\s]?c|neural[-_\s]?a|neural[-_\s]?c|yue[-_\s]?hk[-_\s]?(female|a|c))/i;
    const maleHint=/(male|\bman\b|boy|david|alex|daniel|fred|jorge|lee|jun[-\s]?jie|wei|ming|yunxi|yunyang|xiaoming|xiaogang|james|tom|kevin|danny|hiugaai|wanlung|aasing|standard[-_\s]?b|standard[-_\s]?d|neural[-_\s]?b|neural[-_\s]?d|yue[-_\s]?hk[-_\s]?(male|b|d))/i;
    const voiceMeta=(v)=>`${v?.name||''} ${v?.voiceURI||''} ${v?.lang||''}`;
    const isFemaleVoice=(v)=>femaleHint.test(voiceMeta(v))&&!maleHint.test(voiceMeta(v));
    const isMaleVoice=(v)=>maleHint.test(voiceMeta(v))&&!femaleHint.test(voiceMeta(v));
    const byLangPrefixes=(voices,prefixes)=>voices.filter((v)=>prefixes.some((p)=>String(v.lang??'').toLowerCase().startsWith(p)));
    const isCantoneseVoice=(v)=>{
      const meta=voiceMeta(v).toLowerCase();
      const lang=String(v?.lang??'').toLowerCase();
      return /^yue(-|$)/i.test(lang) || /^zh[-_]?hk(-|$)/i.test(lang) || /cantonese|hong kong|heung gong/.test(meta);
    };
    const isMandarinVoice=(v)=>{
      const meta=voiceMeta(v).toLowerCase();
      const lang=String(v?.lang??'').toLowerCase();
      return /^zh[-_]?cn(-|$)/i.test(lang)
        || /^zh[-_]?sg(-|$)/i.test(lang)
        || /mandarin|putonghua|guoyu|普通话|普通話|國語/.test(meta);
    };
    const chooseVoice=(voices)=>{
      const source=voices??[];
      if(!source.length)return null;
      const langPool=state.language==='en'
        ?byLangPrefixes(source,['en'])
        :source.filter((v)=>isCantoneseVoice(v)&&!isMandarinVoice(v));
      const set=langPool.filter((v)=>!isMandarinVoice(v));
      if(!set.length)return null;
      if(g==='female')return set.find(isFemaleVoice) ?? null;
      return set.find(isMaleVoice) ?? null;
    };
    const chooseAnyCantonese=(voices)=>{
      const source=voices??[];
      const set=source.filter((v)=>isCantoneseVoice(v)&&!isMandarinVoice(v));
      return set[0]??null;
    };
    const speakNow=()=>{
      if(speakSeq!==calloutSpeakSeq)return;
      const spokenMsg=msg
        .replace(/\p{Extended_Pictographic}/gu,'')
        .replace(/\uFE0F/gu,'')
        .replace(/[!!]/g,'')
        .trim();
      const u=new SpeechSynthesisUtterance(spokenMsg||msg.replace(/[!!]/g,''));
      const pack=normalizeCalloutStylePack(calloutStylePack);
      const packRate=pack==='energetic'?0.835:pack==='minimal'?0.56:0.62;
      const femalePitch=pack==='energetic'?1.38:pack==='minimal'?1.18:1.28;
      const malePitch=pack==='energetic'?1.0:pack==='minimal'?0.84:0.92;
      const seatNum=Number(meta?.seat);
      const seatOffset=Number.isFinite(seatNum)?((Math.trunc(seatNum)%4+4)%4)-1.5:0;
      const seatRateOffset=seatOffset*0.01;
      const seatPitchOffset=seatOffset*0.015;
      const basePitch=g==='female'?femalePitch:malePitch;
      u.rate=Math.max(0.55,Math.min(1.2,packRate+seatRateOffset));
      u.pitch=Math.max(0.7,Math.min(1.8,basePitch+seatPitchOffset));
      const voices=synth.getVoices?.()??[];
      let voice=chooseVoice(voices);
      // If browser does not expose gender metadata, keep Cantonese-only and bias by pitch.
      if(!voice&&g==='female'){
        voice=chooseAnyCantonese(voices);
        if(!voice&&state.language==='en'&&isIOSDevice())voice=voices[0]??null;
        if(!voice){playCalloutToneFallback();return;}
        u.pitch=Math.max(u.pitch,1.18);
      }else if(!voice){
        if(state.language!=='en'){
          voice=chooseAnyCantonese(voices);
        }
        if(isIOSDevice()){
          const localeVoice=state.language==='en'
            ?voices.find((v)=>String(v?.lang??'').toLowerCase().startsWith('en'))
            :voices.find((v)=>{
              const lang=String(v?.lang??'').toLowerCase();
              return /^yue(-|$)/.test(lang) || /^zh[-_]?hk(-|$)/.test(lang);
            });
          if(!voice)voice=localeVoice??(state.language==='en'?(voices[0]??null):null);
        }
        if(!voice){playCalloutToneFallback();return;}
      }
      const estimatedMs=Math.max(120,Math.min(420,Math.round((msg.length*62)/Math.max(0.55,u.rate))));
      calloutSpeechActive=true;
      calloutSpeechUntil=Date.now()+estimatedMs;
      u.onend=()=>{if(speakSeq!==calloutSpeakSeq)return;calloutSpeechActive=false;calloutSpeechUntil=0;calloutSpeechEndedAt=Date.now();calloutResumePending=true;maybeRunSoloAi();};
      u.onerror=()=>{if(speakSeq!==calloutSpeakSeq)return;calloutSpeechActive=false;calloutSpeechUntil=0;calloutSpeechEndedAt=Date.now();calloutResumePending=true;maybeRunSoloAi();};
      u.voice=voice;
      u.lang=String(voice.lang|| (state.language==='en'?'en-US':'yue-HK'));
      synth.resume?.();
      synth.speak(u);
    };
    const speakTts=()=>{
      const voices=synth.getVoices?.()??[];
      if(!voices.length){
        const onVoices=()=>{speechPrimed=true;speakNow();};
        synth.addEventListener('voiceschanged',onVoices,{once:true});
        setTimeout(()=>{if(!speechPrimed)speakNow();},0);
        return;
      }
      speechPrimed=true;
      speakNow();
    };
    const voices=synth.getVoices?.()??[];
    if(forceExactTts){
      speakTts();
      return;
    }
    if(!voices.length){
      if(useRecorded&&calloutVoiceMode==='auto'&&recordedMatchesText){
        void tryRecorded().then((ok)=>{if(!ok)speakTts();});
      }else{
        speakTts();
      }
      return;
    }
    if(useRecorded&&calloutVoiceMode==='auto'&&recordedMatchesText){
      void tryRecorded().then((ok)=>{if(!ok)speakTts();});
    }else{
      speakTts();
    }
  }catch{}
}
function parseJwtPayload(token){try{const p=String(token??'').split('.')[1];if(!p)return null;const b=p.replace(/-/g,'+').replace(/_/g,'/');const json=decodeURIComponent(atob(b).split('').map((c)=>`%${c.charCodeAt(0).toString(16).padStart(2,'0')}`).join(''));return JSON.parse(json);}catch{return null;}}
async function handleCredentialResponse(response){
  const token=String(response?.credential??'').trim();
  if(!token)return;
  const p=parseJwtPayload(token)??{};
  initFirebaseIfReady();
  try{
    const fb=window.firebase;
    if(fb?.auth&&firebaseAuth){
      const cred=fb.auth.GoogleAuthProvider.credential(token);
      const res=await firebaseAuth.signInWithCredential(cred);
      const user=res?.user;
      if(user?.uid){
        state.home.google.uid=String(user.uid).slice(0,128);
        state.home.google.sub=String(user.uid).slice(0,64);
      }
    }
  }catch(err){
    console.warn('firebase auth credential sign-in failed',err);
  }
  const email=String(p.email??'').trim().toLowerCase().slice(0,120);
  const pic=String(p.picture??'').trim();
  const gRaw=String(p.gender??p.sex??'').trim().toLowerCase();
  const googleGender=(gRaw==='female'||gRaw==='male')?gRaw:'';
  const signedIn=Boolean(email||String(p.sub??'').trim());
  state.home.google={signedIn,provider:'google',name:String(p.name??'').slice(0,18),email,uid:String(p.sub??'').slice(0,128),sub:String(p.sub??'').slice(0,64),token,picture:pic,gender:googleGender};
  if(signedIn){
    const hydrated=await hydrateProfileFromCloudByIdentity(currentLeaderboardIdentity());
    void hydrated;
    if(state.home.google.name)state.home.name=state.home.google.name;
    if(googleGender)state.home.gender=googleGender;
    saveGoogleSession();
    await syncLeaderboardProfile(currentLeaderboardIdentity());
    if(state.home.showLeaderboard)refreshLeaderboard(true);
    void loadActiveRoomPointer();
  }
  render();
}
function clearGoogleInlineRetry(){if(googleInlineRetryTimer){clearTimeout(googleInlineRetryTimer);googleInlineRetryTimer=null;}}
function ensureGoogleIdentityInitialized(){
  if(googleIdentityInitialized)return true;
  const idApi=window.google?.accounts?.id;
  if(!idApi)return false;
  const clientId=String(document.getElementById('g_id_onload')?.getAttribute('data-client_id')??'').trim();
  if(!clientId)return false;
  try{
    idApi.initialize({client_id:clientId,callback:handleCredentialResponse});
    googleIdentityInitialized=true;
    return true;
  }catch{
    return false;
  }
}
async function signInWithProvider(providerId){
  initFirebaseIfReady();
  const fb=window.firebase;
  if(!fb?.auth||!firebaseAuth)return false;
  const p=normalizeAuthProvider(providerId);
  if(p!=='google')return false;
  const provider=new fb.auth.GoogleAuthProvider();
  provider.addScope?.('email');
  try{
    const result=await firebaseAuth.signInWithPopup(provider);
    const user=result?.user;
    const email=String(user?.email??'').trim().toLowerCase().slice(0,120);
    const uid=String(user?.uid??'').trim().slice(0,128);
    if(!email&&!uid)return false;
    state.home.google={
      signedIn:true,
      provider:p,
      name:String(user?.displayName??'').slice(0,18),
      email,
      uid,
      sub:uid.slice(0,64),
      token:'',
      picture:String(user?.photoURL??'').trim(),
      gender:''
    };
    const hydrated=await hydrateProfileFromCloudByIdentity(currentLeaderboardIdentity());
    void hydrated;
    if(state.home.google.name)state.home.name=state.home.google.name;
    saveGoogleSession();
    await syncLeaderboardProfile(currentLeaderboardIdentity());
    if(state.home.showLeaderboard)refreshLeaderboard(true);
    void loadActiveRoomPointer();
    render();
    return true;
  }catch(err){
    console.error(`sign in failed for provider: ${p}`,err);
    return false;
  }
}
async function ensureFirebaseAuth(){
  if(firebaseAuth?.currentUser?.uid)return true;
  initFirebaseIfReady();
  const fb=window.firebase;
  if(!fb?.auth||!firebaseAuth)return false;
  const token=String(state.home.google?.token??'').trim();
  if(token){
    try{
      const cred=fb.auth.GoogleAuthProvider.credential(token);
      const result=await firebaseAuth.signInWithCredential(cred);
      if(result?.user?.uid)return true;
    }catch(err){
      console.warn('credential sign-in failed',err);
    }
  }
  return false;
}
function signOutCurrentProvider(){
  state.home.google={signedIn:false,provider:'',name:'',email:'',uid:'',sub:'',token:'',picture:'',gender:''};
  clearGoogleSession();
  try{window.google?.accounts?.id?.disableAutoSelect?.();}catch{}
  try{firebaseAuth?.signOut?.();}catch{}
}
function authProviderBadgeHtml(provider){
  void provider;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.31h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.86c2.26-2.08 3.58-5.15 3.58-8.65Z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.86-3A7.17 7.17 0 0 1 12 19.3c-3.12 0-5.77-2.11-6.72-4.96H1.3v3.11A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.28 14.34a7.2 7.2 0 0 1 0-4.68V6.55H1.3a12 12 0 0 0 0 10.9l3.98-3.11Z"/><path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.94 1.23 15.24 0 12 0A12 12 0 0 0 1.3 6.55l3.98 3.11C6.23 6.88 8.88 4.77 12 4.77Z"/></svg>`;
}
function queueGoogleInlineRender(){
  window.setTimeout(()=>{if(state.screen==='home')renderGoogleInline();},0);
  window.requestAnimationFrame(()=>{if(state.screen==='home')renderGoogleInline();});
}
window.onGoogleScriptLoaded=()=>{if(state.screen==='home')queueGoogleInlineRender();};
function bootFirebase(attempt=0){
  if(initFirebaseIfReady()){
    if(signedInWithEmail()){
      void hydrateProfileFromCloudByIdentity(currentLeaderboardIdentity()).then(()=>{if(state.home.showLeaderboard)refreshLeaderboard(true);render();});
    }
    refreshLeaderboard(true);
    void loadActiveRoomPointer();
    return;
  }
  if(attempt<120)window.setTimeout(()=>bootFirebase(attempt+1),250);
}
function renderGoogleInline(){
  clearGoogleInlineRetry();
  const slot=document.getElementById('google-name-inline')??document.getElementById('google-inline');
  if(!slot)return;
  const nameRow=slot.parentElement;
  if(signedInWithEmail()){
    slot.classList.add('signed-in');
    nameRow?.classList.add('signed-in-auth');
    const current=authProviderPrefix();
    const label='Google';
    slot.innerHTML=`<span class="auth-provider-badge auth-provider-${current}" role="img" aria-label="${label}" title="${label}">${authProviderBadgeHtml(current)}</span><button id="google-signout" class="auth-btn auth-btn-signout">${t('signOut')}</button>`;
    document.getElementById('google-signout')?.addEventListener('click',()=>{signOutCurrentProvider();render();});
    return;
  }
  slot.classList.remove('signed-in');
  nameRow?.classList.remove('signed-in-auth');
  const hasGsi=Boolean(window.google?.accounts?.id&&ensureGoogleIdentityInitialized());
  slot.innerHTML=`<div id="google-login-slot"></div>`;
  const gSlot=document.getElementById('google-login-slot');
  if(hasGsi){
    if(gSlot){
      try{
        window.google.accounts.id.renderButton(gSlot,{theme:'outline',size:'medium',text:'signin_with',shape:'pill'});
      }catch{
        gSlot.innerHTML='';
      }
    }
  }else{
    if(gSlot)gSlot.innerHTML='';
  }
}
function isMobilePointer(){return window.matchMedia('(max-width: 860px), (pointer: coarse)').matches;}
function isWebView(){
  const ua=String(navigator?.userAgent??'');
  return /\bwv\b/.test(ua)||/WebView/i.test(ua)||/(Android.*Version\/\d+\.\d+.*Chrome\/\d+\.\d+ Mobile)/i.test(ua);
}
const MIN_WEB_GAME_WIDTH=480;
const MIN_WEB_GAME_HEIGHT=520;
function isWebViewportTooSmall(){
  if(isWebView())return false;
  const coarse=window.matchMedia('(pointer: coarse)').matches;
  if(coarse)return false;
  const w=window.innerWidth||0;
  const h=window.innerHeight||0;
  return w>0&&h>0&&(w<MIN_WEB_GAME_WIDTH||h<MIN_WEB_GAME_HEIGHT);
}
function syncWebViewportGuardAttrs(){
  const tooSmall=isWebViewportTooSmall();
  const w=Math.round(window.innerWidth||0);
  const h=Math.round(window.innerHeight||0);
  document.body.setAttribute('data-web-too-small',tooSmall?'1':'0');
  document.body.setAttribute('data-webview',(isMobilePointer()||isWebView())?'1':'0');
  const msg=state.language==='zh-HK'
    ?`視窗太小（目前 ${w} x ${h}），請將瀏覽器放大至至少 ${MIN_WEB_GAME_WIDTH} x ${MIN_WEB_GAME_HEIGHT} 後繼續。`
    :`Window too small (current ${w} x ${h}). Please resize to at least ${MIN_WEB_GAME_WIDTH} x ${MIN_WEB_GAME_HEIGHT}.`;
  document.body.setAttribute('data-web-too-small-msg',msg);
  let overlay=document.getElementById('web-too-small-overlay');
  if(tooSmall){
    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='web-too-small-overlay';
      overlay.style.cssText='position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:18px;text-align:center;font-weight:800;line-height:1.35;color:#f5fbff;background:rgba(4,11,18,.78);pointer-events:auto;';
      document.body.appendChild(overlay);
    }
    overlay.textContent=msg;
  }else if(overlay){
    overlay.remove();
  }
}
function shouldBlockLandscapeMobile(){
  const isCoarseLandscape=window.matchMedia('(pointer: coarse) and (orientation: landscape)').matches;
  if(!isCoarseLandscape)return false;
  // Block landscape on phones only; allow tablet/iPad landscape.
  const shortSide=Math.min(window.innerWidth||0,window.innerHeight||0);
  return shortSide>0&&shortSide<600;
}
function renderOrientationBlock(){
  const zh=state.language==='zh-HK';
  const title=zh?'請使用直向模式':'Portrait Mode Required';
  const body=zh?'此遊戲僅支援手機直向模式，請將裝置旋轉為直向再繼續。':'This game supports portrait mode on mobile only. Please rotate your device to continue.';
  app.innerHTML=`<section class="orientation-block"><div class="orientation-card"><h2>${esc(title)}</h2><p>${esc(body)}</p></div></section>`;
}
window.handleCredentialResponse=handleCredentialResponse;
function uiStatus(msg){const s=String(msg??'');if(!s)return'';return s;}
const esc=(s)=>String(s??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colorizeSuitText=(s)=>esc(s)
  .replaceAll('♦️','<span class="suit-red">♦️</span>')
  .replaceAll('♥️','<span class="suit-red">♥️</span>')
  .replaceAll('♣️','<span class="suit-black">♣️</span>')
  .replaceAll('♠️','<span class="suit-black">♠️</span>');
function hashNameSeed(name){
  const s=String(name??'');
  let h=2166136261;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return h>>>0;
}
function pick(arr,seed,offset=0){return arr[(seed+offset)%arr.length];}
const AVATAR_BASE_SRC={male:withBase('avatar-male.png'),female:withBase('avatar-female.png')};
const AVATAR_DICEBEAR_BASE='https://api.dicebear.com/9.x/avataaars/svg';
const AVATAR_A4_COMMON={
  backgroundColor:'transparent',
  backgroundType:'solid',
  clip:'true',
  style:'default'
};
const AVATAR_A4_HK={
  skinColor:['d08b5b','edb98a','ffdbb4','f8d25c'],
  hairColor:['2c1b18','4a312c','724133','a55728']
};
const AVATAR_A4_ENERGETIC={
  eyes:['happy','surprised','wink','default'],
  mouth:['smile','twinkle','default'],
  eyebrows:['raisedExcited','raisedExcitedNatural','upDown','defaultNatural'],
  accessories:['round','prescription01','prescription02'],
  clothing:['blazerAndShirt','blazerAndSweater','collarAndSweater','hoodie','shirtCrewNeck'],
  clothesColor:['65c9ff','5199e4','ff5c5c','ff488e','a7ffc4','b1e2ff','ffffb1','ffdeb5']
};
const AVATAR_A4_TOP={
  male:['shortFlat','shortRound','shortWaved','shortCurly','theCaesar','theCaesarAndSidePart','shaggy'],
  female:['longButNotTooLong','straight01','straight02','straightAndStrand','bob','bun','curvy','curly','bigHair']
};
const AVATAR_A4_FACIAL_HAIR={
  list:['beardLight','beardMedium','moustacheFancy']
};
const AVATAR_VARIANT_BY_NAME={
  '俊傑':'v2',
  '穎欣':'v2'
};
const AVATAR_IMAGE_BY_BOT_NAME={
  '志明':'https://avataaars.io/?topType=WinterHat3&accessoriesType=Round&hatColor=Blue02&facialHairType=Blank&clotheType=GraphicShirt&clotheColor=Blue02&graphicType=Bear&eyeType=Squint&eyebrowType=UpDown&mouthType=Smile&skinColor=Light',
  '子朗':'https://avataaars.io/?topType=Hat&accessoriesType=Prescription02&facialHairType=BeardLight&facialHairColor=BrownDark&clotheType=BlazerShirt&eyeType=EyeRoll&eyebrowType=Default&mouthType=Twinkle&skinColor=Light&scale=200',
  '家樂':'https://avataaars.io/?topType=ShortHairDreads02&accessoriesType=Sunglasses&hairColor=BrownDark&facialHairType=BeardLight&facialHairColor=BrownDark&clotheType=Hoodie&clotheColor=PastelRed&eyeType=Wink&eyebrowType=Default&mouthType=Grimace&skinColor=Pale',
  '嘉欣':'https://avataaars.io/?topType=LongHairCurvy&accessoriesType=Round&hairColor=Black&facialHairType=Blank&clotheType=GraphicShirt&clotheColor=Pink&graphicType=Diamond&eyeType=Default&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=Light',
  '芷晴':'https://avataaars.io/?topType=LongHairStraightStrand&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=GraphicShirt&clotheColor=Blue03&graphicType=Selena&eyeType=Happy&eyebrowType=Default&mouthType=Smile&skinColor=Light',
  'ReXX':'https://avataaars.io/?topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Wink&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Light',
  'Axel':'https://avataaars.io/?topType=ShortHairDreads02&accessoriesType=Round&hairColor=Red&facialHairType=BeardMajestic&facialHairColor=Red&clotheType=Hoodie&clotheColor=Red&eyeType=Default&eyebrowType=UnibrowNatural&mouthType=Eating&skinColor=Pale',
  '穎欣':'https://avataaars.io/?topType=LongHairFroBand&accessoriesType=Kurt&hairColor=Blonde&facialHairType=Blank&clotheType=ShirtVNeck&clotheColor=Red&eyeType=Squint&eyebrowType=RaisedExcitedNatural&mouthType=Twinkle&skinColor=Light',
  '佩儀':'https://avataaars.io/?topType=LongHairFrida&accessoriesType=Round&hairColor=Blonde&facialHairType=Blank&clotheType=CollarSweater&clotheColor=Pink&eyeType=WinkWacky&eyebrowType=Default&mouthType=Grimace&skinColor=Pale&backgroundColor=b6e3f4,c0aede,d1d4f9',
  '少龍':'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairDreads01&accessoriesType=Sunglasses&hairColor=Brown&facialHairType=BeardLight&facialHairColor=BrownDark&clotheType=BlazerShirt&eyeType=Side&eyebrowType=AngryNatural&mouthType=Concerned&skinColor=Brown&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'Kane':'https://avataaars.io/?topType=Eyepatch&facialHairType=BeardMedium&facialHairColor=Black&clotheType=ShirtVNeck&clotheColor=Black&eyeType=Surprised&eyebrowType=AngryNatural&mouthType=Grimace&skinColor=DarkBrown&scale=150',
  'Milo':'https://avataaars.io/?topType=WinterHat2&accessoriesType=Blank&hatColor=Blue03&facialHairType=Blank&clotheType=Hoodie&clotheColor=Heather&eyeType=Squint&eyebrowType=UpDownNatural&mouthType=Smile&skinColor=Light',
  'Jade':'https://avataaars.io/?topType=LongHairFro&accessoriesType=Blank&hairColor=PastelPink&facialHairType=Blank&clotheType=ShirtScoopNeck&clotheColor=PastelRed&eyeType=Happy&eyebrowType=UpDown&mouthType=Twinkle&skinColor=Pale',
  'Nora':'https://avataaars.io/?topType=LongHairFroBand&accessoriesType=Blank&hairColor=Auburn&facialHairType=Blank&clotheType=ShirtScoopNeck&clotheColor=Pink&eyeType=Close&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=Light',
  '天樂':'https://avataaars.io/?topType=ShortHairDreads01&accessoriesType=Prescription01&hairColor=Black&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Wink&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=Brown'
  ,
  'Nova':'https://avataaars.io/?topType=LongHairDreads&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=ShirtScoopNeck&clotheColor=Pink&eyeType=Default&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=Brown',
  'Skye':'https://avataaars.io/?topType=LongHairStraight&accessoriesType=Prescription01&hairColor=Black&facialHairType=Blank&clotheType=GraphicShirt&clotheColor=Blue03&graphicType=Cumbia&eyeType=Close&eyebrowType=RaisedExcitedNatural&mouthType=Smile&skinColor=Light',
  'Iris':'https://avataaars.io/?topType=LongHairBun&accessoriesType=Kurt&hairColor=Red&facialHairType=Blank&clotheType=ShirtVNeck&clotheColor=Pink&eyeType=Close&eyebrowType=UpDown&mouthType=Disbelief&skinColor=Light',
  '葵芳':'https://avataaars.io/?topType=LongHairCurvy&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=Overall&clotheColor=Red&eyeType=Side&eyebrowType=Default&mouthType=Concerned&skinColor=Light',
  '葵兄':'https://avataaars.io/?topType=ShortHairShaggyMullet&accessoriesType=Sunglasses&hairColor=Black&facialHairType=Blank&clotheType=BlazerShirt&eyeType=WinkWacky&eyebrowType=Default&mouthType=Serious&skinColor=Light',
  'Jax':'https://avataaars.io/?topType=ShortHairShortRound&accessoriesType=Round&hairColor=BrownDark&facialHairType=Blank&clotheType=Hoodie&clotheColor=Heather&eyeType=Happy&eyebrowType=RaisedExcitedNatural&mouthType=Grimace&skinColor=Light'
};
const AVATAR_OVERRIDE_BY_NAME={
  '少龍':{
    eyes:'default',
    eyebrows:'upDown',
    mouth:'smile',
    accessories:'prescription02',
    top:'shortCurly',
    skinColor:'d08b5b',
    hairColor:'2c1b18'
  }
};
const AVATAR_RECOLOR_VERSION='v2';
const avatarRecolorCache=new Map();
const avatarRecolorPending=new Set();
const avatarImageCache=new Map();
const avatarClothesMaskCache=new Map();
function clamp255(v){return Math.max(0,Math.min(255,Math.round(v)));}
function normalizeAvatarColor(color){
  const raw=String(color??'').trim();
  if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)){
    if(raw.length===4)return`#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
    return raw.toLowerCase();
  }
  const m=raw.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if(m){
    const r=clamp255(Number(m[1])),g=clamp255(Number(m[2])),b=clamp255(Number(m[3]));
    return`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }
  return '#7aaed8';
}
function hexToRgb(hex){
  const h=normalizeAvatarColor(hex);
  return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)};
}
function colorDistSq(r1,g1,b1,r2,g2,b2){
  const dr=r1-r2,dg=g1-g2,db=b1-b2;
  return dr*dr+dg*dg+db*db;
}
function computeAvatarClothesMask(data,w,h){
  const yMin=Math.floor(h*0.42);
  const xMin=Math.floor(w*0.2);
  const xMax=Math.ceil(w*0.8);
  let seedX=-1,seedY=-1,seedR=0,seedG=0,seedB=0,best=-1;
  for(let y=h-1;y>=yMin;y--){
    for(let x=xMin;x<xMax;x++){
      const i=(y*w+x)*4;
      const a=data[i+3];
      if(a<40)continue;
      const r=data[i],g=data[i+1],b=data[i+2];
      const max=Math.max(r,g,b),min=Math.min(r,g,b);
      const sat=max-min;
      if(sat<18)continue;
      const skinLike=(r>g&&g>b&&r>90&&b<140&&(r-g)<95);
      if(skinLike)continue;
      const score=sat+(y/h)*48-Math.abs(x-(w/2))*0.45;
      if(score>best){
        best=score;
        seedX=x;seedY=y;seedR=r;seedG=g;seedB=b;
      }
    }
  }
  const mask=new Uint8Array(w*h);
  if(seedX<0)return mask;
  const qx=[seedX];
  const qy=[seedY];
  mask[seedY*w+seedX]=1;
  const tolSq=145*145;
  for(let qi=0;qi<qx.length;qi++){
    const x=qx[qi],y=qy[qi];
    const next=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
    for(const [nx,ny] of next){
      if(nx<0||ny<0||nx>=w||ny>=h||ny<yMin)continue;
      const p=ny*w+nx;
      if(mask[p])continue;
      const i=p*4;
      if(data[i+3]<24)continue;
      const r=data[i],g=data[i+1],b=data[i+2];
      if(colorDistSq(r,g,b,seedR,seedG,seedB)>tolSq)continue;
      mask[p]=1;
      qx.push(nx);
      qy.push(ny);
    }
  }
  return mask;
}
function getAvatarClothesMask(img,gender,data,w,h){
  const g=String(gender??'male')==='female'?'female':'male';
  const key=`${g}|${w}x${h}`;
  const cached=avatarClothesMaskCache.get(key);
  if(cached)return cached;
  const mask=computeAvatarClothesMask(data,w,h);
  avatarClothesMaskCache.set(key,mask);
  return mask;
}
function recolorAvatarClothes(img,seatColor,gender='male'){
  const canvas=document.createElement('canvas');
  canvas.width=img.naturalWidth||img.width;
  canvas.height=img.naturalHeight||img.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)return null;
  ctx.drawImage(img,0,0);
  const frame=ctx.getImageData(0,0,canvas.width,canvas.height);
  const data=frame.data;
  const t=hexToRgb(seatColor);
  const mask=getAvatarClothesMask(img,gender,data,canvas.width,canvas.height);
  for(let p=0;p<mask.length;p++){
    if(!mask[p])continue;
    const i=p*4;
    const shade=(data[i]+data[i+1]+data[i+2])/765;
    const k=0.52+(shade*0.98);
    data[i]=clamp255(t.r*k);
    data[i+1]=clamp255(t.g*k);
    data[i+2]=clamp255(t.b*k);
  }
  ctx.putImageData(frame,0,0);
  return canvas.toDataURL('image/png');
}
function ensureAvatarImageLoaded(gender){
  const g=String(gender??'male')==='female'?'female':'male';
  if(avatarImageCache.has(g))return Promise.resolve(avatarImageCache.get(g));
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{avatarImageCache.set(g,img);resolve(img);};
    img.onerror=()=>reject(new Error(`avatar load failed: ${g}`));
    img.src=AVATAR_BASE_SRC[g];
  });
}
function scheduleAvatarRecolor(gender,seatColor){
  const g=String(gender??'male')==='female'?'female':'male';
  const c=normalizeAvatarColor(seatColor);
  const key=`${AVATAR_RECOLOR_VERSION}|${g}|${c}`;
  if(avatarRecolorCache.has(key)||avatarRecolorPending.has(key))return;
  avatarRecolorPending.add(key);
  ensureAvatarImageLoaded(g).then((img)=>{
    const recolored=recolorAvatarClothes(img,c,g);
    if(recolored)avatarRecolorCache.set(key,recolored);
    if(state.screen==='game')render();
  }).catch(()=>{}).finally(()=>avatarRecolorPending.delete(key));
}
function avatarDataUri(name,color,gender='male',isBot=false){
  const g=String(gender??'male')==='female'?'female':'male';
  const baseName=String(name??'player')||'player';
  const overrideImage=isBot?AVATAR_IMAGE_BY_BOT_NAME[baseName]??'':'';
  if(overrideImage)return overrideImage;
  const variant=AVATAR_VARIANT_BY_NAME[baseName]??'';
  const seedText=`${g}-${baseName}${variant?`-${variant}`:''}`;
  const seedHash=hashNameSeed(seedText);
  const seatColor=normalizeAvatarColor(color);
  const seatRgb=seatColor?hexToRgb(seatColor):null;
  const seatLight=seatRgb
    ?`#${clamp255(seatRgb.r+(255-seatRgb.r)*0.65).toString(16).padStart(2,'0')}${clamp255(seatRgb.g+(255-seatRgb.g)*0.65).toString(16).padStart(2,'0')}${clamp255(seatRgb.b+(255-seatRgb.b)*0.65).toString(16).padStart(2,'0')}`
    :'';
  const params=new URLSearchParams();
  params.set('seed',seedText);
  const override=AVATAR_OVERRIDE_BY_NAME[baseName]??null;
  params.set('top',override?.top??pick(AVATAR_A4_TOP[g],seedHash,1));
  params.set('eyes',override?.eyes??pick(AVATAR_A4_ENERGETIC.eyes,seedHash,2));
  params.set('mouth',override?.mouth??pick(AVATAR_A4_ENERGETIC.mouth,seedHash,3));
  params.set('eyebrows',override?.eyebrows??pick(AVATAR_A4_ENERGETIC.eyebrows,seedHash,4));
  params.set('accessories',override?.accessories??pick(AVATAR_A4_ENERGETIC.accessories,seedHash,5));
  params.set('clothing',pick(AVATAR_A4_ENERGETIC.clothing,seedHash,6));
  params.set('clothesColor',pick(AVATAR_A4_ENERGETIC.clothesColor,seedHash,7));
  params.set('skinColor',override?.skinColor??pick(AVATAR_A4_HK.skinColor,seedHash,8));
  params.set('hairColor',override?.hairColor??pick(AVATAR_A4_HK.hairColor,seedHash,9));
  params.set('facialHair',pick(AVATAR_A4_FACIAL_HAIR.list,seedHash,10));
  params.set('facialHairProbability','0');
  void seatColor;
  void seatLight;
  Object.entries(AVATAR_A4_COMMON).forEach(([k,v])=>{
    if(params.has(k))return;
    params.set(k,v);
  });
  return `${AVATAR_DICEBEAR_BASE}?${params.toString()}`;
}
function authPictureUrl(){
  const pic=String(state.home.google?.picture??'').trim();
  if(!pic)return'';
  try{
    let url=pic;
    if(/^data:|^blob:/i.test(url))return url;
    if(/^\/\//.test(url))url=`https:${url}`;
    if(!/^https?:\/\//i.test(url))url=`https://${url.replace(/^\/+/,'')}`;
    if(!/^https?:\/\//i.test(url))return'';
    return url;
  }catch{
    return pic;
  }
}
function authPictureUrlFrom(picRaw){
  const pic=String(picRaw??'').trim();
  if(!pic)return'';
  try{
    let url=pic;
    if(/^data:|^blob:/i.test(url))return url;
    if(/^\/\//.test(url))url=`https:${url}`;
    if(!/^https?:\/\//i.test(url))url=`https://${url.replace(/^\/+/,'')}`;
    if(!/^https?:\/\//i.test(url))return'';
    return url;
  }catch{
    return pic;
  }
}
function selfAvatarDataUri(name,color,gender='male'){
  const authPic=authPictureUrl();
  if(state.home.google?.signedIn&&authPic)return authPic;
  const g=String(gender??'male')==='female'?'female':'male';
  return AVATAR_BASE_SRC[g];
}
const avatarGenderClass=(gender)=>String(gender??'male')==='female'?'avatar-female':'avatar-male';
const cardId=(c)=>`${c.rank}-${c.suit}`;
const compareSingleCardPower=(a,b)=>a.rank-b.rank||a.suit-b.suit;
const cmpCard=compareSingleCardPower;
const HIGHEST_SINGLE={rank:12,suit:3}; // ♠️2
const LOWEST_SINGLE={rank:0,suit:0}; // ♦️3
const isHighestSingle=(c)=>compareSingleCardPower(c,HIGHEST_SINGLE)===0;
const isLowestSingle=(c)=>compareSingleCardPower(c,LOWEST_SINGLE)===0;

function createDeck(){const d=[];for(let r=0;r<RANKS.length;r++)for(let s=0;s<SUITS.length;s++)d.push({rank:r,suit:s});return d;}
function shuffle(d){for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
function isConsecutive(a){for(let i=1;i<a.length;i++)if(a[i]!==a[i-1]+1)return false;return true;}
function straightMeta(ranks){
  if(ranks.length!==5)return null;
  const uniq=[...new Set(ranks)];
  if(uniq.length!==5)return null;
  const has=new Set(uniq);
  // Allowed starts: 3..10 (normal), A (A2345), 2 (23456).
  const starts=[0,1,2,3,4,5,6,7,11,12];
  for(const start of starts){
    const seq=[0,1,2,3,4].map((i)=>(start+i)%13);
    if(seq.every((r)=>has.has(r))){
      // Straight comparison uses the biggest rank by Big Two order (2 is highest).
      return{seq,high:Math.max(...seq)};
    }
  }
  return null;
}
function comparePower(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const av=a[i]??-1,bv=b[i]??-1;if(av!==bv)return av-bv;}return 0;}
function canBeat(c,tv){if(c.count!==tv.count)return false;if(c.count<5&&c.kind!==tv.kind)return false;if(c.count===5){const d=FIVE_KIND_POWER[c.kind]-FIVE_KIND_POWER[tv.kind];if(d!==0)return d>0;}return comparePower(c.power,tv.power)>0;}
const has3d=(cards)=>cards.some((c)=>c.rank===0&&c.suit===0);
function evaluatePlay(cards){
  const sorted=[...cards].sort(cmpCard);const count=sorted.length;const cnt=new Map();for(const c of sorted)cnt.set(c.rank,(cnt.get(c.rank)??0)+1);
  if(count===1)return{valid:true,count,kind:'single',power:[sorted[0].rank,sorted[0].suit],sorted};
  if(count===2){if(cnt.size!==1)return{valid:false,reason:t('pair')};return{valid:true,count,kind:'pair',power:[sorted[0].rank,Math.max(sorted[0].suit,sorted[1].suit)],sorted};}
  if(count===3){if(cnt.size!==1)return{valid:false,reason:t('triple')};return{valid:true,count,kind:'triple',power:[sorted[0].rank],sorted};}
  if(count!==5)return{valid:false,reason:t('count')};
  const ranks=sorted.map((c)=>c.rank).sort((a,b)=>a-b);const suits=sorted.map((c)=>c.suit);const flush=suits.every((s)=>s===suits[0]);const straight=straightMeta(ranks);const g=[...cnt.entries()].sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
  const straightHighSuit=straight?sorted.filter((c)=>c.rank===straight.high).reduce((best,c)=>c.suit>best?c.suit:best,-1):-1;
  if(straight&&flush)return{valid:true,count,kind:'straightflush',power:[FIVE_KIND_POWER.straightflush,straight.high,straightHighSuit],sorted};
  if(g[0][1]===4)return{valid:true,count,kind:'fourofkind',power:[FIVE_KIND_POWER.fourofkind,g[0][0]],sorted};
  if(g[0][1]===3&&g[1][1]===2)return{valid:true,count,kind:'fullhouse',power:[FIVE_KIND_POWER.fullhouse,g[0][0]],sorted};
  if(flush){const d=[...ranks].sort((a,b)=>b-a);const flushSuit=sorted[0].suit;return{valid:true,count,kind:'flush',power:[FIVE_KIND_POWER.flush,flushSuit,...d],sorted};}
  if(straight)return{valid:true,count,kind:'straight',power:[FIVE_KIND_POWER.straight,straight.high,straightHighSuit],sorted};
  return{valid:false,reason:t('five')};
}

function combos(cards,size){const out=[];const dfs=(i,path)=>{if(path.length===size){out.push([...path]);return;}for(let x=i;x<cards.length;x++){path.push(cards[x]);dfs(x+1,path);path.pop();}};dfs(0,[]);return out;}
function allValidPlays(hand){
  const plays=[];
  for(const c of hand)plays.push({cards:[c],eval:evaluatePlay([c])});
  const byRank=new Map();
  for(const c of hand){
    const a=byRank.get(c.rank)??[];
    a.push(c);
    byRank.set(c.rank,a);
  }
  for(const [,cs]of byRank){
    if(cs.length>=2)for(const p of combos(cs,2))plays.push({cards:p,eval:evaluatePlay(p)});
    if(cs.length>=3)for(const p of combos(cs,3))plays.push({cards:p,eval:evaluatePlay(p)});
  }
  for(const p of combos(hand,5)){
    const ev=evaluatePlay(p);
    if(ev.valid)plays.push({cards:p,eval:ev});
  }
  const valid=plays.filter((p)=>p.eval.valid);
  const pickPreferred=(a,b,preferNonTwo)=>{
    if(!a)return b;
    if(!b)return a;
    const aIsTwo=a.rank===12;
    const bIsTwo=b.rank===12;
    if(preferNonTwo&&aIsTwo!==bIsTwo)return aIsTwo?b:a;
    if(a.rank!==b.rank)return a.rank<b.rank?a:b;
    return a.suit<b.suit?a:b;
  };
  const fourByRank=new Map();
  const fullByRank=new Map();
  const out=[];
  for(const p of valid){
    if(p.eval.kind!=='fourofkind'&&p.eval.kind!=='fullhouse'){
      out.push(p);
      continue;
    }
    const counts=new Map();
    for(const c of p.cards)counts.set(c.rank,(counts.get(c.rank)??0)+1);
    if(p.eval.kind==='fourofkind'){
      let fourRank=0;
      let kicker=null;
      for(const [rank,n] of counts.entries()){
        if(n===4)fourRank=rank;
        else if(n===1)kicker=p.cards.find((c)=>c.rank===rank)??kicker;
      }
      const entry=fourByRank.get(fourRank);
      if(!entry){
        fourByRank.set(fourRank,{play:p,kicker});
      }else{
        const preferred=pickPreferred(entry.kicker,kicker,true);
        if(preferred&&kicker&&cardId(preferred)===cardId(kicker)){
          fourByRank.set(fourRank,{play:p,kicker});
        }
      }
      continue;
    }
    let tripleRank=0;
    let pairRank=0;
    for(const [rank,n] of counts.entries()){
      if(n===3)tripleRank=rank;
      if(n===2)pairRank=rank;
    }
    const entry=fullByRank.get(tripleRank);
    if(!entry){
      fullByRank.set(tripleRank,{play:p,pairRank});
    }else{
      const preferNonTwo=entry.pairRank===12||pairRank!==12;
      const preferred=pickPreferred({rank:entry.pairRank,suit:0},{rank:pairRank,suit:0},preferNonTwo);
      if(preferred.rank===pairRank){
        fullByRank.set(tripleRank,{play:p,pairRank});
      }
    }
  }
  for(const row of fourByRank.values())out.push(row.play);
  for(const row of fullByRank.values())out.push(row.play);
  return out;
}
function legalTurnPlays(hand,game){
  let legal=allValidPlays(hand);
  if(game.isFirstTrick)legal=legal.filter((e)=>has3d(e.cards));
  if(game.lastPlay)legal=legal.filter((e)=>canBeat(e.eval,game.lastPlay.eval));
  return legal;
}
function canAnyOpponentBeatSingle(card,game,seat){
  for(let i=0;i<game.players.length;i++){
    if(i===seat)continue;
    const hand=game.players[i]?.hand??[];
    for(const c of hand){
      if(compareSingleCardPower(c,card)>0)return true;
    }
  }
  return false;
}
function forceFinishPlanPlay(hand,game,seat){
  if(!Array.isArray(hand)||hand.length<2)return null;
  const singles=[...hand].sort((a,b)=>compareSingleCardPower(b,a));
  for(const s of singles){
    if(canAnyOpponentBeatSingle(s,game,seat))continue;
    const rem=[...hand];
    const idx=rem.findIndex((c)=>cardId(c)===cardId(s));
    if(idx<0)continue;
    rem.splice(idx,1);
    const ev=evaluatePlay(rem);
    if(ev.valid&&(rem.length===1||rem.length===2||rem.length===3||rem.length===5))return{s};
  }
  return null;
}
function cmpStrongPlayDesc(a,b){
  if(a.eval.count!==b.eval.count)return b.eval.count-a.eval.count;
  if(a.eval.count===5&&a.eval.kind!==b.eval.kind)return FIVE_KIND_POWER[b.eval.kind]-FIVE_KIND_POWER[a.eval.kind];
  return comparePower(b.eval.power,a.eval.power);
}
function shouldForceMaxAgainstLastCard(game,seat){
  const next=(seat+1)%4;
  return !game.gameOver&&(minOpponentCardCount(game,seat)===1);
}
function removeCardsFromHand(hand,cards){
  const drop=new Set((cards??[]).map(cardId));
  return (hand??[]).filter((c)=>!drop.has(cardId(c)));
}
function handShapeMetrics(hand){
  const cards=[...(hand??[])];
  const rankCount=new Map();
  for(const c of cards)rankCount.set(c.rank,(rankCount.get(c.rank)??0)+1);
  let pairs=0;
  let triples=0;
  let highSingles=0;
  let twos=0;
  let topTwo=0;
  for(const [rank,cnt] of rankCount.entries()){
    if(cnt>=2)pairs+=Math.floor(cnt/2);
    if(cnt>=3)triples+=1;
    if(cnt===1&&rank>=11)highSingles+=1;
    if(rank===12){
      twos+=cnt;
      const spade=cards.some((c)=>c.rank===12&&c.suit===3);
      if(spade)topTwo=1;
    }
  }
  const valid=allValidPlays(cards);
  const fives=valid.filter((p)=>p.eval.count===5).length;
  const leadOptions=valid.length;
  return{pairs,triples,fives,highSingles,twos,topTwo,leadOptions};
}
function minOpponentCardCount(game,seat){
  const players=Array.isArray(game?.players)?game.players:[];
  let min=Infinity;
  for(let i=0;i<players.length;i++){
    if(i===seat)continue;
    const cnt=Array.isArray(players[i]?.hand)?players[i].hand.length:Infinity;
    if(cnt<min)min=cnt;
  }
  return Number.isFinite(min)?min:99;
}
function hasControlCheck(hand){
  const counts=new Map();
  for(const c of hand??[])counts.set(c.rank,(counts.get(c.rank)??0)+1);
  const twos=counts.get(12)??0;
  let highPairCount=0;
  for(const [rank,n] of counts.entries()){
    if(n>=2&&rank>=9)highPairCount+=1; // Q/K/A/2
  }
  return twos>=2||highPairCount>=2;
}
function recommendPlayScore(play,ctx){
  const {hand,lastPlay,isFirstTrick,game,seat,orderedByWeak,canPass,prePlayTriples}=ctx;
  const rem=removeCardsFromHand(hand,play.cards);
  const m=handShapeMetrics(rem);
  const startLen=(hand??[]).length;
  const endLen=rem.length;
  const usedLen=play.eval.count;
  const beforeRankCount=new Map();
  for(const c of hand??[])beforeRankCount.set(c.rank,(beforeRankCount.get(c.rank)??0)+1);
  const oppMin=minOpponentCardCount(game,seat);
  const threat=oppMin<=2;
  const blitz=hasControlCheck(hand)||threat;
  const preStraights=allValidPlays(hand).filter((p)=>p.eval.kind==='straight').length;
  const postStraights=allValidPlays(rem).filter((p)=>p.eval.kind==='straight').length;
  const beforeSingles=[...beforeRankCount.values()].filter((n)=>n===1).length;
  const afterRankCount=new Map();
  for(const c of rem??[])afterRankCount.set(c.rank,(afterRankCount.get(c.rank)??0)+1);
  const afterSingles=[...afterRankCount.values()].filter((n)=>n===1).length;
  const hasMust3=play.cards.some((c)=>c.rank===0&&c.suit===0);

  let score=0;
  score+=(startLen-endLen)*48;
  score+=m.pairs*8+m.triples*10+m.fives*25;
  score-=m.highSingles*7;
  score-=m.twos*12;
  score-=m.topTwo*10;
  score+=Math.min(14,m.leadOptions*0.45);

  const maxRank=Math.max(...play.cards.map((c)=>c.rank));
  if(lastPlay){
    const idx=orderedByWeak.findIndex((x)=>x===play);
    if(idx>=0){
      if(threat){
        // Opponents are close to finishing: prefer stronger replies over conserving.
        score+=idx*5;
      }else{
        const conserve=Math.max(0,orderedByWeak.length-1-idx);
        score+=conserve*3;
      }
    }
    if(maxRank>=11&&startLen>4)score-=8;
    if(play.eval.count===1){
      const single=play.cards[0];
      const cnt=beforeRankCount.get(single.rank)??0;
      if(cnt>1&&endLen>3)score-=14;
      if(isHighestSingle(single)&&startLen>3)score-=16;
    }
  }else{
    score+=usedLen===1?-5:(usedLen===2?5:(usedLen===3?8:11));
    if(play.eval.count<5&&(hand??[]).some((c)=>c.rank===12&&c.suit===3)){
      const hasAnyFive=allValidPlays(hand).some((p)=>p.eval.count===5);
      if(hasAnyFive)score-=14;
    }
    if(maxRank>=11&&startLen>5)score-=10;
    if(play.eval.count===1&&isLowestSingle(play.cards[0]))score+=2;
    if(play.cards.some((c)=>c.rank===12))score+=blitz?12:-18;
    if(hasControlCheck(hand)&&play.cards.some((c)=>c.rank===12)&&(play.eval.count===1||play.eval.count===2))score+=10;
    if(play.eval.kind==='flush'&&(play.eval.power?.[1]??-1)===3)score+=12;
    if(threat){
      if(maxRank>=11)score+=8;
      else if(maxRank>=9)score+=4;
      if(play.eval.count===1&&isHighestSingle(play.cards[0]))score+=6;
    }
    if(play.eval.count===2){
      const twoCount=(hand??[]).filter((c)=>c.rank===12).length;
      const hasTopTwo=(hand??[]).some((c)=>c.rank===12&&c.suit===3);
      if(twoCount>=2&&hasTopTwo&&!play.cards.some((c)=>c.rank===12)){
        score+=10;
      }
    }
    if(isFirstTrick&&hasMust3){
      const isSingle=play.eval.count===1;
      const isTriple=play.eval.count===3;
      const isFive=play.eval.count===5;
      if(isSingle&&(beforeRankCount.get(0)??0)===1&&startLen>10)score+=25;
      if(afterSingles<beforeSingles)score+=15;
      if(isTriple&&play.cards.every((c)=>c.rank===0))score+=30;
      if(isFive){
        if(play.cards.some((c)=>c.rank===12||c.rank===11))score-=30;
        if(play.eval.kind==='straightflush')score-=50;
      }
    }
  }

  if(shouldForceMaxAgainstLastCard(game,seat)){
    const strongest=[...orderedByWeak].sort(cmpStrongPlayDesc)[0];
    if(strongest&&comparePower(play.eval.power,strongest.eval.power)!==0){
      score-=28;
    }else{
      score+=8;
    }
  }
  if(play.eval.kind==='fourofkind'||play.eval.kind==='fullhouse'){
    const counts=new Map();
    for(const c of play.cards)counts.set(c.rank,(counts.get(c.rank)??0)+1);
    let kickerRank=-1;
    for(const [rank,n] of counts.entries()){
      if(play.eval.kind==='fourofkind'&&n===1)kickerRank=rank;
      if(play.eval.kind==='fullhouse'&&n===2)kickerRank=rank;
    }
    if(kickerRank===12&&endLen>0)score-=28;
  }
  if(play.eval.kind==='straight'&&startLen>5){
    const hasWheelCard=play.cards.some((c)=>c.rank===12||c.rank===11);
    if(hasWheelCard)score-=25;
  }
  if(play.eval.kind==='flush'&&(play.eval.power?.[1]??-1)===3)score+=15;
  if(play.eval.count<5&&preStraights>0&&postStraights<preStraights&&endLen>0&&oppMin!==1){
    score-=22;
  }
  if(endLen<=5)score+=(5-endLen)*14;
  if(endLen===0)score+=500;
  if(endLen===1||endLen===2||endLen===3)score+=26;
  if(threat&&play.eval.count===5)score+=12;
  if(threat&&play.eval.count===1)score+=6;
  if(!canPass&&lastPlay)score+=4;
  if(play.eval.kind==='fullhouse'&&Array.isArray(prePlayTriples)){
    const counts=new Map();
    for(const c of play.cards)counts.set(c.rank,(counts.get(c.rank)??0)+1);
    let tripleRank=-1;
    let pairRank=-1;
    for(const [rank,n] of counts.entries()){
      if(n===3)tripleRank=rank;
      if(n===2)pairRank=rank;
    }
    if(pairRank>=0&&tripleRank>=0&&pairRank!==tripleRank&&prePlayTriples.includes(pairRank)){
      score-=30;
    }
  }
  return score;
}
function recommendPassScore(ctx,bestPlayScore){
  const {hand,lastPlay,isFirstTrick,canPass,game,seat}=ctx;
  if(!canPass||!lastPlay||isFirstTrick)return -Infinity;
  const len=(hand??[]).length;
  const m=handShapeMetrics(hand);
  let score=0;
  score+=m.twos*8+m.topTwo*10;
  score+=m.highSingles*5;
  score+=m.fives*2;
  if(len<=5)score-=45;
  if(len<=3)score-=70;
  if(shouldForceMaxAgainstLastCard(game,seat))score-=120;
  // If playing now is clearly beneficial, avoid passive pass recommendation.
  score-=(bestPlayScore>0?Math.min(64,bestPlayScore*0.16):0);
  return score;
}
function fullhousePairRank(play){
  if(play?.eval?.kind!=='fullhouse')return Infinity;
  const cnt=new Map();
  for(const c of play.cards??[])cnt.set(c.rank,(cnt.get(c.rank)??0)+1);
  for(const [r,n] of cnt.entries())if(n===2)return r;
  return Infinity;
}
function suggestPlay(hand,lastPlay,isFirstTrick,game){
  let legal=allValidPlays(hand);
  if(isFirstTrick)legal=legal.filter((e)=>has3d(e.cards));
  if(lastPlay)legal=legal.filter((e)=>canBeat(e.eval,lastPlay.eval));
  if(isFirstTrick&&!lastPlay){
    if(!hasControlCheck(hand)){
      const noTwos=legal.filter((e)=>!e.cards.some((c)=>c.rank===12));
      if(noTwos.length)legal=noTwos;
    }
  }
  if(!legal.length)return null;
  const seat=Number.isInteger(game?.currentSeat)?game.currentSeat:0;
  const sim=game&&Array.isArray(game.players)
    ?{
      ...game,
      isFirstTrick:Boolean(isFirstTrick),
      lastPlay:lastPlay?{...lastPlay}:null,
      gameOver:false,
      players:game.players.map((p,i)=>({...p,hand:i===seat?[...hand]:[...(p?.hand??[])]}))
    }
    :{players:[{hand:[...hand]}],currentSeat:0,lastPlay:lastPlay?{...lastPlay}:null,isFirstTrick:Boolean(isFirstTrick),gameOver:false};
  const moveKey=(p)=>`${(p?.cards??[]).map(cardId).sort().join(',')}|${String(p?.eval?.kind??'')}|${Number(p?.eval?.count??0)}`;
  const hardPick=chooseAiPlay([...hand],sim,'hard');
  const weakCmp=(a,b)=>{
    if(a.eval.count!==b.eval.count)return a.eval.count-b.eval.count;
    if(a.eval.count===5&&a.eval.kind!==b.eval.kind)return FIVE_KIND_POWER[a.eval.kind]-FIVE_KIND_POWER[b.eval.kind];
    return comparePower(a.eval.power,b.eval.power);
  };
  const byWeak=[...legal].sort(weakCmp);
  const prePlayTriples=[];
  const rankCount=new Map();
  for(const c of hand??[])rankCount.set(c.rank,(rankCount.get(c.rank)??0)+1);
  for(const [rank,n] of rankCount.entries())if(n>=3)prePlayTriples.push(rank);
  const ctx={hand:[...hand],lastPlay,isFirstTrick,game:sim,seat,orderedByWeak:byWeak,canPass:Boolean(lastPlay),prePlayTriples};
  if(hardPick&&legal.some((p)=>moveKey(p)===moveKey(hardPick))){
    hardPick.recommendScore=recommendPlayScore(hardPick,ctx);
    return hardPick;
  }
  const scoreByKey=new Map();
  const scored=[];
  for(const p of legal){
    const s=recommendPlayScore(p,ctx);
    scoreByKey.set(moveKey(p),s);
    scored.push({play:p,score:s});
  }
  if(!scored.length)return null;
  scored.sort((a,b)=>b.score-a.score||weakCmp(a.play,b.play));
  let best=scored[0]?.play??null;
  let bestScore=Number(scored[0]?.score??-Infinity);
  // When leading and opponents are not in immediate endgame threat, prefer conserving power.
  if(!lastPlay&&minOpponentCardCount(sim,seat)>2){
    const scoreMargin=12;
    const nearBest=scored.filter((x)=>x.score>=bestScore-scoreMargin);
    nearBest.sort((a,b)=>weakCmp(a.play,b.play)||b.score-a.score);
    if(nearBest[0]){
      best=nearBest[0].play;
      bestScore=nearBest[0].score;
    }
  }
  if(!lastPlay){
    const fivePlays=scored.filter((row)=>row.play.eval.count===5);
    if(fivePlays.length){
      fivePlays.sort((a,b)=>comparePower(b.play.eval.power,a.play.eval.power));
      const strongestFive=fivePlays[0];
      const scoreMargin=18;
      if(best?.eval?.count!==5&&strongestFive.score>=bestScore-scoreMargin){
        best=strongestFive.play;
        bestScore=Number(strongestFive.score??bestScore);
      }
      if(strongestFive?.play?.eval?.kind==='straightflush'&&minOpponentCardCount(sim,seat)>1){
        best=strongestFive.play;
        bestScore=Number(strongestFive.score??bestScore);
      }
    }
  }
  if(best&&best.eval.kind==='fullhouse'){
    const bestPair=fullhousePairRank(best);
    for(const row of scored){
      if(row.play.eval.kind!=='fullhouse')continue;
      if(row.score<bestScore)break;
      if(fullhousePairRank(row.play)<bestPair){
        best=row.play;
        break;
      }
    }
  }
  if(best&&!lastPlay&&!hasControlCheck(hand)){
    const usesTwo=best.cards.some((c)=>c.rank===12);
    if(usesTwo){
      const scoreMargin=10;
      const alt=scored.find((row)=>{
        if(row.score<bestScore-scoreMargin)return false;
        if(row.play.eval.count!==best.eval.count)return false;
        if(row.play.eval.kind!==best.eval.kind)return false;
        return !row.play.cards.some((c)=>c.rank===12);
      });
      if(alt){
        best=alt.play;
        bestScore=Number(alt.score??bestScore);
      }
    }
  }
  if(best)best.recommendScore=bestScore;
  return best;
}
function shouldRecommendPass(hand,lastPlay,isFirstTrick,canPass,game){
  const rec=suggestPlay(hand,lastPlay,isFirstTrick,game);
  if(!canPass||!lastPlay||isFirstTrick)return false;
  if(!rec)return true;
  const seat=Number.isInteger(game?.currentSeat)?game.currentSeat:0;
  const sim=game&&Array.isArray(game.players)
    ?{
      ...game,
      isFirstTrick:Boolean(isFirstTrick),
      lastPlay:lastPlay?{...lastPlay}:null,
      gameOver:false,
      players:game.players.map((p,i)=>({...p,hand:i===seat?[...hand]:[...(p?.hand??[])]}))
    }
    :{players:[{hand:[...hand]}],currentSeat:0,lastPlay:lastPlay?{...lastPlay}:null,isFirstTrick:Boolean(isFirstTrick),gameOver:false};
  const passCtx={hand:[...hand],lastPlay,isFirstTrick,canPass,game:sim,seat};
  const playScore=Number(rec?.recommendScore??0);
  const passScore=recommendPassScore(passCtx,playScore);
  if(minOpponentCardCount(sim,seat)<=2)return false;
  // Be conservative with pass hints when a legal play exists.
  return passScore>playScore+15;
}
function chooseAiPlay(hand,game,diff){
  let legal=legalTurnPlays(hand,game);
  if(!legal.length)return null;
  if(diff!=='easy'&&!game.lastPlay){
    const plan=forceFinishPlanPlay(hand,game,game.currentSeat);
    if(plan){
      const pick=legal.find((p)=>p.eval.count===1&&cardId(p.cards[0])===cardId(plan.s));
      if(pick)return pick;
    }
  }
  if(diff==='hard'&&shouldForceMaxAgainstLastCard(game,game.currentSeat)){
    const strongest=[...legal].sort(cmpStrongPlayDesc)[0];
    if(strongest?.eval?.count===1&&strongest.cards?.[0]?.rank===12&&hand.length>1){
      const altSingles=legal.filter((p)=>p.eval.count===1&&p.cards?.[0]?.rank!==12);
      if(altSingles.length){
        altSingles.sort(cmpStrongPlayDesc);
        return altSingles[0];
      }
    }
    return strongest;
  }
  if(diff==='normal'&&shouldForceMaxAgainstLastCard(game,game.currentSeat)&&Math.random()<0.6){
    return [...legal].sort(cmpStrongPlayDesc)[0];
  }
  if(diff==='easy'){
    const byWeak=[...legal].sort((a,b)=>comparePower(a.eval.power,b.eval.power));
    return Math.random()<0.7?byWeak[Math.floor(Math.random()*Math.min(4,byWeak.length))]:legal[Math.floor(Math.random()*legal.length)];
  }

  const rankCount=new Map();
  for(const c of hand)rankCount.set(c.rank,(rankCount.get(c.rank)??0)+1);
  const byMinPower=(a,b)=>{
    if(a.eval.count!==b.eval.count)return a.eval.count-b.eval.count;
    if(a.eval.count===5&&a.eval.kind!==b.eval.kind)return FIVE_KIND_POWER[a.eval.kind]-FIVE_KIND_POWER[b.eval.kind];
    return comparePower(a.eval.power,b.eval.power);
  };
  const byMaxPower=(a,b)=>{
    if(a.eval.count!==b.eval.count)return b.eval.count-a.eval.count;
    if(a.eval.count===5&&a.eval.kind!==b.eval.kind)return FIVE_KIND_POWER[b.eval.kind]-FIVE_KIND_POWER[a.eval.kind];
    return comparePower(a.eval.power,b.eval.power);
  };
  const preferSmallFullhousePair=(a,b)=>{
    if(a.eval.kind!=='fullhouse'||b.eval.kind!=='fullhouse')return 0;
    return fullhousePairRank(a)-fullhousePairRank(b);
  };
  const handLen=hand.length;
  const maxRank=(cards)=>Math.max(...cards.map((c)=>c.rank));
  const minRank=(cards)=>Math.min(...cards.map((c)=>c.rank));
  const leadScore=(play)=>{
    const c=play.eval.count;
    const kindBonus=c===5?FIVE_KIND_POWER[play.eval.kind]*4:0;
    const comboBase=c===5?30:c===3?20:c===2?14:4;
    const high=maxRank(play.cards);
    const low=minRank(play.cards);
    const preserveHigh=(high>=11&&handLen>5)?(c===1?12:c===2?5:2):0;
    const breakSet=(c===1&&(rankCount.get(play.cards[0].rank)??0)>1&&handLen>5)?10:0;
    const tooEarlySingle=(c===1&&handLen>8)?4:0;
    const lowSingleBonus=(c===1&&low<=5&&breakSet===0)?2:0;
    const bottomSingleBonus=(c===1&&isLowestSingle(play.cards[0]))?1:0;
    const closeoutBonus=(handLen<=5&&c>=2)?8:0;
    return comboBase+kindBonus+lowSingleBonus+bottomSingleBonus+closeoutBonus-preserveHigh-breakSet-tooEarlySingle;
  };
  const respondCost=(play)=>{
    const c=play.eval.count;
    const high=maxRank(play.cards);
    const rankDup=c===1?(rankCount.get(play.cards[0].rank)??0):0;
    let cost=0;
    if(c===1&&rankDup>1&&handLen>5)cost+=12;
    if(high>=11&&handLen>4)cost+=8;
    if(c===1&&isHighestSingle(play.cards[0])&&handLen>3)cost+=10;
    if(c===5)cost+=6;
    return cost;
  };

  if(!game.lastPlay){
    const scored=[...legal].sort((a,b)=>{
      const base=leadScore(b)-leadScore(a);
      if(base!==0)return base;
      if(diff==='hard'){
        const pairPref=preferSmallFullhousePair(a,b);
        if(pairPref!==0)return pairPref;
      }
      return byMinPower(a,b);
    });
    if(diff==='hard')return scored[0];
    // normal: keep variability while staying combo-first.
    if(Math.random()<0.2)return scored[Math.floor(Math.random()*Math.min(3,scored.length))];
    return scored[Math.floor(Math.random()*Math.min(2,scored.length))];
  }

  // Responding: win with minimal needed strength to conserve resources.
  const ordered=[...legal].sort((a,b)=>{
    const base=respondCost(a)-respondCost(b);
    if(base!==0)return base;
    if(diff==='hard'){
      const pairPref=preferSmallFullhousePair(a,b);
      if(pairPref!==0)return pairPref;
    }
    return byMinPower(a,b);
  });
  if(diff==='hard'){
    // Near endgame, spending stronger cards to keep tempo is acceptable.
    if(handLen<=4)return ordered.sort(byMaxPower)[0];
    return ordered[0];
  }
  if(Math.random()<0.18)return ordered[Math.floor(Math.random()*Math.min(3,ordered.length))];
  return ordered[0];
}
const basePenaltyByCount=(n)=>n>=13?n*3:n>=10?n*2:n;
const hasAnyTwo=(cards)=>(cards??[]).some((c)=>c.rank===12);
const hasTopTwo=(cards)=>(cards??[]).some((c)=>c.rank===12&&c.suit===3);
function chaoByRemain(remain){
  if(remain===13)return{multiplier:5,key:'scoreChaoBig'};
  if(remain===12)return{multiplier:4,key:'scoreChao4'};
  if(remain>=10&&remain<=11)return{multiplier:3,key:'scoreChao3'};
  if(remain>=8&&remain<=9)return{multiplier:2,key:'scoreChao2'};
  return{multiplier:1,key:''};
}
function calcPenaltyDetail(cards){
  const remain=(cards??[]).length;
  const base=basePenaltyByCount(remain);
  const anyTwo=hasAnyTwo(cards);
  const topTwo=hasTopTwo(cards);
  const chao=chaoByRemain(remain);
  let multiplier=1;
  if(anyTwo)multiplier*=2;
  if(topTwo)multiplier*=2;
  multiplier*=chao.multiplier;
  return{remain,base,multiplier,deduction:base*multiplier,anyTwo,topTwo,chaoMultiplier:chao.multiplier,chaoKey:chao.key};
}
const seatView=(s,self)=>(s-self+4)%4;
const botDisplay=(name,isBot)=>{if(!isBot)return name;const raw=String(name??'').trim();const m=raw.match(/(?:bot|ai)\s*([0-9]+)/i);if(!m)return raw||'Bot';const n=m[1]??'';return`Bot ${n}`.trim();};
const opponentFanStyleByName=(name)=>{
  const n=String(name??'').replace(/\s+/g,'').toLowerCase();
  const has=(...keys)=>keys.some((k)=>n.includes(k));
  if(has('小琪','milo'))return'fan-xiaoqi';
  if(has('天仔','jade'))return'fan-tinzai';
  if(has('嘉琪','kane'))return'fan-gaki';
  if(has('阿雲','axel'))return'fan-ayun';
  if(has('子晴','luna'))return'fan-ziqing';
  if(has('阿龍','nova'))return'fan-alung';
  return'';
};
const hasAnyBeatingPlay=(hand,lastPlay,isFirst)=>{if(isFirst)return allValidPlays(hand).some((e)=>has3d(e.cards));if(!lastPlay)return allValidPlays(hand).length>0;return allValidPlays(hand).some((e)=>canBeat(e.eval,lastPlay.eval));};
function randomBotProfiles(count=3,avoidNames=[]){
  const normalize=(value)=>String(value??'').trim().toLowerCase();
  const seen=new Set();
  const uniquePool=[];
  for(const entry of BOT_PROFILE_POOL){
    const key=normalize(entry?.name);
    if(!key||seen.has(key))continue;
    seen.add(key);
    uniquePool.push({name:String(entry.name),gender:entry.gender==='female'?'female':'male'});
  }
  const avoidSet=new Set(avoidNames.map(normalize));
  const filtered=uniquePool.filter((p)=>!avoidSet.has(normalize(p.name)));
  const source=filtered.length>=count?filtered:uniquePool;
  const bag=[...source];
  for(let i=bag.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [bag[i],bag[j]]=[bag[j],bag[i]];
  }
  return bag.slice(0,count).map((p)=>({name:p.name,gender:p.gender==='female'?'female':'male'}));
}
function randomBotNames(){return randomBotProfiles().map((p)=>p.name);}
function botGenderByName(name){
  const n=String(name??'').trim();
  const map=Object.fromEntries(
    BOT_PROFILE_POOL.map((p)=>[p.name,p.gender==='female'?'female':'male'])
  );
  return map[n]??(Math.random()<0.5?'female':'male');
}
function relabelSoloBots(){
  if(state.home.mode!=='solo'||!state.solo.players.length)return;
  const byProfile=Array.isArray(state.solo.botProfiles)&&state.solo.botProfiles.length===3
    ?state.solo.botProfiles.map((p)=>({name:String(p.name??''),gender:String(p.gender??'male')==='female'?'female':'male'}))
    :null;
  const byName=Array.isArray(state.solo.botNames)&&state.solo.botNames.length===3
    ?state.solo.botNames.map((name)=>({name:String(name??''),gender:botGenderByName(name)}))
    :null;
  const profiles=(byProfile??byName??randomBotProfiles()).slice(0,3);
  state.solo.botProfiles=profiles;
  state.solo.botNames=profiles.map((p)=>p.name);
  state.solo.players=state.solo.players.map((p,i)=>i===0?p:{...p,name:profiles[i-1].name,gender:profiles[i-1].gender});
}

const suitName=(s)=>['diamond','club','heart','spade'][s]??'club';
const cardImagePath=(card)=>withBase(`card-assets/${suitName(card.suit)}-${RANKS[card.rank]}.png`);
const faceRankClass=(card)=>(card.rank>=8&&card.rank<=10)?'face-jqk':'';
function renderStaticCard(card,mini=false,extra='',inlineStyle=''){return`<div class="card face ${mini?'mini':''} ${faceRankClass(card)} ${extra}"${inlineStyle?` style="${inlineStyle}"`:''}><img class="card-art" src="${cardImagePath(card)}" alt="${RANKS[card.rank]} ${SUITS[card.suit].symbol}"/></div>`;}
function renderHandCard(card,selected,extraClass='',zIndex=0){
  const draggable=isMobilePointer()?'false':'true';
  return`<button class="card face hand-card ${faceRankClass(card)} ${selected?'selected':''} ${extraClass}" draggable="${draggable}" data-card-id="${cardId(card)}" style="z-index:${zIndex};"><img class="card-art" src="${cardImagePath(card)}" alt="${RANKS[card.rank]} ${SUITS[card.suit].symbol}"/></button>`;
}
function fanNoise(seed,i,salt=''){
  const s=`${seed}|${i}|${salt}`;
  let h=2166136261;
  for(let k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619);}
  return((h>>>0)%1000)/1000;
}
function fanJitterDeg(seed,i){return((fanNoise(seed,i,'deg')*2)-1)*0.75;}
function fanGap(seed,i){return fanNoise(seed,i,'gap');}
function fanLift(seed,i){return fanNoise(seed,i,'lift');}
function renderBackCards(count,seed=''){const shown=Math.max(0,Number(count)||0);const backFile=backAssetFile(state.home.backColor);return Array.from({length:shown},(_,i)=>`<span class="card back mini closed-back" style="--i:${i};--n:${shown};--fan-jitter:${fanJitterDeg(seed,i).toFixed(3)}deg;--fan-gap:${fanGap(seed,i).toFixed(3)};--fan-lift:${fanLift(seed,i).toFixed(3)};"><img class="card-art" src="${withBase(`card-assets/${backFile}`)}" alt="back"/></span>`).join('');}
function calloutJitterStyle(viewCls,key=''){
  const seed=`${viewCls}|${key}`;
  const r=(salt)=>fanNoise(seed,0,salt);
  const xr=12;
  const yr=6;
  const size=0.64;
  const x=Math.round((r('jx')*2-1)*xr);
  const yBase=viewCls==='north'?4:2;
  const y=Math.round((r('jy')*2-1)*yr+yBase);
  const tilt=((r('tilt')*2)-1)*2.6;
  const floatDur=2.2+(r('fdur')*0.9);
  const glowDur=1.5+(r('gdur')*0.7);
  const floatAmp=4.8;
  return`--callout-jx:${x}px;--callout-jy:${y}px;--callout-size:${size.toFixed(3)};--callout-tilt:${tilt.toFixed(2)}deg;--callout-float-dur:${floatDur.toFixed(2)}s;--callout-glow-dur:${glowDur.toFixed(2)}s;--callout-float-amp:${floatAmp.toFixed(2)}px;`;
}
function openEmotePicker(open){
  state.emote.open=Boolean(open);
  render();
}
function triggerEmoteSticker(id){
  const match=EMOTE_STICKERS.find((x)=>x.id===id);
  if(!match)return;
  const now=Date.now();
  state.emote.active={id:match.id,ts:now,source:'local'};
  state.emote.open=false;
  playSound(`emote-${match.id}`);
  if(state.home.mode==='room'){
    void roomSubmitEmote(match.id,now);
  }
  if(emoteTimer){clearTimeout(emoteTimer);emoteTimer=null;}
  emoteTimer=window.setTimeout(()=>{
    if(state.emote.active&&state.emote.active.ts===now){
      state.emote.active=null;
      render();
    }
  },EMOTE_DURATION_MS);
  render();
}
function canBotEmote(seat){
  const now=Date.now();
  const last=Number(botEmoteCooldownBySeat.get(seat)||0);
  if(now-last<BOT_EMOTE_COOLDOWN_MS)return false;
  botEmoteCooldownBySeat.set(seat,now);
  return true;
}
function pickBotEmoteForAction(action,actor,play,isSelf){
  const handCount=Array.isArray(actor?.hand)?actor.hand.length:0;
  const playCount=Array.isArray(play?.cards)?play.cards.length:0;
  const remaining=action==='play'?Math.max(0,handCount-playCount):handCount;
  const kind=String(play?.eval?.kind||'');
  const isBomb=kind==='straightflush'||kind==='fourofkind';
  const isFive=playCount>=5||kind==='fullhouse'||kind==='flush'||kind==='straight';
  const playedTop2=playCount===1&&play?.cards?.[0]?.rank===12;
  if(action==='play'&&remaining===0)return isSelf?'champagne':'shock';
  if(action==='pass'){
    if(remaining<=2)return isSelf?'cry':'think';
    return isSelf?'sweat':'thumbs';
  }
  if(action==='play'){
    if(isBomb)return isSelf?'fire':'shock';
    if(isFive)return isSelf?'smash':'shock';
    if(playedTop2)return isSelf?'cool':'shock';
    if(remaining<=2)return isSelf?'think':'think';
    return isSelf?'thumbs':'think';
  }
  return'';
}
function triggerBotEmoteLocal(seat,id){
  const match=EMOTE_STICKERS.find((x)=>x.id===id);
  if(!match)return;
  const now=Date.now();
  state.emote.active={id:match.id,ts:now,source:'local',by:`seat:${seat}`};
  state.emote.open=false;
  playSound(`emote-${match.id}`);
  if(emoteTimer){clearTimeout(emoteTimer);emoteTimer=null;}
  emoteTimer=window.setTimeout(()=>{
    if(state.emote.active&&state.emote.active.ts===now){
      state.emote.active=null;
      render();
    }
  },EMOTE_DURATION_MS);
  render();
}
function pickBotReaction(game,actorSeat,action,play){
  if(Math.random()>=1/3)return null;
  const players=Array.isArray(game?.players)?game.players:[];
  const actor=players[actorSeat];
  if(!actor)return null;
  if(!actor.isHuman&&canBotEmote(actorSeat)){
    const selfEmote=pickBotEmoteForAction(action,actor,play,true);
    if(selfEmote)return{seat:actorSeat,id:selfEmote,by:String(actor?.uid||'')};
  }
  const botSeats=[];
  players.forEach((p,i)=>{if(i!==actorSeat&&p&&!p.isHuman)botSeats.push(i);});
  if(!botSeats.length)return null;
  const botSeat=botSeats[Math.floor(Math.random()*botSeats.length)];
  if(!canBotEmote(botSeat))return null;
  const emoteId=pickBotEmoteForAction(action,actor,play,false);
  if(!emoteId)return null;
  const bot=players[botSeat];
  return{seat:botSeat,id:emoteId,by:String(bot?.uid||'')};
}
function syncRoomEmote(roomData){
  const raw=roomData?.game?.emote ?? roomData?.emote;
  if(!raw||typeof raw!=='object'){
    if(state.emote.active?.source==='room'){
      state.emote.active=null;
      render();
    }
    return;
  }
  const id=String(raw.id||'').trim();
  const ts=Number(raw.ts||0);
  if(!id||!Number.isFinite(ts)){
    if(state.emote.active?.source==='room'){
      state.emote.active=null;
      render();
    }
    return;
  }
  const age=Date.now()-ts;
  if(age>EMOTE_DURATION_MS){
    if(state.emote.active?.source==='room'&&state.emote.active.ts===ts){
      state.emote.active=null;
      render();
    }
    return;
  }
  const current=state.emote.active;
  if(current&&current.id===id&&current.ts===ts){
    if(current.source==='local')return;
    if(current.source==='room')return;
  }
  state.emote.active={id,ts,source:'room',by:String(raw.by||'')};
  state.emote.open=false;
  if(emoteTimer){clearTimeout(emoteTimer);emoteTimer=null;}
  const remaining=Math.max(0,EMOTE_DURATION_MS-age);
  emoteTimer=window.setTimeout(()=>{
    if(state.emote.active&&state.emote.active.ts===ts&&state.emote.active.source==='room'){
      state.emote.active=null;
      render();
    }
  },remaining);
  if(String(raw.by||'')!==currentRoomPlayerId()){
    playSound(`emote-${id}`);
  }
  render();
}
function newCalloutNonce(){
  return`${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;
}
function clearCalloutStates(except=''){
  if(except!=='play'){
    if(playTypeCallTimer){clearTimeout(playTypeCallTimer);playTypeCallTimer=null;}
    playTypeCallState.until=0;
    playTypeCallState.startedAt=0;
    playTypeCallState.nonce='';
    playTypeCallState.historyLen=0;
  }
  if(except!=='pass'){
    if(passCallTimer){clearTimeout(passCallTimer);passCallTimer=null;}
    passCallState.until=0;
    passCallState.startedAt=0;
    passCallState.nonce='';
    passCallState.historyLen=0;
  }
  if(except!=='last'){
    if(lastCardCallTimer){clearTimeout(lastCardCallTimer);lastCardCallTimer=null;}
    lastCardCallState.text='';
    lastCardCallState.until=0;
    lastCardCallState.startedAt=0;
    lastCardCallState.nonce='';
    lastCardCallState.historyLen=0;
  }
  if(except!=='must3'){
    must3CallState.key='';
    must3CallState.text='';
    must3CallState.until=0;
    must3CallState.startedAt=0;
    must3CallState.nonce='';
  }
}
function lockTurnProgress(ms=0){
  const hold=Math.max(0,Number(ms)||0);
  if(!hold)return;
  turnLockUntil=Math.max(turnLockUntil,Date.now()+hold);
}

function reorderById(arr,fromId,toId,idFn){if(!fromId||!toId||fromId===toId)return arr;const copy=[...arr];const fi=copy.findIndex((x)=>idFn(x)===fromId),ti=copy.findIndex((x)=>idFn(x)===toId);if(fi<0||ti<0)return arr;const[m]=copy.splice(fi,1);copy.splice(ti,0,m);return copy;}
function patternSortCards(hand){return[...hand].sort((a,b)=>b.suit-a.suit||a.rank-b.rank);}

function triggerMust3LeadCallout(game,selfSeat=0){
  must3CallState.key='';
  must3CallState.text='';
  must3CallState.until=0;
  must3CallState.startedAt=0;
  must3CallState.nonce='';
  if(!game||!Array.isArray(game.players)||!game.players.length)return;
  const seatIndex=Number.isInteger(selfSeat)&&selfSeat>=0?selfSeat:0;
  const human=game.players[seatIndex];
  if(!human||!Array.isArray(human.hand)||!has3d(human.hand))return;
  const opponents=game.players.map((p,i)=>({player:p,seat:i})).filter((x)=>!x.player?.isHuman&&x.seat!==seatIndex);
  if(!opponents.length)return;
  const pick=opponents[Math.floor(Math.random()*opponents.length)];
  const text='階磚3出先';
  const now=Date.now();
  must3CallState.key=`must3-${now}-${pick.seat}`;
  must3CallState.seat=pick.seat;
  must3CallState.text=text;
  must3CallState.until=now+2400;
  must3CallState.startedAt=now;
  must3CallState.nonce=newCalloutNonce();
  scheduleCalloutExpiry(must3CallState.until);
  speakCallout(text,pick.player?.gender??'male',{seat:pick.seat,force:true,clipKey:'line-must3'});
}
function startSoloGame(){randomizeNpcColors();const botProfiles=randomBotProfiles();const p=[{name:state.home.name||t('name'),gender:state.home.gender==='female'?'female':'male',hand:[],isHuman:true},{name:botProfiles[0].name,gender:botProfiles[0].gender,hand:[],isHuman:false},{name:botProfiles[1].name,gender:botProfiles[1].gender,hand:[],isHuman:false},{name:botProfiles[2].name,gender:botProfiles[2].gender,hand:[],isHuman:false}];const deck=shuffle(createDeck());p.forEach((x)=>{x.hand=deck.splice(0,13).sort(cmpCard);});const start=p.findIndex((x)=>x.hand.some((c)=>c.rank===0&&c.suit===0));const totals=Array.isArray(state.solo.totals)&&state.solo.totals.length===4?[...state.solo.totals]:[5000,5000,5000,5000];state.solo={players:p,botProfiles:botProfiles.map((bp)=>({name:bp.name,gender:bp.gender})),botNames:botProfiles.map((bp)=>bp.name),totals,currentSeat:start,lastPlay:null,passStreak:0,isFirstTrick:true,gameOver:false,status:'',systemLog:[],history:[],aiDifficulty:state.home.aiDifficulty,lastCardBreach:null,roundSummary:null};setSoloStatus(`${p[start].name} ${t('start')}`);state.selected.clear();state.recommendation=null;state.logTouched=false;state.showLog=false;state.screen='game';state.home.mode='solo';state.home.showIntro=false;state.home.showLeaderboard=false;state.showScoreGuide=false;calloutGateUntilPlay=true;playSound('start');triggerMust3LeadCallout(state.solo,0);render();maybeRunSoloAi();}
function startRoomLocalGame(roomData){
  randomizeNpcColors();
  const uid=currentRoomPlayerId();
  const roster=Array.isArray(roomData?.players)?roomData.players:[];
  const selfEntry=roster.find((p)=>String(p.uid)===uid);
  const others=roster.filter((p)=>String(p.uid)!==uid).sort((a,b)=>Number(a.seat)-Number(b.seat));
  const botProfiles=randomBotProfiles();
  const p=[];
  p.push({name:String(selfEntry?.name??state.home.name??'Player'),gender:state.home.gender==='female'?'female':'male',hand:[],isHuman:true});
  for(let i=0;i<3;i++){
    const o=others[i];
    if(o){
      p.push({name:String(o.name??`Player ${i+2}`),gender:'male',hand:[],isHuman:false});
    }else{
      const bp=botProfiles[i];
      p.push({name:bp.name,gender:bp.gender,hand:[],isHuman:false});
    }
  }
  const deck=shuffle(createDeck());
  p.forEach((x)=>{x.hand=deck.splice(0,13).sort(cmpCard);});
  const start=p.findIndex((x)=>x.hand.some((c)=>c.rank===0&&c.suit===0));
  const totals=Array.isArray(state.solo.totals)&&state.solo.totals.length===4?[...state.solo.totals]:[5000,5000,5000,5000];
  state.solo={players:p,botProfiles:botProfiles.map((bp)=>({name:bp.name,gender:bp.gender})),botNames:p.slice(1).map((bp)=>bp.name),totals,currentSeat:start,lastPlay:null,passStreak:0,isFirstTrick:true,gameOver:false,status:'',systemLog:[],history:[],aiDifficulty:state.home.aiDifficulty,lastCardBreach:null,roundSummary:null};
  setSoloStatus(`${p[start].name} ${t('start')}`);
  state.selected.clear();
  state.recommendation=null;
  state.logTouched=false;
  state.showLog=false;
  state.screen='game';
  state.home.mode='room';
  state.home.showIntro=false;
  state.home.showLeaderboard=false;
  state.showScoreGuide=false;
  calloutGateUntilPlay=true;
  playSound('start');
  triggerMust3LeadCallout(state.solo,state.room.selfSeat);
  render();
  maybeRunRoomAi();
}

function soloApplyPlay(seat,cards){const g=state.solo;const ev=evaluatePlay(cards);if(!ev.valid){if(seat===0)setSoloStatus(ev.reason);return false;}if(g.isFirstTrick&&!has3d(cards)){if(seat===0)setSoloStatus(t('must3'));return false;}if(g.lastPlay&&!canBeat(ev,g.lastPlay.eval)){if(seat===0)setSoloStatus(t('beat'));return false;}
  if(shouldForceMaxAgainstLastCard(g,seat)){
    const legal=legalTurnPlays(g.players[seat].hand,g).sort(cmpStrongPlayDesc);
    const strongest=legal[0];
    const chosen=legal.find((x)=>x.eval.count===ev.count&&x.eval.kind===ev.kind&&comparePower(x.eval.power,ev.power)===0);
    if(chosen&&strongest&&comparePower(chosen.eval.power,strongest.eval.power)!==0){
      g.lastCardBreach={seat,threatenedSeat:(seat+1)%4};
    }
  }
  const ids=new Set(cards.map(cardId));g.players[seat].hand=g.players[seat].hand.filter((c)=>!ids.has(cardId(c)));g.lastPlay={seat,eval:ev,cards:ev.sorted};g.passStreak=0;g.isFirstTrick=false;g.history.push({action:'play',seat,name:g.players[seat].name,cards:ev.sorted,kind:ev.kind,ts:Date.now()});
  if(g.players[seat].hand.length===0){
    lockTurnProgress(900);
    g.gameOver=true;
    const details=g.players.map((p,i)=>i===seat?{remain:0,base:0,multiplier:1,deduction:0,anyTwo:false,topTwo:false,chaoMultiplier:1,chaoKey:''}:calcPenaltyDetail(p.hand));
    let deductions=details.map((d)=>d.deduction);
    if(g.lastCardBreach&&seat===g.lastCardBreach.threatenedSeat){
      const violator=g.lastCardBreach.seat;
      const transferred=deductions.reduce((sum,v)=>sum+v,0);
      deductions=deductions.map((v,i)=>i===violator?transferred:0);
    }
    const winnerGain=deductions.reduce((sum,v)=>sum+v,0);
    g.roundSummary={winnerSeat:seat,deductions:[...deductions],winnerGain,details,lastCardBreach:g.lastCardBreach?{...g.lastCardBreach}:null};
  g.totals=(g.totals??[5000,5000,5000,5000]).map((s,i)=>s+(i===seat?winnerGain:-deductions[i]));
  const remain=g.players.map((p,i)=>`${p.name}:${deductions[i]}`).join(' / ');
  setSoloStatus(`${g.players[seat].name} ${t('wins')} ${t('penalty')}:${remain}`);
  const deltas=g.players.map((_,i)=>i===seat?winnerGain:-deductions[i]);
  g.players.forEach((p,i)=>{
    const identity=p.isHuman?currentLeaderboardIdentity():botLeaderboardIdentity(p.name,p.gender);
    void recordLeaderboardRound(identity,deltas[i],i===seat);
  });
  playSound('win');
  {const wc=buildWinnerCalloutForSeat(g,seat);playWinSfxThen(()=>{void playWinnerCallout(wc,g.players[seat]?.gender??'male',seat);},2200);}
  return true;
  }
  if(g.lastCardBreach&&seat===g.lastCardBreach.threatenedSeat)g.lastCardBreach=null;
  lockTurnProgress(900);
  g.currentSeat=(seat+1)%4;setSoloStatus(`${g.players[seat].name} ${t('played')} ${kindLabel(ev.kind)}.`,{appendLog:false});playSound('play');
  const reaction=pickBotReaction(g,seat,'play',{cards:ev.sorted,eval:ev});
  if(reaction)triggerBotEmoteLocal(reaction.seat,reaction.id);
  return true;}
function soloPass(seat){const g=state.solo;if(!g.lastPlay){if(seat===0)setSoloStatus(t('cantPass'));return false;}g.passStreak+=1;g.history.push({action:'pass',seat,name:g.players[seat].name,ts:Date.now()});if(g.lastCardBreach&&seat===g.lastCardBreach.threatenedSeat)g.lastCardBreach=null;lockTurnProgress(850);if(g.passStreak>=3){const lead=g.lastPlay.seat;g.currentSeat=lead;g.lastPlay=null;g.passStreak=0;setSoloStatus(`${g.players[lead].name} ${t('retake')}`);playSound('pass');return true;}g.currentSeat=(seat+1)%4;setSoloStatus(`${g.players[seat].name} ${t('pass')}.`,{appendLog:false});playSound('pass');const reaction=pickBotReaction(g,seat,'pass',null);if(reaction)triggerBotEmoteLocal(reaction.seat,reaction.id);return true;}
function maybeRunSoloAi(){
  if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}
  if(state.home.mode!=='solo')return;
  const g=state.solo;
  const current=g?.players?.[g?.currentSeat];
  if(!g||g.gameOver||!current||current.isHuman)return;
  const now=Date.now();
  // iOS Safari can occasionally miss speech onend/onerror; force-release stale speech lock.
  if(calloutSpeechActive&&calloutSpeechUntil>0&&now>calloutSpeechUntil+800){
    calloutSpeechActive=false;
    calloutSpeechUntil=0;
    calloutSpeechEndedAt=now;
    try{window.speechSynthesis?.cancel?.();}catch{}
  }
  const turnLockRemaining=Math.max(0,turnLockUntil-now);
  const remaining=Math.max(0,calloutSpeechUntil-Date.now());
  const afterCallout=calloutResumePending;
  if(afterCallout)calloutResumePending=false;
  const DEFAULT_AI_DELAY_MS=350;
  const POST_CALLOUT_DELAY_MS=320;
  const MIN_AI_DELAY_MS=250;
  const wait=(calloutSpeechActive||remaining>0||turnLockRemaining>0)
    ?Math.max(MIN_AI_DELAY_MS,remaining,turnLockRemaining)
    :afterCallout?POST_CALLOUT_DELAY_MS:DEFAULT_AI_DELAY_MS;
  aiTimer=window.setTimeout(()=>{
    try{
      const tickNow=Date.now();
      if(calloutSpeechActive&&calloutSpeechUntil>0&&tickNow>calloutSpeechUntil+800){
        calloutSpeechActive=false;
        calloutSpeechUntil=0;
        calloutSpeechEndedAt=tickNow;
        try{window.speechSynthesis?.cancel?.();}catch{}
      }
      if(calloutSpeechActive||tickNow<calloutSpeechUntil){
        maybeRunSoloAi();
        return;
      }
      if(tickNow<turnLockUntil){
        maybeRunSoloAi();
        return;
      }
      const live=state.solo;
      const seat=live?.currentSeat;
      const actor=live?.players?.[seat];
      if(!live||live.gameOver||!actor||actor.isHuman)return;
      const ch=chooseAiPlay(actor.hand,live,live.aiDifficulty);
      if(!ch)soloPass(seat);else soloApplyPlay(seat,ch.cards);
      render();
    }catch(err){
      console.error('AI turn tick failed',err);
    }finally{
      maybeRunSoloAi();
    }
  },wait);
}

function unlockAudio(){
  try{
    if(sound.enabled){
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(AudioCtx){
        if(!sound.ctx){
          sound.ctx=new AudioCtx();
        }
        if(sound.ctx?.state==='suspended'){
          sound.ctx.resume?.().catch(()=>{});
        }
        // iOS Safari often needs a real node start/stop in a user gesture to unlock playback.
        if(sound.ctx?.state==='running'){
          try{
            const c=sound.ctx;
            const o=c.createOscillator();
            const g=c.createGain();
            g.gain.value=0.00001;
            o.connect(g);
            g.connect(c.destination);
            const t=c.currentTime;
            o.start(t);
            o.stop(t+0.01);
          }catch{}
        }
      }
    }
    // iOS Safari: prime a single HTMLAudio element during user gesture so recorded clips can play later.
    try{
      if(isIOSDevice()){
        if(!iosSharedCalloutAudio){
          iosSharedCalloutAudio=new Audio();
          iosSharedCalloutAudio.preload='auto';
          iosSharedCalloutAudio.playsInline=true;
          iosSharedCalloutAudio.setAttribute?.('playsinline','');
        }
        const a=iosSharedCalloutAudio;
        if(!a.src)a.src=withBase('audio/silence.mp3');
        const prevVolume=Number.isFinite(a.volume)?a.volume:1;
        a.muted=false;
        a.volume=0;
        const p=a.play?.();
        if(p?.then){
          p.then(()=>{
            try{a.pause?.();a.currentTime=0;}catch{}
            a.volume=prevVolume;
          }).catch(()=>{a.volume=prevVolume;});
        }else{
          a.volume=prevVolume;
        }
      }
    }catch{}
  }catch{
    // Keep user preference unchanged even if runtime audio context cannot initialize.
  }
}
function primeSpeech(){
  try{
    if(isIOSDevice())return;
    const synth=window.speechSynthesis;
    if(!synth)return;
    synth.getVoices?.();
    speechPrimed=true;
  }catch{}
}
function isAudioReady(){
  return Boolean(sound.enabled&&sound.ctx&&sound.ctx.state==='running');
}
function isSpeechReady(){
  try{
    if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance==='undefined')return false;
    const voices=window.speechSynthesis.getVoices?.()??[];
    return voices.length>0;
  }catch{
    return false;
  }
}
function runtimeDiagnosticsText(){
  const zh=state.language==='zh-HK';
  const audio=isAudioReady()?(zh?'已啟用':'Ready'):(zh?'未啟用':'Off');
  const speech=isSpeechReady()?(zh?'可用':'Ready'):(zh?'不可用':'Unavailable');
  return zh?`診斷: 音效 ${audio} | 報牌語音 ${speech}`:`Diag: Audio ${audio} | Callout Speech ${speech}`;
}
function currentSfxDuckFactor(){
  const now=Date.now();
  return (calloutSpeechActive||now<calloutSpeechUntil+250)?0.45:1;
}
function playTone(freq,d,type='sine',g=0.03,delay=0){
  if(!sound.ctx)return;
  const c=sound.ctx,o=c.createOscillator(),a=c.createGain();
  const duck=currentSfxDuckFactor();
  o.type=type;
  o.frequency.value=freq;
  a.gain.value=g*duck;
  o.connect(a);
  a.connect(c.destination);
  const now=c.currentTime+delay;
  o.start(now);
  a.gain.exponentialRampToValueAtTime(0.0001,now+d);
  o.stop(now+d);
}
function playSound(kind){
  if(!sound.enabled)return;
  unlockAudio();
  if(!sound.ctx)return;
  if(sound.ctx.state==='suspended'){
    sound.ctx.resume?.().catch(()=>{});
  }
  if(kind==='win-sfx'){
    try{
      if(!winSfxAudio){
        winSfxAudio=new Audio(withBase('audio/sfx/win.mp3'));
        winSfxAudio.preload='auto';
        winSfxAudio.playsInline=true;
        winSfxAudio.setAttribute?.('playsinline','');
      }
      const base=winSfxAudio;
      const useClone=base && !base.paused && !base.ended;
      const a=useClone ? base.cloneNode(true) : base;
      if(a!==base){
        a.src=base.src;
        a.preload='auto';
        a.playsInline=true;
        a.setAttribute?.('playsinline','');
      }
      a.volume=0.4*currentSfxDuckFactor();
      a.currentTime=0;
      void a.play();
      if(a!==base){
        a.addEventListener?.('ended',()=>{try{a.src='';}catch{}},{once:true});
      }
    }catch{}
    return;
  }
  if(kind==='select')playTone(520,0.08,'triangle',0.02);
  if(kind==='play'){playTone(330,0.11,'square',0.03);playTone(490,0.12,'triangle',0.02,0.03);}
  if(kind==='pass')playTone(210,0.1,'sine',0.02);
  // Make last-card ring clearly audible on mobile speakers (including iOS).
  if(kind==='last'){
    playTone(640,0.16,'triangle',0.065);
    playTone(960,0.18,'triangle',0.06,0.12);
    playTone(1280,0.2,'triangle',0.055,0.24);
  }
  if(kind==='start'){playTone(330,0.1,'triangle',0.025);playTone(495,0.12,'triangle',0.025,0.05);}
  if(kind==='congrats'){
    playTone(392,0.18,'triangle',0.05);
    playTone(494,0.2,'triangle',0.05,0.08);
    playTone(587,0.22,'triangle',0.05,0.16);
    playTone(784,0.24,'triangle',0.048,0.24);
    playTone(988,0.26,'triangle',0.046,0.34);
    playTone(1175,0.28,'triangle',0.044,0.46);
  }
  if(kind==='win'){playTone(392,0.13,'triangle',0.03);playTone(523,0.14,'triangle',0.03,0.06);playTone(659,0.2,'triangle',0.03,0.12);}
  if(kind==='emote-cool'){playTone(520,0.09,'triangle',0.025);playTone(780,0.12,'triangle',0.02,0.05);}
  if(kind==='emote-throw'){playTone(680,0.08,'square',0.03);playTone(240,0.12,'sine',0.025,0.06);}
  if(kind==='emote-rude'){playTone(260,0.06,'square',0.035);playTone(260,0.06,'square',0.035,0.08);playTone(260,0.06,'square',0.035,0.16);}
  if(kind==='emote-sweat'){playTone(420,0.1,'triangle',0.02);playTone(560,0.12,'triangle',0.02,0.06);}
  if(kind==='emote-rage'){playTone(180,0.08,'sawtooth',0.04);playTone(160,0.1,'square',0.04,0.06);}
  if(kind==='emote-smash'){playTone(140,0.12,'square',0.045);playTone(90,0.14,'sine',0.04,0.08);}
  if(kind==='emote-fire'){playTone(720,0.06,'triangle',0.02);playTone(620,0.06,'triangle',0.02,0.07);playTone(820,0.08,'triangle',0.02,0.14);}
  if(kind==='emote-think'){playTone(520,0.07,'triangle',0.02);playTone(390,0.09,'triangle',0.02,0.05);}
  if(kind==='emote-cry'){playTone(320,0.12,'sine',0.025);playTone(260,0.14,'triangle',0.02,0.08);}
  if(kind==='emote-cheers'){playTone(660,0.12,'triangle',0.03);playTone(880,0.12,'triangle',0.03,0.05);}
  if(kind==='emote-thumbs'){playTone(520,0.08,'triangle',0.025);playTone(660,0.1,'triangle',0.02,0.06);}
  if(kind==='emote-crack'){playTone(160,0.09,'square',0.04);playTone(120,0.1,'square',0.04,0.05);}
  if(kind==='emote-sleep'){playTone(240,0.1,'sine',0.02);playTone(200,0.12,'sine',0.02,0.06);}
  if(kind==='emote-love'){playTone(520,0.09,'triangle',0.02);playTone(620,0.11,'triangle',0.02,0.05);}
}
function playWinSfxThen(fn,delayFallback=2000){
  const seq=++winSfxSeq;
  let done=false;
  const fire=()=>{
    if(done||seq!==winSfxSeq)return;
    done=true;
    fn?.();
  };
  playSound('win-sfx');
  if(winSfxAudio){
    try{
      winSfxAudio.onended=fire;
    }catch{}
  }
  window.setTimeout(fire,delayFallback);
}
function applyTheme(){const theme=THEMES[state.home.theme]??THEMES.ocean;const root=document.documentElement;for(const[k,v]of Object.entries(theme))root.style.setProperty(k,v);}

function buildView(){
  const g=state.solo;
  if(!g||!Array.isArray(g.players)||!g.players.length)return null;
  const mode=state.home.mode==='room'?'room':'solo';
  const selfSeat=mode==='room'&&(Number.isInteger(state.room.selfSeat))?state.room.selfSeat:0;
  const seatIndex=Number.isInteger(selfSeat)&&selfSeat>=0?selfSeat:0;
  const selfPlayer=g.players[seatIndex]??g.players[0];
  return{
    mode,
    currentSeat:g.currentSeat,
    lastPlay:g.lastPlay,
    gameOver:g.gameOver,
    isFirstTrick:g.isFirstTrick,
    status:g.status,
    systemLog:g.systemLog??[],
    participants:g.players.map((p,seat)=>({seat,name:p.name,gender:p.gender??'male',picture:p.picture??'',isBot:!p.isHuman,count:p.hand.length,score:g.totals?.[seat]??0})),
    hand:selfPlayer?.hand??[],
    history:g.history,
    selfSeat:seatIndex,
    canControl:!g.gameOver&&g.currentSeat===seatIndex,
    canPass:!g.gameOver&&g.currentSeat===seatIndex&&Boolean(g.lastPlay),
    revealedHands:g.gameOver?g.players.map((p)=>[...p.hand]):null,
    roundSummary:g.roundSummary??null
  };
}

function formatGameLogDateTime(ts){
  const n=Number(ts)||0;
  if(!n)return'';
  try{
    const locale=state.language==='en'?'en-US':'zh-HK';
    const d=new Date(n);
    const time=d.toLocaleTimeString(locale,{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
    return time;
  }catch{
    return'';
  }
}
function formatSystemLogDateTime(ts){
  const n=Number(ts)||0;
  if(!n)return'';
  try{
    const locale=state.language==='en'?'en-US':'zh-HK';
    const d=new Date(n);
    const time=d.toLocaleTimeString(locale,{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
    return time;
  }catch{
    return'';
  }
}
function gameLogCardText(cards){
  return(cards??[]).map((c)=>`${SUITS[c.suit]?.symbol??''}${RANKS[c.rank]??''}`).join('');
}
function gameLogDetailText(e){
  const zh=state.language==='zh-HK';
  if(e.action==='pass')return zh?'本回合選擇過牌。':'Passed this turn.';
  const cards=e.cards??[];
  const kind=kindLabel(e.kind);
  const cardText=gameLogCardText(cards);
  if(zh)return`出牌：${kind}(${cards.length}張)${cardText?`(${cardText})`:''}`;
  return`Played: ${kind} (${cards.length} cards)${cardText?` (${cardText})`:''}`;
}
function historyHtml(h,self,systemLog=[]){
  const items=[];
  let seq=0;
  for(const e of (h??[])){
    const vIdx=seatView(e.seat,self);
    const cls=seatCls[vIdx]||'south';
    const color=playerColorByViewClass(cls);
    const timeText=formatGameLogDateTime(e.ts);
    const detail=gameLogDetailText(e);
    const tag=`<span class="player-color-chip" style="--player-color:${color};"></span><span class="history-name">${esc(e.name)}</span>`;
    if(e.action==='pass'){
      items.push({ts:Number(e.ts)||0,seq:seq++,html:`<div class="history-item"><div class="history-head"><div class="history-title">${tag}</div>${timeText?`<div class="history-time">${esc(timeText)}</div>`:''}</div><div class="history-detail">${esc(detail)}</div></div>`});
      continue;
    }
    const cards=(e.cards??[]).map((c)=>renderStaticCard(c,true)).join('');
    items.push({ts:Number(e.ts)||0,seq:seq++,html:`<div class="history-item"><div class="history-head"><div class="history-title">${tag}</div>${timeText?`<div class="history-time">${esc(timeText)}</div>`:''}</div><div class="history-detail-row"><div class="history-detail">${esc(detail)}</div><div class="history-cards">${cards}</div></div></div>`});
  }
  const sysEntries=(systemLog??[]).map((x)=>typeof x==='string'?{text:x,ts:0}:{text:String(x?.text??''),ts:Number(x?.ts)||0}).filter((x)=>x.text.trim());
  for(const s of sysEntries){
    const timeText=formatSystemLogDateTime(s.ts);
    items.push({ts:Number(s.ts)||0,seq:seq++,html:`<div class="history-item"><div class="history-head"><div class="history-meta history-system-line">${esc(s.text)}</div>${timeText?`<div class="history-time">${esc(timeText)}</div>`:''}</div></div>`});
  }
  const entries=items.sort((a,b)=>(b.ts-a.ts)||(b.seq-a.seq)).map((x)=>x.html);
  if(!entries.length)return`<div class="hint">${t('nolog')}</div>`;
  return entries.join('');
}
function isStatusDuplicatedByHistory(v){
  const h=v.history??[];
  if(!h.length)return false;
  const s=String(v.status??'');
  if(!s)return false;
  const last=h[h.length-1];
  if(!last||!last.name)return false;
  if(last.action==='pass'){
    return s.includes(last.name)&&(s.includes(t('pass'))||/pass/i.test(s));
  }
  if(last.action==='play'){
    const hasPlayedToken=s.includes(t('played'))||/played/i.test(s);
    return s.includes(last.name)&&hasPlayedToken;
  }
  return false;
}
function roomCountdownText(roomData){
  const game=roomData?.game;
  if(!game||game.gameOver)return'-';
  const startedAt=Number(game.turnStartedAt)||0;
  if(!startedAt)return'-';
  const timeout=getRoomTurnTimeout(roomData);
  const remain=Math.max(0,timeout-(Date.now()-startedAt));
  return`${Math.ceil(remain/1000)}s`;
}
function roomCenterMetaHtml(roomData){
  if(!roomData)return'';
  const baseRound=Number(roomData.roundCount||0);
  const status=String(roomData.status||'');
  const round=baseRound+(status==='playing'||status==='starting'?1:0);
  const countdown=roomCountdownText(roomData);
  return`<div class="room-center-meta">
    <div class="room-center-row"><span>${t('roomRound')}</span><strong>${Number.isFinite(round)?round:'-'}</strong></div>
    <div class="room-center-row"><span>${t('roomCountdown')}</span><strong id="room-countdown-value">${esc(countdown)}</strong></div>
  </div>`;
}
function addRoomSystemLog(game,text){
  if(!game||!text)return;
  if(!Array.isArray(game.systemLog))game.systemLog=[];
  const last=game.systemLog[game.systemLog.length-1];
  if(last&&String(last.text||'')===text)return;
  game.systemLog.push({text,ts:Date.now()});
  if(game.systemLog.length>200)game.systemLog=game.systemLog.slice(-200);
}
function centerMovesHtml(v){
  const felt='border:1px solid rgba(220,245,226,.34) !important;background:radial-gradient(circle at 24% 20%, rgba(170,230,190,.18), transparent 38%),radial-gradient(circle at 78% 74%, rgba(98,165,126,.16), transparent 40%),linear-gradient(165deg, #1f6b43 0%, #185938 58%, #12492f 100%) !important;box-shadow:inset 0 0 0 1px rgba(8,25,42,.45) !important;border-radius:12px !important;';
  const roomMeta='';
  return`<div class="table-center-grid-wrap" style="${felt}">${roomMeta}</div>`;
}
function seatShortByViewClass(cls){
  const zh=state.language==='zh-HK';
  if(cls==='north')return zh?'北':'N';
  if(cls==='east')return zh?'東':'E';
  if(cls==='west')return zh?'西':'W';
  return zh?'南':'S';
}
function mobileDiscardPanelHtml(history,selfSeat,arr){
  const logs=(history??[]).slice(-8).reverse();
  if(!logs.length)return`<div class="mobile-discard-panel"><div class="mobile-discard-title title-with-icon"><span class="title-icon title-icon-log" aria-hidden="true"></span><span>${t('log')}</span></div><div class="hint">${t('nolog')}</div></div>`;
  void arr;
  const rows=logs.map((e)=>{
    const vIdx=seatView(e.seat,selfSeat);
    const cls=seatCls[vIdx]||'south';
    const color=playerColorByViewClass(cls);
    const timeText=formatGameLogDateTime(e.ts);
    if(e.action==='pass'){
      return`<div class="mobile-discard-row" style="--player-color:${color};"><div class="mobile-discard-head">${timeText?`<span class="mobile-discard-time">${esc(timeText)}</span>`:''}</div><div class="mobile-discard-pass">${t('pass')}</div></div>`;
    }
    const cards=(e.cards??[]).map((c)=>renderStaticCard(c,true)).join('');
    return`<div class="mobile-discard-row" style="--player-color:${color};"><div class="mobile-discard-head">${timeText?`<span class="mobile-discard-time">${esc(timeText)}</span>`:''}<span class="mobile-discard-name">${kindLabel(e.kind)}</span></div><div class="mobile-discard-cards">${cards}</div></div>`;
  }).join('');
  return`<div class="mobile-discard-panel"><div class="mobile-discard-title title-with-icon"><span class="title-icon title-icon-log" aria-hidden="true"></span><span>${t('log')}</span></div>${rows}</div>`;
}
function centerMobileOpponentNamesHtml(arr,currentSeat,gameOver){
  const others=(arr??[]).filter((p)=>p.viewIndex!==0);
  if(!others.length)return'';
  return`<div class="mobile-opponent-names">${others.map((p)=>{
    const avatarSrc=avatarDataUri(p.name,playerColorByViewClass(p.cls),p.gender,p.isBot);
    const botNameAttr=p.isBot?` data-bot-name="${esc(p.name)}"`:'';
    const opponentAttr=p.isBot?` data-opponent-name="${esc(p.name)}"`:'';
    return`<span class="mobile-opponent-name ${(!gameOver&&currentSeat===p.seat)?'active':''}" style="--player-color:${playerColorByViewClass(p.cls)};"${opponentAttr}><img class="player-avatar mini" src="${avatarSrc}" alt="${esc(p.name)}"${botNameAttr}/><span class="seat-name-text">${esc(p.name)}</span><span class="mobile-seat-tag">${seatShortByViewClass(p.cls)}</span></span>`;
  }).join('')}</div>`;
}
function lastActionBySeat(h){
  const out=new Map();
  for(const e of h??[]){
    if(e.action==='play'&&Array.isArray(e.cards)&&e.cards.length){out.set(e.seat,{type:'play',cards:[...e.cards]});continue;}
    if(e.action==='pass')out.set(e.seat,{type:'pass'});
  }
  return out;
}
function seatLastActionHtml(action){
  if(!action)return'';
  if(action.type==='pass')return`<div class="seat-played seat-played-pass"><span class="seat-pass-label"><span class="seat-pass-icon" aria-hidden="true"></span><span class="seat-pass-text">${t('pass')}</span></span></div>`;
  const ts=Number(action.ts)||0;
  const list=action.cards??[];
  const isFive=list.length===5;
  const sizeStyle='width:var(--discard-card-w, calc(var(--card-w) * var(--hand-card-scale) * var(--card-scale))) !important;height:var(--discard-card-h, calc(var(--card-h) * var(--hand-card-scale) * var(--card-scale))) !important;';
  const cards=list.map((c,i)=>{
    if(isFive){
      const mid=(list.length-1)/2;
      const offset=i-mid;
      const rot=offset*8;
      const lift=Math.abs(offset)*3.2;
      return renderStaticCard(c,true,'discard-card',`${sizeStyle}transform:rotate(${rot.toFixed(2)}deg) translateY(${lift.toFixed(2)}px);`);
    }
    const rot=((fanNoise(`${action.seat}|${ts}|${cardId(c)}`,i,'played')*2)-1)*8.84;
    return renderStaticCard(c,true,'discard-card',`${sizeStyle}transform:rotate(${rot.toFixed(2)}deg);`);
  }).join('');
  return`<div class="seat-played${isFive?' seat-played-fan':''}">${cards}</div>`;
}
function centerLastMovesHtml(lastActions,selfSeat){
  const slots=['north','west','east','south'];
  return slots.map((cls)=>{
    const seat=(selfSeat+seatCls.indexOf(cls))%4;
    const action=lastActions.get(seat);
    if(!action)return'';
    return`<div class="center-last center-last-${cls}">${seatLastActionHtml(action)}</div>`;
  }).join('');
}
function seatGenderBySeat(v,seat){
  const fromParticipants=v?.participants?.find?.((p)=>p.seat===seat)?.gender;
  if(fromParticipants==='female'||fromParticipants==='male')return fromParticipants;
  const fromSolo=state?.solo?.players?.[seat]?.gender;
  if(fromSolo==='female'||fromSolo==='male')return fromSolo;
  return'male';
}
function currentMust3Call(v){
  if(v?.gameOver)return null;
  if(!must3CallState.until)return null;
  const now=Date.now();
  if(now<=must3CallState.until)return{seat:must3CallState.seat,text:must3CallState.text};
  must3CallState.key='';
  must3CallState.text='';
  must3CallState.until=0;
  must3CallState.startedAt=0;
  must3CallState.nonce='';
  return null;
}
function currentLastCardSeat(v){
  const now=Date.now();
  const history=v.history??[];
  if(v.isFirstTrick&&history.length===0){
    lastCardAnnouncedSeats.clear();
    lastCardCallState.key='';
    lastCardCallState.text='';
    lastCardCallState.until=0;
    lastCardCallState.startedAt=0;
    lastCardCallState.nonce='';
    lastCardCallState.historyLen=0;
    lastCardProcessedHistoryLen=0;
    return null;
  }
  if(lastCardCallState.historyLen>0&&history.length===lastCardCallState.historyLen&&lastCardCallState.text){
    if(now<=lastCardCallState.until)return lastCardCallState.seat;
    lastCardCallState.text='';
    lastCardCallState.until=0;
    lastCardCallState.startedAt=0;
    lastCardCallState.nonce='';
    lastCardCallState.historyLen=0;
    return null;
  }
  if(v.gameOver)return null;
  if(history.length<=lastCardProcessedHistoryLen)return null;
  const latest=history[history.length-1];
  lastCardProcessedHistoryLen=history.length;
  if(!latest||latest.action!=='play')return null;
  const target=v.participants.find((p)=>p.seat===latest.seat);
  if(!target||target.count!==1)return null;
  if(lastCardAnnouncedSeats.has(latest.seat))return null;
  const key=`${latest.seat}-${latest.cards?.map(cardId).join(',')||''}-${v.history.length}`;
  if(lastCardCallState.key===key&&now<lastCardCallState.until)return lastCardCallState.seat;
  lastCardAnnouncedSeats.add(latest.seat);
  lastCardCallState.key=key;
  lastCardCallState.seat=latest.seat;
  lastCardCallState.text=buildResponseCalloutText('last','',key);
  lastCardCallState.until=now+1500;
  lastCardCallState.startedAt=now;
  lastCardCallState.nonce=newCalloutNonce();
  lastCardCallState.historyLen=history.length;
  scheduleCalloutExpiry(lastCardCallState.until);
  lockTurnProgress(900);
  clearCalloutStates('last');
  playSound('last');
  speakCallout(lastCardCallState.text||t('lastCardCall'),seatGenderBySeat(v,latest.seat),{clipKey:'last',seat:latest.seat});
  return latest.seat;
}
function setRecommendHint(msg=''){
  state.recommendHint=msg;
  if(recommendHintTimer){clearTimeout(recommendHintTimer);recommendHintTimer=null;}
  if(msg){
    recommendHintTimer=window.setTimeout(()=>{recommendHintTimer=null;state.recommendHint='';render();},2200);
  }
}
function pickPlayCalloutVariant(lastPlay,hist,playIdx,isRoundLead){
  if(isRoundLead)return 0;
  const currentEval=evaluatePlay(Array.isArray(lastPlay?.cards)?lastPlay.cards:[]);
  if(!currentEval?.valid)return 1;
  let prevPlay=null;
  for(let i=playIdx-1;i>=0;i-=1){
    const e=hist[i];
    if(e?.action==='play'&&Array.isArray(e.cards)&&e.cards.length){
      prevPlay=e;
      break;
    }
  }
  if(!prevPlay)return 1;
  const prevEval=evaluatePlay(prevPlay.cards);
  if(!prevEval?.valid)return 1;
  const samePattern=currentEval.count===prevEval.count&&currentEval.kind===prevEval.kind;
  if(samePattern){
    const topNow=Number(currentEval.power?.[currentEval.power.length-1]??0);
    const topPrev=Number(prevEval.power?.[prevEval.power.length-1]??0);
    const topGap=Math.abs(topNow-topPrev);
    if(topGap<=1)return 3; // `${kind}，大你少少😏`
    if(topGap>=4)return 4; // `${kind}，大過你😏`
    return 1; // `跟！${kind}`
  }
  if(currentEval.count===5&&prevEval.count===5){
    const nowKind=Number(FIVE_KIND_POWER[currentEval.kind]??0);
    const prevKind=Number(FIVE_KIND_POWER[prevEval.kind]??0);
    if(nowKind>prevKind)return 4; // stronger class overtake
  }
  return 2; // `${kind}，頂住。`
}
function currentPlayTypeCall(v){
  if(v.gameOver)return'';
  if(playTypeCallState.historyLen>0&&v.history.length>playTypeCallState.historyLen){
    playTypeCallState.until=0;
    playTypeCallState.startedAt=0;
    playTypeCallState.nonce='';
    playTypeCallState.historyLen=0;
  }
  const lastPlay=(v.history??[]).slice().reverse().find((e)=>e.action==='play'&&Array.isArray(e.cards)&&e.cards.length>=4);
  if(!lastPlay)return null;
  const hist=v.history??[];
  const playIdx=hist.lastIndexOf(lastPlay);
  const isRoundLead=(()=>{
    if(playIdx<=0)return true;
    let passStreak=0;
    for(let i=playIdx-1;i>=0;i--){
      const e=hist[i];
      if(e?.action==='pass'){
        passStreak+=1;
        continue;
      }
      if(e?.action==='play')return passStreak>=3;
    }
    return true;
  })();
  const key=`${lastPlay.seat}-${lastPlay.kind}-${lastPlay.cards.map(cardId).join(',')}`;
  const now=Date.now();
  if(playTypeCallState.key!==key){
    const playVariantIndex=pickPlayCalloutVariant(lastPlay,hist,playIdx,isRoundLead);
    playTypeCallState.key=key;
    playTypeCallState.seat=lastPlay.seat;
    playTypeCallState.text=buildResponseCalloutText('play',lastPlay.kind,key,{isRoundLead,playVariantIndex});
    playTypeCallState.until=now+1500;
    playTypeCallState.startedAt=now;
    playTypeCallState.nonce=newCalloutNonce();
    playTypeCallState.historyLen=v.history.length;
    scheduleCalloutExpiry(playTypeCallState.until);
    lockTurnProgress(900);
    clearCalloutStates('play');
    speakCallout(playTypeCallState.text,seatGenderBySeat(v,lastPlay.seat),{clipKey:`kind-${String(lastPlay.kind||'').toLowerCase()}`,seat:lastPlay.seat});
  }
  if(playTypeCallState.historyLen>0&&v.history.length===playTypeCallState.historyLen){
    if(now<=playTypeCallState.until)return{seat:playTypeCallState.seat,text:playTypeCallState.text};
    playTypeCallState.until=0;
    playTypeCallState.startedAt=0;
    playTypeCallState.nonce='';
    playTypeCallState.historyLen=0;
    return null;
  }
  if(now>playTypeCallState.until)return null;
  return{seat:playTypeCallState.seat,text:playTypeCallState.text};
}
function currentPassCall(v){
  if(v.gameOver)return null;
  const history=v.history??[];
  if(!history.length){
    passCallState.key='';
    passCallState.until=0;
    passCallState.startedAt=0;
    passCallState.nonce='';
    passCallState.historyLen=0;
    return null;
  }
  if(passCallState.historyLen>0&&history.length>passCallState.historyLen){
    passCallState.until=0;
    passCallState.startedAt=0;
    passCallState.nonce='';
    passCallState.historyLen=0;
  }
  const latest=history[history.length-1];
  if(!latest||latest.action!=='pass'){
    if(passCallState.historyLen>0&&history.length===passCallState.historyLen){
      const now=Date.now();
      if(now<=passCallState.until)return{seat:passCallState.seat,text:passCallState.text};
      passCallState.until=0;
      passCallState.startedAt=0;
      passCallState.nonce='';
      passCallState.historyLen=0;
      return null;
    }
    if(Date.now()>passCallState.until)return null;
    return{seat:passCallState.seat,text:passCallState.text};
  }
  const key=`pass-${history.length}-${latest.seat}`;
  const now=Date.now();
  if(passCallState.key!==key){
    passCallState.key=key;
    passCallState.seat=latest.seat;
    passCallState.text=buildResponseCalloutText('pass','',key);
    passCallState.until=now+1400;
    passCallState.startedAt=now;
    passCallState.nonce=newCalloutNonce();
    passCallState.historyLen=history.length;
    scheduleCalloutExpiry(passCallState.until);
    lockTurnProgress(850);
    clearCalloutStates('pass');
    speakCallout(passCallState.text,seatGenderBySeat(v,latest.seat),{clipKey:'pass',seat:latest.seat});
  }
  if(passCallState.historyLen>0&&history.length===passCallState.historyLen){
    if(now<=passCallState.until)return{seat:passCallState.seat,text:passCallState.text};
    passCallState.until=0;
    passCallState.startedAt=0;
    passCallState.nonce='';
    passCallState.historyLen=0;
    return null;
  }
  if(now>passCallState.until)return null;
  return{seat:passCallState.seat,text:passCallState.text};
}
function revealHtml(){return'';}
function resultScreenHtml(v,arr){
  const isRoom=state.home.mode==='room';
  const isHost=isRoom&&roomIsHost();
  const roomHumanCount=isRoom&&state.room.data
    ?(Array.isArray(state.room.data.players)?state.room.data.players.filter((p)=>String(p.uid||'').startsWith('uid:')||String(p.uid||'').startsWith('guest:')).length:0)
    :0;
  const needsPlayers=isRoom&&roomHumanCount<2;
  const hostSeat=(()=>{
    if(!isRoom||!state.room.data)return null;
    const hostId=String(state.room.data.hostId||'').trim();
    if(!hostId)return null;
    const players=Array.isArray(state.room.data.players)?state.room.data.players:[];
    const host=players.find((p)=>String(p?.uid||'')===hostId);
    const seat=Number(host?.seat);
    return Number.isFinite(seat)?seat:null;
  })();
  const resultSnapshot=Array.isArray(state.room.lastResultPlayers)?state.room.lastResultPlayers:null;
  const snapshotBySeat=resultSnapshot?new Map(resultSnapshot.map((p)=>[Number.isFinite(Number(p?.seat))?Number(p.seat):-1,p])):null;
  const winner=arr.find((p)=>p.count===0)??arr[0];
  const winnerLastPlay=(v.history??[]).slice().reverse().find((e)=>e.action==='play'&&e.seat===winner.seat&&Array.isArray(e.cards)&&e.cards.length);
  const winnerLastDiscardCards=winnerLastPlay?.cards??[];
  const deductions=v.roundSummary?.deductions??arr.map((p)=>p.seat===winner.seat?0:calcPenaltyDetail(v.revealedHands?.[p.seat]??[]).deduction);
  const winnerGain=Number(v.roundSummary?.winnerGain??deductions.reduce((sum,vv)=>sum+vv,0));
  const detailBySeat=v.roundSummary?.details??arr.map((p)=>p.seat===winner.seat?{remain:0,base:0,multiplier:1,deduction:0,anyTwo:false,topTwo:false,chaoMultiplier:1,chaoKey:''}:calcPenaltyDetail(v.revealedHands?.[p.seat]??[]));
  const rows=arr.map((p)=>{
    const isWinner=p.seat===winner.seat;
    const color=playerColorByViewClass(p.cls);
    const isHostSeat=hostSeat!==null&&hostSeat===p.seat;
    const hostBadgeHtml=isHostSeat?`<span class="lobby-seat-host-badge">🚩</span>`:'';
    const snapshot=snapshotBySeat?snapshotBySeat.get(p.seat)||null:null;
    const snapName=String(snapshot?.name||p.name||'');
    const snapGender=String(snapshot?.gender||p.gender||'male')==='female'?'female':'male';
    const snapPicture=String(snapshot?.picture||'').trim();
    const remain=(v.revealedHands?.[p.seat]??[]);
    const detail=detailBySeat[p.seat]??{remain:remain.length,base:0,multiplier:1,deduction:Number(deductions[p.seat])||0,anyTwo:false,topTwo:false,chaoMultiplier:1,chaoKey:''};
    const delta=isWinner?winnerGain:-(Number(deductions[p.seat])||0);
    const total=p.score??0;
    const remainCards=remain.length?remain.map((c)=>renderStaticCard(c,true)).join(''):`<span class="hint">-</span>`;
    const mulTags=[
      detail.anyTwo?`<span class="result-score-chip boosted">${t('scoreAnyTwo')} x2</span>`:'',
      detail.topTwo?`<span class="result-score-chip boosted">${t('scoreTopTwo')} x2</span>`:'',
      detail.chaoMultiplier>1&&detail.chaoKey?`<span class="result-score-chip boosted">${t(detail.chaoKey)} x${detail.chaoMultiplier}</span>`:''
    ].filter(Boolean).join('');
    const detailLine=isWinner
      ?`<div class="result-score-detail">${t('resultDetail')}: ${t('scoreGain')} +${winnerGain}</div>`
      :`<div class="result-score-detail">${t('resultDetail')}: ${t('scoreBase')} ${detail.base} x ${detail.multiplier} · ${t('scoreDeduct')} ${detail.deduction}${mulTags?` · ${t('scorePenaltyBoost')}: ${mulTags}`:''}</div>`;
    const isSelf=p.seat===v.selfSeat;
    const avatarSrc=snapPicture
      ?authPictureUrlFrom(snapPicture)
      :avatarDataUri(snapName,color,snapGender,Boolean(p.isBot));
    const botNameAttr=p.isBot?` data-bot-name="${esc(p.name)}"`:'';
    const winnerLastDiscardHtml=isWinner
      ?`<div class="result-card-block"><div class="result-block-title">${t('resultLastDiscard')}</div><div class="result-cards" aria-label="${t('resultLastDiscard')}">${winnerLastDiscardCards.length?winnerLastDiscardCards.map((c)=>renderStaticCard(c,true)).join(''):`<span class="hint">-</span>`}</div></div>`
      :'';
    const remainBlockHtml=!isWinner
      ?`<div class="result-card-block"><div class="result-block-title">${t('resultRemain')}</div><div class="result-cards" aria-label="${t('resultRemain')}">${remainCards}</div></div>`
      :'';
    const rightColHtml=`<div class="result-side">${winnerLastDiscardHtml}${remainBlockHtml}</div>`;
    return`<div class="result-row ${isWinner?'winner':''}" style="--winner-color:${color};">
      <div class="result-main">
        <div class="result-head"><span class="player-color-chip" style="--player-color:${color};"></span><span class="result-avatar-wrap" style="--avatar-seat-color:${color};"><img class="result-avatar" src="${avatarSrc}" alt="${esc(p.name)}"${botNameAttr}/>${hostBadgeHtml}</span><span class="result-player-name"><strong>${esc(p.name)}</strong>${isWinner?`<span class="result-winner-medal" aria-hidden="true">🏅</span>`:''}</span>${isWinner?`<span class="result-winner-tag">${t('resultWinner')}</span>`:''}</div>
        <div class="result-meta">${t('resultDelta')}: ${delta>=0?`+${delta}`:`${delta}`} · ${t('score')}: ${total}</div>
        ${detailLine}
      </div>
      ${rightColHtml}
    </div>`;
  }).join('');
  return`<section class="result-screen">
    <div class="result-card">
      <h2 class="title-with-icon"><span class="title-icon title-icon-result" aria-hidden="true"></span><span>${t('resultTitle')}</span></h2>
      <div class="hint">${esc(uiStatus(v.status))}</div>
      <div class="result-list">${rows}</div>
      ${needsPlayers?`<div class="hint">${t('roomNeedPlayers')}</div>`:''}
      <div class="control-row">
        <button id="result-home" class="secondary">${isRoom?t('roomLeave'):t('home')}</button>
        ${(!isRoom||(!needsPlayers&&isHost))
    ?`<button id="result-again" class="primary">${t('again')}</button>`
    :(!isRoom?'':
      needsPlayers?``:`<span class="hint">${t('roomWaitingHost')}</span>`)}
      </div>
    </div>
  </section>`;
}
function congratsOverlayHtml(v,youWin){
  if(!youWin)return'';
  const isRoom=state.home.mode==='room';
  const isHost=isRoom&&roomIsHost();
  const againHtml=(!isRoom||isHost)
    ?`<button id="congrats-again" class="primary">${t('again')}</button>`
    :`<span class="hint">${t('roomWaitingHost')}</span>`;
  return`<div class="congrats-screen"><div class="congrats-card"><h3 class="title-with-icon"><span class="title-icon title-icon-congrats" aria-hidden="true"></span><span>${t('congrats')}</span></h3><div class="hint">${esc(uiStatus(v.status))}</div><div class="control-row"><button id="congrats-home" class="secondary">${t('home')}</button>${againHtml}</div></div></div>`;
}

function markComboActive(comboId,value){
  document.querySelectorAll(`#${comboId} .combo-btn`).forEach((btn)=>{
    btn.classList.toggle('active',btn.getAttribute('data-value')===value);
  });
}
function backAssetFile(value){
  const found=BACK_OPTIONS.find((x)=>x.value===value);
  return found?.file??'back-red-clean2.png';
}
function renderBackCombo(){
  return BACK_OPTIONS.map((opt)=>`<button class="combo-btn ${state.home.backColor===opt.value?'active':''}" data-value="${opt.value}" aria-label="${opt.label[state.language]??opt.value}"><img class="combo-back-preview" src="${withBase(`card-assets/${opt.file}`)}" alt="${opt.label[state.language]??opt.value}"/></button>`).join('');
}
let topbarDelegateBound=false;
let roomTopMetaLayoutBound=false;
let discardSizeObserver=null;
function positionRoomTopMeta(){
  const meta=document.querySelector('.room-top-meta');
  if(!meta)return;
  const actionStrip=document.querySelector('.action-strip');
  const center=document.querySelector('.table-center-stack');
  if(!actionStrip||!center)return;
  const isPortrait=window.matchMedia?.('(orientation: portrait)')?.matches??(window.innerHeight>window.innerWidth);
  const target=isPortrait?center:actionStrip;
  if(meta.parentElement!==target){
    target.appendChild(meta);
  }
  meta.classList.toggle('room-top-meta-center',isPortrait);
  meta.classList.toggle('room-top-meta-panel',!isPortrait);
}
function bindRoomTopMetaLayout(){
  if(roomTopMetaLayoutBound)return;
  roomTopMetaLayoutBound=true;
  window.addEventListener('resize',positionRoomTopMeta);
  window.addEventListener('orientationchange',positionRoomTopMeta);
}
function syncDiscardSizeFromHand(){
  if(state.screen!=='game')return;
  const handCard=document.querySelector('.action-strip .hand .hand-card');
  if(!(handCard instanceof HTMLElement))return;
  const rect=handCard.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const root=document.documentElement;
  const widthPx=`${rect.width.toFixed(2)}px`;
  const heightPx=`${rect.height.toFixed(2)}px`;
  root.style.setProperty('--discard-card-w',widthPx);
  root.style.setProperty('--discard-card-h',heightPx);
  document.querySelectorAll('.seat-played .card.mini, .center-last .card.mini').forEach((card)=>{
    if(!(card instanceof HTMLElement))return;
    card.style.setProperty('width',widthPx,'important');
    card.style.setProperty('height',heightPx,'important');
  });
}
function bindDiscardSizeObserver(){
  if(discardSizeObserver)return;
  if(!('ResizeObserver' in window))return;
  discardSizeObserver=new ResizeObserver(()=>{syncDiscardSizeFromHand();});
}
function observeDiscardSize(){
  bindDiscardSizeObserver();
  const hand=document.querySelector('.action-strip .hand');
  if(!(hand instanceof HTMLElement))return;
  discardSizeObserver?.observe(hand);
  syncDiscardSizeFromHand();
  window.setTimeout(syncDiscardSizeFromHand,180);
}
function handleGameTopbarClick(ev){
  if(state.screen!=='game')return;
  const t=ev.target;
  if(!(t instanceof Element))return;
  const btn=t.closest?.('#game-intro-toggle,#score-guide-toggle,#game-lb-toggle');
  if(!btn)return;
  if(btn.id==='game-intro-toggle'){state.home.showIntro=true;render();return;}
  if(btn.id==='score-guide-toggle'){state.showScoreGuide=true;render();return;}
  if(btn.id==='game-lb-toggle'){state.home.showLeaderboard=true;refreshLeaderboard(true);render();return;}
}
const waitMs=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
function setSoundEnabled(on){
  const enabled=Boolean(on);
  if(enabled){
    sound.enabled=true;
    try{sound.ctx?.resume?.();}catch{}
    return;
  }
  sound.enabled=false;
  try{sound.ctx?.suspend?.();}catch{}
}
function bindSoundToggle(comboId){
  document.querySelectorAll(`#${comboId} .combo-btn`).forEach((btn)=>btn.addEventListener('click',()=>{
    const v=String(btn.getAttribute('data-value')??'');
    if(v!=='on'&&v!=='off')return;
    setSoundEnabled(v==='on');
    markComboActive(comboId,v);
    document.querySelectorAll('.runtime-diagnostic-inline').forEach((el)=>{el.textContent=runtimeDiagnosticsText();});
  }));
}
function bindCalloutVoiceToggle(comboId){
  document.querySelectorAll(`#${comboId} .combo-btn`).forEach((btn)=>btn.addEventListener('click',()=>{
    const v=normalizeCalloutVoiceMode(btn.getAttribute('data-value'));
    if(v!=='auto'&&v!=='off')return;
    calloutVoiceMode=v;
    markComboActive(comboId,v);
  }));
}
function bindCalloutDisplayToggle(comboId){
  document.querySelectorAll(`#${comboId} .combo-btn`).forEach((btn)=>btn.addEventListener('click',()=>{
    const v=String(btn.getAttribute('data-value')??'');
    if(v!=='on'&&v!=='off')return;
    calloutDisplayEnabled=v==='on';
    markComboActive(comboId,v);
  }));
}
function difficultyIndex(value){
  if(value==='easy')return 0;
  if(value==='hard')return 2;
  return 1;
}
function renderHome(){
  const intro=introText();
  const signedIn=signedInForPlay();
  const diffIndex=difficultyIndex(state.home.aiDifficulty);
  const inRoom=Boolean(state.room.id);
  const joinOpen=Boolean(state.room.joinOpen);
  const prevJoinOpen=Boolean(state.room.joinOpenWasOpen);
  if(!joinOpen&&state.room.lobbyRefreshTimer){
    window.clearInterval(state.room.lobbyRefreshTimer);
    state.room.lobbyRefreshTimer=0;
  }
  state.room.joinOpenWasOpen=joinOpen;
  const roomData=state.room.data;
  if(inRoom&&roomData&&String(roomData.status)==='playing'&&roomData.game){
    applyRoomGameSnapshot(roomData);
    return;
  }
  const roomPlayers=Array.isArray(roomData?.players)?roomData.players:[];
  const roomUid=currentRoomPlayerId();
  const roomSelf=roomPlayers.find((p)=>String(p.uid)===roomUid);
  const derivedHostId=String(roomData?.hostId||roomPlayers[0]?.uid||'');
  const derivedHostName=String(roomPlayers.find((p)=>String(p.uid)===String(derivedHostId))?.name||roomData?.hostName||'');
  const roomIsHost=derivedHostId&&String(derivedHostId)===roomUid;
  const roomHumanPlayers=roomPlayers.filter((p)=>String(p.uid||'').startsWith('uid:')||String(p.uid||'').startsWith('guest:'));
  const roomCanStart=roomHumanPlayers.length>=2;
  const roomReady=Boolean(roomSelf?.ready);
  const roomPrivate=Boolean(roomData?.isPrivate);
  const roomStatus=String(roomData?.status??'');
  const roomStarting=roomStatus==='starting';
  const roomGamePlayers=(roomStatus==='finished'&&Array.isArray(roomData?.game?.players))?roomData.game.players:null;
  const roomSeatMap=new Map(roomPlayers.map((p)=>[Number(p.seat),p]));
  const gameSeatMap=roomGamePlayers?new Map(roomGamePlayers.map((p,i)=>[Number.isFinite(Number(p?.seat))?Number(p.seat):i,p])):null;
  const useGameRoster=roomStatus==='finished'&&Boolean(gameSeatMap);
  const roomReadyPending=Boolean(state.room.pendingReady);
  const roomStartPending=Boolean(state.room.pendingStart);
  const readyCountText=roomHumanPlayers.length
    ?t('roomReadyCount').replace('{{ready}}',String(roomHumanPlayers.filter((p)=>p.ready).length)).replace('{{total}}',String(roomHumanPlayers.length))
    :'';
  const roomStatusText=(()=>{
    if(roomStatus==='playing')return t('roomStatusPlaying');
    if(roomStatus==='starting')return t('roomStarting');
    if(roomStatus==='finished')return t('roomWaitingHost');
    return roomIsHost?t('roomWaitingReady'):t('roomWaitingHost');
  })();
  const roomStatusLine=`${roomStatusText}${readyCountText?` · ${readyCountText}`:''}`;
  const roomStatusBanner=`<div class="room-status-text">${esc(roomStatusLine)}</div>`;
  if(state.home.avatarChoice==='google'){
    state.home.avatarChoice=state.home.gender==='female'?'female':'male';
  }
  const allowOpponents=location.hash==='#opponents';
  if(state.home.showLeaderboard)refreshLeaderboard();
  const homeAvatarSrc=selfAvatarDataUri(state.home.name,'#7aaed8',state.home.gender);
  const cardBackLeft=`<label class="field field-cardback field-cardback-left"><span>${t('cardBack')}</span><div class="option-combo cardback-combo back-combo-home" id="back-combo-left">${renderBackCombo()}</div></label>`;
  const cardBackRight=`<label class="field field-cardback field-cardback-right"><span>${t('cardBack')}</span><div class="option-combo cardback-combo back-combo-home" id="back-combo-right">${renderBackCombo()}</div></label>`;
  const aiFieldLeft=`<label class="field field-ai field-ai-left"><span>${t('ai')}</span><div class="option-combo toggle-combo difficulty-combo" id="difficulty-combo-left" style="--difficulty-index:${diffIndex};"><div class="difficulty-pill" aria-hidden="true"></div><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='easy'?'active':''}" data-value="easy">${t('easy')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='normal'?'active':''}" data-value="normal">${t('normal')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='hard'?'active':''}" data-value="hard">${t('hard')}</button></div></label>`;
  const aiFieldRight=`<label class="field field-ai field-ai-right"><span>${t('ai')}</span><div class="option-combo toggle-combo difficulty-combo" id="difficulty-combo-right" style="--difficulty-index:${diffIndex};"><div class="difficulty-pill" aria-hidden="true"></div><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='easy'?'active':''}" data-value="easy">${t('easy')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='normal'?'active':''}" data-value="normal">${t('normal')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='hard'?'active':''}" data-value="hard">${t('hard')}</button></div></label>`;
  const roomErrorHtml=state.room.error?`<div class="hint room-error">${esc(state.room.error)}</div>`:'';
  const roomButtonsHtml=inRoom?'':`<button id="room-lobby-open" class="secondary royal-room-btn" ${signedIn?'':'disabled'}>${t('roomEnter')}</button>`;
  const roomSeats=[0,1,2,3].map((seat)=>{
    const seatLabel=t('seatLabel').replace('{{n}}',String(seat+1));
    const roomEntry=roomSeatMap.get(seat)||null;
    const gameEntry=gameSeatMap?gameSeatMap.get(seat)||null:null;
    const entry=useGameRoster?(gameEntry||roomEntry):roomEntry;
    if(!entry){
      return`<div class="lobby-seat empty"><div class="lobby-seat-avatar empty">+</div><div class="lobby-seat-name">${t('roomSeatOpen')}</div><div class="lobby-seat-label">${seatLabel}</div></div>`;
    }
    const entryName=String(entry.name||'');
    const entryGender=String(entry.gender||(useGameRoster?null:roomEntry?.gender)||'male')==='female'?'female':'male';
    const entryPicture=String(useGameRoster?entry.picture:(entry.picture||roomEntry?.picture)||'').trim();
    const isBot=useGameRoster?(!entry.isHuman):(!roomEntry?false:!isRoomPlayerHuman(roomEntry));
    const avatarColor=isBot?playerColorByViewClass(seatCls[seat]||'south'):'#7aaed8';
    const avatarSrc=entryPicture?authPictureUrlFrom(entryPicture):avatarDataUri(entryName,avatarColor,entryGender,isBot);
    const isHost=String(entry.uid)===String(derivedHostId)||entry.isHost===true||String(roomEntry?.uid||'')===String(derivedHostId);
    const hostTag='';
    const lastSeen=Number(roomEntry?.lastSeen)||0;
    const offline=roomData?.status==='playing'&&lastSeen>0&&(Date.now()-lastSeen>ROOM_OFFLINE_MS);
    const isSelf=String(roomEntry?.uid||'')===String(roomUid);
    const hostBadge=isHost?`<span class="lobby-seat-host-badge">🚩</span>`:'';
    const readyText=roomEntry?.ready?t('roomReady'):t('roomWaiting');
    const readyControl=isSelf
      ?`<div class="option-combo toggle-combo room-ready-toggle" id="room-ready-toggle">
          <button class="combo-btn toggle-btn ${roomEntry?.ready?'active':''}" data-ready="1" ${roomReadyPending?'disabled':''}>${t('roomReady')}</button>
          <button class="combo-btn toggle-btn ${roomEntry?.ready?'':'active'}" data-ready="0" ${roomReadyPending?'disabled':''}>${t('roomWaiting')}</button>
        </div>`
      :(roomEntry?`<div class="lobby-seat-status">${readyText}</div>`:'');
    const displayName=(roomStatus==='finished'?'':entryName);
    const nameHtml=`<div class="lobby-seat-name">${displayName?esc(displayName):'&nbsp;'}</div>`;
    return`<div class="lobby-seat ${roomEntry?.ready?'ready':''} ${isHost?'host':''} ${offline?'offline':''}">
      <span class="lobby-seat-avatar-wrap"><img class="lobby-seat-avatar" src="${avatarSrc}" alt="${esc(entryName)}"/>${hostBadge}</span>
      ${nameHtml}
      ${readyControl}
      <div class="lobby-seat-label">${seatLabel}</div>
    </div>`;
  }).join('');
  const roomHostLine='';
  const roomPrivacyRow=roomIsHost
    ?`<div class="room-privacy-row"><span>${t('roomPrivacy')}</span>
        <div class="option-combo toggle-combo" id="room-privacy-toggle">
          <button class="combo-btn toggle-btn ${roomPrivate?'':'active'}" data-private="0">${t('roomPublic')}</button>
          <button class="combo-btn toggle-btn ${roomPrivate?'active':''}" data-private="1">🔑 ${t('roomPrivate')}</button>
        </div>
      </div>`
    :'';
  const roomSeatFilledCount=[0,1,2,3].filter((seat)=>roomSeatMap.get(seat)).length;
  const roomAllSeatsFilled=roomSeatFilledCount>=4;
  const roomStartControl=roomIsHost
    ?`${`<button id="room-start" class="primary" ${(roomStarting||!roomCanStart||roomStartPending)?'disabled':''}>${t('roomStart')}</button>`}${roomStartPending?`<span class="hint">${t('roomSending')}</span>`:roomStarting?`<span class="hint">${t('roomStarting')}</span>`:(!roomStarting&&!roomCanStart)?`<span class="hint">${t('roomNeedPlayers')}</span>`:''}`
    :`<span class="hint">${roomStarting?t('roomStarting'):(roomAllSeatsFilled?t('roomWaitingHost'):t('roomWelcomeJoin'))}</span>`;
  const roomPendingHint=(roomReadyPending&&!roomStartPending)?`<span class="hint">${t('roomSending')}</span>`:'';
  const roomTitle=t('roomTableTitle');
  const roomLobbyHtml=(inRoom&&roomStatus!=='playing')?`<div class="room-overlay"><div class="room-card room-lobby-card"><div class="room-head"><h3>${roomTitle}</h3>${roomHostLine}</div><div class="room-id-center"><span class="room-code">${esc(state.room.code)}</span><button id="room-copy" class="secondary">${t('roomCopy')}</button></div>${roomPrivacyRow}<div class="lobby-table">${roomSeats}</div>${roomErrorHtml}<div class="room-actions">${roomStartControl}${roomPendingHint}<button id="room-leave" class="danger" ${roomStarting?'disabled':''}>${t('roomLeave')}</button></div></div></div>`:'';
  const activeRoomsState=state.home.activeRooms;
  const activeRooms=Array.isArray(activeRoomsState?.rows)?activeRoomsState.rows:[];
  const emptySeats=[0,1,2,3].map(()=>`<div class="room-active-seat empty">+</div>`).join('');
  const createTableCard=`<button class="room-active-card room-create-card" id="room-create-card" type="button"><div class="room-active-code">${t('roomCreate')}</div><div class="room-active-table">${emptySeats}</div><div class="room-active-info"><div class="room-active-count">0/4</div></div></button>`;
  const maskRoomCode=(code)=>{
    const raw=String(code||'');
    if(!raw)return'';
    if(raw.length<=2)return raw;
    const chars=raw.split('');
    const len=chars.length;
    const maskCount=len<=4?Math.max(1,len-2):3;
    const start=Math.floor((len-maskCount)/2);
    for(let i=start;i<start+maskCount;i+=1){
      chars[i]='*';
    }
    return chars.join('');
  };
  const activeRoomsCards=activeRooms.length
    ?activeRooms.map((r)=>{
        const roster=Array.isArray(r.roster)?r.roster:[];
        const isPrivate=Boolean(r.isPrivate);
        const displayCode=isPrivate?maskRoomCode(r.code):String(r.code||'').toUpperCase();
        const roomSeats=[0,1,2,3].map((seat)=>{
          if(r.status==='finished'){
            const entry=roster.find((p)=>Number(p.seat)===seat&& !Boolean(p.isBot));
            if(!entry){
              return`<div class="lobby-seat lobby-seat-mini empty"><div class="lobby-seat-avatar empty">+</div></div>`;
            }
            const avatarColor=entry.avatarColor||'#7aaed8';
            const avatarSrc=entry.picture?authPictureUrlFrom(entry.picture):avatarDataUri(entry.name,avatarColor,entry.gender??'male',false);
            const isHost=String(entry.uid)===String(r.hostId)||entry.isHost===true;
            const hostBadge=isHost?`<span class="lobby-seat-host-badge">🚩</span>`:'';
            return`<div class="lobby-seat lobby-seat-mini ${entry.ready?'ready':''} ${isHost?'host':''}">
              <span class="lobby-seat-avatar-wrap"><img class="lobby-seat-avatar" src="${avatarSrc}" alt="${esc(entry.name)}"/>${hostBadge}</span>
              </div>`;
          }
          const entry=roster.find((p)=>Number(p.seat)===seat);
          if(!entry){
            return`<div class="lobby-seat lobby-seat-mini empty"><div class="lobby-seat-avatar empty">+</div></div>`;
          }
              const avatarColor=entry.avatarColor||'#7aaed8';
              const avatarSrc=entry.picture?authPictureUrlFrom(entry.picture):avatarDataUri(entry.name,avatarColor,entry.gender??'male',Boolean(entry.isBot));
              const isHost=String(entry.uid)===String(r.hostId)||entry.isHost===true;
              const hostBadge=isHost?`<span class="lobby-seat-host-badge">🚩</span>`:'';
          return`<div class="lobby-seat lobby-seat-mini ${entry.ready?'ready':''} ${isHost?'host':''}">
            <span class="lobby-seat-avatar-wrap"><img class="lobby-seat-avatar" src="${avatarSrc}" alt="${esc(entry.name)}"/>${hostBadge}</span>
            </div>`;
        }).join('');
        let statusLabel='';
        if(r.status==='playing'){
          const round=Number(r.roundCount||0)+1;
          const roundText=Number.isFinite(round)?round:'-';
          statusLabel=`<div class="room-active-status">⚔️ ${t('roomStatusPlaying')} · ${t('roomRound')} ${roundText}</div>`;
        }else if(r.status==='finished'){
          statusLabel=`<div class="room-active-status">${t('roomWaitingHost')}</div>`;
        }else if(r.status==='lobby'||r.status==='starting'){
          statusLabel=`<div class="room-active-status">${t('roomWaitingHost')}</div>`;
        }
        const privateLabel='';
        const displayPlayers=Number.isFinite(Number(r.displayPlayers))?Number(r.displayPlayers):Number(r.players||0);
        const joinDisabled=isPrivate||r.status==='playing';
        const bottomHint=isPrivate&&r.status!=='playing'
          ?(state.language==='zh-HK'?'輸入房間代碼即可加入':'Enter room code to join.')
          :'';
        const statusText=(()=>{
          if(r.status==='playing')return statusLabel.replace(/<[^>]+>/g,'');
          if(isPrivate&&r.status!=='playing')return bottomHint;
          const totalSeats=Number.isFinite(Number(r.maxPlayers))?Number(r.maxPlayers):4;
          if(!isPrivate&&r.status!=='playing'&&displayPlayers<totalSeats)return t('roomWelcomeJoin');
          return statusLabel?statusLabel.replace(/<[^>]+>/g,''):'';
        })();
        const bottomRow=`<div class="room-active-bottom">${statusText?`<div class="room-active-status-line">${esc(statusText)}</div>`:'<span></span>'}<div class="room-active-count">${displayPlayers}/${r.maxPlayers}</div></div>`;
        return`<button class="room-active-card room-active-card-full${isPrivate?' room-active-card-private':''}" data-code="${esc(r.code)}" data-private="${isPrivate?'1':'0'}" type="button"${joinDisabled?' disabled':''}>${isPrivate?`<span class="room-active-private-inline">🔑 ${t('roomPrivate')}</span>`:''}<div class="room-active-code"><span class="room-active-code-text">${esc(displayCode)}</span></div><div class="room-active-table room-active-table-full">${roomSeats}</div>${bottomRow}</button>`;
      }).join('')
      :'';
  const activeRoomsEmpty=activeRooms.length?'':`<div class="room-active-empty">${t('roomActiveEmpty')}</div>`;
  const hiddenCount=Number(state.home.activeRooms.hiddenCount)||0;
  const hiddenNote=hiddenCount?`<span class="room-active-hidden">Hidden: ${hiddenCount}</span>`:'';
  const refreshCountdownText=state.room.joinOpenCountdown&&state.room.joinOpenCountdown>0
    ?`<span class="room-active-refresh-countdown">${state.room.joinOpenCountdown}s</span>`
    :'';
  const activeRoomsBlock=`<div class="room-active-block"><div class="room-active-head"><span>${t('roomActiveList')}</span>${hiddenNote}<button id="room-active-refresh" class="secondary"><span class="room-active-refresh-label">${state.language==='zh-HK'?'更新':'Refresh'}</span>${refreshCountdownText}</button></div><div class="room-active-grid">${createTableCard}${activeRoomsCards}${activeRoomsEmpty}</div></div>`;
  const roomJoinModal=(!inRoom&&state.room.joinOpen)?`<div class="room-overlay"><div class="room-card room-join-card"><div class="room-head"><h3>${t('roomLobby')}</h3></div><label class="field"><span>${t('roomCode')}</span><div class="room-code-row"><input id="room-code-input" class="room-input" maxlength="8" placeholder="ABC123"/><button id="room-join-confirm" class="primary">${t('roomJoin')}</button></div></label>${activeRoomsState?.loading?`<div class="hint">...</div>`:activeRoomsBlock}${roomErrorHtml}<div class="room-actions"><button id="room-join-cancel" class="secondary">${t('home')}</button></div></div></div>`:'';
  app.innerHTML=`<section class="home-wrap royal-home-wrap"><section class="home-panel royal-home-panel"><header class="royal-home-head"><div class="royal-head-actions"><button id="home-intro-toggle" class="secondary">${esc(intro.btnShow)}</button><button id="home-score-guide-toggle" class="secondary">${t('scoreGuide')}</button><button id="home-lb-toggle" class="secondary">${t('lb')}</button>${allowOpponents?`<button id="home-opponents-toggle" class="secondary">${t('opponents')}</button>`:''}<button id="home-lang-toggle" class="secondary">${state.language==='zh-HK'?'EN':'中'}</button></div><div class="royal-title-wrap"><div class="home-logo-block"><img class="title-logo title-logo-home" src="${withBase('title-lockup-home.png')}" alt="鋤大D TRADITIONAL BIG TWO"/><img class="home-flag" src="${withBase('hk-flag-apple.png')}" alt="Hong Kong flag"/></div></div></header><section class="royal-home-body"><div class="home-form-grid"><div class="home-form-col home-form-left home-section"><h3 class="home-section-title">👾 ${t('playerSettings')}</h3><div class="home-profile-card"><div class="home-profile-avatar"><img id="home-avatar-img" src="${homeAvatarSrc}" alt="${esc(state.home.name||t('name'))}"/></div><div class="home-profile-fields"><label class="field field-compact"><span>${t('name')}</span><div class="name-with-google"><input id="name-input" value="${esc(state.home.name)}" maxlength="18"/><div id="google-name-inline"></div></div></label><label class="field field-compact"><div class="option-combo toggle-combo" id="gender-combo"><button class="combo-btn toggle-btn ${state.home.avatarChoice==='male'?'active':''}" data-value="male">${t('male')}</button><button class="combo-btn toggle-btn ${state.home.avatarChoice==='female'?'active':''}" data-value="female">${t('female')}</button></div></label></div></div>${aiFieldLeft}${cardBackLeft}</div><div class="home-form-col home-form-right home-section"><h3 class="home-section-title">⚙️ ${t('systemSettings')}</h3>${aiFieldRight}<label class="field field-sound"><span>${t('soundFx')}</span><div class="option-combo toggle-combo" id="sound-combo"><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'active':''}" data-value="on" aria-label="${t('soundOn')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M15 9c1.6 1.2 1.6 4.8 0 6"></path><path d="M17.5 7c2.8 2.4 2.8 7.6 0 10"></path></svg></button><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'':'active'}" data-value="off" aria-label="${t('soundOff')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M16 8l4 8"></path><path d="M20 8l-4 8"></path></svg></button></div></label><label class="field field-callout"><span>${t('calloutDisplay')}</span><div class="option-combo toggle-combo" id="callout-display-combo"><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'active':''}" data-value="on">${t('calloutDisplayOn')}</button><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'':'active'}" data-value="off">${t('calloutDisplayOff')}</button></div></label><label class="field field-voice"><span>${t('voiceMode')}</span><div class="option-combo toggle-combo" id="voice-combo"><button class="combo-btn toggle-btn sound-toggle-btn ${calloutVoiceMode==='auto'?'active':''}" data-value="auto" aria-label="${t('voiceAuto')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M15 9c1.6 1.2 1.6 4.8 0 6"></path><path d="M17.5 7c2.8 2.4 2.8 7.6 0 10"></path></svg></button><button class="combo-btn toggle-btn sound-toggle-btn ${calloutVoiceMode==='off'?'active':''}" data-value="off" aria-label="${t('voiceOff')}"><svg class="sound-icon" viewBox="0 0 24 24"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M16 8l4 8"></path><path d="M20 8l-4 8"></path></svg></button></div></label>${cardBackRight}</div></div><div class="action-row home-start-row"><button id="solo-start" class="primary royal-start-btn" ${signedIn?'':'disabled'}>${t('solo')}</button>${roomButtonsHtml}${signedIn?'':`<span class="hint">${t('loginToStart')}</span>`}</div></section></section>${mainPageLegalMiniHtml()}${roomLobbyHtml}${roomJoinModal}${state.home.showIntro?introPanelHtml():''}${state.home.showLeaderboard?leaderboardModalHtml():''}${state.showScoreGuide?scoreGuideModalHtml():''}</section>`;

  document.getElementById('home-intro-toggle')?.addEventListener('click',()=>{state.home.showIntro=!state.home.showIntro;render();});
  document.getElementById('home-score-guide-toggle')?.addEventListener('click',()=>{state.showScoreGuide=true;render();});
  document.getElementById('home-lb-toggle')?.addEventListener('click',()=>{state.home.showLeaderboard=!state.home.showLeaderboard;if(state.home.showLeaderboard)refreshLeaderboard(true);render();});
  document.getElementById('home-opponents-toggle')?.addEventListener('click',()=>{state.screen='opponents';render();});
  document.getElementById('intro-close')?.addEventListener('click',()=>{state.home.showIntro=false;render();});
  document.getElementById('intro-backdrop')?.addEventListener('click',()=>{state.home.showIntro=false;render();});
  document.getElementById('score-guide-close')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('score-guide-backdrop')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('opponent-profile-close')?.addEventListener('click',()=>{state.opponentProfileName='';render();});
  document.getElementById('opponent-profile-backdrop')?.addEventListener('click',()=>{state.opponentProfileName='';render();});
  document.getElementById('opponent-profile-close')?.addEventListener('click',()=>{state.opponentProfileName='';render();});
  document.getElementById('opponent-profile-backdrop')?.addEventListener('click',()=>{state.opponentProfileName='';render();});
  document.getElementById('lb-close')?.addEventListener('click',()=>{state.home.showLeaderboard=false;render();});
  document.getElementById('lb-backdrop')?.addEventListener('click',()=>{state.home.showLeaderboard=false;render();});
  document.getElementById('home-lang-toggle')?.addEventListener('click',()=>{state.language=state.language==='zh-HK'?'en':'zh-HK';relabelSoloBots();render();});
  document.getElementById('name-input')?.addEventListener('input',(e)=>{state.home.name=e.target.value;if(signedInWithEmail()){void syncLeaderboardProfile(currentLeaderboardIdentity());}});
  document.querySelectorAll('#gender-combo .combo-btn').forEach((btn)=>btn.addEventListener('click',()=>{
    const v=String(btn.getAttribute('data-value')??'');
    if(v!=='male'&&v!=='female')return;
    state.home.avatarChoice=v;
    if(v==='male'||v==='female')state.home.gender=v;
    markComboActive('gender-combo',state.home.avatarChoice);
    saveGoogleSession();
    if(signedInWithEmail()){void syncLeaderboardProfile(currentLeaderboardIdentity());}
  }));
  document.querySelectorAll('#difficulty-combo-left .combo-btn, #difficulty-combo-right .combo-btn').forEach((btn)=>btn.addEventListener('click',()=>{
    const v=btn.getAttribute('data-value');
    if(!v)return;
    state.home.aiDifficulty=v;
    markComboActive('difficulty-combo-left',v);
    markComboActive('difficulty-combo-right',v);
    document.getElementById('difficulty-combo-left')?.style.setProperty('--difficulty-index',`${difficultyIndex(v)}`);
    document.getElementById('difficulty-combo-right')?.style.setProperty('--difficulty-index',`${difficultyIndex(v)}`);
  }));
  document.querySelectorAll('.back-combo-home .combo-btn').forEach((btn)=>btn.addEventListener('click',()=>{
    const v=btn.getAttribute('data-value');
    if(!v||!BACK_OPTIONS.some((x)=>x.value===v))return;
    state.home.backColor=v;
    markComboActive('back-combo-left',state.home.backColor);
    markComboActive('back-combo-right',state.home.backColor);
  }));
  bindSoundToggle('sound-combo');
  bindCalloutDisplayToggle('callout-display-combo');
  bindCalloutVoiceToggle('voice-combo');
  document.getElementById('solo-start')?.addEventListener('click',async()=>{
    if(!signedInForPlay())return;
    unlockAudio();
    state.home.mode='solo';
    state.home.showLeaderboard=false;
    initFirebaseIfReady();
    let synced=false;
    for(let i=0;i<4&&!synced;i++){
      synced=await syncLeaderboardProfile(currentLeaderboardIdentity());
      if(!synced)await waitMs(250);
    }
    if(!synced)console.warn('profile sync failed on start; continuing to game');
    startSoloGame();
  });
  document.getElementById('room-lobby-open')?.addEventListener('click',()=>{
    if(!signedInForPlay()){
      setRoomError(t('roomLoginRequired'));
      return;
    }
    state.room.joinOpen=true;
    state.room.error='';
    state.room.joinOpenCountdown=15;
    render();
    void loadActiveRooms();
  });
  document.getElementById('room-create')?.addEventListener('click',async()=>{
    await createRoom();
  });
  document.getElementById('room-create-card')?.addEventListener('click',async()=>{
    await createRoom();
  });
  document.getElementById('room-join-cancel')?.addEventListener('click',()=>{
    state.room.joinOpen=false;
    state.room.joinOpenCountdown=0;
    state.room.error='';
    render();
  });
  document.getElementById('room-join-confirm')?.addEventListener('click',async()=>{
    const code=document.getElementById('room-code-input')?.value??'';
    await joinRoomByCode(code);
  });
  document.getElementById('room-active-refresh')?.addEventListener('click',async()=>{
    if(state.room.joinOpen){
      state.room.joinOpenCountdown=15;
      render();
    }
    await loadActiveRooms();
  });
  document.querySelectorAll('.room-active-card').forEach((card)=>card.addEventListener('click',()=>{
    if(card.hasAttribute('disabled')||card.getAttribute('data-private')==='1')return;
    const code=String(card.getAttribute('data-code')||'');
    if(!code)return;
    const input=document.getElementById('room-code-input');
    if(input)input.value=code;
    document.querySelectorAll('.room-active-card').forEach((el)=>el.classList.toggle('active',el===card));
    void joinRoomByCode(code);
  }));
  document.getElementById('room-code-input')?.addEventListener('keydown',async(e)=>{
    if(e.key!=='Enter')return;
    const code=document.getElementById('room-code-input')?.value??'';
    await joinRoomByCode(code);
  });

  if(joinOpen){
    const countdownTarget=15;
    const existingCountdown=Number(state.room.joinOpenCountdown);
    if(!Number.isFinite(existingCountdown)||existingCountdown<=0||existingCountdown>countdownTarget){
      state.room.joinOpenCountdown=countdownTarget;
    }
    if(!state.room.lobbyRefreshTimer){
      state.room.lobbyRefreshTimer=window.setInterval(()=>{
        if(!state.room.joinOpen){
          window.clearInterval(state.room.lobbyRefreshTimer);
          state.room.lobbyRefreshTimer=0;
          return;
        }
        if(document.hidden)return;
        state.room.joinOpenCountdown-=1;
        if(state.room.joinOpenCountdown<=0){
          state.room.joinOpenCountdown=countdownTarget;
          void loadActiveRooms();
        }
        render();
      },1000);
    }
    if(!prevJoinOpen){
      window.addEventListener('focus',()=>{
        if(document.hidden||!state.room.joinOpen)return;
        state.room.joinOpenCountdown=countdownTarget;
        void loadActiveRooms();
      },{once:true});
    }
  }
  document.getElementById('room-copy')?.addEventListener('click',async()=>{
    try{await navigator.clipboard?.writeText?.(String(state.room.code||''));}catch{}
  });
  document.getElementById('room-leave')?.addEventListener('click',async()=>{
    await leaveRoom(true);
  });
  document.querySelectorAll('#room-ready-toggle [data-ready]').forEach((btn)=>btn.addEventListener('click',async()=>{
    if(state.room.pendingReady)return;
    const desired=btn.getAttribute('data-ready')==='1';
    state.room.pendingReady=true;
    state.room.pendingReadyValue=desired;
    if(roomReadyPendingTimer){clearTimeout(roomReadyPendingTimer);}
    roomReadyPendingTimer=window.setTimeout(()=>{
      roomReadyPendingTimer=null;
      state.room.pendingReady=false;
      state.room.pendingReadyValue=null;
      setRoomError(t('roomSendTimeout'));
    },5000);
    render();
    await setRoomReady(desired);
  }));
  document.querySelectorAll('#room-privacy-toggle [data-private]').forEach((btn)=>btn.addEventListener('click',async()=>{
    if(!roomIsHost)return;
    const desired=btn.getAttribute('data-private')==='1';
    await setRoomPrivacy(desired);
  }));
  document.getElementById('room-start')?.addEventListener('click',async()=>{
    if(state.room.pendingStart)return;
    state.room.pendingStart=true;
    if(roomStartPendingTimer){clearTimeout(roomStartPendingTimer);}
    roomStartPendingTimer=window.setTimeout(()=>{
      roomStartPendingTimer=null;
      state.room.pendingStart=false;
      setRoomError(t('roomSendTimeout'));
    },5000);
    render();
    let synced=false;
    for(let i=0;i<4&&!synced;i++){
      synced=await syncLeaderboardProfile(currentLeaderboardIdentity());
      if(!synced)await waitMs(250);
    }
    await startRoom();
  });
  document.getElementById('lb-sort')?.addEventListener('change',(e)=>{state.home.leaderboard.sort=e.target.value;refreshLeaderboard();render();});
  document.getElementById('lb-period')?.addEventListener('change',(e)=>{state.home.leaderboard.period=e.target.value;refreshLeaderboard();render();});
  const legal=legalMiniCopy();
  const legalModal=document.getElementById('legal-modal');
  const legalModalTitle=document.getElementById('legal-modal-title');
  const legalModalBody=document.getElementById('legal-modal-body');
  const closeLegal=()=>{
    legalModal?.classList.remove('open');
    document.querySelectorAll('.legal-mini-link').forEach((b)=>b.classList.remove('active'));
  };
  document.getElementById('legal-close')?.addEventListener('click',closeLegal);
  document.getElementById('legal-backdrop')?.addEventListener('click',closeLegal);
  document.querySelectorAll('.legal-mini-link').forEach((btn)=>btn.addEventListener('click',()=>{
    const key=btn.getAttribute('data-legal');
    const content=key?legal.content[key]:'';
    if(!key||!content||!legalModal||!legalModalTitle||!legalModalBody)return;
    legalModalTitle.textContent=legal.labels[key]||'';
    legalModalBody.innerHTML=content;
    legalModal.classList.add('open');
    document.querySelectorAll('.legal-mini-link').forEach((b)=>b.classList.remove('active'));
    btn.classList.add('active');
  }));
  queueGoogleInlineRender();
}
function renderConfig(){
  const diffIndex=difficultyIndex(state.home.aiDifficulty);
  app.innerHTML=`<section class="home-wrap"><header class="topbar home-topbar"><div><h2>${t('config')}</h2></div><div class="topbar-right"><div class="control-row"><button id="config-back" class="secondary">${t('home')}</button><button id="config-lang-toggle" class="secondary">${state.language==='zh-HK'?'EN':'中'}</button></div></div></header><section class="home-panel"><div class="field-grid config-audio-voice-row"><label class="field"><span>${t('ai')}</span><div class="option-combo toggle-combo difficulty-combo" id="config-difficulty-combo" style="--difficulty-index:${diffIndex};"><div class="difficulty-pill" aria-hidden="true"></div><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='easy'?'active':''}" data-value="easy">${t('easy')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='normal'?'active':''}" data-value="normal">${t('normal')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='hard'?'active':''}" data-value="hard">${t('hard')}</button></div></label><label class="field"><span>${t('cardBack')}</span><div class="option-combo cardback-combo" id="config-back-combo">${renderBackCombo()}</div></label><label class="field"><span>${t('soundFx')}</span><div class="option-combo toggle-combo" id="config-sound-combo"><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'active':''}" data-value="on" aria-label="${t('soundOn')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M15 9c1.6 1.2 1.6 4.8 0 6"></path><path d="M17.5 7c2.8 2.4 2.8 7.6 0 10"></path></svg></button><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'':'active'}" data-value="off" aria-label="${t('soundOff')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M16 8l4 8"></path><path d="M20 8l-4 8"></path></svg></button></div></label><label class="field"><span>${t('calloutDisplay')}</span><div class="option-combo toggle-combo" id="config-callout-display-combo"><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'active':''}" data-value="on">${t('calloutDisplayOn')}</button><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'':'active'}" data-value="off">${t('calloutDisplayOff')}</button></div></label><label class="field"><span>${t('voiceMode')}</span><div class="option-combo toggle-combo" id="config-voice-combo"><button class="combo-btn toggle-btn sound-toggle-btn ${calloutVoiceMode==='auto'?'active':''}" data-value="auto" aria-label="${t('voiceAuto')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M15 9c1.6 1.2 1.6 4.8 0 6"></path><path d="M17.5 7c2.8 2.4 2.8 7.6 0 10"></path></svg></button><button class="combo-btn toggle-btn sound-toggle-btn ${calloutVoiceMode==='off'?'active':''}" data-value="off" aria-label="${t('voiceOff')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M16 8l4 8"></path><path d="M20 8l-4 8"></path></svg></button></div></label></div></section></section>`;
  document.getElementById('config-back')?.addEventListener('click',()=>{
    const target=state.screenBeforeConfig||'home';
    state.screen=target;
    render();
  });
  document.getElementById('config-lang-toggle')?.addEventListener('click',()=>{state.language=state.language==='zh-HK'?'en':'zh-HK';relabelSoloBots();render();});
  document.querySelectorAll('#config-difficulty-combo .combo-btn').forEach((btn)=>btn.addEventListener('click',()=>{
    const v=btn.getAttribute('data-value');
    if(!v)return;
    state.home.aiDifficulty=v;
    markComboActive('config-difficulty-combo',v);
    const combo=document.getElementById('config-difficulty-combo');
    combo?.style.setProperty('--difficulty-index',`${difficultyIndex(v)}`);
  }));
  document.querySelectorAll('#config-back-combo .combo-btn').forEach((btn)=>btn.addEventListener('click',()=>{
    const v=btn.getAttribute('data-value');
    if(!v||!BACK_OPTIONS.some((x)=>x.value===v))return;
    state.home.backColor=v;
    markComboActive('config-back-combo',state.home.backColor);
  }));
  bindSoundToggle('config-sound-combo');
  bindCalloutDisplayToggle('config-callout-display-combo');
  bindCalloutVoiceToggle('config-voice-combo');
}
function avatarCharacteristics(url){
  try{
    const u=new URL(url);
    const params=u.searchParams;
    const isDicebear=/dicebear\.com/i.test(u.hostname);
    const allow=isDicebear
      ?[
        'seed','top','accessories','hairColor','facialHair','facialHairColor',
        'clothing','clothesColor','eyes','eyebrows','mouth','skinColor','backgroundColor','backgroundType','style','size','scale'
      ]
      :[
        'avatarStyle','topType','accessoriesType','hairColor','hatColor','facialHairType','facialHairColor',
        'clotheType','clotheColor','eyeType','eyebrowType','mouthType','skinColor','backgroundColor','backgroundType','scale'
      ];
    const out=[];
    allow.forEach((key)=>{
      const v=params.get(key);
      if(!v)return;
      out.push({k:key,v});
    });
    return out;
  }catch{
    return[];
  }
}
function profileParagraphsHtml(profileText){
  const parts=Array.isArray(profileText)?profileText:[profileText];
  const clean=parts.map((p)=>String(p??'').trim()).filter(Boolean);
  if(!clean.length)return'<p>-</p>';
  return clean.map((p)=>`<p>${esc(p)}</p>`).join('');
}
function renderOpponents(){
  const seen=new Set();
  const bots=BOT_PROFILE_POOL.filter((b)=>{
    if(seen.has(b.name))return false;
    seen.add(b.name);
    return true;
  });
  const cards=bots.map((b)=>{
    const accent=pick(NPC_COLOR_POOL,hashNameSeed(b.name));
    const link=avatarDataUri(b.name,'#7aaed8',b.gender,true);
    const profile=OPPONENT_PROFILE_BY_NAME[b.name]??{dob:'-',hobbies:{},profile:{}};
    const langKey=state.language==='zh-HK'?'zh-HK':'en';
    const hobbies=profile.hobbies?.[langKey]??profile.hobbies?.['zh-HK']??[];
    const hobbyText=formatHobbyList(hobbies);
    const profileText=profile.profile?.[langKey]??profile.profile?.['zh-HK']??'-';
    const profileHtml=profileParagraphsHtml(profileText);
    const zodiacText=profile.zodiac?.[langKey]??profile.zodiac?.['zh-HK']??'-';
    const zodiacMark=zodiacSymbol(zodiacText);
    const mottoText=profile.motto?.[langKey]??profile.motto?.['zh-HK']??'-';
    const genderLabel=b.gender==='female'?t('female'):t('male');
    const genderIcon=b.gender==='female'?'♀':'♂';
    const genderClass=b.gender==='female'?'gender-female':'gender-male';
    return`<article class="opponent-card">
      <div class="opponent-head">
        <img class="opponent-avatar" src="${link}" alt="${esc(b.name)}"/>
        <div class="opponent-meta">
          <div class="opponent-name">${esc(b.name)}</div>
          <div class="opponent-sub"><span class="opponent-gender-symbol ${genderClass}" data-symbol="${genderIcon}" aria-label="${esc(genderLabel)}" title="${esc(genderLabel)}">${genderIcon}</span></div>
        </div>
      </div>
      <div class="opponent-info-row">
        <div class="opponent-info-item"><span class="opponent-chip-icon zodiac" aria-hidden="true"></span><span class="opponent-info-label">${t('zodiac')}</span><span class="opponent-info-value">${zodiacMark?`${zodiacMark} `:''}${esc(zodiacText)}</span></div>
        <div class="opponent-info-item"><span class="opponent-chip-icon dob" aria-hidden="true"></span><span class="opponent-info-label">${t('dob')}</span><span class="opponent-info-value">${esc(profile.dob)}</span></div>
        <div class="opponent-info-item opponent-info-hobbies"><span class="opponent-chip-icon hobby" aria-hidden="true"></span><span class="opponent-info-label">${t('hobbies')}</span><span class="opponent-info-value">${esc(hobbyText)}</span></div>
      </div>
      <div class="opponent-motto"><span class="opponent-chip-icon motto" aria-hidden="true"></span><div class="opponent-motto-text">${esc(mottoText)}</div></div>
      <div class="opponent-bio opponent-bio-block">
        <div class="opponent-profile-summary"><strong>${t('profile')}</strong></div>
        <div class="opponent-profile-paragraphs">${profileHtml}</div>
      </div>
    </article>`;
  }).join('');
  app.innerHTML=`<section class="home-wrap opponent-wrap"><header class="topbar home-topbar"><div><h2>${t('opponents')}</h2></div><div class="topbar-right"><div class="control-row"><button id="opponents-back" class="secondary">${t('home')}</button><button id="opponents-lang-toggle" class="secondary">${state.language==='zh-HK'?'EN':'中'}</button></div></div></header><section class="home-panel opponent-panel"><div class="opponent-grid">${cards}</div></section></section>`;
  document.getElementById('opponents-back')?.addEventListener('click',()=>{state.screen='home';render();});
  document.getElementById('opponents-lang-toggle')?.addEventListener('click',()=>{state.language=state.language==='zh-HK'?'en':'zh-HK';render();});
}
function opponentProfileModalHtml(name){
  const langKey=state.language==='zh-HK'?'zh-HK':'en';
  const profile=OPPONENT_PROFILE_BY_NAME[name]??{dob:'-',hobbies:{},profile:{},zodiac:{},motto:{}};
  const hobbies=profile.hobbies?.[langKey]??profile.hobbies?.['zh-HK']??[];
  const hobbyText=formatHobbyList(hobbies);
  const profileText=profile.profile?.[langKey]??profile.profile?.['zh-HK']??'-';
  const profileHtml=profileParagraphsHtml(profileText);
  const zodiacText=profile.zodiac?.[langKey]??profile.zodiac?.['zh-HK']??'-';
  const zodiacMark=zodiacSymbol(zodiacText);
  const mottoText=profile.motto?.[langKey]??profile.motto?.['zh-HK']??'-';
  const gender=botGenderByName(name);
  const genderLabel=gender==='female'?t('female'):t('male');
  const genderIcon=gender==='female'?'♀':'♂';
  const genderClass=gender==='female'?'gender-female':'gender-male';
  const avatarSrc=avatarDataUri(name,'#7aaed8',gender,true);
  const closeLabel=state.language==='en'?'Close':'關閉';
  return`<div class="intro-modal opponent-profile-modal" id="opponent-profile-modal">
    <button class="intro-backdrop" id="opponent-profile-backdrop" aria-label="close"></button>
    <section class="intro-sheet opponent-profile-sheet">
      <header class="intro-head">
        <div>
          <h3 class="title-with-icon"><span class="title-icon title-icon-player" aria-hidden="true"></span><span>${esc(name)}</span><span class="opponent-gender-icon ${genderClass}" data-symbol="${genderIcon}" aria-label="${esc(genderLabel)}" title="${esc(genderLabel)}">${genderIcon}</span></h3>
        </div>
        <button id="opponent-profile-close" class="secondary">${closeLabel}</button>
      </header>
      <div class="opponent-profile-body">
        <div class="opponent-profile-header">
          <img class="opponent-profile-avatar" src="${avatarSrc}" alt="${esc(name)}"/>
          <div class="opponent-profile-header-text">
            <div class="opponent-profile-chips">
              <span class="opponent-chip"><span class="opponent-chip-icon zodiac" aria-hidden="true"></span><span>${t('zodiac')} ${zodiacMark?`${zodiacMark} `:''}${esc(zodiacText)}</span></span>
              <span class="opponent-chip"><span class="opponent-chip-icon dob" aria-hidden="true"></span><span>${t('dob')} ${esc(profile.dob)}</span></span>
              <span class="opponent-chip"><span class="opponent-chip-icon hobby" aria-hidden="true"></span><span>${t('hobbies')} ${esc(hobbyText)}</span></span>
            </div>
            <div class="opponent-profile-motto">
              <span class="opponent-chip-icon motto" aria-hidden="true"></span>
              <div>
                <div class="opponent-motto-label">${t('motto')}</div>
                <div class="opponent-motto-text">${esc(mottoText)}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="opponent-profile-details">
          <div class="opponent-profile-summary"><strong>${t('profile')}</strong></div>
          <div class="opponent-profile-paragraphs">${profileHtml}</div>
        </div>
      </div>
    </section>
  </div>`;
}
function renderGame(){
  const v=buildView();
  if(!v){state.screen='home';renderHome();return;}
  const intro=introText();
  const rightSidebarDesktop=window.matchMedia('(min-width: 1081px)').matches;
  const rightSidebarMobileLandscape=window.matchMedia('(max-width: 860px) and (orientation: landscape)').matches;
  const rightSidebarTabletLandscape=window.matchMedia('(min-width: 861px) and (max-width: 1080px) and (orientation: landscape)').matches;
  const fullHeightLogLayout=rightSidebarDesktop||rightSidebarMobileLandscape||rightSidebarTabletLandscape;
  const logUnderSouthPanel=window.matchMedia('(max-width: 1080px)').matches&&!rightSidebarMobileLandscape&&!rightSidebarTabletLandscape;
  if(!state.logTouched){
    state.showLog=logUnderSouthPanel?false:fullHeightLogLayout;
  }
  if(fullHeightLogLayout)state.showLog=true;
  if(!v.canControl||v.gameOver){state.recommendation=null;}
  if(state.recommendation?.action==='play'){
    const inHand=state.recommendation.cardIds.every((id)=>v.hand.some((c)=>cardId(c)===id));
    if(!inHand)state.recommendation=null;
  }
  const arr=v.participants.map((p)=>{
    const vi=seatView(p.seat,v.selfSeat);
    return{...p,rawName:p.name,name:botDisplay(p.name,p.isBot),viewIndex:vi,cls:seatCls[vi]};
  }).sort((a,b)=>a.viewIndex-b.viewIndex);
  const selected=v.hand.filter((c)=>state.selected.has(cardId(c)));
  const selEv=selected.length?evaluatePlay(selected):null;
  const canPlay=v.canControl&&selEv&&selEv.valid&&(!v.lastPlay||canBeat(selEv,v.lastPlay.eval))&&(!v.isFirstTrick||has3d(selected));
  const canReorder=!isMobilePointer()&&!v.gameOver&&v.hand.length>0;
  const canAutoSort=!v.gameOver&&v.hand.length>0;
  const selfScoreValue=v.mode==='solo'
    ?(state.solo.totals?.[0]??state.score)
    :(state.solo.totals?.[v.selfSeat]??state.score);
  const canSuggest=v.canControl;
  const showMust3Highlight=Boolean(v.canControl&&v.isFirstTrick&&!v.lastPlay&&has3d(v.hand)&&!has3d(selected));
  const self=arr.find((p)=>p.viewIndex===0);
  const youWin=Boolean(v.gameOver&&self&&self.count===0);
  const playTypeCall=currentPlayTypeCall(v);
  const roomTopMeta=(()=>{
    if(v.mode!=='room'||!state.room.data)return'';
    const baseRound=Number(state.room.data.roundCount||0);
    const status=String(state.room.data.status||'');
    const round=baseRound+(status==='playing'||status==='starting'?1:0);
    const countdown=roomCountdownText(state.room.data);
    return`<div class="room-top-meta">
      <span class="room-top-item"><span>${t('roomRound')}</span><strong>${Number.isFinite(round)?round:'-'}</strong></span>
      <span class="room-top-item"><span>${t('roomCountdown')}</span><strong id="room-countdown-value">${esc(countdown)}</strong></span>
    </div>`;
  })();
  const roomTopMetaPanel=roomTopMeta?`<div class="room-top-meta-panel">${roomTopMeta}</div>`:'';
  const roomTopMetaCenter=roomTopMeta?`<div class="room-top-meta-center">${roomTopMeta}</div>`:'';
  const playTypeFresh=Boolean(playTypeCallState.startedAt&&Date.now()-playTypeCallState.startedAt<260);
  const passCall=currentPassCall(v);
  const passCallFresh=Boolean(passCallState.startedAt&&Date.now()-passCallState.startedAt<260);
  const must3Call=currentMust3Call(v);
  const must3Fresh=Boolean(must3CallState.startedAt&&Date.now()-must3CallState.startedAt<260);
  const lastCardSeat=currentLastCardSeat(v);
  const lastCardFresh=Boolean(lastCardCallState.startedAt&&Date.now()-lastCardCallState.startedAt<260);
  const calloutCandidates=[];
  if(passCall)calloutCandidates.push({kind:'pass',seat:passCall.seat,text:passCall.text,fresh:passCallFresh,nonce:passCallState.nonce||passCallState.startedAt,startedAt:passCallState.startedAt});
  if(playTypeCall)calloutCandidates.push({kind:'play',seat:playTypeCall.seat,text:playTypeCall.text,fresh:playTypeFresh,nonce:playTypeCallState.nonce||playTypeCallState.startedAt,startedAt:playTypeCallState.startedAt});
  if(must3Call)calloutCandidates.push({kind:'must3',seat:must3Call.seat,text:must3Call.text,fresh:must3Fresh,nonce:must3CallState.nonce||must3CallState.startedAt,startedAt:must3CallState.startedAt});
  if(lastCardSeat!==null)calloutCandidates.push({kind:'last',seat:lastCardSeat,text:lastCardCallState.text||t('lastCardCall'),fresh:lastCardFresh,nonce:lastCardCallState.nonce||lastCardCallState.startedAt,startedAt:lastCardCallState.startedAt});
  const calloutPriority={must3:4,pass:3,play:2,last:1};
  const activeCallout=calloutCandidates.sort((a,b)=>(Number(b.startedAt)||0)-(Number(a.startedAt)||0)||(calloutPriority[b.kind]-calloutPriority[a.kind]))[0]??null;
  const hasSeatCallout=(seat)=>Boolean(calloutDisplayEnabled&&activeCallout&&activeCallout.seat===seat);
  const seatCalloutHtml=(seat,viewCls,color,isSelf=false)=>{
    const seatClass=isSelf?'play-type-call-self':'play-type-call-seat';
    const lastClass=isSelf?'last-card-call-self':'last-card-call-seat';
    const tailDir=isSelf?'south':viewCls==='north'?'north':viewCls==='east'?'east':viewCls==='west'?'west':'south';
    const textClass=String(activeCallout?.text??'').length>10?'hk-medium':'hk-text';
    const shouldMergeEmote=Boolean(!isSelf&&emoteSticker&&emoteSeat===seat&&hasSeatCallout(seat));
    const emoteInlineHtml=shouldMergeEmote?`<span class="emote-icon">${emoteImageHtml}</span>`:'';
    const calloutClass=shouldMergeEmote?' callout-with-emote':'';
    if(!calloutDisplayEnabled)return'';
    if(!activeCallout||activeCallout.seat!==seat)return'';
    if(activeCallout.kind==='pass'){
      const fresh='';
      const jitter=calloutJitterStyle(viewCls,`pass|${seat}|${activeCallout.nonce}|${activeCallout.text}`);
      return`<div class="play-type-call ${seatClass} pass-call${fresh}${calloutClass}" style="--player-color:${color};${jitter}"><div class="hk-inner">${emoteInlineHtml}<span class="${textClass}">${esc(activeCallout.text)}</span></div><div class="tail tail-${tailDir}"></div></div>`;
    }
    if(activeCallout.kind==='play'){
      const fresh=activeCallout.fresh?' play-type-call-fresh':'';
      const jitter=calloutJitterStyle(viewCls,`play|${seat}|${activeCallout.nonce}|${activeCallout.text}`);
      return`<div class="play-type-call ${seatClass}${fresh}${calloutClass}" style="--player-color:${color};${jitter}"><div class="hk-inner">${emoteInlineHtml}<span class="${textClass}">${esc(activeCallout.text)}</span></div><div class="tail tail-${tailDir}"></div></div>`;
    }
    if(activeCallout.kind==='must3'){
      const fresh=activeCallout.fresh?' play-type-call-fresh':'';
      const jitter=calloutJitterStyle(viewCls,`must3|${seat}|${activeCallout.nonce}|${activeCallout.text}`);
      return`<div class="play-type-call ${seatClass}${fresh}${calloutClass}" style="--player-color:${color};${jitter}"><div class="hk-inner">${emoteInlineHtml}<span class="${textClass}">${esc(activeCallout.text)}</span></div><div class="tail tail-${tailDir}"></div></div>`;
    }
    if(activeCallout.kind==='last'){
      const fresh=activeCallout.fresh?' last-card-call-fresh':'';
      const jitter=calloutJitterStyle(viewCls,`last|${seat}|${activeCallout.nonce}`);
      return`<div class="last-card-call ${lastClass}${fresh}${calloutClass}" style="--player-color:${color};${jitter}"><div class="hk-inner">${emoteInlineHtml}<span class="${textClass}">${esc(activeCallout.text)}</span></div><div class="tail tail-${tailDir}"></div></div>`;
    }
    return'';
  };
  const activeEmote=state.emote.active;
  const emoteSticker=activeEmote?EMOTE_STICKERS.find((x)=>x.id===activeEmote.id):null;
  const emoteSeat=(()=>{
    if(!emoteSticker)return null;
    const activeBy=String(activeEmote?.by||'');
    if(activeBy.startsWith('seat:')){
      const seat=Number(activeBy.slice(5));
      if(Number.isFinite(seat))return seat;
    }
    if(v.mode==='room'&&activeBy){
      const players=Array.isArray(state.solo.players)?state.solo.players:[];
      const idx=players.findIndex((p)=>String(p?.uid||'')===activeBy);
      if(idx>=0)return idx;
      const roster=Array.isArray(state.room.data?.players)?state.room.data.players:[];
      const entry=roster.find((p)=>String(p?.uid||'')===activeBy);
      const seat=Number(entry?.seat);
      if(Number.isFinite(seat))return seat;
    }
    return Number.isInteger(v.selfSeat)?v.selfSeat:0;
  })();
  const emoteImageHtml=emoteSticker
    ?`<img src="${withBase(`emotes/${emoteSticker.file}`)}" alt="${emoteSticker.id}"/>`
    :'';
  if(emoteSticker&&emoteSeat!==null&&hasSeatCallout(emoteSeat)){
    if(state.emote.active&&!state.emote.active.suppressCallout){
      state.emote.active={...state.emote.active,suppressCallout:true};
    }
  }
  const seatEmoteHtml=(seat,viewCls,color,isSelf=false)=>{
    if(!emoteSticker||emoteSeat===null||emoteSeat!==seat)return'';
    if(isSelf){
      return'';
    }
    if(state.emote.active?.suppressCallout)return'';
    const seatClass='play-type-call-seat';
    const tailDir=viewCls==='north'?'north':viewCls==='east'?'east':viewCls==='west'?'west':'south';
    const jitter=calloutJitterStyle(viewCls,`emote|${seat}|${activeEmote?.ts||0}|${emoteSticker.id}`);
    return`<div class="emote-callout ${seatClass}" data-emote-seat="${seat}" style="--player-color:${color};${jitter}"><div class="hk-inner"><span class="emote-icon">${emoteImageHtml}</span></div><div class="tail tail-${tailDir}"></div></div>`;
  };
  const emoteHtml=(emoteSticker&&Number.isInteger(v.selfSeat)&&emoteSeat===v.selfSeat)
    ?`<div class="table-emote emote-${emoteSticker.id}">${emoteImageHtml}</div>`
    :'';
  const lastActions=lastActionBySeat(v.history);
  const playKey=v.lastPlay?`${v.lastPlay.seat}-${v.lastPlay.cards.map(cardId).join(',')}`:'';
  if(playKey&&state.playAnimKey!==playKey)state.playAnimKey=playKey;
  const roomData=state.home.mode==='room'?state.room.data:null;
  const hostSeat=(()=>{
    if(!roomData)return null;
    const hostId=String(roomData.hostId||'').trim();
    if(!hostId)return null;
    const players=Array.isArray(roomData.players)?roomData.players:[];
    const host=players.find((p)=>String(p?.uid||'')===hostId);
    const seat=Number(host?.seat);
    return Number.isFinite(seat)?seat:null;
  })();
  const seatHtml=arr.filter((p)=>p.viewIndex!==0).map((p)=>{
    const active=v.currentSeat===p.seat&&!v.gameOver;
    const pColor=playerColorByViewClass(p.cls);
    const dangerLast=Boolean(!v.gameOver&&p.count===1);
    const isHostSeat=hostSeat!==null&&hostSeat===p.seat;
    const hostBadgeHtml=isHostSeat?`<span class="lobby-seat-host-badge">🚩</span>`:'';
    const badgeHtml=dangerLast
      ?`<span class="avatar-status-badge warning ${active?'danger':''}" aria-label="${esc(t('lastCardCall'))}"></span>`
      :(active?`<span class="avatar-status-badge turn" aria-label="${esc(t('wait'))}"></span>`:'');
    const fan=v.gameOver&&v.revealedHands?(v.revealedHands[p.seat]??[]).map((c)=>renderStaticCard(c,true,'flip-in')).join(''):renderBackCards(p.count,`${p.rawName||p.name}-${p.seat}`);
    const avatarSrc=p.picture?authPictureUrlFrom(p.picture):avatarDataUri(p.name,pColor,p.gender,p.isBot);
    const botNameAttr=p.isBot?` data-bot-name="${esc(p.name)}"`:'';
    const opponentAttr=p.isBot?` data-opponent-name="${esc(p.rawName||p.name)}"`:'';
    const langKey=state.language==='zh-HK'?'zh-HK':'en';
    const profile=OPPONENT_PROFILE_BY_NAME[p.rawName||p.name];
    const mottoText=profile?.motto?.[langKey]??profile?.motto?.['zh-HK']??'';
    const hintText='';
    const mottoClass=state.language==='en'?'hk-power-motto motto-en':'hk-power-motto';
    const mottoTilt=(() => {
      const seed=hashTextSeed(`${p.rawName||p.name}|motto`);
      const raw=(seed%11)-5; // -5..5
      return `${raw}deg`;
    })();
    const namecardBtn=p.isBot?`<button type="button" class="seat-namecard" data-opponent-name="${esc(p.rawName||p.name)}" aria-label="${esc(t('profile'))}">🪪</button>`:'';
    const labelName=`<div class="name"><span class="player-avatar-wrap player-avatar-wrap-opponent avatar-rim" style="--avatar-rim:${pColor};"><img class="player-avatar player-avatar-opponent ${avatarGenderClass(p.gender)}" style="--avatar-outline:${pColor};" src="${avatarSrc}" alt="${esc(p.name)}"${botNameAttr}/>${hostBadgeHtml}${badgeHtml}</span><span class="seat-identity"><span class="seat-name-text">${esc(p.name)}</span><span class="seat-subline">${p.score??0}</span>${namecardBtn}${mottoText?`<span class="seat-motto-callout play-type-call" style="--player-color:${pColor};--motto-tilt:${mottoTilt};"><span class="hk-motto-box"><span class="${mottoClass}">${esc(mottoText)}</span>${hintText?`<span class="hk-chinese-sub">${esc(hintText)}</span>`:''}</span><span class="tail tail-north"></span></span>`:''}</span></div>`;
    const peekActive=isMobilePointer()&&state.mottoPeekName===String(p.rawName||p.name);
    const outerLabel=`<div class="seat-name-fixed${peekActive?' motto-peek':''}"${opponentAttr}>${labelName}</div>`;
    const calloutHtml=seatCalloutHtml(p.seat,p.cls,pColor,false);
    const emoteHtml=seatEmoteHtml(p.seat,p.cls,pColor,false);
    const glass='border:1px solid rgba(255,255,255,.17) !important;background:linear-gradient(130deg, rgba(255,255,255,.10), rgba(255,255,255,.03)),rgba(8, 24, 38, .36) !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.16),0 1px 4px rgba(0,0,0,.1) !important;border-radius:12px !important;';
    const innerNoOutline='border:0 !important;box-shadow:none !important;background:transparent !important;';
    const shellStyle=`--player-color:${pColor};${glass}`;
    const sectionStyle=innerNoOutline;
    const seatAttrs=emoteSeat===p.seat?' data-seat-emote-active="1"':'';
    return`<div class="seat ${p.cls} ${active?'active':''}"${seatAttrs} style="${shellStyle}">${outerLabel}${calloutHtml}${emoteHtml}<div class="seat-pack seat-section" style="${sectionStyle}"><div class="opponent-fan ${opponentFanStyleByName(p.rawName||p.name)}">${fan}</div></div></div>`;
  }).join('');
  const selfScore=self?selfScoreValue:0;
  const selfName=self?self.name:t('name');
  const selfGender=self?.gender??state.home.gender??'male';
  const selfSeatColor=playerColorByViewClass('south');
  const selfAvatarSrc=selfAvatarDataUri(selfName,selfSeatColor,selfGender);
  const authPic=authPictureUrl();
  const useGoogleSelfAvatar=Boolean(state.home.google?.signedIn&&authPic&&selfAvatarSrc===authPic);
  const selfDangerLast=Boolean(!v.gameOver&&self&&self.count===1);
  const selfActive=Boolean(!v.gameOver&&self&&v.currentSeat===self.seat);
  const selfIsHost=hostSeat!==null&&self&&hostSeat===self.seat;
  const selfHostBadgeHtml=selfIsHost?`<span class="lobby-seat-host-badge">🚩</span>`:'';
  const selfBadgeHtml=selfDangerLast
    ?`<span class="avatar-status-badge warning ${selfActive?'danger':''}" aria-label="${esc(t('lastCardCall'))}"></span>`
    :(selfActive?`<span class="avatar-status-badge turn" aria-label="${esc(t('wait'))}"></span>`:'');
  const selfAvatar=`<span class="player-avatar-wrap player-avatar-wrap-self avatar-rim" style="--avatar-rim:${selfSeatColor};"><img id="self-avatar-img" class="player-avatar player-avatar-self ${avatarGenderClass(selfGender)} ${useGoogleSelfAvatar?'player-avatar-google':''}" style="--avatar-outline:${selfSeatColor};" src="${selfAvatarSrc}" data-fallback="${selfGender==='female'?AVATAR_BASE_SRC.female:AVATAR_BASE_SRC.male}" alt="${esc(selfName)}"/>${selfHostBadgeHtml}${selfBadgeHtml}</span>`;
  let selfCalloutHtml=self?seatCalloutHtml(self.seat,'south',selfSeatColor,true):'';
  const selfEmoteHtml=self?seatEmoteHtml(self.seat,'south',selfSeatColor,true):'';
  if(selfEmoteHtml)selfCalloutHtml+=selfEmoteHtml;
  const isMobile=isMobilePointer();
  const mobileNamesHtml='';
  const mobileDiscardHtml='';
  const logToggleStateIcon=state.showLog?'▾':'▸';
  const logToggleStateText=state.showLog?(state.language==='zh-HK'?'收起':'Collapse'):(state.language==='zh-HK'?'展開':'Expand');
  const isRecPass=state.recommendHint===t('recPass');
  const isRecEmpty=state.recommendHint===t('noSuggest');
  const showRecommendHint=Boolean(state.recommendHint)&&!isRecPass;
  const isRecPlay=state.recommendation?.action==='play';
  const emotePanel=state.emote.open?`<div class="emote-panel">${EMOTE_STICKERS.map((s)=>`<button class="emote-btn" data-emote-id="${s.id}" type="button"><img src="${withBase(`emotes/${s.file}`)}" alt="${s.id}"/><span class="emote-btn-label">${esc(t(`emoteLabel${s.id[0].toUpperCase()}${s.id.slice(1)}`))}</span></button>`).join('')}</div>`:'';
  app.innerHTML=`<section class="game-shell ${v.gameOver?'game-over':''} ${state.showLog?'log-open':''}"><div class="main-zone"><header class="topbar"><div class="game-title-wrap"><span class="game-logo-block"><img class="title-logo title-logo-game" src="${withBase('title-lockup-game.png')}" alt="鋤大D TRADITIONAL BIG TWO"/><img class="game-flag" src="${withBase('hk-flag-apple.png')}" alt="Hong Kong flag"/></span>${roomTopMeta}</div><div class="topbar-right"><div class="control-row"><button id="lang-toggle" class="secondary">${state.language==='zh-HK'?'EN':'中'}</button><button id="game-intro-toggle" class="secondary">${esc(intro.btnShow)}</button><button id="score-guide-toggle" class="secondary">${t('scoreGuide')}</button><button id="game-lb-toggle" class="secondary">${t('lb')}</button><button id="home-btn" class="secondary">${t('home')}</button><button id="restart-btn" class="primary">${t('restart')}</button></div></div></header><section class="table">${seatHtml}<div class="table-center-stack">${mobileNamesHtml}${mobileDiscardHtml}${centerMovesHtml(v)}${centerLastMovesHtml(lastActions,v.selfSeat)}${emoteHtml}</div>${(!v.gameOver&&youWin)?`<div class="win-celebrate"><div class="confetti-layer"></div><div class="win-banner">${t('congrats')}</div></div>`:''}</section><section class="action-zone"><div class="action-strip ${v.canControl&&!v.gameOver?'active':''}" style="--player-color:${playerColorByViewClass('south')};"><div class="seat-name-fixed player-tag"><div class="name">${selfAvatar}<span class="seat-identity"><span class="seat-name-text">${esc(selfName)}</span><span class="seat-subline">${selfScore}</span></span></div></div>${selfCalloutHtml}<div class="control-row"><button id="play-btn" class="primary game-cta-btn ${isRecPlay?'recommend-glow-play':''}" ${canPlay?'':'disabled'}><span aria-hidden="true">▶</span><span>${t('play')}</span></button><button id="pass-btn" class="danger game-cta-btn ${isRecPass?'recommend-glow':''}" ${v.canPass?'':'disabled'}><span aria-hidden="true">✖</span><span>${t('pass')}</span></button><span class="recommend-anchor"><button id="suggest-btn" class="secondary game-cta-btn" ${canSuggest?'':'disabled'}><span aria-hidden="true">💡</span><span>${t('suggest')}</span></button>${showRecommendHint?`<span class="recommend-layer"><span class="hint recommend-hint ${isRecEmpty?'rec-empty':''}"><span class="recommend-bulb" aria-hidden="true">💡</span><span>${esc(state.recommendHint)}</span></span></span>`:''}</span><button id="emote-toggle" class="secondary game-cta-btn emote-toggle" type="button"><span aria-hidden="true">😆</span><span>${t('emote')}</span></button><button id="auto-sort-btn" class="secondary game-cta-btn auto-sort-btn" ${canAutoSort?'':'disabled'}><svg class="sort-icon" aria-hidden="true" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.430.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.980-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/><path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192"/></svg></button></div>${emotePanel}<div class="hand">${v.hand.map((c,i)=>renderHandCard(c,state.selected.has(cardId(c)),(showMust3Highlight&&isLowestSingle(c))?'must3-highlight':'',i+1)).join('')}</div><div class="drag-popup" id="drag-popup">${t('drag')}</div></div></section>${v.gameOver?'':congratsOverlayHtml(v,youWin)}${revealHtml(v,arr)}</div><aside class="side-zone ${state.showLog?'':'log-collapsed'}"><section class="side-card log-side-card ${state.showLog?'':'collapsed'}"><h3 id="log-toggle" class="log-toggle-title title-with-icon" aria-expanded="${state.showLog?'true':'false'}" aria-label="${esc(logToggleStateText)}"><span class="title-icon title-icon-log" aria-hidden="true"></span><span>${t('log')}</span><span class="log-toggle-state" aria-hidden="true">${logToggleStateIcon}</span></h3><div class="history-list">${historyHtml(v.history,v.selfSeat,v.systemLog)}</div></section></aside>${v.gameOver?resultScreenHtml(v,arr):''}${state.opponentProfileName?opponentProfileModalHtml(state.opponentProfileName):''}${state.showScoreGuide?scoreGuideModalHtml():''}${state.home.showIntro?introPanelHtml():''}${state.home.showLeaderboard?leaderboardModalHtml():''}</section>`;
  positionRoomTopMeta();
  bindRoomTopMetaLayout();
  observeDiscardSize();
  document.body.setAttribute('data-web-too-small','0');
  document.body.removeAttribute('data-web-too-small-msg');
  document.getElementById('web-too-small-overlay')?.remove();
  document.getElementById('tap-debug')?.remove();
  if(document.body.dataset.tapDebugBound){
    delete document.body.dataset.tapDebugBound;
  }
  document.getElementById('self-avatar-img')?.addEventListener('error',(e)=>{
    const img=e?.target;
    if(!(img instanceof HTMLImageElement))return;
    const fallback=String(img.dataset.fallback??'').trim();
    if(!fallback||img.src===fallback)return;
    img.src=fallback;
    img.classList.remove('player-avatar-google');
  },{once:true});
  bindGameEvents(v,arr);
  requestAnimationFrame(()=>{
    syncDiscardSizeFromHand();
    syncHandStackMode();
    retargetCalloutTails();
    setTimeout(retargetCalloutTails,80);
  });
  if(v.mode==='room'&&!v.gameOver){
    maybeRunRoomAi();
  }
}
function retargetCalloutTails(){
  const bubbles=[...document.querySelectorAll('.play-type-call, .last-card-call, .emote-callout')];
  const vw=Math.max(0,window.innerWidth||0);
  const vh=Math.max(0,window.innerHeight||0);
  const margin=8;
  for(const bubble of bubbles){
    if(!(bubble instanceof HTMLElement))continue;
    const tail=bubble.querySelector('.tail');
    if(!(tail instanceof HTMLElement))continue;
    let avatar=null;
    if(bubble.classList.contains('play-type-call-self')||bubble.classList.contains('last-card-call-self')){
      avatar=document.querySelector('.player-avatar-wrap-self')||document.getElementById('self-avatar-img');
    }else{
      const seat=bubble.closest('.seat');
      avatar=seat?.querySelector('.player-avatar-wrap-opponent, .player-avatar-opponent')??null;
    }
    if(!(avatar instanceof HTMLElement))continue;
    const b=bubble.getBoundingClientRect();
    const a=avatar.getBoundingClientRect();
    const bx=b.left+b.width/2;
    const by=b.top+b.height/2;
    const ax=a.left+a.width/2;
    const ay=a.top+a.height/2;
    const dx=ax-bx;
    const dy=ay-by;
    let dir='south';
    if(Math.abs(dx)>Math.abs(dy)){
      dir=dx<0?'west':'east';
    }else{
      dir=dy<0?'north':'south';
    }
    tail.classList.remove('tail-north','tail-south','tail-east','tail-west');
    tail.classList.add(`tail-${dir}`);
    let sx=0;
    let sy=0;
    if(vw&&vh){
      if(b.left<margin)sx=margin-b.left;
      else if(b.right>vw-margin)sx=(vw-margin)-b.right;
      if(b.top<margin)sy=margin-b.top;
      else if(b.bottom>vh-margin)sy=(vh-margin)-b.bottom;
    }
    if(sx||sy){
      bubble.style.setProperty('--callout-shift-x',`${sx.toFixed(1)}px`);
      bubble.style.setProperty('--callout-shift-y',`${sy.toFixed(1)}px`);
    }else{
      bubble.style.removeProperty('--callout-shift-x');
      bubble.style.removeProperty('--callout-shift-y');
    }
  }
}
function syncHandStackMode(){
  const hand=document.querySelector('.action-strip .hand');
  if(!(hand instanceof HTMLElement))return;
  const cards=[...hand.querySelectorAll('.hand-card')];
  hand.classList.remove('hand-stacked');
  hand.style.removeProperty('--hand-overlap-px');
  hand.style.setProperty('overflow-x','hidden','important');
  if(cards.length<2)return;
  const first=cards[0];
  const last=cards[cards.length-1];
  if(!(first instanceof HTMLElement)||!(last instanceof HTMLElement))return;
  const count=cards.length;
  const cardW=first.getBoundingClientRect().width;
  const hs=window.getComputedStyle(hand);
  const gap=Number.parseFloat(hs.columnGap||hs.gap||'0')||0;
  const available=hand.clientWidth||hand.getBoundingClientRect().width;
  const natural=(cardW*count)+(gap*Math.max(0,count-1));
  if(!(natural>available+0.5))return;

  let overlap=(natural-available)/(count-1);
  const maxOverlap=Math.max(0,(cardW+gap)-1);
  overlap=Math.max(0,Math.min(overlap,maxOverlap));

  // If fitting requires extreme overlap, fall back to horizontal scroll.
  const comfortLimit=Math.max(0,cardW*0.82);
  if(overlap>comfortLimit){
    hand.style.setProperty('overflow-x','auto','important');
    hand.style.setProperty('-webkit-overflow-scrolling','touch');
    return;
  }

  hand.classList.add('hand-stacked');
  hand.style.setProperty('--hand-overlap-px',`${overlap.toFixed(2)}px`);

  // Measure actual rendered span and correct small browser rounding errors (both overflow and gap).
  const handRect=hand.getBoundingClientRect();
  const firstRect=first.getBoundingClientRect();
  const lastRect=last.getBoundingClientRect();
  const used=Math.max(0,lastRect.right-firstRect.left);
  const delta=used-handRect.width;
  if(Math.abs(delta)>0.75){
    overlap+=delta/(count-1);
    overlap=Math.max(0,Math.min(overlap,maxOverlap));
    hand.style.setProperty('--hand-overlap-px',`${overlap.toFixed(2)}px`);
  }
  const overflowRight=last.getBoundingClientRect().right-handRect.right;
  if(overflowRight>0.5){
    overlap+=((overflowRight+0.5)/(count-1));
    overlap=Math.max(0,Math.min(overlap,maxOverlap));
    hand.style.setProperty('--hand-overlap-px',`${overlap.toFixed(2)}px`);
  }
}
function reorderCurrent(v,fromId,toId){
  const seat=Number.isInteger(v?.selfSeat)?v.selfSeat:0;
  if(!state.solo.players?.[seat])return;
  state.solo.players[seat].hand=reorderById(state.solo.players[seat].hand,fromId,toId,cardId);
}
function autoArrangeCurrent(v,mode='seq'){
  const seat=Number.isInteger(v?.selfSeat)?v.selfSeat:0;
  if(!state.solo.players?.[seat])return;
  state.solo.players[seat].hand=mode==='pattern'?patternSortCards(state.solo.players[seat].hand):[...state.solo.players[seat].hand].sort(cmpCard);
}

function bindGameEvents(v,arr){
  const canReorder=!isMobilePointer()&&!v.gameOver&&v.hand.length>0;
  const canAutoSort=!v.gameOver&&v.hand.length>0;
  const dragEnabled=canReorder&&!isMobilePointer();
  let dragPopupTimer=null;
  let dragPopupActive=false;
  const popupEl=()=>document.getElementById('drag-popup');
  const positionDragPopup=(x,y)=>{
    const el=popupEl();
    if(!el)return;
    const offset=18;
    el.style.left=`${Math.round(x+offset)}px`;
    el.style.top=`${Math.round(y+offset)}px`;
  };
  const hideDragPopup=()=>{
    const el=popupEl();
    if(dragPopupTimer){clearTimeout(dragPopupTimer);dragPopupTimer=null;}
    el?.classList.remove('show');
    dragPopupActive=false;
  };
  const showDragPopup=(autoHideMs=0)=>{
    const el=popupEl();
    if(!el)return;
    if(dragPopupTimer){clearTimeout(dragPopupTimer);dragPopupTimer=null;}
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    dragPopupActive=true;
    if(autoHideMs>0){
      dragPopupTimer=window.setTimeout(()=>{dragPopupTimer=null;popupEl()?.classList.remove('show');},autoHideMs);
    }
  };
  const runPass=()=>{
    if(!v.canPass)return;
    state.recommendation=null;
    setRecommendHint('');
    if(v.mode==='room'){
      state.selected.clear();
      render();
      void roomSubmitPass();
    }else{
      soloPass(0);
      state.selected.clear();
      render();
      maybeRunSoloAi();
    }
  };
  const runPlay=async(cards)=>{
    if(!v.canControl)return;
    setRecommendHint('');
    if(!cards.length){
      if(v.mode==='solo'){setSoloStatus(t('pick'));render();}
      return;
    }
    state.recommendation=null;
    if(v.mode==='room'){
      const ev=evaluatePlay(cards);
      if(!ev.valid){
        setSoloStatus(ev.reason||t('illegal'));
        render();
        return;
      }
      if(v.isFirstTrick&&!has3d(cards)){
        setSoloStatus(t('must3'));
        render();
        return;
      }
      if(v.lastPlay&&!canBeat(ev,v.lastPlay.eval)){
        setSoloStatus(t('beat'));
        render();
        return;
      }
      const ok=await roomSubmitPlay(cards);
      if(ok){
        state.selected.clear();
        render();
      }
    }else{
      const ok=soloApplyPlay(0,cards);
      if(ok){
        state.selected.clear();
        render();
        maybeRunSoloAi();
      }else render();
    }
  };
  const triggerClickBanner=(el)=>{
    if(!(el instanceof HTMLElement))return;
    el.classList.remove('click-banner');
    void el.offsetWidth;
    el.classList.add('click-banner');
    setTimeout(()=>{el.classList.remove('click-banner');},520);
  };

  document.getElementById('lang-toggle')?.addEventListener('click',()=>{state.language=state.language==='zh-HK'?'en':'zh-HK';relabelSoloBots();render();});
  document.getElementById('intro-close')?.addEventListener('click',()=>{state.home.showIntro=false;render();});
  document.getElementById('intro-backdrop')?.addEventListener('click',()=>{state.home.showIntro=false;render();});
  document.getElementById('lb-close')?.addEventListener('click',()=>{state.home.showLeaderboard=false;render();});
  document.getElementById('lb-backdrop')?.addEventListener('click',()=>{state.home.showLeaderboard=false;render();});
  document.getElementById('lb-sort')?.addEventListener('change',(e)=>{state.home.leaderboard.sort=e.target.value;refreshLeaderboard();render();});
  document.getElementById('lb-period')?.addEventListener('change',(e)=>{state.home.leaderboard.period=e.target.value;refreshLeaderboard();render();});
  if(!topbarDelegateBound){
    document.body.addEventListener('click',handleGameTopbarClick,true);
    topbarDelegateBound=true;
  }
  if(!opponentProfileDelegateBound){
    document.body.addEventListener('click',(e)=>{
      const btn=e.target.closest?.('#opponent-profile-close,#opponent-profile-backdrop');
      if(!btn)return;
      e.preventDefault();
      state.opponentProfileName='';
      render();
    });
    opponentProfileDelegateBound=true;
  }
  document.getElementById('home-btn')?.addEventListener('click',()=>{
    if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}
    state.opponentProfileName='';
    if(state.home.mode==='room'&&state.room.id){
      void leaveRoom();
      return;
    }
    state.screen='home';
    state.selected.clear();
    state.recommendation=null;
    setRecommendHint('');
    render();
  });
  document.getElementById('result-home')?.addEventListener('click',()=>{if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}state.opponentProfileName='';if(state.home.mode==='room'&&state.room.id){void leaveRoom();return;}state.screen='home';state.selected.clear();state.recommendation=null;setRecommendHint('');render();});
  document.getElementById('congrats-home')?.addEventListener('click',()=>{if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}state.opponentProfileName='';if(state.home.mode==='room'&&state.room.id){void leaveRoom();return;}state.screen='home';state.selected.clear();state.recommendation=null;setRecommendHint('');render();});
  document.getElementById('log-toggle')?.addEventListener('click',(ev)=>{
    ev.preventDefault();
    const lockOpen=window.matchMedia('(min-width: 1081px)').matches||window.matchMedia('(min-width: 861px) and (max-width: 1080px) and (orientation: landscape)').matches||window.matchMedia('(max-width: 860px) and (orientation: landscape)').matches;
    if(lockOpen){
      if(!state.showLog){
        state.showLog=true;
        state.logTouched=false;
        render();
      }
      return;
    }
    const x=window.scrollX;
    const y=window.scrollY;
    const appEl=document.getElementById('app');
    const appTop=appEl instanceof HTMLElement?appEl.scrollTop:0;
    const appLeft=appEl instanceof HTMLElement?appEl.scrollLeft:0;
    state.showLog=!state.showLog;
    state.logTouched=true;
    render();
    const restore=()=>{
      if(appEl instanceof HTMLElement){
        appEl.scrollTop=appTop;
        appEl.scrollLeft=appLeft;
      }
      window.scrollTo(x,y);
    };
    requestAnimationFrame(restore);
    setTimeout(restore,0);
  });
  document.getElementById('score-guide-close')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('score-guide-backdrop')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('opponent-profile-close')?.addEventListener('click',()=>{state.opponentProfileName='';render();});
  document.getElementById('opponent-profile-backdrop')?.addEventListener('click',()=>{state.opponentProfileName='';render();});
  document.getElementById('restart-btn')?.addEventListener('click',async()=>{
    triggerClickBanner(document.getElementById('restart-btn'));
    await waitMs(120);
    state.opponentProfileName='';
    state.recommendation=null;
    setRecommendHint('');
    startSoloGame();
  });
  document.getElementById('result-again')?.addEventListener('click',async()=>{
    triggerClickBanner(document.getElementById('result-again'));
    await waitMs(120);
    state.opponentProfileName='';
    state.recommendation=null;
    setRecommendHint('');
    if(state.home.mode==='room'){
      if(roomIsHost()){
        await restartRoomGame();
      }else{
        await setRoomReady(true);
        setSoloStatus(t('roomReadyHint'));
        render();
      }
      return;
    }
    startSoloGame();
  });
  document.getElementById('congrats-again')?.addEventListener('click',async()=>{
    triggerClickBanner(document.getElementById('congrats-again'));
    await waitMs(120);
    state.opponentProfileName='';
    state.recommendation=null;
    setRecommendHint('');
    if(state.home.mode==='room'){
      if(roomIsHost()){
        await restartRoomGame();
      }else{
        await setRoomReady(true);
        setSoloStatus(t('roomReadyHint'));
        render();
      }
      return;
    }
    startSoloGame();
  });
  document.getElementById('auto-sort-btn')?.addEventListener('click',()=>{
    if(!canAutoSort)return;
    const mode=autoSortMode;
    autoArrangeCurrent(v,mode);
    autoSortMode=mode==='seq'?'pattern':'seq';
    render();
  });
  document.getElementById('suggest-btn')?.addEventListener('click',()=>{
    if(!v.canControl)return;
    if(state.recommendation){
      if(state.recommendation.action==='pass'){
        setRecommendHint('');
        setRecommendHint(t('recPass'));
        playSound('select');
        render();
        return;
      }
      state.recommendation=null;
      state.selected.clear();
      setRecommendHint('');
      render();
      return;
    }
    if(shouldRecommendPass(v.hand,v.lastPlay,v.isFirstTrick,v.canPass,state.solo)){
      state.recommendation={action:'pass',cardIds:[]};
      state.selected.clear();
      setRecommendHint(t('recPass'));
      playSound('select');
      render();
      return;
    }
    const rec=suggestPlay(v.hand,v.lastPlay,v.isFirstTrick,state.solo);
    if(!rec){
      setRecommendHint(t('noSuggest'));
      render();
      return;
    }
    const ids=rec.cards.map(cardId);
    state.recommendation={action:'play',cardIds:ids};
    state.selected=new Set(ids);
    playSound('select');
    render();
  },()=>{
    setRoomError(t('roomReconnecting'));
    render();
  });
  document.getElementById('emote-toggle')?.addEventListener('click',()=>{
    if(v.gameOver)return;
    openEmotePicker(!state.emote.open);
  });
  app.querySelectorAll('[data-emote-id]').forEach((el)=>{
    const id=el.getAttribute('data-emote-id');
    if(!id)return;
    el.addEventListener('click',()=>{
      if(v.gameOver)return;
      triggerEmoteSticker(id);
    });
  });
  app.querySelectorAll('[data-card-id]').forEach((n)=>{
    const id=n.getAttribute('data-card-id');
    let pointerTapActive=false;
    let pointerTapId=-1;
    let pointerStartX=0;
    let pointerStartY=0;
    let touchTapActive=false;
    let touchStartX=0;
    let touchStartY=0;
    const toggleSelect=()=>{
      unlockAudio();
      if(!v.canControl||!id)return;
      if(state.drag.moved){state.drag.moved=false;return;}
      if(state.selected.has(id))state.selected.delete(id);else state.selected.add(id);
      playSound('select');
      render();
    };
    n.addEventListener('mouseenter',()=>{if(!dragEnabled||!id)return;playSound('select');});
    n.addEventListener('dragstart',(e)=>{
      if(!dragEnabled||!id)return;
      state.drag.id=id;
      state.drag.moved=false;
      positionDragPopup(e.clientX,e.clientY);
      showDragPopup();
      e.dataTransfer?.setData('text/plain',id);
    });
    n.addEventListener('dragover',(e)=>{
      if(!dragEnabled)return;
      e.preventDefault();
      if(dragPopupActive)positionDragPopup(e.clientX,e.clientY);
    });
    n.addEventListener('drop',(e)=>{if(!dragEnabled||!id)return;e.preventDefault();hideDragPopup();const fromId=state.drag.id||e.dataTransfer?.getData('text/plain');if(!fromId||fromId===id)return;reorderCurrent(v,fromId,id);state.drag.moved=true;render();});
    n.addEventListener('dragend',()=>{hideDragPopup();setTimeout(()=>{state.drag.id=null;},0);});
    if(isMobilePointer()){
      if(window.PointerEvent){
        n.addEventListener('pointerdown',(e)=>{
          if(e.pointerType==='mouse')return;
          hideDragPopup();
          pointerTapActive=true;
          pointerTapId=e.pointerId;
          pointerStartX=e.clientX;
          pointerStartY=e.clientY;
        });
        n.addEventListener('pointerup',(e)=>{
          if(e.pointerType==='mouse')return;
          if(!pointerTapActive||e.pointerId!==pointerTapId)return;
          pointerTapActive=false;
          const moved=Math.hypot(e.clientX-pointerStartX,e.clientY-pointerStartY);
          if(moved>12)return;
          e.preventDefault();
          mobileTapAt=Date.now();
          toggleSelect();
        });
        n.addEventListener('pointercancel',()=>{pointerTapActive=false;hideDragPopup();});
      }else{
        n.addEventListener('touchstart',(e)=>{
          hideDragPopup();
          const t=e.changedTouches?.[0];
          if(!t)return;
          touchTapActive=true;
          touchStartX=t.clientX;
          touchStartY=t.clientY;
        },{passive:true});
        n.addEventListener('touchend',(e)=>{
          if(!touchTapActive)return;
          touchTapActive=false;
          const t=e.changedTouches?.[0];
          if(!t)return;
          const moved=Math.hypot(t.clientX-touchStartX,t.clientY-touchStartY);
          if(moved>12)return;
          e.preventDefault();
          mobileTapAt=Date.now();
          toggleSelect();
        },{passive:false});
        n.addEventListener('touchcancel',()=>{touchTapActive=false;hideDragPopup();},{passive:true});
      }
    }
    n.addEventListener('click',(e)=>{
      if(isMobilePointer()&&Date.now()-mobileTapAt<500){
        e.preventDefault();
        return;
      }
      toggleSelect();
    });
  });

  document.addEventListener('dragover',(e)=>{
    if(!dragEnabled||!dragPopupActive)return;
    positionDragPopup(e.clientX,e.clientY);
  },{passive:true});

  app.querySelectorAll('[data-opponent-name]').forEach((el)=>{
    const name=el.getAttribute('data-opponent-name');
    if(!name)return;
    el.addEventListener('click',(ev)=>{
      ev.preventDefault();
      ev.stopPropagation();
      const directProfile=Boolean(ev.target?.closest?.('.seat-namecard'));
      if(isMobilePointer()&&!directProfile){
        if(state.mottoPeekName!==name){
          state.mottoPeekName=name;
          render();
          return;
        }
        state.mottoPeekName='';
      }
      state.opponentProfileName=name;
      render();
    });
  });
  app.querySelectorAll('.seat-motto-callout').forEach((el)=>{
    el.addEventListener('click',(ev)=>{
      const host=el.closest?.('[data-opponent-name]');
      const name=host?.getAttribute('data-opponent-name');
      if(!name)return;
      ev.preventDefault();
      ev.stopPropagation();
      state.mottoPeekName='';
      state.opponentProfileName=name;
      render();
    });
  });

  document.getElementById('pass-btn')?.addEventListener('click',()=>{unlockAudio();runPass();});
  document.getElementById('play-btn')?.addEventListener('click',()=>{unlockAudio();const cards=v.hand.filter((c)=>state.selected.has(cardId(c)));void runPlay(cards);});
}

function render(){
  if(state.screen==='home'&&location.hash==='#opponents'){
    state.screen='opponents';
  }
  applyTheme();
  document.title=EFFECTIVE_ENV==='PROD'?`${t('title')}`:`${t('title')} - ${EFFECTIVE_ENV}`;
  document.body.setAttribute('data-screen',state.screen);
  document.body.setAttribute('data-ios',isIOSDevice()?'1':'0');
  document.body.setAttribute('data-is-mobile',isMobilePointer()?'1':'0');
  document.body.setAttribute('data-log-open',state.screen==='game'&&state.showLog?'1':'0');
  syncWebViewportGuardAttrs();
  syncRoomCountdownTicker();
  if(shouldBlockLandscapeMobile()){
    renderOrientationBlock();
    return;
  }
  if(state.screen==='home'){renderHome();return;}
  if(state.screen==='config'){renderConfig();return;}
  if(state.screen==='opponents'){renderOpponents();return;}
  renderGame();
}
function syncViewport(){
  const root=document.documentElement;
  const short=Math.min(window.innerWidth,window.innerHeight);
  const scale=Math.max(0.74,Math.min(1.1,short/520));
  root.style.setProperty('--card-scale',scale.toFixed(3));
  const orientation=window.matchMedia('(orientation: portrait)').matches?'portrait':'landscape';
  const orientationChanged=Boolean(lastOrientation)&&orientation!==lastOrientation;
  lastOrientation=orientation;
  document.body.setAttribute('data-orientation',orientation);
  syncWebViewportGuardAttrs();
  root.style.setProperty('--table-tilt','0deg');
  const blocked=shouldBlockLandscapeMobile();
  if(blocked!==orientationBlockActive){
    orientationBlockActive=blocked;
    if(orientationChanged&&state.screen==='game'){
      state.logTouched=false;
    }
    render();
    return;
  }
  if(orientationChanged&&state.screen==='game'){
    state.logTouched=false;
    render();
  }
  requestAnimationFrame(syncDiscardSizeFromHand);
  requestAnimationFrame(syncHandStackMode);
}

window.addEventListener('resize',syncViewport);
window.addEventListener('orientationchange',syncViewport);
const bootstrapAudioAndSpeech=()=>{unlockAudio();primeSpeech();};
document.addEventListener('pointerdown',bootstrapAudioAndSpeech,{once:true});
document.addEventListener('touchstart',bootstrapAudioAndSpeech,{once:true,passive:true});
document.addEventListener('click',bootstrapAudioAndSpeech,{once:true});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&aiTimer){
    clearTimeout(aiTimer);
    aiTimer=null;
  }else if(!document.hidden){
    void touchRoomPresence(true);
    unlockAudio();
    if(state.screen==='game'){
      calloutSpeechActive=false;
      calloutSpeechUntil=0;
      calloutSpeechEndedAt=Date.now();
      calloutResumePending=false;
      if(state.home.mode==='room')maybeRunRoomAi();
      else maybeRunSoloAi();
      render();
    }
  }
});
window.addEventListener('load',()=>{if(state.screen==='home')queueGoogleInlineRender();},{once:true});
loadGoogleSession();bootFirebase();syncViewport();render();
