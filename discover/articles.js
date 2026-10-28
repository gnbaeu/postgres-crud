export const DISCOVER_CATEGORIES = [
  { id: "minute", label: { mn: "Нэг минутын мэдлэг", en: "One Minute Knowledge" }, shortLabel: { mn: "1 минут", en: "1 minute" } },
  { id: "digital", label: { mn: "Дижитал аюулгүй байдал", en: "Digital Survival Guide" }, shortLabel: { mn: "Дижитал аюулгүй байдал", en: "Digital safety" } },
  { id: "japan", label: { mn: "Япон тайлбарлав", en: "Japan Explained" }, shortLabel: { mn: "Япон", en: "Japan" } }
];

export const FEATURED_ARTICLE_SLUG = "how-submarine-cables-carry-the-internet";

export const DISCOVER_ARTICLES = [
  {
    slug: "why-airplanes-fly",
    category: "minute",
    status: "published",
    publishedAt: "2026-10-28",
    source: { title: "NASA Glenn Research Center — Four Forces on an Airplane", url: "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/four-forces-on-an-airplane/" },
    content: {
      mn: {
        title: "Онгоц яагаад нисдэг вэ?",
        summary: "Далавч агаартай харилцан үйлчилж, онгоцыг дээш өргөх хүчийг үүсгэдэг.",
        sections: [
          { heading: "Агаарын урсгал ба өргөх хүч", paragraphs: ["Онгоц урагшлахад далавч агаарын урсгалыг өөрчилдөг. Агаарын энэ хөдөлгөөнтэй харилцахад дээш чиглэсэн аэродинамик хүч бий болдог бөгөөд үүнийг өргөх хүч гэдэг. Ердийн зорчигчийн онгоцны өргөх хүчний ихэнхийг далавч гаргадаг. Далавчны хэлбэр, хэмжээ, хурд болон агаартай харьцах өнцөг нь энэ хүчид нөлөөлнө.", "Гэхдээ онгоцыг агаарт байлгахад ганц хүч хангалтгүй. Жин доош татаж, өргөх хүч түүнтэй эсрэг үйлчилнэ. Хөдөлгүүрийн түлхэлт онгоцыг урагш хөдөлгөж, агаарын эсэргүүцэл буюу чирэлт сааруулна. Эдгээр хүчний хэмжээ өөрчлөгдөхөд онгоц хурдаа нэмэх, хасах эсвэл чиглэлээ өөрчлөх боломжтой.", "Тиймээс хөдөлгүүр өөрөө онгоцыг дээш өргөдөг гэж ойлгох нь бүрэн зөв биш: хөдөлгүүр голчлон онгоцыг урагшлуулах түлхэлт гаргаж, далавч хөдөлгөөн дундаа өргөх хүч үүсгэдэг. Салхинд хийсэхгүй байгаа цаасан онгоц хүртэл энэ зарчмын энгийн жишээ юм."] }
        ]
      },
      en: {
        title: "Why do airplanes fly?",
        summary: "A wing interacts with moving air to create the force that lifts an airplane.",
        sections: [
          { heading: "Airflow and lift", paragraphs: ["As an airplane moves forward, its wings turn and guide the airflow. That interaction creates an aerodynamic force called lift. On a typical airliner, most lift comes from the wings. Wing shape and size, the aircraft's speed, and its angle to the airflow all affect how much lift is produced.", "Lift is only one part of the picture. Weight pulls downward while lift acts against it. The engines create thrust to move the aircraft forward, and drag is the air resistance that acts against that motion. When these forces change, the plane can speed up, slow down, climb, or descend.", "So the engines do not simply hold an airplane up: they mainly provide forward thrust, while the moving wings produce lift. A paper airplane is a small, familiar example of the same principle. It has no engine, but it still needs a push to move through the air before its wings can generate lift."] }
        ]
      }
    }
  },
  {
    slug: "how-submarine-cables-carry-the-internet",
    category: "minute",
    status: "published",
    publishedAt: "2026-10-28",
    source: { title: "International Telecommunication Union — Submarine cable resilience", url: "https://www.itu.int/en/mediacentre/backgrounders/Pages/submarine-cable-resilience.aspx" },
    content: {
      mn: {
        title: "Интернэт далайн доогуур хэрхэн дамждаг вэ?",
        summary: "Тивүүдийн хооронд мэдээлэл дамжуулахад далайн ёроолын шилэн кабель чухал үүрэгтэй.",
        sections: [
          { heading: "Далайн ёроол дахь гэрлийн зам", paragraphs: ["Таны илгээсэн зураг, бичлэг эсвэл мессеж агаарт алга болчихдоггүй. Өгөгдөл жижиг хэсгүүдэд хуваагдаж, сүлжээний төхөөрөмжүүдийн тусламжтайгаар очих газраа хүрдэг. Улс хоорондын холболтын ихэнхийг далайн ёроолоор тавьсан шилэн кабелийн системүүд дамжуулдаг.", "Кабелийн доторх маш нарийн шилэн судлаар мэдээлэл гэрлийн импульс хэлбэрээр явна. Эрэг дээрх буух станц эдгээр холболтыг хуурай газрын сүлжээтэй холбодог. Хол зайд дохиог сэргээх төхөөрөмжүүд ашиглагдаж болно. Ийм дэд бүтэц нь видео дуудлага, үүлэн үйлчилгээ, банкны гүйлгээ зэрэг олон улсын өдөр тутмын үйлчилгээг холбоход тусалдаг.", "Хиймэл дагуул ч холбооны нэг хэсэг боловч далайн кабель нь их хэмжээний өгөгдлийг тив хооронд дамжуулахад маш үр ашигтай. Тиймээс үүлэн доторх мэдээлэл бодит кабель, станц, сүлжээний төхөөрөмжөөр дамжин аялдаг гэсэн үг."] }
        ]
      },
      en: {
        title: "How does the internet travel under the sea?",
        summary: "Submarine fibre-optic systems carry important connections between continents.",
        sections: [
          { heading: "A path of light on the ocean floor", paragraphs: ["A photo, video, or message does not disappear into the air when you send it. Data is split into small pieces and routed through network equipment toward its destination. Much of the international connectivity relies on cable systems laid across the seabed.", "Inside these cables, very fine optical fibres carry information as pulses of light. Landing stations connect the undersea links to networks on land. Equipment along long routes can help keep signals usable. This infrastructure supports everyday cross-border services such as video calls, cloud computing, and financial transactions.", "Satellites are also part of communications, but submarine cables are highly efficient for moving large amounts of data between continents. So when someone says their files are in the cloud, those files still travel through real cables, stations, and network devices along the way."] }
        ]
      }
    }
  },
  {
    slug: "how-qr-codes-work",
    category: "minute",
    status: "published",
    publishedAt: "2026-10-28",
    source: { title: "DENSO — QR Code technology", url: "https://www.denso.com/global/en/technology/qrcode/" },
    content: {
      mn: {
        title: "QR код хэрхэн ажилладаг вэ?",
        summary: "Хар, цагаан жижиг нүднүүд зурагт кодолсон өгөгдлийг камер уншихад тусалдаг.",
        sections: [
          { heading: "Зураг доторх өгөгдөл", paragraphs: ["QR кодыг утасны камераар харахад энгийн зураг шиг боловч түүний хар, цагаан нүднүүд тодорхой дүрмээр байрласан байдаг. Кодын гурван буланд байдаг том дөрвөлжин тэмдэглэгээ нь уншигчид кодын байрлал, чиглэлийг олоход тусалдаг. Ингэснээр кодыг янз бүрийн өнцгөөс унших боломжтой.", "Мэдээллийг хэвтээ болон босоо чиглэлд кодолдог тул QR код нь уламжлалт нэг хэмжээст зураасан кодоос илүү олон төрлийн мэдээлэл хадгалж чадна. Кодын зарим хэсэг бохирдож, гэмтсэн үед өгөгдлийн алдааг засах нэмэлт мэдээлэл уншигчид тусалж болох ч энэ нь код ямар ч хэмжээнд гэмтсэн байхад ажиллана гэсэн үг биш.", "Утас кодыг тайлсны дараа доторх текст, холбоос эсвэл бусад өгөгдлийг харуулна. QR код өөрөө холбоос аюулгүй эсэхийг баталдаггүй. Танихгүй газарт байрлуулсан кодыг нээхээс өмнө дэлгэцэд гарч буй хаягийг шалгаарай."] }
        ]
      },
      en: {
        title: "How do QR codes work?",
        summary: "A grid of dark and light squares encodes information that a camera can read.",
        sections: [
          { heading: "Information in an image", paragraphs: ["A QR code may look like a simple picture, but its dark and light squares follow a defined pattern. The three large markers near its corners help a reader locate the code and work out its orientation. That design lets a camera read it from different directions.", "Information is encoded across both horizontal and vertical dimensions, so a QR code can hold more data than a traditional one-dimensional barcode. Extra error-correction data can help recover information when part of a code is dirty or damaged, although it cannot guarantee that every damaged code will scan.", "After a phone reads the pattern, it can show text, a link, or other encoded data. The QR code itself does not prove that a link is safe. If a code is placed somewhere unexpected, check the address shown on screen before opening it."] }
        ]
      }
    }
  },
  {
    slug: "spot-a-phishing-message",
    category: "digital",
    status: "published",
    publishedAt: "2026-10-28",
    source: { title: "CISA — Phishing tip sheet", url: "https://www.cisa.gov/sites/default/files/publications/phishing_and_spoofing_tip_sheet_2022_092022.pdf" },
    content: {
      mn: {
        title: "Фишинг мессежийг хэрхэн таних вэ?",
        summary: "Яаруулсан хүсэлт, зөрүүтэй хаяг, нууц мэдээлэл нэхсэн холбоосыг анзаарч сураарай.",
        sections: [
          { heading: "Асуудал нь юу вэ?", paragraphs: ["Фишинг гэдэг нь итгэж болох хүн эсвэл байгууллага мэт дүр эсгэн холбоос дарах, файл нээх, эсвэл нууц мэдээлэл өгөхөд хүргэх оролдлого юм. Имэйл, мессеж, сошиал шуудангаар ирж болно."] },
          { heading: "Жишээ", paragraphs: ["Жишээ нь, “таны хүргэлт саатсан тул картаа одоо баталгаажуул” гэсэн зохиомол мессеж таныг яаруулж, танил үйлчилгээтэй төстэй хаяг руу оруулахыг оролдож болно. Энэ бол сургалтын жишээ; бодит холбоос биш."] },
          { heading: "Өөрийгөө хамгаалах", items: ["Илгээгчийн бүтэн хаяг болон холбоосын домэйныг шалга.", "Гэнэтийн холбоос, хавсралтыг бүү нээ; байгууллагын албан ёсны апп эсвэл хаягийг өөрөө нээ.", "Яаралтай үйлдэл, төлбөр, нууц үг эсвэл нэг удаагийн код нэхсэн мессежид болгоомжтой ханд.", "Сэжигтэй мессежийг платформын report/spam хэрэгслээр мэдэгдээд устга."] }
        ]
      },
      en: {
        title: "How can you spot a phishing message?",
        summary: "Notice urgent requests, mismatched addresses, and links asking for sensitive details.",
        sections: [
          { heading: "What is the risk?", paragraphs: ["Phishing is an attempt to look like a person or organization you trust so you will click a link, open a file, or share sensitive information. It can arrive by email, text, or social message."] },
          { heading: "An example", paragraphs: ["For example, a fictional message might say, “Your delivery is delayed; verify your card now,” then send you to an address that resembles a familiar service. This is an invented training example, not a real link."] },
          { heading: "Protect yourself", items: ["Check the sender’s full address and the link’s domain.", "Avoid unexpected links and attachments; open the official app or site yourself.", "Be cautious when a message pressures you to act, pay, or share a password or one-time code.", "Use the service’s report or spam option, then delete the message."] }
        ]
      }
    }
  },
  {
    slug: "use-public-wifi-safely",
    category: "digital",
    status: "published",
    publishedAt: "2026-10-28",
    source: { title: "U.S. Federal Trade Commission — Public Wi-Fi safety", url: "https://consumer.ftc.gov/articles/are-public-wi-fi-networks-safe-what-you-need-know" },
    content: {
      mn: {
        title: "Нийтийн Wi-Fi-г аюулгүй ашиглах нь",
        summary: "Кофе шоп, буудлын сүлжээнд холбогдохдоо хуурамч hotspot болон хуурамч сайтаас болгоомжил.",
        sections: [
          { heading: "Юуг анхаарах вэ?", paragraphs: ["Нийтийн Wi-Fi нь аялах, ажиллахад эвтэйхэн. Өнөөдөр олон сайт холболтоо шифрлэдэг тул нийтийн сүлжээ ашиглах нь дангаараа заавал аюултай гэсэн үг биш. Гэхдээ ижил нэртэй хуурамч hotspot эсвэл жинхэнэ мэт харагдах залилангийн сайт эрсдэл хэвээр үлдэнэ."] },
          { heading: "Энгийн жишээ", paragraphs: ["Нисэх буудалд “Airport Free Wi-Fi” гэсэн хэд хэдэн сүлжээ харагдлаа гэж төсөөлье. Нэг нь албан ёсны сүлжээг дуурайсан байж болно. Бас HTTPS түгжээ нь таны холболт шифрлэгдсэнийг хэлэхээс тухайн сайт өөрөө итгэмжлэгдсэн гэдгийг батлахгүй."] },
          { heading: "Хамгаалах 4 алхам", items: ["Албан ёсны сүлжээний нэрийг ажилтан эсвэл мэдээллийн самбараас баталгаажуул.", "Хувийн сайт эсвэл банкны апп-аа зөв нэр, апп-аар нээ; холбоосоор бүү ор.", "Утас, хөтөчөө шинэчилж, шаардлагагүй үед автомат Wi-Fi холболтыг унтраа.", "Ямар нэг хүсэлт сэжигтэй санагдвал нийтийн hotspot-аас салж, мобайл дата ашигла."] }
        ]
      },
      en: {
        title: "Using public Wi-Fi more safely",
        summary: "Watch for imitation hotspots and fake websites when joining a café or hotel network.",
        sections: [
          { heading: "What should you watch for?", paragraphs: ["Public Wi-Fi is useful while travelling or working away from home. Many websites now encrypt connections, so using a public network is not automatically unsafe. Still, a fake hotspot with a familiar name or a convincing scam website can put you at risk."] },
          { heading: "A simple example", paragraphs: ["Imagine seeing several networks called “Airport Free Wi-Fi.” One could imitate the official network. Also remember that the HTTPS padlock says the connection is encrypted; it does not prove the website itself is trustworthy."] },
          { heading: "Four ways to reduce risk", items: ["Confirm the network name with staff or an official sign.", "Open sensitive services through their known app or address instead of a message link.", "Keep your phone and browser updated, and disable automatic Wi-Fi joining when you do not need it.", "If a request feels suspicious, disconnect and use mobile data instead."] }
        ]
      }
    }
  },
  {
    slug: "what-is-multi-factor-authentication",
    category: "digital",
    status: "published",
    publishedAt: "2026-10-28",
    source: { title: "CISA — Multifactor authentication tip sheet", url: "https://www.cisa.gov/sites/default/files/2024-09/Secure-Our-World-MFA-Tip-Sheet.pdf" },
    content: {
      mn: {
        title: "Multi-Factor Authentication гэж юу вэ?",
        summary: "Нууц үгээс гадна өөр нэг баталгаажуулалт ашиглаж, бүртгэлдээ нэмэлт хамгаалалт үүсгэнэ.",
        sections: [
          { heading: "Нэмэлт баталгаажуулалтын давхарга", paragraphs: ["Multi-Factor Authentication (MFA) нь нэвтрэх үед таныг нэгээс олон төрлийн нотолгоогоор баталгаажуулдаг. Нууц үг бол мэддэг зүйл; апп-аар үүсгэсэн код, төхөөрөмжийн түлхүүр эсвэл биометр зэрэг нь өөр төрлийн баталгаа байж болно. Нууц үг алдагдсан ч нэмэлт алхам нь халдагчийн ажлыг хүндрүүлнэ."] },
          { heading: "Жишээ", paragraphs: ["Та имэйлдээ нууц үгээрээ нэвтэрсний дараа баталгаажуулагч апп дахь кодоо оруулдаг гэж бодъё. Зөвхөн нууц үгийг олсон хүн хоёр дахь баталгаагүйгээр дансанд шууд орох боломжгүй."] },
          { heading: "Сайн дадал", items: ["Боломжтой бүртгэлүүддээ MFA-г асаа.", "Нэг удаагийн код, зөвшөөрөх мэдэгдлийг өөр хүнд бүү дамжуул.", "Албан ёсны апп эсвэл төхөөрөмжийн тохиргооноос MFA-г идэвхжүүл.", "Нөөц кодоо нууц, аюулгүй газар хадгал."] }
        ]
      },
      en: {
        title: "What is multi-factor authentication?",
        summary: "A second proof of identity adds another protective step beyond a password.",
        sections: [
          { heading: "An extra layer at sign-in", paragraphs: ["Multi-factor authentication (MFA) asks you to prove your identity using more than one kind of evidence. A password is something you know; an app-generated code, a device key, or a biometric can be another kind of proof. If a password is exposed, the extra step can make account access harder for someone else."] },
          { heading: "An example", paragraphs: ["Imagine signing in to your email with a password and then entering a code from your authenticator app. Someone who learns only the password still lacks that second verification step."] },
          { heading: "Good habits", items: ["Turn on MFA for accounts that offer it.", "Never share a one-time code or approve a sign-in you did not start.", "Enable MFA through the service’s official app or account settings.", "Store backup codes somewhere private and secure."] }
        ]
      }
    }
  },
  {
    slug: "how-suica-works",
    category: "japan",
    status: "published",
    publishedAt: "2026-10-28",
    source: { title: "JR East — Suica", url: "https://www.jreast.co.jp/e/pass/suica.html" },
    content: {
      mn: {
        title: "Suica хэрхэн ажилладаг вэ?",
        summary: "Suica картанд мөнгө урьдчилан цэнэглээд нийтийн тээвэр болон олон дэлгүүрт хүргэж төлдөг.",
        sections: [
          { heading: "Хүргээд зорчих", paragraphs: ["Suica нь JR East-ийн контактгүй IC карт бөгөөд тээвэр болон худалдан авалтад ашиглаж болно. Карт эсвэл тохирох утасны wallet-д мөнгө цэнэглээд, нийтийн тээврийн хаалган дээр уншигчид хүргэнэ. Буухдаа дахин хүргэхэд тухайн аяллын төлбөрийг тооцож үлдэгдлээс хасна.", "Дэлгүүрт Suica тэмдэгтэй уншигч байвал цэнэглэсэн үлдэгдлээр төлбөр хийх боломжтой. Энэ нь нэг картыг өдөр тутмын жижиг төлбөр болон зорчиход ашиглахад амар болгодог.", "Гэхдээ бүх шугам, бүс нутгийн хооронд карт автоматаар ажиллана гэж үзэж болохгүй. JR East-ийн мэдээллээр ашиглах боломжтой бүс, дүрэм үйлчилгээ болон чиглэлээс хамаарна. Аяллаа эхлэхээс өмнө тухайн бүсийн нөхцөл болон үлдэгдлээ шалгаарай."] }
        ]
      },
      en: {
        title: "How does Suica work?",
        summary: "Load value onto a Suica card, then tap it for eligible transit and participating shops.",
        sections: [
          { heading: "Tap to travel", paragraphs: ["Suica is a contactless IC card from JR East that can be used for transport and shopping. You add value to the card or a compatible phone wallet, then tap it on a reader at a transit gate. Tapping again when you leave lets the system calculate the fare and deduct it from the balance.", "At shops displaying a Suica reader, the stored balance can also be used to pay. That makes one card useful for everyday small purchases as well as travel.", "However, do not assume that every route or region works seamlessly with every other one. JR East notes that eligible areas and rules depend on the service and journey. Check the local coverage and your balance before travelling."] }
        ]
      }
    }
  },
  {
    slug: "why-japan-konbini-are-useful",
    category: "japan",
    status: "published",
    publishedAt: "2026-10-28",
    source: { title: "Tokyo Metropolitan Government — Japan’s Konbini", url: "https://www.tokyoupdates.metro.tokyo.lg.jp/en/post-1749/" },
    content: {
      mn: {
        title: "Японы konbini яагаад ийм хэрэгтэй вэ?",
        summary: "Konbini бол ойрхон дэлгүүрээс гадна өдөр тутмын жижиг хэрэгцээг шийдэх үйлчилгээний цэг юм.",
        sections: [
          { heading: "Ойрхон жижиг үйлчилгээний төв", paragraphs: ["Японд “konbini” гэж товчилдог convenience store-ууд хүнс, ундаа, өдөр тутмын хэрэгцээний зүйлсийг ойрхон байрлалд санал болгодог. Токио хотын албан мэдээлэлд эдгээр дэлгүүрүүд өдөр тутмын амьдралын нэг хэсэг болж, зарим чухал үйлчилгээг ч санал болгодог гэж тайлбарласан.", "Аялагч хүн ус, бэлэн хоол эсвэл борооны шүхэр хайхад нэг дэлгүүрээс олон сонголт олж болно. Дэлгүүрийн үйлчилгээ, ажиллах цаг, төлбөрийн боломж салбар бүрд ижил байх албагүй тул тухайн газрын мэдээллийг шалгах нь зөв.", "Konbini-гийн сонирхол нь зөвхөн гадаад хүнд содон бүтээгдэхүүнд биш. Хотын ойр орчмын хэрэгцээнд тохируулсан жижиг дэлгүүрийн сүлжээ учраас хоол хүнс, хэрэгцээний барааг хурдан авах боломж өгдөг. Тэдгээрийг Японы өдөр тутмын жижиг үйлчилгээг ажиглах цонх гэж харж болно."] }
        ]
      },
      en: {
        title: "Why are Japan’s konbini so useful?",
        summary: "A konbini is more than a nearby shop: it can be a practical stop for everyday needs.",
        sections: [
          { heading: "A nearby everyday service stop", paragraphs: ["“Konbini” is a short form of the Japanese word for convenience store. These shops offer food, drinks, and daily necessities close to where people live or travel. Tokyo’s official information site describes them as part of everyday life and notes that some also provide useful services.", "A visitor looking for water, a ready-to-eat meal, or an umbrella may find several options in one small shop. Services, opening hours, and payment choices can vary by location, so it is sensible to check the branch rather than assume every store is identical.", "The appeal is not only unusual products for tourists. Konbini are small neighborhood stores adapted to everyday needs, making it easy to pick up food and essentials quickly. They also offer a window into how local convenience services fit into daily life in Japan."] }
        ]
      }
    }
  },
  {
    slug: "japan-earthquake-early-warning",
    category: "japan",
    status: "published",
    publishedAt: "2026-10-28",
    source: { title: "Japan Meteorological Agency — Earthquake Early Warning", url: "https://www.jma.go.jp/jma/en/Activities/eew.html" },
    content: {
      mn: {
        title: "Японы газар хөдлөлтийн эрт сэрэмжлүүлэг",
        summary: "Газар хөдлөлт эхэлсний дараа хурдан илрүүлсэн дохио зарим газарт хэдхэн секундийн бэлтгэл өгч болно.",
        sections: [
          { heading: "Урьдчилан таамаглах биш, хурдан мэдээлэх", paragraphs: ["Японы Цаг уурын агентлагийн Earthquake Early Warning нь газар хөдлөлтийг болохоос нь өмнө урьдчилан хэлдэг систем биш. Газар хөдлөлт аль хэдийн эхэлсний дараа ойролцоох сейсмометрүүдийн мэдээллээр эхний тооцоо хийж, хүчтэй чичирхийлэл хаана хүрч болзошгүйг шуурхай дамжуулдаг.", "Сейсмийн долгион тархахад хугацаа ордог учраас эх үүсвэрээс хол зарим газарт анхааруулга хүчтэй доргилтоос түрүүлж хүрч болно. Тэр богино хугацаанд хүн ширээн доогуур орох, галт тэрэг удаашрах, лифт зогсох зэрэг хамгаалах арга хэмжээ авах боломжтой.", "Гэхдээ газар хөдлөлтийн голомтод ойр газарт сэрэмжлүүлэг доргилттой зэрэгцэн хүрэх эсвэл огт амжихгүй байж болно. Тиймээс дохио хүлээхээс гадна аюулгүй байрлал, гарц, нөөцийн бэлтгэлээ урьдчилан мэдэж байх нь чухал."] }
        ]
      },
      en: {
        title: "Japan’s earthquake early-warning system",
        summary: "Fast detection after an earthquake begins can give some places a few seconds to prepare.",
        sections: [
          { heading: "Rapid notice, not a prediction", paragraphs: ["Japan’s Earthquake Early Warning is not a system that predicts an earthquake before it happens. After an earthquake has started, nearby seismometers provide data for a quick estimate of where strong shaking may arrive, and an alert is sent as soon as possible.", "Because seismic waves take time to travel, some places farther from the source may receive a warning before stronger shaking reaches them. Those brief moments can help people take cover and can allow systems such as trains or elevators to take protective action.", "Places close to the earthquake source may receive the alert at the same time as the shaking, or may not have time to receive it first. That is why it is important to know what safe action to take and prepare ahead of time rather than relying on an alert alone."] }
        ]
      }
    }
  }
];

export function getDiscoverArticle(slug) {
  return DISCOVER_ARTICLES.find((article) => article.slug === slug) || null;
}

export function getDiscoverCopy(article, locale) {
  if (!article || !["mn", "en"].includes(locale)) return null;
  return article.content?.[locale] || null;
}

export function selectSurpriseArticle(articles, locale, recentSlugs = [], currentSlug = null, random = Math.random) {
  const publicArticles = articles.filter((article) =>
    article.status === "published" && Boolean(article.slug) && Boolean(getDiscoverCopy(article, locale))
  );
  if (!publicArticles.length) return null;

  const recent = new Set(recentSlugs.slice(0, 3));
  let choices = publicArticles.filter((article) => article.slug !== currentSlug && !recent.has(article.slug));
  if (!choices.length) choices = publicArticles.filter((article) => article.slug !== currentSlug);
  if (!choices.length) choices = publicArticles;

  const sample = Number(random());
  const safeRandom = Number.isFinite(sample) ? Math.min(Math.max(sample, 0), 0.9999999999999999) : 0;
  return choices[Math.floor(safeRandom * choices.length)] || null;
}

export function resolveDiscoverRoute(pathname) {
  const normalized = String(pathname || "/").replace(/\/+$/, "") || "/";
  if (normalized !== "/discover" && !normalized.startsWith("/discover/")) return null;
  const slug = normalized.slice("/discover".length).replace(/^\/+/, "");
  return { page: "discover", slug: slug || null };
}
