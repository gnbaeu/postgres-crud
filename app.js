import { requestJson, resetCsrfToken } from "./api.js";
import {
  DISCOVER_ARTICLES,
  DISCOVER_CATEGORIES,
  FEATURED_ARTICLE_SLUG,
  getDiscoverArticle,
  getDiscoverCopy,
  resolveDiscoverRoute,
  selectSurpriseArticle
} from "./discover/articles.js";

const API_PAGE_SIZE = 100;
const PAGE_SIZE = 10;
const THEME_KEY = "ganbat-customer-theme";
const ACCENT_THEME_KEY = "gnwaa-aurora-accent-v1";
const LANGUAGE_KEY = "ganbat-customer-language";
const SIDEBAR_KEY = "gnwaa-sidebar-state-v1";
const DISCOVER_RECENT_KEY = "gnwaa-discover-recent-v1";
const ACCENT_THEMES = [
  { id: "aurora-purple", name: "Aurora Purple", accent: "#7856FF", secondary: "#37B6FF" },
  { id: "ocean-night", name: "Ocean Night", accent: "#0891B2", secondary: "#22D3EE" },
  { id: "emerald-matrix", name: "Emerald Matrix", accent: "#10B981", secondary: "#34D399" },
  { id: "sunset-neon", name: "Sunset Neon", accent: "#F97316", secondary: "#EC4899" },
  { id: "moonlight", name: "Moonlight", accent: "#A5B4FC", secondary: "#818CF8" }
];
const ACCENT_THEME_IDS = ACCENT_THEMES.map(({ id }) => id);

const UI_TEXT = {
  mn: {
    "sidebar.collapse": "Цэс хумих", "sidebar.expand": "Цэс нээх",
    "nav.openMenu": "Цэс нээх", "nav.closeMenu": "Цэс хаах",
    "splash.message": "Хэрэглэгчийн орчныг ачаалж байна", "splash.subtext": "Өгөгдөлтэй холболт үүсгэж байна",
    "theme.toLight": "Цайвар горимд шилжих", "theme.toDark": "Бараан горимд шилжих",
    "language.toEnglish": "Хэлийг англи болгох", "language.toMongolian": "Хэлийг монгол болгох",
    "nav.workspace": "Ажлын орчин", "nav.overview": "Тойм", "nav.customers": "Хэрэглэгчид", "nav.analytics": "Аналитик", "nav.settings": "Тохиргоо", "profile.role": "Администратор",
    "profile.title": "Профайл", "profile.open": "Профайл цэс нээх", "profile.close": "Профайл цэс хаах", "profile.owner": "Эзэмшигч", "profile.member": "Хэрэглэгч", "profile.guest": "Зочин",
    "profile.login": "Эзэмшигчээр нэвтрэх", "profile.settings": "Хэрэглэгчийн тохиргоо", "profile.adminDashboard": "Удирдлагын самбар", "profile.logout": "Гарах",
    "auth.checkingSession": "Сесс шалгаж байна…",
    "page.title": "Хэрэглэгчийн удирдлага · GANBAT", "page.overviewTitle": "Тойм", "page.overviewDescription": "Хэрэглэгчдийн ерөнхий мэдээлэл.", "page.customersTitle": "Хэрэглэгчид", "page.customersDescription": "Харилцагчдын мэдээллээ нэг дороос удирдаарай.", "page.analyticsTitle": "Аналитик", "page.analyticsDescription": "Хэрэглэгчдийн бүтэц, төлөвийг шинжлээрэй.", "page.settingsTitle": "Тохиргоо", "page.settingsDescription": "Dashboard-ийн харагдац болон хэлийг өөрчилнө.", "page.overviewEyebrow": "ТОЙМ", "page.customersEyebrow": "ХЭРЭГЛЭГЧИЙН БҮРТГЭЛ", "page.analyticsEyebrow": "ӨГӨГДЛИЙН ШИНЖИЛГЭЭ", "page.settingsEyebrow": "ТАНЫ СОНГОЛТ",
    "overview.recentTitle": "Сүүлд бүртгэгдсэн", "overview.recentSubtitle": "Хамгийн сүүлд нэмэгдсэн хэрэглэгчид", "overview.viewAll": "Бүгдийг харах", "overview.empty": "Хэрэглэгчийн мэдээлэл алга байна.",
    "settings.themeTitle": "Загвар", "settings.themeDescription": "Цайвар болон бараан горимын хооронд сонгоно.", "settings.languageTitle": "Хэл", "settings.languageDescription": "Dashboard-ийн хэлийг сонгоно.", "settings.dataTitle": "Өгөгдлийн холболт", "settings.dataDescription": "Customer мэдээллийг Supabase Data API-аар удирдана.", "settings.themeAction": "Загвар солих", "settings.languageAction": "Хэл солих",
    "actions.refresh": "Шинэчлэх", "actions.add": "Хэрэглэгч нэмэх", "actions.cancel": "Болих", "actions.close": "Цонх хаах", "actions.delete": "Устгах", "actions.deleting": "Устгаж байна…", "actions.edit": "Засах", "actions.save": "Хадгалах", "actions.saveEdit": "Өөрчлөлт хадгалах", "actions.saving": "Хадгалж байна…", "actions.retry": "Дахин оролдох",
    "stats.total": "Нийт хэрэглэгч", "stats.totalHint": "Бүртгэлтэй бүх хэрэглэгч", "stats.active": "Идэвхтэй", "stats.activeHint": "Үйлчилгээ авч буй", "stats.inactive": "Идэвхгүй", "stats.inactiveHint": "Түр зогсоосон бүртгэл",
    "table.title": "Бүх хэрэглэгч", "table.subtitle": "Хэрэглэгчдийн бүртгэл болон төлөв", "table.customer": "ХЭРЭГЛЭГЧ", "table.customerId": "CUSTOMER ID", "table.storeId": "STORE ID", "table.addressId": "ADDRESS ID", "table.status": "ТӨЛӨВ", "table.actions": "Үйлдэл",
    "analytics.aria": "Хэрэглэгчийн статистикийн графикууд", "analytics.storeTitle": "Store ID-аар хэрэглэгчид", "analytics.storeSubtitle": "Бүртгэлтэй хэрэглэгчдийн хуваарилалт", "analytics.storeChartAria": "Store бүрийн хэрэглэгчийн тоо", "analytics.activeTitle": "Идэвхийн түвшин", "analytics.activeSubtitle": "Нийт хэрэглэгчдийн төлөв", "analytics.empty": "График харуулах хэрэглэгчийн өгөгдөл алга.", "analytics.storeLabel": "Store {id}", "analytics.storeCount": "{count} хэрэглэгч", "analytics.storeUnknown": "Store ID байхгүй", "analytics.activeAria": "Идэвхтэй хэрэглэгч {percent}%",
    "search.placeholder": "Нэр эсвэл email хайх…", "pagination.previous": "Өмнөх хуудас", "pagination.next": "Дараагийн хуудас",
    "footer.title": "Хэрэглэгчийн удирдлага", "footer.source": "Өгөгдөл Supabase Data API-аар удирдагдана",
    "form.firstName": "Нэр", "form.lastName": "Овог", "form.optional": "Сонголтоор", "form.firstPlaceholder": "Жишээ: Бат", "form.lastPlaceholder": "Жишээ: Эрдэнэ", "form.emailPlaceholder": "name@example.com", "form.activeStatus": "Идэвхтэй төлөв", "form.activeHint": "Энэ хэрэглэгч идэвхтэй хэвээр байна.",
    "modal.createTitle": "Хэрэглэгч нэмэх", "modal.editTitle": "Хэрэглэгч засах", "modal.createDescription": "Шинэ бүртгэлийн мэдээллийг оруулна уу.", "modal.editDescription": "Хэрэглэгч #{id} мэдээллийг шинэчилнэ үү.",
    "delete.title": "Хэрэглэгч устгах уу?", "delete.description": "“{name}” бүртгэлийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.",
    "state.loadingTitle": "Өгөгдөл ачаалж байна", "state.loadingDescription": "PostgreSQL өгөгдлийг API-аас татаж байна…", "state.loadErrorTitle": "Өгөгдөл ачаалж чадсангүй", "state.noSearchTitle": "Хайлтын үр дүн олдсонгүй", "state.noSearchDescription": "Нэр, овог эсвэл email-ээ өөрчлөөд дахин хайна уу.", "state.emptyTitle": "Одоогоор хэрэглэгч бүртгэгдээгүй байна", "state.emptyDescription": "Шинэ хэрэглэгч нэмж эхлүүлээрэй.",
    "status.active": "Идэвхтэй", "status.inactive": "Идэвхгүй", "row.noEmail": "Email байхгүй", "row.noName": "Нэргүй хэрэглэгч", "row.edit": "{name} мэдээлэл засах", "row.delete": "{name} устгах", "range.label": "{from}–{to} / {total} хэрэглэгч", "range.empty": "0 хэрэглэгч",
    "toast.success": "Амжилттай", "toast.error": "Алдаа", "toast.created": "Шинэ хэрэглэгч амжилттай нэмэгдлээ.", "toast.updated": "Хэрэглэгчийн мэдээлэл шинэчлэгдлээ.", "toast.deleted": "Хэрэглэгч #{id} устгагдлаа.",
    "connection.checking": "Шалгаж байна…", "connection.connected": "API холбогдсон", "connection.disconnected": "API холболтгүй", "connection.detail": "Supabase Data API", "connection.failedDetail": "Supabase тохиргоогоо шалгана уу",
    "errors.foreignKey": "Холбоотой бүртгэл олдсонгүй. Мэдээллээ шалгана уу.", "errors.required": "Заавал бөглөх талбар дутуу байна. Нэр, овог, Store ID, Address ID-г шалгана уу.", "errors.numeric": "ID талбарт зөв, боломжит тоон утга оруулна уу.", "errors.duplicate": "Ижил утгатай бүртгэл аль хэдийн байна. Мэдээллээ шалгаад дахин оролдоно уу.", "errors.schema": "Supabase хүснэгтийн баганатай холбоотой алдаа гарлаа. Migration болон customer_records хүснэгтийг шалгана уу.", "errors.network": "Supabase Data API-д холбогдож чадсангүй. Төслийн URL болон холболтоо шалгана уу.", "errors.access": "Энэ бүртгэлд хандах эрхгүй эсвэл RLS бодлого үйлдлийг хориглолоо.", "errors.session": "Session хүчингүй болсон. Дахин нэвтэрнэ үү.", "errors.generic": "Хүсэлтийг боловсруулах үед алдаа гарлаа. Дахин оролдоно уу.", "errors.nameRequired": "Нэр болон овог заавал бөглөх талбар.", "errors.idsRequired": "Store ID болон Address ID нь 0-ээс их бүхэл тоо байх ёстой.", "errors.email": "Email хаягийн форматыг шалгана уу."
  },
  en: {
    "sidebar.collapse": "Collapse menu", "sidebar.expand": "Expand menu",
    "nav.openMenu": "Open navigation", "nav.closeMenu": "Close navigation",
    "splash.message": "Loading your customer workspace", "splash.subtext": "Establishing a secure data connection",
    "theme.toLight": "Switch to light theme", "theme.toDark": "Switch to dark theme",
    "language.toEnglish": "Switch language to English", "language.toMongolian": "Switch language to Mongolian",
    "nav.workspace": "Workspace", "nav.overview": "Overview", "nav.customers": "Customers", "nav.analytics": "Analytics", "nav.settings": "Settings", "profile.role": "Administrator",
    "profile.title": "Profile", "profile.open": "Open profile menu", "profile.close": "Close profile menu", "profile.owner": "Owner", "profile.member": "Member", "profile.guest": "Guest",
    "profile.login": "Owner login", "profile.settings": "User Settings", "profile.adminDashboard": "Admin Dashboard", "profile.logout": "Logout",
    "auth.checkingSession": "Checking session…",
    "page.title": "Customer Management · GANBAT", "page.overviewTitle": "Overview", "page.overviewDescription": "A quick look at your customer base.", "page.customersTitle": "Customers", "page.customersDescription": "Manage your customer records in one place.", "page.analyticsTitle": "Analytics", "page.analyticsDescription": "Explore customer distribution and account status.", "page.settingsTitle": "Settings", "page.settingsDescription": "Customize the dashboard appearance and language.", "page.overviewEyebrow": "OVERVIEW", "page.customersEyebrow": "CUSTOMER DIRECTORY", "page.analyticsEyebrow": "DATA INSIGHTS", "page.settingsEyebrow": "PREFERENCES",
    "overview.recentTitle": "Recently added", "overview.recentSubtitle": "Your latest customer records", "overview.viewAll": "View all", "overview.empty": "There are no customer records yet.",
    "settings.themeTitle": "Appearance", "settings.themeDescription": "Choose between light and dark mode.", "settings.languageTitle": "Language", "settings.languageDescription": "Choose the dashboard language.", "settings.dataTitle": "Data connection", "settings.dataDescription": "Manage customer records through the Supabase Data API.", "settings.themeAction": "Change theme", "settings.languageAction": "Change language",
    "actions.refresh": "Refresh", "actions.add": "Add customer", "actions.cancel": "Cancel", "actions.close": "Close dialog", "actions.delete": "Delete", "actions.deleting": "Deleting…", "actions.edit": "Edit", "actions.save": "Save customer", "actions.saveEdit": "Save changes", "actions.saving": "Saving…", "actions.retry": "Try again",
    "stats.total": "Total customers", "stats.totalHint": "All registered customers", "stats.active": "Active", "stats.activeHint": "Currently active accounts", "stats.inactive": "Inactive", "stats.inactiveHint": "Paused accounts",
    "table.title": "All customers", "table.subtitle": "Customer records and account status", "table.customer": "CUSTOMER", "table.customerId": "CUSTOMER ID", "table.storeId": "STORE ID", "table.addressId": "ADDRESS ID", "table.status": "STATUS", "table.actions": "Actions",
    "analytics.aria": "Customer analytics charts", "analytics.storeTitle": "Customers by store", "analytics.storeSubtitle": "Distribution of registered customers", "analytics.storeChartAria": "Customer count by store", "analytics.activeTitle": "Active rate", "analytics.activeSubtitle": "Account status across all customers", "analytics.empty": "No customer data available to chart.", "analytics.storeLabel": "Store {id}", "analytics.storeCount": "{count} customers", "analytics.storeUnknown": "No store ID", "analytics.activeAria": "{percent}% of customers are active",
    "search.placeholder": "Search name or email…", "pagination.previous": "Previous page", "pagination.next": "Next page",
    "footer.title": "Customer Management", "footer.source": "Manage records through the Supabase Data API",
    "form.firstName": "First name", "form.lastName": "Last name", "form.optional": "Optional", "form.firstPlaceholder": "e.g. Alex", "form.lastPlaceholder": "e.g. Morgan", "form.emailPlaceholder": "name@example.com", "form.activeStatus": "Active status", "form.activeHint": "This customer account is active.",
    "modal.createTitle": "Add customer", "modal.editTitle": "Edit customer", "modal.createDescription": "Enter the new customer details.", "modal.editDescription": "Update details for customer #{id}.",
    "delete.title": "Delete this customer?", "delete.description": "You are about to delete “{name}”. This action cannot be undone.",
    "state.loadingTitle": "Loading customers", "state.loadingDescription": "Fetching customer data from PostgreSQL…", "state.loadErrorTitle": "Could not load customers", "state.noSearchTitle": "No matching customers", "state.noSearchDescription": "Try another name, surname, or email address.", "state.emptyTitle": "No customers yet", "state.emptyDescription": "Add a customer to get started.",
    "status.active": "Active", "status.inactive": "Inactive", "row.noEmail": "No email provided", "row.noName": "Unnamed customer", "row.edit": "Edit {name}", "row.delete": "Delete {name}", "range.label": "{from}–{to} of {total} customers", "range.empty": "0 customers",
    "toast.success": "Success", "toast.error": "Error", "toast.created": "Customer added successfully.", "toast.updated": "Customer details updated.", "toast.deleted": "Customer #{id} was deleted.",
    "connection.checking": "Checking…", "connection.connected": "API connected", "connection.disconnected": "API unavailable", "connection.detail": "Supabase Data API", "connection.failedDetail": "Check the Supabase configuration",
    "errors.foreignKey": "A related record could not be found. Check the details.", "errors.required": "A required value is missing. Check first name, last name, Store ID, and Address ID.", "errors.numeric": "Enter a valid numeric value for each ID field.", "errors.duplicate": "A record with the same value already exists. Check the details and try again.", "errors.schema": "The Supabase table reported a column error. Check the migration and customer_records table.", "errors.network": "Could not connect to the Supabase Data API. Check the project URL and connection.", "errors.access": "You are not allowed to access this record, or an RLS policy blocked the action.", "errors.session": "The session is invalid or expired. Please sign in again.", "errors.generic": "The request could not be completed. Please try again.", "errors.nameRequired": "First name and last name are required.", "errors.idsRequired": "Store ID and Address ID must be positive whole numbers.", "errors.email": "Check the email address format."
  }
};

Object.assign(UI_TEXT.mn, {
  "language.mn": "Монгол",
  "language.en": "Англи",
  "settings.dataDescription": "Customer мэдээллийг эзэмшигчийн хамгаалалттай GNWAA API удирдана.",
  "footer.source": "Нийтэд харагдах контентыг GNWAA API-аас авна",
  "connection.detail": "GNWAA REST API",
  "connection.failedDetail": "Express API холболтоо шалгана уу",
  "errors.network": "GNWAA API-д холбогдож чадсангүй. Backend холболтоо шалгана уу.",
  "errors.schema": "GNWAA өгөгдлийн сангийн хүснэгт олдсонгүй. Local migration төлөвийг шалгана уу.",
  "about.cardTwoText": "Vanilla HTML, CSS, JavaScript дээр Express болон PostgreSQL ашигласан төсөл.",
  "nav.home": "Нүүр", "nav.about": "GNWAA тухай", "nav.customers": "Customer CRM", "nav.login": "Нэвтрэх",
  "page.homeTitle": "GNWAA-ийн булан", "page.homeDescription": "Төсөл, өгөгдөл, сонирхлын жижиг ертөнц.", "page.homeEyebrow": "WELCOME / GNWAA",
  "page.aboutTitle": "GNWAA тухай", "page.aboutDescription": "Энэ орон зайны санаа, одоогийн төсөлтэй танилцаарай.", "page.aboutEyebrow": "A LITTLE INTRO",
  "home.kicker": "GNWAA / FOR THE CURIOUS", "home.heroTitle": "Сониуч зангаа дага. Шинэ өнцөг нээ.", "home.heroText": "Мэдлэгийн түүх, интерактив туршилтаар GNWAA-ийн дижитал ертөнцийг судлаарай.",
  "home.openDiscover": "Discover-ийг нээх", "home.openLab": "Интерактив лаборатори", "home.localTag": "STORIES · EXPERIMENTS · IDEAS", "home.brandNote": "Сониуч зангаар бүтээгдэв", "home.catAria": "GNWAA-ийн Pixel сахиус, гэрэлт хамгаалалтын тэмдэг",
  "home.sectionsEyebrow": "GNWAA / EXPLORE", "home.sectionsTitle": "Сониуч зангаа дага", "home.sectionsHint": "Түүх, туршилт, санаанаас сонгоорой.",
  "home.discoverKind": "МЭДЛЭГИЙН САН", "home.discoverTitle": "Discover Knowledge Hub", "home.discoverDescription": "Шинжлэх ухаан, дижитал амьдрал, соёлын тухай ойлгомжтой түүхүүд.", "home.discoverAction": "Нийтлэлүүдийг үзэх",
  "home.universeKind": "БҮТЭЭХ", "home.universeTitle": "Digital Universe", "home.universeDescription": "Сонирхлоо гариг болгож, өөрийн ертөнцийг байгуул.", "home.universeAction": "Ертөнцөө байгуулах",
  "home.detectiveKind": "ШИНЖЛЭХ", "home.detectiveTitle": "Internet Detective", "home.detectiveDescription": "Зохиомол жишээнээс сэжигтэй дохиог олж, оноогоо шалга.", "home.detectiveAction": "Сорил эхлүүлэх",
  "home.japanKind": "СОЁЛ · ТЕХНОЛОГИ", "home.japanTitle": "Japan Explained", "home.japanDescription": "Японы өдөр тутмын систем, технологийг энгийнээр тайлбарласан түүхүүд.", "home.japanAction": "Suica-г тайлбарлах",
  "home.personalityKind": "ӨӨРИЙГӨӨ ТАНИХ", "home.personalityTitle": "Personality Lab", "home.personalityDescription": "Сониуч зангийн хэв маягаа богино асуултаар судал.", "home.personalityAction": "Тест эхлүүлэх",
  "home.aboutKind": "GNWAA / ТАНИЛЦАХ", "home.publicAboutTitle": "GNWAA ба төслүүд", "home.aboutDescription": "GNWAA-ийн санаа, туршилт, одоогийн төслүүдтэй танилц.", "home.aboutAction": "Төслүүдийг харах", "home.adminTitle": "Эзэмшигчийн ажлын хэсэг",
  "home.crmTitle": "Customer CRM", "home.crmText": "Харилцагчдын мэдээллийг нэг дороос удирд.", "home.aboutTitle": "Энэ булангийн тухай", "home.aboutText": "GNWAA-ийн санаа, одоогийн төслүүдтэй танилц.", "home.analyticsTitle": "Өгөгдлийн тойм", "home.analyticsText": "Хуваарилалт, хэрэглэгчийн төлөвийг хар.", "home.explore": "Дэлгэрэнгүй",
  "home.note": "Энэ бол эхлэл — шинэ санаа, булангууд нэмэгдэх тусам GNWAA тэлнэ.",
  "about.kicker": "WELCOME TO GNWAA", "about.title": "Сониуч зангаас эхэлсэн жижигхэн дижитал ертөнц.", "about.description": "GNWAA нь сонирхолтой сэдвүүдийг ойлгомжтой түүх, интерактив туршилт, хэрэгтэй төслөөр нээх public орон зай.", "about.cta": "Эхний төслийг үзэх",
  "about.cardOneTitle": "Юу олж үзэх вэ?", "about.cardOneText": "Бодит өгөгдөлтэй customer dashboard, хайлт, бүртгэл болон төлөвийн аналитик.", "about.cardLink": "Customer CRM рүү →",
  "about.cardTwoTitle": "Яаж бүтээгдсэн бэ?", "about.cardTwoText": "Vanilla HTML, CSS, JavaScript дээр PostgreSQL 16 болон PostgREST-тэй холбосон сургалтын төсөл.", "about.cardLinkTwo": "Өгөгдлийн тойм →",
  "about.signoff": "Сониуч бай. Турш. Өөрийнхөөрөө бүтээ.",
  "about.creatorEyebrow": "THE PERSON BEHIND GNWAA", "about.creatorTitle": "Meet the Creator", "about.creatorName": "GANWAA", "about.creatorRole": "Creator of GNWAA", "about.creatorAlt": "Ганваагийн аниме хөрөг.",
  "about.creatorGreeting": "Сайн уу! Би Ганваа.", "about.creatorIntroOne": "Би шинэ санаа, технологи, бүтээлч туршилтад дуртай. Аливаа зүйл хэрхэн ажилладгийг ойлгож, сонирхолтой санааг бодит бүтээл болгох нь надад хамгийн их урам өгдөг.",
  "about.creatorIntroTwo": "GNWAA бол миний сониуч зан, бүтээлч сэтгэлгээ, туршилтуудыг нэг дор цуглуулсан хувийн дижитал орон зай. Энд би бусадтай мэдлэг, санаа болон сонирхолтой туршлагуудыг хуваалцахыг хүсдэг.",
  "about.creatorQuote": "Curious by nature. Creative by choice.", "about.creatorGithub": "GitHub профайл", "about.opensNewTab": "Шинэ табд нээгдэнэ",
  "about.buildingTitle": "Одоо бүтээж буй зүйлс", "about.buildingDescription": "Мэдлэгийн нийтлэл, интерактив Lab туршлага, GNWAA-ийн төслүүдийг нэг дор холбож байна.",
  "about.buildPlatformTitle": "GNWAA Platform", "about.buildPlatformDescription": "Мэдлэг, бүтээлч туршилт, төслүүдийг нэг дор нэгтгэсэн платформ.", "about.buildPlatformAction": "Нүүр хуудас руу",
  "about.buildKnowledgeTitle": "Knowledge Hub", "about.buildKnowledgeDescription": "Технологи, дижитал амьдрал болон сонирхолтой сэдвүүдийг энгийнээр тайлбарласан нийтлэлүүд.", "about.buildKnowledgeAction": "Нийтлэл үзэх",
  "about.buildInteractiveTitle": "Interactive Experiences", "about.buildInteractiveDescription": "Уншаад өнгөрөх биш, өөрөө туршиж ойлгох жижиг интерактив туршилтууд.", "about.buildInteractiveAction": "Лаборатори нээх"
});
Object.assign(UI_TEXT.en, {
  "language.mn": "Mongolian",
  "language.en": "English",
  "settings.dataDescription": "Customer data is managed through the owner-protected GNWAA API.",
  "footer.source": "Public copy is served by the GNWAA API",
  "connection.detail": "GNWAA REST API",
  "connection.failedDetail": "Check the Express API connection",
  "errors.network": "Could not connect to the GNWAA API. Check the backend connection.",
  "errors.schema": "A GNWAA database table is missing. Check the local migration state.",
  "about.cardTwoText": "A website project using vanilla HTML, CSS, JavaScript, Express, and PostgreSQL.",
  "nav.home": "Home", "nav.about": "About GNWAA", "nav.customers": "Customer CRM", "nav.login": "Login",
  "page.homeTitle": "The GNWAA corner", "page.homeDescription": "A small world of projects, data, and things I enjoy.", "page.homeEyebrow": "WELCOME / GNWAA",
  "page.aboutTitle": "About GNWAA", "page.aboutDescription": "A quick introduction to this space and the project inside it.", "page.aboutEyebrow": "A LITTLE INTRO",
  "home.kicker": "GNWAA / FOR THE CURIOUS", "home.heroTitle": "Follow curiosity. Find a new angle.", "home.heroText": "Explore GNWAA through knowledge stories and playful interactive experiments.",
  "home.openDiscover": "Explore Discover", "home.openLab": "Open Interactive Lab", "home.localTag": "STORIES · EXPERIMENTS · IDEAS", "home.brandNote": "Curious by design", "home.catAria": "GNWAA's Pixel companion and luminous shield emblem",
  "home.sectionsEyebrow": "GNWAA / EXPLORE", "home.sectionsTitle": "Choose a direction", "home.sectionsHint": "Explore stories, experiments, and ideas.",
  "home.discoverKind": "KNOWLEDGE HUB", "home.discoverTitle": "Discover Knowledge Hub", "home.discoverDescription": "Clear, approachable stories about science, digital life, and culture.", "home.discoverAction": "Browse stories",
  "home.universeKind": "CREATE", "home.universeTitle": "Digital Universe", "home.universeDescription": "Turn your interests into planets in a universe of your own.", "home.universeAction": "Build your universe",
  "home.detectiveKind": "INVESTIGATE", "home.detectiveTitle": "Internet Detective", "home.detectiveDescription": "Spot clues in fictional messages and practice safer online choices.", "home.detectiveAction": "Start the challenge",
  "home.japanKind": "CULTURE · TECHNOLOGY", "home.japanTitle": "Japan Explained", "home.japanDescription": "Everyday Japanese systems and technology, explained clearly.", "home.japanAction": "How Suica works",
  "home.personalityKind": "REFLECT", "home.personalityTitle": "Personality Lab", "home.personalityDescription": "Explore your curiosity style through a short reflective quiz.", "home.personalityAction": "Take the quiz",
  "home.aboutKind": "MEET GNWAA", "home.publicAboutTitle": "About / Projects", "home.aboutDescription": "Meet GNWAA, its ideas, experiments, and current projects.", "home.aboutAction": "Explore projects", "home.adminTitle": "Owner workspace",
  "home.crmTitle": "Customer CRM", "home.crmText": "Manage customer records in one place.", "home.aboutTitle": "About this space", "home.aboutText": "Get to know GNWAA and the project behind it.", "home.analyticsTitle": "Data insights", "home.analyticsText": "Explore customer distribution and account status.", "home.explore": "Explore",
  "home.note": "This is just the beginning. GNWAA will grow with new ideas and sections.",
  "about.kicker": "WELCOME TO GNWAA", "about.title": "A small digital world that started with curiosity.", "about.description": "GNWAA explores interesting ideas through approachable stories, interactive experiments, and useful projects.", "about.cta": "Explore the first project",
  "about.cardOneTitle": "What can you explore?", "about.cardOneText": "A customer dashboard with live records, search, CRUD actions, and status analytics.", "about.cardLink": "Open Customer CRM →",
  "about.cardTwoTitle": "How is it built?", "about.cardTwoText": "A learning project using vanilla HTML, CSS, and JavaScript with PostgreSQL 16 and PostgREST.", "about.cardLinkTwo": "View data insights →",
  "about.signoff": "Stay curious. Keep trying. Make it your own.",
  "about.creatorEyebrow": "THE PERSON BEHIND GNWAA", "about.creatorTitle": "Meet the Creator", "about.creatorName": "GANWAA", "about.creatorRole": "Creator of GNWAA", "about.creatorAlt": "Anime portrait of Ganwaa.",
  "about.creatorGreeting": "Hey! I'm Ganwaa.", "about.creatorIntroOne": "I'm curious about new ideas, technology, and creative experiments. I enjoy understanding how things work and turning interesting ideas into something real.",
  "about.creatorIntroTwo": "GNWAA is my personal digital space where curiosity, creativity, and experimentation come together. It's a place to share knowledge, ideas, and experiences worth exploring.",
  "about.creatorQuote": "Curious by nature. Creative by choice.", "about.creatorGithub": "GitHub profile", "about.opensNewTab": "Opens in a new tab",
  "about.buildingTitle": "Now Building", "about.buildingDescription": "Connecting knowledge articles, interactive Lab experiences, and GNWAA projects in one place.",
  "about.buildPlatformTitle": "GNWAA Platform", "about.buildPlatformDescription": "A platform bringing together knowledge, creative experiments, and projects.", "about.buildPlatformAction": "Explore the platform",
  "about.buildKnowledgeTitle": "Knowledge Hub", "about.buildKnowledgeDescription": "Accessible articles exploring technology, digital life, and interesting ideas.", "about.buildKnowledgeAction": "Read articles",
  "about.buildInteractiveTitle": "Interactive Experiences", "about.buildInteractiveDescription": "Small interactive experiences that turn curiosity into hands-on exploration.", "about.buildInteractiveAction": "Open the lab"
});

UI_TEXT.mn["page.title"] = "GNWAA · Дижитал булан";
UI_TEXT.en["page.title"] = "GNWAA · Digital corner";

UI_TEXT.mn["profile.role"] = "Нэвтэрсэн хэрэглэгч";
UI_TEXT.en["profile.role"] = "Signed-in user";
UI_TEXT.mn["about.cardTwoText"] = "Vanilla HTML, CSS, JavaScript дээр Express болон PostgreSQL ашигласан төсөл.";
UI_TEXT.en["about.cardTwoText"] = "A website project using vanilla HTML, CSS, JavaScript, Express, and PostgreSQL.";
UI_TEXT.mn["errors.foreignKey"] = "Холбоотой бүртгэл олдсонгүй. Мэдээллээ шалгана уу.";
UI_TEXT.en["errors.foreignKey"] = "A related record could not be found. Check the details.";
UI_TEXT.mn["errors.schema"] = "GNWAA өгөгдлийн сангийн хүснэгт олдсонгүй. Local migration төлөвийг шалгана уу.";
UI_TEXT.en["errors.schema"] = "A GNWAA database table is missing. Check the local migration state.";
UI_TEXT.mn["errors.network"] = "GNWAA API-д холбогдож чадсангүй. Backend холболтоо шалгана уу.";
UI_TEXT.en["errors.network"] = "Could not connect to the GNWAA API. Check the backend connection.";
UI_TEXT.mn["errors.access"] = "Энэ бүртгэлд хандах эрхгүй эсвэл RLS бодлого үйлдлийг хориглолоо.";
UI_TEXT.en["errors.access"] = "You are not allowed to access this record, or an RLS policy blocked the action.";
UI_TEXT.mn["errors.session"] = "Session хүчингүй болсон. Дахин нэвтэрнэ үү.";
UI_TEXT.en["errors.session"] = "The session is invalid or expired. Please sign in again.";
UI_TEXT.mn["errors.recordMissing"] = "Бүртгэл олдсонгүй эсвэл хандах эрхгүй байна.";
UI_TEXT.en["errors.recordMissing"] = "The record was not found or you are not allowed to access it.";

Object.assign(UI_TEXT.mn, {
  "content.title": "Website контент",
  "content.nav": "Website",
  "content.description": "Нүүр болон About хуудасны нийтлэгдэх текстийг удирдана.",
  "content.language": "Хэл",
  "content.homeHeading": "Нүүр хуудасны гол гарчиг",
  "content.homeDescription": "Нүүр хуудасны тайлбар",
  "content.aboutHeading": "About хуудасны гарчиг",
  "content.aboutDescription": "About хуудасны тайлбар",
  "content.delete": "Энэ хэлний контентыг устгах",
  "content.saveDraft": "Ноорог хадгалах",
  "content.publish": "Нийтлэх",
  "content.saved": "Контент хадгалагдлаа.",
  "content.deleted": "Контент устгагдлаа.",
  "content.loading": "Контент ачаалж байна…",
  "content.loadFailed": "Контент ачаалж чадсангүй. Дахин ачаалаад үзнэ үү.",
  "content.loadBeforeSave": "Хадгалах эсвэл устгахын өмнө контентыг амжилттай ачаална уу.",
  "content.conflictReloaded": "Контент өөрчлөгдсөн байна. Одоогийн мэдээллийг ачааллаа; шалгаад дахин хадгална уу.",
  "content.confirmDelete": "Энэ хэлний Home болон About контентыг устгах уу?",
  "content.draft": "Ноорог — зочдод харагдахгүй",
  "content.published": "Нийтлэгдсэн",
  "auth.ownerOnly": "Энэ хэсэг зөвхөн GNWAA эзэмшигчид нээлттэй.",
  "auth.loginLink": "Эзэмшигчээр нэвтрэх",
  "auth.continueGuest": "Нэвтрэхгүйгээр зочлох",
  "auth.adminLink": "Удирдлага",
  "auth.apiUnavailable": "Нэвтрэх API одоогоор холбогдохгүй байна.",
  "auth.sessionExpired": "Сессийн хугацаа дууссан. Дахин нэвтэрнэ үү.",
  "auth.noSignup": "Бүртгэл үүсгэх боломжгүй. Эзэмшигчийн эрхийг тусгай setup процессоор өгнө."
});
Object.assign(UI_TEXT.en, {
  "content.title": "Website content",
  "content.nav": "Website",
  "content.description": "Manage the published copy for Home and About.",
  "content.language": "Language",
  "content.homeHeading": "Home hero heading",
  "content.homeDescription": "Home hero description",
  "content.aboutHeading": "About page heading",
  "content.aboutDescription": "About page description",
  "content.delete": "Delete this language copy",
  "content.saveDraft": "Save as draft",
  "content.publish": "Publish",
  "content.saved": "Content saved.",
  "content.deleted": "Content deleted.",
  "content.loading": "Loading content…",
  "content.loadFailed": "Could not load content. Refresh and try again.",
  "content.loadBeforeSave": "Load content successfully before saving or deleting.",
  "content.conflictReloaded": "Content changed. Current content has been loaded; review it before saving again.",
  "content.confirmDelete": "Delete the Home and About content for this language?",
  "content.draft": "Draft — hidden from visitors",
  "content.published": "Published",
  "auth.ownerOnly": "This area is available to the GNWAA owner only.",
  "auth.loginLink": "Owner login",
  "auth.continueGuest": "Continue as guest",
  "auth.adminLink": "Admin",
  "auth.apiUnavailable": "The login API is currently unavailable.",
  "auth.sessionExpired": "Your session expired. Please sign in again.",
  "auth.noSignup": "Public registration is disabled. Owner access is set up through a separate secure process."
});
Object.assign(UI_TEXT.mn, {
  "nav.discover": "Discover",
  "nav.lab": "Сонирхолтой лаборатори",
  "page.discoverTitle": "Discover",
  "page.discoverDescription": "Шинэ мэдлэг, дижитал аюулгүй байдлын зөвлөгөө, Японы өдөр тутмын амьдралын тайлбар.",
  "page.discoverEyebrow": "GNWAA / KNOWLEDGE HUB",
  "page.labTitle": "Сонирхолтой лаборатори",
  "page.labDescription": "Дижитал ертөнц, цахим аюулгүй байдал, өөрийгөө таних интерактив туршилтууд.",
  "page.labEyebrow": "GNWAA / INTERACTIVE LAB",
  "discover.featured": "ОНЦЛОХ НИЙТЛЭЛ",
  "discover.categories": "Ангиллаар үзэх",
  "discover.all": "Бүгд",
  "discover.latest": "Шинэ нийтлэлүүд",
  "discover.searchLabel": "Нийтлэл хайх",
  "discover.searchPlaceholder": "Гарчгаар хайх…",
  "discover.results": "{count} нийтлэл",
  "discover.noResultsTitle": "Нийтлэл олдсонгүй",
  "discover.noResultsDescription": "Хайлтын үг эсвэл ангиллаа өөрчлөөд үзээрэй.",
  "discover.readArticle": "Унших",
  "discover.readingTime": "{minutes} минут уншина",
  "discover.published": "Нийтэлсэн {date}",
  "discover.source": "Эх сурвалж",
  "discover.related": "Холбоотой нийтлэлүүд",
  "discover.back": "Discover рүү буцах",
  "discover.missingTitle": "Энэ нийтлэл олдсонгүй",
  "discover.missingDescription": "Холбоос өөрчлөгдсөн эсвэл нийтлэл байхгүй байна.",
  "discover.missingLocale": "Энэ нийтлэлийн {language} хувилбар хараахан бэлэн болоогүй байна.",
  "discover.availableLanguage": "Одоогоор зөвхөн {language} эх хувилбар байна.",
  "discover.original": "Эх хувилбар",
  "discover.progress": "Нийтлэлийн уншсан явц",
  "discover.surprise": "Надад нийтлэл сонго",
  "discover.anotherSurprise": "Өөр нэг нийтлэл санал болго",
  "discover.surpriseEmpty": "Одоогоор энэ хэл дээр унших нийтлэл алга байна.",
  "discover.dateLocale": "mn-MN",
  "discover.minuteLabel": "Нэг минутын мэдлэг",
  "discover.digitalLabel": "Дижитал аюулгүй байдал",
  "discover.japanLabel": "Япон тайлбарлав"
});
Object.assign(UI_TEXT.en, {
  "nav.discover": "Discover",
  "nav.lab": "Interactive Lab",
  "page.discoverTitle": "Discover",
  "page.discoverDescription": "Short explainers, practical digital safety, and everyday life in Japan.",
  "page.discoverEyebrow": "GNWAA / KNOWLEDGE HUB",
  "page.labTitle": "Interactive Lab",
  "page.labDescription": "Interactive experiments in digital worlds, online safety, and self-discovery.",
  "page.labEyebrow": "GNWAA / INTERACTIVE LAB",
  "discover.featured": "FEATURED ARTICLE",
  "discover.categories": "Browse categories",
  "discover.all": "All articles",
  "discover.latest": "Latest articles",
  "discover.searchLabel": "Search articles",
  "discover.searchPlaceholder": "Search by title…",
  "discover.results": "{count} articles",
  "discover.noResultsTitle": "No articles found",
  "discover.noResultsDescription": "Try a different search term or category.",
  "discover.readArticle": "Read article",
  "discover.readingTime": "{minutes} min read",
  "discover.published": "Published {date}",
  "discover.source": "Source",
  "discover.related": "Related articles",
  "discover.back": "Back to Discover",
  "discover.missingTitle": "Article not found",
  "discover.missingDescription": "This link may have changed or the article is unavailable.",
  "discover.missingLocale": "The {language} version of this article is not available yet.",
  "discover.availableLanguage": "Only the original {language} version is available for now.",
  "discover.original": "Original",
  "discover.progress": "Article reading progress",
  "discover.surprise": "Surprise Me",
  "discover.anotherSurprise": "Another Surprise",
  "discover.surpriseEmpty": "There are no articles available in this language right now.",
  "discover.dateLocale": "en-US",
  "discover.minuteLabel": "One Minute Knowledge",
  "discover.digitalLabel": "Digital Survival Guide",
  "discover.japanLabel": "Japan Explained"
});

Object.assign(UI_TEXT.mn, {
  "themeStudio.open": "Aurora Theme Studio нээх",
  "themeStudio.title": "Aurora Theme Studio",
  "themeStudio.description": "Өөрийн accent palette-ийг сонго. Өнгө шууд урьдчилан харагдана.",
  "themeStudio.presets": "Өнгөний theme сонголтууд",
  "themeStudio.aurora": "Aurora Purple",
  "themeStudio.default": "Анхдагч",
  "themeStudio.ocean": "Ocean Night",
  "themeStudio.navyCyan": "Navy · Cyan",
  "themeStudio.emerald": "Emerald Matrix",
  "themeStudio.darkGreen": "Dark · Emerald",
  "themeStudio.sunset": "Sunset Neon",
  "themeStudio.orangePink": "Orange · Pink",
  "themeStudio.moonlight": "Moonlight",
  "themeStudio.silverIndigo": "Silver · Indigo",
  "themeStudio.livePreview": "Live preview идэвхтэй · Light/Dark горим тусдаа тохиргоо.",
  "themeStudio.previewing": "Урьдчилан харах: {theme} · Хадгалахын тулд хэрэглэх товчийг дарна уу.",
  "themeStudio.reset": "Анхдагч palette",
  "themeStudio.apply": "Загвар хэрэглэх",
  "themeStudio.saved": "{theme} загварыг хадгаллаа.",
  "footer.tagline": "Сониуч зан, технологи, жижиг дижитал ертөнц.",
  "footer.quickNav": "Шуурхай холбоос",
  "footer.projects": "Төслүүд",
  "footer.navigation": "Шуурхай навигаци",
  "footer.rights": "Бүх эрх хуулиар хамгаалагдсан.",
  "footer.language": "Хэл солих",
  "footer.appearance": "Горим солих"
});
Object.assign(UI_TEXT.en, {
  "themeStudio.open": "Open Aurora Theme Studio",
  "themeStudio.title": "Aurora Theme Studio",
  "themeStudio.description": "Choose an accent palette and preview it across the site.",
  "themeStudio.presets": "Accent theme presets",
  "themeStudio.aurora": "Aurora Purple",
  "themeStudio.default": "Default",
  "themeStudio.ocean": "Ocean Night",
  "themeStudio.navyCyan": "Navy · Cyan",
  "themeStudio.emerald": "Emerald Matrix",
  "themeStudio.darkGreen": "Dark · Emerald",
  "themeStudio.sunset": "Sunset Neon",
  "themeStudio.orangePink": "Orange · Pink",
  "themeStudio.moonlight": "Moonlight",
  "themeStudio.silverIndigo": "Silver · Indigo",
  "themeStudio.livePreview": "Live preview · Light/Dark appearance stays independent.",
  "themeStudio.previewing": "Previewing {theme} · Apply to save your choice.",
  "themeStudio.reset": "Reset to default",
  "themeStudio.apply": "Apply theme",
  "themeStudio.saved": "{theme} theme saved.",
  "footer.tagline": "Curiosity, technology, and a small digital universe.",
  "footer.quickNav": "Quick navigation",
  "footer.projects": "Projects",
  "footer.navigation": "Quick navigation",
  "footer.rights": "All rights reserved.",
  "footer.language": "Switch language",
  "footer.appearance": "Switch appearance"
});

function installAdminContentMarkup() {
  const nav = document.querySelector(".side-nav");
  const beforeAbout = nav?.querySelector('[data-page-link="about"]');
  if (beforeAbout && !nav.querySelector('[data-page-link="content"]')) {
    beforeAbout.insertAdjacentHTML("beforebegin", '<a class="nav-item" href="#content" data-page-link="content" data-admin-only hidden aria-label="Website content" data-i18n-aria="content.nav"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16M4 12h16M4 18.5h10"/><circle cx="6" cy="5.5" r=".5"/><circle cx="6" cy="12" r=".5"/><circle cx="6" cy="18.5" r=".5"/></svg><span data-i18n="content.nav">Website</span></a>');
  }
  const footer = document.querySelector(".page-footer");
  if (footer && !document.querySelector("#content-editor")) {
    footer.insertAdjacentHTML("beforebegin", `<section class="settings-grid" id="content-editor" data-page-view="content" data-admin-only hidden aria-labelledby="content-editor-title">
      <article class="settings-card content-editor-card">
        <div class="content-editor-heading"><div><h2 id="content-editor-title" data-i18n="content.title">Website content</h2><p data-i18n="content.description"></p></div><label class="content-locale-field"><span data-i18n="content.language">Language</span><select id="content-locale"><option value="mn">Монгол</option><option value="en">English</option></select></label></div>
        <form id="content-form" class="content-form">
          <label class="field"><span data-i18n="content.homeHeading"></span><input id="content-home-heading" maxlength="240" required></label>
          <label class="field"><span data-i18n="content.homeDescription"></span><textarea id="content-home-description" maxlength="2000" rows="3" required></textarea></label>
          <label class="field"><span data-i18n="content.aboutHeading"></span><input id="content-about-heading" maxlength="240" required></label>
          <label class="field"><span data-i18n="content.aboutDescription"></span><textarea id="content-about-description" maxlength="2000" rows="3" required></textarea></label>
          <div class="content-editor-footer"><p id="content-status" role="status" aria-live="polite"></p><div class="content-editor-actions"><button class="button button-secondary" id="content-delete" type="button" data-i18n="content.delete" hidden disabled></button><button class="button button-secondary" type="submit" data-content-status="draft" data-i18n="content.saveDraft" disabled></button><button class="button button-primary" type="submit" data-content-status="published" data-i18n="content.publish" disabled></button></div></div>
        </form>
      </article>
    </section>`);
  }
}

installAdminContentMarkup();

const AUTH_COPY = {
  mn: {
    loginTitle: "GNWAA-д нэвтрэх", loginDescription: "Өөрийн customer бүртгэлээ удирдахын тулд нэвтэрнэ үү.",
    registerTitle: "Бүртгэл үүсгэх", registerDescription: "GNWAA-д бүртгүүлээд өөрийн customer бүртгэлээ удирдаарай.",
    loginMode: "Нэвтрэх", registerMode: "Бүртгүүлэх", email: "Email", password: "Нууц үг", confirmPassword: "Нууц үг давтах",
    loginButton: "Нэвтрэх", registerButton: "Бүртгэл үүсгэх", footnote: "GNWAA бүртгэлээр нэвтэрч customer мэдээллээ удирдана.",
    signOut: "Бүртгэлээс гарах", configMissing: "GNWAA API тохиргоо хийгдээгүй байна. Backend-ийн орчны тохиргоог шалгана уу.",
    invalidCredentials: "Email эсвэл нууц үг буруу байна.", emailNotConfirmed: "Email хаягаа баталгаажуулаад дахин нэвтэрнэ үү.",
    rateLimited: "Олон удаа оролдлоо. Түр хүлээгээд дахин оролдоно уу.", authFailed: "Нэвтрэлт амжилтгүй. Мэдээллээ шалгаад дахин оролдоно уу.",
    registerFailed: "Бүртгэл үүсгэж чадсангүй. Email болон нууц үгээ шалгана уу.",
    verifyEmail: "Бүртгэл үүсгэлээ. Нэвтрэхээсээ өмнө email-ээ баталгаажуулна уу.",
    passwordLength: "Нууц үг дор хаяж 12 тэмдэгт байна.", passwordMismatch: "Нууц үгүүд хоорондоо таарахгүй байна.",
    emailRequired: "Хүчинтэй email хаяг оруулна уу.", signingIn: "Нэвтэрч байна…", registering: "Бүртгэж байна…",
    unavailable: "GNWAA API одоогоор боломжгүй байна. Backend-ээ шалгаад дахин оролдоно уу.", connected: "GNWAA · Нэвтэрсэн"
  },
  en: {
    loginTitle: "Sign in to GNWAA", loginDescription: "Sign in to manage your private customer records.",
    registerTitle: "Create your account", registerDescription: "Create a GNWAA account to manage your own customer records.",
    loginMode: "Sign in", registerMode: "Register", email: "Email", password: "Password", confirmPassword: "Confirm password",
    loginButton: "Sign in", registerButton: "Create account", footnote: "Sign in to manage customer records in your GNWAA account.",
    signOut: "Sign out", configMissing: "The GNWAA API is not configured. Check the backend environment settings.",
    invalidCredentials: "The email or password is incorrect.", emailNotConfirmed: "Confirm your email address before signing in.",
    rateLimited: "Too many attempts. Wait a moment and try again.", authFailed: "Sign in failed. Check your details and try again.",
    registerFailed: "Could not create the account. Check the email and password.",
    verifyEmail: "Account created. Confirm your email address before signing in.",
    passwordLength: "Use a password with at least 12 characters.", passwordMismatch: "The passwords do not match.",
    emailRequired: "Enter a valid email address.", signingIn: "Signing in…", registering: "Creating account…",
    unavailable: "The GNWAA API is unavailable. Check the backend and try again.", connected: "GNWAA · Signed in"
  }
};

const state = {
  customers: [],
  contentRecords: [],
  contentLoadStatus: "idle",
  contentLoadRequestId: 0,
  contentLoadPromise: null,
  contentBusy: false,
  publicContent: { mn: {}, en: {} },
  page: 1,
  currentPage: "home",
  discoverCategory: "all",
  discoverQuery: "",
  discoverSlug: null,
  discoverRecentSlugs: readDiscoverRecent(),
  loading: false,
  reloadAfterLoad: false,
  loadError: null,
  editing: null,
  deleting: null,
  busy: false,
  toastTimer: null,
  theme: "dark",
  accentTheme: "aurora-purple",
  themeStudioStart: null,
  mobileNavReturnFocus: null,
  language: "mn",
  connection: null,
  matrixFrame: null,
  matrixCleanup: null,
  splashSeen: false,
  splashRun: 0,
  splashHideTimer: null,
  splashFailsafeTimer: null,
  splashCleanup: null,
  formError: null,
  toast: null,
  session: null,
  authStatus: "checking",
  user: null,
  authMode: "login",
  authBusy: false,
  authNotice: "",
  authError: ""
};

const el = {
  sidebar: document.querySelector("#sidebar"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  mainShell: document.querySelector("#main"),
  mobileNavToggle: document.querySelector("#mobile-nav-toggle"),
  mobileNavBackdrop: document.querySelector("#mobile-nav-backdrop"),
  pageIntro: document.querySelector(".page-intro"),
  matrixLoader: document.querySelector("#matrix-loader"),
  matrixCanvas: document.querySelector("#matrix-canvas"),
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
  pageActions: document.querySelector("#page-actions"),
  discoverSurpriseButton: document.querySelector("#discover-surprise"),
  addButton: document.querySelector("#add-button"),
  pageTitle: document.querySelector("#page-title"),
  pageDescription: document.querySelector("#page-description"),
  pageEyebrow: document.querySelector("#page-eyebrow"),
  breadcrumbCurrent: document.querySelector("#breadcrumb-current"),
  recentCustomers: document.querySelector("#recent-customers"),
  settingsThemeToggle: document.querySelector("#settings-theme-toggle"),
  settingsLanguageToggle: document.querySelector("#settings-language-toggle"),
  themeStudioToggle: document.querySelector("#theme-studio-toggle"),
  themeStudioDialog: document.querySelector("#theme-studio-dialog"),
  themeStudioPresets: document.querySelector("#theme-studio-presets"),
  themeStudioLive: document.querySelector("#theme-studio-live"),
  themeStudioClose: document.querySelector("#theme-studio-close"),
  themeStudioCancel: document.querySelector("#theme-studio-cancel"),
  themeStudioApply: document.querySelector("#theme-studio-apply"),
  themeStudioReset: document.querySelector("#theme-studio-reset"),
  footerYear: document.querySelector("#footer-year"),
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
  toastRegion: document.querySelector("#toast-region"),
  authGate: document.querySelector("#auth-gate"),
  authSessionCheck: document.querySelector("#auth-session-check"),
  authTitle: document.querySelector("#auth-title"),
  authDescription: document.querySelector("#auth-description"),
  authKicker: document.querySelector("#auth-kicker"),
  authLoginMode: document.querySelector("#auth-login-mode"),
  authRegisterMode: document.querySelector("#auth-register-mode"),
  authEmailLabel: document.querySelector("#auth-email-label"),
  authPasswordLabel: document.querySelector("#auth-password-label"),
  authConfirmLabel: document.querySelector("#auth-confirm-label"),
  authFootnote: document.querySelector("#auth-footnote"),
  authForm: document.querySelector("#auth-form"),
  authEmail: document.querySelector("#auth-email"),
  authPassword: document.querySelector("#auth-password"),
  authConfirmRow: document.querySelector("#auth-confirm-row"),
  authConfirmPassword: document.querySelector("#auth-confirm-password"),
  authMessage: document.querySelector("#auth-message"),
  authConfigNotice: document.querySelector("#auth-config-notice"),
  authSubmit: document.querySelector("#auth-submit"),
  authSubmitLabel: document.querySelector("#auth-submit-label"),
  authSpinner: document.querySelector("#auth-spinner"),
  authLanguageToggle: document.querySelector("#auth-language-toggle"),
  signOutButton: document.querySelector("#sign-out-button"),
  loginLink: document.querySelector("#login-link"),
  profileDropdownWrap: document.querySelector("#profile-dropdown-wrap"),
  profileDropdown: document.querySelector("#profile-dropdown"),
  profileDropdownIdentity: document.querySelector("#profile-dropdown-identity"),
  profileMenuName: document.querySelector("#profile-menu-name"),
  profileMenuEmail: document.querySelector("#profile-menu-email"),
  profileMenuRole: document.querySelector("#profile-menu-role"),
  profileLogin: document.querySelector("#profile-login"),
  profileSettingsLink: document.querySelector("#profile-settings-link"),
  profileAdminLink: document.querySelector("#profile-admin-link"),
  profileLogout: document.querySelector("#profile-logout"),
  contentLocale: document.querySelector("#content-locale"),
  contentForm: document.querySelector("#content-form"),
  contentHomeHeading: document.querySelector("#content-home-heading"),
  contentHomeDescription: document.querySelector("#content-home-description"),
  contentAboutHeading: document.querySelector("#content-about-heading"),
  contentAboutDescription: document.querySelector("#content-about-description"),
  contentStatus: document.querySelector("#content-status"),
  contentDelete: document.querySelector("#content-delete"),
  profileName: document.querySelector("#profile-name"),
  profileRole: document.querySelector("#profile-role"),
  profileAvatar: document.querySelector("#profile-avatar"),
  topAvatar: document.querySelector("#top-avatar")
};

const labState = {
  activeTool: null,
  universe: { nickname: "", interests: [], selectedInterest: null },
  detective: { index: 0, score: 0, answered: false, finished: false },
  personality: { index: 0, answers: [], result: null }
};

const UNIVERSE_INTERESTS = {
  gaming: { symbol: "✦", planet: "Arcadia", label: { mn: "Gaming", en: "Gaming" }, copy: { mn: "Энд адал явдал, тоглоомын ертөнц, хамтдаа давсан сорилууд цугларна.", en: "A home for adventures, game worlds, and challenges solved together." } },
  music: { symbol: "♫", planet: "Sonata", label: { mn: "Music", en: "Music" }, copy: { mn: "Хэмнэл, аялгуу, шинэ дуу сонсох мөч бүр энэ гаригт багтана.", en: "Rhythms, melodies, and every moment spent discovering a new song." } },
  technology: { symbol: "⌘", planet: "Nexus", label: { mn: "Technology", en: "Technology" }, copy: { mn: "Шинэ санааг туршиж, жижиг бүтээлийг ажил хэрэг болгодог цэг.", en: "A place to test new ideas and turn small experiments into useful things." } },
  travel: { symbol: "⌁", planet: "Roam", label: { mn: "Travel", en: "Travel" }, copy: { mn: "Танил бус гудамж, холын газрын дурсамж, дараагийн аяллын мөрөөдөл.", en: "Unfamiliar streets, faraway memories, and the next trip on your map." } },
  art: { symbol: "✎", planet: "Muse", label: { mn: "Art", en: "Art" }, copy: { mn: "Өнгө, дүрс, хөгжим эсвэл үгээр өөрийгөө илэрхийлэх орон зай.", en: "A space for expressing yourself through colour, shape, sound, or words." } },
  science: { symbol: "⚛", planet: "Nova", label: { mn: "Science", en: "Science" }, copy: { mn: "Яагаад гэдгийг асууж, ажиглаж, шинэ зүйл нээх лаборатори.", en: "A little lab for asking why, observing closely, and discovering something new." } }
};

const DETECTIVE_COPY = {
  correct: { mn: "Зөв оллоо!", en: "Good catch!" },
  tryAgain: { mn: "Энэ удаа өөр байлаа.", en: "Not quite this time." },
  suspicious: { mn: "Сэжигтэй", en: "Suspicious" },
  safe: { mn: "Аюулгүй", en: "Safe" },
  score: { mn: "{score} / {total} зөв", en: "{score} / {total} correct" },
  perfect: { mn: "Маш сайн ажиглалаа!", en: "Sharp detective work!" },
  good: { mn: "Сайн ажиллалаа. Дахиад нэг нягтлахад илүүдэхгүй.", en: "Nice work. A second look is always useful." },
  practice: { mn: "Дасгал үргэлжилнэ. Яаруулсан үг, хүсээгүй холбоос, нууц код асуусан эсэхийг ажиглаарай.", en: "Keep practicing. Watch for urgency, unexpected links, and requests for secret codes." }
};

const DETECTIVE_CASES = [
  {
    type: { mn: "Сэжигтэй имэйл", en: "Phishing email" }, source: "account-help@example.invalid",
    title: { mn: "Бүртгэлээ 10 минутын дотор баталгаажуул!", en: "Verify your account in 10 minutes!" },
    message: { mn: "Таны бүртгэлийг хаахаас өмнө нууц үгээ энэ хуудсанд оруулна уу. Дэмжлэгийн баг танаас нууц үгээ имэйлээр хэзээ ч асуухгүй.", en: "Enter your password on this page before we close your account. Support will never ask you to send your password by email." },
    link: "https://account-check.example.invalid/verify", suspicious: true,
    reason: { mn: "Яаралтай хугацаа тулгаж, нууц үг шаардаж байна. Домэйн нь жинхэнэ үйлчилгээний домэйн гэж батлагдаагүй.", en: "It creates urgency and asks for a password. The domain is not a verified service address." },
    tip: { mn: "Имэйл доторх холбоосыг бүү нээ. Үйлчилгээний албан ёсны апп эсвэл өөрөө мэддэг хаягаар орж шалга.", en: "Do not open the message link. Check through the official app or a web address you already know." }
  },
  {
    type: { mn: "Сэжигтэй хүргэлтийн мессеж", en: "Suspicious delivery message" }, source: "Unknown sender · SMS",
    title: { mn: "Илгээмж саатлаа", en: "Your parcel is on hold" },
    message: { mn: "Хүргэлтийг үргэлжлүүлэхийн тулд картын мэдээлэл болон нэг удаагийн кодоо оруулна уу.", en: "Enter your card details and one-time code to release the delivery." },
    link: "https://parcel-status.example.invalid/release", suspicious: true,
    reason: { mn: "Хүргэлтийн нэрээр санхүүгийн мэдээлэл, нэг удаагийн нууц код нэхэж байна.", en: "It uses a delivery story to request payment details and a one-time security code." },
    tip: { mn: "Нэг удаагийн кодоо хэнд ч бүү өг. Хүргэлтийн мэдээллийг албан ёсны апп эсвэл захиалгын хуудсаар шалга.", en: "Never share a one-time code. Check delivery details in the official app or order page." }
  },
  {
    type: { mn: "Энгийн мессеж", en: "Routine message" }, source: "Class group · Message",
    title: { mn: "Хуваарь шинэчлэгдлээ", en: "The schedule was updated" },
    message: { mn: "Шинэ хуваарийг ердийн сургуулийн апп дээр байршууллаа. Аппаа өөрөө нээгээд үзээрэй. Нууц үг эсвэл код хэрэггүй.", en: "The updated schedule is in our usual school app. Open the app yourself to check. No password or code is needed." },
    link: "", suspicious: false,
    reason: { mn: "Танил сувгаар мэдээлж, гэнэтийн холбоос болон нууц мэдээлэл шаардаагүй байна.", en: "It points you to a familiar channel and does not ask for a secret or an unexpected link click." },
    tip: { mn: "Энэ жишээ аюулгүй мэт боловч илгээгчийг эргэлзвэл өөр танил сувгаар баталгаажуул.", en: "This example looks routine. If you are unsure about a sender, confirm through another known channel." }
  },
  {
    type: { mn: "Дуураймал URL", en: "Lookalike URL" }, source: "Direct message · URL",
    title: { mn: "Нууц үгээ шинэчилнэ үү", en: "Reset your password" },
    message: { mn: "Найзын тань илгээсэн мэт харагдах холбоос таныг нэвтрэх мэдээллээ шинэчлэхийг хүсэж байна.", en: "A link that appears to come from a friend asks you to update your sign-in details." },
    link: "https://micros0ft-help.example.invalid/reset", suspicious: true,
    reason: { mn: "Хуурамч домэйн нь танил нэрийг дуурайж, URL дотор тоо ашигласан байна. HTTPS цоож байгаа нь сайтыг найдвартай гэдгийг дангаараа батлахгүй.", en: "The domain imitates a familiar name and swaps a character. An HTTPS lock alone does not prove a site is trustworthy." },
    tip: { mn: "Домэйн нэрийг бүхэлд нь шалга. Нэвтрэх бол өөрөө албан ёсны хаягийг бичиж ор.", en: "Read the full domain carefully. To sign in, type the official address yourself." }
  }
];

const PERSONALITY_PROFILES = {
  explorer: {
    title: { mn: "Сониуч аялагч", en: "Curious Explorer" },
    copy: { mn: "Чамд шинэ орчин, шинэ санаа эрч хүч өгдөг. Эхлээд туршиж үзээд, дараа нь газрын зургаа зурдаг хүн байна.", en: "New places and fresh ideas give you energy. You like to try things first, then draw the map as you go." },
    traits: { mn: ["Шинэ зүйлд нээлттэй", "Ажигч", "Туршиж үздэг"], en: ["Open to novelty", "Observant", "Hands-on"] }, icon: "✦"
  },
  creator: {
    title: { mn: "Санаа бүтээгч", en: "Creative Builder" },
    copy: { mn: "Санааг бодит зүйл болгох үед чи хамгийн их урам авдаг. Өөрийн өнгө аясыг нэмээд, туршилтаа бусадтай хуваалцаарай.", en: "You come alive when an idea becomes something real. Add your own touch and share what you make." },
    traits: { mn: ["Бүтээлч", "Санаачилгатай", "Хийж бүтээдэг"], en: ["Imaginative", "Resourceful", "Maker-minded"] }, icon: "✎"
  },
  analyst: {
    title: { mn: "Тунгаан бодогч", en: "Thoughtful Analyst" },
    copy: { mn: "Чи учир шалтгааныг олж харах дуртай. Асуултаа нарийвчилж, баримтыг ажиглаад, утга учрыг нь тайлдаг.", en: "You enjoy finding the reason behind things. You sharpen the question, notice the details, and connect the dots." },
    traits: { mn: ["Нягт нямбай", "Логиктой", "Асуулт асуудаг"], en: ["Detail-aware", "Logical", "Question-led"] }, icon: "⌘"
  }
};

const PERSONALITY_QUESTIONS = [
  { prompt: { mn: "Чөлөөт өдөр гарвал аль нь хамгийн их татах вэ?", en: "What sounds best on a free day?" }, options: [
    { profile: "explorer", text: { mn: "Өмнө нь очиж байгаагүй газар үзэх", en: "Explore somewhere I have never been" } },
    { profile: "creator", text: { mn: "Шинэ зүйл хийж эсвэл бүтээж үзэх", en: "Make or build something new" } },
    { profile: "analyst", text: { mn: "Сонирхсон сэдвээ гүнзгий судлах", en: "Dive deep into a topic I am curious about" } }
  ] },
  { prompt: { mn: "Шинэ асуудалтай тулгарахад чи яаж эхэлдэг вэ?", en: "How do you start when you meet a new problem?" }, options: [
    { profile: "explorer", text: { mn: "Хэд хэдэн арга туршиж үзнэ", en: "Try a few different approaches" } },
    { profile: "creator", text: { mn: "Хурдан загвар гаргаад үзнэ", en: "Sketch a quick prototype" } },
    { profile: "analyst", text: { mn: "Баримт, шалтгааныг нь нягтална", en: "Check the facts and underlying causes" } }
  ] },
  { prompt: { mn: "Багийн ажил дээр чамд аль үүрэг илүү тохирох вэ?", en: "Which role feels natural in a team?" }, options: [
    { profile: "explorer", text: { mn: "Шинэ боломж, чиглэлийг олж харах", en: "Spot new possibilities and directions" } },
    { profile: "creator", text: { mn: "Санааг бодит ажил болгох", en: "Turn the idea into something real" } },
    { profile: "analyst", text: { mn: "Төлөвлөгөө, нарийн зүйлсийг цэгцлэх", en: "Organize the plan and the details" } }
  ] },
  { prompt: { mn: "Сурахдаа аль аргыг илүүд үздэг вэ?", en: "How do you prefer to learn?" }, options: [
    { profile: "explorer", text: { mn: "Өөрөө оролдож үзээд", en: "By experimenting for myself" } },
    { profile: "creator", text: { mn: "Жишээ дагаж хийж үзээд", en: "By following an example and making my own" } },
    { profile: "analyst", text: { mn: "Эхлээд ойлголтыг нь уншаад", en: "By understanding the concepts first" } }
  ] },
  { prompt: { mn: "Найз чинь “яагаад?” гэж асуувал...", en: "When a friend asks “why?”..." }, options: [
    { profile: "explorer", text: { mn: "Хамтдаа туршиж мэдэхийг санал болгоно", en: "I suggest we explore it together" } },
    { profile: "creator", text: { mn: "Харагдахуйц жишээгээр үзүүлнэ", en: "I show them with a tangible example" } },
    { profile: "analyst", text: { mn: "Учир шалтгааныг нь тайлбарлаж өгнө", en: "I explain the reasoning behind it" } }
  ] }
];

function t(key, values = {}) {
  const template = UI_TEXT[state.language]?.[key] || UI_TEXT.mn[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}

function authText(key) {
  return AUTH_COPY[state.language]?.[key] || AUTH_COPY.mn[key] || key;
}

function labValue(copy) {
  if (copy && typeof copy === "object") return copy[state.language] || copy.mn || "";
  return String(copy ?? "");
}

function labFormat(copy, values = {}) {
  return labValue(copy).replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

function applyLabLanguage() {
  const language = state.language;
  document.querySelectorAll("[data-lab-mn][data-lab-en]").forEach((node) => {
    node.textContent = node.dataset[`lab${language === "mn" ? "Mn" : "En"}`];
  });
  document.querySelectorAll("[data-lab-placeholder-mn][data-lab-placeholder-en]").forEach((node) => {
    node.setAttribute("placeholder", node.dataset[`labPlaceholder${language === "mn" ? "Mn" : "En"}`]);
  });
  document.querySelectorAll("[data-lab-aria-mn][data-lab-aria-en]").forEach((node) => {
    node.setAttribute("aria-label", node.dataset[`labAria${language === "mn" ? "Mn" : "En"}`]);
  });
  document.querySelector(".du-planet-field")?.setAttribute("aria-label", language === "mn" ? "Сонирхлын гаригууд" : "Interest planets");
  document.querySelector(".id-progress")?.setAttribute("aria-label", language === "mn" ? "Даалгаврын ахиц" : "Challenge progress");
  document.querySelector(".pl-progress")?.setAttribute("aria-label", language === "mn" ? "Асуултын ахиц" : "Question progress");
  renderUniversePlanets();
  renderDetective();
  renderPersonality();
}

function showLabTool(tool) {
  labState.activeTool = tool;
  document.querySelector("#about-labs-hub").hidden = Boolean(tool);
  document.querySelectorAll("[data-lab-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.labPanel !== tool;
  });
  if (tool === "universe") document.querySelector("#du-nickname").focus();
  if (tool === "detective") renderDetective();
  if (tool === "personality") renderPersonality();
}

function renderUniversePlanets() {
  const universe = document.querySelector("#du-universe");
  const list = document.querySelector("#du-planet-list");
  if (!universe || !list) return;

  list.replaceChildren();
  const { nickname, interests, selectedInterest } = labState.universe;
  universe.hidden = !nickname || interests.length === 0;
  if (universe.hidden) return;

  document.querySelector("#du-owner-name").textContent = nickname;
  document.querySelector("#du-planet-count").textContent = state.language === "mn"
    ? `${interests.length} гариг`
    : `${interests.length} ${interests.length === 1 ? "planet" : "planets"}`;

  interests.forEach((id) => {
    const interest = UNIVERSE_INTERESTS[id];
    if (!interest) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `du-planet du-planet--${id}${id === selectedInterest ? " is-selected" : ""}`;
    button.dataset.interest = id;
    button.setAttribute("aria-pressed", String(id === selectedInterest));
    button.setAttribute("aria-label", `${interest.planet} · ${labValue(interest.label)}`);

    const orb = document.createElement("span");
    orb.className = "du-planet-orb";
    orb.setAttribute("aria-hidden", "true");
    const symbol = document.createElement("span");
    symbol.textContent = interest.symbol;
    orb.append(symbol);
    const name = document.createElement("span");
    name.className = "du-planet-name";
    name.textContent = interest.planet;
    button.append(orb, name);
    list.append(button);
  });

  if (selectedInterest && interests.includes(selectedInterest)) showUniversePlanet(selectedInterest);
  else document.querySelector("#du-planet-detail").hidden = true;
}

function showUniversePlanet(id) {
  const interest = UNIVERSE_INTERESTS[id];
  if (!interest) return;
  labState.universe.selectedInterest = id;
  document.querySelectorAll(".du-planet").forEach((planet) => {
    const selected = planet.dataset.interest === id;
    planet.classList.toggle("is-selected", selected);
    planet.setAttribute("aria-pressed", String(selected));
  });
  document.querySelector("#du-detail-symbol").textContent = interest.symbol;
  document.querySelector("#du-detail-title").textContent = `${interest.planet} · ${labValue(interest.label)}`;
  document.querySelector("#du-detail-copy").textContent = labValue(interest.copy);
  document.querySelector("#du-planet-detail").hidden = false;
}

function resetUniverse() {
  document.querySelector("#du-form").reset();
  document.querySelector("#du-message").textContent = "";
  labState.universe = { nickname: "", interests: [], selectedInterest: null };
  renderUniversePlanets();
}

function createUniverse(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const nickname = String(new FormData(form).get("nickname") || "").trim();
  const interests = [...new Set(new FormData(form).getAll("interest"))].filter((id) => Object.hasOwn(UNIVERSE_INTERESTS, id));
  const message = document.querySelector("#du-message");
  if (!interests.length) {
    message.textContent = state.language === "mn" ? "Дор хаяж нэг сонирхол сонгоорой." : "Choose at least one interest.";
    return;
  }
  labState.universe = { nickname: nickname || "Nova", interests, selectedInterest: interests[0] };
  message.textContent = "";
  renderUniversePlanets();
  showUniversePlanet(interests[0]);
}

function renderDetective() {
  const progress = document.querySelector(".id-progress");
  if (!progress) return;
  const feedback = document.querySelector("#id-feedback");
  const caseCard = document.querySelector("#id-case-card");
  const choiceArea = document.querySelector("#id-choice-area");
  const nextButton = document.querySelector("#id-next");
  const { index, score, answered, finished } = labState.detective;
  const total = DETECTIVE_CASES.length;

  document.querySelector("#id-score").textContent = `${score} / ${total}`;
  progress.setAttribute("aria-valuenow", String(finished ? total : index + (answered ? 1 : 0)));
  document.querySelector("#id-progress-fill").style.width = `${finished ? 100 : ((index + (answered ? 1 : 0)) / total) * 100}%`;
  document.querySelector("#id-case-count").textContent = `${Math.min(index + 1, total)} / ${total}`;
  caseCard.hidden = finished;
  choiceArea.hidden = finished || answered;
  feedback.hidden = !finished && !answered;
  nextButton.hidden = finished || !answered;
  document.querySelectorAll("[data-detective-answer]").forEach((button) => { button.disabled = answered || finished; });

  if (finished) {
    document.querySelector("#id-feedback-title").textContent = labValue(score === total ? DETECTIVE_COPY.perfect : score >= 3 ? DETECTIVE_COPY.good : DETECTIVE_COPY.practice);
    document.querySelector("#id-feedback-copy").textContent = labFormat(DETECTIVE_COPY.score, { score, total });
    document.querySelector("#id-feedback-tip").textContent = state.language === "mn"
      ? "Дахин эхлүүлээд өөр хувилбар туршаарай."
      : "Start over whenever you want to try again.";
    return;
  }

  const item = DETECTIVE_CASES[index];
  document.querySelector("#id-case-type").textContent = labValue(item.type);
  document.querySelector("#id-case-source").textContent = item.source;
  document.querySelector("#id-case-title").textContent = labValue(item.title);
  document.querySelector("#id-case-message").textContent = labValue(item.message);
  const link = document.querySelector("#id-case-link");
  link.textContent = item.link;
  link.hidden = !item.link;

  if (!answered) return;
  const isCorrect = labState.detective.choice === item.suspicious;
  const correctAnswer = labValue(item.suspicious ? DETECTIVE_COPY.suspicious : DETECTIVE_COPY.safe);
  document.querySelector("#id-feedback-title").textContent = isCorrect
    ? `${labValue(DETECTIVE_COPY.correct)} · ${correctAnswer}`
    : `${labValue(DETECTIVE_COPY.tryAgain)} ${state.language === "mn" ? "Зөв хариулт:" : "Correct answer:"} ${correctAnswer}`;
  document.querySelector("#id-feedback-copy").textContent = labValue(item.reason);
  document.querySelector("#id-feedback-tip").textContent = labValue(item.tip);
  document.querySelectorAll("[data-detective-answer]").forEach((button) => { button.disabled = true; });
  nextButton.textContent = index === total - 1
    ? (state.language === "mn" ? "Үр дүн харах" : "See result")
    : (state.language === "mn" ? "Дараагийн жишээ" : "Next case");
}

function answerDetective(isSuspicious) {
  if (labState.detective.answered || labState.detective.finished) return;
  const item = DETECTIVE_CASES[labState.detective.index];
  labState.detective.choice = isSuspicious;
  labState.detective.answered = true;
  if (isSuspicious === item.suspicious) labState.detective.score += 1;
  renderDetective();
}

function nextDetectiveCase() {
  if (!labState.detective.answered || labState.detective.finished) return;
  if (labState.detective.index >= DETECTIVE_CASES.length - 1) {
    labState.detective.finished = true;
  } else {
    labState.detective.index += 1;
    labState.detective.answered = false;
    labState.detective.choice = null;
  }
  renderDetective();
}

function resetDetective() {
  labState.detective = { index: 0, score: 0, answered: false, finished: false, choice: null };
  document.querySelectorAll("[data-detective-answer]").forEach((button) => { button.disabled = false; });
  renderDetective();
}

function renderPersonality() {
  const form = document.querySelector("#pl-form");
  if (!form) return;
  const result = document.querySelector("#pl-result");
  const progress = document.querySelector(".pl-progress");
  const { index, answers, result: profileId } = labState.personality;
  const total = PERSONALITY_QUESTIONS.length;
  form.hidden = Boolean(profileId);
  result.hidden = !profileId;
  progress.setAttribute("aria-valuenow", String(profileId ? total : index));
  document.querySelector("#pl-progress-fill").style.width = `${(profileId ? total : index) / total * 100}%`;
  document.querySelector("#pl-progress-label").textContent = profileId
    ? (state.language === "mn" ? "ДУУСЛАА" : "COMPLETE")
    : `${state.language === "mn" ? "Асуулт" : "Question"} ${index + 1} / ${total}`;
  document.querySelector("#pl-progress-style").textContent = profileId ? "GNWAA / YOU" : `0${index + 1} / 0${total}`;
  document.querySelector("#pl-back").hidden = index === 0 || Boolean(profileId);

  if (profileId) {
    const profile = PERSONALITY_PROFILES[profileId];
    document.querySelector("#pl-result-title").textContent = labValue(profile.title);
    document.querySelector("#pl-result-copy").textContent = labValue(profile.copy);
    document.querySelector(".pl-result-mark").textContent = profile.icon;
    const tags = document.querySelector("#pl-result-tags");
    tags.replaceChildren();
    profile.traits[state.language].forEach((trait) => {
      const tag = document.createElement("span");
      tag.textContent = trait;
      tags.append(tag);
    });
    return;
  }

  const question = PERSONALITY_QUESTIONS[index];
  document.querySelector("#pl-question").textContent = labValue(question.prompt);
  const options = document.querySelector("#pl-options");
  options.replaceChildren();
  question.options.forEach((option, optionIndex) => {
    const label = document.createElement("label");
    label.className = "pl-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "pl-answer";
    input.value = option.profile;
    input.checked = answers[index] === option.profile;
    input.required = true;
    const text = document.createElement("span");
    text.className = "pl-option-copy";
    text.textContent = labValue(option.text);
    const number = document.createElement("span");
    number.className = "pl-option-number";
    number.textContent = `0${optionIndex + 1}`;
    label.append(input, text, number);
    options.append(label);
  });
  const next = document.querySelector("#pl-next");
  next.disabled = !answers[index];
  next.textContent = index === total - 1
    ? (state.language === "mn" ? "Үр дүнгээ харах" : "See my result")
    : (state.language === "mn" ? "Дараах" : "Next");
}

function advancePersonality(event) {
  event.preventDefault();
  const selected = document.querySelector('#pl-options input[name="pl-answer"]:checked');
  if (!selected) return;
  const { index } = labState.personality;
  labState.personality.answers[index] = selected.value;
  if (index < PERSONALITY_QUESTIONS.length - 1) {
    labState.personality.index += 1;
  } else {
    const scores = { explorer: 0, creator: 0, analyst: 0 };
    labState.personality.answers.forEach((answer) => { if (scores[answer] !== undefined) scores[answer] += 1; });
    const highest = Math.max(...Object.values(scores));
    labState.personality.result = labState.personality.answers.find((answer) => scores[answer] === highest) || "explorer";
  }
  renderPersonality();
}

function resetPersonality() {
  labState.personality = { index: 0, answers: [], result: null };
  renderPersonality();
}

function displayNameForUser(user) {
  if (typeof user?.name === "string" && user.name.trim()) return user.name.trim();
  const localPart = String(user?.email || "").split("@")[0];
  return localPart.split(/[._-]+/).filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase() + part.slice(1)).join(" ");
}

function updateProfileMenu() {
  const user = state.user;
  const owner = user?.role === "owner";
  const displayName = displayNameForUser(user);
  el.profileDropdownIdentity.hidden = !user;
  el.profileLogin.hidden = Boolean(user);
  el.profileSettingsLink.hidden = !owner;
  el.profileAdminLink.hidden = !owner;
  el.profileLogout.hidden = !user;
  if (user) {
    el.profileMenuName.textContent = displayName || user.email;
    el.profileMenuEmail.textContent = user.email;
    el.profileMenuRole.textContent = t(owner ? "profile.owner" : "profile.member");
  }
  const avatar = displayName.charAt(0).toLocaleUpperCase() || "G";
  el.topAvatar.textContent = avatar;
  el.topAvatar.setAttribute("aria-label", t(el.profileDropdown.hidden ? "profile.open" : "profile.close"));
  el.topAvatar.title = t(el.profileDropdown.hidden ? "profile.open" : "profile.close");
  if (!user && !el.profileDropdown.hidden) setProfileMenuOpen(false, { restoreFocus: false });
}

function profileMenuItems() {
  return [...el.profileDropdown.querySelectorAll('[role="menuitem"]')]
    .filter((item) => !item.hidden && !item.disabled);
}

function setProfileMenuOpen(open, { restoreFocus = true, focusFirst = true } = {}) {
  el.profileDropdown.hidden = !open;
  el.topAvatar.setAttribute("aria-expanded", String(open));
  el.topAvatar.setAttribute("aria-label", t(open ? "profile.close" : "profile.open"));
  el.topAvatar.title = t(open ? "profile.close" : "profile.open");
  if (open && focusFirst) window.requestAnimationFrame(() => profileMenuItems()[0]?.focus());
  if (!open && restoreFocus) el.topAvatar.focus();
}

async function navigateToAdminDashboard() {
  setProfileMenuOpen(false, { restoreFocus: false });
  try {
    const result = await requestJson("/auth/me");
    state.authStatus = "authenticated";
    applyAuthSession(result.user);
    if (result.user?.role !== "owner") {
      window.history.pushState({}, "", "/login");
      state.authError = t("auth.ownerOnly");
      updateAuthenticatedView();
      return;
    }
    window.history.pushState({}, "", "/admin#home");
    setActivePage("home", false, true);
    void loadCustomers();
  } catch (error) {
    if (error?.status === 401) {
      state.authStatus = "anonymous";
      applyAuthSession(null);
      window.history.pushState({}, "", "/login");
      updateAuthenticatedView();
      showAuthMessage(t("auth.sessionExpired"), "error");
      return;
    }
    showToast({ error: { message: authErrorText(error) } }, "error");
  }
}

function renderAuthForm() {
  state.authMode = "login";
  el.authTitle.textContent = authText("loginTitle");
  el.authDescription.textContent = authText("loginDescription");
  el.authLoginMode.textContent = authText("loginMode");
  el.authLoginMode.hidden = true;
  el.authRegisterMode.hidden = true;
  el.authLoginMode.closest(".auth-mode-switch").hidden = true;
  el.authEmailLabel.textContent = authText("email");
  el.authPasswordLabel.textContent = authText("password");
  el.authConfirmLabel.textContent = authText("confirmPassword");
  el.authConfirmRow.hidden = true;
  el.authConfirmPassword.required = false;
  el.authPassword.autocomplete = "current-password";
  el.authFootnote.textContent = t("auth.noSignup");
  el.authSubmitLabel.textContent = state.authBusy
    ? authText("signingIn")
    : authText("loginButton");
  el.authSpinner.hidden = !state.authBusy;
  el.authSubmit.disabled = state.authBusy;
  el.authLoginMode.disabled = state.authBusy;
  el.authRegisterMode.disabled = state.authBusy;
  el.authMessage.textContent = state.authError || state.authNotice;
  el.authMessage.hidden = !state.authError && !state.authNotice;
  el.authMessage.classList.toggle("error", Boolean(state.authError));
  el.authConfigNotice.hidden = true;
  el.authLanguageToggle.textContent = state.language === "mn" ? "EN" : "MN";
  const languageLabel = t(state.language === "mn" ? "language.toEnglish" : "language.toMongolian");
  el.authLanguageToggle.setAttribute("aria-label", languageLabel);
  el.authLanguageToggle.title = languageLabel;
  const signOutLabel = authText("signOut");
  el.signOutButton.setAttribute("aria-label", signOutLabel);
  el.signOutButton.title = signOutLabel;
  el.signOutButton.hidden = !state.user;

  const identity = displayNameForUser(state.user) || state.user?.email || "GNWAA";
  const avatar = identity.trim().charAt(0).toLocaleUpperCase() || "G";
  el.profileName.textContent = identity;
  el.profileName.title = state.user?.email || identity;
  el.profileRole.textContent = state.user
    ? t(state.user.role === "owner" ? "profile.owner" : "profile.member")
    : t("profile.guest");
  el.profileAvatar.textContent = avatar;
  if (el.loginLink) {
    const owner = state.user?.role === "owner";
    el.loginLink.href = owner ? "/admin#home" : "/login";
    el.loginLink.textContent = t(owner ? "auth.adminLink" : "auth.loginLink");
    el.loginLink.hidden = owner && isAdminPath();
  }
  updateProfileMenu();
  el.authSessionCheck.hidden = !(state.authStatus === "checking" && (isAdminPath() || normalizedPath() === "/login"));
  el.authForm.hidden = !el.authSessionCheck.hidden;
  const authBrand = document.querySelector(".auth-brand");
  if (authBrand) authBrand.href = "/";
}

function showAuthMessage(message, kind = "notice") {
  state.authNotice = kind === "notice" ? message : "";
  state.authError = kind === "error" ? message : "";
  renderAuthForm();
}

function setAuthMode(mode) {
  state.authMode = "login";
  state.authError = "";
  state.authNotice = "";
  el.authConfirmPassword.value = "";
  renderAuthForm();
}

function normalizedPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

function isAdminPath() {
  return normalizedPath() === "/admin";
}

function updateAuthenticatedView() {
  let isOwner = state.user?.role === "owner";
  if (isAdminPath() && !isOwner && state.authStatus !== "checking" && state.authStatus !== "error") {
    window.history.replaceState({}, "", `/login${window.location.hash || ""}`);
  }
  isOwner = state.user?.role === "owner";
  const requiresOwner = isAdminPath() || normalizedPath() === "/login";
  const gateVisible = requiresOwner && !isOwner;
  el.authGate.hidden = !gateVisible;
  const application = document.querySelector(".app-layout");
  application.inert = gateVisible;
  application.setAttribute("aria-hidden", String(gateVisible));
  if (isOwner && normalizedPath() === "/login") {
    window.history.replaceState({}, "", `/admin${window.location.hash || "#home"}`);
  }
  if (gateVisible && state.user && state.user.role !== "owner" && !state.authError) {
    state.authError = t("auth.ownerOnly");
  }
  el.authSessionCheck.hidden = !(requiresOwner && state.authStatus === "checking");
  el.authForm.hidden = !el.authSessionCheck.hidden;
  updateProfileMenu();
  renderAuthForm();
}

function authErrorText(error) {
  if (error?.status === 429) return authText("rateLimited");
  if (error?.status === 401) return authText("invalidCredentials");
  if (error?.status === 0) return t("auth.apiUnavailable");
  if (error?.status === 403 && /owner access required/i.test(error?.message || "")) return t("auth.ownerOnly");
  return error?.message || authText("authFailed");
}

function applyAuthSession(user) {
  const previousUserId = state.user?.id || null;
  const nextUser = user || null;
  const nextUserId = nextUser?.id || null;
  if (nextUser) state.authStatus = "authenticated";
  state.session = nextUser ? true : null;
  state.user = nextUser;

  if (previousUserId !== nextUserId) {
    state.customers = [];
    state.contentRecords = [];
    state.contentLoadStatus = "idle";
    state.contentLoadRequestId += 1;
    state.contentLoadPromise = null;
    state.contentBusy = false;
    state.page = 1;
    state.loadError = null;
    state.authError = "";
    state.authNotice = "";
    el.customerModal.hidden = true;
    el.deleteModal.hidden = true;
    state.reloadAfterLoad = Boolean(state.loading && nextUser?.role === "owner");
    if (nextUser?.role === "owner" && isAdminPath()) {
      window.setTimeout(() => { void loadCustomers(); }, 0);
    }
    else state.connection = null;
  }

  document.querySelectorAll("[data-admin-only]").forEach((node) => { node.hidden = nextUser?.role !== "owner"; });
  updatePageCopy();
  updateAuthenticatedView();
  updateContentActionState();
  render();
}

async function initializeAuthentication() {
  try {
    const result = await requestJson("/auth/me");
    state.authStatus = "authenticated";
    applyAuthSession(result.user);
    if (result.user?.role === "owner" && isAdminPath() && state.currentPage === "content") {
      await loadAdminContent();
    }
    updateConnection(true);
  } catch (error) {
    state.authStatus = error?.status === 401 ? "anonymous" : "error";
    applyAuthSession(null);
    updateConnection(error?.status === 401);
    if (error?.status !== 401 && (isAdminPath() || normalizedPath() === "/login")) {
      showAuthMessage(t("auth.apiUnavailable"), "error");
    }
  }
}

async function submitAuthentication(event) {
  event.preventDefault();
  if (state.authBusy) return;

  const email = el.authEmail.value.trim().toLowerCase();
  const password = el.authPassword.value;
  if (!email || !el.authEmail.checkValidity()) {
    showAuthMessage(authText("emailRequired"), "error");
    return;
  }
  if (!password) {
    showAuthMessage(authText("authFailed"), "error");
    return;
  }

  state.authBusy = true;
  state.authError = "";
  state.authNotice = "";
  renderAuthForm();
  try {
    const result = await requestJson("/auth/login", {
      method: "POST",
      body: { email, password }
    });
    resetCsrfToken();
    if (result.user?.role !== "owner") {
      await requestJson("/auth/logout", { method: "POST" });
      resetCsrfToken();
      state.authStatus = "anonymous";
      applyAuthSession(null);
      showAuthMessage(t("auth.ownerOnly"), "error");
      updateAuthenticatedView();
      return;
    }
    state.authStatus = "authenticated";
    state.authError = "";
    state.authNotice = "";
    applyAuthSession(result.user);
    if (!isAdminPath()) window.history.pushState({}, "", "/admin#home");
    updateAuthenticatedView();
    setActivePage(window.location.hash.slice(1) || "home", false, true);
    void loadCustomers();
  } catch (error) {
    showAuthMessage(authErrorText(error), "error");
  } finally {
    state.authBusy = false;
    renderAuthForm();
  }
}

async function signOut() {
  if (!state.user) return;
  el.signOutButton.disabled = true;
  try {
    await requestJson("/auth/logout", { method: "POST" });
    resetCsrfToken();
    const destinationPage = isAdminPath() ? "home" : pageFromCurrentLocation();
    if (isAdminPath()) window.history.pushState({}, "", "/#home");
    state.authStatus = "anonymous";
    applyAuthSession(null);
    setActivePage(destinationPage, false);
  } catch (error) {
    showToast({ error: { message: authErrorText(error) } }, "error");
  } finally {
    el.signOutButton.disabled = false;
  }
}

function readPreference(key, allowed, fallback) {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function resolveThemeStudioAction(action, selectedTheme, originalTheme) {
  if (action === "cancel") return ACCENT_THEME_IDS.includes(originalTheme) ? originalTheme : "aurora-purple";
  if (action === "reset") return "aurora-purple";
  return ACCENT_THEME_IDS.includes(selectedTheme) ? selectedTheme : "aurora-purple";
}

function writePreference(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Storage may be unavailable in private or file mode. */ }
}

function renderThemeStudioSelection() {
  const preset = ACCENT_THEMES.find((theme) => theme.id === state.accentTheme) || ACCENT_THEMES[0];
  el.themeStudioPresets.querySelectorAll("[data-theme-preset]").forEach((button) => {
    const selected = button.dataset.themePreset === preset.id;
    button.setAttribute("aria-pressed", String(selected));
    button.classList.toggle("is-selected", selected);
  });
  el.themeStudioLive.textContent = t("themeStudio.previewing", { theme: preset.name });
}

function applyAccentTheme(themeId, persist = true) {
  const preset = ACCENT_THEMES.find((theme) => theme.id === themeId) || ACCENT_THEMES[0];
  state.accentTheme = preset.id;
  document.documentElement.dataset.accentTheme = preset.id;
  if (persist) writePreference(ACCENT_THEME_KEY, preset.id);
  renderThemeStudioSelection();
}

function openThemeStudio() {
  state.themeStudioStart = state.accentTheme;
  renderThemeStudioSelection();
  el.themeStudioToggle.setAttribute("aria-expanded", "true");
  el.themeStudioDialog.showModal();
  window.requestAnimationFrame(() => {
    el.themeStudioPresets.querySelector(`[data-theme-preset="${state.accentTheme}"]`)?.focus();
  });
}

function closeThemeStudio({ apply = false } = {}) {
  const nextTheme = resolveThemeStudioAction(
    apply ? "apply" : "cancel",
    state.accentTheme,
    state.themeStudioStart || state.accentTheme
  );
  applyAccentTheme(nextTheme, false);
  if (apply) {
    const preset = ACCENT_THEMES.find((theme) => theme.id === nextTheme) || ACCENT_THEMES[0];
    writePreference(ACCENT_THEME_KEY, nextTheme);
    showToast({ key: "themeStudio.saved", values: { theme: preset.name } });
  }
  state.themeStudioStart = null;
  el.themeStudioToggle.setAttribute("aria-expanded", "false");
  if (el.themeStudioDialog.open) el.themeStudioDialog.close();
  el.themeStudioToggle.focus();
}

function toggleAppearance() {
  applyTheme(state.theme === "dark" ? "light" : "dark");
}

function applyTheme(theme, persist = true) {
  state.theme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = state.theme;
  document.querySelector('meta[name="theme-color"]').content = state.theme === "light" ? "#f2f5ff" : "#080c18";
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
  document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
    node.setAttribute("alt", t(node.dataset.i18nAlt));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", t(node.dataset.i18nTitle));
  });
  applyLabLanguage();
  applyPublishedContent();
  renderContentEditor();
  el.languageToggle.textContent = state.language === "mn" ? "EN" : "MN";
  const nextLanguageLabel = t(state.language === "mn" ? "language.toEnglish" : "language.toMongolian");
  el.languageToggle.setAttribute("aria-label", nextLanguageLabel);
  el.languageToggle.title = nextLanguageLabel;
  el.todayLabel.textContent = new Intl.DateTimeFormat(state.language === "mn" ? "mn-MN" : "en-US", { dateStyle: "medium" }).format(new Date());
  if (state.connection === null) {
    el.connectionLabel.textContent = t("connection.checking");
    el.connectionDetail.textContent = t("connection.detail");
  } else {
    updateConnection(state.connection);
  }
  renderAuthForm();
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
  home: { title: "page.homeTitle", description: "page.homeDescription", eyebrow: "page.homeEyebrow", breadcrumb: "nav.home" },
  discover: { title: "page.discoverTitle", description: "page.discoverDescription", eyebrow: "page.discoverEyebrow", breadcrumb: "nav.discover" },
  about: { title: "page.aboutTitle", description: "page.aboutDescription", eyebrow: "page.aboutEyebrow", breadcrumb: "nav.about" },
  lab: { title: "page.labTitle", description: "page.labDescription", eyebrow: "page.labEyebrow", breadcrumb: "nav.lab" },
  customers: { title: "page.customersTitle", description: "page.customersDescription", eyebrow: "page.customersEyebrow", breadcrumb: "nav.customers" },
  content: { title: "content.title", description: "content.description", eyebrow: "content.title", breadcrumb: "content.title" },
  analytics: { title: "page.analyticsTitle", description: "page.analyticsDescription", eyebrow: "page.analyticsEyebrow", breadcrumb: "nav.analytics" },
  settings: { title: "page.settingsTitle", description: "page.settingsDescription", eyebrow: "page.settingsEyebrow", breadcrumb: "nav.settings" }
};

function updatePageCopy() {
  const copy = PAGE_COPY[state.currentPage] || PAGE_COPY.home;
  el.pageTitle.textContent = t(copy.title);
  el.pageDescription.textContent = t(copy.description);
  el.pageEyebrow.textContent = t(copy.eyebrow);
  el.breadcrumbCurrent.textContent = t(copy.breadcrumb);
  const isDiscoverListing = state.currentPage === "discover" && !state.discoverSlug;
  const isDiscoverArticle = state.currentPage === "discover" && Boolean(state.discoverSlug);
  el.pageIntro.hidden = state.currentPage === "home" || state.currentPage === "about" || isDiscoverArticle;
  el.pageActions.hidden = state.currentPage === "lab";
  el.refreshButton.hidden = !["customers", "analytics", "content"].includes(state.currentPage);
  el.discoverSurpriseButton.hidden = !isDiscoverListing;
  const isOwner = state.user?.role === "owner";
  document.querySelectorAll("[data-login-only]").forEach((node) => { node.hidden = isOwner; });
  el.addButton.hidden = state.currentPage !== "customers" || !isOwner;
  document.querySelectorAll("[data-admin-only]").forEach((node) => {
    node.hidden = !isOwner;
  });
  document.querySelectorAll("[data-page-view]").forEach((view) => {
    view.hidden = view.dataset.pageView !== state.currentPage ||
      (view.hasAttribute("data-admin-only") && !isOwner);
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
  renderDiscoverPage();
}

function discoverCategory(categoryId) {
  return DISCOVER_CATEGORIES.find((category) => category.id === categoryId) || null;
}

function readDiscoverRecent() {
  try {
    const recent = JSON.parse(window.sessionStorage.getItem(DISCOVER_RECENT_KEY) || "[]");
    if (!Array.isArray(recent)) return [];
    return [...new Set(recent.filter((slug) => getDiscoverArticle(slug)?.status === "published"))].slice(0, 3);
  } catch {
    return [];
  }
}

function rememberDiscoverArticle(slug) {
  if (getDiscoverArticle(slug)?.status !== "published") return;
  state.discoverRecentSlugs = [slug, ...state.discoverRecentSlugs.filter((recentSlug) => recentSlug !== slug)].slice(0, 3);
  try {
    window.sessionStorage.setItem(DISCOVER_RECENT_KEY, JSON.stringify(state.discoverRecentSlugs));
  } catch {
    // Surprise Me still works for this page session when storage is unavailable.
  }
}

function surpriseMe() {
  const status = document.querySelector("#discover-surprise-status");
  const article = selectSurpriseArticle(
    DISCOVER_ARTICLES,
    state.language,
    state.discoverRecentSlugs,
    state.discoverSlug
  );
  if (!article) {
    if (status) {
      status.textContent = t("discover.surpriseEmpty");
      status.hidden = false;
    }
    return;
  }
  if (status) {
    status.textContent = "";
    status.hidden = true;
  }
  openDiscoverArticle(article.slug);
}

function discoverLocalizedText(text) {
  return text?.[state.language] || "";
}

function discoverWordCount(articleCopy) {
  const text = [articleCopy?.title, articleCopy?.summary]
    .concat((articleCopy?.sections || []).flatMap((section) => [section.heading, ...(section.paragraphs || []), ...(section.items || [])]))
    .filter(Boolean)
    .join(" ");
  return text.trim() ? text.trim().split(/\s+/u).length : 0;
}

function discoverReadingMinutes(articleCopy) {
  return Math.max(1, Math.ceil(discoverWordCount(articleCopy) / 180));
}

function formatDiscoverDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(t("discover.dateLocale"), {
    year: "numeric", month: "short", day: "numeric", timeZone: "UTC"
  }).format(date);
}

function createDiscoverText(tagName, text, className = "") {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text || "";
  return element;
}

function createDiscoverCard(article, variant = "") {
  const localizedCopy = getDiscoverCopy(article, state.language);
  const sourceLocale = article.content?.mn ? "mn" : "en";
  const visibleCopy = localizedCopy || article.content?.[sourceLocale];
  const category = discoverCategory(article.category);
  const card = document.createElement("a");
  card.className = `discover-article-card${variant ? ` ${variant}` : ""}`;
  card.href = `/discover/${encodeURIComponent(article.slug)}`;
  card.dataset.discoverArticle = article.slug;
  card.setAttribute("aria-label", localizedCopy?.title || visibleCopy?.title || t("discover.missingTitle"));

  const topLine = document.createElement("div");
  topLine.className = "discover-card-topline";
  topLine.append(createDiscoverText("span", discoverLocalizedText(category?.shortLabel), "discover-category-badge"));
  topLine.append(createDiscoverText("span", formatDiscoverDate(article.publishedAt), "discover-card-date"));
  card.append(topLine);
  card.append(createDiscoverText("h3", visibleCopy?.title || t("discover.missingTitle"), "discover-card-title"));
  card.append(createDiscoverText("p", localizedCopy?.summary || t("discover.missingLocale", { language: t(`language.${state.language === "mn" ? "en" : "mn"}`) }), "discover-card-summary"));
  if (!localizedCopy) {
    card.append(createDiscoverText("span", t("discover.availableLanguage", { language: t(`language.${sourceLocale}`) }), "discover-translation-note"));
  }

  const footer = document.createElement("div");
  footer.className = "discover-card-footer";
  if (localizedCopy) footer.append(createDiscoverText("span", t("discover.readingTime", { minutes: discoverReadingMinutes(localizedCopy) }), "discover-reading-time"));
  const readLink = document.createElement("span");
  readLink.className = "discover-card-link";
  readLink.append(document.createTextNode(t("discover.readArticle")));
  readLink.append(document.createTextNode(" ↗"));
  footer.append(readLink);
  card.append(footer);
  return card;
}

function renderDiscoverListing() {
  const grid = document.querySelector("#discover-article-grid");
  const featured = document.querySelector("#discover-featured");
  const featuredCopy = document.querySelector("#discover-featured-copy");
  if (!grid || !featured || !featuredCopy) return;

  const featuredArticle = getDiscoverArticle(FEATURED_ARTICLE_SLUG);
  if (featuredArticle?.status === "published") {
    featured.hidden = false;
    const copy = getDiscoverCopy(featuredArticle, state.language);
    const sourceLocale = featuredArticle.content?.mn ? "mn" : "en";
    const visibleCopy = copy || featuredArticle.content?.[sourceLocale];
    featured.href = `/discover/${encodeURIComponent(featuredArticle.slug)}`;
    featured.dataset.discoverArticle = featuredArticle.slug;
    featuredCopy.replaceChildren();
    featuredCopy.append(createDiscoverText("span", t("discover.featured"), "discover-featured-kicker"));
    featuredCopy.append(createDiscoverText("span", discoverLocalizedText(discoverCategory(featuredArticle.category)?.label), "discover-category-badge"));
    featuredCopy.append(createDiscoverText("h3", visibleCopy?.title || t("discover.missingTitle"), "discover-featured-title"));
    featuredCopy.append(createDiscoverText("p", copy?.summary || t("discover.missingLocale", { language: t(`language.${state.language === "mn" ? "en" : "mn"}`) }), "discover-featured-summary"));
    const meta = document.createElement("span");
    meta.className = "discover-featured-meta";
    if (copy) meta.append(createDiscoverText("span", t("discover.readingTime", { minutes: discoverReadingMinutes(copy) })));
    meta.append(createDiscoverText("span", formatDiscoverDate(featuredArticle.publishedAt)));
    featuredCopy.append(meta);
    if (!copy) featuredCopy.append(createDiscoverText("span", t("discover.availableLanguage", { language: t(`language.${sourceLocale}`) }), "discover-translation-note"));
  } else {
    featured.hidden = true;
  }

  const query = state.discoverQuery.trim().toLocaleLowerCase(state.language === "mn" ? "mn-MN" : "en-US");
  const articles = DISCOVER_ARTICLES
    .filter((article) => article.status === "published")
    .filter((article) => state.discoverCategory === "all" || article.category === state.discoverCategory)
    .filter((article) => {
      if (!query) return true;
      const copy = getDiscoverCopy(article, state.language);
      return copy?.title?.toLocaleLowerCase(state.language === "mn" ? "mn-MN" : "en-US").includes(query) || false;
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));

  grid.replaceChildren(...articles.map((article) => createDiscoverCard(article)));
  document.querySelectorAll("[data-discover-category]").forEach((button) => {
    const selected = button.dataset.discoverCategory === state.discoverCategory;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const resultCount = document.querySelector("#discover-result-count");
  if (resultCount) resultCount.textContent = t("discover.results", { count: articles.length });
  const empty = document.querySelector("#discover-empty");
  if (empty) empty.hidden = articles.length > 0;
}

function renderDiscoverArticle(article) {
  const container = document.querySelector("#discover-article-content");
  if (!container) return;
  container.replaceChildren();

  if (!article || article.status !== "published") {
    container.append(createDiscoverText("span", "GNWAA / DISCOVER", "discover-section-kicker"));
    const missingTitle = createDiscoverText("h1", t("discover.missingTitle"), "discover-article-title");
    missingTitle.tabIndex = -1;
    container.append(missingTitle);
    container.append(createDiscoverText("p", t("discover.missingDescription"), "discover-article-summary"));
    document.querySelector("#discover-related-grid")?.replaceChildren();
    return;
  }

  const localizedCopy = getDiscoverCopy(article, state.language);
  const sourceLocale = article.content?.mn ? "mn" : "en";
  const visibleCopy = localizedCopy || article.content?.[sourceLocale];
  const category = discoverCategory(article.category);
  const header = document.createElement("header");
  header.className = "discover-article-header";
  header.append(createDiscoverText("span", discoverLocalizedText(category?.label), "discover-category-badge"));
  const articleTitle = createDiscoverText("h1", visibleCopy?.title || t("discover.missingTitle"), "discover-article-title");
  articleTitle.tabIndex = -1;
  header.append(articleTitle);
  if (localizedCopy) {
    header.append(createDiscoverText("p", localizedCopy.summary, "discover-article-summary"));
  } else {
    header.append(createDiscoverText("p", t("discover.missingLocale", { language: t(`language.${state.language}`) }), "discover-article-summary discover-translation-note"));
    header.append(createDiscoverText("p", t("discover.availableLanguage", { language: t(`language.${sourceLocale}`) }), "discover-translation-note"));
  }
  const meta = document.createElement("div");
  meta.className = "discover-article-meta";
  if (localizedCopy) meta.append(createDiscoverText("span", t("discover.readingTime", { minutes: discoverReadingMinutes(localizedCopy) })));
  meta.append(createDiscoverText("span", t("discover.published", { date: formatDiscoverDate(article.publishedAt) })));
  header.append(meta);
  container.append(header);

  if (localizedCopy) {
    const body = document.createElement("div");
    body.className = "discover-article-body";
    for (const section of localizedCopy.sections || []) {
      const sectionElement = document.createElement("section");
      sectionElement.className = "discover-article-section";
      if (section.heading) sectionElement.append(createDiscoverText("h2", section.heading));
      for (const paragraph of section.paragraphs || []) sectionElement.append(createDiscoverText("p", paragraph));
      if (Array.isArray(section.items) && section.items.length) {
        const list = document.createElement("ul");
        for (const item of section.items) list.append(createDiscoverText("li", item));
        sectionElement.append(list);
      }
      body.append(sectionElement);
    }
    container.append(body);
  }

  if (article.source?.url && /^https:\/\//i.test(article.source.url)) {
    const sourceSection = document.createElement("footer");
    sourceSection.className = "discover-article-source";
    sourceSection.append(createDiscoverText("span", t("discover.source"), "discover-source-label"));
    const sourceLink = document.createElement("a");
    sourceLink.href = article.source.url;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = article.source.title;
    sourceSection.append(sourceLink);
    container.append(sourceSection);
  }

  const related = DISCOVER_ARTICLES
    .filter((candidate) => candidate.status === "published" && candidate.slug !== article.slug && candidate.category === article.category)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug))
    .slice(0, 3);
  document.querySelector("#discover-related-grid")?.replaceChildren(...related.map((candidate) => createDiscoverCard(candidate, "discover-related-card")));
}

function updateDiscoverReadingProgress() {
  const progress = document.querySelector("#discover-reading-progress");
  const articleView = document.querySelector("#discover-article-view");
  const article = document.querySelector("#discover-article-content");
  if (!progress || !articleView || articleView.hidden || !article || !state.discoverSlug) return;
  const articleTop = article.getBoundingClientRect().top + window.scrollY;
  const articleRange = Math.max(1, article.offsetHeight - window.innerHeight);
  const value = Math.round(Math.max(0, Math.min(100, ((window.scrollY - articleTop) / articleRange) * 100)));
  progress.setAttribute("aria-valuenow", String(value));
  const fill = document.querySelector("#discover-reading-progress-fill");
  if (fill) fill.style.width = `${value}%`;
}

function renderDiscoverPage() {
  const listing = document.querySelector("#discover-listing");
  const articleView = document.querySelector("#discover-article-view");
  if (!listing || !articleView) return;
  const surpriseStatus = document.querySelector("#discover-surprise-status");
  if (surpriseStatus && !surpriseStatus.hidden) surpriseStatus.textContent = t("discover.surpriseEmpty");
  const showArticle = Boolean(state.discoverSlug);
  listing.hidden = showArticle;
  articleView.hidden = !showArticle;
  if (showArticle) renderDiscoverArticle(getDiscoverArticle(state.discoverSlug));
  else renderDiscoverListing();
  updateDiscoverReadingProgress();
}

function openDiscoverArticle(slug) {
  const article = getDiscoverArticle(slug);
  if (!article || article.status !== "published") return;
  const surpriseStatus = document.querySelector("#discover-surprise-status");
  if (surpriseStatus) {
    surpriseStatus.textContent = "";
    surpriseStatus.hidden = true;
  }
  state.discoverSlug = article.slug;
  rememberDiscoverArticle(article.slug);
  window.history.pushState({}, "", `/discover/${encodeURIComponent(article.slug)}`);
  setActivePage("discover", false);
  document.querySelector("#discover-article-content h1")?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function returnToDiscover() {
  state.discoverSlug = null;
  window.history.pushState({}, "", "/discover");
  renderDiscoverPage();
  window.scrollTo({ top: 0, behavior: "auto" });
  document.querySelector("#discover-listing-heading")?.focus({ preventScroll: true });
}

function pageFromCurrentLocation() {
  if (normalizedPath() === "/about") {
    state.discoverSlug = null;
    return "about";
  }
  if (normalizedPath() === "/lab") {
    state.discoverSlug = null;
    return "lab";
  }
  const discoverRoute = resolveDiscoverRoute(normalizedPath());
  if (discoverRoute) {
    state.discoverSlug = discoverRoute.slug;
    if (discoverRoute.slug) rememberDiscoverArticle(discoverRoute.slug);
    return "discover";
  }
  state.discoverSlug = null;
  const hashRoute = window.location.hash.slice(1);
  if (["lab", "gnwaa-labs"].includes(hashRoute)) return "lab";
  return Object.prototype.hasOwnProperty.call(PAGE_COPY, hashRoute) ? hashRoute : "home";
}

function setActivePage(page, updateUrl = true, preserveAdminPath = false) {
  if (!Object.prototype.hasOwnProperty.call(PAGE_COPY, page)) page = "home";
  if (!el.profileDropdown.hidden) setProfileMenuOpen(false, { restoreFocus: false });
  const adminPages = new Set(["customers", "analytics", "settings", "content"]);
  if (page === "lab") {
    if (normalizedPath() !== "/lab") {
      window.history[updateUrl ? "pushState" : "replaceState"]({}, "", "/lab");
    }
    updateUrl = false;
  } else if (page === "discover") {
    if (updateUrl && normalizedPath() !== "/discover") {
      window.history.pushState({}, "", "/discover");
      state.discoverSlug = null;
    }
    updateUrl = false;
  } else if (page === "about") {
    if (normalizedPath() !== "/about") {
      window.history[updateUrl ? "pushState" : "replaceState"]({}, "", "/about");
    }
    updateUrl = false;
  } else if (adminPages.has(page) && !isAdminPath()) {
    const nextUrl = `/admin#${page}`;
    window.history.pushState({}, "", nextUrl);
    updateUrl = false;
  } else if (updateUrl && !preserveAdminPath &&
      (isAdminPath() || resolveDiscoverRoute(normalizedPath()) || ["/lab", "/about", "/login"].includes(normalizedPath())) && page === "home") {
    window.history.pushState({}, "", `/${page === "home" ? "#home" : "#about"}`);
    updateUrl = false;
  }
  const enteringLab = page === "lab" && state.currentPage !== "lab";
  state.currentPage = page;
  if (enteringLab) showLabTool(null);
  updatePageCopy();
  updateAuthenticatedView();
  if (updateUrl && window.location.hash !== `#${page}`) window.location.hash = page;
  if (state.user?.role === "owner" && isAdminPath() &&
      ["customers", "analytics"].includes(page) && !state.customers.length) {
    void loadCustomers();
  }
  if (state.user?.role === "owner" && isAdminPath() && page === "content") {
    void loadAdminContent();
  }
}

function isMobileIntroDevice() {
  const shortEdge = Math.min(window.innerWidth, window.innerHeight);
  const longEdge = Math.max(window.innerWidth, window.innerHeight);
  const touch = navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
  // Phone-sized touch viewports, including landscape. Larger tablets keep desktop behavior.
  return touch && shortEdge <= 600 && longEdge <= 1024;
}

function introNavigationType() {
  try {
    const entry = window.performance?.getEntriesByType?.("navigation")?.[0];
    if (entry) return entry.type;
    const legacy = window.performance?.navigation?.type;
    return legacy === 1 ? "reload" : legacy === 2 ? "back_forward" : "navigate";
  } catch { return "navigate"; }
}

function startMatrixRain() {
  const canvas = el.matrixCanvas;
  if (!canvas?.getContext) return null;
  let context;
  try {
    context = canvas.getContext("2d", { alpha: true, desynchronized: true });
  } catch { /* Some engines reject optional context settings. Try plain 2D below. */ }
  if (!context) {
    try { context = canvas.getContext("2d"); } catch { return null; }
  }
  if (!context) return null;

  const glyphs = "01<>[]{}/*+-=ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const mobile = isMobileIntroDevice();
  const frameInterval = 1000 / (mobile ? 20 : 24);
  let active = true;
  let width = 0;
  let height = 0;
  let fontSize = 20;
  let columnWidth = 0;
  let drops = [];
  let lastPaintAt = 0;
  let pointer = null;
  const onPointerMove = (event) => { pointer = { x: event.clientX, y: event.clientY }; };
  const onPointerLeave = () => { pointer = null; };

  const cleanup = () => {
    if (!active) return;
    active = false;
    if (state.matrixFrame !== null) window.cancelAnimationFrame(state.matrixFrame);
    state.matrixFrame = null;
    window.removeEventListener("resize", resize);
    el.matrixLoader.removeEventListener("pointermove", onPointerMove);
    el.matrixLoader.removeEventListener("pointerdown", onPointerMove);
    el.matrixLoader.removeEventListener("pointerleave", onPointerLeave);
    el.matrixLoader.removeEventListener("pointerup", onPointerLeave);
    el.matrixLoader.removeEventListener("pointercancel", onPointerLeave);
    try {
      context.clearRect(0, 0, width, height);
      canvas.width = 0;
      canvas.height = 0;
    } catch { /* Canvas cleanup is best-effort; the page must still be revealed. */ }
    if (state.matrixCleanup === cleanup) state.matrixCleanup = null;
  };

  const resize = () => {
    if (!active) return;
    try {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(0, bounds.width);
      height = Math.max(0, bounds.height);
      if (!width || !height) return;
      const maxRatio = mobile ? 1.25 : 1.5;
      const pixelBudgetRatio = Math.sqrt((mobile ? 900_000 : 1_600_000) / (width * height));
      const ratio = Math.min(window.devicePixelRatio || 1, maxRatio, pixelBudgetRatio);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      fontSize = mobile ? 16 : 20;
      const maxColumns = mobile ? 52 : 64;
      const columns = Math.max(1, Math.min(Math.ceil(width / fontSize), maxColumns));
      columnWidth = width / columns;
      drops = Array.from({ length: columns }, () => Math.random() * (height / fontSize));
      context.clearRect(0, 0, width, height);
    } catch {
      cleanup();
    }
  };

  const draw = (timestamp = 0) => {
    if (!active) return;
    try {
      state.matrixFrame = window.requestAnimationFrame(draw);
      if (timestamp - lastPaintAt < frameInterval) return;
      lastPaintAt = timestamp;
      context.fillStyle = "rgba(8, 12, 24, 0.13)";
      context.fillRect(0, 0, width, height);
      context.font = fontSize + "px ui-monospace, Consolas, monospace";
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#7c3aed");
      gradient.addColorStop(0.4, "#f6f8ff");
      gradient.addColorStop(0.7, "#a5d8ff");
      gradient.addColorStop(1, "#38bdf8");
      for (let index = 0; index < drops.length; index += 1) {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = index * columnWidth + (mobile ? Math.sin(timestamp / 900 + index) * 2 : 0);
        const y = drops[index] * fontSize;
        const nearPointer = pointer && Math.hypot(x - pointer.x, y - pointer.y) < 120;
        context.fillStyle = nearPointer ? "#f6f8ff" : gradient;
        if (mobile) {
          context.shadowColor = nearPointer ? "#a5d8ff" : "#7c3aed";
          context.shadowBlur = nearPointer ? 5 : 1;
        }
        context.fillText(glyph, x, y);
        if (drops[index] * fontSize > height && Math.random() > 0.975) drops[index] = 0;
        drops[index] += 0.3 + Math.random() * 0.35;
      }
    } catch {
      cleanup();
    }
  };

  try {
    state.matrixCleanup?.();
    state.matrixCleanup = cleanup;
    window.addEventListener("resize", resize, { passive: true });
    // Passive pointer events include iPhone touch input without blocking gestures.
    el.matrixLoader.addEventListener("pointermove", onPointerMove, { passive: true });
    el.matrixLoader.addEventListener("pointerdown", onPointerMove, { passive: true });
    el.matrixLoader.addEventListener("pointerleave", onPointerLeave);
    el.matrixLoader.addEventListener("pointerup", onPointerLeave);
    el.matrixLoader.addEventListener("pointercancel", onPointerLeave);
    resize();
    if (!active) return null;
    state.matrixFrame = window.requestAnimationFrame(draw);
    return cleanup;
  } catch {
    cleanup();
    return null;
  }
}

function startMatrixSplash() {
  const loader = el.matrixLoader;
  if (!loader) {
    document.body.classList.remove("splash-active");
    return;
  }
  // One instance per document, even if initialization is accidentally invoked twice.
  if (state.splashSeen) return;
  const mobile = isMobileIntroDevice();
  const navigationType = introNavigationType();
  if (mobile) loader.classList.add("is-mobile-intro");
  else loader.classList.remove("is-mobile-intro");

  const splashKey = "gnwaa-welcome-intro-seen-v1";
  const hideWithoutAnimation = () => {
    loader.hidden = true;
    loader.classList.remove("is-exiting");
    document.body.classList.remove("splash-active");
  };

  let reducedMotion;
  try {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    hideWithoutAnimation();
    return;
  }
  let seen = false;
  let storageUnavailable = false;
  try {
    seen ||= window.sessionStorage.getItem(splashKey) === "shown";
  } catch { storageUnavailable = true; }
  try { window.sessionStorage.setItem(splashKey, "shown"); } catch { storageUnavailable = true; }
  // History survives a reload when sessionStorage is blocked. Navigation timing
  // also covers reloads of a later SPA route, whose history entry has no marker.
  try { seen ||= window.history?.state?.gnwaaWelcomeIntroSeen === true; } catch { /* Optional fallback. */ }
  if (storageUnavailable) {
    try {
      seen ||= navigationType === "reload" || navigationType === "back_forward";
    } catch { /* A first visit must still work without navigation timing. */ }
  }
  // Real phone reloads replay, while SPA transitions and history traversal do not.
  if (mobile && navigationType === "reload") seen = false;
  if (navigationType === "back_forward") seen = true;
  state.splashSeen = true;
  if (storageUnavailable) {
    try {
      window.history.replaceState({ ...window.history.state, gnwaaWelcomeIntroSeen: true }, "");
    } catch { /* Memory still prevents repeats within this document. */ }
  }
  if (reducedMotion || seen) {
    hideWithoutAnimation();
    return;
  }

  state.splashRun += 1;
  const currentRun = state.splashRun;
  let finished = false;
  window.clearTimeout(state.splashHideTimer);
  window.clearTimeout(state.splashFailsafeTimer);

  const hideSplash = () => {
    if (finished || currentRun !== state.splashRun) return;
    finished = true;
    window.clearTimeout(state.splashHideTimer);
    window.clearTimeout(state.splashFailsafeTimer);
    state.splashHideTimer = null;
    state.splashFailsafeTimer = null;
    try { state.splashCleanup?.(); } catch { /* Cleanup errors must never keep the site covered. */ }
    state.splashCleanup = null;
    hideWithoutAnimation();
    // Visibility can blur the dialog at the end of the CSS fade, before this timer runs.
    if (loader.contains(document.activeElement) || document.activeElement === document.body) {
      try { el.mainShell?.focus({ preventScroll: true }); } catch { /* Focus restoration is best-effort. */ }
    }
  };

  try {
    loader.hidden = false;
    loader.classList.remove("is-exiting");
    document.body.classList.add("splash-active");
    const stopMatrix = startMatrixRain();
    const onKeydown = (event) => {
      if (event.key === "Tab" && !loader.hidden) {
        event.preventDefault();
        loader.focus({ preventScroll: true });
      }
    };
    state.splashCleanup = () => {
      try { document.removeEventListener("keydown", onKeydown); } catch { /* Best-effort listener cleanup. */ }
      window.removeEventListener("popstate", hideSplash);
      window.removeEventListener("pagehide", hideSplash);
      try { stopMatrix?.(); } catch { /* Best-effort Canvas cleanup. */ }
    };
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("popstate", hideSplash);
    window.addEventListener("pagehide", hideSplash);
    loader.focus({ preventScroll: true });

    // Shared 8-second sequence: 7s animation + 1s fade, independent of API work.
    state.splashHideTimer = window.setTimeout(() => {
      if (currentRun !== state.splashRun) return;
      loader.classList.add("is-exiting");
      state.splashHideTimer = window.setTimeout(hideSplash, 1000);
    }, 7000);

    state.splashFailsafeTimer = window.setTimeout(hideSplash, 8200);
  } catch {
    hideSplash();
  }
}

function refreshCustomers() {
  return loadCustomers();
}

function refreshCurrentPage() {
  if (state.currentPage === "content" && state.user?.role === "owner") {
    return loadAdminContent();
  }
  return refreshCustomers();
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

function activePayload(isActive) {
  return { active: Boolean(isActive) };
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
  const code = (payload && payload.code) || (error && error.code);
  const message = String((payload && (payload.message || payload.details)) || (error && error.message) || "");
  if (code === "23503") return t("errors.foreignKey");
  if (code === "23502") return t("errors.required");
  if (code === "22P02" || code === "22003") return t("errors.numeric");
  if (code === "23505") return t("errors.duplicate");
  if (code === "PGRST204" || /could not find the .*column/i.test(message)) return t("errors.schema");
  if (code === "42501" || /row-level security|permission denied/i.test(message)) return t("errors.access");
  if (code === "401" || /jwt expired|invalid claim/i.test(message)) return t("errors.session");
  if (/failed to fetch|networkerror|load failed/i.test(message)) return t("errors.network");
  if (message) return message;
  return t("errors.generic");
}

async function loadCustomers() {
  if (state.user?.role !== "owner" || !isAdminPath()) return;
  if (state.loading) {
    state.reloadAfterLoad = true;
    return;
  }

  state.loading = true;
  state.loadError = null;
  render();

  const loadingUserId = state.user.id;
  const allCustomers = [];
  let page = 1;
  try {
    while (true) {
      if (state.user?.id !== loadingUserId) return;
      const result = await requestJson(`/admin/customers?page=${page}&pageSize=${API_PAGE_SIZE}`);
      const batch = Array.isArray(result.data) ? result.data : [];
      allCustomers.push(...batch);
      if (batch.length === 0 || allCustomers.length >= result.total) break;
      page += 1;
    }
    if (state.user?.id !== loadingUserId) return;
    state.customers = allCustomers;
    state.page = 1;
    updateConnection(true);
  } catch (error) {
    state.loadError = error;
    updateConnection(false);
  } finally {
    state.loading = false;
    render();
    if (state.reloadAfterLoad && state.user) {
      state.reloadAfterLoad = false;
      void loadCustomers();
    }
  }
}

async function loadPublicContent() {
  try {
    for (const locale of ["mn", "en"]) {
      const result = await requestJson(`/content?locale=${locale}`);
      state.publicContent[locale] = Object.fromEntries((result.data || []).map((row) => [row.slug, row]));
    }
    applyPublishedContent();
  } catch {
    // The static translations remain the public fallback while the API is offline.
  }
}

function applyPublishedContent() {
  const pageCopy = state.publicContent[state.language] || {};
  const home = pageCopy.home;
  const about = pageCopy.about;
  const homeHeading = document.querySelector('[data-i18n="home.heroTitle"]');
  const homeDescription = document.querySelector('[data-i18n="home.heroText"]');
  const aboutHeading = document.querySelector("#about-heading");
  const aboutDescription = document.querySelector('[data-i18n="about.description"]');
  if (home?.heading && homeHeading) homeHeading.textContent = home.heading;
  if (home?.description && homeDescription) homeDescription.textContent = home.description;
  if (about?.heading && aboutHeading) aboutHeading.textContent = about.heading;
  if (about?.description && aboutDescription) aboutDescription.textContent = about.description;
}

function contentEditorCanWrite(role, loadStatus, busy) {
  return role === "owner" && loadStatus === "loaded" && !busy;
}

function canEditContent() {
  return contentEditorCanWrite(state.user?.role, state.contentLoadStatus, state.contentBusy);
}

function updateContentActionState() {
  const canWrite = canEditContent();
  const loadingOrBusy = state.contentLoadStatus === "loading" || state.contentBusy;
  el.contentForm?.querySelectorAll("button").forEach((button) => { button.disabled = !canWrite; });
  if (el.contentDelete) el.contentDelete.disabled = !canWrite;
  if (el.contentLocale) el.contentLocale.disabled = loadingOrBusy || state.user?.role !== "owner";
  el.contentForm?.querySelectorAll("input, textarea").forEach((field) => { field.disabled = loadingOrBusy; });
  if (el.refreshButton && state.currentPage === "content") {
    el.refreshButton.disabled = loadingOrBusy || state.user?.role !== "owner";
  }
}

async function loadAdminContent() {
  if (state.user?.role !== "owner" || !isAdminPath()) return false;
  if (state.contentLoadPromise) return state.contentLoadPromise;

  const requestId = ++state.contentLoadRequestId;
  state.contentLoadStatus = "loading";
  if (el.contentStatus) el.contentStatus.textContent = t("content.loading");
  updateContentActionState();

  const request = (async () => {
    try {
      const result = await requestJson("/admin/content");
      if (requestId !== state.contentLoadRequestId || state.user?.role !== "owner") return false;
      if (!Array.isArray(result.data)) throw new Error("Invalid content response.");
      state.contentRecords = result.data;
      state.contentLoadStatus = "loaded";
      renderContentEditor();
      return true;
    } catch {
      if (requestId === state.contentLoadRequestId) {
        state.contentLoadStatus = "error";
        if (el.contentStatus) el.contentStatus.textContent = t("content.loadFailed");
        updateContentActionState();
      }
      return false;
    } finally {
      if (requestId === state.contentLoadRequestId) {
        state.contentLoadPromise = null;
        updateContentActionState();
      }
    }
  })();
  state.contentLoadPromise = request;
  return request;
}

function renderContentEditor() {
  if (!el.contentLocale) return;
  if (state.contentLoadStatus !== "loaded") {
    el.contentDelete.hidden = true;
    el.contentStatus.textContent = state.contentLoadStatus === "loading"
      ? t("content.loading")
      : state.contentLoadStatus === "error" ? t("content.loadFailed") : "";
    updateContentActionState();
    return;
  }
  const locale = el.contentLocale.value || state.language;
  const home = state.contentRecords.find((record) => record.slug === "home" && record.locale === locale);
  const about = state.contentRecords.find((record) => record.slug === "about" && record.locale === locale);
  el.contentHomeHeading.value = home?.heading || "";
  el.contentHomeDescription.value = home?.description || "";
  el.contentAboutHeading.value = about?.heading || "";
  el.contentAboutDescription.value = about?.description || "";
  el.contentDelete.hidden = !home && !about;
  const statuses = [home?.status, about?.status].filter(Boolean);
  el.contentStatus.textContent = statuses.length
    ? statuses.every((status) => status === "published") ? t("content.published") : t("content.draft")
    : "";
  updateContentActionState();
}

async function saveWebsiteContent(event) {
  event.preventDefault();
  if (state.user?.role !== "owner") return;
  if (!canEditContent()) {
    el.contentStatus.textContent = state.contentLoadStatus === "error"
      ? t("content.loadFailed")
      : t("content.loadBeforeSave");
    return;
  }
  const locale = el.contentLocale.value;
  const status = event.submitter?.dataset.contentStatus === "published" ? "published" : "draft";
  const values = {
    home: { heading: el.contentHomeHeading.value.trim(), description: el.contentHomeDescription.value.trim() },
    about: { heading: el.contentAboutHeading.value.trim(), description: el.contentAboutDescription.value.trim() }
  };
  if (Object.values(values).some((entry) => !entry.heading || !entry.description)) {
    el.contentStatus.textContent = state.language === "mn" ? "Бүх талбарыг бөглөнө үү." : "Complete all fields first.";
    return;
  }
  state.contentBusy = true;
  updateContentActionState();
  try {
    const withVersion = (slug) => {
      const existing = state.contentRecords.find((record) => record.slug === slug && record.locale === locale);
      return {
        ...values[slug],
        content_id: existing?.content_id ?? null,
        updated_at: existing?.updated_at ?? null
      };
    };
    await requestJson("/admin/content/bulk", {
      method: "POST",
      body: { locale, status, home: withVersion("home"), about: withVersion("about") }
    });
    const contentReloaded = await loadAdminContent();
    if (!contentReloaded) return;
    await loadPublicContent();
    el.contentStatus.textContent = t("content.saved");
  } catch (error) {
    if (error?.status === 409) {
      const contentReloaded = await loadAdminContent();
      if (contentReloaded) el.contentStatus.textContent = t("content.conflictReloaded");
    } else {
      el.contentStatus.textContent = readableError(error);
    }
  } finally {
    state.contentBusy = false;
    updateContentActionState();
  }
}

async function deleteWebsiteContent() {
  if (state.user?.role !== "owner") return;
  if (!canEditContent()) {
    el.contentStatus.textContent = state.contentLoadStatus === "error"
      ? t("content.loadFailed")
      : t("content.loadBeforeSave");
    return;
  }
  const locale = el.contentLocale.value;
  if (!window.confirm(t("content.confirmDelete"))) return;
  const records = state.contentRecords.filter((record) => record.locale === locale && ["home", "about"].includes(record.slug));
  state.contentBusy = true;
  updateContentActionState();
  try {
    for (const record of records) {
      await requestJson(`/admin/content/${record.content_id}`, { method: "DELETE" });
    }
    const contentReloaded = await loadAdminContent();
    if (!contentReloaded) return;
    await loadPublicContent();
    el.contentStatus.textContent = t("content.deleted");
  } catch (error) {
    el.contentStatus.textContent = readableError(error);
  } finally {
    state.contentBusy = false;
    updateContentActionState();
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
  updateContentActionState();
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
  if (state.user?.role !== "owner" || state.busy) return;
  const fields = validateForm();
  if (!fields) return;

  const isEditing = Boolean(state.editing);
  const payload = { ...fields, ...activePayload(el.activeStatus.checked) };
  setFormBusy(true);
  try {
    await requestJson(isEditing ? `/admin/customers/${state.editing.customer_id}` : "/admin/customers", {
      method: isEditing ? "PATCH" : "POST",
      body: payload
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
  if (state.user?.role !== "owner" || !state.deleting || state.busy) return;
  state.busy = true;
  el.confirmDelete.disabled = true;
  el.cancelDelete.disabled = true;
  el.confirmDelete.querySelector(".button-spinner").hidden = false;
  el.confirmDelete.querySelector("span").textContent = t("actions.deleting");
  const customer = state.deleting;
  try {
    await requestJson(`/admin/customers/${customer.customer_id}`, { method: "DELETE" });
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

function setSidebarCollapsed(collapsed, persist = true) {
  el.sidebar.classList.toggle("is-collapsed", collapsed);
  el.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  const labelKey = collapsed ? "sidebar.expand" : "sidebar.collapse";
  el.sidebarToggle.dataset.i18nAria = labelKey;
  el.sidebarToggle.dataset.i18nTitle = labelKey;
  el.sidebarToggle.setAttribute("aria-label", t(labelKey));
  el.sidebarToggle.title = t(labelKey);
  if (persist) writePreference(SIDEBAR_KEY, collapsed ? "collapsed" : "expanded");
}

function mobileDrawerFocusables() {
  return [...el.sidebar.querySelectorAll('a[href]:not([hidden]), button:not([disabled]):not([hidden])')]
    .filter((node) => node.getClientRects().length > 0);
}

function setMobileNavOpen(open, { restoreFocus = false } = {}) {
  if (open) state.mobileNavReturnFocus = document.activeElement;
  el.sidebar.classList.toggle("is-mobile-open", open);
  el.mobileNavToggle.setAttribute("aria-expanded", String(open));
  el.mobileNavToggle.setAttribute("aria-label", t(open ? "nav.closeMenu" : "nav.openMenu"));
  el.mobileNavToggle.title = t(open ? "nav.closeMenu" : "nav.openMenu");
  if (window.matchMedia("(max-width: 780px)").matches) {
    const mobileLabel = open ? "nav.closeMenu" : "sidebar.collapse";
    el.sidebarToggle.setAttribute("aria-expanded", String(open));
    el.sidebarToggle.dataset.i18nAria = mobileLabel;
    el.sidebarToggle.dataset.i18nTitle = mobileLabel;
    el.sidebarToggle.setAttribute("aria-label", t(mobileLabel));
    el.sidebarToggle.title = t(mobileLabel);
  }
  el.mobileNavBackdrop.hidden = !open;
  el.mainShell.inert = open;
  document.body.classList.toggle("mobile-nav-open", open);
  if (open) window.requestAnimationFrame(() => {
    if (!el.sidebar.classList.contains("is-mobile-open")) return;
    const focusable = mobileDrawerFocusables();
    (focusable.find((node) => node.closest(".side-nav")) || focusable[0])?.focus();
  });
  if (!open) {
    const returnFocus = state.mobileNavReturnFocus;
    state.mobileNavReturnFocus = null;
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus();
  }
}

el.sidebarToggle.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 780px)").matches && el.sidebar.classList.contains("is-mobile-open")) {
    setMobileNavOpen(false, { restoreFocus: true });
    return;
  }
  setSidebarCollapsed(!el.sidebar.classList.contains("is-collapsed"));
});
el.mobileNavToggle.addEventListener("click", () => {
  setMobileNavOpen(el.mobileNavToggle.getAttribute("aria-expanded") !== "true");
});
el.mobileNavBackdrop.addEventListener("click", () => setMobileNavOpen(false, { restoreFocus: true }));
document.addEventListener("keydown", (event) => {
  if (el.sidebar.classList.contains("is-mobile-open") && event.key === "Tab") {
    const focusable = mobileDrawerFocusables();
    const first = focusable[0];
    const last = focusable.at(-1);
    if (first && last && event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (first && last && !event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  if (event.key === "Escape" && el.sidebar.classList.contains("is-mobile-open")) {
    setMobileNavOpen(false, { restoreFocus: true });
  }
});
window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 781px)").matches && el.sidebar.classList.contains("is-mobile-open")) {
    setMobileNavOpen(false);
    setSidebarCollapsed(el.sidebar.classList.contains("is-collapsed"), false);
  }
});
el.topAvatar.addEventListener("click", () => {
  setProfileMenuOpen(el.profileDropdown.hidden);
});
el.topAvatar.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  setProfileMenuOpen(true, { focusFirst: event.key === "ArrowDown" });
  if (event.key === "ArrowUp") window.requestAnimationFrame(() => profileMenuItems().at(-1)?.focus());
});
el.profileDropdown.addEventListener("keydown", (event) => {
  const items = profileMenuItems();
  if (event.key === "Escape") {
    event.preventDefault();
    setProfileMenuOpen(false);
    return;
  }
  const currentIndex = items.indexOf(document.activeElement);
  let nextIndex = null;
  if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
  else if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = items.length - 1;
  if (nextIndex !== null && items.length) {
    event.preventDefault();
    items[nextIndex].focus();
  }
});
el.profileDropdownWrap.addEventListener("focusout", (event) => {
  if (!el.profileDropdownWrap.contains(event.relatedTarget)) {
    setProfileMenuOpen(false, { restoreFocus: false });
  }
});
document.addEventListener("click", (event) => {
  if (!el.profileDropdown.hidden && !el.profileDropdownWrap.contains(event.target)) {
    setProfileMenuOpen(false, { restoreFocus: false });
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !el.profileDropdown.hidden) {
    event.preventDefault();
    setProfileMenuOpen(false);
  }
});
el.profileAdminLink.addEventListener("click", () => { void navigateToAdminDashboard(); });
el.profileLogout.addEventListener("click", () => { void signOut(); });
el.loginLink.addEventListener("click", (event) => {
  if (state.user?.role !== "owner") return;
  event.preventDefault();
  void navigateToAdminDashboard();
});
el.refreshButton.addEventListener("click", refreshCurrentPage);
el.addButton.addEventListener("click", () => openCustomerModal());
el.themeToggle.addEventListener("click", () => applyTheme(state.theme === "dark" ? "light" : "dark"));
el.languageToggle.addEventListener("click", () => applyLanguage(state.language === "mn" ? "en" : "mn"));
el.settingsThemeToggle.addEventListener("click", () => applyTheme(state.theme === "dark" ? "light" : "dark"));
el.settingsLanguageToggle.addEventListener("click", () => applyLanguage(state.language === "mn" ? "en" : "mn"));
el.themeStudioToggle.addEventListener("click", openThemeStudio);
el.themeStudioPresets.addEventListener("click", (event) => {
  const presetButton = event.target.closest("[data-theme-preset]");
  if (presetButton) applyAccentTheme(presetButton.dataset.themePreset, false);
});
el.themeStudioApply.addEventListener("click", () => closeThemeStudio({ apply: true }));
el.themeStudioReset.addEventListener("click", () => {
  applyAccentTheme(resolveThemeStudioAction("reset", state.accentTheme, state.themeStudioStart), false);
  closeThemeStudio({ apply: true });
});
el.themeStudioCancel.addEventListener("click", () => closeThemeStudio());
el.themeStudioClose.addEventListener("click", () => closeThemeStudio());
el.themeStudioDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeThemeStudio();
});
el.themeStudioDialog.addEventListener("click", (event) => {
  if (event.target === el.themeStudioDialog) closeThemeStudio();
});
el.themeStudioDialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusable = [...el.themeStudioDialog.querySelectorAll("button:not([disabled])")];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});
document.querySelector("#footer-language-toggle").addEventListener("click", () => applyLanguage(state.language === "mn" ? "en" : "mn"));
document.querySelector("#footer-theme-toggle").addEventListener("click", toggleAppearance);
const labRoot = document.querySelector("#gnwaa-labs");
labRoot.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-lab-open]");
  const answerButton = event.target.closest("[data-detective-answer]");
  if (openButton) {
    const tool = openButton.dataset.labOpen;
    if (["universe", "detective", "personality"].includes(tool)) showLabTool(tool);
  }
  if (event.target.closest("[data-lab-back]")) showLabTool(null);
  const planetButton = event.target.closest("[data-interest]");
  if (planetButton) showUniversePlanet(planetButton.dataset.interest);
  if (event.target.closest("[data-du-reset]")) resetUniverse();
  if (answerButton) answerDetective(answerButton.dataset.detectiveAnswer === "true");
  if (event.target.closest("#id-next")) nextDetectiveCase();
  if (event.target.closest("[data-detective-reset]")) resetDetective();
  if (event.target.closest("[data-pl-reset]")) resetPersonality();
  if (event.target.closest("#pl-back")) {
    if (labState.personality.index > 0 && !labState.personality.result) {
      labState.personality.index -= 1;
      renderPersonality();
    }
  }
});
document.querySelector("#du-form").addEventListener("submit", createUniverse);
document.querySelector("#pl-form").addEventListener("submit", advancePersonality);
document.querySelector("#pl-options").addEventListener("change", (event) => {
  const input = event.target.closest('input[name="pl-answer"]');
  if (!input) return;
  labState.personality.answers[labState.personality.index] = input.value;
  document.querySelector("#pl-next").disabled = false;
});
document.querySelectorAll("[data-page-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (link.dataset.discoverArticle) {
      openDiscoverArticle(link.dataset.discoverArticle);
    } else if (["universe", "detective", "personality"].includes(link.dataset.labOpen)) {
      setActivePage("lab");
      showLabTool(link.dataset.labOpen);
    } else {
      setActivePage(link.dataset.pageLink);
    }
    if (link.closest(".side-nav") && el.sidebar.classList.contains("is-mobile-open")) {
      setMobileNavOpen(false, { restoreFocus: true });
    }
  });
});
document.querySelector("#discover-search").addEventListener("input", (event) => {
  state.discoverQuery = event.currentTarget.value;
  renderDiscoverListing();
});
document.querySelector("#discover-category-nav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-discover-category]");
  if (!button) return;
  state.discoverCategory = button.dataset.discoverCategory;
  renderDiscoverListing();
});
el.discoverSurpriseButton.addEventListener("click", surpriseMe);
document.querySelector(".discover-view").addEventListener("click", (event) => {
  if (event.target.closest("#discover-another-surprise")) {
    surpriseMe();
    return;
  }
  if (event.target.closest("#discover-back")) {
    returnToDiscover();
    return;
  }
  const articleLink = event.target.closest("[data-discover-article]");
  if (articleLink && event.currentTarget.contains(articleLink)) {
    event.preventDefault();
    openDiscoverArticle(articleLink.dataset.discoverArticle);
  }
});
document.addEventListener("click", (event) => {
  const pageAction = event.target.closest("[data-navigate]");
  if (pageAction) setActivePage(pageAction.dataset.navigate);
});
window.addEventListener("gnwaa:session-expired", () => {
  if (!state.user) return;
  state.authStatus = "anonymous";
  applyAuthSession(null);
  if (isAdminPath() || normalizedPath() === "/login") {
    state.authError = t("auth.sessionExpired");
    renderAuthForm();
  } else {
    showToast(t("auth.sessionExpired"), "error");
  }
});
function syncPageFromLocation() {
  setActivePage(pageFromCurrentLocation(), false);
}
window.addEventListener("hashchange", syncPageFromLocation);
window.addEventListener("popstate", syncPageFromLocation);
window.addEventListener("scroll", updateDiscoverReadingProgress, { passive: true });
window.addEventListener("resize", updateDiscoverReadingProgress, { passive: true });
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
el.authForm.addEventListener("submit", submitAuthentication);
el.authLoginMode.addEventListener("click", () => setAuthMode("login"));
el.authRegisterMode.addEventListener("click", () => setAuthMode("register"));
el.authLanguageToggle.addEventListener("click", () => applyLanguage(state.language === "mn" ? "en" : "mn"));
el.signOutButton.addEventListener("click", signOut);
el.contentForm.addEventListener("submit", saveWebsiteContent);
el.contentLocale.addEventListener("change", renderContentEditor);
el.contentDelete.addEventListener("click", deleteWebsiteContent);
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

state.currentPage = pageFromCurrentLocation();
applyTheme(readPreference(THEME_KEY, ["dark", "light"], "dark"), false);
applyAccentTheme(readPreference(ACCENT_THEME_KEY, ACCENT_THEME_IDS, "aurora-purple"), false);
setSidebarCollapsed(readPreference(SIDEBAR_KEY, ["expanded", "collapsed"], "expanded") === "collapsed", false);
applyLanguage(readPreference(LANGUAGE_KEY, ["mn", "en"], "mn"), false);
el.footerYear.textContent = String(new Date().getFullYear());
showLabTool(null);
setActivePage(state.currentPage, false);
const welcomeIntroKey = "gnwaa-welcome-intro-seen-v1";
if (isAdminPath() || normalizedPath() === "/login") {
  try { window.sessionStorage.setItem(welcomeIntroKey, "shown"); } catch { /* Intro storage is optional. */ }
  el.matrixLoader.hidden = true;
} else {
  try { startMatrixSplash(); } catch {
    el.matrixLoader.hidden = true;
    document.body.classList.remove("splash-active");
  }
}
void initializeAuthentication();
void loadPublicContent();
