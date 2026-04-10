// backend/seed.js
// Run with: node seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/db.config');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  dialectOptions: dbConfig.dialectOptions,
  dialectModule: require('mysql2'),
  logging: false,
});

const hash = (pw) => bcrypt.hashSync(pw, 8);
const now = new Date();
const daysFromNow = (d) => new Date(Date.now() + d * 86400000);

// ─── USERS ────────────────────────────────────────────────────────────────────
const users = [
  {
    email: 'chukwuemeka.obi@darbmail.ng',
    password: hash('Password123!'),
    fullName: 'Chukwuemeka Obi',
    userType: 'founder',
    companyName: 'ObiTech Solutions Ltd',
    phoneNumber: '+2348031234567',
    address: '14 Adeola Odeku Street, Victoria Island, Lagos',
    isActive: true,
    isVerified: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    email: 'adaeze.nwosu@darbmail.ng',
    password: hash('Password123!'),
    fullName: 'Adaeze Nwosu',
    userType: 'founder',
    companyName: 'GreenRoots Agritech',
    phoneNumber: '+2348059876543',
    address: '7 Ahmadu Bello Way, Abuja, FCT',
    isActive: true,
    isVerified: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    email: 'babatunde.fashola@darbmail.ng',
    password: hash('Password123!'),
    fullName: 'Babatunde Fashola',
    userType: 'founder',
    companyName: 'Fashola Fintech Inc.',
    phoneNumber: '+2348167654321',
    address: '22 Broad Street, Lagos Island, Lagos',
    isActive: true,
    isVerified: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    email: 'ngozi.eze@darbmail.ng',
    password: hash('Password123!'),
    fullName: 'Ngozi Eze',
    userType: 'founder',
    companyName: 'HealthBridge Nigeria',
    phoneNumber: '+2348023456789',
    address: '5 Trans-Amadi Industrial Layout, Port Harcourt, Rivers State',
    isActive: true,
    isVerified: true,
    createdAt: now,
    updatedAt: now,
  },
];

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────
// Will be built after inserting users so we have their IDs.
// Each entry is a function that receives the founder's DB id.

const campaignSets = [
  // ── Chukwuemeka Obi (ObiTech Solutions) ──────────────────────────────────
  (founderId) => [
    {
      title: 'SwiftPay — Instant Cross-Border Remittance for West Africa',
      description:
        'SwiftPay is a mobile-first remittance platform that lets Nigerians in the diaspora send money home in under 60 seconds at fees 80% lower than traditional wire transfers. We leverage stablecoin rails on the backend while presenting a familiar naira-denominated interface to end users, eliminating the complexity of crypto for everyday senders.',
      category: 'Productivity',
      location: 'Lagos, Nigeria',
      target_amount: 85000000.00,
      current_amount: 31200000.00,
      minimum_investment: 250000.00,
      maximum_investment: 10000000.00,
      problem_statement:
        'Nigeria received over $20 billion in remittances in 2023, yet the average transfer fee remains 8–12%. Families lose billions of naira annually to middlemen. Existing apps are slow (2–5 business days), require extensive KYC that excludes rural recipients, and offer poor exchange rates pegged to black-market spreads.',
      solution:
        'SwiftPay uses USDC on the Stellar network as a settlement layer, converting naira at the point of send and delivering naira at the point of receive via our network of 1,200 licensed agent cashout points across 28 states. Transfers settle in under 60 seconds. Our fee is a flat 1.5%, with zero hidden FX markups. Recipients without smartphones can collect cash from any agent using a one-time PIN sent via SMS.',
      business_plan:
        'Revenue model: 1.5% transaction fee + 0.3% FX spread. Year 1 target: ₦500M GMV → ₦9M revenue. Year 2: ₦4B GMV → ₦72M revenue. Year 3: ₦18B GMV → ₦324M revenue. We will expand to Ghana, Kenya, and Senegal in Year 2 using the same agent-network playbook. Funds raised will be used: 40% product & engineering, 30% agent network expansion, 20% regulatory licensing (CBN, SEC), 10% marketing.',
      market_analysis:
        'The West Africa remittance corridor is a $35B annual market growing at 7% YoY. Nigeria alone accounts for 57% of Sub-Saharan Africa inflows. Our primary TAM is the 5.5 million Nigerians in the diaspora (UK, US, Canada, Italy). Secondary TAM includes intra-Africa transfers, a segment currently underserved by all major players. Competitor analysis: WorldRemit (8% fee, 1–2 days), Western Union (10% fee, same day but cash-only), Lemfi (3% fee, app-only, no agent cashout).',
      competitive_advantage:
        'Three moats: (1) Agent network — 1,200 cashout points already contracted, giving us last-mile reach no fintech competitor has. (2) Speed — sub-60-second settlement vs. industry average of 24 hours. (3) Regulatory head start — CBN International Money Transfer Operator (IMTO) licence application filed; we are one of only 12 applicants in the current cycle.',
      financial_projections:
        'Conservative scenario: Break-even at Month 18, ₦1.2B cumulative GMV. Base scenario: Break-even at Month 14, ₦2.8B GMV. Optimistic scenario: Break-even at Month 11, ₦5B GMV. Projected 3-year IRR for investors: 34%. Exit options: acquisition by a Tier-1 Nigerian bank (GTBank, Zenith) or Series A raise at 8× revenue multiple.',
      team_information:
        'Chukwuemeka Obi (CEO) — 9 years in fintech, ex-Flutterwave product lead. Ifeoma Dike (CTO) — ex-Paystack senior engineer, MSc Computer Science, University of Edinburgh. Emeka Eze (CFO) — chartered accountant, ex-PwC Nigeria. Advisors: Tayo Oviosu (Paga founder), Dr. Adesola Adeduntan (ex-FirstBank CEO).',
      risks_and_challenges:
        'Regulatory risk: CBN policy changes could affect IMTO licensing. Mitigation: legal retainer with Aluko & Oyebode. FX volatility: naira devaluation could erode margins. Mitigation: dynamic fee adjustment algorithm. Agent fraud: cash-out agents could collude. Mitigation: real-time transaction monitoring + agent bond deposits.',
      status: 'approved',
      is_featured: true,
      is_urgent: false,
      view_count: 1842,
      favorite_count: 203,
      investor_count: 47,
      start_date: new Date('2025-11-01'),
      end_date: daysFromNow(55),
      duration_days: 90,
      submitted_at: new Date('2025-10-28'),
      approved_at: new Date('2025-11-01'),
      createdAt: new Date('2025-10-25'),
      updatedAt: now,
    },
    {
      title: 'ObiLearn — Offline-First EdTech for Secondary Schools in Rural Nigeria',
      description:
        'ObiLearn is a tablet-based learning platform pre-loaded with the full WAEC/NECO curriculum, interactive video lessons, and AI-powered practice tests — all accessible without internet. We partner with state governments to deploy devices to public secondary schools, monetising through a per-student annual licence paid by state education ministries.',
      category: 'Education',
      location: 'Enugu, Nigeria',
      target_amount: 60000000.00,
      current_amount: 18750000.00,
      minimum_investment: 150000.00,
      maximum_investment: 8000000.00,
      problem_statement:
        'Only 29% of Nigerian secondary school students have reliable internet access. Yet 1.8 million students sit WAEC annually, with a national pass rate of just 38%. The gap is not intelligence — it is access to quality teaching materials. Textbooks are outdated (some still reference pre-2010 syllabi), and qualified teachers are concentrated in urban private schools.',
      solution:
        'ObiLearn tablets come pre-loaded with 4,000+ video lessons taught by Nigeria\'s top educators, mapped to the current WAEC/NECO syllabus. An on-device AI tutor identifies weak areas per student and generates personalised practice questions. Teachers get a dashboard (synced weekly via USB or low-bandwidth SMS) showing class performance analytics. No internet required for students — ever.',
      business_plan:
        'B2G model: ₦8,500 per student per year, paid by state education ministries. Pilot signed with Enugu State (12,000 students, ₦102M contract). Discussions ongoing with Anambra, Imo, and Kogi states. Hardware cost per tablet: ₦18,000 (amortised over 4 years = ₦4,500/year). Gross margin: 47%. Funds raised: 50% hardware procurement, 25% content production (Year 2 subjects), 15% sales & government relations, 10% ops.',
      market_analysis:
        'Nigeria has 10,500 public secondary schools with 8.4 million enrolled students. At ₦8,500/student, the addressable market is ₦71.4B annually. Even capturing 5% in 3 years = ₦3.57B revenue. Comparable companies: Eneza Education (Kenya, $4M ARR), uLesson (Nigeria, raised $7.5M Series A at 6× revenue). EdTech in SSA is projected to reach $3B by 2027.',
      competitive_advantage:
        'Offline-first architecture is our core differentiator — no competitor operates at this level of infrastructure independence. Government relationships: our CEO spent 3 years as a consultant to the Federal Ministry of Education. Content quality: exclusive agreements with 14 WAEC-certified educators who appear on our video lessons.',
      financial_projections:
        'Year 1: ₦102M revenue (Enugu pilot). Year 2: ₦380M (3 states). Year 3: ₦1.1B (9 states). EBITDA margin at scale: 38%. Investor return: 3-year projected 2.8× on invested capital. Exit: acquisition by a pan-African EdTech (Andela, Coursera Africa expansion) or IPO on NASD OTC market.',
      team_information:
        'Chukwuemeka Obi (CEO) — led digital learning initiatives at the Federal Ministry of Education 2019–2022. Chisom Agu (Head of Content) — former WAEC examiner, 15 years teaching experience. Uche Nwachukwu (CTO) — built offline-sync architecture for a WHO health data project in rural Zambia. Board advisor: Prof. Pai Obanya, UNESCO education consultant.',
      risks_and_challenges:
        'Government payment delays: state ministries are notorious for late payments. Mitigation: escrow arrangement with CBN-licensed payment processor. Device theft/damage: tablets in schools face high attrition. Mitigation: ruggedised casing + school-level insurance policy bundled into licence fee. Curriculum changes: WAEC updates syllabus periodically. Mitigation: annual content refresh budget built into pricing.',
      status: 'approved',
      is_featured: false,
      is_urgent: true,
      view_count: 976,
      favorite_count: 118,
      investor_count: 29,
      start_date: new Date('2025-12-01'),
      end_date: daysFromNow(38),
      duration_days: 75,
      submitted_at: new Date('2025-11-25'),
      approved_at: new Date('2025-12-01'),
      createdAt: new Date('2025-11-20'),
      updatedAt: now,
    },
  ],

  // ── Adaeze Nwosu (GreenRoots Agritech) ───────────────────────────────────
  (founderId) => [
    {
      title: 'GreenRoots FarmConnect — Linking 50,000 Smallholder Farmers to Premium Buyers',
      description:
        'GreenRoots FarmConnect is a B2B agri-marketplace that connects verified smallholder farmers in the Middle Belt directly to food processors, exporters, and supermarket chains — eliminating the 4–6 layers of middlemen that currently consume 60% of farm-gate value. Farmers list produce, buyers bid in real time, and GreenRoots handles logistics, quality inspection, and payment escrow.',
      category: 'Food & Beverages',
      location: 'Abuja, Nigeria',
      target_amount: 120000000.00,
      current_amount: 54600000.00,
      minimum_investment: 500000.00,
      maximum_investment: 15000000.00,
      problem_statement:
        'Nigeria loses an estimated ₦3.5 trillion worth of food annually to post-harvest waste and supply chain inefficiency. Smallholder farmers — who produce 80% of Nigeria\'s food — earn an average of ₦180,000/year, well below the poverty line, despite growing produce that sells for 5–8× their farm-gate price in Lagos supermarkets. The problem is structural: too many middlemen, no price transparency, and zero cold-chain infrastructure in rural areas.',
      solution:
        'FarmConnect operates on three pillars: (1) Digital marketplace — farmers list produce via USSD or smartphone app; buyers post purchase orders with price, volume, and delivery specs. Our matching algorithm pairs orders with the nearest verified farmer clusters. (2) Quality assurance — we employ 120 field agents (trained agronomists) who inspect produce before dispatch and issue a GreenRoots Quality Certificate. (3) Logistics — we have contracted 340 refrigerated tricycles and 18 cold-storage hubs across Benue, Kogi, Nasarawa, and Niger states.',
      business_plan:
        'Revenue streams: 4% transaction fee on GMV + ₦2,500/month premium farmer subscription (analytics, weather alerts, input credit) + logistics margin (15% on transport cost). Year 1 GMV target: ₦2.4B → revenue ₦96M. Year 2: ₦9B GMV → ₦360M revenue. Year 3: ₦28B GMV → ₦1.12B revenue. Use of funds: 45% cold-chain infrastructure, 30% technology platform, 15% farmer onboarding & training, 10% working capital.',
      market_analysis:
        'Nigeria\'s agricultural sector contributes 24% of GDP (₦58 trillion). The fresh produce supply chain alone is a ₦12 trillion market. Our initial focus — tomatoes, peppers, yams, and maize in the Middle Belt — represents a ₦4.2 trillion sub-market. Comparable exits: Twiga Foods (Kenya) raised $50M Series C; Agrostar (India) valued at $450M. Nigerian agri-tech is at an inflection point with CBN\'s Anchor Borrowers Programme creating demand for formal supply chains.',
      competitive_advantage:
        'Physical infrastructure is our moat. Unlike pure-software agri-marketplaces, our 18 cold-storage hubs and 340 refrigerated tricycles create a defensible last-mile network that takes 18–24 months and ₦200M+ to replicate. We also hold exclusive 3-year supply agreements with Shoprite Nigeria, Spar, and two major tomato paste processors.',
      financial_projections:
        'Break-even: Month 20. 3-year cumulative EBITDA: ₦480M. Investor IRR: 41%. Exit options: strategic acquisition by a pan-African food company (Olam, Dangote Foods) or Series B raise targeting $15M at 10× revenue. Secondary exit: NASD OTC listing in Year 4.',
      team_information:
        'Adaeze Nwosu (CEO) — MSc Agricultural Economics, University of Ibadan; 7 years with the International Institute of Tropical Agriculture (IITA). Emeka Okafor (COO) — ex-DHL Nigeria supply chain director. Chidinma Eze (CTO) — built the logistics platform for a Kenyan agri-startup (acquired by Twiga Foods 2022). Field operations team of 120 agronomists across 4 states.',
      risks_and_challenges:
        'Weather/climate risk: drought or flooding can wipe out harvests. Mitigation: parametric crop insurance partnership with NAIC. Farmer adoption: smallholders are slow to adopt new platforms. Mitigation: USSD interface (no smartphone needed) + village champion programme. Buyer concentration: top 5 buyers = 60% of GMV. Mitigation: active diversification to 50+ buyers by end of Year 1.',
      status: 'approved',
      is_featured: true,
      is_urgent: false,
      view_count: 2310,
      favorite_count: 287,
      investor_count: 63,
      start_date: new Date('2025-10-15'),
      end_date: daysFromNow(22),
      duration_days: 90,
      submitted_at: new Date('2025-10-10'),
      approved_at: new Date('2025-10-15'),
      createdAt: new Date('2025-10-08'),
      updatedAt: now,
    },
    {
      title: 'SoilSense — IoT Soil Monitoring for Nigerian Smallholder Farmers',
      description:
        'SoilSense manufactures low-cost IoT soil sensors (₦12,000/unit) that measure moisture, pH, nitrogen, phosphorus, and potassium in real time. Data is transmitted via NB-IoT to a cloud dashboard and a simple SMS alert system, giving farmers actionable irrigation and fertiliser recommendations without needing agronomists on-site.',
      category: 'Energy & Green Tech',
      location: 'Kaduna, Nigeria',
      target_amount: 45000000.00,
      current_amount: 9800000.00,
      minimum_investment: 100000.00,
      maximum_investment: 5000000.00,
      problem_statement:
        'Nigerian farmers apply fertiliser by guesswork, leading to either over-application (soil acidification, wasted money) or under-application (poor yields). The average smallholder spends ₦85,000/season on fertiliser but achieves only 40% of potential yield due to incorrect application timing and quantity. Professional soil testing costs ₦45,000 per sample and takes 3 weeks — completely impractical for smallholders.',
      solution:
        'SoilSense sensors are inserted into the ground and transmit readings every 6 hours. Our AI model, trained on 200,000 soil samples from across Nigeria\'s six geopolitical zones, interprets the data and sends SMS recommendations: "Apply 2 bags of NPK 15-15-15 per hectare this week" or "Irrigate for 45 minutes tomorrow morning." Sensors are solar-powered, waterproof to IP67, and designed to last 5 years without maintenance.',
      business_plan:
        'Hardware + SaaS model: ₦12,000 sensor (one-time) + ₦3,600/year data subscription. Distribution: through state ADP offices, cooperative societies, and GreenRoots FarmConnect network. Year 1 target: 8,000 sensors deployed → ₦96M hardware revenue + ₦28.8M subscription. Year 2: 35,000 sensors → ₦420M hardware + ₦126M subscription. Gross margin: 52% hardware, 88% subscription. Use of funds: 55% manufacturing scale-up, 25% R&D (next-gen sensor), 20% distribution.',
      market_analysis:
        'Nigeria has 14.5 million smallholder farm plots. Even 1% penetration = 145,000 sensors = ₦1.74B hardware revenue. Precision agriculture IoT in Africa is projected to grow from $180M (2023) to $890M (2028) at 37% CAGR. Key tailwind: CBN\'s ₦1 trillion agricultural credit facility is driving farmers to adopt productivity-enhancing technology to qualify for loans.',
      competitive_advantage:
        'Local manufacturing (Kaduna assembly plant) keeps our cost 60% below imported alternatives. Our AI model is trained exclusively on Nigerian soil data — competitors use generic global models that perform poorly on Nigerian laterite soils. Patent pending on our low-power NB-IoT transmission protocol optimised for rural Nigeria\'s patchy network coverage.',
      financial_projections:
        'Break-even: Month 16. Year 3 revenue: ₦1.8B. EBITDA margin at scale: 44%. Investor 3-year return: 3.1× on invested capital. Exit: acquisition by a global precision agriculture company (John Deere, Trimble) or strategic investment from a Nigerian fertiliser company (Dangote Fertiliser, Notore Chemical).',
      team_information:
        'Adaeze Nwosu (CEO) — led soil science research at IITA for 4 years. Tunde Adeyemi (CTO/Hardware) — electronics engineer, ex-Innoson Vehicle Manufacturing. Fatima Aliyu (Data Science Lead) — MSc Machine Learning, University of Cape Town; built crop yield prediction models for USAID. Manufacturing partner: Kaduna State Industrial Estate.',
      risks_and_challenges:
        'NB-IoT coverage gaps: rural areas have limited network coverage. Mitigation: LoRaWAN fallback protocol + offline data buffering. Hardware theft: sensors in open fields are vulnerable. Mitigation: tamper-evident casing + GPS tracking chip. Farmer willingness to pay: ₦12,000 is significant for smallholders. Mitigation: lease-to-own scheme via cooperative societies + CBN AgriCredit integration.',
      status: 'approved',
      is_featured: false,
      is_urgent: false,
      view_count: 654,
      favorite_count: 89,
      investor_count: 18,
      start_date: new Date('2026-01-10'),
      end_date: daysFromNow(72),
      duration_days: 90,
      submitted_at: new Date('2026-01-05'),
      approved_at: new Date('2026-01-10'),
      createdAt: new Date('2026-01-03'),
      updatedAt: now,
    },
  ],

  // ── Babatunde Fashola (Fashola Fintech) ───────────────────────────────────
  (founderId) => [
    {
      title: 'CreditBridge — Salary-Backed Micro-Loans for Nigeria\'s Informal Sector',
      description:
        'CreditBridge provides instant, collateral-free loans of ₦20,000–₦500,000 to market traders, artisans, and gig workers using a proprietary credit-scoring model built on alternative data: mobile money history, utility payment records, social graph analysis, and psychometric assessments. Repayments are collected daily in small amounts via USSD, matching the cash-flow patterns of informal workers.',
      category: 'Productivity',
      location: 'Lagos, Nigeria',
      target_amount: 200000000.00,
      current_amount: 112000000.00,
      minimum_investment: 1000000.00,
      maximum_investment: 25000000.00,
      problem_statement:
        'Nigeria\'s informal sector employs 80% of the workforce (65 million people) yet receives less than 3% of formal bank credit. Traditional banks require payslips, collateral, and 3-month bank statements — documents that informal workers simply don\'t have. Loan sharks fill the gap, charging 30–100% monthly interest. The result: a poverty trap where hardworking Nigerians cannot access the capital they need to grow their businesses.',
      solution:
        'CreditBridge\'s AI credit engine analyses 1,400+ data points from alternative sources to generate a CreditBridge Score (CBS) in under 3 minutes. Approved loans are disbursed to any bank account or mobile wallet within 5 minutes. Repayment is via daily micro-instalments (e.g., ₦1,200/day for a ₦30,000 loan over 30 days) collected via USSD — matching the daily revenue cycle of market traders. Our NPL rate after 18 months of operation: 4.2%, vs. industry average of 11%.',
      business_plan:
        'Revenue: interest income (monthly rate: 5–8% depending on CBS tier) + 1.5% origination fee. Year 1 loan book target: ₦1.8B → net interest income ₦216M. Year 2: ₦6B loan book → ₦720M NII. Year 3: ₦18B loan book → ₦2.16B NII. Cost of funds: 18% (CBN MSME fund + institutional debt). Net interest margin: 42–62%. Use of funds raised: 70% loan book expansion, 20% technology, 10% regulatory & compliance.',
      market_analysis:
        'Nigeria\'s MSME credit gap is estimated at ₦617 trillion by the CBN. The informal lending market (loan sharks, cooperative thrift) is ₦8.4 trillion annually. Digital lending in Nigeria grew 340% between 2020 and 2023. Key competitors: Carbon (₦50B loan book, Series B), FairMoney (₦80B, Series C), Branch (₦120B, Series C). Our differentiation: daily repayment model and deeper informal sector penetration.',
      competitive_advantage:
        'Daily repayment collection is our core innovation — no competitor has cracked this at scale. Our USSD-based collection works on any phone, reaching the 45% of our target market that doesn\'t use smartphones. We also have a first-mover advantage in the Alaba International Market (Lagos) and Onitsha Main Market, where we have exclusive agent partnerships with market association leaders.',
      financial_projections:
        'Break-even: Month 12 (loan book ₦2.1B). 3-year cumulative net profit: ₦1.84B. ROE at Year 3: 38%. Investor return: 3.8× on invested capital over 4 years. Exit: acquisition by a Tier-1 bank (Access Bank, GTBank) seeking informal sector exposure, or Series B raise at 5× book value.',
      team_information:
        'Babatunde Fashola (CEO) — ex-Access Bank head of digital lending, 11 years in consumer finance. Kemi Adeyemi (Chief Risk Officer) — ex-KPMG financial risk, MSc Statistics, LSE. Seun Olatunji (CTO) — built the credit engine at a South African fintech (acquired by Capitec 2021). Regulatory advisor: Bayo Onanuga, ex-CBN director of financial policy.',
      risks_and_challenges:
        'Regulatory risk: CBN digital lending guidelines are evolving. Mitigation: full FCCPC registration + CBN microfinance bank licence application in progress. Fraud risk: identity fraud in loan applications. Mitigation: BVN verification + liveness detection + device fingerprinting. Macroeconomic risk: naira devaluation increases cost of funds. Mitigation: 60% of funding from CBN development finance facilities denominated in naira.',
      status: 'approved',
      is_featured: true,
      is_urgent: false,
      view_count: 3105,
      favorite_count: 341,
      investor_count: 88,
      start_date: new Date('2025-09-01'),
      end_date: daysFromNow(12),
      duration_days: 120,
      submitted_at: new Date('2025-08-25'),
      approved_at: new Date('2025-09-01'),
      createdAt: new Date('2025-08-20'),
      updatedAt: now,
    },
    {
      title: 'PensionPlus — Micro-Pension for Nigeria\'s 65 Million Informal Workers',
      description:
        'PensionPlus is a mobile micro-pension platform that allows informal sector workers to save as little as ₦200/day toward retirement, with contributions automatically invested in a diversified portfolio of Nigerian Treasury Bills, Eurobonds, and money market funds. We are licensed by PenCom and operate as a Micro Pension Fund Administrator.',
      category: 'Productivity',
      location: 'Lagos, Nigeria',
      target_amount: 75000000.00,
      current_amount: 28900000.00,
      minimum_investment: 200000.00,
      maximum_investment: 10000000.00,
      problem_statement:
        'Only 9.7 million Nigerians (out of 65 million working adults) are enrolled in the formal pension system — exclusively salaried workers in the formal sector. The remaining 55 million informal workers have zero retirement savings. With Nigeria\'s average life expectancy rising to 55 years and the extended family support system weakening, millions of Nigerians face destitution in old age. The existing Contributory Pension Scheme requires a minimum monthly contribution of ₦8,000 — unaffordable for daily earners.',
      solution:
        'PensionPlus allows contributions from ₦200/day via USSD, bank transfer, or POS agent. Contributions are pooled and invested by our licensed fund manager in a capital-preservation portfolio (60% T-Bills, 25% money market, 15% Eurobonds) targeting 14–18% annual returns. Members can access 25% of their balance in emergencies (PenCom-compliant). A simple dashboard shows projected retirement income based on current savings rate.',
      business_plan:
        'Revenue: 1.5% annual management fee on AUM + ₦150/month platform fee per active member. Year 1 target: 50,000 members, ₦2.4B AUM → ₦36M management fee + ₦90M platform fees = ₦126M revenue. Year 2: 200,000 members, ₦12B AUM → ₦504M revenue. Year 3: 600,000 members, ₦42B AUM → ₦1.76B revenue. Use of funds: 40% technology & UX, 30% agent network (POS onboarding), 20% marketing, 10% regulatory.',
      market_analysis:
        'PenCom\'s Micro Pension Programme was launched in 2019 but has only enrolled 120,000 informal workers in 5 years — a massive execution gap. The informal pension market in Nigeria is estimated at ₦180B annually (informal thrift/ajo savings). Comparable success: M-Akiba (Kenya) enrolled 500,000 micro-investors in 18 months. Nigeria\'s mobile money penetration (42%) provides the infrastructure for rapid scale.',
      competitive_advantage:
        'PenCom licence is a regulatory moat — only 7 Micro Pension Fund Administrators are licensed in Nigeria. Our USSD-first approach reaches feature phone users (58% of our target market). Partnership with 3,200 POS agents for cash contribution collection gives us physical touchpoints in markets, motor parks, and rural areas where our users live and work.',
      financial_projections:
        'Break-even: Month 22 (200,000 members). 3-year cumulative revenue: ₦2.4B. EBITDA margin at scale: 51%. Investor return: 2.9× over 4 years. Exit: acquisition by a Tier-1 PFA (Stanbic IBTC Pensions, ARM Pensions) seeking informal sector AUM, or strategic investment from an international impact investor (IFC, CDC Group).',
      team_information:
        'Babatunde Fashola (CEO) — ex-Stanbic IBTC Pensions product manager, 8 years in pension administration. Amaka Okonkwo (Chief Investment Officer) — CFA charterholder, ex-ARM Investment Managers. Dayo Adebayo (Head of Technology) — built the digital onboarding system for a PenCom-licensed PFA. Regulatory advisor: Aisha Dahir-Umar, former PenCom Director-General (advisory capacity).',
      risks_and_challenges:
        'Trust deficit: Nigerians are sceptical of financial institutions after MMM and other Ponzi scheme collapses. Mitigation: PenCom licence prominently displayed + NDIC deposit insurance messaging + transparent AUM reporting. Low financial literacy: many informal workers don\'t understand pension concepts. Mitigation: Pidgin-language explainer videos + community ambassador programme. Regulatory changes: PenCom policy shifts. Mitigation: active engagement with PenCom through industry association.',
      status: 'approved',
      is_featured: false,
      is_urgent: true,
      view_count: 1423,
      favorite_count: 176,
      investor_count: 41,
      start_date: new Date('2025-12-15'),
      end_date: daysFromNow(45),
      duration_days: 90,
      submitted_at: new Date('2025-12-10'),
      approved_at: new Date('2025-12-15'),
      createdAt: new Date('2025-12-08'),
      updatedAt: now,
    },
  ],

  // ── Ngozi Eze (HealthBridge Nigeria) ─────────────────────────────────────
  (founderId) => [
    {
      title: 'HealthBridge Telemedicine — Bringing Specialist Care to 40 Million Nigerians Without Access',
      description:
        'HealthBridge is a telemedicine platform connecting patients in underserved communities to verified specialist doctors via video, voice, and text consultations. We operate a hub-and-spoke model: community health workers (CHWs) in rural areas use our tablet app to facilitate consultations, handling the technology for patients who lack smartphones or reliable internet.',
      category: 'Health & Fitness',
      location: 'Port Harcourt, Nigeria',
      target_amount: 95000000.00,
      current_amount: 42300000.00,
      minimum_investment: 300000.00,
      maximum_investment: 12000000.00,
      problem_statement:
        'Nigeria has 0.4 doctors per 1,000 people (WHO recommends 1 per 1,000). In rural areas, the ratio drops to 0.04 per 1,000. A patient in Ogoni, Rivers State, must travel 4–6 hours and spend ₦15,000–₦40,000 to see a specialist in Port Harcourt. Many simply don\'t go, leading to late-stage diagnoses of treatable conditions. Maternal mortality in rural Nigeria is 2,000 per 100,000 live births — 10× the global average — largely due to lack of antenatal specialist access.',
      solution:
        'HealthBridge operates through a network of 280 trained Community Health Workers (CHWs) equipped with our diagnostic tablet kit (includes digital stethoscope, pulse oximeter, BP monitor, and glucometer). CHWs conduct basic assessments and connect patients to our panel of 340 verified specialists via our platform. Consultations cost ₦2,500 (vs. ₦25,000–₦80,000 for in-person specialist visits). Prescriptions are sent digitally to the nearest pharmacy. Follow-up is via WhatsApp or SMS.',
      business_plan:
        'Revenue: ₦2,500 consultation fee (₦1,500 to doctor, ₦500 to CHW, ₦500 to HealthBridge) + ₦5,000/month corporate health plan for SMEs + pharmaceutical referral commission (8% of prescription value). Year 1: 120,000 consultations → ₦60M consultation revenue + ₦18M corporate plans + ₦12M pharma = ₦90M total. Year 2: 480,000 consultations → ₦360M total. Year 3: 1.5M consultations → ₦1.1B total. Use of funds: 40% CHW recruitment & training, 30% technology platform, 20% diagnostic equipment, 10% marketing.',
      market_analysis:
        'Nigeria\'s healthcare market is ₦4.2 trillion annually. Telemedicine penetration is under 1% — a massive greenfield opportunity. The corporate health plan market (SMEs) is ₦280B and growing at 22% YoY as employers seek affordable alternatives to HMO plans. Comparable companies: Helium Health (raised $30M Series B), Reliance HMO (raised $40M), Kangpe (acquired by Helium Health). HealthBridge\'s rural focus is a differentiated, underserved niche.',
      competitive_advantage:
        'CHW network is our defensible moat — 280 trained agents in communities where no competitor operates. Our diagnostic kit enables physical examination data to be transmitted digitally, making our consultations clinically superior to pure video-call telemedicine. NHIA (National Health Insurance Authority) accreditation in progress — once approved, we can bill the government\'s Basic Health Care Provision Fund (₦72B annually).',
      financial_projections:
        'Break-even: Month 18. 3-year cumulative revenue: ₦1.55B. EBITDA margin at scale: 34%. Investor return: 3.5× over 4 years. Exit: acquisition by a pan-African health company (Helium Health, mPharma) or strategic investment from an international health NGO (Gates Foundation, Wellcome Trust) seeking impact + return.',
      team_information:
        'Ngozi Eze (CEO) — MBBS, University of Port Harcourt; MPH, Johns Hopkins Bloomberg School of Public Health; 6 years with MSF (Médecins Sans Frontières) in rural Nigeria. Dr. Emeka Nwosu (Chief Medical Officer) — consultant physician, University of Port Harcourt Teaching Hospital. Tunde Bello (CTO) — ex-Helium Health senior engineer. CHW training partner: Community Health Practitioners Registration Board of Nigeria (CHPRBN).',
      risks_and_challenges:
        'Doctor retention: specialists may leave for higher-paying platforms. Mitigation: revenue-sharing model where doctors earn 60% of consultation fee + performance bonuses. Regulatory risk: MDCN (Medical and Dental Council of Nigeria) telemedicine guidelines are still evolving. Mitigation: active MDCN engagement + legal retainer with a health law firm. Connectivity: rural areas have poor internet. Mitigation: low-bandwidth video compression + offline consultation queuing.',
      status: 'approved',
      is_featured: true,
      is_urgent: false,
      view_count: 2788,
      favorite_count: 312,
      investor_count: 71,
      start_date: new Date('2025-11-15'),
      end_date: daysFromNow(30),
      duration_days: 90,
      submitted_at: new Date('2025-11-10'),
      approved_at: new Date('2025-11-15'),
      createdAt: new Date('2025-11-08'),
      updatedAt: now,
    },
    {
      title: 'MediStock — Real-Time Drug Inventory Management for Nigerian Pharmacies',
      description:
        'MediStock is a SaaS inventory and procurement platform for independent pharmacies in Nigeria. It provides real-time stock tracking, automated reorder alerts, expiry date management, and a group purchasing network that lets small pharmacies access wholesale prices previously only available to large chains.',
      category: 'Health & Fitness',
      location: 'Port Harcourt, Nigeria',
      target_amount: 35000000.00,
      current_amount: 11200000.00,
      minimum_investment: 100000.00,
      maximum_investment: 4000000.00,
      problem_statement:
        'Nigeria has 12,000 registered independent pharmacies, but 68% still manage inventory with paper ledgers or basic Excel spreadsheets. The consequences are severe: ₦180B worth of drugs expire unsold annually, stockouts of essential medicines are common (causing patients to go without treatment), and small pharmacies pay 25–40% more for drugs than chain pharmacies because they can\'t access bulk purchasing. The average independent pharmacy loses ₦2.4M/year to preventable inventory mismanagement.',
      solution:
        'MediStock is a tablet/web app that scans drug barcodes at point of sale, automatically updates inventory, and sends WhatsApp alerts when stock falls below reorder level. The expiry tracking module flags drugs expiring within 60 days so pharmacists can run promotions before they become waste. The group purchasing feature pools orders from 50+ pharmacies to negotiate bulk prices from distributors — passing savings of 18–32% to members. Integration with NAFDAC\'s drug database ensures all stocked items are verified.',
      business_plan:
        'SaaS subscription: ₦15,000/month per pharmacy (₦180,000/year). Group purchasing commission: 3% of GMV facilitated. Year 1 target: 800 pharmacies → ₦144M subscription + ₦28M purchasing commission = ₦172M revenue. Year 2: 3,000 pharmacies → ₦648M total. Year 3: 8,000 pharmacies → ₦1.73B total. Gross margin: 78%. Use of funds: 50% sales & onboarding, 30% product development, 20% operations.',
      market_analysis:
        'Nigeria\'s pharmaceutical retail market is ₦1.2 trillion annually. 12,000 independent pharmacies × ₦180,000/year = ₦2.16B TAM for subscriptions alone. Group purchasing GMV potential: ₦480B (40% of pharmacy procurement). Comparable SaaS: Marg ERP (India, 200,000 pharmacy clients), Rx30 (US, $120M ARR). Nigerian pharmacy tech is nascent — no dominant player exists.',
      competitive_advantage:
        'NAFDAC database integration is a regulatory differentiator — we are the only pharmacy management system with real-time NAFDAC drug verification. Our group purchasing network creates a flywheel: more pharmacies → better bulk prices → more pharmacies join. First-mover advantage in Port Harcourt and Abuja; 340 pharmacies already onboarded in pilot.',
      financial_projections:
        'Break-even: Month 10 (800 pharmacies). 3-year cumulative revenue: ₦2.55B. EBITDA margin at scale: 62%. Investor return: 4.2× over 3 years. Exit: acquisition by a pharmaceutical distributor (Emzor, Fidson Healthcare) seeking digital distribution channel, or strategic investment from a health tech fund.',
      team_information:
        'Ngozi Eze (CEO) — pharmacist by training (BPharm, University of Nigeria Nsukka) before pivoting to health tech. Chidi Okonkwo (CTO) — ex-Interswitch software engineer, 8 years in enterprise SaaS. Amara Nwosu (Head of Sales) — ex-GlaxoSmithKline Nigeria pharmaceutical sales rep, 200+ pharmacy relationships. Advisory board: Pharm. Mazi Sam Ohuabunwa, ex-President, Pharmaceutical Society of Nigeria.',
      risks_and_challenges:
        'Pharmacist tech adoption: older pharmacists resist digital tools. Mitigation: free 30-day trial + dedicated onboarding support + Pidgin-language training videos. Distributor resistance: large distributors may resist group purchasing that reduces their margins. Mitigation: we position as a demand aggregator that reduces their sales cost, not a competitor. Data security: drug inventory data is commercially sensitive. Mitigation: end-to-end encryption + ISO 27001 certification in progress.',
      status: 'approved',
      is_featured: false,
      is_urgent: false,
      view_count: 887,
      favorite_count: 104,
      investor_count: 22,
      start_date: new Date('2026-01-20'),
      end_date: daysFromNow(80),
      duration_days: 90,
      submitted_at: new Date('2026-01-15'),
      approved_at: new Date('2026-01-20'),
      createdAt: new Date('2026-01-12'),
      updatedAt: now,
    },
  ],
];

// ─── SEED RUNNER ──────────────────────────────────────────────────────────────
async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    // Insert users one by one, capture IDs
    const insertedUserIds = [];
    for (const u of users) {
      const [results] = await sequelize.query(
        `INSERT INTO users
          (email, password, fullName, userType, companyName, phoneNumber, address,
           isActive, isVerified, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE updatedAt = NOW()`,
        {
          replacements: [
            u.email, u.password, u.fullName, u.userType,
            u.companyName, u.phoneNumber, u.address,
            u.isActive, u.isVerified, u.createdAt, u.updatedAt,
          ],
        }
      );

      // Get the id (insertId for new row, or look it up for duplicate)
      let userId = results.insertId;
      if (!userId) {
        const [row] = await sequelize.query(
          'SELECT id FROM users WHERE email = ? LIMIT 1',
          { replacements: [u.email], type: sequelize.QueryTypes.SELECT }
        );
        userId = row.id;
      }
      insertedUserIds.push(userId);
      console.log(`👤 User "${u.fullName}" → id ${userId}`);
    }

    // Insert campaigns for each user
    for (let i = 0; i < campaignSets.length; i++) {
      const founderId = insertedUserIds[i];
      const campaigns = campaignSets[i](founderId);

      for (const c of campaigns) {
        await sequelize.query(
          `INSERT INTO campaigns
            (title, description, category, location,
             target_amount, current_amount, minimum_investment, maximum_investment,
             problem_statement, solution, business_plan, market_analysis,
             competitive_advantage, financial_projections, team_information, risks_and_challenges,
             status, is_featured, is_urgent,
             view_count, favorite_count, investor_count,
             start_date, end_date, duration_days,
             founder_id,
             submitted_at, approved_at, createdAt, updatedAt)
           VALUES (?,?,?,?, ?,?,?,?, ?,?,?,?, ?,?,?,?, ?,?,?, ?,?,?, ?,?,?, ?, ?,?,?,?)
           ON DUPLICATE KEY UPDATE updatedAt = NOW()`,
          {
            replacements: [
              c.title, c.description, c.category, c.location,
              c.target_amount, c.current_amount, c.minimum_investment, c.maximum_investment,
              c.problem_statement, c.solution, c.business_plan, c.market_analysis,
              c.competitive_advantage, c.financial_projections, c.team_information, c.risks_and_challenges,
              c.status, c.is_featured ? 1 : 0, c.is_urgent ? 1 : 0,
              c.view_count, c.favorite_count, c.investor_count,
              c.start_date, c.end_date, c.duration_days,
              founderId,
              c.submitted_at, c.approved_at, c.createdAt, c.updatedAt,
            ],
          }
        );
        console.log(`  📢 Campaign "${c.title.substring(0, 50)}..." inserted`);
      }
    }

    console.log('\n🎉 Seed complete!');
    console.log('─────────────────────────────────────────────');
    console.log('All 4 users and 8 campaigns have been seeded.');
    console.log('Login password for all users: Password123!');
    users.forEach((u) => console.log(`  ${u.email}`));
    console.log('─────────────────────────────────────────────');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

seed();
