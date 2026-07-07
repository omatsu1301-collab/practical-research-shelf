/* =========================
  実践型リサーチ棚
  script.js
========================= */

document.addEventListener("DOMContentLoaded", () => {
  injectExtraStyles();

  setupTodayDate();
  setupSidebarNavigation();
  setupSidebarToggle();
  setupCheckboxMemory();
  setupPracticeLogTabs();
  setupSearchFilter();
  setupPlaceholderLinks();
  setupNotificationButton();
});

/* =========================
  0. JS用の追加スタイル
  style.cssを大きく触らず、動きに必要な見た目だけ足す
========================= */

function injectExtraStyles() {
  const style = document.createElement("style");

  style.textContent = `
    .is-done span {
      text-decoration: line-through;
      opacity: 0.55;
    }

    .card.is-dimmed {
      opacity: 0.32;
      transform: scale(0.985);
      transition: opacity 160ms ease, transform 160ms ease;
    }

    .app-toast {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 9999;
      max-width: 320px;
      padding: 14px 16px;
      color: #fffdf8;
      background: rgba(47, 40, 31, 0.92);
      border: 1px solid rgba(255, 253, 248, 0.16);
      border-radius: 14px;
      box-shadow: 0 14px 34px rgba(47, 40, 31, 0.24);
      font-size: 14px;
      line-height: 1.6;
      opacity: 0;
      transform: translateY(12px);
      pointer-events: none;
      transition: opacity 180ms ease, transform 180ms ease;
    }

    .app-toast.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .sidebar.is-collapsed {
      display: none;
    }

    .sidebar-open-button {
      position: fixed;
      left: 18px;
      bottom: 18px;
      z-index: 9998;
      padding: 10px 14px;
      color: #5e4630;
      background: #fffdf8;
      border: 1px solid #e3d8c9;
      border-radius: 999px;
      box-shadow: 0 8px 18px rgba(69, 52, 35, 0.12);
      font-weight: 700;
      display: none;
    }

    .sidebar-open-button.is-visible {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .search-box.is-active {
      outline: 2px solid rgba(138, 106, 67, 0.25);
    }

    .timeline-item {
      animation: softAppear 180ms ease both;
    }

    @keyframes softAppear {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  document.head.appendChild(style);
}

/* =========================
  1. 今日の日付を表示
========================= */

function setupTodayDate() {
  const dateElement = document.querySelector(".today-date");

  if (!dateElement) return;

  const now = new Date();

  const formattedDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);

  dateElement.textContent = formattedDate;
}

/* =========================
  2. サイドバーのアクティブ切り替え
========================= */

function setupSidebarNavigation() {
  const navLinks = document.querySelectorAll(".sidebar .nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      navLinks.forEach((item) => {
        item.classList.remove("is-active");
      });

      link.classList.add("is-active");

      const label = link.textContent.trim().replace(/\s+/g, " ");
      showToast(`「${label}」を選択した。まだ画面遷移は未実装だ。棚だけ先に建った状態。`);
    });
  });
}

/* =========================
  3. サイドバー開閉
========================= */

function setupSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const closeButton = document.querySelector(".sidebar-close-button");

  if (!sidebar || !closeButton) return;

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "sidebar-open-button";
  openButton.textContent = "☰ 棚を開く";
  document.body.appendChild(openButton);

  closeButton.addEventListener("click", () => {
    sidebar.classList.add("is-collapsed");
    openButton.classList.add("is-visible");
    showToast("サイドバーを閉じた。机の上は広くなったが、ちょっと寂しいな。");
  });

  openButton.addEventListener("click", () => {
    sidebar.classList.remove("is-collapsed");
    openButton.classList.remove("is-visible");
    showToast("サイドバーを開いた。棚、帰還。");
  });
}

/* =========================
  4. チェックボックスの状態保存
  localStorageに保存する
========================= */

function setupCheckboxMemory() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  checkboxes.forEach((checkbox, index) => {
    const label = checkbox.closest("label");
    const key = createCheckboxKey(label, index);

    const savedValue = localStorage.getItem(key);

    if (savedValue === "true") {
      checkbox.checked = true;
      updateCheckboxStyle(checkbox);
    }

    checkbox.addEventListener("change", () => {
      localStorage.setItem(key, String(checkbox.checked));
      updateCheckboxStyle(checkbox);

      const text = label ? label.textContent.trim().replace(/\s+/g, " ") : "項目";

      if (checkbox.checked) {
        showToast(`「${text}」を完了にした。小さいが進んだ。偉い、というより事実として進んだ。`);
      } else {
        showToast(`「${text}」を未完了に戻した。記録は正直な方が強い。`);
      }
    });
  });
}

function createCheckboxKey(label, index) {
  const text = label ? label.textContent.trim().replace(/\s+/g, "-") : `checkbox-${index}`;
  return `research-shelf-checkbox-${index}-${text}`;
}

function updateCheckboxStyle(checkbox) {
  const label = checkbox.closest("label");

  if (!label) return;

  if (checkbox.checked) {
    label.classList.add("is-done");
  } else {
    label.classList.remove("is-done");
  }
}

/* =========================
  5. 実践ログのタブ切り替え
========================= */

function setupPracticeLogTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const timeline = document.querySelector(".timeline");

  if (!tabButtons.length || !timeline) return;

  const logData = {
    today: [
      {
        icon: "📖",
        time: "09:15",
        title: "読書実践",
        text: "Atomic Habits 第3章まで精読。習慣スコアリングの手法が参考になった。",
      },
      {
        icon: "🧪",
        time: "14:40",
        title: "実験・検証",
        text: "朝のルーティンを10分短縮する実験。集中時間が+23分増加。",
      },
      {
        icon: "📝",
        time: "21:10",
        title: "学びの記録",
        text: "if-thenプランの具体例を3つ作成。",
      },
    ],

    week: [
      {
        icon: "🏋️",
        time: "月",
        title: "トレーニング記録",
        text: "胸・背中・脚の3セッションを完了。疲労はあるが、継続ラインは守れている。",
      },
      {
        icon: "🍚",
        time: "水",
        title: "食事調整",
        text: "タンパク質は安定。炭水化物量をトレーニング日に少し寄せる方針を試す。",
      },
      {
        icon: "📚",
        time: "金",
        title: "海外記事精読",
        text: "nutrition系記事を2本読了。英語表現は“satiety”と“adherence”が収穫。",
      },
    ],

    month: [
      {
        icon: "📈",
        time: "1週",
        title: "棚の成長",
        text: "記事カード、英語メモ、実践ログの初版を作成。まずは使える箱ができた。",
      },
      {
        icon: "🧠",
        time: "2週",
        title: "学習の気づき",
        text: "完成品から逆算すると、HTML/CSS/JSの役割が見えやすい。",
      },
      {
        icon: "🧰",
        time: "3週",
        title: "次の改善候補",
        text: "記事追加フォーム、検索機能、データ分離を候補にする。",
      },
    ],
  };

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedTab = button.dataset.tab;

      tabButtons.forEach((item) => {
        item.classList.remove("is-active");
      });

      button.classList.add("is-active");

      renderTimeline(timeline, logData[selectedTab] || logData.today);

      const label = button.textContent.trim();
      showToast(`実践ログを「${label}」表示に切り替えた。`);
    });
  });
}

function renderTimeline(timeline, logs) {
  timeline.innerHTML = "";

  logs.forEach((log) => {
    const item = document.createElement("li");
    item.className = "timeline-item";

    item.innerHTML = `
      <div class="timeline-icon">${log.icon}</div>
      <div class="timeline-content">
        <time>${log.time}</time>
        <h3>${log.title}</h3>
        <p>${log.text}</p>
      </div>
    `;

    timeline.appendChild(item);
  });
}

/* =========================
  6. 検索欄
  今はカード単位の簡易フィルター
========================= */

function setupSearchFilter() {
  const searchInput = document.querySelector(".search-box input");
  const searchBox = document.querySelector(".search-box");
  const cards = document.querySelectorAll(".dashboard-grid .card");

  if (!searchInput || !cards.length) return;

  searchInput.addEventListener("focus", () => {
    searchBox?.classList.add("is-active");
  });

  searchInput.addEventListener("blur", () => {
    searchBox?.classList.remove("is-active");
  });

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {
      cards.forEach((card) => {
        card.classList.remove("is-dimmed");
      });
      return;
    }

    cards.forEach((card) => {
      const cardText = card.textContent.toLowerCase();
      const isMatch = cardText.includes(keyword);

      if (isMatch) {
        card.classList.remove("is-dimmed");
      } else {
        card.classList.add("is-dimmed");
      }
    });
  });
}

/* =========================
  7. 未実装リンクの反応
========================= */

function setupPlaceholderLinks() {
  const placeholderLinks = document.querySelectorAll('a[href="#"]:not(.nav-link)');

  placeholderLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const text = link.textContent.trim().replace(/\s+/g, " ");
      showToast(`「${text}」はまだ未実装。次の改築候補だな。`);
    });
  });
}

/* =========================
  8. 通知ボタン
========================= */

function setupNotificationButton() {
  const notificationButton = document.querySelector(".icon-button");

  if (!notificationButton) return;

  notificationButton.addEventListener("click", () => {
    showToast("通知はまだ空。平和だ。アプリにおける平和はだいたい仮初めだが。");
  });
}

/* =========================
  9. トースト通知
========================= */

let toastTimer = null;

function showToast(message) {
  let toast = document.querySelector(".app-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "app-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}
