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
    easy:'初級',
    normal:'中級',
    hard:'高級',
    solo:'開局',
    config:'設定',
    soundFx:'音效',
    soundOn:'開',
    soundOff:'關',
    home:'返回主頁',
    again:'再玩一局',
    restart:'重新開始',
    play:'出牌',
    pass:'過牌',
    autoSeq:'順子排序',
    autoPattern:'牌型排序',
    suggest:'建議出牌',
    score:'分數',
    suggestCost:'',
    cards:'手牌',
    log:'已出牌紀錄',
    nolog:'未有紀錄',
    rules:'規則重點',
    ruleItems:[
      '開局第一手必須包含 ♦3。',
      '可出：單張、一對、三條、或 5 張牌型。',
      '5 張牌型：蛇、花、俘虜、四條、同花順。',
      '點數由 3 至 2；同點數比花色：♦ < ♣ < ♥ < ♠。',
      '只可跟出相同張數；5 張可用更高牌型壓較低牌型。',
      '其餘三家都過牌後，最後出牌者重新話事。',
      '有人剩 1 張時會提示「最後一張！」。',
      '當下家只剩 1 張牌時，上家若冇頂大而令下家出清，需兼負其餘兩家輸分。',
      '記分：所有人起始 5000 分。',
      '基本計分：輸家按剩餘張數扣分：1-9 張 x1、10-12 張 x2、13 張 x3。',
      '加乘罰則：持有任意 2 再 x2；持有 ♠2（頂大）再 x2，可疊乘。',
      '所有輸家扣分總和加到贏家。'
    ],
    wait:'等待出牌...',
    free:'而家無上手，話事可任意出牌。',
    last:'上手',
    recentCard:'最近出牌',
    reveal:'完局攤牌',
    revealSub:'有人勝出，所有玩家餘牌如下：',
    drag:'可拖曳手牌重新排序',
    must3:'首圈第一手必須包含階磚3。',
    beat:'你所選牌未能大過上手。',
    cantPass:'話事中不可過牌。',
    retake:'重新話事。',
    pick:'請先揀牌。',
    pair:'雙牌必須同點數。',
    triple:'三條必須同點數。',
    count:'只可出1、2、3或5張。',
    five:'五張牌只接受蛇、花、俘虜、四條、同花順。',
    penalty:'輸家記牌',
    aiTag:'(AI)',
    wins:'勝出！',
    congrats:'恭喜你贏咗哩局！',
    resultTitle:'對局結果',
    resultWinner:'本局勝出',
    resultRemain:'剩餘手牌',
    resultDelta:'本局分數變動',
    resultDetail:'計分明細',
    scoreBase:'基本',
    scoreMul:'加乘',
    scoreDeduct:'扣分',
    scoreGain:'加分',
    scoreAnyTwo:'有2',
    scoreTopTwo:'有頂大♠2',
    scoreChao2:'炒雙',
    scoreChao3:'炒三',
    scoreChao4:'炒四',
    scoreChaoBig:'大炒',
    scorePenaltyBoost:'加乘罰則',
    lastCardCall:'最後一張！',
    noSuggest:'而家無可用建議。',
    needScore:'',
    recPass:'建議：過牌。',
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
      '加乘罰則：持有任意 2 再 x2；持有 ♠2（頂大）再 x2，可疊乘。',
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
    easy:'Beginner',
    normal:'Intermediate',
    hard:'Advanced',
    solo:'Start',
    config:'Config',
    soundFx:'Sound Effects',
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
    log:'Played Log',
    nolog:'No history yet',
    rules:'Rule Highlights',
    ruleItems:[
      'Opening trick must include \u26663.',
      'Valid plays: single, pair, triple, or 5-card hand.',
      '5-card hands: straight, flush, full house, four of a kind, straight flush.',
      'Rank order is 3 up to 2; suit order is \u2666 < \u2663 < \u2665 < \u2660.',
      'You must follow the same card count; for 5-card hands, stronger hand types beat weaker ones.',
      'After three consecutive passes, the last player who played regains lead.',
      'A player with 1 card left triggers a "Last card!" warning.',
      'If next player has 1 card and you fail to top with your strongest card, and that player wins, you also absorb the other two losers\' deductions.',
      'Everyone starts at 5000 points.',
      'Base scoring for losers by remaining cards: 1-9 cards x1, 10-12 cards x2, 13 cards x3.',
      'Multiplier penalties: holding any 2 applies x2; holding ♠2 (top 2) applies another x2; multipliers stack.',
      'Total deductions from all losers are added to the winner.'
    ],
    wait:'Waiting...',
    free:'No active hand. Lead may play any valid set.',
    last:'Last',
    recentCard:'Recent Card',
    reveal:'Showdown',
    revealSub:'Winner decided. Remaining cards are revealed:',
    drag:'Drag cards to resequence your hand',
    must3:'First turn must include \u26663.',
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
    resultDelta:'Round Score Change',
    resultDetail:'Scoring Detail',
    scoreBase:'Base',
    scoreMul:'Multiplier',
    scoreDeduct:'Deduction',
    scoreGain:'Gain',
    scoreAnyTwo:'Has 2',
    scoreTopTwo:'Has top ♠2',
    scoreChao2:'Chao Two',
    scoreChao3:'Chao Three',
    scoreChao4:'Chao Four',
    scoreChaoBig:'Big Chao',
    scorePenaltyBoost:'Multiplier Penalties',
    lastCardCall:'Last card!',
    noSuggest:'No valid recommendation now.',
    needScore:'',
    recPass:'Recommended: Pass.',
    recReady:'Recommendation is already active. Play or pass first.',
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
      'Multiplier penalties: holding any 2 applies x2; holding ♠2 (top 2) applies another x2; multipliers stack.',
      'Last-card rule: if you fail to top against a next player on 1 card and they win, you also absorb the other two losers\' deductions.',
      'Total deductions from all losers are added to the winner.'
    ]
  }
};
const KIND={
  'zh-HK':{single:'單張',pair:'一對',triple:'三條',straight:'蛇',flush:'花',fullhouse:'俘虜',fourofkind:'四條',straightflush:'同花順'},
  en:{single:'Single',pair:'Pair',triple:'Triple',straight:'Straight',flush:'Flush',fullhouse:'Full House',fourofkind:'Four Kind',straightflush:'Straight Flush'}
};
const app=document.getElementById('app');
const state={language:'zh-HK',screen:'home',showRules:false,showLog:false,logTouched:false,showScoreGuide:false,selected:new Set(),drag:{id:null,moved:false},playAnimKey:'',autoPassKey:'',score:5000,suggestCost:0,recommendation:null,recommendHint:'',home:{mode:'solo',name:'玩家',aiDifficulty:'normal',backColor:'red',theme:'ocean',showIntro:false,showLeaderboard:false,google:{signedIn:false,name:'',email:'',uid:'',sub:'',token:''},leaderboard:{rows:[],sort:'totalDelta',period:'all',limit:20}},solo:{players:[],botNames:[],totals:[5000,5000,5000,5000],currentSeat:0,lastPlay:null,passStreak:0,isFirstTrick:true,gameOver:false,status:'',history:[],aiDifficulty:'normal',lastCardBreach:null}};
const LEADERBOARD_KEY='hkbig2.leaderboard.v1';
const GOOGLE_SESSION_KEY='hkbig2.google.session.v1';
const FIREBASE_CONFIG={apiKey:'AIzaSyAY-Zci-r9FJ0ILKh4_VG7klRbXPBKy870',authDomain:'seed-services.firebaseapp.com',projectId:'seed-services',storageBucket:'seed-services.firebasestorage.app',messagingSenderId:'231791241940',appId:'1:231791241940:web:32a83b237a5c1cdf4ca941',measurementId:'G-BY9JCDFM79'};
const FIRESTORE_LB_COLLECTION='big2LeaderboardPlayers';
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
const PLAYER_COLORS={south:'#ffd166',east:'#ff6b6b',north:'#c77dff',west:'#86d989'};
const playerColorByViewClass=(cls)=>PLAYER_COLORS[cls]??'#f4f9fb';
let aiTimer=null;
let playTypeCallTimer=null;
const playTypeCallState={key:'',seat:0,text:'',until:0,startedAt:0};
let recommendHintTimer=null;
let lastCardCallTimer=null;
const lastCardCallState={key:'',seat:0,until:0,startedAt:0};
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
const BOT_NAMES={zh:['阿龍','小琪','天仔','阿雲','阿樂','子晴','阿彥','家豪','嘉琪','子軒'],en:['Nova','Milo','Jade','Axel','Iris','Luna','Rex','Nora','Kane','Skye']};
const BACK_OPTIONS=[
  {value:'blue',file:'back-blue-clean.png',label:{'zh-HK':'藍色',en:'Blue'}},
  {value:'red',file:'back-red-clean.png',label:{'zh-HK':'紅色',en:'Red'}},
  {value:'green',file:'back-green-clean.png',label:{'zh-HK':'綠色',en:'Green'}},
  {value:'gold',file:'back-gold-clean.png',label:{'zh-HK':'金色',en:'Gold'}},
  {value:'purple',file:'back-purple-clean.png',label:{'zh-HK':'紫色',en:'Purple'}}
];
const BASE_URL=(import.meta.env?.BASE_URL??'./').replace(/\/?$/,'/');
const withBase=(p)=>`${BASE_URL}${String(p??'').replace(/^\/+/,'')}`;

const t=(k)=>I18N[state.language][k]??k;
const kindLabel=(k)=>KIND[state.language][k]??k;
const introText=()=>state.language==='en'
  ?{
    btnShow:'Guide',
    btnHide:'Close',
    panelTitle:'Guide',
    panelSub:'',
    historyTitle:'Background',
    historyBody:'Big 2 (Cho Dai Di) is a four-player climbing card game played with a full 52-card deck, 13 cards each, with no jokers. The Hong Kong ruleset emphasizes tempo control: players follow the same card count (single, pair, triple, or 5-card hand) and compete to shed all cards first, while suit order (♦ < ♣ < ♥ < ♠) resolves ties. In local play culture, Big 2 became a staple social game because rounds are short, decisions are tactical, and score swings reward both efficient hand management and timely pressure on opponents.',
    playTitle:'Gameplay Highlights',
    playList:['Opening trick must include {{3D}}','Follow the same card count: single, pair, triple, or 5-card hand','5-card strength: Straight < Flush < Full House < Four of a Kind < Straight Flush','After three passes, lead returns to the last successful player'],
    flowTitle:'Opening Flow',
    flowList:['Deal 13 cards to each of 4 players','Player holding {{3D}} opens the first trick','Others either beat with same card count or pass','Round continues until one player empties hand'],
    howTitle:'Hand Types',
    howBody:'Same card count is required to follow. For 5-card hands, compare hand type first.',
    howList:[]
  }
  :{
    btnShow:'玩法指南',
    btnHide:'關閉',
    panelTitle:'玩法指南',
    panelSub:'',
    historyTitle:'歷史背景',
    historyBody:'鋤大D係四人玩法、每人13張牌、使用一副52張撲克牌（唔用鬼牌）嘅鬥快出清遊戲。香港玩法重視節奏同話事權：要跟相同張數（單張、一對、三條、五張牌型），同點數時再按花色次序（♦ < ♣ < ♥ < ♠）決勝。由於一局時間短但策略密度高，玩家要喺保留關鍵大牌、拆牌取捨、同壓制對手之間平衡，所以一直係香港最常見嘅社交牌局之一。',
    playTitle:'玩法重點',
    playList:['開局第一手必須包含 {{3D}}','要跟相同張數：單張／一對／三條／五張牌型','五張牌型大小：蛇 < 花 < 俘虜 < 四條 < 同花順','連續三家過牌後，由最後出牌者重新話事'],
    flowTitle:'開局流程',
    flowList:['4 位玩家每人派 13 張','持有 {{3D}} 玩家先開第一手','其餘玩家要用相同張數壓過，或選擇過牌','直到有人出清手牌為止'],
    howTitle:'牌型',
    howBody:'香港鋤大D要先跟相同張數；5張牌時先比牌型。',
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
    {name:'俘虜',desc:'三條 + 一對',cards:[card('Q','\u2663'),card('Q','\u2666'),card('Q','\u2660'),card('5','\u2665'),card('5','\u2663')]},
    {name:'四條',desc:'4張同點數 + 腳',cards:[card('8','\u2666'),card('8','\u2663'),card('8','\u2665'),card('8','\u2660'),card('2','\u2663')]},
    {name:'同花順',desc:'同花色 + 連續點數',cards:[card('5','\u2660'),card('6','\u2660'),card('7','\u2660'),card('8','\u2660'),card('9','\u2660')]}
  ];
}
function introPanelHtml(){
  const it=introText();
  const formatIntroLine=(text)=>{
    const token='{{3D}}';
const inlineCard=`<img class="intro-inline-card-art" src="${withBase('card-assets/diamond-3.png')}" alt="♦3"/>`;
    return esc(String(text??'')).replaceAll(token,inlineCard);
  };
  const rows=introHandSamples().map((row)=>`<div class="intro-hand-row"><div class="intro-hand-meta"><strong>${esc(row.name)}</strong><span>${esc(row.desc)}</span></div><div class="intro-hand-cards">${row.cards.map((c)=>renderStaticCard(c,true)).join('')}</div></div>`).join('');
  return`<div class="intro-modal" id="intro-modal"><button class="intro-backdrop" id="intro-backdrop" aria-label="close"></button><section class="intro-sheet"><header class="intro-head"><div><h3>${esc(it.panelTitle)}</h3>${it.panelSub?`<p>${esc(it.panelSub)}</p>`:''}</div><button id="intro-close" class="secondary">${esc(it.btnHide)}</button></header><div class="intro-grid"><article class="intro-block"><h4>${esc(it.historyTitle)}</h4><p>${esc(it.historyBody)}</p></article><article class="intro-block"><h4>${esc(it.howTitle)}</h4><p>${esc(it.howBody)}</p><div class="intro-hand-list">${rows}</div></article><article class="intro-block"><h4>${esc(it.flowTitle)}</h4><ul>${(it.flowList??[]).map((x)=>`<li>${formatIntroLine(x)}</li>`).join('')}</ul></article><article class="intro-block"><h4>${esc(it.playTitle)}</h4><ul>${(it.playList??[]).map((x)=>`<li>${formatIntroLine(x)}</li>`).join('')}</ul></article></div></section></div>`;
}
function leaderboardModalHtml(){
  const closeLabel=state.language==='en'?'Close':'關閉';
  return`<div class="intro-modal lb-modal" id="lb-modal"><button class="intro-backdrop" id="lb-backdrop" aria-label="close"></button><section class="intro-sheet lb-sheet"><header class="intro-head"><div><h3>${t('lb')}</h3></div><button id="lb-close" class="secondary">${closeLabel}</button></header>${leaderboardPanelHtml()}</section></div>`;
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
  try{
    const raw=localStorage.getItem(LEADERBOARD_KEY);
    const parsed=raw?JSON.parse(raw):null;
    if(parsed&&typeof parsed==='object'&&parsed.players&&typeof parsed.players==='object')return parsed;
  }catch{}
  return{players:{}};
}
function saveLeaderboardStore(store){
  try{localStorage.setItem(LEADERBOARD_KEY,JSON.stringify(store));}catch{}
}
function initFirebaseIfReady(){
  try{
    if(firebaseAuth&&firebaseDb)return true;
    const fb=window.firebase;
    if(!fb)return false;
    if(!fb.apps?.length)firebaseApp=fb.initializeApp(FIREBASE_CONFIG);else firebaseApp=fb.app();
    firebaseAuth=fb.auth();
    firebaseDb=fb.firestore();
    firebaseAuth.onAuthStateChanged((user)=>{
      if(user){
        const displayName=String(user.displayName??'').trim().slice(0,18);
        const email=String(user.email??'').trim().toLowerCase().slice(0,120);
        state.home.google={signedIn:true,name:displayName,email,uid:String(user.uid??''),sub:state.home.google.sub||String(user.uid??''),token:''};
        if(displayName)state.home.name=displayName;
        saveGoogleSession();
      }else{
        if(state.home.google.signedIn){
          state.home.google={signedIn:false,name:'',email:'',uid:'',sub:'',token:''};
          clearGoogleSession();
        }
      }
      if(state.home.showLeaderboard)refreshLeaderboard(true);
      render();
    });
    return true;
  }catch{return false;}
}
function loadGoogleSession(){
  try{
    const raw=localStorage.getItem(GOOGLE_SESSION_KEY);
    const parsed=raw?JSON.parse(raw):null;
    if(!parsed||typeof parsed!=='object')return;
    const signedIn=Boolean(parsed.signedIn);
    const name=String(parsed.name??'').trim().slice(0,18);
    const email=String(parsed.email??'').trim().toLowerCase().slice(0,120);
    const uid=String(parsed.uid??'').trim().slice(0,128);
    const sub=String(parsed.sub??'').trim().slice(0,64);
    if(!signedIn||!email)return;
    state.home.google={signedIn:true,name,email,uid,sub,token:''};
    if(name)state.home.name=name;
  }catch{}
}
function saveGoogleSession(){
  const g=state.home.google;
  const payload={signedIn:Boolean(g.signedIn),name:String(g.name??'').slice(0,18),email:String(g.email??'').toLowerCase().slice(0,120),uid:String(g.uid??'').slice(0,128),sub:String(g.sub??'').slice(0,64)};
  try{localStorage.setItem(GOOGLE_SESSION_KEY,JSON.stringify(payload));}catch{}
}
function clearGoogleSession(){
  try{localStorage.removeItem(GOOGLE_SESSION_KEY);}catch{}
}
function currentLeaderboardIdentity(){
  const g=state.home.google;
  if(g.signedIn&&g.email){
    const email=String(g.email).toLowerCase();
    const uid=String(g.uid??'').trim();
    return{id:uid?`uid:${uid}`:`google:${email}`,name:String(g.name||state.home.name||'Player').slice(0,32),email};
  }
  const fallback=String(state.home.name??'').trim().slice(0,32)||'Player';
  return{id:`name:${fallback.toLowerCase()}`,name:fallback,email:''};
}
function ensureLeaderboardEntry(store,identity){
  const safe=String(identity?.name??identity??'').trim().slice(0,32);
  if(!safe)return null;
  const email=String(identity?.email??'').trim().toLowerCase().slice(0,120);
  const key=String(identity?.id??(email?`google:${email}`:`name:${safe.toLowerCase()}`)).trim().slice(0,180);
  if(!key)return null;
  if(!store.players[key]){
    store.players[key]={id:key,name:safe,email,games:0,wins:0,totalDelta:0,bestRound:0,worstRound:0,updatedAt:Date.now(),history:[]};
  }
  if(safe)store.players[key].name=safe;
  if(email)store.players[key].email=email;
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
  entry.totalDelta+=value;
  entry.bestRound=Math.max(Number(entry.bestRound)||0,value);
  entry.worstRound=Math.min(Number(entry.worstRound)||0,value);
  entry.updatedAt=now;
  entry.history=[...(entry.history??[]),{ts:now,delta:value,won:Boolean(won)}].slice(-200);
  saveLeaderboardStore(store);
  if(!firebaseDb)return;
  try{
    const ref=firebaseDb.collection(FIRESTORE_LB_COLLECTION).doc(String(entry.id));
    await firebaseDb.runTransaction(async(tx)=>{
      const snap=await tx.get(ref);
      const base=snap.exists?(snap.data()??{}):{};
      const prevHistory=Array.isArray(base.history)?base.history:[];
      const history=[...prevHistory,{ts:now,delta:value,won:Boolean(won)}].slice(-200);
      const games=Number(base.games)||0;
      const wins=Number(base.wins)||0;
      const totalDelta=Number(base.totalDelta)||0;
      const bestRound=Math.max(Number(base.bestRound)||0,value);
      const worstRound=Math.min(Number(base.worstRound)||0,value);
      tx.set(ref,{id:String(entry.id),name:String(identity?.name??entry.name??'Player').slice(0,32),email:String(identity?.email??entry.email??'').toLowerCase().slice(0,120),games:games+1,wins:wins+(won?1:0),totalDelta:totalDelta+value,bestRound,worstRound,updatedAt:now,history},{merge:true});
    });
  }catch(err){
    console.error('leaderboard round write exception',err);
  }
}
function computeLeaderboardRowsFromStore(store,period,sort,limit){
  const days=period==='7d'?7:period==='30d'?30:0;
  const cutoff=days?Date.now()-days*24*60*60*1000:0;
  const rows=Object.values(store.players).map((entry)=>{
    const items=(entry.history??[]).filter((h)=>!cutoff||Number(h.ts)>=cutoff);
    const games=items.length;
    const wins=items.filter((h)=>Boolean(h.won)).length;
    const totalDelta=items.reduce((sum,h)=>sum+(Number(h.delta)||0),0);
    const bestRound=items.length?Math.max(...items.map((h)=>Number(h.delta)||0)):0;
    const worstRound=items.length?Math.min(...items.map((h)=>Number(h.delta)||0)):0;
    const useGames=cutoff?games:(Number(entry.games)||games);
    const useWins=cutoff?wins:(Number(entry.wins)||wins);
    const useDelta=cutoff?totalDelta:(Number(entry.totalDelta)||totalDelta);
    return{name:String(entry.name??''),email:String(entry.email??''),games:useGames,wins:useWins,winRate:useGames?useWins/useGames:0,totalDelta:useDelta,avgDelta:useGames?useDelta/useGames:0,bestRound:cutoff?bestRound:(Number(entry.bestRound)||0),worstRound:cutoff?worstRound:(Number(entry.worstRound)||0),updatedAt:Number(entry.updatedAt)||0};
  }).filter((row)=>row.games>0||period==='all');
  rows.sort((a,b)=>{
    if(sort==='wins')return b.wins-a.wins||b.totalDelta-a.totalDelta||a.name.localeCompare(b.name);
    if(sort==='games')return b.games-a.games||b.wins-a.wins||a.name.localeCompare(b.name);
    if(sort==='winRate')return b.winRate-a.winRate||b.wins-a.wins||a.name.localeCompare(b.name);
    if(sort==='avgDelta')return b.avgDelta-a.avgDelta||b.totalDelta-a.totalDelta||a.name.localeCompare(b.name);
    return b.totalDelta-a.totalDelta||b.wins-a.wins||a.name.localeCompare(b.name);
  });
  return rows.slice(0,limit);
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
      store.players[id]={id,name:String(d.name??''),email:String(d.email??''),games:Number(d.games)||0,wins:Number(d.wins)||0,totalDelta:Number(d.totalDelta)||0,bestRound:Number(d.bestRound)||0,worstRound:Number(d.worstRound)||0,updatedAt:Number(d.updatedAt)||0,history:Array.isArray(d.history)?d.history:[]};
    });
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
  lb.rows=computeLeaderboardRowsFromStore(store,lb.period,lb.sort,lb.limit);
  if(firebaseDb&&(forceCloud||(!lb.rows.length&&!leaderboardCloudLoaded)))void refreshLeaderboardCloud();
}
function leaderboardPanelHtml(){
  const lb=state.home.leaderboard;
  const rows=lb.rows??[];
  const lx=lbText();
  const rowHtml=rows.length?rows.map((r,i)=>`<div class="lb-row"><div class="lb-rank">#${i+1}</div><div class="lb-main"><div class="lb-name-line"><div class="lb-name">${esc(r.name)}${r.email?` <span class="hint">(${esc(r.email)})</span>`:''}</div><div class="lb-stat">${r.totalDelta>=0?`+${r.totalDelta}`:r.totalDelta}</div></div><div class="lb-sub">${r.wins}/${r.games} · ${lx.wr} ${fmtPct(r.winRate)} · ${lx.avg} ${Number(r.avgDelta??0).toFixed(1)}</div><div class="lb-meta2"><span>${lx.best} ${r.bestRound>=0?`+${r.bestRound}`:r.bestRound}</span><span>${lx.worst} ${r.worstRound>=0?`+${r.worstRound}`:r.worstRound}</span><span>${lx.updated}: ${fmtDateTime(r.updatedAt)}</span></div></div></div>`).join(''):`<div class="hint">${t('lbNoData')}</div>`;
  return`<section class="lobby-panel leaderboard-panel"><div class="control-row lb-head"><label class="field"><span>${t('lbSort')}</span><select id="lb-sort"><option value="totalDelta" ${lb.sort==='totalDelta'?'selected':''}>${t('lbTotalDelta')}</option><option value="wins" ${lb.sort==='wins'?'selected':''}>${t('lbWins')}</option><option value="games" ${lb.sort==='games'?'selected':''}>${t('lbGames')}</option><option value="winRate" ${lb.sort==='winRate'?'selected':''}>${t('lbWinRate')}</option><option value="avgDelta" ${lb.sort==='avgDelta'?'selected':''}>${t('lbAvgDelta')}</option></select></label><label class="field"><span>${t('lbPeriod')}</span><select id="lb-period"><option value="all" ${lb.period==='all'?'selected':''}>${t('lbAll')}</option><option value="7d" ${lb.period==='7d'?'selected':''}>${t('lb7d')}</option><option value="30d" ${lb.period==='30d'?'selected':''}>${t('lb30d')}</option></select></label><button id="lb-refresh" class="secondary">${t('lbRefresh')}</button></div><div class="lb-list">${rowHtml}</div></section>`;
}
function scoreGuideText(){
  return state.language==='en'
    ?{
      close:'Close',
      baseTitle:'Base Scoring',
      mulTitle:'Multiplier Penalties',
      summary:'Round deduction = Base deduction x multiplier. Winner gains total deductions from all losers.',
      tableHeaders:['Remaining Cards','Base Multiplier','Base Deduction'],
      tableRows:[
        ['1-9','x1','remaining cards x1'],
        ['10-12','x2','remaining cards x2'],
        ['13','x3','13 x3']
      ],
      chaoTableHeaders:['Remaining Cards','Multiplier','Name'],
      chaoTableRows:[
        ['8-9','x2','Chao Two'],
        ['10-11','x3','Chao Three'],
        ['12','x4','Chao Four'],
        ['13','x5','Big Chao']
      ],
      anyTwo:'Hold any 2 card (♦2/♣2/♥2/♠2): x2',
      topTwo:'Hold ♠2 (top 2): another x2',
      stack:'Multipliers stack when conditions are met.'
    }
    :{
      close:'關閉',
      baseTitle:'基本計分',
      mulTitle:'加乘罰則',
      summary:'每位輸家扣分 = 基本扣分 x 加乘倍數；所有輸家扣分總和加到贏家。',
      tableHeaders:['剩餘張數','基本倍數','基本扣分'],
      tableRows:[
        ['1-9 張','x1','按剩餘張數 x1'],
        ['10-12 張','x2','按剩餘張數 x2'],
        ['13 張','x3','13 x3']
      ],
      chaoTableHeaders:['餘版張數','倍率','稱呼'],
      chaoTableRows:[
        ['8-9張','x2','炒雙'],
        ['10-11','x3','炒三'],
        ['12','x4','炒四'],
        ['13張','x5','大炒']
      ],
      anyTwo:'持有任意 2（♦2/♣2/♥2/♠2）：x2',
      topTwo:'持有 ♠2（頂大）：再 x2',
      stack:'以上加乘條件可疊乘。'
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
  const topTwoCard=`<img src="${cardImagePath({rank:12,suit:3})}" alt="♠2" class="score-guide-card-art"/>`;
  return`<div class="intro-modal" id="score-guide-modal"><button class="intro-backdrop" id="score-guide-backdrop" aria-label="close"></button><section class="intro-sheet"><header class="intro-head"><div><h3>${t('scoreGuideTitle')}</h3></div><button id="score-guide-close" class="secondary">${sx.close}</button></header><div class="intro-grid"><article class="intro-block"><h4>${sx.baseTitle}</h4><div class="score-guide-table-wrap"><table class="score-guide-table"><thead><tr><th>${esc(sx.tableHeaders[0])}</th><th>${esc(sx.tableHeaders[1])}</th><th>${esc(sx.tableHeaders[2])}</th></tr></thead><tbody>${tableRows}</tbody></table></div></article><article class="intro-block"><h4>${sx.mulTitle}</h4><div class="score-guide-row"><div class="score-guide-cards">${anyTwoCards}</div><p>${esc(sx.anyTwo)}</p></div><div class="score-guide-row"><div class="score-guide-cards">${topTwoCard}</div><p>${esc(sx.topTwo)}</p></div><div class="score-guide-table-wrap"><table class="score-guide-table"><thead><tr><th>${esc(sx.chaoTableHeaders[0])}</th><th>${esc(sx.chaoTableHeaders[1])}</th><th>${esc(sx.chaoTableHeaders[2])}</th></tr></thead><tbody>${chaoTableRows}</tbody></table></div><p class="score-guide-stack">${esc(sx.stack)}</p></article><article class="intro-block"><p>${esc(sx.summary)}</p></article></div></section></div>`;
}
function speakCallout(text){
  try{
    const msg=String(text??'').trim();
    if(!msg||!window.speechSynthesis||typeof window.SpeechSynthesisUtterance==='undefined')return;
    const synth=window.speechSynthesis;
    const setupVoice=(u,voices)=>{
      if(state.language==='en'){
        const voice=voices.find((v)=>String(v.lang??'').toLowerCase().startsWith('en'));
        if(voice)u.voice=voice;
        u.lang='en-US';
      }else{
        const voice=
          voices.find((v)=>/^yue(-|$)/i.test(String(v.lang??'')))||
          voices.find((v)=>/zh[-_]?hk/i.test(String(v.lang??'')))||
          voices.find((v)=>/cantonese|hong kong|heung gong/i.test(`${v.name||''} ${v.lang||''}`))||
          null;
        if(voice)u.voice=voice;
        u.lang=voice?String(voice.lang||'yue-HK'):'yue-HK';
      }
    };
    const speakNow=()=>{
      const u=new SpeechSynthesisUtterance(msg.replace(/[!!]/g,''));
      u.rate=1.02;
      u.pitch=1;
      const voices=synth.getVoices?.()??[];
      setupVoice(u,voices);
      synth.resume?.();
      synth.speak(u);
    };
    const voices=synth.getVoices?.()??[];
    if(!voices.length){
      const onVoices=()=>{speechPrimed=true;speakNow();};
      synth.addEventListener('voiceschanged',onVoices,{once:true});
      setTimeout(()=>{if(!speechPrimed)speakNow();},180);
      return;
    }
    speechPrimed=true;
    speakNow();
  }catch{}
}
function parseJwtPayload(token){try{const p=String(token??'').split('.')[1];if(!p)return null;const b=p.replace(/-/g,'+').replace(/_/g,'/');const json=decodeURIComponent(atob(b).split('').map((c)=>`%${c.charCodeAt(0).toString(16).padStart(2,'0')}`).join(''));return JSON.parse(json);}catch{return null;}}
async function handleCredentialResponse(response){
  const token=String(response?.credential??'').trim();
  if(!token)return;
  const p=parseJwtPayload(token)??{};
  try{
    if(firebaseAuth&&window.firebase?.auth?.GoogleAuthProvider){
      const cred=window.firebase.auth.GoogleAuthProvider.credential(token);
      await firebaseAuth.signInWithCredential(cred);
    }
  }catch{}
  state.home.google={signedIn:true,name:String(p.name??'').slice(0,18),email:String(p.email??'').trim().toLowerCase().slice(0,120),uid:String(firebaseAuth?.currentUser?.uid??'').slice(0,128),sub:String(p.sub??'').slice(0,64),token:''};
  if(state.home.google.name)state.home.name=state.home.google.name;
  saveGoogleSession();
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
function queueGoogleInlineRender(){
  window.setTimeout(()=>{if(state.screen==='home')renderGoogleInline();},0);
  window.requestAnimationFrame(()=>{if(state.screen==='home')renderGoogleInline();});
}
window.onGoogleScriptLoaded=()=>{if(state.screen==='home')queueGoogleInlineRender();};
function bootFirebase(attempt=0){
  if(initFirebaseIfReady()){
    refreshLeaderboard(true);
    return;
  }
  if(attempt<120)window.setTimeout(()=>bootFirebase(attempt+1),250);
}
function renderGoogleInline(attempt=0){
  clearGoogleInlineRetry();
  const slot=document.getElementById('google-name-inline')??document.getElementById('google-inline');
  if(!slot)return;
  if(state.home.google.signedIn){
    slot.innerHTML=`<button id="google-use-name" class="secondary">${t('useGoogleName')}</button><button id="google-signout" class="secondary">${t('signOut')}</button>`;
    document.getElementById('google-use-name')?.addEventListener('click',()=>{if(state.home.google.name){state.home.name=state.home.google.name;render();}});
    document.getElementById('google-signout')?.addEventListener('click',()=>{state.home.google={signedIn:false,name:'',email:'',uid:'',sub:'',token:''};clearGoogleSession();try{window.google?.accounts?.id?.disableAutoSelect?.();}catch{}try{firebaseAuth?.signOut?.();}catch{}render();});
    return;
  }
  try{
    if(window.google?.accounts?.id){
      if(ensureGoogleIdentityInitialized()){
        slot.innerHTML='';
        window.google.accounts.id.renderButton(slot,{theme:'outline',size:'medium',text:'signin_with',shape:'pill'});
        if(slot.childElementCount>0)return;
      }
    }
  }catch{}
  if(!slot.innerHTML.trim())slot.innerHTML=`<button class="secondary" disabled>Google...</button>`;
  if(attempt<40){
    googleInlineRetryTimer=window.setTimeout(()=>renderGoogleInline(attempt+1),250);
  }
}
function isMobilePointer(){return window.matchMedia('(max-width: 860px), (pointer: coarse)').matches;}
window.handleCredentialResponse=handleCredentialResponse;
function uiStatus(msg){const s=String(msg??'');if(!s)return'';return s;}
const esc=(s)=>String(s??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function hashNameSeed(name){
  const s=String(name??'');
  let h=2166136261;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return h>>>0;
}
function pick(arr,seed,offset=0){return arr[(seed+offset)%arr.length];}
function avatarDataUri(name,color){
  const seed=hashNameSeed(name);
  const bg=String(color??'#5f7f9d');
  const skin=pick(['#f1ccae','#e5bb98','#dab08b','#eec6a7'],seed,1);
  const hair=pick(['#2f211a','#402b21','#5c4638','#1f2430'],seed,2);
  const shirt=pick(['#8ea7cb','#7894bf','#6f8cb7','#96a9bb'],seed,3);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#263344"/></linearGradient></defs><rect width="64" height="64" rx="10" fill="url(#g)"/><rect x="3.5" y="3.5" width="57" height="57" rx="8.5" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.42)"/><ellipse cx="32" cy="21.5" rx="13.5" ry="11.2" fill="${hair}"/><circle cx="32" cy="24.2" r="10.2" fill="${skin}"/><rect x="17" y="36" width="30" height="18" rx="8.5" fill="${shirt}"/><circle cx="28.6" cy="24.1" r="1.1" fill="#111827"/><circle cx="35.4" cy="24.1" r="1.1" fill="#111827"/><path d="M28.2 29c1.1.9 2.5 1.4 3.8 1.4 1.4 0 2.8-.5 3.9-1.4" stroke="#824d3f" stroke-width="1.35" fill="none" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
const cardId=(c)=>`${c.rank}-${c.suit}`;
const cmpCard=(a,b)=>a.rank-b.rank||a.suit-b.suit;

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
      if(c.rank>card.rank||(c.rank===card.rank&&c.suit>card.suit))return true;
    }
  }
  return false;
}
function forceFinishPlanPlay(hand,game,seat){
  if(!Array.isArray(hand)||hand.length<2)return null;
  const singles=[...hand].sort((a,b)=>b.rank-a.rank||b.suit-a.suit);
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
function suggestPlay(hand,lastPlay,isFirstTrick){let legal=allValidPlays(hand);if(isFirstTrick)legal=legal.filter((e)=>has3d(e.cards));if(lastPlay)legal=legal.filter((e)=>canBeat(e.eval,lastPlay.eval));if(!legal.length)return null;if(!lastPlay){legal.sort((a,b)=>b.eval.count-a.eval.count||((a.eval.count===5&&a.eval.kind!==b.eval.kind)?FIVE_KIND_POWER[b.eval.kind]-FIVE_KIND_POWER[a.eval.kind]:comparePower(b.eval.power,a.eval.power)));return legal[0];}legal.sort((a,b)=>((a.eval.count===5&&a.eval.kind!==b.eval.kind)?FIVE_KIND_POWER[a.eval.kind]-FIVE_KIND_POWER[b.eval.kind]:comparePower(a.eval.power,b.eval.power)));return legal[0];}
function shouldRecommendPass(hand,lastPlay,isFirstTrick,canPass){if(!canPass||!lastPlay||isFirstTrick)return false;const rec=suggestPlay(hand,lastPlay,isFirstTrick);if(!rec)return true;if(rec.eval.count===1&&rec.cards[0].rank>=11&&hand.length>=5)return true;if(rec.eval.count===2&&rec.cards[0].rank>=10&&hand.length>=6)return true;return false;}
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
    const closeoutBonus=(handLen<=5&&c>=2)?8:0;
    return comboBase+kindBonus+lowSingleBonus+closeoutBonus-preserveHigh-breakSet-tooEarlySingle;
  };
  const respondCost=(play)=>{
    const c=play.eval.count;
    const high=maxRank(play.cards);
    const rankDup=c===1?(rankCount.get(play.cards[0].rank)??0):0;
    let cost=0;
    if(c===1&&rankDup>1&&handLen>5)cost+=12;
    if(high>=11&&handLen>4)cost+=8;
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
function randomBotNames(){const list=state.language==='en'?BOT_NAMES.en:BOT_NAMES.zh;const bag=[...list];const out=[];while(out.length<3){if(!bag.length)bag.push(...list);const idx=Math.floor(Math.random()*bag.length);out.push(bag.splice(idx,1)[0]);}return out;}
function relabelSoloBots(){if(state.home.mode!=='solo'||!state.solo.players.length)return;const keys=state.solo.botNames?.length===3?state.solo.botNames:randomBotNames();state.solo.botNames=keys;state.solo.players=state.solo.players.map((p,i)=>i===0?p:{...p,name:keys[i-1]});}

const suitName=(s)=>['diamond','club','heart','spade'][s]??'club';
const cardImagePath=(card)=>withBase(`card-assets/${suitName(card.suit)}-${RANKS[card.rank]}.png`);
const faceRankClass=(card)=>(card.rank>=8&&card.rank<=10)?'face-jqk':'';
function renderStaticCard(card,mini=false,extra=''){return`<div class="card face ${mini?'mini':''} ${faceRankClass(card)} ${extra}"><img class="card-art" src="${cardImagePath(card)}" alt="${RANKS[card.rank]} ${SUITS[card.suit].symbol}"/></div>`;}
function renderHandCard(card,selected){const draggable=isMobilePointer()?'false':'true';return`<button class="card face hand-card ${faceRankClass(card)} ${selected?'selected':''}" draggable="${draggable}" data-card-id="${cardId(card)}"><img class="card-art" src="${cardImagePath(card)}" alt="${RANKS[card.rank]} ${SUITS[card.suit].symbol}"/></button>`;}
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

function reorderById(arr,fromId,toId,idFn){if(!fromId||!toId||fromId===toId)return arr;const copy=[...arr];const fi=copy.findIndex((x)=>idFn(x)===fromId),ti=copy.findIndex((x)=>idFn(x)===toId);if(fi<0||ti<0)return arr;const[m]=copy.splice(fi,1);copy.splice(ti,0,m);return copy;}
function patternSortCards(hand){return[...hand].sort((a,b)=>b.suit-a.suit||a.rank-b.rank);}

function startSoloGame(){const names=randomBotNames();const p=[{name:state.home.name||t('name'),hand:[],isHuman:true},{name:names[0],hand:[],isHuman:false},{name:names[1],hand:[],isHuman:false},{name:names[2],hand:[],isHuman:false}];const deck=shuffle(createDeck());p.forEach((x)=>{x.hand=deck.splice(0,13).sort(cmpCard);});const start=p.findIndex((x)=>x.hand.some((c)=>c.rank===0&&c.suit===0));const totals=Array.isArray(state.solo.totals)&&state.solo.totals.length===4?[...state.solo.totals]:[5000,5000,5000,5000];state.solo={players:p,botNames:names,totals,currentSeat:start,lastPlay:null,passStreak:0,isFirstTrick:true,gameOver:false,status:`${p[start].name} ${t('start')}`,history:[],aiDifficulty:state.home.aiDifficulty,lastCardBreach:null,roundSummary:null};state.selected.clear();state.recommendation=null;state.screen='game';state.home.mode='solo';playSound('start');render();maybeRunSoloAi();}

function soloApplyPlay(seat,cards){const g=state.solo;const ev=evaluatePlay(cards);if(!ev.valid){if(seat===0)g.status=ev.reason;return false;}if(g.isFirstTrick&&!has3d(cards)){if(seat===0)g.status=t('must3');return false;}if(g.lastPlay&&!canBeat(ev,g.lastPlay.eval)){if(seat===0)g.status=t('beat');return false;}
  if(shouldForceMaxAgainstLastCard(g,seat)){
    const legal=legalTurnPlays(g.players[seat].hand,g).sort(cmpStrongPlayDesc);
    const strongest=legal[0];
    const chosen=legal.find((x)=>x.eval.count===ev.count&&x.eval.kind===ev.kind&&comparePower(x.eval.power,ev.power)===0);
    if(chosen&&strongest&&comparePower(chosen.eval.power,strongest.eval.power)!==0){
      g.lastCardBreach={seat,threatenedSeat:(seat+1)%4};
    }
  }
  const ids=new Set(cards.map(cardId));g.players[seat].hand=g.players[seat].hand.filter((c)=>!ids.has(cardId(c)));g.lastPlay={seat,eval:ev,cards:ev.sorted};g.passStreak=0;g.isFirstTrick=false;g.history.push({action:'play',seat,name:g.players[seat].name,cards:ev.sorted,kind:ev.kind});
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
  g.totals=(g.totals??[5000,5000,5000,5000]).map((s,i)=>s+(i===seat?winnerGain:-deductions[i]));const remain=g.players.map((p,i)=>`${p.name}:${deductions[i]}`).join(' / ');g.status=`${g.players[seat].name} ${t('wins')} ${t('penalty')}:${remain}`;recordLeaderboardRound(currentLeaderboardIdentity(),seat===0?winnerGain:-deductions[0],seat===0);playSound('win');return true;
  }
  if(g.lastCardBreach&&seat===g.lastCardBreach.threatenedSeat)g.lastCardBreach=null;
  g.currentSeat=(seat+1)%4;g.status=`${g.players[seat].name} ${t('played')} ${kindLabel(ev.kind)}.`;playSound('play');return true;}
function soloPass(seat){const g=state.solo;if(!g.lastPlay){if(seat===0)g.status=t('cantPass');return false;}g.passStreak+=1;g.history.push({action:'pass',seat,name:g.players[seat].name});if(g.lastCardBreach&&seat===g.lastCardBreach.threatenedSeat)g.lastCardBreach=null;if(g.passStreak>=3){const lead=g.lastPlay.seat;g.currentSeat=lead;g.lastPlay=null;g.passStreak=0;g.status=`${g.players[lead].name} ${t('retake')}`;playSound('pass');return true;}g.currentSeat=(seat+1)%4;g.status=`${g.players[seat].name} ${t('pass')}.`;playSound('pass');return true;}
function maybeRunSoloAi(){if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}const g=state.solo;if(!g||g.gameOver||g.players[g.currentSeat].isHuman)return;aiTimer=window.setTimeout(()=>{const seat=g.currentSeat;if(g.gameOver||g.players[seat].isHuman)return;const ch=chooseAiPlay(g.players[seat].hand,g,g.aiDifficulty);if(!ch)soloPass(seat);else soloApplyPlay(seat,ch.cards);render();maybeRunSoloAi();},650);}

function unlockAudio(){if(sound.ctx||!sound.enabled)return;try{sound.ctx=new window.AudioContext();}catch{sound.enabled=false;}}
function primeSpeech(){
  try{
    const synth=window.speechSynthesis;
    if(!synth)return;
    synth.getVoices?.();
    speechPrimed=true;
  }catch{}
}
function playTone(freq,d,type='sine',g=0.03,delay=0){if(!sound.ctx)return;const c=sound.ctx,o=c.createOscillator(),a=c.createGain();o.type=type;o.frequency.value=freq;a.gain.value=g;o.connect(a);a.connect(c.destination);const now=c.currentTime+delay;o.start(now);a.gain.exponentialRampToValueAtTime(0.0001,now+d);o.stop(now+d);}
function playSound(kind){if(!sound.enabled||!sound.ctx)return;if(kind==='select')playTone(520,0.08,'triangle',0.02);if(kind==='play'){playTone(330,0.11,'square',0.03);playTone(490,0.12,'triangle',0.02,0.03);}if(kind==='pass')playTone(210,0.1,'sine',0.02);if(kind==='start'){playTone(330,0.1,'triangle',0.025);playTone(495,0.12,'triangle',0.025,0.05);}if(kind==='win'){playTone(392,0.13,'triangle',0.03);playTone(523,0.14,'triangle',0.03,0.06);playTone(659,0.2,'triangle',0.03,0.12);}}
function applyTheme(){const theme=THEMES[state.home.theme]??THEMES.ocean;const root=document.documentElement;for(const[k,v]of Object.entries(theme))root.style.setProperty(k,v);}

function buildView(){const g=state.solo;return{mode:'solo',currentSeat:g.currentSeat,lastPlay:g.lastPlay,gameOver:g.gameOver,isFirstTrick:g.isFirstTrick,status:g.status,participants:g.players.map((p,seat)=>({seat,name:p.name,isBot:!p.isHuman,count:p.hand.length,score:g.totals?.[seat]??0})),hand:g.players[0].hand,history:g.history,selfSeat:0,canControl:!g.gameOver&&g.currentSeat===0,canPass:!g.gameOver&&g.currentSeat===0&&Boolean(g.lastPlay),revealedHands:g.gameOver?g.players.map((p)=>[...p.hand]):null,roundSummary:g.roundSummary??null};}

function historyHtml(h,self){if(!h.length)return`<div class="hint">${t('nolog')}</div>`;return h.slice().reverse().map((e)=>{const vIdx=seatView(e.seat,self);const cls=seatCls[vIdx]||'south';const color=playerColorByViewClass(cls);const mine=vIdx===0;const tag=`<span class="player-color-chip" style="--player-color:${color};"></span><span class="history-name">${esc(e.name)}</span>`;if(e.action==='pass')return`<div class="history-item ${mine?'mine':''}"><div class="history-title">${tag} ${t('pass')}</div></div>`;const cards=(e.cards??[]).map((c)=>renderStaticCard(c,true)).join('');return`<div class="history-item ${mine?'mine':''}"><div class="history-title">${tag} · ${kindLabel(e.kind)}</div><div class="history-cards">${cards}</div></div>`;}).join('');}
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
  if(!logs.length)return`<div class="mobile-discard-panel"><div class="mobile-discard-title">${t('log')}</div><div class="hint">${t('nolog')}</div></div>`;
  void arr;
  const rows=logs.map((e)=>{
    const vIdx=seatView(e.seat,selfSeat);
    const cls=seatCls[vIdx]||'south';
    const color=playerColorByViewClass(cls);
    if(e.action==='pass'){
      return`<div class="mobile-discard-row" style="--player-color:${color};"><div class="mobile-discard-pass">${t('pass')}</div></div>`;
    }
    const cards=(e.cards??[]).map((c)=>renderStaticCard(c,true)).join('');
    return`<div class="mobile-discard-row" style="--player-color:${color};"><div class="mobile-discard-cards">${cards}</div></div>`;
  }).join('');
  return`<div class="mobile-discard-panel"><div class="mobile-discard-title">${t('log')}</div>${rows}</div>`;
}
function centerMobileOpponentNamesHtml(arr,currentSeat,gameOver){
  const others=(arr??[]).filter((p)=>p.viewIndex!==0);
  if(!others.length)return'';
  return`<div class="mobile-opponent-names">${others.map((p)=>`<span class="mobile-opponent-name ${(!gameOver&&currentSeat===p.seat)?'active':''}" style="--player-color:${playerColorByViewClass(p.cls)};"><img class="player-avatar mini" src="${avatarDataUri(p.name,playerColorByViewClass(p.cls))}" alt="${esc(p.name)}"/><span class="seat-name-text">${esc(p.name)}</span><span class="mobile-seat-tag">${seatShortByViewClass(p.cls)}</span><span class="seat-count-tag outside">${p.count}</span></span>`).join('')}</div>`;
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
  if(action.type==='pass')return`<div class="seat-played seat-played-pass"><span class="seat-pass-label">Pass</span></div>`;
  const cards=(action.cards??[]).map((c)=>renderStaticCard(c,true)).join('');
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
function currentLastCardSeat(v){
  const now=Date.now();
  const history=v.history??[];
  if(v.isFirstTrick&&history.length===0){
    lastCardAnnouncedSeats.clear();
    lastCardCallState.key='';
    lastCardCallState.until=0;
    lastCardCallState.startedAt=0;
    lastCardProcessedHistoryLen=0;
    return null;
  }
  if(now<lastCardCallState.until)return lastCardCallState.seat;
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
  lastCardCallState.until=now+1500;
  lastCardCallState.startedAt=now;
  speakCallout(t('lastCardCall'));
  if(lastCardCallTimer)clearTimeout(lastCardCallTimer);
  lastCardCallTimer=window.setTimeout(()=>{lastCardCallTimer=null;lastCardCallState.until=0;lastCardCallState.startedAt=0;render();},1550);
  return latest.seat;
}
function setRecommendHint(msg=''){
  state.recommendHint=msg;
  if(recommendHintTimer){clearTimeout(recommendHintTimer);recommendHintTimer=null;}
  if(msg){
    recommendHintTimer=window.setTimeout(()=>{recommendHintTimer=null;state.recommendHint='';render();},2200);
  }
}
function currentPlayTypeCall(v){
  if(v.gameOver)return'';
  const lastPlay=(v.history??[]).slice().reverse().find((e)=>e.action==='play'&&Array.isArray(e.cards)&&e.cards.length>=4);
  if(!lastPlay)return null;
  const key=`${lastPlay.seat}-${lastPlay.kind}-${lastPlay.cards.map(cardId).join(',')}`;
  const now=Date.now();
  if(playTypeCallState.key!==key){
    playTypeCallState.key=key;
    playTypeCallState.seat=lastPlay.seat;
    playTypeCallState.text=`${kindLabel(lastPlay.kind)}!`;
    playTypeCallState.until=now+1500;
    playTypeCallState.startedAt=now;
    speakCallout(playTypeCallState.text);
    if(playTypeCallTimer)clearTimeout(playTypeCallTimer);
    playTypeCallTimer=window.setTimeout(()=>{playTypeCallTimer=null;playTypeCallState.until=0;playTypeCallState.startedAt=0;render();},1550);
  }
  if(now>playTypeCallState.until)return null;
  return{seat:playTypeCallState.seat,text:playTypeCallState.text};
}
function revealHtml(){return'';}
function resultScreenHtml(v,arr){
  const winner=arr.find((p)=>p.count===0)??arr[0];
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
    return`<div class="result-row ${isWinner?'winner':''}" style="--winner-color:${color};">
      <div class="result-head"><span class="player-color-chip" style="--player-color:${color};"></span><strong>${esc(p.name)}</strong>${isWinner?`<span class="result-winner-tag">${t('resultWinner')}</span>`:''}</div>
      <div class="result-meta">${t('resultDelta')}: ${delta>=0?`+${delta}`:`${delta}`} · ${t('score')}: ${total}</div>
      ${detailLine}
      <div class="result-cards" aria-label="${t('resultRemain')}">${remainCards}</div>
    </div>`;
  }).join('');
  return`<section class="result-screen">
    <div class="result-card">
      <h2>${t('resultTitle')}</h2>
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
  return`<div class="congrats-screen"><div class="congrats-card"><h3>${t('congrats')}</h3><div class="hint">${esc(uiStatus(v.status))}</div><div class="control-row"><button id="congrats-home" class="secondary">${t('home')}</button><button id="congrats-again" class="primary">${t('again')}</button></div></div></div>`;
}

function markComboActive(comboId,value){
  document.querySelectorAll(`#${comboId} .combo-btn`).forEach((btn)=>{
    btn.classList.toggle('active',btn.getAttribute('data-value')===value);
  });
}
function backAssetFile(value){
  const found=BACK_OPTIONS.find((x)=>x.value===value);
  return found?.file??'back-red.png';
}
function renderBackCombo(){
  return BACK_OPTIONS.map((opt)=>`<button class="combo-btn ${state.home.backColor===opt.value?'active':''}" data-value="${opt.value}" aria-label="${opt.label[state.language]??opt.value}"><img class="combo-back-preview" src="${withBase(`card-assets/${opt.file}`)}" alt="${opt.label[state.language]??opt.value}"/><span class="back-label">${opt.label[state.language]??opt.value}</span></button>`).join('');
}
function renderHome(){
  const intro=introText();
  if(state.home.showLeaderboard)refreshLeaderboard();
  app.innerHTML=`<section class="home-wrap"><header class="topbar home-topbar"><div class="game-title-wrap"><h2 class="game-title">鋤大D</h2><div class="game-title-sub">Traditional Big Two</div></div><div class="topbar-right"><div class="control-row"><button id="home-intro-toggle" class="secondary">${esc(intro.btnShow)}</button><button id="home-score-guide-toggle" class="secondary">${t('scoreGuide')}</button><button id="home-lb-toggle" class="secondary">${t('lb')}</button><button id="home-lang-toggle" class="secondary">${state.language==='zh-HK'?'EN':'中'}</button></div></div></header><section class="home-panel"><div class="field-grid"><label class="field"><span>${t('name')}</span><div class="name-with-google"><input id="name-input" value="${esc(state.home.name)}" maxlength="18"/><div id="google-name-inline"></div></div></label><label class="field"><span>${t('ai')}</span><div class="option-combo" id="difficulty-combo"><button class="combo-btn ${state.home.aiDifficulty==='easy'?'active':''}" data-value="easy">${t('easy')}</button><button class="combo-btn ${state.home.aiDifficulty==='normal'?'active':''}" data-value="normal">${t('normal')}</button><button class="combo-btn ${state.home.aiDifficulty==='hard'?'active':''}" data-value="hard">${t('hard')}</button></div></label><label class="field"><span>${t('cardBack')}</span><div class="option-combo cardback-combo" id="back-combo">${renderBackCombo()}</div></label><label class="field"><span>${t('soundFx')}</span><label class="sound-switch"><input type="checkbox" id="sound-switch" ${sound.enabled?'checked':''}/><span class="sound-switch-track"></span><span class="sound-switch-label">${sound.enabled?t('soundOn'):t('soundOff')}</span></label></label></div><div class="action-row"><button id="solo-start" class="primary">${t('solo')}</button></div></section>${state.home.showIntro?introPanelHtml():''}${state.home.showLeaderboard?leaderboardModalHtml():''}${state.showScoreGuide?scoreGuideModalHtml():''}</section>`;

  document.getElementById('home-intro-toggle')?.addEventListener('click',()=>{state.home.showIntro=!state.home.showIntro;render();});
  document.getElementById('home-score-guide-toggle')?.addEventListener('click',()=>{state.showScoreGuide=true;render();});
  document.getElementById('home-lb-toggle')?.addEventListener('click',()=>{state.home.showLeaderboard=!state.home.showLeaderboard;if(state.home.showLeaderboard)refreshLeaderboard();render();});
  document.getElementById('intro-close')?.addEventListener('click',()=>{state.home.showIntro=false;render();});
  document.getElementById('intro-backdrop')?.addEventListener('click',()=>{state.home.showIntro=false;render();});
  document.getElementById('score-guide-close')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('score-guide-backdrop')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('lb-close')?.addEventListener('click',()=>{state.home.showLeaderboard=false;render();});
  document.getElementById('lb-backdrop')?.addEventListener('click',()=>{state.home.showLeaderboard=false;render();});
  document.getElementById('home-lang-toggle')?.addEventListener('click',()=>{state.language=state.language==='zh-HK'?'en':'zh-HK';relabelSoloBots();render();});
  document.getElementById('name-input')?.addEventListener('input',(e)=>{state.home.name=e.target.value;});
  document.querySelectorAll('#difficulty-combo .combo-btn').forEach((btn)=>btn.addEventListener('click',()=>{const v=btn.getAttribute('data-value');if(!v)return;state.home.aiDifficulty=v;markComboActive('difficulty-combo',v);}));
  document.querySelectorAll('#back-combo .combo-btn').forEach((btn)=>btn.addEventListener('click',()=>{const v=btn.getAttribute('data-value');if(!v||!BACK_OPTIONS.some((x)=>x.value===v))return;state.home.backColor=v;markComboActive('back-combo',state.home.backColor);}));
  document.getElementById('sound-switch')?.addEventListener('change',(e)=>{
    const on=Boolean(e.target.checked);
    if(on){
      sound.enabled=true;
      try{sound.ctx?.resume?.();}catch{}
    }else{
      sound.enabled=false;
      try{sound.ctx?.suspend?.();}catch{}
    }
    const lb=document.querySelector('.sound-switch-label');
    if(lb)lb.textContent=sound.enabled?t('soundOn'):t('soundOff');
  });
  document.getElementById('solo-start')?.addEventListener('click',()=>{unlockAudio();state.home.mode='solo';startSoloGame();});
  document.getElementById('lb-refresh')?.addEventListener('click',()=>{refreshLeaderboard(true);render();});
  document.getElementById('lb-sort')?.addEventListener('change',(e)=>{state.home.leaderboard.sort=e.target.value;refreshLeaderboard();render();});
  document.getElementById('lb-period')?.addEventListener('change',(e)=>{state.home.leaderboard.period=e.target.value;refreshLeaderboard();render();});
  queueGoogleInlineRender();
}
function renderConfig(){
  app.innerHTML=`<section class="home-wrap"><header class="topbar home-topbar"><div><h2>${t('config')}</h2></div><div class="topbar-right"><div class="control-row"><button id="config-back" class="secondary">${t('home')}</button><button id="config-lang-toggle" class="secondary">${state.language==='zh-HK'?'EN':'中'}</button></div></div></header><section class="home-panel"><div class="field-grid"><label class="field"><span>${t('soundFx')}</span><label class="sound-switch"><input type="checkbox" id="config-sound-switch" ${sound.enabled?'checked':''}/><span class="sound-switch-track"></span><span class="sound-switch-label">${sound.enabled?t('soundOn'):t('soundOff')}</span></label></label></div></section></section>`;
  document.getElementById('config-back')?.addEventListener('click',()=>{state.screen='home';render();});
  document.getElementById('config-lang-toggle')?.addEventListener('click',()=>{state.language=state.language==='zh-HK'?'en':'zh-HK';relabelSoloBots();render();});
  document.getElementById('config-sound-switch')?.addEventListener('change',(e)=>{
    const on=Boolean(e.target.checked);
    if(on){
      sound.enabled=true;
      try{sound.ctx?.resume?.();}catch{}
    }else{
      sound.enabled=false;
      try{sound.ctx?.suspend?.();}catch{}
    }
    const lb=document.querySelector('.sound-switch-label');
    if(lb)lb.textContent=sound.enabled?t('soundOn'):t('soundOff');
  });
}
function renderGame(){
  const v=buildView();
  if(!v){state.screen='home';renderHome();return;}
  const intro=introText();
  if(!state.logTouched)state.showLog=!isMobilePointer();
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
  const selfScoreValue=v.mode==='solo'?(state.solo.totals?.[0]??state.score):state.score;
  const canSuggest=v.canControl&&!state.recommendation;
  const self=arr.find((p)=>p.viewIndex===0);
  const youWin=Boolean(v.gameOver&&self&&self.count===0);
  const playTypeCall=currentPlayTypeCall(v);
  const playTypeFresh=Boolean(playTypeCallState.startedAt&&Date.now()-playTypeCallState.startedAt<260);
  const lastCardSeat=currentLastCardSeat(v);
  const lastCardFresh=Boolean(lastCardCallState.startedAt&&Date.now()-lastCardCallState.startedAt<260);
  const lastActions=lastActionBySeat(v.history);
  const playKey=v.lastPlay?`${v.lastPlay.seat}-${v.lastPlay.cards.map(cardId).join(',')}`:'';
  if(playKey&&state.playAnimKey!==playKey)state.playAnimKey=playKey;
  const seatHtml=arr.filter((p)=>p.viewIndex!==0).map((p)=>{
    const active=v.currentSeat===p.seat&&!v.gameOver;
    const pColor=playerColorByViewClass(p.cls);
    const fan=v.gameOver&&v.revealedHands?(v.revealedHands[p.seat]??[]).map((c)=>renderStaticCard(c,true,'flip-in')).join(''):renderBackCards(p.count,`${p.rawName||p.name}-${p.seat}`);
    const labelName=`<div class="name"><img class="player-avatar" src="${avatarDataUri(p.name,pColor)}" alt="${esc(p.name)}"/><span class="seat-name-text">${esc(p.name)}</span><span class="seat-count-tag">${p.count}</span></div>`;
    const outerLabel=`<div class="seat-name-fixed">${labelName}</div>`;
    const playCallHtml=playTypeCall&&playTypeCall.seat===p.seat?`<div class="play-type-call play-type-call-seat${playTypeFresh?' play-type-call-fresh':''}">${esc(playTypeCall.text)}</div>`:'';
    const lastCardHtml=lastCardSeat===p.seat?`<div class="last-card-call last-card-call-seat${lastCardFresh?' last-card-call-fresh':''}">${t('lastCardCall')}</div>`:'';
    const glass='border:1px solid rgba(255,255,255,.16) !important;background:linear-gradient(130deg, rgba(255,255,255,.09), rgba(255,255,255,.02)) !important;box-shadow:inset 0 0 0 1px rgba(8,25,42,.65) !important;border-radius:12px !important;';
    const innerNoOutline='border:0 !important;box-shadow:none !important;background:transparent !important;';
    const shellStyle=`--player-color:${pColor};${glass}`;
    const sectionStyle=(p.cls==='east'||p.cls==='west')?innerNoOutline:glass;
    return`<div class="seat ${p.cls} ${active?'active':''}" style="${shellStyle}">${outerLabel}${playCallHtml}${lastCardHtml}<div class="seat-pack seat-section" style="${sectionStyle}"><div class="opponent-fan ${opponentFanStyleByName(p.rawName||p.name)}">${fan}</div></div></div>`;
  }).join('');
  const selfScore=self?selfScoreValue:0;
  const selfName=self?self.name:t('name');
  const selfCount=self?self.count:0;
  const selfAvatar=`<img class="player-avatar" src="${avatarDataUri(selfName,playerColorByViewClass('south'))}" alt="${esc(selfName)}"/>`;
  const scorePanelHtml=arr.map((p)=>{const c=playerColorByViewClass(p.cls);const val=p.viewIndex===0?selfScore:(p.score??0);return`<div class="score-item" style="--player-color:${c};"><span class="score-name">${esc(p.name)}</span><span class="score-value">${val}</span></div>`;}).join('');
  const selfPlayCallHtml=playTypeCall&&self&&playTypeCall.seat===self.seat?`<div class="play-type-call play-type-call-self${playTypeFresh?' play-type-call-fresh':''}">${esc(playTypeCall.text)}</div>`:'';
  const selfLastCardHtml=lastCardSeat!==null&&self&&lastCardSeat===self.seat?`<div class="last-card-call last-card-call-self${lastCardFresh?' last-card-call-fresh':''}">${t('lastCardCall')}</div>`:'';
  const isMobile=isMobilePointer();
  const mobileNamesHtml=isMobile?'':centerMobileOpponentNamesHtml(arr,v.currentSeat,v.gameOver);
  const mobileDiscardHtml='';
  app.innerHTML=`<section class="game-shell ${v.gameOver?'game-over':''}"><div class="main-zone"><header class="topbar"><div class="game-title-wrap"><h2 class="game-title">鋤大D</h2><div class="game-title-sub">Traditional Big Two</div></div><div class="topbar-right"><div class="control-row"><button id="lang-toggle" class="secondary">${state.language==='zh-HK'?'EN':'中'}</button><button id="game-intro-toggle" class="secondary">${esc(intro.btnShow)}</button><button id="game-lb-toggle" class="secondary">${t('lb')}</button><button id="home-btn" class="secondary">${t('home')}</button><button id="restart-btn" class="primary">${t('restart')}</button></div></div></header><section class="table">${seatHtml}<div class="table-center-stack">${mobileNamesHtml}${mobileDiscardHtml}${centerMovesHtml(v.history,v.selfSeat)}${centerLastMovesHtml(lastActions,v.selfSeat)}</div>${(!v.gameOver&&youWin)?`<div class="win-celebrate"><div class="confetti-layer"></div><div class="win-banner">${t('congrats')}</div></div>`:''}</section><section class="action-zone"><div class="action-strip ${v.canControl&&!v.gameOver?'active':''}" style="--player-color:${playerColorByViewClass('south')};"><div class="seat-name-fixed player-tag"><div class="name">${selfAvatar}<span class="seat-name-text">${esc(selfName)}</span><span class="seat-count-tag">${selfCount}</span></div></div>${selfPlayCallHtml}${selfLastCardHtml}<div class="control-row"><button id="play-btn" class="primary" ${canPlay?'':'disabled'}>${t('play')}</button><button id="pass-btn" class="danger" ${v.canPass?'':'disabled'}>${t('pass')}</button><button id="suggest-btn" class="secondary" ${canSuggest?'':'disabled'}>${t('suggest')}</button>${state.recommendHint===t('recPass')?`<span class="recommend-inline-pass">${esc(state.recommendHint)}</span>`:''}<button id="auto-seq-btn" class="secondary" ${canReorder?'':'disabled'}>${t('autoSeq')}</button><button id="auto-pattern-btn" class="secondary" ${canReorder?'':'disabled'}>${t('autoPattern')}</button></div>${state.recommendHint&&state.recommendHint!==t('recPass')?`<div class="hint recommend-hint">${esc(state.recommendHint)}</div>`:''}<div class="hand">${v.hand.map((c)=>renderHandCard(c,state.selected.has(cardId(c)))).join('')}</div><div class="drag-popup" id="drag-popup">${t('drag')}</div></div></section>${v.gameOver?'':congratsOverlayHtml(v,youWin)}${revealHtml(v,arr)}</div><aside class="side-zone ${state.showLog?'':'log-collapsed'}"><section class="side-card score-side-card"><div class="score-panel" aria-label="${t('score')}"><div class="score-panel-head"><span class="score-inline-title">${t('score')}</span><button id="score-guide-toggle" class="secondary score-guide-inline-btn">${t('scoreGuide')}</button></div><div class="score-panel-list">${scorePanelHtml}</div></div></section><section class="side-card log-side-card ${state.showLog?'':'collapsed'}"><h3 id="log-toggle" class="log-toggle-title">${t('log')}</h3>${isStatusDuplicatedByHistory(v)?'':`<div class="hint log-status">${esc(uiStatus(v.status))}</div>`}<div class="history-list">${historyHtml(v.history,v.selfSeat)}</div></section></aside>${v.gameOver?resultScreenHtml(v,arr):''}${state.showScoreGuide?scoreGuideModalHtml():''}${state.home.showIntro?introPanelHtml():''}${state.home.showLeaderboard?leaderboardModalHtml():''}</section>`;
  bindGameEvents(v,arr);
}
function reorderCurrent(v,fromId,toId){state.solo.players[0].hand=reorderById(state.solo.players[0].hand,fromId,toId,cardId);}
function autoArrangeCurrent(v,mode='seq'){state.solo.players[0].hand=mode==='pattern'?patternSortCards(state.solo.players[0].hand):[...state.solo.players[0].hand].sort(cmpCard);}

function bindGameEvents(v,arr){
  const canReorder=!isMobilePointer()&&!v.gameOver&&v.hand.length>0;
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
  let mobileTapAt=0;
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
      if(v.mode==='solo'){state.solo.status=t('pick');render();}
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
  document.getElementById('game-intro-toggle')?.addEventListener('click',()=>{state.home.showIntro=true;render();});
  document.getElementById('game-lb-toggle')?.addEventListener('click',()=>{state.home.showLeaderboard=true;refreshLeaderboard();render();});
  document.getElementById('intro-close')?.addEventListener('click',()=>{state.home.showIntro=false;render();});
  document.getElementById('intro-backdrop')?.addEventListener('click',()=>{state.home.showIntro=false;render();});
  document.getElementById('lb-close')?.addEventListener('click',()=>{state.home.showLeaderboard=false;render();});
  document.getElementById('lb-backdrop')?.addEventListener('click',()=>{state.home.showLeaderboard=false;render();});
  document.getElementById('lb-refresh')?.addEventListener('click',()=>{refreshLeaderboard(true);render();});
  document.getElementById('lb-sort')?.addEventListener('change',(e)=>{state.home.leaderboard.sort=e.target.value;refreshLeaderboard();render();});
  document.getElementById('lb-period')?.addEventListener('change',(e)=>{state.home.leaderboard.period=e.target.value;refreshLeaderboard();render();});
  document.getElementById('home-btn')?.addEventListener('click',()=>{if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}state.screen='home';state.selected.clear();state.recommendation=null;setRecommendHint('');render();});
  document.getElementById('result-home')?.addEventListener('click',()=>{if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}state.screen='home';state.selected.clear();state.recommendation=null;setRecommendHint('');render();});
  document.getElementById('congrats-home')?.addEventListener('click',()=>{if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}state.screen='home';state.selected.clear();state.recommendation=null;setRecommendHint('');render();});
  document.getElementById('log-toggle')?.addEventListener('click',()=>{state.showLog=!state.showLog;state.logTouched=true;render();});
  document.getElementById('score-guide-toggle')?.addEventListener('click',()=>{state.showScoreGuide=true;render();});
  document.getElementById('score-guide-close')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('score-guide-backdrop')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('restart-btn')?.addEventListener('click',()=>{state.recommendation=null;setRecommendHint('');startSoloGame();});
  document.getElementById('result-again')?.addEventListener('click',()=>{state.recommendation=null;setRecommendHint('');startSoloGame();});
  document.getElementById('congrats-again')?.addEventListener('click',()=>{state.recommendation=null;setRecommendHint('');startSoloGame();});
  document.getElementById('auto-seq-btn')?.addEventListener('click',()=>{if(!canReorder)return;autoArrangeCurrent(v,'seq');render();});
  document.getElementById('auto-pattern-btn')?.addEventListener('click',()=>{if(!canReorder)return;autoArrangeCurrent(v,'pattern');render();});
  document.getElementById('suggest-btn')?.addEventListener('click',()=>{
    if(!v.canControl)return;
    if(state.recommendation){
      setRecommendHint(t('recReady'));
      render();
      return;
    }
    if(shouldRecommendPass(v.hand,v.lastPlay,v.isFirstTrick,v.canPass)){
      state.recommendation={action:'pass',cardIds:[]};
      state.selected.clear();
      setRecommendHint(t('recPass'));
      playSound('select');
      render();
      return;
    }
    const rec=suggestPlay(v.hand,v.lastPlay,v.isFirstTrick);
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
      n.addEventListener('pointerdown',(e)=>{
        if(e.pointerType==='mouse')return;
        hideDragPopup();
      });
      n.addEventListener('pointerup',(e)=>{
        if(e.pointerType==='mouse')return;
        e.preventDefault();
        mobileTapAt=Date.now();
        toggleSelect();
      });
      n.addEventListener('pointercancel',()=>{hideDragPopup();});
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

function render(){applyTheme();document.body.setAttribute('data-screen',state.screen);if(state.screen==='home'){renderHome();return;}if(state.screen==='config'){renderConfig();return;}renderGame();}
function syncViewport(){const root=document.documentElement;const short=Math.min(window.innerWidth,window.innerHeight);const scale=Math.max(0.74,Math.min(1.1,short/520));root.style.setProperty('--card-scale',scale.toFixed(3));const orientation=window.matchMedia('(orientation: portrait)').matches?'portrait':'landscape';document.body.setAttribute('data-orientation',orientation);root.style.setProperty('--table-tilt','0deg');}

window.addEventListener('resize',syncViewport);window.addEventListener('orientationchange',syncViewport);document.addEventListener('pointerdown',()=>{unlockAudio();primeSpeech();},{once:true});document.addEventListener('visibilitychange',()=>{if(document.hidden&&aiTimer){clearTimeout(aiTimer);aiTimer=null;}});
window.addEventListener('load',()=>{if(state.screen==='home')queueGoogleInlineRender();},{once:true});
loadGoogleSession();bootFirebase();syncViewport();render();


























