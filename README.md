# 1stMil — Lokalny Agent SMS / iPhone (v2)

Gotowa responsywna aplikacja HTML/CSS/JavaScript. Działa bez abonamentu, API SMS oraz aplikacji Skróty. Otwiera **systemową aplikację Wiadomości** na Twoim iPhonie z numerem i — jeśli iOS obsłuży parametr — wstępnie uzupełnioną treścią. **Sama nie wysyła SMS-ów.** Każdą wiadomość zatwierdzasz na telefonie.

## Co działa

- Szukanie firm według branży i obszaru: Szczecin, Police, Stargard, Goleniów, Gryfino, Dobra i okolice. Źródło: OpenStreetMap / publiczne API Overpass. Zależnie od danych w OSM firma może nie mieć numeru lub strony.
- Przycisk **„Wybierz do 10 firm z telefonem”** — pobiera z aktualnego wyniku maksymalnie 10 kandydatów, preferując rekordy bez adresu strony w OSM; to **nie jest** audyt ich stron ani potwierdzenie, że numery są komórkowe/aktualne. Sprawdź każdego kandydata.
- Lokalna baza kontaktów, notatki i statusy, import/eksport CSV.
- Twój uzgodniony, lekko humorystyczny szablon SMS z podpisem „Krystian”. Treść można edytować indywidualnie.
- Rejestr wcześniejszych zgód na **marketing SMS**: data + źródło. **Przycisk otwierania SMS jest niedostępny bez tej zgody.** Samo zaznaczenie checkboxu nie jest uzyskaniem zgody.
- Przycisk **„Nie kontaktować”** i osobna kolejka **„iPhone SMS”**, w której pojawiają się tylko kontakty ze zgodą, numerem i bez statusu wysyłki / sprzeciwu.
- Test SMS na własny numer telefonu.
- Wysyłka ze zwykłego numeru SIM/iMessage użytkownika, bez zewnętrznej bramki. To operator/Apple decyduje o kanale dostarczenia wiadomości.

## Najprostsze uruchomienie na iPhonie

1. Rozpakuj plik ZIP na komputerze.
2. Wgraj do repozytorium GitHub trzy pliki **`index.html`, `style.css`, `app.js`** (nie wgrywaj kontaktów ani prywatnych plików CSV). W GitHub repozytorium wejdź w **Settings → Pages → Build and deployment → Deploy from a branch**, wybierz `main` i `/ (root)` → Save.
3. Otwórz adres witryny GitHub Pages w Safari na iPhonie. W Safari można wybrać **Udostępnij → Dodaj do ekranu początkowego**.
4. W zakładce **Ustawienia** wpisz swoje imię, numer telefonu i ewentualnie portfolio.
5. W zakładce **iPhone SMS** kliknij **„Wypróbuj SMS na własny numer”**. Sprawdź, czy w aplikacji Wiadomości pojawia się zarówno numer, jak i treść. To test wymagający Twojego ręcznego wysłania.
6. Wyszukaj firmy, dodaj kandydatów. Po uzyskaniu ich faktycznej zgody marketingowej wpisz ją do karty kontaktu (z datą i źródłem). Wtedy trafią do kolejki **iPhone SMS**.
7. Kliknij **„Przygotuj SMS” → „Otwórz w Wiadomościach”**, zweryfikuj numer i tekst, następnie samodzielnie naciśnij **Wyślij**. Po powrocie do panelu oznacz jako wysłany.

### Jeśli treść nie uzupełni się sama

Oficjalna dokumentacja Apple dla `sms:` gwarantuje tylko otwarcie Wiadomości z numerem. W praktyce niektóre wersje iOS obsługują też parametr `&body=`, ale nie jest to gwarancja. Skorzystaj z przycisku **„Kopiuj + otwórz numer”** i wklej skopiowany tekst w oknie wiadomości, albo oddzielnie z **„Kopiuj wiadomość”**. Jeśli przeglądarka nie obsłuży linku SMS, aplikacja niczego nie wyśle.

## Import i przenoszenie danych pomiędzy komputerem a iPhonem

Dane są zapisane w `localStorage` **na konkretnym urządzeniu i w konkretnej przeglądarce**. Nie ma chmurowej synchronizacji. Na komputerze naciśnij **Eksport**, prześlij pobrany plik CSV na iPhone’a przez AirDrop / iCloud Drive i wykonaj **Import CSV** w panelu na telefonie. Nie publikuj pliku CSV w GitHub Pages. Eksport jest też kopią zapasową.

## Ważne ograniczenia i prawo

- **Art. 398 ust. 1 Prawa komunikacji elektronicznej**: przed wysłaniem niezamówionej marketingowej oferty SMS (również B2B) co do zasady wymagana jest uprzednia zgoda odbiorcy. Publiczny numer telefonu na stronie lub w OSM nie jest zgodą. Nie obchodź tego wysyłając „prośbę o zgodę” jako marketingowy SMS. Po sprzeciwie nie wysyłaj dalszych ofert.
- Aplikacja **nie dostarcza** automatycznie zgód, nie sprawdza rzeczywistych stron firm ani stanu numerów; wpis w OSM trzeba zweryfikować ręcznie.
- Na konto Google/GitHub nie przenoszą się lokalne dane przeglądarki — przechowuj kopie CSV w bezpiecznym miejscu.
- Aplikacja nie potrafi ustalić, czy SMS faktycznie został wysłany, doręczony, odczytany lub czy klient odpowiedział. Status „wysłany” zatwierdzasz ręcznie.
- Serwer Overpass może być przeciążony lub ograniczać żądania. Jeśli wyszukiwanie jest niedostępne, możesz dodać kontakt ręcznie.
- Źródło danych: © współtwórcy OpenStreetMap, ODbL: https://www.openstreetmap.org/copyright
- Linki do źródeł: prawo: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001221 ; Apple SMS: https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/SMSLinks/SMSLinks.html

## Czego nie ma w v2

Nie ma automatycznej wysyłki SMS, bota operującego na telefonie ani integracji ze Skrótami. To półautomat do wyszukiwania, kwalifikacji i przygotowywania pojedynczych wiadomości. Nie trzeba instalować Pythona ani podłączać bramki SMS.
