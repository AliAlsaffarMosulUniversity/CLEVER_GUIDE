/* الأشكال التوضيحية: الأجهزة والمواد التي ترد في الدروس + المخططات */
function S(body, vb) { return '<svg viewBox="' + (vb || '0 0 120 80') + '" aria-hidden="true">' + body + '</svg>'; }
var LED = function (x, y, c) { return '<circle cx="' + x + '" cy="' + y + '" r="2" class="' + (c || 'a') + '"/>'; };

var DEV = {
  pc: { ar: 'الحاسوب المكتبي', en: 'Desktop PC', fn: 'جهاز المستخدم في المكتب والمختبر',
    svg: S('<rect x="14" y="10" width="62" height="42" rx="4" class="b o"/><rect x="20" y="16" width="50" height="30" rx="2" class="a" opacity=".85"/><path d="M38 52v8h14v-8" class="o"/><rect x="30" y="60" width="30" height="5" rx="2" class="k"/><rect x="84" y="12" width="24" height="54" rx="3" class="b o"/><rect x="89" y="18" width="14" height="4" rx="1" class="k"/><circle cx="96" cy="56" r="3" class="m"/>') },
  phone: { ar: 'الهاتف الذكي', en: 'Smartphone', fn: 'جهاز محمول يتصل بالشبكة والإنترنت',
    svg: S('<rect x="42" y="6" width="36" height="68" rx="7" class="k"/><rect x="45" y="12" width="30" height="54" rx="3" class="a" opacity=".85"/><rect x="54" y="8" width="12" height="2" rx="1" class="l"/><rect x="50" y="20" width="20" height="3" rx="1" class="b"/><rect x="50" y="27" width="14" height="3" rx="1" class="b"/>') },
  printer: { ar: 'الطابعة', en: 'Printer', fn: 'مورد مشترك تخدم قسماً كاملاً عبر الشبكة',
    svg: S('<rect x="34" y="8" width="52" height="18" rx="2" class="b o"/><rect x="18" y="24" width="84" height="32" rx="5" class="l o"/><rect x="30" y="50" width="60" height="24" class="b o"/><path d="M38 58h44M38 64h30" class="o"/><circle cx="90" cy="34" r="3" class="a"/>') },
  camera: { ar: 'كاميرا المراقبة', en: 'IP Camera', fn: 'جهاز على الشبكة يرسل الصورة إلى الخادم',
    svg: S('<rect x="20" y="22" width="64" height="26" rx="6" class="b o"/><circle cx="84" cy="35" r="11" class="k"/><circle cx="84" cy="35" r="5" class="a"/><path d="M44 48v14H30v8h30" class="o"/>') },
  nic: { ar: 'بطاقة الشبكة', en: 'NIC', fn: 'تربط الجهاز بالشبكة، ولها عنوان فيزيائي ثابت',
    svg: S('<rect x="14" y="20" width="78" height="36" rx="3" class="a" opacity=".85"/><rect x="24" y="28" width="18" height="14" rx="2" class="k"/><rect x="48" y="28" width="10" height="8" class="b"/><rect x="62" y="28" width="10" height="8" class="b"/><path d="M22 56v8M30 56v8M38 56v8M46 56v8M54 56v8M62 56v8M70 56v8" class="o" stroke="var(--amb)"/><rect x="92" y="14" width="16" height="48" rx="2" class="l o"/><rect x="96" y="30" width="8" height="10" rx="1" class="k"/>') },
  switch: { ar: 'المبدل', en: 'Switch', fn: 'يربط أجهزة الشبكة المحلية ويرسل البيانات إلى الجهاز المقصود فقط',
    svg: S('<rect x="8" y="26" width="104" height="30" rx="4" class="b o"/>' + [16, 28, 40, 52, 64, 76].map(function (x) { return '<rect x="' + x + '" y="38" width="9" height="9" rx="1" class="k"/>' + LED(x + 4.5, 33) }).join('') + '<rect x="90" y="36" width="16" height="12" rx="2" class="l"/>') },
  router: { ar: 'الموجه', en: 'Router', fn: 'يربط شبكتين مختلفتين، مثل المكتب والإنترنت، ويختار المسار',
    svg: S('<path d="M34 34V10M86 34V10M60 34V14" class="o"/><circle cx="34" cy="10" r="3" class="k"/><circle cx="86" cy="10" r="3" class="k"/><circle cx="60" cy="14" r="3" class="k"/><rect x="16" y="34" width="88" height="26" rx="8" class="b o"/>' + LED(32, 47) + LED(42, 47) + LED(52, 47, 'm') + '<rect x="70" y="42" width="8" height="8" rx="1" class="k"/><rect x="82" y="42" width="8" height="8" rx="1" class="k"/>') },
  ap: { ar: 'نقطة الوصول', en: 'Access Point', fn: 'توفر الاتصال اللاسلكي للأجهزة داخل الشبكة المحلية',
    svg: S('<ellipse cx="60" cy="54" rx="34" ry="12" class="b o"/><circle cx="60" cy="52" r="3" class="a"/><path d="M44 36a22 22 0 0 1 32 0M50 42a12 12 0 0 1 20 0M38 30a32 32 0 0 1 44 0" class="o" stroke="var(--acc)"/>') },
  modem: { ar: 'المودم', en: 'Modem', fn: 'يحول إشارة مزود الخدمة إلى إشارة يفهمها الموجه',
    svg: S('<rect x="40" y="8" width="40" height="62" rx="6" class="b o"/>' + [20, 30, 40, 50].map(function (y, i) { return LED(60, y, i == 3 ? 'm' : 'a') }).join('') + '<rect x="34" y="68" width="52" height="6" rx="2" class="k"/><path d="M80 20h18v-6M80 30h24" class="o"/>') },
  server: { ar: 'الخادم', en: 'Server', fn: 'حاسوب قوي يقدم الملفات والطباعة وقواعد البيانات',
    svg: S([8, 30, 52].map(function (y) { return '<rect x="30" y="' + y + '" width="60" height="18" rx="3" class="b o"/><rect x="36" y="' + (y + 6) + '" width="28" height="5" rx="1" class="l"/>' + LED(78, y + 9) + LED(84, y + 9, 'm') }).join('')) },
  firewall: { ar: 'الجدار الناري', en: 'Firewall', fn: 'يراقب حركة البيانات ويمنع غير المصرح به',
    svg: S('<g class="m">' + [[14, 14], [44, 14], [74, 14], [29, 32], [59, 32], [89, 32], [14, 50], [44, 50], [74, 50]].map(function (p) { return '<rect x="' + p[0] + '" y="' + p[1] + '" width="28" height="16" rx="1"/>' }).join('') + '</g><path d="M8 14h104M8 32h104M8 50h104M8 66h104" class="o" stroke="var(--bg)"/>') },
  utp: { ar: 'الكيبل المجدول', en: 'Twisted Pair (UTP)', fn: 'أزواج نحاسية مجدولة للشبكات المحلية، حتى 100 متر',
    svg: S('<path d="M6 40h40" class="o" stroke-width="10" stroke="var(--acc)"/><rect x="46" y="28" width="30" height="24" rx="3" class="l o"/><path d="M76 32h14M76 37h14M76 42h14M76 47h14" class="o" stroke="var(--amb)"/><path d="M90 30c8 4 8 6 16 2M90 40c8 4 8 6 16 2M90 50c8-4 8-6 16-2" class="o"/>') },
  coax: { ar: 'الكيبل المحوري', en: 'Coaxial Cable', fn: 'سلك نحاسي مركزي محاط بعازل وشبكة معدنية',
    svg: S('<rect x="8" y="28" width="56" height="24" rx="12" class="k"/><rect x="58" y="31" width="20" height="18" rx="2" class="l o"/><rect x="74" y="34" width="16" height="12" class="b o"/><path d="M90 40h20" class="o" stroke="var(--amb)" stroke-width="4"/>') },
  fiber: { ar: 'الألياف الضوئية', en: 'Fiber Optic', fn: 'شعيرات زجاجية تنقل البيانات على شكل ضوء',
    svg: S('<path d="M6 60c30 0 40-40 70-40" class="o" stroke-width="7" stroke="var(--ink)"/><path d="M76 20c10 0 20-8 34-12M76 20c12 2 22 2 34 2M76 20c10 4 20 12 34 18" class="o" stroke="var(--amb)"/><circle cx="110" cy="8" r="3" class="m"/><circle cx="110" cy="22" r="3" class="m"/><circle cx="110" cy="38" r="3" class="m"/>') },
  wifi: { ar: 'الشبكة اللاسلكية المحلية', en: 'Wi-Fi', fn: 'اتصال لاسلكي لعشرات الأمتار في المنازل والمكاتب',
    svg: S('<circle cx="60" cy="62" r="5" class="a"/><path d="M46 50a20 20 0 0 1 28 0M36 40a34 34 0 0 1 48 0M26 30a48 48 0 0 1 68 0" class="o" stroke="var(--acc)" stroke-width="4"/>') },
  bluetooth: { ar: 'البلوتوث', en: 'Bluetooth', fn: 'اتصال قصير نحو 10 أمتار للسماعات ولوحات المفاتيح',
    svg: S('<rect x="40" y="6" width="40" height="68" rx="20" class="a"/><path d="M52 26l18 18-10 10V18l10 10-18 18" class="o" stroke="var(--bg)" stroke-width="3"/>') },
  cell: { ar: 'شبكة الهاتف الخلوي', en: 'Cellular', fn: 'تغطية لكيلومترات، الإنترنت على الهواتف',
    svg: S('<path d="M60 20L44 74M60 20l16 54M50 52h20M47 62h26" class="o"/><circle cx="60" cy="18" r="4" class="m"/><path d="M44 12a20 20 0 0 0 0 14M76 12a20 20 0 0 1 0 14M36 6a30 30 0 0 0 0 26M84 6a30 30 0 0 1 0 26" class="o" stroke="var(--acc)"/>') },
  satellite: { ar: 'الأقمار الصناعية', en: 'Satellite', fn: 'تغطية واسعة جداً للمناطق النائية',
    svg: S('<rect x="50" y="28" width="20" height="20" rx="3" class="b o"/><rect x="10" y="30" width="36" height="16" class="a" opacity=".85"/><rect x="74" y="30" width="36" height="16" class="a" opacity=".85"/><path d="M22 30v16M34 30v16M86 30v16M98 30v16" class="o" stroke="var(--bg)"/><path d="M60 48v10" class="o"/><path d="M50 66a14 8 0 0 0 20 0" class="o"/>') },
  lock: { ar: 'التشفير', en: 'Encryption', fn: 'بيانات لا تقرأ إلا بمفتاح، والموقع الآمن يظهر بقفل',
    svg: S('<path d="M44 36V24a16 16 0 0 1 32 0v12" class="o" stroke-width="5"/><rect x="34" y="34" width="52" height="38" rx="6" class="m"/><circle cx="60" cy="50" r="5" class="k"/><path d="M60 54v8" class="o" stroke-width="4"/>') },
  atm: { ar: 'الصراف الآلي', en: 'ATM', fn: 'سحب وإيداع واستعلام بالبطاقة والرقم السري دون موظف',
    svg: S('<rect x="28" y="4" width="64" height="72" rx="4" class="b o"/><rect x="36" y="12" width="48" height="24" rx="2" class="a" opacity=".85"/><rect x="40" y="42" width="22" height="18" rx="2" class="l"/>' + [0, 1, 2].map(function (r) { return [0, 1, 2].map(function (c) { return '<rect x="' + (42 + c * 6.5) + '" y="' + (44 + r * 5) + '" width="4" height="3" class="k"/>' }).join('') }).join('') + '<rect x="68" y="44" width="16" height="3" rx="1" class="k"/><rect x="40" y="66" width="40" height="4" rx="1" class="k"/>') },
  card: { ar: 'بطاقة الدفع', en: 'Payment Card', fn: 'رقم من 16 رقماً، اسم الحامل، تاريخ الانتهاء، شريحة، ورمز أمان على الظهر',
    svg: S('<rect x="10" y="12" width="100" height="60" rx="8" class="a"/><rect x="20" y="26" width="18" height="14" rx="3" class="m"/><path d="M26 26v14M20 33h18" class="o" stroke="var(--ink)" stroke-width="1"/><path d="M48 30a6 6 0 0 1 0 8M53 27a10 10 0 0 1 0 14" class="o" stroke="var(--bg)"/><text x="20" y="54" font-size="8" class="tk">0000 0000 0000 0000</text><text x="20" y="66" font-size="6" class="tk">IRAQI CARDHOLDER   12/29</text>') },
  pos: { ar: 'جهاز نقطة البيع', en: 'POS', fn: 'يمرر عليه البائع البطاقة؛ يخصم من حسابك ويضيف لحساب المتجر',
    svg: S('<rect x="38" y="6" width="44" height="70" rx="8" class="k"/><rect x="44" y="14" width="32" height="18" rx="2" class="a"/>' + [0, 1, 2, 3].map(function (r) { return [0, 1, 2].map(function (c) { return '<rect x="' + (46 + c * 10) + '" y="' + (38 + r * 8) + '" width="7" height="5" rx="1" class="l"/>' }).join('') }).join('') + '<rect x="62" y="2" width="40" height="24" rx="4" class="m" transform="rotate(-18 82 14)"/>') },
  phonebank: { ar: 'الهاتف المصرفي', en: 'Phone Banking', fn: 'خدمات بالاتصال الصوتي: الرد الآلي أو مركز الاتصال',
    svg: S('<path d="M34 16c-6 4-8 14 2 28s20 24 30 20l6-8-12-10-6 4c-6-4-10-10-12-16l4-6-6-14z" class="a"/><path d="M76 20a16 16 0 0 1 14 14M76 10a26 26 0 0 1 24 24" class="o" stroke="var(--amb)" stroke-width="3"/>') },
  sms: { ar: 'الرسائل النصية البنكية', en: 'SMS Banking', fn: 'إشعارات من المصرف وطلبات منك برقم قصير',
    svg: S('<path d="M14 14h70a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H40L26 68V56H14a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6z" class="b o"/><path d="M20 28h50M20 38h40" class="o" stroke="var(--acc)" stroke-width="3"/><circle cx="96" cy="20" r="12" class="m"/><text x="96" y="24" font-size="11" text-anchor="middle" class="tk">1</text>') },
  mobilebank: { ar: 'تطبيق المصرف', en: 'Mobile Banking', fn: 'تطبيق مخصص للرصيد والتحويل والفواتير وإيقاف البطاقة',
    svg: S('<rect x="38" y="4" width="44" height="72" rx="7" class="k"/><rect x="42" y="10" width="36" height="60" rx="3" class="b"/><rect x="46" y="16" width="28" height="14" rx="2" class="a"/><rect x="46" y="36" width="12" height="10" rx="2" class="m"/><rect x="62" y="36" width="12" height="10" rx="2" class="l"/><rect x="46" y="50" width="12" height="10" rx="2" class="l"/><rect x="62" y="50" width="12" height="10" rx="2" class="l"/>') },
  ewallet: { ar: 'المحفظة الإلكترونية', en: 'E-Wallet', fn: 'حساب مالي مرتبط برقم الهاتف للتحويل والدفع',
    svg: S('<rect x="16" y="20" width="80" height="50" rx="8" class="a"/><path d="M16 30h70" class="o" stroke="var(--bg)"/><rect x="72" y="38" width="34" height="18" rx="6" class="m"/><circle cx="84" cy="47" r="4" class="k"/><rect x="24" y="10" width="54" height="14" rx="3" class="l" transform="rotate(-6 50 17)"/>') },
  qr: { ar: 'رمز الاستجابة السريعة', en: 'QR Code', fn: 'رمز مربع يمسح بالكاميرا للدفع في المتاجر',
    svg: S('<rect x="30" y="6" width="60" height="68" rx="4" class="b o"/>' + [[36, 12], [70, 12], [36, 50]].map(function (p) { return '<rect x="' + p[0] + '" y="' + p[1] + '" width="14" height="14" class="k"/><rect x="' + (p[0] + 4) + '" y="' + (p[1] + 4) + '" width="6" height="6" class="b"/>' }).join('') + [[56, 14], [58, 24], [66, 34], [74, 44], [56, 46], [62, 56], [74, 58], [80, 52], [42, 34], [50, 38]].map(function (p) { return '<rect x="' + p[0] + '" y="' + p[1] + '" width="5" height="5" class="k"/>' }).join('')) },
  skimmer: { ar: 'جهاز نسخ البطاقة', en: 'Skimmer', fn: 'قطعة مضافة على فتحة الصراف تسرق بيانات البطاقة',
    svg: S('<rect x="20" y="22" width="80" height="36" rx="4" class="b o"/><rect x="36" y="36" width="48" height="6" rx="2" class="k"/><rect x="30" y="28" width="60" height="22" rx="4" class="m" opacity=".75"/><path d="M96 14l10-8M100 20h12" class="o" stroke="var(--bad)" stroke-width="3"/>') },
  psu: { ar: 'مزود الطاقة', en: 'Power Supply (PSU)', fn: 'يغذي كل القطع بالكهرباء',
    svg: S('<rect x="14" y="14" width="76" height="52" rx="3" class="b o"/><circle cx="46" cy="40" r="18" class="l o"/><path d="M46 22v36M28 40h36M33 27l26 26M59 27L33 53" class="o"/><rect x="74" y="22" width="10" height="14" rx="1" class="k"/><path d="M90 50c10 0 10 14 22 14" class="o" stroke-width="4" stroke="var(--amb)"/>') },
  mobo: { ar: 'اللوحة الأم', en: 'Motherboard', fn: 'تربط كل القطع ببعضها',
    svg: S('<rect x="10" y="6" width="100" height="68" rx="3" class="a" opacity=".8"/><rect x="20" y="14" width="22" height="22" rx="2" class="k"/><rect x="50" y="12" width="5" height="34" class="l"/><rect x="58" y="12" width="5" height="34" class="l"/><rect x="20" y="48" width="56" height="7" rx="1" class="k"/><rect x="20" y="60" width="40" height="5" class="l"/><circle cx="94" cy="58" r="7" class="b o"/><rect x="80" y="14" width="22" height="16" rx="2" class="m"/>') },
  cpu: { ar: 'المعالج', en: 'CPU', fn: 'ينفذ التعليمات',
    svg: S('<rect x="34" y="14" width="52" height="52" rx="4" class="k"/><rect x="44" y="24" width="32" height="32" rx="2" class="m"/>' + [22, 32, 42, 52, 58].map(function (v) { return '<path d="M' + (v + 6) + ' 6v8M' + (v + 6) + ' 66v8M26 ' + (v + 2) + 'h8M86 ' + (v + 2) + 'h8" class="o"/>' }).join('')) },
  ram: { ar: 'الذاكرة العشوائية', en: 'RAM', fn: 'تحفظ البيانات أثناء العمل',
    svg: S('<rect x="8" y="22" width="104" height="30" rx="2" class="a" opacity=".85"/>' + [16, 32, 48, 66, 82, 98].map(function (x) { return '<rect x="' + (x - 2) + '" y="28" width="12" height="16" rx="1" class="k"/>' }).join('') + '<path d="M14 52v6M20 52v6M26 52v6M32 52v6M38 52v6M44 52v6M50 52v6M66 52v6M72 52v6M78 52v6M84 52v6M90 52v6M96 52v6M102 52v6" class="o" stroke="var(--amb)"/>') },
  hdd: { ar: 'القرص الصلب', en: 'Hard Disk (HDD)', fn: 'وحدة خزن بأقراص دوارة؛ الطقطقة علامة تلف',
    svg: S('<rect x="22" y="6" width="76" height="68" rx="4" class="b o"/><circle cx="56" cy="36" r="22" class="l o"/><circle cx="56" cy="36" r="4" class="k"/><path d="M88 62L64 40" class="o" stroke-width="4" stroke="var(--amb)"/><circle cx="88" cy="62" r="4" class="k"/>') },
  ssd: { ar: 'قرص الحالة الصلبة', en: 'SSD', fn: 'وحدة خزن سريعة بلا أجزاء متحركة',
    svg: S('<rect x="14" y="18" width="92" height="44" rx="4" class="k"/><rect x="22" y="26" width="50" height="28" rx="2" class="a"/><rect x="78" y="28" width="20" height="8" rx="1" class="l"/><rect x="78" y="42" width="20" height="8" rx="1" class="l"/>') },
  gpu: { ar: 'بطاقة العرض', en: 'Graphics Card', fn: 'ترسل الصورة إلى الشاشة',
    svg: S('<rect x="8" y="16" width="104" height="40" rx="4" class="k"/><circle cx="38" cy="36" r="14" class="l"/><circle cx="82" cy="36" r="14" class="l"/><circle cx="38" cy="36" r="3" class="k"/><circle cx="82" cy="36" r="3" class="k"/><path d="M20 56v10h70V56" class="o" stroke="var(--amb)" stroke-width="3"/>') },
  monitor: { ar: 'الشاشة', en: 'Monitor', fn: 'تعرض الصورة؛ تتصل عبر بطاقة العرض',
    svg: S('<rect x="10" y="6" width="100" height="56" rx="4" class="k"/><rect x="15" y="11" width="90" height="46" rx="2" class="a" opacity=".85"/><path d="M52 62l-6 12h28l-6-12" class="b o"/>') },
  keyboard: { ar: 'لوحة المفاتيح', en: 'Keyboard', fn: 'إدخال النص؛ في الهاتف تتوقع الكلمة التالية',
    svg: S('<rect x="6" y="20" width="108" height="42" rx="5" class="b o"/>' + [0, 1, 2].map(function (r) { return Array.apply(null, Array(10)).map(function (_, c) { return '<rect x="' + (12 + c * 10) + '" y="' + (26 + r * 9) + '" width="7" height="6" rx="1" class="k"/>' }).join('') }).join('') + '<rect x="30" y="53" width="60" height="5" rx="1" class="k"/>') },
  mouse: { ar: 'الفأرة', en: 'Mouse', fn: 'جهاز تأشير؛ افحص التوصيل والبطارية والتعريف',
    svg: S('<rect x="40" y="10" width="40" height="62" rx="20" class="b o"/><path d="M60 10v24M40 34h40" class="o"/><rect x="57" y="18" width="6" height="10" rx="3" class="a"/><path d="M60 10c0-6 10-8 20-6" class="o"/>') },
  battery: { ar: 'بطارية اللوحة الأم', en: 'CMOS Battery', fn: 'تحفظ الوقت والإعدادات؛ فراغها يعيد التاريخ للوراء',
    svg: S('<circle cx="60" cy="40" r="28" class="l o"/><circle cx="60" cy="40" r="20" class="b o"/><path d="M54 40h12M60 34v12" class="o" stroke-width="3"/>') },
  ups: { ar: 'مزود طاقة غير منقطع', en: 'UPS', fn: 'بطارية تحمي الجهاز عند انقطاع الكهرباء وتذبذبها',
    svg: S('<rect x="36" y="8" width="48" height="66" rx="5" class="k"/><rect x="44" y="16" width="32" height="14" rx="2" class="a"/><path d="M62 38l-8 12h8l-4 12 12-16h-8l4-8z" class="m"/>') },
  robot: { ar: 'الروبوت', en: 'Robot', fn: 'نظام مادي يستشعر محيطه ويتحرك فيه',
    svg: S('<rect x="36" y="14" width="48" height="34" rx="8" class="b o"/><circle cx="50" cy="30" r="5" class="a"/><circle cx="70" cy="30" r="5" class="a"/><path d="M60 14V6" class="o"/><circle cx="60" cy="5" r="3" class="m"/><rect x="42" y="50" width="36" height="22" rx="4" class="l o"/><path d="M36 56H24v12M84 56h12v12" class="o" stroke-width="4"/>') },
  eye: { ar: 'الرؤية الحاسوبية', en: 'Computer Vision', fn: 'فهم الصور والفيديو: الوجوه والنصوص والصور الطبية',
    svg: S('<path d="M8 40c20-28 84-28 104 0-20 28-84 28-104 0z" class="b o"/><circle cx="60" cy="40" r="16" class="a"/><circle cx="60" cy="40" r="6" class="k"/><path d="M14 10h12M14 10v12M106 10H94M106 10v12M14 70h12M14 70V58M106 70H94M106 70V58" class="o" stroke="var(--amb)" stroke-width="3"/>') },
  faceid: { ar: 'فتح القفل بالوجه', en: 'Face Unlock', fn: 'يطابق الوجه مع النموذج المحفوظ',
    svg: S('<path d="M30 14h-8v12M90 14h8v12M30 66h-8V54M90 66h8V54" class="o" stroke="var(--acc)" stroke-width="4"/><circle cx="48" cy="34" r="3" class="k"/><circle cx="72" cy="34" r="3" class="k"/><path d="M60 32v12h-4M48 52c6 6 18 6 24 0" class="o"/>') },
  map: { ar: 'الخرائط الذكية', en: 'Smart Maps', fn: 'تتوقع الازدحام وتقترح أسرع طريق',
    svg: S('<path d="M10 16l32-8 36 8 32-8v56l-32 8-36-8-32 8z" class="b o"/><path d="M42 8v56M78 16v56" class="o"/><path d="M20 58c14-4 20-22 34-24s22 10 40-14" class="o" stroke="var(--acc)" stroke-width="4"/><circle cx="94" cy="20" r="5" class="m"/>') },
  speaker: { ar: 'المساعد الصوتي', en: 'Voice Assistant', fn: 'يسمع كلمة التنبيه ثم يفهم الأمر وينفذه',
    svg: S('<rect x="40" y="16" width="40" height="58" rx="18" class="k"/><ellipse cx="60" cy="18" rx="20" ry="6" class="a"/><path d="M90 30a14 14 0 0 1 0 20M98 24a24 24 0 0 1 0 32M30 30a14 14 0 0 0 0 20M22 24a24 24 0 0 0 0 32" class="o" stroke="var(--acc)" stroke-width="3"/>') },
  school: { ar: 'التعليم الذكي', en: 'EdTech', fn: 'تعلم متكيف ومعلم ذكي وتصحيح آلي',
    svg: S('<path d="M60 10L10 30l50 20 50-20z" class="a"/><path d="M28 38v18c16 12 48 12 64 0V38" class="b o"/><path d="M104 32v24" class="o" stroke-width="3"/><circle cx="104" cy="58" r="4" class="m"/>') },
  xray: { ar: 'تحليل الصور الطبية', en: 'Medical Imaging', fn: 'كشف الأورام والكسور في صور الأشعة',
    svg: S('<rect x="22" y="6" width="76" height="68" rx="4" class="k"/><path d="M60 14v52M46 22c10 4 18 4 28 0M44 32c10 4 22 4 32 0M44 42c10 4 22 4 32 0M46 52c10 4 18 4 28 0" class="o" stroke="var(--line)"/><circle cx="74" cy="42" r="9" class="o" stroke="var(--amb)" stroke-width="3"/>') },
  watch: { ar: 'الساعة الذكية', en: 'Smartwatch', fn: 'تراقب النبض والنوم وتنبه للخطر',
    svg: S('<rect x="48" y="2" width="24" height="76" rx="6" class="l"/><rect x="38" y="18" width="44" height="44" rx="10" class="k"/><path d="M44 42h8l4-10 6 18 4-8h10" class="o" stroke="var(--acc)" stroke-width="3"/>') },
  chart: { ar: 'تحليل البيانات المالية', en: 'Financial Analytics', fn: 'كشف الاحتيال والتقييم الائتماني والتداول',
    svg: S('<path d="M14 8v60h96" class="o"/><rect x="24" y="44" width="12" height="24" class="l"/><rect x="44" y="34" width="12" height="34" class="a"/><rect x="64" y="40" width="12" height="28" class="l"/><rect x="84" y="20" width="12" height="48" class="a"/><path d="M22 40l20-14 20 8 30-22" class="o" stroke="var(--amb)" stroke-width="3"/>') },
  car: { ar: 'المركبة ذاتية القيادة', en: 'Autonomous Vehicle', fn: 'تقود بمستويات متدرجة حتى القيادة الكاملة',
    svg: S('<path d="M12 52l8-18c2-5 6-8 12-8h56c6 0 10 3 12 8l8 18v10H12z" class="a"/><path d="M30 32h60l6 14H24z" class="b"/><circle cx="34" cy="62" r="8" class="k"/><circle cx="86" cy="62" r="8" class="k"/><circle cx="60" cy="14" r="5" class="m"/><path d="M48 10a14 14 0 0 1 24 0" class="o" stroke="var(--amb)"/>') },
  traffic: { ar: 'إدارة الإشارات المرورية', en: 'Smart Traffic', fn: 'توقيت الإشارات بحسب كثافة السير',
    svg: S('<rect x="46" y="4" width="28" height="62" rx="6" class="k"/><circle cx="60" cy="16" r="7" class="bad"/><circle cx="60" cy="35" r="7" class="m"/><circle cx="60" cy="54" r="7" class="a"/><path d="M60 66v10" class="o" stroke-width="4"/>') },
  truck: { ar: 'الخدمات اللوجستية', en: 'Logistics', fn: 'تخطيط مسارات الشاحنات وتوقع حاجة المخازن',
    svg: S('<rect x="8" y="20" width="66" height="36" rx="3" class="a"/><path d="M74 30h20l14 14v12H74z" class="b o"/><circle cx="28" cy="60" r="8" class="k"/><circle cx="90" cy="60" r="8" class="k"/>') },
  cart: { ar: 'أنظمة التوصية', en: 'Recommender', fn: 'تقترح منتجات بحسب مشترياتك السابقة',
    svg: S('<path d="M8 14h14l10 38h56l10-28H28" class="o" stroke-width="4"/><circle cx="40" cy="64" r="6" class="k"/><circle cx="80" cy="64" r="6" class="k"/><path d="M92 4l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" class="m"/>') },
  chip: { ar: 'الرقائق الإلكترونية المتقدمة', en: 'AI Chips', fn: 'مورد تتنافس عليه الدول مع البيانات والكفاءات',
    svg: S('<rect x="30" y="10" width="60" height="60" rx="6" class="a"/><rect x="42" y="22" width="36" height="36" rx="3" class="k"/><text x="60" y="45" font-size="12" text-anchor="middle" class="tb">AI</text>' + [20, 32, 44, 56].map(function (v) { return '<path d="M' + (v + 14) + ' 2v8M' + (v + 14) + ' 70v8M22 ' + (v + 2) + 'h8M90 ' + (v + 2) + 'h8" class="o"/>' }).join('')) },
  cctv: { ar: 'التعرف على الوجوه', en: 'Facial Recognition', fn: 'كاميرات تحدد هوية الأشخاص في الأماكن العامة',
    svg: S('<path d="M20 20l60-10 6 22-60 10z" class="b o"/><circle cx="80" cy="24" r="6" class="a"/><path d="M40 40l-6 22H16" class="o" stroke-width="4"/><circle cx="96" cy="58" r="10" class="o" stroke="var(--amb)" stroke-width="3"/><path d="M90 74c2-6 10-6 12 0" class="o" stroke="var(--amb)"/>') },
  deepfake: { ar: 'التزييف العميق', en: 'Deepfake', fn: 'صورة أو صوت أو فيديو مولد يظهر ما لم يحدث',
    svg: S('<circle cx="40" cy="38" r="22" class="b o"/><circle cx="80" cy="38" r="22" class="m" opacity=".75"/><circle cx="33" cy="34" r="2.5" class="k"/><circle cx="47" cy="34" r="2.5" class="k"/><circle cx="73" cy="34" r="2.5" class="k"/><circle cx="87" cy="34" r="2.5" class="k"/><path d="M33 46c4 3 10 3 14 0M73 47c4-3 10-3 14 0" class="o"/><path d="M58 70h4" class="o"/>') },
  quantum: { ar: 'الحوسبة الكمية', en: 'Quantum Computing', fn: 'حواسيب بقواعد فيزياء الكم، في طور البحث',
    svg: S('<circle cx="60" cy="40" r="6" class="m"/><ellipse cx="60" cy="40" rx="44" ry="14" class="o" stroke="var(--acc)"/><ellipse cx="60" cy="40" rx="44" ry="14" class="o" stroke="var(--acc)" transform="rotate(60 60 40)"/><ellipse cx="60" cy="40" rx="44" ry="14" class="o" stroke="var(--acc)" transform="rotate(-60 60 40)"/>') }
};

/* أيقونات الفصول */
var CHICON = {
  switch: DEV.switch.svg, firewall: DEV.firewall.svg, card: DEV.card.svg, mobo: DEV.mobo.svg, phone: DEV.phone.svg,
  brain: S('<path d="M58 12c-10-6-24 0-24 12-10 2-14 14-8 22-4 10 4 20 14 20 4 6 14 6 18 0z" class="a"/><path d="M62 12c10-6 24 0 24 12 10 2 14 14 8 22 4 10-4 20-14 20-4 6-14 6-18 0z" class="m"/><path d="M60 12v54" class="o" stroke="var(--bg)" stroke-width="3"/>'),
  doc: S('<path d="M30 6h44l18 18v50H30z" class="b o"/><path d="M74 6v18h18" class="o"/><path d="M40 34h40M40 44h40M40 54h26" class="o" stroke="var(--acc)" stroke-width="3"/><circle cx="84" cy="64" r="10" class="m"/>'),
  globe: S('<circle cx="60" cy="40" r="32" class="a"/><path d="M28 40h64M60 8c-14 18-14 46 0 64M60 8c14 18 14 46 0 64M34 22h52M34 58h52" class="o" stroke="var(--bg)" stroke-width="2"/>'),
  shield: S('<path d="M60 6l40 14v20c0 20-16 32-40 38C36 72 20 60 20 40V20z" class="a"/><path d="M42 40l12 12 24-24" class="o" stroke="var(--bg)" stroke-width="6"/>'),
  agent: S('<circle cx="60" cy="40" r="14" class="m"/><circle cx="60" cy="40" r="30" class="o" stroke="var(--acc)" stroke-width="4" stroke-dasharray="14 8"/><path d="M88 30l4 10 8-6" class="o" stroke="var(--acc)" stroke-width="4"/>')
};

/* مخططات SVG */
var ILL = {
  topo: function () {
    var n = function (x, y, c) { return '<circle cx="' + x + '" cy="' + y + '" r="5" class="' + (c || 'k') + '"/>'; };
    var cell = function (ox, title, body) { return '<g transform="translate(' + ox + ',0)">' + body + '<text x="30" y="76" font-size="9" text-anchor="middle" class="tx">' + title + '</text></g>'; };
    return S(
      cell(250, 'الخطي', '<path d="M4 30h52" class="o" stroke-width="3"/>' + [8, 22, 36, 50].map(function (x, i) { return '<path d="M' + x + ' 30v-12" class="o"/>' + n(x, 14) }).join('')) +
      cell(188, 'الحلقي', '<circle cx="30" cy="34" r="20" class="o"/>' + [[30, 14], [50, 34], [30, 54], [10, 34]].map(function (p) { return n(p[0], p[1]) }).join('')) +
      cell(126, 'النجمي', [[10, 14], [50, 14], [10, 54], [50, 54]].map(function (p) { return '<path d="M30 34L' + p[0] + ' ' + p[1] + '" class="o"/>' + n(p[0], p[1]) }).join('') + n(30, 34, 'a')) +
      cell(64, 'الشبكي', '<path d="M10 14L50 14L50 54L10 54ZM10 14L50 54M50 14L10 54" class="o"/>' + [[10, 14], [50, 14], [10, 54], [50, 54]].map(function (p) { return n(p[0], p[1]) }).join('')) +
      cell(2, 'الهجين', '<path d="M6 20h48" class="o" stroke-width="3"/><path d="M18 20L18 40M18 40L6 56M18 40L30 56M42 20v10" class="o"/>' + n(18, 40, 'a') + n(6, 56) + n(30, 56) + n(42, 32) + n(6, 20) + n(54, 20)),
      '0 0 314 84');
  },
  p2pcs: function () {
    var pc = function (x, y) { return '<rect x="' + (x - 8) + '" y="' + (y - 6) + '" width="16" height="12" rx="2" class="b o"/>'; };
    return S(
      '<g><path d="M20 20L60 20L60 60L20 60ZM20 20L60 60M60 20L20 60" class="o"/>' + [[20, 20], [60, 20], [20, 60], [60, 60]].map(function (p) { return pc(p[0], p[1]) }).join('') + '<text x="40" y="82" font-size="9" text-anchor="middle" class="tx">الند للند</text></g>' +
      '<g transform="translate(110,0)">' + [[10, 14], [70, 14], [10, 66], [70, 66]].map(function (p) { return '<path d="M40 40L' + p[0] + ' ' + p[1] + '" class="o"/>' + pc(p[0], p[1]) }).join('') + '<rect x="28" y="28" width="24" height="24" rx="3" class="a"/><text x="40" y="82" font-size="9" text-anchor="middle" class="tx">الخادم والعميل</text></g>',
      '0 0 190 90');
  },
  office: function () {
    var box = function (x, label, k) { return '<g transform="translate(' + x + ',14)"><g transform="scale(.42)">' + DEV[k].svg.replace(/<\/?svg[^>]*>/g, '') + '</g><text x="25" y="46" font-size="8" text-anchor="middle" class="tx">' + label + '</text></g>'; };
    return S(
      '<path d="M44 26h22M110 26h22M176 26h22" class="o" stroke="var(--acc)" stroke-width="2" marker-end="url(#ar)"/>' +
      '<defs><marker id="ar" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6z" class="a"/></marker></defs>' +
      '<g transform="translate(0,14)"><circle cx="22" cy="12" r="14" class="a" opacity=".85"/><path d="M8 12h28M22 -2c-6 8-6 20 0 28M22 -2c6 8 6 20 0 28" class="o" stroke="var(--bg)"/><text x="22" y="46" font-size="8" text-anchor="middle" class="tx">الإنترنت</text></g>' +
      box(64, 'المودم', 'modem') + box(130, 'الموجه', 'router') + box(196, 'المبدل', 'switch') +
      '<path d="M222 50v14M222 64H176M222 64h46M176 64v6M222 64v6M268 64v6" class="o"/>' +
      [160, 206, 252].map(function (x) { return '<rect x="' + x + '" y="70" width="32" height="20" rx="2" class="b o"/><rect x="' + (x + 4) + '" y="74" width="24" height="12" class="a" opacity=".7"/>'; }).join(''),
      '0 0 300 96');
  },
  addr: function () {
    return S(
      '<rect x="4" y="8" width="140" height="64" rx="8" class="b o"/><text x="74" y="26" font-size="10" text-anchor="middle" class="tx">العنوان الفيزيائي</text><text x="74" y="46" font-size="11" text-anchor="middle" class="tm">3C-52-82-A1-7F-09</text><text x="74" y="62" font-size="8" text-anchor="middle" class="tx">ثابت من المصنع</text>' +
      '<rect x="156" y="8" width="140" height="64" rx="8" class="b o"/><text x="226" y="26" font-size="10" text-anchor="middle" class="tx">العنوان المنطقي</text><text x="226" y="46" font-size="11" text-anchor="middle" class="tm">192.168.1.25</text><text x="226" y="62" font-size="8" text-anchor="middle" class="tx">يعطى عند الاتصال وقد يتغير</text>',
      '0 0 300 80');
  },
  cia: function () {
    return S('<path d="M100 10L180 140H20Z" class="o" stroke-width="3" fill="var(--accs)"/><circle cx="100" cy="12" r="22" class="a"/><circle cx="22" cy="138" r="22" class="m"/><circle cx="178" cy="138" r="22" class="k"/>' +
      '<text x="100" y="16" font-size="11" text-anchor="middle" class="tk">السرية</text><text x="22" y="142" font-size="10" text-anchor="middle" class="tk">السلامة</text><text x="178" y="142" font-size="10" text-anchor="middle" class="tb">التوافر</text><text x="100" y="100" font-size="10" text-anchor="middle" class="tx">أمن المعلومات</text>', '-10 -14 220 180');
  },
  twofa: function () {
    return S('<rect x="6" y="20" width="80" height="40" rx="8" class="b o"/><text x="46" y="44" font-size="10" text-anchor="middle" class="tx">كلمة المرور</text><path d="M90 40h22" class="o" stroke-width="3"/><rect x="116" y="8" width="44" height="64" rx="8" class="k"/><rect x="122" y="22" width="32" height="16" rx="3" class="a"/><text x="138" y="34" font-size="9" text-anchor="middle" class="tk">482913</text><path d="M164 40h22" class="o" stroke-width="3"/><circle cx="210" cy="40" r="20" class="m"/><path d="M200 40l7 7 13-13" class="o" stroke="var(--ink)" stroke-width="4"/>', '0 0 236 80');
  },
  backup: function () {
    var db = function (x, c) { return '<ellipse cx="' + x + '" cy="18" rx="22" ry="7" class="' + c + '"/><rect x="' + (x - 22) + '" y="18" width="44" height="34" class="' + c + '"/><ellipse cx="' + x + '" cy="52" rx="22" ry="7" class="' + c + '"/><ellipse cx="' + x + '" cy="18" rx="22" ry="7" class="o"/>'; };
    return S(db(36, 'a') + db(100, 'a') + db(196, 'm') + '<path d="M146 6v64" class="o" stroke-dasharray="4 4"/>' +
      '<text x="68" y="80" font-size="9" text-anchor="middle" class="tx">3 نسخ على وسيطين</text><text x="196" y="80" font-size="9" text-anchor="middle" class="tx">1 خارج الموقع</text>', '0 0 236 88');
  },
  otp: function () {
    var st = ['تطلب عملية', 'يصل الرمز', 'تدخله', 'تتم العملية'];
    return S(st.map(function (t, i) {
      var a = i * Math.PI / 2 - Math.PI / 2, x = 100 + 62 * Math.cos(a), y = 70 + 46 * Math.sin(a);
      return '<rect x="' + (x - 34) + '" y="' + (y - 12) + '" width="68" height="24" rx="12" class="' + (i == 1 ? 'm' : 'b o') + '"/><text x="' + x + '" y="' + (y + 4) + '" font-size="10" text-anchor="middle" class="' + (i == 1 ? 'tk' : 'tx') + '">' + t + '</text>';
    }).join('') + '<text x="100" y="74" font-size="9" text-anchor="middle" class="tx">دقائق معدودة</text>', '0 0 200 140');
  },
  nn: function () {
    var L = [[3, 20], [4, 75], [4, 130], [2, 185]], out = '', pos = [];
    L.forEach(function (l) { var p = []; for (var i = 0; i < l[0]; i++) p.push([l[1], 40 + (i - (l[0] - 1) / 2) * 22]); pos.push(p); });
    for (var k = 0; k < pos.length - 1; k++) pos[k].forEach(function (a) { pos[k + 1].forEach(function (b) { out += '<path d="M' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1] + '" class="o" stroke-width="1" opacity=".5"/>'; }); });
    pos.forEach(function (p, k) { p.forEach(function (a) { out += '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="7" class="' + (k == 0 ? 'm' : k == 3 ? 'a' : 'b o') + '"/>'; }); });
    return S(out + '<text x="20" y="96" font-size="8" text-anchor="middle" class="tx">مدخلات</text><text x="102" y="96" font-size="8" text-anchor="middle" class="tx">طبقات مخفية</text><text x="185" y="96" font-size="8" text-anchor="middle" class="tx">مخرجات</text>', '0 0 205 102');
  },
  tradml: function () {
    var row = function (y, a, b, c, hl) { return '<rect x="150" y="' + y + '" width="66" height="26" rx="6" class="b o"/><text x="183" y="' + (y + 17) + '" font-size="9" text-anchor="middle" class="tx">' + a + '</text><path d="M146 ' + (y + 13) + 'h-14" class="o"/><rect x="62" y="' + (y - 2) + '" width="66" height="30" rx="6" class="' + hl + '"/><text x="95" y="' + (y + 17) + '" font-size="9" text-anchor="middle" class="tk">' + b + '</text><path d="M58 ' + (y + 13) + 'h-14" class="o"/><rect x="2" y="' + y + '" width="40" height="26" rx="6" class="b o"/><text x="22" y="' + (y + 17) + '" font-size="9" text-anchor="middle" class="tx">' + c + '</text>'; };
    return S('<text x="216" y="12" font-size="9" text-anchor="end" class="tx">البرنامج التقليدي</text>' + row(18, 'بيانات + قواعد', 'برنامج', 'نتائج', 'm') +
      '<text x="216" y="66" font-size="9" text-anchor="end" class="tx">تعلم الآلة</text>' + row(72, 'بيانات + نتائج', 'تعلم', 'قواعد', 'a'), '0 0 220 104');
  },
  agentcycle: function () {
    var st = ['الهدف', 'التخطيط', 'استخدام الأدوات', 'المراجعة', 'موافقة الإنسان', 'إنجاز المهمة'];
    return S('<circle cx="110" cy="80" r="56" class="o" stroke-dasharray="5 5"/>' + st.map(function (t, i) {
      var a = i * Math.PI / 3 - Math.PI / 2, x = 110 + 62 * Math.cos(a), y = 80 + 56 * Math.sin(a);
      return '<rect x="' + (x - 40) + '" y="' + (y - 12) + '" width="80" height="24" rx="12" class="' + (i == 4 ? 'm' : i == 0 ? 'a' : 'b o') + '"/><text x="' + x + '" y="' + (y + 4) + '" font-size="10" text-anchor="middle" class="' + (i == 4 || i == 0 ? 'tk' : 'tx') + '">' + t + '</text>';
    }).join(''), '0 0 220 160');
  },
  rag: function () {
    var b = function (x, y, w, t, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="26" rx="6" class="' + c + '"/><text x="' + (x + w / 2) + '" y="' + (y + 17) + '" font-size="9" text-anchor="middle" class="' + (c == 'b o' ? 'tx' : 'tk') + '">' + t + '</text>'; };
    return S(b(232, 8, 56, 'السؤال', 'b o') + '<path d="M228 21h-14" class="o"/>' + b(150, 8, 60, 'بحث في الوثائق', 'm') + '<path d="M146 21h-14" class="o"/>' + b(70, 8, 58, 'مقاطع ذات علاقة', 'b o') + '<path d="M66 21h-12" class="o"/>' + b(2, 8, 50, 'النموذج', 'a') +
      '<path d="M27 34v14" class="o"/>' + b(2, 50, 120, 'جواب مع ذكر المصدر', 'b o') + '<rect x="160" y="46" width="34" height="34" rx="2" class="l o"/><path d="M166 56h22M166 63h22M166 70h14" class="o"/><path d="M180 46V36" class="o" stroke-dasharray="3 3"/>', '0 0 292 86');
  },
  six: function () {
    var st = ['تحديد المشكلة', 'وضع نظرية', 'اختبار النظرية', 'خطة الحل وتنفيذها', 'التحقق الكامل', 'التوثيق'];
    return S('<circle cx="120" cy="84" r="58" class="o" stroke-dasharray="5 5"/>' + st.map(function (t, i) {
      var a = i * Math.PI / 3 - Math.PI / 2, x = 120 + 70 * Math.cos(a), y = 84 + 58 * Math.sin(a);
      return '<rect x="' + (x - 46) + '" y="' + (y - 12) + '" width="92" height="24" rx="12" class="' + (i == 0 ? 'a' : 'b o') + '"/><text x="' + x + '" y="' + (y + 4) + '" font-size="10" text-anchor="middle" class="' + (i == 0 ? 'tk' : 'tx') + '">' + (i + 1) + '. ' + t + '</text>';
    }).join('') + '<path d="M150 78a30 30 0 0 1-60 12" class="o" stroke="var(--amb)" stroke-width="2"/><text x="120" y="88" font-size="8" text-anchor="middle" class="tx">2 ↔ 3</text>', '0 0 240 168');
  }
};
