# StayFinder – kriterier och plan

Betygsgrundande uppgift, IG/G/VG, avslutas med muntlig kodgenomgång.
Inlämning: 4 november 2026. Muntlig genomgång: 5 november 2026.

> Kod som jag inte kan förklara vid den muntliga genomgången räknas inte som uppfylld.

## Mål

- bygga ett API som skyddar data och följer tydliga regler
- använda inloggning och behörighet både i API:t och i databasen
- bygga en frontend som hämtar, visar och skickar data till API:t
- välja var logik ska ligga: frontend, API eller databas
- förklara och motivera min egen kod

## Krav för G (alla ska vara uppfyllda)

| # | Kriterium | Fas | Klar |
|---|---|---|---|
| G1 | En besökare kan skapa ett konto, logga in och logga ut. | 5 (API), 10 (UI) | ⬜ |
| G2 | Inloggningen finns kvar när sidan laddas om, och appen kan alltid visa vem som är inloggad. | 5 (API), 10 (UI) | ⬜ |
| G3 | Navigeringen visar olika innehåll för en inloggad användare och en utloggad besökare. | 10 | ⬜ |
| G4 | Alla kan se en lista över boenden och en detaljsida för varje boende. | 2–4 (API), 9 (UI) | ⬜ |
| G5 | Listan kan filtreras på plats, maxpris och antal gäster. | 7 (API), 11 (UI) | ⬜ |
| G6 | Bara inloggade användare kan skapa, ändra och ta bort boenden. Både i API:t och i databasen. | 6 | ⬜ |
| G7 | En inloggad användare kan skapa ett nytt boende via ett formulär i frontenden. | 11 | ⬜ |
| G8 | Listan kan sorteras på pris, stigande eller fallande. Sorteringen görs i backend. | 7 (API), 11 (UI) | ⬜ |
| G9 | En inloggad användare kan boka ett boende från detaljsidan. En utloggad besökare uppmanas att logga in. | 8 (API), 11 (UI) | ⬜ |
| G10 | En bokning med ogiltiga uppgifter nekas (t.ex. ogiltig e-post, noll gäster, incheckning efter utcheckning). Felet visas begripligt i formuläret. | 3 + 8 (API), 11 (UI) | ⬜ |
| G11 | Bokningsformuläret visar antal nätter och totalpris innan användaren bokar. | 11 | ⬜ |
| G12 | En inloggad användare kan se, ändra och ta bort bokningar för ett boende. | 8 (API), 11 (UI) | ⬜ |
| G13 | Appen visar en laddningsvy och en felvy när data hämtas, och en egen sida när ett boende inte finns. | 9 | ⬜ |
| G14 | API:t svarar med rätt statuskod: lyckat (200), skapat (201), ogiltig data (400), ej inloggad (401), saknas (404). | 2–8 | ⬜ |
| G15 | Databasen skyddar själv sina tabeller med behörighetsregler (RLS). Det räcker inte att bara API:t skyddar dem. | 6 | ⬜ |
| G16 | All data är typad i både backend och frontend. | alla | ⬜ |

## Krav för VG (alla G + minst fyra av VG1–VG7)

Alla regler ska gälla i API:t **och** databasen, även när någon anropar API:t direkt.
Vid genomgången: motivera var varje regel ligger (API, databas eller båda), varför, och vilka fall jag har testat.

| # | Kriterium | Fas | Vald | Klar |
|---|---|---|---|---|
| VG1 | Ägarskap. Boende tillhör skaparen, bokning tillhör bokaren. Bara ägaren kan ändra/ta bort sitt boende. Gäst ser bara sina bokningar, ägaren ser alla bokningar för sitt boende. Databasen ska garantera detta. | 6 + 8 | ✅ | ⬜ |
| VG2 | Inga dubbelbokningar. Överlappande datum med en icke avbokad bokning nekas, både vid skapande och ändring. En ändrad bokning krockar inte med sig själv. Eget, tydligt fel. | 8 | ✅ | ⬜ |
| VG3 | Kapacitet. Antal gäster ≤ boendets maxantal, utifrån databasens aktuella uppgifter, inte klientens. | 8 | ✅ | ⬜ |
| VG4 | Statusflöde med roller. Bara ägaren kan bekräfta. Gäst och ägare kan avboka. väntande → bekräftad/avbokad, bekräftad → avbokad, avbokad kan inte ändras. Otillåtna ändringar nekas tydligt. | 8 | ⬜ | ⬜ |
| VG5 | Tidsregler. Passerat incheckningsdatum nekas. En bokning vars incheckning har passerat kan inte ändras eller avbokas. | 8 | reserv | ⬜ |
| VG6 | Pris räknas på servern. Totalpris = nätter × boendets pris, sparas på bokningen. Klientens pris ignoreras. Senare prisändring påverkar inte befintliga bokningar. | 8 | ✅ | ⬜ |
| VG7 | Sökning på lediga datum. API:t returnerar boenden lediga under en period, kombinerbart med G5 och G8. Ogiltiga perioder nekas. | 7–8 | ⬜ | ⬜ |

## Testade fall

Fylls i under arbetet (används vid muntliga genomgången).
