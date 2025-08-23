import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext"; // Import useLog
import { useShelfRacks } from "./shelfRacks"; // Import useShelfRacks to get rack details

export interface Article {
  id: string; // Číslo článku (Article Number)
  name: string; // Název
  rackId: string; // ID of the selected ShelfRack (e.g., "A-1")
  shelfNumber: string; // The specific shelf number within the rack (e.g., "1", "2")
  storeId: string; // Derived from ShelfRack (renamed from warehouseId)
  status: string; // Nové pole pro status zboží
  quantity: number; // New field for article quantity
}

// Initial dummy data for Articles
// This data will be assigned to a default store and racks for demonstration
const rawArticleData = `
3600118 (21)	Lavice BADSTED s úložným prostorem sv. šedý potah/barva dubu	1 KS	2 KS	2 299,00 CZK	2 299,00 CZK	31-12-9998	07-05-2025
3600181 (11)	Botník BORNHOLM 4 police černá	39 KS	40 KS	200,00 CZK	200,00 CZK		28-01-2022
3600259 (21)	Stolička JUNGHOLM přírodní	3 KS	4 KS	500,00 CZK	750,00 CZK	01-08-2025	11-07-2025
3600330 (12)	Toaletní stolek SAKSILD zrcadlo bambus	1 KS	2 KS	3 999,00 CZK	3 999,00 CZK		15-07-2021
3600339 (11)	Lavice OLDEKROG 3 zásuvky bílá/dub	2 KS	3 KS	4 499,00 CZK	4 499,00 CZK		10-01-2022
3600341 (11)	Police do chodby OLDEKROG 3 zásuvky bílá/dub	1 KS	2 KS	2 299,00 CZK	2 299,00 CZK		10-01-2022
3600369 (21)	Vozík SORTEBRO 2 police černá/sklo	1 KS	2 KS	850,00 CZK	1 250,00 CZK	01-08-2025	10-03-2025
3600380 (11)	Noční stolek JENSLEV 1 zásuvka dub	3 KS	4 KS	1 099,00 CZK	1 099,00 CZK		11-08-2022
3600389 (12)	Komoda 4 zásuvky JENSLEV dub	1 KS	2 KS	2 499,00 CZK	2 499,00 CZK		05-08-2022
3600396 (41)	Pohovka GEDVED 3místná sv. šedý potah	1 KS	1 KS	12 999,00 CZK	12 999,00 CZK		29-12-2021
3600408 (41)	Pohovka GEDVED 2místná šedá	2 KS	2 KS	6 500,00 CZK	9 999,00 CZK		26-11-2024
3600428 (21)	Přídavná deska ROSKILDE/ROSLEV 95x50 dub	1 KS	1 KS	3 000,00 CZK	4 999,00 CZK	31-12-9998	22-05-2025
3600446 (11)	Psací stůl ABBETVED 48×120 barva světlého dubu/bílá	1 KS	2 KS	1 350,00 CZK	2 999,00 CZK	12-01-2026	05-08-2022
3600471 (21)	Dělicí stěna FILSKOV 8 polic dub/bílá	1 KS	1 KS	2 250,00 CZK	2 250,00 CZK	12-01-2026	26-03-2025
3600475 (11)	Zrcadlo STUDSTRUP 80x180 černá	1 KS	2 KS	3 500,00 CZK	3 500,00 CZK		30-09-2022
3600478 (11)	Komoda JENSLEV 4+4 zásuvky dub	2 KS	2 KS	4 499,00 CZK	4 499,00 CZK		25-10-2022
3600483 (21)	Postelový rám KONGSBERG 140×200 šedá	1 KS	1 KS	6 499,00 CZK	6 499,00 CZK	31-12-9998	19-02-2025
3600514 (11)	Jídelní židle ADSLEV samet šedá	1 KS	2 KS	2 000,00 CZK	3 299,00 CZK	31-12-9998	13-03-2023
3600517 (21)	Jídelní stůl JEGIND Ø105 dub/černá	1 KS	2 KS	4 999,00 CZK	4 999,00 CZK	31-12-9998	12-03-2025
3600527 (11)	Věšák GREVINGE 5+5 háčků bílá	18 KS	19 KS	275,00 CZK	275,00 CZK		11-07-2024
3600528 (11)	Věšák GREVINGE 5+5 háčků černá	22 KS	23 KS	275,00 CZK	275,00 CZK		09-08-2024
3600529 (11)	Taburet NEBLE Ø50 béžová pletený potah	2 KS	3 KS	850,00 CZK	850,00 CZK	12-01-2026	22-06-2023
3600569 (21)	Herní židle HARLEV černá síťovina/šedá koženka	5 KS	5 KS	1 500,00 CZK	1 500,00 CZK	01-08-2025	23-04-2025
3600570 (11)	Židle k psacímu stolu ASPERUP černá síťovina/černý potah	5 KS	6 KS	2 999,00 CZK	2 999,00 CZK		06-03-2023
3600603 (11)	Botník TERPET 2 přihrádky bílá	1 KS	2 KS	2 500,00 CZK	3 299,00 CZK		27-01-2023
3600628 (11)	Odkládací stolek RANDERUP Ø47 černá	14 KS	15 KS	200,00 CZK	200,00 CZK		24-07-2023
3600629 (11)	TV stolek TRAPPEDAL 1 zásuvka barva teplého dubu/černá	2 KS	3 KS	1 750,00 CZK	2 299,00 CZK	31-12-9998	13-03-2023
3600632 (11)	Psací stůl TAMHOLT 50×100 bílá/přírodní	1 KS	2 KS	1 750,00 CZK	2 799,00 CZK		29-03-2023
3600634 (11)	Herní stůl HALSTED 60×120 držák na nápoj a sluchátka černá	2 KS	3 KS	1 999,00 CZK	1 999,00 CZK		31-01-2023
3600636 (11)	Stojan na monitor SULDRUP černá	10 KS	11 KS	500,00 CZK	500,00 CZK		21-04-2023
3600638 (11)	Věšák VANDSTED 1 police bambus	1 KS	2 KS	1 500,00 CZK	1 999,00 CZK	31-12-9998	09-08-2023
3600643 (21)	Botník UGGERBY 2 police bílá	8 KS	9 KS	500,00 CZK	500,00 CZK	31-12-9998	13-06-2025
3600646 (21)	Jídelní židle KOKKEDAL samet šedá/černá	1 KS	4 KS	2 299,00 CZK	2 299,00 CZK	31-12-9998	20-01-2025
3600674 (11)	Police ABILD 80x24 bílá	22 KS	23 KS	250,00 CZK	250,00 CZK		11-01-2023
3600675 (12)	Police ABILD 120x24 bílá	8 KS	9 KS	300,00 CZK	300,00 CZK		13-04-2023
3600676 (12)	Police ABILD 120x24 barva světlého dubu	14 KS	15 KS	300,00 CZK	300,00 CZK		13-04-2023
3600677 (11)	Police ABILD 80x24 barva světlého dubu	25 KS	28 KS	250,00 CZK	250,00 CZK		18-04-2023
3600914 (21)	Věšák GALSTED 5 háčků bílá	17 KS	18 KS	100,00 CZK	135,00 CZK	01-08-2025	03-05-2025
3600977 (11)	Vitrína SKALS skleněné dveře barva divokého tmavého dubu	1 KS	2 KS	2 000,00 CZK	2 000,00 CZK	31-12-9998	14-02-2024
3600983 (11)	Botník HALS 2 police černá	11 KS	12 KS	375,00 CZK	375,00 CZK		09-12-2021
3600984 (11)	Botník HALS 4 police černá	11 KS	12 KS	850,00 CZK	850,00 CZK		09-12-2021
3600987 (11)	Regál TRAPPEDAL 5 polic barva teplého dubu/černá	2 KS	2 KS	1 999,00 CZK	1 999,00 CZK		06-03-2023
3601018 (11)	Regál TRAPPEDAL 7 polic barva teplého dubu/černá	1 KS	2 KS	2 799,00 CZK	2 799,00 CZK		22-03-2023
3601024 (11)	Komoda JENSLEV 4 zásuvky 1 dveře dub	2 KS	2 KS	2 799,00 CZK	2 799,00 CZK		20-12-2022
3601027 (11)	Skříňka SKALS 4 přihrádky barva divokého tmavého dubu	1 KS	2 KS	1 250,00 CZK	1 250,00 CZK	31-12-9998	14-02-2024
3601029 (11)	Vitrína SKALS skleněné dveře bílá	3 KS	3 KS	1 850,00 CZK	1 850,00 CZK	31-12-9998	14-02-2024
3601050 (11)	Herní židle TYPE Z RAZER ed.™ LEGEND	9 KS	10 KS	7 999,00 CZK	7 999,00 CZK		22-03-2023
3601069 (12)	Noční stolek VEDDE 1 zásuvka divoký dub	3 KS	4 KS	1 250,00 CZK	1 599,00 CZK		29-11-2022
3601076 (11)	Komoda VEDDE 3 zásuvky divoký dub	1 KS	2 KS	3 250,00 CZK	4 299,00 CZK		23-12-2022
3601082 (11)	Příborník VEDDE 3 dveře 3 zásuvky barva divok. tmavého dubu	1 KS	2 KS	5 499,00 CZK	5 499,00 CZK	31-07-2026	21-12-2022
3601084 (11)	Police VEDDE 131x25 divoký tmavý dub	1 KS	2 KS	1 000,00 CZK	1 299,00 CZK	12-01-2026	21-06-2023
3601087 (11)	Šatní skříň VEDDE 167×197 se zrcadlem divoký dub	1 KS	2 KS	12 999,00 CZK	12 999,00 CZK		28-11-2022
3601094 (11)	Psací stůl TRAPPEDAL 48×95 1 zásuvka barva tepl. dubu/černá	2 KS	3 KS	1 999,00 CZK	1 999,00 CZK		22-12-2022
3601104 (11)	Polohovací křeslo VONSILD elektrické světle šedá	2 KS	3 KS	7 500,00 CZK	9 999,00 CZK		15-08-2023
3601114 (11)	Vozík KANSTRUP sv. písková	5 KS	6 KS	750,00 CZK	750,00 CZK	31-12-9998	19-01-2023
3601137 (21)	Jídelní židle JONSTRUP asfaltový potah/dub	16 KS	17 KS	650,00 CZK	1 299,00 CZK	31-12-9998	12-08-2025
3601174 (11)	Konferenční stolek AGERBY 60×100 sklo/dub	2 KS	3 KS	3 500,00 CZK	4 499,00 CZK		06-12-2023
3601175 (11)	Konferenční stolek AGERBY Ø60 sklo/dub	1 KS	1 KS	1 750,00 CZK	2 299,00 CZK		19-01-2024
3601213 (11)	Barová židle TAULOV šedý potah/černá	3 KS	4 KS	1 500,00 CZK	1 999,00 CZK		01-08-2024
3601227 (11)	Jídelní židle RISSKOV sv. šedý potah/černá	5 KS	6 KS	2 699,00 CZK	2 699,00 CZK		20-02-2023
3601228 (11)	Jídelní židle RISSKOV tm. zelená samet/černá	5 KS	6 KS	1 350,00 CZK	2 699,00 CZK		16-12-2024
3601234 (11)	Přídavná deska SKOVLUNDE 90x46 přírodní dub	1 KS	2 KS	2 499,00 CZK	2 499,00 CZK		18-12-2023
3601243 (11)	Komoda ODBY 3 bo×y bílá/šedá	1 KS	2 KS	750,00 CZK	750,00 CZK		22-05-2023
3601245 (41)	Konferenční stolek DOKKEDAL 75×115 beton	1 KS	2 KS	1 500,00 CZK	1 999,00 CZK		15-04-2025
3601257 (11)	Kancelářská židle TAMDRUP paměťová pěna koženka	1 KS	2 KS	3 500,00 CZK	6 999,00 CZK		21-08-2023
3601259 (21)	Taburet GISLEV Ø36 úložný prostor šedý potah	2 KS	3 KS	1 099,00 CZK	1 099,00 CZK	31-12-9998	14-04-2025
3601264 (12)	Psací stůl TRAPPEDAL 48×95 1 zásuvka barva teplého dubu/bílá	1 KS	1 KS	1 999,00 CZK	1 999,00 CZK		14-06-2023
3601291 (11)	Noční stolek NORDBY 1 zásuvka 1 police bílá	2 KS	3 KS	1 000,00 CZK	1 000,00 CZK	31-12-9998	02-06-2023
3601310 (11)	Polohovací křeslo ABILDSKOV šedá koženka	2 KS	3 KS	8 499,00 CZK	8 499,00 CZK	31-12-9998	09-11-2023
3601337 (11)	Psací stůl STAUNING 80×160 bílá	1 KS	1 KS	3 299,00 CZK	3 299,00 CZK		27-07-2023
3601339 (41)	Stůl s nastavitelnou výškou SVANEKE 80x160 černá	1 KS	2 KS	6 000,00 CZK	8 499,00 CZK	31-12-9998	27-05-2025
3601365 (11)	Jídelní židle ADSLEV béžový potah/barva dubu	2 KS	4 KS	3 299,00 CZK	3 299,00 CZK	31-12-9998	13-01-2023
3601370 (11)	Skládací židle VOEL samet tm. šedá	16 KS	17 KS	300,00 CZK	300,00 CZK		07-06-2023
3601376 (12)	Jídelní stůl TYLSTRUP 75x118 borovice	2 KS	3 KS	1 500,00 CZK	1 500,00 CZK		30-04-2023
3601390 (21)	Vozík SORTEBRO 2 police černá/sklo	1 KS	1 KS	850,00 CZK	1 250,00 CZK	01-08-2025	07-05-2025
3601399 (11)	Noční stolek JENSLEV 1 zásuvka bílá	2 KS	3 KS	750,00 CZK	999,00 CZK		17-07-2025
3601407 (11)	Komoda 3 zásuvky BILLUND barva travertinu/béžová	1 KS	1 KS	3 999,00 CZK	3 999,00 CZK		17-07-2025
3601409 (11)	Komoda 3+3 zásuvky BILLUND barva travertinu/béžová	1 KS	1 KS	6 499,00 CZK	6 499,00 CZK		17-07-2025
3601410 (11)	Botník UGGERBY 2 police bílá	6 KS	6 KS	500,00 CZK	500,00 CZK		16-06-2025
3601411 (11)	Šatní skříň JENSLEV 96x176 2 dveře 3 zásuvky bílá	1 KS	1 KS	4 699,00 CZK	4 699,00 CZK		04-08-2025
3601413 (11)	Šatní skříň JENSLEV 144x176 3 dveře 3 zásuvky bílá	1 KS	1 KS	5 999,00 CZK	5 999,00 CZK		04-08-2025
3601415 (11)	Nástavec JENSLEV 144x40 3 dveře bílá	1 KS	1 KS	1 999,00 CZK	1 999,00 CZK		04-08-2025
3601501 (11)	Zrcadlo ILBJERG 40x160 černá	2 KS	3 KS	1 350,00 CZK	1 699,00 CZK		18-07-2024
3605035 (21)	Jídelní židle BISTRUP olivová/dub	4 KS	5 KS	750,00 CZK	750,00 CZK	01-08-2025	15-04-2025
3606824 (11)	Knihovna HORSENS 3 police úzká bílá	2 KS	2 KS	700,00 CZK	700,00 CZK		23-07-2021
3606825 (11)	Knihovna HORSENS 3 police široká bílá	3 KS	3 KS	900,00 CZK	900,00 CZK		28-06-2021
3610106 (41)	Lavice ALSTED barva dubu	2 KS	3 KS	2 499,00 CZK	2 499,00 CZK		06-05-2025
3610140 (11)	Podložka pod židli GULDAGER na tvrdou podlahu	10 KS	11 KS	400,00 CZK	400,00 CZK		21-07-2022
3610141 (11)	Podložka pod židli GULDAGER na koberec	8 KS	9 KS	500,00 CZK	500,00 CZK		21-07-2022
3611110 (12)	Komoda 3 zásuvky BILLUND bílá/dub	1 KS	1 KS	2 000,00 CZK	3 999,00 CZK		31-07-2025
3612023 (21)	Jídelní židle STABY stohovací černá	11 KS	12 KS	600,00 CZK	600,00 CZK	01-08-2025	06-05-2025
3612024 (11)	Vozík JUKKERUP tm. šedá	3 KS	4 KS	850,00 CZK	850,00 CZK	31-07-2026	21-07-2022
3612033 (21)	Jídelní stůl SKOVLUNDE 90x200 tm. dub	1 KS	1 KS	7 000,00 CZK	7 000,00 CZK	01-08-2025	08-04-2025
3616802 (21)	Konferenční stolek SPODSBJERG Ø67 barva dubu	1 KS	1 KS	1 750,00 CZK	2 750,00 CZK	01-08-2025	17-03-2025
3616931 (11)	Noční stolek ILBRO 1 zásuvka přírodní	4 KS	5 KS	750,00 CZK	999,00 CZK	12-01-2026	27-07-2023
3618390 (11)	TV stolek HASLUND 2 dveře barva světlého dubu	1 KS	2 KS	2 650,00 CZK	3 499,00 CZK		01-10-2021
3618410 (21)	Konferenční stolek HASLUND 60×120 barva světlého dubu	1 KS	2 KS	2 000,00 CZK	2 000,00 CZK	01-08-2025	06-05-2025
3618924 (11)	Noční stolek LIMFJORDEN 2 zásuvky bílá	2 KS	3 KS	900,00 CZK	900,00 CZK		23-04-2021
3618927 (12)	Noční stolek LIMFJORDEN 2 zásuvky barva světlého dubu	3 KS	4 KS	1 150,00 CZK	1 150,00 CZK		03-07-2020
3618928 (11)	Komoda LIMFJORDEN 3+3 zásuvky bílá	3 KS	3 KS	4 000,00 CZK	4 000,00 CZK		14-07-2022
3618930 (11)	Komoda LIMFJORDEN 4 zásuvky bílá	3 KS	4 KS	2 500,00 CZK	2 500,00 CZK		20-07-2020
3618931 (11)	Komoda LIMFJORDEN 4 zásuvky barva světlého dubu	4 KS	4 KS	3 000,00 CZK	3 000,00 CZK		25-05-2020
3620142 (12)	Podložky pod nábytek EGET 100 ks plsť	187 KS	188 KS	65,00 CZK	65,00 CZK		02-09-2022
3620203 (11)	Konferenční stolek KALVEHAVE Ø70 barva divokého dubu	1 KS	2 KS	1 999,00 CZK	1 999,00 CZK		17-07-2025
3620204 (11)	Odkládací stolek KALVEHAVE Ø55 barva divokého dubu	1 KS	2 KS	1 699,00 CZK	1 699,00 CZK		17-07-2025
3620221 (21)	Křeslo HOLMDRUP šedá/dub	3 KS	3 KS	1 800,00 CZK	2 250,00 CZK	01-08-2025	07-05-2025
3620240 (11)	Jídelní židle HYGUM otočná šedá/černá	8 KS	9 KS	1 650,00 CZK	3 299,00 CZK		28-07-2022
3620285 (21)	Jídelní stůl MARSTRAND Ø110/110x200 dub	1 KS	1 KS	9 000,00 CZK	12 999,00 CZK	31-12-9998	27-05-2025
3620320 (41)	Postelový rám MARKSKEL 140×200 dub/bílá	1 KS	2 KS	9 999,00 CZK	9 999,00 CZK		17-01-2023
3620932 (21)	Jídelní židle EJBY bílá	1 KS	2 KS	1 250,00 CZK	1 250,00 CZK	31-12-9998	29-07-2025
3621062 (11)	Psací stůl EVETOFTE 60×125 barva světlého dubu	1 KS	2 KS	2 750,00 CZK	3 499,00 CZK		30-09-2021
3630037 (11)	Konferenční stolek LYDUM Ø60 šedá/béžový vláknocement	1 KS	2 KS	3 000,00 CZK	3 000,00 CZK		24-07-2025
3630042 (11)	Šatní skříň BILLUND 119×193 bílá/beton	2 KS	2 KS	6 499,00 CZK	6 499,00 CZK		18-07-2024
3630045 (11)	Regál VANDBORG 3 police barva dubu/béžová	3 KS	3 KS	1 399,00 CZK	1 399,00 CZK		17-07-2025
3630046 (11)	Regál VANDBORG 5 polic barva dubu/béžová	2 KS	2 KS	1 999,00 CZK	1 999,00 CZK		17-07-2025
3630053 (11)	Vozík NARUP 2 police černá	1 KS	2 KS	1 299,00 CZK	1 299,00 CZK		24-07-2025
3630055 (11)	Věšák HJARUP béžová	7 KS	8 KS	999,00 CZK	999,00 CZK		24-07-2025
3630059 (11)	Nástěnná police KARSTOFT 4 police bílá	5 KS	6 KS	650,00 CZK	650,00 CZK		24-07-2025
3630060 (11)	Konferenční stolek VARDE D80/160 zvedací deska barva tep.dub	1 KS	2 KS	5 499,00 CZK	5 499,00 CZK		17-07-2025
3630065 (11)	Polohovací křeslo s podnožkou TANKEDAL béžový potah/chrom	1 KS	2 KS	5 499,00 CZK	5 499,00 CZK		17-07-2025
3630067 (11)	Polohovací křeslo VEJLBY tmavě šedý potah	2 KS	2 KS	6 499,00 CZK	6 499,00 CZK		17-07-2025
3630068 (11)	Polohovací křeslo VEJLBY světle pískový potah	1 KS	2 KS	5 000,00 CZK	6 499,00 CZK		17-07-2025
3630083 (11)	Regál LINDVED 4 police bílá	1 KS	2 KS	1 999,00 CZK	1 999,00 CZK		31-07-2025
3630084 (11)	Regál LINDVED 6 polic 2 dveře bílá	1 KS	1 KS	2 999,00 CZK	2 999,00 CZK		31-07-2025
3630090 (11)	Taburet ANDST 46x38 olivový plyšový potah	1 KS	2 KS	1 150,00 CZK	1 150,00 CZK	12-01-2027	17-07-2025
3630092 (11)	Herní židle FJELSTED černá koženka/šedá	1 KS	2 KS	4 999,00 CZK	4 999,00 CZK		17-07-2025
3630104 (11)	Odkládací stolek RANDERUP Ø47 bordó	5 KS	6 KS	200,00 CZK	200,00 CZK		24-07-2025
3630108 (11)	Nástěnná police TERP 80x24 bez úchytů barva přírodního dubu	1 KS	3 KS	400,00 CZK	549,00 CZK		24-07-2025
3630109 (12)	Stolička VANDEL stohovací přírodní dub	2 KS	3 KS	1 999,00 CZK	1 999,00 CZK		31-07-2025
3630113 (11)	Taburet HUNDESTED krémový plyš/barva dubu	4 KS	5 KS	1 699,00 CZK	1 699,00 CZK		24-07-2025
3630116 (11)	Děrovaná nástěnka FUNDER 52x42 s doplňky béžová	4 KS	5 KS	550,00 CZK	550,00 CZK		17-07-2025
3630117 (11)	Kancelářská židle NIMTOFTE šedý potah/černá	1 KS	1 KS	1 000,00 CZK	1 000,00 CZK		17-07-2025
3630121 (11)	Polohovací křeslo ABILDSKOV elektrické černá koženka	1 KS	2 KS	6 500,00 CZK	8 499,00 CZK		24-07-2025
3630132 (11)	Psací stůl LIMFJORDEN 60x120 4 zásuvky barva teplého dubu	2 KS	2 KS	4 000,00 CZK	4 000,00 CZK		17-07-2025
3630136 (11)	TV stolek LIMFJORDEN 2 zásuvky 1 dveře teplý dub	1 KS	1 KS	3 750,00 CZK	3 750,00 CZK		24-07-2025
3630137 (11)	TV stolek LIMFJORDEN 2 zásuvky 1 dveře bílá	1 KS	2 KS	3 500,00 CZK	3 500,00 CZK		24-07-2025
3640000 (11)	Jídelní židle TOREBY černá koženka/černá	3 KS	4 KS	500,00 CZK	500,00 CZK		16-08-2024
3640074 (11)	Barová židle JONSTRUP bílá koženka/přírodní barva dubu	3 KS	3 KS	1 699,00 CZK	1 699,00 CZK	12-01-2026	27-09-2024
3640080 (11)	Jídelní židle JONSTRUP šedá/dub	3 KS	7 KS	1 099,00 CZK	1 099,00 CZK		21-08-2024
3640082 (11)	Skříňka DAMHUS se 3 boxy černá/šedá	16 KS	17 KS	350,00 CZK	350,00 CZK		27-09-2022
3640108 (11)	Skládací postel BAJLUM 80×190 antracitově šedá	1 KS	2 KS	2 750,00 CZK	2 750,00 CZK		31-07-2024
3640111 (12)	Skládací postel SYDALS 80×200 světle šedá	1 KS	2 KS	4 500,00 CZK	4 500,00 CZK		12-07-2024
3640126 (11)	Jídelní židle PURHUS šedá/černá	2 KS	4 KS	2 699,00 CZK	2 699,00 CZK		07-10-2024
3640128 (11)	Jídelní židle PURHUS krémová/černá	2 KS	3 KS	1 750,00 CZK	2 699,00 CZK		01-10-2024
3640139 (11)	Jídelní židle JEGIND bílá/přírodní	3 KS	3 KS	1 699,00 CZK	1 699,00 CZK		03-03-2025
3640152 (21)	TV stolek KAGSTRUP 1 police bílá	2 KS	3 KS	650,00 CZK	650,00 CZK	12-01-2026	31-07-2025
3640154 (21)	Jídelní židle KASTRUP černá/dub	4 KS	4 KS	650,00 CZK	750,00 CZK	12-01-2026	19-08-2025
3640169 (11)	Rozkládací pohovka PARADIS světle šedý potah/barva dubu	1 KS	1 KS	6 999,00 CZK	6 999,00 CZK		30-05-2025
3640179 (11)	Odkládací stolek TAPS 55×55 bílá/bambus	2 KS	2 KS	650,00 CZK	650,00 CZK		10-04-2025
3640182 (11)	Herní židle NIBE černá koženka/červená	1 KS	2 KS	3 750,00 CZK	5 999,00 CZK	31-12-9998	26-02-2025
3640183 (11)	Herní židle NIBE černý potah	1 KS	2 KS	5 999,00 CZK	5 999,00 CZK	31-12-9998	30-01-2025
3640184 (11)	Kancelářské židle BILLUM černá	2 KS	2 KS	1 650,00 CZK	3 299,00 CZK	31-12-9998	07-07-2025
3640186 (12)	Rozkládací pohovka s lenoškou HAMPEN šedý potah/barva dubu	1 KS	2 KS	6 500,00 CZK	6 500,00 CZK		23-01-2025
3640187 (11)	Věšák JERSLEV kovový	17 KS	17 KS	175,00 CZK	175,00 CZK	31-12-9998	28-05-2025
3640200 (11)	Křeslo s podnožkou HVILSTED plyš krémová/přírodní	1 KS	2 KS	5 499,00 CZK	5 499,00 CZK		06-11-2024
3640210 (21)	Knihovna HORSENS 5 polic bílá	2 KS	2 KS	1 250,00 CZK	1 250,00 CZK	31-12-9998	02-04-2025
3640211 (21)	Knihovna HORSENS 5 polic široká světlý dub	1 KS	2 KS	1 500,00 CZK	1 500,00 CZK	31-12-9998	28-07-2025
3640222 (11)	Křeslo HUNDESTED krémový potah plyš/přírodní barva dubu	2 KS	2 KS	4 999,00 CZK	4 999,00 CZK		16-06-2025
3640224 (11)	Křeslo HUNDESTED zelený manšestr/přírodní barva dubu	2 KS	2 KS	2 500,00 CZK	4 999,00 CZK	31-12-9998	20-03-2025
3640234 (11)	Věšák JENNET s policí na boty přírodní/černá	2 KS	2 KS	1 750,00 CZK	1 750,00 CZK		20-06-2025
3640243 (11)	Jídelní židle BISTRUP písková/dub	4 KS	6 KS	850,00 CZK	1 699,00 CZK		11-06-2025
3640253 (11)	Barová židle TAULOV béžový potah/chrom	2 KS	3 KS	1 999,00 CZK	1 999,00 CZK		31-07-2025
3640273 (11)	Jídelní židle EJSING béžový potah/barva dubu	1 KS	2 KS	1 500,00 CZK	2 499,00 CZK		31-07-2025
3640287 (11)	Jídelní židle ROSTRUP otočná černá	1 KS	2 KS	3 299,00 CZK	3 299,00 CZK		17-07-2025
3640293 (41)	Jídelní židle JONSTRUP krémový plyšový potah/barva dubu	3 KS	4 KS	1 699,00 CZK	1 699,00 CZK		31-07-2025
3640302 (11)	Jídelní židle BRANDE béžový potah	7 KS	8 KS	999,00 CZK	999,00 CZK		31-07-2025
3640313 (41)	Nástěnka MOSEBY 50x70 5 špendlíků béžová/dub	2 KS	3 KS	650,00 CZK	650,00 CZK	31-12-9998	31-07-2025
3640323 (11)	Jídelní stůl JUNGEN 80x80/160 barva teplého dubu	1 KS	2 KS	3 000,00 CZK	4 499,00 CZK		31-07-2025
3640328 (11)	Příborník LIMFJORDEN 2 dveře 3 zásuvky teplý dub	1 KS	2 KS	5 500,00 CZK	5 500,00 CZK		31-07-2025
3640329 (11)	Příborník LIMFJORDEN 2 dveře 3 zásuvky bílá	1 KS	2 KS	5 000,00 CZK	5 000,00 CZK		31-07-2025
3640337 (11)	Knihovna MOSBJERG 10 polic barva divokého přírodního dubu	2 KS	2 KS	2 000,00 CZK	2 799,00 CZK		15-04-2025
3640338 (11)	Knihovna MOSBJERG 10 polic bílá	1 KS	2 KS	2 499,00 CZK	2 499,00 CZK		14-04-2025
3648460 (11)	Jídelní židle BAKKELY tmavě hnědá	1 KS	3 KS	1 999,00 CZK	1 999,00 CZK	31-07-2026	20-11-2020
3650009 (11)	Lavice KAPPEL s úložným prostorem světle pískový potah	2 KS	3 KS	2 750,00 CZK	3 699,00 CZK		01-08-2024
3650012 (11)	Lavice ESKELUND přírodní	2 KS	3 KS	1 500,00 CZK	2 199,00 CZK	12-01-2026	18-07-2024
3650015 (11)	Psací stůl LINDVED 48×120 2 zásuvky barva dubu	1 KS	2 KS	2 699,00 CZK	2 699,00 CZK		01-08-2024
3650016 (11)	Konferenční stolek NYBO Ø70 barva teplého dubu/černá	2 KS	3 KS	600,00 CZK	600,00 CZK	31-12-9998	01-08-2024
3650030 (11)	Odkládací stolek RANDERUP Ø47 světlá písková	13 KS	14 KS	200,00 CZK	200,00 CZK		25-07-2024
3650031 (11)	Konferenční stolek KILDEDAL 60×60 barva travertinu	3 KS	4 KS	600,00 CZK	799,00 CZK	31-07-2026	25-07-2024
3650037 (11)	Konferenční stolek LYNGVIG 60×110 s policí dub	2 KS	3 KS	4 000,00 CZK	5 499,00 CZK		24-07-2025
3650040 (11)	Kancelářská židle MARBJERG šedá/černá koženka	2 KS	3 KS	4 999,00 CZK	4 999,00 CZK		11-07-2025
3650042 (11)	Regál ASTRUP 4 police černá	7 KS	7 KS	550,00 CZK	550,00 CZK		18-07-2024
3650043 (11)	Regál ASTRUP 6 polic černá	2 KS	3 KS	850,00 CZK	850,00 CZK		01-08-2024
3650044 (11)	Psací stůl ASTRUP 60×120 černá	1 KS	2 KS	1 000,00 CZK	1 000,00 CZK		18-07-2024
3650045 (11)	Psací stůl ASTRUP 40×60 černá	1 KS	1 KS	500,00 CZK	500,00 CZK		18-07-2024
3650047 (11)	Botník BORNHOLM 1 police stohovací černá	54 KS	55 KS	60,00 CZK	60,00 CZK		18-07-2024
3650048 (11)	Nástěnná police BORUM 4 police barva přírodního dubu	2 KS	3 KS	650,00 CZK	650,00 CZK		05-09-2024
3650049 (11)	Kancelářská židle VARPELEV černá síťovina/černá	2 KS	3 KS	6 000,00 CZK	7 999,00 CZK		18-07-2024
3650063 (11)	Sada stolků MUNKEBO Ø55/Ø45 barva dubu 2 ks	2 KS	3 KS	1 199,00 CZK	1 199,00 CZK		25-07-2024
3650067 (11)	Regál LINDVED 6 polic barva přírodního dubu	1 KS	3 KS	3 299,00 CZK	3 299,00 CZK		15-09-2024
3650068 (11)	Regál LINDVED 4 police barva přírodního dubu	4 KS	4 KS	2 199,00 CZK	2 199,00 CZK		01-08-2024
3650069 (11)	Zásuvkový díl KLINTHOLM 3 zásuvky bílá	1 KS	2 KS	1 750,00 CZK	1 750,00 CZK		27-08-2024
3650070 (11)	Zásuvkový díl KLINTHOLM 3 zásuvky černá	2 KS	3 KS	1 750,00 CZK	1 750,00 CZK		13-08-2024
3650075 (11)	Taburet AUNING 38x38 s úložným prostorem samet tmavě písková	5 KS	6 KS	200,00 CZK	200,00 CZK		01-08-2024
3650076 (11)	Taburet AUNING 76x38 s úložným prostorem samet tmavě písková	4 KS	5 KS	400,00 CZK	400,00 CZK		01-08-2024
3650079 (11)	Taburet NYSTED 38x38 s úložným prostorem plyš krémová	4 KS	5 KS	350,00 CZK	350,00 CZK		10-02-2025
3650080 (12)	Taburet NYSTED 76x38 s úložným prostorem plyš krémová	4 KS	5 KS	700,00 CZK	700,00 CZK		10-02-2025
3650085 (11)	Křeslo UDSBJERG potah béžová/dub	4 KS	5 KS	3 699,00 CZK	3 699,00 CZK		25-07-2024
3650087 (11)	Konferenční stolek ROLSTED 58×58/50×50 barva travertinu 2 ks	1 KS	2 KS	2 500,00 CZK	3 699,00 CZK	12-01-2026	05-09-2024
3650097 (11)	Nástěnná police ALLESTED 2 police bílá/divoký přírodní dub	2 KS	3 KS	699,00 CZK
`;

export const useArticles = () => {
  const { userStoreId, isAdmin, user } = useAuth();
  const { addLogEntry } = useLog();
  const { shelfRacks } = useShelfRacks(); // Use the shelfRacks hook

  const [articles, setArticles] = useState<Article[]>(() => {
    const storedArticles = localStorage.getItem("articles");
    if (storedArticles) {
      return JSON.parse(storedArticles);
    } else {
      // Assign initial articles to a default store and rack for demonstration
      const parsedArticles: Article[] = [];
      const lines = rawArticleData.trim().split('\n');
      lines.forEach(line => {
        const match = line.match(/^(\d+) \((\d+)\)\s+(.+?)\s+(\d+)\s+KS/); // Capture quantity
        if (match) {
          const id = match[1];
          const status = match[2];
          const name = match[3].trim();
          const quantity = parseInt(match[4], 10);

          // Assign to a default rack (e.g., "A-1" in "Sklad 1")
          const defaultRack = shelfRacks.find(r => r.id === "A-1" && r.storeId === "Sklad 1");
          if (defaultRack && defaultRack.shelves.length > 0) {
            const randomShelf = defaultRack.shelves[Math.floor(Math.random() * defaultRack.shelves.length)];
            parsedArticles.push({
              id,
              name,
              status,
              quantity,
              rackId: defaultRack.id,
              shelfNumber: randomShelf.shelfNumber,
              storeId: defaultRack.storeId,
            });
          } else {
            // Fallback if default rack not found or has no shelves
            parsedArticles.push({
              id,
              name,
              status,
              quantity,
              rackId: "N/A",
              shelfNumber: "N/A",
              storeId: "Sklad 1", // Assign to a default store
            });
          }
        }
      });
      return parsedArticles;
    }
  });

  useEffect(() => {
    localStorage.setItem("articles", JSON.stringify(articles));
  }, [articles]);

  const filteredArticles = isAdmin
    ? articles
    : articles.filter((article) => article.storeId === userStoreId);

  const getArticleById = (id: string, storeId?: string) => {
    if (storeId) {
      return articles.find((article) => article.id === id && article.storeId === storeId);
    }
    return filteredArticles.find((article) => article.id === id);
  };

  const addArticle = (newArticle: Article) => {
    setArticles((prev) => [...prev, newArticle]);
    addLogEntry("Článek přidán", { articleId: newArticle.id, name: newArticle.name, rackId: newArticle.rackId, shelfNumber: newArticle.shelfNumber, storeId: newArticle.storeId, quantity: newArticle.quantity }, user?.username);
  };

  const updateArticle = (updatedArticle: Article) => {
    setArticles((prev) =>
      prev.map((article) => (article.id === updatedArticle.id && article.storeId === updatedArticle.storeId ? updatedArticle : article))
    );
    addLogEntry("Článek aktualizován", { articleId: updatedArticle.id, name: updatedArticle.name, rackId: updatedArticle.rackId, shelfNumber: updatedArticle.shelfNumber, storeId: updatedArticle.storeId, quantity: updatedArticle.quantity }, user?.username);
  };

  const deleteArticle = (id: string, storeId: string) => {
    setArticles((prev) => prev.filter((article) => !(article.id === id && article.storeId === storeId)));
    addLogEntry("Článek smazán", { articleId: id, storeId }, user?.username);
  };

  const getArticlesByStoreId = (storeId: string) => {
    return articles.filter(article => article.storeId === storeId);
  };

  return { articles: filteredArticles, allArticles: articles, getArticleById, addArticle, updateArticle, deleteArticle, getArticlesByStoreId };
};