// Curated local entries. No TMDB IDs, ratings, posters, recipes, or live API data are stored here.
export const MOVIE_GENRES = [
  { id: "action", key: "randomizer.genre.action" },
  { id: "adventure", key: "randomizer.genre.adventure" },
  { id: "animation", key: "randomizer.genre.animation" },
  { id: "comedy", key: "randomizer.genre.comedy" },
  { id: "crime", key: "randomizer.genre.crime" },
  { id: "documentary", key: "randomizer.genre.documentary" },
  { id: "drama", key: "randomizer.genre.drama" },
  { id: "family", key: "randomizer.genre.family" },
  { id: "fantasy", key: "randomizer.genre.fantasy" },
  { id: "history", key: "randomizer.genre.history" },
  { id: "horror", key: "randomizer.genre.horror" },
  { id: "music", key: "randomizer.genre.music" },
  { id: "mystery", key: "randomizer.genre.mystery" },
  { id: "romance", key: "randomizer.genre.romance" },
  { id: "science-fiction", key: "randomizer.genre.scienceFiction" },
  { id: "thriller", key: "randomizer.genre.thriller" },
  { id: "war", key: "randomizer.genre.war" },
  { id: "western", key: "randomizer.genre.western" },
  { id: "tv-movie", key: "randomizer.genre.tvMovie" }
];

export const MOVIES = [
  {
    id: "mad-max-fury-road", title: "Mad Max: Fury Road", year: 2015,
    genres: ["action", "adventure", "science-fiction", "thriller"],
    summary: {
      en: "Across a desolate wasteland, Max joins Furiosa’s high-speed escape from a tyrant.",
      mn: "Эзэрхийлэгчээс зугтсан Фуриосатай Макс эзгүй цөлөөр дайран зугтана.",
      ja: "荒廃した砂漠で、マックスは暴君から逃れるフュリオサに加わる。"
    }
  },
  {
    id: "the-dark-knight", title: "The Dark Knight", year: 2008,
    genres: ["action", "crime", "drama", "thriller"],
    summary: {
      en: "Batman faces the Joker as Gotham’s fragile order begins to collapse.",
      mn: "Готэмийн хэврэг дэг журам нуран унахад Бэтмен Жокертой нүүр тулна.",
      ja: "ゴッサムの秩序が崩れ始める中、バットマンはジョーカーに立ち向かう。"
    }
  },
  {
    id: "spider-verse", title: "Spider-Man: Into the Spider-Verse", year: 2018,
    genres: ["action", "adventure", "animation", "science-fiction"],
    summary: {
      en: "Miles Morales discovers his powers and meets Spider-heroes from other worlds.",
      mn: "Майлс Моралес хүчээ нээж, өөр ертөнцийн аалзан баатруудтай учирна.",
      ja: "マイルズ・モラレスは力に目覚め、別世界のスパイダーヒーローたちと出会う。"
    }
  },
  {
    id: "spirited-away", title: "Spirited Away", year: 2001,
    genres: ["animation", "family", "fantasy"],
    detailUrl: "https://www.ghibli.jp/works/chihiro/",
    summary: {
      en: "Chihiro enters a spirit world and works to free her parents and return home.",
      mn: "Чихиро сүнсний ертөнцөд орж, эцэг эхээ чөлөөлөн гэртээ харихыг хичээнэ.",
      ja: "千尋は不思議な世界に迷い込み、両親を救って家へ帰ろうとする。"
    }
  },
  {
    id: "toy-story", title: "Toy Story", year: 1995,
    genres: ["animation", "comedy", "family"],
    summary: {
      en: "When a new toy arrives, Woody and Buzz must find their way back to their child.",
      mn: "Шинэ тоглоом ирсний дараа Вуди, Базз хоёр эзэндээ буцах замаа олно.",
      ja: "新しいおもちゃが現れ、ウッディとバズは持ち主のもとへ戻ろうとする。"
    }
  },
  {
    id: "princess-bride", title: "The Princess Bride", year: 1987,
    genres: ["adventure", "comedy", "fantasy", "romance"],
    summary: {
      en: "A farmhand sets out to rescue his true love from a forced royal marriage.",
      mn: "Фермийн залуу хайртай бүсгүйгээ албадан гэрлүүлэхээс аврахаар мордоно.",
      ja: "農夫の青年は、政略結婚を迫られる恋人を救うために旅立つ。"
    }
  },
  {
    id: "fellowship-of-the-ring", title: "The Lord of the Rings: The Fellowship of the Ring", year: 2001,
    genres: ["action", "adventure", "fantasy"],
    summary: {
      en: "A hobbit carries a dangerous ring toward the only place it can be destroyed.",
      mn: "Хоббит аюулт бөгжийг устгаж болох цорын ганц газар руу авч явна.",
      ja: "ホビットは、危険な指輪を破壊できる唯一の場所へ運ぶ。"
    }
  },
  {
    id: "grand-budapest-hotel", title: "The Grand Budapest Hotel", year: 2014,
    genres: ["comedy", "drama"],
    summary: {
      en: "A hotel concierge and his protégé become entangled in a family inheritance dispute.",
      mn: "Зочид буудлын үйлчлэгч ба шавь нь өв хөрөнгийн маргаанд татагдана.",
      ja: "ホテルのコンシェルジュと弟子は、遺産をめぐる争いに巻き込まれる。"
    }
  },
  {
    id: "knives-out", title: "Knives Out", year: 2019,
    genres: ["comedy", "crime", "mystery"],
    summary: {
      en: "A detective questions a wealthy family after a celebrated novelist dies.",
      mn: "Алдарт зохиолч нас барсны дараа мөрдөгч чинээлэг гэр бүлийг байцаана.",
      ja: "著名な小説家の死を受け、探偵は裕福な一家に聞き込みを始める。"
    }
  },
  {
    id: "shawshank-redemption", title: "The Shawshank Redemption", year: 1994,
    genres: ["crime", "drama"],
    summary: {
      en: "Two prisoners build a long friendship while holding on to hope inside Shawshank.",
      mn: "Шоушэнкийн шоронд хоёр хоригдол итгэл найдвараа хадгалан нөхөрлөнө.",
      ja: "ショーシャンク刑務所で、二人の囚人は希望を胸に友情を育む。"
    }
  },
  {
    id: "free-solo", title: "Free Solo", year: 2018,
    genres: ["documentary"],
    detailUrl: "https://films.nationalgeographic.com/free-solo",
    summary: {
      en: "Climber Alex Honnold prepares for a rope-free ascent of El Capitan.",
      mn: "Уулчин Алекс Хоннольд Эль-Капитанд олсгүй авиралт хийхээр бэлдэнэ.",
      ja: "クライマーのアレックス・オノルドが、ロープなしでエル・キャピタンに挑む。"
    }
  },
  {
    id: "my-octopus-teacher", title: "My Octopus Teacher", year: 2020,
    genres: ["documentary"],
    summary: {
      en: "A filmmaker forms an unexpected bond with an octopus in a South African kelp forest.",
      mn: "Кино бүтээгч Өмнөд Африкийн далайн ойд наймаалжтай ер бусын холбоо тогтооно.",
      ja: "南アフリカの海藻の森で、映像作家は一匹のタコと特別な関係を築く。"
    }
  },
  {
    id: "pride-and-prejudice", title: "Pride & Prejudice", year: 2005,
    genres: ["drama", "romance"],
    summary: {
      en: "Elizabeth Bennet and Mr. Darcy reconsider first impressions in Regency England.",
      mn: "Элизабет Беннет, ноён Дарси хоёр анхны сэтгэгдлээ дахин эргэцүүлнэ.",
      ja: "摂政時代のイングランドで、エリザベスとダーシーは互いの印象を見直す。"
    }
  },
  {
    id: "the-exorcist", title: "The Exorcist", year: 1973,
    genres: ["horror"],
    summary: {
      en: "A mother seeks help when her young daughter shows frightening changes.",
      mn: "Бяцхан охин нь аймшигтайгаар өөрчлөгдөхөд эх нь тусламж эрнэ.",
      ja: "幼い娘に恐ろしい変化が現れ、母親は助けを求める。"
    }
  },
  {
    id: "get-out", title: "Get Out", year: 2017,
    genres: ["horror", "mystery", "thriller"],
    summary: {
      en: "A weekend visit to his girlfriend’s family turns into a disturbing mystery for Chris.",
      mn: "Крис найз бүсгүйнхээ гэр бүлд зочлох үеэр түгшүүртэй нууцад татагдана.",
      ja: "恋人の実家を訪れたクリスは、不穏な謎に巻き込まれていく。"
    }
  },
  {
    id: "whiplash", title: "Whiplash", year: 2014,
    genres: ["drama", "music"],
    summary: {
      en: "An ambitious drummer is pushed to his limits by a demanding music instructor.",
      mn: "Авьяаслаг бөмбөрчин шаардлага өндөр багшийн хатуу сорилттой тулгарна.",
      ja: "野心的なドラマーは、厳格な指導者に限界まで追い込まれる。"
    }
  },
  {
    id: "moulin-rouge", title: "Moulin Rouge!", year: 2001,
    genres: ["drama", "music", "romance"],
    summary: {
      en: "A young writer falls for a star performer at Paris’s Moulin Rouge cabaret.",
      mn: "Залуу зохиолч Парисын Мулен Ружийн од жүжигчинд дурлана.",
      ja: "若き作家は、パリのムーラン・ルージュで活躍する花形歌手に恋をする。"
    }
  },
  {
    id: "arrival", title: "Arrival", year: 2016,
    genres: ["drama", "science-fiction"],
    summary: {
      en: "A linguist is asked to communicate with mysterious visitors arriving on Earth.",
      mn: "Дэлхийд ирсэн нууцлаг зочидтой харилцахаар хэл шинжээчийг дуудна.",
      ja: "地球に現れた謎の訪問者との対話を、言語学者が任される。"
    }
  },
  {
    id: "interstellar", title: "Interstellar", year: 2014,
    genres: ["adventure", "drama", "science-fiction"],
    summary: {
      en: "A crew travels beyond Earth in search of a future for humanity.",
      mn: "Хүмүүн төрөлхтний ирээдүйг хайхаар баг дэлхийгээс алсын аялалд гарна.",
      ja: "人類の未来を求め、乗組員たちは地球の外へ旅立つ。"
    }
  },
  {
    id: "dunkirk", title: "Dunkirk", year: 2017,
    genres: ["action", "drama", "history", "thriller", "war"],
    summary: {
      en: "Allied soldiers and civilians race to evacuate from the beaches of Dunkirk.",
      mn: "Данкеркын эргээс холбоотны цэргүүд ба энгийн иргэдийг нүүлгэн гаргана.",
      ja: "ダンケルクの海岸から、兵士と市民を救出する作戦が進む。"
    }
  },
  {
    id: "saving-private-ryan", title: "Saving Private Ryan", year: 1998,
    genres: ["drama", "history", "war"],
    summary: {
      en: "A squad is sent across wartime France to bring one soldier home.",
      mn: "Нэг цэргийг гэрт нь эсэн мэнд хүргэхээр баг дайны Францаар замд гарна.",
      ja: "一人の兵士を帰還させるため、小隊は戦時下のフランスを進む。"
    }
  },
  {
    id: "good-bad-ugly", title: "The Good, the Bad and the Ugly", year: 1966,
    genres: ["western"],
    summary: {
      en: "Three gunslingers compete to find buried Confederate gold during the Civil War.",
      mn: "Иргэний дайны үеэр гурван буучин булсан алтны төлөө өрсөлдөнө.",
      ja: "南北戦争のさなか、三人のガンマンが埋蔵金を追う。"
    }
  },
  {
    id: "day-of-the-doctor", title: "Doctor Who: The Day of the Doctor", year: 2013,
    genres: ["action", "adventure", "science-fiction", "tv-movie"],
    summary: {
      en: "Three incarnations of the Doctor confront a turning point in the Time War.",
      mn: "Докторын гурван дүр Цаг хугацааны дайны шийдвэрлэх мөчтэй нүүр тулна.",
      ja: "三人のドクターが、タイム・ウォーの重大な局面に立ち向かう。"
    }
  },
  {
    id: "the-normal-heart", title: "The Normal Heart", year: 2014,
    genres: ["drama", "tv-movie"],
    summary: {
      en: "Activists fight to bring attention to the AIDS crisis in 1980s New York.",
      mn: "1980-аад оны Нью-Йоркт идэвхтнүүд ДОХ-ын хямралыг олон нийтэд хүргэхийг зорьно.",
      ja: "1980年代のニューヨークで、活動家たちはエイズ危機への関心を訴える。"
    }
  },
  {
    id: "groundhog-day", title: "Groundhog Day", year: 1993,
    genres: ["comedy", "fantasy", "romance"],
    summary: {
      en: "A cynical television weatherman finds himself reliving the same day.",
      mn: "Ёжтой зан ааштай цаг уурын нэвтрүүлэгч нэг өдрийг дахин дахин туулна.",
      ja: "皮肉屋の気象キャスターは、同じ一日を何度も繰り返すことになる。"
    }
  },
  {
    id: "terminator-2", title: "Terminator 2: Judgment Day", year: 1991,
    genres: ["action", "science-fiction", "thriller"],
    summary: {
      en: "A reprogrammed cyborg protects a boy marked by a future war.",
      mn: "Ирээдүйн дайны хувь заяанд холбогдсон хүүг дахин программчилсан киборг хамгаална.",
      ja: "未来の戦争に関わる少年を、再プログラムされたサイボーグが守る。"
    }
  },
  {
    id: "sound-of-music", title: "The Sound of Music", year: 1965,
    genres: ["drama", "family", "music", "romance"],
    summary: {
      en: "A governess brings music into the home of a widowed naval officer and his children.",
      mn: "Асрагч эмэгтэй бэлэвсэн тэнгисийн цэргийн офицерын гэрт хөгжим, дулаан уур амьсгал авчирна.",
      ja: "家庭教師は、妻を亡くした海軍大佐と子どもたちの家に音楽をもたらす。"
    }
  },
  {
    id: "rear-window", title: "Rear Window", year: 1954,
    genres: ["mystery", "thriller"],
    summary: {
      en: "A photographer confined to his apartment grows suspicious of a neighbor.",
      mn: "Гэртээ хоригдсон гэрэл зурагчин хөршийнхөө талаар сэжиг авч эхэлнэ.",
      ja: "自宅で療養する写真家は、向かいの住人に疑いを抱く。"
    }
  },
  {
    id: "true-grit", title: "True Grit", year: 2010,
    genres: ["drama", "western"],
    summary: {
      en: "A determined teenager hires a marshal to track the man who killed her father.",
      mn: "Шийдэмгий охин эцгийг нь хөнөөсөн хүнийг барихаар маршал хөлслөнө.",
      ja: "父を殺した男を追うため、少女は連邦保安官を雇う。"
    }
  },
  {
    id: "alien", title: "Alien", year: 1979,
    genres: ["horror", "science-fiction", "thriller"],
    summary: {
      en: "A deep-space crew faces a lethal organism aboard their isolated vessel.",
      mn: "Алс сансрын баг тусгаарлагдсан хөлөг дээр аюулт амьтантай тулгарна.",
      ja: "深宇宙の乗組員は、孤立した宇宙船で致命的な生物に遭遇する。"
    }
  }
];

export const FOOD_CATEGORIES = [
  { id: "japanese", key: "randomizer.foodCategory.japanese", group: "cuisine" },
  { id: "mongolian", key: "randomizer.foodCategory.mongolian", group: "cuisine" },
  { id: "korean", key: "randomizer.foodCategory.korean", group: "cuisine" },
  { id: "chinese", key: "randomizer.foodCategory.chinese", group: "cuisine" },
  { id: "italian", key: "randomizer.foodCategory.italian", group: "cuisine" },
  { id: "western", key: "randomizer.foodCategory.western", group: "cuisine" },
  { id: "healthy", key: "randomizer.foodCategory.healthy", group: "style" },
  { id: "quick-meals", key: "randomizer.foodCategory.quick", group: "style" },
  { id: "vegetarian", key: "randomizer.foodCategory.vegetarian", group: "style" },
  { id: "noodles", key: "randomizer.foodCategory.noodles", group: "dish" },
  { id: "rice-dishes", key: "randomizer.foodCategory.rice", group: "dish" },
  { id: "soups", key: "randomizer.foodCategory.soups", group: "dish" }
];

export const FOODS = [
  { id: "ramen", names: { mn: "Рамен", en: "Ramen", ja: "ラーメン" }, categories: ["japanese", "noodles", "quick-meals"], description: { mn: "Амталсан шөлөнд гоймон, төрөл бүрийн хачир хийж иддэг.", en: "Noodles served in a seasoned broth with assorted toppings.", ja: "味付けしたスープに麺や具材を合わせた料理。" } },
  { id: "udon", names: { mn: "Үдон", en: "Udon", ja: "うどん" }, categories: ["japanese", "noodles", "soups"], description: { mn: "Зузаан улаан буудайн гоймонг шөл эсвэл соустай иднэ.", en: "Thick wheat noodles served in broth or with a dipping sauce.", ja: "太い小麦麺を、だしやつけ汁と一緒に味わう。" } },
  { id: "sushi", names: { mn: "Сүши", en: "Sushi", ja: "寿司" }, categories: ["japanese", "rice-dishes", "healthy"], description: { mn: "Амталсан будааг загас, далайн бүтээгдэхүүн эсвэл ногоотой хослуулна.", en: "Seasoned rice paired with seafood, fish, or vegetables.", ja: "酢飯に魚介や野菜などを組み合わせる料理。" } },
  { id: "onigiri", names: { mn: "Онигири", en: "Onigiri", ja: "おにぎり" }, categories: ["japanese", "rice-dishes", "quick-meals"], description: { mn: "Гартаа барьж идэхэд тохиромжтой, ихэвчлэн далайн замгаар ороосон будаан бөмбөлөг.", en: "A portable rice ball, often wrapped in nori and filled or seasoned.", ja: "具や味を付けたご飯を握り、海苔で包むこともある軽食。" } },
  { id: "miso-soup", names: { mn: "Ногооны мисо шөл", en: "Vegetarian miso soup", ja: "野菜だしの味噌汁" }, categories: ["japanese", "soups", "vegetarian", "healthy"], description: { mn: "Ногооны шөл, мисо зуурмагт дүпү болон далайн замаг нэмсэн хувилбар.", en: "A vegetarian version using vegetable stock, miso, tofu, and seaweed.", ja: "野菜だしと味噌に、豆腐やわかめを加えたベジタリアン向けの一品。" } },
  { id: "tempura", names: { mn: "Темпура", en: "Tempura", ja: "天ぷら" }, categories: ["japanese", "quick-meals"], description: { mn: "Загас эсвэл ногоог хөнгөн зуурмагт дүрж шардаг.", en: "Seafood or vegetables lightly coated in batter and fried.", ja: "魚介や野菜に衣を付けて揚げる料理。" } },
  { id: "yakisoba", names: { mn: "Якисоба", en: "Yakisoba", ja: "焼きそば" }, categories: ["japanese", "noodles", "quick-meals"], description: { mn: "Хуурсан гоймонг ногоо болон соустай хольж бэлтгэнэ.", en: "Stir-fried noodles tossed with vegetables and a savory sauce.", ja: "麺と野菜を炒め、ソースで味付けする。" } },
  { id: "buuz", names: { mn: "Бууз", en: "Buuz", ja: "ボーズ" }, categories: ["mongolian"], description: { mn: "Мах, сонгиноор шанзалсан уурын банш.", en: "Mongolian steamed dumplings commonly filled with meat and onion.", ja: "肉や玉ねぎを包んで蒸すモンゴルの餃子。" } },
  { id: "khuushuur", names: { mn: "Хуушуур", en: "Khuushuur", ja: "ホーショール" }, categories: ["mongolian"], description: { mn: "Махан шанзтай хавтгай гурилан боовыг тосонд шарна.", en: "A flat, meat-filled pastry fried until crisp.", ja: "肉餡を生地で包み、平たくして揚げる料理。" } },
  { id: "tsuivan", names: { mn: "Цуйван", en: "Tsuivan", ja: "ツイワン" }, categories: ["mongolian", "noodles"], description: { mn: "Гоймонг мах, ногоотой жигнэж бэлтгэдэг монгол хоол.", en: "Mongolian noodles steamed with meat and vegetables.", ja: "麺を肉や野菜と一緒に蒸し焼きにするモンゴル料理。" } },
  { id: "guriltai-shul", names: { mn: "Гурилтай шөл", en: "Guriltai shul", ja: "モンゴルの麺入りスープ" }, categories: ["mongolian", "noodles", "soups"], description: { mn: "Гурилын тасалбар, мах, ногоотой шөл.", en: "A Mongolian soup with pieces of dough or noodles, meat, and vegetables.", ja: "麺状の生地や肉、野菜を入れたモンゴルのスープ。" } },
  { id: "banshtai-tsai", names: { mn: "Банштай цай", en: "Banshtai tsai", ja: "バンシタイ・ツァイ" }, categories: ["mongolian", "soups"], description: { mn: "Сүүтэй цайнд жижиг банш хийж чанасан уламжлалт хоол.", en: "A Mongolian milk-tea dish cooked with small dumplings.", ja: "ミルクティーに小さな餃子を入れて煮るモンゴル料理。" } },
  { id: "bibimbap", names: { mn: "Бибимбап", en: "Bibimbap", ja: "ビビンバ" }, categories: ["korean", "rice-dishes", "healthy"], description: { mn: "Будаан дээр ногоо, амтлагч, хүсвэл мах тавьж хольж иддэг.", en: "Rice topped with vegetables and seasoning, often mixed with meat and egg.", ja: "ご飯に野菜や薬味をのせ、肉や卵を加えることもある混ぜご飯。" } },
  { id: "bulgogi", names: { mn: "Булгоги", en: "Bulgogi", ja: "プルコギ" }, categories: ["korean", "rice-dishes"], description: { mn: "Амталсан нимгэн хэрчсэн үхрийн махыг шарж эсвэл хуурна.", en: "Thinly sliced, marinated beef cooked over heat or in a pan.", ja: "薄切り牛肉をたれに漬け、焼いたり炒めたりする。" } },
  { id: "kimchi-jjigae", names: { mn: "Кимчи жигэ", en: "Kimchi jjigae", ja: "キムチチゲ" }, categories: ["korean", "soups"], description: { mn: "Кимчигээр амталсан халуун шөлөнд дүпү болон бусад орц хийнэ.", en: "A spicy Korean stew built around kimchi, often with tofu.", ja: "キムチを主役に、豆腐などを加えて煮込む韓国の鍋料理。" } },
  { id: "kimbap", names: { mn: "Кимбап", en: "Kimbap", ja: "キンパ" }, categories: ["korean", "rice-dishes", "quick-meals"], description: { mn: "Будаа, ногоо болон бусад орцыг далайн замганд ороож хэрчинэ.", en: "Rice and assorted fillings rolled in seaweed and sliced into rounds.", ja: "ご飯と具材を海苔で巻き、食べやすく切った料理。" } },
  { id: "tteokbokki", names: { mn: "Ттокпокки", en: "Tteokbokki", ja: "トッポッキ" }, categories: ["korean", "quick-meals"], description: { mn: "Зажлууртай будаан бялууг халуун ногоотой соустай чанана.", en: "Chewy rice cakes simmered in a spicy Korean sauce.", ja: "もちもちした餅を辛いたれで煮込む韓国の軽食。" } },
  { id: "mapo-tofu", names: { mn: "Мапо дүпү", en: "Mapo tofu", ja: "麻婆豆腐" }, categories: ["chinese", "rice-dishes"], description: { mn: "Дүпүг халуун ногоо, амталсан соустай чанаж будаатай иднэ.", en: "Tofu simmered in a boldly seasoned sauce, often served with rice.", ja: "豆腐を香辛料の効いたたれで煮込み、ご飯と合わせる料理。" } },
  { id: "fried-rice", names: { mn: "Хуурсан будаа", en: "Fried rice", ja: "炒飯" }, categories: ["chinese", "rice-dishes", "quick-meals"], description: { mn: "Болгосон будааг өндөг, ногоо болон сонгосон орцтой хуурна.", en: "Cooked rice quickly stir-fried with egg, vegetables, or other ingredients.", ja: "炊いたご飯を卵や野菜などと手早く炒める。" } },
  { id: "hotpot", names: { mn: "Хятад халуун тогоо", en: "Chinese hot pot", ja: "火鍋" }, categories: ["chinese", "soups"], description: { mn: "Ширээн дээр буцалж буй шөлөнд мах, ногоо зэрэг орцыг чанаж иддэг.", en: "Diners cook meat and vegetables in a simmering communal pot of broth.", ja: "卓上の煮立つスープで肉や野菜を煮ながら食べる。" } },
  { id: "margherita-pizza", names: { mn: "Маргарита пицца", en: "Margherita pizza", ja: "マルゲリータピザ" }, categories: ["italian", "vegetarian"], description: { mn: "Улаан лооль, моцарелла, базилик бүхий сонгодог пицца.", en: "A classic pizza topped with tomato, mozzarella, and basil.", ja: "トマト、モッツァレラ、バジルを使った定番のピザ。" } },
  { id: "aglio-e-olio", names: { mn: "Альо-э-ольо гоймон", en: "Spaghetti aglio e olio", ja: "アーリオ・オーリオ" }, categories: ["italian", "noodles", "vegetarian", "quick-meals"], description: { mn: "Спагеттиг сармис, оливын тос, чинжүүтэй хольж бэлтгэнэ.", en: "Spaghetti tossed with olive oil, garlic, and chili.", ja: "スパゲッティをオリーブ油、にんにく、唐辛子で和える。" } },
  { id: "mushroom-risotto", names: { mn: "Мөөгтэй ризотто", en: "Mushroom risotto", ja: "きのこのリゾット" }, categories: ["italian", "rice-dishes", "vegetarian"], description: { mn: "Будааг ногооны шөлөөр бага багаар болгож, мөөгтэй хольсон хоол.", en: "Rice cooked gradually with vegetable stock and mushrooms.", ja: "米を野菜だしで少しずつ煮て、きのこを合わせた料理。" } },
  { id: "caprese-salad", names: { mn: "Капрезе салат", en: "Caprese salad", ja: "カプレーゼ" }, categories: ["italian", "healthy", "vegetarian", "quick-meals"], description: { mn: "Улаан лооль, моцарелла, базиликийг энгийнээр хослуулна.", en: "Tomato, mozzarella, and basil served together with a light dressing.", ja: "トマト、モッツァレラ、バジルをシンプルに合わせる。" } },
  { id: "lentil-soup", names: { mn: "Сэвэг зарамтай шөл", en: "Lentil soup", ja: "レンズ豆のスープ" }, categories: ["western", "healthy", "vegetarian", "soups"], description: { mn: "Сэвэг зарам, ногоо, амтлагчаар чанасан шөл.", en: "A hearty soup made with lentils, vegetables, and seasoning.", ja: "レンズ豆、野菜、香辛料を煮込んだスープ。" } },
  { id: "grilled-cheese", names: { mn: "Шарсан бяслагтай талх", en: "Grilled cheese sandwich", ja: "グリルドチーズサンド" }, categories: ["western", "quick-meals", "vegetarian"], description: { mn: "Бяслагтай талхыг гадаргууг нь шарж, доторх бяслагийг хайлуулна.", en: "Bread and cheese toasted in a pan until the filling melts.", ja: "パンとチーズを焼き、チーズがとろけるまで温める。" } },
  { id: "vegetable-omelette", names: { mn: "Ногоотой омлет", en: "Vegetable omelette", ja: "野菜オムレツ" }, categories: ["western", "healthy", "quick-meals", "vegetarian"], description: { mn: "Өндгийг ногоотой хольж хайруулын тавганд болгосон омлет.", en: "Eggs cooked with vegetables in a simple pan omelette.", ja: "卵に野菜を合わせてフライパンで焼くオムレツ。" } },
  { id: "tomato-soup", names: { mn: "Улаан лоолийн шөл", en: "Tomato soup", ja: "トマトスープ" }, categories: ["western", "soups", "vegetarian"], description: { mn: "Улаан лооль, ногооны суурьтай бүлээн шөл.", en: "A warm soup made with tomatoes and a vegetable base.", ja: "トマトと野菜をベースにした温かいスープ。" } },
  { id: "vegetable-burger", names: { mn: "Ногоотой бургер", en: "Vegetable burger", ja: "ベジタブルバーガー" }, categories: ["western", "vegetarian", "quick-meals"], description: { mn: "Ногооны котлет болон хачрыг талхны завсар хийсэн бургер.", en: "A burger assembled with a vegetable patty and assorted toppings.", ja: "野菜のパティと具材をバンズで挟んだバーガー。" } }
];

export const DATASET_SOURCES = {
  movies: [
    { label: "TMDB API field reference", url: "https://developer.themoviedb.org/reference/discover-movie" },
    { label: "Studio Ghibli — Spirited Away", url: "https://www.ghibli.jp/works/chihiro/" },
    { label: "National Geographic Documentary Films — Free Solo", url: "https://films.nationalgeographic.com/free-solo" }
  ],
  foods: [
    { label: "Japan National Tourism Organization", url: "https://www.japan.travel/en/gastronomy/" },
    { label: "VisitKorea — Traditional Korean Food", url: "https://english1.visitkorea.or.kr/enu/AKR/AK_ENG_2_3.jsp" },
    { label: "Ulaanbaatar City Tourism Guide", url: "https://visitulaanbaatar.net/storage/files/Guide%20book%2020211026.pdf" }
  ]
};
