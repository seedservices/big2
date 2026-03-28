﻿﻿﻿﻿const RANKS=['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
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
function armPopunderBypass(ms=5000){
  return;
  popunderArmedUntil=Date.now()+Math.max(0,Number(ms)||0);
  if(popunderBypassBound)return;
  document.addEventListener('pointerdown',(e)=>{
    if(Date.now()>popunderArmedUntil)return;
    const app=document.getElementById('app');
    if(!app)return;
    forceRootPointerEvents();
    purgePopunderOverlays();
    if(!popunderDebugOverlay&&POPUNDER_DEBUG){
      popunderDebugOverlay=document.createElement('div');
      popunderDebugOverlay.style.cssText='position:fixed;left:8px;bottom:8px;z-index:999999;padding:6px 8px;border-radius:10px;background:rgba(0,0,0,0.72);color:#fff;font:12px/1.3 system-ui;max-width:70vw;pointer-events:none;';
      popunderDebugOverlay.textContent='Popunder debug ready';
      document.body.appendChild(popunderDebugOverlay);
    }
    const touch=e.touches?.[0]??e.changedTouches?.[0];
    const x=Number.isFinite(touch?.clientX)?touch.clientX:e.clientX;
    const y=Number.isFinite(touch?.clientY)?touch.clientY:e.clientY;
    if(!Number.isFinite(x)||!Number.isFinite(y))return;
    const top=document.elementFromPoint(x,y);
    const stackTop=document.elementsFromPoint?document.elementsFromPoint(x,y):[];
    const bestInApp=stackTop.find((el)=>app.contains(el));
    if(!top||app.contains(top)){
      if(popunderDebugOverlay&&POPUNDER_DEBUG)popunderDebugOverlay.textContent=`Popunder debug: top=${top?.tagName?.toLowerCase()||'none'} (app)`;
      if(bestInApp){
        const btn=bestInApp.closest?.('button,[role="button"],.game-cta-btn')||bestInApp;
        const init={bubbles:true,cancelable:true,clientX:x,clientY:y};
        try{btn.dispatchEvent(new PointerEvent('pointerdown',init));}catch{}
        try{btn.dispatchEvent(new PointerEvent('pointerup',init));}catch{}
        btn.dispatchEvent(new MouseEvent('click',init));
        if(popunderDebugOverlay&&POPUNDER_DEBUG)popunderDebugOverlay.textContent=`Popunder debug: forced click to ${btn.tagName.toLowerCase()}`;
      }
      return;
    }
    popunderLastOverlay=top;
    popunderLastOverlayAt=Date.now();
    if(popunderDebugOverlay&&POPUNDER_DEBUG){
      const cls=top.className?String(top.className).trim():'';
      const id=top.id?`#${top.id}`:'';
      const styles=window.getComputedStyle(top);
      popunderDebugOverlay.textContent=`Popunder overlay: ${top.tagName.toLowerCase()}${id}${cls?'.'+cls.replace(/\s+/g,'.'):''} z=${styles.zIndex} pe=${styles.pointerEvents}`;
    }
    const disabled=[];
    if(top!==document.documentElement&&top!==document.body){
      const prev=top.style.pointerEvents;
      disabled.push({node:top,prev});
      top.style.pointerEvents='none';
    }
    const stack=document.elementsFromPoint?document.elementsFromPoint(x,y):[];
    let under=null;
    for(const el of stack){
      if(!app.contains(el))continue;
      const btn=el.closest?.('button,[role="button"],.game-cta-btn');
      if(btn&&app.contains(btn)){
        under=btn;
        break;
      }
      if(!under)under=el;
    }
    if(under){
      e.preventDefault();
      e.stopPropagation();
      const init={bubbles:true,cancelable:true,clientX:x,clientY:y};
      try{under.dispatchEvent(new PointerEvent('pointerdown',init));}catch{}
      try{under.dispatchEvent(new PointerEvent('pointerup',init));}catch{}
      under.dispatchEvent(new MouseEvent('click',init));
      if(popunderDebugOverlay&&POPUNDER_DEBUG)popunderDebugOverlay.textContent=`Popunder debug: rerouted click to ${under.tagName.toLowerCase()}`;
    }
    window.setTimeout(()=>{disabled.forEach(({node,prev})=>{if(node?.isConnected)node.style.pointerEvents=prev||'';});},1500);
  },true);
  popunderBypassBound=true;
}
function runPopunderAd(){
  try{
    const url='https://omg10.com/4/10798765';
    const win=window.open(url,'big2_ad_tab');
    if(!win)window.location.href=url;
  }catch(err){
    console.warn('popunder ad failed',err);
  }
}
function schedulePopunderAfterRender(delayMs=250){
  const delay=Math.max(0,Number(delayMs)||0);
  const invoke=()=>window.setTimeout(runPopunderAd,delay);
  window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>{
    if('requestIdleCallback' in window){
      window.requestIdleCallback(invoke,{timeout:delay+250});
    }else{
      invoke();
    }
  }));
}
const actionGuard=new Map();
function guardAction(key,windowMs=800){
  const now=Date.now();
  const last=actionGuard.get(key)||0;
  if(now-last<windowMs)return false;
  actionGuard.set(key,now);
  return true;
}

const I18N={
  'zh-HK':{
    title:'鋤大D',
    sub:'',
    lang:'語言 / Language',
    zh:'繁體中文',
    en:'English',
    fr:'法文',
    de:'德文',
    es:'西班牙文',
    ja:'日文',
    close:'關閉',
    carouselPrev:'上一個',
    carouselNext:'下一個',
    roomEnterCodeHint:'輸入代碼即可加入。',
    roomCreateCallout:'歡近光臨😀',
    webTooSmall:'視窗太小（目前 {{w}} x {{h}}），請將瀏覽器放大至至少 {{minW}} x {{minH}} 後繼續。',
    portraitTitle:'請使用直向模式',
    portraitBody:'此遊戲僅支援手機直向模式，請將裝置旋轉為直向再繼續。',
    diagLabel:'診斷',
    diagAudio:'音效',
    diagSpeech:'報牌語音',
    diagReady:'已啟用',
    diagOff:'未啟用',
    diagUnavailable:'不可用',
    lbBest:'最佳',
    lbWorst:'最差',
    lbUpdated:'更新',
    lbWR:'勝率',
    lbAvg:'平均',
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
    loginToStart:'請先登入',
    config:'設定',
    soundFx:'音效',
    audioVoice:'語音音效',
    voiceMode:'報牌語音',
    calloutDisplay:'報牌顯示',
    calloutDisplayOn:'開',
    calloutDisplayOff:'關',
    emoteDisplay:'表情顯示',
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
    must3:'階磚♦️3出先',
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
    roomCreate:'服務台',
    roomCreateHint:'點擊登記開房👆🏻',
    roomJoin:'加入房間',
    roomEnter:'進入大堂',
    roomCode:'房號',
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
    roomNeedPlayers:'至少 1 位玩家加入才可開始',
    roomRoomId:'房號',
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
    roomWaitingReady:'等待玩家加入',
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
    fr:'French',
    de:'German',
    es:'Spanish',
    ja:'Japanese',
    close:'Close',
    carouselPrev:'Previous',
    carouselNext:'Next',
    roomEnterCodeHint:'Enter room code to join.',
    roomCreateCallout:'Welcome😀',
    webTooSmall:'Window too small (current {{w}} x {{h}}). Please resize to at least {{minW}} x {{minH}}.',
    portraitTitle:'Portrait Mode Required',
    portraitBody:'This game supports portrait mode on mobile only. Please rotate your device to continue.',
    diagLabel:'Diag',
    diagAudio:'Audio',
    diagSpeech:'Callout Speech',
    diagReady:'Ready',
    diagOff:'Off',
    diagUnavailable:'Unavailable',
    lbBest:'Best',
    lbWorst:'Worst',
    lbUpdated:'Updated',
    lbWR:'WR',
    lbAvg:'Avg',
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
    loginToStart:'Please sign in',
    config:'Config',
    soundFx:'Sound Effects',
    audioVoice:'Sound & Voice',
    voiceMode:'Callout Voice',
    calloutDisplay:'Callout Display',
    calloutDisplayOn:'On',
    calloutDisplayOff:'Off',
    emoteDisplay:'Emote Display',
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
    roomCreateHint:'Tap Create Table👆🏻',
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
    roomNeedPlayers:'Need at least 1 other human player to start.',
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
    roomWaitingReady:'Waiting for players to join',
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
  },
  fr:{
    title:'Big Two',
    sub:'',
    lang:'Langue / Language',
    zh:'Chinois traditionnel',
    en:'Anglais',
    fr:'Français',
    de:'Allemand',
    es:'Espagnol',
    close:'Fermer',
    carouselPrev:'Précédent',
    carouselNext:'Suivant',
    roomEnterCodeHint:'Entrez le code pour rejoindre.',
    roomCreateCallout:'Bienvenue😀',
    webTooSmall:'Fenêtre trop petite ({{w}} x {{h}}). Redimensionnez au moins {{minW}} x {{minH}}.',
    portraitTitle:'Mode portrait requis',
    portraitBody:'Ce jeu prend en charge le mode portrait sur mobile uniquement. Veuillez tourner l’appareil.',
    diagLabel:'Diag',
    diagAudio:'Audio',
    diagSpeech:'Voix d’annonce',
    diagReady:'Prêt',
    diagOff:'Off',
    diagUnavailable:'Indisponible',
    lbBest:'Meilleur',
    lbWorst:'Pire',
    lbUpdated:'Mis à jour',
    lbWR:'Taux',
    lbAvg:'Moy.',
    name:'Nom du joueur',
    ai:'Niveau des adversaires',
    gender:'Genre',
    playerSettings:'Paramètres du joueur',
    systemSettings:'Paramètres système',
    male:'Homme',
    female:'Femme',
    easy:'Débutant',
    normal:'Confirmé',
    hard:'Expert',
    solo:'Démarrer',
    loginToStart:'Veuillez vous connecter',
    config:'Configuration',
    soundFx:'Effets sonores',
    audioVoice:'Son & voix',
    voiceMode:'Voix des annonces',
    calloutDisplay:'Affichage des annonces',
    calloutDisplayOn:'On',
    calloutDisplayOff:'Off',
    emoteDisplay:'Affichage des émoticônes',
    voiceAuto:'Auto',    voiceOff:'Off',
    voicePack:'Style de voix',
    voicePackClassic:'Classique',
    voicePackEnergetic:'Énergique',
    voicePackMinimal:'Minimal',
    soundOn:'On',
    soundOff:'Off',
    home:'Accueil',
    again:'Rejouer',
    restart:'Redémarrer',
    play:'Jouer',
    pass:'Passer',
    autoSeq:'Trier les suites',
    autoPattern:'Trier les combinaisons',
    suggest:'Recommander',
    score:'Score',
    suggestCost:'',
    cards:'Cartes',
    log:'Historique',
    nolog:'Aucun historique',
    rules:'Règles clés',
    ruleItems:[
      'Toutes les combinaisons légales sont listées ci‑dessous :',
      'Carte simple',
      'Paire',
      'Les paires suivent la règle de la carte simple : elles doivent battre la paire précédente. Ex. ♥️A♠️A bat ♥️K♠️K. À rang égal, comparer la couleur la plus haute.',
      'Brelan (trois cartes du même rang)',
      'Mains de cinq cartes',
      'Suite : cinq rangs consécutifs. A‑2‑3‑4‑5 est la plus haute, 3‑4‑5‑6‑7 la plus basse. À égalité, comparer la couleur de la plus haute carte. Suites interdites : J‑Q‑K‑A‑2, Q‑K‑A‑2‑3, K‑A‑3‑4‑5.',
      'Couleur : cinq cartes de même couleur non consécutives. Comparer par la plus haute carte, puis la suivante, etc. Enfin la couleur si encore égalité. Ex. ♠️2‑4‑5‑6‑8 bat ♥️A‑K‑Q‑10‑8.',
      'Full : une paire + un brelan. Comparer par le brelan.',
      'Carré : quatre cartes du même rang + une carte. Comparer par le rang du carré.',
      'Quinte flush : suite de même couleur. La plus haute est ♠️A‑2‑3‑4‑5.',
      'Ordre : Suite < Couleur < Full < Carré < Quinte flush.'
    ],
    wait:'En attente...',
    free:'Pas de main active. Le joueur en tête peut jouer n’importe quel set valide.',
    last:'Dernier',
    recentCard:'Dernière carte',
    reveal:'Dévoiler',
    revealSub:'Vainqueur décidé. Cartes restantes révélées :',
    drag:'Glissez pour réordonner votre main',
    must3:'Le premier tour doit contenir le ♦️3.',
    beat:'Votre sélection ne bat pas la dernière main.',
    cantPass:'Impossible de passer quand vous êtes en tête.',
    retake:'reprend la main.',
    pick:'Sélectionnez d’abord des cartes.',
    pair:'La paire doit avoir le même rang.',
    triple:'Le brelan doit avoir le même rang.',
    count:'Seulement 1, 2, 3 ou 5 cartes.',
    five:'Main de cinq cartes invalide.',
    illegal:'Coup invalide.',
    penalty:'Pénalité',
    aiTag:'(IA)',
    wins:'gagne !',
    congrats:'Félicitations ! Vous gagnez !',
    resultTitle:'Résultat',
    resultWinner:'Vainqueur',
    resultRemain:'Cartes restantes',
    resultLastDiscard:'Dernière carte jouée',
    resultDelta:'Variation de score',
    resultDetail:'Détail du score',
    scoreBase:'Base',
    scoreMul:'Multiplicateur',
    scoreDeduct:'Déduction',
    scoreGain:'Gain',
    scoreAnyTwo:'Possède un 2',
    scoreTopTwo:'Possède le ♠️2',
    scoreChao2:'Chao deux',
    scoreChao3:'Chao trois',
    scoreChao4:'Chao quatre',
    scoreChaoBig:'Grand chao',
    scorePenaltyBoost:'Pénalités multiplicatrices',
    lastCardCall:'Dernière carte',
    noSuggest:'Aucune suggestion.',
    needScore:'',
    recPass:'Passer.',
    recReady:'Déjà actif. Jouez ou passez d’abord.',
    accept:'Accepter',
    reject:'Refuser',
    start:'commence.',
    played:'a joué',
    cardBack:'Dos des cartes',
    blue:'Bleu',
    red:'Rouge',
    theme:'Thème',
    themeOcean:'Bleu océan',
    themeEmerald:'Vert émeraude',
    themeSunset:'Orange coucher de soleil',
    themeSlate:'Gris ardoise',
    themeAurora:'Violet aurore',
    themeSand:'Or sable',
    themeCyber:'Nuit néon',
    useGoogleName:'Utiliser le nom Google',
    signOut:'Se déconnecter',
    lb:'Classement',
    opponents:'Adversaires',
    dob:'Date de naissance',
    hobbies:'Loisirs',
    profile:'Profil',
    zodiac:'Zodiaque',
    motto:'Devise',
    lbHeadingDesc:'Classement mis à jour selon l’écart de score, les victoires et le taux de victoire.',
    lbRefresh:'Actualiser',
    lbSort:'Trier',
    lbPeriod:'Période',
    lbNoData:'Aucune donnée',
    lbTotalDelta:'Delta total',
    lbWins:'Victoires',
    lbGames:'Parties',
    lbWinRate:'Taux de victoire',
    lbAvgDelta:'Delta moyen',
    lbAll:'Tout',
    lb7d:'7 j',
    lb30d:'30 j',
    scoreGuide:'Barème',
    clickProfile:'Cliquez sur la carte du nom',
    scoreGuideTitle:'Méthode de score',
    scoreGuideItems:[
      'Tous les joueurs commencent à 5000 points.',
      'La manche se termine quand un joueur n’a plus de cartes.',
      'Score de base des perdants : 1‑9 cartes x1, 10‑12 cartes x2, 13 cartes x3.',
      'Multiplicateurs : avoir un 2 applique x2 ; avoir le ♠️2 ajoute encore x2 ; ils se cumulent.',
      'Règle de la dernière carte : si vous ne battez pas le joueur suivant à 1 carte et qu’il gagne, vous prenez aussi les pertes des deux autres.',
      'Le total des pertes est ajouté au vainqueur.'
    ],
    roomLobby:'Hall',
    roomTableTitle:'Table',
    roomSettings:'Paramètres de salle',
    roomCreate:'Créer une table',
    roomCreateHint:'Touchez Créer une table👆🏻',
    roomJoin:'Rejoindre une table',
    roomEnter:'Entrer dans le hall',
    roomCode:'Code de table',
    roomCopy:'Copier le code',
    roomReady:'Prêt',
    roomNotReady:'Pas prêt',
    roomWaiting:'En attente',
    roomStart:'Démarrer',
    roomLeave:'Retour au hall',
    roomLoginRequired:'Veuillez vous connecter pour créer ou rejoindre des salles.',
    roomFull:'Salle pleine.',
    roomNotFound:'Salle introuvable.',
    roomClosed:'Salle fermée.',
    roomJoinFail:'Échec de la connexion.',
    roomCreateFail:'Échec de la création.',
    roomAlreadyIn:'Vous êtes déjà dans une autre salle.',
    roomReadyHint:'En attente du démarrage de l’hôte.',
    roomDisconnected:'Vous avez quitté la salle. Rejoignez‑la.',
    roomHost:'Hôte',
    roomHostTag:'HÔTE',
    roomPrivacy:'Confidentialité',
    roomPrivate:'Privée',
    roomPublic:'Publique',
    roomNeedPlayers:'Au moins 1 joueur doit rejoindre pour commencer.',
    roomRoomId:'ID de salle',
    roomRound:'Manche',
    roomCountdown:'Compte à rebours',
    emote:'Émoticône',
    emoteLabelCool:'Cool',
    emoteLabelThrow:'Lancer',
    emoteLabelRude:'Grossier',
    emoteLabelSweat:'Plus de cartes',
    emoteLabelRage:'Rage',
    emoteLabelSmash:'Frapper',
    emoteLabelFire:'Feu',
    emoteLabelThink:'Réflexion',
    emoteLabelCry:'Pleurer',
    emoteLabelCheers:'Santé',
    emoteLabelThumbs:'Pouce',
    emoteLabelCrack:'Fissure',
    emoteLabelSleep:'Sommeil',
    emoteLabelLove:'Amour',
    emoteLabelChampagne:'Champagne',
    emoteLabelShock:'Choc',
    seatLabel:'Siège {{n}}',
    roomAvailable:'Disponible',
    roomSeatOpen:'Siège libre',
    roomActiveList:'Tables disponibles',
    roomActiveEmpty:'Aucune table disponible.',
    roomActiveRefresh:'Actualiser',
    roomStatusLabel:'Statut de la salle',
    roomStatusPlaying:'En jeu',
    roomWaitingReady:'En attente des joueurs',
    roomStarted:'Partie en cours',
    roomWelcomeJoin:'Bienvenue',
    roomWaitingHost:'En attente de l’hôte...',
    roomReconnecting:'Connexion perdue. Reconnexion...',
    roomStale:'Salle obsolète. Revenez au hall.',
    roomJoinLog:'{{name}} a rejoint la salle.',
    roomLeaveLog:'{{name}} a quitté la salle.',
    roomStarting:'La salle démarre...',
    roomReadyCount:'Prêt {{ready}}/{{total}}',
    roomSending:'Envoi...',
    roomSendTimeout:'Problème de connexion — réessayez.'
  },
  de:{
    title:'Big Two',
    sub:'',
    lang:'Sprache / Language',
    zh:'Traditionelles Chinesisch',
    en:'Englisch',
    fr:'Französisch',
    de:'Deutsch',
    es:'Spanisch',
    close:'Schließen',
    carouselPrev:'Zurück',
    carouselNext:'Weiter',
    roomEnterCodeHint:'Raumcode eingeben, um beizutreten.',
    roomCreateCallout:'Willkommen😀',
    webTooSmall:'Fenster zu klein ({{w}} x {{h}}). Bitte auf mindestens {{minW}} x {{minH}} vergrößern.',
    portraitTitle:'Hochformat erforderlich',
    portraitBody:'Dieses Spiel unterstützt nur den Hochformat‑Modus auf Mobilgeräten. Bitte Gerät drehen.',
    diagLabel:'Diag',
    diagAudio:'Audio',
    diagSpeech:'Ansage',
    diagReady:'Bereit',
    diagOff:'Aus',
    diagUnavailable:'Nicht verfügbar',
    lbBest:'Beste',
    lbWorst:'Schlechteste',
    lbUpdated:'Aktualisiert',
    lbWR:'S‑Quote',
    lbAvg:'Ø',
    name:'Spielername',
    ai:'Gegnerstufe',
    gender:'Geschlecht',
    playerSettings:'Spielereinstellungen',
    systemSettings:'Systemeinstellungen',
    male:'Männlich',
    female:'Weiblich',
    easy:'Anfänger',
    normal:'Fortgeschritten',
    hard:'Experte',
    solo:'Start',
    loginToStart:'Bitte anmelden',
    config:'Einstellungen',
    soundFx:'Soundeffekte',
    audioVoice:'Sound & Stimme',
    voiceMode:'Ansage‑Stimme',
    calloutDisplay:'Ansagen anzeigen',
    calloutDisplayOn:'An',
    calloutDisplayOff:'Aus',
    emoteDisplay:'Emotes anzeigen',
    voiceAuto:'Auto',    voiceOff:'Aus',
    voicePack:'Stimmstil',
    voicePackClassic:'Klassisch',
    voicePackEnergetic:'Energiegeladen',
    voicePackMinimal:'Minimal',
    soundOn:'An',
    soundOff:'Aus',
    home:'Start',
    again:'Nochmal spielen',
    restart:'Neustart',
    play:'Ausspielen',
    pass:'Passen',
    autoSeq:'Straßen sortieren',
    autoPattern:'Kombinationen sortieren',
    suggest:'Empfehlung',
    score:'Punkte',
    suggestCost:'',
    cards:'Karten',
    log:'Spielprotokoll',
    nolog:'Noch keine Historie',
    rules:'Regel‑Highlights',
    ruleItems:[
      'Alle erlaubten Kombinationen:',
      'Einzelkarte',
      'Paar',
      'Paare folgen der Einzelkarten‑Regel: müssen das vorige Paar schlagen. Beispiel: ♥️A♠️A schlägt ♥️K♠️K. Bei gleichem Rang zählt die höhere Farbe.',
      'Drilling (drei Karten gleichen Rangs)',
      'Fünf‑Karten‑Hände',
      'Straße: fünf aufeinanderfolgende Ränge. A‑2‑3‑4‑5 ist die höchste, 3‑4‑5‑6‑7 die niedrigste. Bei Gleichstand zählt die Farbe der höchsten Karte. Verbotene Straßen: J‑Q‑K‑A‑2, Q‑K‑A‑2‑3, K‑A‑3‑4‑5.',
      'Farbe: fünf Karten derselben Farbe ohne Folge. Vergleich nach höchster Karte, dann nächsthöchste usw., zuletzt nach Farbe. Beispiel: ♠️2‑4‑5‑6‑8 schlägt ♥️A‑K‑Q‑10‑8.',
      'Full House: Paar + Drilling. Vergleich nach Drilling.',
      'Vierling: vier Karten gleichen Rangs + eine Karte. Vergleich nach dem Vierlings‑Rang.',
      'Straight Flush: Straße in derselben Farbe. Höchste Straight Flush ist ♠️A‑2‑3‑4‑5.',
      'Reihenfolge: Straße < Farbe < Full House < Vierling < Straight Flush.'
    ],
    wait:'Warten...',
    free:'Kein aktives Stich. Vorhand darf beliebig legen.',
    last:'Letzte',
    recentCard:'Letzte Karte',
    reveal:'Aufdecken',
    revealSub:'Sieger festgelegt. Restkarten werden gezeigt:',
    drag:'Karten ziehen, um die Hand zu sortieren',
    must3:'Erster Zug muss ♦️3 enthalten.',
    beat:'Deine Auswahl schlägt den letzten Zug nicht.',
    cantPass:'Als Vorhand kann man nicht passen.',
    retake:'übernimmt den Stich.',
    pick:'Bitte zuerst Karten wählen.',
    pair:'Paar muss denselben Rang haben.',
    triple:'Drilling muss denselben Rang haben.',
    count:'Nur 1, 2, 3 oder 5 Karten.',
    five:'Ungültige 5‑Karten‑Hand.',
    illegal:'Ungültiger Zug.',
    penalty:'Strafe',
    aiTag:'(KI)',
    wins:'gewinnt!',
    congrats:'Glückwunsch! Du gewinnst!',
    resultTitle:'Rundenergebnis',
    resultWinner:'Sieger',
    resultRemain:'Restkarten',
    resultLastDiscard:'Letzte abgelegte Karte',
    resultDelta:'Punkteänderung',
    resultDetail:'Punktedetails',
    scoreBase:'Basis',
    scoreMul:'Multiplikator',
    scoreDeduct:'Abzug',
    scoreGain:'Gewinn',
    scoreAnyTwo:'Hat eine 2',
    scoreTopTwo:'Hat ♠️2',
    scoreChao2:'Doppelt',
    scoreChao3:'Dreifach',
    scoreChao4:'Vierfach',
    scoreChaoBig:'Groß',
    scorePenaltyBoost:'Straf‑Multiplikator',
    lastCardCall:'Letzte Karte',
    noSuggest:'Keine Empfehlung.',
    needScore:'',
    recPass:'Passen.',
    recReady:'Bereits aktiv. Erst spielen oder passen.',
    accept:'Annehmen',
    reject:'Ablehnen',
    start:'beginnt.',
    played:'spielte',
    cardBack:'Kartenrücken',
    blue:'Blau',
    red:'Rot',
    theme:'Thema',
    themeOcean:'Ozeanblau',
    themeEmerald:'Smaragdgrün',
    themeSunset:'Sonnenuntergangsorange',
    themeSlate:'Schiefergrau',
    themeAurora:'Aurora‑Violett',
    themeSand:'Sandgold',
    themeCyber:'Neon‑Nacht',
    useGoogleName:'Google‑Name verwenden',
    signOut:'Abmelden',
    lb:'Rangliste',
    opponents:'Gegner',
    dob:'Geburtsdatum',
    hobbies:'Hobbys',
    profile:'Profil',
    zodiac:'Sternzeichen',
    motto:'Motto',
    lbHeadingDesc:'Live‑Ranking basierend auf Punktedifferenz, Siegen und Siegquote.',
    lbRefresh:'Rangliste aktualisieren',
    lbSort:'Sortieren',
    lbPeriod:'Zeitraum',
    lbNoData:'Keine Daten',
    lbTotalDelta:'Gesamtdifferenz',
    lbWins:'Siege',
    lbGames:'Spiele',
    lbWinRate:'Siegquote',
    lbAvgDelta:'Ø‑Differenz',
    lbAll:'Alle',
    lb7d:'7 T',
    lb30d:'30 T',
    scoreGuide:'Punktetabelle',
    clickProfile:'Name anklicken',
    scoreGuideTitle:'Punktesystem',
    scoreGuideItems:[
      'Alle starten mit 5000 Punkten.',
      'Eine Runde endet, wenn ein Spieler keine Karten mehr hat.',
      'Basiswertung der Verlierer: 1‑9 Karten x1, 10‑12 Karten x2, 13 Karten x3.',
      'Multiplikatoren: beliebige 2 = x2; ♠️2 = weiteres x2; Multiplikatoren stapeln.',
      'Letzte‑Karte‑Regel: Wenn du die letzte Karte des nächsten Spielers nicht schlägst und er gewinnt, übernimmst du auch die Abzüge der anderen zwei.',
      'Die Summe der Abzüge geht an den Gewinner.'
    ],
    roomLobby:'Lobby',
    roomTableTitle:'Tisch',
    roomSettings:'Raumeinstellungen',
    roomCreate:'Tisch erstellen',
    roomCreateHint:'Tippe auf Tisch erstellen👆🏻',
    roomJoin:'Tisch beitreten',
    roomEnter:'Lobby betreten',
    roomCode:'Tisch‑Code',
    roomCopy:'Code kopieren',
    roomReady:'Bereit',
    roomNotReady:'Nicht bereit',
    roomWaiting:'Warten',
    roomStart:'Start',
    roomLeave:'Zur Lobby',
    roomLoginRequired:'Bitte anmelden, um Räume zu erstellen oder beizutreten.',
    roomFull:'Raum voll.',
    roomNotFound:'Raum nicht gefunden.',
    roomClosed:'Raum geschlossen.',
    roomJoinFail:'Beitritt fehlgeschlagen.',
    roomCreateFail:'Erstellen fehlgeschlagen.',
    roomAlreadyIn:'Du bist bereits in einem anderen Raum.',
    roomReadyHint:'Warte auf den Host.',
    roomDisconnected:'Du hast den Raum verlassen. Bitte erneut beitreten.',
    roomHost:'Host',
    roomHostTag:'HOST',
    roomPrivacy:'Privatsphäre',
    roomPrivate:'Privat',
    roomPublic:'Öffentlich',
    roomNeedPlayers:'Mindestens 1 Spieler muss beitreten, um zu starten.',
    roomRoomId:'Raum‑ID',
    roomRound:'Runde',
    roomCountdown:'Countdown',
    emote:'Emote',
    emoteLabelCool:'Cool',
    emoteLabelThrow:'Werfen',
    emoteLabelRude:'Unhöflich',
    emoteLabelSweat:'Keine Karten',
    emoteLabelRage:'Wut',
    emoteLabelSmash:'Zerschmettern',
    emoteLabelFire:'Feuer',
    emoteLabelThink:'Denken',
    emoteLabelCry:'Weinen',
    emoteLabelCheers:'Prost',
    emoteLabelThumbs:'Daumen',
    emoteLabelCrack:'Riss',
    emoteLabelSleep:'Müde',
    emoteLabelLove:'Liebe',
    emoteLabelChampagne:'Champagner',
    emoteLabelShock:'Schock',
    seatLabel:'Sitz {{n}}',
    roomAvailable:'Verfügbar',
    roomSeatOpen:'Freier Sitz',
    roomActiveList:'Verfügbare Tische',
    roomActiveEmpty:'Keine Tische verfügbar.',
    roomActiveRefresh:'Aktualisieren',
    roomStatusLabel:'Raumstatus',
    roomStatusPlaying:'Im Spiel',
    roomWaitingReady:'Warte auf Spieler',
    roomStarted:'Spiel läuft',
    roomWelcomeJoin:'Willkommen',
    roomWaitingHost:'Warte auf Host...',
    roomReconnecting:'Verbindung verloren. Verbinde neu...',
    roomStale:'Raum veraltet. Zur Lobby zurückkehren.',
    roomJoinLog:'{{name}} ist dem Raum beigetreten.',
    roomLeaveLog:'{{name}} hat den Raum verlassen.',
    roomStarting:'Raum startet...',
    roomReadyCount:'Bereit {{ready}}/{{total}}',
    roomSending:'Sende...',
    roomSendTimeout:'Verbindungsproblem — bitte erneut versuchen.'
  },
  es:{
    title:'Big Two',
    sub:'',
    lang:'Idioma / Language',
    zh:'Chino tradicional',
    en:'Inglés',
    fr:'Francés',
    de:'Alemán',
    es:'Español',
    close:'Cerrar',
    carouselPrev:'Anterior',
    carouselNext:'Siguiente',
    roomEnterCodeHint:'Ingresa el código para unirte.',
    roomCreateCallout:'Bienvenido😀',
    webTooSmall:'Ventana demasiado pequeña ({{w}} x {{h}}). Redimensiona al menos a {{minW}} x {{minH}}.',
    portraitTitle:'Se requiere modo vertical',
    portraitBody:'Este juego solo admite modo vertical en móvil. Gira el dispositivo.',
    diagLabel:'Diag',
    diagAudio:'Audio',
    diagSpeech:'Voz de anuncio',
    diagReady:'Listo',
    diagOff:'Apagado',
    diagUnavailable:'No disponible',
    lbBest:'Mejor',
    lbWorst:'Peor',
    lbUpdated:'Actualizado',
    lbWR:'Tasa',
    lbAvg:'Prom.',
    name:'Nombre del jugador',
    ai:'Nivel de oponentes',
    gender:'Género',
    playerSettings:'Configuración del jugador',
    systemSettings:'Configuración del sistema',
    male:'Hombre',
    female:'Mujer',
    easy:'Principiante',
    normal:'Intermedio',
    hard:'Experto',
    solo:'Iniciar',
    loginToStart:'Por favor inicia sesión',
    config:'Configuración',
    soundFx:'Efectos de sonido',
    audioVoice:'Sonido y voz',
    voiceMode:'Voz de anuncios',
    calloutDisplay:'Mostrar anuncios',
    calloutDisplayOn:'On',
    calloutDisplayOff:'Off',
    emoteDisplay:'Mostrar emoticonos',
    voiceAuto:'Auto',    voiceOff:'Off',
    voicePack:'Estilo de voz',
    voicePackClassic:'Clásico',
    voicePackEnergetic:'Enérgico',
    voicePackMinimal:'Minimal',
    soundOn:'On',
    soundOff:'Off',
    home:'Inicio',
    again:'Jugar de nuevo',
    restart:'Reiniciar',
    play:'Jugar',
    pass:'Pasar',
    autoSeq:'Ordenar escaleras',
    autoPattern:'Ordenar combinaciones',
    suggest:'Recomendar',
    score:'Puntuación',
    suggestCost:'',
    cards:'Cartas',
    log:'Registro',
    nolog:'Sin historial',
    rules:'Reglas clave',
    ruleItems:[
      'Todas las combinaciones legales están abajo:',
      'Carta simple',
      'Pareja',
      'Las parejas siguen la regla de carta simple: deben vencer a la pareja anterior. Ej.: ♥️A♠️A vence a ♥️K♠️K. A igual rango, gana el palo más alto.',
      'Trío (tres cartas del mismo rango)',
      'Manos de cinco cartas',
      'Escalera: cinco rangos consecutivos. A‑2‑3‑4‑5 es la más alta, 3‑4‑5‑6‑7 la más baja. En empate, compara el palo de la carta más alta. Escaleras prohibidas: J‑Q‑K‑A‑2, Q‑K‑A‑2‑3, K‑A‑3‑4‑5.',
      'Color: cinco cartas del mismo palo no consecutivas. Se compara la carta más alta, luego la siguiente, etc.; finalmente el palo si persiste el empate. Ej.: ♠️2‑4‑5‑6‑8 vence a ♥️A‑K‑Q‑10‑8.',
      'Full: pareja + trío. Se compara el trío.',
      'Póker: cuatro cartas del mismo rango + una. Se compara el rango del póker.',
      'Escalera de color: escalera del mismo palo. La más alta es ♠️A‑2‑3‑4‑5.',
      'Orden: Escalera < Color < Full < Póker < Escalera de color.'
    ],
    wait:'Esperando...',
    free:'Sin mano activa. El líder puede jugar cualquier set válido.',
    last:'Último',
    recentCard:'Carta reciente',
    reveal:'Mostrar',
    revealSub:'Ganador decidido. Cartas restantes:',
    drag:'Arrastra para ordenar tu mano',
    must3:'El primer turno debe incluir ♦️3.',
    beat:'Tu selección no supera la última jugada.',
    cantPass:'No puedes pasar si tienes la mano.',
    retake:'retoma la mano.',
    pick:'Selecciona cartas primero.',
    pair:'La pareja debe ser del mismo rango.',
    triple:'El trío debe ser del mismo rango.',
    count:'Solo 1, 2, 3 o 5 cartas.',
    five:'Mano de 5 cartas inválida.',
    illegal:'Jugada inválida.',
    penalty:'Penalización',
    aiTag:'(IA)',
    wins:'¡gana!',
    congrats:'¡Felicidades! ¡Has ganado!',
    resultTitle:'Resultado',
    resultWinner:'Ganador',
    resultRemain:'Cartas restantes',
    resultLastDiscard:'Última carta jugada',
    resultDelta:'Cambio de puntuación',
    resultDetail:'Detalle de puntuación',
    scoreBase:'Base',
    scoreMul:'Multiplicador',
    scoreDeduct:'Deducción',
    scoreGain:'Ganancia',
    scoreAnyTwo:'Tiene un 2',
    scoreTopTwo:'Tiene el ♠️2',
    scoreChao2:'Chao dos',
    scoreChao3:'Chao tres',
    scoreChao4:'Chao cuatro',
    scoreChaoBig:'Chao grande',
    scorePenaltyBoost:'Penalizaciones multiplicadoras',
    lastCardCall:'Última carta',
    noSuggest:'Sin sugerencias.',
    needScore:'',
    recPass:'Pasar.',
    recReady:'Ya activo. Juega o pasa primero.',
    accept:'Aceptar',
    reject:'Rechazar',
    start:'comienza.',
    played:'jugó',
    cardBack:'Reverso',
    blue:'Azul',
    red:'Rojo',
    theme:'Tema',
    themeOcean:'Azul océano',
    themeEmerald:'Verde esmeralda',
    themeSunset:'Naranja atardecer',
    themeSlate:'Gris pizarra',
    themeAurora:'Violeta aurora',
    themeSand:'Oro arena',
    themeCyber:'Noche neón',
    useGoogleName:'Usar nombre de Google',
    signOut:'Cerrar sesión',
    lb:'Clasificación',
    opponents:'Oponentes',
    dob:'Fecha de nacimiento',
    hobbies:'Pasatiempos',
    profile:'Perfil',
    zodiac:'Zodiaco',
    motto:'Lema',
    lbHeadingDesc:'Ranking en vivo basado en delta de puntos, victorias y tasa de victoria.',
    lbRefresh:'Actualizar ranking',
    lbSort:'Ordenar',
    lbPeriod:'Periodo',
    lbNoData:'Sin datos',
    lbTotalDelta:'Delta total',
    lbWins:'Victorias',
    lbGames:'Partidas',
    lbWinRate:'Tasa de victoria',
    lbAvgDelta:'Delta medio',
    lbAll:'Todo',
    lb7d:'7 días',
    lb30d:'30 días',
    scoreGuide:'Puntuación',
    clickProfile:'Haz clic en la tarjeta de nombre',
    scoreGuideTitle:'Método de puntuación',
    scoreGuideItems:[
      'Todos comienzan con 5000 puntos.',
      'La ronda termina cuando un jugador se queda sin cartas.',
      'Puntuación base de los perdedores: 1‑9 cartas x1, 10‑12 cartas x2, 13 cartas x3.',
      'Multiplicadores: tener cualquier 2 aplica x2; tener el ♠️2 aplica otro x2; se acumulan.',
      'Regla de última carta: si no puedes superar al siguiente con 1 carta y gana, también absorbes las pérdidas de los otros dos.',
      'La suma de pérdidas se añade al ganador.'
    ],
    roomLobby:'Lobby',
    roomTableTitle:'Mesa',
    roomSettings:'Configuración de sala',
    roomCreate:'Crear mesa',
    roomCreateHint:'Toca Crear mesa👆🏻',
    roomJoin:'Unirse a mesa',
    roomEnter:'Entrar al lobby',
    roomCode:'Código de mesa',
    roomCopy:'Copiar código',
    roomReady:'Listo',
    roomNotReady:'No listo',
    roomWaiting:'Esperando',
    roomStart:'Iniciar',
    roomLeave:'Volver al lobby',
    roomLoginRequired:'Inicia sesión para crear o unirte a salas.',
    roomFull:'Sala llena.',
    roomNotFound:'Sala no encontrada.',
    roomClosed:'Sala cerrada.',
    roomJoinFail:'Error al unirse.',
    roomCreateFail:'Error al crear.',
    roomAlreadyIn:'Ya estás en otra sala.',
    roomReadyHint:'Esperando al anfitrión.',
    roomDisconnected:'Has salido de la sala. Vuelve a unirte.',
    roomHost:'Anfitrión',
    roomHostTag:'HOST',
    roomPrivacy:'Privacidad',
    roomPrivate:'Privada',
    roomPublic:'Pública',
    roomNeedPlayers:'Al menos 1 jugador debe unirse para empezar.',
    roomRoomId:'ID de sala',
    roomRound:'Ronda',
    roomCountdown:'Cuenta atrás',
    emote:'Emote',
    emoteLabelCool:'Genial',
    emoteLabelThrow:'Lanzar',
    emoteLabelRude:'Grosero',
    emoteLabelSweat:'Sin cartas',
    emoteLabelRage:'Furia',
    emoteLabelSmash:'Golpear',
    emoteLabelFire:'Fuego',
    emoteLabelThink:'Pensando',
    emoteLabelCry:'Llorar',
    emoteLabelCheers:'Salud',
    emoteLabelThumbs:'Pulgar',
    emoteLabelCrack:'Grieta',
    emoteLabelSleep:'Sueño',
    emoteLabelLove:'Amor',
    emoteLabelChampagne:'Champán',
    emoteLabelShock:'Shock',
    seatLabel:'Asiento {{n}}',
    roomAvailable:'Disponible',
    roomSeatOpen:'Asiento libre',
    roomActiveList:'Mesas disponibles',
    roomActiveEmpty:'No hay mesas.',
    roomActiveRefresh:'Actualizar',
    roomStatusLabel:'Estado de sala',
    roomStatusPlaying:'En juego',
    roomWaitingReady:'Esperando jugadores',
    roomStarted:'Partida en curso',
    roomWelcomeJoin:'Bienvenido',
    roomWaitingHost:'Esperando al anfitrión...',
    roomReconnecting:'Conexión perdida. Reconectando...',
    roomStale:'Sala desactualizada. Vuelve al lobby.',
    roomJoinLog:'{{name}} se unió a la sala.',
    roomLeaveLog:'{{name}} salió de la sala.',
    roomStarting:'La sala está iniciando...',
    roomReadyCount:'Listos {{ready}}/{{total}}',
    roomSending:'Enviando...',
    roomSendTimeout:'Problema de conexión — reintenta.'
  },
  ja:{
    title:'ビッグツー',
    sub:'',
    lang:'言語',
    zh:'繁体字中国語',
    en:'英語',
    fr:'フランス語',
    de:'ドイツ語',
    es:'スペイン語',
    ja:'日本語',
    close:'閉じる',
    carouselPrev:'前へ',
    carouselNext:'次へ',
    roomEnterCodeHint:'コードを入力して参加。',
    roomCreateCallout:'ようこそ😀',
    webTooSmall:'ウィンドウが小さすぎます（現在 {{w}} x {{h}}）。少なくとも {{minW}} x {{minH}} に拡大してください。',
    portraitTitle:'縦向きが必要です',
    portraitBody:'このゲームはモバイルの縦向きのみ対応です。端末を回転してください。',
    diagLabel:'診断',
    diagAudio:'音声',
    diagSpeech:'コール音声',
    diagReady:'有効',
    diagOff:'オフ',
    diagUnavailable:'利用不可',
    lbBest:'最高',
    lbWorst:'最低',
    lbUpdated:'更新',
    lbWR:'勝率',
    lbAvg:'平均',
    name:'プレイヤー名',
    ai:'対戦相手レベル',
    gender:'性別',
    playerSettings:'プレイヤー設定',
    systemSettings:'システム設定',
    male:'男性',
    female:'女性',
    easy:'初心者',
    normal:'普通',
    hard:'上級者',
    solo:'ゲーム開始',
    loginToStart:'サインインしてください',
    config:'設定',
    soundFx:'効果音',
    audioVoice:'音声とボイス',
    voiceMode:'コールボイス',
    calloutDisplay:'コール表示',
    calloutDisplayOn:'オン',
    calloutDisplayOff:'オフ',
    emoteDisplay:'エモート表示',
    voiceAuto:'自動',    voiceOff:'オフ',
    voicePack:'ボイススタイル',
    voicePackClassic:'クラシック',
    voicePackEnergetic:'エネルギッシュ',
    voicePackMinimal:'ミニマル',
    soundOn:'オン',
    soundOff:'オフ',
    home:'ホーム',
    again:'もう一度',
    restart:'リスタート',
    play:'出す',
    pass:'パス',
    autoSeq:'順子並び替え',
    autoPattern:'役並び替え',
    suggest:'おすすめ',
    score:'スコア',
    suggestCost:'',
    cards:'手札',
    log:'ゲームログ',
    nolog:'履歴なし',
    rules:'ルール概要',
    ruleItems:[
      '合法な出し方は以下のとおりです。',
      '単札',
      'ペア',
      'ペアは単札と同じルールで、前のペアを上回る必要があります。例：♥️A♠️A は ♥️K♠️K に勝ちます。同じランクの場合は高いスートで比較します。',
      'トリプル（同じランク3枚）',
      '5枚役',
      'ストレート：5枚の連番。A-2-3-4-5 が最強、3-4-5-6-7 が最弱。同じランクのストレートは最高位カードのスートで比較します。J-Q-K-A-2、Q-K-A-2-3、K-A-3-4-5 のストレートは不可。',
      'フラッシュ：同じスートの5枚で連番ではないもの。最も高いランクから順に比較し、それでも同じならスートで比較します。例：♠️2-4-5-6-8 は ♥️A-K-Q-10-8 に勝ちます。',
      'フルハウス：ペア＋トリプル。トリプルのランクで比較します。',
      'フォーカード：同じランク4枚＋任意1枚。4枚のランクで比較します。',
      'ストレートフラッシュ：同じスートのストレート。最強は ♠️A-2-3-4-5。',
      '役の強さ：ストレート < フラッシュ < フルハウス < フォーカード < ストレートフラッシュ。'
    ],
    wait:'待機中...',
    free:'現在上がりがないため、親は任意の役を出せます。',
    last:'直前',
    recentCard:'直前のカード',
    reveal:'公開',
    revealSub:'勝者決定。残りのカードを公開:',
    drag:'ドラッグして手札の順を変更',
    must3:'最初の手番は♦️3を含める必要があります。',
    beat:'選択したカードは前の出し札に勝てません。',
    cantPass:'親のときはパスできません。',
    retake:'が親になります。',
    pick:'まずカードを選択してください。',
    pair:'ペアは同じランクである必要があります。',
    triple:'トリプルは同じランクである必要があります。',
    count:'出せる枚数は1、2、3、5のみ。',
    five:'無効な5枚役です。',
    illegal:'無効な出し方です。',
    penalty:'ペナルティ',
    aiTag:'(AI)',
    wins:'勝ち！',
    congrats:'おめでとう！勝ちました！',
    resultTitle:'ラウンド結果',
    resultWinner:'勝者',
    resultRemain:'残りの手札',
    resultLastDiscard:'最後に出したカード',
    resultDelta:'スコア変動',
    resultDetail:'スコア詳細',
    scoreBase:'基本',
    scoreMul:'倍率',
    scoreDeduct:'減点',
    scoreGain:'加点',
    scoreAnyTwo:'2を所持',
    scoreTopTwo:'最強の♠️2を所持',
    scoreChao2:'チャオ2',
    scoreChao3:'チャオ3',
    scoreChao4:'チャオ4',
    scoreChaoBig:'大チャオ',
    scorePenaltyBoost:'倍率ペナルティ',
    lastCardCall:'ラストカード',
    noSuggest:'現在おすすめはありません。',
    needScore:'',
    recPass:'パス。',
    recReady:'すでに提案があります。先に出すかパスしてください。',
    accept:'採用',
    reject:'却下',
    start:'が先手です。',
    played:'を出した',
    cardBack:'カード背面',
    blue:'青',
    red:'赤',
    theme:'テーマ',
    themeOcean:'オーシャンブルー',
    themeEmerald:'エメラルドグリーン',
    themeSunset:'サンセットオレンジ',
    themeSlate:'スレートグレー',
    themeAurora:'オーロラパープル',
    themeSand:'サンドゴールド',
    themeCyber:'ネオンナイト',
    useGoogleName:'Google名を使用',
    signOut:'サインアウト',
    lb:'ランキング',
    opponents:'対戦相手',
    dob:'生年月日',
    hobbies:'趣味',
    profile:'プロフィール',
    zodiac:'星座',
    motto:'モットー',
    lbHeadingDesc:'スコア差、勝利数、勝率に基づきランキングを更新します。',
    lbRefresh:'ランキング更新',
    lbSort:'並び替え',
    lbPeriod:'期間',
    lbNoData:'データがありません',
    lbTotalDelta:'総増減',
    lbWins:'勝利数',
    lbGames:'試合数',
    lbWinRate:'勝率',
    lbAvgDelta:'平均差',
    lbAll:'全期間',
    lb7d:'7日',
    lb30d:'30日',
    scoreGuide:'スコア',
    clickProfile:'ネームカードをクリック',
    scoreGuideTitle:'スコア算出',
    scoreGuideItems:[
      '全員5000点から開始。',
      '誰かが手札を出し切るとラウンド終了。',
      '敗者の基本点：残り1-9枚 x1、10-12枚 x2、13枚 x3。',
      '倍率ペナルティ：2を所持で x2、♠️2（最強）を所持でさらに x2。倍率は累積。',
      'ラストカード規則：次のプレイヤーが1枚で上がるのを止められない場合、他2人の減点も負担。',
      '敗者の減点合計が勝者に加算。'
    ],
    roomLobby:'ロビー',
    roomTableTitle:'テーブル',
    roomSettings:'ルーム設定',
    roomCreate:'テーブル作成',
    roomCreateHint:'「テーブル作成」をタップ👆🏻',
    roomJoin:'テーブル参加',
    roomEnter:'ロビーへ',
    roomCode:'テーブルコード',
    roomCopy:'コードをコピー',
    roomReady:'準備完了',
    roomNotReady:'未準備',
    roomWaiting:'待機中',
    roomStart:'開始',
    roomLeave:'ロビーに戻る',
    roomLoginRequired:'ルームを作成または参加するにはサインインしてください。',
    roomFull:'満員です。',
    roomNotFound:'ルームが見つかりません。',
    roomClosed:'ルームは閉じています。',
    roomJoinFail:'参加に失敗しました。',
    roomCreateFail:'作成に失敗しました。',
    roomAlreadyIn:'すでに別のルームに参加しています。退出してから参加してください。',
    roomReadyHint:'ホストの開始を待っています。',
    roomDisconnected:'ルームから退出しました。再参加してください。',
    roomHost:'ホスト',
    roomHostTag:'ホスト',
    roomPrivacy:'公開設定',
    roomPrivate:'非公開',
    roomPublic:'公開',
    roomNeedPlayers:'開始には少なくとも他のプレイヤー1人が必要です。',
    roomRoomId:'ルームID',
    roomRound:'ラウンド',
    roomCountdown:'カウントダウン',
    emote:'エモート',
    emoteLabelCool:'クール',
    emoteLabelThrow:'投げる',
    emoteLabelRude:'失礼',
    emoteLabelSweat:'手札なし',
    emoteLabelRage:'激怒',
    emoteLabelSmash:'叩く',
    emoteLabelFire:'炎',
    emoteLabelThink:'考え中',
    emoteLabelCry:'泣く',
    emoteLabelCheers:'乾杯',
    emoteLabelThumbs:'いいね',
    emoteLabelCrack:'ヒビ',
    emoteLabelSleep:'眠い',
    emoteLabelLove:'ハート',
    emoteLabelChampagne:'シャンパン',
    emoteLabelShock:'ショック',
    seatLabel:'席 {{n}}',
    roomAvailable:'参加可能',
    roomSeatOpen:'空席',
    roomActiveList:'参加可能なテーブル',
    roomActiveEmpty:'参加可能なテーブルはありません。',
    roomActiveRefresh:'更新',
    roomStatusLabel:'ルーム状態',
    roomStatusPlaying:'プレイ中',
    roomWaitingReady:'参加者待ち',
    roomStarted:'ゲーム中',
    roomWelcomeJoin:'参加歓迎',
    roomWaitingHost:'ホストの開始待ち...',
    roomReconnecting:'接続が切れました。再接続中...',
    roomStale:'ルーム情報が古くなりました。ロビーに戻ってください。',
    roomJoinLog:'{{name}} が参加しました。',
    roomLeaveLog:'{{name}} が退出しました。',
    roomStarting:'ルームを開始しています...',
    roomReadyCount:'準備 {{ready}}/{{total}}',
    roomSending:'送信中...',
    roomSendTimeout:'接続に問題があります — 再試行してください。'
  }
};
const KIND={
  'zh-HK':{single:'單張',pair:'一對',triple:'三條',straight:'蛇',flush:'花',fullhouse:'俘佬',fourofkind:'四條',straightflush:'同花順'},
  en:{single:'Single',pair:'Pair',triple:'Triple',straight:'Straight',flush:'Flush',fullhouse:'Full House',fourofkind:'Four Kind',straightflush:'Straight Flush'},
  fr:{single:'Carte',pair:'Paire',triple:'Brelan',straight:'Suite',flush:'Couleur',fullhouse:'Full',fourofkind:'Carré',straightflush:'Quinte flush'},
  de:{single:'Einzel',pair:'Paar',triple:'Drilling',straight:'Straße',flush:'Farbe',fullhouse:'Full House',fourofkind:'Vierling',straightflush:'Straight Flush'},
  es:{single:'Carta',pair:'Pareja',triple:'Trío',straight:'Escalera',flush:'Color',fullhouse:'Full',fourofkind:'Póker',straightflush:'Escalera de color'},
  ja:{single:'1枚',pair:'ペア',triple:'トリプル',straight:'ストレート',flush:'フラッシュ',fullhouse:'フルハウス',fourofkind:'フォーカード',straightflush:'ストレートフラッシュ'}
};
const LANGUAGE_OPTIONS=[
  {value:'zh-HK',labelKey:'zh'},
  {value:'en',labelKey:'en'},
  {value:'fr',labelKey:'fr'},
  {value:'de',labelKey:'de'},
  {value:'es',labelKey:'es'},
  {value:'ja',labelKey:'ja'}
];
const LANGUAGE_NATIVE_LABEL={
  'zh-HK':'繁體中文',
  en:'English',
  fr:'Français',
  de:'Deutsch',
  es:'Español',
  ja:'日本語'
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
  fr: {
    pass: ['Je passe', 'Passe', 'À toi'],
    last: ['Dernière carte !', 'Une carte !'],
    play: [
      (kind) => `${kind} !`,
      (kind) => `${kind}. À toi.`,
      (kind) => `${kind}.`,
    ],
    winner: [
      'Bien joué.',
      'Coup de chance.',
      'Cette manche est à moi !'
    ],
    winnerRepeat: 'Encore moi.',
  },
  de: {
    pass: ['Ich passe', 'Passe', 'Du bist dran'],
    last: ['Letzte Karte!', 'Nur noch eine!'],
    play: [
      (kind) => `${kind}!`,
      (kind) => `${kind}. Dein Zug.`,
      (kind) => `${kind}.`,
    ],
    winner: [
      'Gut gespielt.',
      'Glück gehabt.',
      'Diese Runde gehört mir!'
    ],
    winnerRepeat: 'Schon wieder ich.',
  },
  es: {
    pass: ['Paso', 'No voy', 'Te toca'],
    last: ['¡Última carta!', '¡Una carta!'],
    play: [
      (kind) => `¡${kind}!`,
      (kind) => `${kind}. Tu turno.`,
      (kind) => `${kind}.`,
    ],
    winner: [
      'Bien jugado.',
      'Solo suerte.',
      '¡Esta ronda es mía!'
    ],
    winnerRepeat: 'Otra vez yo.',
  },
  ja: {
    pass: ['パス', '出せない', 'あなたの番'],
    last: ['ラストカード！', '残り1枚！'],
    play: [
      (kind) => `${kind}！`,
      (kind) => `${kind}、どうぞ。`,
      (kind) => `${kind}。`,
    ],
    winner: [
      'いい勝負でした。',
      '運が良かった。',
      'このラウンドは私の勝ち！'
    ],
    winnerRepeat: 'また私ですね。',
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
const state={language:'zh-HK',screen:'home',screenBeforeConfig:'home',showRules:false,showLog:false,showLogSheet:false,logTouched:false,showScoreGuide:false,opponentProfileName:'',mottoPeekName:'',selected:new Set(),drag:{id:null,moved:false},playAnimKey:'',autoPassKey:'',score:5000,suggestCost:0,recommendation:null,recommendHint:'',logFab:{x:null,y:null},home:{mode:'solo',name:'玩家',gender:'male',avatarChoice:'male',aiDifficulty:'normal',backColor:'red',theme:'ocean',showIntro:false,showLeaderboard:false,google:{signedIn:false,provider:'',name:'',email:'',uid:'',sub:'',token:'',picture:'',gender:''},leaderboard:{rows:[],sort:'totalDelta',period:'all',limit:20},activeRooms:{rows:[],loading:false,loadedAt:0,error:''}},room:{id:'',code:'',data:null,joinOpen:false,error:'',started:false,unsub:null,selfSeat:-1,recordedGameKey:'',lastMoveKey:'',playerId:'',pendingStart:false,lastResultPlayers:null},sessionId:'',solo:{players:[],botNames:[],totals:[5000,5000,5000,5000],currentSeat:0,lastPlay:null,passStreak:0,isFirstTrick:true,gameOver:false,status:'',history:[],aiDifficulty:'normal',lastCardBreach:null},emote:{open:false,active:null}};
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
let googleScriptReloading=false;
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
let lastNamecardTapAt=0;
let calloutDisplayEnabled=true;
let emoteDisplayEnabled=true;
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
  {value:'blue',file:'back-blue.png',label:{'zh-HK':'藍色',en:'Blue',fr:'Bleu',de:'Blau',es:'Azul',ja:'青'}},
  {value:'red',file:'back-red.png',label:{'zh-HK':'紅色',en:'Red',fr:'Rouge',de:'Rot',es:'Rojo',ja:'赤'}},
  {value:'green',file:'back-green.png',label:{'zh-HK':'綠色',en:'Green',fr:'Vert',de:'Grün',es:'Verde',ja:'緑'}},
  {value:'gold',file:'back-gold.png',label:{'zh-HK':'金色',en:'Gold',fr:'Or',de:'Gold',es:'Oro',ja:'金'}},
  {value:'silver',file:'back-silver.png',label:{'zh-HK':'銀色',en:'Silver',fr:'Argent',de:'Silber',es:'Plata',ja:'銀'}},
  {value:'purple',file:'back-purple.png',label:{'zh-HK':'紫色',en:'Purple',fr:'Violet',de:'Lila',es:'Morado',ja:'紫'}}
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

const t=(k)=>I18N[state.language]?.[k]??I18N.en?.[k]??k;
function formatHobbyList(hobbies){
  const list=Array.isArray(hobbies)?hobbies.map((x)=>String(x??'').trim()).filter(Boolean):[];
  if(!list.length)return'-';
  const joiner=state.language==='zh-HK'?'、':', ';
  const translated=list.map((item)=>translateProfileHobby(item,state.language));
  return translated.join(joiner);
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
const PROFILE_HOBBY_TRANSLATIONS={
  fr:{
    'shore fishing':'pêche en bord de mer',
    'board games':'jeux de société',
    'instant photos':'photos instantanées',
    'running':'course à pied',
    'chess variants':'variantes d’échecs',
    'latte art':'latte art',
    'street photography':'photo de rue',
    'movie posters':'affiches de films',
    'model kits':'maquettes',
    'basketball':'basket-ball',
    'mechanical keyboards':'claviers mécaniques',
    'city nights':'nuits urbaines',
    'hiking':'randonnée',
    'boxing drills':'entraînement de boxe',
    'wuxia novels':'romans wuxia',
    'guitar':'guitare',
    'jogging':'jogging',
    'trip planning':'planification de voyages',
    'baking':'pâtisserie',
    'illustration':'illustration',
    'aromatherapy':'aromathérapie',
    'yoga':'yoga',
    'floral design':'art floral',
    'photography':'photographie',
    'jazz':'jazz',
    'handcrafts':'artisanat',
    'ceramics':'céramique',
    'reading':'lecture',
    'puzzles':'puzzles',
    'travel journals':'carnets de voyage',
    'street food':'street food',
    'sketching':'croquis',
    'gardening':'jardinage',
    'lo-fi music':'musique lo‑fi',
    'pour-over coffee':'café filtre',
    'seaside runs':'course en bord de mer',
    'city food hunts':'chasse aux bonnes adresses',
    'film cameras':'appareils argentiques',
    'night activities':'sorties nocturnes',
    'drinks':'boissons',
    'nightlife':'vie nocturne',
    'late-night eats':'repas tardifs',
    'night runs':'courses de nuit',
    '3D drawing':'dessin 3D',
    'gaming':'jeux vidéo',
    'cadet':'cadets',
    'swimming':'natation',
    'stargazing':'observation des étoiles',
    'synth music':'musique synthé',
    'speed cubing':'speed cubing',
    'streetball':'streetball',
    'skateboarding':'skateboard',
    'ramen hunts':'chasse aux ramen',
    'calligraphy':'calligraphie',
    'city walks':'balades en ville',
    'vinyl':'vinyle',
    'snowboarding':'snowboard',
    'arcades':'salles d’arcade',
    'retro cameras':'appareils rétro',
    'pottery':'poterie',
    'book cafés':'cafés‑librairies',
    'watercolor':'aquarelle',
    'night markets':'marchés de nuit',
    'indie films':'films indépendants',
    'journaling':'journal intime',
    'badminton':'badminton',
    'strategy games':'jeux de stratégie',
    'podcasts':'podcasts',
    'tennis':'tennis',
    'photo edits':'retouche photo',
    'boxing':'boxe',
    'graphic tees':'t‑shirts graphiques',
    'motorbikes':'motos',
    'pilates':'pilates',
    'lo‑fi beats':'beats lo‑fi',
    'stationery':'papeterie',
    'astro photography':'astrophotographie',
    'city night hikes':'randos nocturnes en ville',
    'competitive games':'jeux compétitifs'
  },
  de:{
    'shore fishing':'Küstenangeln',
    'board games':'Brettspiele',
    'instant photos':'Sofortfotos',
    'running':'Laufen',
    'chess variants':'Schachvarianten',
    'latte art':'Latte Art',
    'street photography':'Straßenfotografie',
    'movie posters':'Filmplakate',
    'model kits':'Modellbausätze',
    'basketball':'Basketball',
    'mechanical keyboards':'mechanische Tastaturen',
    'city nights':'Stadtnächte',
    'hiking':'Wandern',
    'boxing drills':'Boxtraining',
    'wuxia novels':'Wuxia‑Romane',
    'guitar':'Gitarre',
    'jogging':'Jogging',
    'trip planning':'Reiseplanung',
    'baking':'Backen',
    'illustration':'Illustration',
    'aromatherapy':'Aromatherapie',
    'yoga':'Yoga',
    'floral design':'Floristik',
    'photography':'Fotografie',
    'jazz':'Jazz',
    'handcrafts':'Handarbeit',
    'ceramics':'Keramik',
    'reading':'Lesen',
    'puzzles':'Puzzles',
    'travel journals':'Reisetagebücher',
    'street food':'Streetfood',
    'sketching':'Skizzieren',
    'gardening':'Gartenarbeit',
    'lo-fi music':'Lo‑Fi‑Musik',
    'pour-over coffee':'Filterkaffee',
    'seaside runs':'Läufe am Meer',
    'city food hunts':'Food‑Hunts in der Stadt',
    'film cameras':'Analogkameras',
    'night activities':'Nachtaktivitäten',
    'drinks':'Getränke',
    'nightlife':'Nachtleben',
    'late-night eats':'Spät‑Essen',
    'night runs':'Nachtläufe',
    '3D drawing':'3D‑Zeichnen',
    'gaming':'Gaming',
    'cadet':'Kadetten',
    'swimming':'Schwimmen',
    'stargazing':'Sternenbeobachtung',
    'synth music':'Synth‑Musik',
    'speed cubing':'Speed Cubing',
    'streetball':'Streetball',
    'skateboarding':'Skateboarding',
    'ramen hunts':'Ramen‑Suche',
    'calligraphy':'Kalligrafie',
    'city walks':'Stadtspaziergänge',
    'vinyl':'Vinyl',
    'snowboarding':'Snowboarden',
    'arcades':'Spielhallen',
    'retro cameras':'Retro‑Kameras',
    'pottery':'Töpfern',
    'book cafés':'Buchcafés',
    'watercolor':'Aquarell',
    'night markets':'Nachtmärkte',
    'indie films':'Indie‑Filme',
    'journaling':'Journaling',
    'badminton':'Badminton',
    'strategy games':'Strategiespiele',
    'podcasts':'Podcasts',
    'tennis':'Tennis',
    'photo edits':'Fotobearbeitung',
    'boxing':'Boxen',
    'graphic tees':'Grafik‑T‑Shirts',
    'motorbikes':'Motorräder',
    'pilates':'Pilates',
    'lo‑fi beats':'Lo‑Fi‑Beats',
    'stationery':'Schreibwaren',
    'astro photography':'Astrofotografie',
    'city night hikes':'nächtliche Stadtwanderungen',
    'competitive games':'Wettkampfspiele'
  },
  es:{
    'shore fishing':'pesca costera',
    'board games':'juegos de mesa',
    'instant photos':'fotos instantáneas',
    'running':'correr',
    'chess variants':'variantes de ajedrez',
    'latte art':'latte art',
    'street photography':'fotografía callejera',
    'movie posters':'pósters de cine',
    'model kits':'maquetas',
    'basketball':'baloncesto',
    'mechanical keyboards':'teclados mecánicos',
    'city nights':'noches urbanas',
    'hiking':'senderismo',
    'boxing drills':'entrenamiento de boxeo',
    'wuxia novels':'novelas wuxia',
    'guitar':'guitarra',
    'jogging':'trote',
    'trip planning':'planificación de viajes',
    'baking':'repostería',
    'illustration':'ilustración',
    'aromatherapy':'aromaterapia',
    'yoga':'yoga',
    'floral design':'diseño floral',
    'photography':'fotografía',
    'jazz':'jazz',
    'handcrafts':'artesanías',
    'ceramics':'cerámica',
    'reading':'lectura',
    'puzzles':'rompecabezas',
    'travel journals':'diarios de viaje',
    'street food':'comida callejera',
    'sketching':'bocetos',
    'gardening':'jardinería',
    'lo-fi music':'música lo‑fi',
    'pour-over coffee':'café filtrado',
    'seaside runs':'correr junto al mar',
    'city food hunts':'búsqueda de comida en la ciudad',
    'film cameras':'cámaras analógicas',
    'night activities':'actividades nocturnas',
    'drinks':'bebidas',
    'nightlife':'vida nocturna',
    'late-night eats':'comida nocturna',
    'night runs':'correr de noche',
    '3D drawing':'dibujo 3D',
    'gaming':'videojuegos',
    'cadet':'cadetes',
    'swimming':'natación',
    'stargazing':'observación de estrellas',
    'synth music':'música synth',
    'speed cubing':'speed cubing',
    'streetball':'streetball',
    'skateboarding':'skateboarding',
    'ramen hunts':'búsqueda de ramen',
    'calligraphy':'caligrafía',
    'city walks':'paseos por la ciudad',
    'vinyl':'vinilo',
    'snowboarding':'snowboard',
    'arcades':'salas recreativas',
    'retro cameras':'cámaras retro',
    'pottery':'cerámica',
    'book cafés':'cafés con libros',
    'watercolor':'acuarela',
    'night markets':'mercados nocturnos',
    'indie films':'cine indie',
    'journaling':'diario personal',
    'badminton':'bádminton',
    'strategy games':'juegos de estrategia',
    'podcasts':'podcasts',
    'tennis':'tenis',
    'photo edits':'edición de fotos',
    'boxing':'boxeo',
    'graphic tees':'camisetas gráficas',
    'motorbikes':'motocicletas',
    'pilates':'pilates',
    'lo‑fi beats':'beats lo‑fi',
    'stationery':'papelería',
    'astro photography':'astrofotografía',
    'city night hikes':'paseos nocturnos por la ciudad',
    'competitive games':'juegos competitivos'
  },
  ja:{
    'shore fishing':'海釣り',
    'board games':'ボードゲーム',
    'instant photos':'インスタント写真',
    'running':'ランニング',
    'chess variants':'チェスのバリエーション',
    'latte art':'ラテアート',
    'street photography':'ストリート写真',
    'movie posters':'映画ポスター',
    'model kits':'模型',
    'basketball':'バスケットボール',
    'mechanical keyboards':'メカニカルキーボード',
    'city nights':'都会の夜',
    'hiking':'ハイキング',
    'boxing drills':'ボクシング練習',
    'wuxia novels':'武侠小説',
    'guitar':'ギター',
    'jogging':'ジョギング',
    'trip planning':'旅行計画',
    'baking':'お菓子作り',
    'illustration':'イラスト',
    'aromatherapy':'アロマテラピー',
    'yoga':'ヨガ',
    'floral design':'フラワーデザイン',
    'photography':'写真',
    'jazz':'ジャズ',
    'handcrafts':'手作り',
    'ceramics':'陶芸',
    'reading':'読書',
    'puzzles':'パズル',
    'travel journals':'旅行日記',
    'street food':'屋台グルメ',
    'sketching':'スケッチ',
    'gardening':'園芸',
    'lo-fi music':'ローファイ音楽',
    'pour-over coffee':'ハンドドリップ',
    'seaside runs':'海辺ラン',
    'city food hunts':'街の食べ歩き',
    'film cameras':'フィルムカメラ',
    'night activities':'夜のアクティビティ',
    'drinks':'お酒',
    'nightlife':'ナイトライフ',
    'late-night eats':'深夜ごはん',
    'night runs':'夜ラン',
    '3D drawing':'3D描画',
    'gaming':'ゲーム',
    'cadet':'少年隊',
    'swimming':'水泳',
    'stargazing':'星空観察',
    'synth music':'シンセ音楽',
    'speed cubing':'スピードキューブ',
    'streetball':'ストリートバスケ',
    'skateboarding':'スケートボード',
    'ramen hunts':'ラーメン探し',
    'calligraphy':'書道',
    'city walks':'街歩き',
    'vinyl':'レコード',
    'snowboarding':'スノーボード',
    'arcades':'アーケード',
    'retro cameras':'レトロカメラ',
    'pottery':'陶芸',
    'book cafés':'ブックカフェ',
    'watercolor':'水彩',
    'night markets':'夜市',
    'indie films':'インディー映画',
    'journaling':'日記',
    'badminton':'バドミントン',
    'strategy games':'戦略ゲーム',
    'podcasts':'ポッドキャスト',
    'tennis':'テニス',
    'photo edits':'写真編集',
    'boxing':'ボクシング',
    'graphic tees':'グラフィックT',
    'motorbikes':'バイク',
    'pilates':'ピラティス',
    'lo‑fi beats':'ローファイビート',
    'stationery':'文房具',
    'astro photography':'天体写真',
    'city night hikes':'夜の街歩き',
    'competitive games':'競技ゲーム'
  }
};
const PROFILE_ZODIAC_TRANSLATIONS={
  fr:{
    Taurus:'Taureau',
    Scorpio:'Scorpion',
    Pisces:'Poissons',
    Cancer:'Cancer',
    Aries:'Bélier',
    Virgo:'Vierge',
    Aquarius:'Verseau',
    Gemini:'Gémeaux',
    Leo:'Lion',
    Sagittarius:'Sagittaire',
    Libra:'Balance',
    Capricorn:'Capricorne'
  },
  de:{
    Taurus:'Stier',
    Scorpio:'Skorpion',
    Pisces:'Fische',
    Cancer:'Krebs',
    Aries:'Widder',
    Virgo:'Jungfrau',
    Aquarius:'Wassermann',
    Gemini:'Zwillinge',
    Leo:'Löwe',
    Sagittarius:'Schütze',
    Libra:'Waage',
    Capricorn:'Steinbock'
  },
  es:{
    Taurus:'Tauro',
    Scorpio:'Escorpio',
    Pisces:'Piscis',
    Cancer:'Cáncer',
    Aries:'Aries',
    Virgo:'Virgo',
    Aquarius:'Acuario',
    Gemini:'Géminis',
    Leo:'Leo',
    Sagittarius:'Sagitario',
    Libra:'Libra',
    Capricorn:'Capricornio'
  },
  ja:{
    Taurus:'おうし座',
    Scorpio:'さそり座',
    Pisces:'うお座',
    Cancer:'かに座',
    Aries:'おひつじ座',
    Virgo:'おとめ座',
    Aquarius:'みずがめ座',
    Gemini:'ふたご座',
    Leo:'しし座',
    Sagittarius:'いて座',
    Libra:'てんびん座',
    Capricorn:'やぎ座'
  }
};
function translateProfileHobby(value,langKey){
  const map=PROFILE_HOBBY_TRANSLATIONS[langKey];
  if(!map||typeof value!=='string')return value;
  const key=String(value).trim();
  return map[key]??map[key.replace(/\s+/g,' ')]??value;
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
  const lang=CALLOUT_RESPONSE_TEXT[state.language]?state.language:(CALLOUT_RESPONSE_TEXT.en?'en':'zh-HK');
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
  const lang=CALLOUT_RESPONSE_TEXT[state.language]?state.language:(CALLOUT_RESPONSE_TEXT.en?'en':'zh-HK');
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
  const ttsOnlyLang=!(state.language==='zh-HK'||state.language==='en');
  const clipKey=wc.repeat?'winner-repeat':'winner';
  if(ttsOnlyLang){
    speakCallout(wc.text,gender,{clipKey,seat});
    return;
  }
  const speakSeq=++calloutSpeakSeq;
  const ok=await playRecordedCalloutClip(clipKey,gender,speakSeq);
  if(!ok)return;
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
const kindLabel=(k)=> (KIND[state.language]??KIND.en??KIND['zh-HK'])?.[k] ?? k;
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
  const lang=state.language;
  const zh=lang==='zh-HK';
  const fr=lang==='fr';
  const de=lang==='de';
  const es=lang==='es';
  const ja=lang==='ja';
  const listHtml=(items,ordered=false)=>`${ordered?'<ol>':'<ul>'}${items.map((x)=>`<li>${esc(x)}</li>`).join('')}${ordered?'</ol>':'</ul>'}`;
  const labels=zh
    ?{privacy:'私隱政策',about:'關於我們',contact:'聯絡我們',terms:'使用條款'}
    :fr
      ?{privacy:'Confidentialité',about:'À propos',contact:'Contact',terms:'Conditions'}
      :de
        ?{privacy:'Datenschutz',about:'Über uns',contact:'Kontakt',terms:'Bedingungen'}
        :es
          ?{privacy:'Privacidad',about:'Acerca de',contact:'Contacto',terms:'Términos'}
          :ja
            ?{privacy:'プライバシー',about:'概要',contact:'連絡先',terms:'利用規約'}
            :{privacy:'Privacy',about:'About',contact:'Contact',terms:'Terms'};
  const privacyIntro=zh
    ?'我們重視你的私隱並以最少必要原則處理資料。'
    :fr
      ?'Nous appliquons une collecte minimale pour protéger votre vie privée.'
      :de
        ?'Wir nutzen einen datensparsamen Ansatz zum Schutz deiner Privatsphäre.'
        :es
          ?'Seguimos un enfoque de datos mínimos para proteger tu privacidad.'
          :ja
            ?'プライバシー保護のため、最小限のデータ収集を行います。'
            :'We follow a data-minimal approach to protect your privacy.';
  const privacyCollect=zh
    ?[
      '帳戶資料：顯示名稱、登入電郵',
      '遊戲資料：設定、對戰紀錄、分數與排行榜',
      '技術資料：裝置類型、作業系統、瀏覽器版本、語言、基本錯誤記錄'
    ]
    :fr
      ?[
        'Données de compte : nom d’affichage, e‑mail de connexion',
        'Données de jeu : paramètres, parties, scores, classement',
        'Données techniques : type d’appareil, OS, navigateur, langue, logs d’erreurs basiques'
      ]
      :de
        ?[
          'Kontodaten: Anzeigename, Anmelde‑E‑Mail',
          'Spieldaten: Einstellungen, Spielverläufe, Punkte, Rangliste',
          'Technische Daten: Gerätetyp, OS, Browser, Sprache, einfache Fehlerlogs'
        ]
        :es
          ?[
            'Datos de cuenta: nombre visible, correo de inicio de sesión',
            'Datos de juego: ajustes, partidas, puntuaciones, clasificación',
            'Datos técnicos: tipo de dispositivo, SO, navegador, idioma, registros básicos'
          ]
          :ja
            ?[
              'アカウント情報: 表示名、ログインメール',
              'ゲーム情報: 設定、対戦履歴、スコア、ランキング',
              '技術情報: 端末種別、OS、ブラウザ、言語、基本エラーログ'
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
    :fr
      ?[
        'Maintenir la connexion et les préférences (cookies ou équivalents)',
        'Fonctionnement du jeu, classement et statistiques',
        'Prévention des abus, contrôle des risques et maintenance'
      ]
      :de
        ?[
          'Anmeldung und Einstellungen aufrechterhalten (Cookies o. ä.)',
          'Spielbetrieb, Rangliste und Statistiken',
          'Missbrauchsprävention, Risikokontrolle und Wartung'
        ]
        :es
          ?[
            'Mantener inicio de sesión y preferencias (cookies o similares)',
            'Juego principal, clasificación y estadísticas',
            'Prevención de abuso, control de riesgos y mantenimiento'
          ]
          :ja
            ?[
              'ログインと設定の保持（Cookie等）',
              'ゲーム運営、ランキング、統計',
              '不正防止、リスク管理、保守'
            ]
            :[
              'Maintain sign-in and preferences (cookies or similar)',
              'Core gameplay, leaderboard, and statistics',
              'Abuse prevention, risk control, and maintenance'
            ];
  const privacyNotes=zh
    ?'資料不會出售作第三方行銷用途，並會在合理期限內清理。你可在瀏覽器管理 Cookies；停用後可能影響登入或偏好保存。如需查詢或更正／刪除資料，請透過聯絡方式與我們聯絡。'
    :fr
      ?'Nous ne vendons pas vos données à des tiers et les conservons uniquement le temps nécessaire. Vous pouvez gérer les cookies dans votre navigateur ; leur désactivation peut affecter la connexion ou les préférences. Pour toute question ou demande de correction/suppression, contactez‑nous.'
      :de
        ?'Wir verkaufen keine Daten an Dritte und speichern sie nur so lange wie nötig. Cookies können im Browser verwaltet werden; eine Deaktivierung kann Anmeldung oder Einstellungen beeinträchtigen. Für Auskünfte oder Korrektur/Löschung kontaktiere uns.'
        :es
          ?'No vendemos tus datos a terceros y solo los conservamos el tiempo necesario. Puedes gestionar las cookies en tu navegador; desactivarlas puede afectar el inicio de sesión o las preferencias. Para consultas o corrección/eliminación, contáctanos.'
          :ja
            ?'データは第三者マーケティング目的で販売せず、必要な期間のみ保持します。Cookieはブラウザで管理できますが、無効化するとログインや設定保存に影響する場合があります。お問い合わせや訂正・削除は連絡先からお願いします。'
            :'We do not sell your data for third‑party marketing and retain it only as needed before cleanup. You can manage cookies in your browser; disabling them may affect sign-in or preferences. For questions or correction/removal requests, contact us.';
  const aboutIntro=zh
    ?'《鋤大D（Big Two）》網頁版專注於跨裝置一致體驗。'
    :fr
      ?'Cette version web de Big Two vise une expérience cohérente sur tous les appareils.'
      :de
        ?'Diese Browser‑Version von Big Two fokussiert auf eine konsistente Geräte‑Erfahrung.'
        :es
          ?'Esta versión web de Big Two se centra en una experiencia consistente entre dispositivos.'
          :ja
            ?'このBig Twoのウェブ版は、デバイス間で一貫した体験を重視しています。'
            :'This browser-based Big Two focuses on consistent play across devices.';
  const aboutList=zh
    ?[
      '支援手機、平板與桌面快速開局',
      '提供單人對戰與房間對戰',
      '排行榜、個人設定與成績追蹤',
      '清晰出牌提示、即時狀態與計分明細'
    ]
    :fr
      ?[
        'Démarrage rapide sur mobile, tablette et desktop',
        'Solo et parties en salon',
        'Classement, paramètres personnels, suivi des performances',
        'Indications claires, état en direct et détails de score'
      ]
      :de
        ?[
          'Schnellstart auf Handy, Tablet und Desktop',
          'Solo‑ und Raumspiele',
          'Rangliste, persönliche Einstellungen, Leistungs‑Tracking',
          'Klare Hinweise, Live‑Status und Punktedetails'
        ]
        :es
          ?[
            'Inicio rápido en móvil, tableta y escritorio',
            'Partidas en solitario y en sala',
            'Clasificación, ajustes personales, seguimiento de resultados',
            'Indicaciones claras, estado en vivo y detalles de puntuación'
          ]
          :ja
            ?[
              'スマホ・タブレット・PCで素早く開始',
              'ソロ対戦とルーム対戦',
              'ランキング、個人設定、成績管理',
              '明確な出牌ガイド、リアルタイム状況、計分詳細'
            ]
            :[
              'Fast start on phone, tablet, and desktop',
              'Solo and room matches',
              'Leaderboard, personal settings, performance tracking',
              'Clear play cues, live status, and scoring details'
            ];
  const aboutNotes=zh
    ?'我們持續優化效能、互動回饋、版面適配與穩定性，並依玩家回饋改進。'
    :fr
      ?'Nous améliorons en continu les performances, le feedback, l’interface et la stabilité selon les retours.'
      :de
        ?'Wir verbessern fortlaufend Performance, Feedback, Layout und Stabilität basierend auf Rückmeldungen.'
        :es
          ?'Mejoramos continuamente el rendimiento, la respuesta, el diseño y la estabilidad según comentarios.'
          :ja
            ?'パフォーマンス、操作感、レイアウト、安定性を継続的に改善しています。'
            :'We continuously improve performance, interaction feedback, responsive layout, and stability based on player feedback.';
  const termsIntro=zh
    ?'使用本網站即表示你同意：'
    :fr
      ?'En utilisant ce site, vous acceptez :'
      :de
        ?'Durch die Nutzung dieser Website stimmst du zu:'
        :es
          ?'Al usar este sitio, aceptas:'
          :ja
            ?'本サイトを利用することで、以下に同意したものとします:'
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
    :fr
      ?[
        'Utiliser le service légalement et équitablement, sans triche ni abus',
        'Éviter plugins, automatisations, robots ou méthodes non standard affectant parties ou classements',
        'Gérer la sécurité de votre compte/appareil',
        'Les classements se basent sur les logs et peuvent être corrigés',
        'Des fonctionnalités peuvent changer ou être suspendues pour maintenance, sécurité ou obligations légales',
        'Aucune garantie contre interruptions ou pertes dues au réseau/appareil/tiers'
      ]
      :de
        ?[
          'Dienst legal und fair nutzen, ohne Betrug oder Missbrauch',
          'Keine Plugins, Automatisierung, Crawler oder unübliche Methoden, die Spiele/Rankings beeinflussen',
          'Sicherheit von Konto und Gerät selbst verwalten',
          'Ranglisten basieren auf Systemlogs und können korrigiert werden',
          'Funktionen können aus Wartungs-, Sicherheits- oder Rechtsgründen geändert/pausiert werden',
          'Keine Garantie bei Ausfällen oder Verlusten durch Netzwerk/Gerät/Drittanbieter'
        ]
        :es
          ?[
            'Usar el servicio legalmente y con equidad, sin trampas ni abuso',
            'Evitar plugins, automatización, rastreadores o métodos no estándar que afecten partidas o clasificaciones',
            'Gestionar la seguridad de tu cuenta/dispositivo',
            'Las clasificaciones siguen los registros del sistema y pueden corregirse',
            'Funciones pueden cambiar o suspenderse por mantenimiento, seguridad o requisitos legales',
            'Sin garantía ante interrupciones o pérdidas por red/dispositivo/terceros'
          ]
          :ja
            ?[
              '不正や濫用をせず、合法かつ公平に利用する',
              'プラグイン、自動化、クローラー等で対戦やランキングに影響を与えない',
              'アカウント/端末の安全管理は利用者が行う',
              'ランキングや戦績はシステム記録に基づき、異常は修正/削除されることがある',
              '保守・安全・法令上の理由で機能変更や一時停止を行う場合がある',
              'ネットワーク/端末/第三者サービスによる中断や損失は保証しない'
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
    :fr
      ?'Si vous n’acceptez pas ces conditions, veuillez cesser d’utiliser le site.'
      :de
        ?'Wenn du diese Bedingungen nicht akzeptierst, nutze die Website bitte nicht.'
        :es
          ?'Si no aceptas estos términos, deja de usar el sitio.'
          :ja
            ?'同意できない場合はご利用をお控えください。'
            :'Discontinue use if you do not accept these terms.';
  const supportText=zh
    ?'喜歡這個遊戲？歡迎點擊或掃描支持我們一杯咖啡，讓我們持續更新與改善。'
    :fr
      ?'Vous aimez le jeu ? Cliquez ou scannez pour nous offrir un café et soutenir les améliorations.'
      :de
        ?'Gefällt dir das Spiel? Unterstütze uns mit einem Kaffee per Klick oder Scan.'
        :es
          ?'¿Te gusta el juego? Haz clic o escanea para apoyarnos con un café.'
          :ja
            ?'このゲームが気に入ったら、クリックまたはスキャンでコーヒー支援をお願いします。'
            :'Enjoying the game? Click or scan to support us with a coffee so we can keep improving it.';
  const supportHtml=`<div class="bmac-cta"><div class="bmac-msg">${esc(supportText)}</div><div class="bmac-row"><a href="https://www.buymeacoffee.com/4leafx" target="_blank" rel="noopener noreferrer"><img class="bmac-button" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee"></a><img class="bmac-qr" src="${withBase('bmac-qr.png')}" alt="Buy Me A Coffee QR"></div></div>`;
  const contactHtml=zh
    ?'如有查詢，請電郵至 <a href="mailto:4LeafxCS@gmail.com">4LeafxCS@gmail.com</a>。'
    :fr
      ?'Pour toute demande, écrivez à <a href="mailto:4LeafxCS@gmail.com">4LeafxCS@gmail.com</a>.'
      :de
        ?'Bei Fragen: <a href="mailto:4LeafxCS@gmail.com">4LeafxCS@gmail.com</a>.'
        :es
          ?'Para consultas, escribe a <a href="mailto:4LeafxCS@gmail.com">4LeafxCS@gmail.com</a>.'
          :ja
            ?'お問い合わせは <a href="mailto:4LeafxCS@gmail.com">4LeafxCS@gmail.com</a> まで。'
            :'For enquiries, email <a href="mailto:4LeafxCS@gmail.com">4LeafxCS@gmail.com</a>.';
  const contactList=zh
    ?[
      '裝置型號與系統版本',
      '瀏覽器與版本',
      '發生時間與操作步驟',
      '截圖或錄影（如適用）'
    ]
    :fr
      ?[
        'Modèle d’appareil et version du système',
        'Navigateur et version',
        'Heure et étapes de reproduction',
        'Captures d’écran ou enregistrement (si possible)'
      ]
      :de
        ?[
          'Gerätemodell und OS‑Version',
          'Browser und Version',
          'Zeitpunkt und Schritte zur Reproduktion',
          'Screenshots oder Bildschirmaufnahme (falls vorhanden)'
        ]
        :es
          ?[
            'Modelo de dispositivo y versión del SO',
            'Navegador y versión',
            'Hora y pasos para reproducir',
            'Capturas o grabación de pantalla (si aplica)'
          ]
          :ja
            ?[
              '端末機種とOSバージョン',
              'ブラウザとバージョン',
              '発生時刻と再現手順',
              'スクリーンショット/画面録画（可能なら）'
            ]
            :[
              'Device model and OS version',
              'Browser and version',
              'Time and steps to reproduce',
              'Screenshots or screen recording (if any)'
            ];
  return{
    labels,
    closeLabel:t('close'),
      content:{
        privacy:`<h4>${esc(labels.privacy)}</h4><p>${esc(privacyIntro)}</p><p>${esc(zh?'收集資料':fr?'Données collectées':de?'Erhobene Daten':es?'Datos que recopilamos':ja?'収集するデータ':'Data we collect')}</p>${listHtml(privacyCollect)}<p>${esc(zh?'使用目的':fr?'Utilisation des données':de?'Datennutzung':es?'Cómo usamos los datos':ja?'データの利用目的':'How we use data')}</p>${listHtml(privacyUse)}<p>${esc(privacyNotes)}</p>`,
        about:`<h4>${esc(labels.about)}</h4><div class="legal-about-grid"><div class="legal-about-main"><p>${esc(aboutIntro)}</p>${listHtml(aboutList)}<p>${esc(aboutNotes)}</p></div><div class="legal-about-side">${supportHtml}</div></div>`,
        contact:`<h4>${esc(labels.contact)}</h4><p>${contactHtml}</p><p>${esc(zh?'建議提供':fr?'Merci d’inclure':de?'Bitte angeben':es?'Incluye':ja?'可能であれば以下を添付':'Please include')}</p>${listHtml(contactList)}`,
        terms:`<h4>${esc(labels.terms)}</h4><p>${esc(termsIntro)}</p>${listHtml(termsList,true)}<p>${esc(termsNotes)}</p>`
      }
    };
  }
  function mainPageLegalMiniHtml(){
    const legal=legalMiniCopy();
    return`<section class="legal-mini" id="legal-mini"><div class="legal-mini-links"><button type="button" class="legal-mini-link" data-legal="privacy">${legal.labels.privacy}</button><span class="legal-mini-sep">◦</span><button type="button" class="legal-mini-link" data-legal="about">${legal.labels.about}</button><span class="legal-mini-sep">◦</span><button type="button" class="legal-mini-link" data-legal="contact">${legal.labels.contact}</button><span class="legal-mini-sep">◦</span><button type="button" class="legal-mini-link" data-legal="terms">${legal.labels.terms}</button></div><div class="intro-modal legal-modal" id="legal-modal"><button class="intro-backdrop" id="legal-backdrop" aria-label="close"></button><section class="intro-sheet legal-sheet"><header class="intro-head"><div><h3 id="legal-modal-title"></h3></div><button id="legal-close" class="secondary">${legal.closeLabel}</button></header><div class="legal-modal-body" id="legal-modal-body"></div></section></div></section>`;
  }
const introText=()=>{
  if(state.language==='en'){
    return{
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
        'In a room, the host can press Start when at least 2 players are inside.',
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
    };
  }
  if(state.language==='fr'){
    return{
      btnShow:'Guide',
      btnHide:'Fermer',
      panelTitle:'Guide',
      panelSub:'Référence rapide officielle : règles clés, hiérarchie des mains, ouverture et stratégie de table.',
      historyTitle:'Contexte',
      historyBody:'Big Two (Cho Dai Di) est un jeu de défausse à 4 joueurs, joué avec un jeu standard de 52 cartes sans jokers. Chaque joueur reçoit 13 cartes et l’objectif est de vider sa main avant les autres. Le jeu est connu pour sa densité de décisions, ses manches rapides et l’interaction stratégique entre le contrôle du tempo, la conservation des cartes fortes et le timing.',
      playTitle:'Points clés',
      playList:[
        'La première sortie du premier tour doit contenir {{3D}}.',
        'Pour suivre, le nombre de cartes doit correspondre : simple, paire, brelan ou 5 cartes.',
        'Hiérarchie des 5 cartes : Suite < Couleur < Full House < Carré < Quinte flush.',
        'À rang égal, l’ordre des couleurs est ♦️ < ♣️ < ♥️ < ♠️.',
        'Ordre des cartes simples : 2 > A > K > ... > 3 (max : ♠️2, min : ♦️3).',
        'Après trois passes consécutives, l’initiative revient au dernier joueur ayant joué.',
        'Avec l’initiative, choisissez un tempo qui garde le contrôle et bloque les sorties adverses.'
      ],
      flowTitle:'Déroulement initial',
      flowList:[
        'Distribuer 13 cartes à chacun des 4 joueurs.',
        'Le joueur qui a {{3D}} ouvre la première levée.',
        'Les autres jouent la même quantité ou passent.',
        'Après trois passes, le dernier jeu valide reprend la main.',
        'La manche se termine quand un joueur n’a plus de cartes.'
      ],
      guideHowTitle:'Comment jouer',
      guideHowIntro:'Étapes rapides pour démarrer :',
      guideHowList:[
        'Connectez-vous pour activer les salles et le classement.',
        'Depuis l’accueil, choisissez Solo ou entrez dans le Lobby pour créer/rejoindre.',
        'Dans une salle, l’hôte lance dès que 2 joueurs sont présents.',
        'À votre tour, sélectionnez des cartes puis Jouer ; Passez si autorisé.',
        'Utilisez Suggestion et triez/drag pour organiser votre main.'
      ],
      guideHomeTitle:'Ajouter à l’écran d’accueil',
      guideHomeIntro:'Ajoutez l’app pour un lancement plein écran, comme une application.',
      guideAndroidTitle:'Android (Chrome)',
      guideAndroidSteps:[
        'Ouvrez ce site dans Chrome.',
        'Appuyez sur le menu à trois points.',
        'Choisissez Ajouter à l’écran d’accueil.',
        'Confirmez le nom puis Ajouter.'
      ],
      guideIosTitle:'iPhone / iPad (Safari)',
      guideIosSteps:[
        'Ouvrez ce site dans Safari.',
        'Appuyez sur Partager (carré avec flèche).',
        'Choisissez Sur l’écran d’accueil.',
        'Confirmez le nom puis Ajouter.'
      ],
      guideHomeNotes:'Si l’option n’apparaît pas, utilisez Safari/Chrome plutôt qu’un navigateur intégré.',
      howTitle:'Types de mains',
      howBody:'Pour suivre, le nombre de cartes doit correspondre. En 5 cartes, comparez d’abord la catégorie, puis les cartes hautes et la couleur.',
      howList:[]
    };
  }
  if(state.language==='de'){
    return{
      btnShow:'Guide',
      btnHide:'Schließen',
      panelTitle:'Guide',
      panelSub:'Offizielle Kurzübersicht: Regeln, Hand-Rangfolge, Startablauf und Taktik.',
      historyTitle:'Hintergrund',
      historyBody:'Big Two (Cho Dai Di) ist ein 4‑Spieler‑Ausstiegsspiel mit einem 52‑Karten‑Deck ohne Joker. Jeder erhält 13 Karten; Ziel ist, die eigene Hand zuerst zu leeren. Das Spiel ist bekannt für hohe Entscheidungsdichte, kurze Runden und starke strategische Wechselwirkung zwischen Tempo, Kartenmanagement und Timing starker Karten.',
      playTitle:'Spiel-Highlights',
      playList:[
        'Der Eröffnungszug der ersten Runde muss {{3D}} enthalten.',
        'Nachspielen muss die Kartenanzahl treffen: Einzel, Paar, Drilling oder 5‑Karten‑Hand.',
        '5‑Karten‑Hierarchie: Straße < Farbe < Full House < Vierling < Straight Flush.',
        'Bei gleichem Rang gilt die Farb-Reihenfolge ♦️ < ♣️ < ♥️ < ♠️.',
        'Einzelkarten-Rang: 2 > A > K > ... > 3 (höchste: ♠️2, niedrigste: ♦️3).',
        'Nach drei Pässen in Folge geht die Initiative an den letzten Gewinner zurück.',
        'Mit Initiative wähle ein Tempo, das Kontrolle hält und Ausstiege blockiert.'
      ],
      flowTitle:'Startablauf',
      flowList:[
        '13 Karten an jeden der 4 Spieler verteilen.',
        'Der Spieler mit {{3D}} eröffnet den ersten Stich.',
        'Andere überbieten mit gleicher Kartenanzahl oder passen.',
        'Nach drei Pässen setzt der letzte gültige Zug die Führung fort.',
        'Die Runde endet sofort, wenn ein Spieler alle Karten gespielt hat.'
      ],
      guideHowTitle:'So spielst du',
      guideHowIntro:'Schnellstart in 5 Schritten:',
      guideHowList:[
        'Anmelden, um Räume und Rangliste zu aktivieren.',
        'Im Home Solo wählen oder Lobby öffnen, um Raum zu erstellen/beitreten.',
        'Im Raum kann der Host starten, sobald mindestens 2 Spieler drin sind.',
        'Im Zug Karten wählen und Spielen; Passen, wenn erlaubt.',
        'Vorschlag nutzen und per Sortieren/Drag die Hand ordnen.'
      ],
      guideHomeTitle:'Zum Startbildschirm hinzufügen',
      guideHomeIntro:'Füge es zum Startbildschirm hinzu für einen Vollbild‑App‑Start.',
      guideAndroidTitle:'Android (Chrome)',
      guideAndroidSteps:[
        'Diese Seite in Chrome öffnen.',
        'Drei‑Punkte‑Menü tippen.',
        'Zum Startbildschirm hinzufügen auswählen.',
        'Name bestätigen und Hinzufügen.'
      ],
      guideIosTitle:'iPhone / iPad (Safari)',
      guideIosSteps:[
        'Diese Seite in Safari öffnen.',
        'Teilen tippen (Quadrat mit Pfeil).',
        'Zum Home‑Bildschirm wählen.',
        'Name bestätigen und Hinzufügen.'
      ],
      guideHomeNotes:'Falls die Option fehlt, nutze Safari/Chrome statt In‑App‑Browser.',
      howTitle:'Handtypen',
      howBody:'Beim Nachspielen muss die Kartenanzahl passen. Bei 5 Karten zuerst die Kategorie, dann hohe Karten und Farben vergleichen.',
      howList:[]
    };
  }
  if(state.language==='es'){
    return{
      btnShow:'Guía',
      btnHide:'Cerrar',
      panelTitle:'Guía',
      panelSub:'Referencia rápida oficial: reglas clave, jerarquía de manos, apertura y estrategia.',
      historyTitle:'Contexto',
      historyBody:'Big Two (Cho Dai Di) es un juego de descarte para 4 jugadores con una baraja estándar de 52 cartas sin comodines. Cada jugador recibe 13 cartas y el objetivo es vaciar la mano antes que los demás. Es un juego de alta densidad de decisiones, rondas rápidas y gran interacción estratégica entre control del ritmo, conservación de cartas fuertes y timing.',
      playTitle:'Puntos clave',
      playList:[
        'La primera jugada de la primera ronda debe incluir {{3D}}.',
        'Para responder, la cantidad de cartas debe coincidir: simple, pareja, trío o 5 cartas.',
        'Jerarquía de 5 cartas: Escalera < Color < Full House < Póker < Escalera de color.',
        'A igual rango, el orden de palos es ♦️ < ♣️ < ♥️ < ♠️.',
        'Orden de cartas simples: 2 > A > K > ... > 3 (máxima: ♠️2, mínima: ♦️3).',
        'Tras tres pases seguidos, la iniciativa vuelve al último que jugó.',
        'Con la iniciativa, elige un ritmo que mantenga el control y bloquee salidas.'
      ],
      flowTitle:'Flujo de apertura',
      flowList:[
        'Repartir 13 cartas a cada uno de los 4 jugadores.',
        'El jugador con {{3D}} debe abrir la primera baza.',
        'Los demás superan con la misma cantidad o pasan.',
        'Tras tres pases, el último juego válido reinicia el turno.',
        'La ronda termina en cuanto alguien se queda sin cartas.'
      ],
      guideHowTitle:'Cómo jugar',
      guideHowIntro:'Pasos rápidos para empezar:',
      guideHowList:[
        'Inicia sesión para habilitar salas y ranking.',
        'En Inicio, elige Solo o entra al Lobby para crear/unirte.',
        'En una sala, el anfitrión inicia cuando hay al menos 2 jugadores dentro.',
        'En tu turno, selecciona cartas y pulsa Jugar; Pasa si está permitido.',
        'Usa Sugerir y ordena/arrastra para organizar la mano.'
      ],
      guideHomeTitle:'Añadir a la pantalla de inicio',
      guideHomeIntro:'Añádelo a Inicio para abrirlo a pantalla completa como app.',
      guideAndroidTitle:'Android (Chrome)',
      guideAndroidSteps:[
        'Abre este sitio en Chrome.',
        'Toca el menú de tres puntos.',
        'Selecciona Añadir a pantalla de inicio.',
        'Confirma el nombre y pulsa Añadir.'
      ],
      guideIosTitle:'iPhone / iPad (Safari)',
      guideIosSteps:[
        'Abre este sitio en Safari.',
        'Toca Compartir (cuadrado con flecha).',
        'Elige Añadir a pantalla de inicio.',
        'Confirma el nombre y pulsa Añadir.'
      ],
      guideHomeNotes:'Si no aparece la opción, usa Safari/Chrome en lugar de un navegador integrado.',
      howTitle:'Tipos de manos',
      howBody:'Para responder, la cantidad de cartas debe coincidir. En 5 cartas, compara primero la categoría y luego las cartas altas y palos.',
      howList:[]
    };
  }
  if(state.language==='ja'){
    return{
      btnShow:'ガイド',
      btnHide:'閉じる',
      panelTitle:'ガイド',
      panelSub:'コアルール、役の序列、開局フロー、実戦のセオリーをまとめた公式クイックリファレンス。',
      historyTitle:'概要',
      historyBody:'Big Two（Chō Dai Di）は4人用の出し切り型カードゲームで、ジョーカーなしの標準52枚デッキを使います。各プレイヤーに13枚ずつ配られ、最初に手札を無くした人が勝利です。テンポ管理、強い札の温存、パワーカードのタイミングなど、密度の高い判断が求められるゲームとして知られています。',
      playTitle:'ポイント',
      playList:[
        '最初のラウンドの初手は {{3D}} を含む必要があります。',
        '後出しは同じ枚数で合わせます：単札・ペア・スリー・5枚役。',
        '5枚役の強さ：ストレート < フラッシュ < フルハウス < フォーカード < ストレートフラッシュ。',
        '同ランクの場合、スート順は ♦️ < ♣️ < ♥️ < ♠️。',
        '単札の強さ：2 > A > K > ... > 3（最強：♠️2、最弱：♦️3）。',
        '3人連続パス後、最後に出したプレイヤーが主導権を得ます。',
        '主導権がある時は、テンポと手札温存のバランスで相手の上がりを阻止します。'
      ],
      flowTitle:'開局フロー',
      flowList:[
        '4人に13枚ずつ配ります。',
        '{{3D}} を持つプレイヤーが最初のトリックを開始します。',
        '他のプレイヤーは同じ枚数で上回るかパスします。',
        '3人がパスしたら、直前の勝ち手から再開します。',
        '誰かが手札を出し切った時点でラウンド終了です。'
      ],
      guideHowTitle:'遊び方',
      guideHowIntro:'すぐ始める手順：',
      guideHowList:[
        'サインインしてルーム対戦とランキングを有効にします。',
        'ホームでソロを選ぶか、ロビーからルーム作成/参加します。',
        'ルームでは2人以上でホストが開始できます。',
        '自分の番にカードを選び、プレイをタップ。必要ならパスします。',
        'サジェストで補助し、並び替え/ドラッグで手札を整理します。'
      ],
      guideHomeTitle:'ホーム画面に追加',
      guideHomeIntro:'ホーム画面に追加すると、アプリのように全画面起動できます。',
      guideAndroidTitle:'Android (Chrome)',
      guideAndroidSteps:[
        'このサイトをChromeで開きます。',
        '右上の三点メニューをタップ。',
        '「ホーム画面に追加」を選択。',
        '名前を確認して追加。'
      ],
      guideIosTitle:'iPhone / iPad (Safari)',
      guideIosSteps:[
        'このサイトをSafariで開きます。',
        '共有（上向き矢印の四角）をタップ。',
        '「ホーム画面に追加」を選択。',
        '名前を確認して追加。'
      ],
      guideHomeNotes:'表示されない場合は、アプリ内ブラウザではなくSafari/Chromeを使用してください。',
      howTitle:'役の種類',
      howBody:'後出しは同じ枚数で合わせる必要があります。5枚勝負では、まず役の種類を比べ、次に高い札とスートで比較します。',
      howList:[]
    };
  }
  return{
    btnShow:'玩法指南',
    btnHide:'關閉',
    panelTitle:'玩法指南',
    panelSub:'提供核心規則、牌型次序、開局流程與實戰節奏的官方速覽。',
    historyTitle:'背景',
    historyBody:'《鋤大D》（Big Two）為四人出清型撲克牌遊戲，使用標準52張牌（不含鬼牌），每位玩家派發13張。玩家的目標是在其他對手之前出清手牌。此遊戲特色在於回合節奏明確、決策密度高，並重視控場、保留關鍵牌與出牌時機的策略取捨。\n\n在香港，《鋤大D》是非常普及的休閒紙牌遊戲，常見於家庭聚會、朋友聚餐及節日活動（例如農曆新年）。許多香港人自小便接觸此遊戲，並在社交場合中用作娛樂和聯誼。遊戲節奏快速且富競技性，因此深受年輕人及成年人歡迎，也逐漸發展出不同地方版本與玩法變化，成為香港流行文化的一部分。',
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
        '房主可在至少 2 位玩家進入房間後按「開始」。',
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
  if(state.language==='fr'){
    return[
      {name:'Carte',desc:'1 carte',cards:[card('A','♠️')]},
      {name:'Paire',desc:'2 même rang',cards:[card('9','♦️'),card('9','♣️')]},
      {name:'Brelan',desc:'3 même rang',cards:[card('7','♦️'),card('7','♣️'),card('7','♠️')]},
      {name:'Suite',desc:'5 rangs consécutifs',cards:[card('6','♦️'),card('7','♣️'),card('8','♥️'),card('9','♠️'),card('10','♣️')]},
      {name:'Couleur',desc:'5 même couleur',cards:[card('3','♥️'),card('7','♥️'),card('9','♥️'),card('J','♥️'),card('A','♥️')]},
      {name:'Full House',desc:'Brelan + Paire',cards:[card('Q','♣️'),card('Q','♦️'),card('Q','♠️'),card('5','♥️'),card('5','♣️')]},
      {name:'Carré',desc:'4 même rang + kicker',cards:[card('8','♦️'),card('8','♣️'),card('8','♥️'),card('8','♠️'),card('2','♣️')]},
      {name:'Quinte flush',desc:'Même couleur + suite',cards:[card('5','♠️'),card('6','♠️'),card('7','♠️'),card('8','♠️'),card('9','♠️')]}
    ];
  }
  if(state.language==='de'){
    return[
      {name:'Einzel',desc:'1 Karte',cards:[card('A','♠️')]},
      {name:'Paar',desc:'2 gleiche Ränge',cards:[card('9','♦️'),card('9','♣️')]},
      {name:'Drilling',desc:'3 gleiche Ränge',cards:[card('7','♦️'),card('7','♣️'),card('7','♠️')]},
      {name:'Straße',desc:'5 aufeinanderfolgende Ränge',cards:[card('6','♦️'),card('7','♣️'),card('8','♥️'),card('9','♠️'),card('10','♣️')]},
      {name:'Farbe',desc:'5 gleiche Farbe',cards:[card('3','♥️'),card('7','♥️'),card('9','♥️'),card('J','♥️'),card('A','♥️')]},
      {name:'Full House',desc:'Drilling + Paar',cards:[card('Q','♣️'),card('Q','♦️'),card('Q','♠️'),card('5','♥️'),card('5','♣️')]},
      {name:'Vierling',desc:'4 gleiche Ränge + Beikarte',cards:[card('8','♦️'),card('8','♣️'),card('8','♥️'),card('8','♠️'),card('2','♣️')]},
      {name:'Straight Flush',desc:'Gleiche Farbe + Straße',cards:[card('5','♠️'),card('6','♠️'),card('7','♠️'),card('8','♠️'),card('9','♠️')]}
    ];
  }
  if(state.language==='es'){
    return[
      {name:'Carta',desc:'1 carta',cards:[card('A','♠️')]},
      {name:'Pareja',desc:'2 del mismo rango',cards:[card('9','♦️'),card('9','♣️')]},
      {name:'Trío',desc:'3 del mismo rango',cards:[card('7','♦️'),card('7','♣️'),card('7','♠️')]},
      {name:'Escalera',desc:'5 rangos consecutivos',cards:[card('6','♦️'),card('7','♣️'),card('8','♥️'),card('9','♠️'),card('10','♣️')]},
      {name:'Color',desc:'5 del mismo palo',cards:[card('3','♥️'),card('7','♥️'),card('9','♥️'),card('J','♥️'),card('A','♥️')]},
      {name:'Full House',desc:'Trío + Pareja',cards:[card('Q','♣️'),card('Q','♦️'),card('Q','♠️'),card('5','♥️'),card('5','♣️')]},
      {name:'Póker',desc:'4 del mismo rango + kicker',cards:[card('8','♦️'),card('8','♣️'),card('8','♥️'),card('8','♠️'),card('2','♣️')]},
      {name:'Escalera de color',desc:'Mismo palo + escalera',cards:[card('5','♠️'),card('6','♠️'),card('7','♠️'),card('8','♠️'),card('9','♠️')]}
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
    const historyBlocks=String(it.historyBody??'')
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map((p)=>`<p>${colorizeSuitText(p)}</p>`)
      .join('');
    return`<div class="intro-modal" id="intro-modal"><button class="intro-backdrop" id="intro-backdrop" aria-label="close"></button><section class="intro-sheet"><header class="intro-head"><div><h3 class="title-with-icon"><span class="title-icon title-icon-guide" aria-hidden="true"></span><span>${esc(it.panelTitle)}</span></h3>${it.panelSub?`<p>${colorizeSuitText(it.panelSub)}</p>`:''}</div><button id="intro-close" class="secondary">${esc(it.btnHide)}</button></header><div class="intro-grid"><article class="intro-block"><h4>${esc(it.historyTitle)}</h4>${historyBlocks}</article><article class="intro-block"><h4>${esc(it.howTitle)}</h4><p>${colorizeSuitText(it.howBody)}</p><div class="intro-hand-list">${rows}</div></article><article class="intro-block"><h4>${esc(it.flowTitle)}</h4><ul>${(it.flowList??[]).map((x)=>`<li>${formatIntroLine(x)}</li>`).join('')}</ul></article><article class="intro-block"><h4>${esc(it.playTitle)}</h4><ul>${(it.playList??[]).map((x)=>`<li>${formatIntroLine(x)}</li>`).join('')}</ul></article><article class="intro-block"><h4>${esc(it.guideHowTitle)}</h4><p>${esc(it.guideHowIntro)}</p><ul>${howList}</ul></article><article class="intro-block"><h4>${esc(it.guideHomeTitle)}</h4><p>${esc(it.guideHomeIntro)}</p><p><strong>${esc(it.guideAndroidTitle)}</strong></p><ol>${androidList}</ol><p><strong>${esc(it.guideIosTitle)}</strong></p><ol>${iosList}</ol><p>${esc(it.guideHomeNotes)}</p></article></div></section></div>`;
  }
function leaderboardModalHtml(){
  const closeLabel=t('close');
  return`<div class="intro-modal lb-modal" id="lb-modal"><button class="intro-backdrop" id="lb-backdrop" aria-label="close"></button><section class="intro-sheet lb-sheet"><header class="intro-head"><div><h3 class="title-with-icon"><span class="title-icon title-icon-leaderboard" aria-hidden="true"></span><span>${t('lb')}</span></h3><p>${esc(t('lbHeadingDesc'))}</p></div><button id="lb-close" class="secondary">${closeLabel}</button></header>${leaderboardPanelHtml()}</section></div>`;
}
const lbText=()=>({
  best:t('lbBest'),
  worst:t('lbWorst'),
  updated:t('lbUpdated'),
  wr:t('lbWR'),
  avg:t('lbAvg')
});
function fmtDateTime(ts){
  const n=Number(ts)||0;
  if(!n)return'-';
  const localeMap={
    en:'en-US',
    'zh-HK':'zh-HK',
    fr:'fr-FR',
    de:'de-DE',
    es:'es-ES',
    ja:'ja-JP'
  };
  const locale=localeMap[state.language]||'en-US';
  try{return new Date(n).toLocaleString(locale,{hour12:false});}catch{return'-';}
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
  const lang=LANGUAGE_OPTIONS.some((opt)=>opt.value===state.language)?state.language:'zh-HK';
  return{
    language:lang,
    aiDifficulty:['easy','normal','hard'].includes(state.home.aiDifficulty)?state.home.aiDifficulty:'normal',
    backColor:BACK_OPTIONS.some((x)=>x.value===state.home.backColor)?state.home.backColor:'red',
    soundEnabled:Boolean(sound.enabled),
    calloutDisplayEnabled:Boolean(calloutDisplayEnabled),
    emoteDisplayEnabled:Boolean(emoteDisplayEnabled),
    calloutVoiceMode:sound.enabled?'auto':'off',
    calloutStylePack:normalizeCalloutStylePack(calloutStylePack),
    gender:state.home.gender==='female'?'female':'male',
    avatarChoice:['male','female','google'].includes(state.home.avatarChoice)?state.home.avatarChoice:'male',
    turnTimeout:DEFAULT_TURN_TIMEOUT_MS
  };
}
function applyMainSettings(settings){
  if(!settings||typeof settings!=='object')return;
  const language=String(settings.language??'');
  if(LANGUAGE_OPTIONS.some((opt)=>opt.value===language))state.language=language;
  const ai=String(settings.aiDifficulty??'');
  if(['easy','normal','hard'].includes(ai))state.home.aiDifficulty=ai;
  const back=String(settings.backColor??'');
  if(BACK_OPTIONS.some((x)=>x.value===back))state.home.backColor=back;
  if(typeof settings.soundEnabled==='boolean')sound.enabled=Boolean(settings.soundEnabled);
  if(typeof settings.calloutDisplayEnabled==='boolean')calloutDisplayEnabled=Boolean(settings.calloutDisplayEnabled);
  if(typeof settings.emoteDisplayEnabled==='boolean')emoteDisplayEnabled=Boolean(settings.emoteDisplayEnabled);
  calloutVoiceMode=sound.enabled?'auto':'off';
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
  clearRoomStartPending();
  state.room={id:'',code:'',data:null,joinOpen:false,error:'',started:false,unsub:null,selfSeat:-1,recordedGameKey:'',pendingStart:false};
  state.room.playerId='';
  if(state.home.mode==='room')state.home.mode='solo';
}
function setRoomError(msg){
  state.room.error=msg||'';
  render();
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
  if(!entry){
    await dropSelfFromRoom(existing,playerId);
    return{ok:true,cleared:true};
  }
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
    const roomData=roomSnap.data()??{};
    const roomStatus=String(roomData.status||'');
    const roomPlayers=Array.isArray(roomData.players)?roomData.players:[];
    const playerId=baseRoomPlayerId();
    const entry=roomPlayers.find((p)=>String(p.uid)===String(playerId));
    if(!entry){
      await ref.set({currentRoomId:'',updatedAt:Date.now()},{merge:true});
      return{ok:true,cleared:true};
    }
    const lastSeen=Number(entry?.lastSeen)||0;
    const now=Date.now();
    const stale=(roomStatus==='lobby'||roomStatus==='starting')&&lastSeen>0&&(now-lastSeen>roomPruneMs(roomStatus));
    if(stale){
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
    if(hiddenRooms){
      console.warn('Hidden rooms',hiddenRooms);
    }
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
        players:[{uid,name,gender:state.home.gender==='female'?'female':'male',picture:authPictureUrl(),isHost:true,seat:0,lastSeen:now}],
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
            players[idx]={...players[idx],uid,name,gender,picture,lastSeen:now};
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
        players.push({uid,name,gender,picture,isHost:false,seat,lastSeen:now});
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
      tx.update(ref,{status:'lobby',game:null,updatedAt:now,expiresAt:now+(2*60*60*1000),players});
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
      const players=Array.isArray(data.players)?data.players:[];
      const humanPlayers=players.filter((p)=>String(p.uid||'').startsWith('uid:')||String(p.uid||'').startsWith('guest:'));
      if(humanPlayers.length<2)throw new Error('need players');
        const now=Date.now();
        const game=buildRoomGameState(data);
        const bumped=bumpRoomPlayerLastSeen(players,uid,now);
        const nextPlayers=bumped.changed?bumped.players:data.players;
        tx.update(ref,{status:'playing',game,updatedAt:now,gameVersion:Number(data.gameVersion||0)+1,players:nextPlayers});
      });
  }catch(err){
    console.error('restart room failed',err);
    const msg=String(err?.message??'');
    if(msg.includes('need players'))setSoloStatus(t('roomNeedPlayers'));
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
  state.showLogSheet=false;
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
  if(state.language==='en'){
    return{
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
    };
  }
  if(state.language==='fr'){
    return{
      close:'Fermer',
      headingDesc:'En fin de manche, chaque perdant est pénalisé selon ses cartes restantes puis multiplié par les conditions. Le gagnant reçoit la somme totale.',
      baseTitle:'Score de base',
      mulTitle:'Multiplicateurs',
      summary:'Formule : déduction de base x multiplicateur total. Le gagnant reçoit la somme des déductions.',
      tableHeaders:['Cartes restantes','Multiplicateur','Déduction'],
      tableRows:[
        ['1-9','x1','cartes restantes x1'],
        ['10-12','x2','cartes restantes x2'],
        ['13','x3','13 x3']
      ],
      mulTableHeaders:['Condition','Multiplicateur','Règle'],
      chaoTableHeaders:['Cartes restantes','Multiplicateur','Nom'],
      chaoTableRows:[
        ['8-9','x2','Chao deux'],
        ['10-11','x3','Chao trois'],
        ['12','x4','Chao quatre'],
        ['13','x5','Grand chao']
      ],
      anyTwo:'Avoir un 2 (♦️2/♣️2/♥️2/♠️2) applique x2.',
      topTwo:'Avoir le ♠️2 (top 2) ajoute un x2.',
      stack:'Si plusieurs conditions s’appliquent, les multiplicateurs se cumulent.'
    };
  }
  if(state.language==='de'){
    return{
      close:'Schließen',
      headingDesc:'Am Rundenende wird jeder Verlierer nach Restkarten abgezogen und mit Bedingungen multipliziert. Der Gewinner erhält die Summe.',
      baseTitle:'Grundwertung',
      mulTitle:'Multiplikatoren',
      summary:'Formel: Grundabzug x Gesamt‑Multiplikator. Der Gewinner erhält die Summe der Abzüge.',
      tableHeaders:['Restkarten','Multiplikator','Abzug'],
      tableRows:[
        ['1-9','x1','Restkarten x1'],
        ['10-12','x2','Restkarten x2'],
        ['13','x3','13 x3']
      ],
      mulTableHeaders:['Bedingung','Multiplikator','Regel'],
      chaoTableHeaders:['Restkarten','Multiplikator','Name'],
      chaoTableRows:[
        ['8-9','x2','Doppelt'],
        ['10-11','x3','Dreifach'],
        ['12','x4','Vierfach'],
        ['13','x5','Groß']
      ],
      anyTwo:'Ein 2 (♦️2/♣️2/♥️2/♠️2) ergibt x2.',
      topTwo:'Ein ♠️2 (Top 2) gibt zusätzlich x2.',
      stack:'Mehrere Bedingungen werden multipliziert.'
    };
  }
  if(state.language==='es'){
    return{
      close:'Cerrar',
      headingDesc:'Al final de la ronda, cada perdedor pierde según cartas restantes y se multiplica por condiciones. El ganador recibe la suma.',
      baseTitle:'Puntuación base',
      mulTitle:'Multiplicadores',
      summary:'Fórmula: deducción base x multiplicador total. El ganador recibe la suma de deducciones.',
      tableHeaders:['Cartas restantes','Multiplicador','Deducción'],
      tableRows:[
        ['1-9','x1','cartas restantes x1'],
        ['10-12','x2','cartas restantes x2'],
        ['13','x3','13 x3']
      ],
      mulTableHeaders:['Condición','Multiplicador','Regla'],
      chaoTableHeaders:['Cartas restantes','Multiplicador','Nombre'],
      chaoTableRows:[
        ['8-9','x2','Chao dos'],
        ['10-11','x3','Chao tres'],
        ['12','x4','Chao cuatro'],
        ['13','x5','Chao grande']
      ],
      anyTwo:'Tener un 2 (♦️2/♣️2/♥️2/♠️2) aplica x2.',
      topTwo:'Tener el ♠️2 (top 2) añade x2.',
      stack:'Si se cumplen varias condiciones, los multiplicadores se acumulan.'
    };
  }
  if(state.language==='ja'){
    return{
      close:'閉じる',
      headingDesc:'ラウンド終了時、各敗者は残り枚数に応じた基本減点にペナルティ倍率を掛けます。勝者は全敗者の合計減点を得ます。',
      baseTitle:'基本得点',
      mulTitle:'倍率ペナルティ',
      summary:'各敗者の減点：基本減点 x 総倍率。勝者は全敗者の合計減点を獲得します。',
      tableHeaders:['残り枚数','基本倍率','基本減点'],
      tableRows:[
        ['1-9','x1','残り枚数 x1'],
        ['10-12','x2','残り枚数 x2'],
        ['13','x3','13 x3']
      ],
      mulTableHeaders:['条件','倍率','ルール'],
      chaoTableHeaders:['残り枚数','倍率','名称'],
      chaoTableRows:[
        ['8-9','x2','チャオ2'],
        ['10-11','x3','チャオ3'],
        ['12','x4','チャオ4'],
        ['13','x5','ビッグ・チャオ']
      ],
      anyTwo:'2（♦️2/♣️2/♥️2/♠️2）を所持していると x2。',
      topTwo:'♠️2（トップ2）を所持していると追加で x2。',
      stack:'複数条件が当てはまる場合、倍率は掛け合わせます。'
    };
  }
  return{
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
  const lang=state.language==='en'?'en':state.language==='zh-HK'?'zh-HK':'';
  if(!lang)return false;
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
    const ttsOnlyLang=!(state.language==='zh-HK'||state.language==='en');
    const useTts=Boolean(meta?.forceTts)||ttsOnlyLang;
    const useRecorded=!ttsOnlyLang&&(calloutVoiceMode==='auto'||calloutVoiceMode==='recorded');
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
    const femaleHint=/(female|woman|girl|zira|samantha|victoria|karen|aria|ava|alloy|helena|sabina|dalia|paulina|monica|laura|denise|julie|amelie|hedda|katja|haruka|kyoko|ayumi|nanami|sayaka|ting[-\s]?ting|sin[-\s]?ji|sinji|mei[-\s]?jia|xiaoxiao|xiaoyi|xiaomeng|xiaohan|jia[-\s]?yi|yi[-\s]?ting|tracy|hiumaan|standard[-_\s]?a|standard[-_\s]?c|neural[-_\s]?a|neural[-_\s]?c|yue[-_\s]?hk[-_\s]?(female|a|c))/i;
    const maleHint=/(male|\bman\b|boy|david|alex|daniel|fred|jorge|pablo|raul|diego|carlos|henri|thomas|stefan|klaus|ichiro|otoya|takumi|lee|jun[-\s]?jie|wei|ming|yunxi|yunyang|xiaoming|xiaogang|james|tom|kevin|danny|hiugaai|wanlung|aasing|standard[-_\s]?b|standard[-_\s]?d|neural[-_\s]?b|neural[-_\s]?d|yue[-_\s]?hk[-_\s]?(male|b|d))/i;
    const voiceMeta=(v)=>`${v?.name||''} ${v?.voiceURI||''} ${v?.lang||''}`;
    const isFemaleVoice=(v)=>femaleHint.test(voiceMeta(v))&&!maleHint.test(voiceMeta(v));
    const isMaleVoice=(v)=>maleHint.test(voiceMeta(v))&&!femaleHint.test(voiceMeta(v));
    const byLangPrefixes=(voices,prefixes)=>voices.filter((v)=>prefixes.some((p)=>String(v.lang??'').toLowerCase().startsWith(p)));
    const speechLangMeta=(()=>{
      if(state.language==='fr')return{tts:'fr-FR',prefixes:['fr']};
      if(state.language==='de')return{tts:'de-DE',prefixes:['de']};
      if(state.language==='es')return{tts:'es-ES',prefixes:['es']};
      if(state.language==='en')return{tts:'en-US',prefixes:['en']};
      if(state.language==='ja')return{tts:'ja-JP',prefixes:['ja']};
      return{tts:'yue-HK',prefixes:['yue','zh-hk','zh-hant-hk']};
    })();
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
      const langPool=state.language==='zh-HK'
        ?source.filter((v)=>isCantoneseVoice(v)&&!isMandarinVoice(v))
        :byLangPrefixes(source,speechLangMeta.prefixes);
      const set=langPool.filter((v)=>!isMandarinVoice(v));
      if(!set.length)return null;
      if(g==='female')return set.find(isFemaleVoice) ?? set.find((v)=>!isMaleVoice(v)) ?? null;
      return set.find(isMaleVoice) ?? set.find((v)=>!isFemaleVoice(v)) ?? null;
    };
    const chooseAnyCantonese=(voices)=>{
      const source=voices??[];
      const set=source.filter((v)=>isCantoneseVoice(v)&&!isMandarinVoice(v));
      return set[0]??null;
    };
    const chooseFallbackVoice=(voices)=>{
      const source=voices??[];
      if(!source.length)return null;
      if(state.language==='zh-HK'){
        const cantonese=source.find((v)=>isCantoneseVoice(v));
        if(cantonese)return cantonese;
        const mandarin=source.find((v)=>isMandarinVoice(v));
        if(mandarin)return mandarin;
      }
      const locale=source.find((v)=>byLangPrefixes([v],speechLangMeta.prefixes).length);
      return locale??source[0]??null;
    };
    const speakNow=()=>{
      if(speakSeq!==calloutSpeakSeq)return;
      const emojiPattern=/[\uD83C-\uDBFF\uDC00-\uDFFF]/g;
      const spokenMsg=msg
        .replace(emojiPattern,'')
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
        if(state.language==='zh-HK'){
          voice=chooseAnyCantonese(voices);
        }else{
          voice=byLangPrefixes(voices,speechLangMeta.prefixes)[0]??null;
        }
        if(!voice&&state.language==='en'&&isIOSDevice())voice=voices[0]??null;
        if(!voice)voice=chooseFallbackVoice(voices);
        if(!voice){playCalloutToneFallback();return;}
        u.pitch=Math.max(u.pitch,1.18);
      }else if(!voice){
        if(state.language==='zh-HK')voice=chooseAnyCantonese(voices);
        if(isIOSDevice()){
          const localeVoice=voices.find((v)=>byLangPrefixes([v],speechLangMeta.prefixes).length);
          if(!voice)voice=localeVoice??(state.language==='en'?(voices[0]??null):null);
        }
        if(!voice)voice=chooseFallbackVoice(voices);
        if(!voice){playCalloutToneFallback();return;}
      }
      const estimatedMs=Math.max(120,Math.min(420,Math.round((msg.length*62)/Math.max(0.55,u.rate))));
      calloutSpeechActive=true;
      calloutSpeechUntil=Date.now()+estimatedMs;
      u.onend=()=>{if(speakSeq!==calloutSpeakSeq)return;calloutSpeechActive=false;calloutSpeechUntil=0;calloutSpeechEndedAt=Date.now();calloutResumePending=true;maybeRunSoloAi();};
      u.onerror=()=>{if(speakSeq!==calloutSpeakSeq)return;calloutSpeechActive=false;calloutSpeechUntil=0;calloutSpeechEndedAt=Date.now();calloutResumePending=true;maybeRunSoloAi();};
      u.voice=voice;
      u.lang=String(voice.lang||speechLangMeta.tts);
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
function updateGoogleLocale(){
  const lang=state.language==='en'?'en':'zh_HK';
  const host=document.getElementById('g_id_onload');
  if(host)host.setAttribute('data-locale',lang);
}
function reloadGoogleScriptForLocale(){
  if(googleScriptReloading)return;
  googleScriptReloading=true;
  googleIdentityInitialized=false;
  updateGoogleLocale();
  try{window.google?.accounts?.id?.cancel?.();}catch{}
  const existing=document.querySelector('script[src*="accounts.google.com/gsi/client"]');
  if(existing)existing.remove();
  const lang=state.language==='en'?'en':'zh-HK';
  const script=document.createElement('script');
  script.src=`https://accounts.google.com/gsi/client?hl=${lang}`;
  script.async=true;
  script.onload=()=>{googleScriptReloading=false;renderGoogleInline();};
  script.onerror=()=>{googleScriptReloading=false;};
  document.head.appendChild(script);
}
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
        window.google.accounts.id.renderButton(gSlot,{theme:'filled_blue',size:'medium',text:'signin_with',shape:'square',logo_alignment:'left',width:140});
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
  const msg=t('webTooSmall')
    .replace('{{w}}',String(w))
    .replace('{{h}}',String(h))
    .replace('{{minW}}',String(MIN_WEB_GAME_WIDTH))
    .replace('{{minH}}',String(MIN_WEB_GAME_HEIGHT));
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
  app.innerHTML=`<section class="orientation-block"><div class="orientation-card"><h2>${esc(t('portraitTitle'))}</h2><p>${esc(t('portraitBody'))}</p></div></section>`;
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
  if(threat){
    if(play.eval.count>1){
      score+=play.eval.count*10;
      if(maxRank<=9)score+=8;
    }else{
      const single=play.cards[0];
      if(single&&!isHighestSingle(single))score-=12;
    }
  }
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
  const winning=legal.filter((p)=>hand.length-(p.cards?.length||0)===0);
  if(winning.length){
    winning.sort((a,b)=>comparePower(a.eval.power,b.eval.power));
    return winning[0];
  }
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
  const text=t('must3');
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
function startSoloGame(){randomizeNpcColors();const botProfiles=randomBotProfiles();const p=[{name:state.home.name||t('name'),gender:state.home.gender==='female'?'female':'male',hand:[],isHuman:true},{name:botProfiles[0].name,gender:botProfiles[0].gender,hand:[],isHuman:false},{name:botProfiles[1].name,gender:botProfiles[1].gender,hand:[],isHuman:false},{name:botProfiles[2].name,gender:botProfiles[2].gender,hand:[],isHuman:false}];const deck=shuffle(createDeck());p.forEach((x)=>{x.hand=deck.splice(0,13).sort(cmpCard);});const start=p.findIndex((x)=>x.hand.some((c)=>c.rank===0&&c.suit===0));const totals=Array.isArray(state.solo.totals)&&state.solo.totals.length===4?[...state.solo.totals]:[5000,5000,5000,5000];state.solo={players:p,botProfiles:botProfiles.map((bp)=>({name:bp.name,gender:bp.gender})),botNames:botProfiles.map((bp)=>bp.name),totals,currentSeat:start,lastPlay:null,passStreak:0,isFirstTrick:true,gameOver:false,status:'',systemLog:[],history:[],aiDifficulty:state.home.aiDifficulty,lastCardBreach:null,roundSummary:null};setSoloStatus(`${p[start].name} ${t('start')}`);state.selected.clear();state.recommendation=null;state.logTouched=false;state.showLog=false;state.showLogSheet=false;state.screen='game';state.home.mode='solo';state.home.showIntro=false;state.home.showLeaderboard=false;state.showScoreGuide=false;calloutGateUntilPlay=true;playSound('start');triggerMust3LeadCallout(state.solo,0);render();maybeRunSoloAi();}
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
  state.showLogSheet=false;
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
  if(!sound.enabled)return;
  try{
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
  if(kind.startsWith('emote-')){
    playTone(640,0.035,'sine',0.012);
    playTone(880,0.03,'sine',0.008,0.03);
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
    const locale=state.language==='en'?'en-US':state.language==='ja'?'ja-JP':'zh-HK';
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
    const locale=state.language==='en'?'en-US':state.language==='ja'?'ja-JP':'zh-HK';
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
    const opponentName=p.rawName||p.name;
    const opponentAttr=p.isBot?` data-opponent-name="${esc(opponentName)}"`:'';
    const namecardBtn=p.isBot?`<button type="button" class="seat-namecard" data-opponent-name="${esc(opponentName)}" aria-label="${esc(t('profile'))}">🪪</button>`:'';
    return`<span class="mobile-opponent-name ${(!gameOver&&currentSeat===p.seat)?'active':''}" style="--player-color:${playerColorByViewClass(p.cls)};"${opponentAttr}><img class="player-avatar mini" src="${avatarSrc}" alt="${esc(p.name)}"${botNameAttr}/><span class="seat-name-text">${esc(p.name)}</span><span class="mobile-seat-tag">${seatShortByViewClass(p.cls)}</span>${namecardBtn}</span>`;
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
  const roomPictureBySeat=(()=>{
    const list=isRoom&&state.room.data?Array.isArray(state.room.data.players)?state.room.data.players:[]:[];
    const entries=list.map((p)=>[Number.isFinite(Number(p?.seat))?Number(p.seat):-1,String(p?.picture||'').trim()]);
    return new Map(entries.filter((entry)=>entry[0]!==-1&&entry[1]));
  })();
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
  const selfSeatNum=Number.isFinite(Number(v.selfSeat))?Number(v.selfSeat):null;
  const showConfetti=selfSeatNum!==null&&winner.seat===selfSeatNum;
  const deductions=v.roundSummary?.deductions??arr.map((p)=>p.seat===winner.seat?0:calcPenaltyDetail(v.revealedHands?.[p.seat]??[]).deduction);
  const winnerGain=Number(v.roundSummary?.winnerGain??deductions.reduce((sum,vv)=>sum+vv,0));
  const detailBySeat=v.roundSummary?.details??arr.map((p)=>p.seat===winner.seat?{remain:0,base:0,multiplier:1,deduction:0,anyTwo:false,topTwo:false,chaoMultiplier:1,chaoKey:''}:calcPenaltyDetail(v.revealedHands?.[p.seat]??[]));
  const rows=arr.map((p)=>{
    const isWinner=p.seat===winner.seat;
    const isSelf=p.seat===v.selfSeat;
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
    const selfPic=isSelf?authPictureUrl():'';
    const fallbackPicture=snapPicture||roomPictureBySeat.get(p.seat)||String(p.picture||'').trim();
    const avatarSrc=(selfPic||fallbackPicture)
      ?authPictureUrlFrom(selfPic||fallbackPicture)
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
    ${showConfetti?`<div class="confetti-layer result-confetti" aria-hidden="true"></div>`:''}
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
function renderLangMenu(id){
  const items=LANGUAGE_OPTIONS.map((opt)=>{
    const label=LANGUAGE_NATIVE_LABEL[opt.value]??I18N[state.language]?.[opt.labelKey]??opt.value;
    const selected=state.language===opt.value;
    return `<button class="lang-menu-item" type="button" role="option" data-lang="${opt.value}" aria-selected="${selected?'true':'false'}">${label}</button>`;
  }).join('');
  const shortLabel=state.language==='zh-HK'?'中':state.language==='fr'?'FR':state.language==='de'?'DE':state.language==='es'?'ES':state.language==='ja'?'JA':'EN';
  const globeSvg=`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.7 9h-3.2a15.8 15.8 0 0 0-1.1-5.1 8.03 8.03 0 0 1 4.3 5.1Zm-7.7-7a13.6 13.6 0 0 1 1.8 6H10.2a13.6 13.6 0 0 1 1.8-6Zm-5.4 7h-3.2a8.03 8.03 0 0 1 4.3-5.1 15.8 15.8 0 0 0-1.1 5.1Zm0 2a15.8 15.8 0 0 0 1.1 5.1A8.03 8.03 0 0 1 3.4 13h3.2Zm5.4 7a13.6 13.6 0 0 1-1.8-6h3.6a13.6 13.6 0 0 1-1.8 6Zm3.6-7h3.2a8.03 8.03 0 0 1-4.3 5.1 15.8 15.8 0 0 0 1.1-5.1Z"/></svg>`;
  return `<div class="lang-menu" data-lang-menu="1" data-lang-menu-id="${id}"><button id="${id}" class="lang-menu-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="${t('lang')}"><span class="lang-icon" aria-hidden="true">${globeSvg}</span><span class="lang-short">${shortLabel}</span></button><div class="lang-menu-pop" role="listbox" aria-label="${t('lang')}" data-lang-menu-owner="${id}">${items}</div></div>`;
}
let langMenuDocBound=false;
let openLangMenu=null;
const langMenuPortals=new WeakMap();
function positionLangMenuPop(trigger,pop){
  const rect=trigger.getBoundingClientRect();
  const padding=8;
  pop.style.display='grid';
  const popRect=pop.getBoundingClientRect();
  let left=rect.right-popRect.width;
  left=Math.max(padding,Math.min(left,window.innerWidth-popRect.width-padding));
  let top=rect.bottom+6;
  if(top+popRect.height>window.innerHeight-padding){
    top=rect.top-popRect.height-6;
  }
  top=Math.max(padding,top);
  pop.style.left=`${left}px`;
  pop.style.top=`${top}px`;
  pop.style.right='auto';
  pop.style.bottom='auto';
}
function openLangMenuPop(menu,trigger,pop){
  if(!langMenuPortals.has(pop)){
    langMenuPortals.set(pop,{parent:pop.parentElement,next:pop.nextSibling});
  }
  document.body.appendChild(pop);
  pop.style.position='fixed';
  pop.style.zIndex='20000';
  positionLangMenuPop(trigger,pop);
}
function closeLangMenuPop(menu){
  const owner=menu?.dataset?.langMenuId;
  const pop=menu?.querySelector?.('.lang-menu-pop')||document.querySelector(`.lang-menu-pop[data-lang-menu-owner="${owner}"]`);
  if(!(pop instanceof HTMLElement))return;
  pop.style.display='none';
  pop.style.left='';
  pop.style.top='';
  pop.style.right='';
  pop.style.bottom='';
  pop.style.position='';
  pop.style.zIndex='';
  const portal=langMenuPortals.get(pop);
  if(portal?.parent){
    if(portal.next&&portal.next.parentElement===portal.parent){
      portal.parent.insertBefore(pop,portal.next);
    }else{
      portal.parent.appendChild(pop);
    }
  }
}
function closeLangMenu(){
  if(!openLangMenu)return;
  openLangMenu.classList.remove('open');
  const trigger=openLangMenu.querySelector('.lang-menu-trigger');
  if(trigger)trigger.setAttribute('aria-expanded','false');
  closeLangMenuPop(openLangMenu);
  openLangMenu=null;
}
function setLanguage(value,{reloadGoogle=false}={}){
  if(!LANGUAGE_OPTIONS.some((opt)=>opt.value===value))return;
  state.language=value;
  relabelSoloBots();
  if(reloadGoogle)reloadGoogleScriptForLocale();
  render();
}
function bindLangMenu(root,{reloadGoogle=false}={}){
  if(!root)return;
  const menus=root.matches?.('.lang-menu')?[root]:[...root.querySelectorAll('.lang-menu')];
  menus.forEach((menu)=>{
    if(menu.dataset.langBound)return;
    menu.dataset.langBound='1';
    const trigger=menu.querySelector('.lang-menu-trigger');
    const pop=menu.querySelector('.lang-menu-pop');
    if(!(trigger instanceof HTMLElement)||!(pop instanceof HTMLElement))return;
    trigger.addEventListener('click',(ev)=>{
      ev.stopPropagation();
      if(openLangMenu&&openLangMenu!==menu)closeLangMenu();
      const isOpen=menu.classList.toggle('open');
      trigger.setAttribute('aria-expanded',isOpen?'true':'false');
      openLangMenu=isOpen?menu:null;
      if(isOpen){
        openLangMenuPop(menu,trigger,pop);
      }else{
        closeLangMenuPop(menu);
      }
    });
    pop.querySelectorAll('.lang-menu-item').forEach((item)=>item.addEventListener('click',(ev)=>{
      ev.stopPropagation();
      const value=String(item.getAttribute('data-lang')||'');
      closeLangMenu();
      setLanguage(value,{reloadGoogle});
    }));
  });
  if(langMenuDocBound)return;
  langMenuDocBound=true;
  document.addEventListener('click',()=>{closeLangMenu();});
  document.addEventListener('keydown',(ev)=>{if(ev.key==='Escape')closeLangMenu();});
}
function backAssetFile(value){
  const found=BACK_OPTIONS.find((x)=>x.value===value);
  return found?.file??'back-red.png';
}
function renderBackCombo(){
  return BACK_OPTIONS.map((opt)=>`<button class="combo-btn ${state.home.backColor===opt.value?'active':''}" data-value="${opt.value}" aria-label="${opt.label[state.language]??opt.value}"><img class="combo-back-preview" src="${withBase(`card-assets/${opt.file}`)}" alt="${opt.label[state.language]??opt.value}"/></button>`).join('');
}
function renderBackCarouselItems(){
  const items=BACK_OPTIONS.map((opt)=>`<button class="combo-btn ${state.home.backColor===opt.value?'active':''}" data-value="${opt.value}" aria-label="${opt.label[state.language]??opt.value}"><img class="combo-back-preview" src="${withBase(`card-assets/${opt.file}`)}" alt="${opt.label[state.language]??opt.value}" draggable="false"/></button>`).join('');
  return `${items}${items}${items}`;
}
function renderBackCarousel(comboId){
  return `<div class="cardback-carousel" data-carousel="${comboId}"><button class="carousel-btn prev" type="button" data-carousel-dir="prev" aria-label="${state.language==='zh-HK'?'上一個':'Previous'}">‹</button><div class="option-combo cardback-combo cardback-track" id="${comboId}" data-carousel-track="1"><div class="cardback-rail">${renderBackCarouselItems()}</div></div><button class="carousel-btn next" type="button" data-carousel-dir="next" aria-label="${state.language==='zh-HK'?'下一個':'Next'}">›</button></div>`;
}
let topbarDelegateBound=false;
let roomTopMetaLayoutBound=false;
let logSheetSwipeBound=false;
let logSwipeActive=false;
let logSwipeStartX=0;
let logSwipeStartY=0;
let logSwipeStartAt=0;
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
  const btn=t.closest?.('#game-intro-toggle,#score-guide-toggle,#game-lb-toggle,#game-log-fab');
  if(!btn)return;
  if(btn.id==='game-intro-toggle'){state.home.showIntro=true;render();return;}
  if(btn.id==='score-guide-toggle'){state.showScoreGuide=true;render();return;}
  if(btn.id==='game-lb-toggle'){state.home.showLeaderboard=true;refreshLeaderboard(true);render();return;}
  if(btn.id==='game-log-fab'){
    if(btn.getAttribute('data-ignore-click')==='1'){
      btn.setAttribute('data-ignore-click','0');
      return;
    }
    state.showLogSheet=!state.showLogSheet;
    render();
    return;
  }
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
    calloutVoiceMode=v==='on'?'auto':'off';
    markComboActive(comboId,v);
    document.querySelectorAll('.runtime-diagnostic-inline').forEach((el)=>{el.textContent=runtimeDiagnosticsText();});
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
function bindBackCarousel(comboId){
  const viewport=document.getElementById(comboId);
  if(!(viewport instanceof HTMLElement))return;
  if(viewport.dataset.carouselBound)return;
  viewport.dataset.carouselBound='1';
  const wrapper=viewport.closest('.cardback-carousel');
  if(!(wrapper instanceof HTMLElement))return;
  const rail=viewport.querySelector('.cardback-rail');
  if(!(rail instanceof HTMLElement))return;
  const optionCount=BACK_OPTIONS.length;
  const getButtons=()=>[...rail.querySelectorAll('.combo-btn')];
  const getSectionWidth=()=>{
    const buttons=getButtons();
    if(buttons.length<optionCount*2)return 0;
    const first=buttons[0];
    const last=buttons[optionCount-1];
    if(!(first instanceof HTMLElement)||!(last instanceof HTMLElement))return 0;
    return (last.offsetLeft+last.offsetWidth)-first.offsetLeft;
  };
  let offsetX=0;
  let dragActive=false;
  let dragMoved=false;
  let dragStartX=0;
  let dragStartY=0;
  let dragStartOffset=0;
  let velocity=0;
  let lastMoveAt=0;
  let lastMoveX=0;
  let momentumRaf=0;
  let snapTimer=0;
  let rafId=0;
  let pendingUpdate=false;
  let pendingMove=false;
  let pendingOffsetX=0;
  let rafMove=0;
  let lastSelectedValue='';
  const normalizeOffset=()=>{
    const section=getSectionWidth();
    if(!section)return;
    while(offsetX<-section*2)offsetX+=section;
    while(offsetX>0)offsetX-=section;
  };
  const applyOffset=(animate=false)=>{
    rail.style.transition=animate?'transform 120ms cubic-bezier(.2,.8,.2,1)':'none';
    rail.style.transform=`translate3d(${offsetX}px,0,0)`;
  };
  const findNearestButton=(preferredValue='')=>{
    const buttons=getButtons();
    if(!buttons.length)return null;
    const centerX=viewport.clientWidth/2;
    let bestBtn=null;
    let bestDist=Infinity;
    buttons.forEach((btn)=>{
      if(!(btn instanceof HTMLElement))return;
      const btnValue=btn.getAttribute('data-value')||'';
      if(preferredValue&&btnValue!==preferredValue)return;
      const btnCenter=btn.offsetLeft+btn.offsetWidth/2+offsetX;
      const dist=Math.abs(btnCenter-centerX);
      if(dist<bestDist){
        bestDist=dist;
        bestBtn=btn;
      }
    });
    return bestBtn;
  };
  const updateSelectionFromOffset=(preferredValue='',forceScale=false)=>{
    const bestBtn=findNearestButton(preferredValue);
    const value=bestBtn?.getAttribute('data-value')||'';
    if(value&&value!==lastSelectedValue){
      state.home.backColor=value;
      markComboActive('back-combo-left',value);
      markComboActive('back-combo-right',value);
      markComboActive('config-back-combo',value);
      lastSelectedValue=value;
      forceScale=true;
    }
    if(forceScale&&value){
      const buttons=getButtons();
      buttons.forEach((btn)=>{
        const btnValue=btn.getAttribute('data-value');
        const isSelected=btnValue===value;
        const scale=isSelected?1:0.86;
        btn.style.transform=`scale(${scale})`;
      });
    }
  };
  const scheduleSelectionUpdate=(forceScale=false)=>{
    pendingUpdate=true;
    if(rafId)return;
    rafId=requestAnimationFrame(()=>{
      rafId=0;
      if(!pendingUpdate)return;
      pendingUpdate=false;
      updateSelectionFromOffset('',forceScale);
    });
  };
  const scheduleOffsetApply=()=>{
    pendingMove=true;
    if(rafMove)return;
    rafMove=requestAnimationFrame(()=>{
      rafMove=0;
      if(!pendingMove)return;
      pendingMove=false;
      offsetX=pendingOffsetX;
      normalizeOffset();
      applyOffset(false);
      scheduleSelectionUpdate(false);
    });
  };
  const snapToNearest=()=>{
    updateSelectionFromOffset('',true);
    const target=findNearestButton(state.home.backColor);
    if(target)centerToButton(target,true,state.home.backColor);
  };
  const stopMomentum=()=>{
    if(momentumRaf){
      cancelAnimationFrame(momentumRaf);
      momentumRaf=0;
    }
  };
  const startMomentum=()=>{
    stopMomentum();
    let lastFrame=performance.now();
    const step=(now)=>{
      const dt=Math.min(32,now-lastFrame);
      lastFrame=now;
      offsetX+=velocity*dt;
      velocity*=0.94;
      normalizeOffset();
      applyOffset(false);
      scheduleSelectionUpdate(false);
      if(Math.abs(velocity)<0.02){
        momentumRaf=0;
        snapToNearest();
        return;
      }
      momentumRaf=requestAnimationFrame(step);
    };
    momentumRaf=requestAnimationFrame(step);
  };
  const centerToButton=(btn,animate=true,preferredValue='',allowNormalize=false)=>{
    if(!(btn instanceof HTMLElement))return;
    if(snapTimer){
      window.clearTimeout(snapTimer);
      snapTimer=0;
    }
    const centerX=viewport.clientWidth/2;
    const btnCenter=btn.offsetLeft+btn.offsetWidth/2;
    offsetX=centerX-btnCenter;
    if(allowNormalize)normalizeOffset();
    applyOffset(animate);
    updateSelectionFromOffset(preferredValue);
    if(animate&&preferredValue){
      snapTimer=window.setTimeout(()=>{
        centerToMiddleValue(preferredValue);
        snapTimer=0;
      },190);
    }
  };
  const centerToIndex=(index,animate=true,allowNormalize=false)=>{
    const buttons=getButtons();
    const btn=buttons[index];
    if(btn)centerToButton(btn,animate,'',allowNormalize);
  };
  const centerToMiddleValue=(value)=>{
    const buttons=getButtons();
    if(!buttons.length)return;
    const middleIndex=buttons.findIndex((btn,idx)=>idx>=optionCount&&idx<optionCount*2&&btn.getAttribute('data-value')===value);
    if(middleIndex>=0)centerToIndex(middleIndex,false,true);
  };
  const centerToValue=(value,animate=true)=>{
    const buttons=getButtons();
    if(!buttons.length)return;
    const centerX=viewport.clientWidth/2;
    let bestBtn=null;
    let bestDelta=Infinity;
    buttons.forEach((btn)=>{
      if(btn.getAttribute('data-value')!==value)return;
      const btnCenter=btn.offsetLeft+btn.offsetWidth/2;
      const targetOffset=centerX-btnCenter;
      const delta=Math.abs(targetOffset-offsetX);
      if(delta<bestDelta){
        bestDelta=delta;
        bestBtn=btn;
      }
    });
    if(bestBtn)centerToButton(bestBtn,animate,value);
  };
  const getNextValue=(dir)=>{
    const current=state.home.backColor;
    const currentIndex=BACK_OPTIONS.findIndex((opt)=>opt.value===current);
    if(currentIndex<0)return BACK_OPTIONS[0]?.value;
    const delta=dir==='prev'?-1:1;
    const nextIndex=(currentIndex+delta+optionCount)%optionCount;
    return BACK_OPTIONS[nextIndex]?.value;
  };
  wrapper.querySelector('[data-carousel-dir="prev"]')?.addEventListener('click',()=>{
    if(dragActive)return;
    const nextValue=getNextValue('prev');
    if(!nextValue)return;
    centerToValue(nextValue,true);
  });
  wrapper.querySelector('[data-carousel-dir="next"]')?.addEventListener('click',()=>{
    if(dragActive)return;
    const nextValue=getNextValue('next');
    if(!nextValue)return;
    centerToValue(nextValue,true);
  });
  viewport.addEventListener('pointerdown',(ev)=>{
    if(!(ev.target instanceof HTMLElement))return;
    const onCard=ev.target.closest?.('.combo-btn');
    if(!onCard)return;
    viewport.setPointerCapture?.(ev.pointerId);
    stopMomentum();
    dragActive=true;
    dragMoved=false;
    dragStartX=ev.clientX;
    dragStartY=ev.clientY;
    dragStartOffset=offsetX;
    lastMoveAt=performance.now();
    lastMoveX=ev.clientX;
    velocity=0;
    applyOffset(false);
    if(snapTimer){
      window.clearTimeout(snapTimer);
      snapTimer=0;
    }
  });
  viewport.addEventListener('pointermove',(ev)=>{
    if(!dragActive)return;
    const dx=ev.clientX-dragStartX;
    const dy=Math.abs(ev.clientY-dragStartY);
    if(Math.abs(dx)>6||dy>6)dragMoved=true;
    const now=performance.now();
    const dt=Math.max(8,now-lastMoveAt);
    const stepX=ev.clientX-lastMoveX;
    velocity=velocity*0.8+(stepX/dt)*0.2;
    lastMoveAt=now;
    lastMoveX=ev.clientX;
    pendingOffsetX=dragStartOffset+dx;
    scheduleOffsetApply();
  });
  const endDrag=()=>{
    if(!dragActive)return;
    dragActive=false;
    if(pendingMove){
      offsetX=pendingOffsetX;
      normalizeOffset();
      applyOffset(false);
      pendingMove=false;
    }
    if(dragMoved&&Math.abs(velocity)>0.02){
      startMomentum();
      return;
    }
    snapToNearest();
  };
  viewport.addEventListener('pointerup',endDrag,{passive:true});
  viewport.addEventListener('pointercancel',endDrag,{passive:true});
  viewport.addEventListener('pointerleave',endDrag,{passive:true});
  viewport.addEventListener('click',(ev)=>{
    if(dragMoved)return;
    if(!(ev.target instanceof HTMLElement))return;
    const preview=ev.target.closest?.('.combo-back-preview');
    if(!preview)return;
    const btn=preview.closest?.('.combo-btn');
    if(!(btn instanceof HTMLElement))return;
    const value=btn.getAttribute('data-value');
    if(!value)return;
    centerToButton(btn,true,value);
  });
  viewport.addEventListener('dragstart',(ev)=>{
    ev.preventDefault();
  });
  requestAnimationFrame(()=>{
    centerToMiddleValue(state.home.backColor);
    updateSelectionFromOffset(state.home.backColor,true);
  });
}
function bindEmoteDisplayToggle(comboId){
  document.querySelectorAll(`#${comboId} .combo-btn`).forEach((btn)=>btn.addEventListener('click',()=>{
    const v=String(btn.getAttribute('data-value')??'');
    if(v!=='on'&&v!=='off')return;
    emoteDisplayEnabled=v==='on';
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
  const roomPrivate=Boolean(roomData?.isPrivate);
  const roomStatus=String(roomData?.status??'');
  const roomStarting=roomStatus==='starting';
  const roomGamePlayers=(roomStatus==='finished'&&Array.isArray(roomData?.game?.players))?roomData.game.players:null;
  const roomSeatMap=new Map(roomPlayers.map((p)=>[Number(p.seat),p]));
  const gameSeatMap=roomGamePlayers?new Map(roomGamePlayers.map((p,i)=>[Number.isFinite(Number(p?.seat))?Number(p.seat):i,p])):null;
  const useGameRoster=roomStatus==='finished'&&Boolean(gameSeatMap);
  const roomStartPending=Boolean(state.room.pendingStart);
  const roomStatusText=(()=>{
    if(roomStatus==='playing')return t('roomStatusPlaying');
    if(roomStatus==='starting')return t('roomStarting');
    if(roomStatus==='finished')return t('roomWaitingHost');
    return roomIsHost?t('roomWaitingReady'):t('roomWaitingHost');
  })();
  const roomStatusLine=roomStatusText;
  const roomStatusBanner=`<div class="room-status-text">${esc(roomStatusLine)}</div>`;
  if(state.home.avatarChoice==='google'){
    state.home.avatarChoice=state.home.gender==='female'?'female':'male';
  }
  const allowOpponents=location.hash==='#opponents';
  if(state.home.showLeaderboard)refreshLeaderboard();
  const homeAvatarSrc=selfAvatarDataUri(state.home.name,'#7aaed8',state.home.gender);
  const cardBackLeft=`<label class="field field-cardback field-cardback-left"><span>${t('cardBack')}</span>${renderBackCarousel('back-combo-left')}</label>`;
  const cardBackRight=`<label class="field field-cardback field-cardback-right"><span>${t('cardBack')}</span>${renderBackCarousel('back-combo-right')}</label>`;
  const aiFieldLeft=`<label class="field field-ai field-ai-left"><span>${t('ai')}</span><div class="option-combo toggle-combo difficulty-combo" id="difficulty-combo-left" style="--difficulty-index:${diffIndex};"><div class="difficulty-pill" aria-hidden="true"></div><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='easy'?'active':''}" data-value="easy">${t('easy')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='normal'?'active':''}" data-value="normal">${t('normal')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='hard'?'active':''}" data-value="hard">${t('hard')}</button></div></label>`;
  const aiFieldRight=`<label class="field field-ai field-ai-right"><span>${t('ai')}</span><div class="option-combo toggle-combo difficulty-combo" id="difficulty-combo-right" style="--difficulty-index:${diffIndex};"><div class="difficulty-pill" aria-hidden="true"></div><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='easy'?'active':''}" data-value="easy">${t('easy')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='normal'?'active':''}" data-value="normal">${t('normal')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='hard'?'active':''}" data-value="hard">${t('hard')}</button></div></label>`;
  const roomErrorHtml=state.room.error?`<div class="hint room-error">${esc(state.room.error)}</div>`:'';
  const loginHint=t('loginToStart');
  const roomLobbyBtnCore=inRoom?'':`<button id="room-lobby-open" class="secondary royal-room-btn" ${signedIn?'':'disabled'}>${t('roomEnter')}</button>`;
  const roomButtonsHtml=roomLobbyBtnCore
    ?(signedIn
      ?roomLobbyBtnCore
      :`<span class="locked-btn" data-lock="${esc(loginHint)}">${roomLobbyBtnCore}<span class="lock-badge" aria-hidden="true">🔒</span><span class="locked-tip">${esc(loginHint)}</span></span>`)
    :'';
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
    const readyControl='';
    const displayName=(roomStatus==='finished'?'':entryName);
    const nameHtml=`<div class="lobby-seat-name">${displayName?esc(displayName):'&nbsp;'}</div>`;
    return`<div class="lobby-seat ${isHost?'host':''} ${offline?'offline':''}">
      <span class="lobby-seat-avatar-wrap"><img class="lobby-seat-avatar" src="${avatarSrc}" alt="${esc(entryName)}"/>${hostBadge}</span>
      ${nameHtml}
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
    :`<span class="hint">${roomStarting?t('roomStarting'):t('roomWaitingHost')}</span>`;
  const roomPendingHint='';
  const roomTitle=t('roomTableTitle');
  const roomLobbyHtml=(inRoom&&roomStatus!=='playing')?`<div class="room-overlay"><div class="room-card room-lobby-card room-card-icon"><div class="room-head"><span class="room-corner-icon" aria-hidden="true">🔢</span><h3>${roomTitle}</h3>${roomHostLine}</div><div class="room-id-center"><span class="room-code">${esc(state.room.code)}</span><button id="room-copy" class="secondary">${t('roomCopy')}</button></div>${roomPrivacyRow}<div class="lobby-table">${roomSeats}</div>${roomErrorHtml}<div class="room-actions">${roomStartControl}${roomPendingHint}<button id="room-leave" class="danger" ${roomStarting?'disabled':''}>${t('roomLeave')}</button></div></div></div>`:'';
  const activeRoomsState=state.home.activeRooms;
  const activeRooms=Array.isArray(activeRoomsState?.rows)?activeRoomsState.rows:[];
  const emptySeats=[0,1,2,3].map(()=>`<div class="room-active-seat empty">+</div>`).join('');
  const createTableCard=`<button class="room-active-card room-create-card" id="room-create-card" type="button"><div class="room-active-code">${t('roomCreate')}</div><div class="room-create-icon room-create-emoji" aria-hidden="true">👩🏻‍💻🧑🏻‍💻</div><span class="room-create-hint">${t('roomCreateHint')}</span><span class="room-create-callout" aria-hidden="true">歡近光臨😀</span></button>`;
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
            return`<div class="lobby-seat lobby-seat-mini ${isHost?'host':''}">
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
          return`<div class="lobby-seat lobby-seat-mini ${isHost?'host':''}">
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
          ?(state.language==='zh-HK'?'輸入代碼即可加入':'Enter room code to join.')
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
  const activeRoomsEmpty=activeRooms.length?'':`<div class="room-active-card room-active-empty" aria-disabled="true"><div class="room-active-code">${t('roomActiveEmpty')}</div><div class="room-active-table">${emptySeats}</div><div class="room-active-info"><div class="room-active-count">0/4</div></div></div>`;
  const hiddenCount=Number(state.home.activeRooms.hiddenCount)||0;
  const hiddenNote=hiddenCount?`<span class="room-active-hidden">Hidden: ${hiddenCount}</span>`:'';
  const refreshCountdownText=state.room.joinOpenCountdown&&state.room.joinOpenCountdown>0
    ?`<span class="room-active-refresh-countdown">${state.room.joinOpenCountdown}s</span>`
    :'';
  const activeRoomsBlock=`<div class="room-active-block"><div class="room-active-head"><span>${t('roomActiveList')}</span>${hiddenNote}<button id="room-active-refresh" class="secondary"><span class="room-active-refresh-label">${state.language==='zh-HK'?'更新':'Refresh'}</span>${refreshCountdownText}</button></div><div class="room-active-grid">${createTableCard}${activeRoomsCards}${activeRoomsEmpty}</div></div>`;
  const roomJoinModal=(!inRoom&&state.room.joinOpen)?`<div class="room-overlay"><div class="room-card room-join-card room-card-icon"><div class="room-head"><span class="room-corner-icon" aria-hidden="true">📍</span><h3>${t('roomLobby')}</h3></div><label class="field"><span>${t('roomCode')}</span><div class="room-code-row"><input id="room-code-input" class="room-input" maxlength="8" placeholder="ABC123"/><button id="room-join-confirm" class="primary">${t('roomJoin')}</button></div></label>${activeRoomsState?.loading?`<div class="hint">...</div>`:activeRoomsBlock}${roomErrorHtml}<div class="room-actions"><button id="room-join-cancel" class="secondary">${t('home')}</button></div></div></div>`:'';
  const soloBtnCore=`<button id="solo-start" class="primary royal-start-btn" ${signedIn?'':'disabled'}>${t('solo')}</button>`;
  const soloBtnHtml=signedIn
    ?soloBtnCore
    :`<span class="locked-btn" data-lock="${esc(loginHint)}">${soloBtnCore}<span class="lock-badge" aria-hidden="true">🔒</span><span class="locked-tip">${esc(loginHint)}</span></span>`;
  app.innerHTML=`<section class="home-wrap royal-home-wrap"><section class="home-panel royal-home-panel"><header class="royal-home-head"><div class="royal-head-actions"><button id="home-intro-toggle" class="secondary">${esc(intro.btnShow)}</button><button id="home-score-guide-toggle" class="secondary">${t('scoreGuide')}</button><button id="home-lb-toggle" class="secondary">${t('lb')}</button>${allowOpponents?`<button id="home-opponents-toggle" class="secondary">${t('opponents')}</button>`:''}${renderLangMenu('home-lang-menu')}</div><div class="royal-title-wrap"><div class="home-logo-block"><img class="title-logo title-logo-home" src="${withBase('title-lockup-home.png')}" alt="鋤大D TRADITIONAL BIG TWO"/></div></div></header><section class="royal-home-body"><div class="home-form-grid"><div class="home-form-col home-form-left home-section"><h3 class="home-section-title">👤 ${t('playerSettings')}</h3><div class="home-profile-card"><div class="home-profile-avatar"><img id="home-avatar-img" src="${homeAvatarSrc}" alt="${esc(state.home.name||t('name'))}"/></div><div class="home-profile-fields"><label class="field field-compact"><span>${t('name')}</span><div class="name-with-google"><input id="name-input" value="${esc(state.home.name)}" maxlength="18"/><div id="google-name-inline"></div></div></label><label class="field field-compact"><div class="option-combo toggle-combo" id="gender-combo"><button class="combo-btn toggle-btn ${state.home.avatarChoice==='male'?'active':''}" data-value="male">${t('male')}</button><button class="combo-btn toggle-btn ${state.home.avatarChoice==='female'?'active':''}" data-value="female">${t('female')}</button></div></label></div></div>${aiFieldLeft}${cardBackLeft}</div><div class="home-form-col home-form-right home-section"><h3 class="home-section-title">⚙️ ${t('systemSettings')}</h3>${aiFieldRight}<label class="field field-sound"><span>${t('audioVoice')}</span><div class="option-combo toggle-combo" id="sound-combo"><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'active':''}" data-value="on" aria-label="${t('soundOn')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M15 9c1.6 1.2 1.6 4.8 0 6"></path><path d="M17.5 7c2.8 2.4 2.8 7.6 0 10"></path></svg></button><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'':'active'}" data-value="off" aria-label="${t('soundOff')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M16 8l4 8"></path><path d="M20 8l-4 8"></path></svg></button></div></label><label class="field field-callout"><span>${t('calloutDisplay')}</span><div class="option-combo toggle-combo" id="callout-display-combo"><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'active':''}" data-value="on">${t('calloutDisplayOn')}</button><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'':'active'}" data-value="off">${t('calloutDisplayOff')}</button></div></label><label class="field field-emote"><span>${t('emoteDisplay')}</span><div class="option-combo toggle-combo" id="emote-display-combo"><button class="combo-btn toggle-btn ${emoteDisplayEnabled?'active':''}" data-value="on">${t('calloutDisplayOn')}</button><button class="combo-btn toggle-btn ${emoteDisplayEnabled?'':'active'}" data-value="off">${t('calloutDisplayOff')}</button></div></label>${cardBackRight}</div></div><div class="action-row home-start-row">${soloBtnHtml}${roomButtonsHtml}</div></section></section>${mainPageLegalMiniHtml()}${roomLobbyHtml}${roomJoinModal}${state.home.showIntro?introPanelHtml():''}${state.home.showLeaderboard?leaderboardModalHtml():''}${state.showScoreGuide?scoreGuideModalHtml():''}</section>`;

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
  bindLangMenu(document.querySelector('.royal-head-actions'),{reloadGoogle:!state.home.google?.signedIn});
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
  bindBackCarousel('back-combo-left');
  bindBackCarousel('back-combo-right');
  bindSoundToggle('sound-combo');
  bindCalloutDisplayToggle('callout-display-combo');
  bindEmoteDisplayToggle('emote-display-combo');
  const handleSoloStart=async()=>{
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
    schedulePopunderAfterRender(350);
  };
  const soloStartBtn=document.getElementById('solo-start');
  soloStartBtn?.addEventListener('pointerdown',(e)=>{
    if(!guardAction('solo-start'))return;
    e.preventDefault();
    e.stopPropagation();
    void handleSoloStart();
  },true);
  soloStartBtn?.addEventListener('click',()=>{if(!guardAction('solo-start'))return;void handleSoloStart();});
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
    state.room.joinOpenCountdown=0;
  }
  document.getElementById('room-copy')?.addEventListener('click',async()=>{
    try{await navigator.clipboard?.writeText?.(String(state.room.code||''));}catch{}
  });
  document.getElementById('room-leave')?.addEventListener('click',async()=>{
    await leaveRoom(true);
  });
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
    window.setTimeout(runPopunderAd,0);
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
  app.innerHTML=`<section class="home-wrap"><header class="topbar home-topbar"><div><h2>${t('config')}</h2></div><div class="topbar-right"><div class="control-row"><button id="config-back" class="secondary">${t('home')}</button>${renderLangMenu('config-lang-menu')}</div></div></header><section class="home-panel"><div class="field-grid config-audio-voice-row"><label class="field"><span>${t('ai')}</span><div class="option-combo toggle-combo difficulty-combo" id="config-difficulty-combo" style="--difficulty-index:${diffIndex};"><div class="difficulty-pill" aria-hidden="true"></div><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='easy'?'active':''}" data-value="easy">${t('easy')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='normal'?'active':''}" data-value="normal">${t('normal')}</button><button class="combo-btn toggle-btn ${state.home.aiDifficulty==='hard'?'active':''}" data-value="hard">${t('hard')}</button></div></label><label class="field"><span>${t('cardBack')}</span>${renderBackCarousel('config-back-combo')}</label><label class="field"><span>${t('audioVoice')}</span><div class="option-combo toggle-combo" id="config-sound-combo"><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'active':''}" data-value="on" aria-label="${t('soundOn')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M15 9c1.6 1.2 1.6 4.8 0 6"></path><path d="M17.5 7c2.8 2.4 2.8 7.6 0 10"></path></svg></button><button class="combo-btn toggle-btn sound-toggle-btn ${sound.enabled?'':'active'}" data-value="off" aria-label="${t('soundOff')}"><svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4z"></path><path d="M16 8l4 8"></path><path d="M20 8l-4 8"></path></svg></button></div></label><label class="field"><span>${t('calloutDisplay')}</span><div class="option-combo toggle-combo" id="config-callout-display-combo"><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'active':''}" data-value="on">${t('calloutDisplayOn')}</button><button class="combo-btn toggle-btn ${calloutDisplayEnabled?'':'active'}" data-value="off">${t('calloutDisplayOff')}</button></div></label><label class="field"><span>${t('emoteDisplay')}</span><div class="option-combo toggle-combo" id="config-emote-display-combo"><button class="combo-btn toggle-btn ${emoteDisplayEnabled?'active':''}" data-value="on">${t('calloutDisplayOn')}</button><button class="combo-btn toggle-btn ${emoteDisplayEnabled?'':'active'}" data-value="off">${t('calloutDisplayOff')}</button></div></label></div></section></section>`;
  document.getElementById('config-back')?.addEventListener('click',()=>{
    const target=state.screenBeforeConfig||'home';
    state.screen=target;
    render();
  });
  bindLangMenu(document.querySelector('.topbar-right'),{reloadGoogle:!state.home.google?.signedIn});
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
  bindBackCarousel('config-back-combo');
  bindSoundToggle('config-sound-combo');
  bindCalloutDisplayToggle('config-callout-display-combo');
  bindEmoteDisplayToggle('config-emote-display-combo');
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
function pickProfileLangKey(bank){
  if(!bank||typeof bank!=='object')return 'en';
  const preferred=String(state.language||'').trim();
  if(preferred&&bank[preferred])return preferred;
  if(bank.en)return 'en';
  if(bank['zh-HK'])return 'zh-HK';
  const keys=Object.keys(bank);
  return keys[0]||'en';
}
function profileFieldValue(profile,field,emptyValue){
  const bank=profile?.[field]??{};
  const key=pickProfileLangKey(bank);
  const fallback=bank.en??bank['zh-HK']??emptyValue;
  const value=bank?.[key]??fallback??emptyValue;
  const preferred=String(state.language||'').trim();
  if(field==='profile')return translateProfileLines(value,preferred);
  if(field==='motto')return translateProfileMotto(value,preferred);
  return value;
}
const PROFILE_LINE_TRANSLATIONS_RAW={
  fr:{
    'Opens like a slow simmer, then flips the table at the perfect time. He says “one more hand” while already reading your next card.':'Il démarre comme un mijotage, puis renverse la table au moment parfait. Il dit « encore une main » tout en lisant déjà ta prochaine carte.',
    'He drags you into impatience and ends it on your mistake. Quiet at the table, loud in the math—every card is already booked.':'Il t’entraîne dans l’impatience et conclut sur ton erreur. Silencieux à la table, bruyant dans le calcul—chaque carte est déjà comptée.',
    'Arranges cards like a chessboard and times turns with a coffee cup. You don’t lose to his cards, you lose to his tempo—even your breathing follows it.':'Il aligne les cartes comme un échiquier et cadence les tours avec une tasse de café. Tu ne perds pas contre ses cartes, tu perds contre son tempo—même ta respiration le suit.',
    'He remembers your mistakes by tempo and replays them next round. To him, the game is time management, winning is just extra credit.':'Il mémorise tes erreurs par rythme et les rejoue au tour suivant. Pour lui, la partie est une gestion du temps, gagner n’est qu’un bonus.',
    'Plays like a camera shutter—click, your rhythm is gone. Loves fast attacks, sometimes keeps one card just for the drama.':'Il joue comme un déclencheur d’appareil—clic, ton rythme disparaît. Il adore l’attaque rapide et garde parfois une carte pour le drame.',
    'He keeps a card when you think he is all-in, then finishes with a dramatic last touch. You are still smiling in the photo while he already cleared the table.':'Il garde une carte quand tu crois qu’il est all‑in, puis finit par un dernier geste dramatique. Tu souris encore sur la photo qu’il a déjà tout nettoyé.',
    'Looks chill, hides a dagger. Late game bursts like a fast break—so fast you are still thinking when it ends.':'Il a l’air tranquille, cache une dague. Fin de partie, il explose comme une contre‑attaque—si vite que tu réfléchis encore quand tout est fini.',
    'Few words, but a rapid sequence that makes you question everything. What looks like luck is just his route, pre‑planned.':'Peu de mots, mais une rafale qui te fait tout remettre en question. Ce qui semble être de la chance, c’est juste son itinéraire préparé.',
    'Boxes with the deck—probe, feint, then a heavy punch. Blink and the table is empty, and your reactions feel slow.':'Il boxe avec le paquet—sonde, feinte, puis un coup lourd. Tu clignes des yeux, la table est vide et tes réactions semblent lentes.',
    'He lets you feel safe, then hits the accelerator to finish. By the time you notice, the tempo is locked.':'Il te laisse te sentir en sécurité, puis accélère pour finir. Quand tu t’en rends compte, le tempo est verrouillé.',
    'Speaks slow, plays slower—always on beat. The more you rush, the steadier he becomes, like a slow drum.':'Il parle lentement, joue encore plus lentement—toujours sur le tempo. Plus tu te presses, plus il devient stable, comme un tambour lent.',
    'He slows the tempo until you drift, then closes with clean hands. The last move is quiet, but it lands.':'Il ralentit le tempo jusqu’à te faire décrocher, puis conclut proprement. Le dernier coup est silencieux, mais il frappe juste.',
    'Treats the table like an oven—preheat, then serve a surprise. Hopes you overreach, then punishes it.':'Elle traite la table comme un four—pré‑chauffe puis sert la surprise. Elle espère que tu dépasses les limites, puis elle punit.',
    'She waits for you to spiral; that is when dessert is served. What you think is mercy is just heat control.':'Elle attend que tu dérailles; c’est l’heure du dessert. Ce que tu prends pour de la clémence n’est qu’un contrôle de température.',
    'Soft moves, sharp results. Don’t let the smile fool you—it is just smoke.':'Mouvements doux, résultats tranchants. Ne te laisse pas tromper par le sourire—ce n’est que de la fumée.',
    'You think she is slow-building, she is just baiting you. When you feel safe, the smallest card pushes you off.':'Tu crois qu’elle monte lentement, elle te tend un appât. Quand tu te crois en sécurité, la plus petite carte te fait tomber.',
    'Strings combos like jazz riffs. When you think she is lost, she is setting a trap, each hand a metronome.':'Elle enchaîne les combos comme des riffs de jazz. Quand tu crois qu’elle s’égare, elle pose un piège, chaque main un métronome.',
    'She saves the strongest combo for the moment you feel safe. Once you relax, the chorus hits.':'Elle garde le combo le plus fort pour le moment où tu te sens en sécurité. Dès que tu te relâches, le refrain tombe.',
    'Builds a puzzle, then disassembles your hand. Conservative on the surface, ruthless underneath, every card has a slot.':'Elle assemble un puzzle puis démonte ta main. Prudente en surface, impitoyable dessous; chaque carte a sa place.',
    'Her table is a puzzle; the last piece is always in her hand. When you think you are one card away, she is already packing.':'Sa table est un puzzle; la dernière pièce est toujours dans sa main. Quand tu penses être à une carte, elle range déjà la boîte.',
    'Always takes the scenic route—one hand, three lines. You never know her next stop because she likes the detour.':'Elle prend toujours le chemin panoramique—une main, trois lignes. Tu ne connais jamais sa prochaine étape, elle aime les détours.',
    'Her routes change; your predictions do not. She uses your confidence to pull you off course.':'Ses routes changent; tes prévisions, non. Elle utilise ta confiance pour te faire dévier.',
    'Slow grower, then unstoppable bloom. Most dangerous in the last few hands—you realize too late.':'Démarre lentement puis devient irrésistible. La plus dangereuse dans les dernières mains—tu le comprends trop tard.',
    'First half is a stroll, second half is fireworks. She waits for your guard to drop, then lights it up.':'La première moitié est une promenade, la seconde un feu d’artifice. Elle attend que ta garde tombe, puis allume la mèche.',
    'She moves like a sea breeze—fast in, fast out. Early tempo pulls you off course; late game she just closes the line.':'Elle bouge comme une brise marine—entrée rapide, sortie rapide. Le tempo du début te dévie; en fin de partie, elle ferme la ligne.',
    'She makes ordinary cards look premium, so you think she is conserving. She is really conserving your options.':'Elle rend les cartes ordinaires luxueuses, tu crois qu’elle économise. En réalité, elle économise tes options.',
    'More awake as night deepens, her tempo flashes like neon. She speeds up when you relax.':'Plus la nuit avance, plus elle est éveillée; son tempo clignote comme un néon. Elle accélère quand tu te relâches.',
    'She loves the night’s rhythm and pulls you into it with every hand.':'Elle aime le rythme de la nuit et t’y entraîne à chaque main.',
    'Lives for the night. Faster tempo, sharper strikes, no hesitation.':'Il vit pour la nuit. Tempo plus rapide, frappes plus nettes, aucune hésitation.',
    'Night is his arena—neon-fast plays and clean finishes before you can react.':'La nuit est son arène—des coups néon‑rapides et des fins propres avant que tu réagisses.',
    'Methodical and precise, he models first then executes. Steady tempo, calibrated plays.':'Méthodique et précis, il modélise d’abord puis exécute. Tempo stable, coups calibrés.',
    'He likes drills and endurance—long games turn into his rhythm.':'Il aime l’entraînement et l’endurance—les longues parties deviennent son rythme.',
    'Plays with a star map in mind—predicts your next move. Clean, fast, and surgical, like a GPS into a dead end.':'Elle joue avec une carte du ciel en tête—prédit ton prochain coup. Propre, rapide, chirurgical, comme un GPS vers une impasse.',
    'She clears the obvious path, then blocks the hidden one. You think you have three routes; she keeps one.':'Elle ouvre la voie évidente puis bloque la voie cachée. Tu crois avoir trois routes, elle n’en laisse qu’une.',
    'All-in on speed. The first rush is meant to push you downhill and keep you defending.':'Tout sur la vitesse. La première vague sert à te faire dévaler et à te maintenir en défense.',
    'He wants you to run with him. You cannot. By the time you breathe, he is waving at the finish.':'Il veut que tu cours avec lui. Tu ne peux pas. Quand tu reprends ton souffle, il te salue déjà à la ligne d’arrivée.',
    'Plays like calligraphy—clean lines, no wasted strokes. You think he is slow, he just refuses chaos.':'Il joue comme la calligraphie—lignes nettes, aucun trait perdu. Tu le crois lent, il refuse juste le chaos.',
    'He hates wasting cards; every card must play a role. Try to disrupt him and he answers with shorter, cleaner lines.':'Il déteste gâcher les cartes; chacune doit avoir un rôle. Perturbe‑le et il répond avec des lignes plus courtes, plus nettes.',
    'High slopes, high stakes. He is fine losing once for a big return.':'Haute pente, gros enjeux. Il accepte de perdre une fois pour un gros retour.',
    'He would rather flip the table once than win small ten times. What looks wild is just his favorite angle.':'Il préfère renverser la table une fois que gagner petit dix fois. Ce qui paraît sauvage n’est que son angle favori.',
    'Builds patiently, then knocks the tower down. Her patience outlasts your hand.':'Elle construit patiemment puis renverse la tour. Sa patience dépasse ta main.',
    'She quietly seals off the line you love most. When you notice, your road already belongs to her.':'Elle ferme en silence la ligne que tu aimes le plus. Quand tu t’en rends compte, ta route est déjà à elle.',
    'Switches pace on a dime. Relax once and she finishes, like lights out.':'Elle change de rythme en un instant. Détends‑toi une fois et elle finit, comme une extinction des lumières.',
    'She pauses a beat on purpose, so you blink first. What feels like a glitch is her metronome.':'Elle ralentit exprès d’un temps pour que tu clignes d’abord. Ce qui semble un bug, c’est son métronome.',
    'Low error rate, high discipline. You beat him by taking risks, but risk is his trap.':'Faible taux d’erreur, grande discipline. Tu le bats en prenant des risques, mais le risque est son piège.',
    'He forces a choice, then blocks both roads. The more you chase the win, the deeper you fall into his tempo.':'Il te force à choisir puis bloque les deux routes. Plus tu poursuis la victoire, plus tu tombes dans son tempo.',
    'Balanced and steady—friendly pace, no free wins. She is like perfect air‑conditioning, always “just right.”':'Équilibrée et stable—rythme agréable, aucune victoire gratuite. Comme une clim parfaite, toujours « juste bien ».',
    'She keeps the game at just right so you will not risk it. While you hesitate, she is already done.':'Elle maintient la partie « juste bien » pour que tu n’oses pas risquer. Pendant que tu hésites, c’est déjà fini.',
    'Prefers head‑on clashes. The longer the fight, the more alive he gets.':'Il préfère les chocs frontaux. Plus le combat dure, plus il s’anime.',
    'The more you press, the harder he snaps back. You think he is surviving; he is charging.':'Plus tu appuies, plus il riposte fort. Tu crois qu’il survit; il se recharge.',
    'Soft vibe, sharp math. Deadly on the last card, like the final stroke.':'Ambiance douce, calcul tranchant. Mortelle sur la dernière carte, comme le trait final.',
    'Her smile is bait, her last card is the lock. You think she is chatting; she is closing the net.':'Son sourire est l’appât, sa dernière carte est le verrou. Tu crois qu’elle bavarde, elle referme le filet.',
    'He plays like a star chart—marks every exit, then closes them one by one. You think you have options; he has already ringed you.':'Il joue comme une carte des étoiles—marque chaque sortie puis les ferme une à une. Tu crois avoir des options; il t’a déjà encerclé.',
    'He is not afraid of slow, only of you rushing. The moment you panic, he ends it with the simplest cards.':'Il ne craint pas la lenteur, seulement ta précipitation. Dès que tu paniques, il conclut avec les cartes les plus simples.'
  },
  de:{
    'Opens like a slow simmer, then flips the table at the perfect time. He says “one more hand” while already reading your next card.':'Er beginnt wie ein leises Köcheln und kippt dann im perfekten Moment den Tisch. Er sagt „noch eine Hand“, während er schon deine nächste Karte liest.',
    'He drags you into impatience and ends it on your mistake. Quiet at the table, loud in the math—every card is already booked.':'Er zieht dich in Ungeduld und beendet es mit deinem Fehler. Am Tisch leise, in der Mathematik laut – jede Karte ist schon verbucht.',
    'Arranges cards like a chessboard and times turns with a coffee cup. You don’t lose to his cards, you lose to his tempo—even your breathing follows it.':'Er ordnet Karten wie ein Schachbrett und misst die Züge mit einer Kaffeetasse. Du verlierst nicht an seinen Karten, sondern an seinem Tempo – selbst dein Atem folgt ihm.',
    'He remembers your mistakes by tempo and replays them next round. To him, the game is time management, winning is just extra credit.':'Er merkt sich deine Fehler im Tempo und spielt sie in der nächsten Runde nach. Für ihn ist das Spiel Zeitmanagement, Gewinnen ist nur Extra‑Punkte.',
    'Plays like a camera shutter—click, your rhythm is gone. Loves fast attacks, sometimes keeps one card just for the drama.':'Er spielt wie ein Kameraverschluss – klick, dein Rhythmus ist weg. Er liebt schnelle Angriffe und behält manchmal eine Karte nur für die Dramaturgie.',
    'He keeps a card when you think he is all-in, then finishes with a dramatic last touch. You are still smiling in the photo while he already cleared the table.':'Er behält eine Karte, wenn du denkst, er ist all‑in, und beendet dann mit einem dramatischen letzten Zug. Du lächelst noch im Foto, während er den Tisch schon leer geräumt hat.',
    'Looks chill, hides a dagger. Late game bursts like a fast break—so fast you are still thinking when it ends.':'Wirkt entspannt, verbirgt einen Dolch. Im Endspiel explodiert er wie ein Fastbreak – so schnell, dass du noch denkst, wenn es vorbei ist.',
    'Few words, but a rapid sequence that makes you question everything. What looks like luck is just his route, pre‑planned.':'Wenig Worte, aber eine schnelle Sequenz, die alles infrage stellt. Was wie Glück aussieht, ist nur seine vorgeplante Route.',
    'Boxes with the deck—probe, feint, then a heavy punch. Blink and the table is empty, and your reactions feel slow.':'Er boxt mit dem Deck – tasten, fintieren, dann ein harter Schlag. Ein Blinzeln, der Tisch ist leer und deine Reaktion wirkt langsam.',
    'He lets you feel safe, then hits the accelerator to finish. By the time you notice, the tempo is locked.':'Er lässt dich dich sicher fühlen, dann gibt er Gas zum Finish. Wenn du es merkst, ist das Tempo schon festgezurrt.',
    'Speaks slow, plays slower—always on beat. The more you rush, the steadier he becomes, like a slow drum.':'Er spricht langsam, spielt noch langsamer – immer im Takt. Je mehr du hetzt, desto ruhiger wird er, wie eine langsame Trommel.',
    'He slows the tempo until you drift, then closes with clean hands. The last move is quiet, but it lands.':'Er verlangsamt das Tempo, bis du wegdriftest, und schließt dann sauber ab. Der letzte Zug ist leise, aber sitzt.',
    'Treats the table like an oven—preheat, then serve a surprise. Hopes you overreach, then punishes it.':'Sie behandelt den Tisch wie einen Ofen – vorheizen, dann die Überraschung servieren. Sie hofft, dass du überziehst, und bestraft es.',
    'She waits for you to spiral; that is when dessert is served. What you think is mercy is just heat control.':'Sie wartet, bis du ins Straucheln gerätst – dann gibt es Dessert. Was du für Gnade hältst, ist nur Temperaturkontrolle.',
    'Soft moves, sharp results. Don’t let the smile fool you—it is just smoke.':'Sanfte Züge, scharfe Ergebnisse. Lass dich vom Lächeln nicht täuschen – es ist nur Rauch.',
    'You think she is slow-building, she is just baiting you. When you feel safe, the smallest card pushes you off.':'Du denkst, sie baut langsam auf, dabei ködert sie dich nur. Wenn du dich sicher fühlst, stößt dich die kleinste Karte.',
    'Strings combos like jazz riffs. When you think she is lost, she is setting a trap, each hand a metronome.':'Sie reiht Kombos wie Jazz‑Riffs aneinander. Wenn du denkst, sie ist verloren, stellt sie die Falle – jede Hand ein Metronom.',
    'She saves the strongest combo for the moment you feel safe. Once you relax, the chorus hits.':'Sie spart das stärkste Kombo für den Moment auf, in dem du dich sicher fühlst. Sobald du dich entspannst, schlägt der Refrain ein.',
    'Builds a puzzle, then disassembles your hand. Conservative on the surface, ruthless underneath, every card has a slot.':'Sie baut ein Puzzle und zerlegt dann deine Hand. Außen vorsichtig, innen gnadenlos – jede Karte hat ihren Platz.',
    'Her table is a puzzle; the last piece is always in her hand. When you think you are one card away, she is already packing.':'Ihr Tisch ist ein Puzzle; das letzte Teil liegt immer in ihrer Hand. Wenn du denkst, du bist eine Karte entfernt, packt sie schon ein.',
    'Always takes the scenic route—one hand, three lines. You never know her next stop because she likes the detour.':'Sie nimmt immer die Nebenstrecke – eine Hand, drei Linien. Du kennst nie ihren nächsten Halt, sie liebt Umwege.',
    'Her routes change; your predictions do not. She uses your confidence to pull you off course.':'Ihre Routen wechseln, deine Vorhersagen nicht. Sie nutzt dein Selbstvertrauen, um dich vom Kurs abzubringen.',
    'Slow grower, then unstoppable bloom. Most dangerous in the last few hands—you realize too late.':'Langsam im Anlauf, dann unaufhaltsam. Am gefährlichsten in den letzten Händen – du merkst es zu spät.',
    'First half is a stroll, second half is fireworks. She waits for your guard to drop, then lights it up.':'Die erste Hälfte ist ein Spaziergang, die zweite ein Feuerwerk. Sie wartet, bis deine Deckung fällt, und zündet dann.',
    'She moves like a sea breeze—fast in, fast out. Early tempo pulls you off course; late game she just closes the line.':'Sie bewegt sich wie eine Meeresbrise – schnell rein, schnell raus. Frühes Tempo bringt dich vom Kurs; im Endspiel schließt sie einfach die Linie.',
    'She makes ordinary cards look premium, so you think she is conserving. She is really conserving your options.':'Sie lässt gewöhnliche Karten edel wirken, sodass du denkst, sie spart. In Wahrheit spart sie deine Optionen.',
    'More awake as night deepens, her tempo flashes like neon. She speeds up when you relax.':'Je tiefer die Nacht, desto wacher wird sie; ihr Tempo blitzt wie Neon. Sie beschleunigt, wenn du dich entspannst.',
    'She loves the night’s rhythm and pulls you into it with every hand.':'Sie liebt den Rhythmus der Nacht und zieht dich mit jeder Hand hinein.',
    'Lives for the night. Faster tempo, sharper strikes, no hesitation.':'Er lebt für die Nacht. Schnelleres Tempo, schärfere Schläge, kein Zögern.',
    'Night is his arena—neon-fast plays and clean finishes before you can react.':'Die Nacht ist seine Arena – neon‑schnelle Züge und saubere Abschlüsse, bevor du reagieren kannst.',
    'Methodical and precise, he models first then executes. Steady tempo, calibrated plays.':'Methodisch und präzise – er modelliert zuerst, dann führt er aus. Stetiges Tempo, kalibrierte Züge.',
    'He likes drills and endurance—long games turn into his rhythm.':'Er liebt Training und Ausdauer – lange Partien werden zu seinem Rhythmus.',
    'Plays with a star map in mind—predicts your next move. Clean, fast, and surgical, like a GPS into a dead end.':'Sie spielt mit einer Sternkarte im Kopf – sagt deinen nächsten Zug voraus. Sauber, schnell, chirurgisch, wie ein GPS in eine Sackgasse.',
    'She clears the obvious path, then blocks the hidden one. You think you have three routes; she keeps one.':'Sie räumt den offensichtlichen Weg frei und blockiert dann den versteckten. Du glaubst drei Routen zu haben; sie lässt eine.',
    'All-in on speed. The first rush is meant to push you downhill and keep you defending.':'Alles auf Tempo. Der erste Schub soll dich bergab drücken und dich in der Verteidigung halten.',
    'He wants you to run with him. You cannot. By the time you breathe, he is waving at the finish.':'Er will, dass du mit ihm läufst. Du kannst nicht. Wenn du wieder Luft holst, winkt er schon im Ziel.',
    'Plays like calligraphy—clean lines, no wasted strokes. You think he is slow, he just refuses chaos.':'Er spielt wie Kalligrafie – saubere Linien, kein Strich zu viel. Du denkst, er sei langsam, er verweigert nur Chaos.',
    'He hates wasting cards; every card must play a role. Try to disrupt him and he answers with shorter, cleaner lines.':'Er hasst es, Karten zu verschwenden; jede Karte muss eine Rolle spielen. Stör ihn, und er antwortet mit kürzeren, klareren Linien.',
    'High slopes, high stakes. He is fine losing once for a big return.':'Hohe Pisten, hohe Einsätze. Er ist okay damit, einmal zu verlieren für einen großen Gewinn.',
    'He would rather flip the table once than win small ten times. What looks wild is just his favorite angle.':'Lieber einmal den Tisch drehen als zehnmal klein gewinnen. Was wild aussieht, ist nur sein Lieblingswinkel.',
    'Builds patiently, then knocks the tower down. Her patience outlasts your hand.':'Sie baut geduldig auf und stößt dann den Turm um. Ihre Geduld hält länger als deine Hand.',
    'She quietly seals off the line you love most. When you notice, your road already belongs to her.':'Sie versiegelt leise die Linie, die du am meisten magst. Wenn du es merkst, gehört dein Weg schon ihr.',
    'Switches pace on a dime. Relax once and she finishes, like lights out.':'Sie wechselt das Tempo im Handumdrehen. Entspann dich einmal, und sie beendet es – wie Licht aus.',
    'She pauses a beat on purpose, so you blink first. What feels like a glitch is her metronome.':'Sie hält bewusst einen Beat, damit du zuerst blinzelst. Was wie ein Fehler wirkt, ist ihr Metronom.',
    'Low error rate, high discipline. You beat him by taking risks, but risk is his trap.':'Geringe Fehlerquote, hohe Disziplin. Du schlägst ihn, wenn du Risiken gehst – aber Risiko ist seine Falle.',
    'He forces a choice, then blocks both roads. The more you chase the win, the deeper you fall into his tempo.':'Er zwingt dich zur Wahl und blockiert dann beide Wege. Je mehr du dem Sieg nachjagst, desto tiefer fällst du in sein Tempo.',
    'Balanced and steady—friendly pace, no free wins. She is like perfect air‑conditioning, always “just right.”':'Ausgewogen und stetig – angenehmes Tempo, keine Geschenke. Wie eine perfekte Klimaanlage, immer „genau richtig“.',
    'She keeps the game at just right so you will not risk it. While you hesitate, she is already done.':'Sie hält das Spiel „genau richtig“, damit du kein Risiko eingehst. Während du zögerst, ist sie schon fertig.',
    'Prefers head‑on clashes. The longer the fight, the more alive he gets.':'Er bevorzugt den Frontal‑Zusammenstoß. Je länger der Kampf, desto lebendiger wird er.',
    'The more you press, the harder he snaps back. You think he is surviving; he is charging.':'Je mehr du drückst, desto härter schlägt er zurück. Du denkst, er überlebt; er lädt auf.',
    'Soft vibe, sharp math. Deadly on the last card, like the final stroke.':'Sanfter Vibe, scharfe Mathematik. Tödlich auf der letzten Karte, wie der letzte Pinselstrich.',
    'Her smile is bait, her last card is the lock. You think she is chatting; she is closing the net.':'Ihr Lächeln ist Köder, ihre letzte Karte ist das Schloss. Du denkst, sie plaudert; sie zieht das Netz zu.',
    'He plays like a star chart—marks every exit, then closes them one by one. You think you have options; he has already ringed you.':'Er spielt wie eine Sternkarte – markiert jeden Ausgang und schließt sie nacheinander. Du meinst Optionen zu haben; er hat dich schon umringt.',
    'He is not afraid of slow, only of you rushing. The moment you panic, he ends it with the simplest cards.':'Er hat keine Angst vor Langsamkeit, nur vor deiner Hektik. Sobald du panisch wirst, beendet er es mit den einfachsten Karten.'
  },
  es:{
    'Opens like a slow simmer, then flips the table at the perfect time. He says “one more hand” while already reading your next card.':'Empieza como un hervor lento y da la vuelta a la mesa en el momento perfecto. Dice «una mano más» mientras ya lee tu siguiente carta.',
    'He drags you into impatience and ends it on your mistake. Quiet at the table, loud in the math—every card is already booked.':'Te arrastra a la impaciencia y remata con tu error. Silencioso en la mesa, ruidoso en el cálculo: cada carta ya está contabilizada.',
    'Arranges cards like a chessboard and times turns with a coffee cup. You don’t lose to his cards, you lose to his tempo—even your breathing follows it.':'Ordena las cartas como un tablero de ajedrez y cronometra los turnos con una taza de café. No pierdes por sus cartas, pierdes por su tempo; hasta tu respiración lo sigue.',
    'He remembers your mistakes by tempo and replays them next round. To him, the game is time management, winning is just extra credit.':'Recuerda tus errores por el ritmo y los repite en la siguiente ronda. Para él, el juego es gestión del tiempo; ganar es un extra.',
    'Plays like a camera shutter—click, your rhythm is gone. Loves fast attacks, sometimes keeps one card just for the drama.':'Juega como un obturador: clic, tu ritmo desaparece. Le encantan los ataques rápidos y a veces guarda una carta solo por el drama.',
    'He keeps a card when you think he is all-in, then finishes with a dramatic last touch. You are still smiling in the photo while he already cleared the table.':'Guarda una carta cuando crees que va con todo y remata con un toque final dramático. Tú sigues sonriendo en la foto mientras él ya limpió la mesa.',
    'Looks chill, hides a dagger. Late game bursts like a fast break—so fast you are still thinking when it ends.':'Parece relajado, esconde una daga. En el final estalla como un contraataque: tan rápido que sigues pensando cuando ya terminó.',
    'Few words, but a rapid sequence that makes you question everything. What looks like luck is just his route, pre‑planned.':'Pocas palabras, pero una secuencia rápida que te hace dudar de todo. Lo que parece suerte es solo su ruta planeada.',
    'Boxes with the deck—probe, feint, then a heavy punch. Blink and the table is empty, and your reactions feel slow.':'Boxea con la baraja: tantea, amaga y suelta un golpe fuerte. Parpadeas y la mesa está vacía, tus reacciones se sienten lentas.',
    'He lets you feel safe, then hits the accelerator to finish. By the time you notice, the tempo is locked.':'Te hace sentir seguro y luego acelera para terminar. Cuando te das cuenta, el tempo ya está cerrado.',
    'Speaks slow, plays slower—always on beat. The more you rush, the steadier he becomes, like a slow drum.':'Habla lento, juega más lento todavía, siempre a tiempo. Cuanto más te apresuras, más firme se vuelve, como un tambor lento.',
    'He slows the tempo until you drift, then closes with clean hands. The last move is quiet, but it lands.':'Baja el tempo hasta que te desconectas y cierra con manos limpias. El último movimiento es silencioso, pero pega.',
    'Treats the table like an oven—preheat, then serve a surprise. Hopes you overreach, then punishes it.':'Trata la mesa como un horno: precalienta y luego sirve la sorpresa. Espera que te excedas y te castiga.',
    'She waits for you to spiral; that is when dessert is served. What you think is mercy is just heat control.':'Espera a que te descompongas; ahí se sirve el postre. Lo que crees misericordia es solo control del fuego.',
    'Soft moves, sharp results. Don’t let the smile fool you—it is just smoke.':'Movimientos suaves, resultados afilados. No te engañe la sonrisa: es solo humo.',
    'You think she is slow-building, she is just baiting you. When you feel safe, the smallest card pushes you off.':'Crees que va lento, pero solo te está cebando. Cuando te sientes seguro, la carta más pequeña te empuja.',
    'Strings combos like jazz riffs. When you think she is lost, she is setting a trap, each hand a metronome.':'Encadena combos como riffs de jazz. Cuando crees que se perdió, está armando la trampa; cada mano es un metrónomo.',
    'She saves the strongest combo for the moment you feel safe. Once you relax, the chorus hits.':'Guarda el combo más fuerte para el momento en que te sientes seguro. Cuando te relajas, llega el estribillo.',
    'Builds a puzzle, then disassembles your hand. Conservative on the surface, ruthless underneath, every card has a slot.':'Arma un rompecabezas y luego desarma tu mano. Conservadora por fuera, implacable por dentro; cada carta tiene su lugar.',
    'Her table is a puzzle; the last piece is always in her hand. When you think you are one card away, she is already packing.':'Su mesa es un rompecabezas; la última pieza siempre está en su mano. Cuando crees que te falta una carta, ella ya está guardando.',
    'Always takes the scenic route—one hand, three lines. You never know her next stop because she likes the detour.':'Siempre toma la ruta panorámica: una mano, tres caminos. Nunca sabes su siguiente parada porque le gustan los desvíos.',
    'Her routes change; your predictions do not. She uses your confidence to pull you off course.':'Sus rutas cambian; tus predicciones no. Usa tu confianza para sacarte del rumbo.',
    'Slow grower, then unstoppable bloom. Most dangerous in the last few hands—you realize too late.':'Crece lento y luego es imparable. Más peligrosa en las últimas manos; te das cuenta tarde.',
    'First half is a stroll, second half is fireworks. She waits for your guard to drop, then lights it up.':'La primera mitad es un paseo, la segunda es fuegos artificiales. Espera a que bajes la guardia y enciende la mecha.',
    'She moves like a sea breeze—fast in, fast out. Early tempo pulls you off course; late game she just closes the line.':'Se mueve como una brisa marina: entra rápido, sale rápido. El tempo inicial te saca del rumbo; al final solo cierra la línea.',
    'She makes ordinary cards look premium, so you think she is conserving. She is really conserving your options.':'Hace que cartas comunes parezcan de lujo; crees que se guarda, pero en realidad te guarda tus opciones.',
    'More awake as night deepens, her tempo flashes like neon. She speeds up when you relax.':'Cuanto más avanza la noche, más despierta está; su tempo parpadea como neón. Acelera cuando te relajas.',
    'She loves the night’s rhythm and pulls you into it with every hand.':'Ama el ritmo de la noche y te arrastra a él con cada mano.',
    'Lives for the night. Faster tempo, sharper strikes, no hesitation.':'Vive para la noche. Tempo más rápido, golpes más afilados, sin dudar.',
    'Night is his arena—neon-fast plays and clean finishes before you can react.':'La noche es su arena: jugadas de neón, rápidas, y finales limpios antes de que reacciones.',
    'Methodical and precise, he models first then executes. Steady tempo, calibrated plays.':'Metódico y preciso: primero modela, luego ejecuta. Tempo estable, jugadas calibradas.',
    'He likes drills and endurance—long games turn into his rhythm.':'Le gustan los entrenamientos y la resistencia; las partidas largas se convierten en su ritmo.',
    'Plays with a star map in mind—predicts your next move. Clean, fast, and surgical, like a GPS into a dead end.':'Juega con un mapa estelar en la mente y predice tu siguiente movimiento. Limpia, rápida y quirúrgica, como un GPS hacia un callejón sin salida.',
    'She clears the obvious path, then blocks the hidden one. You think you have three routes; she keeps one.':'Limpia el camino obvio y luego bloquea el oculto. Crees tener tres rutas; ella deja una.',
    'All-in on speed. The first rush is meant to push you downhill and keep you defending.':'Todo a la velocidad. La primera embestida busca empujarte cuesta abajo y mantenerte defendiendo.',
    'He wants you to run with him. You cannot. By the time you breathe, he is waving at the finish.':'Quiere que corras con él. No puedes. Cuando recuperas el aliento, ya te está saludando en la meta.',
    'Plays like calligraphy—clean lines, no wasted strokes. You think he is slow, he just refuses chaos.':'Juega como la caligrafía: líneas limpias, ningún trazo desperdiciado. Crees que es lento, solo rechaza el caos.',
    'He hates wasting cards; every card must play a role. Try to disrupt him and he answers with shorter, cleaner lines.':'Odia desperdiciar cartas; cada carta debe tener un papel. Si lo perturbas, responde con líneas más cortas y limpias.',
    'High slopes, high stakes. He is fine losing once for a big return.':'Altas pendientes, grandes apuestas. Le vale perder una vez por un gran retorno.',
    'He would rather flip the table once than win small ten times. What looks wild is just his favorite angle.':'Prefiere voltear la mesa una vez antes que ganar pequeño diez veces. Lo que parece salvaje es solo su ángulo favorito.',
    'Builds patiently, then knocks the tower down. Her patience outlasts your hand.':'Construye con paciencia y luego derriba la torre. Su paciencia dura más que tu mano.',
    'She quietly seals off the line you love most. When you notice, your road already belongs to her.':'Sella en silencio la línea que más te gusta. Cuando lo notas, tu camino ya es suyo.',
    'Switches pace on a dime. Relax once and she finishes, like lights out.':'Cambia de ritmo al instante. Relájate una vez y termina, como apagón.',
    'She pauses a beat on purpose, so you blink first. What feels like a glitch is her metronome.':'Se detiene un compás a propósito para que tú parpadees primero. Lo que parece un fallo es su metrónomo.',
    'Low error rate, high discipline. You beat him by taking risks, but risk is his trap.':'Baja tasa de error, alta disciplina. Le ganas tomando riesgos, pero el riesgo es su trampa.',
    'He forces a choice, then blocks both roads. The more you chase the win, the deeper you fall into his tempo.':'Te obliga a elegir y luego bloquea ambos caminos. Cuanto más persigues la victoria, más caes en su tempo.',
    'Balanced and steady—friendly pace, no free wins. She is like perfect air‑conditioning, always “just right.”':'Equilibrada y constante: ritmo amable, sin victorias regaladas. Como un aire acondicionado perfecto, siempre «justo».',
    'She keeps the game at just right so you will not risk it. While you hesitate, she is already done.':'Mantiene el juego «justo» para que no arriesgues. Mientras dudas, ella ya terminó.',
    'Prefers head‑on clashes. The longer the fight, the more alive he gets.':'Prefiere los choques frontales. Cuanto más larga la pelea, más vivo se siente.',
    'The more you press, the harder he snaps back. You think he is surviving; he is charging.':'Cuanto más presionas, más fuerte responde. Crees que aguanta; en realidad se está cargando.',
    'Soft vibe, sharp math. Deadly on the last card, like the final stroke.':'Vibra suave, cálculo afilado. Letal en la última carta, como el trazo final.',
    'Her smile is bait, her last card is the lock. You think she is chatting; she is closing the net.':'Su sonrisa es el cebo, su última carta es el cerrojo. Crees que charla; está cerrando la red.',
    'He plays like a star chart—marks every exit, then closes them one by one. You think you have options; he has already ringed you.':'Juega como un mapa estelar: marca cada salida y luego las cierra una a una. Crees tener opciones; ya te rodeó.',
    'He is not afraid of slow, only of you rushing. The moment you panic, he ends it with the simplest cards.':'No teme la lentitud, solo tu prisa. En cuanto entras en pánico, termina con las cartas más simples.'
  },
  ja:{
    'Opens like a slow simmer, then flips the table at the perfect time. He says “one more hand” while already reading your next card.':'じわじわ入って、絶妙なタイミングで流れをひっくり返す。「あと一手」と言いながら次のカードまで読んでいる。',
    'He drags you into impatience and ends it on your mistake. Quiet at the table, loud in the math—every card is already booked.':'焦らせてミスを引き出し、その一瞬で終わらせる。卓では静かだが計算は饒舌で、すべてのカードが記帳済み。',
    'Arranges cards like a chessboard and times turns with a coffee cup. You don’t lose to his cards, you lose to his tempo—even your breathing follows it.':'カードをチェス盤のように並べ、コーヒーカップでテンポを測る。負けるのは手札ではなく彼のリズムで、呼吸さえ合わせられる。',
    'He remembers your mistakes by tempo and replays them next round. To him, the game is time management, winning is just extra credit.':'ミスのリズムを覚えて次の局で再現する。彼にとって勝敗はオマケで、ゲームは時間管理。',
    'Plays like a camera shutter—click, your rhythm is gone. Loves fast attacks, sometimes keeps one card just for the drama.':'シャッターのようにプレーする。カシャッと一瞬でリズムが崩れる。速攻が好きで、演出のために一枚残すこともある。',
    'He keeps a card when you think he is all-in, then finishes with a dramatic last touch. You are still smiling in the photo while he already cleared the table.':'全力だと思わせて一枚残し、最後にドラマチックに締める。写真ではまだ笑っているのに、卓はもう空。',
    'Looks chill, hides a dagger. Late game bursts like a fast break—so fast you are still thinking when it ends.':'穏やかに見えて刃を隠している。終盤は速攻のように連続で押し切り、考えている間に終わる。',
    'Few words, but a rapid sequence that makes you question everything. What looks like luck is just his route, pre‑planned.':'口数は少ないが連打で揺さぶる。運に見えるのは、計画されたルートにすぎない。',
    'Boxes with the deck—probe, feint, then a heavy punch. Blink and the table is empty, and your reactions feel slow.':'探り、フェイント、そして強打。瞬きしたら卓は空で、反応が遅く感じる。',
    'He lets you feel safe, then hits the accelerator to finish. By the time you notice, the tempo is locked.':'安心させてから加速して締める。気づく頃にはテンポが固定されている。',
    'Speaks slow, plays slower—always on beat. The more you rush, the steadier he becomes, like a slow drum.':'話し方はゆっくり、プレーはさらにゆっくり。常にビート通りで、焦るほど彼は安定する。',
    'He slows the tempo until you drift, then closes with clean hands. The last move is quiet, but it lands.':'テンポを落として意識をずらし、最後はきれいに締める。静かな一手だが決まる。',
    'Treats the table like an oven—preheat, then serve a surprise. Hopes you overreach, then punishes it.':'卓はオーブン。温めてからサプライズを出す。無理をさせて、それを罰する。',
    'She waits for you to spiral; that is when dessert is served. What you think is mercy is just heat control.':'崩れた瞬間がデザートの時間。優しさに見えるのは火加減の調整だけ。',
    'Soft moves, sharp results. Don’t let the smile fool you—it is just smoke.':'動きは柔らかく、結果は鋭い。笑顔に騙されるな、ただの煙幕だ。',
    'You think she is slow-building, she is just baiting you. When you feel safe, the smallest card pushes you off.':'じっくり育てているように見えて、ただの誘い。安心した瞬間、最小のカードで落とされる。',
    'Strings combos like jazz riffs. When you think she is lost, she is setting a trap, each hand a metronome.':'ジャズのリフのようにコンボを繋ぐ。迷っているように見えて罠を張り、手札はメトロノームだ。',
    'She saves the strongest combo for the moment you feel safe. Once you relax, the chorus hits.':'安心した瞬間に最大コンボを温存。緩んだ途端、サビが来る。',
    'Builds a puzzle, then disassembles your hand. Conservative on the surface, ruthless underneath, every card has a slot.':'パズルを組んでから手札を解体する。表向きは慎重、内側は非情。すべてのカードに役割がある。',
    'Her table is a puzzle; the last piece is always in her hand. When you think you are one card away, she is already packing.':'卓はパズルで、最後のピースは常に彼女の手の中。あと一枚だと思った瞬間、もう片付けている。',
    'Always takes the scenic route—one hand, three lines. You never know her next stop because she likes the detour.':'いつも景色の道を選ぶ。一手で三つの道。次の行き先が読めないのは、寄り道が好きだから。',
    'Her routes change; your predictions do not. She uses your confidence to pull you off course.':'彼女のルートは変わるが、あなたの予測は固定。自信を利用して進路を外させる。',
    'Slow grower, then unstoppable bloom. Most dangerous in the last few hands—you realize too late.':'遅咲きだが止まらない。終盤が最も危険で、気づいた時には遅い。',
    'First half is a stroll, second half is fireworks. She waits for your guard to drop, then lights it up.':'前半は散歩、後半は花火。油断した瞬間に火を付ける。',
    'She moves like a sea breeze—fast in, fast out. Early tempo pulls you off course; late game she just closes the line.':'海風のように素早く出入りする。序盤のテンポで軌道を外され、終盤はそのまま閉じられる。',
    'She makes ordinary cards look premium, so you think she is conserving. She is really conserving your options.':'普通のカードを特別に見せて温存しているように錯覚させる。本当に削られているのはあなたの選択肢。',
    'More awake as night deepens, her tempo flashes like neon. She speeds up when you relax.':'夜が深いほど冴え、テンポはネオンのように点滅する。油断したときに加速する。',
    'She loves the night’s rhythm and pulls you into it with every hand.':'夜のリズムが好きで、手札ごとに引き込んでくる。',
    'Lives for the night. Faster tempo, sharper strikes, no hesitation.':'夜のために生きる。テンポは速く、打ちは鋭く、迷いなし。',
    'Night is his arena—neon-fast plays and clean finishes before you can react.':'夜は彼のアリーナ。ネオンのような速さで仕掛け、反応する前にきれいに終わらせる。',
    'Methodical and precise, he models first then executes. Steady tempo, calibrated plays.':'几帳面で正確。まずモデル化してから実行する。安定したテンポ、調整された一手。',
    'He likes drills and endurance—long games turn into his rhythm.':'訓練と持久が好きで、長期戦は彼のリズムになる。',
    'Plays with a star map in mind—predicts your next move. Clean, fast, and surgical, like a GPS into a dead end.':'星図を頭に描き、次の一手を予測する。無駄なく速く、外科的で、行き止まりへ導くGPSのよう。',
    'She clears the obvious path, then blocks the hidden one. You think you have three routes; she keeps one.':'見える道を片付けたあと、見えない道を塞ぐ。三つあると思った道は一つだけになる。',
    'All-in on speed. The first rush is meant to push you downhill and keep you defending.':'スピード全振り。最初のラッシュで下り坂に押し込み、守りに回させる。',
    'He wants you to run with him. You cannot. By the time you breathe, he is waving at the finish.':'一緒に走らせようとするが追いつけない。息を整えたころには、彼はもうゴールで手を振っている。',
    'Plays like calligraphy—clean lines, no wasted strokes. You think he is slow, he just refuses chaos.':'書道のように無駄のない線。遅いのではなく、混沌を拒んでいるだけ。',
    'He hates wasting cards; every card must play a role. Try to disrupt him and he answers with shorter, cleaner lines.':'カードを無駄にするのが嫌いで、すべてに役割がある。崩そうとすると、さらに短く鋭い線で返す。',
    'High slopes, high stakes. He is fine losing once for a big return.':'高い斜面に高い賭け。一度の負けで大きな見返りを狙う。',
    'He would rather flip the table once than win small ten times. What looks wild is just his favorite angle.':'小さく十回勝つより一度の大逆転。荒々しく見えるのは得意な角度なだけ。',
    'Builds patiently, then knocks the tower down. Her patience outlasts your hand.':'じっくり積み上げ、最後に倒す。彼女の忍耐はあなたの手札より長い。',
    'She quietly seals off the line you love most. When you notice, your road already belongs to her.':'好きなラインを静かに塞ぐ。気づいたときには、その道はもう彼女のもの。',
    'Switches pace on a dime. Relax once and she finishes, like lights out.':'テンポを一瞬で切り替える。緩んだ瞬間に終わらせ、灯りが消えるように。',
    'She pauses a beat on purpose, so you blink first. What feels like a glitch is her metronome.':'わざと一拍止めて先に瞬きをさせる。バグに見えるのは彼女のメトロノーム。',
    'Low error rate, high discipline. You beat him by taking risks, but risk is his trap.':'ミスが少なく規律が高い。リスクで勝てるが、そのリスクこそ罠。',
    'He forces a choice, then blocks both roads. The more you chase the win, the deeper you fall into his tempo.':'選択を迫り、両方の道を塞ぐ。勝ちを追うほど彼のテンポに沈む。',
    'Balanced and steady—friendly pace, no free wins. She is like perfect air‑conditioning, always “just right.”':'バランス型で安定、優しいペースでもタダでは勝たせない。完璧な空調のようにいつも「ちょうどいい」。',
    'She keeps the game at just right so you will not risk it. While you hesitate, she is already done.':'ちょうどいい状態を保ってリスクを取らせない。迷っている間に終わっている。',
    'Prefers head‑on clashes. The longer the fight, the more alive he gets.':'真っ向勝負が好き。長引くほど燃えてくる。',
    'The more you press, the harder he snaps back. You think he is surviving; he is charging.':'押すほど強く跳ね返す。耐えているようで、実は溜めている。',
    'Soft vibe, sharp math. Deadly on the last card, like the final stroke.':'柔らかな雰囲気、鋭い計算。最後の一枚が致命的、最後の一筆のよう。',
    'Her smile is bait, her last card is the lock. You think she is chatting; she is closing the net.':'笑顔は餌、最後のカードは鍵。雑談しているようで網を閉じている。',
    'He plays like a star chart—marks every exit, then closes them one by one. You think you have options; he has already ringed you.':'星図のように出口を全部印し、順に閉じていく。選択肢があると思っているが、もう包囲されている。',
    'He is not afraid of slow, only of you rushing. The moment you panic, he ends it with the simplest cards.':'遅さは怖くない。怖いのはあなたの焦り。パニックになった瞬間、最もシンプルなカードで終わらせる。'
  }
};
const PROFILE_MOTTO_TRANSLATIONS={
  fr:{
    'Slow is smooth.':'Lent, c’est fluide.',
    'Make every move count.':'Chaque coup compte.',
    'One step faster, a lot sharper.':'Un pas plus vite, beaucoup plus net.',
    'Save the strike for last.':'Garde le coup pour la fin.',
    'Lead and dominate.':'Mène et domine.',
    'Steady first, speed later.':'D’abord la stabilité, ensuite la vitesse.',
    'Stay cool, win clean.':'Reste cool, gagne net.',
    'Soft can still sting.':'La douceur peut piquer.',
    'Combos are the show.':'Les combos font le spectacle.',
    'Count it, then strike.':'Compte, puis frappe.',
    'Adapt fast, stay balanced.':'S’adapter vite, rester équilibré.',
    'Late game is home turf.':'La fin de partie, c’est son terrain.',
    'With the right wind, you barely push.':'Avec le bon vent, tu pousses à peine.',
    'Night is the home court.':'La nuit est son terrain.',
    'Night is the stage.':'La nuit est la scène.',
    'Measure, then move.':'Mesure, puis avance.',
    'See far, win early.':'Vois loin, gagne tôt.',
    'Speed wins half.':'La vitesse, c’est la moitié de la victoire.',
    'Order beats chaos.':'L’ordre bat le chaos.',
    'Bet big, win big.':'Gros risque, gros gain.',
    'Patience pays.':'La patience paie.',
    'Tempo is the weapon.':'Le tempo est l’arme.',
    'Stability saves.':'La stabilité sauve.',
    'Calm doesn’t mean soft.':'Calme ne veut pas dire mou.',
    'Go hard or go home.':'À fond ou rien.',
    'The endgame tells all.':'La fin révèle tout.',
    'See it, then land it.':'Vois‑le, puis pose‑le.'
  },
  de:{
    'Slow is smooth.':'Langsam ist geschmeidig.',
    'Make every move count.':'Jeder Zug zählt.',
    'One step faster, a lot sharper.':'Einen Schritt schneller, deutlich schärfer.',
    'Save the strike for last.':'Heb den Schlag für den Schluss auf.',
    'Lead and dominate.':'Führe und dominiere.',
    'Steady first, speed later.':'Erst stabil, dann schnell.',
    'Stay cool, win clean.':'Kühl bleiben, sauber gewinnen.',
    'Soft can still sting.':'Sanft kann stechen.',
    'Combos are the show.':'Kombos sind die Show.',
    'Count it, then strike.':'Erst zählen, dann schlagen.',
    'Adapt fast, stay balanced.':'Schnell anpassen, im Gleichgewicht bleiben.',
    'Late game is home turf.':'Das Endspiel ist Heimvorteil.',
    'With the right wind, you barely push.':'Mit dem richtigen Wind musst du kaum drücken.',
    'Night is the home court.':'Die Nacht ist Heimcourt.',
    'Night is the stage.':'Die Nacht ist die Bühne.',
    'Measure, then move.':'Messen, dann bewegen.',
    'See far, win early.':'Weit sehen, früh gewinnen.',
    'Speed wins half.':'Tempo gewinnt die Hälfte.',
    'Order beats chaos.':'Ordnung schlägt Chaos.',
    'Bet big, win big.':'Groß setzen, groß gewinnen.',
    'Patience pays.':'Geduld zahlt sich aus.',
    'Tempo is the weapon.':'Tempo ist die Waffe.',
    'Stability saves.':'Stabilität rettet.',
    'Calm doesn’t mean soft.':'Ruhig heißt nicht weich.',
    'Go hard or go home.':'Ganz oder gar nicht.',
    'The endgame tells all.':'Das Endspiel sagt alles.',
    'See it, then land it.':'Erst sehen, dann landen.'
  },
  es:{
    'Slow is smooth.':'Lento es fluido.',
    'Make every move count.':'Cada jugada cuenta.',
    'One step faster, a lot sharper.':'Un paso más rápido, mucho más preciso.',
    'Save the strike for last.':'Guarda el golpe para el final.',
    'Lead and dominate.':'Lidera y domina.',
    'Steady first, speed later.':'Primero la estabilidad, luego la velocidad.',
    'Stay cool, win clean.':'Mantén la calma, gana limpio.',
    'Soft can still sting.':'Lo suave también puede doler.',
    'Combos are the show.':'Los combos son el espectáculo.',
    'Count it, then strike.':'Cuenta y luego golpea.',
    'Adapt fast, stay balanced.':'Adáptate rápido, mantén el equilibrio.',
    'Late game is home turf.':'El final es su terreno.',
    'With the right wind, you barely push.':'Con el viento justo, apenas empujas.',
    'Night is the home court.':'La noche es su cancha.',
    'Night is the stage.':'La noche es el escenario.',
    'Measure, then move.':'Mide y luego actúa.',
    'See far, win early.':'Ve lejos, gana pronto.',
    'Speed wins half.':'La velocidad gana la mitad.',
    'Order beats chaos.':'El orden vence al caos.',
    'Bet big, win big.':'Apuesta grande, gana grande.',
    'Patience pays.':'La paciencia paga.',
    'Tempo is the weapon.':'El tempo es el arma.',
    'Stability saves.':'La estabilidad salva.',
    'Calm doesn’t mean soft.':'La calma no es debilidad.',
    'Go hard or go home.':'A tope o nada.',
    'The endgame tells all.':'El final lo dice todo.',
    'See it, then land it.':'Míralo y luego clávalo.'
  },
  ja:{
    'Slow is smooth.':'ゆっくりは滑らか。',
    'Make every move count.':'一手一手を大切に。',
    'One step faster, a lot sharper.':'一歩速く、ずっと切れ味。',
    'Save the strike for last.':'一撃は最後に。',
    'Lead and dominate.':'主導して制す。',
    'Steady first, speed later.':'まず安定、次に速さ。',
    'Stay cool, win clean.':'冷静に、きれいに勝つ。',
    'Soft can still sting.':'優しさでも刺さる。',
    'Combos are the show.':'連続技こそ見せ場。',
    'Count it, then strike.':'数えてから打つ。',
    'Adapt fast, stay balanced.':'素早く適応、均衡を保つ。',
    'Late game is home turf.':'終盤が本領。',
    'With the right wind, you barely push.':'風向き次第で力はいらない。',
    'Night is the home court.':'夜がホーム。',
    'Night is the stage.':'夜が舞台。',
    'Measure, then move.':'測ってから動く。',
    'See far, win early.':'先を見て早勝ち。',
    'Speed wins half.':'速さで半分勝ち。',
    'Order beats chaos.':'秩序が混沌に勝つ。',
    'Bet big, win big.':'大きく賭けて大きく勝つ。',
    'Patience pays.':'忍耐は報われる。',
    'Tempo is the weapon.':'テンポが武器。',
    'Stability saves.':'安定が守る。',
    'Calm doesn’t mean soft.':'落ち着きは弱さじゃない。',
    'Go hard or go home.':'やるかやられるか。',
    'The endgame tells all.':'終盤がすべてを語る。',
    'See it, then land it.':'見極めて、落とす。'
  }
};
const PROFILE_LINE_TRANSLATIONS_CACHE={};
function normalizeProfileKey(value=''){
  return String(value??'')
    .replace(/[“”]/g,'"')
    .replace(/[‘’]/g,"'")
    .replace(/[\u2010-\u2015\u2212]/g,'-')
    .replace(/\u00a0/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .toLowerCase();
}
function getProfileLineTranslation(langKey,line){
  const lang=PROFILE_LINE_TRANSLATIONS_RAW[langKey]?langKey:'';
  if(!lang)return '';
  let cache=PROFILE_LINE_TRANSLATIONS_CACHE[lang];
  if(!cache){
    cache={};
    const src=PROFILE_LINE_TRANSLATIONS_RAW[lang]??{};
    Object.entries(src).forEach(([k,v])=>{
      const nk=normalizeProfileKey(k);
      if(nk)cache[nk]=v;
    });
    PROFILE_LINE_TRANSLATIONS_CACHE[lang]=cache;
  }
  const key=normalizeProfileKey(line);
  return key?cache[key]??'':'';
}
function translateProfileLines(value,langKey){
  const lang=PROFILE_LINE_TRANSLATIONS_RAW[langKey]?langKey:'';
  if(!lang)return value;
  if(Array.isArray(value)){
    return value.map((line)=>getProfileLineTranslation(lang,line)||line);
  }
  if(typeof value==='string')return getProfileLineTranslation(lang,value)||value;
  return value;
}
function translateProfileMotto(value,langKey){
  const lang=PROFILE_MOTTO_TRANSLATIONS[langKey]?langKey:'';
  if(!lang||typeof value!=='string')return value;
  const map=PROFILE_MOTTO_TRANSLATIONS[lang];
  return map[value]??value;
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
    const hobbies=profileFieldValue(profile,'hobbies',[]);
    const hobbyText=formatHobbyList(hobbies);
    const profileText=profileFieldValue(profile,'profile','-');
    const profileHtml=profileParagraphsHtml(profileText);
    const zodiacTextRaw=profileFieldValue(profile,'zodiac','-');
    const zodiacText=PROFILE_ZODIAC_TRANSLATIONS[state.language]?.[zodiacTextRaw]??zodiacTextRaw;
    const zodiacMark=zodiacSymbol(zodiacText);
    const mottoText=profileFieldValue(profile,'motto','-');
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
  app.innerHTML=`<section class="home-wrap opponent-wrap"><header class="topbar home-topbar"><div><h2>${t('opponents')}</h2></div><div class="topbar-right"><div class="control-row"><button id="opponents-back" class="secondary">${t('home')}</button>${renderLangMenu('opponents-lang-menu')}</div></div></header><section class="home-panel opponent-panel"><div class="opponent-grid">${cards}</div></section></section>`;
  document.getElementById('opponents-back')?.addEventListener('click',()=>{state.screen='home';render();});
  bindLangMenu(document.querySelector('.topbar-right'),{reloadGoogle:!state.home.google?.signedIn});
}
function opponentProfileModalHtml(name){
  const profile=OPPONENT_PROFILE_BY_NAME[name]??{dob:'-',hobbies:{},profile:{},zodiac:{},motto:{}};
  const hobbies=profileFieldValue(profile,'hobbies',[]);
  const hobbyText=formatHobbyList(hobbies);
  const profileText=profileFieldValue(profile,'profile','-');
  const profileHtml=profileParagraphsHtml(profileText);
  const zodiacTextRaw=profileFieldValue(profile,'zodiac','-');
  const zodiacText=PROFILE_ZODIAC_TRANSLATIONS[state.language]?.[zodiacTextRaw]??zodiacTextRaw;
  const zodiacMark=zodiacSymbol(zodiacText);
  const mottoText=profileFieldValue(profile,'motto','-');
  const gender=botGenderByName(name);
  const genderLabel=gender==='female'?t('female'):t('male');
  const genderIcon=gender==='female'?'♀':'♂';
  const genderClass=gender==='female'?'gender-female':'gender-male';
  const avatarSrc=avatarDataUri(name,'#7aaed8',gender,true);
  const closeLabel=t('close');
  return`<div class="intro-modal opponent-profile-modal" id="opponent-profile-modal">
    <button class="intro-backdrop" id="opponent-profile-backdrop" aria-label="close"></button>
    <section class="intro-sheet opponent-profile-sheet">
      <header class="intro-head">
        <div>
          <h3 class="title-with-icon"><span class="title-icon-emoji" aria-hidden="true">👤</span><span>${esc(name)}</span><span class="opponent-gender-icon ${genderClass}" data-symbol="${genderIcon}" aria-label="${esc(genderLabel)}" title="${esc(genderLabel)}">${genderIcon}</span></h3>
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
      return`<div class="play-type-call ${seatClass} pass-call${fresh}${calloutClass}" style="--player-color:${color};${jitter}"><div class="callout-box"><div class="hk-inner">${emoteInlineHtml}<span class="${textClass}">${esc(activeCallout.text)}</span></div></div><div class="tail tail-${tailDir}"></div></div>`;
    }
    if(activeCallout.kind==='play'){
      const fresh=activeCallout.fresh?' play-type-call-fresh':'';
      const jitter=calloutJitterStyle(viewCls,`play|${seat}|${activeCallout.nonce}|${activeCallout.text}`);
      return`<div class="play-type-call ${seatClass}${fresh}${calloutClass}" style="--player-color:${color};${jitter}"><div class="callout-box"><div class="hk-inner">${emoteInlineHtml}<span class="${textClass}">${esc(activeCallout.text)}</span></div></div><div class="tail tail-${tailDir}"></div></div>`;
    }
    if(activeCallout.kind==='must3'){
      const fresh=activeCallout.fresh?' play-type-call-fresh':'';
      const jitter=calloutJitterStyle(viewCls,`must3|${seat}|${activeCallout.nonce}|${activeCallout.text}`);
      return`<div class="play-type-call ${seatClass}${fresh}${calloutClass}" style="--player-color:${color};${jitter}"><div class="callout-box"><div class="hk-inner">${emoteInlineHtml}<span class="${textClass}">${esc(activeCallout.text)}</span></div></div><div class="tail tail-${tailDir}"></div></div>`;
    }
    if(activeCallout.kind==='last'){
      const fresh=activeCallout.fresh?' last-card-call-fresh':'';
      const jitter=calloutJitterStyle(viewCls,`last|${seat}|${activeCallout.nonce}`);
      return`<div class="last-card-call ${lastClass}${fresh}${calloutClass}" style="--player-color:${color};${jitter}"><div class="callout-box"><div class="hk-inner">${emoteInlineHtml}<span class="${textClass}">${esc(activeCallout.text)}</span></div></div><div class="tail tail-${tailDir}"></div></div>`;
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
    if(!emoteDisplayEnabled)return'';
    if(!emoteSticker||emoteSeat===null||emoteSeat!==seat)return'';
    if(isSelf){
      return'';
    }
    if(state.emote.active?.suppressCallout)return'';
    const seatClass='play-type-call-seat';
    const tailDir=viewCls==='north'?'north':viewCls==='east'?'east':viewCls==='west'?'west':'south';
    const jitter=calloutJitterStyle(viewCls,`emote|${seat}|${activeEmote?.ts||0}|${emoteSticker.id}`);
    return`<div class="emote-callout ${seatClass}" data-emote-seat="${seat}" style="--player-color:${color};${jitter}"><div class="callout-box"><div class="hk-inner"><span class="emote-icon">${emoteImageHtml}</span></div></div><div class="tail tail-${tailDir}"></div></div>`;
  };
  const emoteHtml=(emoteDisplayEnabled&&emoteSticker&&Number.isInteger(v.selfSeat)&&emoteSeat===v.selfSeat)
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
    const mottoText=profileFieldValue(profile,'motto','');
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
  const portraitMode=isPortraitMode();
  const logSheetOpen=portraitMode&&state.showLogSheet;
  const logToggleStateIcon='';
  const logToggleStateText=t('log');
  const logSheetHtml=logSheetOpen?`<div class="log-sheet" id="log-sheet"><button class="log-sheet-backdrop" id="log-sheet-backdrop" aria-label="close"></button><section class="log-sheet-panel side-card log-side-card"><header class="log-sheet-head"><h3 class="log-toggle-title title-with-icon"><span class="title-icon title-icon-log" aria-hidden="true"></span><span>${t('log')}</span></h3><button id="log-sheet-close" class="secondary">${state.language==='zh-HK'?'關閉':'Close'}</button></header><div class="history-list">${historyHtml(v.history,v.selfSeat,v.systemLog)}</div></section></div>`:'';
  const isRecPass=state.recommendHint===t('recPass');
  const isRecEmpty=state.recommendHint===t('noSuggest');
  const showRecommendHint=Boolean(state.recommendHint)&&!isRecPass;
  const isRecPlay=state.recommendation?.action==='play';
  const emotePanel=state.emote.open?`<div class="emote-panel">${EMOTE_STICKERS.map((s)=>`<button class="emote-btn" data-emote-id="${s.id}" type="button"><img src="${withBase(`emotes/${s.file}`)}" alt="${s.id}"/><span class="emote-btn-label">${esc(t(`emoteLabel${s.id[0].toUpperCase()}${s.id.slice(1)}`))}</span></button>`).join('')}</div>`:'';
  const sideZoneHtml=portraitMode?'':`<aside class="side-zone"><section class="side-card log-side-card"><h3 class="log-toggle-title title-with-icon" aria-label="${esc(logToggleStateText)}"><span class="title-icon title-icon-log" aria-hidden="true"></span><span>${t('log')}</span></h3><div class="history-list">${historyHtml(v.history,v.selfSeat,v.systemLog)}</div></section></aside>`;
  app.innerHTML=`<section class="game-shell ${v.gameOver?'game-over':''} ${state.showLog?'log-open':''}"><div class="main-zone"><header class="topbar"><div class="game-title-wrap"><span class="game-logo-block"><img class="title-logo title-logo-game" src="${withBase('title-lockup-game.png')}" alt="鋤大D TRADITIONAL BIG TWO"/></span>${roomTopMeta}</div><div class="topbar-right"><div class="control-row">${renderLangMenu('game-lang-menu')}<button id="game-intro-toggle" class="secondary">${esc(intro.btnShow)}</button><button id="score-guide-toggle" class="secondary">${t('scoreGuide')}</button><button id="game-lb-toggle" class="secondary">${t('lb')}</button><button id="home-btn" class="secondary">${t('home')}</button><button id="restart-btn" class="primary">${t('restart')}</button></div></div></header><section class="table">${seatHtml}<div class="table-center-stack">${mobileNamesHtml}${mobileDiscardHtml}${centerMovesHtml(v)}${centerLastMovesHtml(lastActions,v.selfSeat)}${emoteHtml}</div>${(!v.gameOver&&youWin)?`<div class="win-celebrate"><div class="confetti-layer"></div><div class="win-banner">${t('congrats')}</div></div>`:''}</section><section class="action-zone"><div class="action-strip ${v.canControl&&!v.gameOver?'active':''}" style="--player-color:${playerColorByViewClass('south')};"><div class="seat-name-fixed player-tag"><div class="name">${selfAvatar}<span class="seat-identity"><span class="seat-name-text">${esc(selfName)}</span><span class="seat-subline">${selfScore}</span></span></div></div>${selfCalloutHtml}<div class="control-row"><button id="play-btn" class="primary game-cta-btn ${isRecPlay?'recommend-glow-play':''}" ${canPlay?'':'disabled'}><span aria-hidden="true">▶</span><span>${t('play')}</span></button><button id="pass-btn" class="danger game-cta-btn ${isRecPass?'recommend-glow':''}" ${v.canPass?'':'disabled'}><span aria-hidden="true">✖</span><span>${t('pass')}</span></button><span class="recommend-anchor"><button id="suggest-btn" class="secondary game-cta-btn" ${canSuggest?'':'disabled'}><span aria-hidden="true">💡</span><span>${t('suggest')}</span></button>${showRecommendHint?`<span class="recommend-layer"><span class="hint recommend-hint ${isRecEmpty?'rec-empty':''}"><span class="recommend-bulb" aria-hidden="true">💡</span><span>${esc(state.recommendHint)}</span></span></span>`:''}</span><button id="emote-toggle" class="secondary game-cta-btn emote-toggle" type="button"><span aria-hidden="true">😆</span><span>${t('emote')}</span></button><button id="auto-sort-btn" class="secondary game-cta-btn auto-sort-btn" ${canAutoSort?'':'disabled'}><svg class="sort-icon" aria-hidden="true" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.430.636-.980 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.980-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173 1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/><path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.120.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192"/></svg></button></div>${emotePanel}<div class="hand">${v.hand.map((c,i)=>renderHandCard(c,state.selected.has(cardId(c)),(showMust3Highlight&&isLowestSingle(c))?'must3-highlight':'',i+1)).join('')}</div><div class="drag-popup" id="drag-popup">${t('drag')}</div></div></section>${v.gameOver?'':congratsOverlayHtml(v,youWin)}${revealHtml(v,arr)}</div>${sideZoneHtml}${v.gameOver?resultScreenHtml(v,arr):''}${state.opponentProfileName?opponentProfileModalHtml(state.opponentProfileName):''}${state.showScoreGuide?scoreGuideModalHtml():''}${state.home.showIntro?introPanelHtml():''}${state.home.showLeaderboard?leaderboardModalHtml():''}</section>`;
  const appEl=document.getElementById('app');
  if(appEl){
    let logFab=appEl.querySelector('#game-log-fab');
    if(!logFab){
      const btn=document.createElement('button');
      btn.id='game-log-fab';
      btn.type='button';
      btn.className='game-log-fab';
      btn.setAttribute('aria-label',t('log'));
      btn.innerHTML=`<span class="title-icon title-icon-log" aria-hidden="true"></span><span class="game-log-fab-text">${t('log')}</span>`;
      btn.setAttribute('data-ignore-click','0');
      appEl.appendChild(btn);
      logFab=btn;
    }
    const existingSheet=appEl.querySelector('#log-sheet');
    if(existingSheet)existingSheet.remove();
    if(logSheetOpen){
      appEl.insertAdjacentHTML('beforeend',logSheetHtml);
    }
    if(logFab instanceof HTMLElement){
      let x=state.logFab?.x;
      let y=state.logFab?.y;
      const pad=8;
      const viewW=Math.max(0,window.innerWidth||0);
      const viewH=Math.max(0,window.innerHeight||0);
      const lastW=Number(state.logFab?.vw||0);
      const lastH=Number(state.logFab?.vh||0);
      if(Number.isFinite(x)&&Number.isFinite(y)&&lastW>0&&lastH>0&&(lastW!==viewW||lastH!==viewH)){
        x=(x/lastW)*viewW;
        y=(y/lastH)*viewH;
      }
      const fabW=Math.max(0,logFab.offsetWidth||0);
      const fabH=Math.max(0,logFab.offsetHeight||0);
      const maxX=Math.max(0,viewW-fabW-pad);
      const maxY=Math.max(0,viewH-fabH-pad);
      if(Number.isFinite(x)&&Number.isFinite(y)){
        const nx=Math.max(pad,Math.min(x,maxX));
        const ny=Math.max(pad,Math.min(y,maxY));
        state.logFab.x=nx;
        state.logFab.y=ny;
        state.logFab.vw=viewW;
        state.logFab.vh=viewH;
        logFab.style.left=`${nx}px`;
        logFab.style.top=`${ny}px`;
        logFab.style.right='auto';
        logFab.style.bottom='auto';
      }else{
        logFab.style.removeProperty('left');
        logFab.style.removeProperty('top');
        logFab.style.removeProperty('right');
        logFab.style.removeProperty('bottom');
      }
    }
  }
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
  const isMobile=isMobilePointer();
  const margin=isMobile?5:8;
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
      if(isMobile){
        bubble.style.setProperty('--callout-box-shift-x',`${sx.toFixed(1)}px`);
        bubble.style.setProperty('--callout-box-shift-y',`${sy.toFixed(1)}px`);
        bubble.style.removeProperty('--callout-shift-x');
        bubble.style.removeProperty('--callout-shift-y');
      }else{
        bubble.style.setProperty('--callout-shift-x',`${sx.toFixed(1)}px`);
        bubble.style.setProperty('--callout-shift-y',`${sy.toFixed(1)}px`);
        bubble.style.removeProperty('--callout-box-shift-x');
        bubble.style.removeProperty('--callout-box-shift-y');
      }
    }else{
      bubble.style.removeProperty('--callout-shift-x');
      bubble.style.removeProperty('--callout-shift-y');
      bubble.style.removeProperty('--callout-box-shift-x');
      bubble.style.removeProperty('--callout-box-shift-y');
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

  bindLangMenu(document.querySelector('.topbar-right'),{reloadGoogle:!state.home.google?.signedIn});
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
    closeLangMenu();
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
  document.getElementById('log-sheet-close')?.addEventListener('click',()=>{state.showLogSheet=false;render();});
  document.getElementById('log-sheet-backdrop')?.addEventListener('click',()=>{state.showLogSheet=false;render();});
  const logFab=document.getElementById('game-log-fab');
  if(logFab){
    let dragActive=false;
    let moved=false;
    let startX=0;
    let startY=0;
    let originX=0;
    let originY=0;
    const clamp=(val,min,max)=>Math.max(min,Math.min(max,val));
    const setFabPos=(x,y)=>{
      const maxX=Math.max(0,window.innerWidth-logFab.offsetWidth);
      const maxY=Math.max(0,window.innerHeight-logFab.offsetHeight);
      const nx=clamp(x,8,maxX-8);
      const ny=clamp(y,8,maxY-8);
      state.logFab.x=nx;
      state.logFab.y=ny;
      state.logFab.vw=window.innerWidth||0;
      state.logFab.vh=window.innerHeight||0;
      logFab.style.left=`${nx}px`;
      logFab.style.top=`${ny}px`;
      logFab.style.right='auto';
      logFab.style.bottom='auto';
    };
    const startDrag=(clientX,clientY)=>{
      dragActive=true;
      moved=false;
      startX=clientX;
      startY=clientY;
      const rect=logFab.getBoundingClientRect();
      originX=rect.left;
      originY=rect.top;
    };
    const moveDrag=(clientX,clientY)=>{
      if(!dragActive)return;
      const dx=clientX-startX;
      const dy=clientY-startY;
      if(!moved && Math.hypot(dx,dy)>6){
        moved=true;
        logFab.setAttribute('data-ignore-click','1');
      }
      if(moved)setFabPos(originX+dx,originY+dy);
    };
    const endDrag=()=>{
      dragActive=false;
    };
    logFab.addEventListener('pointerdown',(ev)=>{
      if(ev.pointerType==='mouse')return;
      startDrag(ev.clientX,ev.clientY);
    },{passive:true});
    logFab.addEventListener('pointermove',(ev)=>{
      if(ev.pointerType==='mouse')return;
      moveDrag(ev.clientX,ev.clientY);
    },{passive:true});
    logFab.addEventListener('pointerup',endDrag,{passive:true});
    logFab.addEventListener('pointercancel',endDrag,{passive:true});
    if(!window.PointerEvent){
      logFab.addEventListener('touchstart',(ev)=>{
        const t=ev.changedTouches?.[0];
        if(!t)return;
        startDrag(t.clientX,t.clientY);
      },{passive:true});
      logFab.addEventListener('touchmove',(ev)=>{
        const t=ev.changedTouches?.[0];
        if(!t)return;
        moveDrag(t.clientX,t.clientY);
      },{passive:true});
      logFab.addEventListener('touchend',endDrag,{passive:true});
      logFab.addEventListener('touchcancel',endDrag,{passive:true});
    }
  }
  if(!logSheetSwipeBound){
    const shouldHandle=(target)=>{
      if(!(target instanceof Element))return false;
      if(!target.closest('.table'))return false;
      if(target.closest('.log-sheet,.topbar,.action-zone,.hand,.game-cta-btn,.side-zone,.log-side-card'))return false;
      return true;
    };
    document.body.addEventListener('touchstart',(ev)=>{
      if(state.screen!=='game')return;
      if(!isMobilePointer())return;
      if(state.showLogSheet)return;
      const portrait=window.matchMedia?.('(orientation: portrait)')?.matches ?? (window.innerHeight>window.innerWidth);
      if(!portrait)return;
      const t=ev.changedTouches?.[0];
      if(!t||!shouldHandle(ev.target))return;
      logSwipeActive=true;
      logSwipeStartX=t.clientX;
      logSwipeStartY=t.clientY;
      logSwipeStartAt=Date.now();
    },{passive:true});
    document.body.addEventListener('touchend',(ev)=>{
      if(!logSwipeActive)return;
      logSwipeActive=false;
      if(state.screen!=='game'||state.showLogSheet)return;
      const t=ev.changedTouches?.[0];
      if(!t)return;
      const dt=Date.now()-logSwipeStartAt;
      if(dt>700)return;
      const dx=t.clientX-logSwipeStartX;
      const dy=logSwipeStartY-t.clientY;
      if(dy<90)return;
      if(Math.abs(dx)>Math.max(28,dy*0.5))return;
      state.showLogSheet=true;
      render();
    },{passive:true});
    document.body.addEventListener('touchcancel',()=>{logSwipeActive=false;},{passive:true});
    logSheetSwipeBound=true;
  }
  document.getElementById('score-guide-close')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('score-guide-backdrop')?.addEventListener('click',()=>{state.showScoreGuide=false;render();});
  document.getElementById('opponent-profile-close')?.addEventListener('click',()=>{state.opponentProfileName='';render();});
  document.getElementById('opponent-profile-backdrop')?.addEventListener('click',()=>{state.opponentProfileName='';render();});
  const handleRestart=async()=>{
    closeLangMenu();
    triggerClickBanner(document.getElementById('restart-btn'));
    await waitMs(120);
    state.opponentProfileName='';
    state.recommendation=null;
    setRecommendHint('');
    startSoloGame();
    schedulePopunderAfterRender(1200);
  };
  const restartBtn=document.getElementById('restart-btn');
  restartBtn?.addEventListener('pointerdown',(e)=>{
    if(!guardAction('restart-btn'))return;
    e.preventDefault();
    e.stopPropagation();
    void handleRestart();
  },true);
  restartBtn?.addEventListener('click',()=>{if(!guardAction('restart-btn'))return;void handleRestart();});
  const handleResultAgain=async()=>{
    triggerClickBanner(document.getElementById('result-again'));
    await waitMs(120);
    state.opponentProfileName='';
    state.recommendation=null;
    setRecommendHint('');
    if(state.home.mode==='room'){
      if(roomIsHost()){
        await restartRoomGame();
      }else{
        setSoloStatus(t('roomWaitingHost'));
        render();
      }
      return;
    }
    startSoloGame();
    schedulePopunderAfterRender(350);
  };
  const resultAgainBtn=document.getElementById('result-again');
  resultAgainBtn?.addEventListener('pointerdown',(e)=>{
    if(!guardAction('result-again'))return;
    e.preventDefault();
    e.stopPropagation();
    void handleResultAgain();
  },true);
  resultAgainBtn?.addEventListener('click',()=>{if(!guardAction('result-again'))return;void handleResultAgain();});
  const handleCongratsAgain=async()=>{
    triggerClickBanner(document.getElementById('congrats-again'));
    await waitMs(120);
    state.opponentProfileName='';
    state.recommendation=null;
    setRecommendHint('');
    if(state.home.mode==='room'){
      if(roomIsHost()){
        await restartRoomGame();
      }else{
        setSoloStatus(t('roomWaitingHost'));
        render();
      }
      return;
    }
    startSoloGame();
    schedulePopunderAfterRender(350);
  };
  const congratsAgainBtn=document.getElementById('congrats-again');
  congratsAgainBtn?.addEventListener('pointerdown',(e)=>{
    if(!guardAction('congrats-again'))return;
    e.preventDefault();
    e.stopPropagation();
    void handleCongratsAgain();
  },true);
  congratsAgainBtn?.addEventListener('click',()=>{if(!guardAction('congrats-again'))return;void handleCongratsAgain();});
  const controlRow=app.querySelector('.action-zone .control-row');
  if(controlRow){
    const suggestAnchor=controlRow.querySelector('.recommend-anchor');
    const playBtn=controlRow.querySelector('#play-btn');
    const passBtn=controlRow.querySelector('#pass-btn');
    const sortBtn=controlRow.querySelector('#auto-sort-btn');
    const emoteBtn=controlRow.querySelector('#emote-toggle');
    const order=[suggestAnchor,playBtn,passBtn,sortBtn,emoteBtn].filter(Boolean);
    order.forEach((node)=>controlRow.appendChild(node));
    const suggestBtn=controlRow.querySelector('#suggest-btn');
    if(suggestBtn){
      const label=suggestBtn.querySelector('span:not([aria-hidden])');
      if(label)label.remove();
      suggestBtn.setAttribute('aria-label',t('suggest'));
      suggestBtn.setAttribute('title',t('suggest'));
    }
    if(emoteBtn){
      const label=emoteBtn.querySelector('span:not([aria-hidden])');
      if(label)label.remove();
      emoteBtn.setAttribute('aria-label',t('emote'));
      emoteBtn.setAttribute('title',t('emote'));
    }
  }
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

  document.querySelectorAll('.locked-btn').forEach((wrap)=>{
    wrap.addEventListener('click',(ev)=>{
      ev.preventDefault();
      ev.stopPropagation();
      wrap.classList.add('show-tip');
      const timer=wrap.getAttribute('data-tip-timer');
      if(timer)window.clearTimeout(Number(timer));
      const t=window.setTimeout(()=>{wrap.classList.remove('show-tip');},1600);
      wrap.setAttribute('data-tip-timer',String(t));
    });
  });

  const openNamecardProfile=(btn,ev)=>{
    if(ev){
      ev.preventDefault();
      ev.stopPropagation();
    }
    const now=Date.now();
    if(now-lastNamecardTapAt<350)return;
    lastNamecardTapAt=now;
    const name=btn.getAttribute('data-opponent-name')||btn.closest?.('[data-opponent-name]')?.getAttribute('data-opponent-name');
    if(!name)return;
    state.mottoPeekName='';
    state.opponentProfileName=name;
    render();
  };
  app.querySelectorAll('.seat-namecard').forEach((btn)=>{
    btn.addEventListener('click',(ev)=>openNamecardProfile(btn,ev));
    btn.addEventListener('touchstart',(ev)=>openNamecardProfile(btn,ev),{passive:false});
  });

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
  document.getElementById('play-btn')?.addEventListener('click',()=>{closeLangMenu();unlockAudio();const cards=v.hand.filter((c)=>state.selected.has(cardId(c)));void runPlay(cards);});
}

function isPortraitMode(){
  const query=window.matchMedia?.('(orientation: portrait)');
  if(query)return query.matches;
  return window.innerHeight>window.innerWidth;
}
function isPortraitLogSheetOpen(){
  if(state.screen!=='game'||!state.showLogSheet)return false;
  return isPortraitMode();
}
function syncLogFabPosition(){
  const logFab=document.getElementById('game-log-fab');
  if(!(logFab instanceof HTMLElement))return;
  let x=state.logFab?.x;
  let y=state.logFab?.y;
  if(!Number.isFinite(x)||!Number.isFinite(y))return;
  const viewW=Math.max(0,window.innerWidth||0);
  const viewH=Math.max(0,window.innerHeight||0);
  const lastW=Number(state.logFab?.vw||0);
  const lastH=Number(state.logFab?.vh||0);
  if(lastW>0&&lastH>0&&(lastW!==viewW||lastH!==viewH)){
    x=(x/lastW)*viewW;
    y=(y/lastH)*viewH;
  }
  const pad=8;
  const fabW=Math.max(0,logFab.offsetWidth||0);
  const fabH=Math.max(0,logFab.offsetHeight||0);
  if(!fabW||!fabH)return;
  const maxX=Math.max(0,viewW-fabW-pad);
  const maxY=Math.max(0,viewH-fabH-pad);
  const nx=Math.max(pad,Math.min(x,maxX));
  const ny=Math.max(pad,Math.min(y,maxY));
  state.logFab.x=nx;
  state.logFab.y=ny;
  state.logFab.vw=viewW;
  state.logFab.vh=viewH;
  logFab.style.left=`${nx}px`;
  logFab.style.top=`${ny}px`;
  logFab.style.right='auto';
  logFab.style.bottom='auto';
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
  if(state.screen==='game'&&!isPortraitMode()){
    state.showLog=true;
  }
  document.body.setAttribute('data-log-open',state.screen==='game'&&state.showLog?'1':'0');
  document.body.setAttribute('data-log-sheet',isPortraitLogSheetOpen()?'1':'0');
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
  const orientation=isPortraitMode()?'portrait':'landscape';
  const orientationChanged=Boolean(lastOrientation)&&orientation!==lastOrientation;
  lastOrientation=orientation;
  document.body.setAttribute('data-orientation',orientation);
  syncLogFabPosition();
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
const bootstrapAudioAndSpeech=()=>{if(!sound.enabled)return;unlockAudio();primeSpeech();};
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
