(function () {
  var DEFAULT_WORDS = [
    '广告', '推广', '促销', '打折', '优惠', '特价', '免费领取',
    '点击购买', '立即购买', '限时抢购', '跳楼价',
    '清仓处理', '亏本甩卖', '加微信', '加V',
    '代购', '刷单', '兼职', '招聘', '日结',
    '日赚', '月入过万', '轻松赚钱',
    '最好', '最佳', '最强', '最低', '最优', '第一', '唯一', '首创',
    '销量冠军', '全国第一', '极致',
    '投资回报', '保本', '稳赚不赔',
  ];

  function SensitiveWords(words) {
    this._words = (words || DEFAULT_WORDS).slice();
  }

  SensitiveWords.prototype.getWords = function () {
    return this._words.slice();
  };

  SensitiveWords.prototype.addWords = function (wordOrList) {
    var toAdd = Array.isArray(wordOrList) ? wordOrList : [wordOrList];
    for (var i = 0; i < toAdd.length; i++) {
      if (this._words.indexOf(toAdd[i]) === -1) {
        this._words.push(toAdd[i]);
      }
    }
  };

  SensitiveWords.prototype.removeWords = function (wordOrList) {
    var toRemove = Array.isArray(wordOrList) ? wordOrList : [wordOrList];
    for (var i = 0; i < toRemove.length; i++) {
      var idx = this._words.indexOf(toRemove[i]);
      if (idx !== -1) {
        this._words.splice(idx, 1);
      }
    }
  };

  SensitiveWords.prototype.detect = function (text) {
    if (!text) return [];
    var results = [];
    var seen = {};
    for (var i = 0; i < this._words.length; i++) {
      var word = this._words[i];
      var idx = 0;
      while ((idx = text.indexOf(word, idx)) !== -1) {
        var key = word + ':' + idx;
        if (!seen[key]) {
          seen[key] = true;
          results.push({ word: word, index: idx, length: word.length });
        }
        idx += word.length;
      }
    }
    results.sort(function (a, b) { return a.index - b.index; });
    return results;
  };

  window.SensitiveWords = SensitiveWords;
})();
