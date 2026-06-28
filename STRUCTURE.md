# Elits Platform - Dogovorjena struktura

**Datum dogovora:** 2026-06-24  
**Verzija dokumenta:** 1.2.0

---

## 📁 GitHub repozitoriji

### 1. elits-platform (glavni sistem)
**URL:** https://github.com/lpt2007/elits-platform

Vsebuje:
- **core/** - Glavne komponente sistema:
  - `supervisor/` - Python backend (addon management)
  - `webui/` - React frontend (Mantine UI)
  - `observer/` - Python backend (system monitoring)
- **system-containers/** - Pomožni sistemski kontejnerji (DNS, CLI, itd.)
- **scripts/** - Deployment in maintenance skripte
- **docs/** - Dokumentacija
- **STRUCTURE.md** - Ta dokument

### 2. elits-platform-addons (vsi addon-i)
**URL:** https://github.com/lpt2007/elits-platform-addons

Vsebuje:
- **system/** - Sistemski addon-i (Elits Platform jih potrebuje):
  - hermes-ai/ - AI agent z vision capabilities
  - minio/ - Object storage (S3 compatible)
  - milvus/ - Vector database za AI
  - etcd/ - Key-value store za Milvus metadata
  - llama-inference/ - AI model inference

- **apps/** - Aplikacije (nesistemski addon-i):
  - aistorage/ - AI-powered components storage (v razvoju)
  - ostali prihodnji addon-i

---

## 💻 Lokalna struktura na VM

    /root/
    ├── elits-platform/              (git repo - glavni sistem)
    │   ├── core/                   (glavne komponente)
    │   │   ├── supervisor/
    │   │   ├── webui/
    │   │   └── observer/
    │   ├── system-containers/      (pomožni kontejnerji)
    │   ├── scripts/
    │   └── STRUCTURE.md
    │
    ├── elits-platform-addons/      (git repo - vsi addon-i)
    │   ├── system/                 (sistemski addon-i)
    │   │   ├── hermes-ai/
    │   │   ├── minio/
    │   │   ├── milvus/
    │   │   ├── etcd/
    │   │   └── llama-inference/
    │   └── apps/                   (nesistemski addon-i)
    │       └── aistorage/
    │
    └── /data/                      (runtime data, NOT git)
        ├── elits-data/             (glavni podatki)
        ├── addons-data/            (addon-i podatki)
        ├── backup-data/            (lokalni backupi)
        └── images/                 (slike za addon-i)

---

## 🔄 Delovni proces

### Pravila:
1. **Spremembe delamo DIREKTNO v git repozitorijih** (ne v /root/core ali drugih začasnih mapah)
2. **Ni kopiranja** iz začasnih map v git repo
3. **Vsaka sprememba** = commit + push
4. **Testiranje** = docker build + run iz git repozitorija
5. **Addon-i** so v elits-platform-addons:
   - Sistemski addon-i v system/
   - Nesistemski addon-i v apps/

### Verzioniranje:
- Vsaka najmanjša sprememba poveča verzijo za 0.01
- Primer: 0.2.3 → 0.2.4
- Verzija se beleži v:
  - VERSION datoteka v root repozitorija
  - package.json za WebUI
  - config.json za addone

### Commit sporočila:
- feat: - nova funkcionalnost
- fix: - popravek napake
- docs: - dokumentacija
- chore: - vzdrževanje, verzija
- refactor: - prestrukturiranje kode
- feat(addon-name): - nova funkcionalnost v addon-u
- fix(addon-name): - popravek napake v addon-u

---

## 📦 Struktura addon-ov

Vsak addon v elits-platform-addons mora imeti:

    addon-name/
    ├── README.md           (opis addon-a)
    ├── config.json         (konfiguracija za Elits Supervisor)
    ├── Dockerfile          (docker build)
    ├── requirements.txt    (Python dependencies)
    ├── .gitignore
    ├── app/                (Python koda)
    │   ├── main.py
    │   ├── api/
    │   ├── models/
    │   └── services/
    ├── data/               (runtime podatki)
    └── tests/              (testi)

---

## 🗄️ Podatkovni direktoriji

### /data/elits-data/
- Glavni podatki Elits Platform
- Konfiguracije
- Logi

### /data/addons-data/
- Podatki posameznih addon-ov
- hermes-ai/ - AI modeli, podatki
- milvus/ - vektorska baza
- minio/ - object storage
- aistorage/ - komponente, slike

### /data/backup-data/
- **Lokalni backupi** (dnevni, tedenski, mesečni)
- Backupi baz podatkov
- Backupi konfiguracij
- Backupi slik in datotek

### /data/images/
- Slike za addon-i
- aistorage/ - slike komponent
- Thumbnails

---

## 🚀 Deployment

### Development:
    cd /root/elits-platform/core/webui
    npm run dev

### Production:
    cd /root/elits-platform
    docker build -t elits-webui:latest ./core/webui
    docker run -d --name elits_webui -p 8081:80 elits-webui:latest

---

## 📝 Opombe

- Vsa koda mora biti **modularna in razširljiva**
- **Registry sistem** za WebUI strani
- **AI (Hermes)** mora biti vedno dostopen
- **Varnost**: vse slike in podatki morajo biti zaščiteni
- **Backup strategija**: dnevni backupi v /data/backup-data/
- **Sistemski addon-i** so v system/ mapi
- **Nesistemski addon-i** so v apps/ mapi
- **core/** vsebuje glavne komponente (supervisor, webui, observer)
- **system-containers/** vsebuje pomožne kontejnerje (DNS, CLI, itd.)

---

## 🔗 Povezave

- **GitHub:** https://github.com/lpt2007
- **VM:** elits-platform-server-00 (192.168.200.201)
- **WebUI:** http://192.168.200.201:8081
- **Home Assistant:** http://192.168.200.201:8123
