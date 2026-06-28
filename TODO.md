# Elits Platform - TODO & Roadmap

## ✅ Dokončano

### Verzija 0.2.0
- ✅ Home Assistant integracija (iframe z reverse proxy)
- ✅ Kiosk-mode za skrivanje HA sidebar
- ✅ HACS nameščen
- ✅ Modularna arhitektura (registry sistem)
- ✅ Apps stran z nameščenimi addon-i
- ✅ App Store (GitHub integration)
- ✅ Addon details z logi
- ✅ System monitoring (Hardware, GPU, Updates, Logs, Backups, Storage)
- ✅ Elits Supervisor API
- ✅ Elits Observer API
- ✅ Docker kontejnerji z restart policy

### Verzija 0.1.0
- ✅ Osnovna WebUI struktura
- ✅ Sidebar navigacija
- ✅ Settings menu
- ✅ Basic routing

---

## 🔄 V delu

### Verzija 0.3.0 (Next)
- [ ] Notifications sistem
- [ ] User Profile stran
- [ ] Dashboards urejevalnik
- [ ] Developer Tools
- [ ] About stran
- [ ] Boljši error handling
- [ ] Loading states izboljšave

---

## 📋 Načrti

### Verzija 0.4.0
- [ ] Backup/Restore sistem
- [ ] Monitoring dashboard z grafikon
- [ ] Log aggregation
- [ ] Alerting sistem
- [ ] Responsive design za mobilne

### Verzija 0.5.0
- [ ] Hermes AI integracija (glasovni asistent)
- [ ] Avtomatizacije (vizualni urejevalnik)
- [ ] Scene management
- [ ] AI-powered insights

### Verzija 0.6.0
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Offline mode
- [ ] QR code scanner

### Verzija 0.7.0
- [ ] Multi-user support
- [ ] Role-based access control
- [ ] Audit logging
- [ ] SSO integracija
- [ ] API rate limiting

---

## 🐛 Tehnični dolg

### Kritično
- [ ] Observer endpointi - nekateri vračajo prazne odgovore
- [ ] Supervisor API - manjkajoči endpointi (addon konfiguracija)
- [ ] Error handling - boljša obdelava napak

### Srednje
- [ ] Loading states - boljši indikatorji
- [ ] Responsive design - optimizacija za mobilne
- [ ] API dokumentacija

### Nizko prioriteta
- [ ] Unit testi za backend
- [ ] Integration testi za frontend
- [ ] User guide dokumentacija

---

## 📝 Changelog

### 0.2.0 (2026-06-24)
- Dodan registry sistem za modularnost
- Integracija Home Assistant preko iframe
- Apps stran z addon management
- System monitoring z GPU support
- Addon logs funkcionalnost
- HACS integracija

### 0.1.0 (2026-06-22)
- Initial release
- Osnovna WebUI struktura
- Basic routing in navigacija

---

## 📦 AiStoragE Addon - TODO & Roadmap

### 🎯 Opis projekta
AI-powered skladišče elektronskih komponent z avtomatskim prepoznavanjem komponent iz slik.
Integracija s Hermes AI za inteligentno upravljanje skladišča.
**NI sistemski addon** - Elits Platform ni odvisen od njega.

**Repozitorij:** https://github.com/lpt2007/elits-platform-addons

---

### ✅ Faza 1: Arhitektura in baza podatkov (Teden 1-2)

#### 1.1 Struktura projekta
- [ ] Ustvari addon strukturo: `/addons-official/aistorage/`
- [ ] Dockerfile za AiStoragE addon
- [ ] config.json z nastavitvami
- [ ] requirements.txt (Python dependencies)
- [ ] docker-compose.yml za lokalni razvoj

#### 1.2 Baza podatkov (PostgreSQL)
- [ ] Ustvari bazo `aistorage_db`
- [ ] Tabela `categories` (Namizni, Prenosni, Serverji, Tablice, Mobilni)
- [ ] Tabela `subcategories` (Celotni sistemi, Sestavni deli)
- [ ] Tabela `components` (glavna tabela za vse komponente)
  - [ ] `id` (UUID)
  - [ ] `internal_number` (notranja številka)
  - [ ] `product_number`
  - [ ] `part_number`
  - [ ] `serial_number`
  - [ ] `manufacture_year`
  - [ ] `description`
  - [ ] `notes`
  - [ ] `category_id` (FK)
  - [ ] `subcategory_id` (FK)
  - [ ] `created_at`, `updated_at`
- [ ] Tabela `component_images` (slike komponent)
  - [ ] `id` (UUID)
  - [ ] `component_id` (FK)
  - [ ] `image_path`
  - [ ] `image_name`
  - [ ] `is_primary` (boolean)
  - [ ] `created_at`
- [ ] Tabela `compatibility` (kompatibilnost med komponentami)
  - [ ] `id` (UUID)
  - [ ] `component_id` (FK)
  - [ ] `compatible_with_id` (FK)
  - [ ] `compatibility_type` (optional)
- [ ] Tabela `search_tags` (iskalni nizi)
  - [ ] `id` (UUID)
  - [ ] `component_id` (FK)
  - [ ] `tag` (text)
  - [ ] `tag_type` (npr. "model", "brand", "spec")

#### 1.3 File storage
- [ ] Ustvari direktorij `/data/elits/aistorage/images/`
- [ ] Organizacija slik po kategorijah in letih
- [ ] Thumbnail generator za hitrejše prikazovanje
- [ ] Backup strategija za slike

---

### ✅ Faza 2: Backend API (Teden 2-3)

#### 2.1 REST API (FastAPI)
- [ ] `/api/components` - CRUD operacije za komponente
  - [ ] GET `/api/components` - seznam vseh komponent (s filtriranjem)
  - [ ] GET `/api/components/{id}` - podrobnosti komponente
  - [ ] POST `/api/components` - dodaj novo komponento
  - [ ] PUT `/api/components/{id}` - posodobi komponento
  - [ ] DELETE `/api/components/{id}` - izbriši komponento
- [ ] `/api/categories` - upravljanje kategorij
- [ ] `/api/subcategories` - upravljanje podkategorij
- [ ] `/api/images` - upravljanje slik
  - [ ] POST `/api/images/upload` - naloži sliko
  - [ ] GET `/api/images/{component_id}` - slike komponente
  - [ ] DELETE `/api/images/{id}` - izbriši sliko
- [ ] `/api/compatibility` - upravljanje kompatibilnosti
- [ ] `/api/search` - napredno iskanje
  - [ ] GET `/api/search?q={query}` - iskanje po vseh poljih
  - [ ] GET `/api/search/advanced` - napredno iskanje z filtri

#### 2.2 Database layer
- [ ] SQLAlchemy modeli za vse tabele
- [ ] Database migrations (Alembic)
- [ ] Connection pooling
- [ ] Error handling in logging

#### 2.3 Authentication & Authorization
- [ ] Integracija z Elits Supervisor za avtentikacijo
- [ ] Role-based access (admin, user, viewer)
- [ ] API key management za zunanje sisteme

---

### ✅ Faza 3: AI integracija - Hermes Agent (Teden 3-4)

#### 3.1 File watcher za novo dodane slike
- [ ] Monitor mapo `\\192.168.0.199\Public\hermes_agent\data\storage\new_components`
- [ ] Uporabi `watchdog` library za real-time monitoring
- [ ] Ko se pojavi nova slika:
  - [ ] Preveri format (JPEG, PNG, WebP)
  - [ ] Generiraj thumbnail
  - [ ] Pošlji na AI za obdelavo

#### 3.2 AI obdelava slik (Hermes Vision)
- [ ] Integracija z Hermes AI vision capabilities
- [ ] Prepoznavanje komponent iz slike:
  - [ ] Tip komponente (CPU, RAM, GPU, motherboard, itd.)
  - [ ] Proizvajalec (Intel, AMD, NVIDIA, itd.)
  - [ ] Model (če je vidno)
  - [ ] Serial number (če je berljiv)
  - [ ] Stanje komponente (novo, rabljeno, poškodovano)
- [ ] Avtomatsko generiranje:
  - [ ] Notranja številka (unikatna)
  - [ ] Kategorija in podkategorija
  - [ ] Iskalni nizi (tags)
  - [ ] Opis komponente

#### 3.3 Avtomatsko shranjevanje
- [ ] Premesti sliko iz `new_components` v pravo mapo
- [ ] Preimenuj sliko v smiselno ime (npr. `intel_core_i7_10700k_2024.jpg`)
- [ ] Vpiši vse podatke v bazo
- [ ] Generiraj iskalne nize
- [ ] Pošlji notification uporabniku (če je omogočeno)

#### 3.4 AI chat integracija
- [ ] WebSocket povezava s Hermes AI
- [ ] AI chat v WebUI za pomoč pri upravljanju
- [ ] Primeri vprašanj:
  - [ ] "Imam v skladišču RAM za Dell Latitude 5520?"
  - [ ] "Pokaži mi vse komponente za HP EliteBook 840 G5"
  - [ ] "Kateri CPU je kompatibilen s to motherboard?"
  - [ ] "Dodaj novo komponento: Intel i5-12400"

---

### ✅ Faza 4: WebUI vmesnik (Teden 4-6)

#### 4.1 Registracija v Elits Platform
- [ ] Dodaj AiStoragE v registry: `/settings/apps/aistorage`
- [ ] Ustvari WebUI komponente:
  - [ ] `AiStorage.jsx` - glavna stran
  - [ ] `ComponentList.jsx` - seznam komponent
  - [ ] `ComponentDetails.jsx` - podrobnosti komponente
  - [ ] `ComponentForm.jsx` - dodajanje/urejanje
  - [ ] `CategoryManager.jsx` - upravljanje kategorij
  - [ ] `SearchPage.jsx` - napredno iskanje
  - [ ] `AIChat.jsx` - AI chat vmesnik

#### 4.2 Glavne funkcionalnosti WebUI
- [ ] Dashboard s statistiko:
  - [ ] Število komponent po kategorijah
  - [ ] Nedavno dodane komponente
  - [ ] AI obdelane slike (danes, teden, mesec)
- [ ] Seznam komponent:
  - [ ] Grid/List view
  - [ ] Filtriranje po kategorijah
  - [ ] Iskanje po vseh poljih
  - [ ] Sortiranje (datum, ime, kategorija)
- [ ] Podrobnosti komponente:
  - [ ] Galerija slik (carousel)
  - [ ] Vsi podatki (product number, serial, itd.)
  - [ ] Kompatibilnost (seznam kompatibilnih sistemov)
  - [ ] Iskalni nizi (tags)
  - [ ] Zgodovina sprememb
- [ ] Dodajanje/urejanje komponente:
  - [ ] Form z vsemi polji
  - [ ] Upload slik (drag & drop)
  - [ ] Avtomatsko predlaganje kategorije
  - [ ] AI pomoč pri vnosu podatkov
- [ ] Napredno iskanje:
  - [ ] Multi-field search
  - [ ] Filtri (kategorija, letnica, proizvajalec)
  - [ ] Shranjeni iskalni nizi
  - [ ] Export rezultatov (CSV, PDF)

#### 4.3 AI Chat vmesnik
- [ ] Chat okno v desnem kotu (kot chatbot)
- [ ] Glasovni vnos (optional)
- [ ] Predlogi vprašanj
- [ ] AI odgovori z linki na komponente
- [ ] Zgodovina pogovorov

---

### ✅ Faza 5: Napredne funkcionalnosti (Teden 6-8)

#### 5.1 QR kode in črtne kode
- [ ] Generiranje QR kod za vsako komponento
- [ ] Tiskanje QR kod (A4, nalepke)
- [ ] Skeniranje QR kod z mobilno aplikacijo
- [ ] Avtomatsko prikazovanje komponente po skeniranju

#### 5.2 Izvoz in uvoz podatkov
- [ ] Export v CSV, JSON, PDF
- [ ] Import iz CSV, Excel
- [ ] Backup celotne baze
- [ ] Restore iz backupa

#### 5.3 Statistika in poročila
- [ ] Grafi komponent po kategorijah
- [ ] Starost komponent (povprečna, max, min)
- [ ] Najpogostejši proizvajalci
- [ ] Kompatibilnost matrix (kateri deli gredo v kateri sistem)
- [ ] AI obdelava statistika (uspešnost prepoznavanja)

#### 5.4 Integracije z zunanjimi sistemi
- [ ] API za povezavo z drugimi sistemi
- [ ] Webhook za notificacije
- [ ] Integracija z dobavitelji (avtomatsko pridobivanje podatkov)
- [ ] Povezava z eBay/Amazon za cene (optional)

#### 5.5 Multi-user support
- [ ] Uporabniški profili
- [ ] Role-based permissions
- [ ] Zgodovina sprememb (kdo je kaj spremenil)
- [ ] Komentarji na komponentah

---

### 🚀 Predlogi za razširitve (Future Enhancements)

#### 🎯 Modularna arhitektura
- [ ] Plugin sistem za dodajanje novih kategorij brez spremembe kode
- [ ] Custom fields za specifične potrebe
- [ ] API marketplace za third-party integracije

#### 🤖 AI nadgradnje
- [ ] Avtomatsko prepoznavanje napak na komponentah
- [ ] Predlaganje kompatibilnosti na podlagi zgodovine
- [ ] Optimalna cena komponent (AI analiza trga)
- [ ] Predvidevanje življenjske dobe komponent

#### 📱 Mobilna aplikacija
- [ ] React Native app za Android/iOS
- [ ] Skeniranje QR kod
- [ ] Fotografiranje in avtomatsko dodajanje
- [ ] Offline mode z sinhronizacijo

#### 🔗 Povezave z drugimi sistemi
- [ ] Integracija z Home Assistant (prikaz komponent v dashboardu)
- [ ] Povezava z inventory sistemi
- [ ] ERP integracija za podjetja
- [ ] IoT senzori za monitoring skladišča (temperatura, vlaga)

#### 📊 Napredna analitika
- [ ] Predictive maintenance (kdaj bo komponenta odpovedala)
- [ ] Optimizacija skladišča (kateri deli se redko uporabljajo)
- [ ] Cost analysis (kateri deli so najbolj ekonomični)
- [ ] Environmental impact (CO2 footprint)

#### 🎨 UX/UI izboljšave
- [ ] 3D pregled komponent (WebGL)
- [ ] AR (Augmented Reality) za prikaz komponent v prostoru
- [ ] Voice commands za upravljanje
- [ ] Dark/Light mode

---

### 📅 Timeline

| Faza | Trajanje | Status |
|------|----------|--------|
| Faza 1: Arhitektura in baza | Teden 1-2 | ⏳ Čaka |
| Faza 2: Backend API | Teden 2-3 | ⏳ Čaka |
| Faza 3: AI integracija | Teden 3-4 | ⏳ Čaka |
| Faza 4: WebUI | Teden 4-6 | ⏳ Čaka |
| Faza 5: Napredne funkcionalnosti | Teden 6-8 | ⏳ Čaka |

**Skupaj: ~8 tednov**

---

### 🔧 Tehnični stack

#### Backend
- **Python 3.11** + **FastAPI**
- **PostgreSQL** (baza podatkov)
- **SQLAlchemy** (ORM)
- **Alembic** (migrations)
- **Watchdog** (file monitoring)
- **Pillow** (image processing)

#### AI
- **Hermes AI Agent** (vision capabilities)
- **OpenCV** (computer vision)
- **YOLO** (object detection - optional)

#### Frontend
- **React** + **Vite**
- **Mantine UI** (komponente)
- **React Query** (data fetching)
- **Socket.io** (real-time updates)

#### Infrastructure
- **Docker** kontejner
- **Nginx** reverse proxy
- **SMB/CIFS** za file sharing

---

### 📝 Opombe

- Vsaka sprememba poveča verzijo za 0.01 (npr. 0.2.3 → 0.2.4)
- Vsa koda mora biti modularna in razširljiva
- AI (Hermes) mora biti vedno dostopen v WebUI
- Sistem mora podpirati ročno in avtomatsko upravljanje
- Varnost: vse slike in podatki morajo biti zaščiteni
- **AiStoragE NI sistemski addon** - Elits Platform ni odvisen od njega

---

### 🎯 Prvi koraki

1. Ustvari addon strukturo v elits-platform-addons
2. Nastavi PostgreSQL bazo
3. Implementiraj osnovni REST API
4. Dodaj file watcher za `new_components` mapo
5. Integriraj Hermes AI za obdelavo slik
6. Ustvari osnovni WebUI

