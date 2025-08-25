export interface HelpPost {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
}

export const helpPosts: HelpPost[] = [
  {
    id: "HP-001",
    title: "Jak vyhledat artikl ve skladu",
    content: "Pro vyhledání artiklu zadejte jeho ID do vyhledávacího pole na hlavní stránce a stiskněte tlačítko 'Hledat'. Systém vám zobrazí regál, číslo police a obchod, kde se artikl nachází.",
    keywords: ["vyhledat", "artikl", "sklad", "hledat", "ID", "regál", "police", "obchod"],
    category: "Artikly",
  },
  {
    id: "HP-002",
    title: "Použití čtečky čárových kódů",
    content: "Na stránce 'Skenovat čárový kód' můžete použít kameru vašeho zařízení k naskenování čárového kódu artiklu. Po úspěšném naskenování budete přesměrováni na hlavní stránku s výsledky vyhledávání pro daný artikl.",
    keywords: ["skener", "čárový kód", "kamera", "naskenovat", "artikl", "vyhledávání"],
    category: "Skenování",
  },
  {
    id: "HP-003",
    title: "Hromadné přidávání artiklů",
    content: "Na stránce 'Hromadné přidávání artiklů' můžete nejprve uzamknout detaily police (regál, číslo police, obchod). Poté můžete skenovat nebo ručně zadávat ID artiklů a jejich množství. Všechny přidané artikly se uloží do seznamu a můžete je hromadně uložit do systému.",
    keywords: ["hromadné přidání", "artikl", "skenovat", "ručně", "množství", "uložit", "police", "regál"],
    category: "Artikly",
  },
  {
    id: "HP-004",
    title: "Správa uživatelských účtů (pouze pro administrátory)",
    content: "Administrátoři mohou na stránce 'Přehled administrace' spravovat uživatelské účty. Mohou přidávat nové uživatele, upravovat jejich role a oprávnění, nebo stávající uživatele mazat. Ujistěte se, že každý uživatel má správně přiřazený obchod a roli.",
    keywords: ["uživatelé", "správa", "admin", "role", "oprávnění", "přidat", "upravit", "smazat"],
    category: "Administrace",
  },
  {
    id: "HP-005",
    title: "Změna hesla",
    content: "Své heslo můžete změnit na stránce 'Nastavení účtu'. Zadejte své aktuální heslo a poté dvakrát nové heslo. Pro bezpečnost doporučujeme používat silná hesla.",
    keywords: ["heslo", "změna", "bezpečnost", "nastavení účtu"],
    category: "Účet",
  },
  {
    id: "HP-006",
    title: "Správa regálů",
    content: "Na stránce 'Správa regálů' můžete přidávat nové regály, upravovat jejich řady, čísla a popisy polic, nebo stávající regály mazat. Každý regál musí být přiřazen k obchodu.",
    keywords: ["regál", "správa", "police", "popis", "přidat", "upravit", "smazat", "obchod"],
    category: "Regály",
  },
  {
    id: "HP-007",
    title: "Export dat",
    content: "Na stránce 'Export dat' můžete vybrat, které typy dat (uživatelé, obchody, artikly, regály) chcete exportovat. Můžete si vybrat mezi formátem CSV a JSON. Exportovaná data se stáhnou do vašeho zařízení.",
    keywords: ["export", "data", "CSV", "JSON", "uživatelé", "obchody", "artikly", "regály", "stáhnout"],
    category: "Data",
  },
  {
    id: "HP-008",
    title: "Správa obchodů (pouze pro administrátory)",
    content: "Administrátoři mohou na stránce 'Přehled administrace' spravovat obchody. Mohou přidávat nové obchody, upravovat jejich názvy a ID, nebo stávající obchody mazat. Při přidávání nového obchodu můžete zvolit, zda se mají automaticky přidat výchozí artikly.",
    keywords: ["obchody", "správa", "admin", "přidat", "upravit", "smazat", "výchozí artikly"],
    category: "Administrace",
  },
  {
    id: "HP-009",
    title: "Kopírování artiklů mezi obchody (pouze pro administrátory)",
    content: "Administrátoři mohou na stránce 'Přehled administrace' kopírovat artikly z jednoho obchodu do druhého. Můžete zvolit zdrojový a cílový obchod a také, zda chcete přepsat existující artikly v cílovém obchodě. Tato funkce je užitečná pro rychlé nastavení nových obchodů.",
    keywords: ["kopírovat", "artikly", "obchody", "admin", "přepsat", "nastavení"],
    category: "Administrace",
  },
];