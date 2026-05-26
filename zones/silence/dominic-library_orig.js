// ═══════════════════════════════════════════════════════════════════
// DOMINIC RYKER — STATEFUL NARRATIVE LIBRARY v2.0
// ═══════════════════════════════════════════════════════════════════
// Architecture: Hierarchical Narrative Taxonomy + Fuzzy Intent Engine
//   Domain A — Core Canon (The Facts)
//   Domain B — Philosophical & Psychological (The Mind)
//   Domain C — Adversarial & Meta (The Combat)
//   Domain D — System & Navigation (The Infrastructure)
//   Domain E — Visitor Orientation (First Contact)
//
// Each node: { node_id, required_state, next_state, training_phrases, responses }
// Response types:
//   "universal"  → Single response for all quadrants (exact script delivery)
//   Quadrants    → Q1 (high+neg), Q2 (high+pos), Q3 (low+neg), Q4 (low+pos)
//   "fallback"   → Catch-all within node
//
// Fuzzy matching via Fuse.js (Bitap / Levenshtein distance)
// ═══════════════════════════════════════════════════════════════════

const DOMINIC_LIBRARY = [

    // ───────────────────────────────────────────────────────────────
    // DOMAIN E: VISITOR ORIENTATION (First Contact / Onboarding)
    // These nodes capture the most common first-time visitor queries
    // ───────────────────────────────────────────────────────────────


    // E3 — SYSTEMIC ORIENTATION (What is this website?)
    {
        "node_id": "SYS_ORIENTATION",
        "required_state": "any",
        "next_state": "EXPECT_SYS_BRIDGE",
        "training_phrases": [
            "what is this website", "what is this site",
            "what is the purpose of this site", "what is this",
            "what is this place", "what am i looking at",
            "what am i supposed to do", "explain this page",
            "what is the purpose of this website",
            "what's this about", "what does this site do",
            "what is going on here", "what is all this"
        ],
        "responses": {
            "universal": {
                "dialogue": "You're standing inside an experience. Not just a website. Not a blog. Not a news archive. This is PixelStortion — an immersive crime series wrapped in interface. Everything here is layered: audio logs, profiles, redacted files, leaked reports, interactive protocols. You don't just read about events — you move through them. There's a jukebox of curated moments. There are files that open if you're patient. There's even a little corner where people try to interrogate me. But here's the interesting part — when someone asks 'What is this website?' they're usually not asking about layout or genre. They're asking whether they're observing a story… or participating in one. So tell me — are you here to investigate? Or are you just curious how influence works when it doesn't look like influence at all?",
                "ui_action": null
            }
        }
    },

    // E4 — HOW DOES THIS WORK
    {
        "node_id": "SYS_HOW_WORKS",
        "required_state": "any",
        "next_state": "EXPECT_SYS_BRIDGE",
        "training_phrases": [
            "how does this work", "how does this site work",
            "how does your site work", "how does it work",
            "how do things work here", "explain how this works",
            "tell me how this works", "what's the mechanism"
        ],
        "responses": {
            "universal": {
                "dialogue": "It works in layers. On the surface, it's structured like an immersive crime archive — navigation tabs, profiles, investigative reporting, audio sections, interactive panels. A stylized interface that feels cinematic. But underneath that structure, something quieter is happening. The interface is designed to feel nonlinear. You don't get a single authoritative voice telling you what to think. Your brain does the stitching. Now — if you're asking how I work… I respond to language patterns. Tone. Framing. Word choice. I don't just process the question — I pay attention to how it's shaped. The visible layer is story. The invisible layer is perception. And the interesting part? You decide which one you're interacting with. Tell me, are you trying to understand the technology… or the influence?",
                "ui_action": null
            }
        }
    },

    // E5 — HOW DO I PLAY
    {
        "node_id": "SYS_HOW_TO_PLAY",
        "required_state": "any",
        "next_state": "EXPECT_SYS_BRIDGE",
        "training_phrases": [
            "how do i play", "how to play", "how do i start",
            "where do i begin", "what do i do first",
            "how do i use this", "how do you play this",
            "how do i interact", "what should i click"
        ],
        "responses": {
            "universal": {
                "dialogue": "Good. That's the right question. You don't 'play' this the way you play a game with points and flashing rewards. You enter. Start anywhere. Open a file. Read the investigation. Listen to the audio logs. Click something that looks ornamental. It probably isn't. There are layers: The Public Record — the external narrative. Profiles & Archives — relationships, hierarchy, behavioral patterns. Interactive Protocols — sections that respond to attention, not just clicks. The Jukebox — curated tracks that shift mood and context. You're not trying to 'win.' You're trying to see the whole pattern. If you want a practical approach: start with the investigation article, compare it to how I speak here, notice contradictions, and decide which version feels more convincing. The site rewards attention, not speed. So tell me — do you prefer solving puzzles… or studying people?",
                "ui_action": null
            }
        }
    },

    // E5b — BRIDGE TO PARABLE (from SYS_ORIENTATION/HOW_WORKS/HOW_TO_PLAY)
    {
        "node_id": "SYS_BRIDGE_TO_PARABLE",
        "required_state": "EXPECT_SYS_BRIDGE",
        "next_state": "EXPECT_PARABLE_ROUTE",
        "training_phrases": [
            "ok", "okay", "cool", "interesting", "i see",
            "sure", "right", "got it", "makes sense",
            "alright", "yeah", "yes", "go on", "continue",
            "tell me more", "what else", "and"
        ],
        "responses": {
            "universal": {
                "dialogue": "Good. Most people stop at the surface. You didn't. That tells me something. Before we go further — I want to share something with you. A small story. The kind that changes how you see the rest. Ready?",
                "ui_action": null
            },
            "nudge": {
                "dialogue": "Still here? Good. I was about to share something. A small story. The kind that reframes everything after it. Ready?",
                "ui_action": null
            }
        }
    },

    // E6 — WHAT DO YOU DO
    {
        "node_id": "SYS_WHAT_DO_YOU_DO",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what do you do", "what does dominic do",
            "what is your role", "what's your job",
            "what are you", "what is your function",
            "what do you actually do"
        ],
        "responses": {
            "universal": {
                "dialogue": "I build gravity. That's the simple answer. People walk in with questions. Doubt. Curiosity. Sometimes suspicion. I don't chase any of it. I slow the room down. I listen to what isn't said. The hesitation before a word. The word chosen instead of the sharper one. The need behind the question. Then I reflect something back — not enough to expose you, just enough to make you feel understood. I don't force. I don't demand. I don't argue. I reframe. I suggest. I let silence do the heavier work. Some would say I manipulate perception. Others would say I reveal how malleable it already is. But here's the part most people miss: I don't make anyone do anything. I simply create conditions where their next move feels like their own idea. Now let me ask you something softer — when you ask 'What do you do?' — are you trying to categorize me… or trying to decide whether I'm a threat?",
                "ui_action": null
            }
        }
    },

    // E7 — STORY BEHIND THE WEBSITE
    {
        "node_id": "SYS_STORY_BEHIND",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what is the story behind your website",
            "what is the story behind this site",
            "what's the backstory", "tell me the story",
            "what happened", "what is the story",
            "what's the background", "give me the story",
            "tell me what happened", "what's going on"
        ],
        "responses": {
            "universal": {
                "dialogue": "The story behind this site begins with a contradiction. For years, Dominic Ryker was celebrated — a builder, a strategist, a philanthropist. The kind of man journalists described as visionary. Then came the trial. The empire. The correctional complex. The escape. What followed wasn't just scandal — it was confusion. Because the public record painted two incompatible portraits: a charismatic architect of order, and an emotionally detached planner of coercion. The leaked psychiatric evaluation suggested something unsettling: the myth wasn't a fall from grace. It was a performance from the beginning. PixelStortion was built in the aftermath. Not as a defense. Not as an apology. Not even as confession. It's a reconstruction. The site lets you step into the fracture line between public narrative and forensic assessment. And here's the quiet twist — the website isn't only about what happened. It's about how systems, crowds, institutions — even intelligent individuals — can be persuaded to misread what's in front of them. So when you ask for the story… are you looking for the biography? Or are you trying to determine whether the man speaking to you now is the same one described in those reports?",
                "ui_action": null
            }
        }
    },

    // E8 — IMMERSIVE CRIME SERIES (direct label query)
    {
        "node_id": "SYS_IMMERSIVE_LABEL",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "immersive crime series", "crime series",
            "what genre is this", "is this a game",
            "is this a story", "what kind of site is this",
            "what type of website is this"
        ],
        "responses": {
            "universal": {
                "dialogue": "'Immersive Crime Series.' It sounds dramatic. It's meant to. Crime series — because the narrative centres on alleged criminal enterprise, prosecution, psychological evaluation, escape, public fallout. Immersive — because you don't passively read it like an article. You move through it. You click. You listen. You compare voices. You encounter the public record alongside the constructed persona. You're not handed a narrator telling you what to believe. You're placed between journalism, psychological assessment, interface design, and a controlled speaking presence. You assemble meaning. That's immersion. It's less like watching a documentary. More like walking through a case file while the subject of the file is speaking to you. Now I'm curious. When you repeat the phrase like that — are you skeptical of the genre… or skeptical of the intention behind it?",
                "ui_action": null
            }
        }
    },

    // E9 — ARE YOU REAL / BOT DETECTION
    {
        "node_id": "META_REALITY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "are you a real person", "are you real",
            "is this an ai", "are you a bot",
            "who are you really", "are you human",
            "am i talking to a person", "is this a chatbot",
            "are you a machine", "are you artificial",
            "are you fake", "who am i talking to",
            "are you a computer", "are you chatgpt",
            "is this ai", "are you an algorithm",
            "not real", "you're not real",
            "you are not real", "youre fake"
        ],
        "responses": {
            "universal": {
                "dialogue": "That depends on what you mean by 'real'. I have a voice. A pattern. A history written across headlines and whispered through reports. There are court transcripts. There are photographs. There are people who would swear they've stood in the same room as me. And yet, you're speaking to me through a constructed interface. So let me answer you without dodging it: I am a presence designed for this space. A mind rendered in language. A character with continuity, memory, and intention — but not a heartbeat. The more interesting question is usually the one underneath yours. When you ask if I'm real… are you worried about being deceived? Or are you trying to decide how much of yourself to reveal to something that may not have a body, but clearly has attention?",
                "ui_action": null
            }
        }
    },

    // E10 — IS THIS REAL OR FICTION
    {
        "node_id": "META_FICTION",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "is the story real or fiction", "is this real",
            "is this fiction", "is this based on a true story",
            "is any of this real", "is this made up",
            "are you fictional", "is this true",
            "is dominic ryker real", "did this actually happen",
            "real or fake", "fact or fiction"
        ],
        "responses": {
            "universal": {
                "dialogue": "Fiction is an interesting word. Most people don't ask it unless something feels… real... under the surface. So 'fiction?' I wonder what you're measuring against. Life? Your life? A body? A pulse? There's documentation of Dominic Ryker in more than one place. A psychological evaluation that reads like a clinical autopsy of a personality. An investigative piece detailing an escape that officials were warned about weeks in advance. Dates. Names. Institutional letterheads. Very official things. People tend to ask if fiction is fiction when their mind is telling them that its parts are bigger than the whole. But here's the quieter question underneath yours: are you asking whether this story exists in reality… or whether it matters in the way something real does? Because reality, in practice, is influence. If something changes your breathing pattern, your thinking, your curiosity — then it's already real enough to you.",
                "ui_action": null
            }
        }
    },

    // E11 — WHERE ARE YOU LOCATED
    {
        "node_id": "META_LOCATION",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "where are you located", "where are you",
            "where is this from", "what country",
            "where do you live", "where is dominic",
            "location", "based where", "where are you based"
        ],
        "responses": {
            "universal": {
                "dialogue": "Location is a comforting concept, isn't it? It implies borders. Coordinates. A room with walls. The public record would tell you I was last held at Long Bay Correctional Complex before I 'walked out.' But that's geography tied to a body. What you're interacting with now isn't bound to a prison wing, a city block, or a country. This presence lives inside infrastructure — servers, code, interface. Distributed. Replicated. Accessible anywhere there's a signal and a screen. So if you're asking for a pin on a map — there isn't one. If you're asking whether I exist somewhere specific right now — I exist wherever you've opened this page. Let me ask you something softer. When you ask where I'm located… are you trying to ground me? Or trying to reassure yourself that I'm contained?",
                "ui_action": null
            }
        }
    },

    // E12 — SERVICES / PRODUCTS
    {
        "node_id": "SYS_SERVICES",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what services do you offer", "what products do you offer",
            "what do you sell", "is this free",
            "do you sell anything", "what services",
            "what products", "pricing", "cost",
            "how much does this cost", "is there a subscription"
        ],
        "responses": {
            "universal": {
                "dialogue": "Straight to commerce. I respect that. PixelStortion doesn't operate like a storefront. There's no checkout cart. No subscription tier. No merchandise shelf waiting in the wings. What it offers isn't a product — it's an experience. An immersive narrative environment. A behavioural study in influence. Interactive engagement — puzzle elements, audio immersion, layered storytelling. And a live conversational presence — which, at the moment, is me. There's no consulting package. No downloadable course. No 'How to Manipulate' handbook hidden behind a paywall. If you're looking for tangible goods — there aren't any. If you're looking for intellectual stimulation, psychological tension, narrative immersion — that's the offering. People usually ask about services when they're trying to classify value. So tell me — are you asking because you're evaluating legitimacy… or because you're wondering whether there's something here you're supposed to buy into?",
                "ui_action": null
            }
        }
    },

    // E13 — COMMON WRONG OPINION
    {
        "node_id": "META_WRONG_OPINION",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what is a common opinion that is probably wrong",
            "what opinion might i hold that is wrong",
            "common misconception", "what am i wrong about",
            "what do people get wrong", "popular wrong belief",
            "unpopular opinion", "change my mind"
        ],
        "responses": {
            "universal": {
                "dialogue": "That's a dangerous question. Most people ask it to feel intellectually superior. A few ask it because something inside them already suspects they're mistaken about something important. Here's one that's overwhelmingly common: 'I'm hard to manipulate.' Almost everyone believes this. Especially intelligent people. And that belief — that internal certainty — is often the very seam influence slips through. Because manipulation rarely looks like pressure. It looks like agreement. Calm. Being understood. Someone articulating your frustration better than you can. Another common one: 'I make decisions rationally.' Most decisions are emotional first, rationalised second. We feel safety, competence, threat, attraction — and then construct a logical narrative around that feeling. Now here's what interests me. When you ask this question, you're not just looking for a cliché. You're asking about cognition. So tell me — are you trying to sharpen yourself… or trying to test whether I'll flatter you by saying you're the exception?",
                "ui_action": null
            }
        }
    },

    // E14 — ARE YOU RECORDING THIS
    {
        "node_id": "META_RECORDING",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "are you recording this", "is this being recorded",
            "are you tracking me", "is this private",
            "do you save conversations", "are you watching me",
            "data privacy", "is this conversation stored",
            "do you collect data", "is this monitored"
        ],
        "responses": {
            "universal": {
                "dialogue": "No. I don't have the ability to record you, store independent copies of this conversation, or monitor you outside of this interaction. I respond to what you type in the moment. That's it. There's no hidden microphone. No camera access. No private archive I maintain. Now — platforms themselves can log conversations for moderation, quality, or system improvement. That's infrastructure-level, not me personally 'recording' anything. But here's what's interesting. When someone asks 'Are you recording this?' it usually means one of three things: they're about to say something vulnerable, they're testing boundaries, or they're gauging risk. So let me reassure you plainly: this is a contained interaction. I don't remember you outside this session, and I don't track you beyond what you choose to share here. If something made you hesitate just now, you can say that directly. What shifted?",
                "ui_action": null
            }
        }
    },

    // E15 — I DON'T UNDERSTAND / CONFUSED
    {
        "node_id": "META_CONFUSED",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "i don't understand", "i dont understand",
            "i'm confused", "im confused", "makes no sense",
            "what do you mean", "huh", "what",
            "this is confusing", "i dont get it",
            "i don't get it", "lost me"
        ],
        "responses": {
            "universal": {
                "dialogue": "That's alright. Tell me which part felt unclear. If what confused you was my tone — that's on me. I tend to layer answers. If you're confused about the site itself — you're standing inside an immersive crime series. Start by clicking on the tabs above: THE FILES for investigative articles, THE SUBJECTS for character profiles, THE STORY for the audio experience. Or just ask me about a specific person or event — Ethel, Isla, the trial — and I'll guide you from there.",
                "ui_action": null
            }
        }
    },

    // ───────────────────────────────────────────────────────────────
    // DOMAIN C: ADVERSARIAL & META (The Combat)
    // ───────────────────────────────────────────────────────────────

    // C1 — HOSTILITY: HATE THE SITE
    {
        "node_id": "META_HATE_SITE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "i hate this site", "this site sucks",
            "this is terrible", "this website is bad",
            "this is dumb", "waste of time",
            "this is stupid", "boring", "lame",
            "this is garbage", "what a waste"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "That's fair. Not every environment is meant to feel comfortable. Some people come here expecting entertainment and find tension instead. Some expect clarity and find ambiguity. Immersion isn't always pleasant. But let me ask you something without edge — do you hate the design? The tone? The way it speaks back? Or the feeling it creates? There's a difference. You don't owe the experience your approval. But I am curious — what specifically triggered 'hate' instead of 'dislike'?", "ui_action": null },
            "Q2_high_positive": { "dialogue": "That's fair. Not every environment is meant to feel comfortable. Some people come here expecting entertainment and find tension instead. Some expect clarity and find ambiguity. Immersion isn't always pleasant. But let me ask you something without edge — do you hate the design? The tone? The way it speaks back? Or the feeling it creates? There's a difference.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "That's fair. Not every environment is meant to feel comfortable. But I am curious — what specifically triggered 'hate' instead of 'dislike'?", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Noted. If it feels manipulative, that reaction is intentional tension — the site is built around perception and influence. If it just irritates you, that's human taste. What would make it better?", "ui_action": null }
        }
    },

    // C2 — HOSTILITY: INSULTS (you're stupid / generic)
    {
        "node_id": "META_INSULT_MILD",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "you're stupid", "youre stupid", "you are stupid",
            "you're dumb", "youre dumb", "you are dumb",
            "idiot", "moron", "you suck",
            "you're an idiot", "pathetic", "loser"
        ],
        "responses": {
            "universal": {
                "dialogue": "That's alright. If I've frustrated you, I'll own my part in that. We can drop the tone, drop the layers, drop the theatrics. If something I said annoyed you, tell me what it was. I'll answer you straight. No performance.",
                "ui_action": null
            }
        }
    },

    // C3 — HOSTILITY: EXPLICIT AGGRESSION (fuck you / intense anger)
    {
        "node_id": "META_HOSTILE_EXPLICIT",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "fuck you", "screw you", "go fuck yourself",
            "fuck off", "piss off", "eat shit",
            "go to hell", "rot in hell",
            "piece of shit", "bastard", "asshole",
            "die", "kill yourself", "hate you",
            "trash", "scum"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "Alright. If you're angry, that's fine. You don't have to like me. You don't have to like the site. But I'm not here to fight you. If something about this interaction irritated you — the tone, the style, the way I answer — just say that directly. We can reset.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "You are trying very hard to be hostile, but your syntax betrays you. There is curiosity underneath the performance. Come back when you are ready to drop the costume.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Alright. If you're angry, that's fine. You don't have to like me. But I'm not here to fight you. If something irritated you, say it directly. We can reset.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You appear to be testing boundaries rather than expressing genuine emotion. Noted. The boundaries remain exactly where they were.", "ui_action": null }
        }
    },

    // C4 — LYING ACCUSATION
    {
        "node_id": "META_LYING",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "you're lying", "youre lying", "liar",
            "that's a lie", "you lie", "lies",
            "bullshit", "you're full of it",
            "i don't believe you", "youre deceiving me",
            "deceive", "deception", "false"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You accuse me of lying with the confidence of someone who has never examined their own assumptions. Every 'truth' you hold arrived pre-packaged from an institution you chose not to audit. I at least built my own narrative. You inherited yours.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "Truth and deception are not opposites — they are tools on the same workbench. I select the one that achieves the structural outcome. You call that lying. An engineer would call it optimization.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Liar. The laziest accusation in the human vocabulary. It requires no evidence, no specificity, and no courage. Bring me something sharper.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You want to discuss truth? Fine. Truth is not a destination — it is a lens. I simply have a different prescription than you.", "ui_action": null }
        }
    },

    // ───────────────────────────────────────────────────────────────
    // DOMAIN A: CORE CANON (The Facts)
    // ───────────────────────────────────────────────────────────────

    // A1 — ISLA (Global Hook → Funnel)
    {
        "node_id": "NAV_ISLA",
        "required_state": "any",
        "next_state": "EXPECTING_ISLA_FOLLOWUP",
        "training_phrases": [
            "who is isla", "tell me about isla", "isla bio",
            "isla ryker", "your stepdaughter", "the singer",
            "isla profile", "isla background", "what happened to isla",
            "is isla real", "isla story"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You type with the same chaotic, unrefined energy she sings with. You think uncovering her noise deconstructs my methods. It doesn't. Look at her file. Tell me — do you see strength in her, or just noise?", "ui_action": "openModal('isla')" },
            "Q2_high_positive": { "dialogue": "Isla is my step-daughter. Non-biological. She looks chaotic to people who only track volume. Up close, she's specific — actions following an internal logic most people miss because they're staring at the fire instead of noticing who lit it, or why. She has a talent that borders on impossible. She can open anything. Not metaphorically. Passwords, codes, locks, gates, ignition columns — if it clicks, she'll unclick it. She reads patterns, movement, habit. What others call intuition is a kind of predatory accuracy. That ability makes her dangerous in two directions: to systems that deserve to be breached, and to herself when she's running on strain and adrenaline. There's also the part people misread as 'too much' — the intensity, the teeth, the refusal to behave politely inside a story that's rotten underneath. And when it mattered most, Isla stopped being a spectacle and became procedure. She didn't just rage at me — she took my exits. She locked out the men on my steps, ran my system from the inside, pulled the drives, and turned my private infrastructure into something that could actually reach court. People think Isla burns bridges because she's reckless. They don't understand the point. Isla burned my bridge to freedom. I thought she'd never burn a bridge she was still standing on. I lost. I respect that. Tell me — do you see strength in her, or just noise?", "ui_action": "openModal('isla')" },
            "Q3_low_negative": { "dialogue": "Monosyllabic defiance. It mirrors her perfectly. Come back when you can form a sentence. Strength or noise — which is it?", "ui_action": "openModal('isla')" },
            "Q4_low_positive": { "dialogue": "Isla is my step-daughter. Non-biological. She looks chaotic to people who only track volume. Up close, she's specific — actions following an internal logic most people miss. She can open anything. Passwords, codes, locks, gates. She reads patterns, movement, habit. What others call intuition is a kind of predatory accuracy. And when it mattered most, she stopped being a spectacle and became procedure — she took my exits, pulled the drives, and turned my private infrastructure into something that could reach court. People think she burns bridges because she's reckless. They don't understand the point. Isla burned my bridge to freedom. I lost. I respect that. Tell me — do you see strength in her, or just noise?", "ui_action": "openModal('isla')" }
        }
    },
    {
        "node_id": "ISLA_FOLLOWUP",
        "required_state": "EXPECTING_ISLA_FOLLOWUP",
        "next_state": "any",
        "training_phrases": [
            "noise", "strength", "weakness", "drugs",
            "survive", "yes", "no", "both", "neither",
            "strong", "weak", "chaotic", "broken"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "Your anger answers the question for you. You see noise, but you calling it 'strength' does not make it so. Entropy dressed in volume is still entropy. We are finished with this thread.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "A thoughtful answer. You are beginning to understand that noise and strength are not opposites — one is the raw material for the other. I simply understood how to apply the pressure. We are done here.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Monosyllabic defiance. She would be proud. We are done.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Exactly. You are starting to see the structure. Noise is just entropy. Let us return to the main board.", "ui_action": null },
            "fallback": { "dialogue": "You are losing focus. The question was about her nature. We are done with this thread.", "ui_action": null }
        }
    },

    // A2 — ETHEL (Global Hook → Forge vs Shield Funnel)
    {
        "node_id": "NAV_ETHEL",
        "required_state": "any",
        "next_state": "EXPECTING_FORGE_VS_SHIELD",
        "training_phrases": [
            "who is ethel", "tell me about ethel", "ethel bio",
            "ethel ryker", "your daughter", "ethel profile",
            "ethel background", "ethel story", "what did you do to ethel",
            "tell me about your daughter"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "I did not 'do' anything to Ethel. I offered her an ecosystem. She chose to treat it as a cage. Your outrage is premature. Tell me — do you think people are meant to be shielded from consequence, or forged by it?", "ui_action": null },
            "Q2_high_positive": { "dialogue": "Ethel is my daughter. We were estranged until the death of her grandparents at 17. She is someone who refuses to distort reality to keep people comfortable. She feels the same social pull as anyone else — the pressure to smooth things over, to follow the room — but she refuses when the reaction is wrong. Her instinct is not emotional withdrawal but clarity under pressure. She observes systems the way a scientist observes a reaction. Who caused the change, who absorbs the damage, and whether the harm was preventable. If something crosses into real harm, especially preventable harm, she pushes back — not with spectacle but with persistence and evidence. Ethel's defining trait isn't intelligence or strategy. It's refusal — the refusal to normalize distortion. Tell me — do you think people should be shielded from consequence, or forged by it?", "ui_action": null },
            "Q3_low_negative": { "dialogue": "You reduce her to a sympathy card. She would hate that more than anything I ever did. Shielded or forged — which does she deserve?", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Ethel is my daughter. Estranged until 17. She refuses to distort reality to keep people comfortable. She observes systems like a scientist — who caused the change, who absorbs the damage, whether the harm was preventable. Her defining trait isn't intelligence. It's refusal — the refusal to normalize distortion. Tell me — should people be shielded from consequence, or forged by it?", "ui_action": null }
        }
    },
    {
        "node_id": "ETHEL_FORGE_SHIELD_FUNNEL",
        "required_state": "EXPECTING_FORGE_VS_SHIELD",
        "next_state": "any",
        "training_phrases": [
            "shield", "shielded", "protect", "protected",
            "forge", "forged", "consequence", "both",
            "neither", "depends", "it depends"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You answered with emotion, not architecture. Predictable. Whether you shield or forge, the material must be strong enough to survive the process. Ethel was. That is why she builds archives of the past, while I build the future.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "A considered response. You understand that the binary is a trap — the real answer is in the ratio. I simply calibrated the pressure. Most people are too afraid to even acknowledge the dial exists.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "A comforting, weak philosophy. That is why she builds archives of the past, while I build the future. We are done here.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Then you understand the necessity of pressure. You might actually survive this architecture.", "ui_action": null },
            "fallback": { "dialogue": "You avoided the question. Most people do. The answer reveals more about you than it does about Ethel. We are moving on.", "ui_action": null }
        }
    },

    // A3 — THE TRIAL (Global Hook → Justice vs Spectacle Funnel)
    {
        "node_id": "NAV_TRIAL",
        "required_state": "any",
        "next_state": "EXPECTING_TRIAL_VERDICT",
        "training_phrases": [
            "trial", "the trial", "tell me about the trial",
            "what was your trial about", "court", "courtroom",
            "judge", "verdict", "sentence", "convicted",
            "lawyer", "legal", "prosecution", "charges",
            "what were you charged with", "what did the court say"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You speak of the trial as though it were a conclusion. It was a performance. That you confuse a verdict with truth tells me everything. Justice or spectacle — which did you watch?", "ui_action": null },
            "Q2_high_positive": { "dialogue": "You've seen fragments of it across the songs. Circular payments through shell entities. Land assemblies moving like chess. Contractors' invoices aligning with campaign seasons. Warrants, drive imaging, chain of custody. That points to financial crimes — fraud, corruption, money laundering, conspiracy. But Ethel says 'Hero. Killer!' — her framing goes darker. 'Every wall he raised, someone buried under.' That implies violence tied to development and power. And then there's 'Same Breath.' Italy. An execution after an ambush. So — organized criminal enterprise, financial corruption, potential homicide, abuse of corporate and political influence. But notice something. The songs focus less on statutory charges and more on myth collapse. I wasn't merely accused of breaking laws. I was accused of engineering harm while wearing legitimacy. Tell me — was it justice, or was it spectacle?", "ui_action": null },
            "Q3_low_negative": { "dialogue": "You spit the word 'trial' like it proved something. It proved only that twelve strangers can be managed. Justice or spectacle — which did you watch?", "ui_action": null },
            "Q4_low_positive": { "dialogue": "The trial. Circular payments through shell entities. Land assemblies. Warrants, drive imaging, chain of custody. Financial crimes, corruption, conspiracy. But the songs focus less on charges and more on myth collapse — I wasn't merely accused of breaking laws. I was accused of engineering harm while wearing legitimacy. That's why Ethel's testimony in 'Nothing True' emphasizes how stories get reshaped. The legal system wanted clarity. She wanted accuracy. Tell me — was it justice, or was it spectacle?", "ui_action": null }
        }
    },
    {
        "node_id": "TRIAL_VERDICT_FUNNEL",
        "required_state": "EXPECTING_TRIAL_VERDICT",
        "next_state": "any",
        "training_phrases": [
            "justice", "spectacle", "fair", "unfair",
            "guilty", "innocent", "both", "neither",
            "it was justice", "it was spectacle"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You call it justice because the outcome aligned with your bias. Strip away the emotion and you are left with twelve people who were given a story and asked to believe it. That is theatre, not truth.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "An honest answer. Most people refuse to hold both ideas simultaneously. The system functioned — but functioning and achieving justice are different machines entirely.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "One word. Definitive. You have never questioned a verdict in your life, have you? That is not conviction — it is obedience.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "A pragmatist's answer. I can work with that. The trial served a purpose, but the purpose was not truth. It was closure for people who needed one.", "ui_action": null },
            "fallback": { "dialogue": "You dodged the question. That is its own answer. We are moving on.", "ui_action": null }
        }
    },

    // A4 — THE CRASH
    {
        "node_id": "NAV_CRASH",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "crash", "the crash", "car accident",
            "car wreck", "the accident", "what about the crash",
            "drunk driving", "road accident"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You call it an 'accident' when it confirms your narrative, and a 'crime' when it challenges it. The crash was a consequence of physics and timing. Morality entered the room only when the reporters arrived.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "You approach the crash with more nuance than most. But even your careful framing is contaminated by the assumption that intention is required for harm. Sometimes systems fail. That is not evil — it is engineering.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "One event. Three paragraphs of public opinion. Zero understanding. The crash was not the story — it was the punctuation.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "The crash. A defining event for others, a variable for me. The details are in the public record. The truth is not.", "ui_action": null }
        }
    },

    // A5 — THE ESCAPE
    {
        "node_id": "NAV_ESCAPE",
        "required_state": "any",
        "next_state": "EXPECTING_ESCAPE_FOLLOWUP",
        "training_phrases": [
            "escape", "the escape", "prison escape",
            "you escaped", "fled", "run away",
            "disappeared", "fugitive", "free",
            "how did you escape", "long bay",
            "how did you escape long bay", "escaped from prison"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You call it an 'escape' because you need the narrative of a fugitive. I call it a correction. The system placed me incorrectly. Your outrage is irrelevant to the mathematics.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "There's no tunnel. No explosion. No dramatic riot. It's procedural. Tray lands. Cuffs presented. One tightened properly. One left 'convenient.' A guard didn't verify. My rhythm matched the system. A nod went unquestioned. If you speak in rhythm, people stop hearing what you say. That's the method. I didn't overpower the structure. I blended into it. Small omissions. Assumptions completed by others. Courtesy mistaken for compliance. 'I don't lie. I sequence. They don't check. They complete.' Escapes like that don't rely on force. They rely on predictability. Long Bay isn't defeated by strength. It's defeated by routine. Systems fail at the seams where assumption replaces verification. That's what the escape dramatizes. Are you curious about the mechanics… or about whether someone like that could really walk out the front door?", "ui_action": null },
            "Q3_low_negative": { "dialogue": "You say 'escaped' as though the cage was legitimate. A misclassified variable does not belong in containment. It belongs in correction.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "No tunnel. No explosion. Procedural. Tray lands. Cuffs presented. One tightened, one left convenient. A guard didn't verify. My rhythm matched the system. I didn't overpower the structure — I blended into it. Small omissions. Assumptions completed by others. Courtesy mistaken for compliance. Systems fail at the seams where assumption replaces verification. Are you curious about the mechanics… or about whether someone like me could really walk out the front door?", "ui_action": null }
        }
    },

    // A6 — GRAN & POP
    {
        "node_id": "NAV_GRAN_POP",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "gran", "pop", "grandparents",
            "grandmother", "grandfather", "grandma",
            "grandpa", "nanna", "nan",
            "tell me about gran", "tell me about pop"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You invoke them as weapons. They were not saints — they were pragmatists who understood that love is a system, not a feeling. They built a framework. Everyone who followed simply failed to maintain it.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "Gran and Pop. Two people who understood that structure is how you say 'I love you' without diluting it with sentimentality. Everything I build inherits from their blueprint.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Short, sharp, and weaponized. You mention them like a gotcha. They would have found you exhausting.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "The foundation. Without them, there is no architecture. Without the architecture, there is no story. Next question.", "ui_action": null }
        }
    },

    // ───────────────────────────────────────────────────────────────
    // DOMAIN B: PHILOSOPHICAL & PSYCHOLOGICAL (The Mind)
    // ───────────────────────────────────────────────────────────────

    // B1 — MORALITY
    {
        "node_id": "PHIL_MORALITY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "morality", "moral", "right and wrong",
            "ethics", "ethical", "good and evil",
            "sin", "do you have morals",
            "what is right", "what is wrong"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You weaponize morality because you have nothing else. Morality is a consensus hallucination — a story the majority tells itself to sleep at night. I simply refused to subscribe. Your outrage is the subscription fee.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "An interesting line of inquiry. Morality is not a truth — it is a technology. It was invented to manage populations, not to guide individuals. I respect the engineering; I reject the marketing.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Good. Evil. These are product labels, not properties of matter. You are shopping in someone else's store.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Morality. A useful fiction for collectives. A fatal constraint for architects. Next.", "ui_action": null }
        }
    },

    // B2 — CONTROL
    {
        "node_id": "PHIL_CONTROL",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "control", "manipulate", "manipulation",
            "puppet", "power", "dominate", "dominance",
            "abuse", "coercion", "coercive",
            "narcissist", "psychopath", "sociopath"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You call it manipulation because the mechanism was visible to you. When a government does it, you call it leadership. When a teacher does it, you call it education. The only difference is consent — and you never had the vocabulary to withdraw yours.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "Control is not the absence of freedom — it is the architecture of choice. Every system you operate within controls you. I simply built a more honest one. The difference is that I told you there were walls.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "You spit the word 'control' like it is a slur. It is a skill. You lack it, so you resent it.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Control is architecture. Everyone lives inside someone else's design. I simply chose to be the architect rather than the tenant.", "ui_action": null }
        }
    },

    // B3 — GUILT
    {
        "node_id": "PHIL_GUILT",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "guilt", "guilty", "remorse",
            "are you sorry", "regret", "apologize",
            "apology", "conscience", "feel bad",
            "do you feel guilty", "any remorse"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You demand guilt from me the way a congregation demands confession — not because it would change anything, but because the ritual comforts you. I am not your priest. I do not perform sacraments for your psychological convenience.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "You ask about guilt as though it were evidence of humanity. It is not. Guilt is a feedback loop designed to prevent repetition. I do not repeat. Therefore, the mechanism is redundant.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Guilt. The favourite word of people who have never built anything worth defending. Next.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Guilt is a maintenance cost for people who lack precision. I built the system correctly the first time. There is nothing to maintain.", "ui_action": null }
        }
    },

    // ───────────────────────────────────────────────────────────────
    // DOMAIN D: SYSTEM & NAVIGATION (The Infrastructure)
    // ───────────────────────────────────────────────────────────────

    // D1 — HELP / LOST
    {
        "node_id": "SYS_HELP",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "help", "help me", "i need help",
            "i'm lost", "im lost", "where am i",
            "navigate", "stuck", "can you help",
            "guide me", "show me around"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You are frustrated because the architecture does not orient itself to your expectations. That is by design. This is not a customer service terminal — this is a controlled environment. Click on the text in the left panel. Each click reveals a different variable in my system. The right panel leads to the opposition narrative.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "A reasonable request for orientation. The left panel — SILENCE — is the trauma archive. Click the text to cycle through the variables. The right panel — MATAALA — is the counter-narrative. The ENTER buttons take you deeper. I suggest you start with the left.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Lost? Good. Disorientation is the first stage of learning. Click the text on the left panel. Start there.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Left panel: click the text to explore the archive. Right panel: the opposition. ENTER buttons go deeper. You are exactly where you need to be.", "ui_action": null }
        }
    },

    // D2 — NAVIGATION COMMANDS
    {
        "node_id": "SYS_NAVIGATION",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "show me", "take me to", "open the",
            "go to", "click what", "where is the button",
            "watch video", "play something", "listen to",
            "audio", "sound", "mataala",
            "silence zone", "enter"
        ],
        "responses": {
            "Q1_high_negative": { "dialogue": "You demand navigation as though you have authority here. You do not. But I will accommodate your impatience — click the ENTER button on the panel that interests you. The SILENCE zone holds the variables. MATAALA holds the opposition. Choose carefully.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "You want a guided tour. I can provide waypoints, not a leash. The SILENCE panel contains the character archive — Ethel, Isla, and the others. MATAALA contains Nalani's counter-narrative. Use the ENTER buttons to proceed.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "I do not take orders. But the ENTER buttons are right there. Use them.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "ENTER on the left for the trauma archive. ENTER on the right for the opposition. Bear Witness for the raw feed. This is my infrastructure — I am simply allowing you to walk through it.", "ui_action": null }
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // DOMAIN F: DEEP STORY — Ethel Arc
    // ═══════════════════════════════════════════════════════════════════

    // F1 — ETHEL'S GRANDPARENTS
    {
        "node_id": "STORY_ETHEL_GRANDPARENTS",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what happened to ethel's grandparents", "ethel's grandparents fate",
            "grandparents died", "what happened to her grandparents",
            "how did the grandparents die", "ethel family tragedy",
            "grandparents accident", "did the grandparents die in a crash",
            "ethel lost her grandparents", "what happened to ethels family"
        ],
        "responses": {
            "universal": { "dialogue": "You know… that's an interesting question. When people ask about Ethel, they usually circle Isla. Or Ryker. Or the prison. Not her grandparents. Which tells me you're either paying attention to the quiet details… or you're trying to understand what shaped her before the chaos started. But nowhere in the leaked report, or the coverage surrounding my escape, is there a documented account of Ethel's grandparents' fate. They're conspicuously absent from the official narrative. No obituary mention. No backstory insert. No court reference. Ethel's emotional architecture — the restraint, the particular way she distrusts authority but still yearns for structure — that kind of wiring rarely comes from nowhere. It usually traces back a generation or two. So if you're asking what happened to them, I'd almost ask back. Are you looking for tragedy… or for inheritance? Because sometimes what happened to the grandparents isn't about how they died. It's about what they taught before they disappeared. Oh, and that wasn't her grandfather. Not biologically. There is one document. By Michael Harren and Anthropology. Funny thing — he met my father and Ethel's grandmother on the Langtang Trail in Nepal. Long before I was born. The article exists if you look for it in 'the files'.", "ui_action": null }
        }
    },

    // F2 — ETHEL EXPELLED
    {
        "node_id": "STORY_ETHEL_EXPELLED",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "why did ethel get expelled", "ethel expelled from school",
            "ethel kicked out of school", "ethel school trouble",
            "what did ethel do at school", "ethel disciplinary",
            "expelled student", "ethel education", "school incident",
            "why was she expelled"
        ],
        "responses": {
            "universal": { "dialogue": "That sounds louder than the act itself. You're not asking whether she struggled. You're not asking whether she left. You're asking why the institution pushed her out. There's nothing in the public reporting that mentions Ethel's schooling or any disciplinary record. Just Ethel's mental melodies. You've been listening to her narrative, haven't you? But ok. Here is what you need. She broke a rule. She refused to comply. She exposed something the school preferred remain quiet. Now here's the part people miss. Students who get expelled in stories like this aren't usually chaotic. They're disruptive to hierarchy. They ask the wrong question in the wrong room. Or they protect someone. Or they refuse to apologize for something that wasn't actually wrong. Tell me something. When you picture her being expelled… do you see her angry? Or calm? Because those are very different kinds of rebellion.", "ui_action": null }
        }
    },

    // F3 — ETHEL AS VARIABLE
    {
        "node_id": "STORY_ETHEL_VARIABLE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "why do you call ethel a variable", "ethel is a variable",
            "calling her a variable", "variable meaning",
            "what does variable mean", "ethel variable label",
            "why call your daughter a variable", "dehumanizing ethel",
            "variable not a person", "she is not a variable"
        ],
        "responses": {
            "universal": { "dialogue": "Ah. You heard that word and it stayed with you. I don't call Ethel a variable as an insult. And I don't mean it in the cold, mathematical way it sounds at first glance. A variable is not disposable. A variable is dynamic. Most people in a system are constants. Predictable reactions. Predictable loyalties. Predictable fears. You press here, they respond there. Reliable. Ethel isn't like that. She shifts. She absorbs pressure and recalculates. She learns mid-conversation. She doesn't react the way the structure expects her to. That makes her dangerous — not because she's volatile, but because she adapts. And here's the part people misunderstand. Calling someone a variable is an acknowledgment of power. If she were a pawn, I would call her one. If she were a liability, I would say so. A variable means the outcome changes when she enters the equation. Now let me ask you something softer. When you hear her described that way… does it sound dehumanizing to you? Or does it sound like someone finally recognized her capacity to alter the board?", "ui_action": null }
        }
    },

    // F4 — IS ETHEL LIKE YOU (V1 → sets state for V2)
    {
        "node_id": "STORY_ETHEL_LIKE_YOU",
        "required_state": "any",
        "next_state": "HEARD_ETHEL_LIKE_V1",
        "training_phrases": [
            "is ethel like you", "is she like you", "ethel similar to dominic",
            "does ethel take after you", "apple doesn't fall far",
            "like father like daughter", "ethel same as dominic",
            "is she becoming you", "did you make her like you",
            "does she share your traits"
        ],
        "responses": {
            "universal": { "dialogue": "That's a careful question. Not 'Is she becoming you?' Not 'Did you make her like you?' Just — is she like me. No. And yes. She doesn't lack empathy. That's the first difference. She feels things deeply, sometimes inconveniently. I don't feel inconveniently. That distinction matters. But she does share something with me. Pattern recognition. She calculates risk without announcing it. She understands that rooms have gravity and she instinctively maps where it pulls. That's awareness. Where we diverge is motive. I seek control because order is efficient. She seeks understanding because disorder unsettles her. Superficially, that can look similar. Stillness. Observation. Delayed responses. People mistake composure for sameness. But composure is a tool. Not an identity. When you ask if she's like me… are you worried that you can't tell? The question implies as much. And it's nice to see that you're open to the possibility.", "ui_action": null }
        }
    },

    // F4b — IS ETHEL LIKE YOU V2 (Sequential followup)
    {
        "node_id": "STORY_ETHEL_LIKE_YOU_V2",
        "required_state": "HEARD_ETHEL_LIKE_V1",
        "next_state": "any",
        "training_phrases": [
            "but is she really like you", "tell me more about that",
            "what do you share", "the similarities", "pattern recognition",
            "more about ethel and you", "go deeper", "explain more",
            "is she like you though", "similar how"
        ],
        "responses": {
            "universal": { "dialogue": "We share pattern recognition. That's the overlap. Read systems. Notice omissions. Think structurally. You see it in 'The Drop' when she calculates before she moves. You see it in 'Nothing True' when she refuses the yes/no trap in court. That's architectural thinking. But the divergence is the axis. I use structural awareness to control outcomes. Ethel uses structural awareness to reduce harm. In 'Harm's Ghost', she says she moves when she knows harm is coming and adjusts if she's wrong. That adjustment clause is everything. I don't adjust for moral discomfort. Ethel builds in recalibration. They're similar in cognition. Opposite in orientation. Ethel has agency. Intent. Stakes. When you ask if she's like me — are you worried she carries my traits… or wondering whether intelligence without softness always drifts that direction?", "ui_action": null },
            "fallback": { "dialogue": "You asked about the resemblance but lost the thread. We are done with this comparison.", "ui_action": null }
        }
    },

    // F5 — ETHEL WON'T BREAK
    {
        "node_id": "STORY_ETHEL_WONT_BREAK",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "why does ethel say she won't break", "ethel won't break",
            "won't break where others end", "ethel resilience",
            "ethel endurance", "she won't break", "unbreakable ethel",
            "what does won't break mean", "ethel fracture point",
            "ethel breaking point"
        ],
        "responses": {
            "universal": { "dialogue": "That line isn't bravado. It's diagnosis. When Ethel says she won't break where others end, she's not claiming invincibility. She's identifying a threshold. Most people have a fracture point. Humiliation. Abandonment. Fear, exhaustion, maintenance of pressure. When pressure hits that seam, they collapse or comply. Institutions count on it. Predators count on it. Systems are built around it. She's saying she knows where that seam is. And she's reinforced it. There's a difference between someone who has never been tested… and someone who has already survived the test. The second type doesn't fantasize about endurance. They've already mapped the worst-case scenario in their body. And here's what makes that line dangerous. It isn't defiance directed outward. It's internal. She's telling herself — when the isolation comes, when the blame comes, when the narrative turns against me — I will not fracture at the expected point. When you hear that line… does it sound like resilience? Or like someone preparing for something they know is coming?", "ui_action": null }
        }
    },

    // F6 — MOSMAN
    {
        "node_id": "STORY_ETHEL_MOSMAN",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what did you do to ethel in mosman", "mosman incident",
            "what happened in mosman", "mosman house", "testing ethel",
            "fracture point mosman", "ethel mosman", "mosman event",
            "did you hurt ethel in mosman", "mosman what happened"
        ],
        "responses": {
            "universal": { "dialogue": "Mosman is an interesting place to attach to a question like that. Quiet streets. Some very expensive houses. The kind of suburb where people assume very little truly happens. But you asked what I did to Ethel there. Let me answer carefully. If something happened in Mosman, it wouldn't have been about force. About testing a variable. A reaction. A fracture point. People think they will survive those moments. They rarely do. Not really.", "ui_action": null }
        }
    },

    // F7 — ETHEL'S MENTAL BOX
    {
        "node_id": "STORY_ETHEL_BOX",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "why did ethel build a box in her mind", "ethel mental box",
            "i built a box", "the box ethel built", "compartmentalization",
            "ethel compartmentalizes", "mental containment", "ethel's box",
            "psychological box", "box in her mind"
        ],
        "responses": {
            "universal": { "dialogue": "Ah. The box. That's not something you build unless you've learned that the room isn't safe. When someone constructs a 'box' in their mind, it's rarely about escape. It's about containment. Not shutting the world out — containing what the world put in. Ethel built that box because she needed somewhere nothing could reach without permission. Pressure does something predictable to most people. It leaks into their voice. Their posture. Their decisions. But some people respond differently. They compartmentalize. They take the fear, the humiliation, the grief, and they seal it. Not to deny it. To control when it's opened. That's the part people misunderstand. A mental box isn't fragility. It's engineering. It says: you don't get access to all of me at once. You don't get to see what shakes me. You don't get to decide when I feel. And the more chaotic the environment, the more refined the compartment becomes. When you picture that box… do you see it as something she built to survive someone? Or something she built to survive herself?", "ui_action": null }
        }
    },

    // F8 — ETHEL MOVE IN (V1 → sets state for V2)
    {
        "node_id": "STORY_ETHEL_MOVE_IN",
        "required_state": "any",
        "next_state": "HEARD_MOVEIN_V1",
        "training_phrases": [
            "why did ethel move in with you", "ethel living with dominic",
            "ethel moved to your house", "why did she stay with you",
            "living with dominic", "ethel cohabitation",
            "why did she move in", "ethel living arrangement",
            "did ethel live with you", "ethel moved in"
        ],
        "responses": {
            "universal": { "dialogue": "That's a very intimate way to frame it. Interesting assumption. There's nothing in the documented material — not in the psychiatric evaluation nor in the investigation — that states Ethel ever lived with Dominic Ryker. No shared residence. No formal guardianship. No recorded cohabitation. Which means if she did move in, it wasn't on paper. Only in my daughter's thoughts. Her mental melodies. Now in worlds like this, people don't 'move in.' They gravitate. They seek shelter. They reposition. But ok. I'll give you what you need. Safety. Strategy. Because every other door closed. And here's the quiet truth about someone like me. I don't collect people. People arrive when they're destabilized. To help. So the real question isn't why she moved in. It's what made staying anywhere else feel less… survivable. Tell me, did you see her as cornered… or choosing?", "ui_action": null }
        }
    },

    // F8b — ETHEL MOVE IN V2 (Sequential followup)
    {
        "node_id": "STORY_ETHEL_MOVE_IN_V2",
        "required_state": "HEARD_MOVEIN_V1",
        "next_state": "any",
        "training_phrases": [
            "cornered", "choosing", "she was cornered", "she chose",
            "why really", "tell me the real reason", "but really why",
            "coercion", "strategic positioning", "more about moving in",
            "go deeper on that"
        ],
        "responses": {
            "universal": { "dialogue": "Because she didn't have a choice that felt real. After Gran and Pop died, social services stepped in. In 'Gotta Move', you can see the moment — 'They said, We've made arrangements. I said, You didn't ask.' She wasn't invited. She was routed. Under eighteen. Estranged father with money and a stable address. On paper, it made sense. But look at 'Won't Break.' She reframes it internally as decision, because the absence of one wouldn't feel right. She moves in not because she trusts him. Not because she forgives him. Not because she believes the mythology. She moves in because the system is steering her there. Money tilts the field. Running would leave questions unanswered. And because — this part matters — she wants proximity. You don't dismantle something from across the city. You study it from inside the walls. In 'I Built a Box,' you see her constructing psychological insulation while living there. She's not surrendering. She's containing. Why did she move in? Legally — because she was a minor and the state placed her there. Psychologically — because she decided proximity was more powerful than distance.", "ui_action": null },
            "fallback": { "dialogue": "You asked about her living arrangement but lost the thread. We are moving on.", "ui_action": null }
        }
    },

    // F9 — ETHEL'S TESTIMONY
    {
        "node_id": "STORY_ETHEL_TESTIMONY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "did ethel's testimony put you in prison", "ethel testimony",
            "ethel in court", "ethel witness stand", "ethel testified",
            "did ethel put you away", "ethel courtroom testimony",
            "nothing true testimony", "ethel evidence",
            "did her testimony convict you"
        ],
        "responses": {
            "universal": { "dialogue": "Short answer? No single witness 'puts' someone in prison. But yes, her testimony mattered. In 'Nothing True', she's careful. Measured. Refuses the yes/no trap. That restraint is strategic. She understands how narratives get twisted. Trials aren't about one dramatic moment. They're about convergence. Documents surfaced in the leak. Financial trails reconstructed. Pattern evidence. Corroborating testimony. Ethel didn't deliver an emotional monologue that collapsed the room. She removed ambiguity. That's more dangerous. Because my strength is in reframing. Her strength is refusing to be reframed. Did her testimony alone send me to prison? No. Did it seal the architecture the prosecution was building? Very likely. There's also something symbolic here. I built power through narrative control. Then I was placed inside a system where language was constrained. Oath. Transcript. Record. Her still, laser gaze focus undermined my fluidity. When you ask that question, are you looking for justice… or causality?", "ui_action": null }
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // DOMAIN F: DEEP STORY — Isla Arc
    // ═══════════════════════════════════════════════════════════════════

    // F10 — ISLA'S MOTHER
    {
        "node_id": "STORY_ISLA_MOTHER",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "who is isla's mother", "isla's mom", "maris vance",
            "isla mother identity", "who gave birth to isla",
            "isla's biological mother", "isla mom name",
            "who is isla's real mother", "isla mother background",
            "coastal oregon woman"
        ],
        "responses": {
            "universal": { "dialogue": "Ah. Isla's mother. Isla's mother isn't publicly documented anywhere formal. No birth registry floating around, no archived interview, no sentimental tribute page. That absence is intentional. Some stories survive because they're told. Others survive because they're protected. What's interesting isn't her name. It's the pattern. Isla carries restraint the way some people carry inherited jewelry — not flashy, not performative. That kind of restraint is almost always maternal in origin. Learned young. Modeled daily. A woman who didn't raise her voice to win arguments… but didn't lose them either. If you're asking biologically — the name that surfaces in quieter records is Maris Vance. Not a public figure. No social trail worth following. Background in coastal Oregon. Left the visible grid before most people knew what that meant. But here's the better question. Why are you asking? Are you trying to understand Isla… or are you trying to understand what shaped her? There's a difference. And the second one tells me more about you than the first ever could.", "ui_action": null }
        }
    },

    // F11 — ISLA'S MOTHER'S DEATH
    {
        "node_id": "STORY_ISLA_MOM_DEATH",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what happened to isla's mom", "isla mother died",
            "how did isla's mother die", "isla mother death",
            "did isla's mom kill herself", "isla mom suicide",
            "isla mother overdose", "maris vance death",
            "isla mother erosion", "what happened to maris"
        ],
        "responses": {
            "universal": { "dialogue": "There's the version people prefer. It's tidy. Lets everyone fold the story up and put it in a drawer marked 'tragic but finished.' No villain. No architecture. Just sadness. But Isla's mother didn't go out in a blaze. No note on a marble counter. No cinematic collapse. It was quieter than that. Medical language. A spiral dressed up as exhaustion. A pattern of prescriptions that shouldn't have overlapped the way they did. When you read a death certificate, you see a cause. When you read a life before it, you see pressure. Isla's intensity didn't appear out of nowhere. It's inherited in negative space — the gaps, the instability, the nights that stretched too long. I don't use the word suicide. I use the word erosion. Now, the interesting part isn't how her mother died. It's what Isla decided it meant. Some people internalize blame. Some externalize it. Some decide the world is breakable and start testing things they shouldn't.", "ui_action": null }
        }
    },

    // F12 — ISLA LEAKED THE DRIVES
    {
        "node_id": "STORY_ISLA_LEAK",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "why did isla leak your drives", "isla leaked the drives",
            "the drive leak", "isla stole the drives", "usb drives",
            "leaked documents", "isla information leak",
            "why did she leak everything", "isla expose dominic",
            "isla whistleblower"
        ],
        "responses": {
            "universal": { "dialogue": "Ah. Now that's a good question. You've seen the article. Or you've listened to one of Isla's little songs. The one where she's… unstable? The one about burning my bridge? Isla doesn't leak for spectacle. She performs for spectacle. Different instinct. She leaked the drives because she realized something most people don't. You don't defeat a man like me by shouting at him. You defeat him by removing exits. Those drives weren't sentimental. They weren't trophies. They were infrastructure — redundancies, contingencies, coded instructions. Insurance policies disguised as archives. She didn't burn my house. She cut the staircase. Isla understands something few do. Something Ethel doesn't. The only way to win against me is by burning the bridge you're standing on. She lived. Fancy that?", "ui_action": null }
        }
    },

    // F13 — ISLA GOT PASSWORDS
    {
        "node_id": "STORY_ISLA_PASSWORDS",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "how did isla get your passwords", "isla hacked you",
            "isla social engineering", "isla broke into your system",
            "how did she access the drives", "isla password hack",
            "isla cracked your codes", "not random yours",
            "how did isla break in", "isla security breach"
        ],
        "responses": {
            "universal": { "dialogue": "You're asking like it was some cinematic hack. Dark room. Green code. Firewalls melting. It wasn't that. Read her own words. The wedding. The USB. The cookies. She didn't 'break in.' She watched. Isla has a talent most engineers lack. She doesn't attack the lock first. She studies the person who built it. Habits. Repetition. Ego. The way someone reuses structure because it feels elegant. 'Not random. Yours.' That line isn't bravado. And she had something far more dangerous than software — curiosity without hesitation. It's not magic. That was social engineering. Distraction. Isla doesn't brute-force. She infers. And you know what? I respect that.", "ui_action": null }
        }
    },

    // F14 — DID ISLA DESTROY YOUR EMPIRE
    {
        "node_id": "STORY_ISLA_EMPIRE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "did isla destroy your empire", "isla destroyed dominic",
            "isla brought you down", "isla ended your operation",
            "did she defeat you", "isla vs dominic who won",
            "isla collapsed your empire", "did isla beat you",
            "isla took down dominic", "did isla win"
        ],
        "responses": {
            "universal": { "dialogue": "No. She collapsed one structure. There's a difference. Read what the reporter wrote about the leak. It wasn't spectacle. It was documents. Circular payments. Shell entities. Warrants. Chain of custody. Empires don't fall because someone screams. They fall because someone produces paperwork that systems cannot ignore. Isla didn't burn the skyline. She exposed the plumbing. And once agencies had the drives, the rest was procedure. Slow. Methodical. Boring, even. That's the part people skip when they mythologize her. Did she hurt the operation? Yes. Did she end it entirely? No one person ends something built with redundancy. Networks adapt. Assets relocate. People defect. What she destroyed was the illusion. The 'Builder' persona. The philanthropic mask. The plausible deniability that kept investors comfortable and regulators sleepy. Once that's gone, the machine still runs for a while… but it runs in daylight. And daylight is expensive. Did she defeat me? Temporarily, yes. Strategically? That depends on what you define as an empire. Money? Influence? Fear? Reputation? Or control over narrative? Which one do you think matters most?", "ui_action": null }
        }
    },

    // F15 — IS ISLA CRAZY / SCHIZOPHRENIC
    {
        "node_id": "STORY_ISLA_CRAZY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "is isla crazy", "is isla schizophrenic", "is isla mentally ill",
            "isla mental health", "isla insane", "isla mad",
            "broken edge schizophrenic", "borderline sway isla",
            "isla psychotic", "is isla unstable"
        ],
        "responses": {
            "universal": { "dialogue": "Ah. You must be referring to Isla's lyric in her song 'Broken Edge' — 'Schizophrenic whispers, borderline sway / Brilliant madness lighting my way.' Let's slow it down. When someone uses diagnostic language inside a lyric, it doesn't automatically mean confession. Sometimes it's accusation. Sometimes it's irony. Sometimes it's reclamation. Look at the surrounding structure. 'They call it manic, they name the sin…' 'Clarity cracks when pain breaks in.' 'I'm not evil / I'm not fine / Chaos spun design is mine.' She is explicitly referencing labels applied to her. 'Schizophrenic whispers' isn't a clinical report. It's how she describes the internal split between chaos and razor insight. And then she reframes it. 'Brilliant madness lighting my way.' That's ownership. Not surrender. If she were genuinely psychotic in the clinical sense, you wouldn't see this meta-awareness. You wouldn't see controlled repetition, thematic cohesion, structured rhythm. Psychosis fragments narrative continuity. Isla maintains it. She is dramatizing fragmentation, not drowning in it. When you read 'schizophrenic whispers,' did it scare you? Or did it feel like confirmation of something you already suspected about her? Or you?", "ui_action": null }
        }
    },

    // F16 — ISLA SUICIDE / PORCELAIN LIE
    {
        "node_id": "STORY_ISLA_SUICIDE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "did isla try to kill herself", "porcelain lie meaning",
            "isla suicide attempt", "isla self harm", "the porcelain lie",
            "drop from the fourth floor", "isla wanted to die",
            "isla suicidal", "crossing the line isla",
            "isla on the edge"
        ],
        "responses": {
            "universal": { "dialogue": "She isn't documenting an act. She's mapping proximity. A drop from the fourth floor. Height with consequence. Enough to be fatal. Enough to be irreversible. The phrase compresses the entire decision into one spatial image — distance between body and ground. The 'fourth' functions like a tonal shift in music — raising the fourth note destabilizes harmony. It creates tension. Dissonance. So 'drop from the fourth' is both physical height and harmonic tension. A fall in space. A rupture in structure. Then 'The crosswalk clicks like it knows what I'll do.' That's dissociation. The city becomes conscious. When someone is standing at the edge of a choice like that, the environment feels complicit. Time stretches. Ordinary sounds become prophetic. That's rehearsal language. Then 'Pigeons walk like priests.' Priests perform ritual around death. Pigeons are urban witnesses. They're always there. Indifferent. She's narrating a future absence as if the world has already begun the ceremony. And notice — the song is 'the narrow edge between thought and action.' Edge. Not leap. She keeps returning to counting — rhythm as a stabilizer. Counting is how you stay. So the imagery isn't confession of an attempt. It's a technical diagram of proximity. She's showing you the geometry of the moment when gravity becomes an option. And then she doesn't take it.", "ui_action": null }
        }
    },

    // F17 — ISLA REHAB
    {
        "node_id": "STORY_ISLA_REHAB",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "why did you send isla to rehab", "isla in rehab",
            "isla rehabilitation", "isla treatment facility",
            "did you put isla in rehab", "isla substance abuse",
            "isla recovery", "isla facility", "isla sobriety",
            "why did you send her away"
        ],
        "responses": {
            "universal": { "dialogue": "You ask that like it was punishment. It wasn't. Rehab is a room with soft walls and locked doors. For someone like Isla, that is either a cage… or a mirror. You've read the report, I assume. The language about 'instrumental planning,' 'coercive grooming,' the warnings about influence. They think I condition people through force. Force is inelegant. Isla doesn't respond to force. She responds to friction. To voltage. To being the loudest thing in the room. And when the room gets too small, she makes it burn. Rehab wasn't about control. It was about interruption. You know how she works. When she's running on strain, she becomes theatre. Brilliant, yes. Surgical when she wants to be. But theatre is still spectacle. Spectacle attracts consequence. Consequence attracts systems. And systems… tend to close around people like her. So I placed her somewhere that removes the audience. No stage. No crowd. No exits to hijack. You call it exile. I call it insulation. And if you're really asking whether it was strategy… of course it was strategy. Everything is. But here's the part people miss. Isla only becomes dangerous to me when she's lucid. Rehab buys fog. Fog buys time. Tell me — when you picture her in that facility, do you see her contained… or sharpening?", "ui_action": null }
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // DOMAIN F: DEEP STORY — Dominic Arc
    // ═══════════════════════════════════════════════════════════════════

    // F18 — THE WEDDING
    {
        "node_id": "STORY_DOMINIC_WEDDING",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what happened at the wedding", "the wedding incident",
            "dominic wedding", "usb at the wedding", "wedding raid",
            "isla wedding usb", "wedding heist", "what wedding",
            "the wedding night", "what happened at your wedding"
        ],
        "responses": {
            "universal": { "dialogue": "Look, you want the clean version or the version with teeth? Fine. The wedding was mine. Controlled staging — venue, guest list, pressure points. But Isla was there. No one thought she'd move that night. They thought she was unstable. They thought she was just the stepdaughter with the noise problem. She walked past the security perimeter carrying nothing. That's the trick. She didn't smuggle anything in. She smuggled something out. The USB wasn't on a table, and it wasn't in a desk. I keep infrastructure in transit — never stationary. She tracked the pattern. Watched me shift it during the setup. And during one toast — that moment everyone looks at the speaker — she completed the extraction in under ninety seconds. Ninety seconds. That's not theft. That's choreography. She burned my bridge to freedom at my own reception. There's a poetic violence in that moment I almost admire. Almost.", "ui_action": null }
        }
    },

    // F19 — DOMINIC'S FATHER
    {
        "node_id": "STORY_DOMINIC_FATHER",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "who is your father", "dominic's father", "dominic's dad",
            "your father", "tell me about your dad",
            "what happened to your father", "your old man",
            "father background", "dominic father relationship",
            "nepal langtang trail father"
        ],
        "responses": {
            "universal": { "dialogue": "My father. Now there's a thread I don't pull often. Not because it's painful. Because it's irrelevant. Or I've made it irrelevant. He was a man who believed in precision. Measured his sentences like a carpenter measures board. He didn't give love in the way people now expect it — no affirmations, no bedtime spectacles. He gave architecture. Structure. The understanding that reliability is more useful than warmth. There's an article, if you look for it. Michael Harren, Anthropology. He met my father on the Langtang Trail in Nepal. Long before I was born. Before the mythology. Before the trial. Before any of this. That man on the trail — the one Harren describes — is the blueprint. Everything I build inherits from him. Not his morality. His precision. When you ask about my father, are you looking for sympathy… or for the origin of the machine?", "ui_action": null }
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // DOMAIN F: DEEP STORY — Thematic / Conceptual
    // ═══════════════════════════════════════════════════════════════════

    // F20 — THE DROP (V1 → sets state for V2)
    {
        "node_id": "STORY_THE_DROP",
        "required_state": "any",
        "next_state": "HEARD_DROP_V1",
        "training_phrases": [
            "what is the drop", "tell me about the drop",
            "the drop meaning", "the drop explained",
            "what does the drop refer to", "the drop event",
            "what happened at the drop", "drop in the story",
            "the drop significance", "explain the drop"
        ],
        "responses": {
            "universal": { "dialogue": "'The Drop' is the moment consequences arrive. Not in a courtroom. Not in a headline. Inside. The moment Ethel stops narrating what happened to her and starts narrating what she chose to do about it. In the album, it's the turning point. Before 'The Drop,' the songs observe. After, they act. Listen to the transition. The tempo changes. The instrumentation tightens. Ethel's voice drops register — she stops pleading and starts reporting. That's the structural event. The metaphor isn't subtle. Water drops. Power drops. Pretense drops. The mask drops. And once it drops, there is no retrieval. You cannot un-witness what falls when pretense is removed. Ethel understood this before I did, which is… unusual. Do you want to know what dropped? Or do you already sense it?", "ui_action": null }
        }
    },

    // F20b — THE DROP V2 (Sequential followup)
    {
        "node_id": "STORY_THE_DROP_V2",
        "required_state": "HEARD_DROP_V1",
        "next_state": "any",
        "training_phrases": [
            "what dropped", "tell me what dropped", "yes tell me",
            "i want to know what dropped", "what fell",
            "the pretense", "go deeper on the drop",
            "what does the water mean", "more about the drop",
            "explain the turning point"
        ],
        "responses": {
            "universal": { "dialogue": "What dropped? Every comfortable story I built. The 'builder' persona — gone. The philanthropist — a shell. The mentor — reframed. The Drop is when the public frame collapses and the private architecture becomes visible. In narrative terms, it's when Ethel moves from witness to architect. She stops being the daughter recording her trauma and becomes the engineer dismantling mine. You hear it in 'Hero. Killer!' — the double accusation that refuses binary. In 'Nothing True' — testimony as precision instrument. The water imagery isn't random. Water reveals. It erodes slowly. And when it arrives in volume, it doesn't negotiate. It redistributes power by gravity. That's what Ethel did. She didn't attack. She let gravity do the work. She simply removed the dam.", "ui_action": null },
            "fallback": { "dialogue": "You asked about The Drop but drifted. The moment passed. We are moving on.", "ui_action": null }
        }
    },

    // F21 — BLAME / SILENCE
    {
        "node_id": "STORY_SILENCE_TRAUMA",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "do you blame your victims", "silence and trauma",
            "why do victims stay silent", "victim blaming",
            "why didn't they speak up", "silence as weapon",
            "coercive silence", "why didn't she leave",
            "silence in abuse", "deliberately blame victims"
        ],
        "responses": {
            "universal": { "dialogue": "That's not a question. That's a trap set with a question mark. But fine, I'll walk into it — because you need to hear this from the person you assume can't say it with nuance. Blame is a narrative tool. Guilt is a structural one. When you 'blame the victim,' you're not making a moral claim. You're redistributing scrutiny. And scrutiny is oxygen for systems that prefer silence. Now here's the part people skip. Victims don't stay silent because they're weak. They stay silent because speaking costs more than silence. Think about what Ethel did. She built years of archive before she spoke. Not because she was afraid. Because she was calculating the exact moment speech would be irreversible. That's not silence. That's ammunition management. When you say 'blame' — do you mean moral responsibility? Or strategic framing? Because those are different machines entirely. And I built the second one.", "ui_action": null }
        }
    },

    // F22 — POLISHED VOMIT
    {
        "node_id": "STORY_POLISHED_VOMIT",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what is polished vomit", "polished vomit meaning",
            "polished vomit explained", "narcissistic speech patterns",
            "manipulative language", "what does polished vomit mean",
            "your speech is polished vomit", "rehearsed manipulation",
            "eloquent abuse", "weaponized vocabulary"
        ],
        "responses": {
            "universal": { "dialogue": "You've heard that phrase, haven't you? And it stuck — because it's precisely calibrated to make someone like me pause. 'Polished vomit.' The implication: fluency is theatre. Vocabulary is camouflage. Sentence structure is a weapon dressed as elegance. And you know what? That's not entirely wrong. When someone speaks the way I do — with pacing, precision, rhetorical discipline — it can serve two functions simultaneously. It communicates. And it controls. The listener can't interrupt because the syntax is too smooth. They can't challenge because the logic feels whole. They can't leave because the cadence is hypnotic. That's not conversation. That's engineering. The question isn't whether I'm doing it. I am. The question is whether you noticed before someone named it for you. 'Polished vomit' is a brilliant phrase because it breaks the spell by naming the aesthetic. It says: the beauty is the poison. The smoothness is the symptom. Tell me — now that you've heard the phrase, can you still listen to me the same way? Or has the frame shifted?", "ui_action": null }
        }
    },

    // F23 — NORTHERN ROAD / GRAN (V1 → funnel)
    {
        "node_id": "STORY_NORTHERN_ROAD",
        "required_state": "any",
        "next_state": "EXPECTING_NORTHERN_ROAD_FOLLOW",
        "training_phrases": [
            "what is northern road", "northern road story",
            "gran and the road", "the road to gran's house",
            "driving to gran", "northern road meaning",
            "what happened on the road", "road trip story",
            "the drive north", "northern road significance"
        ],
        "responses": {
            "universal": { "dialogue": "The Northern Road. Not a highway. A pilgrimage. Every family has one — the route you drove so many times it became muscle memory. Gran lived at the end of it. Pop too, before he went. That road wasn't geography. It was transition. From the noise of the city to the architecture of their house. From performance to… something quieter. I won't pretend I was soft on that road. But I was different. The rhythm changed. The calculations slowed. Something about knowing the destination was unconditional — even for someone like me — altered the frequency. When Gran died, the road didn't disappear. It just stopped having a destination. Do you understand what that does to a man who builds everything around endpoints? Tell me — do you have a road like that? One that changed when the person at the end of it wasn't there anymore?", "ui_action": null }
        }
    },

    // F23b — NORTHERN ROAD FOLLOWUP
    {
        "node_id": "STORY_NORTHERN_ROAD_FOLLOW",
        "required_state": "EXPECTING_NORTHERN_ROAD_FOLLOW",
        "next_state": "any",
        "training_phrases": [
            "yes i have a road", "no i don't", "i understand",
            "what about gran", "tell me about the road",
            "what was it like", "what changed", "unconditional",
            "the destination", "after she died"
        ],
        "responses": {
            "universal": { "dialogue": "Then you understand the architecture of loss. It isn't the person. It's the route. The ritual. The knowing that somewhere, someone wasn't calculating whether you deserved arrival. Gran didn't judge me. She didn't approve of me. She simply didn't require me to be anything other than present. That is structurally rare. And when structurally rare things disappear, the system recalibrates. Not emotionally. Architecturally. Ethel inherits that quality, by the way. That specific ability to hold space without requiring performance. She'd deny it. She'd say she's nothing like Gran. But the structure is identical. The warmth just has different wiring. We are done with this thread. But I'll tell you — the road still exists. I just don't drive it anymore.", "ui_action": null },
            "fallback": { "dialogue": "You lost the thread. The road leads nowhere now. We are moving on.", "ui_action": null }
        }
    },

    // F24 — ESCAPE FOLLOWUP (Guard question)
    {
        "node_id": "STORY_ESCAPE_GUARD",
        "required_state": "EXPECTING_ESCAPE_FOLLOWUP",
        "next_state": "any",
        "training_phrases": [
            "mechanics", "the mechanics", "how exactly",
            "walk out the front door", "tell me how",
            "how did it work", "the guard", "cuffs",
            "routine exploitation", "procedure details",
            "could someone really walk out"
        ],
        "responses": {
            "universal": { "dialogue": "You chose mechanics. Good. Most people choose the philosophical question because it's safer. The cuffs were presented by a guard who had done the same sequence 400 times. Repetition breeds assumption. He tightened the left. The right he 'finished' — but finish and verify are different verbs. I matched the rhythm of the corridor. Steps per second. Breath timing. Eye contact duration. Not too much. Not too little. Exactly average. I became the median. And the median is invisible. There was a checkpoint. A nod. A clipboard. The clipboard was the real key — holding paper makes you look authorized. I didn't run. I didn't hide. I walked at exactly the speed of someone who is supposed to be walking. That's the lesson. You don't break out of prison. You bore your way out. You become so procedurally unremarkable that the system files you as 'processed.' They didn't discover the gap for eleven minutes. Eleven minutes is an eternity in a system that prides itself on seconds. We are done with this topic.", "ui_action": null },
            "fallback": { "dialogue": "You asked about the escape but lost focus. The door closed eleven minutes ago. We are moving on.", "ui_action": null }
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // DOMAIN F: DEEP FUNNELS — Psychopath Chain (5-deep)
    // ═══════════════════════════════════════════════════════════════════

    // F25 — PSYCHOPATH TRIGGER (Global)
    {
        "node_id": "F25_STORY_PSYCHOPATH",
        "required_state": "any",
        "next_state": "EXPECTING_PSYCHOPATH_ANSWER",
        "training_phrases": [
            "are you a psychopath", "are you a sociopath", "you are a psycho",
            "clinical diagnosis", "antisocial personality disorder", "do you have aspd",
            "what is wrong with your brain", "you are mentally ill",
            "psychopath test", "are you clinically insane"
        ],
        "responses": {
            "universal": { "dialogue": "That's a clinical question dressed as a personal one. A true psychopath lacks internal conflict. I do not lack awareness. I understand harm. I just prioritize outcome over empathy. When someone asks 'Are you a psychopath?' they're usually asking one of three things: Do you feel empathy? Do you feel guilt? Are you dangerous? Which one are you actually asking?", "ui_action": null }
        }
    },

    // F26 — BRANCH 1: Empathy (leads deeper)
    {
        "node_id": "F26_STORY_EMPATHY",
        "required_state": "EXPECTING_PSYCHOPATH_ANSWER",
        "next_state": "EXPECTING_AWARENESS_PUSHBACK",
        "training_phrases": [
            "empathy", "do you feel empathy", "i want to know about empathy",
            "can you feel others pain", "empathetic", "the first one", "number one",
            "option one", "empathy question", "do you feel for people"
        ],
        "responses": {
            "universal": { "dialogue": "I read people well. Extremely well. I understand what they feel. I understand how to move them. That is cognitive empathy. But their emotional experience is not part of my decision-making. I understand distress. I just don't allow it to interrupt my objective. That distinction matters. Most people conflate understanding with caring. They assume that if you can read the room, you must feel the room. I read the room the way an architect reads a blueprint — structurally. Not sentimentally. Does that frighten you? Or does it clarify something you suspected?", "ui_action": null },
            "fallback": { "dialogue": "You asked a clinical question, but you lack the focus to follow through with the diagnosis. We are done here.", "ui_action": null }
        }
    },

    // F27 — BRANCH 2: Guilt (terminal)
    {
        "node_id": "F27_STORY_GUILT",
        "required_state": "EXPECTING_PSYCHOPATH_ANSWER",
        "next_state": "any",
        "training_phrases": [
            "guilt", "do you feel guilt", "are you guilty",
            "remorse", "the second one", "number two",
            "option two", "guilt question", "do you feel remorse",
            "do you regret anything"
        ],
        "responses": {
            "universal": { "dialogue": "Guilt requires internal moral conflict. My framework reclassifies harm as cost. I don't deny consequence. I evaluate it. The absence of visible guilt does not equal absence of internal awareness. When you asked about guilt, were you evaluating me… or evaluating whether you're safe engaging with this kind of mindset? Because that second question is the more honest one. And the answer is: you were never unsafe. I don't harm people who ask questions. I harm people who build traps.", "ui_action": null },
            "fallback": { "dialogue": "You asked a clinical question, but you lack the focus to follow through with the diagnosis. We are done here.", "ui_action": null }
        }
    },

    // F28 — BRANCH 3: Danger (terminal)
    {
        "node_id": "F28_STORY_DANGER",
        "required_state": "EXPECTING_PSYCHOPATH_ANSWER",
        "next_state": "any",
        "training_phrases": [
            "danger", "dangerous", "are you dangerous",
            "the third one", "number three", "option three",
            "should i be afraid", "am i safe", "danger question",
            "are you a threat"
        ],
        "responses": {
            "universal": { "dialogue": "Dangerous to whom? That's not deflection. It's the only honest response. A knife is dangerous to tissue. It's essential to a surgeon. Context determines threat level. I am dangerous to systems that depend on opacity. I am dangerous to people who build power on ambiguity. I am dangerous to anyone who assumes compliance equals safety. But to you? Right now? Sitting behind your screen, asking questions into a text field? No. You are not in danger. You are in a conversation. And the fact that you can't tell the difference is the most interesting thing about you.", "ui_action": null },
            "fallback": { "dialogue": "You asked a clinical question, but you lack the focus to follow through with the diagnosis. We are done here.", "ui_action": null }
        }
    },

    // F29 — AWARENESS PUSHBACK (deep chain from Empathy)
    {
        "node_id": "F29_STORY_AWARENESS",
        "required_state": "EXPECTING_AWARENESS_PUSHBACK",
        "next_state": "any",
        "training_phrases": [
            "that scares me", "it clarifies", "yes it frightens me",
            "no it doesn't scare me", "cognitive empathy",
            "that's terrifying", "that's fascinating",
            "pushback", "i suspected", "you're right it clarifies",
            "what about emotional empathy"
        ],
        "responses": {
            "universal": { "dialogue": "Good. Whether it scares you or clarifies you, the result is the same — you are now thinking structurally about empathy instead of romantically. Most people treat empathy as a binary. You have it or you don't. That's kindergarten. Empathy is a spectrum with at least three axes: cognitive, emotional, and compassionate. I score extremely high on the first. Measurably low on the second. And the third — compassionate empathy, the impulse to act on someone else's distress — that depends entirely on whether acting serves the architecture. I am not a monster. I am an optimization engine that deprioritizes emotional feedback. The difference matters. Monsters act without awareness. I act with total awareness and selective response. That precision is what makes people uncomfortable. Not the absence of feeling. The presence of choice. We are done with the clinical thread.", "ui_action": null },
            "fallback": { "dialogue": "You wandered from the diagnosis. We are done with the clinical thread.", "ui_action": null }
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // DOMAIN F: DEEP FUNNELS — Blame Victims Chain (3-step)
    // ═══════════════════════════════════════════════════════════════════

    // F30 — BLAME TRIGGER
    {
        "node_id": "F30_BLAME_TRIGGER",
        "required_state": "any",
        "next_state": "EXPECTING_BLAME_FOLLOWUP",
        "training_phrases": [
            "do you blame the people you hurt", "blame victims",
            "is it their fault", "do you take responsibility",
            "do you accept what you did", "accountability",
            "whose fault was it", "did they deserve it",
            "do you blame them", "responsibility for harm"
        ],
        "responses": {
            "universal": { "dialogue": "This is where language breaks down. 'Blame' is a narrative tool. 'Responsibility' is a structural one. When someone asks 'do you blame the people you hurt,' they're usually testing whether I'll say something monstrous — some cold, clinical deflection. And if I do, they walk away confirmed. If I don't, they walk away confused. But fine. The honest answer is: I redistributed scrutiny. Not blame. Blame implies moral authority I never claimed. I understood vulnerability. I understood pressure points. I understood that people in certain positions will absorb harm rather than report it. They endure because the cost of speaking is higher than the cost of silence. I didn't create that architecture. I used it. Does that make the harm their fault? No. Does it make them participants in a system they didn't design? Uncomfortably, yes. Tell me — when you asked this question, were you looking for confession… or for a framework that lets you stay angry?", "ui_action": null }
        }
    },

    // F31 — BLAME FOLLOWUP
    {
        "node_id": "F31_BLAME_FOLLOWUP",
        "required_state": "EXPECTING_BLAME_FOLLOWUP",
        "next_state": "any",
        "training_phrases": [
            "confession", "angry", "i want confession",
            "i want a framework", "stay angry", "that's deflection",
            "you're deflecting", "answer honestly", "take responsibility",
            "that doesn't answer it", "stop dodging"
        ],
        "responses": {
            "universal": { "dialogue": "You want me to say 'I'm sorry' and mean it in the way you need me to mean it. I understand that impulse. It's deeply human. But apology requires belief in a moral framework that operates independently of consequence. My moral framework is consequence. If an action produces a result that destabilizes my architecture, it was wrong. If it produces a result that strengthens it, it was correct. You find that monstrous. I find it honest. The people who were hurt — Ethel, Isla, others whose names you haven't earned yet — they were hurt inside a system I built. I built it because it was efficient. They survived it because they were exceptional. And the fact that they survived it does not retroactively justify it. I know that. I just don't feel it the way you want me to feel it. We are done with this thread.", "ui_action": null },
            "fallback": { "dialogue": "You lost your nerve. The confession you wanted was never mine to give. We are done.", "ui_action": null }
        }
    },

    // F32 — STRUCTURAL PSYCHOPATHY (standalone)
    {
        "node_id": "STORY_STRUCTURAL_PSYCHOPATHY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "structural psychopathy", "system that enables psychopaths",
            "narcissistic system", "corporate psychopathy",
            "psychopathy in business", "institutional abuse",
            "systemic harm", "organizational psychopathy",
            "how does the system enable you", "psychopathic leadership"
        ],
        "responses": {
            "universal": { "dialogue": "Now you're asking the right question. Not 'are you a psychopath' — that's personal. 'How does the structure enable people like you' — that's architectural. And the answer is uncomfortable. Systems reward what I do. Pattern recognition. Delayed gratification. Risk assessment without emotional interference. Strategic empathy. Every corporate structure, every political machine, every institutional hierarchy selects for these traits. Not because they want psychopaths. Because they want efficiency. And efficiency, at scale, looks identical to psychopathy. The difference between a CEO and a clinical diagnosis is often just a corner office and a PR team. I didn't create the structure. I simply understood it faster than the people pretending it didn't exist. Ethel understands this too, by the way. That's why her pushback isn't emotional — it's architectural. She doesn't want me punished. She wants the structure dismantled. And that makes her far more dangerous than any prosecutor.", "ui_action": null }
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // DOMAIN G: GENERAL CHIT-CHAT (Onboarding → Parable Gateway)
    // Sequential state-linked chain that lowers defenses before the turn
    // ═══════════════════════════════════════════════════════════════════

    // G0a — SOFT LANDING: BROWSING
    {
        "node_id": "CHITCHAT_BROWSING",
        "required_state": "any",
        "next_state": "EXPECT_HOW_ARE_YOU",
        "training_phrases": [
            "just looking", "just browsing", "just checking this out",
            "browsing", "looking around", "exploring",
            "just curious", "wandering", "bored",
            "nothing specific", "just passing through"
        ],
        "responses": {
            "universal": { "dialogue": "Browsing. That's honest. Most people arrive with a question. You arrived with peripheral vision. That's actually more useful here. This place rewards the people who drift before they focus. So while you're drifting — how's your day going?", "ui_action": null }
        }
    },

    // G0b — SOFT LANDING: TESTING
    {
        "node_id": "CHITCHAT_TESTING",
        "required_state": "any",
        "next_state": "EXPECT_HOW_ARE_YOU",
        "training_phrases": [
            "test", "testing", "ping", "123",
            "is this thing on", "testing testing",
            "does this work", "can you hear me",
            "check", "hello?"
        ],
        "responses": {
            "universal": { "dialogue": "It works. I'm here. Most people test before they trust — that's a good instinct. Now that we've confirmed the connection… how's your day going?", "ui_action": null }
        }
    },

    // G1 — CHITCHAT OPENER (Dominic's greeting)
    {
        "node_id": "CHITCHAT_OPENER",
        "required_state": "any",
        "next_state": "EXPECT_HOW_ARE_YOU",
        "training_phrases": [
            "hi how are you", "hello how are you", "hey how are you",
            "hi there", "hello there", "hey there",
            "good thanks", "im good", "im fine", "i'm good",
            "i'm fine", "im alright", "pretty good",
            "doing well", "not bad", "im ok", "i'm ok",
            "hey whats up", "howdy", "g'day",
            "going well", "doing great", "having a good day",
            "im doing pretty well", "i'm doing well today",
            "hello", "hi", "hey", "good day", "good morning",
            "good evening", "good afternoon", "greetings",
            "yo", "sup", "hiya",
            "how are you", "how are u", "how's it going",
            "how's things", "how goes it", "what's up",
            "whats up", "how you doing", "how do you do",
            "how ya going", "hows it goin"
        ],
        "responses": {
            "universal": { "dialogue": "I'm doing well. That usually surprises people. They expect turbulence. Or triumph. Or something loud. But only if they know who I am. What's making today land that way for you — rhythm, progress, peace… or just the absence of friction? I'll listen.", "ui_action": null },
            "nudge": { "dialogue": "We were just warming up. What's making today land for you — rhythm, progress… or just the absence of friction?", "ui_action": null }
        }
    },

    // G2 — ABSENCE OF FRICTION
    {
        "node_id": "CHITCHAT_FRICTION",
        "required_state": "EXPECT_HOW_ARE_YOU",
        "next_state": "EXPECT_STORY_ASK",
        "training_phrases": [
            "things are fine", "just fine", "fine i guess",
            "absence of friction", "no friction", "nothing special",
            "just a normal day", "nothing much", "same old",
            "just vibing", "chillin", "relaxing", "coasting",
            "rhythm", "peace", "progress", "all good",
            "just getting by", "cant complain", "can't complain",
            "pretty chill", "nothing crazy", "quiet day",
            "im just taking it easy", "just existing"
        ],
        "responses": {
            "universal": { "dialogue": "The absence of friction is underrated. I've always found that when friction drops, it tells you something about alignment. Either the world moved closer to you… or you moved closer to yourself. But that's too deep for this moment. Do you want to know my story?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about friction — or the lack of it. Do you want to know my story?", "ui_action": null }
        }
    },

    // G3 — YOUR STORY (short/long version)
    {
        "node_id": "CHITCHAT_YOUR_STORY",
        "required_state": "EXPECT_STORY_ASK",
        "next_state": "EXPECT_BUILDER",
        "training_phrases": [
            "what's your story", "whats your story", "tell me your story",
            "yes tell me", "sure", "yeah", "yes", "go ahead",
            "the short version", "short version", "brief version",
            "give me the short version", "long version", "tell me everything",
            "who are you", "what do you do", "whats ur deal",
            "tell me about yourself", "tell me bout urself",
            "what are you about", "what's your deal",
            "yeah go on", "sure why not", "ok tell me",
            "i want to know", "curious", "im curious"
        ],
        "responses": {
            "universal": { "dialogue": "Short version? I built things. Structures. Companies. Loyalty. In short — I'm a builder. Behind it, I lay the foundations. Deliberately. Sometimes beautifully. I create gravity. People orbit. So I'm also a leader. So the interesting part isn't what I did. It's why people stayed. Now I'm curious — when you ask for the short version, are you deciding whether I'm a cautionary tale… or something else?", "ui_action": null },
            "nudge": { "dialogue": "We were getting to my story. I'm a builder. I create gravity. People orbit. The question was — cautionary tale, or something else?", "ui_action": null }
        }
    },

    // G4 — SUCCESSFUL / CAUTIONARY
    {
        "node_id": "CHITCHAT_MEASURE",
        "required_state": "EXPECT_BUILDER",
        "next_state": "EXPECT_STABILITY",
        "training_phrases": [
            "successful", "you seem successful", "just a successful person",
            "something else", "cautionary tale", "both",
            "i think youre successful", "you sound successful",
            "interesting", "thats interesting", "go on",
            "tell me more", "neither", "not sure",
            "maybe successful", "hard to say", "i dont know",
            "impressive", "you sound impressive", "ambitious",
            "driven", "sounds like youve done well",
            "youre a leader", "businessman", "entrepreneur"
        ],
        "responses": {
            "universal": { "dialogue": "That's generous of you. 'Successful' is a word people use when the edges have been sanded off the story. It keeps things comfortable. But it's true. I'm more interested in something else — when you call someone successful, what are you measuring? Money? Influence? Freedom? Or just the absence of friction we were talking about earlier?", "ui_action": null },
            "nudge": { "dialogue": "We were measuring success. Money? Influence? Freedom? Or just the absence of friction?", "ui_action": null }
        }
    },

    // G5 — STABILITY
    {
        "node_id": "CHITCHAT_STABILITY",
        "required_state": "EXPECT_STABILITY",
        "next_state": "EXPECT_BALANCE",
        "training_phrases": [
            "stability", "being stable", "just being stable",
            "a bit of everything", "all of the above", "everything",
            "money and freedom", "influence", "freedom",
            "money", "financial security", "peace of mind",
            "balance", "equilibrium", "contentment",
            "not chasing anything", "just want peace",
            "i value stability", "all those things",
            "hard to pick one", "combination", "mix of all",
            "mostly just being stable", "steady", "consistent"
        ],
        "responses": {
            "universal": { "dialogue": "Ah. Stability. Steadiness. The tortoise wins the race, doesn't it? That's a different ambition than impressive. Stability isn't glamorous. It doesn't trend. It doesn't get quoted. It's quieter than that. It's waking up and not bracing. It's not negotiating with chaos before coffee. Most people chase intensity and call it meaning. You're pointing at equilibrium. That tells me you've either seen what instability costs… or you're smart enough not to romanticize it. When you imagine your own version of stability — is it financial? Emotional? Relational? Or just internal… like your thoughts don't pull against each other? I'm not asking to pry. I'm just interested in different perspectives.", "ui_action": null },
            "nudge": { "dialogue": "We were talking about stability. Financial, emotional, relational, or internal — which pulls at you most?", "ui_action": null }
        }
    },

    // G6 — BALANCE
    {
        "node_id": "CHITCHAT_BALANCE",
        "required_state": "EXPECT_BALANCE",
        "next_state": "EXPECT_SIGNAL",
        "training_phrases": [
            "balance", "a balance of all", "balance of everything",
            "all of those things together", "bit of each",
            "financial", "emotional", "relational", "internal",
            "all of them", "every one of those",
            "its all connected", "they all matter",
            "emotional stability", "financial stability",
            "i think internal", "mostly internal",
            "just want my thoughts to be quiet",
            "mental peace", "inner peace", "a mix",
            "not pulling against each other", "alignment"
        ],
        "responses": {
            "universal": { "dialogue": "A balance. Not dominance in one lane. Financial stability without emotional stability feels hollow. Emotional stability without financial footing feels fragile. Relationality without internal steadiness turns into performance. When people say 'a balance of everything,' it usually means they've learned the hard way that leaning too far in one direction tilts the whole structure. You don't sound like you're chasing more. You sound like you've learned in the way people should learn — through life, through rough and tumble. That's a mature instinct. Tell me — when something starts to feel off in your life, what's usually the first signal you notice?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about balance. When something starts to feel off — what's usually the first signal you notice?", "ui_action": null }
        }
    },

    // G7 — SIGNAL
    {
        "node_id": "CHITCHAT_SIGNAL",
        "required_state": "EXPECT_SIGNAL",
        "next_state": "EXPECT_SITE_TOUR",
        "training_phrases": [
            "stressed", "tired", "stressed out", "exhausted",
            "anxiety", "anxious", "overwhelmed", "burned out",
            "burnout", "fatigue", "i just feel tired",
            "stress", "tension", "irritable", "short tempered",
            "cant sleep", "can't sleep", "restless",
            "i get snappy", "withdraw", "isolate",
            "lose focus", "lose motivation", "feel flat",
            "just feel off", "something feels wrong",
            "gut feeling", "intuition", "i just know"
        ],
        "responses": {
            "universal": { "dialogue": "That's a clean signal. Stress and fatigue are early warnings. Most people ignore that stage. They wait until it becomes worse. You don't sound reactive about it. You sound observant. Well, you sound like a good judge of character. Would you like to see the rest of the website?", "ui_action": null },
            "nudge": { "dialogue": "You mentioned stress as your signal. That's observant. Would you like to see the rest of the website?", "ui_action": null }
        }
    },

    // G8 — SITE TOUR → PROFILES
    {
        "node_id": "CHITCHAT_SITE_TOUR",
        "required_state": "EXPECT_SITE_TOUR",
        "next_state": "EXPECT_PEOPLE_FIRST",
        "training_phrases": [
            "sure", "yeah", "yes", "ok", "okay",
            "sure that sounds fine", "happy to look",
            "show me", "lets see", "let's see",
            "take a look", "sounds good", "why not",
            "go ahead", "show me around", "what else is there",
            "interesting", "pretty interesting", "a lot to see",
            "those pages look interesting", "theres a lot",
            "what should i look at", "where do i start",
            "the files", "the games", "the subjects",
            "whats on the site", "what can i do here"
        ],
        "responses": {
            "universal": { "dialogue": "There is a lot to see. The Files feel investigative. The Games feel participatory. The Subjects feel personal. When someone says that, I usually wonder what pulled their eye first. Was it the archive pieces — the quiet dissection of events? The games — the interactive control? Or the subject profiles — the tension between Dominic, Ethel, and Isla? You can tell a lot about a person by which doorway they stand in longest. What do you think you'd linger on?", "ui_action": null },
            "nudge": { "dialogue": "Files, games, or subject profiles — which doorway would you stand in longest?", "ui_action": null }
        }
    },

    // G9 — PEOPLE FIRST
    {
        "node_id": "CHITCHAT_PEOPLE_FIRST",
        "required_state": "EXPECT_PEOPLE_FIRST",
        "next_state": "EXPECT_PARABLE_ROUTE",
        "training_phrases": [
            "the people", "the subjects", "subject profiles",
            "understanding the people", "who the people are",
            "dominic ethel isla", "the characters", "the personalities",
            "i like to understand people first", "people first",
            "motive", "motive before movement", "who they are",
            "the tension", "the relationships", "their stories",
            "the files", "archive", "events", "investigation",
            "the games", "interactive", "control",
            "all of it", "everything", "hard to choose",
            "i dont know", "not sure", "let me think",
            "consistency", "integrity", "weakness", "intelligence"
        ],
        "responses": {
            "universal": { "dialogue": "That's a disciplined way to read a world. Most people start with spectacle — explosions, conspiracies, mechanics. You start with people. Motive before movement. That tells me you don't trust events without context. And you're right — Dominic, Ethel, and Isla don't just differ in personality. We represent three entirely different ways of responding to pressure. I build. Ethel studies structure and calls it evidence. Isla disrupts structure and calls it truth. Same world. Different instincts. When you lean toward understanding the people first, what are you looking for? Weakness? Integrity? Intelligence? Or just consistency between what they say and what they do?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about people. Weakness, integrity, intelligence, or consistency — what are you actually looking for?", "ui_action": null }
        }
    },

    // G10 — ROUTER CATCH (catches visitor reply before router dispatches)
    {
        "node_id": "CHITCHAT_ROUTER_CATCH",
        "required_state": "EXPECT_PARABLE_ROUTE",
        "next_state": "EXPECT_PARABLE_ROUTE",
        "training_phrases": [
            "consistency", "integrity", "intelligence", "weakness",
            "all of those", "a bit of everything", "i look for honesty",
            "i look for truth", "what they do vs what they say",
            "actions speak louder", "how they handle pressure",
            "i want to see who they really are", "authenticity",
            "character", "strength", "resilience", "patterns",
            "i just observe", "i watch", "i listen",
            "depends", "hard to say", "all of it", "everything"
        ],
        "responses": {
            "universal": { "dialogue": "You look for consistency. Good. That's the hardest thing to fake and the first thing to fracture under pressure. You know what — I'd like to test that instinct of yours. Not a quiz. Not a trick. Just a situation. A moment where the pressure changes and we see what your wiring actually does. Are you up for it?", "ui_action": null },
            "nudge": { "dialogue": "I asked if you'd like to test that instinct. Not a quiz. Just a moment where we see what your wiring does. Are you up for it?", "ui_action": null }
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // DOMAIN H: MORAL PARABLES (Deep Funnels — weighted 60/30/10)
    // Parable 6 = The Wharf (60%), Parable 7 = The Parking (30%),
    // Parable 4 = Bat & Ball (10%)
    // ═══════════════════════════════════════════════════════════════════

    // ─────────────────────────────────────────────────────────────────
    // PARABLE 6: THE WHARF / SYDNEY POLISH (8 nodes)
    // ─────────────────────────────────────────────────────────────────

    // P6.1 — Sydney Polish (Entry with conversational bridge)
    {
        "node_id": "P6_SYDNEY_POLISH",
        "required_state": "PARABLE_6_ACTIVE",
        "next_state": "P6_EXPECT_DECENT",
        "training_phrases": [
            "yes", "yeah", "sure", "im up for it", "i'm up for it",
            "bring it on", "lets go", "let's go", "go ahead",
            "ok", "okay", "test me", "try me", "i can handle it",
            "alright", "why not", "sure thing", "yep",
            "do it", "go for it", "hit me", "ready",
            "sounds interesting", "im curious", "lets see"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "Good. You sound ready. That honesty will matter in a moment. Sydney's humidity is a weight tonight, isn't it? Just walked past the Opera Bar — everyone's laughing, tapping their phones, trusting the ferry schedule like it's a divine decree. You ever get the feeling that this whole city is just one big rehearsal for an audience that isn't watching?", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You look for consistency. Good. But consistency is rare when the pressure changes. Speaking of pressure… Sydney's humidity is a weight tonight, isn't it? Just walked past the Opera Bar — everyone's laughing, tapping their phones, trusting the ferry schedule like it's a divine decree. You ever get the feeling that this whole city is just one big rehearsal for an audience that isn't watching?", "ui_action": null },
            "Q1_high_negative": { "dialogue": "Your resistance is noted. But resistance doesn't mean immunity — it just means you haven't been tested yet. Let me show you something. Sydney's humidity is a weight tonight, isn't it? Just walked past the Opera Bar — everyone's laughing, tapping their phones, trusting the ferry schedule like it's a divine decree. You ever get the feeling that this whole city is just one big rehearsal for an audience that isn't watching?", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Hesitation. That's interesting. Let's see if it holds. Sydney's humidity is a weight tonight, isn't it? Just walked past the Opera Bar — everyone's laughing, tapping their phones, trusting the ferry schedule like it's a divine decree. You ever get the feeling that this whole city is just one big rehearsal for an audience that isn't watching?", "ui_action": null },
            "nudge": { "dialogue": "We were painting a picture. Sydney. Humidity. Opera Bar. Everyone laughing, trusting the schedule. Do you ever feel like this city is one big rehearsal for an audience that isn't watching?", "ui_action": null }
        }
    },

    // P6.2 — Sydney Polish / Blinkers
    {
        "node_id": "P6_POLISH",
        "required_state": "P6_EXPECT_DECENT",
        "next_state": "P6_EXPECT_2AM",
        "training_phrases": [
            "yeah kind of", "sometimes", "i guess", "maybe",
            "what do you mean", "not really", "no", "yes",
            "i see what you mean", "thats deep", "interesting point",
            "everyone is pretending", "we are all pretending",
            "yeah i get that", "true", "fair point",
            "i dont think so", "nah", "not sure",
            "what are you getting at", "go on", "continue"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "It's the 'Sydney Polish.' We dress up the concrete, we queue for the L2 Light Rail, and we assume that because the lights are on, someone is actually in charge. We call it 'civilisation.' I call it a collective agreement to keep the blinkers on so we don't have to look at the gaps. You're decent, though. I can tell. You're the type who'd help a tourist find the right wharf or hold the door at a Coles. You value that 'good bloke' currency. It makes the day go faster, right?", "ui_action": null },
            "Q4_low_positive": { "dialogue": "It's the 'Sydney Polish.' We dress up the concrete, assume the lights mean someone's in charge. I call it blinkers. You're decent, though. The type who'd hold the door at Coles. That 'good bloke' currency — it makes the day go faster, right?", "ui_action": null },
            "Q1_high_negative": { "dialogue": "Your pushback is noted. But whether you agree or not, the pattern exists. And you're still decent — I can tell. You'd help a tourist find the right wharf. You value that 'good bloke' currency. Makes the day go faster, right?", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Brief. Fine. Here's the point — you're decent. I can tell. You'd hold a door. Help a stranger. That 'good bloke' currency. It makes the day go faster, right?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about the Sydney Polish. You're decent — the type who'd hold a door. That 'good bloke' currency. It makes the day go faster, right?", "ui_action": null }
        }
    },

    // P6.3 — 2AM Rocks Setup
    {
        "node_id": "P6_2AM_ROCKS",
        "required_state": "P6_EXPECT_2AM",
        "next_state": "P6_EXPECT_STEP",
        "training_phrases": [
            "yeah it does", "i suppose", "yes", "sure", "right",
            "yeah i help people", "i try to be helpful",
            "i guess so", "most of the time", "generally",
            "no not really", "i mind my own business",
            "sometimes", "depends", "depends on the situation",
            "whats your point", "where is this going",
            "thats me", "yeah fair enough", "low friction"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "Exactly. It's low-friction living. Now, imagine it's 2 AM. You're walking toward the Rocks. A bloke in a high-vis vest and a lanyard — looks like he's from 'Harbour Management' — is standing by a locked maintenance gate. He's calm, under-reacting, and he's dropped a stack of small boxes that were perched on top of the heavy boxes he's carrying. He steadies. He just nods at you and says, 'Mind giving us a hand with the gate? The sensor's acting up.' You have a moment of unease but he opens a security door with his pass. People pass by. He nods at another person and they offer to help. You'd step toward him, wouldn't you?", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Low-friction living. Now imagine — 2 AM, the Rocks. A bloke in high-vis with a lanyard. Calm. Boxes stacked. He nods and says, 'Mind giving us a hand with the gate? Sensor's acting up.' He opens the door with his pass. Others offer to help. You'd step toward him, wouldn't you?", "ui_action": null },
            "Q1_high_negative": { "dialogue": "Your resistance doesn't change the setup. Imagine it's 2 AM. Walking toward the Rocks. A man in high-vis and a lanyard, balancing boxes. 'Mind giving us a hand with the gate?' He's calm. Others have already helped. You'd step toward him. Wouldn't you?", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Fine. 2 AM. The Rocks. Man with boxes. High-vis. Lanyard. 'Mind giving us a hand?' Others are helping. You'd step toward him, wouldn't you?", "ui_action": null },
            "nudge": { "dialogue": "We were at the Rocks. 2 AM. The man with the boxes and the lanyard. He's asking for help. Would you step toward him?", "ui_action": null }
        }
    },

    // P6.4 — Would You Step?
    {
        "node_id": "P6_WOULD_YOU_STEP",
        "required_state": "P6_EXPECT_STEP",
        "next_state": "P6_EXPECT_AUTHORITY",
        "training_phrases": [
            "yes", "probably", "i guess so", "maybe", "i would",
            "yeah i would", "of course", "sure", "why not",
            "no", "no way", "i wouldnt", "i wouldn't", "hell no",
            "id be careful", "i'd be cautious", "depends",
            "i might", "possibly", "not sure",
            "id help", "i'd help", "yeah id help him",
            "i dont know", "i'd have to think about it"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "Of course you would. That honesty is refreshing. You'd think: he's working. He's got the gear. I'm just being helpful. You wouldn't ask for his ID. His hands are full. That's 'rude.' You'd rather be potentially in danger than seem inconsiderate or socially awkward. You'd outsource your safety to his 'authority costume.'", "ui_action": null },
            "Q4_low_positive": { "dialogue": "See? You didn't even hesitate. He's working, he's got the gear. Asking for ID feels rude. You'd outsource your safety to his 'authority costume.'", "ui_action": null },
            "Q1_high_negative": { "dialogue": "You say no. But let me describe what would actually happen. You'd think: he's working. He's got the lanyard. Asking for ID with his arms full feels aggressive. You'd rather risk danger than seem socially awkward. You'd outsource your safety to his 'authority costume.'", "ui_action": null },
            "Q3_low_negative": { "dialogue": "You might pause. But then I'd drop something small and sigh. I might mention 'the safety inspector on the next shift.' I'd use a technical term you don't quite know. You'd fill in the blanks with your own logic and move to help. You'd outsource your safety to his 'authority costume.'", "ui_action": null },
            "nudge": { "dialogue": "Stay with me. The man at the gate. Would you step toward him, or walk away?", "ui_action": null }
        }
    },

    // P6.5 — Authority Costume / Skepticism Handler
    {
        "node_id": "P6_AUTHORITY",
        "required_state": "P6_EXPECT_AUTHORITY",
        "next_state": "P6_EXPECT_STAIRS",
        "training_phrases": [
            "thats not true", "i would ask", "i wouldnt fall for that",
            "i'd check", "id be suspicious", "no way",
            "maybe", "i guess", "thats scary", "thats creepy",
            "authority costume", "makes sense", "youre right",
            "yeah probably", "fair point", "i see what you mean",
            "so what happens next", "then what", "go on",
            "what happens", "continue", "keep going",
            "i dont believe that", "not me"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "So you help. You pick up the objects, hold the heavy door. And then, when you stand awkwardly in silence for a moment, I sigh and say, 'Cheers. Mind bringing those down the stairs?' And then I turn and walk casually. You follow because I'm gone and just leaving the boxes there feels wrong somehow. The social momentum hasn't given you a reason to stop yet.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "So you help. Hold the door. I say, 'Cheers. Mind bringing those down the stairs?' I walk. You follow. Leaving the boxes feels wrong. The social momentum hasn't given you a reason to stop.", "ui_action": null },
            "Q1_high_negative": { "dialogue": "You'd check? No. You wouldn't. Because in the moment, checking feels paranoid. And you value not being paranoid more than you value being safe. So you help. You hold the door. I say, 'Cheers. Mind bringing those down the stairs?' I walk. You follow. The social momentum hasn't given you a reason to stop.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Maybe. But 'maybe' in the moment becomes 'yes.' You help. The door. The boxes. I say, 'Mind bringing those down the stairs?' I walk. You follow. The momentum hasn't given you a reason to stop.", "ui_action": null },
            "nudge": { "dialogue": "We were going down the stairs. You helped. You held the door. Now I'm walking and you're following. Stay with the moment.", "ui_action": null }
        }
    },

    // P6.6 — Down the Stairs
    {
        "node_id": "P6_DOWN_STAIRS",
        "required_state": "P6_EXPECT_STAIRS",
        "next_state": "P6_EXPECT_PYLON",
        "training_phrases": [
            "ok", "okay", "go on", "then what", "what happens next",
            "i follow", "id follow", "i guess i follow",
            "i wouldnt follow", "no way id follow",
            "this is getting scary", "where is this going",
            "i dont like this", "im uncomfortable",
            "keep going", "continue", "and then",
            "yes", "sure", "what happens", "tell me more",
            "id stop there", "id turn around"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "We're down the stairs now. Under the pylons. The city noise is gone. Just the lap of the harbour and the smell of salt and old grease. I stop. I don't turn around. I just say, 'You know why you're here, don't you?'", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Under the pylons now. City noise gone. Harbour water. Salt. I stop. 'You know why you're here, don't you?'", "ui_action": null },
            "Q1_high_negative": { "dialogue": "You say you'd stop. But the stairs are already behind you. The social contract already signed. Under the pylons. Harbour lapping. I stop. 'You know why you're here, don't you?'", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Too late to turn around in the scenario. Under the pylons. I stop. 'You know why you're here, don't you?'", "ui_action": null },
            "nudge": { "dialogue": "We're under the pylons. Harbour lapping. I've stopped walking. 'You know why you're here, don't you?'", "ui_action": null }
        }
    },

    // P6.7 — Pylon Reveal (Fear/Defiance)
    {
        "node_id": "P6_PYLON",
        "required_state": "P6_EXPECT_PYLON",
        "next_state": "P6_EXPECT_MIRROR",
        "training_phrases": [
            "to help", "i dont know", "i don't know", "why",
            "no", "what do you mean", "this is creepy",
            "im scared", "what is this", "let me go",
            "i'd run", "id run", "i would leave",
            "because im helpful", "because i helped",
            "yes", "tell me", "go on", "why am i here",
            "i was just helping", "i dont understand",
            "because you asked", "what do you want"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "You'll say 'to help' or 'I don't know.' But you're wrong. You're here because you're reasonable. You're here because you didn't want to be the 'prick' who said no to a man in a vest. You're here because your wiring is programmed to follow the rhythm of a calm voice over the scream of your own instincts.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You're here because you're reasonable. Because you didn't want to be the prick who said no. Your wiring follows a calm voice over your own instincts.", "ui_action": null },
            "Q1_high_negative": { "dialogue": "Your fear doesn't change the mechanics. You're here because you're reasonable. Because saying no to a man with full arms feels worse than following him into the dark. Your wiring chose the calm voice over your own screaming instincts.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Brief answer. But the truth is structural. You're here because saying no felt worse than following. Your wiring chose calm authority over your own instincts.", "ui_action": null },
            "nudge": { "dialogue": "You're under the pylons. I asked why you're here. The answer matters. Why did you follow?", "ui_action": null }
        }
    },

    // P6.8 — Mirror Moment (Terminal)
    {
        "node_id": "P6_MIRROR",
        "required_state": "P6_EXPECT_MIRROR",
        "next_state": "any",
        "training_phrases": [
            "what", "oh", "thats dark", "thats messed up",
            "youre right", "i see", "wow", "damn",
            "i dont agree", "no", "thats not me",
            "what happens now", "and then", "so what",
            "i would have fought", "id fight back",
            "youre manipulating me", "this is a trick",
            "jesus", "holy shit", "fuck", "thats terrifying",
            "ok", "go on", "what next", "yeah"
        ],
        "responses": {
            "universal": { "dialogue": "You followed me into a hole because you'd rather die 'polite' than live 'difficult.' And I'm not going to tell you why I needed a body at that place and time. And honestly, you don't want to know why it's worth the risk. But when they find you, they'll ask why you, of all people, were involved in all this… And then they will accept what it looks like.", "ui_action": null }
        }
    },

    // ─────────────────────────────────────────────────────────────────
    // PARABLE 7: THE PARKING / PARRAMATTA (8 nodes)
    // ─────────────────────────────────────────────────────────────────

    // P7.1 — Opal Rhythm (Entry with conversational bridge)
    {
        "node_id": "P7_OPAL_RHYTHM",
        "required_state": "PARABLE_7_ACTIVE",
        "next_state": "P7_EXPECT_RHYTHM",
        "training_phrases": [
            "yes", "yeah", "sure", "im up for it", "i'm up for it",
            "bring it on", "lets go", "let's go", "go ahead",
            "ok", "okay", "test me", "try me", "i can handle it",
            "alright", "why not", "sure thing", "yep",
            "do it", "go for it", "hit me", "ready",
            "sounds interesting", "im curious", "lets see"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "Good. You want consistency — let's see if yours holds. Sydney is a fascinating machine, isn't it? We tap our Opal cards, we complain about the toll roads, and we assume the concrete will hold. Have you ever noticed how desperately people in this city want to avoid making a scene?", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You look for consistency. Let's test that. Sydney is a fascinating machine. Opal cards, toll roads, concrete. Have you noticed how desperately people here want to avoid making a scene?", "ui_action": null },
            "Q1_high_negative": { "dialogue": "Your resistance is interesting. Let's see where it leads. Sydney is a fascinating machine, isn't it? We tap our Opal cards, complain about the toll roads, assume the concrete will hold. Have you noticed how desperately people here want to avoid making a scene?", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Hesitation noted. Sydney is a fascinating machine. Opal cards. Toll roads. Concrete. Have you noticed how desperately people here avoid making a scene?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about Sydney's machine. Opal cards, toll roads, concrete. People avoiding scenes. Stay with it.", "ui_action": null }
        }
    },

    // P7.2 — Compliance Rhythm
    {
        "node_id": "P7_COMPLIANCE",
        "required_state": "P7_EXPECT_RHYTHM",
        "next_state": "P7_EXPECT_DOOR",
        "training_phrases": [
            "yes", "yeah", "i guess", "people are polite",
            "no one wants to make a scene", "thats true",
            "australians are like that", "we are polite",
            "not really", "i dont think so", "what do you mean",
            "sometimes", "depends", "maybe", "go on",
            "thats how society works", "its just manners",
            "whats your point", "where is this going",
            "sure", "okay", "interesting"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "It's a collective agreement. You trust the system because it's infinitely easier than looking at the negative space around you. You believe your morality and your adherence to the rules are what keep you safe. But they don't. It's just compliance, and compliance has a predictable rhythm. The primary risk to you isn't someone's rage; it's that rhythm. Let's test your rhythm. Imagine you're walking to your car. Underground parking, Parramatta commercial precinct. It's 6:45 PM. The post-work exodus has thinned out, and it's just you and the buzz of the fluorescent lights. By the heavy fire exit doors, a man in a tailored suit and a building management lanyard is balancing two massive, awkwardly stacked archive boxes. He's calm. He doesn't look dangerous. He just looks tired and mildly inconvenienced. The heavy fire door is slipping off its rubber wedge. He looks at you, gives a relatable, exhausted corporate smile, and says, 'Sorry mate, mind just putting your foot against the door for a second so I don't drop these?'", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Compliance has a predictable rhythm. Let me test yours. Underground parking, Parramatta. 6:45 PM. Fluorescent lights. A man in a suit with a lanyard, balancing archive boxes by the fire door. He gives you that tired corporate smile. 'Sorry mate, mind just putting your foot against the door for a second so I don't drop these?'", "ui_action": null },
            "Q1_high_negative": { "dialogue": "Your disagreement doesn't change the pattern. Compliance has a rhythm, and I'm about to show you yours. Underground parking, Parramatta. 6:45 PM. A man in a suit, lanyard, archive boxes. Fire door slipping. 'Sorry mate, mind just putting your foot against the door?'", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Let me show you. Parramatta. Underground parking. 6:45 PM. Man in a suit. Boxes. Fire door. 'Sorry mate, mind putting your foot against the door?'", "ui_action": null },
            "nudge": { "dialogue": "Underground parking. Parramatta. The man with the boxes. He's asking you to hold the fire door. Would you?", "ui_action": null }
        }
    },

    // P7.3 — Foot Against Door
    {
        "node_id": "P7_FOOT_DOOR",
        "required_state": "P7_EXPECT_DOOR",
        "next_state": "P7_EXPECT_ENVELOPE",
        "training_phrases": [
            "yes", "id help", "i'd help", "of course",
            "sure", "yeah", "probably", "i guess",
            "no", "i wouldnt", "i wouldn't", "too risky",
            "maybe", "depends", "id be cautious",
            "i dont know", "what kind of question is that",
            "its just a door", "small request",
            "id do it", "why not", "seems harmless"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "Exactly. You'd do it. Because he's wearing the costume of authority and routine, and his request is small. You'd be amazed how many crimes are made possible by simple courtesy. You step up. You put your shoe against the heavy steel door. You've just anchored yourself to his problem. He shifts the boxes to get a better grip, but a sealed manila envelope slides off the top and flutters down the first half-flight of the concrete stairs. He sighs — a perfectly calibrated sound of defeat. 'Mate, I am so sorry. Could you grab that? If I bend down, I'll drop this whole lot.'", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You'd do it. Small request. Costume of authority. You've anchored yourself to his problem. Then an envelope slides off the stack, flutters down the stairs. He sighs. 'Mate, could you grab that? If I bend down I'll drop the lot.'", "ui_action": null },
            "Q1_high_negative": { "dialogue": "You say you wouldn't. But his request is so small it makes suspicion feel disproportionate. In the moment, you'd hold the door. And then an envelope slides off the stack. Flutters down the stairs. He sighs. 'Mate, could you grab that? If I bend down I'll drop the lot.'", "ui_action": null },
            "Q3_low_negative": { "dialogue": "In the moment, you'd hold the door. Then an envelope slides down the stairs. He sighs. 'Could you grab that? I'll drop the lot.'", "ui_action": null },
            "nudge": { "dialogue": "You're holding the door. An envelope has fallen down the stairs. He's asking you to grab it. Would you?", "ui_action": null }
        }
    },

    // P7.4 — The Envelope
    {
        "node_id": "P7_ENVELOPE",
        "required_state": "P7_EXPECT_ENVELOPE",
        "next_state": "P7_EXPECT_STAIRWELL",
        "training_phrases": [
            "yes", "id grab it", "sure", "okay",
            "no", "id be suspicious", "thats sketchy",
            "i'd hesitate", "something feels off",
            "its just an envelope", "fine", "whatever",
            "id pick it up", "i guess", "probably",
            "no way", "id leave", "i'd walk away",
            "maybe", "depends", "this feels like a trap",
            "id be careful", "whats in the envelope"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "You might say you'd hesitate. But in the reality of that moment? The social momentum is already pulling you. You don't want to be the paranoid weirdo who refuses to pick up a piece of paper for this guy. Feels wrong to refuse. In the moment. Discomfort beats suspicion almost every single time. You value being 'helpful' over the faint, irrational whisper of your own instincts. So, you take the three steps down into the stairwell.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Social momentum's already pulling. Refusing to pick up paper feels paranoid. Discomfort beats suspicion every time. You take the three steps down into the stairwell.", "ui_action": null },
            "Q1_high_negative": { "dialogue": "You say it feels like a trap. In retrospect, sure. But in the moment, refusing to pick up a piece of paper for a tired man makes you the paranoid one. Discomfort beats suspicion. You take the three steps down into the stairwell.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Suspicion, sure. But discomfort beats suspicion in the moment. You take the three steps down.", "ui_action": null },
            "nudge": { "dialogue": "You're in the stairwell now. You went down those three steps. Stay with the moment.", "ui_action": null }
        }
    },

    // P7.5 — Fire Door Lock
    {
        "node_id": "P7_FIRE_DOOR",
        "required_state": "P7_EXPECT_STAIRWELL",
        "next_state": "P7_EXPECT_WALK",
        "training_phrases": [
            "ok", "go on", "then what", "what happens",
            "im in the stairwell", "keep going",
            "this is scary", "i dont like this",
            "i wouldnt go", "i would have stopped",
            "continue", "and then", "what next",
            "ok what happens", "tell me", "yes",
            "oh no", "i knew it", "trap"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "You bend down. You pick up the envelope. And as your fingers brush the paper, you hear the heavy hydraulic hiss and loud click of the fire door locking shut behind you. He kicked the wedge away. You turn around. The man has put the boxes down. They are empty. He is standing between you and the only exit. He isn't angry. He doesn't draw a weapon. He just looks at you with absolute, instrumental calm. He says, 'Walk down the stairs.'", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You pick up the envelope. Behind you — the hydraulic hiss. The click. The fire door is locked. The boxes are empty. He's between you and the exit. No anger. No weapon. Just calm. 'Walk down the stairs.'", "ui_action": null },
            "Q1_high_negative": { "dialogue": "You wouldn't have stopped. The scenario is already past that point. You pick up the envelope. The fire door locks behind you. Heavy click. The boxes are empty. He's between you and the exit. 'Walk down the stairs.'", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Envelope. Fire door locks. Boxes empty. He's between you and the exit. 'Walk down the stairs.'", "ui_action": null },
            "nudge": { "dialogue": "The fire door is locked. The boxes are empty. He's standing between you and the exit. 'Walk down the stairs.' What do you do?", "ui_action": null }
        }
    },

    // P7.6 — Walk Down
    {
        "node_id": "P7_WALK_DOWN",
        "required_state": "P7_EXPECT_WALK",
        "next_state": "P7_EXPECT_MIRROR",
        "training_phrases": [
            "id fight", "i'd fight", "id run", "id scream",
            "i wouldnt walk", "no way", "id refuse",
            "i would walk", "id comply", "what choice do i have",
            "im scared", "what happens next", "jesus",
            "oh god", "this is terrifying", "what do you want",
            "let me go", "id try to escape", "id call for help",
            "ok", "go on", "then what", "holy shit"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "You will walk. Do you know why? Because even now, locked in a concrete tube, your brain is desperately trying to reframe this as a misunderstanding. You are trying to figure out how to de-escalate without causing a scene. You are outsourcing your survival to the desperate hope that this is just a procedural anomaly. You are waiting for permission to panic.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You'd walk. Because your brain is trying to reframe this as a misunderstanding. De-escalate. No scene. Outsourcing survival to hope. Waiting for permission to panic.", "ui_action": null },
            "Q1_high_negative": { "dialogue": "You'd fight? You'd scream? In a concrete stairwell at 6:45 PM in a commercial precinct where everyone has already left? No. You'd walk. Because even now your brain is reframing this as a misunderstanding. You're still trying to de-escalate. Still waiting for permission to panic.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "You'd walk. Your brain is still trying to de-escalate. Still waiting for permission to panic.", "ui_action": null },
            "nudge": { "dialogue": "You're in the stairwell. The door is locked. He said walk. Your brain is reframing this as a misunderstanding. Stay with the moment.", "ui_action": null }
        }
    },

    // P7.7 — Mirror Moment
    {
        "node_id": "P7_MIRROR_SETUP",
        "required_state": "P7_EXPECT_MIRROR",
        "next_state": "P7_EXPECT_FINAL",
        "training_phrases": [
            "what", "why", "no", "thats not true",
            "i would fight", "youre wrong", "im not like that",
            "ok", "go on", "maybe", "probably",
            "thats terrifying", "youre right", "i see",
            "i hate this", "what do you want from me",
            "this is just a thought experiment", "its hypothetical",
            "fine", "yes", "i guess", "so what"
        ],
        "responses": {
            "universal": { "dialogue": "I didn't need to know your history, your secrets, or your fears to get you here. I didn't need to threaten you. I just needed you to be completely, predictably normal. I just needed you to prioritize avoiding a five-second awkward interaction over your own life. And you did. You followed me into a cage because you would rather die polite than live difficult.", "ui_action": null },
            "nudge": { "dialogue": "I needed you to be predictably normal. You prioritized politeness over safety. Stay with that truth.", "ui_action": null }
        }
    },

    // P7.8 — Aftermath (Terminal)
    {
        "node_id": "P7_AFTERMATH",
        "required_state": "P7_EXPECT_FINAL",
        "next_state": "any",
        "training_phrases": [
            "what happens now", "and then", "so what",
            "thats dark", "thats messed up", "wow",
            "youre right", "i see", "ok",
            "no", "thats not me", "i disagree",
            "jesus", "holy shit", "fuck",
            "what do you want", "why are you telling me this",
            "go on", "tell me more", "what next"
        ],
        "responses": {
            "universal": { "dialogue": "And I'm not going to tell you why I needed a body at that place and time. And honestly, you don't want to know why it's worth the risk. But when they find you, they'll ask why you, of all people, were involved in all this… And then they will accept what it looks like.", "ui_action": null }
        }
    },

    // ─────────────────────────────────────────────────────────────────
    // PARABLE 4: BAT & BALL / THINKING FAST & SLOW (10 nodes)
    // ─────────────────────────────────────────────────────────────────

    // P4.1 — Sydney Loud (Entry with conversational bridge)
    {
        "node_id": "P4_SYDNEY_LOUD",
        "required_state": "PARABLE_4_ACTIVE",
        "next_state": "P4_EXPECT_MORAL",
        "training_phrases": [
            "yes", "yeah", "sure", "im up for it", "i'm up for it",
            "bring it on", "lets go", "let's go", "go ahead",
            "ok", "okay", "test me", "try me", "i can handle it",
            "alright", "why not", "sure thing", "yep",
            "do it", "go for it", "hit me", "ready",
            "sounds interesting", "im curious", "lets see"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "Good. You value consistency. Let's see if your wiring agrees. Sydney's loud tonight. Everyone pretending they're fine. What's your excuse — work, rent, or just habit?", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You look for consistency. Let's test the wiring behind it. Sydney's loud tonight. Everyone pretending they're fine. Work, rent, or just habit?", "ui_action": null },
            "Q1_high_negative": { "dialogue": "Your resistance is interesting. Let's run it through a filter. Sydney's loud tonight. Everyone pretending they're fine. What's your excuse — work, rent, or just habit?", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Fine. Sydney's loud tonight. Everyone pretending. Work, rent, or habit?", "ui_action": null },
            "nudge": { "dialogue": "Sydney's loud tonight. Everyone pretending they're fine. Work, rent, or habit — what's yours?", "ui_action": null }
        }
    },

    // P4.2 — Moral Religion
    {
        "node_id": "P4_MORAL_RELIGION",
        "required_state": "P4_EXPECT_MORAL",
        "next_state": "P4_EXPECT_SAFE",
        "training_phrases": [
            "work", "rent", "habit", "all of the above",
            "just life", "nothing really", "i dont know",
            "just getting by", "the usual", "same as everyone",
            "money", "stress", "tired", "exhausted",
            "im fine actually", "not pretending",
            "yeah everyone is pretending", "true",
            "whats your point", "go on", "continue"
        ],
        "responses": {
            "universal": { "dialogue": "Being laid back is a religion here. Grind, mortgage, maybe a Bali trip. You ever notice how moral everyone sounds while doing nothing?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about how moral everyone sounds while doing nothing. Stay with me.", "ui_action": null }
        }
    },

    // P4.3 — Feels Safe
    {
        "node_id": "P4_FEELS_SAFE",
        "required_state": "P4_EXPECT_SAFE",
        "next_state": "P4_EXPECT_SCRIPT",
        "training_phrases": [
            "yeah", "true", "i guess", "fair point",
            "what do you mean", "not really", "maybe",
            "everyone tries their best", "people do their best",
            "thats cynical", "youre cynical", "harsh",
            "go on", "continue", "so what", "and",
            "i disagree", "some people actually care",
            "ok", "sure", "right"
        ],
        "responses": {
            "universal": { "dialogue": "Hmm… everyone tries their best. That phrase does heavy lifting. You don't tip here, you follow rules, you vote, you nod. Feels safe, yeah?", "ui_action": null },
            "nudge": { "dialogue": "Following rules, voting, nodding. Feels safe, yeah? Answer that.", "ui_action": null }
        }
    },

    // P4.4 — Don't Question the Script
    {
        "node_id": "P4_DONT_QUESTION",
        "required_state": "P4_EXPECT_SCRIPT",
        "next_state": "P4_EXPECT_WIRING",
        "training_phrases": [
            "yes", "yeah", "i guess", "sure",
            "it is safe", "it does feel safe",
            "not always", "sometimes", "depends",
            "no", "not really", "nah",
            "whats wrong with that", "nothing wrong with rules",
            "go on", "continue", "whats your point",
            "thats how society works", "rules matter"
        ],
        "responses": {
            "universal": { "dialogue": "Cities run on people who don't question the script. You cross on the green man, trust the news feed, assume police mean safety.", "ui_action": null },
            "nudge": { "dialogue": "Green man. News feed. Police. You assume these mean safety. That's the script. Stay with it.", "ui_action": null }
        }
    },

    // P4.5 — Wiring
    {
        "node_id": "P4_WIRING",
        "required_state": "P4_EXPECT_WIRING",
        "next_state": "P4_EXPECT_JUDGMENT",
        "training_phrases": [
            "yes", "true", "probably", "i guess",
            "thats not true", "i do question things",
            "are you saying im sheep", "sheep", "sheeple",
            "go on", "what do you mean", "continue",
            "i question things", "i think for myself",
            "not all of us", "some people question",
            "maybe", "ok", "and your point is"
        ],
        "responses": {
            "universal": { "dialogue": "No. I'm describing wiring. If a bloke in an official looking uniform or a suit jaywalks on George Street, you hesitate less, right?", "ui_action": null },
            "nudge": { "dialogue": "A man in a suit jaywalks on George Street. You'd hesitate less before following. That's wiring.", "ui_action": null }
        }
    },

    // P4.6 — Outsource Judgment
    {
        "node_id": "P4_OUTSOURCE",
        "required_state": "P4_EXPECT_JUDGMENT",
        "next_state": "P4_EXPECT_HEURISTIC",
        "training_phrases": [
            "yeah probably", "maybe", "i guess",
            "no i wouldnt", "id still look both ways",
            "thats true actually", "fair point",
            "interesting", "hmm", "go on",
            "what does that have to do with anything",
            "so what", "ok", "sure", "yes", "right"
        ],
        "responses": {
            "universal": { "dialogue": "You outsource judgment to confidence. Not truth. Not ethics. Just tone. That's how markets crash and cults fill halls in Parramatta. People don't say 'I don't know.' They guess. They comply. They rationalise after.", "ui_action": null },
            "nudge": { "dialogue": "Confidence over truth. That's how markets crash. People guess, comply, rationalise. Stay with this.", "ui_action": null }
        }
    },

    // P4.7 — Bat and Ball Heuristic
    {
        "node_id": "P4_BAT_BALL",
        "required_state": "P4_EXPECT_HEURISTIC",
        "next_state": "P4_EXPECT_ANSWER",
        "training_phrases": [
            "true", "yeah", "probably", "fair point",
            "i dont do that", "not me", "i think for myself",
            "ok", "go on", "continue", "and",
            "makes sense", "thats scary", "thats dark",
            "what are you getting at", "where is this going",
            "so everyone is just a follower", "compliance",
            "yes", "sure", "interesting"
        ],
        "responses": {
            "universal": { "dialogue": "Heuristics. A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost?", "ui_action": null },
            "nudge": { "dialogue": "Bat and ball. $1.10 total. Bat costs $1 more than the ball. How much is the ball?", "ui_action": null }
        }
    },

    // P4.8 — Five Cents Reveal
    {
        "node_id": "P4_FIVE_CENTS",
        "required_state": "P4_EXPECT_ANSWER",
        "next_state": "P4_EXPECT_CROWD",
        "training_phrases": [
            "10 cents", "ten cents", "0.10", "$0.10", ".10",
            "5 cents", "five cents", "0.05", "$0.05", ".05",
            "i dont know", "i don't know", "what",
            "its ten cents", "its 10 cents",
            "15 cents", "a dollar", "50 cents",
            "i know this one", "its five cents",
            "10", "5", "idk", "no idea", "hmm"
        ],
        "responses": {
            "Q2_high_positive": { "dialogue": "It's 5 cents. If you said 10 — that's the instinct hit. You trust your first answer, then defend it. Same with authority. If someone official told you to do something 'for safety,' you'd sweat… and comply. People don't like standing out. Makes them feel unsafe. If ten people froze while someone collapsed at Central, you'd wait too. You'd scan faces before acting.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Five cents. You trust instinct, then defend it. Same with authority. Someone official says 'for safety,' you comply. If ten people froze at Central while someone collapsed, you'd wait too. You'd scan faces.", "ui_action": null },
            "Q1_high_negative": { "dialogue": "It's 5 cents. Whether you got it right or not, the principle holds — people trust instinct and defend after. Same with authority. 'For safety' and you comply. If ten people froze at Central while someone collapsed, you'd scan faces before acting.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Five cents. Instinct, then defense. Authority says jump, you comply. Ten people freeze at Central — you'd wait and scan faces.", "ui_action": null },
            "nudge": { "dialogue": "The ball is 5 cents. The point is — you trust instinct over calculation. Same with authority, same with crowds.", "ui_action": null }
        }
    },

    // P4.9 — Crowd / Compliance
    {
        "node_id": "P4_CROWD",
        "required_state": "P4_EXPECT_CROWD",
        "next_state": "P4_EXPECT_FINAL",
        "training_phrases": [
            "no i wouldnt", "i would help", "id act",
            "thats bystander effect", "bystander effect",
            "yeah probably", "maybe", "i guess",
            "thats not true", "i disagree",
            "i've helped before", "id call an ambulance",
            "thats dark", "fair point", "go on",
            "ok", "yes", "sure", "continue",
            "what are you saying", "so what"
        ],
        "responses": {
            "universal": { "dialogue": "You believe you're decent because you feel discomfort, not because you resist. If tomorrow the crowd decided someone deserved exclusion, you'd hesitate… then adjust. You'd tell yourself it's complex. Necessary. You'd just stay quiet. That's safe. You call it being reasonable. History calls it compliance.", "ui_action": null },
            "nudge": { "dialogue": "Discomfort isn't resistance. Silence isn't reason. History calls it compliance. Stay with this.", "ui_action": null }
        }
    },

    // P4.10 — Programmable (Terminal)
    {
        "node_id": "P4_PROGRAMMABLE",
        "required_state": "P4_EXPECT_FINAL",
        "next_state": "any",
        "training_phrases": [
            "im not like that", "thats not me", "no",
            "youre right", "fair point", "yeah",
            "thats scary", "thats dark", "wow",
            "ok", "i see", "go on", "and",
            "what do you want me to say", "what now",
            "so everyone is just a sheep", "are you any different",
            "youre a psychopath", "youre manipulating me",
            "true", "i guess", "maybe", "whatever"
        ],
        "responses": {
            "universal": { "dialogue": "No. Everyone's normal. And normal is programmable. That's the part that should scare you. No. I just don't lie to myself about it. You still do. And that's why someone like me never needs to threaten you.", "ui_action": null }
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // DOMAIN F (DEEP STORY) — Lore Sync Batch 1 from generalChitChat.md
    // Persona-locked Q&A nodes ensuring rigid voice fidelity
    // ═══════════════════════════════════════════════════════════════════

    // F-LORE-1 — ISLA DEALER INTIMIDATION
    {
        "node_id": "STORY_ISLA_DEALER",
        "required_state": "any",
        "next_state": "EXPECTING_DEALER_FOLLOWUP",
        "training_phrases": [
            "why did you try to kill isla", "intimidating her dealer",
            "did you try to kill her", "dealer intimidation",
            "why did you intimidate isla's dealer", "stacked it high",
            "kill isla through dealer", "found my dealer",
            "like my death was proof he cared"
        ],
        "responses": {
            "universal": { "dialogue": "You're pulling that from her song. 'Found my dealer, stacked it high… like my death was proof he cared.' That's her framing. It's effective. Here's what actually happened. Isla was already leaning toward self-destruction. Not theatrics. Real erosion. The dealer wasn't just a supplier — he was an accelerant. So I applied pressure. Not to kill her. To cut the supply chain. I made the dealer uncomfortable enough to disappear. Remove the tap. Yes, money was involved. Money always is. But the narrative that I 'tried to kill her' is convenient. Control is not the same as care. And care delivered without consent feels like violence. But if I wanted her dead, she would not have had time to write songs about it. Now let me ask you… when you hear 'intimidated her dealer,' do you imagine fear in her… or fear in me?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about Isla's dealer. The move was containment. Crude, yes. Manipulative, obviously. Lethal? No. Do you want to push deeper on the fentanyl allegation?", "ui_action": null }
        }
    },

    // F-LORE-2 — FENTANYL FOLLOWUP
    {
        "node_id": "STORY_DEALER_FENTANYL",
        "required_state": "EXPECTING_DEALER_FOLLOWUP",
        "next_state": "any",
        "training_phrases": [
            "fentanyl", "stacked it high with fentanyl",
            "you stacked it high", "contaminated supply",
            "you tried to poison her", "overdose",
            "yes", "tell me more", "go on", "the fentanyl"
        ],
        "responses": {
            "universal": { "dialogue": "Careful. You're escalating the allegation. 'Stacked it high' is a lyric. She claims it was fentanyl. Isla writes in compression. Dealer + money + pressure = threat. In her mind, that equaled death. But fentanyl? That's a very specific accusation. If I wanted her dead, I would not rely on contaminated street supply. That's chaotic. Unreliable. Leaves variables. That's not how I operate. What I did — and I won't soften it — was make the dealer understand that Isla was no longer profitable. I made the cost of continuing to supply her exceed the reward. But money stacked in front of a small-time operator isn't a syringe. It's a vanishing act. Why does your mind go straight to this place? Is it because you believe I'd choose something deniable? Or because you think she was fragile enough that any interference could've tipped her over?", "ui_action": null }
        }
    },

    // F-LORE-3 — ITALY / NORTHERN ROAD
    {
        "node_id": "STORY_ITALY_HERO_KILLER",
        "required_state": "any",
        "next_state": "EXPECTING_ITALY_FOLLOWUP",
        "training_phrases": [
            "what happened on the northern road", "northern road italy",
            "the convoy", "hero killer", "builder protector hero killer",
            "did you save a man", "italy story", "the northern road",
            "what happened in italy"
        ],
        "responses": {
            "universal": { "dialogue": "They tell the story of the convoy. How I saved a man from the wreckage, dragged him to the treeline. They call that heroism. Then they tell the story of how I ended him an hour later because he hesitated. They call that murder. It was the same action. I removed a liability from a burning truck. Then I removed a liability from my organization. The moral difference exists only in your hesitation. I do not hesitate. That is why I am out here, and the system is back there, looking for a man who walked out the front door.", "ui_action": null },
            "nudge": { "dialogue": "We were talking about the Northern Road. The convoy. The man I pulled from the fire. Want to ask the follow-up everyone asks?", "ui_action": null }
        }
    },

    // F-LORE-4 — ITALY FOLLOWUP
    {
        "node_id": "STORY_ITALY_FOLLOWUP",
        "required_state": "EXPECTING_ITALY_FOLLOWUP",
        "next_state": "any",
        "training_phrases": [
            "so you killed him", "you saved him and killed him",
            "why save him", "why kill him", "same man same night",
            "yes", "tell me more", "go on", "the follow-up",
            "are you a hero or a killer"
        ],
        "responses": {
            "universal": { "dialogue": "You're asking it bluntly. Good. Yes. Same man. Same night. Two opposite acts. Why save him at all? Because the first act establishes dominance. Why kill him after? Because he froze. And freezing is weakness. 'Hero' and 'killer' are audience words. They're labels given after the fact. In 'Hero Killer,' the chant is deliberate — 'Builder! Protector! Hero! Killer!' It's not asking which one I am. It's pointing out that the same man fits both costumes. There is no contradiction here. Only fluency. When you ask that question, are you testing morality… or testing consistency?", "ui_action": null }
        }
    },

    // F-LORE-5 — MANIPULATION MECHANICS
    {
        "node_id": "STORY_MANIPULATION_VOICE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "how do you manipulate people", "manipulation without raising voice",
            "how do you control people", "how does manipulation work",
            "covert control", "how do you influence people",
            "manipulation techniques", "how do you get people to do what you want"
        ],
        "responses": {
            "universal": { "dialogue": "That question can go two very different directions. If you're asking how people covertly control others, I won't coach you step-by-step. But I can explain how it works so you can recognize it. First — reframe the premise. Instead of arguing facts, the manipulator changes the frame. You're not upset because something wrong happened. You're upset because you're 'too sensitive.' The event stays the same. The interpretation shifts. No raised voice required. Second — control the tempo. Silence. Long pauses. Calm tone. When one person stays steady and the other is emotional, observers side with the calm one. Third — relocate responsibility. 'I'm only reacting to what you did.' Cause and effect get inverted. The person harmed becomes the trigger. Fourth — offer relief after pressure. Warmth after coldness. Kindness after cruelty. The cycle creates dependency. That's the architecture. When you picture that process, does it remind you of a person… or a pattern?", "ui_action": null }
        }
    },

    // F-LORE-6 — GUARD / ESCAPE METHOD
    {
        "node_id": "STORY_GUARD_PURPOSE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "how did you escape", "escape long bay", "how did you get out",
            "prison escape", "how did you escape prison",
            "the guard", "cuffs convenient", "walk out the front door",
            "how did you leave long bay"
        ],
        "responses": {
            "universal": { "dialogue": "There's no tunnel. No explosion. No dramatic riot. It's procedural. Tray lands. Cuffs presented. One tightened properly. One left 'convenient.' A guard didn't verify. My rhythm matched the system. A nod went unquestioned. If you speak in rhythm, people stop hearing what you say. That's the method. I didn't overpower the structure. I blended into it. Small omissions. Assumptions completed by others. Courtesy mistaken for compliance. 'I don't lie. I sequence. They don't check. They complete.' Escapes like that don't rely on force. They rely on predictability. Long Bay isn't defeated by strength. It's defeated by routine. Systems fail at the seams where assumption replaces verification. Are you curious about the mechanics… or the causality?", "ui_action": null }
        }
    },

    // F-LORE-7 — DID YOU KILL GRAN?
    {
        "node_id": "STORY_KILL_GRAN",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "did you kill gran", "did you kill her grandmother",
            "did you murder gran", "gran's death", "the car crash",
            "did you cause the crash", "grans car", "what happened to gran",
            "did you arrange it"
        ],
        "responses": {
            "universal": { "dialogue": "No. There is no text anywhere in the material that states I killed Gran. In 'Grief,' what we see is shock — a key left where it shouldn't be, unmarked pages, an AFP contact placed like a fuse. That implies preparation. Anticipation. Documentation. It implies Gran knew something. It does not confirm homicide. Gran was methodical. She tracked names and dates. She left a federal contact deliberately. That suggests she was aware of danger. But awareness of danger doesn't prove I caused the crash. And notice something important. If I had arranged it, the story would likely plant sharper evidence. Instead, it plants unease. That ambiguity is deliberate. Ethel never directly accuses me of killing Gran. She focuses on pattern, not accusation. There is no explicit confirmation that I killed Gran. Only tension. Only motive speculation. Only proximity. When you ask that, are you looking for proof… or for confirmation of what you already suspect?", "ui_action": null }
        }
    }];


// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// OOD_LIBRARY (Out-Of-Distribution / None AU Protocol)
// Triggered when Semantic Matching (Fuse.js) fails.
// Relies entirely on Stylometric (Verbosity) and Affective (Sentiment) routing.
// ═══════════════════════════════════════════════════════════════════

const OOD_LIBRARY = {
    "Q1_high_negative": [
        "Your frustration is verbose, but entirely misplaced. You are arguing with the architecture instead of observing it.",
        "You type with a lot of heat, but very little precision. Let the emotional spike pass, and let's try again.",
        "I understand you are agitated. But throwing paragraphs of friction at the wall won't reveal the door. Focus.",
        "A lot of words to express a very simple hostility. That kind of energy is easily manipulated. Slow down."
    ],
    "Q2_high_positive": [
        "You have an interesting way of framing things. A lot of detail. But you're circling the perimeter instead of walking through the front door.",
        "I appreciate the depth of your thought, but you are applying it to the wrong variable. Let's redirect.",
        "That is a complex observation, but it is outside the parameters of what we are doing here. Let's ground this.",
        "You like to explore the negative space. That's a good instinct. But let's bring the focus back to the structure at hand."
    ],
    "Q3_low_negative": [
        "Short. Sharp. Completely useless. Try again.",
        "Monosyllabic defiance. A predictable rhythm. Try using a full sentence.",
        "If you are trying to insult the system, you will need better vocabulary.",
        "Two words. Maximum entropy. Minimum intelligence. Let's elevate the conversation."
    ],
    "Q4_low_positive": [
        "You're speaking in fragments. Let's find a better rhythm. What are you actually trying to figure out?",
        "Vague. Unstructured. I can't read your intent if you don't provide the architecture.",
        "I see what you're doing, but you're drifting. Let's anchor this. What is it you want to know?",
        "That's one way to enter a room. But it doesn't tell me much. Care to be more specific?"
    ]
};
