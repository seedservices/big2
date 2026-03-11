from pathlib import Path
import re
p=Path(r'C:\git\big2\src\main.js')
text=p.read_text(encoding='utf-8')
zh_items=[
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
  '以上組合大小依次為：蛇 < 花 < 俘虜 < 四條 < 同花順',
]
en_items=[
  'All legal play combinations are listed below:',
  'Single card',
  'Pair',
  'Pairs follow the single-card rule: must beat the previous pair. Example: \u2665A\u2660A beats \u2665K\u2660K. If ranks are the same, compare the higher suit.',
  'Triple (three cards must be the same rank)',
  'Five-card hands',
  'Straight: five consecutive ranks. A-2-3-4-5 is the highest, 3-4-5-6-7 is the lowest. If two straights have the same ranks, compare the suit of the highest card. Straights cannot be J-Q-K-A-2, Q-K-A-2-3, or K-A-3-4-5.',
  'Flush: any five cards of the same suit that are not consecutive. Compare by the highest rank, then the second highest, and so on; finally compare suit if still tied. Example: \u26602-4-5-6-8 beats \u2665A-K-Q-10-8.',
  'Full House: a pair plus three of a kind. Compare by the triple rank.',
  'Four of a Kind: four cards of the same rank plus any single. Compare by the four-card rank.',
  'Straight Flush (Royal Flush): a straight in the same suit. The highest straight flush is \u2660A-2-3-4-5.',
  'Hand order: Straight < Flush < Full House < Four of a Kind < Straight Flush.',
]

def replace_rule_items(block, items):
    arr=',\n      '.join([f"'{x}'" for x in items])
    return re.sub(r"ruleItems:\s*\[(.*?)\]", f"ruleItems:[\n      {arr}\n    ]", block, flags=re.S)

parts=text.split('en:{',1)
zh=parts[0]
rest='en:{'+parts[1]
zh=replace_rule_items(zh, zh_items)
rest=replace_rule_items(rest, en_items)
new_text=zh+rest
p.write_text(new_text, encoding='utf-8')
