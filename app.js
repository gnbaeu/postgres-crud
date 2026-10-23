"use strict";

const API_BASE = "http://localhost:3000";
const TABLE = "/customer";
const API_PAGE_SIZE = 500;
const PAGE_SIZE = 10;
const THEME_KEY = "ganbat-customer-theme";
const LANGUAGE_KEY = "ganbat-customer-language";

const UI_TEXT = {
  mn: {
    "splash.message": "Хэрэглэгчийн орчныг ачаалж байна", "splash.subtext": "Өгөгдөлтэй холболт үүсгэж байна",
    "theme.toLight": "Цайвар горимд шилжих", "theme.toDark": "Бараан горимд шилжих",
    "language.toEnglish": "Хэлийг англи болгох", "language.toMongolian": "Хэлийг монгол болгох",
    "nav.workspace": "Ажлын орчин", "nav.overview": "Тойм", "nav.customers": "Хэрэглэгчид", "nav.analytics": "Аналитик", "nav.settings": "Тохиргоо", "profile.role": "Администратор",
    "page.title": "Хэрэглэгчийн удирдлага · GANBAT", "page.overviewTitle": "Тойм", "page.overviewDescription": "Хэрэглэгчдийн ерөнхий мэдээлэл.", "page.customersTitle": "Хэрэглэгчид", "page.customersDescription": "Харилцагчдын мэдээллээ нэг дороос удирдаарай.", "page.analyticsTitle": "Аналитик", "page.analyticsDescription": "Хэрэглэгчдийн бүтэц, төлөвийг шинжлээрэй.", "page.settingsTitle": "Тохиргоо", "page.settingsDescription": "Dashboard-ийн харагдац болон хэлийг өөрчилнө.", "page.overviewEyebrow": "ТОЙМ", "page.customersEyebrow": "ХЭРЭГЛЭГЧИЙН БҮРТГЭЛ", "page.analyticsEyebrow": "ӨГӨГДЛИЙН ШИНЖИЛГЭЭ", "page.settingsEyebrow": "ТАНЫ СОНГОЛТ",
    "overview.recentTitle": "Сүүлд бүртгэгдсэн", "overview.recentSubtitle": "Хамгийн сүүлд нэмэгдсэн хэрэглэгчид", "overview.viewAll": "Бүгдийг харах", "overview.empty": "Хэрэглэгчийн мэдээлэл алга байна.",
    "settings.themeTitle": "Загвар", "settings.themeDescription": "Цайвар болон бараан горимын хооронд сонгоно.", "settings.languageTitle": "Хэл", "settings.languageDescription": "Dashboard-ийн хэлийг сонгоно.", "settings.dataTitle": "Өгөгдлийн холболт", "settings.dataDescription": "Customer мэдээллийг PostgREST API-аас шууд уншина.", "settings.themeAction": "Загвар солих", "settings.languageAction": "Хэл солих",
    "actions.refresh": "Шинэчлэх", "actions.add": "Хэрэглэгч нэмэх", "actions.cancel": "Болих", "actions.close": "Цонх хаах", "actions.delete": "Устгах", "actions.deleting": "Устгаж байна…", "actions.edit": "Засах", "actions.save": "Хадгалах", "actions.saveEdit": "Өөрчлөлт хадгалах", "actions.saving": "Хадгалж байна…", "actions.retry": "Дахин оролдох",
    "stats.total": "Нийт хэрэглэгч", "stats.totalHint": "Бүртгэлтэй бүх хэрэглэгч", "stats.active": "Идэвхтэй", "stats.activeHint": "Үйлчилгээ авч буй", "stats.inactive": "Идэвхгүй", "stats.inactiveHint": "Түр зогсоосон бүртгэл",
    "table.title": "Бүх хэрэглэгч", "table.subtitle": "Хэрэглэгчдийн бүртгэл болон төлөв", "table.customer": "ХЭРЭГЛЭГЧ", "table.customerId": "CUSTOMER ID", "table.storeId": "STORE ID", "table.addressId": "ADDRESS ID", "table.status": "ТӨЛӨВ", "table.actions": "Үйлдэл",
    "analytics.aria": "Хэрэглэгчийн статистикийн графикууд", "analytics.storeTitle": "Store ID-аар хэрэглэгчид", "analytics.storeSubtitle": "Бүртгэлтэй хэрэглэгчдийн хуваарилалт", "analytics.storeChartAria": "Store бүрийн хэрэглэгчийн тоо", "analytics.activeTitle": "Идэвхийн түвшин", "analytics.activeSubtitle": "Нийт хэрэглэгчдийн төлөв", "analytics.empty": "График харуулах хэрэглэгчийн өгөгдөл алга.", "analytics.storeLabel": "Store {id}", "analytics.storeCount": "{count} хэрэглэгч", "analytics.storeUnknown": "Store ID байхгүй", "analytics.activeAria": "Идэвхтэй хэрэглэгч {percent}%",
    "search.placeholder": "Нэр эсвэл email хайх…", "pagination.previous": "Өмнөх хуудас", "pagination.next": "Дараагийн хуудас",
    "footer.title": "Хэрэглэгчийн удирдлага", "footer.source": "Өгөгдөл PostgREST API-аас шууд уншигдана",
    "form.firstName": "Нэр", "form.lastName": "Овог", "form.optional": "Сонголтоор", "form.firstPlaceholder": "Жишээ: Бат", "form.lastPlaceholder": "Жишээ: Эрдэнэ", "form.emailPlaceholder": "name@example.com", "form.activeStatus": "Идэвхтэй төлөв", "form.activeHint": "Энэ хэрэглэгч идэвхтэй хэвээр байна.",
    "modal.createTitle": "Хэрэглэгч нэмэх", "modal.editTitle": "Хэрэглэгч засах", "modal.createDescription": "Шинэ бүртгэлийн мэдээллийг оруулна уу.", "modal.editDescription": "Хэрэглэгч #{id} мэдээллийг шинэчилнэ үү.",
    "delete.title": "Хэрэглэгч устгах уу?", "delete.description": "“{name}” бүртгэлийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.",
    "state.loadingTitle": "Өгөгдөл ачаалж байна", "state.loadingDescription": "PostgreSQL өгөгдлийг API-аас татаж байна…", "state.loadErrorTitle": "Өгөгдөл ачаалж чадсангүй", "state.noSearchTitle": "Хайлтын үр дүн олдсонгүй", "state.noSearchDescription": "Нэр, овог эсвэл email-ээ өөрчлөөд дахин хайна уу.", "state.emptyTitle": "Одоогоор хэрэглэгч бүртгэгдээгүй байна", "state.emptyDescription": "Шинэ хэрэглэгч нэмж эхлүүлээрэй.",
    "status.active": "Идэвхтэй", "status.inactive": "Идэвхгүй", "row.noEmail": "Email байхгүй", "row.noName": "Нэргүй хэрэглэгч", "row.edit": "{name} мэдээлэл засах", "row.delete": "{name} устгах", "range.label": "{from}–{to} / {total} хэрэглэгч", "range.empty": "0 хэрэглэгч",
    "toast.success": "Амжилттай", "toast.error": "Алдаа", "toast.created": "Шинэ хэрэглэгч амжилттай нэмэгдлээ.", "toast.updated": "Хэрэглэгчийн мэдээлэл шинэчлэгдлээ.", "toast.deleted": "Хэрэглэгч #{id} устгагдлаа.",
    "connection.checking": "Шалгаж байна…", "connection.connected": "API холбогдсон", "connection.disconnected": "API холболтгүй", "connection.detail": "PostgREST · localhost:3000", "connection.failedDetail": "localhost:3000 шалгана уу",
    "errors.foreignKey": "Store ID эсвэл Address ID бүртгэлгүй байна. Одоо байгаа ID утга оруулна уу.", "errors.required": "Заавал бөглөх талбар дутуу байна. Нэр, овог, Store ID, Address ID-г шалгана уу.", "errors.numeric": "ID талбарт зөв, боломжит тоон утга оруулна уу.", "errors.duplicate": "Ижил утгатай бүртгэл аль хэдийн байна. Мэдээллээ шалгаад дахин оролдоно уу.", "errors.schema": "API-ийн хүснэгтийн баганатай холбоотой алдаа гарлаа. PostgREST-ийн schema cache болон customer хүснэгтийг шалгана уу.", "errors.network": "API-д холбогдож чадсангүй. PostgREST http://localhost:3000 дээр ажиллаж байгаа эсэхийг шалгана уу.", "errors.generic": "Хүсэлтийг боловсруулах үед алдаа гарлаа. Дахин оролдоно уу.", "errors.nameRequired": "Нэр болон овог заавал бөглөх талбар.", "errors.idsRequired": "Store ID болон Address ID нь 0-ээс их бүхэл тоо байх ёстой.", "errors.email": "Email хаягийн форматыг шалгана уу."
  },
  en: {
    "splash.message": "Loading your customer workspace", "splash.subtext": "Establishing a secure data connection",
    "theme.toLight": "Switch to light theme", "theme.toDark": "Switch to dark theme",
    "language.toEnglish": "Switch language to English", "language.toMongolian": "Switch language to Mongolian",
    "nav.workspace": "Workspace", "nav.overview": "Overview", "nav.customers": "Customers", "nav.analytics": "Analytics", "nav.settings": "Settings", "profile.role": "Administrator",
    "page.title": "Customer Management · GANBAT", "page.overviewTitle": "Overview", "page.overviewDescription": "A quick look at your customer base.", "page.customersTitle": "Customers", "page.customersDescription": "Manage your customer records in one place.", "page.analyticsTitle": "Analytics", "page.analyticsDescription": "Explore customer distribution and account status.", "page.settingsTitle": "Settings", "page.settingsDescription": "Customize the dashboard appearance and language.", "page.overviewEyebrow": "OVERVIEW", "page.customersEyebrow": "CUSTOMER DIRECTORY", "page.analyticsEyebrow": "DATA INSIGHTS", "page.settingsEyebrow": "PREFERENCES",
    "overview.recentTitle": "Recently added", "overview.recentSubtitle": "Your latest customer records", "overview.viewAll": "View all", "overview.empty": "There are no customer records yet.",
    "settings.themeTitle": "Appearance", "settings.themeDescription": "Choose between light and dark mode.", "settings.languageTitle": "Language", "settings.languageDescription": "Choose the dashboard language.", "settings.dataTitle": "Data connection", "settings.dataDescription": "Customer records are read from the PostgREST API.", "settings.themeAction": "Change theme", "settings.languageAction": "Change language",
    "actions.refresh": "Refresh", "actions.add": "Add customer", "actions.cancel": "Cancel", "actions.close": "Close dialog", "actions.delete": "Delete", "actions.deleting": "Deleting…", "actions.edit": "Edit", "actions.save": "Save customer", "actions.saveEdit": "Save changes", "actions.saving": "Saving…", "actions.retry": "Try again",
    "stats.total": "Total customers", "stats.totalHint": "All registered customers", "stats.active": "Active", "stats.activeHint": "Currently active accounts", "stats.inactive": "Inactive", "stats.inactiveHint": "Paused accounts",
    "table.title": "All customers", "table.subtitle": "Customer records and account status", "table.customer": "CUSTOMER", "table.customerId": "CUSTOMER ID", "table.storeId": "STORE ID", "table.addressId": "ADDRESS ID", "table.status": "STATUS", "table.actions": "Actions",
    "analytics.aria": "Customer analytics charts", "analytics.storeTitle": "Customers by store", "analytics.storeSubtitle": "Distribution of registered customers", "analytics.storeChartAria": "Customer count by store", "analytics.activeTitle": "Active rate", "analytics.activeSubtitle": "Account status across all customers", "analytics.empty": "No customer data available to chart.", "analytics.storeLabel": "Store {id}", "analytics.storeCount": "{count} customers", "analytics.storeUnknown": "No store ID", "analytics.activeAria": "{percent}% of customers are active",
    "search.placeholder": "Search name or email…", "pagination.previous": "Previous page", "pagination.next": "Next page",
    "footer.title": "Customer Management", "footer.source": "Data is read directly from the PostgREST API",
    "form.firstName": "First name", "form.lastName": "Last name", "form.optional": "Optional", "form.firstPlaceholder": "e.g. Alex", "form.lastPlaceholder": "e.g. Morgan", "form.emailPlaceholder": "name@example.com", "form.activeStatus": "Active status", "form.activeHint": "This customer account is active.",
    "modal.createTitle": "Add customer", "modal.editTitle": "Edit customer", "modal.createDescription": "Enter the new customer details.", "modal.editDescription": "Update details for customer #{id}.",
    "delete.title": "Delete this customer?", "delete.description": "You are about to delete “{name}”. This action cannot be undone.",
    "state.loadingTitle": "Loading customers", "state.loadingDescription": "Fetching customer data from PostgreSQL…", "state.loadErrorTitle": "Could not load customers", "state.noSearchTitle": "No matching customers", "state.noSearchDescription": "Try another name, surname, or email address.", "state.emptyTitle": "No customers yet", "state.emptyDescription": "Add a customer to get started.",
    "status.active": "Active", "status.inactive": "Inactive", "row.noEmail": "No email provided", "row.noName": "Unnamed customer", "row.edit": "Edit {name}", "row.delete": "Delete {name}", "range.label": "{from}–{to} of {total} customers", "range.empty": "0 customers",
    "toast.success": "Success", "toast.error": "Error", "toast.created": "Customer added successfully.", "toast.updated": "Customer details updated.", "toast.deleted": "Customer #{id} was deleted.",
    "connection.checking": "Checking…", "connection.connected": "API connected", "connection.disconnected": "API unavailable", "connection.detail": "PostgREST · localhost:3000", "connection.failedDetail": "Check localhost:3000",
    "errors.foreignKey": "Store ID or Address ID was not found. Enter an existing ID.", "errors.required": "A required value is missing. Check first name, last name, Store ID, and Address ID.", "errors.numeric": "Enter a valid numeric value for each ID field.", "errors.duplicate": "A record with the same value already exists. Check the details and try again.", "errors.schema": "The API reported a customer table column error. Check the PostgREST schema cache and customer table.", "errors.network": "Could not connect to the API. Make sure PostgREST is running at http://localhost:3000.", "errors.generic": "The request could not be completed. Please try again.", "errors.nameRequired": "First name and last name are required.", "errors.idsRequired": "Store ID and Address ID must be positive whole numbers.", "errors.email": "Check the email address format."
  }
};

const state = {
  customers: [],
  page: 1,
  currentPage: "overview",
  loading: false,
  loadError: null,
  editing: null,
  deleting: null,
  busy: false,
  toastTimer: null,
  theme: "dark",
  language: "mn",
  connection: null,
  matrixFrame: null,
  splashFrame: null,
  splashRun: 0,
  splashHideTimer: null,
  formError: null,
  toast: null
};

const el = {
  matrixLoader: document.querySelector("#matrix-loader"),
  matrixCanvas: document.querySelector("#matrix-canvas"),
  loaderMessage: document.querySelector("#loader-message"),
  loaderSubtext: document.querySelector("#loader-subtext"),
  loaderProgress: document.querySelector("#loader-progress"),
  loaderPercent: document.querySelector("#loader-percent"),
  rows: document.querySelector("#customer-rows"),
  customerTable: document.querySelector(".customer-table"),
  tableState: document.querySelector("#table-state"),
  search: document.querySelector("#search-input"),
  totalCount: document.querySelector("#total-count"),
  activeCount: document.querySelector("#active-count"),
  inactiveCount: document.querySelector("#inactive-count"),
  sidebarCount: document.querySelector("#sidebar-count"),
  resultCount: document.querySelector("#result-count"),
  rangeLabel: document.querySelector("#range-label"),
  pageLabel: document.querySelector("#page-label"),
  previousPage: document.querySelector("#previous-page"),
  nextPage: document.querySelector("#next-page"),
  refreshButton: document.querySelector("#refresh-button"),
  addButton: document.querySelector("#add-button"),
  pageTitle: document.querySelector("#page-title"),
  pageDescription: document.querySelector("#page-description"),
  pageEyebrow: document.querySelector("#page-eyebrow"),
  breadcrumbCurrent: document.querySelector("#breadcrumb-current"),
  recentCustomers: document.querySelector("#recent-customers"),
  settingsThemeToggle: document.querySelector("#settings-theme-toggle"),
  settingsLanguageToggle: document.querySelector("#settings-language-toggle"),
  storeChart: document.querySelector("#store-chart"),
  activeChartContent: document.querySelector("#active-chart-content"),
  connectionDot: document.querySelector("#connection-dot"),
  connectionLabel: document.querySelector("#connection-label"),
  connectionDetail: document.querySelector("#connection-detail"),
  todayLabel: document.querySelector("#today-label"),
  themeToggle: document.querySelector("#theme-toggle"),
  languageToggle: document.querySelector("#language-toggle"),
  customerModal: document.querySelector("#customer-modal"),
  customerForm: document.querySelector("#customer-form"),
  modalTitle: document.querySelector("#modal-title"),
  modalDescription: document.querySelector("#modal-description"),
  firstName: document.querySelector("#first-name"),
  lastName: document.querySelector("#last-name"),
  email: document.querySelector("#email"),
  storeId: document.querySelector("#store-id"),
  addressId: document.querySelector("#address-id"),
  activeStatus: document.querySelector("#active-status"),
  formError: document.querySelector("#form-error"),
  saveButton: document.querySelector("#save-button"),
  saveLabel: document.querySelector("#save-label"),
  deleteModal: document.querySelector("#delete-modal"),
  deleteDescription: document.querySelector("#delete-description"),
  cancelDelete: document.querySelector("#cancel-delete"),
  confirmDelete: document.querySelector("#confirm-delete"),
  toastRegion: document.querySelector("#toast-region")
};

function t(key, values = {}) {
  const template = UI_TEXT[state.language]?.[key] || UI_TEXT.mn[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}

function readPreference(key, allowed, fallback) {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function writePreference(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Storage may be unavailable in private or file mode. */ }
}

function applyTheme(theme, persist = true) {
  state.theme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = state.theme;
  document.querySelector('meta[name="theme-color"]').content = state.theme === "light" ? "#f4f5f8" : "#111318";
  const nextThemeLabel = t(state.theme === "dark" ? "theme.toLight" : "theme.toDark");
  el.themeToggle.setAttribute("aria-label", nextThemeLabel);
  el.themeToggle.title = nextThemeLabel;
  el.themeToggle.setAttribute("aria-pressed", String(state.theme === "light"));
  if (persist) writePreference(THEME_KEY, state.theme);
}

function applyLanguage(language, persist = true) {
  state.language = language === "en" ? "en" : "mn";
  document.documentElement.lang = state.language;
  document.title = t("page.title");
  applyTheme(state.theme, false);
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", t(node.dataset.i18nTitle));
  });
  el.languageToggle.textContent = state.language === "mn" ? "EN" : "MN";
  const nextLanguageLabel = t(state.language === "mn" ? "language.toEnglish" : "language.toMongolian");
  el.languageToggle.setAttribute("aria-label", nextLanguageLabel);
  el.languageToggle.title = nextLanguageLabel;
  el.todayLabel.textContent = new Intl.DateTimeFormat(state.language === "mn" ? "mn-MN" : "en-US", { dateStyle: "medium" }).format(new Date());
  el.loaderMessage.textContent = t("splash.message");
  el.loaderSubtext.textContent = t("splash.subtext");
  if (state.connection === null) {
    el.connectionLabel.textContent = t("connection.checking");
    el.connectionDetail.textContent = t("connection.detail");
  } else {
    updateConnection(state.connection);
  }
  if (state.formError && !el.formError.hidden) {
    el.formError.textContent = state.formError.raw ? readableError(state.formError.raw) : t(state.formError.key, state.formError.values);
  }
  if (state.toast) renderToast();
  if (!el.customerModal.hidden) updateCustomerModalCopy();
  if (!el.deleteModal.hidden && state.deleting) updateDeleteDescription();
  updatePageCopy();
  render();
  if (persist) writePreference(LANGUAGE_KEY, state.language);
}

const PAGE_COPY = {
  overview: { title: "page.overviewTitle", description: "page.overviewDescription", eyebrow: "page.overviewEyebrow", breadcrumb: "nav.overview" },
  customers: { title: "page.customersTitle", description: "page.customersDescription", eyebrow: "page.customersEyebrow", breadcrumb: "nav.customers" },
  analytics: { title: "page.analyticsTitle", description: "page.analyticsDescription", eyebrow: "page.analyticsEyebrow", breadcrumb: "nav.analytics" },
  settings: { title: "page.settingsTitle", description: "page.settingsDescription", eyebrow: "page.settingsEyebrow", breadcrumb: "nav.settings" }
};

function updatePageCopy() {
  const copy = PAGE_COPY[state.currentPage] || PAGE_COPY.overview;
  el.pageTitle.textContent = t(copy.title);
  el.pageDescription.textContent = t(copy.description);
  el.pageEyebrow.textContent = t(copy.eyebrow);
  el.breadcrumbCurrent.textContent = t(copy.breadcrumb);
  el.addButton.hidden = state.currentPage !== "customers";
  document.querySelectorAll("[data-page-view]").forEach((view) => {
    view.hidden = view.dataset.pageView !== state.currentPage;
  });
  document.querySelectorAll("[data-page-action]").forEach((action) => {
    action.hidden = action.dataset.pageAction !== state.currentPage;
  });
  document.querySelectorAll("[data-page-link]").forEach((link) => {
    const active = link.dataset.pageLink === state.currentPage;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function setActivePage(page, updateUrl = true) {
  if (!Object.prototype.hasOwnProperty.call(PAGE_COPY, page)) page = "overview";
  state.currentPage = page;
  updatePageCopy();
  if (updateUrl && window.location.hash !== `#${page}`) window.location.hash = page;
}

function startMatrixRain() {
  const canvas = el.matrixCanvas;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return;

  const glyphs = "アカサタナハマヤラワ012345789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let width = 0;
  let height = 0;
  let columns = 0;
  let drops = [];
  let fontSize = 16;
  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    fontSize = width < 600 ? 14 : 16;
    columns = Math.ceil(width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * (height / fontSize));
    context.fillStyle = "#020604";
    context.fillRect(0, 0, width, height);
  };
  const draw = () => {
    context.fillStyle = "rgba(2, 6, 4, 0.12)";
    context.fillRect(0, 0, width, height);
    context.font = `${fontSize}px monospace`;
    for (let index = 0; index < drops.length; index += 1) {
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      const bright = Math.random() > 0.94;
      context.fillStyle = bright ? "#d8ffe2" : (Math.random() > 0.45 ? "#20e66b" : "#0b8240");
      context.fillText(glyph, index * fontSize, drops[index] * fontSize);
      if (drops[index] * fontSize > height && Math.random() > 0.975) drops[index] = 0;
      drops[index] += 0.34 + Math.random() * 0.5;
    }
    state.matrixFrame = window.requestAnimationFrame(draw);
  };

  if (state.matrixFrame !== null) window.cancelAnimationFrame(state.matrixFrame);
  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });
  return () => window.removeEventListener("resize", resize);
}

function startMatrixSplash() {
  const loader = el.matrixLoader;
  if (!loader) return;

  state.splashRun += 1;
  const currentRun = state.splashRun;
  window.clearTimeout(state.splashHideTimer);
  if (state.splashFrame !== null) window.cancelAnimationFrame(state.splashFrame);
  if (state.matrixFrame !== null) window.cancelAnimationFrame(state.matrixFrame);
  loader.hidden = false;
  loader.classList.remove("is-exiting");
  document.body.classList.add("splash-active");
  el.loaderProgress.style.width = "0%";
  el.loaderPercent.textContent = "00%";
  el.loaderMessage.textContent = t("splash.message");
  el.loaderSubtext.textContent = t("splash.subtext");
  const stopResizeListener = startMatrixRain();
  const startedAt = performance.now();
  const duration = 10000;

  const update = (now) => {
    if (currentRun !== state.splashRun) return;
    const progress = Math.min((now - startedAt) / duration, 1);
    const percent = Math.floor(progress * 100);
    el.loaderProgress.style.width = `${percent}%`;
    el.loaderPercent.textContent = `${String(percent).padStart(2, "0")}%`;
    if (progress < 1) {
      state.splashFrame = window.requestAnimationFrame(update);
      return;
    }
    loader.classList.add("is-exiting");
    state.splashHideTimer = window.setTimeout(() => {
      if (currentRun !== state.splashRun) return;
      loader.hidden = true;
      document.body.classList.remove("splash-active");
      if (state.matrixFrame !== null) window.cancelAnimationFrame(state.matrixFrame);
      state.matrixFrame = null;
      if (stopResizeListener) stopResizeListener();
    }, 420);
  };
  state.splashFrame = window.requestAnimationFrame(update);
}

function refreshCustomers() {
  startMatrixSplash();
  return loadCustomers();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function formatCount(value) {
  return Number(value || 0).toLocaleString(state.language === "mn" ? "mn-MN" : "en-US");
}

function customerIsActive(customer) {
  let value;
  if (Object.prototype.hasOwnProperty.call(customer, "activebool")) value = customer.activebool;
  else if (Object.prototype.hasOwnProperty.call(customer, "active")) value = customer.active;
  else return true;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["false", "0", "f", "no", "inactive"].includes(normalized)) return false;
    if (["true", "1", "t", "yes", "active"].includes(normalized)) return true;
  }
  if (typeof value === "number") return value !== 0;
  return Boolean(value);
}

function getActiveColumn(customer) {
  if (customer && Object.prototype.hasOwnProperty.call(customer, "activebool")) return "activebool";
  if (customer && Object.prototype.hasOwnProperty.call(customer, "active")) return "active";
  return "activebool";
}

function activePayload(customer, isActive) {
  const column = getActiveColumn(customer);
  const currentValue = customer && customer[column];
  return { [column]: typeof currentValue === "number" ? (isActive ? 1 : 0) : isActive };
}

function updateConnection(connected) {
  state.connection = connected;
  el.connectionDot.classList.toggle("connected", connected);
  el.connectionDot.classList.toggle("disconnected", !connected);
  el.connectionLabel.textContent = t(connected ? "connection.connected" : "connection.disconnected");
  el.connectionDetail.textContent = t(connected ? "connection.detail" : "connection.failedDetail");
}

function readableError(error) {
  const payload = error && error.payload;
  const code = payload && payload.code;
  const message = String((payload && (payload.message || payload.details)) || (error && error.message) || "");
  if (code === "23503") return t("errors.foreignKey");
  if (code === "23502") return t("errors.required");
  if (code === "22P02" || code === "22003") return t("errors.numeric");
  if (code === "23505") return t("errors.duplicate");
  if (code === "PGRST204" || /could not find the .*column/i.test(message)) return t("errors.schema");
  if (/failed to fetch|networkerror|load failed/i.test(message)) return t("errors.network");
  if (message) return message;
  return t("errors.generic");
}

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });
  } catch (cause) {
    const error = new Error(cause && cause.message ? cause.message : "Failed to fetch");
    error.cause = cause;
    throw error;
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try { payload = JSON.parse(text); }
    catch { payload = text; }
  }
  if (!response.ok) {
    const error = new Error(typeof payload === "string" ? payload : (payload && payload.message) || `HTTP ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return { data: payload, response };
}

async function loadCustomers() {
  if (state.loading) return;
  state.loading = true;
  state.loadError = null;
  render();

  const allCustomers = [];
  let offset = 0;
  let total = null;
  try {
    while (true) {
      const query = new URLSearchParams({
        select: "*",
        order: "customer_id.asc",
        limit: String(API_PAGE_SIZE),
        offset: String(offset)
      });
      const { data, response } = await apiRequest(`${TABLE}?${query.toString()}`, {
        method: "GET",
        headers: { Prefer: "count=exact" }
      });
      const batch = Array.isArray(data) ? data : [];
      allCustomers.push(...batch);
      const contentRange = response.headers.get("Content-Range");
      const totalMatch = contentRange && contentRange.match(/\/(\d+)$/);
      if (totalMatch) total = Number(totalMatch[1]);
      offset += batch.length;
      if (batch.length < API_PAGE_SIZE || (total !== null && offset >= total)) break;
    }
    state.customers = allCustomers;
    state.page = 1;
    updateConnection(true);
  } catch (error) {
    state.loadError = error;
    updateConnection(false);
  } finally {
    state.loading = false;
    render();
  }
}

function getFilteredCustomers() {
  const term = el.search.value.trim().toLocaleLowerCase();
  if (!term) return state.customers;
  return state.customers.filter((customer) => {
    const searchable = [customer.first_name, customer.last_name, customer.email]
      .map((value) => String(value ?? "").toLocaleLowerCase());
    return searchable.some((value) => value.includes(term));
  });
}

function initials(customer) {
  const first = String(customer.first_name || "").trim().charAt(0);
  const last = String(customer.last_name || "").trim().charAt(0);
  return (first + last).toLocaleUpperCase() || "?";
}

function renderStats() {
  const active = state.customers.filter(customerIsActive).length;
  const total = state.customers.length;
  el.totalCount.textContent = state.loading && total === 0 ? "…" : formatCount(total);
  el.activeCount.textContent = state.loading && total === 0 ? "…" : formatCount(active);
  el.inactiveCount.textContent = state.loading && total === 0 ? "…" : formatCount(total - active);
  el.sidebarCount.textContent = state.loading && total === 0 ? "—" : formatCount(total);
}

function renderAnalytics() {
  const total = state.customers.length;
  const active = state.customers.filter(customerIsActive).length;
  const inactive = total - active;
  const isInitialLoading = state.loading && total === 0;

  if (isInitialLoading) {
    el.storeChart.innerHTML = Array.from({ length: 4 }, () =>
      '<div class="chart-skeleton-row" aria-hidden="true"><span class="skeleton-block skeleton-label"></span><span class="skeleton-block skeleton-bar"></span></div>'
    ).join("");
    el.activeChartContent.innerHTML = '<div class="skeleton-block donut-skeleton" aria-hidden="true"></div><div class="legend-skeleton"><span class="skeleton-block"></span><span class="skeleton-block"></span></div>';
    return;
  }

  if (total === 0) {
    el.storeChart.innerHTML = `<div class="chart-empty">${t("analytics.empty")}</div>`;
    el.activeChartContent.innerHTML = `<div class="chart-empty">${t("analytics.empty")}</div>`;
    return;
  }

  const byStore = new Map();
  state.customers.forEach((customer) => {
    const store = customer.store_id === null || customer.store_id === undefined || customer.store_id === ""
      ? "unknown"
      : String(customer.store_id);
    byStore.set(store, (byStore.get(store) || 0) + 1);
  });
  const stores = [...byStore.entries()].sort((a, b) => {
    if (a[0] === "unknown") return 1;
    if (b[0] === "unknown") return -1;
    return Number(a[0]) - Number(b[0]);
  });
  const maximum = Math.max(...stores.map((entry) => entry[1]), 1);
  el.storeChart.innerHTML = stores.map(([store, count], index) => {
    const width = Math.max(4, (count / maximum) * 100);
    const label = store === "unknown" ? t("analytics.storeUnknown") : t("analytics.storeLabel", { id: escapeHtml(store) });
    return `<div class="store-chart-row" role="listitem"><div class="store-chart-meta"><span>${label}</span><strong>${t("analytics.storeCount", { count: formatCount(count) })}</strong></div><div class="bar-track"><span class="bar-fill bar-color-${index % 4}" style="width:${width.toFixed(1)}%"></span></div></div>`;
  }).join("");

  const activePercent = Math.round((active / total) * 100);
  el.activeChartContent.innerHTML = `<div class="donut-chart" style="--active-share:${activePercent}%" role="img" aria-label="${t("analytics.activeAria", { percent: activePercent })}"><span>${activePercent}%</span></div><div class="chart-legend"><div><span class="legend-dot active-legend-dot"></span><span>${t("status.active")}</span><strong>${formatCount(active)}</strong></div><div><span class="legend-dot inactive-legend-dot"></span><span>${t("status.inactive")}</span><strong>${formatCount(inactive)}</strong></div></div>`;
}

function renderRecentCustomers() {
  if (state.loading && state.customers.length === 0) {
    el.recentCustomers.innerHTML = Array.from({ length: 3 }, () =>
      '<div class="recent-skeleton" aria-hidden="true"><span class="skeleton-block skeleton-avatar"></span><span class="recent-skeleton-copy"><span class="skeleton-block skeleton-name"></span><span class="skeleton-block skeleton-email"></span></span><span class="skeleton-block skeleton-status"></span></div>'
    ).join("");
    return;
  }
  if (!state.customers.length) {
    const message = state.loadError ? readableError(state.loadError) : t("overview.empty");
    el.recentCustomers.innerHTML = `<div class="recent-empty">${escapeHtml(message)}</div>`;
    return;
  }

  const latest = [...state.customers].sort((a, b) => Number(b.customer_id) - Number(a.customer_id)).slice(0, 5);
  el.recentCustomers.innerHTML = latest.map((customer, index) => {
    const name = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || t("row.noName");
    const email = customer.email || t("row.noEmail");
    const isActive = customerIsActive(customer);
    const avatarIndex = (Number(customer.customer_id) || index) % 5;
    return `<div class="recent-row"><div class="recent-customer"><span class="customer-avatar avatar-${avatarIndex}">${escapeHtml(initials(customer))}</span><span class="customer-identity"><strong title="${escapeHtml(name)}">${escapeHtml(name)}</strong><span title="${escapeHtml(email)}">${escapeHtml(email)}</span></span></div><span class="recent-date">#${escapeHtml(customer.customer_id)}</span><span class="status-badge${isActive ? "" : " inactive"}">${t(isActive ? "status.active" : "status.inactive")}</span></div>`;
  }).join("");
}

function renderRows() {
  const filtered = getFilteredCustomers();
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, pageCount);
  const startIndex = (state.page - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  el.resultCount.textContent = formatCount(filtered.length);
  el.pageLabel.textContent = `${state.page} / ${pageCount}`;
  el.previousPage.disabled = state.loading || state.page <= 1;
  el.nextPage.disabled = state.loading || state.page >= pageCount;
  el.rangeLabel.textContent = filtered.length
    ? t("range.label", { from: formatCount(startIndex + 1), to: formatCount(Math.min(startIndex + PAGE_SIZE, filtered.length)), total: formatCount(filtered.length) })
    : t("range.empty");
  el.customerTable.setAttribute("aria-busy", String(state.loading));

  if (state.loading) {
    el.tableState.hidden = true;
    el.rows.innerHTML = Array.from({ length: 5 }, () => `<tr class="skeleton-row" aria-hidden="true">
      <td><div class="customer-cell"><span class="skeleton-block skeleton-avatar"></span><span class="customer-identity"><span class="skeleton-block skeleton-name"></span><span class="skeleton-block skeleton-email"></span></span></div></td>
      <td><span class="skeleton-block skeleton-id"></span></td><td><span class="skeleton-block skeleton-id short"></span></td><td><span class="skeleton-block skeleton-id short"></span></td>
      <td><span class="skeleton-block skeleton-status"></span></td><td><span class="skeleton-block skeleton-actions"></span></td>
    </tr>`).join("");
    return;
  }

  if (state.loadError) {
    el.rows.innerHTML = "";
    el.tableState.hidden = false;
    el.tableState.innerHTML = `<strong>${t("state.loadErrorTitle")}</strong><span>${escapeHtml(readableError(state.loadError))}</span><button class="button button-secondary" type="button" data-retry>${t("actions.retry")}</button>`;
    return;
  }

  if (visible.length === 0) {
    el.rows.innerHTML = "";
    el.tableState.hidden = false;
    const searching = Boolean(el.search.value.trim());
    el.tableState.innerHTML = searching
      ? `<strong>${t("state.noSearchTitle")}</strong><span>${t("state.noSearchDescription")}</span>`
      : `<strong>${t("state.emptyTitle")}</strong><span>${t("state.emptyDescription")}</span>`;
    return;
  }

  el.tableState.hidden = true;
  el.rows.innerHTML = visible.map((customer, index) => {
    const isActive = customerIsActive(customer);
    const name = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || t("row.noName");
    const email = customer.email || t("row.noEmail");
    const customerId = escapeHtml(customer.customer_id);
    const avatarIndex = (Number(customer.customer_id) || index) % 5;
    return `<tr>
      <td><div class="customer-cell"><span class="customer-avatar avatar-${avatarIndex}">${escapeHtml(initials(customer))}</span><span class="customer-identity"><strong title="${escapeHtml(name)}">${escapeHtml(name)}</strong><span title="${escapeHtml(email)}">${escapeHtml(email)}</span></span></div></td>
      <td class="id-cell">#${customerId}</td>
      <td class="id-cell">${escapeHtml(customer.store_id ?? "—")}</td>
      <td class="id-cell">${escapeHtml(customer.address_id ?? "—")}</td>
      <td><span class="status-badge${isActive ? "" : " inactive"}">${t(isActive ? "status.active" : "status.inactive")}</span></td>
      <td><div class="row-actions"><button class="icon-button" type="button" data-edit="${customerId}" aria-label="${escapeHtml(t("row.edit", { name }))}" title="${t("actions.edit")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.3-.9L19 8.4a2.1 2.1 0 0 0-3-3L5.3 16.1 4 20Z"/></svg></button><button class="icon-button delete-action" type="button" data-delete="${customerId}" aria-label="${escapeHtml(t("row.delete", { name }))}" title="${t("actions.delete")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg></button></div></td>
    </tr>`;
  }).join("");
}

function render() {
  renderStats();
  renderAnalytics();
  renderRecentCustomers();
  renderRows();
  el.refreshButton.disabled = state.loading || state.busy;
  el.addButton.disabled = state.loading || state.busy;
}

function showToast(message, type = "success") {
  window.clearTimeout(state.toastTimer);
  state.toast = { message, type };
  renderToast();
  state.toastTimer = window.setTimeout(() => { state.toast = null; el.toastRegion.innerHTML = ""; }, 4800);
}

function renderToast() {
  if (!state.toast) return;
  const isError = state.toast.type === "error";
  const descriptor = state.toast.message;
  const message = descriptor && descriptor.error
    ? readableError(descriptor.error)
    : descriptor && descriptor.key
      ? t(descriptor.key, descriptor.values)
      : String(descriptor ?? "");
  el.toastRegion.innerHTML = `<div class="toast${isError ? " error" : ""}"><span class="toast-icon" aria-hidden="true">${isError ? "!" : "✓"}</span><div><strong>${t(isError ? "toast.error" : "toast.success")}</strong><span>${escapeHtml(message)}</span></div></div>`;
}

function showFormError(error) {
  state.formError = typeof error === "string" ? { key: error } : error;
  el.formError.textContent = state.formError.raw ? readableError(state.formError.raw) : t(state.formError.key, state.formError.values);
  el.formError.hidden = false;
}

function hideFormError() {
  state.formError = null;
  el.formError.textContent = "";
  el.formError.hidden = true;
}

function updateCustomerModalCopy() {
  const customer = state.editing;
  el.modalTitle.textContent = t(customer ? "modal.editTitle" : "modal.createTitle");
  el.modalDescription.textContent = customer
    ? t("modal.editDescription", { id: customer.customer_id })
    : t("modal.createDescription");
  el.saveLabel.textContent = state.busy
    ? t("actions.saving")
    : t(customer ? "actions.saveEdit" : "actions.save");
}

function openCustomerModal(customer = null) {
  state.editing = customer;
  hideFormError();
  el.customerForm.reset();
  updateCustomerModalCopy();
  el.firstName.value = customer ? (customer.first_name || "") : "";
  el.lastName.value = customer ? (customer.last_name || "") : "";
  el.email.value = customer ? (customer.email || "") : "";
  el.storeId.value = customer ? (customer.store_id ?? "") : "";
  el.addressId.value = customer ? (customer.address_id ?? "") : "";
  el.activeStatus.checked = customer ? customerIsActive(customer) : true;
  el.customerModal.hidden = false;
  document.body.style.overflow = "hidden";
  window.setTimeout(() => el.firstName.focus(), 0);
}

function closeCustomerModal() {
  if (state.busy) return;
  el.customerModal.hidden = true;
  state.editing = null;
  document.body.style.overflow = "";
}

function setFormBusy(busy) {
  state.busy = busy;
  el.saveButton.disabled = busy;
  el.customerForm.querySelectorAll("input").forEach((input) => { input.disabled = busy; });
  el.saveLabel.textContent = busy ? t("actions.saving") : t(state.editing ? "actions.saveEdit" : "actions.save");
  el.saveButton.querySelector(".button-spinner").hidden = !busy;
  render();
}

function validateForm() {
  hideFormError();
  const firstName = el.firstName.value.trim();
  const lastName = el.lastName.value.trim();
  if (!firstName || !lastName) {
    showFormError("errors.nameRequired");
    return null;
  }
  const storeText = el.storeId.value.trim();
  const addressText = el.addressId.value.trim();
  const isPositiveInteger = (value) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
  if (!isPositiveInteger(storeText) || !isPositiveInteger(addressText)) {
    showFormError("errors.idsRequired");
    return null;
  }
  if (!el.email.checkValidity()) {
    showFormError("errors.email");
    return null;
  }
  return {
    first_name: firstName,
    last_name: lastName,
    email: el.email.value.trim() || null,
    store_id: Number(storeText),
    address_id: Number(addressText)
  };
}

async function saveCustomer(event) {
  event.preventDefault();
  if (state.busy) return;
  const fields = validateForm();
  if (!fields) return;

  const isEditing = Boolean(state.editing);
  const payload = isEditing
    ? { ...fields, ...activePayload(state.editing, el.activeStatus.checked) }
    : { ...fields, ...activePayload(state.customers[0] || null, el.activeStatus.checked) };
  const url = isEditing
    ? `${TABLE}?${new URLSearchParams({ customer_id: `eq.${state.editing.customer_id}` }).toString()}`
    : TABLE;
  setFormBusy(true);
  try {
    await apiRequest(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload)
    });
    closeCustomerModalAfterSave();
    await loadCustomers();
    showToast({ key: isEditing ? "toast.updated" : "toast.created" });
  } catch (error) {
    showFormError({ raw: error });
  } finally {
    setFormBusy(false);
  }
}

function closeCustomerModalAfterSave() {
  el.customerModal.hidden = true;
  state.editing = null;
  document.body.style.overflow = "";
}

function updateDeleteDescription() {
  const customer = state.deleting;
  if (!customer) return;
  const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
  el.deleteDescription.textContent = t("delete.description", { name: fullName || `Customer #${customer.customer_id}` });
  el.confirmDelete.querySelector("span").textContent = t(state.busy ? "actions.deleting" : "actions.delete");
}

function openDeleteModal(customer) {
  state.deleting = customer;
  updateDeleteDescription();
  el.deleteModal.hidden = false;
  document.body.style.overflow = "hidden";
  el.confirmDelete.focus();
}

function closeDeleteModal() {
  if (state.busy) return;
  el.deleteModal.hidden = true;
  state.deleting = null;
  document.body.style.overflow = "";
}

async function deleteCustomer() {
  if (!state.deleting || state.busy) return;
  state.busy = true;
  el.confirmDelete.disabled = true;
  el.cancelDelete.disabled = true;
  el.confirmDelete.querySelector(".button-spinner").hidden = false;
  el.confirmDelete.querySelector("span").textContent = t("actions.deleting");
  const customer = state.deleting;
  try {
    const query = new URLSearchParams({ customer_id: `eq.${customer.customer_id}` });
    await apiRequest(`${TABLE}?${query.toString()}`, {
      method: "DELETE",
      headers: { Prefer: "return=representation" }
    });
    el.deleteModal.hidden = true;
    state.deleting = null;
    document.body.style.overflow = "";
    await loadCustomers();
    showToast({ key: "toast.deleted", values: { id: customer.customer_id } });
  } catch (error) {
    showToast({ error }, "error");
  } finally {
    state.busy = false;
    el.confirmDelete.disabled = false;
    el.cancelDelete.disabled = false;
    el.confirmDelete.querySelector(".button-spinner").hidden = true;
    el.confirmDelete.querySelector("span").textContent = t("actions.delete");
    render();
  }
}

function findCustomer(id) {
  return state.customers.find((customer) => String(customer.customer_id) === String(id));
}

el.refreshButton.addEventListener("click", refreshCustomers);
el.addButton.addEventListener("click", () => openCustomerModal());
el.themeToggle.addEventListener("click", () => applyTheme(state.theme === "dark" ? "light" : "dark"));
el.languageToggle.addEventListener("click", () => applyLanguage(state.language === "mn" ? "en" : "mn"));
el.settingsThemeToggle.addEventListener("click", () => applyTheme(state.theme === "dark" ? "light" : "dark"));
el.settingsLanguageToggle.addEventListener("click", () => applyLanguage(state.language === "mn" ? "en" : "mn"));
document.querySelectorAll("[data-page-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setActivePage(link.dataset.pageLink);
  });
});
document.addEventListener("click", (event) => {
  const pageAction = event.target.closest("[data-navigate]");
  if (pageAction) setActivePage(pageAction.dataset.navigate);
});
window.addEventListener("hashchange", () => setActivePage(window.location.hash.slice(1), false));
window.addEventListener("popstate", () => setActivePage(window.location.hash.slice(1), false));
el.search.addEventListener("input", () => { state.page = 1; renderRows(); });
el.previousPage.addEventListener("click", () => { if (state.page > 1) { state.page -= 1; renderRows(); } });
el.nextPage.addEventListener("click", () => {
  const pages = Math.max(1, Math.ceil(getFilteredCustomers().length / PAGE_SIZE));
  if (state.page < pages) { state.page += 1; renderRows(); }
});
el.rows.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  if (editButton) {
    const customer = findCustomer(editButton.dataset.edit);
    if (customer) openCustomerModal(customer);
  }
  if (deleteButton) {
    const customer = findCustomer(deleteButton.dataset.delete);
    if (customer) openDeleteModal(customer);
  }
});
el.tableState.addEventListener("click", (event) => {
  if (event.target.closest("[data-retry]")) refreshCustomers();
});
el.customerForm.addEventListener("submit", saveCustomer);
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeCustomerModal));
el.customerModal.addEventListener("click", (event) => { if (event.target === el.customerModal) closeCustomerModal(); });
el.cancelDelete.addEventListener("click", closeDeleteModal);
el.confirmDelete.addEventListener("click", deleteCustomer);
el.deleteModal.addEventListener("click", (event) => { if (event.target === el.deleteModal) closeDeleteModal(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!el.deleteModal.hidden) closeDeleteModal();
    else if (!el.customerModal.hidden) closeCustomerModal();
  }
  if (event.key === "/" && el.customerModal.hidden && el.deleteModal.hidden && document.activeElement.tagName !== "INPUT") {
    event.preventDefault();
    el.search.focus();
  }
});

state.currentPage = PAGE_COPY[window.location.hash.slice(1)] ? window.location.hash.slice(1) : "overview";
applyTheme(readPreference(THEME_KEY, ["dark", "light"], "dark"), false);
applyLanguage(readPreference(LANGUAGE_KEY, ["mn", "en"], "mn"), false);
setActivePage(state.currentPage, false);
startMatrixSplash();
loadCustomers();
