// THE RYKER CONSENSUS: MASTER ASSET DATABASE (v8.0 - UNIFIED 4x4x4)
// 53 Nodes | 4 Skills | 4 Vulnerabilities | 4 Spheres | Identical Structure

const R2_AUDIO = 'https://pub-111e813bd5634cd8a9ecdd3d5c2a0916.r2.dev/dominicGlobaleNetworkAudio/';
const R2_PICS = 'https://pub-111e813bd5634cd8a9ecdd3d5c2a0916.r2.dev/dominicGlobaleNetworkProfilePics/';

const RYKER_NODES = [
    // --- ANTIBODIES (HIDDEN) ---
    {
        id: 'the_barista',
        anchor: { name: "Penelope", role: "The Barista", img: "The Barista. Role- Cafe Staff. Location-  Whitefish, Montana Corporate Lobby cafe. Focus- The  Flush.jpg", audio: "The Barista. Role- Cafe Staff. Location-  Whitefish, Montana Corporate Lobby cafe. Focus- The  Flush.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Counter-Surveillance', type: 'INTEL' },
            { name: 'The Brain Itch', type: 'INTEL' },
            { name: 'Leak Extraction', type: 'PSYCH' },
            { name: 'Intervention', type: 'ACTION' }
        ],
        vulnerabilities: [
            { name: 'Student Debt', type: 'TRANSACTIONAL' },
            { name: 'Past Stalker', type: 'THREAT' },
            { name: 'Curiosity', type: 'TRAP' },
            { name: 'Poverty', type: 'TRANSACTIONAL' }
        ],
        spheres: [
            { name: 'Service Access', effect: 'ACCESS' },
            { name: 'Intel Collection', effect: 'REVEAL' },
            { name: 'Counter-Surv', effect: 'DEFENSE' },
            { name: 'Lobby Hub', effect: 'CONNECT' }
        ]
    },
    {
        id: 'agent_miller',
        anchor: { name: "Agent Allie Miller", role: "FBI Field Agent", img: "Agent Allie Miller. Role- Female FBI Field Agent (Financial Crimes). Location- Newark, NJ. Focus- The Grud.jpg", audio: "Agent Allie Miller. Role- Female FBI Field Agent (Financial Crimes). Location- Newark, NJ. Focus- The Grudge.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Forensic Attrition', type: 'SYSTEMIC' },
            { name: 'Resource Drain', type: 'TRANSACTIONAL' },
            { name: 'Rogue Threat', type: 'CHAOS' },
            { name: 'Leak Potential', type: 'MEDIA' }
        ],
        vulnerabilities: [
            { name: 'Father\'s Debt', type: 'TRANSACTIONAL' },
            { name: 'Career Reprimands', type: 'SYSTEMIC' },
            { name: 'Asset Stress', type: 'TRANSACTIONAL' },
            { name: 'Insomnia', type: 'BIO' }
        ],
        spheres: [
            { name: 'Fed Jurisdiction', effect: 'RANGE_MAX' },
            { name: 'Dead Man Switch', effect: 'DETERRENT' },
            { name: 'Forensic Excavation', effect: 'REVEAL_PAST' },
            { name: 'The Bureau', effect: 'ALLIES' }
        ]
    },
    {
        id: 'pieter_block',
        anchor: { name: "Pieter 'The Block'", role: "Harbor Safety", img: "Pieter The Block Role- Harbor Safety Inspector. Location- Rotterdam Port. Focus- Physics.jpg", audio: "Pieter The Block Role- Harbor Safety Inspector. Location- Rotterdam Port. Focus- Physics.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Technological Verify', type: 'INTEL' },
            { name: 'Gate Denial', type: 'FORCE' },
            { name: 'Escalation Protocol', type: 'SYSTEMIC' },
            { name: 'Integrity Shield', type: 'DEFENSE' }
        ],
        vulnerabilities: [
            { name: 'The License', type: 'SYSTEMIC' },
            { name: 'Family', type: 'EXISTENTIAL' },
            { name: 'Routine', type: 'SYSTEMIC' },
            { name: 'Prof. Pride', type: 'EGO' }
        ],
        spheres: [
            { name: 'Cargo Inspection', effect: 'REVEAL' },
            { name: 'The Hard Stop', effect: 'BLOCK' },
            { name: 'Total Freeze', effect: 'BLOCK_MOVE' },
            { name: 'Port Authority', effect: 'LEGAL' }
        ]
    },
    {
        id: 'dr_alfayed',
        anchor: { name: "Dr. Al-Fayed", role: "Chief Coroner", img: "Dr. Al-Fayed. Role- Chief Coroner. Location- London. Focus- The Body.jpg", audio: "Dr. Al-Fayed. Role- Chief Coroner. Location- London. Focus- The Body.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Evidence Hardening', type: 'OBJECTIVE' },
            { name: 'Forensic Authority', type: 'LEGAL' },
            { name: 'Inst. Obstruction', type: 'SYSTEMIC' },
            { name: 'Moral Shaming', type: 'PSYCH' }
        ],
        vulnerabilities: [
            { name: 'Daughter', type: 'EXISTENTIAL' },
            { name: 'Past Error', type: 'MEDIA' },
            { name: 'Visa Status', type: 'LEGAL' },
            { name: 'Health Tremor', type: 'BIO' }
        ],
        spheres: [
            { name: 'Cause of Death', effect: 'TRIGGER_COP' },
            { name: 'Narrative Disrupt', effect: 'COUNTER_SPIN' },
            { name: 'Asset Freeze', effect: 'BLOCK_MONEY' },
            { name: 'Morgue Access', effect: 'ACCESS' }
        ]
    },
    {
        id: 'jack_shiv',
        anchor: { name: "Jack 'The Shiv'", role: "Journalist", img: "Jack The Shiv Hennessy. Role- Investigative Journalist Freelance. Location- The Shakespeare Hotel, Surry H.jpg", audio: "Jack The Shiv Hennessy. Role- Investigative Journalist Freelance. Location- The Shakespeare Hotel, Surry Hills. Focus- The Blunt Instrument.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Rep Assassination', type: 'MEDIA' },
            { name: 'Weaponized Facts', type: 'INTEL' },
            { name: 'Intimidation Resist', type: 'DEFENSE' },
            { name: 'Calculated Timing', type: 'TIMING' }
        ],
        vulnerabilities: [
            { name: 'Alcoholism', type: 'BIO' },
            { name: 'Poverty', type: 'TRANSACTIONAL' },
            { name: 'Isolation', type: 'PSYCH' },
            { name: 'Obsession', type: 'PSYCH' }
        ],
        spheres: [
            { name: 'Rep Destruction', effect: 'DMG_EGO' },
            { name: 'The Blunt Instrument', effect: 'ATTACK' },
            { name: 'Timing Warfare', effect: 'CRITICAL_HIT' },
            { name: 'The Shakespeare', effect: 'SANCTUARY' }
        ]
    },
    {
        id: 'sarah_k',
        anchor: { name: "Sarah K", role: "Investigative Journo", img: "Investigative Journalist 'Sarah K'. Location-  TV station Focus- The Whole Picture..jpg", audio: "Investigative Journalist 'Sarah K'. Location-  TV station Focus- The Whole Picture..wav", hoverScale: 3.0 },
        skills: [
            { name: 'Narrative Control', type: 'MEDIA' },
            { name: 'Forensic Accounting', type: 'INTEL' },
            { name: 'Legal Baiting', type: 'LEGAL' },
            { name: 'The Cold Spot', type: 'INTEL' }
        ],
        vulnerabilities: [
            { name: 'Legal Bait', type: 'SYSTEMIC' },
            { name: 'Safety', type: 'EXISTENTIAL' },
            { name: 'Funding', type: 'TRANSACTIONAL' },
            { name: 'Burnout', type: 'BIO' }
        ],
        spheres: [
            { name: 'Public Exposure', effect: 'REVEAL_ALL' },
            { name: 'The Spotlight', effect: 'ATTRACT_HEAT' },
            { name: 'Legal Trap', effect: 'REFLECT_DMG' },
            { name: 'Monday Air', effect: 'MEDIA_BOOST' }
        ]
    },
    {
        id: 'iron_irene',
        anchor: { name: "'Iron' Irene", role: "Prosecutor", img: "Intercept- Lighting a cigarette (illegal indoors). Dry, gravelly voice.jpg", audio: "Intercept- Lighting a cigarette (illegal indoors). Dry, gravelly voice.wav", hoverScale: 3.0 },
        skills: [
            { name: 'The Grind', type: 'PSYCH' },
            { name: 'Forensic Strip', type: 'INTEL' },
            { name: 'No-Deal Policy', type: 'OBJECTIVE' },
            { name: 'Psych Domination', type: 'PSYCH' }
        ],
        vulnerabilities: [
            { name: 'The Cat', type: 'EXISTENTIAL' },
            { name: 'Loneliness', type: 'PSYCH' },
            { name: 'Smoking Health', type: 'BIO' },
            { name: 'Burnout', type: 'PSYCH' }
        ],
        spheres: [
            { name: 'Prosecution', effect: 'LEGAL_ATK' },
            { name: 'The Grinder', effect: 'DRAIN_WILL' },
            { name: 'Psych Destruction', effect: 'TRAP_TARGET' },
            { name: 'Courtroom', effect: 'ARENA_LOCK' }
        ]
    },
    {
        id: 'the_apprentice',
        anchor: { name: "Jai", role: "The Apprentice", img: "The Apprentice. Role- Electricians Offsider. Location- Commercial Build. Focus  The Flow.jpg", audio: "The Apprentice. Role- Electricians Offsider. Location- Commercial Build. Focus  The Flow.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Intuitive Physics', type: 'OBJECTIVE' },
            { name: 'Malicious Compliance', type: 'SABOTAGE' },
            { name: 'Invisible Sabotage', type: 'SABOTAGE' },
            { name: 'Lunch Motivator', type: 'PSYCH' }
        ],
        vulnerabilities: [
            { name: 'Employment', type: 'TRANSACTIONAL' },
            { name: 'Education', type: 'PSYCH' },
            { name: 'Home', type: 'EXISTENTIAL' },
            { name: 'Peers', type: 'PSYCH' }
        ],
        spheres: [
            { name: 'Physical Install', effect: 'BUILD' },
            { name: 'Invisible Sabotage', effect: 'DECAY' },
            { name: 'Plausible Deny', effect: 'DEFENSE' },
            { name: 'Site Access', effect: 'MOVE' }
        ]
    },

    // --- STANDARD ASSETS ---
    {
        id: 'lachlan_sterling',
        anchor: { name: "Lachlan Sterling", role: "CEO Apexian", img: "Lachlan Sterling. CEO Apexian. Location- Barangaroo Penthouse. Cortisol- Low. Focus- Floor Space Ratio.jpg", audio: "Lachlan Sterling. CEO Apexian. Location- Barangaroo Penthouse. Cortisol- Low. Focus- Floor Space Ratio.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Regulatory Capture', type: 'SYSTEMIC' },
            { name: 'Value Creation', type: 'TRANSACTIONAL' },
            { name: 'Cortisol Control', type: 'PSYCH' },
            { name: 'Vertical Dominance', type: 'EGO' }
        ],
        vulnerabilities: [
            { name: 'Leverage', type: 'TRANSACTIONAL' },
            { name: 'Wife', type: 'EXISTENTIAL' },
            { name: 'Mistress', type: 'MEDIA' },
            { name: 'Legacy', type: 'EGO' }
        ],
        spheres: [
            { name: 'Urban Dev', effect: 'GENERATE_X' },
            { name: 'Value Fab', effect: 'MULTIPLY' },
            { name: 'Cortisol Control', effect: 'DEFENSE' },
            { name: 'Barangaroo', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'marcus_vane',
        anchor: { name: "Marcus Vane", role: "Financier", img: "Marcus Vane. Location- Zurich. Cortisol- High. Focus- Transaction Velocity.jpg", audio: "Marcus Vane. Location- Zurich. Cortisol- High. Focus- Transaction Velocity.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Infinite Loop', type: 'SYSTEMIC' },
            { name: 'Regulator Fatigue', type: 'PSYCH' },
            { name: 'Velocity Shield', type: 'DEFENSE' },
            { name: 'Boredom Camo', type: 'PSYCH' }
        ],
        vulnerabilities: [
            { name: 'Boredom', type: 'PSYCH' },
            { name: 'Ego', type: 'EGO' },
            { name: 'Technology', type: 'SYSTEMIC' },
            { name: 'Isolation', type: 'PSYCH' }
        ],
        spheres: [
            { name: 'Financial Routing', effect: 'MOVE' },
            { name: 'Infinite Loop', effect: 'SPEED_UP' },
            { name: 'Liquidity Inject', effect: 'HEAL' },
            { name: 'Zurich Hub', effect: 'SAFEHOUSE' }
        ]
    },
    {
        id: 'elena_corves',
        anchor: { name: "Elena Corves", role: "Asset Manager", img: "Elena_Corves._Location-_NYC._Cortisol-_Controlle.jpg", audio: "Elena Corves. Location- NYC. Cortisol- Controlled. Focus- Asset Management.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Timeline Gaps', type: 'INTEL' },
            { name: 'Implied Know.', type: 'PSYCH' },
            { name: 'Predatory Patience', type: 'TIMING' },
            { name: 'Historical Lev.', type: 'INTEL' }
        ],
        vulnerabilities: [
            { name: 'Child', type: 'EXISTENTIAL' },
            { name: 'Paranoia', type: 'PSYCH' },
            { name: 'Staff', type: 'INTEL' },
            { name: 'Health', type: 'BIO' }
        ],
        spheres: [
            { name: 'Wealth Weapon', effect: 'ATTACK' },
            { name: 'The Historian', effect: 'REVEAL_PAST' },
            { name: 'Silence Curr.', effect: 'GENERATE_X' },
            { name: 'NYC Penthouse', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'david_wu',
        anchor: { name: "David Wu", role: "Hedge Fund Mgr", img: "Hedge Fund Manager David Wu. Location- Wall Street. Focus- Alpha.jpg", audio: "Hedge Fund Manager David Wu. Location- Wall Street. Focus- Alpha.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Tragedy Pricing', type: 'TRANSACTIONAL' },
            { name: 'Regulatory Silence', type: 'SYSTEMIC' },
            { name: 'Market Accel', type: 'CHAOS' },
            { name: 'Info Asymmetry', type: 'INTEL' }
        ],
        vulnerabilities: [
            { name: 'Addiction', type: 'BIO' },
            { name: 'Compliance', type: 'LEGAL' },
            { name: 'Family', type: 'EXISTENTIAL' },
            { name: 'Leverage', type: 'TRANSACTIONAL' }
        ],
        spheres: [
            { name: 'Stock Manip', effect: 'ATTACK' },
            { name: 'Disaster Profit', effect: 'GENERATE_X' },
            { name: 'Reg. Evasion', effect: 'DEFENSE' },
            { name: 'Wall St', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'frau_edelstein',
        anchor: { name: "Frau Edelstein", role: "Compliance", img: "Frau Edelstein. Role- Senior Compliance Officer. Location- Zurich, Switzerland. Focus- The Audit.jpg", audio: "Frau Edelstein. Role- Senior Compliance Officer. Location- Zurich, Switzerland. Focus- The Audit.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Asset Freezing', type: 'TRANSACTIONAL' },
            { name: 'Regulatory Wall', type: 'SYSTEMIC' },
            { name: 'Jurisdictional Fort', type: 'LEGAL' },
            { name: 'Process Intran.', type: 'PSYCH' }
        ],
        vulnerabilities: [
            { name: 'Grandson', type: 'EXISTENTIAL' },
            { name: 'Routine', type: 'SYSTEMIC' },
            { name: 'Pride', type: 'EGO' },
            { name: 'Secret', type: 'INTEL' }
        ],
        spheres: [
            { name: 'Gatekeeper', effect: 'BLOCK' },
            { name: 'Vault Lock', effect: 'IMMUNE' },
            { name: 'Inst. Memory', effect: 'REVEAL' },
            { name: 'Swiss Alps', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'gus_dunbar',
        anchor: { name: "Gus Dunbar", role: "Grazier", img: "Angus Gus Dunbar. Role- Hedge Fund Manager  - Grazier. Location- 50th Floor Boardroom, Circular Quay. Focu.jpg", audio: "Angus Gus Dunbar. Role- Hedge Fund Manager - Grazier. Location- 50th Floor Boardroom, Circular Quay. Focus- The Long Game.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Capital Siege', type: 'TRANSACTIONAL' },
            { name: 'Psych Warfare', type: 'PSYCH' },
            { name: 'Market Signal', type: 'INTEL' },
            { name: 'Asset Freezing', type: 'TRANSACTIONAL' }
        ],
        vulnerabilities: [
            { name: 'The Property', type: 'TRANSACTIONAL' },
            { name: 'Daughter', type: 'EXISTENTIAL' },
            { name: 'Health', type: 'BIO' },
            { name: 'Legacy', type: 'EGO' }
        ],
        spheres: [
            { name: 'Capital Anchor', effect: 'STABILIZE' },
            { name: 'Siege Warfare', effect: 'DRAIN' },
            { name: 'Signal Jam', effect: 'CONFUSE' },
            { name: 'Circular Quay', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'lars_vinter',
        anchor: { name: "Lars Vinter", role: "Crypto Launderer", img: "Lars Vinter. Location- Tallinn. Estonia Focus- Chain Analysis.jpg", audio: "Lars Vinter. Location- Tallinn. Estonia Focus- Chain Analysis.wav", hoverScale: 3.0 },
        skills: [
            { name: 'NFT Wash', type: 'TRANSACTIONAL' },
            { name: 'Price Fab', type: 'TRANSACTIONAL' },
            { name: 'Chain Camo', type: 'SYSTEMIC' },
            { name: 'Art Front', type: 'LEGAL' }
        ],
        vulnerabilities: [
            { name: 'Paranoia', type: 'PSYCH' },
            { name: 'Physical', type: 'BIO' },
            { name: 'Keys', type: 'INTEL' },
            { name: 'Social', type: 'PSYCH' }
        ],
        spheres: [
            { name: 'Crypto Trace', effect: 'REVEAL' },
            { name: 'Wash Cycle', effect: 'CLEAN' },
            { name: 'Wallet Taint', effect: 'ATTACK' },
            { name: 'Tallinn', effect: 'SAFEHOUSE' }
        ]
    },
    {
        id: 'the_griever',
        anchor: { name: "The Griever", role: "Estate Buyer", img: "The Griever. Location- London. Focus- Liquidity.jpg", audio: "The Griever. Location- London. Focus- Liquidity.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Widow Targeting', type: 'PSYCH' },
            { name: 'Closure Curr.', type: 'PSYCH' },
            { name: 'Probate Bypass', type: 'LEGAL' },
            { name: 'Emote Arbitrage', type: 'PSYCH' }
        ],
        vulnerabilities: [
            { name: 'Reputation', type: 'MEDIA' },
            { name: 'Legal', type: 'LEGAL' },
            { name: 'Victims', type: 'THREAT' },
            { name: 'Soul', type: 'EXISTENTIAL' }
        ],
        spheres: [
            { name: 'Probate', effect: 'ACCESS' },
            { name: 'Asset Scavenge', effect: 'CHEAP_ASSETS' },
            { name: 'Probate Bypass', effect: 'SPEED_UP' },
            { name: 'London', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'sgt_robbo',
        anchor: { name: "Sgt. 'Robbo'", role: "Police Sgt", img: "NSW Police Detect. Sgt. 'Robbo'. Location- King's Cross. Focus- The Blind Eye.jpg", audio: "NSW Police Detect. Sgt. 'Robbo'. Location- King's Cross. Focus- The Blind Eye.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Strategic Inaction', type: 'SYSTEMIC' },
            { name: 'Prot. Transport', type: 'FORCE' },
            { name: 'Evidence Supp.', type: 'LEGAL' },
            { name: 'Op. Cover', type: 'DEFENSE' }
        ],
        vulnerabilities: [
            { name: 'Pension', type: 'TRANSACTIONAL' },
            { name: 'Locker', type: 'INTEL' },
            { name: 'Rookie', type: 'THREAT' },
            { name: 'Health', type: 'BIO' }
        ],
        spheres: [
            { name: 'Law Enforcement', effect: 'POWER' },
            { name: 'The Blind Eye', effect: 'BYPASS' },
            { name: 'Peace Mgmt', effect: 'STABILIZE' },
            { name: 'Kings Cross', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'insp_weber',
        anchor: { name: "Insp. Weber", role: "Police Inspector", img: "Inspector Klaus Weber. Location- Berlin. Focus- Chain of Custody.jpg", audio: "Inspector Klaus Weber. Location- Berlin. Focus- Chain of Custody.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Evidence Loss', type: 'SYSTEMIC' },
            { name: 'Proc. Delay', type: 'SYSTEMIC' },
            { name: 'Seizure Lock', type: 'LEGAL' },
            { name: 'Internal Leak', type: 'INTEL' }
        ],
        vulnerabilities: [
            { name: 'Past', type: 'MEDIA' },
            { name: 'Debt', type: 'TRANSACTIONAL' },
            { name: 'Wife', type: 'EXISTENTIAL' },
            { name: 'Record', type: 'EGO' }
        ],
        spheres: [
            { name: 'Enforcement', effect: 'POWER' },
            { name: 'Proc. Sabotage', effect: 'DELAY' },
            { name: 'Asset Limbo', effect: 'BLOCK' },
            { name: 'Berlin', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'capt_sully',
        anchor: { name: "Capt. Sully", role: "Harbour Master", img: "Captain 'Sully' Sullivan. Role- Harbour Master. Location- Port of New York. Focus- The Tide .jpg", audio: "Captain 'Sully' Sullivan. Role- Harbour Master. Location- Port of New York. Focus- The Tide.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Logistical Choke', type: 'OBJECTIVE' },
            { name: 'Channel Block', type: 'FORCE' },
            { name: 'Bureau. Delay', type: 'SYSTEMIC' },
            { name: 'Union Solid.', type: 'SYSTEMIC' }
        ],
        vulnerabilities: [
            { name: 'Son', type: 'EXISTENTIAL' },
            { name: 'Pension', type: 'TRANSACTIONAL' },
            { name: 'Vice', type: 'TRAP' },
            { name: 'Asset', type: 'TRANSACTIONAL' }
        ],
        spheres: [
            { name: 'Logistics Choke', effect: 'BLOCK' },
            { name: 'Supply Starve', effect: 'DRAIN' },
            { name: 'Union Mob', effect: 'STRENGTH' },
            { name: 'Port of NY', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'sal_doorman',
        anchor: { name: "Sal", role: "Doorman", img: "Sal the Doorman. Role- Building Union Rep. Location- Upper East Side, NYC. Focus- The Gatekeeper.jpg", audio: "Sal the Doorman. Role- Building Union Rep. Location- Upper East Side, NYC. Focus- The Gatekeeper.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Phys. Obstruct', type: 'FORCE' },
            { name: 'Garbage Strike', type: 'SYSTEMIC' },
            { name: 'Impound', type: 'LEGAL' },
            { name: 'Access Denial', type: 'FORCE' }
        ],
        vulnerabilities: [
            { name: 'Cousin', type: 'LEGAL' },
            { name: 'Union', type: 'SYSTEMIC' },
            { name: 'Family', type: 'EXISTENTIAL' },
            { name: 'Health', type: 'BIO' }
        ],
        spheres: [
            { name: 'Phys. Access', effect: 'ACCESS' },
            { name: 'Gatekeeper', effect: 'BLOCK' },
            { name: 'Asset Impound', effect: 'THEFT' },
            { name: 'NYC East Side', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'old_miller',
        anchor: { name: "'Old Man' Miller", role: "Station Owner", img: "Miller. Role- Station Owner. Location- Northern Territory, Australia. Focus- Trespass.jpg", audio: "Miller. Role- Station Owner. Location- Northern Territory, Australia. Focus- Trespass.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Airspace Denial', type: 'FORCE' },
            { name: 'Territorial Sov.', type: 'LEGAL' },
            { name: 'Surv. Blindspot', type: 'INTEL' },
            { name: 'Lethal Det.', type: 'FORCE' }
        ],
        vulnerabilities: [
            { name: 'Land', type: 'LEGAL' },
            { name: 'Health', type: 'BIO' },
            { name: 'Supply', type: 'LOGISTICS' },
            { name: 'Dog', type: 'EXISTENTIAL' }
        ],
        spheres: [
            { name: 'Land Control', effect: 'POWER' },
            { name: 'Black Hole', effect: 'HIDE' },
            { name: 'Air Denial', effect: 'DEFENSE' },
            { name: 'Outback', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'truckie_dave',
        anchor: { name: "Truckie Dave", role: "Driver", img: "Logistics Truckie Dave. Location- Port Botany. Focus- The Container.jpg", audio: "Logistics Truckie Dave. Location- Port Botany. Focus- The Container.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Customs Bypass', type: 'SYSTEMIC' },
            { name: 'Speed Opt.', type: 'TIMING' },
            { name: 'Supply Inject', type: 'LOGISTICS' },
            { name: 'Human Net', type: 'SOCIAL' }
        ],
        vulnerabilities: [
            { name: 'Health', type: 'BIO' },
            { name: 'Family', type: 'EXISTENTIAL' },
            { name: 'Vehicle', type: 'TRANSACTIONAL' },
            { name: 'Record', type: 'LEGAL' }
        ],
        spheres: [
            { name: 'Cargo Trans', effect: 'MOVE' },
            { name: 'Express Lane', effect: 'SPEED' },
            { name: 'Supply Inject', effect: 'HIDE' },
            { name: 'Port Botany', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'silas_kovic',
        anchor: { name: "Silas Kovic", role: "Smuggler", img: "Silas Kovic. Location- Rotterdam. Cortisol- Extreme. Focus- Displacement.jpg", audio: "Silas Kovic. Location- Rotterdam. Cortisol- Extreme. Focus- Displacement.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Material Alchemy', type: 'PHYSICS' },
            { name: 'Negative Space', type: 'INTEL' },
            { name: 'Sensor Evasion', type: 'SYSTEMIC' },
            { name: 'Logistical Camo', type: 'LOGISTICS' }
        ],
        vulnerabilities: [
            { name: 'Health', type: 'BIO' },
            { name: 'Paranoia', type: 'PSYCH' },
            { name: 'Refugees', type: 'PSYCH' },
            { name: 'Debt', type: 'TRANSACTIONAL' }
        ],
        spheres: [
            { name: 'Logistics', effect: 'MOVE' },
            { name: 'Mat. Alchemy', effect: 'HIDE' },
            { name: 'Displacement', effect: 'SMUGGLE' },
            { name: 'Rotterdam', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'big_al',
        anchor: { name: "Big Al", role: "Union Rep", img: "Union Rep - Big Al -  Detroit. Focus- Slowdown.jpg", audio: "Union Rep - Big Al -  Detroit. Focus- Slowdown.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Work-to-Rule', type: 'SYSTEMIC' },
            { name: 'Malicious Comp.', type: 'SABOTAGE' },
            { name: 'Mgmt Panic', type: 'PSYCH' },
            { name: 'Safety Shield', type: 'LEGAL' }
        ],
        vulnerabilities: [
            { name: 'Health', type: 'BIO' },
            { name: 'Pension', type: 'TRANSACTIONAL' },
            { name: 'Family', type: 'EXISTENTIAL' },
            { name: 'Past', type: 'LEGAL' }
        ],
        spheres: [
            { name: 'Labor', effect: 'POWER' },
            { name: 'Prod. Halt', effect: 'STOP' },
            { name: 'Safety Weapon', effect: 'DEFENSE' },
            { name: 'Detroit', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'daz_omalley',
        anchor: { name: "Daz O'Malley", role: "Union Delegate", img: "Darren 'Daz' O’Malley. CFMEU (Union) Delegate. Location- Job Site, Western Sydney. Focus- The Slowdown.jpg", audio: "Darren 'Daz' O’Malley. CFMEU (Union) Delegate. Location- Job Site, Western Sydney. Focus- The Slowdown.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Time Sabotage', type: 'TIMING' },
            { name: 'Safety Shield', type: 'LEGAL' },
            { name: 'Cost Inflation', type: 'TRANSACTIONAL' },
            { name: 'Site Paralysis', type: 'FORCE' }
        ],
        vulnerabilities: [
            { name: 'Mistress', type: 'EXISTENTIAL' },
            { name: 'Financial', type: 'TRANSACTIONAL' },
            { name: 'Rivalry', type: 'THREAT' },
            { name: 'Legal', type: 'LEGAL' }
        ],
        spheres: [
            { name: 'Site Paralysis', effect: 'STOP' },
            { name: 'Extortion', effect: 'DRAIN' },
            { name: 'Pol. Shield', effect: 'DEFENSE' },
            { name: 'West Sydney', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'julian_moretti',
        anchor: { name: "Julian Moretti", role: "Repo Man", img: "Julian Moretti. Location- Miami. Focus- The Spread.jpg", audio: "Julian Moretti. Location- Miami. Focus- The Spread.wav", hoverScale: 3.0 },
        skills: [
            { name: 'IoT Killswitch', type: 'INTEL' },
            { name: 'Predatory Fees', type: 'TRANSACTIONAL' },
            { name: 'Humiliation', type: 'PSYCH' },
            { name: 'Sadistic Timing', type: 'TIMING' }
        ],
        vulnerabilities: [
            { name: 'Ego', type: 'EGO' },
            { name: 'Mother', type: 'EXISTENTIAL' },
            { name: 'Flash', type: 'MEDIA' },
            { name: 'Rivals', type: 'THREAT' }
        ],
        spheres: [
            { name: 'Repossession', effect: 'SEIZE' },
            { name: 'Immobilization', effect: 'STOP' },
            { name: 'Social Lev.', effect: 'ATTACK' },
            { name: 'Miami', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'arthur_penn',
        anchor: { name: "Arthur Penn", role: "Code Enforcement", img: "Arthur Penn. Location- Mobile. Cortisol- Low. Focus- Code Enforcement.jpg", audio: "Arthur Penn. Location- Mobile. Cortisol- Low. Focus- Code Enforcement.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Slow Poison', type: 'SYSTEMIC' },
            { name: 'Hist. Auditing', type: 'INTEL' },
            { name: 'Litig. Attrition', type: 'LEGAL' },
            { name: 'Invis. Destruct', type: 'SYSTEMIC' }
        ],
        vulnerabilities: [
            { name: 'Wife', type: 'LEGAL' },
            { name: 'Routine', type: 'PSYCH' },
            { name: 'Financial', type: 'TRANSACTIONAL' },
            { name: 'Ego', type: 'EGO' }
        ],
        spheres: [
            { name: 'Sterilization', effect: 'DEVALUE' },
            { name: 'Slow Poison', effect: 'DRAIN' },
            { name: 'Retro Liability', effect: 'TRAP' },
            { name: 'Mobile', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'david_g',
        anchor: { name: "David G.", role: "City Planner", img: "David_G._City_Planner-_Vancou_91a6b34d-7d10-4ac0-bc23-92bf5463b300_0.jpg", audio: "City Planner David G. Vancouver. Focus- Sunlight Access.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Shadow Studies', type: 'SYSTEMIC' },
            { name: 'Interest Bleed', type: 'TRANSACTIONAL' },
            { name: 'Price Manip', type: 'TRANSACTIONAL' },
            { name: 'Reg. Arbitrage', type: 'LEGAL' }
        ],
        vulnerabilities: [
            { name: 'Real Estate', type: 'LEGAL' },
            { name: 'Wife', type: 'LEGAL' },
            { name: 'Digital', type: 'INTEL' },
            { name: 'Ambition', type: 'EGO' }
        ],
        spheres: [
            { name: 'Dev. Veto', effect: 'STOP' },
            { name: 'Capital Trap', effect: 'TRAP' },
            { name: 'Val. Arbitrage', effect: 'DEVALUE' },
            { name: 'Vancouver', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'mrs_higgins',
        anchor: { name: "Mrs. Higgins", role: "HOA Head", img: "Zoning Board Head Mrs. Higgins. HOA. Florida. Focus- Aesthetics.jpg", audio: "Zoning Board Head Mrs. Higgins. HOA. Florida. Focus- Aesthetics.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Aesthetic Lien', type: 'LEGAL' },
            { name: 'Foreclosure', type: 'TRANSACTIONAL' },
            { name: 'Bylaw Tyranny', type: 'SYSTEMIC' },
            { name: 'Prop. Seizure', type: 'LEGAL' }
        ],
        vulnerabilities: [
            { name: 'Power', type: 'EGO' },
            { name: 'Husband', type: 'EXISTENTIAL' },
            { name: 'Hypocrisy', type: 'LEGAL' },
            { name: 'Fear', type: 'PSYCH' }
        ],
        spheres: [
            { name: 'Regulation', effect: 'CONTROL' },
            { name: 'Prop. Seizure', effect: 'THEFT' },
            { name: 'Aes. Veto', effect: 'BLOCK' },
            { name: 'Florida', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'tax_miller',
        anchor: { name: "Tax Assessor Miller", role: "Tax Assessor", img: "Tax Assessor Miller. London. Focus- Revaluation.jpg", audio: "Tax Assessor Miller. London. Focus- Revaluation.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Punitive Reval', type: 'TRANSACTIONAL' },
            { name: 'Forced Liq.', type: 'TRANSACTIONAL' },
            { name: 'Value Manip', type: 'SYSTEMIC' },
            { name: 'Renov. Trap', type: 'LEGAL' }
        ],
        vulnerabilities: [
            { name: 'Bribes', type: 'LEGAL' },
            { name: 'Lifestyle', type: 'TRANSACTIONAL' },
            { name: 'Resentment', type: 'PSYCH' },
            { name: 'Alcohol', type: 'BIO' }
        ],
        spheres: [
            { name: 'Valuation', effect: 'POWER' },
            { name: 'Forced Liq', effect: 'ATTACK' },
            { name: 'Renov. Trap', effect: 'PUNISH' },
            { name: 'London', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'vance',
        anchor: { name: "Vance", role: "Immigration", img: "Immigration Officer Vance. JFK Airport. Focus- Visa Fatigue.jpg", audio: "Immigration Officer Vance. JFK Airport. Focus- Visa Fatigue.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Biometric Glitch', type: 'SYSTEMIC' },
            { name: 'Secondary Room', type: 'TIME' },
            { name: 'Merge Disrupt', type: 'TRANSACTIONAL' },
            { name: 'Plausible Deny', type: 'LEGAL' }
        ],
        vulnerabilities: [
            { name: 'Shift Work', type: 'PSYCH' },
            { name: 'Racism', type: 'MEDIA' },
            { name: 'Financial', type: 'TRANSACTIONAL' },
            { name: 'Health', type: 'BIO' }
        ],
        spheres: [
            { name: 'Border Denial', effect: 'BLOCK' },
            { name: 'Meet Disrupt', effect: 'DELAY' },
            { name: 'Psych Fatigue', effect: 'DRAIN' },
            { name: 'JFK', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'patent_omalley',
        anchor: { name: "Patent Clerk O'Malley", role: "Patent Clerk", img: "Patent Clerk O'Malley. DC. Focus- Prior Art.jpg", audio: "Patent Clerk O'Malley. DC. Focus- Prior Art.wav", hoverScale: 3.0 },
        skills: [
            { name: 'IP Theft', type: 'INTEL' },
            { name: 'App Denial', type: 'LEGAL' },
            { name: 'Approv. Delay', type: 'SYSTEMIC' },
            { name: 'Monopoly Grant', type: 'TRANSACTIONAL' }
        ],
        vulnerabilities: [
            { name: 'Salary', type: 'TRANSACTIONAL' },
            { name: 'Gambling', type: 'LEGAL' },
            { name: 'Insecurity', type: 'EGO' },
            { name: 'Digital', type: 'INTEL' }
        ],
        spheres: [
            { name: 'Pat. Approval', effect: 'POWER' },
            { name: 'IP Theft', effect: 'THEFT' },
            { name: 'Prior Art', effect: 'BLOCK' },
            { name: 'DC', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'cert_gary',
        anchor: { name: "Certifier Gary", role: "Priv. Certifier", img: "Private Certifier - Gary - Location- Eastern Suburbs. Focus- Occupancy Permits.jpg", audio: "Private Certifier - Gary - Location- Eastern Suburbs. Focus- Occupancy Permits.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Safety Bypass', type: 'LEGAL' },
            { name: 'Fin. Accel', type: 'TRANSACTIONAL' },
            { name: 'Risk Transfer', type: 'LEGAL' },
            { name: 'Exit Strategy', type: 'PLAN' }
        ],
        vulnerabilities: [
            { name: 'Insurance', type: 'LEGAL' },
            { name: 'Bali', type: 'TRANSACTIONAL' },
            { name: 'Alcohol', type: 'BIO' },
            { name: 'Ex-Wives', type: 'EXISTENTIAL' }
        ],
        spheres: [
            { name: 'Approval', effect: 'ACCESS' },
            { name: 'Cash Release', effect: 'SPEED' },
            { name: 'Liab. Sponge', effect: 'DEFENSE' },
            { name: 'East Suburbs', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'strata_gary',
        anchor: { name: "Strata Gary", role: "Strata Mgr", img: "Strata Manager Gary Location North Sydney. Focus Fire Safety Rectification.jpg", audio: "Strata Manager Gary. Location North Sydney. Focus Fire Safety Rectification.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Cost Inflation', type: 'TRANSACTIONAL' },
            { name: 'Levy Loading', type: 'TRANSACTIONAL' },
            { name: 'Vendor Lock', type: 'SYSTEMIC' },
            { name: 'Fin. Parasite', type: 'TRANSACTIONAL' }
        ],
        vulnerabilities: [
            { name: 'Wife', type: 'EXISTENTIAL' },
            { name: 'Travel', type: 'MEDIA' },
            { name: 'Audit', type: 'LEGAL' },
            { name: 'Gambling', type: 'TRANSACTIONAL' }
        ],
        spheres: [
            { name: 'Building Mgmt', effect: 'CONTROL' },
            { name: 'Siphoning', effect: 'DRAIN' },
            { name: 'Vendor Lock', effect: 'CYCLE' },
            { name: 'North Sydney', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'strata_karen',
        anchor: { name: "Strata Karen", role: "Strata Mgr", img: "Strata Manager Karen. Location- North Sydney. Focus- Kickbacks.jpg", audio: "Strata Manager Karen. Location- North Sydney. Focus- Kickbacks.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Fab. Failure', type: 'SYSTEMIC' },
            { name: 'Reg. Fear', type: 'PSYCH' },
            { name: 'Bid Rigging', type: 'TRANSACTIONAL' },
            { name: 'Fee Launder', type: 'TRANSACTIONAL' }
        ],
        vulnerabilities: [
            { name: 'Contractor', type: 'EXISTENTIAL' },
            { name: 'Lifestyle', type: 'TRANSACTIONAL' },
            { name: 'Ego', type: 'EGO' },
            { name: 'Record', type: 'LEGAL' }
        ],
        spheres: [
            { name: 'Compliance', effect: 'POWER' },
            { name: 'Reg. Terror', effect: 'ATTACK' },
            { name: 'Laundering', effect: 'CLEAN' },
            { name: 'North Sydney', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'the_victim',
        anchor: { name: "The Victim (Trish)", role: "Principal", img: "The Victim. Role - Principal. Location - South Sydney Focus - The Union - Shield.jpg", audio: "The Victim. Role - Principal. Location - South Sydney Focus - The Union - Shield.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Vex. Labeling', type: 'LEGAL' },
            { name: 'Union Weapon', type: 'FORCE' },
            { name: 'Dig. Blackout', type: 'SYSTEMIC' },
            { name: 'Narrative Flip', type: 'MEDIA' }
        ],
        vulnerabilities: [
            { name: 'Reputation', type: 'MEDIA' },
            { name: 'Staff', type: 'THREAT' },
            { name: 'Education', type: 'SYSTEMIC' },
            { name: 'Legal', type: 'LEGAL' }
        ],
        spheres: [
            { name: 'Admin', effect: 'CONTROL' },
            { name: 'Suppress', effect: 'SILENCE' },
            { name: 'Union Shield', effect: 'DEFENSE' },
            { name: 'South Sydney', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'uni_vc',
        anchor: { name: "University VC", role: "Uni Admin", img: "University Vice-Chancellor. Location- Inner City Campus. Focus- Foreign Fees.jpg", audio: "University Vice-Chancellor. Location- Inner City Campus. Focus- Foreign Fees.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Visa Factory', type: 'LEGAL' },
            { name: 'Acad. Erosion', type: 'SYSTEMIC' },
            { name: 'Pathway Prog', type: 'SYSTEMIC' },
            { name: 'Cash Depend', type: 'TRANSACTIONAL' }
        ],
        vulnerabilities: [
            { name: 'Rankings', type: 'EGO' },
            { name: 'Staff', type: 'INTEL' },
            { name: 'Government', type: 'LEGAL' },
            { name: 'Salary', type: 'MEDIA' }
        ],
        spheres: [
            { name: 'Admissions', effect: 'ACCESS' },
            { name: 'Visa Factory', effect: 'MOVE' },
            { name: 'Erosion', effect: 'WEAKEN' },
            { name: 'Inner City', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'keel_vernon',
        anchor: { name: "Keel Vernon", role: "Tribunal Adj.", img: "Mr Keel Vernon_ Tenancy Tribunal Adjudicator. Location_ Washington. Focus_ The Fine Print..jpg", audio: "Mr Keel Vernon Tenancy Tribunal Adjudicator. Location Washington. Physically strong man, Focus The Fine Print.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Legal Stall', type: 'TIME' },
            { name: 'Punitive Dmg', type: 'TRANSACTIONAL' },
            { name: 'Audit Threat', type: 'LEGAL' },
            { name: 'Moral Arb.', type: 'PSYCH' }
        ],
        vulnerabilities: [
            { name: 'Mother', type: 'EXISTENTIAL' },
            { name: 'Collection', type: 'TRANSACTIONAL' },
            { name: 'Employment', type: 'LEGAL' },
            { name: 'Safety', type: 'BIO' }
        ],
        spheres: [
            { name: 'Eviction Ctrl', effect: 'BLOCK' },
            { name: 'Asset Freeze', effect: 'TRAP' },
            { name: 'Contagion', effect: 'SPREAD' },
            { name: 'Washington', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'judge_forde',
        anchor: { name: "Judge Forde", role: "Judge", img: "Judge Harrison Forde. Location- Chicago. Focus- Self-Preservation.jpg", audio: "Judge Harrison Forde. Location- Chicago. Focus- Self-Preservation.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Judicial Delay', type: 'TIME' },
            { name: 'Insider Trade', type: 'TRANSACTIONAL' },
            { name: 'Paperwork Err', type: 'SYSTEMIC' },
            { name: 'Compromised', type: 'LEGAL' }
        ],
        vulnerabilities: [
            { name: 'Daughter', type: 'TRANSACTIONAL' },
            { name: 'Wife', type: 'TRANSACTIONAL' },
            { name: 'Clerk', type: 'INTEL' },
            { name: 'Tech', type: 'INTEL' }
        ],
        spheres: [
            { name: 'Rulings', effect: 'POWER' },
            { name: 'Market Time', effect: 'PROFIT' },
            { name: 'Warrant Deny', effect: 'DEFENSE' },
            { name: 'Chicago', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'shadow_minister',
        anchor: { name: "Shadow Minister", role: "Politician", img: "Infrastructure Minister (Shadow). Location- Parliament House. Focus- The Map.jpg", audio: "Infrastructure Minister (Shadow). Location- Parliament House. Focus- The Map.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Insider Land', type: 'TRANSACTIONAL' },
            { name: 'Proxy Purch', type: 'LEGAL' },
            { name: 'Val Multiplier', type: 'TRANSACTIONAL' },
            { name: 'Policy Manip', type: 'SYSTEMIC' }
        ],
        vulnerabilities: [
            { name: 'BrotherInLaw', type: 'INTEL' },
            { name: 'Electorate', type: 'MEDIA' },
            { name: 'Mistress', type: 'EXISTENTIAL' },
            { name: 'Party', type: 'POLITICAL' }
        ],
        spheres: [
            { name: 'Foreknowledge', effect: 'INTEL' },
            { name: 'Land Bank', effect: 'WEALTH' },
            { name: 'Route Manip', effect: 'CONTROL' },
            { name: 'Parliament', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'epa_jenkins',
        anchor: { name: "EPA Jenkins", role: "Auditor", img: "EPA_Auditor_Jenkins._Seattle._Focus-_Soil_Sample.jpg", audio: "EPA Auditor Jenkins. Seattle. Focus- Soil Samples.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Phase 2 Frz', type: 'TIME' },
            { name: 'Loan Destruct', type: 'TRANSACTIONAL' },
            { name: 'Tech Traces', type: 'INTEL' },
            { name: 'Fed Escalation', type: 'LEGAL' }
        ],
        vulnerabilities: [
            { name: 'Student Debt', type: 'TRANSACTIONAL' },
            { name: 'Resentment', type: 'PSYCH' },
            { name: 'Wife', type: 'LEGAL' },
            { name: 'Home', type: 'LEGAL' }
        ],
        spheres: [
            { name: 'Stasis', effect: 'STOP' },
            { name: 'Decapitate', effect: 'KILL' },
            { name: 'Escalation', effect: 'ATTACK' },
            { name: 'Seattle', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'health_ray',
        anchor: { name: "Health Ray", role: "Inspector", img: "Health Inspector Ray. NYC. Focus- Grade Pending.jpg", audio: "Health Inspector Ray. NYC. Focus- Grade Pending.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Weekend Kill', type: 'TIMING' },
            { name: 'Temp Tech', type: 'SYSTEMIC' },
            { name: 'Condemn Stock', type: 'TRANSACTIONAL' },
            { name: 'Correction', type: 'PSYCH' }
        ],
        vulnerabilities: [
            { name: 'Bribes', type: 'LEGAL' },
            { name: 'Brother', type: 'LEGAL' },
            { name: 'Debt', type: 'TRANSACTIONAL' },
            { name: 'Habit', type: 'BIO' }
        ],
        spheres: [
            { name: 'Shutdown', effect: 'STOP' },
            { name: 'Weekend Kill', effect: 'DRAIN' },
            { name: 'Brand Kill', effect: 'DEVALUE' },
            { name: 'NYC', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'hector_salamanca',
        anchor: { name: "Hector Salamanca", role: "Hydraulic", img: "Hector Salamanca. Location- Mexico City. Focus- Hydraulic Pressure.jpg", audio: "Hector Salamanca. Location- Mexico City. Focus- Hydraulic Pressure.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Supply Choke', type: 'PHYSICS' },
            { name: 'Panic Mfg', type: 'PSYCH' },
            { name: 'Market Manip', type: 'TRANSACTIONAL' },
            { name: 'Ctrl Control', type: 'SYSTEMIC' }
        ],
        vulnerabilities: [
            { name: 'Family', type: 'EXISTENTIAL' },
            { name: 'Cartel', type: 'THREAT' },
            { name: 'Health', type: 'BIO' },
            { name: 'Greed', type: 'TRANSACTIONAL' }
        ],
        spheres: [
            { name: 'Throttling', effect: 'CONTROL' },
            { name: 'Panic Mfg', effect: 'PROFIT' },
            { name: 'Unrest', effect: 'CHAOS' },
            { name: 'Mexico City', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'diego',
        anchor: { name: "Diego", role: "Water Eng.", img: "Diego._Role-_tough_Water_Engineer._Location-_Mexico.jpg", audio: "Diego. Role- Water Engineer. Location- Mexico City. Focus- The Valve.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Infra Denial', type: 'PHYSICS' },
            { name: 'Moral Resist', type: 'PSYCH' },
            { name: 'Phys Access', type: 'FORCE' },
            { name: 'Health Lev.', type: 'MEDIA' }
        ],
        vulnerabilities: [
            { name: 'Mother', type: 'EXISTENTIAL' },
            { name: 'Safety', type: 'THREAT' },
            { name: 'Housing', type: 'LEGAL' },
            { name: 'Anonymity', type: 'INTEL' }
        ],
        spheres: [
            { name: 'Control', effect: 'ACCESS' },
            { name: 'Roadblock', effect: 'BLOCK' },
            { name: 'Human Shield', effect: 'DEFENSE' },
            { name: 'Mexico City', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'john_p',
        anchor: { name: "John P.", role: "Grid Eng.", img: "Grid Engineer John P. Location- Texas. Focus- plausible Deniability.jpg", audio: "Grid Engineer John P. Location- Texas. Focus- plausible Deniability.wav", hoverScale: 3.0 },
        skills: [
            { name: '90s Window', type: 'TIMING' },
            { name: 'SCADA Reboot', type: 'SYSTEMIC' },
            { name: 'Fed Evasion', type: 'LEGAL' },
            { name: 'Blind Spots', type: 'INTEL' }
        ],
        vulnerabilities: [
            { name: 'Gaming', type: 'PSYCH' },
            { name: 'Hardware', type: 'INTEL' },
            { name: 'Social', type: 'PSYCH' },
            { name: 'Mother', type: 'EXISTENTIAL' }
        ],
        spheres: [
            { name: 'Blackout', effect: 'CONTROL' },
            { name: 'Window', effect: 'ACCESS' },
            { name: 'Erasure', effect: 'HIDE' },
            { name: 'Texas', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'the_locksmith',
        anchor: { name: "The Locksmith", role: "Hacker", img: "The Locksmith. Location- Dark Web. Focus- Digital Planting.jpg", audio: "The Locksmith. Location- Dark Web. Focus- Digital Planting.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Dig. Frame', type: 'INTEL' },
            { name: 'Evid. Fab', type: 'SYSTEMIC' },
            { name: 'Plaus. Deny', type: 'LEGAL' },
            { name: 'Life Destruct', type: 'MEDIA' }
        ],
        vulnerabilities: [
            { name: 'Identity', type: 'LEGAL' },
            { name: 'Health', type: 'BIO' },
            { name: 'Ego', type: 'EGO' },
            { name: 'Hardware', type: 'PHYSICS' }
        ],
        spheres: [
            { name: 'Cyber Access', effect: 'ACCESS' },
            { name: 'Planting', effect: 'ATTACK' },
            { name: 'History Fab', effect: 'LIE' },
            { name: 'Dark Web', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'vip_manager',
        anchor: { name: "VIP Manager", role: "Pub Mgr", img: "The VIP Lounge Manager. Location- Large Pub in Bankstown. Focus- The Rinse.jpg", audio: "The VIP Lounge Manager. Location- Large Pub in Bankstown. Focus- The Rinse.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Money Laundry', type: 'TRANSACTIONAL' },
            { name: 'The Rinse', type: 'SYSTEMIC' },
            { name: 'Complicity', type: 'LEGAL' },
            { name: 'Volume Proc.', type: 'TRANSACTIONAL' }
        ],
        vulnerabilities: [
            { name: 'CCTV', type: 'INTEL' },
            { name: 'Gangs', type: 'THREAT' },
            { name: 'License', type: 'LEGAL' },
            { name: 'Greed', type: 'EGO' }
        ],
        spheres: [
            { name: 'Gambling', effect: 'PROFIT' },
            { name: 'The Rinse', effect: 'CLEAN' },
            { name: 'Tax Shield', effect: 'DEFENSE' },
            { name: 'Bankstown', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'jono',
        anchor: { name: "Jono", role: "Real Estate", img: "Real Estate Agent Jono. Location- Auction, Mosman. Focus- Dummy Bidding.jpg", audio: "Real Estate Agent Jono. Location- Auction, Mosman. Focus- Dummy Bidding.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Price Manip', type: 'TRANSACTIONAL' },
            { name: 'Psych Press', type: 'PSYCH' },
            { name: 'Market Dist', type: 'SYSTEMIC' },
            { name: 'Comms Max', type: 'TRANSACTIONAL' }
        ],
        vulnerabilities: [
            { name: 'Debt', type: 'TRANSACTIONAL' },
            { name: 'Drugs', type: 'BIO' },
            { name: 'Reputation', type: 'MEDIA' },
            { name: 'Ego', type: 'EGO' }
        ],
        spheres: [
            { name: 'Prop. Sales', effect: 'MOVE' },
            { name: 'Price Infl', effect: 'CLEAN' },
            { name: 'FOMO', effect: 'ATTACK' },
            { name: 'Mosman', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'tabloid_baz',
        anchor: { name: "Tabloid Baz", role: "Editor", img: "Tabloid Editor Baz Location- Surry Hills. Focus- Protection Racket.jpg", audio: "Tabloid Editor Baz Location- Surry Hills. Focus- Protection Racket.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Catch & Kill', type: 'MEDIA' },
            { name: 'Blackmail', type: 'INTEL' },
            { name: 'Distortion', type: 'MEDIA' },
            { name: 'Public Shield', type: 'DEFENSE' }
        ],
        vulnerabilities: [
            { name: 'Cocaine', type: 'BIO' },
            { name: 'Sources', type: 'INTEL' },
            { name: 'Legal', type: 'LEGAL' },
            { name: 'Family', type: 'EXISTENTIAL' }
        ],
        spheres: [
            { name: 'Publication', effect: 'BROADCAST' },
            { name: 'Prot. Racket', effect: 'EXTORT' },
            { name: 'Catch & Kill', effect: 'SILENCE' },
            { name: 'Surry Hills', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'dr_thorne',
        anchor: { name: "Dr. Thorne", role: "Psychologist", img: "Dr._Aris_Thorne._Seoul.jpg", audio: "Dr. Aris Thorne. Location- Seoul. Cortisol- Flatline. Focus- Variable Testin.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Dopa Break', type: 'BIO' },
            { name: 'Credit Anx', type: 'SYSTEMIC' },
            { name: 'Risk Aversion', type: 'PSYCH' },
            { name: 'Uncertainty', type: 'CHAOS' }
        ],
        vulnerabilities: [
            { name: 'Research', type: 'LEGAL' },
            { name: 'Ego', type: 'EGO' },
            { name: 'Funding', type: 'TRANSACTIONAL' },
            { name: 'Brother', type: 'EXISTENTIAL' }
        ],
        spheres: [
            { name: 'Behavior Mod', effect: 'CONTROL' },
            { name: 'Soft Breaker', effect: 'ATTACK' },
            { name: 'Algo Invis', effect: 'HIDE' },
            { name: 'Seoul', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'the_liability',
        anchor: { name: "The Liability", role: "Gopher", img: "The Liability. Role- Gopher. Location- The Warehouse. Focus Workplace Health and Safety.jpg", audio: "The Liability. Role- Gopher. Location- The Warehouse. Focus Workplace Health and Safety.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Accidental', type: 'SYSTEMIC' },
            { name: 'Paper Hazard', type: 'LEGAL' },
            { name: 'Whistleblow', type: 'INTEL' },
            { name: 'Camo', type: 'SYSTEMIC' }
        ],
        vulnerabilities: [
            { name: 'Low IQ', type: 'PSYCH' },
            { name: 'Fear', type: 'PSYCH' },
            { name: 'Money', type: 'TRANSACTIONAL' },
            { name: 'Mouth', type: 'INTEL' }
        ],
        spheres: [
            { name: 'Admin', effect: 'WORK' },
            { name: 'Legitimacy', effect: 'HIDE' },
            { name: 'Chaos', effect: 'EXPLODE' },
            { name: 'Warehouse', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'sarah_lin',
        anchor: { name: "Sarah Lin", role: "IP Lawyer", img: "Sarah Lin. Location- Hong Kong. Focus- The Fine Print.jpg", audio: "Sarah Lin. Location- Hong Kong. Focus- The Fine Print.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Patent Troll', type: 'LEGAL' },
            { name: 'Litig Burial', type: 'TRANSACTIONAL' },
            { name: 'Tech Acq.', type: 'TRANSACTIONAL' },
            { name: 'Innov Stifle', type: 'SYSTEMIC' }
        ],
        vulnerabilities: [
            { name: 'Family', type: 'EXISTENTIAL' },
            { name: 'Ethics', type: 'PSYCH' },
            { name: 'Assets', type: 'TRANSACTIONAL' },
            { name: 'Burnout', type: 'BIO' }
        ],
        spheres: [
            { name: 'Litigation', effect: 'ATTACK' },
            { name: 'Tech Killer', effect: 'DESTROY' },
            { name: 'Scavenger', effect: 'PROFIT' },
            { name: 'Hong Kong', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'icac_mole',
        anchor: { name: "ICAC Investigator", role: "Investigator", img: "ICAC Investigator (Compromised). Location- Macquarie St. Focus- The Leak.jpg", audio: "ICAC Investigator (Compromised). Location- Macquarie St. Focus- The Leak.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Legal Loop', type: 'LEGAL' },
            { name: 'Pub Sabotage', type: 'MEDIA' },
            { name: 'Inadmissible', type: 'LEGAL' },
            { name: 'Control Fail', type: 'SYSTEMIC' }
        ],
        vulnerabilities: [
            { name: 'Lifestyle', type: 'TRANSACTIONAL' },
            { name: 'Gambling', type: 'TRANSACTIONAL' },
            { name: 'Partner', type: 'EXISTENTIAL' },
            { name: 'Paranoia', type: 'PSYCH' }
        ],
        spheres: [
            { name: 'Investigate', effect: 'ACCESS' },
            { name: 'Legal Loop', effect: 'SAVE' },
            { name: 'Poisoning', effect: 'DESTROY' },
            { name: 'Macquarie St', effect: 'TERRITORY' }
        ]
    },
    {
        id: 'the_marker',
        anchor: { name: "The Marker", role: "Principal", img: "The Victim. Role - Principal. Location - South Sydney Focus - The Union - Shield.jpg", audio: "The Victim. Role - Principal. Location - South Sydney Focus - The Union - Shield.wav", hoverScale: 3.0 },
        skills: [
            { name: 'Acad. Lev.', type: 'SYSTEMIC' },
            { name: 'Harassment', type: 'PSYCH' },
            { name: 'Stonewall', type: 'SYSTEMIC' },
            { name: 'Union Shield', type: 'FORCE' }
        ],
        vulnerabilities: [
            { name: 'Reputation', type: 'MEDIA' },
            { name: 'Staff', type: 'THREAT' },
            { name: 'Education', type: 'SYSTEMIC' },
            { name: 'Legal', type: 'LEGAL' }
        ],
        spheres: [
            { name: 'Admin', effect: 'CONTROL' },
            { name: 'Suppress', effect: 'SILENCE' },
            { name: 'Union Shield', effect: 'DEFENSE' },
            { name: 'South Sydney', effect: 'TERRITORY' }
        ]
    }
];

// Helper to export for engine
if (typeof module !== 'undefined') module.exports = { RYKER_NODES, R2_AUDIO, R2_PICS };