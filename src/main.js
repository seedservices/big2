const RANKS=['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
const SUITS=[
  {symbol:'\u2666',red:true},
  {symbol:'\u2663',red:false},
  {symbol:'\u2665',red:true},
  {symbol:'\u2660',red:false}
];
const FIVE_KIND_POWER={straight:0,flush:1,fullhouse:2,fourofkind:3,straightflush:4};

const I18N={
  'zh-HK':{
    title:'鋤大D',
    sub:'',
    lang:'語言 / Language',
    zh:'繁體中文',
    en:'English',
    name:'玩家名稱',
    ai:'對手難度',
    gender:'性別',
    male:'男',
    female:'女',
    easy:'初級',
    normal:'中級',
    hard:'高級',
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
    must3:'首圈第一手必須包含♦階磚3。',
    beat:'你所選牌未能大過上手。',
    cantPass:'話事中不可過牌。',
    retake:'重新話事。',
    pick:'請先揀牌。',
    pair:'雙牌必須同點數。',
    triple:'三條必須同點數。',
    count:'只可出1、2、3或5張。',
    five:'五張牌只接受蛇、花、俘佬、四條、同花順。',
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
    scoreTopTwo:'有頂大♠黑桃2',
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
    scoreGuideTitle:'計分方法',
    scoreGuideItems:[
      '所有玩家起始 5000 分。',
      '有人出清手牌即勝出該局。',
      '基本計分：輸家按剩餘張數扣分：1-9 張 x1、10-12 張 x2、13 張 x3。',
      '加乘罰則：持有任意 2 再 x2；持有 ♠黑桃2（頂大）再 x2，可疊乘。',
      '最後一張規則：若上家冇頂大而令下家出清，上家需兼負其餘兩家輸分。',
      '所有輸家扣分總和加到贏家。'
    ]
  },
  en:{
    title:'Big Two',
    sub:'',
    lang:'Language',
    zh:'Traditional Chinese',
    en:'English',
    name:'Player Name',
    ai:'Opponent Difficulty',
    gender:'Gender',
    male:'Male',
    female:'Female',
    easy:'Beginner',
    normal:'Intermediate',
    hard:'Advanced',
    solo:'Start',
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
      'Pairs follow the single-card rule: must beat the previous pair. Example: ♥A♠A beats ♥K♠K. If ranks are the same, compare the higher suit.',
      'Triple (three cards must be the same rank)',
      'Five-card hands',
      'Straight: five consecutive ranks. A-2-3-4-5 is the highest, 3-4-5-6-7 is the lowest. If two straights have the same ranks, compare the suit of the highest card. Straights cannot be J-Q-K-A-2, Q-K-A-2-3, or K-A-3-4-5.',
      'Flush: any five cards of the same suit that are not consecutive. Compare by the highest rank, then the second highest, and so on; finally compare suit if still tied. Example: ♠2-4-5-6-8 beats ♥A-K-Q-10-8.',
      'Full House: a pair plus three of a kind. Compare by the triple rank.',
      'Four of a Kind: four cards of the same rank plus any single. Compare by the four-card rank.',
      'Straight Flush (Royal Flush): a straight in the same suit. The highest straight flush is ♠A-2-3-4-5.',
      'Hand order: Straight < Flush < Full House < Four of a Kind < Straight Flush.'
    ],
    wait:'Waiting...',
    free:'No active hand. Lead may play any valid set.',
    last:'Last',
    recentCard:'Recent Card',
    reveal:'Showdown',
    revealSub:'Winner decided. Remaining cards are revealed:',
    drag:'Drag cards to resequence your hand',
    must3:'First turn must include \u2666Diamond 3.',
    beat:'Your selection does not beat last play.',
    cantPass:'Cannot pass while holding lead.',
    retake:'regains lead.',
    pick:'Select cards first.',
    pair:'Pair must match rank.',
    triple:'Triple must match rank.',
    count:'Only 1,2,3,5 cards allowed.',
    five:'Invalid five-card hand.',
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
    scoreTopTwo:'Has top ♠Spade 2',
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
    scoreGuideTitle:'Scoring Method',
    scoreGuideItems:[
      'All players start at 5000 points.',
      'A round ends when one player empties their hand.',
      'Base scoring for losers by remaining cards: 1-9 cards x1, 10-12 cards x2, 13 cards x3.',
      'Multiplier penalties: holding any 2 applies x2; holding ♠Spade 2 (top 2) applies another x2; multipliers stack.',
      'Last-card rule: if you fail to top against a next player on 1 card and they win, you also absorb the other two losers\' deductions.',
      'Total deductions from all losers are added to the winner.'
    ]
  }
};
const KIND={
  'zh-HK':{single:'單張',pair:'一對',triple:'三條',straight:'蛇',flush:'花',fullhouse:'俘佬',fourofkind:'四條',straightflush:'同花順'},
  en:{single:'Single',pair:'Pair',triple:'Triple',straight:'Straight',flush:'Flush',fullhouse:'Full House',fourofkind:'Four Kind',straightflush:'Straight Flush'}
};
const CALLOUT_RESPONSE_TEXT = {
  'zh-HK': {
    pass: ['大', '唔跟', '唔去', '過'],
    last: [
      '最後一張！',
      '淨翻一張！',
      '埋門一腳！',
      '準備找數💰',
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
const app=document.getElementById('app');
const state={language:'zh-HK',screen:'home',showRules:false,showLog:false,logTouched:false,showScoreGuide:false,selected:new Set(),drag:{id:null,moved:false},playAnimKey:'',autoPassKey:'',score:5000,suggestCost:0,recommendation:null,recommendHint:'',home:{mode:'solo',name:'玩家',gender:'male',avatarChoice:'male',aiDifficulty:'normal',backColor:'red',theme:'ocean',showIntro:false,showLeaderboard:false,google:{signedIn:false,provider:'',name:'',email:'',uid:'',sub:'',token:'',picture:'',gender:''},leaderboard:{rows:[],sort:'totalDelta',period:'all',limit:20}},solo:{players:[],botNames:[],totals:[5000,5000,5000,5000],currentSeat:0,lastPlay:null,passStreak:0,isFirstTrick:true,gameOver:false,status:'',history:[],aiDifficulty:'normal',lastCardBreach:null}};
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
const START_GAME_SMART_LINK='https://www.effectivegatecpm.com/wbwmxkctg?key=e0907e00577f5c2a3eccf85c395c4b6a';
const GAME_START_TS_CACHE_KEY='big2.game.start_ts.v1';
const GAME_START_TS_AD_WINDOW_MS=60*60*1000;
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
let playTypeCallTimer=null;
const playTypeCallState={key:'',seat:0,text:'',until:0,startedAt:0,nonce:'',historyLen:0};
let passCallTimer=null;
const passCallState={key:'',seat:0,text:'',until:0,startedAt:0,nonce:'',historyLen:0};
let recommendHintTimer=null;
let lastCardCallTimer=null;
const lastCardCallState={key:'',seat:0,text:'',until:0,startedAt:0,nonce:'',historyLen:0};
const lastCardAnnouncedSeats=new Set();
let lastCardProcessedHistoryLen=0;
let googleInlineRetryTimer=null;
let googleIdentityInitialized=false;
let firebaseApp=null;
let firebaseAuth=null;
let firebaseDb=null;
let leaderboardCloudRefreshInFlight=false;
let leaderboardCloudLoaded=false;
const sound={ctx:null,enabled:true};
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
const calloutAudioCache=new Map();
let iosSharedCalloutAudio=null;
let mobileTapAt=0;
let orientationBlockActive=false;
const BOT_PROFILES={
  zh:[
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
    {name:'秀文',gender:'female'}
  ],
  en:[
    {name:'Nova',gender:'female'},
    {name:'Milo',gender:'male'},
    {name:'Jade',gender:'female'},
    {name:'Axel',gender:'male'},
    {name:'Iris',gender:'female'},
    {name:'Luna',gender:'female'},
    {name:'Rex',gender:'male'},
    {name:'Nora',gender:'female'},
    {name:'Kane',gender:'male'},
    {name:'Skye',gender:'female'}
  ]
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
function mainPageLegalMiniHtml(){
  const zh=state.language==='zh-HK';
  const labels=zh
    ?{privacy:'私隱政策',about:'關於我們',contact:'聯絡我們',terms:'使用條款'}
    :{privacy:'Privacy',about:'About',contact:'Contact',terms:'Terms'};
  const privacy=zh
    ?'我們重視你的私隱，並以透明方式處理資料。網站可能收集及處理以下資訊：你主動提供的帳戶資料（例如顯示名稱、登入電郵）、遊戲設定、對戰紀錄、分數與排行相關資料，以及裝置與瀏覽器技術資訊（例如裝置類型、作業系統、瀏覽器版本、語言與基本錯誤記錄）。我們亦可能使用 Cookies 或同類技術，以維持登入狀態、保存偏好設定、提升系統安全、分析使用情況及改善功能體驗。上述資料主要用於帳戶識別、遊戲運作、排行榜與統計分析、防止濫用與技術維護，不會用於出售或轉讓你的個人資料作第三方行銷用途。資料可能在合理期限內保留，以支援服務運作、偵錯、風險管理及紀錄完整性。你可透過瀏覽器設定管理或停用 Cookies；惟停用後，登入、偏好保存或部分互動功能可能受到影響。若你對資料處理方式有任何查詢，可透過網站提供的聯絡方式與我們聯絡。'
    :'We value your privacy and handle data transparently. The website may collect and process the following information: account details you provide (such as display name and sign-in email), game settings, match records, scores and leaderboard-related data, and device/browser technical information (such as device type, operating system, browser version, language, and basic error logs). We may also use cookies or similar technologies to maintain sign-in sessions, preserve preference settings, improve security, analyze usage, and enhance product experience. This information is used primarily for account identification, core gameplay operation, leaderboard/statistical functions, abuse prevention, and technical maintenance. We do not sell or transfer your personal data for third-party marketing purposes. Data may be retained for a reasonable period to support service operation, debugging, risk control, and record integrity. You may manage or disable cookies in your browser settings; however, disabling them may affect sign-in, preference persistence, or certain interactive features. If you have questions about data handling, please contact us through the contact channel provided on this website.';
  const about=zh
    ?'本網站提供《鋤大D（Big Two）》網頁版遊戲體驗，目標是讓玩家在手機、平板與桌面裝置上，均可獲得一致、流暢且易上手的操作感受。平台設計重視對局節奏與資訊清晰度，透過直觀介面、即時狀態提示、玩法說明與計分展示，協助玩家快速理解牌局狀況並作出判斷。為提升整體可玩性，網站整合排行榜、個人設定、對戰紀錄與成績追蹤等功能，讓玩家可持續觀察自身表現，逐步優化出牌策略。系統亦會持續進行效能優化與介面調整，包括讀取速度、互動回饋、版面適配與穩定性改善，以維持長時間遊玩的舒適度。我們重視公平與品質，致力提供清晰、可靠且具持續更新能力的棋牌娛樂環境，讓新手與進階玩家都能在同一平台獲得良好體驗。'
    :'This website provides a browser-based Big Two experience, with the goal of delivering consistent, smooth, and easy-to-use gameplay across mobile phones, tablets, and desktop devices. The platform emphasizes match pacing and information clarity through intuitive UI, real-time status cues, gameplay guidance, and scoring display, helping players quickly understand table state and make decisions. To improve long-term playability, the site includes leaderboard, personal settings, match records, and performance tracking features, allowing players to monitor progress and refine strategy over time. The system is continuously optimized in areas such as loading performance, interaction feedback, responsive layout adaptation, and runtime stability to support comfortable extended play sessions. We prioritize fairness and quality, and remain committed to maintaining a clear, reliable, and continuously improving card-gaming environment for both new and experienced players.';
  const contact=zh
    ?'如有查詢，請電郵至 4leafxbot@gmail.com。'
    :'For enquiries, email 4leafxbot@gmail.com.';
  const terms=zh
    ?'使用本網站即表示你同意並接受以下條款：1) 你將以合法及公平方式使用本服務，不進行作弊、濫用、騷擾、惡意干擾或任何破壞系統穩定性的行為；2) 你不得使用外掛、自動化程式、爬蟲、模擬器腳本或其他非正常手段影響對局結果、排行數據或服務運作；3) 帳戶與個人資料須由使用者自行妥善管理，因裝置共享、帳戶外洩或第三方登入風險所造成之影響，使用者須自行承擔；4) 排行榜、戰績與相關統計以系統最終記錄為準，系統有權在發現異常時進行修正、重算或移除可疑資料；5) 我們可按需要調整功能、介面、規則、活動安排或服務內容，並可在維護、安全或法規要求下暫停、限制或終止部分功能；6) 對於因網絡狀態、裝置效能、瀏覽器差異、第三方服務中斷或不可抗力造成之延遲、錯誤、資料遺失或服務中斷，本網站不作任何明示或默示保證；7) 使用者使用本服務即代表理解並同意上述條款，若不同意，請停止使用本網站。'
    :'By using this website, you agree to the following terms: (1) you will use the service lawfully and fairly, and will not engage in cheating, abuse, harassment, malicious interference, or any activity that harms system stability; (2) you must not use plugins, automation tools, crawlers, scripted emulators, or other non-standard methods to influence match outcomes, leaderboard data, or service operation; (3) you are responsible for safeguarding your account and personal access, and any impact caused by shared devices, account leakage, or third-party sign-in risk remains your responsibility; (4) leaderboard records, match history, and related statistics are subject to final system records, and we reserve the right to correct, recalculate, or remove suspicious data when anomalies are detected; (5) we may update features, interface, rules, event arrangements, or service content as needed, and may suspend, restrict, or terminate certain functions for maintenance, security, legal, or compliance reasons; (6) we make no express or implied guarantee of uninterrupted service, and are not liable for delays, errors, data loss, or interruption caused by network conditions, device limitations, browser differences, third-party service outages, or force majeure; and (7) continued use of this service constitutes your understanding and acceptance of these terms. If you do not agree, please discontinue use of this website.';
  return`<section class="legal-mini" id="legal-mini"><div class="legal-mini-links"><button type="button" class="legal-mini-link" data-legal="privacy">${labels.privacy}</button><span class="legal-mini-sep">◦</span><button type="button" class="legal-mini-link" data-legal="about">${labels.about}</button><span class="legal-mini-sep">◦</span><button type="button" class="legal-mini-link" data-legal="contact">${labels.contact}</button><span class="legal-mini-sep">◦</span><button type="button" class="legal-mini-link" data-legal="terms">${labels.terms}</button></div><div class="legal-mini-panels"><article class="legal-mini-panel" data-legal-panel="privacy">${esc(privacy)}</article><article class="legal-mini-panel" data-legal-panel="about">${esc(about)}</article><article class="legal-mini-panel" data-legal-panel="contact">${zh?`如有查詢，請電郵至 <a href="mailto:4leafxbot@gmail.com">4leafxbot@gmail.com</a>。`:`For enquiries, email <a href="mailto:4leafxbot@gmail.com">4leafxbot@gmail.com</a>.`}</article><article class="legal-mini-panel" data-legal-panel="terms">${esc(terms)}</article></div></section>`;
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
      'For equal ranks, suit order is Spade ♠ > Heart ♥ > Club ♣ > Diamond ♦.',
      'Single-card order: 2 > A > K > ... > 3 (highest: ♠Spade 2, lowest: ♦Diamond 3).',
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
      '同點數比較花色：黑桃♠ > 紅心♥ > 梅花♣ > 階磚♦。',
      '單張大小：2 > A > K > ... > 3（最大單張：♠黑桃2；最小單張：♦階磚3）。',
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
      {name:'Single',desc:'1 card',cards:[card('A','\u2660')]},
      {name:'Pair',desc:'2 same rank',cards:[card('9','\u2666'),card('9','\u2663')]},
      {name:'Triple',desc:'3 same rank',cards:[card('7','\u2666'),card('7','\u2663'),card('7','\u2660')]},
      {name:'Straight (Snake)',desc:'5 consecutive ranks',cards:[card('6','\u2666'),card('7','\u2663'),card('8','\u2665'),card('9','\u2660'),card('10','\u2663')]},
      {name:'Flush (Flower)',desc:'5 same suit',cards:[card('3','\u2665'),card('7','\u2665'),card('9','\u2665'),card('J','\u2665'),card('A','\u2665')]},
      {name:'Full House',desc:'Triple + Pair',cards:[card('Q','\u2663'),card('Q','\u2666'),card('Q','\u2660'),card('5','\u2665'),card('5','\u2663')]},
      {name:'Four of a Kind',desc:'4 same rank + kicker',cards:[card('8','\u2666'),card('8','\u2663'),card('8','\u2665'),card('8','\u2660'),card('2','\u2663')]},
      {name:'Straight Flush',desc:'Same suit + consecutive',cards:[card('5','\u2660'),card('6','\u2660'),card('7','\u2660'),card('8','\u2660'),card('9','\u2660')]}
    ];
  }
  return[
    {name:'單張',desc:'1張牌',cards:[card('A','\u2660')]},
    {name:'一對',desc:'2張同點數',cards:[card('9','\u2666'),card('9','\u2663')]},
    {name:'三條',desc:'3張同點數',cards:[card('7','\u2666'),card('7','\u2663'),card('7','\u2660')]},
    {name:'蛇',desc:'5張連續點數',cards:[card('6','\u2666'),card('7','\u2663'),card('8','\u2665'),card('9','\u2660'),card('10','\u2663')]},
    {name:'花',desc:'5張同花色',cards:[card('3','\u2665'),card('7','\u2665'),card('9','\u2665'),card('J','\u2665'),card('A','\u2665')]},
    {name:'俘佬',desc:'三條 + 一對',cards:[card('Q','\u2663'),card('Q','\u2666'),card('Q','\u2660'),card('5','\u2665'),card('5','\u2663')]},
    {name:'四條',desc:'4張同點數 + 腳',cards:[card('8','\u2666'),card('8','\u2663'),card('8','\u2665'),card('8','\u2660'),card('2','\u2663')]},
    {name:'同花順',desc:'同花色 + 連續點數',cards:[card('5','\u2660'),card('6','\u2660'),card('7','\u2660'),card('8','\u2660'),card('9','\u2660')]}
  ];
}
function introPanelHtml(){
  const it=introText();
  const formatIntroLine=(text)=>{
    const token='{{3D}}';
    const card3d=state.language==='en'?'♦Diamond 3':'♦階磚3';
    return colorizeSuitText(String(text??'').replaceAll(token,card3d));
  };
  const rows=introHandSamples().map((row)=>`<div class="intro-hand-row"><div class="intro-hand-meta"><strong>${esc(row.name)}</strong><span>${esc(row.desc)}</span></div><div class="intro-hand-cards">${row.cards.map((c)=>renderStaticCard(c,true)).join('')}</div></div>`).join('');
  return`<div class="intro-modal" id="intro-modal"><button class="intro-backdrop" id="intro-backdrop" aria-label="close"></button><section class="intro-sheet"><header class="intro-head"><div><h3 class="title-with-icon"><span class="title-icon title-icon-guide" aria-hidden="true"></span><span>${esc(it.panelTitle)}</span></h3>${it.panelSub?`<p>${colorizeSuitText(it.panelSub)}</p>`:''}</div><button id="intro-close" class="secondary">${esc(it.btnHide)}</button></header><div class="intro-grid"><article class="intro-block"><h4>${esc(it.historyTitle)}</h4><p>${colorizeSuitText(it.historyBody)}</p></article><article class="intro-block"><h4>${esc(it.howTitle)}</h4><p>${colorizeSuitText(it.howBody)}</p><div class="intro-hand-list">${rows}</div></article><article class="intro-block"><h4>${esc(it.flowTitle)}</h4><ul>${(it.flowList??[]).map((x)=>`<li>${formatIntroLine(x)}</li>`).join('')}</ul></article><article class="intro-block"><h4>${esc(it.playTitle)}</h4><ul>${(it.playList??[]).map((x)=>`<li>${formatIntroLine(x)}</li>`).join('')}</ul></article></div></section></div>`;
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
    avatarChoice:['male','female','google'].includes(state.home.avatarChoice)?state.home.avatarChoice:'male'
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
  const g=state.home.google??{};
  return Boolean(g.signedIn&&(String(g.email??'').trim()||String(g.uid??'').trim()||String(g.sub??'').trim()));
}
function signedInWithEmail(){return Boolean(state.home.google.signedIn&&state.home.google.email);}
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
  const rows=Object.values(store.players).map((entry)=>{
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
  const botRows=botSource.map((b,i)=>({
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
    const avatarSrc=r.picture?authPictureUrlFrom(r.picture):avatarDataUri(r.name,'#7aaed8',r.gender??'male');
    return`<div class="${rowClass}"><div class="lb-rank">${medal?`<span class="lb-badge ${medalClass}" aria-hidden="true">${medal}</span>`:`#${r.rank??'-'}`}</div><div class="lb-main"><div class="lb-name-line"><div class="lb-name-pack"><span class="${avatarClass}"><img src="${avatarSrc}" alt="${esc(r.name)}"/></span><div class="lb-name">${esc(r.name)}</div></div><div class="lb-stat">${r.totalScore}</div></div><div class="lb-subline"><span>${t('score')}: ${r.totalScore} · ${r.wins}/${r.games} · ${lx.wr} ${fmtPct(r.winRate)}</span><span>${lx.updated}: ${fmtDateTime(r.updatedAt)}</span></div></div></div>`;
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
      anyTwo:'Holding any 2 card (♦Diamond 2/♣Club 2/♥Heart 2/♠Spade 2) applies x2.',
      topTwo:'Holding ♠Spade 2 (top 2) applies an additional x2.',
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
      anyTwo:'持有任意 2（♦階磚2/♣梅花2/♥紅心2/♠黑桃2）會套用 x2。',
      topTwo:'持有 ♠黑桃2（頂大）會額外再套用 x2。',
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
  const topTwoCard=`<img src="${cardImagePath({rank:12,suit:3})}" alt="♠Spade 2" class="score-guide-card-art"/>`;
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
    if(calloutGateUntilPlay&&state.screen==='game'&&state.home.mode==='solo'&&((state.solo?.history?.length??0)===0))return;
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
    const useTts=false;
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
    render();
    return true;
  }catch(err){
    console.error(`sign in failed for provider: ${p}`,err);
    return false;
  }
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
  .replaceAll('♦','<span class="suit-red">♦</span>')
  .replaceAll('♥','<span class="suit-red">♥</span>')
  .replaceAll('♣','<span class="suit-black">♣</span>')
  .replaceAll('♠','<span class="suit-black">♠</span>');
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
function avatarDataUri(name,color,gender='male'){
  const g=String(gender??'male')==='female'?'female':'male';
  const baseName=String(name??'player')||'player';
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
  if(seatColor){
    const bgList=[seatColor,seatLight].filter(Boolean).map((v)=>v.replace('#','')).join(',');
    params.set('backgroundColor',bgList);
    params.set('backgroundType','gradientLinear');
  }
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
const HIGHEST_SINGLE={rank:12,suit:3}; // ♠黑桃2
const LOWEST_SINGLE={rank:0,suit:0}; // ♦階磚3
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
  if(straight&&flush)return{valid:true,count,kind:'straightflush',power:[FIVE_KIND_POWER.straightflush,straight.high,sorted[4].suit],sorted};
  if(g[0][1]===4)return{valid:true,count,kind:'fourofkind',power:[FIVE_KIND_POWER.fourofkind,g[0][0]],sorted};
  if(g[0][1]===3&&g[1][1]===2)return{valid:true,count,kind:'fullhouse',power:[FIVE_KIND_POWER.fullhouse,g[0][0]],sorted};
  if(flush){const d=[...ranks].sort((a,b)=>b-a);return{valid:true,count,kind:'flush',power:[FIVE_KIND_POWER.flush,...d,sorted[4].suit],sorted};}
  if(straight)return{valid:true,count,kind:'straight',power:[FIVE_KIND_POWER.straight,straight.high,sorted[4].suit],sorted};
  return{valid:false,reason:t('five')};
}

function combos(cards,size){const out=[];const dfs=(i,path)=>{if(path.length===size){out.push([...path]);return;}for(let x=i;x<cards.length;x++){path.push(cards[x]);dfs(x+1,path);path.pop();}};dfs(0,[]);return out;}
function allValidPlays(hand){const plays=[];for(const c of hand)plays.push({cards:[c],eval:evaluatePlay([c])});const byRank=new Map();for(const c of hand){const a=byRank.get(c.rank)??[];a.push(c);byRank.set(c.rank,a);}for(const [,cs]of byRank){if(cs.length>=2)for(const p of combos(cs,2))plays.push({cards:p,eval:evaluatePlay(p)});if(cs.length>=3)for(const p of combos(cs,3))plays.push({cards:p,eval:evaluatePlay(p)});}for(const p of combos(hand,5)){const ev=evaluatePlay(p);if(ev.valid)plays.push({cards:p,eval:ev});}return plays.filter((p)=>p.eval.valid);}
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
  return !game.gameOver&&(game.players?.[next]?.hand?.length===1);
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
function recommendPlayScore(play,ctx){
  const {hand,lastPlay,game,seat,orderedByWeak,canPass}=ctx;
  const rem=removeCardsFromHand(hand,play.cards);
  const m=handShapeMetrics(rem);
  const startLen=(hand??[]).length;
  const endLen=rem.length;
  const usedLen=play.eval.count;
  const beforeRankCount=new Map();
  for(const c of hand??[])beforeRankCount.set(c.rank,(beforeRankCount.get(c.rank)??0)+1);
  const oppMin=minOpponentCardCount(game,seat);
  const threat=oppMin<=2;

  let score=0;
  score+=(startLen-endLen)*48;
  score+=m.pairs*8+m.triples*10+m.fives*3;
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
      if(cnt>1&&startLen>5)score-=14;
      if(isHighestSingle(single)&&startLen>3)score-=16;
    }
  }else{
    score+=usedLen===1?-5:(usedLen===2?5:(usedLen===3?8:11));
    if(maxRank>=11&&startLen>5)score-=10;
    if(play.eval.count===1&&isLowestSingle(play.cards[0]))score+=2;
  }

  if(shouldForceMaxAgainstLastCard(game,seat)){
    const strongest=[...orderedByWeak].sort(cmpStrongPlayDesc)[0];
    if(strongest&&comparePower(play.eval.power,strongest.eval.power)!==0){
      score-=28;
    }else{
      score+=8;
    }
  }
  if(endLen<=5)score+=(5-endLen)*14;
  if(endLen===0)score+=500;
  if(endLen===1||endLen===2||endLen===3)score+=26;
  if(threat&&play.eval.count===5)score+=12;
  if(threat&&play.eval.count===1)score+=6;
  if(!canPass&&lastPlay)score+=4;
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
function suggestPlay(hand,lastPlay,isFirstTrick,game){
  let legal=allValidPlays(hand);
  if(isFirstTrick)legal=legal.filter((e)=>has3d(e.cards));
  if(lastPlay)legal=legal.filter((e)=>canBeat(e.eval,lastPlay.eval));
  if(isFirstTrick&&!lastPlay){
    const noTwos=legal.filter((e)=>!e.cards.some((c)=>c.rank===12));
    if(noTwos.length)legal=noTwos;
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
  const weakCmp=(a,b)=>{
    if(a.eval.count!==b.eval.count)return a.eval.count-b.eval.count;
    if(a.eval.count===5&&a.eval.kind!==b.eval.kind)return FIVE_KIND_POWER[a.eval.kind]-FIVE_KIND_POWER[b.eval.kind];
    return comparePower(a.eval.power,b.eval.power);
  };
  const byWeak=[...legal].sort(weakCmp);
  const ctx={hand:[...hand],lastPlay,isFirstTrick,game:sim,seat,orderedByWeak:byWeak,canPass:Boolean(lastPlay)};
  const moveKey=(p)=>`${(p?.cards??[]).map(cardId).sort().join(',')}|${String(p?.eval?.kind??'')}|${Number(p?.eval?.count??0)}`;
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
  return passScore>playScore+35;
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
    return [...legal].sort(cmpStrongPlayDesc)[0];
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
    const scored=[...legal].sort((a,b)=>leadScore(b)-leadScore(a)||byMinPower(a,b));
    if(diff==='hard')return scored[0];
    // normal: keep variability while staying combo-first.
    if(Math.random()<0.2)return scored[Math.floor(Math.random()*Math.min(3,scored.length))];
    return scored[Math.floor(Math.random()*Math.min(2,scored.length))];
  }

  // Responding: win with minimal needed strength to conserve resources.
  const ordered=[...legal].sort((a,b)=>respondCost(a)-respondCost(b)||byMinPower(a,b));
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
function randomBotProfiles(){
  const list=state.language==='en'?BOT_PROFILES.en:BOT_PROFILES.zh;
  const bag=[...list];
  const out=[];
  while(out.length<3){
    if(!bag.length)bag.push(...list);
    const idx=Math.floor(Math.random()*bag.length);
    const picked=bag.splice(idx,1)[0];
    out.push({name:picked.name,gender:picked.gender==='female'?'female':'male'});
  }
  return out;
}
function randomBotNames(){return randomBotProfiles().map((p)=>p.name);}
function botGenderByName(name){
  const n=String(name??'').trim();
  const map=Object.fromEntries(
    [...BOT_PROFILES.zh,...BOT_PROFILES.en].map((p)=>[p.name,p.gender==='female'?'female':'male'])
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
function renderHandCard(card,selected,extraClass=''){const draggable=isMobilePointer()?'false':'true';return`<button class="card face hand-card ${faceRankClass(card)} ${selected?'selected':''} ${extraClass}" draggable="${draggable}" data-card-id="${cardId(card)}"><img class="card-art" src="${cardImagePath(card)}" alt="${RANKS[card.rank]} ${SUITS[card.suit].symbol}"/></button>`;}
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
}
function lockTurnProgress(ms=0){
  const hold=Math.max(0,Number(ms)||0);
  if(!hold)return;
  turnLockUntil=Math.max(turnLockUntil,Date.now()+hold);
}

function reorderById(arr,fromId,toId,idFn){if(!fromId||!toId||fromId===toId)return arr;const copy=[...arr];const fi=copy.findIndex((x)=>idFn(x)===fromId),ti=copy.findIndex((x)=>idFn(x)===toId);if(fi<0||ti<0)return arr;const[m]=copy.splice(fi,1);copy.splice(ti,0,m);return copy;}
function patternSortCards(hand){return[...hand].sort((a,b)=>b.suit-a.suit||a.rank-b.rank);}

function startSoloGame(){randomizeNpcColors();const botProfiles=randomBotProfiles();const p=[{name:state.home.name||t('name'),gender:state.home.gender==='female'?'female':'male',hand:[],isHuman:true},{name:botProfiles[0].name,gender:botProfiles[0].gender,hand:[],isHuman:false},{name:botProfiles[1].name,gender:botProfiles[1].gender,hand:[],isHuman:false},{name:botProfiles[2].name,gender:botProfiles[2].gender,hand:[],isHuman:false}];const deck=shuffle(createDeck());p.forEach((x)=>{x.hand=deck.splice(0,13).sort(cmpCard);});const start=p.findIndex((x)=>x.hand.some((c)=>c.rank===0&&c.suit===0));const totals=Array.isArray(state.solo.totals)&&state.solo.totals.length===4?[...state.solo.totals]:[5000,5000,5000,5000];state.solo={players:p,botProfiles:botProfiles.map((bp)=>({name:bp.name,gender:bp.gender})),botNames:botProfiles.map((bp)=>bp.name),totals,currentSeat:start,lastPlay:null,passStreak:0,isFirstTrick:true,gameOver:false,status:'',systemLog:[],history:[],aiDifficulty:state.home.aiDifficulty,lastCardBreach:null,roundSummary:null};setSoloStatus(`${p[start].name} ${t('start')}`);state.selected.clear();state.recommendation=null;state.logTouched=false;state.showLog=false;state.screen='game';state.home.mode='solo';state.home.showIntro=false;state.home.showLeaderboard=false;state.showScoreGuide=false;calloutGateUntilPlay=true;markGameStartedInCache();playSound('start');render();maybeRunSoloAi();}

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
    markGameEndedInCache();
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
  {const wc=buildWinnerCalloutForSeat(g,seat);if(wc.text)speakCallout(wc.text,g.players[seat]?.gender??'male',{clipKey:wc.repeat?'winner-repeat':'winner',seat});}
  return true;
  }
  if(g.lastCardBreach&&seat===g.lastCardBreach.threatenedSeat)g.lastCardBreach=null;
  lockTurnProgress(900);
  g.currentSeat=(seat+1)%4;setSoloStatus(`${g.players[seat].name} ${t('played')} ${kindLabel(ev.kind)}.`,{appendLog:false});playSound('play');return true;}
function soloPass(seat){const g=state.solo;if(!g.lastPlay){if(seat===0)setSoloStatus(t('cantPass'));return false;}g.passStreak+=1;g.history.push({action:'pass',seat,name:g.players[seat].name,ts:Date.now()});if(g.lastCardBreach&&seat===g.lastCardBreach.threatenedSeat)g.lastCardBreach=null;lockTurnProgress(850);if(g.passStreak>=3){const lead=g.lastPlay.seat;g.currentSeat=lead;g.lastPlay=null;g.passStreak=0;setSoloStatus(`${g.players[lead].name} ${t('retake')}`);playSound('pass');return true;}g.currentSeat=(seat+1)%4;setSoloStatus(`${g.players[seat].name} ${t('pass')}.`,{appendLog:false});playSound('pass');return true;}
function maybeRunSoloAi(){
  if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}
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
  const DEFAULT_AI_DELAY_MS=1000;
  const POST_CALLOUT_DELAY_MS=120;
  const wait=(calloutSpeechActive||remaining>0||turnLockRemaining>0)
    ?Math.max(35,remaining,turnLockRemaining)
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
function playTone(freq,d,type='sine',g=0.03,delay=0){if(!sound.ctx)return;const c=sound.ctx,o=c.createOscillator(),a=c.createGain();o.type=type;o.frequency.value=freq;a.gain.value=g;o.connect(a);a.connect(c.destination);const now=c.currentTime+delay;o.start(now);a.gain.exponentialRampToValueAtTime(0.0001,now+d);o.stop(now+d);}
function playSound(kind){
  if(!sound.enabled)return;
  unlockAudio();
  if(!sound.ctx)return;
  if(sound.ctx.state==='suspended'){
    sound.ctx.resume?.().catch(()=>{});
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
  if(kind==='win'){playTone(392,0.13,'triangle',0.03);playTone(523,0.14,'triangle',0.03,0.06);playTone(659,0.2,'triangle',0.03,0.12);}
}
function applyTheme(){const theme=THEMES[state.home.theme]??THEMES.ocean;const root=document.documentElement;for(const[k,v]of Object.entries(theme))root.style.setProperty(k,v);}

function buildView(){const g=state.solo;return{mode:'solo',currentSeat:g.currentSeat,lastPlay:g.lastPlay,gameOver:g.gameOver,isFirstTrick:g.isFirstTrick,status:g.status,systemLog:g.systemLog??[],participants:g.players.map((p,seat)=>({seat,name:p.name,gender:p.gender??'male',isBot:!p.isHuman,count:p.hand.length,score:g.totals?.[seat]??0})),hand:g.players[0].hand,history:g.history,selfSeat:0,canControl:!g.gameOver&&g.currentSeat===0,canPass:!g.gameOver&&g.currentSeat===0&&Boolean(g.lastPlay),revealedHands:g.gameOver?g.players.map((p)=>[...p.hand]):null,roundSummary:g.roundSummary??null};}

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
  return(cards??[]).map((c)=>`${SUITS[c.suit]?.symbol??''}${RANKS[c.rank]??''}`).join(' ');
}
function gameLogDetailText(e){
  const zh=state.language==='zh-HK';
  if(e.action==='pass')return zh?'本回合選擇過牌。':'Passed this turn.';
  const cards=e.cards??[];
  const kind=kindLabel(e.kind);
  const cardText=gameLogCardText(cards);
  if(zh)return`出牌：${kind}（${cards.length}張）${cardText?`（${cardText}）`:''}`;
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
function centerMovesHtml(history,selfSeat){
  void history;
  void selfSeat;
  const felt='border:1px solid rgba(220,245,226,.34) !important;background:radial-gradient(circle at 24% 20%, rgba(170,230,190,.18), transparent 38%),radial-gradient(circle at 78% 74%, rgba(98,165,126,.16), transparent 40%),linear-gradient(165deg, #1f6b43 0%, #185938 58%, #12492f 100%) !important;box-shadow:inset 0 0 0 1px rgba(8,25,42,.45) !important;border-radius:12px !important;';
  return`<div class="table-center-grid-wrap" style="${felt}"></div>`;
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
  return`<div class="mobile-opponent-names">${others.map((p)=>`<span class="mobile-opponent-name ${(!gameOver&&currentSeat===p.seat)?'active':''}" style="--player-color:${playerColorByViewClass(p.cls)};"><img class="player-avatar mini" src="${avatarDataUri(p.name,playerColorByViewClass(p.cls))}" alt="${esc(p.name)}"/><span class="seat-name-text">${esc(p.name)}</span><span class="mobile-seat-tag">${seatShortByViewClass(p.cls)}</span></span>`).join('')}</div>`;
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
  const cards=(action.cards??[]).map((c,i)=>{
    const rot=((fanNoise(`${action.seat}|${ts}|${cardId(c)}`,i,'played')*2)-1)*8.84;
    return renderStaticCard(c,true,'',`transform:rotate(${rot.toFixed(2)}deg)`);
  }).join('');
  return`<div class="seat-played">${cards}</div>`;
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
  const winner=arr.find((p)=>p.count===0)??arr[0];
  const winnerLastPlay=(v.history??[]).slice().reverse().find((e)=>e.action==='play'&&e.seat===winner.seat&&Array.isArray(e.cards)&&e.cards.length);
  const winnerLastDiscardCards=winnerLastPlay?.cards??[];
  const deductions=v.roundSummary?.deductions??arr.map((p)=>p.seat===winner.seat?0:calcPenaltyDetail(v.revealedHands?.[p.seat]??[]).deduction);
  const winnerGain=Number(v.roundSummary?.winnerGain??deductions.reduce((sum,vv)=>sum+vv,0));
  const detailBySeat=v.roundSummary?.details??arr.map((p)=>p.seat===winner.seat?{remain:0,base:0,multiplier:1,deduction:0,anyTwo:false,topTwo:false,chaoMultiplier:1,chaoKey:''}:calcPenaltyDetail(v.revealedHands?.[p.seat]??[]));
  const rows=arr.map((p)=>{
    const isWinner=p.seat===winner.seat;
    const color=playerColorByViewClass(p.cls);
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
    const avatarSrc=isSelf
      ?selfAvatarDataUri(p.name,color,p.gender)
      :avatarDataUri(p.name,color,p.gender);
    const winnerLastDiscardHtml=isWinner
      ?`<div class="result-card-block"><div class="result-block-title">${t('resultLastDiscard')}</div><div class="result-cards" aria-label="${t('resultLastDiscard')}">${winnerLastDiscardCards.length?winnerLastDiscardCards.map((c)=>renderStaticCard(c,true)).join(''):`<span class="hint">-</span>`}</div></div>`
      :'';
    const remainBlockHtml=!isWinner
      ?`<div class="result-card-block"><div class="result-block-title">${t('resultRemain')}</div><div class="result-cards" aria-label="${t('resultRemain')}">${remainCards}</div></div>`
      :'';
    const rightColHtml=`<div class="result-side">${winnerLastDiscardHtml}${remainBlockHtml}</div>`;
    return`<div class="result-row ${isWinner?'winner':''}" style="--winner-color:${color};">
      <div class="result-main">
        <div class="result-head"><span class="player-color-chip" style="--player-color:${color};"></span><span class="result-avatar-wrap"><img class="result-avatar" src="${avatarSrc}" alt="${esc(p.name)}"/></span><span class="result-player-name"><strong>${esc(p.name)}</strong>${isWinner?`<span class="result-winner-medal" aria-hidden="true">🥇</span>`:''}</span>${isWinner?`<span class="result-winner-tag">${t('resultWinner')}</span>`:''}</div>
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
      <div class="control-row">
        <button id="result-home" class="secondary">${t('home')}</button>
        <button id="result-again" class="primary">${t('again')}</button>
      </div>
    </div>
  </section>`;
}
function congratsOverlayHtml(v,youWin){
  if(!youWin)return'';
  return`<div class="congrats-screen"><div class="congrats-card"><h3 class="title-with-icon"><span class="title-icon title-icon-congrats" aria-hidden="true"></span><span>${t('congrats')}</span></h3><div class="hint">${esc(uiStatus(v.status))}</div><div class="control-row"><button id="congrats-home" class="secondary">${t('home')}</button><button id="congrats-again" class="primary">${t('again')}</button></div></div></div>`;
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
let lastStartGameAdAt=0;
function readGameStartTsCache(){
  try{
    const raw=localStorage.getItem(GAME_START_TS_CACHE_KEY);
    if(!raw)return null;
    const ts=Number(raw);
    if(!Number.isFinite(ts)||ts<=0)return null;
    return ts;
  }catch{
    return null;
  }
}
function writeGameStartTsCache(ts){
  try{
    localStorage.setItem(GAME_START_TS_CACHE_KEY,String(ts));
  }catch{}
}
function markGameStartedInCache(){
  writeGameStartTsCache(Date.now());
}
function markGameEndedInCache(){
  try{
    localStorage.removeItem(GAME_START_TS_CACHE_KEY);
  }catch{}
}
function shouldOpenAdBeforeStartingNewGame(){
  const ts=readGameStartTsCache();
  if(!ts)return false;
  const age=Date.now()-ts;
  if(age>=0&&age<=GAME_START_TS_AD_WINDOW_MS)return true;
  markGameEndedInCache();
  return false;
}
function triggerStartGameSmartLink(){
  const now=Date.now();
  if(now-lastStartGameAdAt<1200)return;
  lastStartGameAdAt=now;
  try{
    const w=window.open(START_GAME_SMART_LINK,'_blank','noopener,noreferrer');
    try{window.focus?.();}catch{}
    if(w){
      try{w.blur?.();}catch{}
      setTimeout(()=>{try{window.focus?.();}catch{}},60);
    }
  }catch{}
}
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
function renderHome(){
  const intro=introText();
  const signedIn=signedInForPlay();
  if(state.home.avatarChoice==='google'){
    state.home.avatarChoice=state.home.gender==='female'?'female':'male';
  }
  if(state.home.showLeaderboard)refreshLeaderboard();
  app.innerHTML=`<section class="home-wrap royal-home-wrap"><section class="home-panel royal-home-panel"><header class="royal-home-head"><div class="royal-head-actions"><button id="home-intro-toggle" class="secondary">${esc(intro.btnShow)}</button><button id="home-score-guide-toggle" class="secondary">${t('scoreGuide')}</button><button id="home-lb-toggle" class="secondary">${t('lb')}</button><button id="home-lang-toggle" class="secondary">${state.language==='zh-HK'?'EN':'中'}</button></div><div class="royal-title-wrap"><img class="title-logo title-logo-home" src="${withBase('title-lockup-home.png')}" alt="鋤大D TRADITIONAL BIG TWO"/></div></header><section class="royal-home-body"><label class="field"><span>${t('name')}</span><div class="name-with-google"><input id="name-input" value="${esc(state.home.name)}" maxlength="18"/><div id="google-name-inline"></div></div></label><div class="home-form-grid"><div class="home-form-col home-form-left"><label class="field"><span>${t('gender')}</span><div class="option-combo toggle-combo" id="gender-combo"><button class="combo-btn toggle-btn gender-symbol-btn ${state.home.avatarChoice==='male'?'active':''}" data-value="male" aria-label="${t('male')}">♂</button><button class="combo-btn toggle-btn gender-symbol-btn ${state.home.avatarChoice==='female'?'active':''}" data-value="female" aria-label="${t('female')}">♀</button></div></label><label class="field"><span>${t('cardBack')}</span><div class="option-combo cardback-combo" id="back-combo">${renderBackCombo()}</div></label></div><div class="home-form-col home-form-right home-audio-voice-row"><label class="field"><span>${t('ai')}</span><div class="option-combo toggle-combo" id="difficulty-combo"><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='easy'?'active':''}" data-value="easy">${t('easy')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='normal'?'active':''}" data-value="normal">${t('normal')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='hard'?'active':''}" data-value="hard">${t('hard')}</button></div></label><label class="field"><span>${t('soundFx')}</span><div class="option-combo toggle-combo" id="sound-combo"><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'active':''}" data-value="on" aria-label="${t('soundOn')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M15 9c1.6 1.2 1.6 4.8 0 6"></path><path d="M17.5 7c2.8 2.4 2.8 7.6 0 10"></path></svg></button><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'':'active'}" data-value="off" aria-label="${t('soundOff')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M16 8l4 8"></path><path d="M20 8l-4 8"></path></svg></button></div></label><label class="field"><span>${t('calloutDisplay')}</span><div class="option-combo toggle-combo" id="callout-display-combo"><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'active':''}" data-value="on">${t('calloutDisplayOn')}</button><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'':'active'}" data-value="off">${t('calloutDisplayOff')}</button></div></label><label class="field"><span>${t('voiceMode')}</span><div class="option-combo toggle-combo" id="voice-combo"><button class="combo-btn toggle-btn sound-toggle-btn ${calloutVoiceMode==='auto'?'active':''}" data-value="auto" aria-label="${t('voiceAuto')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M15 9c1.6 1.2 1.6 4.8 0 6"></path><path d="M17.5 7c2.8 2.4 2.8 7.6 0 10"></path></svg></button><button class="combo-btn toggle-btn sound-toggle-btn ${calloutVoiceMode==='off'?'active':''}" data-value="off" aria-label="${t('voiceOff')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M16 8l4 8"></path><path d="M20 8l-4 8"></path></svg></button></div></label></div></div><div class="action-row home-start-row"><button id="solo-start" class="primary royal-start-btn" ${signedIn?'':'disabled'}>${t('solo')}</button>${signedIn?'':`<span class="hint">${t('loginToStart')}</span>`}</div></section></section>${mainPageLegalMiniHtml()}${state.home.showIntro?introPanelHtml():''}${state.home.showLeaderboard?leaderboardModalHtml():''}${state.showScoreGuide?scoreGuideModalHtml():''}</section>`;

  document.getElementById('home-intro-toggle')?.addEventListener('click',()=>{state.home.showIntro=!state.home.showIntro;render();});
  document.getElementById('home-score-guide-toggle')?.addEventListener('click',()=>{state.showScoreGuide=true;render();});
  document.getElementById('home-lb-toggle')?.addEventListener('click',()=>{state.home.showLeaderboard=!state.home.showLeaderboard;if(state.home.showLeaderboard)refreshLeaderboard(true);render();});
  document.getElementById('intro-close')?.addEventListener('click',()=>{state.home.showIntro=false;render();});
  document.getElementById('intro-backdrop')?.addEventListener('click',()=>{state.home.showIntro=false;render();});
  document.getElementById('score-guide-close')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('score-guide-backdrop')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('lb-close')?.addEventListener('click',()=>{state.home.showLeaderboard=false;render();});
  document.getElementById('lb-backdrop')?.addEventListener('click',()=>{state.home.showLeaderboard=false;render();});
  document.getElementById('home-lang-toggle')?.addEventListener('click',()=>{state.language=state.language==='zh-HK'?'en':'zh-HK';relabelSoloBots();render();});
  document.getElementById('name-input')?.addEventListener('input',(e)=>{state.home.name=e.target.value;if(signedInWithEmail()){void syncLeaderboardProfile(currentLeaderboardIdentity());}});
  document.querySelectorAll('#gender-combo .toggle-btn').forEach((btn)=>btn.addEventListener('click',()=>{
    const v=String(btn.getAttribute('data-value')??'');
    if(v!=='male'&&v!=='female')return;
    state.home.avatarChoice=v;
    if(v==='male'||v==='female')state.home.gender=v;
    markComboActive('gender-combo',state.home.avatarChoice);
    saveGoogleSession();
    if(signedInWithEmail()){void syncLeaderboardProfile(currentLeaderboardIdentity());}
  }));
  document.querySelectorAll('#difficulty-combo .combo-btn').forEach((btn)=>btn.addEventListener('click',()=>{const v=btn.getAttribute('data-value');if(!v)return;state.home.aiDifficulty=v;markComboActive('difficulty-combo',v);}));
  document.querySelectorAll('#back-combo .combo-btn').forEach((btn)=>btn.addEventListener('click',()=>{const v=btn.getAttribute('data-value');if(!v||!BACK_OPTIONS.some((x)=>x.value===v))return;state.home.backColor=v;markComboActive('back-combo',state.home.backColor);}));
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
  document.getElementById('lb-sort')?.addEventListener('change',(e)=>{state.home.leaderboard.sort=e.target.value;refreshLeaderboard();render();});
  document.getElementById('lb-period')?.addEventListener('change',(e)=>{state.home.leaderboard.period=e.target.value;refreshLeaderboard();render();});
  document.querySelectorAll('.legal-mini-link').forEach((btn)=>btn.addEventListener('click',()=>{
    const key=btn.getAttribute('data-legal');
    if(!key)return;
    const panel=document.querySelector(`.legal-mini-panel[data-legal-panel="${key}"]`);
    const isOpen=panel?.classList.contains('open');
    document.querySelectorAll('.legal-mini-panel').forEach((p)=>p.classList.remove('open'));
    document.querySelectorAll('.legal-mini-link').forEach((b)=>b.classList.remove('active'));
    if(!isOpen){
      panel?.classList.add('open');
      btn.classList.add('active');
    }
  }));
  queueGoogleInlineRender();
}
function renderConfig(){
  app.innerHTML=`<section class="home-wrap"><header class="topbar home-topbar"><div><h2>${t('config')}</h2></div><div class="topbar-right"><div class="control-row"><button id="config-back" class="secondary">${t('home')}</button><button id="config-lang-toggle" class="secondary">${state.language==='zh-HK'?'EN':'中'}</button></div></div></header><section class="home-panel"><div class="field-grid config-audio-voice-row"><label class="field"><span>${t('soundFx')}</span><div class="option-combo toggle-combo" id="config-sound-combo"><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'active':''}" data-value="on" aria-label="${t('soundOn')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M15 9c1.6 1.2 1.6 4.8 0 6"></path><path d="M17.5 7c2.8 2.4 2.8 7.6 0 10"></path></svg></button><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'':'active'}" data-value="off" aria-label="${t('soundOff')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M16 8l4 8"></path><path d="M20 8l-4 8"></path></svg></button></div></label><label class="field"><span>${t('calloutDisplay')}</span><div class="option-combo toggle-combo" id="config-callout-display-combo"><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'active':''}" data-value="on">${t('calloutDisplayOn')}</button><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'':'active'}" data-value="off">${t('calloutDisplayOff')}</button></div></label><label class="field"><span>${t('voiceMode')}</span><div class="option-combo toggle-combo" id="config-voice-combo"><button class="combo-btn toggle-btn sound-toggle-btn ${calloutVoiceMode==='auto'?'active':''}" data-value="auto" aria-label="${t('voiceAuto')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M15 9c1.6 1.2 1.6 4.8 0 6"></path><path d="M17.5 7c2.8 2.4 2.8 7.6 0 10"></path></svg></button><button class="combo-btn toggle-btn sound-toggle-btn ${calloutVoiceMode==='off'?'active':''}" data-value="off" aria-label="${t('voiceOff')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M16 8l4 8"></path><path d="M20 8l-4 8"></path></svg></button></div></label></div></section></section>`;
  document.getElementById('config-back')?.addEventListener('click',()=>{state.screen='home';render();});
  document.getElementById('config-lang-toggle')?.addEventListener('click',()=>{state.language=state.language==='zh-HK'?'en':'zh-HK';relabelSoloBots();render();});
  bindSoundToggle('config-sound-combo');
  bindCalloutDisplayToggle('config-callout-display-combo');
  bindCalloutVoiceToggle('config-voice-combo');
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
  const selfScoreValue=v.mode==='solo'?(state.solo.totals?.[0]??state.score):state.score;
  const canSuggest=v.canControl;
  const showMust3Highlight=Boolean(v.canControl&&v.isFirstTrick&&!v.lastPlay&&has3d(v.hand)&&!has3d(selected));
  const self=arr.find((p)=>p.viewIndex===0);
  const youWin=Boolean(v.gameOver&&self&&self.count===0);
  const playTypeCall=currentPlayTypeCall(v);
  const playTypeFresh=Boolean(playTypeCallState.startedAt&&Date.now()-playTypeCallState.startedAt<260);
  const passCall=currentPassCall(v);
  const passCallFresh=Boolean(passCallState.startedAt&&Date.now()-passCallState.startedAt<260);
  const lastCardSeat=currentLastCardSeat(v);
  const lastCardFresh=Boolean(lastCardCallState.startedAt&&Date.now()-lastCardCallState.startedAt<260);
  const calloutCandidates=[];
  if(passCall)calloutCandidates.push({kind:'pass',seat:passCall.seat,text:passCall.text,fresh:passCallFresh,nonce:passCallState.nonce||passCallState.startedAt,startedAt:passCallState.startedAt});
  if(playTypeCall)calloutCandidates.push({kind:'play',seat:playTypeCall.seat,text:playTypeCall.text,fresh:playTypeFresh,nonce:playTypeCallState.nonce||playTypeCallState.startedAt,startedAt:playTypeCallState.startedAt});
  if(lastCardSeat!==null)calloutCandidates.push({kind:'last',seat:lastCardSeat,text:lastCardCallState.text||t('lastCardCall'),fresh:lastCardFresh,nonce:lastCardCallState.nonce||lastCardCallState.startedAt,startedAt:lastCardCallState.startedAt});
  const calloutPriority={pass:3,play:2,last:1};
  const activeCallout=calloutCandidates.sort((a,b)=>(Number(b.startedAt)||0)-(Number(a.startedAt)||0)||(calloutPriority[b.kind]-calloutPriority[a.kind]))[0]??null;
  const seatCalloutHtml=(seat,viewCls,color,isSelf=false)=>{
    const seatClass=isSelf?'play-type-call-self':'play-type-call-seat';
    const lastClass=isSelf?'last-card-call-self':'last-card-call-seat';
    const tailDir=isSelf?'south':viewCls==='north'?'north':viewCls==='east'?'east':viewCls==='west'?'west':'south';
    const textClass=String(activeCallout?.text??'').length>10?'hk-medium':'hk-text';
    if(!calloutDisplayEnabled)return'';
    if(!activeCallout||activeCallout.seat!==seat)return'';
    if(activeCallout.kind==='pass'){
      const fresh='';
      const jitter=calloutJitterStyle(viewCls,`pass|${seat}|${activeCallout.nonce}|${activeCallout.text}`);
      return`<div class="play-type-call ${seatClass} pass-call${fresh}" style="--player-color:${color};${jitter}"><div class="hk-inner"><span class="${textClass}">${esc(activeCallout.text)}</span></div><div class="tail tail-${tailDir}"></div></div>`;
    }
    if(activeCallout.kind==='play'){
      const fresh=activeCallout.fresh?' play-type-call-fresh':'';
      const jitter=calloutJitterStyle(viewCls,`play|${seat}|${activeCallout.nonce}|${activeCallout.text}`);
      return`<div class="play-type-call ${seatClass}${fresh}" style="--player-color:${color};${jitter}"><div class="hk-inner"><span class="${textClass}">${esc(activeCallout.text)}</span></div><div class="tail tail-${tailDir}"></div></div>`;
    }
    if(activeCallout.kind==='last'){
      const fresh=activeCallout.fresh?' last-card-call-fresh':'';
      const jitter=calloutJitterStyle(viewCls,`last|${seat}|${activeCallout.nonce}`);
      return`<div class="last-card-call ${lastClass}${fresh}" style="--player-color:${color};${jitter}"><div class="hk-inner"><span class="${textClass}">${esc(activeCallout.text)}</span></div><div class="tail tail-${tailDir}"></div></div>`;
    }
    return'';
  };
  const lastActions=lastActionBySeat(v.history);
  const playKey=v.lastPlay?`${v.lastPlay.seat}-${v.lastPlay.cards.map(cardId).join(',')}`:'';
  if(playKey&&state.playAnimKey!==playKey)state.playAnimKey=playKey;
  const seatHtml=arr.filter((p)=>p.viewIndex!==0).map((p)=>{
    const active=v.currentSeat===p.seat&&!v.gameOver;
    const pColor=playerColorByViewClass(p.cls);
    const dangerLast=Boolean(!v.gameOver&&p.count===1);
    const badgeHtml=dangerLast
      ?`<span class="avatar-status-badge warning ${active?'danger':''}" aria-label="${esc(t('lastCardCall'))}"></span>`
      :(active?`<span class="avatar-status-badge turn" aria-label="${esc(t('wait'))}"></span>`:'');
    const fan=v.gameOver&&v.revealedHands?(v.revealedHands[p.seat]??[]).map((c)=>renderStaticCard(c,true,'flip-in')).join(''):renderBackCards(p.count,`${p.rawName||p.name}-${p.seat}`);
    const avatarSrc=avatarDataUri(p.name,pColor,p.gender);
    const labelName=`<div class="name"><span class="player-avatar-wrap player-avatar-wrap-opponent avatar-rim" style="--avatar-rim:${pColor};"><img class="player-avatar player-avatar-opponent ${avatarGenderClass(p.gender)}" style="--avatar-outline:${pColor};" src="${avatarSrc}" alt="${esc(p.name)}"/>${badgeHtml}</span><span class="seat-identity"><span class="seat-name-text">${esc(p.name)}</span><span class="seat-subline">${p.score??0}</span></span></div>`;
    const outerLabel=`<div class="seat-name-fixed">${labelName}</div>`;
    const calloutHtml=seatCalloutHtml(p.seat,p.cls,pColor,false);
    const glass='border:1px solid rgba(255,255,255,.17) !important;background:linear-gradient(130deg, rgba(255,255,255,.10), rgba(255,255,255,.03)),rgba(8, 24, 38, .36) !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.16),0 1px 4px rgba(0,0,0,.1) !important;border-radius:12px !important;';
    const innerNoOutline='border:0 !important;box-shadow:none !important;background:transparent !important;';
    const shellStyle=`--player-color:${pColor};${glass}`;
    const sectionStyle=innerNoOutline;
    return`<div class="seat ${p.cls} ${active?'active':''}" style="${shellStyle}">${outerLabel}${calloutHtml}<div class="seat-pack seat-section" style="${sectionStyle}"><div class="opponent-fan ${opponentFanStyleByName(p.rawName||p.name)}">${fan}</div></div></div>`;
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
  const selfBadgeHtml=selfDangerLast
    ?`<span class="avatar-status-badge warning ${selfActive?'danger':''}" aria-label="${esc(t('lastCardCall'))}"></span>`
    :(selfActive?`<span class="avatar-status-badge turn" aria-label="${esc(t('wait'))}"></span>`:'');
  const selfAvatar=`<span class="player-avatar-wrap player-avatar-wrap-self avatar-rim" style="--avatar-rim:${selfSeatColor};"><img id="self-avatar-img" class="player-avatar player-avatar-self ${avatarGenderClass(selfGender)} ${useGoogleSelfAvatar?'player-avatar-google':''}" style="--avatar-outline:${selfSeatColor};" src="${selfAvatarSrc}" data-fallback="${selfGender==='female'?AVATAR_BASE_SRC.female:AVATAR_BASE_SRC.male}" alt="${esc(selfName)}"/>${selfBadgeHtml}</span>`;
  const selfCalloutHtml=self?seatCalloutHtml(self.seat,'south',selfSeatColor,true):'';
  const isMobile=isMobilePointer();
  const mobileNamesHtml='';
  const mobileDiscardHtml='';
  const logToggleStateIcon=state.showLog?'▾':'▸';
  const logToggleStateText=state.showLog?(state.language==='zh-HK'?'收起':'Collapse'):(state.language==='zh-HK'?'展開':'Expand');
  const isRecPass=state.recommendHint===t('recPass');
  const isRecEmpty=state.recommendHint===t('noSuggest');
  const showRecommendHint=Boolean(state.recommendHint)&&!isRecPass;
  const isRecPlay=state.recommendation?.action==='play';
  app.innerHTML=`<section class="game-shell ${v.gameOver?'game-over':''} ${state.showLog?'log-open':''}"><div class="main-zone"><header class="topbar"><div class="game-title-wrap"><img class="title-logo title-logo-game" src="${withBase('title-lockup-game.png')}" alt="鋤大D TRADITIONAL BIG TWO"/></div><div class="topbar-right"><div class="control-row"><button id="lang-toggle" class="secondary">${state.language==='zh-HK'?'EN':'中'}</button><button id="game-intro-toggle" class="secondary">${esc(intro.btnShow)}</button><button id="score-guide-toggle" class="secondary">${t('scoreGuide')}</button><button id="game-lb-toggle" class="secondary">${t('lb')}</button><button id="home-btn" class="secondary">${t('home')}</button><button id="restart-btn" class="primary">${t('restart')}</button></div></div></header><section class="table">${seatHtml}<div class="table-center-stack">${mobileNamesHtml}${mobileDiscardHtml}${centerMovesHtml(v.history,v.selfSeat)}${centerLastMovesHtml(lastActions,v.selfSeat)}</div>${(!v.gameOver&&youWin)?`<div class="win-celebrate"><div class="confetti-layer"></div><div class="win-banner">${t('congrats')}</div></div>`:''}</section><section class="action-zone"><div class="action-strip ${v.canControl&&!v.gameOver?'active':''}" style="--player-color:${playerColorByViewClass('south')};"><div class="seat-name-fixed player-tag"><div class="name">${selfAvatar}<span class="seat-identity"><span class="seat-name-text">${esc(selfName)}</span><span class="seat-subline">${selfScore}</span></span></div></div>${selfCalloutHtml}<div class="control-row"><button id="play-btn" class="primary game-cta-btn ${isRecPlay?'recommend-glow-play':''}" ${canPlay?'':'disabled'}><span aria-hidden="true">▶</span><span>${t('play')}</span></button><button id="pass-btn" class="danger game-cta-btn ${isRecPass?'recommend-glow':''}" ${v.canPass?'':'disabled'}><span aria-hidden="true">✖</span><span>${t('pass')}</span></button><span class="recommend-anchor"><button id="suggest-btn" class="secondary game-cta-btn" ${canSuggest?'':'disabled'}><span aria-hidden="true">💡</span><span>${t('suggest')}</span></button>${showRecommendHint?`<span class="recommend-layer"><span class="hint recommend-hint ${isRecEmpty?'rec-empty':''}"><span class="recommend-bulb" aria-hidden="true">💡</span><span>${esc(state.recommendHint)}</span></span></span>`:''}</span><button id="auto-seq-btn" class="secondary game-icon-btn" ${canAutoSort?'':'disabled'} title="${esc(t('autoSeq'))}" aria-label="${esc(t('autoSeq'))}"><svg class="sort-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h10M4 12h8M4 17h6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M17 6l3-3 3 3M20 3v18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button id="auto-pattern-btn" class="secondary game-icon-btn" ${canAutoSort?'':'disabled'} title="${esc(t('autoPattern'))}" aria-label="${esc(t('autoPattern'))}"><svg class="sort-icon" aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="5" width="7" height="6" rx="1.4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="5" width="7" height="6" rx="1.4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="13" width="7" height="6" rx="1.4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="13" width="7" height="6" rx="1.4" fill="none" stroke="currentColor" stroke-width="2"/></svg></button></div><div class="hand">${v.hand.map((c)=>renderHandCard(c,state.selected.has(cardId(c)),(showMust3Highlight&&isLowestSingle(c))?'must3-highlight':'')).join('')}</div><div class="drag-popup" id="drag-popup">${t('drag')}</div></div></section>${v.gameOver?'':congratsOverlayHtml(v,youWin)}${revealHtml(v,arr)}</div><aside class="side-zone ${state.showLog?'':'log-collapsed'}"><section class="side-card log-side-card ${state.showLog?'':'collapsed'}"><h3 id="log-toggle" class="log-toggle-title title-with-icon" aria-expanded="${state.showLog?'true':'false'}" aria-label="${esc(logToggleStateText)}"><span class="title-icon title-icon-log" aria-hidden="true"></span><span>${t('log')}</span><span class="log-toggle-state" aria-hidden="true">${logToggleStateIcon}</span></h3><div class="history-list">${historyHtml(v.history,v.selfSeat,v.systemLog)}</div></section></aside>${v.gameOver?resultScreenHtml(v,arr):''}${state.showScoreGuide?scoreGuideModalHtml():''}${state.home.showIntro?introPanelHtml():''}${state.home.showLeaderboard?leaderboardModalHtml():''}</section>`;
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
    syncHandStackMode();
    retargetCalloutTails();
    setTimeout(retargetCalloutTails,80);
  });
}
function retargetCalloutTails(){
  const bubbles=[...document.querySelectorAll('.play-type-call, .last-card-call')];
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
function reorderCurrent(v,fromId,toId){state.solo.players[0].hand=reorderById(state.solo.players[0].hand,fromId,toId,cardId);}
function autoArrangeCurrent(v,mode='seq'){state.solo.players[0].hand=mode==='pattern'?patternSortCards(state.solo.players[0].hand):[...state.solo.players[0].hand].sort(cmpCard);}

function bindGameEvents(v,arr){
  const canReorder=!isMobilePointer()&&!v.gameOver&&v.hand.length>0;
  const canAutoSort=!v.gameOver&&v.hand.length>0;
  const dragEnabled=canReorder&&!isMobilePointer();
  let dragPopupTimer=null;
  const popupEl=()=>document.getElementById('drag-popup');
  const hideDragPopup=()=>{
    const el=popupEl();
    if(dragPopupTimer){clearTimeout(dragPopupTimer);dragPopupTimer=null;}
    el?.classList.remove('show');
  };
  const showDragPopup=(autoHideMs=0)=>{
    const el=popupEl();
    if(!el)return;
    if(dragPopupTimer){clearTimeout(dragPopupTimer);dragPopupTimer=null;}
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    if(autoHideMs>0){
      dragPopupTimer=window.setTimeout(()=>{dragPopupTimer=null;popupEl()?.classList.remove('show');},autoHideMs);
    }
  };
  const runPass=()=>{
    if(!v.canPass)return;
    state.recommendation=null;
    setRecommendHint('');
    soloPass(0);
    state.selected.clear();
    render();
    maybeRunSoloAi();
  };
  const runPlay=(cards)=>{
    if(!v.canControl)return;
    setRecommendHint('');
    if(!cards.length){
      if(v.mode==='solo'){setSoloStatus(t('pick'));render();}
      return;
    }
    state.recommendation=null;
    const ok=soloApplyPlay(0,cards);
    if(ok){
      state.selected.clear();
      render();
      maybeRunSoloAi();
    }else render();
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
  document.getElementById('home-btn')?.addEventListener('click',()=>{
    if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}
    state.screen='home';
    state.selected.clear();
    state.recommendation=null;
    setRecommendHint('');
    render();
  });
  document.getElementById('result-home')?.addEventListener('click',()=>{if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}state.screen='home';state.selected.clear();state.recommendation=null;setRecommendHint('');render();});
  document.getElementById('congrats-home')?.addEventListener('click',()=>{if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}state.screen='home';state.selected.clear();state.recommendation=null;setRecommendHint('');render();});
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
  document.getElementById('restart-btn')?.addEventListener('click',async()=>{
    if(shouldOpenAdBeforeStartingNewGame())triggerStartGameSmartLink();
    await waitMs(120);
    state.recommendation=null;
    setRecommendHint('');
    startSoloGame();
  });
  document.getElementById('result-again')?.addEventListener('click',async()=>{
    await waitMs(120);
    state.recommendation=null;
    setRecommendHint('');
    startSoloGame();
  });
  document.getElementById('congrats-again')?.addEventListener('click',async()=>{
    await waitMs(120);
    state.recommendation=null;
    setRecommendHint('');
    startSoloGame();
  });
  document.getElementById('auto-seq-btn')?.addEventListener('click',()=>{if(!canAutoSort)return;autoArrangeCurrent(v,'seq');render();});
  document.getElementById('auto-pattern-btn')?.addEventListener('click',()=>{if(!canAutoSort)return;autoArrangeCurrent(v,'pattern');render();});
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
    n.addEventListener('dragstart',(e)=>{if(!dragEnabled||!id)return;state.drag.id=id;state.drag.moved=false;showDragPopup();e.dataTransfer?.setData('text/plain',id);});
    n.addEventListener('dragover',(e)=>{if(!dragEnabled)return;e.preventDefault();});
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

  document.getElementById('pass-btn')?.addEventListener('click',()=>{unlockAudio();runPass();});
  document.getElementById('play-btn')?.addEventListener('click',()=>{unlockAudio();const cards=v.hand.filter((c)=>state.selected.has(cardId(c)));runPlay(cards);});
}

function render(){
  applyTheme();
  document.title=EFFECTIVE_ENV==='PROD'?`${t('title')}`:`${t('title')} - ${EFFECTIVE_ENV}`;
  document.body.setAttribute('data-screen',state.screen);
  document.body.setAttribute('data-ios',isIOSDevice()?'1':'0');
  document.body.setAttribute('data-log-open',state.screen==='game'&&state.showLog?'1':'0');
  syncWebViewportGuardAttrs();
  if(shouldBlockLandscapeMobile()){
    renderOrientationBlock();
    return;
  }
  if(state.screen==='home'){renderHome();return;}
  if(state.screen==='config'){renderConfig();return;}
  renderGame();
}
function syncViewport(){
  const root=document.documentElement;
  const short=Math.min(window.innerWidth,window.innerHeight);
  const scale=Math.max(0.74,Math.min(1.1,short/520));
  root.style.setProperty('--card-scale',scale.toFixed(3));
  const orientation=window.matchMedia('(orientation: portrait)').matches?'portrait':'landscape';
  document.body.setAttribute('data-orientation',orientation);
  syncWebViewportGuardAttrs();
  root.style.setProperty('--table-tilt','0deg');
  const blocked=shouldBlockLandscapeMobile();
  if(blocked!==orientationBlockActive){
    orientationBlockActive=blocked;
    render();
    return;
  }
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
    unlockAudio();
    if(state.screen==='game'){
      calloutSpeechActive=false;
      calloutSpeechUntil=0;
      calloutSpeechEndedAt=Date.now();
      calloutResumePending=false;
      maybeRunSoloAi();
      render();
    }
  }
});
window.addEventListener('load',()=>{if(state.screen==='home')queueGoogleInlineRender();},{once:true});
loadGoogleSession();bootFirebase();syncViewport();render();







