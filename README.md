# 🌾 Namma Farm — Digital Agriculture Platform & Marketplace

> **Core Purpose:**
> *"Namma Farm empowers farmers with AI decision engines, direct buyer marketplace, government schemes, MSP assured pricing, smart farmgate logistics, crop insurance, and expert scientist advisory."*

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
npm run install:all
```
*(or run `npm install` in both `client/` and `server/`)*

### 2. Setup Database & Seed 22 Feature Baselines
```bash
cd server
npx prisma db push
npm run seed
```

### 3. Start Development Servers
From the root directory:
```bash
npm run dev
```

- **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🌾 All 22 Agricultural Features Implemented

1. **Government Schemes Hub** (`/farmer/schemes`): PM-KISAN, PMKSY, SMAM, eligibility checker, document checklist & DBT tracking.
2. **Government Assured Price / MSP** (`/farmer/msp`): Official CACP MSP benchmarks, FCI/TNCSC centers, price comparison & digital receipts.
3. **AI Agriculture Chatbot** (`/farmer/assistant`): Multilingual voice & image advisor in English and Tamil with persistent history.
4. **Direct Farmer–Buyer Marketplace** (`/marketplace`, `/farmer/listings`): Direct farmgate commerce with grade sorting and escrow payments.
5. **AI Price Analysis — 7 Days** (`/farmer/price-analysis`): 7-day visual price movement chart, high/low/average, and 7d/14d/30d forecasts.
6. **Government Storage Finder** (`/farmer/storage`): CWC and SWC godowns, cold storages, capacity in MT & online space booking.
7. **Toll-Free AI Assistance** (`/farmer/support`): Kisan Call Centre (`1800-180-1551`), Namma Farm Desk (`1800-889-FARM`), and support ticket tracking.
8. **Hyperlocal Weather** (`/farmer/weather`): Live GPS weather, 7-day forecast, storm warnings, and agro-advisories.
9. **Smart Irrigation** (`/farmer/irrigation`): Precision water requirement calculator (Liters/Acre) and drip pumping schedules.
10. **Crop Health Scanner** (`/farmer/crop-doctor`): Multimodal AI leaf diagnosis, severity score, and organic/bio treatments.
11. **AI Crop Calendar** (`/farmer/calendar`): Sowing-to-harvest stage timeline with automated fertigation and spraying alerts.
12. **Farm Equipment Rental** (`/farmer/equipment`): Tractors (45 HP), harvesters, drone sprayers with hourly/acre rates.
13. **Market Comparison** (`/farmer/market-comparison`): Net Profit formula: `Net Profit = Revenue - Freight - Mandi Cess - Deductions`.
14. **Smart Transport** (`/farmer/transport`): Mini trucks (Tata Ace), 3-ton trucks, freight calculator, and farmgate booking.
15. **Finance & Loan Assistance** (`/farmer/finance`): Verified SBI Kisan Credit Card (KCC) at 4% subvented interest, EMI calculator & loans.
16. **Crop Insurance Assistance** (`/farmer/insurance`): PMFBY insurance coverage, premium calculator, cut-off dates & crop loss claims.
17. **Digital Farmer Passport** (`/farmer/passport`): Aggregated farmer profile with QR code, land records, soil health card, and printable PDF.
18. **Community Connect** (`/farmer/community`): Farmer forum with posts, organic recipes, pest warnings, and moderation.
19. **AI Profit Calculator** (`/farmer/profit-calculator`): Comprehensive budget simulator for seeds, fertilizer, labour, and net margins.
20. **Agricultural Waste Market** (`/farmer/waste-market`): Residue marketplace for paddy straw bales, bagasse, and coir pith for biofuels.
21. **Smart Notifications** (`/farmer/notifications`): Centralized notification stream for price spikes, weather warnings, and tasks.
22. **Direct Expert Access** (`/farmer/experts`): Verified TNAU / ICAR scientists 1-on-1 consultations and digital prescriptions.
23. **Consolidated Admin Dashboard** (`/admin/dashboard`): Governance and analytics across all 22 platform modules.

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Farmer** | `farmer@agriconnect.ai` | `Farmer@123` |
| **Buyer** | `buyer@agriconnect.ai` | `Buyer@123` |
| **Agricultural Expert** | `expert@agriconnect.ai` | `Expert@123` |
| **Government Official** | `gov@agriconnect.ai` | `Gov@123` |
| **Platform Admin** | `admin@agriconnect.ai` | `Admin@123` |
