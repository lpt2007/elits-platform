# Elits Platform - Dogovorjena struktura

**Datum dogovora:** 2026-06-24  
**Verzija dokumenta:** 1.0.0

---

## 📁 GitHub repozitoriji

### 1. elits-platform (glavni sistem)
**URL:** https://github.com/lpt2007/elits-platform

Vsebuje:
- webui/ - React frontend (Mantine UI)
- supervisor/ - Python backend (addon management)
- observer/ - Python backend (system monitoring)
- system-containers/ - DNS, CLI, ostali sistemski kontejnerji
- scripts/ - deployment in maintenance skripte
- docs/ - dokumentacija
- STRUCTURE.md - ta dokument

### 2. elits-platform-addons (vsi addon-i)
**URL:** https://github.com/lpt2007/elits-platform-addons

Vsebuje:
- **System addons** (Elits Platform jih potrebuje):
  - hermes-ai/ - AI agent
  - minio/ - Object storage
  - milvus/ - Vector database
  - etcd/ - Key-value store
  - llama-inference/ - AI inference
  
- **Non-system addons** (neodvisni):
  - aistorage/ - AI-powered components storage (v razvoju)
  - ostali prihodnji addon-i

---

## 💻 Lokalna struktura na VM

    /root/
    ├── elits-platform/              (git repo - glavni sistem)
    │   ├── webui/                  (React source)
    │   ├── supervisor/             (Python source)
    │   ├── observer/               (Python source)
    │   ├── system-containers/
    │   ├── scripts/
    │   ├── docs/
    │   └── STRUCTURE.md
    │
    ├── elits-platform-addons/      (git repo - vsi addon-i)
    │   ├── hermes-ai/
    │   ├── minio/
    │   ├── milvus/
    │   ├── etcd/
    │   ├── llama-inference/
    │   └── aistorage/
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
5. **Addon-i** so vsi v elits-platform-addons (system + non-system)

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
    cd /root/elits-platform/webui
    npm run dev

### Production:
    cd /root/elits-platform
    docker build -t elits-webui:latest ./webui
    docker run -d --name elits_webui -p 8081:80 elits-webui:latest

---

## 📝 Opombe

- Vsa koda mora biti **modularna in razširljiva**
- **Registry sistem** za WebUI strani
- **AI (Hermes)** mora biti vedno dostopen
- **Varnost**: vse slike in podatki morajo biti zaščiteni
- **Backup strategija**: dnevni backupi v /data/backup-data/

---

## 🔗 Povezave

- **GitHub:** https://github.com/lpt2007
- **VM:** elits-platform-server-00 (192.168.200.201)
- **WebUI:** http://192.168.200.201:8081
- **Home Assistant:** http://192.168.200.201:8123
