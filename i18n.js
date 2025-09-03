// 多语言配置
const i18nData = {
  'zh-CN': {
    title: '转盘抽奖',
    subtitle: '8格 · 8种颜色 · 一等奖1名 · 二等奖1名 · 三等奖1名',
    startSpin: '开始抽奖',
    resetQuota: '重置名额',
    resetQuotaTitle: '恢复一等奖/二等奖/三等奖名额',
    note: '说明：每个大奖仅1名。抽到已抽完的大奖视为未中奖。',
    footer: '纯前端示例，名额状态保存在本地浏览器（localStorage）。',
    firstPrize: '一等奖',
    secondPrize: '二等奖',
    thirdPrize: '三等奖',
    thankYou: '谢谢参与',
    spinning: '正在抽取…',
    congratulations: '恭喜获得：{prize}！',
    thanksForParticipation: '谢谢参与，下次好运！',
    prizeExhausted: '{prize} 名额已抽完，本次视为未中奖。',
    quotaReset: '名额已重置。',
    remaining: '剩余 {count}',
    exhausted: '已抽完',
    totalQuota: '总名额：1 · 本地保存'
  },
  'zh-TW': {
    title: '轉盤抽獎',
    subtitle: '8格 · 8種顏色 · 一等獎1名 · 二等獎1名 · 三等獎1名',
    startSpin: '開始抽獎',
    resetQuota: '重置名額',
    resetQuotaTitle: '恢復一等獎/二等獎/三等獎名額',
    note: '說明：每個大獎僅1名。抽到已抽完的大獎視為未中獎。',
    footer: '純前端示例，名額狀態保存在本地瀏覽器（localStorage）。',
    firstPrize: '一等獎',
    secondPrize: '二等獎',
    thirdPrize: '三等獎',
    thankYou: '謝謝參與',
    spinning: '正在抽取…',
    congratulations: '恭喜獲得：{prize}！',
    thanksForParticipation: '謝謝參與，下次好運！',
    prizeExhausted: '{prize} 名額已抽完，本次視為未中獎。',
    quotaReset: '名額已重置。',
    remaining: '剩餘 {count}',
    exhausted: '已抽完',
    totalQuota: '總名額：1 · 本地保存'
  },
  'en': {
    title: 'Lucky Wheel',
    subtitle: '8 Sections · 8 Colors · 1st Prize ×1 · 2nd Prize ×1 · 3rd Prize ×1',
    startSpin: 'Start Spin',
    resetQuota: 'Reset Quota',
    resetQuotaTitle: 'Restore quotas for 1st/2nd/3rd prizes',
    note: 'Note: Each major prize has only 1 quota. Drawing an exhausted prize counts as no prize.',
    footer: 'Frontend demo, quota status saved in local browser (localStorage).',
    firstPrize: '1st Prize',
    secondPrize: '2nd Prize',
    thirdPrize: '3rd Prize',
    thankYou: 'Thank You',
    spinning: 'Drawing...',
    congratulations: 'Congratulations! You won: {prize}!',
    thanksForParticipation: 'Thank you for participating, better luck next time!',
    prizeExhausted: '{prize} quota exhausted, this draw counts as no prize.',
    quotaReset: 'Quota has been reset.',
    remaining: '{count} left',
    exhausted: 'Exhausted',
    totalQuota: 'Total quota: 1 · Locally saved'
  }
};

// 语言管理类
class I18n {
  constructor() {
    this.currentLang = this.getStoredLanguage() || this.detectLanguage();
    this.data = i18nData;
  }

  detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK')) {
      return 'zh-TW';
    } else if (browserLang.startsWith('zh')) {
      return 'zh-CN';
    }
    return 'en';
  }

  getStoredLanguage() {
    return localStorage.getItem('wheel-language');
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('wheel-language', lang);
    document.documentElement.lang = lang;
    this.updateUI();
  }

  t(key, params = {}) {
    let text = this.data[this.currentLang]?.[key] || this.data['zh-CN'][key] || key;
    
    // 替换参数
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  }

  updateUI() {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });

    // 更新带有 data-i18n-title 属性的元素的 title
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });

    // 更新语言选择器
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
      langSelect.value = this.currentLang;
    }

    // 更新页面标题
    document.title = this.t('title');
  }

  init() {
    this.updateUI();
    
    // 绑定语言选择器事件
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }
  }
}

// 创建全局 i18n 实例
window.i18n = new I18n();