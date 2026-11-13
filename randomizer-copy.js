import { MOVIE_GENRES, FOOD_CATEGORIES } from "./randomizer-data.js";

const copy = {
  en: {
    title: "What will you choose today?", intro: "A little curiosity. A little chance. Let your next story — or your next meal — find you.",
    eyebrow: "GNWAA / EVERYDAY DISCOVERIES", movieTitle: "Random Movie", foodTitle: "Random Food",
    movieDescription: "Discover a movie based on your favorite genres.", foodDescription: "Let fate decide what to eat.",
    enter: "Explore the draw", back: "Randomizer", home: "Home", movie: "Movie", food: "Food",
    curated: "A curated local collection", available: "{count} possibilities", landingNote: "A thoughtful selection, not an endless catalog. Your favorites and recent draws stay on this browser.",
    chooseGenres: "Set the mood", chooseCategories: "What sounds good?", genres: "Movie genres", categories: "Food categories",
    genreHint: "Choose up to five genres, or leave them empty for all movies.", foodHint: "Mix up to five cuisines and categories, or explore all foods.",
    selected: "{count}/5 selected", limit: "Five is the limit. Deselect a chip to choose another.", clear: "Clear All",
    any: "ANY · OR", all: "ALL · AND", match: "Matching mode",
    anyHelp: "Match at least one selected category.", allHelp: "Match every selected category.",
    unfilteredMovie: "No genres selected · All movies", unfilteredFood: "No categories selected · All foods",
    eligible: "{count} matching / {total} in the collection", draw: "Random Pick", drawing: "Finding your pick…",
    waitingTitle: "A small surprise awaits", waitingText: "Choose your filters, then turn a moment of indecision into a discovery.",
    emptyTitle: "No match this time", emptyText: "This collection has no item containing every selected category. Try ANY or remove one or more selections.",
    switchAny: "Switch to ANY", removeFilters: "Clear selections", tryAgain: "Try Again",
    changeGenres: "Change Genres", changeCategories: "Change Categories", yourPick: "YOUR PICK", synopsis: "The story",
    addFavorite: "Save favorite", removeFavorite: "Remove favorite", favorites: "Favorites", history: "Recent draws",
    noFavorites: "Your saved picks will appear here.", noHistory: "Your last 10 successful draws will appear here.",
    openItem: "Open {name}", saved: "Saved", details: "Verified details", localEntry: "CURATED ENTRY",
    movieNote: "Drawn from {count} curated movies, not every film ever released. No live ratings or licensed posters are included.",
    foodNote: "Drawn from {count} real dishes. Category tags are editorial; ingredients vary by recipe. “Vegetarian” entries refer to the versions described here.",
    sourceTitle: "About this collection", sourceText: "Short editorial summaries in a locally curated collection. Selected references are listed below.",
    sources: "References", storageNotice: "Browser storage is unavailable. Favorites and history will last for this visit.",
    error: "We couldn’t finish that draw. Please try again.", language: "Randomizer language", allNames: "Also known as",
    resultAnnounce: "Your pick: {name}.", motion: "A moment of chance", customArt: "GNWAA / ORIGINAL VECTOR ART",
    navLabel: "Randomizer", pageDescription: "Movie and food picks from GNWAA’s curated local collection."
  },
  mn: {
    title: "Өнөөдөр юу сонгох вэ?", intro: "Жаахан сониуч зан, жаахан аз. Дараагийн кино эсвэл хоолоо эндээс олъё.",
    eyebrow: "GNWAA / ӨДӨР ТУТМЫН НЭЭЛТ", movieTitle: "Санамсаргүй кино", foodTitle: "Санамсаргүй хоол",
    movieDescription: "Дуртай төрлөөрөө шүүж, үзэх киногоо олоорой.", foodDescription: "Юу идэхээ азаар шийдье.",
    enter: "Сонголтоо эхлүүлэх", back: "Санамсаргүй сонголт", home: "Нүүр", movie: "Кино", food: "Хоол",
    curated: "Түүвэр локал цуглуулга", available: "{count} сонголт", landingNote: "Төгсгөлгүй каталог биш, сонгож бэлтгэсэн цуглуулга. Таалагдсан болон сүүлийн сонголтууд энэ browser-т хадгалагдана.",
    chooseGenres: "Ямар уур амьсгалтай кино вэ?", chooseCategories: "Ямар хоол идмээр байна?", genres: "Киноны төрлүүд", categories: "Хоолны ангилал",
    genreHint: "Тав хүртэлх төрөл сонгоно. Сонгоогүй бол бүх киноноос сонгоно.", foodHint: "Тав хүртэлх хоолны төрөл, ангилал хослуулна. Сонгоогүй бол бүх хоолноос сонгоно.",
    selected: "{count}/5 сонгосон", limit: "Тав хүрлээ. Өөрийг нэмэхийн тулд нэг сонголтоо хасна уу.", clear: "Бүгдийг арилгах",
    any: "АЛЬ НЭГ · OR", all: "БҮГД · AND", match: "Тааруулах горим",
    anyHelp: "Сонгосон ангиллын аль нэгтэй таарна.", allHelp: "Сонгосон бүх ангилалтай таарна.",
    unfilteredMovie: "Төрөл сонгоогүй · Бүх кино", unfilteredFood: "Ангилал сонгоогүй · Бүх хоол",
    eligible: "{count} тохирох / цуглуулгад {total}", draw: "Санамсаргүй сонгох", drawing: "Сонгож байна…",
    waitingTitle: "Бяцхан гэнэтийн сонголт хүлээж байна", waitingText: "Шүүлтүүрээ тохируулаад, эргэлзээгээ шинэ нээлт болгоорой.",
    emptyTitle: "Тохирох сонголт олдсонгүй", emptyText: "Энэ цуглуулгад сонгосон бүх ангилалтай зүйл алга. АЛЬ НЭГ горимд шилжих эсвэл сонголтоосоо хасна уу.",
    switchAny: "АЛЬ НЭГ горимд шилжих", removeFilters: "Сонголтуудыг арилгах", tryAgain: "Дахин сонгох",
    changeGenres: "Төрөл өөрчлөх", changeCategories: "Ангилал өөрчлөх", yourPick: "ТАНЫ СОНГОЛТ", synopsis: "Товч агуулга",
    addFavorite: "Таалагдсанд хадгалах", removeFavorite: "Таалагдсанаас хасах", favorites: "Таалагдсан", history: "Сүүлийн сонголтууд",
    noFavorites: "Хадгалсан сонголтууд энд харагдана.", noHistory: "Амжилттай сонгосон сүүлийн 10 зүйл энд харагдана.",
    openItem: "{name} нээх", saved: "Хадгалсан", details: "Баталгаатай дэлгэрэнгүй", localEntry: "ТҮҮВЭР СОНГОЛТ",
    movieNote: "Нийт {count} түүвэр киноноос сонгоно. Дэлхийн бүх киног хамрахгүй. Шууд шинэчлэгдэх үнэлгээ, лицензтэй постер оруулаагүй.",
    foodNote: "Нийт {count} бодит хоолноос сонгоно. Ангиллыг редакцын сонголтоор өгсөн; орц жороос хамаарна. Цагаан хоолны тэмдэглэгээ нь энд тайлбарласан хувилбарт хамаарна.",
    sourceTitle: "Цуглуулгын тухай", sourceText: "Локал цуглуулгын товч агуулгыг өөрсдийн үгээр бэлтгэсэн. Сонгосон эх сурвалжуудыг доор жагсаав.",
    sources: "Эх сурвалж", storageNotice: "Browser хадгалалт хаалттай байна. Таалагдсан ба түүх энэ зочлолтод хадгалагдана.",
    error: "Сонголтыг дуусгаж чадсангүй. Дахин оролдоно уу.", language: "Санамсаргүй сонголтын хэл", allNames: "Бусад нэр",
    resultAnnounce: "Таны сонголт: {name}.", motion: "Азын бяцхан мөч", customArt: "GNWAA / ӨӨРСДИЙН ВЕКТОР ЗУРАГ",
    navLabel: "Санамсаргүй сонголт", pageDescription: "GNWAA-ийн локал цуглуулгаас кино, хоол сонгоорой."
  },
  ja: {
    title: "今日は何を選ぶ？", intro: "少しの好奇心と、少しの偶然。次の映画や食事との出会いを楽しもう。",
    eyebrow: "GNWAA / 日常の小さな発見", movieTitle: "ランダム映画", foodTitle: "ランダムごはん",
    movieDescription: "好きなジャンルから、次に観る映画を見つけよう。", foodDescription: "何を食べるか、運に任せてみよう。",
    enter: "ガチャを開く", back: "ランダマイザー", home: "ホーム", movie: "映画", food: "ごはん",
    curated: "厳選したローカルコレクション", available: "{count}件の候補", landingNote: "無限のカタログではなく、小さな厳選リスト。お気に入りと最近の結果は、このブラウザーに保存されます。",
    chooseGenres: "どんな気分で観たい？", chooseCategories: "何が食べたい？", genres: "映画ジャンル", categories: "料理カテゴリー",
    genreHint: "最大5つ選択できます。未選択なら全作品が対象です。", foodHint: "料理の国や種類を最大5つ組み合わせられます。未選択なら全料理が対象です。",
    selected: "{count}/5 選択中", limit: "選択は5つまでです。別の項目を選ぶには、1つ解除してください。", clear: "すべて解除",
    any: "いずれか · OR", all: "すべて · AND", match: "一致条件",
    anyHelp: "選んだカテゴリーのいずれかに一致します。", allHelp: "選んだすべてのカテゴリーに一致します。",
    unfilteredMovie: "ジャンル未選択 · 全作品", unfilteredFood: "カテゴリー未選択 · 全料理",
    eligible: "一致 {count}件 / 全{total}件", draw: "ランダムで選ぶ", drawing: "選んでいます…",
    waitingTitle: "小さな驚きが待っています", waitingText: "条件を選んで、迷う時間を新しい発見に変えましょう。",
    emptyTitle: "今回は一致する候補がありません", emptyText: "すべての条件を満たす候補が、このリストにはありません。「いずれか」に切り替えるか、条件を減らしてください。",
    switchAny: "「いずれか」に切り替える", removeFilters: "条件を解除", tryAgain: "もう一度選ぶ",
    changeGenres: "ジャンルを変更", changeCategories: "カテゴリーを変更", yourPick: "今回の出会い", synopsis: "あらすじ",
    addFavorite: "お気に入りに保存", removeFavorite: "お気に入りから削除", favorites: "お気に入り", history: "最近の結果",
    noFavorites: "保存した候補がここに表示されます。", noHistory: "成功した最近の結果を10件まで表示します。",
    openItem: "{name}を開く", saved: "保存済み", details: "確認済みの詳細", localEntry: "厳選コレクション",
    movieNote: "厳選した{count}作品から抽選します。すべての映画が対象ではありません。リアルタイムの評価や公式ポスターは含みません。",
    foodNote: "実在する{count}品から抽選します。分類は編集上の目安で、材料はレシピにより異なります。「ベジタリアン」は記載した作り方を指します。",
    sourceTitle: "このコレクションについて", sourceText: "ローカルの厳選リストに、独自にまとめた短い紹介文を添えています。主な参考資料は以下の通りです。",
    sources: "参考資料", storageNotice: "ブラウザーに保存できません。お気に入りと履歴は今回の閲覧中のみ保持されます。",
    error: "抽選を完了できませんでした。もう一度お試しください。", language: "ランダマイザーの言語", allNames: "ほかの言語の名前",
    resultAnnounce: "今回の結果：{name}。", motion: "偶然を楽しむひととき", customArt: "GNWAA / オリジナルベクターアート",
    navLabel: "ランダマイザー", pageDescription: "GNWAAの厳選リストから映画とごはんを選ぼう。"
  }
};

const genres = {
  en: ["Action","Adventure","Animation","Comedy","Crime","Documentary","Drama","Family","Fantasy","History","Horror","Music","Mystery","Romance","Science Fiction","Thriller","War","Western","TV Movie"],
  mn: ["Тулаант","Аялал, адал явдал","Хүүхэлдэйн","Инээдэм","Гэмт хэрэг","Баримтат","Драм","Гэр бүлийн","Уран зөгнөл","Түүхэн","Аймшиг","Хөгжим","Нууц, оньсого","Хайр дурлал","Шинжлэх ухааны уран зөгнөл","Түгшүүр","Дайн","Вестерн","Телевизийн кино"],
  ja: ["アクション","アドベンチャー","アニメーション","コメディ","犯罪","ドキュメンタリー","ドラマ","ファミリー","ファンタジー","歴史","ホラー","音楽","ミステリー","ロマンス","SF","スリラー","戦争","西部劇","テレビ映画"]
};
const foods = {
  en: ["Japanese","Mongolian","Korean","Chinese","Italian","Western","Healthy","Quick Meals","Vegetarian","Noodles","Rice Dishes","Soups"],
  mn: ["Япон","Монгол","Солонгос","Хятад","Итали","Өрнөд","Эрүүл сонголт","Хялбар хоол","Цагаан хоол","Гоймон","Будаатай хоол","Шөл"],
  ja: ["日本料理","モンゴル料理","韓国料理","中国料理","イタリア料理","洋食","ヘルシー","手軽な料理","ベジタリアン","麺料理","ご飯もの","スープ"]
};

export const RANDOMIZER_COPY = Object.fromEntries(Object.entries(copy).map(([locale, values]) => {
  const entries = Object.fromEntries(Object.entries(values).map(([key, value]) => ["randomizer." + key, value]));
  MOVIE_GENRES.forEach(({key}, index) => { entries[key] = genres[locale][index]; });
  FOOD_CATEGORIES.forEach(({key}, index) => { entries[key] = foods[locale][index]; });
  entries["nav.randomizer"] = values.navLabel;
  return [locale, entries];
}));
