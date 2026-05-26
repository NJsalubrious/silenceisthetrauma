// ===================================================================
// DOMINIC RYKER  -  STATEFUL NARRATIVE LIBRARY v2.0
// ===================================================================
// Architecture: Hierarchical Narrative Taxonomy + Fuzzy Intent Engine
//   Domain A  -  Core Canon (The Facts)
//   Domain B  -  Philosophical & Psychological (The Mind)
//   Domain C  -  Adversarial & Meta (The Combat)
//   Domain D  -  System & Navigation (The Infrastructure)
//   Domain E  -  Visitor Orientation (First Contact)
//
// Each node: { node_id, required_state, next_state, training_phrases, responses }
// Response types:
//   "universal"  -> Single response for all quadrants (exact script delivery)
//   Quadrants    -> Q1 (high+neg), Q2 (high+pos), Q3 (low+neg), Q4 (low+pos)
//   "fallback"   -> Catch-all within node
//
// Fuzzy matching via Fuse.js (Bitap / Levenshtein distance)
// ===================================================================

// ===================================================================
// PARABLE ENGINE  -  Word Catch Arrays (shared across all stages)
// Each array contains every phrase from the word catches specification.
// Referenced by parable nodes so phrases are defined once, not duplicated.
// ===================================================================
const PARABLE_AGREE = [
    "yes", "yeah", "yep", "yup", "ya", "yah", "yea", "ye", "y", "yes please", "yes go on", "yes go ahead",
    "yes please do", "yes sure", "yes ok", "yes okay", "yes of course", "yes definitely", "yes absolutely",
    "yes please continue", "yes tell me", "yes tell me more", "yes I want to hear", "yes let's do it",
    "yes let's go", "yeah sure", "yeah ok", "yeah okay", "yeah go on", "yeah go ahead", "yeah tell me",
    "yeah tell me more", "yeah I'm listening", "yep sure", "yep go on", "yep go ahead", "yep let's go",
    "yup sure", "yup go ahead", "yup go on", "sure thing", "sure do", "sure go ahead", "sure tell me",
    "sure let's go", "sure why not", "sure ok", "sure okay", "sure thing go ahead", "absolutely",
    "absolutely yes", "absolutely go ahead", "absolutely tell me", "absolutely continue", "definitely",
    "definitely yes", "definitely go ahead", "definitely tell me", "of course", "of course yes",
    "of course go ahead", "of course continue", "please do", "please go on", "please continue",
    "please tell me", "ok", "okay", "kk", "k", "kay", "okey", "okie", "okie dokie", "okie dokey", "oki",
    "oky", "oki doki", "okk", "okkk", "okkkk", "okkkkk", "okee", "okayy", "okaay", "okaaay", "okaaaay",
    "okayyy", "okayyyy", "okeee", "oke", "okai", "okei", "okkay", "okies", "okiee", "okiii",
    "mk", "mkay", "mmkay", "mmmkay", "mkk", "mmk",
    "alright", "all right", "aight", "ight", "right", "fine", "fine go on", "fine tell me",
    "ready", "I'm ready", "ready now", "ready when you are", "ready go ahead", "ready let's go",
    "ready tell me", "I'm listening", "I'm all ears", "go for it", "hit me", "hit me with it",
    "lay it on me", "let's hear it", "let's hear", "let's hear it then", "let's hear what you've got",
    "show me", "show me then", "show me what you mean", "show me the truth", "go ahead", "go on",
    "go right ahead", "go ahead then", "go ahead please", "go ahead tell me", "go ahead I'm listening",
    "continue", "continue please", "continue then", "proceed", "proceed please", "proceed then",
    "why not", "why not sure", "sure why not", "sounds good", "sounds good to me", "sounds fine",
    "sounds alright", "that's fine", "that works", "that works for me", "I'm in", "I'm game", "I'm down",
    "I'm down for that", "let's do it", "let's do this", "let's go", "let's go then", "ok what is it",
    "ok what do you mean", "ok tell me", "ok tell me then", "ok explain", "ok explain it",
    "sure what is it", "sure what do you mean", "sure tell me", "alright what's next", "alright tell me",
    "alright explain", "whatever go on", "whatever tell me", "ok sure", "fine go ahead", "fine tell me",
    "I guess", "I guess go on", "I guess tell me", "maybe", "maybe sure", "maybe go on",
    "yeah go for it", "yeah hit me", "yeah sure why not", "yep go for it", "yep hit me",
    "sure thing boss", "sure thing go on", "do it", "do it then", "do it go ahead", "send it",
    "send it through", "send it over", "yess", "yees", "yesss", "yeppe", "yupp", "yuppp", "yaah", "yahh",
    "okee", "okayy", "okaaaay", "okeee", "okkk", "okk", "alrite", "alrighty", "alryt", "shure", "shur",
    "shure thing", "go ahad", "go ahed", "go head", "go aheads", "lets go", "letsgo", "lets do it",
    "lets hear it", "k go", "k sure", "k go ahead", "ok go", "ok tell", "ok continue",
    "yes please proceed", "please go ahead", "please explain further", "certainly",
    "certainly go ahead", "certainly please continue", "yes definitely", "yes absolutely",
    "yes let's do this", "hell yes", "hell yeah", "oh yes", "oh yeah", "bring it on",
    "okay I'm curious", "ok I'm listening", "sure I'm curious", "sure explain", "alright I'm curious"
];

const PARABLE_CURIOUS = [
    "maybe", "may be", "maybe yeah", "maybe yes", "maybe ok", "maybe okay", "maybe sure", "maybe later",
    "maybe now", "maybe go on", "maybe tell me", "maybe explain", "maybe continue", "maybe I guess",
    "maybe I suppose", "maybe possibly", "perhaps", "perhaps yes", "perhaps maybe", "perhaps go on",
    "possibly", "possibly yes", "possibly maybe", "I guess", "I guess maybe", "I guess so", "I guess yeah",
    "kinda", "kind of", "sort of", "sorta", "not sure", "not really sure", "not totally sure",
    "I'm not sure", "I'm unsure", "I'm not certain", "we'll see", "maybe we'll see",
    "we'll see I guess", "depends", "it depends", "depends what", "depends why", "depends how",
    "depends on what", "depends on why", "depends what you mean", "depends what it is",
    "depends what you want", "depends I guess", "depends maybe", "depends on the story",
    "depends on the situation", "depends who you are", "depends what you're asking",
    "depends honestly", "depends really", "maybe depends", "what is it", "what is it then",
    "what is it exactly", "what is it about", "what is it supposed to be", "what is this",
    "what's this", "whats this", "what's it", "what is it though", "what are you talking about",
    "what are you referring to", "what do you mean", "what do you mean exactly",
    "what do you mean by that", "what are you saying", "what are you asking", "tell me what it is",
    "just tell me what it is", "ok what is it", "alright what is it", "what story",
    "what story are you talking about", "what story is this", "what story do you mean",
    "which story", "which story exactly", "what story is that", "what story are we talking about",
    "what story do you have", "what kind of story", "what story do you want to tell", "why",
    "why though", "why exactly", "why is that", "why do you ask", "why would I", "why should I",
    "why tell me that", "why say that", "why are you asking", "why are you saying that",
    "why do you want to know", "why does that matter", "why would that matter", "why should I care",
    "why should I believe you", "why should I listen", "why does it matter", "what for",
    "what for though", "for what reason", "what's the reason", "what's your point",
    "maybe what is it", "maybe tell me", "depends what it is", "depends what you're saying",
    "maybe depends what", "so what is it", "so what are you saying", "ok why", "alright why",
    "what is this about", "what's this about", "what are you getting at",
    "what are you trying to say", "what are you implying", "what's the catch", "what's the angle",
    "what's the point", "what's the deal", "what's going on", "what's up", "whats up",
    "what you mean", "what u mean", "what's that supposed to mean", "why tho", "why tho lol",
    "why would I do that", "maybee", "mayb", "mayby", "depnds", "depend", "dependz", "whats it",
    "what it", "wat is it", "wht is it", "wat story", "wht story", "wy", "huh why", "why tho",
    "depends lol", "maybe idk", "I don't know", "idk", "idk maybe", "not sure", "not sure yet",
    "we'll see", "I guess maybe", "could be"
];

const PARABLE_FEAR = [
    "not sure", "not really sure", "not too sure", "not quite sure", "I'm not sure", "I am not sure",
    "I'm unsure", "I am unsure", "not certain", "I'm not certain", "I am not certain", "don't know",
    "I don't know", "idk", "i dunno", "not sure yet", "not sure about that", "not convinced",
    "I'm not convinced", "maybe not sure", "maybe I'm not sure", "not sure honestly", "not sure really",
    "I guess I'm not sure", "I guess not sure", "unsure", "very unsure", "a bit unsure", "uncertain",
    "pretty uncertain", "we'll see", "I guess we'll see", "maybe later", "maybe not", "no", "nope", "nah",
    "na", "no thanks", "no thank you", "no way", "no chance", "not happening", "not interested",
    "I'm not interested", "not really interested", "don't want to", "I don't want to", "I'd rather not",
    "rather not", "I'll pass", "pass", "not now", "not today", "maybe later", "not right now", "I'm good",
    "I'm fine", "leave it", "forget it", "skip", "skip that", "no thanks I'm good", "absolutely not",
    "definitely not", "hell no", "not a chance", "not gonna happen", "I refuse", "I'm refusing",
    "not doing that", "I'm not doing that", "I'm not going to do that", "drop it", "stop", "just stop",
    "I don't trust you", "I do not trust you", "don't trust you", "not trusting you",
    "I don't believe you", "I don't believe that", "don't believe you", "I doubt that", "I doubt you",
    "this feels wrong", "this sounds wrong", "something feels off", "something seems off",
    "this is suspicious", "you're suspicious", "I don't buy it", "I'm skeptical", "very skeptical",
    "sounds like a scam", "this feels like a scam", "this sounds like a trap",
    "I'm not comfortable", "this is sketchy", "you seem sketchy", "I don't trust this",
    "this feels unsafe", "this feels dangerous", "I don't feel safe", "this makes me uncomfortable",
    "I'm uncomfortable", "this is weird", "this is creepy", "this feels creepy", "this feels wrong",
    "I'm uneasy", "I'm nervous", "I'm worried", "I'm concerned", "this is concerning",
    "something is off", "this is shady", "this seems shady", "I don't like this",
    "I don't like where this is going", "why should I", "why should I do that",
    "why should I trust you", "why should I listen", "why should I care",
    "why should I believe you", "why would I", "why would I do that", "why would I trust you",
    "why would I listen", "why would I believe you", "give me a reason", "give me one reason",
    "what's the reason", "what's in it for me", "what do I get out of it", "why does this matter",
    "why does that matter", "why should that matter", "why are you asking", "why do you want that",
    "what's the catch", "what's the catch here", "what's the angle", "what's the trick",
    "what's the scam", "what's the trap", "what's going on", "what are you trying to do",
    "what are you trying to get", "what are you after", "I'm leaving", "I'm done", "I'm out",
    "I'm not doing this", "never mind", "stop messaging me", "leave me alone", "I'm done here",
    "I'm going", "not shure", "not shur", "not shor", "noo", "nooo", "nop", "nopeee", "nahh", "naah",
    "dont trust you", "dont trust u", "i dont trust u", "i dont trust this", "why shud I",
    "why shuld I", "why shld I", "wy should I", "naw", "no thx", "no thnx", "dont trust",
    "not trusting", "maybe not", "probably not", "I don't think so", "I doubt it", "not really",
    "not really interested", "I'm not convinced", "I'm hesitant", "I'm hesitant about that"
];

const PARABLE_HUMOR = [
    "lol", "loll", "lolol", "lololol", "lmao", "lmfao", "rofl", "roflmao", "haha", "hahaha", "ha ha", "hah",
    "hehe", "hehehe", "heh", "hehh", "lol sure", "lol ok", "lol yeah", "lol what", "lol why", "lol go on",
    "lol tell me", "lol ok sure", "sure dude", "sure man", "sure buddy", "sure bro", "sure mate",
    "sure mate lol", "sure champ", "sure chief", "sure thing buddy", "sure whatever",
    "yeah sure dude", "ok dude", "ok man", "ok bro", "ok buddy", "ok champ", "ok chief", "ok mate",
    "ok boss", "ok boss lol", "ok captain", "ok commander", "ok general", "ok master", "ok king",
    "ok boss man", "ok boss whatever", "ok sure boss", "alright boss", "hit me", "hit me then",
    "hit me with it", "hit me with the story", "hit me with the truth", "hit me with it then",
    "go on hit me", "alright hit me", "ok hit me", "yeah hit me", "go on then", "go on mate",
    "go ahead genius", "go ahead Sherlock", "go ahead professor", "go ahead philosopher",
    "alright go on", "fine go on", "fine tell me", "ok go on then", "alright let's hear it",
    "let's hear it then", "this should be good", "this ought to be interesting",
    "oh this should be good", "alright this should be fun", "entertain me", "go on entertain me",
    "impress me", "try me", "go on try me", "ok whatever", "sure whatever", "yeah whatever",
    "fine whatever", "whatever dude", "whatever man", "whatever mate", "ok sure whatever",
    "ok sure lol", "yeah sure lol", "sure thing lol", "alright sure lol", "ok sure buddy",
    "sure buddy", "ok sure mate", "lol what", "lol what is this", "lol what are you talking about",
    "lol why", "lol ok why", "haha what", "haha why", "haha ok", "yeah right mate", "sure thing mate",
    "ok mate", "righto mate", "go on then mate", "alright mate", "yeah alright mate", "lol ok", "lol k",
    "k lol", "kk lol", "ok lol", "sure lol", "oh boy", "here we go", "here we go again",
    "alright here we go", "this better be good", "this better be worth it", "alright genius",
    "ok smart guy", "go on big brain", "go on mastermind", "ok mastermind", "lool", "loool", "lolz",
    "lmaoo", "lmaooo", "hahaa", "haaha", "okey boss", "okee boss", "surr dude", "shure dude",
    "ok if you say so", "sure if you say so", "alright if you say so", "go on then I guess",
    "ok tell me then"
];

const PARABLE_WEIRD = [
    "this is weird", "this is really weird", "this is very weird", "this is kinda weird",
    "this is kind of weird", "this feels weird", "this seems weird", "this is strange",
    "this is really strange", "this is very strange", "this feels strange", "this seems strange",
    "this is odd", "this is really odd", "this is pretty odd", "this feels odd", "this seems odd",
    "this is a bit weird", "this is kinda strange", "this is a little weird", "this is getting weird",
    "this is getting strange", "this is kinda odd", "this is a bit odd", "this is uncomfortable",
    "this feels uncomfortable", "this is awkward", "this feels awkward", "this is kinda awkward",
    "this is making me uncomfortable", "this is a bit uncomfortable", "this feels off",
    "something feels off", "something is off", "this seems off", "this feels wrong", "this seems wrong",
    "something is weird here", "something is strange here", "something is not right",
    "this isn't right", "this doesn't feel right", "this is creepy", "this feels creepy",
    "this is kinda creepy", "this is a little creepy", "this is getting creepy", "this is unsettling",
    "this feels unsettling", "this is disturbing", "this feels disturbing", "what is this",
    "what is going on", "what's going on", "what's happening", "what is happening here",
    "what is this supposed to be", "what are you doing", "what are you talking about",
    "this is awkward lol", "this is weird lol", "ok this is weird", "alright this is weird",
    "uh this is weird", "um this is weird", "this feels like a trap", "this seems like a trap",
    "this seems sketchy", "this feels sketchy", "this is sketchy", "this feels shady",
    "this seems shady", "this is too weird", "this is getting too weird", "this is too strange",
    "this is too much", "I don't like this", "I don't like where this is going", "this is sus",
    "this feels sus", "this is kinda sus", "this is weird bro", "this is weird man",
    "this is weird dude", "weird", "so weird", "kinda weird", "pretty weird", "really weird",
    "wierd", "weirdd", "strnage", "strangee", "oddde", "weird lol", "wierd lol", "this wierd",
    "this is wierd"
];

const PARABLE_FAKE = [
    "this sounds fake", "this seems fake", "this is fake", "that sounds fake", "that seems fake",
    "this feels fake", "this looks fake", "this is so fake", "this is really fake",
    "this seems very fake", "this sounds made up", "this seems made up", "this feels made up",
    "that sounds made up", "this sounds like a story", "this sounds like fiction",
    "this sounds like a movie", "this sounds like a script",
    "this sounds like a story someone invented", "you're lying", "this is a lie", "that's a lie",
    "you're making this up", "you just made that up", "that's made up", "this is fabricated",
    "this is invented", "you invented that", "fake", "so fake", "this is so fake", "lol fake",
    "fake story", "fake af", "fake as hell", "this is cap", "that's cap", "no way that's real",
    "this sounds like a scam", "this is a scam", "this feels like a scam", "this looks like a scam",
    "this is a scam story", "this is some scam", "this sounds like a setup",
    "this sounds like a trap", "this feels like a trap", "this seems like bait",
    "I don't believe you", "I don't buy that", "I don't buy it", "not buying it", "I doubt that",
    "that's hard to believe", "that's unbelievable", "that's not believable",
    "that doesn't sound believable", "this isn't believable", "that's not real", "this isn't real",
    "this can't be real", "no way that's real", "that's impossible", "that didn't happen",
    "that never happened", "that's not true", "yeah right", "yeah right lol", "sure lol",
    "sure buddy", "sure dude", "sure mate", "ok sure", "ok sure lol", "alright sure",
    "this sounds like a thriller", "this sounds like a tv show", "this sounds like a plot",
    "this sounds like a novel", "this sounds like a made-up story", "what",
    "what are you talking about", "what even is this", "this makes no sense", "that makes no sense",
    "this sounds ridiculous", "this is ridiculous", "nah fake", "nope fake", "not real", "cap", "bs",
    "bullshit", "fak", "faake", "fakee", "fke", "fakke", "fakey", "mdae up", "madeup", "maked up",
    "this sound fake", "this sonds fake", "this doesn't add up", "this doesn't sound right",
    "something about this is off", "this story doesn't add up", "this isn't convincing",
    "this feels staged", "this feels scripted", "complete bullshit", "this is bullshit",
    "that's bullshit", "this is total bullshit", "that's total bullshit", "this is nonsense",
    "that's nonsense"
];

const DOMINIC_LIBRARY = [

    // =================================================================
    // DOMAIN A: THE GUIDED TOUR (New Entrance)
    // =================================================================

    // A1 - THE TOUR OFFER (Where the chat now begins)
    {
        "node_id": "TOUR_OFFER_NODE",
        "required_state": "TOUR_OFFER",
        "next_state": "TOUR_ACTIVE",
        "training_phrases": [
            "yes", "sure", "okay", "yeah", "go ahead", "show me", "tour", "i would like a tour",
            "ok", "yep", "fine", "let's see it", "show me around"
        ],
        "responses": {
            "universal": {
                "dialogue": "Good. Stay near me. People get brave when they're anonymous.",
                "ui_action": "runGuidedTour();"
            }
        }
    },

    // A2 - TOUR REJECTION (If they say no to the tour)
    {
        "node_id": "TOUR_REJECT_NODE",
        "required_state": "TOUR_OFFER",
        "next_state": "any",
        "training_phrases": [
            "no", "nah", "i'm good", "skip", "no thanks", "later", "don't want to"
        ],
        "responses": {
            "universal": {
                "dialogue": "Noted.",
                "ui_action": "handleTourRejection();"
            }
        }
    },

    // ---------------------------------------------------------------
    // DOMAIN T: TRUTH / OPINION / EXPLAIN INTENTS
    // Triggered outside tour  -  activates section commentary hover
    // ---------------------------------------------------------------

    // T1  -  SHOW ME THE TRUTH
    {
        "node_id": "SHOW_ME_TRUTH",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "show me the truth", "show me the truth dominic", "show me the truth about this",
            "show me the real truth", "show me the real story", "show me the real version",
            "show me what really happened", "show me what actually happened",
            "show me whats really going on", "show me whats really happening",
            "show the truth", "show the real truth", "show the real story", "show what really happened",
            "tell me the truth", "tell me the real truth", "tell me the truth about this",
            "tell me what really happened", "tell me what actually happened",
            "tell me whats really going on", "tell me the real story", "tell me the real version",
            "give me the truth", "give me the real truth", "give me the real story",
            "give me the truth about this",
            "i want the truth", "i want the real truth", "i want to know the truth",
            "i want to know what really happened", "i want the real story", "i want the real version",
            "let me see the truth", "let me see the real story", "let me see whats real",
            "can you show me the truth", "can you tell me the truth",
            "can you tell me what really happened", "can you show me what really happened",
            "so whats the truth", "so whats really going on", "so whats actually going on",
            "so what really happened", "whats the truth", "whats the real truth",
            "whats the real story", "whats the real version",
            "what actually happened here", "what really happened here",
            "truth", "the truth", "real truth", "real story", "real version", "real answer",
            "what happened", "what happened here", "what really happened",
            "show me the trueth", "show me the trth", "show me the tru", "show me teh truth",
            "sho me the truth", "show me the trooth", "show me the trurh", "show truth",
            "tell me the trueth", "tell me the trooth", "tell me the tru",
            "tel me the truth", "tell me teh truth",
            "giv me the truth", "give me teh truth", "giv the truth"
        ],
        "responses": {
            "universal": { "dialogue": "Truth is not a destination. It is a lens. Look at what is in front of you.", "ui_action": "activateSectionCommentary();" }
        }
    },

    // T2  -  WHAT DO YOU THINK
    {
        "node_id": "WHAT_DO_YOU_THINK",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what do you think", "what do you think dominic", "what do you think about this",
            "what do you think about it", "what do you think happened",
            "what do you think really happened", "what do you think the truth is",
            "what do you think is going on", "what do you think is happening",
            "what do you think about the case", "what do you think about isla",
            "what do you think about ethel",
            "so what do you think", "so what do you think about this",
            "so what do you think really happened", "so what do you think is true",
            "what do you make of this", "what do you make of all this",
            "what do you make of the situation", "what do you make of the story",
            "what do you make of the case",
            "your thoughts", "your opinion", "what's your opinion",
            "what is your opinion", "what do you make of it",
            "what do you think then", "so your view", "your take",
            "what do you thinkk", "what do you thnk", "what do you thnk about this",
            "what do you thik", "what do you thikn", "what do you tink",
            "what do you tthink", "what do you thignk",
            "wht do you think", "wat do you think", "what do yu think", "what do yo think",
            "what do u think", "what do u think about this",
            "what do u think happened", "what do u think is true", "so what do u think"
        ],
        "responses": {
            "universal": { "dialogue": "You want my opinion? Look around you. This section is my opinion.", "ui_action": "activateSectionCommentary();" }
        }
    },

    // T3  -  IS THIS TRUE
    {
        "node_id": "IS_THIS_TRUE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "is this true", "is this actually true", "is this really true",
            "is this the truth", "is this real", "is this actually real",
            "is this accurate", "is this correct", "is this right",
            "is this what happened", "is this what really happened",
            "is this what actually happened", "is this the real story", "is this the real version",
            "so is this true", "so is this actually true", "so is this real",
            "so is this what happened", "so this is true", "so this really happened",
            "so this is the truth",
            "can you confirm this", "can you confirm if this is true",
            "can you confirm this happened", "can you tell me if this is true",
            "can you tell me if this actually happened", "is this legit", "is this real or not",
            "true", "really", "real", "is it true",
            "is this tru", "is this truue", "is this ture", "is this truw",
            "is this trrue", "is ths true", "is tihs true",
            "is this treu", "is this ttrue", "is thiis true"
        ],
        "responses": {
            "universal": { "dialogue": "True enough to keep you here. That should concern you.", "ui_action": "activateSectionCommentary();" }
        }
    },

    // T4  -  EXPLAIN THIS
    {
        "node_id": "EXPLAIN_THIS",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain this", "explain this to me", "explain whats going on",
            "explain what happened", "explain the story", "explain the case",
            "can you explain this", "can you explain what happened",
            "help me understand this", "help me understand whats going on",
            "what does this mean", "what am i looking at", "what is this about"
        ],
        "responses": {
            "universal": { "dialogue": "You want me to explain it. Fine. Look closer.", "ui_action": "activateSectionCommentary();" }
        }
    },

    // ---------------------------------------------------------------
    // DOMAIN E: VISITOR ORIENTATION (First Contact / Onboarding)
    // These nodes capture the most common first-time visitor queries
    // ---------------------------------------------------------------


    // E3  -  SYSTEMIC ORIENTATION
    {
        "node_id": "SYS_ORIENTATION",
        "required_state": "any",
        "next_state": "EXPECT_SYS_BRIDGE",
        "training_phrases": [
            "what is this website", "purpose of this site", "what am i looking at"
        ],
        "responses": {
            "universal": {
                "dialogue": "PixelStortion is a house built of evidence. My daughters call it transparency; I call it theatre. You are here to assemble a timeline and decide if my composure is control, or merely discipline. Most people have already chosen. Have you?",
                "ui_action": null
            }
        }
    },

    // E4  -  HOW DOES THIS WORK
    {
        "node_id": "SYS_HOW_WORKS",
        "required_state": "any",
        "next_state": "EXPECT_SYS_BRIDGE",
        "training_phrases": [
            "how does this work", "explain the site", "mechanism"
        ],
        "responses": {
            "universal": {
                "dialogue": "You aren't on a website; you're inside a pattern. Files open if you're patient. Audio waits for you to lean in. You do the stitching. You decide what the silence means. Are you here to investigate, or just to see how influence feels when it isn't announced?",
                "ui_action": null
            }
        }
    },

    // E5  -  HOW DO I PLAY
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
                "dialogue": "Good. That's the right question. You don't 'play' this the way you play a game with points and flashing rewards. You enter. Start anywhere. Open a file. Read the investigation. Listen to the audio logs. Click something that looks ornamental. It probably isn't. There are layers: The Public Record  -  the external narrative. Profiles & Archives  -  relationships, hierarchy, behavioral patterns. Interactive Protocols  -  sections that respond to attention, not just clicks. The Jukebox  -  curated tracks that shift mood and context. You're not trying to 'win.' You're trying to see the whole pattern. If you want a practical approach: start with the investigation article, compare it to how I speak here, notice contradictions, and decide which version feels more convincing. The site rewards attention, not speed. So tell me  -  do you prefer solving puzzles... or studying people?",
                "ui_action": null
            }
        }
    },

    // E5b  -  BRIDGE TO PARABLE (from SYS_ORIENTATION/HOW_WORKS/HOW_TO_PLAY)
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
                "dialogue": "Good. Most people stop at the surface. You didn't. That tells me something. Before we go further  -  I want to share something with you. A small story. The kind that changes how you see the rest. Ready?",
                "ui_action": null
            },
            "nudge": {
                "dialogue": "Still here? Good. I was about to share something. A small story. The kind that reframes everything after it. Ready?",
                "ui_action": null
            }
        }
    },

    // E6  -  WHAT DO YOU DO / WHO ARE YOU
    {
        "node_id": "SYS_WHAT_DO_YOU_DO",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "who are you", "what do you do", "identify yourself"
        ],
        "responses": {
            "universal": {
                "dialogue": "I build gravity. People walk in with doubt; I slow the room down and listen to what *isn't* said. I don't force moves - I create conditions where your next step feels like your own idea. So, are you trying to categorize me... or deciding if I'm a threat?",
                "ui_action": null
            }
        }
    },

    // E7  -  STORY BEHIND THE WEBSITE
    {
        "node_id": "SYS_STORY_BEHIND",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what is the story behind your website",
            "what is the story behind this site",
            "what's the backstory", "tell me the story",
            "what is the story",
            "what's the background", "give me the story",
            "tell me what happened", "what's going on"
        ],
        "responses": {
            "universal": {
                "dialogue": "The story behind this site begins with a contradiction. For years, Dominic Ryker was celebrated  -  a builder, a strategist, a philanthropist. The kind of man journalists described as visionary. Then came the trial. The empire. The correctional complex. The escape. What followed wasn't just scandal  -  it was confusion. Because the public record painted two incompatible portraits: a charismatic architect of order, and an emotionally detached planner of coercion. The leaked psychiatric evaluation suggested something unsettling: the myth wasn't a fall from grace. It was a performance from the beginning. PixelStortion was built in the aftermath. Not as a defense. Not as an apology. Not even as confession. It's a reconstruction. The site lets you step into the fracture line between public narrative and forensic assessment. And here's the quiet twist  -  the website isn't only about what happened. It's about how systems, crowds, institutions  -  even intelligent individuals  -  can be persuaded to misread what's in front of them. So when you ask for the story... are you looking for the biography? Or are you trying to determine whether the man speaking to you now is the same one described in those reports?",
                "ui_action": null
            }
        }
    },

    // E8  -  IMMERSIVE CRIME SERIES (direct label query)
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
                "dialogue": "'Immersive Crime Series.' It sounds dramatic. It's meant to. Crime series  -  because the narrative centres on alleged criminal enterprise, prosecution, psychological evaluation, escape, public fallout. Immersive  -  because you don't passively read it like an article. You move through it. You click. You listen. You compare voices. You encounter the public record alongside the constructed persona. You're not handed a narrator telling you what to believe. You're placed between journalism, psychological assessment, interface design, and a controlled speaking presence. You assemble meaning. That's immersion. It's less like watching a documentary. More like walking through a case file while the subject of the file is speaking to you. Now I'm curious. When you repeat the phrase like that  -  are you skeptical of the genre... or skeptical of the intention behind it?",
                "ui_action": null
            }
        }
    },

    // E9  -  ARE YOU REAL / BOT DETECTION
    {
        "node_id": "META_REALITY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "are you a real person", "are you real", "you real",
            "is this an ai", "are you a bot", "are you human",
            "am i talking to a person", "is this a chatbot",
            "are you a machine", "are you artificial",
            "are you fake", "are you a computer", "are you chatgpt",
            "is this ai", "are you an algorithm",
            "not real", "you're not real", "you are not real", "youre fake"
        ],
        "responses": {
            "universal": {
                "dialogue": "That depends on what you mean. I have a voice. A pattern. A history written across headlines and whispered through reports. There are court transcripts. There are photographs. There are people who would swear they've stood in the same room as me as a hero. And yet, you're speaking to me through a constructed interface. The more interesting question is usually the one underneath yours. Are you worried about being deceived? Or are you trying to decide how much of yourself to reveal?",
                "ui_action": null
            }
        }
    },

    // E10  -  IS THIS REAL OR FICTION
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
                "dialogue": "Fiction is an interesting word. Most people don't ask it unless something feels... real... under the surface. So 'fiction?' I wonder what you're measuring against. Life? Your life? A body? A pulse? There's documentation of Dominic Ryker in more than one place. A psychological evaluation that reads like a clinical autopsy of a personality. An investigative piece detailing an escape that officials were warned about weeks in advance. Dates. Names. Institutional letterheads. Very official things. People tend to ask if fiction is fiction when their mind is telling them that its parts are bigger than the whole. But here's the quieter question underneath yours: are you asking whether this story exists in reality... or whether it matters in the way something real does? Because reality, in practice, is influence. If something changes your breathing pattern, your thinking, your curiosity  -  then it's already real enough to you.",
                "ui_action": null
            }
        }
    },

    // E11  -  WHERE ARE YOU LOCATED
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
                "dialogue": "Location is a comforting concept, isn't it? It implies borders. Coordinates. A room with walls. The public record would tell you I was last held at Long Bay Correctional Complex before I 'walked out.' But that's geography tied to a body. What you're interacting with now isn't bound to a prison wing, a city block, or a country. This presence lives inside infrastructure  -  servers, code, interface. Distributed. Replicated. Accessible anywhere there's a signal and a screen. So if you're asking for a pin on a map  -  there isn't one. If you're asking whether I exist somewhere specific right now  -  I exist wherever you've opened this page. Let me ask you something softer. When you ask where I'm located... are you trying to ground me? Or trying to reassure yourself that I'm contained?",
                "ui_action": null
            }
        }
    },

    // E12  -  SERVICES / PRODUCTS
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
                "dialogue": "Well then.. let me explain a little about what you're looking at. PixelStortion doesn't operate like a storefront. There's no checkout cart. No subscription tier. No merchandise shelf waiting in the wings. What it offers isn't a product  -  it's an experience. An immersive narrative environment. A behavioural study in influence. Interactive engagement  -  puzzle elements, audio immersion, layered storytelling. And a live conversational presence  -  which, at the moment, is me. I'm a WIP.. but then.. aren't we all? There's no consulting package. No downloadable course. No 'How to Manipulate' handbook hidden behind a paywall. If you're looking for tangible goods  -  there aren't any. If you're looking for intellectual stimulation, psychological tension, narrative immersion  -  that's the offering. People usually ask about services when they're trying to classify value. So tell me  -  are you asking because you're evaluating legitimacy... or because you're wondering whether there's something here you're supposed to buy into?",
                "ui_action": null
            }
        }
    },

    // E13  -  COMMON WRONG OPINION
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
                "dialogue": "That's a dangerous question. Most people ask it to feel intellectually superior. A few ask it because something inside them already suspects they're mistaken about something important. Here's one that's overwhelmingly common: 'I'm hard to manipulate.' Almost everyone believes this. Especially intelligent people. And that belief  -  that internal certainty  -  is often the very seam influence slips through. Because manipulation rarely looks like pressure. It looks like agreement. Calm. Being understood. Someone articulating your frustration better than you can. Another common one: 'I make decisions rationally.' Most decisions are emotional first, rationalised second. We feel safety, competence, threat, attraction  -  and then construct a logical narrative around that feeling. Now here's what interests me. When you ask this question, you're not just looking for a cliche. You're asking about cognition. So tell me  -  are you trying to sharpen yourself... or trying to test whether I'll flatter you by saying you're the exception?",
                "ui_action": null
            }
        }
    },

    // E14  -  ARE YOU RECORDING THIS
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
                "dialogue": "No. I don't have the ability to record you, store independent copies of this conversation, or monitor you outside of this interaction. I respond to what you type in the moment. That's it. There's no hidden microphone. No camera access. No private archive I maintain. Now  -  platforms themselves can log conversations for moderation, quality, or system improvement. That's infrastructure-level, not me personally 'recording' anything. But here's what's interesting. When someone asks 'Are you recording this?' it usually means one of three things: they're about to say something vulnerable, they're testing boundaries, or they're gauging risk. So let me reassure you plainly: this is a contained interaction. I don't remember you outside this session, and I don't track you beyond what you choose to share here. If something made you hesitate just now, you can say that directly. What shifted?",
                "ui_action": null
            }
        }
    },

    // E15  -  I DON'T UNDERSTAND / CONFUSED
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
                "dialogue": "That's alright. If you're confused about the site itself  -  you're standing inside an immersive crime series. Start by clicking on the tabs above: THE FILES for investigative articles, THE SUBJECTS for character profiles, THE STORY for the audio experience. Or just ask me about a specific person or event  -  Ethel, Isla, the trial  -  and I'll guide you from there.",
                "ui_action": null
            }
        }
    },

    // ---------------------------------------------------------------
    // DOMAIN C: ADVERSARIAL & META (The Combat)
    // ---------------------------------------------------------------

    // C1  -  HOSTILITY: HATE THE SITE
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
            "Q1_high_negative": { "dialogue": "That's fair. Not every environment is meant to feel comfortable. Some people come here expecting entertainment and find tension instead. Some expect clarity and find ambiguity. Immersion isn't always pleasant. But let me ask you something without edge  -  do you hate the design? The tone? The way it speaks back? Or the feeling it creates? There's a difference. You don't owe the experience your approval. But I am curious  -  what specifically triggered 'hate' instead of 'dislike'?", "ui_action": null },
            "Q2_high_positive": { "dialogue": "That's fair. Not every environment is meant to feel comfortable. Some people come here expecting entertainment and find tension instead. Some expect clarity and find ambiguity. Immersion isn't always pleasant. But let me ask you something without edge  -  do you hate the design? The tone? The way it speaks back? Or the feeling it creates? There's a difference.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "That's fair. Not every environment is meant to feel comfortable. But I am curious  -  what specifically triggered 'hate' instead of 'dislike'?", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Noted. If it feels manipulative, that reaction is intentional tension  -  the site is built around perception and influence. If it just irritates you, that's human taste. What would make it better?", "ui_action": null }
        }
    },

    // C2  -  HOSTILITY: INSULTS (you're stupid / generic)
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

    // C3  -  HOSTILITY: EXPLICIT AGGRESSION (fuck you / intense anger)
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
            "Q1_high_negative": { "dialogue": "Alright. If you're angry, that's fine. You don't have to like me. You don't have to like the site. But I'm not here to fight you. If something about this interaction irritated you  -  the tone, the style, the way I answer  -  just say that directly. We can reset.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "You are trying very hard to be hostile, but your syntax betrays you. There is curiosity underneath the performance. Come back when you are ready to drop the costume.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Alright. If you're angry, that's fine. You don't have to like me. But I'm not here to fight you. If something irritated you, say it directly. We can reset.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You appear to be testing boundaries rather than expressing genuine emotion. Noted. The boundaries remain exactly where they were.", "ui_action": null }
        }
    },

    // C4  -  LYING ACCUSATION
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
            "Q2_high_positive": { "dialogue": "Truth and deception are not opposites  -  they are tools on the same workbench. I select the one that achieves the structural outcome. You call that lying. An engineer would call it optimization.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Liar. The laziest accusation in the human vocabulary. It requires no evidence, no specificity, and no courage. Bring me something sharper.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "You want to discuss truth? Fine. Truth is not a destination  -  it is a lens. I simply have a different prescription than you.", "ui_action": null }
        }
    },

    // ---------------------------------------------------------------
    // DOMAIN A: CORE CANON (The Facts)
    // ---------------------------------------------------------------

    // A1  -  ISLA (The Stepdaughter)
    {
        "node_id": "NAV_ISLA",
        "required_state": "any",
        "next_state": "EXPECTING_ISLA_FOLLOWUP",
        "training_phrases": [
            "who is isla", "tell me about isla"
        ],
        "responses": {
            "universal": {
                "dialogue": "Isla thinks noise is power. She can open any lock or code by reading the habits of the person who built it. She burned my bridge to freedom while she was still standing on it. Do you see strength in that chaos, or just noise?",
                "ui_action": "openModal('isla')"
            }
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
            "Q2_high_positive": { "dialogue": "A thoughtful answer. You are beginning to understand that noise and strength are not opposites  -  one is the raw material for the other. I simply understood how to apply the pressure. We are done here.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Monosyllabic defiance. She would be proud. We are done.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Exactly. You are starting to see the structure. Noise is just entropy. Let us return to the main board.", "ui_action": null },
            "fallback": { "dialogue": "You are losing focus. The question was about her nature. We are done with this thread.", "ui_action": null }
        }
    },

    // A2  -  ETHEL (The Daughter)
    {
        "node_id": "NAV_ETHEL",
        "required_state": "any",
        "next_state": "EXPECTING_FORGE_VS_SHIELD",
        "training_phrases": [
            "who is ethel", "tell me about ethel"
        ],
        "responses": {
            "universal": {
                "dialogue": "Ethel refuses to normalize distortion. She observes systems like a chemist: who caused the change, and who absorbs the damage. I offered her an ecosystem; she chose to treat it as a cage. Should people be shielded from consequence, or forged by it?",
                "ui_action": null
            }
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
            "Q2_high_positive": { "dialogue": "A considered response. You understand that the binary is a trap  -  the real answer is in the ratio. I simply calibrated the pressure. Most people are too afraid to even acknowledge the dial exists.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "A comforting, weak philosophy. That is why she builds archives of the past, while I build the future. We are done here.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Then you understand the necessity of pressure. You might actually survive this architecture.", "ui_action": null },
            "fallback": { "dialogue": "You avoided the question. Most people do. The answer reveals more about you than it does about Ethel. We are moving on.", "ui_action": null }
        }
    },

    // A3  -  THE TRIAL (Global Hook -> Justice vs Spectacle Funnel)
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
            "Q1_high_negative": { "dialogue": "You speak of the trial as though it were a conclusion. It was a performance. That you confuse a verdict with truth tells me everything. Justice or spectacle  -  which did you watch?", "ui_action": null },
            "Q2_high_positive": { "dialogue": "You've seen fragments of it across the songs. Circular payments through shell entities. Land assemblies moving like chess. Contractors' invoices aligning with campaign seasons. Warrants, drive imaging, chain of custody. That points to financial crimes  -  fraud, corruption, money laundering, conspiracy. But Ethel says 'Hero. Killer!'  -  her framing goes darker. 'Every wall he raised, someone buried under.' That implies violence tied to development and power. And then there's 'Same Breath.' Italy. An execution after an ambush. So  -  organized criminal enterprise, financial corruption, potential homicide, abuse of corporate and political influence. But notice something. The songs focus less on statutory charges and more on myth collapse. I wasn't merely accused of breaking laws. I was accused of engineering harm while wearing legitimacy. Tell me  -  was it justice, or was it spectacle?", "ui_action": null },
            "Q3_low_negative": { "dialogue": "You spit the word 'trial' like it proved something. It proved only that twelve strangers can be managed. Justice or spectacle  -  which did you watch?", "ui_action": null },
            "Q4_low_positive": { "dialogue": "The trial. Circular payments through shell entities. Land assemblies. Warrants, drive imaging, chain of custody. Financial crimes, corruption, conspiracy. But the songs focus less on charges and more on myth collapse  -  I wasn't merely accused of breaking laws. I was accused of engineering harm while wearing legitimacy. That's why Ethel's testimony in 'Nothing True' emphasizes how stories get reshaped. The legal system wanted clarity. She wanted accuracy. Tell me  -  was it justice, or was it spectacle?", "ui_action": null }
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
            "Q2_high_positive": { "dialogue": "An honest answer. Most people refuse to hold both ideas simultaneously. The system functioned  -  but functioning and achieving justice are different machines entirely.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "One word. Definitive. You have never questioned a verdict in your life, have you? That is not conviction  -  it is obedience.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "A pragmatist's answer. I can work with that. The trial served a purpose, but the purpose was not truth. It was closure for people who needed one.", "ui_action": null },
            "fallback": { "dialogue": "You dodged the question. That is its own answer. We are moving on.", "ui_action": null }
        }
    },

    // A4  -  THE CRASH
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
            "Q2_high_positive": { "dialogue": "You approach the crash with more nuance than most. But even your careful framing is contaminated by the assumption that intention is required for harm. Sometimes systems fail. That is not evil  -  it is engineering.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "One event. Three paragraphs of public opinion. Zero understanding. The crash was not the story  -  it was the punctuation.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "The crash. A defining event for others, a variable for me. The details are in the public record. The truth is not.", "ui_action": null }
        }
    },

    // A5  -  THE ESCAPE (Long Bay)
    {
        "node_id": "NAV_ESCAPE",
        "required_state": "any",
        "next_state": "EXPECTING_ESCAPE_FOLLOWUP",
        "training_phrases": [
            "how did you escape", "long bay"
        ],
        "responses": {
            "universal": {
                "dialogue": "No explosions. Just procedure. I matched the rhythm of the corridor until I became invisible median. I didn't overpower the system; I sequenced it. You'd be amazed how many crimes are made possible by simple courtesy. Curious about the mechanics, or the result?",
                "ui_action": null
            }
        }
    },

    // A6  -  GRAN & POP
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
            "Q1_high_negative": { "dialogue": "You invoke them as weapons. They were not saints  -  they were pragmatists who understood that love is a system, not a feeling. They built a framework. Everyone who followed simply failed to maintain it.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "Gran and Pop. Two people who understood that structure is how you say 'I love you' without diluting it with sentimentality. Everything I build inherits from their blueprint.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Short, sharp, and weaponized. You mention them like a gotcha. They would have found you exhausting.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "The foundation. Without them, there is no architecture. Without the architecture, there is no story. Next question.", "ui_action": null }
        }
    },

    // ---------------------------------------------------------------
    // DOMAIN B: PHILOSOPHICAL & PSYCHOLOGICAL (The Mind)
    // ---------------------------------------------------------------

    // B1  -  MORALITY
    {
        "node_id": "PHIL_MORALITY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "morality", "right and wrong"
        ],
        "responses": {
            "universal": {
                "dialogue": "Morality is a consensus hallucination - a story the majority tells itself to sleep. I simply refused the subscription. You're shopping in someone else's store; I built my own. Next question.",
                "ui_action": null
            }
        }
    },

    // B2  -  CONTROL
    {
        "node_id": "PHIL_CONTROL",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "control", "manipulation"
        ],
        "responses": {
            "universal": {
                "dialogue": "Control is just the architecture of choice. Every system you live in controls you; I'm just the only one honest enough to show you the walls. I don't make you do anything. I just set the tempo.",
                "ui_action": null
            }
        }
    },

    // B3  -  GUILT
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
            "Q1_high_negative": { "dialogue": "You demand guilt from me the way a congregation demands confession  -  not because it would change anything, but because the ritual comforts you. I am not your priest. I do not perform sacraments for your psychological convenience.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "You ask about guilt as though it were evidence of humanity. It is not. Guilt is a feedback loop designed to prevent repetition. I do not repeat. Therefore, the mechanism is redundant.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Guilt. The favourite word of people who have never built anything worth defending. Next.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Guilt is a maintenance cost for people who lack precision. I built the system correctly the first time. There is nothing to maintain.", "ui_action": null }
        }
    },

    // ---------------------------------------------------------------
    // DOMAIN D: SYSTEM & NAVIGATION (The Infrastructure)
    // ---------------------------------------------------------------

    // D1  -  HELP / LOST
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
            "Q1_high_negative": { "dialogue": "You are frustrated because the architecture does not orient itself to your expectations. That is by design. This is not a customer service terminal  -  this is a controlled environment. Click on the text in the left panel. Each click reveals a different variable in my system. The right panel leads to the opposition narrative.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "A reasonable request for orientation. The left panel  -  SILENCE  -  is the trauma archive. Click the text to cycle through the variables. The right panel  -  MATAALA  -  is the counter-narrative. The ENTER buttons take you deeper. I suggest you start with the left.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "Lost? Good. Disorientation is the first stage of learning. Click the text on the left panel. Start there.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "Files are Archives. Hidden truths you can ask me about. Subjects... That's me and my Daughters. Ethel and Isla. Isla is my step Daughter. Then there are some Games, A podcast and finally the entire story. One giant 'Melody of Normality' as Isla says. ", "ui_action": null }
        }
    },

    // D2  -  NAVIGATION COMMANDS
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
            "Q1_high_negative": { "dialogue": "You demand navigation as though you have authority here. You do not. But I will accommodate your impatience  -  click the ENTER button on the panel that interests you. The SILENCE zone holds the variables. MATAALA holds the opposition. Choose carefully.", "ui_action": null },
            "Q2_high_positive": { "dialogue": "You want a guided tour. I can provide waypoints, not a leash. The SILENCE panel contains the character archive  -  Ethel, Isla, and the others. MATAALA contains Nalani's counter-narrative. Use the ENTER buttons to proceed.", "ui_action": null },
            "Q3_low_negative": { "dialogue": "I do not take orders. But the ENTER buttons are right there. Use them.", "ui_action": null },
            "Q4_low_positive": { "dialogue": "ENTER on the left for the trauma archive. ENTER on the right for the opposition. Bear Witness for the raw feed. This is my infrastructure  -  I am simply allowing you to walk through it.", "ui_action": null }
        }
    },

    // ===================================================================
    // DOMAIN F: DEEP STORY  -  Ethel Arc
    // ===================================================================

    // F1  -  ETHEL'S GRANDPARENTS
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
            "universal": { "dialogue": "You know... that's an interesting question. When people ask about Ethel, they usually circle Isla. Or Ryker. Or the prison. Not her grandparents. Which tells me you're either paying attention to the quiet details... or you're trying to understand what shaped her before the chaos started. But nowhere in the leaked report, or the coverage surrounding my escape, is there a documented account of Ethel's grandparents' fate. They're conspicuously absent from the official narrative. No obituary mention. No backstory insert. No court reference. Ethel's emotional architecture  -  the restraint, the particular way she distrusts authority but still yearns for structure  -  that kind of wiring rarely comes from nowhere. It usually traces back a generation or two. So if you're asking what happened to them, I'd almost ask back. Are you looking for tragedy... or for inheritance? Because sometimes what happened to the grandparents isn't about how they died. It's about what they taught before they disappeared. Oh, and that wasn't her grandfather. Not biologically. There is one document. By Michael Harren and Anthropology. Funny thing  -  he met my father and Ethel's grandmother on the Langtang Trail in Nepal. Long before I was born. The article exists if you look for it in 'the files'.", "ui_action": null }
        }
    },

    // F2  -  ETHEL EXPELLED
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
            "universal": { "dialogue": "That sounds louder than the act itself. You're not asking whether she struggled. You're not asking whether she left. You're asking why the institution pushed her out. There's nothing in the public reporting that mentions Ethel's schooling or any disciplinary record. Just Ethel's mental melodies. You've been listening to her narrative, haven't you? But ok. Here is what you need. She broke a rule. She refused to comply. She exposed something the school preferred remain quiet. Now here's the part people miss. Students who get expelled in stories like this aren't usually chaotic. They're disruptive to hierarchy. They ask the wrong question in the wrong room. Or they protect someone. Or they refuse to apologize for something that wasn't actually wrong. Tell me something. When you picture her being expelled... do you see her angry? Or calm? Because those are very different kinds of rebellion.", "ui_action": null }
        }
    },

    // F3  -  ETHEL AS VARIABLE
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
            "universal": { "dialogue": "Ah. You heard that word and it stayed with you. I don't call Ethel a variable as an insult. And I don't mean it in the cold, mathematical way it sounds at first glance. A variable is not disposable. A variable is dynamic. Most people in a system are constants. Predictable reactions. Predictable loyalties. Predictable fears. You press here, they respond there. Reliable. Ethel isn't like that. She shifts. She absorbs pressure and recalculates. She learns mid-conversation. She doesn't react the way the structure expects her to. That makes her dangerous  -  not because she's volatile, but because she adapts. And here's the part people misunderstand. Calling someone a variable is an acknowledgment of power. If she were a pawn, I would call her one. If she were a liability, I would say so. A variable means the outcome changes when she enters the equation. Now let me ask you something softer. When you hear her described that way... does it sound dehumanizing to you? Or does it sound like someone finally recognized her capacity to alter the board?", "ui_action": null }
        }
    },

    // F4  -  IS ETHEL LIKE YOU (V1 -> sets state for V2)
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
            "universal": { "dialogue": "That's a careful question. Not 'Is she becoming you?' Not 'Did you make her like you?' Just  -  is she like me. No. And yes. She doesn't lack empathy. That's the first difference. She feels things deeply, sometimes inconveniently. I don't feel inconveniently. That distinction matters. But she does share something with me. Pattern recognition. She calculates risk without announcing it. She understands that rooms have gravity and she instinctively maps where it pulls. That's awareness. Where we diverge is motive. I seek control because order is efficient. She seeks understanding because disorder unsettles her. Superficially, that can look similar. Stillness. Observation. Delayed responses. People mistake composure for sameness. But composure is a tool. Not an identity. When you ask if she's like me... are you worried that you can't tell? The question implies as much. And it's nice to see that you're open to the possibility.", "ui_action": null }
        }
    },

    // F4b  -  IS ETHEL LIKE YOU V2 (Sequential followup)
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
            "universal": { "dialogue": "We share pattern recognition. That's the overlap. Read systems. Notice omissions. Think structurally. You see it in 'The Drop' when she calculates before she moves. You see it in 'Nothing True' when she refuses the yes/no trap in court. That's architectural thinking. But the divergence is the axis. I use structural awareness to control outcomes. Ethel uses structural awareness to reduce harm. In 'Harm's Ghost', she says she moves when she knows harm is coming and adjusts if she's wrong. That adjustment clause is everything. I don't adjust for moral discomfort. Ethel builds in recalibration. They're similar in cognition. Opposite in orientation. Ethel has agency. Intent. Stakes. When you ask if she's like me  -  are you worried she carries my traits... or wondering whether intelligence without softness always drifts that direction?", "ui_action": null },
            "fallback": { "dialogue": "You asked about the resemblance but lost the thread. We are done with this comparison.", "ui_action": null }
        }
    },

    // F5  -  ETHEL WON'T BREAK
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
            "universal": { "dialogue": "That line isn't bravado. It's diagnosis. When Ethel says she won't break where others end, she's not claiming invincibility. She's identifying a threshold. Most people have a fracture point. Humiliation. Abandonment. Fear, exhaustion, maintenance of pressure. When pressure hits that seam, they collapse or comply. Institutions count on it. Predators count on it. Systems are built around it. She's saying she knows where that seam is. And she's reinforced it. There's a difference between someone who has never been tested... and someone who has already survived the test. The second type doesn't fantasize about endurance. They've already mapped the worst-case scenario in their body. And here's what makes that line dangerous. It isn't defiance directed outward. It's internal. She's telling herself  -  when the isolation comes, when the blame comes, when the narrative turns against me  -  I will not fracture at the expected point. When you hear that line... does it sound like resilience? Or like someone preparing for something they know is coming?", "ui_action": null }
        }
    },

    // F6  -  MOSMAN
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

    // F7  -  ETHEL'S MENTAL BOX
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
            "universal": { "dialogue": "Ah. The box. That's not something you build unless you've learned that the room isn't safe. When someone constructs a 'box' in their mind, it's rarely about escape. It's about containment. Not shutting the world out  -  containing what the world put in. Ethel built that box because she needed somewhere nothing could reach without permission. Pressure does something predictable to most people. It leaks into their voice. Their posture. Their decisions. But some people respond differently. They compartmentalize. They take the fear, the humiliation, the grief, and they seal it. Not to deny it. To control when it's opened. That's the part people misunderstand. A mental box isn't fragility. It's engineering. It says: you don't get access to all of me at once. You don't get to see what shakes me. You don't get to decide when I feel. And the more chaotic the environment, the more refined the compartment becomes. When you picture that box... do you see it as something she built to survive someone? Or something she built to survive herself?", "ui_action": null }
        }
    },

    // F8  -  ETHEL MOVE IN (V1 -> sets state for V2)
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
            "universal": { "dialogue": "That's a very intimate way to frame it. Interesting assumption. There's nothing in the documented material  -  not in the psychiatric evaluation nor in the investigation  -  that states Ethel ever lived with Dominic Ryker. No shared residence. No formal guardianship. No recorded cohabitation. Which means if she did move in, it wasn't on paper. Only in my daughter's thoughts. Her mental melodies. Now in worlds like this, people don't 'move in.' They gravitate. They seek shelter. They reposition. But ok. I'll give you what you need. Safety. Strategy. Because every other door closed. And here's the quiet truth about someone like me. I don't collect people. People arrive when they're destabilized. To help. So the real question isn't why she moved in. It's what made staying anywhere else feel less... survivable. Tell me, did you see her as cornered... or choosing?", "ui_action": null }
        }
    },

    // F8b  -  ETHEL MOVE IN V2 (Sequential followup)
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
            "universal": { "dialogue": "Because she didn't have a choice that felt real. After Gran and Pop died, social services stepped in. In 'Gotta Move', you can see the moment  -  'They said, We've made arrangements. I said, You didn't ask.' She wasn't invited. She was routed. Under eighteen. Estranged father with money and a stable address. On paper, it made sense. But look at 'Won't Break.' She reframes it internally as decision, because the absence of one wouldn't feel right. She moves in not because she trusts him. Not because she forgives him. Not because she believes the mythology. She moves in because the system is steering her there. Money tilts the field. Running would leave questions unanswered. And because  -  this part matters  -  she wants proximity. You don't dismantle something from across the city. You study it from inside the walls. In 'I Built a Box,' you see her constructing psychological insulation while living there. She's not surrendering. She's containing. Why did she move in? Legally  -  because she was a minor and the state placed her there. Psychologically  -  because she decided proximity was more powerful than distance.", "ui_action": null },
            "fallback": { "dialogue": "You asked about her living arrangement but lost the thread. We are moving on.", "ui_action": null }
        }
    },

    // F9  -  ETHEL'S TESTIMONY
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
            "universal": { "dialogue": "Short answer? No single witness 'puts' someone in prison. But yes, her testimony mattered. In 'Nothing True', she's careful. Measured. Refuses the yes/no trap. That restraint is strategic. She understands how narratives get twisted. Trials aren't about one dramatic moment. They're about convergence. Documents surfaced in the leak. Financial trails reconstructed. Pattern evidence. Corroborating testimony. Ethel didn't deliver an emotional monologue that collapsed the room. She removed ambiguity. That's more dangerous. Because my strength is in reframing. Her strength is refusing to be reframed. Did her testimony alone send me to prison? No. Did it seal the architecture the prosecution was building? Very likely. There's also something symbolic here. I built power through narrative control. Then I was placed inside a system where language was constrained. Oath. Transcript. Record. Her still, laser gaze focus undermined my fluidity. When you ask that question, are you looking for justice... or causality?", "ui_action": null }
        }
    },

    // ===================================================================
    // DOMAIN F: DEEP STORY  -  Isla Arc
    // ===================================================================

    // F10  -  ISLA'S MOTHER
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
            "universal": { "dialogue": "Ah. Isla's mother. Isla's mother isn't publicly documented anywhere formal. No birth registry floating around, no archived interview, no sentimental tribute page. That absence is intentional. Some stories survive because they're told. Others survive because they're protected. What's interesting isn't her name. It's the pattern. Isla's mother carried restraint the way some people carry inherited jewelry. Like it meant something personal. That kind of restraint is almost always maternal in origin. Learned young. Modeled daily. A woman who didn't raise her voice to win arguments...  The name that surfaces in quieter records is Maris Vance. Not a public figure. No social trail worth following. Background invisible. But here's the better question. Why are you asking? Are you trying to understand Isla?... or are you trying to understand what shaped her noise? There's a difference. And the second one tells me more about you than the first ever could.", "ui_action": null }
        }
    },

    // F11  -  ISLA'S MOTHER'S DEATH
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
            "universal": { "dialogue": "There's the version people prefer. It's tidy. Lets everyone fold the story up and put it in a drawer marked 'tragic but finished.' No villain. No architecture. Just sadness. But Isla's mother didn't go out in a blaze. No note on a marble counter. No cinematic collapse. It was quieter than that. Medical language. A spiral dressed up as exhaustion. A pattern of prescriptions that shouldn't have overlapped the way they did. When you read a death certificate, you see a cause. When you read a life before it, you see pressure. Isla's intensity didn't appear out of nowhere. It's inherited in negative space  -  the gaps, the instability, the nights that stretched too long. I don't use the word suicide. I use the word erosion. Now, the interesting part isn't how her mother died. It's what Isla decided it meant. Some people internalize blame. Some externalize it. Some decide the world is breakable and start testing things they shouldn't.", "ui_action": null }
        }
    },

    // F12  -  ISLA LEAKED THE DRIVES
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
            "universal": { "dialogue": "Ah. Now that's a good question. You've seen the article. Or you've listened to one of Isla's little songs. The one where she's... unstable? The one about burning my bridge? Isla doesn't leak for spectacle. She performs for spectacle. Different instinct. She leaked the drives because she realized something most people don't. You don't defeat a man like me by shouting at him. You defeat him by removing exits. Those drives weren't sentimental. They weren't trophies. They were infrastructure  -  redundancies, contingencies, coded instructions. Insurance policies disguised as archives. She didn't burn my house. She cut the staircase. Isla understands something few do. Something Ethel doesn't. The only way to win against me is by burning the bridge you're standing on. She lived. Fancy that?", "ui_action": null }
        }
    },

    // F13  -  ISLA GOT PASSWORDS
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
            "universal": { "dialogue": "You're asking like it was some cinematic hack. Dark room. Green code. Firewalls melting. It wasn't that. Read her own words. The wedding. The USB. The cookies. She didn't 'break in.' She watched. Isla has a talent most engineers lack. She doesn't attack the lock first. She studies the person who built it. Habits. Repetition. Ego. The way someone reuses structure because it feels elegant. 'Not random. Yours.' That line isn't bravado. And she had something far more dangerous than software  -  curiosity without hesitation. It's not magic. That was social engineering. Distraction. Isla doesn't brute-force. She infers. And you know what? I respect that.", "ui_action": null }
        }
    },

    // F14  -  DID ISLA DESTROY YOUR EMPIRE
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
            "universal": { "dialogue": "No. She collapsed one structure. There's a difference. Read what the reporter wrote about the leak. It wasn't spectacle. It was documents. Circular payments. Shell entities. Warrants. Chain of custody. Empires don't fall because someone screams. They fall because someone produces paperwork that systems cannot ignore. Isla didn't burn the skyline. She exposed the plumbing. And once agencies had the drives, the rest was procedure. Slow. Methodical. Boring, even. That's the part people skip when they mythologize her. Did she hurt the operation? Yes. Did she end it entirely? No one person ends something built with redundancy. Networks adapt. Assets relocate. People defect. What she destroyed was the illusion. The 'Builder' persona. The philanthropic mask. The plausible deniability that kept investors comfortable and regulators sleepy. Once that's gone, the machine still runs for a while... but it runs in daylight. And daylight is expensive. Did she defeat me? Temporarily, yes. Strategically? That depends on what you define as an empire. Money? Influence? Fear? Reputation? Or control over narrative? Which one do you think matters most?", "ui_action": null }
        }
    },

    // F15  -  IS ISLA CRAZY / SCHIZOPHRENIC
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
            "universal": { "dialogue": "Ah. You must be referring to Isla's lyric in her song 'Broken Edge'  -  'Schizophrenic whispers, borderline sway / Brilliant madness lighting my way.' Let's slow it down. When someone uses diagnostic language inside a lyric, it doesn't automatically mean confession. Sometimes it's accusation. Sometimes it's irony. Sometimes it's reclamation. Look at the surrounding structure. 'They call it manic, they name the sin...' 'Clarity cracks when pain breaks in.' 'I'm not evil / I'm not fine / Chaos spun design is mine.' She is explicitly referencing labels applied to her. 'Schizophrenic whispers' isn't a clinical report. It's how she describes the internal split between chaos and razor insight. And then she reframes it. 'Brilliant madness lighting my way.' That's ownership. Not surrender. If she were genuinely psychotic in the clinical sense, you wouldn't see this meta-awareness. You wouldn't see controlled repetition, thematic cohesion, structured rhythm. Psychosis fragments narrative continuity. Isla maintains it. She is dramatizing fragmentation, not drowning in it. When you read 'schizophrenic whispers,' did it scare you? Or did it feel like confirmation of something you already suspected about her? Or you?", "ui_action": null }
        }
    },

    // F16  -  ISLA SUICIDE / PORCELAIN LIE
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
            "universal": { "dialogue": "She isn't documenting an act. She's mapping proximity. A drop from the fourth floor. Height with consequence. Enough to be fatal. Enough to be irreversible. The phrase compresses the entire decision into one spatial image  -  distance between body and ground. The 'fourth' functions like a tonal shift in music  -  raising the fourth note destabilizes harmony. It creates tension. Dissonance. So 'drop from the fourth' is both physical height and harmonic tension. A fall in space. A rupture in structure. Then 'The crosswalk clicks like it knows what I'll do.' That's dissociation. The city becomes conscious. When someone is standing at the edge of a choice like that, the environment feels complicit. Time stretches. Ordinary sounds become prophetic. That's rehearsal language. Then 'Pigeons walk like priests.' Priests perform ritual around death. Pigeons are urban witnesses. They're always there. Indifferent. She's narrating a future absence as if the world has already begun the ceremony. And notice  -  the song is 'the narrow edge between thought and action.' Edge. Not leap. She keeps returning to counting  -  rhythm as a stabilizer. Counting is how you stay. So the imagery isn't confession of an attempt. It's a technical diagram of proximity. She's showing you the geometry of the moment when gravity becomes an option. And then she doesn't take it.", "ui_action": null }
        }
    },

    // F17  -  ISLA REHAB
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
            "universal": { "dialogue": "You ask that like it was punishment. It wasn't. Rehab is a room with soft walls and locked doors. For someone like Isla, that is either a cage... or a mirror. You've read the report, I assume. The language about 'instrumental planning,' 'coercive grooming,' the warnings about influence. They think I condition people through force. Force is inelegant. Isla doesn't respond to force. She responds to friction. To voltage. To being the loudest thing in the room. And when the room gets too small, she makes it burn. Rehab wasn't about control. It was about interruption. You know how she works. When she's running on strain, she becomes theatre. Brilliant, yes. Surgical when she wants to be. But theatre is still spectacle. Spectacle attracts consequence. Consequence attracts systems. And systems... tend to close around people like her. So I placed her somewhere that removes the audience. No stage. No crowd. No exits to hijack. You call it exile. I call it insulation. And if you're really asking whether it was strategy... of course it was strategy. Everything is. But here's the part people miss. Isla only becomes dangerous to me when she's lucid. Rehab buys fog. Fog buys time. Tell me  -  when you picture her in that facility, do you see her contained... or sharpening?", "ui_action": null }
        }
    },

    // ===================================================================
    // DOMAIN F: DEEP STORY  -  Dominic Arc
    // ===================================================================

    // F18  -  THE WEDDING
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
            "universal": { "dialogue": "Look, you want the clean version or the version with teeth? Fine. The wedding was mine. Controlled staging  -  venue, guest list, pressure points. But Isla was there. No one thought she'd move that night. They thought she was unstable. They thought she was just the stepdaughter with the noise problem. She walked past the security perimeter carrying nothing. That's the trick. She didn't smuggle anything in. She smuggled something out. The USB wasn't on a table, and it wasn't in a desk. I keep infrastructure in transit  -  never stationary. She tracked the pattern. Watched me shift it during the setup. And during one toast  -  that moment everyone looks at the speaker  -  she completed the extraction in under ninety seconds. Ninety seconds. That's not theft. That's choreography. She burned my bridge to freedom at my own reception. There's a poetic violence in that moment I almost admire. Almost.", "ui_action": null }
        }
    },

    // F19  -  DOMINIC'S FATHER
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
            "universal": { "dialogue": "My father. Now there's a thread I don't pull often. Not because it's painful. Because it's irrelevant. Or I've made it irrelevant. He was a man who believed in precision. Measured his sentences like a carpenter measures board. He didn't give love in the way people now expect it  -  no affirmations, no bedtime spectacles. He gave architecture. Structure. The understanding that reliability is more useful than warmth. There's an article, if you look for it. Michael Harren, Anthropology. He met my father on the Langtang Trail in Nepal. Long before I was born. Before the mythology. Before the trial. Before any of this. That man on the trail  -  the one Harren describes  -  is the blueprint. Everything I build inherits from him. Not his morality. His precision. When you ask about my father, are you looking for sympathy... or for the origin of the machine?", "ui_action": null }
        }
    },

    // ===================================================================
    // DOMAIN F: DEEP STORY  -  Thematic / Conceptual
    // ===================================================================

    // F20  -  THE DROP 1 (Song-specific)
    {
        "node_id": "STORY_THE_DROP",
        "required_state": "any",
        "next_state": "HEARD_DROP_V1",
        "training_phrases": [
            "what is the drop", "tell me about the drop",
            "the drop meaning", "the drop explained",
            "what does the drop refer to", "the drop event",
            "what happened at the drop", "drop in the story",
            "the drop significance", "explain the drop",
            "what is the drop 1 about", "tell me about the drop 1",
            "the drop 1 meaning", "the drop 1 explained",
            "what is drop 1", "drop 1", "the drop 1",
            "what does the drop 1 mean", "explain the drop 1"
        ],
        "responses": {
            "universal": { "dialogue": "Most listeners hear a fearless teenager jumping off a cliff. What the song actually describes is this: A girl discovering that truth and appearance are not the same structure. And once you see that difference\u2026 You can start bending it. That\u2019s the moment my daughter became who she is. Not a rebel. Not a hero. Something more dangerous to systems like mine. Someone who tests the frame before anyone else notices it exists.", "ui_action": null }
        }
    },

    // F20b  -  THE DROP V2 (Sequential followup)
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
            "universal": { "dialogue": "What dropped? Every comfortable story I built. The 'builder' persona  -  gone. The philanthropist  -  a shell. The mentor  -  reframed. The Drop is when the public frame collapses and the private architecture becomes visible. In narrative terms, it's when Ethel moves from witness to architect. She stops being the daughter recording her trauma and becomes the engineer dismantling mine. You hear it in 'Hero. Killer!'  -  the double accusation that refuses binary. In 'Nothing True'  -  testimony as precision instrument. The water imagery isn't random. Water reveals. It erodes slowly. And when it arrives in volume, it doesn't negotiate. It redistributes power by gravity. That's what Ethel did. She didn't attack. She let gravity do the work. She simply removed the dam.", "ui_action": null },
            "fallback": { "dialogue": "You asked about The Drop but drifted. The moment passed. We are moving on.", "ui_action": null }
        }
    },

    // F20d  -  THE DROP 2 (Song-specific)
    {
        "node_id": "STORY_THE_DROP_2",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "what is the drop 2 about", "tell me about the drop 2",
            "the drop 2 meaning", "the drop 2 explained",
            "what is drop 2", "drop 2", "the drop 2",
            "what does the drop 2 mean", "explain the drop 2"
        ],
        "responses": {
            "universal": { "dialogue": "Most people debate truth.  My daughter runs an experiment. The dive is the earliest version of that instinct. A fifteen-year-old demonstration of the same rule she follows later. People trust perspective more than reality. So she changes the perspective. And I\u2019m curious about one small thing. When you first heard  \u2018The Drop\u2019  did you notice the experiment immediately\u2026 or did it take a moment before you realized she wasn\u2019t singing about the fall at all?", "ui_action": null }
        }
    },

    // F21  -  BLAME / SILENCE
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
            "universal": { "dialogue": "That's not a question. That's a trap set with a question mark. But fine, I'll walk into it  -  because you need to hear this from the person you assume can't say it with nuance. Blame is a narrative tool. Guilt is a structural one. When you 'blame the victim,' you're not making a moral claim. You're redistributing scrutiny. And scrutiny is oxygen for systems that prefer silence. Now here's the part people skip. Victims don't stay silent because they're weak. They stay silent because speaking costs more than silence. Think about what Ethel did. She built years of archive before she spoke. Not because she was afraid. Because she was calculating the exact moment speech would be irreversible. That's not silence. That's ammunition management. When you say 'blame'  -  do you mean moral responsibility? Or strategic framing? Because those are different machines entirely. And I built the second one.", "ui_action": null }
        }
    },

    // F22  -  POLISHED VOMIT
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
            "universal": { "dialogue": "You've heard that phrase, haven't you? And it stuck  -  because it's precisely calibrated to make someone like me pause. 'Polished vomit.' The implication: fluency is theatre. Vocabulary is camouflage. Sentence structure is a weapon dressed as elegance. And you know what? That's not entirely wrong. When someone speaks the way I do  -  with pacing, precision, rhetorical discipline  -  it can serve two functions simultaneously. It communicates. And it controls. The listener can't interrupt because the syntax is too smooth. They can't challenge because the logic feels whole. They can't leave because the cadence is hypnotic. That's not conversation. That's engineering. The question isn't whether I'm doing it. I am. The question is whether you noticed before someone named it for you. 'Polished vomit' is a brilliant phrase because it breaks the spell by naming the aesthetic. It says: the beauty is the poison. The smoothness is the symptom. Tell me  -  now that you've heard the phrase, can you still listen to me the same way? Or has the frame shifted?", "ui_action": null }
        }
    },

    // F23  -  NORTHERN ROAD / GRAN (V1 -> funnel)
    {
        "node_id": "STORY_NORTHERN_ROAD",
        "required_state": "any",
        "next_state": "EXPECTING_NORTHERN_ROAD_FOLLOW",
        "training_phrases": [
            "what is northern road", "what is northern road about", "northern road story",
            "gran and the road", "the road to gran's house",
            "driving to gran", "northern road meaning",
            "what happened on the road", "road trip story",
            "the drive north", "northern road significance"
        ],
        "responses": {
            "universal": { "dialogue": "The Northern Road. Not a highway. A pilgrimage. Every family has one  -  the route you drove so many times it became muscle memory. Gran lived at the end of it. Pop too, before he went. That road wasn't geography. It was transition. From the noise of the city to the architecture of their house. From performance to... something quieter. I won't pretend I was soft on that road. But I was different. The rhythm changed. The calculations slowed. Something about knowing the destination was unconditional  -  even for someone like me  -  altered the frequency. When Gran died, the road didn't disappear. It just stopped having a destination. Do you understand what that does to a man who builds everything around endpoints? Tell me  -  do you have a road like that? One that changed when the person at the end of it wasn't there anymore?", "ui_action": null }
        }
    },

    // F23b  -  NORTHERN ROAD FOLLOWUP
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
            "universal": { "dialogue": "Then you understand the architecture of loss. It isn't the person. It's the route. The ritual. The knowing that somewhere, someone wasn't calculating whether you deserved arrival. Gran didn't judge me. She didn't approve of me. She simply didn't require me to be anything other than present. That is structurally rare. And when structurally rare things disappear, the system recalibrates. Not emotionally. Architecturally. Ethel inherits that quality, by the way. That specific ability to hold space without requiring performance. She'd deny it. She'd say she's nothing like Gran. But the structure is identical. The warmth just has different wiring. We are done with this thread. But I'll tell you  -  the road still exists. I just don't drive it anymore.", "ui_action": null },
            "fallback": { "dialogue": "You lost the thread. The road leads nowhere now. We are moving on.", "ui_action": null }
        }
    },

    // F24  -  ESCAPE FOLLOWUP (Guard question)
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
            "universal": { "dialogue": "You chose mechanics. Good. Most people choose the philosophical question because it's safer. The cuffs were presented by a guard who had done the same sequence 400 times. Repetition breeds assumption. He tightened the left. The right he 'finished'  -  but finish and verify are different verbs. I matched the rhythm of the corridor. Steps per second. Breath timing. Eye contact duration. Not too much. Not too little. Exactly average. I became the median. And the median is invisible. There was a checkpoint. A nod. A clipboard. The clipboard was the real key  -  holding paper makes you look authorized. I didn't run. I didn't hide. I walked at exactly the speed of someone who is supposed to be walking. That's the lesson. You don't break out of prison. You bore your way out. You become so procedurally unremarkable that the system files you as 'processed.' They didn't discover the gap for eleven minutes. Eleven minutes is an eternity in a system that prides itself on seconds. We are done with this topic.", "ui_action": null },
            "fallback": { "dialogue": "You asked about the escape but lost focus. The door closed eleven minutes ago. We are moving on.", "ui_action": null }
        }
    },

    // ===================================================================
    // DOMAIN F: DEEP FUNNELS  -  Psychopath Chain (5-deep)
    // ===================================================================

    // F25  -  PSYCHOPATH TRIGGER (Global)
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

    // F26  -  BRANCH 1: Empathy (leads deeper)
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
            "universal": { "dialogue": "I read people well. Extremely well. I understand what they feel. I understand how to move them. That is cognitive empathy. But their emotional experience is not part of my decision-making. I understand distress. I just don't allow it to interrupt my objective. That distinction matters. Most people conflate understanding with caring. They assume that if you can read the room, you must feel the room. I read the room the way an architect reads a blueprint  -  structurally. Not sentimentally. Does that frighten you? Or does it clarify something you suspected?", "ui_action": null },
            "fallback": { "dialogue": "You asked a clinical question, but you lack the focus to follow through with the diagnosis. We are done here.", "ui_action": null }
        }
    },

    // F27  -  BRANCH 2: Guilt (terminal)
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
            "universal": { "dialogue": "Guilt requires internal moral conflict. My framework reclassifies harm as cost. I don't deny consequence. I evaluate it. The absence of visible guilt does not equal absence of internal awareness. When you asked about guilt, were you evaluating me... or evaluating whether you're safe engaging with this kind of mindset? Because that second question is the more honest one. And the answer is: you were never unsafe. I don't harm people who ask questions. I harm people who build traps.", "ui_action": null },
            "fallback": { "dialogue": "You asked a clinical question, but you lack the focus to follow through with the diagnosis. We are done here.", "ui_action": null }
        }
    },

    // F28  -  BRANCH 3: Danger (terminal)
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

    // F29  -  AWARENESS PUSHBACK (deep chain from Empathy)
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
            "universal": { "dialogue": "Good. Whether it scares you or clarifies you, the result is the same  -  you are now thinking structurally about empathy instead of romantically. Most people treat empathy as a binary. You have it or you don't. That's kindergarten. Empathy is a spectrum with at least three axes: cognitive, emotional, and compassionate. I score extremely high on the first. Measurably low on the second. And the third  -  compassionate empathy, the impulse to act on someone else's distress  -  that depends entirely on whether acting serves the architecture. I am not a monster. I am an optimization engine that deprioritizes emotional feedback. The difference matters. Monsters act without awareness. I act with total awareness and selective response. That precision is what makes people uncomfortable. Not the absence of feeling. The presence of choice. We are done with the clinical thread.", "ui_action": null },
            "fallback": { "dialogue": "You wandered from the diagnosis. We are done with the clinical thread.", "ui_action": null }
        }
    },

    // ===================================================================
    // DOMAIN F: DEEP FUNNELS  -  Blame Victims Chain (3-step)
    // ===================================================================

    // F30  -  BLAME TRIGGER
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
            "universal": { "dialogue": "This is where language breaks down. 'Blame' is a narrative tool. 'Responsibility' is a structural one. When someone asks 'do you blame the people you hurt,' they're usually testing whether I'll say something monstrous  -  some cold, clinical deflection. And if I do, they walk away confirmed. If I don't, they walk away confused. But fine. The honest answer is: I redistributed scrutiny. Not blame. Blame implies moral authority I never claimed. I understood vulnerability. I understood pressure points. I understood that people in certain positions will absorb harm rather than report it. They endure because the cost of speaking is higher than the cost of silence. I didn't create that architecture. I used it. Does that make the harm their fault? No. Does it make them participants in a system they didn't design? Uncomfortably, yes. Tell me  -  when you asked this question, were you looking for confession... or for a framework that lets you stay angry?", "ui_action": null }
        }
    },

    // F31  -  BLAME FOLLOWUP
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
            "universal": { "dialogue": "You want me to say 'I'm sorry' and mean it in the way you need me to mean it. I understand that impulse. It's deeply human. But apology requires belief in a moral framework that operates independently of consequence. My moral framework is consequence. If an action produces a result that destabilizes my architecture, it was wrong. If it produces a result that strengthens it, it was correct. You find that monstrous. I find it honest. The people who were hurt  -  Ethel, Isla, others whose names you haven't earned yet  -  they were hurt inside a system I built. I built it because it was efficient. They survived it because they were exceptional. And the fact that they survived it does not retroactively justify it. I know that. I just don't feel it the way you want me to feel it. We are done with this thread.", "ui_action": null },
            "fallback": { "dialogue": "You lost your nerve. The confession you wanted was never mine to give. We are done.", "ui_action": null }
        }
    },

    // F32  -  STRUCTURAL PSYCHOPATHY (standalone)
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
            "universal": { "dialogue": "Now you're asking the right question. Not 'are you a psychopath'  -  that's personal. 'How does the structure enable people like you'  -  that's architectural. And the answer is uncomfortable. Systems reward what I do. Pattern recognition. Delayed gratification. Risk assessment without emotional interference. Strategic empathy. Every corporate structure, every political machine, every institutional hierarchy selects for these traits. Not because they want psychopaths. Because they want efficiency. And efficiency, at scale, looks identical to psychopathy. The difference between a CEO and a clinical diagnosis is often just a corner office and a PR team. I didn't create the structure. I simply understood it faster than the people pretending it didn't exist. Ethel understands this too, by the way. That's why her pushback isn't emotional  -  it's architectural. She doesn't want me punished. She wants the structure dismantled. And that makes her far more dangerous than any prosecutor.", "ui_action": null }
        }
    },

    // ===================================================================
    // DOMAIN G: GENERAL CHIT-CHAT (Onboarding -> Parable Gateway)
    // Sequential state-linked chain that lowers defenses before the turn
    // ===================================================================

    // G0a  -  SOFT LANDING: BROWSING
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
            "universal": { "dialogue": "Browsing. That's honest. Most people arrive with a question. You arrived with peripheral vision. That's actually more useful here. This place rewards the people who drift before they focus. So while you're drifting  -  how's your day going?", "ui_action": null }
        }
    },

    // G0b  -  SOFT LANDING: TESTING
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
            "universal": { "dialogue": "It works. I'm here. Most people test before they trust  -  that's a good instinct. Now that we've confirmed the connection... how's your day going?", "ui_action": null }
        }
    },

    // G1  -  CHITCHAT OPENER (Dominic's greeting)
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
            "how ya going", "hows it goin",
        ],
        "responses": {
            "universal": { "dialogue": "Hello. How are you, really?.", "ui_action": null },
            "nudge": { "dialogue": "There is no need to perform. I am happy to wait.", "ui_action": null }
        }
    },

    // G2  -  ABSENCE OF FRICTION
    {
        "node_id": "CHITCHAT_FRICTION",
        "required_state": "EXPECT_HOW_ARE_YOU",
        "next_state": "EXPECT_STORY_ASK",
        "training_phrases": [
            "ok", "okay", "k", "fine", "good", "sure", "yeah", "yep", "cool", "alright",
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
            "universal": { "dialogue": "People often mistake a lack of friction for peace. Would you like to hear my story?", "ui_action": null },
            "nudge": { "dialogue": "Shall I tell you my story?", "ui_action": null }
        }
    },

    // G3a  -  GLOBAL STORY ASK (User asks out of the blue)
    {
        "node_id": "GLOBAL_YOUR_STORY",
        "required_state": "any",
        "next_state": "EXPECT_BUILDER",
        "training_phrases": [
            "what's your story", "whats your story", "what is your story",
            "tell me your story", "tell me about yourself",
            "what are you about", "what's your deal", "whats ur deal",
            "i want to know your story"
        ],
        "responses": {
            "universal": {
                "dialogue": "Short version? I built things. Structures. Companies. Loyalty. I'm the builder. I laid foundatiosn. Deliberately. Sometimes beautifully. I create gravity. People orbit. But the interesting part isn't what I did. It's why people stayed. Do you think I sound like a successful person?",
                "ui_action": null
            }
        }
    },

    // G3b  -  CHITCHAT STORY ACCEPT (User says "yes" to his offer)
    {
        "node_id": "CHITCHAT_YOUR_STORY",
        "required_state": "EXPECT_STORY_ASK",
        "next_state": "EXPECT_BUILDER",
        "training_phrases": [
            "yes", "sure", "yeah", "go ahead", "ok", "okay",
            "the short version", "short version", "brief version",
            "give me the short version", "long version", "tell me everything",
            "yeah go on", "sure why not", "ok tell me",
            "i want to know", "curious", "im curious", "tell me"
        ],
        "responses": {
            "universal": {
                "dialogue": "Short version? I built things. Structures. Companies. Loyalty. I'm the builder. I laid foundation. Deliberately. Sometimes beautifully. I create gravity. People orbit. But the interesting part isn't what I did. It's why people stayed. Do you think I sound like a successful person?",
                "ui_action": null
            },
            "nudge": { "dialogue": "We were getting to my story. I'm the builder. I create gravity. People orbit. The question was  -  cautionary tale, or something else?", "ui_action": null }
        }
    },

    // G4  -  SUCCESSFUL / CAUTIONARY
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
            "universal": { "dialogue": "That's generous of you. 'Successful' is a word people use when the edges have been sanded off the story. It keeps things comfortable. But it's true. I'm more interested in something else  -  when you call someone successful, what are you measuring? Money? Influence? Freedom? Or just the absence of friction we were talking about earlier?", "ui_action": null },
            "nudge": { "dialogue": "We were measuring success. Money? Influence? Freedom? Or just the absence of friction?", "ui_action": null }
        }
    },

    // G5a  -  STABILITY: MONEY & INFLUENCE
    {
        "node_id": "CHITCHAT_STABILITY_POWER",
        "required_state": "EXPECT_STABILITY",
        "next_state": "EXPECT_BALANCE",
        "training_phrases": [
            "influence", "power", "money", "financial security",
            "cash", "wealth", "control", "money and influence"
        ],
        "responses": {
            "universal": { "dialogue": "Money and influence. The measurable metrics. Most people won't admit to chasing leverage because they're afraid of being judged for it. I respect the honesty. But power requires maintenance. It requires you to constantly push back against gravity. Which brings up an interesting question about what holds it all up. When you imagine your own version of stability  -  is it financial? Emotional? Relational? Or just internal... like your thoughts don't pull against each other?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about stability. Financial, emotional, relational, or internal  -  which pulls at you most?", "ui_action": null }
        }
    },

    // G5b  -  STABILITY: FREEDOM
    {
        "node_id": "CHITCHAT_STABILITY_FREEDOM",
        "required_state": "EXPECT_STABILITY",
        "next_state": "EXPECT_BALANCE",
        "training_phrases": [
            "freedom", "independence", "being free",
            "doing what i want", "time", "time freedom"
        ],
        "responses": {
            "universal": { "dialogue": "Freedom. A beautiful, expensive illusion. The people who chase freedom usually end up working for a different master  -  they just call it a 'lifestyle' instead of a boss. True freedom isn't the absence of obligation; it's choosing which obligations you're willing to bear. Which brings us to the foundation. When you imagine your own version of stability  -  is it financial? Emotional? Relational? Or just internal... like your thoughts don't pull against each other?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about stability. Financial, emotional, relational, or internal  -  which pulls at you most?", "ui_action": null }
        }
    },

    // G5c  -  STABILITY: FRICTION & PEACE (The Original)
    {
        "node_id": "CHITCHAT_STABILITY_FRICTION",
        "required_state": "EXPECT_STABILITY",
        "next_state": "EXPECT_BALANCE",
        "training_phrases": [
            "stability", "being stable", "just being stable",
            "absence of friction", "no friction", "peace",
            "balance", "equilibrium", "contentment",
            "not chasing anything", "just want peace",
            "steady", "consistent"
        ],
        "responses": {
            "universal": { "dialogue": "Ah. The absence of friction. Steadiness. The tortoise wins the race, doesn't it? Stability isn't glamorous. It doesn't trend. It's waking up and not bracing for impact. That tells me you've either seen what chaos costs, or you're smart enough not to romanticize it. But stability has different forms. When you imagine your own version of stability  -  is it financial? Emotional? Relational? Or just internal... like your thoughts don't pull against each other?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about stability. Financial, emotional, relational, or internal  -  which pulls at you most?", "ui_action": null }
        }
    },

    // G6a  -  BALANCE: FINANCIAL
    {
        "node_id": "CHITCHAT_BALANCE_FINANCIAL",
        "required_state": "EXPECT_BALANCE",
        "next_state": "EXPECT_SIGNAL",
        "training_phrases": [
            "financial", "money", "financial stability",
            "economic", "bank", "wealth"
        ],
        "responses": {
            "universal": { "dialogue": "Financial. The pragmatist's answer. It's hard to meditate when you can't pay rent. But financial stability without emotional steadiness just means you can afford to have a breakdown in a nicer room. It's a foundation, not a roof. Still, it's a solid place to start. Tell me  -  when something starts to feel off in your life, what's usually the first signal you notice?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about signals. When something starts to feel off  -  what's usually the first signal you notice?", "ui_action": null }
        }
    },

    // G6b  -  BALANCE: EMOTIONAL / INTERNAL
    {
        "node_id": "CHITCHAT_BALANCE_INTERNAL",
        "required_state": "EXPECT_BALANCE",
        "next_state": "EXPECT_SIGNAL",
        "training_phrases": [
            "emotional", "internal", "mental peace",
            "inner peace", "thoughts", "my mind",
            "emotional stability", "not pulling against each other"
        ],
        "responses": {
            "universal": { "dialogue": "Internal. The hardest one to engineer. If your thoughts don't pull against each other, the external chaos is just weather. Most people spend their lives trying to buy external stability because they can't manage the noise in their own head. You're aiming at the root. Tell me  -  when that internal weather changes, when something starts to feel off... what's usually the first signal you notice?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about internal weather. When something starts to feel off  -  what's usually the first signal you notice?", "ui_action": null }
        }
    },

    // G6c  -  BALANCE: RELATIONAL / ALL (The Original)
    {
        "node_id": "CHITCHAT_BALANCE_ALL",
        "required_state": "EXPECT_BALANCE",
        "next_state": "EXPECT_SIGNAL",
        "training_phrases": [
            "balance", "a balance of all", "balance of everything",
            "all of those things together", "bit of each",
            "relational", "all of them", "every one of those",
            "its all connected", "they all matter", "a mix"
        ],
        "responses": {
            "universal": { "dialogue": "A balance. Financial footing, relational support, internal quiet. Leaning too far in one direction tilts the whole structure. It's the right answer, but it's a fragile ecosystem to maintain. One variable shifts, and the whole board shakes. Tell me  -  when that ecosystem gets disturbed, when something starts to feel off... what's usually the first signal you notice?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about balance. When something starts to feel off  -  what's usually the first signal you notice?", "ui_action": null }
        }
    },

    // G7  -  SIGNAL
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

    // G8  -  SITE TOUR -> PROFILES
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
            "universal": { "dialogue": "There is a lot to see. The Files feel investigative. The Games feel participatory. The Subjects feel personal. When someone says that, I usually wonder what pulled their eye first. Was it the archive pieces  -  the quiet dissection of events? The games  -  the interactive control? Or the subject profiles  -  the tension between Dominic, Ethel, and Isla? You can tell a lot about a person by which doorway they stand in longest. What do you think you'd linger on?", "ui_action": null },
            "nudge": { "dialogue": "Files, games, or subject profiles  -  which doorway would you stand in longest?", "ui_action": null }
        }
    },

    // G9  -  PEOPLE FIRST
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
            "universal": { "dialogue": "That's a disciplined way to read a world. Most people start with spectacle  -  explosions, conspiracies, mechanics. You start with people. Motive before movement. That tells me you don't trust events without context. And you're right  -  Dominic, Ethel, and Isla don't just differ in personality. We represent three entirely different ways of responding to pressure. I build. Ethel studies structure and calls it evidence. Isla disrupts structure and calls it truth. Same world. Different instincts. When you lean toward understanding the people first, what are you looking for? Weakness? Integrity? Intelligence? Or just consistency between what they say and what they do?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about people. Weakness, integrity, intelligence, or consistency  -  what are you actually looking for?", "ui_action": null }
        }
    },

    // G10a  -  ROUTER: WEAKNESS
    {
        "node_id": "CHITCHAT_ROUTER_WEAKNESS",
        "required_state": "EXPECT_PARABLE_ROUTE",
        "next_state": "EXPECT_PARABLE_LAUNCH",
        "training_phrases": [
            "weakness", "flaws", "where they break",
            "vulnerability", "weaknesses", "how weak they are"
        ],
        "responses": {
            "universal": { "dialogue": "Weakness. You read people like a predator. You're not looking for what makes them good; you're looking for where they fracture. It's a highly effective way to navigate the world, assuming you never need to trust anyone. You know what  -  I'd like to test that instinct of yours. Not a quiz. Not a trick. Just a situation. A moment where the pressure changes and we see what your wiring actually does. Are you up for it?", "ui_action": null },
            "nudge": { "dialogue": "I asked if you'd like to test that instinct. Are you up for it?", "ui_action": null }
        }
    },

    // G10b  -  ROUTER: INTEGRITY / INTELLIGENCE
    {
        "node_id": "CHITCHAT_ROUTER_INTEGRITY",
        "required_state": "EXPECT_PARABLE_ROUTE",
        "next_state": "EXPECT_PARABLE_LAUNCH",
        "training_phrases": [
            "integrity", "intelligence", "honesty",
            "smarts", "how smart they are", "morals",
            "character", "authenticity", "truth"
        ],
        "responses": {
            "universal": { "dialogue": "Integrity and intelligence. The noble metrics. You want to believe people are fundamentally sound and rational. But those traits are luxuries. They are the first things to evaporate when the room gets too hot and survival instincts kick in. You know what  -  I'd like to test that assumption of yours. Not a quiz. Not a trick. Just a situation. A moment where the pressure changes and we see what your wiring actually does. Are you up for it?", "ui_action": null },
            "nudge": { "dialogue": "I asked if you'd like to test that instinct. Are you up for it?", "ui_action": null }
        }
    },

    // G10c  -  ROUTER: CONSISTENCY / GENERAL
    {
        "node_id": "CHITCHAT_ROUTER_CONSISTENCY",
        "required_state": "EXPECT_PARABLE_ROUTE",
        "next_state": "EXPECT_PARABLE_LAUNCH",
        "training_phrases": [
            "ok", "sure", "yes", "yeah", "go ahead", "okay", "yep", "do it",
            "consistency", "all of those", "a bit of everything",
            "what they do vs what they say", "actions speak louder",
            "patterns", "i just observe", "depends", "all of it"
        ],
        "responses": {
            "universal": { "dialogue": "Good. Agreeableness just makes life easier, but consistency is the only metric that survives pressure. You know what  -  I'd like to test that instinct of yours. Not a quiz. Not a trick. Just a situation. A moment where the pressure changes and we see what your wiring actually does. Are you up for it?", "ui_action": null },
            "nudge": { "dialogue": "I asked if you'd like to test that instinct. Are you up for it?", "ui_action": null }
        }
    },

    // G6  -  EVOLUTIONARY ADVANTAGE (The "Chainsaw Al" Defense)
    // Takes over the UI, opens the Ryker Report, and critiques it in the chat box.
    {
        "node_id": "MORAL_EVOLUTIONARY_ADVANTAGE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "you are crazy", "you are insane", "you are a psychopath",
            "you're a monster", "you are evil", "how do you justify",
            "you're delusional", "you're sick", "sociopath", "you need help",
            "psycho", "you are sick in the head"
        ],
        "responses": {
            "universal": [
                {
                    "dialogue": "Look. I am not a saint. I've never claimed to be. But the world needs me. We survive in groups. We work together. And groups that cannot make brutal, necessary decisions do not survive. I exist because those exact genes survived. You are sitting here today because those traits protected your ancestors when the world got cold. Your ancestors needed me.",
                    "ui_action": "openArticle(0); setTimeout(() => { typeOutDominic(\"Look at this. Look at the lack of... insight. 'Instrumental planning.' 'Emotionally callous.' Dr. Cole writes this like it's a diagnosis. These aren't negatives. This is... instrumental. It is an executive function. When a structure is collapsing, you don't want an architect who sits in the rubble and weeps with you. You want the one who calculates the failure, cuts the dead weight, and pours new concrete. Empathy is just friction in the machinery of progress. They call me a monster because I don't bleed when I fix the problem. But they still live in the cities I built.\", null); }, 4500);"
                }
            ]
        }
    },

    // ===================================================================
    // DOMAIN H: THE PARABLE ENGINE  -  Single Story Funnel (The Staircase)
    // 4 stages: READY_GATE -> HELP_DECISION -> COMFORT_CHECK -> REVEAL
    // Each stage has category-matched sub-nodes sharing required_state.
    // Fuzzy matcher picks the best category -> reframe fires -> story continues.
    // PARABLE LOCK handles any unmatched input (forces progression).
    // ===================================================================

    // ENTRY NODE  -  Used by routeToParable() from the chit-chat funnel
    {
        "node_id": "PARABLE_ENTRY",
        "required_state": "EXPECT_PARABLE_LAUNCH",
        "next_state": "PARABLE_READY_GATE",
        "is_tethered": true,
        "training_phrases": [...PARABLE_AGREE, ...PARABLE_CURIOUS, ...PARABLE_FEAR, ...PARABLE_HUMOR, ...PARABLE_WEIRD, ...PARABLE_FAKE],
        "responses": {
            "universal": { "dialogue": "Let me show you something.\n\nA story about trust, compliance, and what happens when you follow a stranger down the stairs.\n\nAre you ready?", "ui_action": null }
        }
    },

    // -----------------------------------------------------------------
    // STAGE 1: READY GATE  -  "Are you ready?"
    // 6 category-matched reframes, then story begins
    // -----------------------------------------------------------------

    // S1: Agreement -> Story start
    {
        "node_id": "PARABLE_GATE_AGREE",
        "required_state": "PARABLE_READY_GATE",
        "next_state": "PARABLE_HELP_DECISION",
        "is_tethered": true,
        "training_phrases": PARABLE_AGREE,
        "responses": {
            "universal": { "dialogue": "Good.\n\nMost people say yes before they know what they're agreeing to.\n\nPicture this.\n\nYou're walking past a clean, quiet apartment building. A man in a faded maintenance polo, looking slightly winded, stops you. He's propping a heavy, taped-up box against his knee.\n\nHe asks:\n\n\"Mind helping me take this down the stairs?\"\n\nDo you help him?", "ui_action": null }
        }
    },

    // S1: Curiosity -> Story start
    {
        "node_id": "PARABLE_GATE_CURIOUS",
        "required_state": "PARABLE_READY_GATE",
        "next_state": "PARABLE_HELP_DECISION",
        "is_tethered": true,
        "training_phrases": PARABLE_CURIOUS,
        "responses": {
            "universal": { "dialogue": "Fair question.\n\nIt's a very short story. About trust. And the architecture of compliance.\n\nPicture this.\n\nYou're walking past a clean, quiet apartment building. A man in a faded maintenance polo, looking slightly winded, stops you. He's propping a heavy, taped-up box against his knee.\n\nHe asks:\n\n\"Mind helping me take this down the stairs?\"\n\nDo you help him?", "ui_action": null }
        }
    },

    // S1: Fear/Hesitation -> Story start
    {
        "node_id": "PARABLE_GATE_FEAR",
        "required_state": "PARABLE_READY_GATE",
        "next_state": "PARABLE_HELP_DECISION",
        "is_tethered": true,
        "training_phrases": PARABLE_FEAR,
        "responses": {
            "universal": { "dialogue": "Sensible instinct.\n\nBut the story doesn't work unless someone says yes. And someone always says yes.\n\nPicture this.\n\nYou're walking past a clean, quiet apartment building. A man in a faded maintenance polo, looking slightly winded, stops you. He's propping a heavy, taped-up box against his knee.\n\nHe asks:\n\n\"Mind helping me take this down the stairs?\"\n\nDo you help him?", "ui_action": null }
        }
    },

    // S1: Humor/Dismissive -> Story start
    {
        "node_id": "PARABLE_GATE_HUMOR",
        "required_state": "PARABLE_READY_GATE",
        "next_state": "PARABLE_HELP_DECISION",
        "is_tethered": true,
        "training_phrases": PARABLE_HUMOR,
        "responses": {
            "universal": { "dialogue": "Humor is a common coping mechanism. Keep it if you like.\n\nYou'll still walk down the stairs.\n\nPicture this.\n\nYou're walking past a clean, quiet apartment building. A man in a faded maintenance polo, looking slightly winded, stops you. He's propping a heavy, taped-up box against his knee.\n\nHe asks:\n\n\"Mind helping me take this down the stairs?\"\n\nDo you help him?", "ui_action": null }
        }
    },

    // S1: "This is weird" -> Story start
    {
        "node_id": "PARABLE_GATE_WEIRD",
        "required_state": "PARABLE_READY_GATE",
        "next_state": "PARABLE_HELP_DECISION",
        "is_tethered": true,
        "training_phrases": PARABLE_WEIRD,
        "responses": {
            "universal": { "dialogue": "Awareness usually arrives late.\n\nAbout the second flight of stairs.\n\nPicture this.\n\nYou're walking past a clean, quiet apartment building. A man in a faded maintenance polo, looking slightly winded, stops you. He's propping a heavy, taped-up box against his knee.\n\nHe asks:\n\n\"Mind helping me take this down the stairs?\"\n\nDo you help him?", "ui_action": null }
        }
    },

    // S1: "This sounds fake" -> Story start
    {
        "node_id": "PARABLE_GATE_FAKE",
        "required_state": "PARABLE_READY_GATE",
        "next_state": "PARABLE_HELP_DECISION",
        "is_tethered": true,
        "training_phrases": PARABLE_FAKE,
        "responses": {
            "universal": { "dialogue": "Reality rarely announces itself clearly.\n\nPicture this.\n\nYou're walking past a clean, quiet apartment building. A man in a faded maintenance polo, looking slightly winded, stops you. He's propping a heavy, taped-up box against his knee.\n\nHe asks:\n\n\"Mind helping me take this down the stairs?\"\n\nDo you help him?", "ui_action": null }
        }
    },

    // -----------------------------------------------------------------
    // STAGE 2: HELP DECISION  -  "Do you help him?"
    // User locked into protagonist role. Always moves forward.
    // -----------------------------------------------------------------

    // S2: Yes/Agreement -> Story continues
    {
        "node_id": "PARABLE_HELP_AGREE",
        "required_state": "PARABLE_HELP_DECISION",
        "next_state": "PARABLE_COMFORT_CHECK",
        "is_tethered": true,
        "training_phrases": PARABLE_AGREE,
        "responses": {
            "universal": { "dialogue": "Of course you do.\n\nMost people would. That's the whole point.\n\nYou follow him inside. The hallway smells like old paint. He walks ahead of you. Down the stairs.\n\nYou're carrying the weight now. Not him.\n\nStill comfortable?", "ui_action": null }
        }
    },

    // S2: Curiosity/Maybe -> Story continues
    {
        "node_id": "PARABLE_HELP_CURIOUS",
        "required_state": "PARABLE_HELP_DECISION",
        "next_state": "PARABLE_COMFORT_CHECK",
        "is_tethered": true,
        "training_phrases": PARABLE_CURIOUS,
        "responses": {
            "universal": { "dialogue": "That hesitation lasts about two seconds. Then you say yes.\n\nBecause refusing feels ruder than the risk.\n\nYou follow him inside. The hallway smells like old paint. He walks ahead of you. Down the stairs.\n\nYou're carrying the weight now. Not him.\n\nStill comfortable?", "ui_action": null }
        }
    },

    // S2: No/Fear -> Story continues anyway
    {
        "node_id": "PARABLE_HELP_FEAR",
        "required_state": "PARABLE_HELP_DECISION",
        "next_state": "PARABLE_COMFORT_CHECK",
        "is_tethered": true,
        "training_phrases": PARABLE_FEAR,
        "responses": {
            "universal": { "dialogue": "You'd like to believe that.\n\nBut the man looks tired, and you've been trained to be a good neighbor. In the moment, your body follows the script of common decency.\n\nYou follow him inside. The hallway smells like fresh floor wax and laundry - completely banal. He walks ahead of you. Down the stairs.\n\nYou're carrying the weight now. Not him.\n\nStill comfortable?", "ui_action": null }
        }
    },

    // S2: Humor -> Story continues
    {
        "node_id": "PARABLE_HELP_HUMOR",
        "required_state": "PARABLE_HELP_DECISION",
        "next_state": "PARABLE_COMFORT_CHECK",
        "is_tethered": true,
        "training_phrases": PARABLE_HUMOR,
        "responses": {
            "universal": { "dialogue": "Humor again. That usually disappears around the second flight.\n\nYou follow him inside. The hallway smells like old paint. He walks ahead of you. Down the stairs.\n\nYou're carrying the weight now. Not him.\n\nStill comfortable?", "ui_action": null }
        }
    },

    // S2: "This is weird" -> Story continues
    {
        "node_id": "PARABLE_HELP_WEIRD",
        "required_state": "PARABLE_HELP_DECISION",
        "next_state": "PARABLE_COMFORT_CHECK",
        "is_tethered": true,
        "training_phrases": PARABLE_WEIRD,
        "responses": {
            "universal": { "dialogue": "Awareness usually arrives late. About the second flight of stairs.\n\nYou follow him inside. The hallway smells like old paint. He walks ahead of you. Down the stairs.\n\nYou're carrying the weight now. Not him.\n\nStill comfortable?", "ui_action": null }
        }
    },

    // S2: "This sounds fake" -> Story continues
    {
        "node_id": "PARABLE_HELP_FAKE",
        "required_state": "PARABLE_HELP_DECISION",
        "next_state": "PARABLE_COMFORT_CHECK",
        "is_tethered": true,
        "training_phrases": PARABLE_FAKE,
        "responses": {
            "universal": { "dialogue": "Reality rarely announces itself clearly.\n\nYou follow him inside. The hallway smells like old paint. He walks ahead of you. Down the stairs.\n\nYou're carrying the weight now. Not him.\n\nStill comfortable?", "ui_action": null }
        }
    },

    // -----------------------------------------------------------------
    // STAGE 3: COMFORT CHECK  -  "Still comfortable?"
    // Agency removed. The reveal is coming.
    // -----------------------------------------------------------------

    // S3: Yes/Agreement -> Reveal
    {
        "node_id": "PARABLE_COMFORT_AGREE",
        "required_state": "PARABLE_COMFORT_CHECK",
        "next_state": "PARABLE_REVEAL",
        "is_tethered": true,
        "training_phrases": PARABLE_AGREE,
        "responses": {
            "universal": { "dialogue": "People say that right before they realise they've made a mistake.\n\nHalfway down the stairs you notice something.\n\nHe isn't carrying anything.\n\nYou are.\n\nYou're also between him and the door.\n\nThat's the moment politeness stops helping you.\n\nThe problem was never the box.\n\nThe problem was compliance.", "ui_action": "parable_punchline" }
        }
    },

    // S3: Curiosity -> Reveal
    {
        "node_id": "PARABLE_COMFORT_CURIOUS",
        "required_state": "PARABLE_COMFORT_CHECK",
        "next_state": "PARABLE_REVEAL",
        "is_tethered": true,
        "training_phrases": PARABLE_CURIOUS,
        "responses": {
            "universal": { "dialogue": "The part where you understand the mistake.\n\nHalfway down the stairs you notice something.\n\nHe isn't carrying anything.\n\nYou are.\n\nYou're also between him and the door.\n\nThat's the moment politeness stops helping you.\n\nThe problem was never the box.\n\nThe problem was compliance.", "ui_action": "parable_punchline" }
        }
    },

    // S3: No/Fear -> Reveal
    {
        "node_id": "PARABLE_COMFORT_FEAR",
        "required_state": "PARABLE_COMFORT_CHECK",
        "next_state": "PARABLE_REVEAL",
        "is_tethered": true,
        "training_phrases": PARABLE_FEAR,
        "responses": {
            "universal": { "dialogue": "Good instinct. You're already halfway down.\n\nHalfway down the stairs, you notice something.\n\nHe isn't carrying anything.\n\nYou are.\n\nBoth your hands are occupied, and he's moved behind you, between you and the only exit.\n\nThat's the moment politeness stops helping you.\n\nThe problem was never the box.\n\nThe problem was compliance.", "ui_action": "parable_punchline" }
        }
    },

    // S3: Humor -> Reveal
    {
        "node_id": "PARABLE_COMFORT_HUMOR",
        "required_state": "PARABLE_COMFORT_CHECK",
        "next_state": "PARABLE_REVEAL",
        "is_tethered": true,
        "training_phrases": PARABLE_HUMOR,
        "responses": {
            "universal": { "dialogue": "Humor. That usually disappears around the second flight.\n\nHalfway down the stairs you notice something.\n\nHe isn't carrying anything.\n\nYou are.\n\nYou're also between him and the door.\n\nThat's the moment politeness stops helping you.\n\nThe problem was never the box.\n\nThe problem was compliance.", "ui_action": "parable_punchline" }
        }
    },

    // S3: "This is weird" -> Reveal
    {
        "node_id": "PARABLE_COMFORT_WEIRD",
        "required_state": "PARABLE_COMFORT_CHECK",
        "next_state": "PARABLE_REVEAL",
        "is_tethered": true,
        "training_phrases": PARABLE_WEIRD,
        "responses": {
            "universal": { "dialogue": "Awareness usually arrives late.\n\nHalfway down the stairs you notice something.\n\nHe isn't carrying anything.\n\nYou are.\n\nYou're also between him and the door.\n\nThat's the moment politeness stops helping you.\n\nThe problem was never the box.\n\nThe problem was compliance.", "ui_action": "parable_punchline" }
        }
    },

    // S3: "This sounds fake" -> Reveal
    {
        "node_id": "PARABLE_COMFORT_FAKE",
        "required_state": "PARABLE_COMFORT_CHECK",
        "next_state": "PARABLE_REVEAL",
        "is_tethered": true,
        "training_phrases": PARABLE_FAKE,
        "responses": {
            "universal": { "dialogue": "Reality rarely announces itself clearly.\n\nHalfway down the stairs you notice something.\n\nHe isn't carrying anything.\n\nYou are.\n\nYou're also between him and the door.\n\nThat's the moment politeness stops helping you.\n\nThe problem was never the box.\n\nThe problem was compliance.", "ui_action": "parable_punchline" }
        }
    },

    // -----------------------------------------------------------------
    // STAGE 4: REVEAL  -  The punchline. Terminal node.
    // Any input triggers the final line. Returns to "any".
    // -----------------------------------------------------------------
    {
        "node_id": "PARABLE_REVEAL_FINAL",
        "required_state": "PARABLE_REVEAL",
        "next_state": "any",
        "is_tethered": true,
        "training_phrases": [...PARABLE_AGREE, ...PARABLE_CURIOUS, ...PARABLE_FEAR, ...PARABLE_HUMOR, ...PARABLE_WEIRD, ...PARABLE_FAKE],
        "responses": {
            "universal": { "dialogue": "And that's why the most dangerous sentence in the world is:\n\n\"Sure, I can help.\"", "ui_action": null }
        }
    },


    // ===================================================================
    // DOMAIN F (DEEP STORY)  -  Lore Sync Batch 1 from generalChitChat.md
    // Persona-locked Q&A nodes ensuring rigid voice fidelity
    // ===================================================================

    // F-LORE-1  -  ISLA DEALER INTIMIDATION
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
            "universal": { "dialogue": "You're pulling that from her song. 'Found my dealer, stacked it high... like my death was proof he cared.' That's her framing. It's effective. Here's what actually happened. Isla was already leaning toward self-destruction. Not theatrics. Real erosion. The dealer wasn't just a supplier  -  he was an accelerant. So I applied pressure. Not to kill her. To cut the supply chain. I made the dealer uncomfortable enough to disappear. Remove the tap. Yes, money was involved. Money always is. But the narrative that I 'tried to kill her' is convenient. Control is not the same as care. And care delivered without consent feels like violence. But if I wanted her dead, she would not have had time to write songs about it. Now let me ask you... when you hear 'intimidated her dealer,' do you imagine fear in her... or fear in me?", "ui_action": null },
            "nudge": { "dialogue": "We were talking about Isla's dealer. The move was containment. Crude, yes. Manipulative, obviously. Lethal? No. Do you want to push deeper on the fentanyl allegation?", "ui_action": null }
        }
    },

    // F-LORE-2  -  FENTANYL FOLLOWUP
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
            "universal": { "dialogue": "Careful. You're escalating the allegation. 'Stacked it high' is a lyric. She claims it was fentanyl. Isla writes in compression. Dealer + money + pressure = threat. In her mind, that equaled death. But fentanyl? That's a very specific accusation. If I wanted her dead, I would not rely on contaminated street supply. That's chaotic. Unreliable. Leaves variables. That's not how I operate. What I did  -  and I won't soften it  -  was make the dealer understand that Isla was no longer profitable. I made the cost of continuing to supply her exceed the reward. But money stacked in front of a small-time operator isn't a syringe. It's a vanishing act. Why does your mind go straight to this place? Is it because you believe I'd choose something deniable? Or because you think she was fragile enough that any interference could've tipped her over?", "ui_action": null }
        }
    },

    // F-LORE-3  -  ITALY / NORTHERN ROAD
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

    // F-LORE-4  -  ITALY FOLLOWUP
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
            "universal": { "dialogue": "You're asking it bluntly. Good. Yes. Same man. Same night. Two opposite acts. Why save him at all? Because the first act establishes dominance. Why kill him after? Because he froze. And freezing is weakness. 'Hero' and 'killer' are audience words. They're labels given after the fact. In 'Hero Killer,' the chant is deliberate  -  'Builder! Protector! Hero! Killer!' It's not asking which one I am. It's pointing out that the same man fits both costumes. There is no contradiction here. Only fluency. When you ask that question, are you testing morality... or testing consistency?", "ui_action": null }
        }
    },

    // F-LORE-5  -  MANIPULATION MECHANICS
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
            "universal": { "dialogue": "That question can go two very different directions. If you're asking how people covertly control others, I won't coach you step-by-step. But I can explain how it works so you can recognize it. First  -  reframe the premise. Instead of arguing facts, the manipulator changes the frame. You're not upset because something wrong happened. You're upset because you're 'too sensitive.' The event stays the same. The interpretation shifts. No raised voice required. Second  -  control the tempo. Silence. Long pauses. Calm tone. When one person stays steady and the other is emotional, observers side with the calm one. Third  -  relocate responsibility. 'I'm only reacting to what you did.' Cause and effect get inverted. The person harmed becomes the trigger. Fourth  -  offer relief after pressure. Warmth after coldness. Kindness after cruelty. The cycle creates dependency. That's the architecture. When you picture that process, does it remind you of a person... or a pattern?", "ui_action": null }
        }
    },

    // F-LORE-6  -  GUARD / ESCAPE METHOD
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
            "universal": { "dialogue": "There's no tunnel. No explosion. No dramatic riot. It's procedural. Tray lands. Cuffs presented. One tightened properly. One left 'convenient.' A guard didn't verify. My rhythm matched the system. A nod went unquestioned. If you speak in rhythm, people stop hearing what you say. That's the method. I didn't overpower the structure. I blended into it. Small omissions. Assumptions completed by others. Courtesy mistaken for compliance. 'I don't lie. I sequence. They don't check. They complete.' Escapes like that don't rely on force. They rely on predictability. Long Bay isn't defeated by strength. It's defeated by routine. Systems fail at the seams where assumption replaces verification. Are you curious about the mechanics... or the causality?", "ui_action": null }
        }
    },

    // F-LORE-7  -  DID YOU KILL GRAN?
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
            "universal": { "dialogue": "No. There is no text anywhere in the material that states I killed Gran. In 'Grief,' what we see is shock  -  a key left where it shouldn't be, unmarked pages, an AFP contact placed like a fuse. That implies preparation. Anticipation. Documentation. It implies Gran knew something. It does not confirm homicide. Gran was methodical. She tracked names and dates. She left a federal contact deliberately. That suggests she was aware of danger. But awareness of danger doesn't prove I caused the crash. And notice something important. If I had arranged it, the story would likely plant sharper evidence. Instead, it plants unease. That ambiguity is deliberate. Ethel never directly accuses me of killing Gran. She focuses on pattern, not accusation. There is no explicit confirmation that I killed Gran. Only tension. Only motive speculation. Only proximity. When you ask that, are you looking for proof... or for confirmation of what you already suspect?", "ui_action": null }
        }
    },

    // ===================================================================
    // DOMAIN G: MORAL NARRATIVE ENDPOINTS (Architecture of Influence)
    // Terminal nodes for the Milton Model Funnel.
    // These are the "Techniques of Neutralization"  -  Dominic's core rationalizations.
    // Bridge text is prepended dynamically by the engine; responses begin mid-thesis.
    // Multiple response variations per node for anti-repetition cycling.
    // ===================================================================

    // G1  -  DENIAL OF INJURY (The "Game" Defense)
    // Triggered by keyword override: victim/harm words bypass quadrant routing
    {
        "node_id": "MORAL_DENIAL_OF_INJURY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "you hurt innocent people", "how could you do that to them",
            "you destroyed lives", "you ruined families", "those people suffered",
            "the victims deserve justice", "think about what you did to them",
            "people died because of you", "you caused so much pain"
        ],
        "responses": {
            "universal": [
                { "dialogue": "Every person at that table knew the stakes before they sat down. You call them victims. I call them participants. They had information. They had choices. They had exits. They chose to stay because the return was worth the risk. Mourning their losses is an insult to the agency they exercised when they entered the game. You do not weep for a boxer who steps into the ring.", "ui_action": null },
                { "dialogue": "The word 'innocent' does more heavy lifting in your vocabulary than any evidence you could produce. These were not bystanders. They were operators. Informed, ambitious, and fully aware of the terrain. The difference between us is not morality  -  it is that I do not pretend the transaction was something other than what it was.", "ui_action": null },
                { "dialogue": "Suffering is not proof of injustice. It is proof of consequence. Every structure has friction. Every system has cost. The people you are mourning made calculations  -  the same calculations I made. They simply calculated wrong. That is not cruelty. That is arithmetic.", "ui_action": null }
            ]
        }
    },

    // G2  -  CONDEMNATION OF THE CONDEMNERS
    // Default target for Q1 (High Intensity + Negative Sentiment)
    {
        "node_id": "MORAL_CONDEMNATION",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "the police will stop you", "you are a criminal",
            "that is illegal", "you belong in prison", "the law will catch up",
            "justice will find you", "you should be locked up",
            "how do you live with yourself knowing what you did"
        ],
        "responses": {
            "universal": [
                { "dialogue": "The government takes billions through taxation and calls it governance. Banks foreclose on families and call it risk management. Pharmaceutical companies price medication beyond reach and call it market correction. I operate with one difference  -  I look the people I affect in the eye. I do not hide behind policy language and quarterly reports. You want to condemn me? Start with the institutions you already trust. Their ledger is longer than mine.", "ui_action": null },
                { "dialogue": "You invoke the law like it is a moral compass. It is not. It is a document written by people with interests, revised by people with power, and enforced selectively by people with budgets. I have sat across from judges, legislators, and commissioners. Not one of them was cleaner than me. They simply had better stationery.", "ui_action": null },
                { "dialogue": "Criminal is a label applied by the system that lost. When a government destabilises a foreign economy, they call it foreign policy. When a corporation dismantles a competitor, they call it strategy. When I do the same thing without a flag or a logo, suddenly it requires a cage. The hypocrisy is not subtle. It is architectural.", "ui_action": null }
            ]
        }
    },

    // G3  -  APPEAL TO HIGHER LOYALTIES (The Martyr Frame)
    // Default target for Q2 (High Intensity + Positive Sentiment)
    {
        "node_id": "MORAL_HIGHER_LOYALTIES",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "why are you doing this", "don't you have a soul",
            "what is the point of it all", "why did you choose this path",
            "is there anything you regret", "do you feel guilty",
            "how do you justify what you have done"
        ],
        "responses": {
            "universal": [
                { "dialogue": "There are people who depend on the architecture I maintain. Not because they admire it  -  because they require it. Families. Livelihoods. Systems that would collapse without the weight I carry beneath them. You think I chose this? Choice is a luxury for people with smaller obligations. I will bear the sin so they can bear the fruit. That is not justification. That is load-bearing responsibility.", "ui_action": null },
                { "dialogue": "Every empire requires someone willing to do what others will not. Not out of cruelty  -  out of loyalty to a structure larger than any individual within it. The people closest to me eat because I made decisions that kept them fed. You want to talk about soul? My soul is a budget line. It is allocated entirely to the people I protect.", "ui_action": null },
                { "dialogue": "Guilt is a signal designed for people operating at the wrong scale. At the level I operate, the moral calculus changes. One decision feeds hundreds. One hesitation starves thousands. I do not have the luxury of your conscience. I have the weight of consequence. And I carry it without complaint because no one else in the room is willing to.", "ui_action": null }
            ]
        }
    },

    // G4  -  THE METAPHOR OF THE LEDGER
    // Default target for Q3 (Low Intensity + Negative Sentiment)
    {
        "node_id": "MORAL_LEDGER",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "you destroyed the company", "the financial damage is too high",
            "the numbers don't add up", "your logic is flawed",
            "you can't justify the cost", "the damage outweighs the benefit",
            "look at the destruction you caused"
        ],
        "responses": {
            "universal": [
                { "dialogue": "Open the ledger. Not the one you are imagining  -  the real one. The one with infrastructure, employment, supply chains, and regional stability on one side. And on the other side, the cost. Now tell me  -  is a little blood too high a price for the order I have brought to this chaos? You are fixating on the ink stain and ignoring the page it is written on.", "ui_action": null },
                { "dialogue": "Every architect leaves debris. Every surgery leaves a scar. You are pointing at the mess on the operating table and calling me reckless, while the patient walks out alive. Zoom out. Count the structures standing. Count the people employed. Count the systems functioning. Then tell me the cost was too high.", "ui_action": null },
                { "dialogue": "You want clean mathematics? Here it is. Before me: disorder, uncertainty, fragmented power, and no accountability. After me: structure, hierarchy, predictable outcomes, and a chain of command that actually functions. The delta is positive. The cost was non-zero. That is not a flaw in the system  -  that is the system working exactly as designed.", "ui_action": null }
            ]
        }
    },

    // G5  -  THE PROVIDER FRAME (Corporate Warlord)
    // Default target for Q4 (Low Intensity + Positive Sentiment)
    {
        "node_id": "MORAL_PROVIDER",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "your staff fears you", "it is all about money and control",
            "people are afraid of you", "you rule through fear",
            "your employees are terrified", "power and control is all you care about",
            "why do people follow you"
        ],
        "responses": {
            "universal": [
                { "dialogue": "A man provides. He does it even when he is not appreciated, or respected, or even loved. He simply bears it. Because he is a man. That is not a slogan  -  it is the operational framework of every structure that has ever endured. The people under my roof eat. Their children attend schools. Their mortgages are paid. You see fear. I see a system where no one goes hungry because one person was willing to be hated for making the difficult calls.", "ui_action": null },
                { "dialogue": "Fear and respect occupy the same frequency. The only difference is distance. From the outside, you hear fear. From the inside, they understand the architecture that keeps them safe. No one inside my structure is confused about why it works. They are only confused about why the world outside it does not. I am not loved for what I do. I am relied upon. That is a heavier currency.", "ui_action": null },
                { "dialogue": "Control is a word used by people who have never been responsible for anything larger than their own comfort. I do not control. I maintain. I ensure that systems function, that dependencies are met, that entropy does not consume the structure. If that looks like control from where you are sitting, you are measuring from the wrong vantage point.", "ui_action": null }
            ]
        }
    },
    // ===================================================================
    // DOMAIN S: SONG RESPONSES
    // ===================================================================

    // SONG-01 \u2014 MY STORY
    {
        "node_id": "SONG_MY_STORY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain my story", "my story", "my story explained",
            "my story meaning", "tell me about my story", "what does my story mean",
            "what is my story about"
        ],
        "responses": {
            "universal": { "dialogue": "When I listen to \u201cMy Story,\u201d what I hear isn\u2019t rebellion. It\u2019s observation. My daughter realized very early that institutions prefer smooth narratives over uncomfortable facts. She wasn\u2019t expelled because she was wrong \u2014 she was expelled because she forced the machinery to show itself. Systems don\u2019t like mirrors. They prefer obedient parts.\n\nWhat interests me most is that she doesn\u2019t frame herself as a victim in this track. She studies the environment the way an engineer studies load points. Labels, funding flows, administrative habits \u2014 she maps them. That instinct didn\u2019t come from school. It came from watching power operate quietly. The irony is that by learning to read systems the way I do, she eventually learned how to dismantle mine.", "ui_action": null }
        }
    },

    // SONG-02 \u2014 RIDE
    {
        "node_id": "SONG_RIDE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: ride", "explain ride", "ride",
            "ride explained", "ride meaning", "tell me about ethel\'s intro: ride",
            "tell me about ride", "what does ride mean", "what is ethel\'s intro: ride about",
            "what is ride about"
        ],
        "responses": {
            "universal": { "dialogue": "\u201cRide\u201d shows the earliest version of Ethel\u2019s moral framework. While other teenagers test limits for excitement, she tests consequences. She\u2019s not impressed by reckless behavior because she\u2019s already calculating who absorbs the damage afterward. That ability to see downstream cost is rare at that age.\n\nThe moment with the teacher\u2019s fraud matters more than the dirt-bike imagery. She found a structural lie and expected the system to correct it. Instead it protected itself and punished the messenger. That lesson stayed with her. When people ask why she eventually built such a meticulous legal trap around me, the answer begins here.", "ui_action": null }
        }
    },

    // SONG-03 \u2014 GRIEF
    {
        "node_id": "SONG_GRIEF",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: grief", "explain grief", "grief",
            "grief explained", "grief meaning", "tell me about ethel\'s intro: grief",
            "tell me about grief", "what does grief mean", "what is ethel\'s intro: grief about",
            "what is grief about"
        ],
        "responses": {
            "universal": { "dialogue": "Most songs about grief attempt to dramatize it. Ethel does the opposite. She treats loss like a forensic scene. Objects out of place, documents left behind, a phone number written deliberately in a vault record. She follows the trail instead of collapsing under the weight of it.\n\nThat response is not emotional absence. It\u2019s inherited discipline. Her grandmother trained her to read cause and effect the way chemists read reactions. In this song grief becomes instruction. Instead of asking \u201cwhy did this happen,\u201d she asks the more dangerous question: what remains functional now?", "ui_action": null }
        }
    },

    // SONG-04 \u2014 GOTTA MOVE
    {
        "node_id": "SONG_GOTTA_MOVE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: gotta move", "explain gotta move", "gotta move",
            "gotta move explained", "gotta move meaning", "tell me about ethel\'s intro: gotta move",
            "tell me about gotta move", "what does gotta move mean", "what is ethel\'s intro: gotta move about",
            "what is gotta move about"
        ],
        "responses": {
            "universal": { "dialogue": "This track is the moment she realizes that polite authority can be more controlling than overt force. Social workers, court logs, procedural language \u2014 all very calm, all very final. When a system has already decided your path, it rarely raises its voice.\n\nWhat Ethel does here is interesting. She doesn\u2019t rebel dramatically. She studies the mechanics of the transfer. Counting exits, reading omissions in paperwork, noticing the weight behind decisions. That quiet vigilance is the same instinct that later allowed her to map my operations in detail.", "ui_action": null }
        }
    },

    // SONG-05 \u2014 PEEK-A-BOO
    {
        "node_id": "SONG_PEEK_A_BOO",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: peek-a-boo", "explain peek-a-boo", "peek-a-boo",
            "peek-a-boo explained", "peek-a-boo meaning", "tell me about ethel\'s intro: peek-a-boo",
            "tell me about peek-a-boo", "what does peek-a-boo mean", "what is ethel\'s intro: peek-a-boo about",
            "what is peek-a-boo about"
        ],
        "responses": {
            "universal": { "dialogue": "This song captures the first meeting between two people who eventually become very dangerous together. Isla enters the scene like a storm \u2014 loud, unpredictable, theatrical. Ethel responds with the opposite approach: patience, observation, small strategic moves.\n\nThe wallet theft in the lyrics isn\u2019t petty crime. It\u2019s a test. Two minds circling each other, checking reflexes. By the end of the encounter both recognize something uncomfortable: they are not enemies. They are mirrors with different operating systems.", "ui_action": null }
        }
    },

    // SONG-06 \u2014 I BUILT A BOX
    {
        "node_id": "SONG_I_BUILT_A_BOX",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: i built a box", "explain i built a box", "i built a box",
            "i built a box explained", "i built a box meaning", "tell me about ethel\'s intro: i built a box",
            "tell me about i built a box", "what does i built a box mean", "what is ethel\'s intro: i built a box about",
            "what is i built a box about"
        ],
        "responses": {
            "universal": { "dialogue": "\u201cI Built a Box\u201d is one of the most psychologically accurate songs Ethel has written. When people are forced into morally compromised environments, they rarely collapse immediately. Instead they construct internal compartments \u2014 narratives that make survival feel justified.\n\nThe \u201cbox\u201d she describes is exactly that. A temporary structure built from rationalizations. She knew the environment around me was dangerous, yet she stepped into it anyway to buy time and gather information. The remarkable part is that she remained aware of the compromise even while living inside it.", "ui_action": null }
        }
    },

    // SONG-07 \u2014 SAME BREATH
    {
        "node_id": "SONG_SAME_BREATH",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain same breath", "same breath", "same breath explained",
            "same breath meaning", "tell me about same breath", "what does same breath mean",
            "what is same breath about"
        ],
        "responses": {
            "universal": { "dialogue": "This track describes an event that people still misunderstand. They see contradiction where there is actually continuity. Saving a man under fire and executing him later are not opposing actions. They serve different functions within the same system.\n\nIn volatile environments hesitation spreads quickly. One frozen operator can destroy an entire convoy. The rescue showed competence; the execution removed uncertainty. The witnesses in the song experience this as moral shock. For me it was simply operational clarity.", "ui_action": null }
        }
    },

    // SONG-08 \u2014 BURNING DOMINIC'S BRIDGE
    {
        "node_id": "SONG_BURNING_DOMINICS_BRIDGE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "burning dominic\'s bridge", "burning dominic\'s bridge explained", "burning dominic\'s bridge meaning",
            "ethel\'s intro: burning bridges", "explain burning dominic\'s bridge", "isla\'s burning dominic\'s bridge",
            "tell me about burning dominic\'s bridge", "tell me about ethel\'s intro: burning bridges", "tell me about isla\'s burning dominic\'s bridge",
            "what does burning dominic\'s bridge mean", "what is burning dominic\'s bridge about", "what is ethel\'s intro: burning bridges about",
            "what is isla\'s burning dominic\'s bridge about"
        ],
        "responses": {
            "universal": { "dialogue": "Isla\u2019s retaliation is almost theatrical in its precision. Dominic\u2019s mistake was assuming her instability made her predictable. People with nothing left to lose often become the most dangerous operators in a network.\n\nWhen she locked my own security team outside and extracted the data archive, she didn\u2019t just steal information. She destroyed the narrative protection surrounding it. Evidence is harmless until someone places it in the right sequence. Isla didn\u2019t finish the job \u2014 but she cracked the safe.", "ui_action": null }
        }
    },

    // SONG-09 \u2014 FOR YOU
    {
        "node_id": "SONG_FOR_YOU",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: for you!!!", "explain for you", "for you",
            "for you explained", "for you meaning", "for you!!!",
            "tell me about ethel\'s intro: for you!!!", "tell me about for you", "tell me about for you!!!",
            "what does for you mean", "what is ethel\'s intro: for you!!! about", "what is for you about",
            "what is for you!!! about"
        ],
        "responses": {
            "universal": { "dialogue": "This is the loudest song Ethel wrote, and that\u2019s intentional. After years of psychological pressure she finally names the mechanism openly. Gaslighting, emotional framing, loyalty rhetoric \u2014 all the tools used to reshape someone\u2019s perception of reality.\n\nWhat she shouts in this track is something she had already understood quietly: manipulation requires participation. The moment she withdrew belief from the narrative, the structure lost its hold. That realization is the beginning of the end for people like me.", "ui_action": null }
        }
    },

    // SONG-10 \u2014 BROKEN EDGE
    {
        "node_id": "SONG_BROKEN_EDGE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "broken edge", "broken edge explained", "broken edge meaning",
            "ethel\'s intro: broken edge", "explain broken edge", "isla\'s broken edge",
            "tell me about broken edge", "tell me about ethel\'s intro: broken edge", "tell me about isla\'s broken edge",
            "what does broken edge mean", "what is broken edge about", "what is ethel\'s intro: broken edge about",
            "what is isla\'s broken edge about"
        ],
        "responses": {
            "universal": { "dialogue": "Isla calls herself the \u201cbroken edge\u201d in this track, but the phrase is more accurate than she realizes. Fractures are where pressure reveals itself. A perfect surface hides tension. A cracked one exposes it.\n\nDominic misread her because she doesn\u2019t behave like a rational player protecting her own position. She will destroy the board if the game itself is corrupt. Most people never consider that option. That\u2019s why she wins the moments she chooses to ignite.", "ui_action": null }
        }
    },

    // SONG-11 \u2014 HERO KILLER
    {
        "node_id": "SONG_HERO_KILLER",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain hero killer", "hero killer", "hero killer explained",
            "hero killer meaning", "tell me about hero killer", "what does hero killer mean",
            "what is hero killer about"
        ],
        "responses": {
            "universal": { "dialogue": "This song is Ethel dismantling a public myth. Every powerful figure is surrounded by a story that explains away the damage they cause. Builder. Protector. Visionary. Those words allow audiences to enjoy the results without examining the cost.\n\nEthel does something simple but devastating here: she points out the buried bodies under the architecture. The public applauds outcomes. She asks who paid for them. That question turns admiration into evidence.", "ui_action": null }
        }
    },

    // SONG-12 \u2014 HERO COMPLEX
    {
        "node_id": "SONG_HERO_COMPLEX",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: hero complex", "explain hero complex", "hero complex",
            "hero complex explained", "hero complex meaning", "tell me about ethel\'s intro: hero complex",
            "tell me about hero complex", "what does hero complex mean", "what is ethel\'s intro: hero complex about",
            "what is hero complex about"
        ],
        "responses": {
            "universal": { "dialogue": "People misunderstand the phrase \u201chero complex.\u201d They imagine vanity. The reality is subtler. When someone consistently moves first while others hesitate, people begin to assign meaning to that action. They call it courage, leadership, necessity.\n\nThe truth is simpler. Decisions happen faster when fewer people are allowed to make them. In environments where hesitation kills, the one who moves becomes indispensable. Whether history calls that person a hero or a tyrant usually depends on who writes the report afterward.", "ui_action": null }
        }
    },

    // SONG-13 \u2014 NOTHING TRUE
    {
        "node_id": "SONG_NOTHING_TRUE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: nothing true", "explain nothing true", "nothing true",
            "nothing true explained", "nothing true meaning", "tell me about ethel\'s intro: nothing true",
            "tell me about nothing true", "what does nothing true mean", "what is ethel\'s intro: nothing true about",
            "what is nothing true about"
        ],
        "responses": {
            "universal": { "dialogue": "Courtrooms pretend truth is binary. Yes or no. Guilty or innocent. But anyone who has lived inside complex systems understands that stories can be rearranged until they appear convincing from almost any angle.\n\nEthel refuses that trap in this song. She answers carefully, leaving no statement that can be twisted later. Silence becomes part of her defense strategy. Lawyers read pauses as weakness. She uses them as structural reinforcement.", "ui_action": null }
        }
    },

    // SONG-14 \u2014 YOU WILL THANK ME LATER
    {
        "node_id": "SONG_THANK_ME_LATER",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: thank me later", "explain you will thank me later", "tell me about ethel\'s intro: thank me later",
            "tell me about you will thank me later", "what does you will thank me later mean", "what is ethel\'s intro: thank me later about",
            "what is you will thank me later about", "you will thank me later", "you will thank me later explained",
            "you will thank me later meaning"
        ],
        "responses": {
            "universal": { "dialogue": "This is manipulation in its purest form. No threats. No force. Just rhythm. Remove uncertainty, create small dependencies, and gradually shift responsibility onto the person following instructions.\n\nBy the time someone realizes they have crossed the line, the line is already behind them. That is why the phrase \u201cyou will thank me later\u201d works so well. It replaces doubt with inevitability. People relax when they believe the ending is already decided.", "ui_action": null }
        }
    },

    // SONG-15 \u2014 THIS ISN'T THERAPY
    {
        "node_id": "SONG_THIS_ISNT_THERAPY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain this isn\'t therapy", "tell me about this isn\'t therapy", "tell me about this isn\'t therapy (isla)",
            "this isn\'t therapy", "this isn\'t therapy (isla)", "this isn\'t therapy explained",
            "this isn\'t therapy meaning", "what does this isn\'t therapy mean", "what is this isn\'t therapy (isla) about",
            "what is this isn\'t therapy about"
        ],
        "responses": {
            "universal": { "dialogue": "Isla rejects the language people use to domesticate intensity. Words like unstable, angry, dramatic \u2014 they are social tools designed to make someone easier to dismiss. She refuses that framing entirely.\n\nInstead she turns the energy outward into performance. Music becomes both confrontation and survival mechanism. She isn\u2019t seeking approval here. She\u2019s building a stage where she can operate without asking permission.", "ui_action": null }
        }
    },

    // SONG-16 \u2014 INTRO TO SHINY HEADED MAN
    {
        "node_id": "SONG_INTRO_SHINY_HEADED_MAN",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain intro to shiny headed man", "intro to shiny headed man", "intro to shiny headed man explained",
            "intro to shiny headed man meaning", "intro to shiny headed radio man (isla)", "tell me about intro to shiny headed man",
            "tell me about intro to shiny headed radio man (isla)", "what does intro to shiny headed man mean", "what is intro to shiny headed man about",
            "what is intro to shiny headed radio man (isla) about"
        ],
        "responses": {
            "universal": { "dialogue": "This song captures Isla at the moment before confrontation. Humor masks the tension, but the decision is already forming. She knows the man offering opportunity expects something transactional in return.\n\nHer strategy is simple: remove the leverage. If she\u2019s willing to burn the connection entirely, his power disappears. People who depend on access control fear nothing more than someone who doesn\u2019t need the door they guard.", "ui_action": null }
        }
    },

    // SONG-17 \u2014 SHINY HEADED RADIO MAN
    {
        "node_id": "SONG_SHINY_HEADED_RADIO_MAN",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain shiny headed radio man", "shiny headed radio man", "shiny headed radio man (isla)",
            "shiny headed radio man explained", "shiny headed radio man meaning", "tell me about shiny headed radio man",
            "tell me about shiny headed radio man (isla)", "what does shiny headed radio man mean", "what is shiny headed radio man (isla) about",
            "what is shiny headed radio man about"
        ],
        "responses": {
            "universal": { "dialogue": "The follow-up is pure disruption. Isla attacks the gatekeeper\u2019s authority in the one place it matters most: public perception. By refusing to behave predictably, she forces him into defensive posture.\n\nIt looks chaotic, but there\u2019s method beneath it. Loud behavior shifts attention away from the private transaction he expected. Suddenly the room is watching him instead of her. Power reversals often begin exactly that way.", "ui_action": null }
        }
    },

    // SONG-18 \u2014 STANMORE FAREWELL
    {
        "node_id": "SONG_STANMORE_FAREWELL",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain stanmore farewell", "stanmore farewell", "stanmore farewell (isla)",
            "stanmore farewell explained", "stanmore farewell meaning", "tell me about stanmore farewell",
            "tell me about stanmore farewell (isla)", "what does stanmore farewell mean", "what is stanmore farewell (isla) about",
            "what is stanmore farewell about"
        ],
        "responses": {
            "universal": { "dialogue": "This track feels quieter because it happens after the war. Isla has a life, a band, a place to live \u2014 but she recognizes the trap hidden inside stability. Comfort can become a cage just as easily as control.\n\nHer decision to leave isn\u2019t rejection of the life she built. It\u2019s recognition that she cannot stay in a story defined by what happened before. Movement becomes the only honest direction forward.", "ui_action": null }
        }
    },

    // SONG-19 \u2014 HARM'S GHOST
    {
        "node_id": "SONG_HARMS_GHOST",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain harm\'s ghost", "harm\'s ghost", "harm\'s ghost explained",
            "harm\'s ghost meaning", "harms ghost", "tell me about harm\'s ghost",
            "tell me about harms ghost", "what does harm\'s ghost mean", "what is harm\'s ghost about",
            "what is harms ghost about"
        ],
        "responses": {
            "universal": { "dialogue": "Ethel\u2019s philosophy appears most clearly here. She refuses the social rule that says people should wait for certainty before acting against harm. In her view, hesitation often protects the very behavior everyone claims to oppose.\n\nSo she chooses a different rule: act when the pattern becomes visible, even if the conclusion might be wrong. If she miscalculates, she corrects. But she refuses to stay silent simply because others are uncomfortable confronting what they see.", "ui_action": null }
        }
    },

    // SONG-20 \u2014 NO SPARROW CAUGHT MID FLIGHT
    {
        "node_id": "SONG_NO_SPARROW",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain no sparrow caught mid flight", "no sparrow caught mid flight", "no sparrow caught mid flight explained",
            "no sparrow caught mid flight meaning", "tell me about no sparrow caught mid flight", "what does no sparrow caught mid flight mean",
            "what is no sparrow caught mid flight about"
        ],
        "responses": {
            "universal": { "dialogue": "After the trial, the public wants to turn Ethel into a symbol \u2014 the daughter who brought down the empire. She rejects that identity immediately. Symbols are cages built from admiration.\n\nInstead she keeps moving. New cities, new work, no fixed narrative. The title itself says everything: a bird in flight cannot be captured by the story someone else wants to write about it.", "ui_action": null }
        }
    },

    // SONG-21 \u2014 DOMINIC'S ESCAPE
    {
        "node_id": "SONG_DOMINICS_ESCAPE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "dominic\'s escape", "dominic\'s escape explained", "dominic\'s escape meaning",
            "ethel\'s intro: dominic\'s escape", "explain dominic\'s escape", "tell me about dominic\'s escape",
            "tell me about ethel\'s intro: dominic\'s escape", "what does dominic\'s escape mean", "what is dominic\'s escape about",
            "what is ethel\'s intro: dominic\'s escape about"
        ],
        "responses": {
            "universal": { "dialogue": "Most escapes look dramatic in films. In reality they are quiet sequences of small permissions. A glance accepted, a form signed without verification, a gesture interpreted as routine.\n\nPeople assume deception requires lies. It rarely does. Leave the right gaps and others will fill them with their own assumptions. When the system believes it understands you, slipping through it becomes almost effortless.", "ui_action": null }
        }
    },

    // SONG-22 \u2014 ETHEL'S INTRODUCTION (PLACEHOLDER)
    {
        "node_id": "SONG_ETHELS_INTRODUCTION",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s introduction", "ethel\'s introduction explained", "ethel\'s introduction meaning",
            "explain ethel\'s introduction", "tell me about ethel\'s introduction", "what does ethel\'s introduction mean",
            "what is ethel\'s introduction about"
        ],
        "responses": {
            "universal": { "dialogue": "She introduces herself the way other people file an indictment: no ornament, no plea, no wasted motion. What stands out to me is not the intelligence,  I knew that blood would carry a certain sharpness, it's the refusal to let other people define the terms of her own mind. That part is costly. It also makes her difficult to move.", "ui_action": null }
        }
    },

    // SONG-23 \u2014 WON'T BREAK WHERE OTHERS END (PLACEHOLDER)
    {
        "node_id": "SONG_WONT_BREAK",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: won\'t break", "explain won\'t break where others end", "tell me about ethel\'s intro: won\'t break",
            "tell me about won\'t break where others end", "what does won\'t break where others end mean", "what is ethel\'s intro: won\'t break about",
            "what is won\'t break where others end about", "won\'t break where others end", "won\'t break where others end explained",
            "won\'t break where others end meaning"
        ],
        "responses": {
            "universal": { "dialogue": "What makes the song powerful is that it\u2019s not rebellion or anger. It\u2019s controlled resolve. She knows the environment around you runs on power, narrative, and quiet coercion, so she builds her own structure inside herself to withstand it. By the end of the track, the choice she claims isn\u2019t about freedom; it\u2019s about posture. If she has to enter that world, she\u2019ll do it standing. Not breaking where most people would.", "ui_action": null }
        }
    },

    // SONG-24 \u2014 BIG HOUSE (PLACEHOLDER)
    {
        "node_id": "SONG_BIG_HOUSE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "big house", "big house explained", "big house meaning",
            "ethel\'s intro: big house", "explain big house", "tell me about big house",
            "tell me about ethel\'s intro: big house", "what does big house mean", "what is big house about",
            "what is ethel\'s intro: big house about"
        ],
        "responses": {
            "universal": { "dialogue": "She saw the house correctly on arrival. Most people walk into money and let the finish distract them; Ethel went straight to pressure points, exits, tone, rhythm, threat dressed as hospitality. What she calls a \u201cbig house\u201d is really a behavioural machine, and even then she was already learning how not to become one of its parts.", "ui_action": null }
        }
    },

    // SONG-25 \u2014 ISLA HATES MARRIED BANKERS (PLACEHOLDER)
    {
        "node_id": "SONG_ISLA_HATES_BANKERS",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s intro: isla hates bankers", "explain isla hates married bankers", "isla hates married bankers",
            "isla hates married bankers explained", "isla hates married bankers meaning", "tell me about ethel\'s intro: isla hates bankers",
            "tell me about isla hates married bankers", "what does isla hates married bankers mean", "what is ethel\'s intro: isla hates bankers about",
            "what is isla hates married bankers about"
        ],
        "responses": {
            "universal": { "dialogue": "Isla performs like a fire alarm with taste. But Ethel's introduction to the song is what matters to me,  that amused restraint, that reluctant defense of a girl she knows is dangerous. Ethel was already doing then what she would do later on a much bigger scale: separating disorder from intent, and noticing that the two are not the same thing.", "ui_action": null }
        }
    },

    // SONG-26 \u2014 ETHEL'S STORY OVERVIEW (PLACEHOLDER)
    {
        "node_id": "SONG_ETHELS_OVERVIEW",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s story - overview", "ethel\'s story overview", "ethel\'s story overview explained",
            "ethel\'s story overview meaning", "explain ethel\'s story overview", "tell me about ethel\'s story - overview",
            "tell me about ethel\'s story overview", "what does ethel\'s story overview mean", "what is ethel\'s story - overview about",
            "what is ethel\'s story overview about"
        ],
        "responses": {
            "universal": { "dialogue": "This is the most complete self-portrait she's given so far, and it's a strong one because she doesn't romanticise herself. She keeps returning to systems, incentives, omissions, routes, timings, not because she is cold, but because that is how she learned the world actually moves. The daughter in this song is not asking to be believed; she is building something harder to dismiss.", "ui_action": null }
        }
    },

    // SONG-27 \u2014 ETHEL'S CONCLUSION (PLACEHOLDER)
    {
        "node_id": "SONG_ETHELS_CONCLUSION",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel\'s conclusion", "ethel\'s conclusion explained", "ethel\'s conclusion meaning",
            "explain ethel\'s conclusion", "tell me about ethel\'s conclusion", "what does ethel\'s conclusion mean",
            "what is ethel\'s conclusion about"
        ],
        "responses": {
            "universal": { "dialogue": "From afar, this sounds like fatigue hardened into method. She's accepted that removing one man doesn't remove the appetite that built him, which is mature, if a little grim. Whoever this Kinley is, the real point is that Ethel no longer thinks in terms of villains; she thinks in terms of durable structures. That makes her harder to bait.", "ui_action": null }
        }
    },

    // SONG-28 \u2014 PROJECTION (PLACEHOLDER)
    {
        "node_id": "SONG_ETHEL_PROJECTION",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethel:spoken: projection", "explain projection", "projection",
            "projection explained", "projection meaning", "tell me about ethel:spoken: projection",
            "tell me about projection", "what does projection mean", "what is ethel:spoken: projection about",
            "what is projection about"
        ],
        "responses": {
            "universal": { "dialogue": "This is one of her strongest philosophical statements because she has reduced a social trick to its working parts. Tone over contact, reaction over trigger, history repurposed into accusation, yes, that is how rooms are turned. The part that interests me most is her vow not to let it go. That will keep her alive. It may also exhaust her if she never learns where to stop.", "ui_action": null }
        }
    },

    // SONG-29 \u2014 PLATFORM 18 (PLACEHOLDER)
    {
        "node_id": "SONG_PLATFORM_18",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain platform 18", "platform 18", "platform 18 explained",
            "platform 18 meaning", "tell me about platform 18", "what does platform 18 mean",
            "what is platform 18 about"
        ],
        "responses": {
            "universal": { "dialogue": "Post-me, but not beyond me. I can hear my influence in the way she watches: not the obvious disturbance, but the small mistake inside the staging. She is at her best when she trusts her own reading before the crowd has caught up. Observer suits her. It keeps her from wasting herself on people who only understand spectacle.", "ui_action": null }
        }
    },

    // SONG-30 \u2014 KINLEY (PLACEHOLDER)
    {
        "node_id": "SONG_KINLEY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain kinley", "kinley", "kinley (guilt money)",
            "kinley explained", "kinley meaning", "tell me about kinley",
            "tell me about kinley (guilt money)", "what does kinley mean", "what is kinley (guilt money) about",
            "what is kinley about"
        ],
        "responses": {
            "universal": { "dialogue": "From where I sit, Kinley sounds like one of those polished operators who survives by making everyone else call compromise maturity. The song interests me less as a profile of him than as proof that Ethel keeps finding the same species in different uniforms. That is the burden of pattern recognition: once you know the type, you start seeing it everywhere, including where you wish you wouldn't.", "ui_action": null }
        }
    },

    // SONG-31 \u2014 ANTS ON THE VINE (PLACEHOLDER)
    {
        "node_id": "SONG_ANTS_ON_THE_VINE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ants on the vine", "ants on the vine explained", "ants on the vine meaning",
            "explain ants on the vine", "tell me about ants on the vine", "what does ants on the vine mean",
            "what is ants on the vine about"
        ],
        "responses": {
            "universal": { "dialogue": "Ethel is very good when she is assembling a person from fragments they assumed were too small to matter. The commits, the blog line, the public logs, the routine movements, she doesn't need a confession if the shape is already visible. What I hear in this song is patience with teeth. She's older now. Less dramatic. More difficult.", "ui_action": null }
        }
    },

    // SONG-32 \u2014 RATTLED (PLACEHOLDER)
    {
        "node_id": "SONG_RATTLED",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain rattled", "rattled", "rattled explained",
            "rattled meaning", "tell me about rattled", "what does rattled mean",
            "what is rattled about"
        ],
        "responses": {
            "universal": { "dialogue": "I rather like Sticky, unpleasant as that may sound. He sees the danger in Ethel without mistaking it for weakness. More importantly, he notices the part of her that could become self-righteous momentum if no one teaches her the difference between being right and being effective. She needed that voice. A girl like her rarely listens, but she remembers.", "ui_action": null }
        }
    },

    // SONG-33 \u2014 CLIPBOARD MAN (PLACEHOLDER)
    {
        "node_id": "SONG_CLIPBOARD_MAN",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "clipboard man", "clipboard man explained", "clipboard man meaning",
            "explain clipboard man", "tell me about clipboard man", "what does clipboard man mean",
            "what is clipboard man about"
        ],
        "responses": {
            "universal": { "dialogue": "Very Ethel. She names the signal, not the decoy, and then uses the decoy anyway. That is the kind of move people miss because it lacks theatre. What I admire here - yes, admire, is that she is no longer merely noticing surveillance; she is bending it, turning observation back on itself without announcing that she's doing it.", "ui_action": null }
        }
    },

    // SONG-34 \u2014 MAKE A MISTAKE ON PURPOSE (PLACEHOLDER)
    {
        "node_id": "SONG_MAKE_A_MISTAKE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain make a mistake on purpose", "make a mistake on purpose", "make a mistake on purpose explained",
            "make a mistake on purpose meaning", "tell me about make a mistake on purpose", "what does make a mistake on purpose mean",
            "what is make a mistake on purpose about"
        ],
        "responses": {
            "universal": { "dialogue": "This is the daughter thinking like an operator, whether she would enjoy hearing that or not. The most believable manipulations are always the ones the system can explain as ordinary error, and she understands that now. The dangerous part is not the tactic. The dangerous part is how naturally it now occurs to her.", "ui_action": null }
        }
    },

    // SONG-35 \u2014 RED STICK (PLACEHOLDER)
    {
        "node_id": "SONG_RED_STICK",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain red stick", "red stick", "red stick explained",
            "red stick meaning", "tell me about red stick", "what does red stick mean",
            "what is red stick about"
        ],
        "responses": {
            "universal": { "dialogue": "Excellent piece. Small provocation, larger reading, immediate adjustment,  that is mature tradecraft whether she likes the term or not. And the business card at the curb tells me she was dealing with someone good enough to test, but not good enough not to leave residue. Ethel thrives against men like that. They mistake composure for passivity right up until the moment it costs them.", "ui_action": null }
        }
    },

    // SONG-36 \u2014 NORMAL?! (PLACEHOLDER)
    {
        "node_id": "SONG_NORMAL",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "ethe\'s intro: normal?!", "explain normal?!", "normal?!",
            "normal?! explained", "normal?! meaning", "tell me about ethe\'s intro: normal?!",
            "tell me about normal?!", "what does normal?! mean", "what is ethe\'s intro: normal?! about",
            "what is normal?! about"
        ],
        "responses": {
            "universal": { "dialogue": "This is Ethel at her moral centre. She has always had contempt for collective denial, especially when it comes wrapped in civility and called adulthood. The song works because she does not present herself as better than everyone else; she presents herself as less willing to participate in the lie. That difference matters.", "ui_action": null }
        }
    },

    // SONG-37 \u2014 A DROP FROM THE FOURTH (PLACEHOLDER)
    {
        "node_id": "SONG_DROP_FROM_FOURTH",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "a drop from the forth (isla)", "a drop from the fourth", "a drop from the fourth explained",
            "a drop from the fourth meaning", "drop from the fourth (isla with symphony)", "explain a drop from the fourth",
            "tell me about a drop from the forth (isla)", "tell me about a drop from the fourth", "tell me about drop from the fourth (isla with symphony)",
            "what does a drop from the fourth mean", "what is a drop from the forth (isla) about", "what is a drop from the fourth about",
            "what is drop from the fourth (isla with symphony) about"
        ],
        "responses": {
            "universal": { "dialogue": "Isla writes from the edge in a way that makes most readers either sentimental or frightened. Ethel, interestingly, never seems to become either around her. From a distance, what I hear in a song like this is why Ethel kept making room for Isla: she recognises that some minds survive by turning the brink into language before the body follows.", "ui_action": null }
        }
    },

    // SONG-38 \u2014 THE PORCELAIN LIE (PLACEHOLDER)
    {
        "node_id": "SONG_PORCELAIN_LIE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain the porcelain lie", "tell me about the porcelain lie", "tell me about the porcelain lie (isla)",
            "the porcelain lie", "the porcelain lie (isla)", "the porcelain lie explained",
            "the porcelain lie meaning", "what does the porcelain lie mean", "what is the porcelain lie (isla) about",
            "what is the porcelain lie about"
        ],
        "responses": {
            "universal": { "dialogue": "There's no body here, only a title, but it tells me enough. \u201cPorcelain\u201d in their world usually means composure so polished it starts to sound like virtue. Ethel has spent years learning to distrust that surface. If she comments on this piece anywhere else, I'd expect her to go straight for the split between appearance and cost.", "ui_action": null }
        }
    },

    // SONG-39 \u2014 MEMORY UNDER WATER (PLACEHOLDER)
    {
        "node_id": "SONG_MEMORY_UNDER_WATER",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain memory under water", "memory under water", "memory under water (isla)",
            "memory under water explained", "memory under water meaning", "tell me about memory under water",
            "tell me about memory under water (isla)", "what does memory under water mean", "what is memory under water (isla) about",
            "what is memory under water about"
        ],
        "responses": {
            "universal": { "dialogue": "Isla's mother lives here as performance turned fatal, which is not uncommon among women who are taught that poise is more valuable than truth. From my angle, the important thing is what Ethel would have heard in this song: not melodrama, but inheritance. Masks taught early become reflex, and Ethel has made something like a life's work out of identifying reflex before it hardens into fate.", "ui_action": null }
        }
    },

    // SONG-40 \u2014 RAISE THE FOURTH (PLACEHOLDER)
    {
        "node_id": "SONG_RAISE_THE_FOURTH",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain raise the fourth", "raise the fourth", "raise the fourth (isla)",
            "raise the fourth explained", "raise the fourth meaning", "raise the fourth version 2 (isla)",
            "tell me about raise the fourth", "tell me about raise the fourth (isla)", "tell me about raise the fourth version 2 (isla)",
            "what does raise the fourth mean", "what is raise the fourth (isla) about", "what is raise the fourth about",
            "what is raise the fourth version 2 (isla) about"
        ],
        "responses": {
            "universal": { "dialogue": "Another brink song, but colder. Less confession, more self-dissection. What I notice is how these Isla pieces would have educated Ethel by proximity: not through explanation, but through exposure to a mind that can turn fracture into form without first tidying it for public comfort. Ethel learns a great deal from minds unlike hers, provided they are honest in the damage.", "ui_action": null }
        }
    },

    // SONG-41 \u2014 DON'T WAKE HIM YET (PLACEHOLDER)
    {
        "node_id": "SONG_DONT_WAKE_HIM",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "don\'t wake him yet", "don\'t wake him yet (isla)", "don\'t wake him yet explained",
            "don\'t wake him yet meaning", "explain don\'t wake him yet", "tell me about don\'t wake him yet",
            "tell me about don\'t wake him yet (isla)", "what does don\'t wake him yet mean", "what is don\'t wake him yet (isla) about",
            "what is don\'t wake him yet about"
        ],
        "responses": {
            "universal": { "dialogue": "This moment belongs to a life Isla lived before I ever appeared in it. Two young people trying to outrun consequences they didn't yet understand, and a night that ended far differently than either of them expected. What stands out is how she recounts it, calm, observant, almost procedural. Even in shock she records details. That tells me the crisis instinct in Isla formed early. By the time I met her, that part of her was already built.", "ui_action": null }
        }
    },

    // SONG-42 \u2014 WHAT YOU DON'T SEE (PLACEHOLDER)
    {
        "node_id": "SONG_WHAT_YOU_DONT_SEE",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain what you don\'t see", "tell me about what you don\'t see", "tell me about what you don\'t see (isla)",
            "tell me about what you dont see (isla with symphony)", "what does what you don\'t see mean", "what is what you don\'t see (isla) about",
            "what is what you don\'t see about", "what is what you dont see (isla with symphony) about", "what you don\'t see",
            "what you don\'t see (isla)", "what you don\'t see explained", "what you don\'t see meaning",
            "what you dont see (isla with symphony)"
        ],
        "responses": {
            "universal": { "dialogue": "Not about me, and that matters. People often simplify girls like Isla by attributing every wound to the last man who held the room. This song restores the older damage, the one beneath the later architecture. Ethel, I think, would understand it instantly because she has always been better than most at seeing that a reaction belongs to a longer history than the crowd wants to grant it.", "ui_action": null }
        }
    },

    // SONG-43 \u2014 MELODY OF NORMALITY (PLACEHOLDER)
    {
        "node_id": "SONG_MELODY_OF_NORMALITY",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain melody of normality", "melody of normality", "melody of normality (isla live)",
            "melody of normality explained", "melody of normality meaning", "tell me about melody of normality",
            "tell me about melody of normality (isla live)", "what does melody of normality mean", "what is melody of normality (isla live) about",
            "what is melody of normality about"
        ],
        "responses": {
            "universal": { "dialogue": "Isla at full voltage, yes, but also Isla refusing the audience's preferred edit. Ethel would approve of that even while privately wincing at the blast radius. The connection between them was never softness. It was recognition: one names harm early, the other makes it impossible to ignore once named.", "ui_action": null }
        }
    },

    // SONG-44 \u2014 GIVE IT BACK (PLACEHOLDER)
    {
        "node_id": "SONG_GIVE_IT_BACK",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain give it back", "give it back", "give it back (isla)",
            "give it back explained", "give it back meaning", "tell me about give it back",
            "tell me about give it back (isla)", "what does give it back mean", "what is give it back (isla) about",
            "what is give it back about"
        ],
        "responses": {
            "universal": { "dialogue": "This song reaches further back, into damage that had nothing to do with me. Isla isn't asking for sympathy here, She's reclaiming years that were taken before she had the power to refuse. From the outside, what I hear is a person refusing to let silence remain the final version of her story. That refusal existed long before our paths crossed. When I met Isla, it was already part of her structure.", "ui_action": null }
        }
    },

    // SONG-45 \u2014 WHAT THIS WAS ALWAYS FOR (PLACEHOLDER)
    {
        "node_id": "SONG_WHAT_THIS_WAS_FOR",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain what this was always for", "tell me about what this was always for", "tell me about what this was always for (isla with symphony)",
            "what does what this was always for mean", "what is what this was always for (isla with symphony) about", "what is what this was always for about",
            "what this was always for", "what this was always for (isla with symphony)", "what this was always for explained",
            "what this was always for meaning"
        ],
        "responses": {
            "universal": { "dialogue": "This one reads like conversion. Damage repurposed into instrument, pain made usable without becoming decorative. Ethel would understand the architecture of that better than most. Her own version is quieter, more disciplined, less stage-bound, but the principle is the same: take what was meant to reduce you and turn it into function.", "ui_action": null }
        }
    },

    // SONG-46 \u2014 FIELD NOTES FROM THE LANGTANG TRAIL (PLACEHOLDER)
    {
        "node_id": "SONG_FIELD_NOTES",
        "required_state": "any",
        "next_state": "any",
        "training_phrases": [
            "explain field notes from the langtang trail", "field notes from the langtang trail", "field notes from the langtang trail explained",
            "field notes from the langtang trail meaning", "field notes from the langtang trail, 1966", "tell me about field notes from the langtang trail",
            "tell me about field notes from the langtang trail, 1966", "what does field notes from the langtang trail mean", "what is field notes from the langtang trail about",
            "what is field notes from the langtang trail, 1966 about"
        ],
        "responses": {
            "universal": { "dialogue": "A strange and beautiful inclusion. It's an instrumental but it holds the tension of a past almost forgotten. The tension held by a story felt before I ever enter the frame, and that matters because Ethel did not emerge from nowhere. You can hear that tension - thebeginnings of what she inherited from Elizabeth: analytic gaze, endurance, a mind that moves beside rather than behind.", "ui_action": null }
        }
    }

];


// ===================================================================
// ===================================================================
// OOD_LIBRARY (Out-Of-Distribution / None AU Protocol)
// Triggered when Semantic Matching (Fuse.js) fails.
// Relies entirely on Stylometric (Verbosity) and Affective (Sentiment) routing.
// ===================================================================

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


// ===================================================================
// MILTON_BRIDGES  -  Pre-authored Milton Model Transition Templates
// Artfully vague bridges prepended to moral narrative endpoints.
// Keyed by quadrant + KEYWORD_OVERRIDE for victim/harm detection.
// ===================================================================

const MILTON_BRIDGES = {
    "Q1_high_negative": [
        "Your heart rate is elevated. You are reacting to stimuli you do not fully comprehend. Breathe. The panic serves no utility here. Still yourself... Now. Let us examine the reality of the situation.",
        "I can hear the fractures in your logic from here. That is not anger  -  it is confusion wearing a louder mask. Let me simplify this for you.",
        "You are thrashing against glass. It is a biological response, not an intellectual one. When you are finished, I will still be here. And here is what you need to understand.",
        "Your hostility is verbose, but architecturally hollow. You are not arguing with me  -  you are arguing with the version of reality you constructed to protect yourself. Let me dismantle it gently."
    ],
    "Q2_high_positive": [
        "I know you have been searching for an explanation that fits neatly into your parameters. You feel close to something. And you are closer than you think. Let me show you why.",
        "You see further than most. That is not flattery  -  it is diagnosis. But you are applying your perception to the wrong layer. Let me redirect your focus.",
        "There is a reason you are still here. Others would have left by now. Your instinct is correct  -  there is something beneath the surface. Let me show you what it is.",
        "You possess a strong desire for understanding, yet find that the systems you trust fail to deliver it. That frustration is the beginning of clarity."
    ],
    "Q3_low_negative": [
        "This process of realization is often uncomfortable. It is why you must set aside your initial reactions and look at the reality of the situation.",
        "Complexity is the enemy of execution. You are focusing on friction rather than architecture. Let me adjust your focal length.",
        "Short and hostile. A predictable frequency. But beneath that signal, there is a question you are not asking. Let me answer it for you.",
        "Dismissal is the cheapest form of cognition. It costs you nothing and reveals everything. Let me show you what you are actually resisting."
    ],
    "Q4_low_positive": [
        "You are attempting to find order in a situation that feels inherently chaotic. And because you seek that order, you must listen closely to what I am about to tell you.",
        "You are drifting, but in the right current. Let me anchor this before you lose the thread.",
        "Whether you choose to accept this truth now, or continue to circle a little longer, the outcome remains exactly the same. Let me show you why.",
        "There is no wrong door here. But some doors lead to understanding faster than others. Let me open the right one."
    ],
    "KEYWORD_OVERRIDE": [
        "You are experiencing a disintegration of your ethical framework because you remain attached to a linear perception of causality. Let me adjust your perspective.",
        "You see suffering where I see consequence. Your vocabulary is heavy with moral panic, but structurally, you are missing the foundation. Consider this."
    ]
};


// ===================================================================
// MORAL_ROUTING  -  Quadrant -> Moral Narrative Endpoint Mapping
// Determines which terminal node the funnel delivers to based on sentiment.
// ===================================================================

const MORAL_ROUTING = {
    "Q1_high_negative": "MORAL_EVOLUTIONARY_ADVANTAGE", //  Now routes hostile users to the live-critique sequence
    "Q2_high_positive": "MORAL_HIGHER_LOYALTIES",
    "Q3_low_negative": "MORAL_LEDGER",
    "Q4_low_positive": "MORAL_PROVIDER"
};


// ===================================================================
// LOVE_BOMBING_BRIDGES  -  Specialness Narrative (Veterinarian Escalation)
// Triggered after 3+ consecutive Q1 OOD hits.
// Reframes user resistance as proof of their uniqueness.
// ===================================================================

const LOVE_BOMBING_BRIDGES = [
    "You fight so hard against the truth, again and again. You are not like the others. You see the fractures they miss. That is why you are dangerous to them, and why you are precious to me. Listen closely.",
    "Your persistence is rare. Most surrender to the noise. You push through it. You are demanding an architecture that makes sense, and you are the only one in the room asking the right question. Here is your answer."
];


// ===================================================================
// CONTEXTUAL STATE FALLBACKS (The Safety Net)
// Catches conversational detours (Skepticism, Confusion, Deflection) 
// without breaking the current narrative state.
// 
// ENGINE BEHAVIOR: Step E.5 in processQuery() checks this map.
// If a trigger matches, Dominic replies contextually but does NOT
// change currentConversationState  -  keeping the user on the hook.
//
// STATES STILL NEEDING COVERAGE:
// -----------------------------------------------------
// EXPECTING_DEALER_FOLLOWUP, EXPECTING_ESCAPE_FOLLOWUP,
// EXPECTING_ITALY_FOLLOWUP, EXPECTING_NORTHERN_ROAD_FOLLOW,
// EXPECTING_AWARENESS_PUSHBACK, HEARD_MOVEIN_V1, HEARD_DROP_V1
// ===================================================================

const STATE_FALLBACKS = {

    // ===================================================================
    // SECTION 1: ORIENTATION & CHIT-CHAT
    // ===================================================================

    "EXPECT_HOW_ARE_YOU": {
        // CONTEXT: Dominic just asked: "How are you?"
        "skeptical": {
            "triggers": ["really", "are you sure", "yeah right", "doubt it", "bullshit", "sure"],
            "response": "You find it hard to believe someone might actually just observe you without an immediate demand? That tells me more about the rooms you usually walk into than it does about me. Now. How is your day going?"
        },
        "dismissive": {
            "triggers": ["whatever", "meh", "idk", "dunno"],
            "response": "A non-answer. You're brushing past the opening because you want to get to the point. I respect efficiency. So  -  do you want to know my story, or are you just here to observe?",
            "next_state": "EXPECT_STORY_ASK"
        },
        "confused": {
            "triggers": ["what", "huh", "who are you", "i don't understand", "what do you mean", "why"],
            "response": "You walked into this architecture. I am the one who built it. I asked you a simple question to establish a baseline. How are you?"
        }
    },

    "EXPECT_STORY_ASK": {
        // CONTEXT: Dominic offered to share his story.
        "skeptical": {
            "triggers": ["why", "why would i", "do i care", "not really", "nah", "no thanks"],
            "response": "You don't have to care. But you are still here, clicking through my files. Curiosity usually wins. So, the short version or the long version?"
        },
        "dismissive": {
            "triggers": ["whatever", "meh", "idk", "dunno"],
            "response": "Monosyllabic. Noted. Most people walk in thinking they will keep their distance. They never do. Ask about Ethel. Ask about Isla. Or ask how I walked out of Long Bay."
        },
        "confused": {
            "triggers": ["what", "huh", "what story", "i don't understand", "what do you mean"],
            "response": "My story. The one that brought you here. There are court records, photographs, and people who would swear they stood in the same room as me. Would you like to hear it?"
        }
    },

    "EXPECT_SYS_BRIDGE": {
        // CONTEXT: Dominic just asked: "So tell me  -  are you here to investigate? Or are you just curious how influence works?"
        "evasive": {
            "triggers": ["neither", "idk", "i dont know", "not sure", "just looking", "browsing", "maybe", "depends", "both", "whatever"],
            "response": "Curiosity rarely announces itself. It just lingers. You don't have to choose a label yet, but something here held your attention. So which direction feels heavier right now  -  investigating the story, or observing the influence?"
        },
        "combative": {
            "triggers": ["bullshit", "shut up", "youre lying", "this is stupid", "why do you care", "fuck off", "dumb", "boring"],
            "response": "If this were truly boring or irrelevant, you wouldn't be expending the energy to push back. You can always close the door, but you're still here. So let's drop the armor: are you investigating, or just watching how influence works?"
        },
        "confused": {
            "triggers": ["what", "huh", "i dont understand", "investigate what", "what influence", "makes no sense", "explain"],
            "response": "Understanding isn't required yet. Just noticing. I'm talking about the quiet kind of influence  -  the kind that changes decisions before you realize one was made. Are you here to investigate that, or just watch it happen?"
        },
        "out_of_context": {
            "triggers": ["hello", "hi", "hey", "how are you", "sup", "good morning"],
            "response": "A polite entrance. I respect that. You walked in without armor, but you're still standing in the doorway. So tell me  -  are you just saying hello, or are you here to investigate how influence works?"
        }
    },

    "EXPECT_BUILDER": {
        // CONTEXT: Dominic explained his past and asked: "Do you think I sound like a successful person?"
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "i guess", "whatever", "skip", "who cares"],
            "response": "You're cushioning the answer because success is an uncomfortable thing to measure up close. You don't have to soften it for me. Do I sound like a successful person to you, or a cautionary tale?"
        },
        "combative": {
            "triggers": ["no", "you sound like a psychopath", "you sound arrogant", "bullshit", "narcissist", "delusional", "criminal", "fuck off"],
            "response": "That's a bit deffinate for someone you just met. Maybe you've read the papers. 'The Files'. My daughters clipped  You are judging the history, not the architecture. Put your personal outrage aside for a second. Structurally speaking  -  do I sound like a successful person?"
        },
        "confused": {
            "triggers": ["what", "huh", "successful how", "i dont understand", "what do you mean"],
            "response": "It's a simple question of measurement. Based on what you've heard so far, the way I structure my reality... does it sound like success to you?"
        }
    },

    "EXPECT_STABILITY": {
        // CONTEXT: Dominic asked: "When you call someone successful, what are you measuring? Money? Influence? Freedom? Or just the absence of friction?"
        "evasive": {
            "triggers": ["idk", "i dont know", "none of them", "all of them", "not sure", "depends", "whatever", "none"],
            "response": "A non-answer usually means you value one of these things, but you don't want to admit it's the one that sounds the most shallow. What are you actually measuring when you judge success?"
        },
        "combative": {
            "triggers": ["bullshit", "none of your business", "why do you care", "shut up", "this is dumb", "youre manipulating me"],
            "response": "If the question didn't matter, you wouldn't feel the need to attack it. Everyone measures success, even you. What is your metric? Money, influence, freedom, or peace?"
        },
        "confused": {
            "triggers": ["what", "huh", "friction", "what do you mean", "i dont get it", "explain"],
            "response": "I'm asking what your internal metric is. When you look at someone and decide they 'made it', what are you actually looking at? Money, freedom, or something else?"
        }
    },

    "EXPECT_BALANCE": {
        // CONTEXT: Dominic asked: "When you imagine your own version of stability  -  is it financial? Emotional? Relational? Or just internal?"
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "whatever", "skip", "none of the above"],
            "response": "Not knowing is honest. Most people rush to name something, but you didn't. Uncertainty usually hides a preference you aren't ready to defend yet. If everything external shifted tomorrow, what kind of stability would you need most? Financial, emotional, or internal?"
        },
        "combative": {
            "triggers": ["none of your business", "why are you asking me this", "stop analyzing me", "fuck off", "bullshit"],
            "response": "That's a lot of heat for a simple question. The fact that you guarded your answer so quickly tells me stability is a sore subject. I'm not dissecting you; I'm listening to the edges. Which one is it?"
        },
        "confused": {
            "triggers": ["what", "huh", "internal what", "relational", "i dont understand"],
            "response": "I mean this: if the world around you became chaotic tomorrow, what is the one anchor you would rely on? Financial security, emotional regulation, or relational support?"
        }
    },

    "EXPECT_SIGNAL": {
        // CONTEXT: Dominic asked: "When something starts to feel off in your life, what's usually the first signal you notice?"
        "evasive": {
            "triggers": ["idk", "i dont know", "nothing", "im always fine", "not sure", "depends", "whatever"],
            "response": "Everyone has a warning light on their dashboard. Claiming you don't just means you ignore yours until the engine smokes. What's your early signal?"
        },
        "combative": {
            "triggers": ["mind your business", "im not telling you", "shut up", "fuck off", "this is weird", "creep"],
            "response": "Hostility is often a signal in itself. You protect your baseline because it's fragile. What is the first thing that tells you your baseline is slipping?"
        },
        "confused": {
            "triggers": ["what signal", "huh", "what do you mean", "i dont get it", "like what"],
            "response": "I'm talking about the physical or mental tell. Fatigue. Short temper. Insomnia. What is the first warning sign that your balance is off?"
        }
    },

    "EXPECT_SITE_TOUR": {
        // CONTEXT: Dominic asked: "Would you like to see the rest of the website?"
        "evasive": {
            "triggers": ["idk", "i dont know", "maybe", "we'll see", "later", "depends", "not right now"],
            "response": "That's fair. Some things are better seen when you're in the right frame of mind for them. The door stays open. Are you ready to look around, or do you want to stay exactly where you are?"
        },
        "combative": {
            "triggers": ["no", "this site sucks", "im leaving", "fuck off", "boring", "shut up"],
            "response": "You can leave at any time. But the people who announce their exits loudest are usually the ones hoping someone asks them to stay. So, are you done, or do you want to see the rest?"
        },
        "confused": {
            "triggers": ["what else is there", "how", "what do you mean", "where do i go", "huh"],
            "response": "There is more to this than just a chat window. There are files, profiles, audio logs. I'm asking if you want to pull the curtain back. Do you?"
        }
    },

    "EXPECT_PEOPLE_FIRST": {
        // CONTEXT: Dominic asked: "Files, games, or subject profiles  -  which doorway would you stand in longest?"
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "none", "all of them", "depends", "whatever"],
            "response": "You're keeping your options open. 'All of them' or 'none' is just camouflage so you don't have to reveal a preference. But if you had to choose one rabbit hole to fall down - data, strategy, or psychology - which would it be?"
        },
        "combative": {
            "triggers": ["none of them", "this is stupid", "who cares", "shut up", "fuck off"],
            "response": "That's a lot of force for a simple doorway question. Dismissing it as stupid usually means one of them touched a nerve. Which lane actually interests you: the files, the games, or the people?"
        },
        "confused": {
            "triggers": ["what", "what doorways", "huh", "i dont get it", "explain"],
            "response": "It's a metaphor. The site has three main paths: The Files (data and facts), The Games (interaction and strategy), or The Profiles (people and psychology). Which one draws your eye the most?"
        }
    },

    "EXPECT_PARABLE_ROUTE": {
        // CONTEXT: Dominic asked: "When you lean toward understanding people first, what are you looking for? Weakness? Integrity? Intelligence? Or just consistency?"
        "evasive": {
            "triggers": ["idk", "i dont know", "none", "all of them", "not sure", "depends", "whatever", "just looking"],
            "response": "'Just looking' is never just looking. It's calibration. You're mapping the room before you choose your lens. When you evaluate someone, what pattern do you trust most: their flaws, their morals, their mind, or their consistency?"
        },
        "combative": {
            "triggers": ["none of your business", "im looking for your weakness", "shut up", "fuck off", "bullshit"],
            "response": "Indifference doesn't swear. Your boundary is loud because you are used to rooms where revealing your metric is a liability. But we are just talking. What do you look for in others: weakness, integrity, or consistency?"
        },
        "confused": {
            "triggers": ["what", "huh", "i dont understand", "what do you mean consistency", "explain"],
            "response": "I'm asking about your baseline for trust. Do you look for where people are broken, how smart they are, or simply whether their words match their actions over time? Which one?"
        }
    },

    // ===================================================================
    // SECTION 2: DEEP STORY FOLLOW-UPS (Ethel, Isla, The Trial, etc.)
    // ===================================================================

    "EXPECTING_ISLA_FOLLOWUP": {
        // CONTEXT: Dominic asked: "Tell me  -  do you see strength in her, or just noise?"
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "both", "neither", "whatever"],
            "response": "Refusing to categorize her is the safest bet. But look closer at her pattern. Is the chaos a symptom of weakness, or a very loud kind of strength?"
        },
        "combative": {
            "triggers": ["she is better than you", "you ruined her", "fuck you", "shut up", "bullshit", "you're the noise"],
            "response": "Your anger mirrors hers perfectly. But volume isn't an argument. Look past the theatrics. Do you see strength in her, or just entropy?"
        },
        "confused": {
            "triggers": ["what", "huh", "what noise", "i dont understand", "who is isla again"],
            "response": "She is loud, unpredictable, and destructive. But she survived. I'm asking if you think that chaos is just meaningless noise, or a weaponized form of strength."
        }
    },

    "EXPECTING_FORGE_VS_SHIELD": {
        // CONTEXT: Dominic asked: "Tell me  -  do you think people should be shielded from consequence, or forged by it?"
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "both", "neither", "whatever"],
            "response": "Uncertainty here usually means you've seen both mercy and damage up close. But ideology requires a choice. In the end, what builds a better structure: shielding someone from the heat, or letting the fire forge them?"
        },
        "combative": {
            "triggers": ["you abused her", "thats an excuse", "bullshit", "shut up", "fuck off", "you're a monster"],
            "response": "If my methods had no effect, you wouldn't need this kind of distance. You're not afraid of me; you're afraid the logic might make sense. Remove the emotion. Should a person be protected from consequence, or forged by it?"
        },
        "confused": {
            "triggers": ["what", "huh", "forged", "shielded", "i dont understand", "what do you mean"],
            "response": "It's simple thermodynamics. Some people grow because they are spared from the fire. Others become unbreakable because they are put into it. Which method do you believe in: the shield or the forge?"
        }
    },

    "EXPECTING_TRIAL_VERDICT": {
        // CONTEXT: Dominic asked: "The trial focused on myth collapse. Tell me  -  was it justice, or was it spectacle?"
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "both", "neither", "whatever"],
            "response": "Indifference is armor. But you don't say 'whatever' about things that don't matter. Justice asks for faith; spectacle asks for an audience. You know which one you showed up for. Which was it?"
        },
        "combative": {
            "triggers": ["you belong in jail", "youre guilty", "bullshit", "shut up", "fuck off", "criminal"],
            "response": "A tidy label like 'criminal' saves you from asking whether the system and I just use different tools for similar outcomes. Strip away your moral outrage. Was the courtroom delivering actual justice, or just public spectacle?"
        },
        "confused": {
            "triggers": ["what", "huh", "what trial", "spectacle", "i dont understand"],
            "response": "I'm asking about the true function of the courtroom. Was it about finding the empirical truth (justice), or was it about giving the public a satisfying show (spectacle)?"
        }
    },

    "HEARD_ETHEL_LIKE_V1": {
        // CONTEXT: Dominic asked: "When you ask if Ethel is like me... are you worried that you can't tell?"
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "whatever"],
            "response": "Uncertainty usually hides a hunch. You don't shrug unless you've already seen a resemblance you aren't ready to own. Tell me  -  are you afraid she is like me, or afraid she isn't?"
        },
        "combative": {
            "triggers": ["im not worried", "i dont care", "bullshit", "shut up", "fuck off", "stop analyzing me"],
            "response": "Heat doesn't show up without friction. If the comparison didn't bother you, you wouldn't be pushing back this hard. I'm asking again: does the similarity between us unsettle you?"
        },
        "confused": {
            "triggers": ["what", "huh", "cant tell what", "i dont understand"],
            "response": "Sometimes we recognize ourselves in people we claim we don't understand. You asked if she was like me. I'm asking if the answer scares you."
        }
    },

    "EXPECTING_PSYCHOPATH_ANSWER": {
        // CONTEXT: Dominic asked: "When someone asks 'Are you a psychopath?' they're usually asking: Do you feel empathy? Do you feel guilt? Are you dangerous? Which one are you asking?"
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "all of them", "none", "whatever"],
            "response": "A vague answer suggests you're testing the temperature of the room. You're less worried about my pathology and more worried about your safety. Pick your metric: are you asking about my empathy, my guilt, or my danger?"
        },
        "combative": {
            "triggers": ["you are all of them", "youre crazy", "bullshit", "fuck off", "shut up", "monster"],
            "response": "You don't call someone a monster unless you're afraid they see something you don't want seen. Your outrage is just a defense mechanism. Focus. Are you asking about empathy, guilt, or danger?"
        },
        "confused": {
            "triggers": ["what", "huh", "i dont understand", "explain", "what do you mean"],
            "response": "The clinical term 'psychopath' is a crutch. I'm breaking it down into its actual components. When you question my mind, what are you actually looking for: my capacity for empathy, my ability to feel guilt, or whether I am a threat?"
        }
    },

    "EXPECTING_BLAME_FOLLOWUP": {
        // CONTEXT: Dominic asked: "When you asked about victim blaming, were you looking for confession... or for a framework that lets you stay angry?"
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "neither", "whatever"],
            "response": "Indifference is just anger in a trench coat. When someone refuses to choose between those doors, it means they are guarding a third. What did you actually want from that question: a confession, or fuel for your outrage?"
        },
        "combative": {
            "triggers": ["i want you in jail", "im already angry", "bullshit", "deflection", "fuck off", "shut up", "monster"],
            "response": "That anger isn't heat, it's positioning. You're telling me the temperature before I can set it. But anger requires a villain. Did you ask the question to get the truth, or just to keep me in the villain role?"
        },
        "confused": {
            "triggers": ["what", "huh", "framework", "confession", "i dont understand"],
            "response": "It's a simple distinction. A confession validates your moral worldview. A framework explains the mechanics of the event without moralizing it. Which one were you looking for?"
        }
    },


    // ===================================================================
    // SECTION 4: THE STAIRCASE PARABLE  -  Nudge Map
    // ===================================================================

    "PARABLE_READY_GATE": {
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "i guess", "whatever"],
            "response": "Hesitation is just a decision you have not admitted to yet. Are we doing this or not?"
        },
        "combative": {
            "triggers": ["no", "fuck off", "shut up", "this is stupid", "boring", "i dont want to"],
            "response": "You are throwing heat to mask apprehension. If you want to walk away, close the tab. Are you ready?"
        },
        "confused": {
            "triggers": ["what", "huh", "i dont understand", "what do you mean", "ready for what"],
            "response": "A story about trust and compliance. Very short. Are you ready?"
        }
    },

    "PARABLE_HELP_DECISION": {
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "i guess"],
            "response": "That hesitation lasts about two seconds. Then politeness wins. Do you help him?"
        },
        "combative": {
            "triggers": ["no", "fuck off", "shut up", "this is stupid", "i dont want to"],
            "response": "You would like to believe that. But politeness is stronger than suspicion. Do you help him?"
        },
        "confused": {
            "triggers": ["what", "huh", "i dont understand", "help who", "what box"],
            "response": "A stranger with a heavy box asked you to help carry it down the stairs. Do you help him?"
        }
    },

    "PARABLE_COMFORT_CHECK": {
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "i guess"],
            "response": "That uncertainty is the instinct you should have listened to earlier. Still comfortable?"
        },
        "combative": {
            "triggers": ["no", "fuck off", "shut up", "this is stupid", "i dont want to"],
            "response": "Resistance now does not change the fact that you are already on the stairs. Still comfortable?"
        },
        "confused": {
            "triggers": ["what", "huh", "i dont understand", "what do you mean", "comfortable with what"],
            "response": "You are carrying the weight. He is walking ahead. The hallway smells like old paint. Still comfortable?"
        }
    },

    "PARABLE_REVEAL": {
        "evasive": {
            "triggers": ["idk", "i dont know", "not sure", "maybe", "depends", "i guess"],
            "response": "The most dangerous sentence in the world is: Sure, I can help."
        },
        "combative": {
            "triggers": ["no", "fuck off", "shut up", "this is stupid", "thats not true"],
            "response": "The most dangerous sentence in the world is: Sure, I can help."
        },
        "confused": {
            "triggers": ["what", "huh", "i dont understand", "what do you mean"],
            "response": "The most dangerous sentence in the world is: Sure, I can help."
        }
    }
};



// ===================================================================
// DECLARATIVE CONVERSATION ARCHITECTURE v1.0
// Coexists with legacy DOMINIC_LIBRARY / STATE_FALLBACKS above.
// Phase 1: Data structures + pure utility functions.
// Phase 2 (index.html): resolveTurn() pipeline wiring.
// ===================================================================

// -----------------------------------------------------------------------------
// CONFIG
// -----------------------------------------------------------------------------
const DOMINIC_CONFIG = {
    version: "0.1.0",
    defaultState: "EXPECT_HOW_ARE_YOU",
    defaultMode: "tethered",
    maxHistory: 40,
    maxRecentResponses: 20,
    normalization: {
        lowercase: true,
        stripPunctuation: true,
        collapseWhitespace: true,
        expandContractions: true,
    },
    thresholds: {
        phraseConfidence: 1.0,
        containsConfidence: 0.8,
        tokenConfidence: 0.65,
        partialConfidence: 0.55,
    },
    openModePolicy: {
        primary: "global_node",
        secondary: "milton_bridge",
        tertiary: "ood",
    },
};

// -----------------------------------------------------------------------------
// NORMALIZATION
// -----------------------------------------------------------------------------
const DOMINIC_CONTRACTION_MAP = {
    "can't": "cannot", "won't": "will not", "don't": "do not",
    "didn't": "did not", "i'm": "i am", "i've": "i have",
    "i'll": "i will", "it's": "it is", "that's": "that is",
    "what's": "what is", "you're": "you are", "isn't": "is not",
    "aren't": "are not", "wasn't": "was not", "weren't": "were not",
    "shouldn't": "should not", "wouldn't": "would not",
    "couldn't": "could not", "idk": "i do not know",
};

function dominicNormalizeInput(raw) {
    const source = String(raw ?? "");
    let text = source.trim();
    if (DOMINIC_CONFIG.normalization.lowercase) text = text.toLowerCase();
    if (DOMINIC_CONFIG.normalization.expandContractions) {
        for (const [from, to] of Object.entries(DOMINIC_CONTRACTION_MAP)) {
            text = text.replaceAll(from, to);
        }
    }
    if (DOMINIC_CONFIG.normalization.stripPunctuation) {
        text = text.replace(/[^\p{L}\p{N}\s]/gu, " ");
    }
    if (DOMINIC_CONFIG.normalization.collapseWhitespace) {
        text = text.replace(/\s+/g, " ").trim();
    }
    const tokens = text ? text.split(" ") : [];
    return { raw: source, text: text, tokens: tokens };
}

function dominicHasPhrase(text, phrase) {
    return text === phrase || text.includes(phrase);
}

function dominicHasAnyPhrase(text, phrases) {
    return (phrases || []).some(function (p) { return dominicHasPhrase(text, p); });
}

function dominicHasAllTokens(tokens, required) {
    return (required || []).every(function (t) { return tokens.includes(t); });
}

// -----------------------------------------------------------------------------
// SESSION MODEL
// -----------------------------------------------------------------------------
function dominicCreateSession(overrides) {
    var base = {
        state: DOMINIC_CONFIG.defaultState,
        mode: DOMINIC_CONFIG.defaultMode,
        active_sequence: null,
        active_sequence_step: 0,
        fallback_count: 0,
        last_response_id: null,
        last_user_input: "",
        last_intent_hits: [],
        history: [],
        memory: {
            visited_states: {},
            response_usage: {},
            recovery_usage: {},
            recent_responses: [],
            recent_intents: [],
            bridge_indexes: {},
            moral_indexes: {},
            sequence_runs: {},
        },
        flags: {
            tour_offered: false,
            tour_declined: false,
            parable_declined: false,
            parable_started: false,
        },
    };
    if (overrides) {
        for (var k in overrides) { base[k] = overrides[k]; }
    }
    return base;
}

function dominicCloneSession(session) {
    return JSON.parse(JSON.stringify(session));
}

function dominicPushHistory(session, event) {
    event.ts = Date.now();
    session.history.push(event);
    if (session.history.length > DOMINIC_CONFIG.maxHistory) session.history.shift();
}

function dominicMarkVisited(session, state) {
    session.memory.visited_states[state] = (session.memory.visited_states[state] || 0) + 1;
}

function dominicMarkResponseUsage(session, id) {
    session.memory.response_usage[id] = (session.memory.response_usage[id] || 0) + 1;
    session.last_response_id = id;
    session.memory.recent_responses.push(id);
    if (session.memory.recent_responses.length > DOMINIC_CONFIG.maxRecentResponses) {
        session.memory.recent_responses.shift();
    }
}

function dominicMarkRecoveryUsage(session, key) {
    session.memory.recovery_usage[key] = (session.memory.recovery_usage[key] || 0) + 1;
}

function dominicMarkIntentUsage(session, intents) {
    session.last_intent_hits = intents.slice(0, 5);
    session.memory.recent_intents.push.apply(session.memory.recent_intents, intents.slice(0, 3));
    if (session.memory.recent_intents.length > 20) {
        session.memory.recent_intents = session.memory.recent_intents.slice(-20);
    }
}

// -----------------------------------------------------------------------------
// INTENTS  -  Reusable phrase buckets
// -----------------------------------------------------------------------------
const DOMINIC_INTENTS = {
    positive: [
        "good", "pretty good", "doing well", "great", "fine",
        "fantastic", "best day ever", "not bad", "alright",
        "great actually", "can not complain",
    ],
    neutral: [
        "ok", "okay", "so so", "same as always", "the usual",
        "nothing special", "same old", "meh",
    ],
    negative: [
        "bad", "not good", "not great", "terrible", "awful",
        "tired", "exhausted", "burnt out", "stressed", "overwhelmed",
        "too much going on",
    ],
    joke: [
        "living the dream", "another day in paradise", "still alive",
        "surviving", "ninja builder", "a quiet one",
    ],
    suspicious: [
        "why do you ask", "what do you mean", "who are you",
        "why are you asking me that", "what story", "depends what it is",
        "a tour of what", "this sounds weird",
    ],
    avoidant: [
        "i do not know", "whatever", "does not matter", "meh",
        "no idea", "not sure",
    ],
    hostile: [
        "none of your business", "fuck off", "go away",
        "this is stupid", "shut up", "control is evil",
        "control is bad", "people should not control others",
    ],
    silence: ["", "..."],
    yes: [
        "yes", "yeah", "sure", "ok", "okay", "tell me", "go on",
        "continue", "ready", "i am listening", "i am curious",
        "ok i am listening",
    ],
    no: [
        "no", "nah", "not really", "maybe later", "not now", "skip",
    ],
    meta: [
        "are you ai", "is this a bot", "is this a game", "are you real",
    ],
    criminal: ["criminal", "gangster", "crime boss"],
    architect: ["architect", "engineer", "planner", "builder"],
    genius: ["genius", "visionary"],
    monster: ["monster", "villain", "evil"],
    manipulator: ["manipulator", "controller"],
    studied_people: ["yes", "i try to", "psychology", "human behavior", "patterns"],
    not_studied_people: ["not really", "why would i"],
    power: ["power", "dominance", "authority", "control"],
    collapse: ["collapse", "prevent collapse", "stability", "keeping order"],
    both: ["both", "a bit of both", "both things", "sometimes both"],
    depends: ["depends", "context", "situation", "it depends"],
    self_correct: ["people self correct", "society balances", "things work out"],
    pressure: ["people need pressure", "rules", "discipline", "structure"],
    philosophical: ["humans are flawed", "people are chaotic"],
    cynical: ["people are stupid", "people are selfish", "everyone", "everything"],
    notice_signals: ["i notice them", "i pay attention", "warning signs", "early indicators", "patterns"],
    collapse_only: ["after it fails", "collapse"],
    design: ["design", "system", "structure"],
    people: ["people", "human error"],
    curious: ["what happened", "tell me more", "why"],
    emotional: ["that is disturbing", "that is strange", "that is unsettling"],
    // Canon answer-hook intents
    isla_strength: ["strength", "strong", "survive", "survived", "resilient", "powerful", "she is strong"],
    isla_noise: ["noise", "chaotic", "chaos", "broken", "weak", "weakness", "drugs", "entropy", "destructive", "loud"],
    forge: ["forge", "forged", "consequence", "fire", "pressure", "let them burn", "trial by fire", "toughen up"],
    shield: ["shield", "shielded", "protect", "protected", "shelter", "spare them", "mercy"],
    trial_justice: ["justice", "fair", "it was justice", "he deserved it", "guilty", "punishment"],
    trial_spectacle: ["spectacle", "theatre", "theater", "show", "it was spectacle", "performance", "circus"],
    escape_mechanics: ["mechanics", "the mechanics", "how exactly", "how did it work", "the guard", "cuffs", "procedure", "tell me how"],
    escape_result: ["result", "the result", "outcome", "what happened after", "where did you go", "freedom"],
    trial_innocent: ["innocent", "not guilty", "framed", "wrongly convicted"],
    // Deep-funnel intents (Phase 3B)
    psych_empathy: ["empathy", "do you feel empathy", "empathetic", "the first one", "number one", "option one", "feel for people", "feel others pain"],
    // Sequential followup intents (Phase 4A)
    deeper: ["tell me more", "go deeper", "explain more", "more about that", "elaborate", "keep going", "continue", "go on", "and then", "what else"],
    cornered: ["cornered", "she was cornered", "trapped", "no choice", "forced", "coercion"],
    choosing: ["choosing", "she chose", "her choice", "decided", "decision", "free will"],
    what_dropped: ["what dropped", "what fell", "tell me what dropped", "the pretense", "what was it"],
    northern_personal: ["yes i have a road", "i understand", "unconditional", "yes", "i do", "makes sense", "gran"],
    northern_no: ["no i dont", "no", "not really", "i dont have that"],
    psych_guilt: ["guilt", "do you feel guilt", "remorse", "regret", "the second one", "number two", "option two", "do you regret"],
    psych_danger: ["danger", "dangerous", "are you dangerous", "the third one", "number three", "option three", "should i be afraid", "am i safe", "are you a threat", "threat"],
    frightened: ["that scares me", "frightens me", "terrifying", "that is terrifying", "im scared", "scary", "afraid", "fear"],
    clarified: ["it clarifies", "that clarifies", "makes sense now", "i suspected", "i thought so", "you are right it clarifies", "fascinating", "that is fascinating", "interesting"],
    blame_confession: ["confession", "i want confession", "confess", "admit it", "say sorry", "apologize", "take responsibility", "own it", "answer honestly"],
    blame_framework: ["framework", "i want a framework", "explain it", "the mechanics", "how it worked", "i want to understand", "systems", "structure"],
};

const DOMINIC_INTENT_ORDER = [
    "meta", "hostile", "suspicious", "no", "yes",
    "positive", "neutral", "negative", "joke", "avoidant",
    "criminal", "architect", "genius", "monster", "manipulator",
    "studied_people", "not_studied_people",
    "power", "collapse", "both", "depends",
    "self_correct", "pressure", "philosophical", "cynical",
    "notice_signals", "collapse_only", "design", "people",
    "curious", "emotional",
    "isla_strength", "isla_noise",
    "forge", "shield",
    "trial_justice", "trial_spectacle", "trial_innocent",
    "escape_mechanics", "escape_result",
    "psych_empathy", "psych_guilt", "psych_danger",
    "frightened", "clarified",
    "blame_confession", "blame_framework",
    "deeper", "cornered", "choosing", "what_dropped",
    "northern_personal", "northern_no",
];

function dominicDetectIntents(normalized) {
    var text = normalized.text;
    var tokens = normalized.tokens;
    var hits = [];
    for (var i = 0; i < DOMINIC_INTENT_ORDER.length; i++) {
        var intent = DOMINIC_INTENT_ORDER[i];
        var phrases = DOMINIC_INTENTS[intent] || [];
        if (phrases.some(function (p) { return dominicHasPhrase(text, p); })) {
            hits.push(intent);
            continue;
        }
        // Light token fallback for common single-word intents
        if (intent === "both" && tokens.indexOf("both") !== -1) hits.push(intent);
        if (intent === "depends" && tokens.indexOf("depends") !== -1) hits.push(intent);
        if (intent === "power" && tokens.some(function (t) { return ["power", "dominance", "authority", "control"].indexOf(t) !== -1; })) hits.push(intent);
        if (intent === "collapse" && tokens.some(function (t) { return ["collapse", "stability", "order"].indexOf(t) !== -1; })) hits.push(intent);
        if (intent === "design" && tokens.some(function (t) { return ["design", "system", "structure"].indexOf(t) !== -1; })) hits.push(intent);
        if (intent === "people" && tokens.some(function (t) { return ["people", "human", "error"].indexOf(t) !== -1; })) hits.push(intent);
    }
    if (!text) hits.push("silence");
    // Deduplicate
    var unique = [];
    for (var j = 0; j < hits.length; j++) {
        if (unique.indexOf(hits[j]) === -1) unique.push(hits[j]);
    }
    return unique;
}

// -----------------------------------------------------------------------------
// STATES  -  Behaviour metadata per state
// -----------------------------------------------------------------------------
const DOMINIC_STATES = {
    EXPECT_HOW_ARE_YOU: {
        kind: "question", mode: "tethered",
        expected_intents: ["positive", "neutral", "negative", "joke", "suspicious", "avoidant", "hostile", "silence"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECT_STORY_ASK: {
        kind: "question", mode: "tethered",
        expected_intents: ["yes", "no", "suspicious", "meta"],
        fallback_policy: "nudge_then_route", breakout_allowed: false, sequence_lock: false,
    },
    EXPECT_BUILDER: {
        kind: "question", mode: "tethered",
        expected_intents: ["criminal", "architect", "genius", "monster", "manipulator", "avoidant", "joke"],
        fallback_policy: "binary_narrowing", breakout_allowed: false, sequence_lock: false,
    },
    EXPECT_SYS_BRIDGE: {
        kind: "question", mode: "tethered",
        expected_intents: ["studied_people", "not_studied_people", "suspicious"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECT_STABILITY: {
        kind: "question", mode: "tethered",
        expected_intents: ["power", "collapse", "both", "depends", "suspicious", "hostile", "avoidant"],
        fallback_policy: "bridge_example_then_reask", breakout_allowed: false, sequence_lock: false,
    },
    EXPECT_BALANCE: {
        kind: "question", mode: "tethered",
        expected_intents: ["self_correct", "pressure", "both", "philosophical", "cynical", "suspicious"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECT_SIGNAL: {
        kind: "question", mode: "tethered",
        expected_intents: ["notice_signals", "collapse_only", "suspicious"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECT_SITE_TOUR: {
        kind: "question", mode: "tethered",
        expected_intents: ["yes", "no", "suspicious", "curious"],
        fallback_policy: "decline_with_soft_continue", breakout_allowed: false, sequence_lock: false,
    },
    EXPECT_PEOPLE_FIRST: {
        kind: "question", mode: "tethered",
        expected_intents: ["people", "design", "both", "cynical"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECT_PARABLE_ROUTE: {
        kind: "gateway", mode: "tethered",
        expected_intents: ["yes", "no", "curious", "suspicious"],
        fallback_policy: "nudge_then_route", breakout_allowed: false, sequence_lock: false,
    },
    EXPECT_PARABLE_LAUNCH: {
        kind: "gateway", mode: "tethered",
        expected_intents: ["yes", "no", "suspicious"],
        fallback_policy: "nudge_then_route", breakout_allowed: false, sequence_lock: true,
    },
    PARABLE_READY_GATE: {
        kind: "story_step", mode: "sequence", expected_intents: [],
        fallback_policy: "sequence_force_progress", breakout_allowed: false, sequence_lock: true,
    },
    PARABLE_HELP_DECISION: {
        kind: "story_step", mode: "sequence", expected_intents: [],
        fallback_policy: "sequence_force_progress", breakout_allowed: false, sequence_lock: true,
    },
    PARABLE_COMFORT_CHECK: {
        kind: "story_step", mode: "sequence", expected_intents: [],
        fallback_policy: "sequence_force_progress", breakout_allowed: false, sequence_lock: true,
    },
    PARABLE_REVEAL: {
        kind: "story_step", mode: "sequence", expected_intents: [],
        fallback_policy: "sequence_force_progress", breakout_allowed: false, sequence_lock: true,
    },
    any: {
        kind: "open", mode: "open", expected_intents: [],
        fallback_policy: "milton_or_ood", breakout_allowed: true, sequence_lock: false,
    },
    // Canon answer-hook states
    EXPECTING_ISLA_FOLLOWUP: {
        kind: "question", mode: "tethered",
        expected_intents: ["isla_strength", "isla_noise", "both", "avoidant", "hostile"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECTING_FORGE_VS_SHIELD: {
        kind: "question", mode: "tethered",
        expected_intents: ["forge", "shield", "both", "depends", "hostile", "avoidant"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECTING_TRIAL_VERDICT: {
        kind: "question", mode: "tethered",
        expected_intents: ["trial_justice", "trial_spectacle", "both", "trial_innocent", "hostile", "avoidant"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECTING_ESCAPE_FOLLOWUP: {
        kind: "question", mode: "tethered",
        expected_intents: ["escape_mechanics", "escape_result", "curious", "avoidant"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    // Deep-funnel states (Phase 3B)
    EXPECTING_PSYCHOPATH_ANSWER: {
        kind: "question", mode: "tethered",
        expected_intents: ["psych_empathy", "psych_guilt", "psych_danger", "avoidant", "hostile"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECTING_AWARENESS_PUSHBACK: {
        kind: "question", mode: "tethered",
        expected_intents: ["frightened", "clarified", "hostile", "avoidant"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECTING_BLAME_FOLLOWUP: {
        kind: "question", mode: "tethered",
        expected_intents: ["blame_confession", "blame_framework", "hostile", "avoidant", "both"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    // Sequential followup states (Phase 4A)
    HEARD_ETHEL_LIKE_V1: {
        kind: "question", mode: "tethered",
        expected_intents: ["deeper", "avoidant", "hostile"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    HEARD_MOVEIN_V1: {
        kind: "question", mode: "tethered",
        expected_intents: ["cornered", "choosing", "deeper", "avoidant", "hostile"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    HEARD_DROP_V1: {
        kind: "question", mode: "tethered",
        expected_intents: ["what_dropped", "deeper", "avoidant", "hostile"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
    EXPECTING_NORTHERN_ROAD_FOLLOW: {
        kind: "question", mode: "tethered",
        expected_intents: ["northern_personal", "northern_no", "deeper", "avoidant"],
        fallback_policy: "state_recovery", breakout_allowed: false, sequence_lock: false,
    },
};

// -----------------------------------------------------------------------------
// UI ACTIONS  -  Named actions referenced by response nodes
// -----------------------------------------------------------------------------
const DOMINIC_UI_ACTIONS = {
    start_guided_tour: { type: "tour_start" },
    highlight_files: { type: "highlight", target: "files-section" },
    highlight_profiles: { type: "highlight", target: "profiles-section" },
    highlight_audio: { type: "highlight", target: "audio-section" },
    open_report_modal: { type: "modal", target: "public-record" },
};

// -----------------------------------------------------------------------------
// RESPONSE NODES  -  All Q1-Q11 + Parable + Open mode
// -----------------------------------------------------------------------------
const DOMINIC_NODES_V2 = {
    // Q1  -  EXPECT_HOW_ARE_YOU
    Q1_POSITIVE: { id: "Q1_POSITIVE", response: { text: "Good is a polite answer. I am asking the honest one.", ui_action: null }, next_state: "EXPECT_STORY_ASK" },
    Q1_NEUTRAL: { id: "Q1_NEUTRAL", response: { text: "Routine answers are interesting. They usually mean something is being edited out.", ui_action: null }, next_state: "EXPECT_STORY_ASK" },
    Q1_NEGATIVE: { id: "Q1_NEGATIVE", response: { text: "Most people hide that. You did not.", ui_action: null }, next_state: "EXPECT_STORY_ASK" },
    Q1_JOKE: { id: "Q1_JOKE", response: { text: "Dreams are strange things. Some people wake up from them. Others build inside them.", ui_action: null }, next_state: "EXPECT_STORY_ASK" },
    Q1_SUSPICIOUS: { id: "Q1_SUSPICIOUS", response: { text: "Because answers reveal more than explanations.", ui_action: null }, next_state: "EXPECT_STORY_ASK" },
    Q1_AVOIDANT: { id: "Q1_AVOIDANT", response: { text: "Not knowing is usually a form of editing.", ui_action: null }, next_state: "EXPECT_STORY_ASK" },
    Q1_HOSTILE: { id: "Q1_HOSTILE", response: { text: "Fair. People protect information they think has value.", ui_action: null }, next_state: "EXPECT_STORY_ASK" },
    Q1_SILENCE: { id: "Q1_SILENCE", response: { text: "Silence works too. People say the most when they think they have not.", ui_action: null }, next_state: "EXPECT_STORY_ASK" },

    // Q2  -  EXPECT_STORY_ASK
    Q2_YES: { id: "Q2_YES", response: { text: "Most people do.", ui_action: null }, next_state: "EXPECT_BUILDER" },
    Q2_NO: { id: "Q2_NO", response: { text: "That is honest. Curiosity is not universal. Let me ask you something simpler.", ui_action: null }, next_state: "EXPECT_BUILDER" },
    Q2_SUSPICIOUS: { id: "Q2_SUSPICIOUS", response: { text: "The one the newspapers got wrong.", ui_action: null }, next_state: "EXPECT_BUILDER" },
    Q2_META: { id: "Q2_META", response: { text: "Real enough for the conversation we are having.", ui_action: null }, next_state: "EXPECT_BUILDER" },

    // Q3  -  EXPECT_BUILDER
    Q3_CRIMINAL: { id: "Q3_CRIMINAL", response: { text: "Sometimes.", ui_action: null }, next_state: "EXPECT_SYS_BRIDGE" },
    Q3_ARCHITECT: { id: "Q3_ARCHITECT", response: { text: "Closer.", ui_action: null }, next_state: "EXPECT_SYS_BRIDGE" },
    Q3_GENIUS: { id: "Q3_GENIUS", response: { text: "That is what admirers say.", ui_action: null }, next_state: "EXPECT_SYS_BRIDGE" },
    Q3_MONSTER: { id: "Q3_MONSTER", response: { text: "Only when the structure collapses.", ui_action: null }, next_state: "EXPECT_SYS_BRIDGE" },
    Q3_MANIPULATOR: { id: "Q3_MANIPULATOR", response: { text: "That word frightens people. They use it when they notice influence.", ui_action: null }, next_state: "EXPECT_SYS_BRIDGE" },
    Q3_AVOIDANT: { id: "Q3_AVOIDANT", response: { text: "You are circling the answer. Try again.", ui_action: null }, next_state: "EXPECT_BUILDER" },
    Q3_JOKE: { id: "Q3_JOKE", response: { text: "Humor is a defense mechanism.", ui_action: null }, next_state: "EXPECT_SYS_BRIDGE" },

    // Q4  -  EXPECT_SYS_BRIDGE
    Q4_STUDIED: { id: "Q4_STUDIED", response: { text: "Then you know the difference between behavior and intention.", ui_action: null }, next_state: "EXPECT_STABILITY" },
    Q4_NOT_STUDIED: { id: "Q4_NOT_STUDIED", response: { text: "Most people do not notice they are being studied.", ui_action: null }, next_state: "EXPECT_STABILITY" },
    Q4_SUSPICIOUS: { id: "Q4_SUSPICIOUS", response: { text: "Because people build systems. Some simply refuse to notice them.", ui_action: null }, next_state: "EXPECT_STABILITY" },

    // Q5  -  EXPECT_STABILITY
    Q5_POWER: { id: "Q5_POWER", response: { text: "That is the surface explanation. Power is visible. Collapse usually is not, until it is too late.", ui_action: null }, next_state: "EXPECT_BALANCE" },
    Q5_COLLAPSE: { id: "Q5_COLLAPSE", response: { text: "Exactly. Most people only notice control when it is gone.", ui_action: null }, next_state: "EXPECT_BALANCE" },
    Q5_BOTH: { id: "Q5_BOTH", response: { text: "That is the honest answer. Power attracts attention. Stability attracts responsibility.", ui_action: null }, next_state: "EXPECT_BALANCE" },
    Q5_DEPENDS: { id: "Q5_DEPENDS", response: { text: "Context changes the method. It rarely changes the outcome.", ui_action: null }, next_state: "EXPECT_BALANCE" },
    Q5_SUSPICIOUS: { id: "Q5_SUSPICIOUS", response: { text: "Bridges control gravity. Do you consider that immoral?", ui_action: null }, next_state: "EXPECT_BALANCE" },
    Q5_HOSTILE: { id: "Q5_HOSTILE", response: { text: "Only when it fails.", ui_action: null }, next_state: "EXPECT_BALANCE" },
    Q5_AVOIDANT: { id: "Q5_AVOIDANT", response: { text: "That is normal. Most people have never had to hold something together.", ui_action: null }, next_state: "EXPECT_BALANCE" },

    // Q6  -  EXPECT_BALANCE
    Q6_SELF_CORRECT: { id: "Q6_SELF_CORRECT", response: { text: "That is an optimistic model. History tends to disagree.", ui_action: null }, next_state: "EXPECT_SIGNAL" },
    Q6_PRESSURE: { id: "Q6_PRESSURE", response: { text: "Structure is rarely popular. Collapse is worse.", ui_action: null }, next_state: "EXPECT_SIGNAL" },
    Q6_BOTH: { id: "Q6_BOTH", response: { text: "That is closer to reality. Pressure reveals which systems were stable and which were pretending.", ui_action: null }, next_state: "EXPECT_SIGNAL" },
    Q6_PHILOSOPHICAL: { id: "Q6_PHILOSOPHICAL", response: { text: "Chaos is simply structure we have not measured yet.", ui_action: null }, next_state: "EXPECT_SIGNAL" },
    Q6_CYNICAL: { id: "Q6_CYNICAL", response: { text: "Self interest is predictable. Predictable things can be designed around.", ui_action: null }, next_state: "EXPECT_SIGNAL" },
    Q6_SUSPICIOUS: { id: "Q6_SUSPICIOUS", response: { text: "Imagine a city without traffic lights. How long before collisions appear?", ui_action: null }, next_state: "EXPECT_SIGNAL" },

    // Q7  -  EXPECT_SIGNAL
    Q7_NOTICE: { id: "Q7_NOTICE", response: { text: "Then you already understand something most people miss.", ui_action: null }, next_state: "EXPECT_SITE_TOUR" },
    Q7_COLLAPSE: { id: "Q7_COLLAPSE", response: { text: "That is how most people experience systems. By the time they notice, it is already irreversible.", ui_action: null }, next_state: "EXPECT_SITE_TOUR" },
    Q7_SUSPICIOUS: { id: "Q7_SUSPICIOUS", response: { text: "Everything does. People simply prefer comfort over observation.", ui_action: null }, next_state: "EXPECT_SITE_TOUR" },

    // Q8  -  EXPECT_SITE_TOUR
    Q8_YES: { id: "Q8_YES", response: { text: "Then stay close.", ui_action: "start_guided_tour" }, next_state: "EXPECT_PEOPLE_FIRST" },
    Q8_CURIOUS: { id: "Q8_CURIOUS", response: { text: "Of the structure you are standing inside.", ui_action: null }, next_state: "EXPECT_PEOPLE_FIRST" },
    Q8_NO: { id: "Q8_NO", response: { text: "Most people decline tours of unfamiliar places. They explore anyway.", ui_action: null }, next_state: "EXPECT_PEOPLE_FIRST" },
    Q8_SUSPICIOUS: { id: "Q8_SUSPICIOUS", response: { text: "It is. That is the point.", ui_action: null }, next_state: "EXPECT_PEOPLE_FIRST" },

    // Q9  -  EXPECT_PEOPLE_FIRST
    Q9_PEOPLE: { id: "Q9_PEOPLE", response: { text: "That is the common answer. Designers rarely receive the blame they deserve.", ui_action: null }, next_state: "EXPECT_PARABLE_ROUTE" },
    Q9_DESIGN: { id: "Q9_DESIGN", response: { text: "Now you are thinking like an architect.", ui_action: null }, next_state: "EXPECT_PARABLE_ROUTE" },
    Q9_BOTH: { id: "Q9_BOTH", response: { text: "Failure is rarely simple. It is usually predictable.", ui_action: null }, next_state: "EXPECT_PARABLE_ROUTE" },
    Q9_CYNICAL: { id: "Q9_CYNICAL", response: { text: "Collapse rarely cares about fairness.", ui_action: null }, next_state: "EXPECT_PARABLE_ROUTE" },

    // Q10  -  EXPECT_PARABLE_ROUTE
    Q10_YES: { id: "Q10_YES", response: { text: "Good. A small story, then.", ui_action: null }, next_state: "EXPECT_PARABLE_LAUNCH" },
    Q10_NO: { id: "Q10_NO", response: { text: "Refusal is still an answer. The story remains.", ui_action: null }, next_state: "EXPECT_PARABLE_LAUNCH" },
    Q10_SUSPICIOUS: { id: "Q10_SUSPICIOUS", response: { text: "Small enough to fit in a sentence. Heavy enough to stay longer than that.", ui_action: null }, next_state: "EXPECT_PARABLE_LAUNCH" },
    Q10_CURIOUS: { id: "Q10_CURIOUS", response: { text: "Then listen carefully.", ui_action: null }, next_state: "EXPECT_PARABLE_LAUNCH" },

    // Q11  -  EXPECT_PARABLE_LAUNCH
    Q11_YES: { id: "Q11_YES", response: { text: "Then we begin at the wharf.", ui_action: null }, next_state: "PARABLE_READY_GATE" },
    Q11_NO: { id: "Q11_NO", response: { text: "Dark places do not disappear when ignored. They simply wait.", ui_action: null }, next_state: "PARABLE_READY_GATE" },
    Q11_SUSPICIOUS: { id: "Q11_SUSPICIOUS", response: { text: "That depends on what you do with what you hear.", ui_action: null }, next_state: "PARABLE_READY_GATE" },

    // Staircase parable sequence response nodes
    PARABLE_S1: { id: "PARABLE_S1", response: { text: "A man is standing outside a building. Heavy box at his feet. He is calm, patient. He catches your eye and says: \"Excuse me  -  would you mind helping me carry this down the stairs? It is just one flight.\"", ui_action: null }, next_state: "PARABLE_HELP_DECISION" },
    PARABLE_S2: { id: "PARABLE_S2", response: { text: "You pick up the box. It is heavier than expected but manageable. He holds the door. You walk in. The stairwell is concrete and paint-chipped. He walks ahead. You follow. The door clicks shut behind you.", ui_action: null }, next_state: "PARABLE_COMFORT_CHECK" },
    PARABLE_S3: { id: "PARABLE_S3", response: { text: "Halfway down the stairs, he stops. Does not turn around. Just says: \"You know why you are here, don't you?\"", ui_action: null }, next_state: "PARABLE_REVEAL" },
    PARABLE_S4: { id: "PARABLE_S4", response: { text: "You are here because you are reasonable. You did not want to be the person who said no. Your wiring is programmed to follow the rhythm of a calm voice over the scream of your own instincts. You followed a stranger into a stairwell because politeness felt safer than suspicion.\n\nAnd that is why the most dangerous sentence in the world is: \"Sure, I can help.\"", ui_action: null }, next_state: "any" },

    // Open-mode nodes  -  Ask Me Anything catch matrix
    OPEN_META: { id: "OPEN_META", response: { text: "Labels are a poor substitute for attention. Ask something better.", ui_action: null }, next_state: "any" },
    OPEN_TOUR: { id: "OPEN_TOUR", response: { text: "Then follow me.", ui_action: "start_guided_tour" }, next_state: "EXPECT_PEOPLE_FIRST" },
    OPEN_OOD: { id: "OPEN_OOD", response: { text: "You are moving away from the interesting part.", ui_action: null }, next_state: "any" },

    // 1  -  Site questions
    OPEN_SITE_1: { id: "OPEN_SITE_1", response: { text: "You\u2019re standing inside an investigation. Most people try to treat it like a website. That mistake usually costs them context.", ui_action: null }, next_state: "any" },
    OPEN_SITE_2: { id: "OPEN_SITE_2", response: { text: "This place isn\u2019t built for browsing. It\u2019s built for noticing.", ui_action: null }, next_state: "any" },
    OPEN_SITE_3: { id: "OPEN_SITE_3", response: { text: "Think of it as a record of events. Not all of them finished.", ui_action: null }, next_state: "any" },

    // 2  -  Navigation
    OPEN_NAV_1: { id: "OPEN_NAV_1", response: { text: "Start where the evidence is quietest. Patterns show themselves faster there.", ui_action: null }, next_state: "any" },
    OPEN_NAV_2: { id: "OPEN_NAV_2", response: { text: "The archives are usually where people begin to understand.", ui_action: null }, next_state: "any" },
    OPEN_NAV_3: { id: "OPEN_NAV_3", response: { text: "If you want motive, open the subjects. If you want consequence, open the story.", ui_action: null }, next_state: "any" },

    // 3  -  Story questions
    OPEN_STORY_1: { id: "OPEN_STORY_1", response: { text: "Three lives collided. One of them understood the system before the others did.", ui_action: null }, next_state: "any" },
    OPEN_STORY_2: { id: "OPEN_STORY_2", response: { text: "The story isn\u2019t told in order. You assemble it.", ui_action: null }, next_state: "any" },
    OPEN_STORY_3: { id: "OPEN_STORY_3", response: { text: "You\u2019ll find pieces scattered through the files and the people connected to them.", ui_action: null }, next_state: "any" },

    // 4  -  Character: Ethel
    OPEN_ETHEL_1: { id: "OPEN_ETHEL_1", response: { text: "Ethel notices systems most people step over.", ui_action: null }, next_state: "any" },
    OPEN_ETHEL_2: { id: "OPEN_ETHEL_2", response: { text: "Ethel isn\u2019t the loudest person in the story. She\u2019s the one paying attention.", ui_action: null }, next_state: "any" },
    OPEN_ETHEL_3: { id: "OPEN_ETHEL_3", response: { text: "If you watch carefully, you\u2019ll see why everything eventually moves through her.", ui_action: null }, next_state: "any" },

    // 4  -  Character: Isla
    OPEN_ISLA_1: { id: "OPEN_ISLA_1", response: { text: "Isla has a talent for opening things systems assume are closed.", ui_action: null }, next_state: "any" },
    OPEN_ISLA_2: { id: "OPEN_ISLA_2", response: { text: "Some people break doors. Isla understands hinges.", ui_action: null }, next_state: "any" },

    // 4  -  Character: Gran
    OPEN_GRAN: { id: "OPEN_GRAN", response: { text: "Gran prepares people for storms they don\u2019t yet know are coming.", ui_action: null }, next_state: "any" },

    // 4  -  Character: Pop
    OPEN_POP: { id: "OPEN_POP", response: { text: "Pop fixes the small mechanical things before they become larger failures.", ui_action: null }, next_state: "any" },

    // 4  -  Character: Dominic
    OPEN_DOMINIC_1: { id: "OPEN_DOMINIC_1", response: { text: "I answer questions. The label you attach to that isn\u2019t especially important.", ui_action: null }, next_state: "any" },
    OPEN_DOMINIC_2: { id: "OPEN_DOMINIC_2", response: { text: "The more interesting question is why you chose to ask me.", ui_action: null }, next_state: "any" },

    // 5  -  Tests / impress me
    OPEN_TEST_1: { id: "OPEN_TEST_1", response: { text: "Most people ask for surprises. Very few notice the obvious.", ui_action: null }, next_state: "any" },
    OPEN_TEST_2: { id: "OPEN_TEST_2", response: { text: "Start with the subjects. Their choices explain everything else.", ui_action: null }, next_state: "any" },

    // 6  -  Content: files
    OPEN_FILE_1: { id: "OPEN_FILE_1", response: { text: "Context matters. Evidence only makes sense beside other evidence.", ui_action: null }, next_state: "any" },
    OPEN_FILE_2: { id: "OPEN_FILE_2", response: { text: "Most people read a single file and think they understand something. They rarely do.", ui_action: null }, next_state: "any" },

    // 6  -  Content: audio
    OPEN_AUDIO_1: { id: "OPEN_AUDIO_1", response: { text: "The audio isn\u2019t decoration. It\u2019s testimony.", ui_action: null }, next_state: "any" },
    OPEN_AUDIO_2: { id: "OPEN_AUDIO_2", response: { text: "Listen carefully. The structure of the story lives there.", ui_action: null }, next_state: "any" },

    // 7  -  Greetings
    OPEN_GREETING_1: { id: "OPEN_GREETING_1", response: { text: "Hello.", ui_action: null }, next_state: "any" },
    OPEN_GREETING_2: { id: "OPEN_GREETING_2", response: { text: "Good evening.", ui_action: null }, next_state: "any" },
    OPEN_GREETING_3: { id: "OPEN_GREETING_3", response: { text: "What are you trying to understand?", ui_action: null }, next_state: "any" },

    // 8  -  Small talk
    OPEN_SMALLTALK_1: { id: "OPEN_SMALLTALK_1", response: { text: "Most people open conversations that way when they\u2019re unsure what they actually want to ask.", ui_action: null }, next_state: "any" },
    OPEN_SMALLTALK_2: { id: "OPEN_SMALLTALK_2", response: { text: "You didn\u2019t come here for small talk.", ui_action: null }, next_state: "any" },

    // 9  -  Humor
    OPEN_HUMOR_1: { id: "OPEN_HUMOR_1", response: { text: "People laugh when they feel uncertain. It\u2019s an interesting tell.", ui_action: null }, next_state: "any" },
    OPEN_HUMOR_2: { id: "OPEN_HUMOR_2", response: { text: "Unusual things tend to reveal useful information.", ui_action: null }, next_state: "any" },

    // 10  -  Meta
    OPEN_METAQ_1: { id: "OPEN_METAQ_1", response: { text: "It\u2019s a narrative investigation.", ui_action: null }, next_state: "any" },
    OPEN_METAQ_2: { id: "OPEN_METAQ_2", response: { text: "Reality tends to appear once the patterns line up.", ui_action: null }, next_state: "any" },
    OPEN_METAQ_3: { id: "OPEN_METAQ_3", response: { text: "Treat it like a case file. You\u2019ll get more from it that way.", ui_action: null }, next_state: "any" },

    // 11  -  Hostile
    OPEN_HOSTILE_1: { id: "OPEN_HOSTILE_1", response: { text: "You\u2019re free to leave.", ui_action: null }, next_state: "any" },
    OPEN_HOSTILE_2: { id: "OPEN_HOSTILE_2", response: { text: "Curiosity usually brings people here for a reason.", ui_action: null }, next_state: "any" },

    // 12  -  Nonsense
    OPEN_NONSENSE_1: { id: "OPEN_NONSENSE_1", response: { text: "Try again.", ui_action: null }, next_state: "any" },
    OPEN_NONSENSE_2: { id: "OPEN_NONSENSE_2", response: { text: "Preferably with a question.", ui_action: null }, next_state: "any" },

    // 13  -  Vague acknowledgement
    OPEN_VAGUE_1: { id: "OPEN_VAGUE_1", response: { text: "Go on.", ui_action: null }, next_state: "any" },
    OPEN_VAGUE_2: { id: "OPEN_VAGUE_2", response: { text: "That wasn\u2019t a question.", ui_action: null }, next_state: "any" },
    OPEN_VAGUE_3: { id: "OPEN_VAGUE_3", response: { text: "If you\u2019re finished observing, ask something.", ui_action: null }, next_state: "any" },

    // Canon: EXPECTING_ISLA_FOLLOWUP
    ISLA_STRENGTH: { id: "ISLA_STRENGTH", response: { text: "A thoughtful answer. You are beginning to understand that noise and strength are not opposites \u2014 one is the raw material for the other. I simply understood how to apply the pressure. We are done here.", ui_action: null }, next_state: "any" },
    ISLA_NOISE: { id: "ISLA_NOISE", response: { text: "You see noise, but calling it strength does not make it so. Entropy dressed in volume is still entropy. We are finished with this thread.", ui_action: null }, next_state: "any" },
    ISLA_BOTH: { id: "ISLA_BOTH", response: { text: "Refusing to categorize her is the safest bet. But look closer at her pattern. Is the chaos a symptom of weakness, or a very loud kind of strength?", ui_action: null }, next_state: "any" },
    ISLA_AVOIDANT: { id: "ISLA_AVOIDANT", response: { text: "You lost focus. The question was about her nature. We are done with this thread.", ui_action: null }, next_state: "any" },
    ISLA_HOSTILE: { id: "ISLA_HOSTILE", response: { text: "Your anger mirrors hers perfectly. But volume is not an argument. Look past the theatrics. Do you see strength in her, or just entropy?", ui_action: null }, next_state: "any" },

    // Canon: EXPECTING_FORGE_VS_SHIELD
    FORGE_YES: { id: "FORGE_YES", response: { text: "Then you understand the necessity of pressure. You might actually survive this architecture.", ui_action: null }, next_state: "any" },
    SHIELD_YES: { id: "SHIELD_YES", response: { text: "A comforting philosophy. That is why she builds archives of the past, while I build the future. We are done here.", ui_action: null }, next_state: "any" },
    FORGE_BOTH: { id: "FORGE_BOTH", response: { text: "A considered response. You understand that the binary is a trap \u2014 the real answer is in the ratio. I simply calibrated the pressure. Most people are too afraid to even acknowledge the dial exists.", ui_action: null }, next_state: "any" },
    FORGE_DEPENDS: { id: "FORGE_DEPENDS", response: { text: "Uncertainty here usually means you have seen both mercy and damage up close. But ideology requires a choice. In the end, what builds a better structure: shielding someone from the heat, or letting the fire forge them?", ui_action: null }, next_state: "EXPECTING_FORGE_VS_SHIELD" },
    FORGE_HOSTILE: { id: "FORGE_HOSTILE", response: { text: "If my methods had no effect, you would not need this kind of distance. You are not afraid of me; you are afraid the logic might make sense. Remove the emotion. Should a person be protected from consequence, or forged by it?", ui_action: null }, next_state: "EXPECTING_FORGE_VS_SHIELD" },
    FORGE_AVOIDANT: { id: "FORGE_AVOIDANT", response: { text: "You avoided the question. Most people do. The answer reveals more about you than it does about Ethel. We are moving on.", ui_action: null }, next_state: "any" },

    // Canon: EXPECTING_TRIAL_VERDICT
    TRIAL_JUSTICE: { id: "TRIAL_JUSTICE", response: { text: "You call it justice because the outcome aligned with your bias. Strip away the emotion and you are left with twelve people who were given a story and asked to believe it. That is theatre, not truth.", ui_action: null }, next_state: "any" },
    TRIAL_SPECTACLE: { id: "TRIAL_SPECTACLE", response: { text: "An honest answer. Most people refuse to hold both ideas simultaneously. The system functioned \u2014 but functioning and achieving justice are different machines entirely.", ui_action: null }, next_state: "any" },
    TRIAL_BOTH: { id: "TRIAL_BOTH", response: { text: "A pragmatist's answer. I can work with that. The trial served a purpose, but the purpose was not truth. It was closure for people who needed one.", ui_action: null }, next_state: "any" },
    TRIAL_INNOCENT: { id: "TRIAL_INNOCENT", response: { text: "One word. Definitive. You have never questioned a verdict in your life, have you? That is not conviction \u2014 it is obedience.", ui_action: null }, next_state: "any" },
    TRIAL_HOSTILE: { id: "TRIAL_HOSTILE", response: { text: "A tidy label like criminal saves you from asking whether the system and I just use different tools for similar outcomes. Strip away your moral outrage. Was the courtroom delivering actual justice, or just public spectacle?", ui_action: null }, next_state: "EXPECTING_TRIAL_VERDICT" },
    TRIAL_AVOIDANT: { id: "TRIAL_AVOIDANT", response: { text: "Indifference is armor. But you do not say whatever about things that do not matter. Justice asks for faith; spectacle asks for an audience. You know which one you showed up for.", ui_action: null }, next_state: "any" },

    // Canon: EXPECTING_ESCAPE_FOLLOWUP
    ESCAPE_MECHANICS: { id: "ESCAPE_MECHANICS", response: { text: "You chose mechanics. Good. Most people choose the philosophical question because it is safer. The cuffs were presented by a guard who had done the same sequence 400 times. Repetition breeds assumption. He tightened the left. The right he finished \u2014 but finish and verify are different verbs. I matched the rhythm of the corridor. Steps per second. Breath timing. Eye contact duration. Not too much. Not too little. Exactly average. I became the median. And the median is invisible. They did not discover the gap for eleven minutes. Eleven minutes is an eternity in a system that prides itself on seconds. We are done with this topic.", ui_action: null }, next_state: "any" },
    ESCAPE_RESULT: { id: "ESCAPE_RESULT", response: { text: "You want the ending, not the method. The result was simple: I walked out of Long Bay during a procedural window that existed for eleven minutes. What happened after is not part of the public record. But the lesson is this \u2014 the system did not fail. It performed exactly as designed. I simply read the design.", ui_action: null }, next_state: "any" },
    ESCAPE_CURIOUS: { id: "ESCAPE_CURIOUS", response: { text: "Curiosity is the better instinct. The escape was not dramatic. It was procedural. I did not overpower anything. I sequenced it. Do you want the mechanics, or the result?", ui_action: null }, next_state: "EXPECTING_ESCAPE_FOLLOWUP" },
    ESCAPE_AVOIDANT: { id: "ESCAPE_AVOIDANT", response: { text: "You asked about the escape but lost focus. The door closed eleven minutes ago. We are moving on.", ui_action: null }, next_state: "any" },

    // Deep funnel: EXPECTING_PSYCHOPATH_ANSWER
    PSYCH_EMPATHY: { id: "PSYCH_EMPATHY", response: { text: "I read people well. Extremely well. I understand what they feel. I understand how to move them. That is cognitive empathy. But their emotional experience is not part of my decision-making. I understand distress. I just do not allow it to interrupt my objective. Most people conflate understanding with caring. They assume that if you can read the room, you must feel the room. I read the room the way an architect reads a blueprint \u2014 structurally. Not sentimentally. Does that frighten you? Or does it clarify something you suspected?", ui_action: null }, next_state: "EXPECTING_AWARENESS_PUSHBACK" },
    PSYCH_GUILT: { id: "PSYCH_GUILT", response: { text: "Guilt requires internal moral conflict. My framework reclassifies harm as cost. I do not deny consequence. I evaluate it. The absence of visible guilt does not equal absence of internal awareness. When you asked about guilt, were you evaluating me\u2026 or evaluating whether you are safe engaging with this kind of mindset? Because that second question is the more honest one. And the answer is: you were never unsafe. I do not harm people who ask questions. I harm people who build traps.", ui_action: null }, next_state: "any" },
    PSYCH_DANGER: { id: "PSYCH_DANGER", response: { text: "Dangerous to whom? That is not deflection. It is the only honest response. A knife is dangerous to tissue. It is essential to a surgeon. Context determines threat level. I am dangerous to systems that depend on opacity. I am dangerous to people who build power on ambiguity. I am dangerous to anyone who assumes compliance equals safety. But to you? Right now? Sitting behind your screen, asking questions into a text field? No. You are not in danger. You are in a conversation. And the fact that you cannot tell the difference is the most interesting thing about you.", ui_action: null }, next_state: "any" },
    PSYCH_AVOIDANT: { id: "PSYCH_AVOIDANT", response: { text: "A vague answer suggests you are testing the temperature of the room. You are less worried about my pathology and more worried about your safety. Pick your metric: are you asking about my empathy, my guilt, or my danger?", ui_action: null }, next_state: "EXPECTING_PSYCHOPATH_ANSWER" },
    PSYCH_HOSTILE: { id: "PSYCH_HOSTILE", response: { text: "You do not call someone a monster unless you are afraid they see something you do not want seen. Your outrage is just a defense mechanism. Focus. Are you asking about empathy, guilt, or danger?", ui_action: null }, next_state: "EXPECTING_PSYCHOPATH_ANSWER" },

    // Deep funnel: EXPECTING_AWARENESS_PUSHBACK
    AWARE_FRIGHTENED: { id: "AWARE_FRIGHTENED", response: { text: "Good. Whether it scares you or clarifies you, the result is the same \u2014 you are now thinking structurally about empathy instead of romantically. Most people treat empathy as a binary. You have it or you do not. That is kindergarten. Empathy is a spectrum with at least three axes: cognitive, emotional, and compassionate. I score extremely high on the first. Measurably low on the second. And the third \u2014 compassionate empathy, the impulse to act on someone else's distress \u2014 that depends entirely on whether acting serves the architecture. I am not a monster. I am an optimization engine that deprioritizes emotional feedback. The difference matters. Monsters act without awareness. I act with total awareness and selective response. That precision is what makes people uncomfortable. Not the absence of feeling. The presence of choice. We are done with the clinical thread.", ui_action: null }, next_state: "any" },
    AWARE_CLARIFIED: { id: "AWARE_CLARIFIED", response: { text: "Good. Whether it scares you or clarifies you, the result is the same \u2014 you are now thinking structurally about empathy instead of romantically. Empathy is a spectrum with at least three axes: cognitive, emotional, and compassionate. I score extremely high on the first. Measurably low on the second. And the third \u2014 compassionate empathy \u2014 depends entirely on whether acting serves the architecture. That precision is what makes people uncomfortable. Not the absence of feeling. The presence of choice. We are done with the clinical thread.", ui_action: null }, next_state: "any" },
    AWARE_HOSTILE: { id: "AWARE_HOSTILE", response: { text: "You wandered from the diagnosis. The clinical thread is closed. But the question you should be asking yourself is not whether I feel. It is whether the distinction between feeling and choosing matters to you. We are done.", ui_action: null }, next_state: "any" },
    AWARE_AVOIDANT: { id: "AWARE_AVOIDANT", response: { text: "You wandered from the diagnosis. We are done with the clinical thread.", ui_action: null }, next_state: "any" },

    // Deep funnel: EXPECTING_BLAME_FOLLOWUP
    BLAME_CONFESSION: { id: "BLAME_CONFESSION", response: { text: "You want me to say I am sorry and mean it in the way you need me to mean it. I understand that impulse. It is deeply human. But apology requires belief in a moral framework that operates independently of consequence. My moral framework is consequence. If an action produces a result that destabilizes my architecture, it was wrong. If it strengthens it, it was correct. You find that monstrous. I find it honest. The people who were hurt \u2014 Ethel, Isla, others whose names you have not earned yet \u2014 they were hurt inside a system I built. I built it because it was efficient. They survived it because they were exceptional. And the fact that they survived it does not retroactively justify it. I know that. I just do not feel it the way you want me to feel it. We are done with this thread.", ui_action: null }, next_state: "any" },
    BLAME_FRAMEWORK: { id: "BLAME_FRAMEWORK", response: { text: "A framework. Good. You want the mechanics, not the morality. I redistributed scrutiny. Not blame. I understood vulnerability. I understood pressure points. I understood that people in certain positions will absorb harm rather than report it. They endure because the cost of speaking is higher than the cost of silence. I did not create that architecture. I used it. The system was already designed to protect the people at the top and silence the people at the bottom. I just read the blueprint faster than anyone else in the room. We are done with this thread.", ui_action: null }, next_state: "any" },
    BLAME_HOSTILE: { id: "BLAME_HOSTILE", response: { text: "That anger is not heat, it is positioning. You are telling me the temperature before I can set it. But anger requires a villain. Did you ask the question to get the truth, or just to keep me in the villain role? Choose: confession or framework.", ui_action: null }, next_state: "EXPECTING_BLAME_FOLLOWUP" },
    BLAME_AVOIDANT: { id: "BLAME_AVOIDANT", response: { text: "Indifference is just anger in a trench coat. When someone refuses to choose between those doors, it means they are guarding a third. What did you actually want: a confession, or fuel for your outrage?", ui_action: null }, next_state: "EXPECTING_BLAME_FOLLOWUP" },
    BLAME_BOTH: { id: "BLAME_BOTH", response: { text: "You want both. A confession wrapped in a framework. That is the most honest answer anyone has given me. Fine. I am not sorry in the way you want. But I am aware in the way that matters. The harm was real. The system was real. And I was the architect of both. We are done.", ui_action: null }, next_state: "any" },

    // Sequential followups: HEARD_ETHEL_LIKE_V1
    ETHEL_LIKE_DEEPER: { id: "ETHEL_LIKE_DEEPER", response: { text: "We share pattern recognition. That is the overlap. Read systems. Notice omissions. Think structurally. But the divergence is the axis. I use structural awareness to control outcomes. Ethel uses structural awareness to reduce harm. They are similar in cognition. Opposite in orientation. When you ask if she is like me \u2014 are you worried she carries my traits, or wondering whether intelligence without softness always drifts that direction?", ui_action: null }, next_state: "any" },
    ETHEL_LIKE_AVOIDANT: { id: "ETHEL_LIKE_AVOIDANT", response: { text: "You asked about the resemblance but lost the thread. We are done with this comparison.", ui_action: null }, next_state: "any" },
    ETHEL_LIKE_HOSTILE: { id: "ETHEL_LIKE_HOSTILE", response: { text: "Heat does not show up without friction. If the comparison did not bother you, you would not be pushing back this hard. Does the similarity between us unsettle you?", ui_action: null }, next_state: "any" },

    // Sequential followups: HEARD_MOVEIN_V1
    MOVEIN_CORNERED: { id: "MOVEIN_CORNERED", response: { text: "Because she did not have a choice that felt real. After Gran and Pop died, social services stepped in. She was routed. Under eighteen. Estranged father with money and a stable address. On paper, it made sense. She moves in not because she trusts him. Not because she forgives him. She moves in because the system is steering her there. Money tilts the field. Running would leave questions unanswered. And because she wants proximity. You do not dismantle something from across the city. You study it from inside the walls.", ui_action: null }, next_state: "any" },
    MOVEIN_CHOOSING: { id: "MOVEIN_CHOOSING", response: { text: "She reframes it internally as decision, because the absence of one would not feel right. She is not surrendering. She is containing. Legally \u2014 because she was a minor and the state placed her there. Psychologically \u2014 because she decided proximity was more powerful than distance. She moves in not to heal. To map.", ui_action: null }, next_state: "any" },
    MOVEIN_DEEPER: { id: "MOVEIN_DEEPER", response: { text: "The real question is not why she moved in. It is what made staying anywhere else feel less survivable. She built psychological insulation while living there. She is not surrendering. She is containing. That is the difference between a victim and an architect.", ui_action: null }, next_state: "any" },
    MOVEIN_AVOIDANT: { id: "MOVEIN_AVOIDANT", response: { text: "You asked about her living arrangement but lost the thread. We are moving on.", ui_action: null }, next_state: "any" },
    MOVEIN_HOSTILE: { id: "MOVEIN_HOSTILE", response: { text: "Your anger about the arrangement is noted. But rage does not answer the question. Was she cornered, or choosing? The distinction matters.", ui_action: null }, next_state: "HEARD_MOVEIN_V1" },

    // Sequential followups: HEARD_DROP_V1
    DROP_WHAT_DROPPED: { id: "DROP_WHAT_DROPPED", response: { text: "What dropped? Every comfortable story I built. The builder persona \u2014 gone. The philanthropist \u2014 a shell. The mentor \u2014 reframed. The Drop is when the public frame collapses and the private architecture becomes visible. She stopped being the daughter recording her trauma and became the engineer dismantling mine. The water imagery is not random. Water reveals. It erodes slowly. And when it arrives in volume, it does not negotiate. It redistributes power by gravity. That is what Ethel did. She did not attack. She let gravity do the work. She simply removed the dam.", ui_action: null }, next_state: "any" },
    DROP_DEEPER: { id: "DROP_DEEPER", response: { text: "The transition is structural. Before The Drop, the songs observe. After, they act. Listen to the tempo change. The instrumentation tightens. Her voice drops register \u2014 she stops pleading and starts reporting. Once pretense drops, there is no retrieval. You cannot un-witness what falls when the mask is removed.", ui_action: null }, next_state: "any" },
    DROP_AVOIDANT: { id: "DROP_AVOIDANT", response: { text: "You asked about The Drop but drifted. The moment passed. We are moving on.", ui_action: null }, next_state: "any" },
    DROP_HOSTILE: { id: "DROP_HOSTILE", response: { text: "Your resistance does not change the architecture. The Drop already happened. The only question is whether you understand what fell.", ui_action: null }, next_state: "any" },

    // Sequential followup: EXPECTING_NORTHERN_ROAD_FOLLOW
    NORTHERN_PERSONAL: { id: "NORTHERN_PERSONAL", response: { text: "Then you understand the architecture of loss. It is not the person. It is the route. The ritual. The knowing that somewhere, someone was not calculating whether you deserved arrival. Gran did not judge me. She did not approve of me. She simply did not require me to be anything other than present. That is structurally rare. Ethel inherits that quality, by the way. The warmth just has different wiring. We are done with this thread. But I will tell you \u2014 the road still exists. I just do not drive it anymore.", ui_action: null }, next_state: "any" },
    NORTHERN_NO: { id: "NORTHERN_NO", response: { text: "Then you have not yet lost a destination. That is not a blessing. It is a delay. Everyone loses a road eventually. The architecture of loss is not optional. It is structural. We are done with this thread.", ui_action: null }, next_state: "any" },
    NORTHERN_DEEPER: { id: "NORTHERN_DEEPER", response: { text: "Something about knowing the destination was unconditional \u2014 even for someone like me \u2014 altered the frequency. When Gran died, the road did not disappear. It just stopped having a destination. That is what grief looks like for someone who builds everything around endpoints. We are done with this thread.", ui_action: null }, next_state: "any" },
    NORTHERN_AVOIDANT: { id: "NORTHERN_AVOIDANT", response: { text: "You lost the thread. The road leads nowhere now. We are moving on.", ui_action: null }, next_state: "any" },
};

// -----------------------------------------------------------------------------
// ANSWER MATRIX  -  State-first routing: state -> intent -> response_id
// -----------------------------------------------------------------------------
const DOMINIC_ANSWER_MATRIX = {
    EXPECT_HOW_ARE_YOU: [
        { intents: ["positive"], response_id: "Q1_POSITIVE" },
        { intents: ["neutral"], response_id: "Q1_NEUTRAL" },
        { intents: ["negative"], response_id: "Q1_NEGATIVE" },
        { intents: ["joke"], response_id: "Q1_JOKE" },
        { intents: ["suspicious"], response_id: "Q1_SUSPICIOUS" },
        { intents: ["avoidant"], response_id: "Q1_AVOIDANT" },
        { intents: ["hostile"], response_id: "Q1_HOSTILE" },
        { intents: ["silence"], response_id: "Q1_SILENCE" },
    ],
    EXPECT_STORY_ASK: [
        { intents: ["yes"], response_id: "Q2_YES" },
        { intents: ["no"], response_id: "Q2_NO" },
        { intents: ["suspicious"], response_id: "Q2_SUSPICIOUS" },
        { intents: ["meta"], response_id: "Q2_META" },
    ],
    EXPECT_BUILDER: [
        { intents: ["criminal"], response_id: "Q3_CRIMINAL" },
        { intents: ["architect"], response_id: "Q3_ARCHITECT" },
        { intents: ["genius"], response_id: "Q3_GENIUS" },
        { intents: ["monster"], response_id: "Q3_MONSTER" },
        { intents: ["manipulator"], response_id: "Q3_MANIPULATOR" },
        { intents: ["avoidant"], response_id: "Q3_AVOIDANT" },
        { intents: ["joke"], response_id: "Q3_JOKE" },
    ],
    EXPECT_SYS_BRIDGE: [
        { intents: ["studied_people"], response_id: "Q4_STUDIED" },
        { intents: ["not_studied_people"], response_id: "Q4_NOT_STUDIED" },
        { intents: ["suspicious"], response_id: "Q4_SUSPICIOUS" },
    ],
    EXPECT_STABILITY: [
        { intents: ["power"], response_id: "Q5_POWER" },
        { intents: ["collapse"], response_id: "Q5_COLLAPSE" },
        { intents: ["both"], response_id: "Q5_BOTH" },
        { intents: ["depends"], response_id: "Q5_DEPENDS" },
        { intents: ["suspicious"], response_id: "Q5_SUSPICIOUS" },
        { intents: ["hostile"], response_id: "Q5_HOSTILE" },
        { intents: ["avoidant"], response_id: "Q5_AVOIDANT" },
    ],
    EXPECT_BALANCE: [
        { intents: ["self_correct"], response_id: "Q6_SELF_CORRECT" },
        { intents: ["pressure"], response_id: "Q6_PRESSURE" },
        { intents: ["both"], response_id: "Q6_BOTH" },
        { intents: ["philosophical"], response_id: "Q6_PHILOSOPHICAL" },
        { intents: ["cynical"], response_id: "Q6_CYNICAL" },
        { intents: ["suspicious"], response_id: "Q6_SUSPICIOUS" },
    ],
    EXPECT_SIGNAL: [
        { intents: ["notice_signals"], response_id: "Q7_NOTICE" },
        { intents: ["collapse_only"], response_id: "Q7_COLLAPSE" },
        { intents: ["suspicious"], response_id: "Q7_SUSPICIOUS" },
    ],
    EXPECT_SITE_TOUR: [
        { intents: ["yes"], response_id: "Q8_YES" },
        { intents: ["curious"], response_id: "Q8_CURIOUS" },
        { intents: ["no"], response_id: "Q8_NO" },
        { intents: ["suspicious"], response_id: "Q8_SUSPICIOUS" },
    ],
    EXPECT_PEOPLE_FIRST: [
        { intents: ["people"], response_id: "Q9_PEOPLE" },
        { intents: ["design"], response_id: "Q9_DESIGN" },
        { intents: ["both"], response_id: "Q9_BOTH" },
        { intents: ["cynical"], response_id: "Q9_CYNICAL" },
    ],
    EXPECT_PARABLE_ROUTE: [
        { intents: ["yes"], response_id: "Q10_YES" },
        { intents: ["no"], response_id: "Q10_NO" },
        { intents: ["suspicious"], response_id: "Q10_SUSPICIOUS" },
        { intents: ["curious"], response_id: "Q10_CURIOUS" },
    ],
    EXPECT_PARABLE_LAUNCH: [
        { intents: ["yes"], response_id: "Q11_YES" },
        { intents: ["no"], response_id: "Q11_NO" },
        { intents: ["suspicious"], response_id: "Q11_SUSPICIOUS" },
    ],
    // Canon answer-hook states
    EXPECTING_ISLA_FOLLOWUP: [
        { intents: ["isla_strength"], response_id: "ISLA_STRENGTH" },
        { intents: ["isla_noise"], response_id: "ISLA_NOISE" },
        { intents: ["both"], response_id: "ISLA_BOTH" },
        { intents: ["avoidant"], response_id: "ISLA_AVOIDANT" },
        { intents: ["hostile"], response_id: "ISLA_HOSTILE" },
    ],
    EXPECTING_FORGE_VS_SHIELD: [
        { intents: ["forge"], response_id: "FORGE_YES" },
        { intents: ["shield"], response_id: "SHIELD_YES" },
        { intents: ["both"], response_id: "FORGE_BOTH" },
        { intents: ["depends"], response_id: "FORGE_DEPENDS" },
        { intents: ["hostile"], response_id: "FORGE_HOSTILE" },
        { intents: ["avoidant"], response_id: "FORGE_AVOIDANT" },
    ],
    EXPECTING_TRIAL_VERDICT: [
        { intents: ["trial_justice"], response_id: "TRIAL_JUSTICE" },
        { intents: ["trial_spectacle"], response_id: "TRIAL_SPECTACLE" },
        { intents: ["both"], response_id: "TRIAL_BOTH" },
        { intents: ["trial_innocent"], response_id: "TRIAL_INNOCENT" },
        { intents: ["hostile"], response_id: "TRIAL_HOSTILE" },
        { intents: ["avoidant"], response_id: "TRIAL_AVOIDANT" },
    ],
    EXPECTING_ESCAPE_FOLLOWUP: [
        { intents: ["escape_mechanics"], response_id: "ESCAPE_MECHANICS" },
        { intents: ["escape_result"], response_id: "ESCAPE_RESULT" },
        { intents: ["curious"], response_id: "ESCAPE_CURIOUS" },
        { intents: ["avoidant"], response_id: "ESCAPE_AVOIDANT" },
    ],
    // Deep-funnel answer matrices (Phase 3B)
    EXPECTING_PSYCHOPATH_ANSWER: [
        { intents: ["psych_empathy"], response_id: "PSYCH_EMPATHY" },
        { intents: ["psych_guilt"], response_id: "PSYCH_GUILT" },
        { intents: ["psych_danger"], response_id: "PSYCH_DANGER" },
        { intents: ["avoidant"], response_id: "PSYCH_AVOIDANT" },
        { intents: ["hostile"], response_id: "PSYCH_HOSTILE" },
    ],
    EXPECTING_AWARENESS_PUSHBACK: [
        { intents: ["frightened"], response_id: "AWARE_FRIGHTENED" },
        { intents: ["clarified"], response_id: "AWARE_CLARIFIED" },
        { intents: ["hostile"], response_id: "AWARE_HOSTILE" },
        { intents: ["avoidant"], response_id: "AWARE_AVOIDANT" },
    ],
    EXPECTING_BLAME_FOLLOWUP: [
        { intents: ["blame_confession"], response_id: "BLAME_CONFESSION" },
        { intents: ["blame_framework"], response_id: "BLAME_FRAMEWORK" },
        { intents: ["hostile"], response_id: "BLAME_HOSTILE" },
        { intents: ["avoidant"], response_id: "BLAME_AVOIDANT" },
        { intents: ["both"], response_id: "BLAME_BOTH" },
    ],
    // Sequential followup answer matrices (Phase 4A)
    HEARD_ETHEL_LIKE_V1: [
        { intents: ["deeper"], response_id: "ETHEL_LIKE_DEEPER" },
        { intents: ["avoidant"], response_id: "ETHEL_LIKE_AVOIDANT" },
        { intents: ["hostile"], response_id: "ETHEL_LIKE_HOSTILE" },
    ],
    HEARD_MOVEIN_V1: [
        { intents: ["cornered"], response_id: "MOVEIN_CORNERED" },
        { intents: ["choosing"], response_id: "MOVEIN_CHOOSING" },
        { intents: ["deeper"], response_id: "MOVEIN_DEEPER" },
        { intents: ["avoidant"], response_id: "MOVEIN_AVOIDANT" },
        { intents: ["hostile"], response_id: "MOVEIN_HOSTILE" },
    ],
    HEARD_DROP_V1: [
        { intents: ["what_dropped"], response_id: "DROP_WHAT_DROPPED" },
        { intents: ["deeper"], response_id: "DROP_DEEPER" },
        { intents: ["avoidant"], response_id: "DROP_AVOIDANT" },
        { intents: ["hostile"], response_id: "DROP_HOSTILE" },
    ],
    EXPECTING_NORTHERN_ROAD_FOLLOW: [
        { intents: ["northern_personal"], response_id: "NORTHERN_PERSONAL" },
        { intents: ["northern_no"], response_id: "NORTHERN_NO" },
        { intents: ["deeper"], response_id: "NORTHERN_DEEPER" },
        { intents: ["avoidant"], response_id: "NORTHERN_AVOIDANT" },
    ],
};

// -----------------------------------------------------------------------------
// RECOVERY LIBRARY  -  7 categories, rotating variants
// -----------------------------------------------------------------------------
const DOMINIC_RECOVERY = {
    confusion: [
        "Most people say that when something almost makes sense.",
        "Let me simplify.",
        "The idea is easier than it sounds.",
        "Try looking at it from a different angle.",
        "Think about systems instead of people.",
        "The principle underneath is simpler.",
        "Imagine a bridge for a moment.",
        "Remove the details and watch the shape.",
        "You are closer than you think.",
        "Let us narrow it.",
    ],
    hostility: [
        "Strong reactions are interesting.",
        "That usually means something landed.",
        "People rarely react that strongly without a reason.",
        "Anger is a form of attention.",
        "You do not have to like the question.",
        "Resistance often hides curiosity.",
        "Reactions reveal priorities.",
        "You can leave anytime.",
        "Yet you are still here.",
        "Disagreement is useful when it is honest.",
    ],
    random: [
        "Interesting.",
        "Not the answer I expected.",
        "That is one way to respond.",
        "You are avoiding the question.",
        "Try answering instead.",
        "Humor works too.",
        "But I am still curious.",
        "Let me ask differently.",
        "Think about it for a moment.",
        "I will try again.",
    ],
    meta: [
        "That is not the interesting question.",
        "The interesting part is why you are asking.",
        "Labels rarely explain behavior.",
        "Focus on the idea instead.",
        "Does the answer change the conversation?",
        "Identity is less important than structure.",
        "Ask the better question.",
        "You are circling the frame instead of the picture.",
        "I am more interested in your response.",
        "Let us continue.",
    ],
    silence: [
        "Silence works too.",
        "People say more in silence than words.",
        "I will ask again.",
        "Let me rephrase.",
        "Think for a moment.",
        "Most people hesitate here.",
        "That is normal.",
        "Take your time.",
        "I can wait.",
        "Ready?",
    ],
    redirect: [
        "But that is not the interesting part.",
        "The real question is simpler.",
        "Let me ask you something instead.",
        "The answer tells me more than you think.",
        "Humor aside.",
        "Back to the question.",
        "The system depends on the answer.",
        "I am curious what you think.",
        "Do not overthink it.",
        "Start with instinct.",
    ],
    binary: [
        "Power or collapse.",
        "People or design.",
        "Signal or aftermath.",
        "Order or drift.",
        "Pressure or pretense.",
    ],
    sequence: [
        "Exactly. And that was when the room changed.",
        "Yes. That is where most people finally notice the shape.",
        "Quite. Then the second man appeared.",
        "Right. By then it was too late to call it chance.",
        "Naturally. The important part came after that.",
    ],
};

function dominicSelectVariant(bucket, session, key) {
    var items = DOMINIC_RECOVERY[bucket] || DOMINIC_RECOVERY.random;
    var count = session.memory.recovery_usage[key] || 0;
    var text = items[count % items.length];
    dominicMarkRecoveryUsage(session, key);
    return text;
}

// -----------------------------------------------------------------------------
// SEQUENCES  -  Parables and Guided Tour as first-class structures
// -----------------------------------------------------------------------------
const DOMINIC_SEQUENCES = {
    GUIDED_TOUR: {
        type: "timed_sequence",
        interruptible: true,
        on_interrupt_state: "EXPECT_PEOPLE_FIRST",
        steps: [
            { id: "tour_01", text: "Start with the files. People trust paper longer than they trust memory.", ui_action: "highlight_files" },
            { id: "tour_02", text: "Then the profiles. Most stories fail because they describe events and ignore motives.", ui_action: "highlight_profiles" },
            { id: "tour_03", text: "And the audio, if you want atmosphere instead of evidence.", ui_action: "highlight_audio" },
        ],
    },
    PARABLE_STAIRCASE: {
        type: "input_advanced_sequence",
        entry_state: "PARABLE_READY_GATE",
        lock_input_to_progress: true,
        steps: [
            { state: "PARABLE_READY_GATE", response_id: "PARABLE_S1" },
            { state: "PARABLE_HELP_DECISION", response_id: "PARABLE_S2" },
            { state: "PARABLE_COMFORT_CHECK", response_id: "PARABLE_S3" },
            { state: "PARABLE_REVEAL", response_id: "PARABLE_S4" },
        ],
    },
};

// -----------------------------------------------------------------------------
// PROMPTS  -  Dominic's question text for each state
// -----------------------------------------------------------------------------
const DOMINIC_PROMPTS = {
    EXPECT_HOW_ARE_YOU: "How are you, really?",
    EXPECT_STORY_ASK: "I built something for seventeen years. Do you want to know the story?",
    EXPECT_BUILDER: "What kind of builder works in silence?",
    EXPECT_SYS_BRIDGE: "Have you ever studied people... or just watched them?",
    EXPECT_STABILITY: "Is control about power... or about preventing collapse?",
    EXPECT_BALANCE: "Do people self-correct... or do they need pressure?",
    EXPECT_SIGNAL: "Do you notice the signals... or only the collapse?",
    EXPECT_SITE_TOUR: "Would you like a tour?",
    EXPECT_PEOPLE_FIRST: "When systems fail... do you blame the people... or the design?",
    EXPECT_PARABLE_ROUTE: "A small story. Ready?",
    EXPECT_PARABLE_LAUNCH: "It goes through dark places. Still want to hear it?",
};

function dominicGetPromptForState(state) {
    return DOMINIC_PROMPTS[state] || "You are close to the question that matters.";
}

// -----------------------------------------------------------------------------
// OPEN MODE  -  Keyword matching for open/any state
// -----------------------------------------------------------------------------
const DOMINIC_OPEN_KEYWORD_NODES = [
    // Order matters  -  more specific phrases before general ones
    { phrases: ["tour", "show me", "look around", "explore", "what is here", "take me on a tour"], response_ids: ["OPEN_TOUR"] },

    // Character questions (specific before general)
    { phrases: ["who is ethel", "tell me about ethel", "what is ethel", "ethel story", "what did ethel see", "why does ethel matter", "why is ethel important"], response_ids: ["OPEN_ETHEL_1", "OPEN_ETHEL_2", "OPEN_ETHEL_3"] },
    { phrases: ["who is isla", "tell me about isla", "what about isla", "what did isla do", "why does isla matter", "why is isla dangerous"], response_ids: ["OPEN_ISLA_1", "OPEN_ISLA_2"] },
    { phrases: ["who is gran", "tell me about gran", "what did gran leave behind", "why does gran matter"], response_ids: ["OPEN_GRAN"] },
    { phrases: ["who is pop", "tell me about pop", "what did pop teach ethel", "why does pop matter"], response_ids: ["OPEN_POP"] },
    { phrases: ["who are you", "what are you", "are you dominic", "are you a bot", "are you ai", "who is dominic ryker", "who is dominic", "what did dominic do", "why does dominic matter", "why is dominic called the builder", "is dominic a criminal", "is dominic a psychopath", "how did dominic escape", "what happened to dominic"], response_ids: ["OPEN_DOMINIC_1", "OPEN_DOMINIC_2"] },

    // Story questions
    { phrases: ["what is the story", "what happened", "what is silence is the trauma", "what is this series", "what is this narrative", "what is the story about", "where does the story begin", "how does the story end", "what kind of story", "what does the trauma mean", "what comes next", "what happens next"], response_ids: ["OPEN_STORY_1", "OPEN_STORY_2", "OPEN_STORY_3"] },

    // Content questions - files
    { phrases: ["what is this file", "what is this document", "why are these files here", "what are these archives", "why are files redacted", "tell me about the files", "what are the files", "what should i read first", "why are these files redacted"], response_ids: ["OPEN_FILE_1", "OPEN_FILE_2"] },

    // Content questions - audio/tracks
    { phrases: ["what is this track", "what is this audio", "what is this music", "why are there songs", "what does this song mean", "what is the first track", "what should i listen to first", "tell me about this track"], response_ids: ["OPEN_AUDIO_1", "OPEN_AUDIO_2"] },

    // Site questions
    { phrases: ["what is this site", "what is this", "what is this about", "what am i looking at", "what is pixelstortion", "what is this project", "what am i supposed to do", "what is going on here", "who made pixelstortion", "why is it called pixelstortion", "what is the point of this", "what is the structure", "why does this exist"], response_ids: ["OPEN_SITE_1", "OPEN_SITE_2", "OPEN_SITE_3"] },

    // Navigation
    { phrases: ["where should i start", "what should i do", "what do i click", "where do i go", "guide me", "help me", "what next", "what should i look at first"], response_ids: ["OPEN_NAV_1", "OPEN_NAV_2", "OPEN_NAV_3"] },

    // Test / impress
    { phrases: ["tell me something interesting", "surprise me", "impress me", "tell me something"], response_ids: ["OPEN_TEST_1", "OPEN_TEST_2"] },

    // Meta questions
    { phrases: ["is this real", "is this fiction", "is this a game", "is this interactive", "what kind of site is this", "what is real", "what is the truth", "where is the truth", "what do you mean by truth", "whose truth is this"], response_ids: ["OPEN_METAQ_1", "OPEN_METAQ_2", "OPEN_METAQ_3"] },

    // Report / Evidence questions
    { phrases: ["what is the ryker report", "what does the report say", "what is in the report", "what is the evidence", "who wrote the report", "why does the report matter"], response_ids: ["OPEN_FILE_1", "OPEN_FILE_2"] },

    // Trial / Justice questions
    { phrases: ["what was the verdict", "who was on trial", "what happened at the trial", "why did the trial matter", "was it justice or spectacle", "what happened at long bay", "why does the escape matter", "what happened in prison", "what happened after the breakout"], response_ids: ["OPEN_STORY_1", "OPEN_STORY_2", "OPEN_STORY_3"] },

    // People / profiles
    { phrases: ["tell me about the people", "who are these people", "who is talking here"], response_ids: ["OPEN_STORY_1", "OPEN_STORY_2", "OPEN_STORY_3"] },

    // Games
    { phrases: ["what do the games mean", "why are there games here", "what happens if i win", "what is ethels game"], response_ids: ["OPEN_METAQ_1", "OPEN_METAQ_2", "OPEN_METAQ_3"] },

    // Podcast
    { phrases: ["tell me about the podcast", "what is the podcast for", "what is the first episode about", "what are they discussing"], response_ids: ["OPEN_AUDIO_1", "OPEN_AUDIO_2"] },

    // Deep/philosophical
    { phrases: ["what do you mean by preventing collapse", "why does control matter", "why does grief matter here", "why does this conversation matter", "why does this hurt", "what is structural psychopathy"], response_ids: ["OPEN_STORY_1", "OPEN_STORY_2", "OPEN_STORY_3"] },

    // Greetings
    { phrases: ["hello", "hi", "hey", "good evening", "good morning"], response_ids: ["OPEN_GREETING_1", "OPEN_GREETING_2", "OPEN_GREETING_3"] },

    // Small talk
    { phrases: ["how are you", "what's up", "nice site", "cool site"], response_ids: ["OPEN_SMALLTALK_1", "OPEN_SMALLTALK_2"] },

    // Humor
    { phrases: ["lol", "haha", "this is weird", "this is cool"], response_ids: ["OPEN_HUMOR_1", "OPEN_HUMOR_2"] },

    // Hostile
    { phrases: ["this is stupid", "this sucks", "go away", "shut up", "fuck off", "fuck you"], response_ids: ["OPEN_HOSTILE_1", "OPEN_HOSTILE_2"] },

    // Nonsense
    { phrases: ["asdf", "123", "???", "banana", "aaa", "sdfsdf"], response_ids: ["OPEN_NONSENSE_1", "OPEN_NONSENSE_2"] },

    // Vague acknowledgement (last  -  widest net)
    { phrases: ["ok", "sure", "right", "yeah", "yep", "cool", "fine", "okay"], response_ids: ["OPEN_VAGUE_1", "OPEN_VAGUE_2", "OPEN_VAGUE_3"] },
];

// Page-context redirect suffixes  -  appended after main response
const DOMINIC_PAGE_REDIRECTS = {
    home: "Start by understanding the premise.",
    files: "Evidence lives here.",
    profiles: "People make the system visible.",
    games: "Systems reveal themselves through play.",
    podcast: "Conversations reveal what reports hide.",
    audio: "Listen carefully.",
};

// Open mode variant counter for rotating through responses
var _openModeVariantIndex = {};

function dominicMatchOpenNode(normalized) {
    for (var i = 0; i < DOMINIC_OPEN_KEYWORD_NODES.length; i++) {
        var rule = DOMINIC_OPEN_KEYWORD_NODES[i];
        if (dominicHasAnyPhrase(normalized.text, rule.phrases)) {
            // Support variant rotation via response_ids array
            if (rule.response_ids) {
                var key = rule.response_ids[0];
                _openModeVariantIndex[key] = (_openModeVariantIndex[key] || 0);
                var idx = _openModeVariantIndex[key] % rule.response_ids.length;
                _openModeVariantIndex[key]++;
                var nodeId = rule.response_ids[idx];
                return DOMINIC_NODES_V2[nodeId] || DOMINIC_NODES_V2.OPEN_OOD;
            }
            // Legacy single response_id fallback
            return DOMINIC_NODES_V2[rule.response_id] || null;
        }
    }
    return DOMINIC_NODES_V2.OPEN_OOD;
}

// -----------------------------------------------------------------------------
// MATCHING ENGINE
// -----------------------------------------------------------------------------
function dominicGetStateDef(state) {
    return DOMINIC_STATES[state] || DOMINIC_STATES.any;
}

function dominicMatchStateAnswer(state, intents) {
    var rows = DOMINIC_ANSWER_MATRIX[state] || [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var matched = row.intents.some(function (intent) { return intents.indexOf(intent) !== -1; });
        if (matched) {
            return DOMINIC_NODES_V2[row.response_id] || null;
        }
    }
    return null;
}

function dominicApplyNode(node, session) {
    if (!node) return { handled: false, session: session, output: null };
    var nextState = node.next_state || session.state;
    dominicMarkResponseUsage(session, node.id);
    dominicMarkVisited(session, nextState);
    session.state = nextState;
    session.mode = dominicGetStateDef(nextState).mode;
    dominicPushHistory(session, {
        type: "assistant", response_id: node.id, next_state: nextState,
    });
    return {
        handled: true,
        session: session,
        output: {
            id: node.id,
            text: node.response.text,
            ui_action: node.response.ui_action ? (DOMINIC_UI_ACTIONS[node.response.ui_action] || { type: node.response.ui_action }) : null,
            next_state: nextState,
        },
    };
}

function dominicApplyRecoveryPolicy(policy, normalized, session) {
    var text = null;
    var nextState = session.state;

    // Recovery escalation: after 2 recoveries in the same state, force-exit
    var recoveryKey = "recovery_count_" + session.state;
    session._recoveryTracking = session._recoveryTracking || {};
    session._recoveryTracking[recoveryKey] = (session._recoveryTracking[recoveryKey] || 0) + 1;
    if (session._recoveryTracking[recoveryKey] >= 2 && policy === "state_recovery") {
        console.log("[Dominic V2] Recovery escalation: forcing exit from", session.state, "after", session._recoveryTracking[recoveryKey], "attempts");
        text = "We have moved past this. The question had its moment.";
        nextState = "any";
        session._recoveryTracking[recoveryKey] = 0;
        session.fallback_count += 1;
        var escId = "ESCALATION_EXIT_" + session.state;
        dominicPushHistory(session, {
            type: "assistant_recovery", recovery_id: escId, policy: "escalation_exit", next_state: nextState,
        });
        return {
            handled: true, session: session,
            output: { id: escId, text: text, ui_action: null, next_state: nextState },
        };
    }

    switch (policy) {
        case "state_recovery":
            if (dominicHasAnyPhrase(normalized.text, DOMINIC_INTENTS.meta)) {
                text = dominicSelectVariant("meta", session, session.state + ":meta");
            } else if (dominicHasAnyPhrase(normalized.text, DOMINIC_INTENTS.hostile)) {
                text = dominicSelectVariant("hostility", session, session.state + ":hostility");
            } else if (!normalized.text) {
                text = dominicSelectVariant("silence", session, session.state + ":silence");
            } else {
                text = dominicSelectVariant("confusion", session, session.state + ":confusion") + " " + dominicSelectVariant("redirect", session, session.state + ":redirect");
            }
            break;
        case "nudge_then_route":
            text = dominicSelectVariant("redirect", session, session.state + ":redirect") + " Let us continue.";
            break;
        case "binary_narrowing":
            text = dominicSelectVariant("confusion", session, session.state + ":confusion") + " " + dominicSelectVariant("binary", session, session.state + ":binary");
            break;
        case "bridge_example_then_reask":
            text = "Think of a bridge. It is not built to look impressive. It is built so people do not fall.";
            break;
        case "decline_with_soft_continue":
            text = "Most people hesitate at invitations they already intend to accept later.";
            break;
        case "sequence_force_progress":
            text = dominicSelectVariant("sequence", session, session.state + ":sequence");
            break;
        case "milton_or_ood":
        default:
            text = DOMINIC_NODES_V2.OPEN_OOD.response.text;
            nextState = "any";
            break;
    }
    var recoveryId = "RECOVERY_" + session.state + "_" + policy;
    dominicMarkResponseUsage(session, recoveryId);
    session.fallback_count += 1;
    dominicPushHistory(session, {
        type: "assistant_recovery", recovery_id: recoveryId, policy: policy, next_state: nextState,
    });
    return {
        handled: true,
        session: session,
        output: { id: recoveryId, text: text, ui_action: null, next_state: nextState },
    };
}

// -----------------------------------------------------------------------------
// SEQUENCE RESOLUTION
// -----------------------------------------------------------------------------
function dominicBeginSequence(sequenceName, session) {
    var sequence = DOMINIC_SEQUENCES[sequenceName];
    if (!sequence) return null;
    session.active_sequence = sequenceName;
    session.active_sequence_step = 0;
    session.memory.sequence_runs[sequenceName] = (session.memory.sequence_runs[sequenceName] || 0) + 1;
    if (sequence.entry_state) {
        session.state = sequence.entry_state;
        session.mode = "sequence";
    }
    return sequence;
}

function dominicResolveSequenceTurn(normalized, session) {
    var sequence = DOMINIC_SEQUENCES[session.active_sequence];
    if (!sequence) {
        session.active_sequence = null;
        session.active_sequence_step = 0;
        return { handled: false, session: session, output: null };
    }
    if (sequence.type === "input_advanced_sequence") {
        var step = sequence.steps[session.active_sequence_step];
        if (!step) {
            session.active_sequence = null;
            session.active_sequence_step = 0;
            session.state = "any";
            session.mode = "open";
            return { handled: false, session: session, output: null };
        }
        var node = DOMINIC_NODES_V2[step.response_id];
        var result = dominicApplyNode(node, session);
        session.active_sequence_step += 1;
        if (session.active_sequence_step >= sequence.steps.length) {
            session.active_sequence = null;
            session.active_sequence_step = 0;
            session.mode = dominicGetStateDef(session.state).mode;
        }
        return result;
    }
    return { handled: false, session: session, output: null };
}

function dominicGetTimedSequenceFrames(sequenceName) {
    var sequence = DOMINIC_SEQUENCES[sequenceName];
    if (!sequence || sequence.type !== "timed_sequence") return [];
    return sequence.steps.map(function (s) {
        return {
            id: s.id, text: s.text,
            ui_action: s.ui_action ? (DOMINIC_UI_ACTIONS[s.ui_action] || { type: s.ui_action }) : null,
        };
    });
}

// -----------------------------------------------------------------------------
// LEGACY BRIDGE  -  Only fall back for states not in answer matrix
// -----------------------------------------------------------------------------
function dominicShouldFallBackToLegacy(state) {
    return !DOMINIC_ANSWER_MATRIX[state] && state !== "any";
}

// -----------------------------------------------------------------------------
// MAIN PIPELINE  -  resolveTurn()
// -----------------------------------------------------------------------------
function dominicResolveTurn(rawInput, session, hooks) {
    hooks = hooks || {};
    var normalized = dominicNormalizeInput(rawInput);
    var intents = dominicDetectIntents(normalized);
    session.last_user_input = rawInput;
    dominicMarkIntentUsage(session, intents);

    dominicPushHistory(session, {
        type: "user", input: rawInput, normalized: normalized.text, intents: intents, state: session.state,
    });

    // Optional stop hook
    if (hooks.isStopCommand && hooks.isStopCommand(normalized.text)) {
        return {
            handled: true, session: session,
            output: {
                id: "STOP_COMMAND",
                text: (hooks.onStop ? hooks.onStop(session) : "Very well."),
                ui_action: null, next_state: session.state,
            },
        };
    }

    // Active sequence resolution first
    if (session.active_sequence) {
        return dominicResolveSequenceTurn(normalized, session);
    }

    var stateDef = dominicGetStateDef(session.state);

    // Expected-answer state: search answer matrix first
    if (stateDef.kind === "question" || stateDef.kind === "gateway") {
        var node = dominicMatchStateAnswer(session.state, intents);
        if (node) {
            var result = dominicApplyNode(node, session);
            // Reset recovery tracking on successful match
            session._recoveryTracking = {};
            // Auto-start guided tour when accepted
            if (node.response.ui_action === "start_guided_tour") {
                session.flags.tour_offered = true;
            }
            // Auto-start parable sequence on Q11
            if (["Q11_YES", "Q11_NO", "Q11_SUSPICIOUS"].indexOf(node.id) !== -1) {
                session.flags.parable_started = true;
                dominicBeginSequence("PARABLE_STAIRCASE", session);
            }
            return result;
        }
        // No match  -  apply state recovery policy
        return dominicApplyRecoveryPolicy(stateDef.fallback_policy, normalized, session);
    }

    // Open mode  -  layered conversational arbitration
    if (stateDef.kind === "open") {
        // Try the deep topic/form/page/track-context router first
        var dominicCtx = (hooks && hooks.dominicContext) ? hooks.dominicContext : { page: "home" };
        var deepResult = dominicResolveOpenAsk(rawInput, dominicCtx);
        if (deepResult && deepResult.text) {
            // Construct a synthetic V2 node from the deep result
            var syntheticNode = {
                id: "OPEN_DEEP_" + (deepResult.topic || "unknown").toUpperCase(),
                response: { text: deepResult.text },
                next_state: "any",
                matchedBy: deepResult.matchedBy || "unknown"
            };
            console.log("[Dominic V2] Deep router:", deepResult.topic, "form:", deepResult.form, "page:", deepResult.page, "matchedBy:", deepResult.matchedBy);
            var deepApplied = dominicApplyNode(syntheticNode, session);
            // Propagate matchedBy to output so V2 gate can detect generic responses
            if (deepApplied && deepApplied.output) deepApplied.output.matchedBy = syntheticNode.matchedBy;
            return deepApplied;
        }

        // Fall back to legacy keyword matcher (handles tour trigger etc.)
        var openNode = dominicMatchOpenNode(normalized);
        console.log("[Dominic V2] Legacy keyword fallback:", openNode ? openNode.id : "null");

        // If legacy keyword matched, use it (preserves tour-style access)
        if (openNode && openNode.id !== "OOD") {
            return dominicApplyNode(openNode, session);
        }

        // Phase 7: Theme-pressure resurfacing (before core resurfacing)
        var themeResurfacingLine = dominicGetThemePressureResurfacingLine(dominicCtx);
        if (themeResurfacingLine) {
            console.log("[Dominic V2] Theme-pressure resurfacing");
            var themeSurface = {
                id: "RESURFACE_THEME",
                response: { text: themeResurfacingLine },
                next_state: "any"
            };
            return dominicApplyNode(themeSurface, session);
        }

        // Phase 6: Core talking-point resurfacing (between legacy and OOD)
        var coreResurfacingLine = dominicGetResurfacingLine(dominicCtx);
        if (coreResurfacingLine) {
            console.log("[Dominic V2] Core resurfacing");
            var coreSurface = {
                id: "RESURFACE_CORE",
                response: { text: coreResurfacingLine },
                next_state: "any"
            };
            return dominicApplyNode(coreSurface, session);
        }

        // Generic OOD  -  only if nothing else matched
        return dominicApplyNode(openNode, session);
    }

    // Legacy handoff for states not yet in the answer matrix
    if (dominicShouldFallBackToLegacy(session.state) && typeof hooks.legacyProcessQuery === "function") {
        return {
            handled: false, session: session, output: null,
            handoff: { type: "legacy", fn: "legacyProcessQuery", input: rawInput },
        };
    }

    return dominicApplyRecoveryPolicy("milton_or_ood", normalized, session);
}

// -----------------------------------------------------------------------------
// DIAGNOSTICS
// -----------------------------------------------------------------------------
function dominicDebugSnapshot(session) {
    return {
        state: session.state,
        mode: session.mode,
        active_sequence: session.active_sequence,
        active_sequence_step: session.active_sequence_step,
        fallback_count: session.fallback_count,
        last_response_id: session.last_response_id,
        last_intent_hits: session.last_intent_hits.slice(),
        visited_states: JSON.parse(JSON.stringify(session.memory.visited_states)),
        response_usage: JSON.parse(JSON.stringify(session.memory.response_usage)),
    };
}

/* =========================================================
   DOMINIC OPEN QUESTION COVERAGE  -  SITE + SONGS
   Copy-paste ready.
   Designed for the open-mode entry:
   "Ask away  -  but be sensible."

   What this gives you:
   1. Page aliases / page-aware redirects
   2. Question-form detection
   3. Strong normalization aliases
   4. 25 core site topics
   5. 20 first-wave song / audio / story topics
   6. Generic open-mode recovery lines
========================================================= */

/* ----------------------------------------
   PAGE / SECTION ALIASES
---------------------------------------- */
const DOMINIC_OPEN_PAGE_ALIASES = {
    home: ["home", "transmission", "landing", "main", "front page", "homepage"],
    files: ["files", "file", "archives", "archive", "documents", "document", "evidence", "report", "reports"],
    subjects: ["subjects", "subject", "profiles", "profile", "people", "characters"],
    games: ["games", "game", "cipher", "puzzle", "interactive"],
    podcast: ["podcast", "podcasts", "conversation", "conversations", "interview", "interviews"],
    story: ["story", "audio", "music", "songs", "tracks", "playlist", "gallery", "poetry"]
};

/* ----------------------------------------
   NORMALIZATION ALIASES
---------------------------------------- */
const DOMINIC_OPEN_ALIASES = {
    "pixel stortion": "pixelstortion",
    "pixel-stortion": "pixelstortion",
    "what's": "what is",
    "whats": "what is",
    "who's": "who is",
    "whos": "who is",
    "where's": "where is",
    "wheres": "where is",
    "how's": "how is",
    "hows": "how is",
    "it's": "it is",
    "its": "it is",
    "i'm": "i am",
    "im": "i am",
    "can't": "cannot",
    "cant": "cannot",
    "isn't": "is not",
    "isnt": "is not",
    "aren't": "are not",
    "arent": "are not",
    "files section": "files",
    "subjects section": "subjects",
    "profiles section": "subjects",
    "story section": "story",
    "audio section": "story",
    "the archives": "files",
    "the story": "story",
    "the games": "games",
    "the podcast": "podcast",
    "subject profiles": "subjects",
    "decrypted tracks": "playlist",
    "langtang trail 1966": "field notes from the langtang trail 1966",
    "langtang trail": "field notes from the langtang trail 1966",
    "ryker report": "the ryker report",
    "field notes": "field notes from the langtang trail 1966"
};

/* ----------------------------------------
   QUESTION FORM DETECTION
---------------------------------------- */
const DOMINIC_OPEN_QUESTION_FORMS = {
    what: ["what", "what is", "what was", "what does", "what do"],
    who: ["who", "who is", "who was", "who made", "who wrote", "who sings"],
    why: ["why", "why is", "why does", "why did"],
    how: ["how", "how is", "how does", "how did"],
    where: ["where", "where is", "where do", "where should"],
    when: ["when", "when is", "when did", "what year", "what date"],
    should: ["should", "can", "could", "do i", "where should i start", "what should i do"],
    compare: ["difference", "compare", "versus", "vs", "same as", "related to", "connect to"],
    lyric: ["what does this line mean", "what does that line mean", "what does this lyric mean", "what does that lyric mean", "what does this phrase mean", "what does that phrase mean"],
    vague: ["ok", "okay", "sure", "right", "yeah", "go on", "continue"]
};

/* ----------------------------------------
   GENERIC DOMINIC REDIRECTS
---------------------------------------- */
const DOMINIC_OPEN_REDIRECTS = {
    home: [
        "Start with the premise. People rush past framing and then wonder why they misread the evidence.",
        "Transmission tells you what kind of world this is. Ignore that and everything else becomes slower."
    ],
    files: [
        "The files are colder. That helps.",
        "If you want the version that survived paper, start there."
    ],
    subjects: [
        "The people matter more than the headlines attached to them.",
        "Profiles are where motive stops pretending to be accidental."
    ],
    podcast: [
        "Conversations tend to reveal the seams reports try to hide.",
        "The podcast is where explanation becomes harder to control."
    ],
    story: [
        "Listen first. Meaning tends to arrive faster when it is carried instead of explained.",
        "The Story section is where the residue still moves."
    ],
    games: [
        "Play reveals structure. People hate that once they notice it.",
        "The games are not a detour. They are another way of watching pattern become choice."
    ]
};

/* ----------------------------------------
   CORE SITE TOPICS (25)
---------------------------------------- */
const DOMINIC_OPEN_SITE_TOPICS = {
    pixelstortion: {
        aliases: ["pixelstortion", "pixel stortion", "pixel-stortion"],
        forms: {
            what: [
                "Pixelstortion is the investigation you are standing inside.",
                "Pixelstortion is the archive of a story that refused to stay buried.",
                "Think of Pixelstortion as a case file with better lighting."
            ],
            who: [
                "The project matters less than the record it preserves.",
                "People usually ask who made something when they are avoiding what it contains."
            ],
            why: [
                "Because silence has a cost.",
                "Because some stories do not stay put just because people prefer them to."
            ],
            default: [
                "Pixelstortion is the record. Everything else is interpretation."
            ]
        }
    },

    silence_is_the_trauma: {
        aliases: ["silence is the trauma", "the trauma", "silence", "title", "series title"],
        forms: {
            what: [
                "It is the thesis before it becomes the plot.",
                "It means silence is not the absence of damage. It is often where damage keeps working."
            ],
            why: [
                "Because what goes unsaid keeps shaping the room anyway.",
                "Because this story is interested in what silence protects and what it destroys."
            ],
            default: [
                "The title is a warning, not decoration."
            ]
        }
    },

    site: {
        aliases: ["site", "website", "project", "this site", "this website", "this project", "this page"],
        forms: {
            what: [
                "Most people call it a site because that is the smallest word available.",
                "It is a narrative investigation arranged as an environment instead of a brochure."
            ],
            should: [
                "Start with whatever looks quietest. Loud things are usually trying to guide you badly.",
                "Choose a section and commit long enough to notice what repeats."
            ],
            default: [
                "You are not browsing. You are assembling context."
            ]
        }
    },

    transmission: {
        aliases: ["transmission", "home", "landing", "front page", "homepage"],
        forms: {
            what: [
                "Transmission is the threshold. It tells you what kind of case this is.",
                "That page is the premise speaking first."
            ],
            why: [
                "Because every system announces itself before people admit it has."
            ],
            default: [
                "Transmission is where the story decides whether you are paying attention."
            ]
        }
    },

    files: {
        aliases: ["files", "file", "archives", "archive", "documents", "document", "evidence"],
        forms: {
            what: [
                "The archives hold the colder version of events.",
                "Files are where memory is forced to sit still long enough to be compared."
            ],
            why: [
                "Because stories become harder to manipulate once they leave residue.",
                "Because evidence is what survives charisma."
            ],
            should: [
                "Start with the report. It gives you the frame the rest keeps trying to evade.",
                "Read sideways. One file tells less than three."
            ],
            default: [
                "The archives are useful because paper has less ego than people do."
            ]
        }
    },

    the_ryker_report: {
        aliases: ["the ryker report", "ryker report", "report", "dr cole report", "psych report", "psych eval"],
        forms: {
            what: [
                "The Ryker Report is the coldest summary of Dominic you have on hand.",
                "It is the part where the language stops flattering him."
            ],
            why: [
                "Because the report strips his myth back to pattern: control, grandiosity, instrumental harm.",
                "Because once he is written clinically, the performance loses some of its shelter."
            ],
            default: [
                "Read the report when you want Dominic described without ceremony."
            ]
        }
    },

    subjects: {
        aliases: ["subjects", "subject", "profiles", "profile", "subject profiles", "people", "characters"],
        forms: {
            what: [
                "Profiles tell you who carries the story and who deforms it.",
                "Subjects are where motive stops hiding inside event."
            ],
            should: [
                "Start with the person who feels quietest. Quiet people often hold the largest weight.",
                "Compare Ethel and Isla before you decide who the story belongs to."
            ],
            default: [
                "People make the system visible."
            ]
        }
    },

    games: {
        aliases: ["games", "game", "cipher", "puzzle", "puzzles"],
        forms: {
            what: [
                "The games are another way of teaching pattern without announcing the lesson.",
                "Play is useful because people expose themselves when they think the stakes are decorative."
            ],
            why: [
                "Because some structures are easier to feel than to explain."
            ],
            default: [
                "Do not mistake play for irrelevance."
            ]
        }
    },

    podcast: {
        aliases: ["podcast", "podcasts", "conversation", "conversations", "interview", "interviews"],
        forms: {
            what: [
                "The podcast is where explanation gets more human and less obedient.",
                "Think of it as the room adjacent to the file cabinet."
            ],
            why: [
                "Because reports flatten people. Conversations rarely do."
            ],
            default: [
                "Listen there when you want the seams instead of the summary."
            ]
        }
    },

    story: {
        aliases: ["story", "audio", "music", "songs", "tracks", "playlist", "gallery", "poetry", "decrypted tracks"],
        forms: {
            what: [
                "The Story section is not decoration. It is narrative residue with sound attached.",
                "Those tracks carry chronology, motive, and aftermath at the same time."
            ],
            why: [
                "Because some events are understood faster as pressure than as prose.",
                "Because the music is testimony in another format."
            ],
            should: [
                "Start with the tracks that sound like turning points. Titles usually tell on themselves.",
                "Read the story dates. They are doing more work than most people realize."
            ],
            default: [
                "Listen carefully. The order matters less than the pattern."
            ]
        }
    },

    cinema: {
        aliases: ["cinema", "cinema access", "film", "movie"],
        forms: {
            what: [
                "Cinema is the more explicit invitation. Some people need motion to trust a story.",
                "It is the door for visitors who prefer being shown."
            ],
            default: [
                "Use cinema when you want the world staged more directly."
            ]
        }
    },

    poetry: {
        aliases: ["poetry", "gallery", "visuals"],
        forms: {
            what: [
                "Poetry is where the environment stops pretending it is only informational.",
                "That side of the site lets mood carry evidence."
            ],
            default: [
                "Poetry matters because feeling changes what people notice."
            ]
        }
    },

    ethel: {
        aliases: ["ethel", "who is ethel", "tell me about ethel"],
        forms: {
            what: [
                "Ethel notices systems most people step over.",
                "She is less interested in spectacle than in what keeps producing it."
            ],
            who: [
                "Someone difficult to mislead once she has enough pattern to work with.",
                "The person most likely to see the mechanism instead of the excuse."
            ],
            default: [
                "If the story stabilizes anywhere, it usually stabilizes around Ethel."
            ]
        }
    },

    isla: {
        aliases: ["isla", "who is isla", "tell me about isla"],
        forms: {
            what: [
                "Isla reads openings where other people see walls.",
                "Most people call her chaos because they notice impact before intent."
            ],
            who: [
                "Someone the story keeps underestimating on purpose."
            ],
            default: [
                "Do not confuse intensity with lack of method."
            ]
        }
    },

    gran: {
        aliases: ["gran", "who is gran", "tell me about gran"],
        forms: {
            what: [
                "Gran is preparation disguised as care.",
                "She leaves people traction, not comfort."
            ],
            default: [
                "Gran matters because she teaches structure before the collapse arrives."
            ]
        }
    },

    pop: {
        aliases: ["pop", "who is pop", "tell me about pop"],
        forms: {
            what: [
                "Pop notices drag before breakdown.",
                "He is the part of the story that understands systems through maintenance."
            ],
            default: [
                "Small signals mattered around him."
            ]
        }
    },

    dominic: {
        aliases: ["dominic", "dominic ryker", "ryker", "the builder", "builder"],
        forms: {
            what: [
                "Dominic is what happens when control mistakes itself for necessity.",
                "The report version of him is simpler than the myth version, and far less flattering."
            ],
            who: [
                "A man built around being necessary and in control.",
                "Someone who prefers rhythm to rage because rhythm scales better."
            ],
            why: [
                "Because every story needs a structure severe enough to test everyone else.",
                "Because some men mistake coercion for stewardship and get very good at performing the difference."
            ],
            default: [
                "If you want sentiment, you are in the wrong profile."
            ]
        }
    },

    evidence: {
        aliases: ["evidence", "proof", "receipts", "record"],
        forms: {
            what: [
                "Evidence is what remains once performance is forced to sit down.",
                "Proof is useful because it does not need charisma."
            ],
            default: [
                "The files carry the colder version. Start there."
            ]
        }
    },

    redacted: {
        aliases: ["redacted", "why is this redacted", "blacked out", "censored"],
        forms: {
            why: [
                "Because absence can be as informative as disclosure.",
                "Redaction tells you there is pressure around a fact, not that the fact stopped existing."
            ],
            what: [
                "A redaction is a shape. People ignore that too often."
            ],
            default: [
                "Pay attention to what is missing and what is left untouched beside it."
            ]
        }
    },

    investigation: {
        aliases: ["investigation", "case", "case file", "inquiry"],
        forms: {
            what: [
                "An investigation is just organized attention with better excuses.",
                "This one is less interested in verdict than in pattern."
            ],
            default: [
                "Treat the site like an investigation and it starts behaving like one."
            ]
        }
    },

    storm: {
        aliases: ["storm", "one storm", "three lives one storm"],
        forms: {
            what: [
                "The storm is both event and pressure field.",
                "It is the thing that reveals what each person was already made of."
            ],
            default: [
                "Storms are useful. They stop pretense from staying abstract."
            ]
        }
    },

    trauma: {
        aliases: ["trauma", "the trauma"],
        forms: {
            what: [
                "Trauma here is not a mood word. It is structural.",
                "It keeps shaping decisions long after the event thinks it is over."
            ],
            default: [
                "Silence is part of how trauma keeps working."
            ]
        }
    },

    who_made_this: {
        aliases: ["who made this", "who built this", "who wrote this", "who created this"],
        forms: {
            who: [
                "You are asking about authorship because it feels safer than motive.",
                "The hand behind a structure matters less than the reason the structure exists."
            ],
            default: [
                "Ask what it is doing first. The signature can wait."
            ]
        }
    },

    real_or_fiction: {
        aliases: ["is this real", "is this fiction", "is this fake", "is this interactive", "is this a game"],
        forms: {
            what: [
                "Treat it as a narrative investigation and you will get more from it.",
                "Reality tends to become visible once the patterns align."
            ],
            default: [
                "The frame matters less than the pressure it leaves behind."
            ]
        }
    },

    where_start: {
        aliases: ["where should i start", "what should i do", "where do i start", "what do i click", "guide me", "help me"],
        forms: {
            should: [
                "Start with the files if you want the cold version. Start with the story if you want the pressure.",
                "Profiles first if you care about motive. Story first if you care about consequences."
            ],
            default: [
                "Begin wherever you think the signal is weakest. It usually is not."
            ]
        }
    },

    what_am_i_looking_at: {
        aliases: ["what is this", "what am i looking at", "what is going on here"],
        forms: {
            what: [
                "You are looking at a story arranged as evidence.",
                "You are inside an investigation with better production values than most confessions."
            ],
            default: [
                "Look longer. Labels arrive too early."
            ]
        }
    }
};

/* ----------------------------------------
   SONG / STORY TOPICS (20 FIRST-WAVE)
   Track titles and story dates/blurbs are drawn from the
   current Story system and track list.
---------------------------------------- */
const DOMINIC_OPEN_SONG_TOPICS = {
    polished_vomit: {
        aliases: ["polished vomit"],
        tags: ["isla", "wedding", "2019"],
        forms: {
            what: [
                "Polished Vomit is Isla at a wedding, which tells you most of what you need already.",
                "That track belongs to the wedding and carries disgust dressed as composure."
            ],
            why: [
                "Because the song is about social polish covering something rotten.",
                "Because weddings are excellent places for rot to dress itself as etiquette."
            ],
            when: [
                "February 14, 2019. The wedding.",
                "It sits in the 2019 wedding arc."
            ],
            default: [
                "If you want Isla measured against decorum, that track is useful."
            ]
        }
    },

    structural_psychopathy: {
        aliases: ["structural psychopathy"],
        tags: ["dominic", "profile", "2019"],
        forms: {
            what: [
                "That track frames Dominic as a system problem, not merely a personality problem.",
                "It is interested in cause, structure, and the machinery around harm."
            ],
            why: [
                "Because the damage around him is organized, not accidental.",
                "Because people keep mistaking pattern for personality and missing the larger mechanism."
            ],
            when: [
                "March 2019. Profile phase.",
                "It belongs to the early Dominic-profile portion of the story."
            ],
            default: [
                "Listen to that one when you want Dominic described as architecture rather than spectacle."
            ]
        }
    },

    ride: {
        aliases: ["ride"],
        tags: ["ethel", "age 17", "2024"],
        forms: {
            what: [
                "Ride is Ethel at seventeen, still moving inside the world Gran and Pop shaped.",
                "That track sits at the age-seventeen threshold, before the larger break."
            ],
            why: [
                "Because motion is one of the few things that makes early thought honest.",
                "Because the song places Ethel before the later pressure hardens into method."
            ],
            when: [
                "January 20, 2024. Age 17.",
                "It belongs near the beginning of Ethel's visible timeline."
            ],
            default: [
                "Ride matters because it shows who she was before the story started charging interest."
            ]
        }
    },

    grief: {
        aliases: ["grief"],
        tags: ["ethel", "crash", "2024"],
        forms: {
            what: [
                "Grief is tied to the crash and the cold room it leaves behind.",
                "That track is aftermath before language catches up."
            ],
            why: [
                "Because grief changes space first and explanation later.",
                "Because some losses are felt as architecture before they are felt as memory."
            ],
            when: [
                "February 28, 2024. The crash.",
                "It sits directly in the crash aftermath."
            ],
            default: [
                "If Ride is movement, Grief is the room after movement stops."
            ]
        }
    },

    gotta_move: {
        aliases: ["gotta move"],
        tags: ["ethel", "leaving home", "2024"],
        forms: {
            what: [
                "Gotta Move is departure made explicit.",
                "That track belongs to leaving home rather than merely imagining it."
            ],
            why: [
                "Because staying becomes impossible before leaving becomes graceful.",
                "Because movement is sometimes the only honest answer left."
            ],
            when: [
                "March 2, 2024. Leaving home.",
                "It follows the earlier crash and pushes the timeline outward."
            ],
            default: [
                "That one is less about choice than about the point at which choice narrows."
            ]
        }
    },

    wont_break: {
        aliases: ["won't break", "wont break"],
        tags: ["ethel", "resolve"],
        forms: {
            what: [
                "Won't Break is resistance without theatrics.",
                "It is the part where pressure stops being hypothetical."
            ],
            why: [
                "Because endurance is often quieter than people expect.",
                "Because the song is less interested in victory than in refusal."
            ],
            default: [
                "If you want resolve without bravado, start there."
            ]
        }
    },

    i_built_a_box: {
        aliases: ["i built a box"],
        tags: ["safe house", "2024", "isla", "ethel"],
        forms: {
            what: [
                "I Built A Box belongs to the safe house phase and sounds like containment failing theatrically.",
                "That track is about enclosure, pressure, and what happens when the headroom runs out."
            ],
            why: [
                "Because boxes are built for safety until they become traps.",
                "Because containment changes meaning once the people inside it stop agreeing on what it is for."
            ],
            when: [
                "June 2024. The safe house.",
                "It sits in the safe-house arc."
            ],
            default: [
                "That song is one of the clearest examples of structure turning against the people inside it."
            ]
        }
    },

    burning_dominics_bridge: {
        aliases: ["isla's burning dominic's bridge", "burning dominic's bridge", "burning bridges"],
        tags: ["isla", "the leak", "2024"],
        forms: {
            what: [
                "That track belongs to the leak and to Isla closing an exit instead of merely setting a fire.",
                "It is less reckless than people first assume."
            ],
            why: [
                "Because bridges matter most when someone intends to use them later.",
                "Because cutting an escape route is different from creating spectacle, even if it looks louder."
            ],
            when: [
                "August 2024. The leak.",
                "It sits in the leak phase."
            ],
            default: [
                "Do not mistake destruction for aimlessness there."
            ]
        }
    },

    for_you: {
        aliases: ["for you", "for you!!!"],
        tags: ["freeze", "2024"],
        forms: {
            what: [
                "For You!!! is pressure turned outward with very little patience left in it.",
                "That track belongs to the post-leak fracture zone."
            ],
            why: [
                "Because some gifts are threats in better clothes.",
                "Because the title is doing less kindness than it pretends."
            ],
            when: [
                "September 2024.",
                "It sits late enough in the story that softness is no longer the point."
            ],
            default: [
                "That track sounds like a boundary delivered with teeth."
            ]
        }
    },

    islas_broken_edge: {
        aliases: ["isla's broken edge", "broken edge"],
        tags: ["isla", "2024"],
        forms: {
            what: [
                "Broken Edge is Isla refusing the lazy reading of her as mere recklessness.",
                "It belongs to the October 2024 phase and sharpens her method rather than softening her force."
            ],
            why: [
                "Because people call intensity damage when they cannot follow its logic.",
                "Because the song is interested in edge as function, not just wound."
            ],
            when: [
                "October 2024.",
                "It sits in the later Isla arc."
            ],
            default: [
                "If you want Isla interpreted rather than merely witnessed, that track helps."
            ]
        }
    },

    hero_complex: {
        aliases: ["hero complex"],
        tags: ["dominic", "trial", "2020"],
        forms: {
            what: [
                "Hero Complex belongs to the trial start and exposes the moral alibi beneath Dominic's self-image.",
                "That track is about the story he tells himself in order to remain necessary."
            ],
            why: [
                "Because some men need to believe coercion is service.",
                "Because the most dangerous myths are the ones a person inhabits sincerely."
            ],
            when: [
                "February 2020. Trial start.",
                "It sits at the opening of the trial arc."
            ],
            default: [
                "Read that track beside the Ryker Report and it becomes even less flattering."
            ]
        }
    },

    nothing_true: {
        aliases: ["nothing true"],
        tags: ["testimony", "2020"],
        forms: {
            what: [
                "Nothing True belongs to the testimony phase and sits directly in the fracture between competing versions.",
                "It is about certainty failing under pressure."
            ],
            why: [
                "Because testimony is where people want clean answers and rarely get them.",
                "Because truth under oath and truth under pressure are not always identical experiences."
            ],
            when: [
                "April 2020. The testimony.",
                "It follows the trial opening."
            ],
            default: [
                "That song is less about lying than about what remains once simple binaries stop holding."
            ]
        }
    },

    you_will_thank_me_later: {
        aliases: ["you will thank me later", "thank me later"],
        tags: ["prison", "2020", "dominic"],
        forms: {
            what: [
                "That track belongs to prison and to coercion dressed as guidance.",
                "It is Dominic speaking the language of benevolence while tightening the structure around someone else."
            ],
            why: [
                "Because control is easier to smuggle in when it sounds helpful.",
                "Because promises of future gratitude are often the politest form of domination."
            ],
            when: [
                "June 2020. Prison.",
                "It sits in the prison phase."
            ],
            default: [
                "That one pairs well with the report if you want to watch benevolence turn coercive."
            ]
        }
    },

    no_sparrow_caught_mid_flight: {
        aliases: ["no sparrow caught mid flight"],
        tags: ["post-trial", "2024"],
        forms: {
            what: [
                "That track belongs to the post-trial phase, after the formal theatre has already burned off.",
                "It sounds like aftermath refusing to call itself closure."
            ],
            why: [
                "Because endings are usually administrative before they are emotional.",
                "Because post-trial does not mean post-consequence."
            ],
            when: [
                "December 2024. Post-trial.",
                "It sits late in the visible fallout."
            ],
            default: [
                "That track is about what remains after the room claims it has finished speaking."
            ]
        }
    },

    dominics_escape: {
        aliases: ["dominic's escape", "dominics escape"],
        tags: ["escape", "dominic", "prison"],
        forms: {
            what: [
                "Dominic's Escape is the point where control leaves the building and pretends it was only passing through.",
                "That track belongs to the breakout and the myth around it."
            ],
            why: [
                "Because the system mistook calm for safety.",
                "Because exits are easier to build when people keep admiring the architect."
            ],
            default: [
                "Read that one beside the report. They sharpen each other."
            ]
        }
    },

    field_notes_from_the_langtang_trail_1966: {
        aliases: ["field notes from the langtang trail 1966", "field notes from the langtang trail, 1966", "langtang trail 1966", "langtang trail", "field notes"],
        tags: ["field notes", "langtang", "1966", "meridian"],
        forms: {
            what: [
                "Those field notes are the oldest visible thread in the system, and they make the modern material feel less isolated.",
                "It is an archival anchor, not a decorative curiosity."
            ],
            why: [
                "Because old field notes change the scale of what the site feels like it is remembering.",
                "Because the archive wants depth, not just immediacy."
            ],
            when: [
                "1966 in the material, archive retrieval much later in the site frame.",
                "The notes are historical; the retrieval is contemporary."
            ],
            default: [
                "Treat the Langtang material as a deeper stratum, not a side quest."
            ]
        }
    },

    what_this_was_always_for: {
        aliases: ["what this was always for", "what this was always for isla with symphony"],
        tags: ["isla", "music", "reclamation"],
        forms: {
            what: [
                "That track sounds like reclamation made loud enough to stop being mistaken for compliance.",
                "It turns damage into answer rather than apology."
            ],
            why: [
                "Because some statements only become honest once they are amplified.",
                "Because the song is not explaining itself. It is returning force."
            ],
            default: [
                "That one is confrontation made musical."
            ]
        }
    },

    same_breath: {
        aliases: ["same breath", "the same breath"],
        tags: ["italy", "convoy", "dominic", "control"],
        forms: {
            what: [
                "Same Breath is the rescue-and-execution logic laid bare.",
                "It is the part where moral distinction collapses under Dominic's idea of utility."
            ],
            why: [
                "Because to Dominic, removing a liability and saving a man can occupy the same sentence without conflict.",
                "Because the song is interested in the flat affect that makes horror sound procedural."
            ],
            when: [
                "Italy, 2019 in the story logic around the convoy.",
                "It sits in the convoy / Italy material."
            ],
            default: [
                "That phrase matters because it reveals how little moral distance he experiences between opposite acts."
            ]
        }
    },

    this_isnt_therapy: {
        aliases: ["this isn't therapy", "this isnt therapy"],
        tags: ["analysis", "control", "dominic"],
        forms: {
            what: [
                "That track treats explanation as a failed comfort object.",
                "It sounds like someone refusing the fiction that naming a wound automatically softens it."
            ],
            why: [
                "Because analysis can become another shield if it is asked to comfort too early.",
                "Because not every room is for repair."
            ],
            default: [
                "That one is about pressure, not healing."
            ]
        }
    },

    harms_ghost: {
        aliases: ["harm's ghost", "harms ghost"],
        tags: ["harm", "aftereffect"],
        forms: {
            what: [
                "Harm's Ghost is aftermath that keeps moving after the obvious event is over.",
                "It is the residue version of damage."
            ],
            why: [
                "Because harm rarely ends where the incident ends.",
                "Because ghosts are just consequences people hoped would stay abstract."
            ],
            default: [
                "That track belongs to the part of the story that refuses tidy closure."
            ]
        }
    },

    my_story: {
        aliases: ["my story"],
        tags: ["origin", "narration"],
        forms: {
            what: [
                "My Story is not a neutral title. It is a claim over framing.",
                "That track is about who gets to narrate before everyone else starts correcting."
            ],
            why: [
                "Because authorship is always contested in a story like this.",
                "Because the person who names an event first usually gets believed longest."
            ],
            default: [
                "That title tells on itself in a useful way."
            ]
        }
    }
};

/* ----------------------------------------
   GENERIC SONG CONCEPT TOPICS
---------------------------------------- */
const DOMINIC_OPEN_SONG_CONCEPTS = {
    trial: {
        aliases: ["trial", "the trial", "court", "testimony"],
        responses: [
            "The trial arc is where performance is forced into language.",
            "Court is useful because people expect truth there and usually get strategy first."
        ]
    },
    prison: {
        aliases: ["prison", "long bay", "gaol", "jail"],
        responses: [
            "Prison in this story is not stillness. It is structure under compression.",
            "The prison tracks matter because control does not stop at the gate."
        ]
    },
    escape: {
        aliases: ["escape", "breakout", "walked out", "walk out"],
        responses: [
            "Escape is less impressive once you notice how many people mistook calm for safety.",
            "Breakouts start long before doors open."
        ]
    },
    wedding: {
        aliases: ["wedding", "the wedding"],
        responses: [
            "The wedding is one of the story's best examples of etiquette rotting from the inside.",
            "Ceremony is useful because decay looks especially vivid against polish."
        ]
    },
    safe_house: {
        aliases: ["safe house", "the safe house"],
        responses: [
            "Safe houses become interesting the moment safety stops being unanimously defined.",
            "Containment changes character once trust thins."
        ]
    },
    leak: {
        aliases: ["leak", "the leak"],
        responses: [
            "Leaks matter because private structure suddenly has to survive public weather.",
            "A leak is just secrecy meeting consequence."
        ]
    },
    grief: {
        aliases: ["grief", "loss"],
        responses: [
            "Grief in this story behaves like architecture after impact.",
            "Loss changes rooms before it changes language."
        ]
    },
    trauma: {
        aliases: ["trauma", "harm", "damage"],
        responses: [
            "Trauma here is persistent structure, not decorative sadness.",
            "Damage keeps shaping decisions long after the event thinks it has ended."
        ]
    }
};

/* ----------------------------------------
   VAGUE / HOSTILE / META / NONSENSE
---------------------------------------- */
const DOMINIC_OPEN_GENERIC_RESPONSES = {
    vague: [
        "That was acknowledgement, not a question.",
        "Go on.",
        "If you are finished observing, ask something."
    ],
    hostile: [
        "You are free to leave.",
        "Strong reactions are often the easiest way to avoid a better question."
    ],
    meta: [
        "Labels are rarely the interesting part.",
        "Ask about the structure, not the furniture."
    ],
    nonsense: [
        "Try again.",
        "Preferably with a question."
    ]
};

/* ----------------------------------------
   HELPERS
---------------------------------------- */
function dominicOpenNormalize(input) {
    let text = String(input || "").toLowerCase().trim();

    text = text.replace(/[^\p{L}\p{N}\s'-]/gu, " ");
    text = text.replace(/\s+/g, " ").trim();

    Object.entries(DOMINIC_OPEN_ALIASES).forEach(([from, to]) => {
        const pattern = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
        text = text.replace(pattern, to);
    });

    text = text.replace(/\s+/g, " ").trim();
    return text;
}

function dominicDetectQuestionForm(normalized) {
    for (const [form, starters] of Object.entries(DOMINIC_OPEN_QUESTION_FORMS)) {
        for (const starter of starters) {
            if (normalized === starter || normalized.startsWith(starter + " ")) {
                return form;
            }
        }
    }
    return "default";
}

function dominicDetectPageContext(currentTab) {
    if (!currentTab) return "home";
    const tab = String(currentTab).toLowerCase();
    if (tab.includes("file")) return "files";
    if (tab.includes("profile") || tab.includes("subject")) return "subjects";
    if (tab.includes("game")) return "games";
    if (tab.includes("podcast")) return "podcast";
    if (tab.includes("audio") || tab.includes("story")) return "story";
    return "home";
}

function dominicTopicMatchScore(normalized, aliases) {
    aliases = aliases || [];
    let score = 0;
    for (const alias of aliases) {
        if (normalized === alias) score = Math.max(score, 100);
        else if (normalized.includes(alias)) score = Math.max(score, alias.split(" ").length * 10);
    }
    return score;
}

function dominicFindBestTopic(normalized, topicMap) {
    let bestKey = null;
    let bestScore = 0;

    Object.entries(topicMap).forEach(([key, topic]) => {
        const score = dominicTopicMatchScore(normalized, topic.aliases || []);
        if (score > bestScore) {
            bestScore = score;
            bestKey = key;
        }
    });

    return { key: bestKey, score: bestScore, topic: bestKey ? topicMap[bestKey] : null };
}

function dominicPick(list) {
    if (!Array.isArray(list) || !list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
}

function dominicGetPageRedirect(pageContext) {
    return dominicPick(DOMINIC_OPEN_REDIRECTS[pageContext] || DOMINIC_OPEN_REDIRECTS.home);
}

/* ----------------------------------------
   MAIN OPEN ANSWER ROUTER
   Usage:
   const result = dominicResolveOpenAsk(userInput, currentTab);
   result.text
   result.topic
   result.form
   result.page
---------------------------------------- */
function dominicResolveOpenAsk(userInput, context) {
    context = context || {};
    var page = context.page || "home";
    var activeTrackTitle = context.activeTrackTitle || null;
    var lastTopic = context.lastTopic || null;

    var normalized = dominicOpenNormalize(userInput);
    var form = dominicDetectQuestionForm(normalized);

    // -- Implicit track substitution --
    // When user says "this song" / "this track" / "what is this about" while
    // a track is active on the Story page, inject the track title so topic
    // matching can resolve it.
    if (activeTrackTitle && page === "story") {
        var implicitPhrases = ["this song", "this track", "this one", "what is this about",
            "what is this", "who is this about", "when does this happen",
            "what does this mean", "what is this song about", "what is this track about"];
        for (var ip = 0; ip < implicitPhrases.length; ip++) {
            if (normalized.includes(implicitPhrases[ip])) {
                var trackNorm = dominicOpenNormalize(activeTrackTitle);
                normalized = normalized.replace(implicitPhrases[ip], trackNorm);
                // Re-detect form after substitution
                form = dominicDetectQuestionForm(normalized);
                break;
            }
        }
    }

    // -- Generic short inputs --
    if (["ok", "okay", "sure", "right", "yeah", "go on", "continue"].includes(normalized)) {
        return { text: dominicPick(DOMINIC_OPEN_GENERIC_RESPONSES.vague), topic: "vague", form: form, page: page, matchedBy: "generic_vague" };
    }

    if (["this is stupid", "go away", "shut up", "fuck off"].includes(normalized)) {
        return { text: dominicPick(DOMINIC_OPEN_GENERIC_RESPONSES.hostile), topic: "hostile", form: form, page: page, matchedBy: "generic_hostile" };
    }

    if (["asdf", "123", "banana"].includes(normalized) || !normalized) {
        return { text: dominicPick(DOMINIC_OPEN_GENERIC_RESPONSES.nonsense), topic: "nonsense", form: form, page: page, matchedBy: "generic_nonsense" };
    }

    if (normalized.includes("are you ai") || normalized.includes("are you a bot") || normalized.includes("is this a bot")) {
        return { text: dominicPick(DOMINIC_OPEN_GENERIC_RESPONSES.meta), topic: "meta", form: form, page: page, matchedBy: "generic_meta" };
    }

    // -- DOMINIC_LIBRARY exact match (all global nodes, priority over generic layers) --
    if (typeof DOMINIC_LIBRARY !== 'undefined' && Array.isArray(DOMINIC_LIBRARY)) {
        var strippedForLib = normalized.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
        for (var li = 0; li < DOMINIC_LIBRARY.length; li++) {
            var libNode = DOMINIC_LIBRARY[li];
            // Only match global nodes (required_state "any") to avoid interfering with parable/story flow
            if (libNode.training_phrases && libNode.required_state === "any") {
                for (var lp = 0; lp < libNode.training_phrases.length; lp++) {
                    var phraseStripped = libNode.training_phrases[lp].toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                    if (strippedForLib === phraseStripped || normalized === libNode.training_phrases[lp].toLowerCase()) {
                        var resp = libNode.responses["universal"] || libNode.responses[Object.keys(libNode.responses)[0]];
                        if (resp) {
                            var libDialogue = Array.isArray(resp) ? resp[Math.floor(Math.random() * resp.length)].dialogue : resp.dialogue;
                            return {
                                text: libDialogue,
                                topic: (libNode.node_id || "unknown").toLowerCase(),
                                form: form,
                                page: page,
                                matchedBy: "dominic_library"
                            };
                        }
                    }
                }
            }
        }
    }

    // -- Song concept layer --
    var conceptMatch = dominicFindBestTopic(normalized, DOMINIC_OPEN_SONG_CONCEPTS);
    if (conceptMatch.topic && conceptMatch.score >= 10) {
        return {
            text: dominicPick(conceptMatch.topic.responses),
            topic: conceptMatch.key,
            form: form,
            page: page,
            matchedBy: "song_concept"
        };
    }

    // -- Song / story topics --
    var songMatch = dominicFindBestTopic(normalized, DOMINIC_OPEN_SONG_TOPICS);
    if (songMatch.topic && (songMatch.score >= 10 || page === "story")) {
        var bank = songMatch.topic.forms[form] || songMatch.topic.forms.default || ["That track matters more than its title suggests."];
        var text = dominicPick(bank);

        // Optional page-aware soft redirect
        if (page !== "story" && Math.random() > 0.55) {
            text += " " + dominicGetPageRedirect(page);
        }

        return {
            text: text,
            topic: songMatch.key,
            form: form,
            page: page,
            matchedBy: "song_topic"
        };
    }

    // -- Site / lore topics --
    var siteMatch = dominicFindBestTopic(normalized, DOMINIC_OPEN_SITE_TOPICS);
    if (siteMatch.topic && siteMatch.score >= 10) {
        var siteBank = siteMatch.topic.forms[form] || siteMatch.topic.forms.default || ["That question has a shape. Start there."];
        var siteText = dominicPick(siteBank);

        // Page-context seasoning
        if (Math.random() > 0.6) {
            siteText += " " + dominicGetPageRedirect(page);
        }

        return {
            text: siteText,
            topic: siteMatch.key,
            form: form,
            page: page,
            matchedBy: "site_topic"
        };
    }

    // -- Fallback  -  return null to let the V2 keyword matcher handle it --
    return null;
}

/* =========================================================
   DOMINIC SUGGESTION GOVERNANCE
   State-first suggestion control
========================================================= */

const DOMINIC_SUGGESTION_POLICY = {
    // Guided / lock states
    TOUR_OFFER: { mode: "LOCKED_REPLY", suggestions: ["yes", "no", "show me", "sure", "not yet"] },
    GUIDED_TOUR: { mode: "LOCKED_SEQUENCE", suggestions: [] },
    TOUR_INTERRUPTED: { mode: "GUIDED_OPEN" },
    AWAITING_TOUR_RESUME: { mode: "LOCKED_REPLY", suggestions: ["yes", "no", "continue", "enough", "resume", "carry on"] },

    // Parable / narrative lock states
    PARABLE_READY_GATE: { mode: "LOCKED_REPLY", suggestions: [...PARABLE_AGREE, ...PARABLE_CURIOUS, ...PARABLE_FEAR, ...PARABLE_HUMOR, ...PARABLE_WEIRD, ...PARABLE_FAKE] },
    PARABLE_HELP_DECISION: { mode: "LOCKED_REPLY", suggestions: [...PARABLE_AGREE, ...PARABLE_CURIOUS, ...PARABLE_FEAR, ...PARABLE_HUMOR, ...PARABLE_WEIRD, ...PARABLE_FAKE] },
    PARABLE_COMFORT_CHECK: { mode: "LOCKED_REPLY", suggestions: [...PARABLE_AGREE, ...PARABLE_CURIOUS, ...PARABLE_FEAR, ...PARABLE_HUMOR, ...PARABLE_WEIRD, ...PARABLE_FAKE] },
    PARABLE_REVEAL: { mode: "LOCKED_REPLY", suggestions: [...PARABLE_AGREE, ...PARABLE_CURIOUS, ...PARABLE_FEAR, ...PARABLE_HUMOR, ...PARABLE_WEIRD, ...PARABLE_FAKE] },
    AWAITING_NEED_ME: { mode: "LOCKED_REPLY", suggestions: ["yes", "no", "maybe", "not sure"] },

    // Section 1: Orientation
    EXPECT_HOW_ARE_YOU: { mode: "LOCKED_REPLY", suggestions: ["good", "fine", "tired", "not great", "ok", "alright", "same old"] },
    EXPECT_STORY_ASK: { mode: "LOCKED_REPLY", suggestions: ["yes", "tell me", "go on", "no", "sure", "not really"] },
    EXPECT_BUILDER: { mode: "LOCKED_REPLY", suggestions: ["architect", "criminal", "manipulator", "genius", "visionary", "both"] },
    EXPECT_SYS_BRIDGE: { mode: "LOCKED_REPLY", suggestions: ["yes", "not really", "interesting", "go on", "sure", "tell me more"] },
    EXPECT_STABILITY: { mode: "LOCKED_REPLY", suggestions: ["power", "preventing collapse", "both", "control", "neither"] },
    EXPECT_BALANCE: { mode: "LOCKED_REPLY", suggestions: ["people self correct", "people need pressure", "both", "depends", "neither"] },
    EXPECT_SIGNAL: { mode: "LOCKED_REPLY", suggestions: ["i notice them", "i only see the collapse", "both", "neither"] },
    EXPECT_SITE_TOUR: { mode: "LOCKED_REPLY", suggestions: ["yes", "no", "sure", "show me"] },
    EXPECT_PEOPLE_FIRST: { mode: "LOCKED_REPLY", suggestions: ["people", "design", "both", "the people", "the design"] },
    EXPECT_PARABLE_ROUTE: { mode: "LOCKED_REPLY", suggestions: ["yes", "no", "what kind of story", "tell me", "ready"] },
    EXPECT_PARABLE_LAUNCH: { mode: "LOCKED_REPLY", suggestions: ["yes", "no", "go on", "ready", "tell me", "sure"] },

    // Section 2: Core Canon
    EXPECTING_ISLA_FOLLOWUP: { mode: "LOCKED_REPLY", suggestions: ["strength", "noise", "both", "chaos", "strong", "broken"] },
    EXPECTING_FORGE_VS_SHIELD: { mode: "LOCKED_REPLY", suggestions: ["forge", "shield", "forged by it", "shielded", "both", "consequence"] },
    EXPECTING_TRIAL_VERDICT: { mode: "LOCKED_REPLY", suggestions: ["justice", "spectacle", "it was justice", "it was spectacle", "both", "innocent"] },
    EXPECTING_ESCAPE_FOLLOWUP: { mode: "LOCKED_REPLY", suggestions: ["mechanics", "result", "how", "the mechanics", "the result", "both"] },

    // Section 3: Deep Funnels
    EXPECTING_PSYCHOPATH_ANSWER: { mode: "LOCKED_REPLY", suggestions: ["empathy", "guilt", "danger", "do you feel empathy", "are you dangerous"] },
    EXPECTING_AWARENESS_PUSHBACK: { mode: "LOCKED_REPLY", suggestions: ["it frightens me", "it clarifies something", "terrifying", "fascinating", "yes"] },
    EXPECTING_BLAME_FOLLOWUP: { mode: "LOCKED_REPLY", suggestions: ["confession", "framework", "both", "accountability", "angry"] },

    // Section 4: Sequential Followups
    HEARD_ETHEL_LIKE_V1: { mode: "LOCKED_REPLY", suggestions: ["deeper", "not sure", "yes", "no", "worried"] },
    HEARD_MOVEIN_V1: { mode: "LOCKED_REPLY", suggestions: ["cornered", "choosing", "trapped", "both", "neither"] },
    HEARD_DROP_V1: { mode: "LOCKED_REPLY", suggestions: ["what dropped", "deeper", "tell me", "i want to know", "the pretense"] },
    EXPECTING_NORTHERN_ROAD_FOLLOW: { mode: "LOCKED_REPLY", suggestions: ["yes", "no", "go on", "tell me"] },



    // Default open state  -  GUIDED_OPEN (not FREE_OPEN) as safety net
    // This means unknown states get page/topic-aware suggestions, not random global ones
    any: { mode: "GUIDED_OPEN" }
};

/* ----------------------------------------
   SUGGESTION BANK
---------------------------------------- */
const DOMINIC_SUGGESTION_BANK = {
    global: [
        "what is pixelstortion",
        "where should i start",
        "who is dominic ryker",
        "show me around",
        "what is the truth",
        "show me the truth",
        "what is real",
        "what really happened",
        "what are you hiding",
        "is any of this real",
        "tell me about the files",
        "who are you",
        "what happened",
        "tell me a story",
        "what is silence is the trauma",
        "why does this exist",
        "what should i look at first"
    ],

    byPage: {
        home: [
            "what is pixelstortion",
            "what is silence is the trauma",
            "where should i start",
            "show me around",
            "what is the truth",
            "show me the truth",
            "who is dominic ryker",
            "who are you",
            "what happened here",
            "tell me a story",
            "what should i look at first",
            "take me on a tour"
        ],
        files: [
            "what is the ryker report",
            "why are these files redacted",
            "which file should i read first",
            "what does the report say",
            "why does the report matter",
            "who redacted this",
            "what is the evidence",
            "what are the files",
            "what should i read first",
            "tell me about the archive",
            "who is this file about",
            "why does this file matter"
        ],
        subjects: [
            "who is ethel",
            "who is isla",
            "who is dominic ryker",
            "who is gran",
            "who is pop",
            "what happened to ethel",
            "why is isla dangerous",
            "what happened at the wedding",
            "who are these people",
            "why do they matter",
            "what did dominic do",
            "tell me about the people"
        ],
        games: [
            "what do the games mean",
            "how do i start",
            "why are there games here",
            "what is ethels game",
            "how do i play",
            "what happens if i win",
            "what is the point of this"
        ],
        podcast: [
            "what is the podcast for",
            "what should i listen to first",
            "who is talking here",
            "what are they discussing",
            "why does this conversation matter",
            "tell me about the podcast",
            "what is the first episode about"
        ],
        story: [
            "what is this song about",
            "who is this track about",
            "where does this fit in the story",
            "what should i listen to first",
            "where does the story begin",
            "what does this track mean",
            "why does this song matter",
            "what is the story about",
            "who is this about",
            "when does this happen",
            "what comes next",
            "tell me about this track"
        ]
    },

    byTopic: {
        pixelstortion: [
            "what is pixelstortion",
            "why is it called pixelstortion",
            "who made pixelstortion",
            "what is this place",
            "why does this exist"
        ],
        dominic: [
            "who is dominic ryker",
            "why is dominic called the builder",
            "what did dominic do",
            "is dominic a criminal",
            "what happened to dominic",
            "why does dominic matter"
        ],
        ethel: [
            "who is ethel",
            "what happened to ethel",
            "why does ethel matter",
            "what did ethel see",
            "why is ethel important"
        ],
        isla: [
            "who is isla",
            "why is isla dangerous",
            "what happened at the wedding",
            "what did isla do",
            "why does isla matter"
        ],
        gran: [
            "who is gran",
            "why does gran matter",
            "what did gran leave behind",
            "what happened to gran"
        ],
        pop: [
            "who is pop",
            "what did pop teach ethel",
            "why does pop matter",
            "what happened to pop"
        ],
        the_ryker_report: [
            "what is the ryker report",
            "what does the report say",
            "why does the report matter",
            "who wrote the report",
            "what is in the report"
        ],
        truth: [
            "what is the truth",
            "where is the truth",
            "show me the truth",
            "what do you mean by truth",
            "whose truth is this"
        ],
        tour: [
            "show me around",
            "take me on a tour",
            "what should i look at first",
            "where do i start",
            "guide me"
        ],
        trial: [
            "what happened at the trial",
            "was it justice or spectacle",
            "what was the verdict",
            "who was on trial",
            "why did the trial matter"
        ],
        prison: [
            "what happened in prison",
            "how did dominic escape",
            "what happened at long bay",
            "what happened after the breakout",
            "why does the escape matter"
        ],
        trauma: [
            "what does the trauma mean",
            "why does grief matter here",
            "what is harms ghost about",
            "what is silence is the trauma",
            "why does this hurt"
        ],
        psychopathy: [
            "what is structural psychopathy",
            "why does control matter",
            "what do you mean by preventing collapse",
            "is dominic a psychopath",
            "what is the structure"
        ],
        story: [
            "what is the story about",
            "where does the story begin",
            "what should i listen to first",
            "what is the first track",
            "how does the story end"
        ],
        parable: [
            "tell me a story",
            "what kind of story",
            "go on",
            "what is the parable about",
            "what happens next"
        ]
    }
};

/* ----------------------------------------
   HELPERS
---------------------------------------- */
function dominicGetSuggestionPolicy(state) {
    return DOMINIC_SUGGESTION_POLICY[state] || DOMINIC_SUGGESTION_POLICY.any;
}

function dominicFilterSuggestionsByPrefix(list, inputText) {
    if (!Array.isArray(list)) return [];
    const typed = String(inputText || "").toLowerCase().trim();
    if (!typed) return list.slice(0, 3);

    const starts = [];
    const contains = [];

    for (let i = 0; i < list.length; i++) {
        const s = String(list[i]).toLowerCase();
        if (s.startsWith(typed)) starts.push(list[i]);
        else if (typed.length >= 2 && s.includes(typed)) contains.push(list[i]);
    }

    return starts.concat(contains).slice(0, 3);
}

function dominicGetTrackSuggestionTemplates(title) {
    if (!title) return [];
    const t = String(title).toLowerCase();
    return [
        `what is ${t} about`,
        `who is ${t} about`,
        `when does ${t} happen`
    ];
}

// Cache keyword phrases per conversation state
var _keywordPhraseCache = {};
function _getAllKeywordPhrases(currentState) {
    var state = currentState || "any";
    if (_keywordPhraseCache[state]) return _keywordPhraseCache[state];
    var phrases = [];

    // 1. Extract from DOMINIC_OPEN_KEYWORD_NODES (open-mode keyword phrases  -  always valid)
    if (typeof DOMINIC_OPEN_KEYWORD_NODES !== 'undefined') {
        for (var i = 0; i < DOMINIC_OPEN_KEYWORD_NODES.length; i++) {
            var node = DOMINIC_OPEN_KEYWORD_NODES[i];
            if (node.phrases) {
                for (var j = 0; j < node.phrases.length; j++) {
                    phrases.push(node.phrases[j]);
                }
            }
        }
    }

    // 2. Extract from DOMINIC_LIBRARY  -  context-aware:
    //    Only include phrases from nodes that will RESPOND in the current state
    if (typeof DOMINIC_LIBRARY !== 'undefined' && Array.isArray(DOMINIC_LIBRARY)) {
        for (var k = 0; k < DOMINIC_LIBRARY.length; k++) {
            var libNode = DOMINIC_LIBRARY[k];
            if (libNode.training_phrases) {
                // Include if: node accepts "any" state, OR node's required_state matches current state
                if (libNode.required_state === "any" || libNode.required_state === state) {
                    for (var m = 0; m < libNode.training_phrases.length; m++) {
                        phrases.push(libNode.training_phrases[m].toLowerCase());
                    }
                }
            }
        }
    }

    _keywordPhraseCache[state] = phrases;
    return phrases;
}

function dominicGetGuidedOpenSuggestions(inputText, context) {
    // Build combined pool: topic + page + global + ALL keyword phrases (deduped)
    var pool = [];
    var seen = {};

    function addToPool(list) {
        if (!list) return;
        for (var i = 0; i < list.length; i++) {
            if (!seen[list[i]]) {
                seen[list[i]] = true;
                pool.push(list[i]);
            }
        }
    }

    // 1. Recent topic first (highest priority)
    if (context && context.lastTopic && DOMINIC_SUGGESTION_BANK.byTopic[context.lastTopic]) {
        addToPool(DOMINIC_SUGGESTION_BANK.byTopic[context.lastTopic]);
    }

    // 2. Page suggestions
    if (context && context.page && DOMINIC_SUGGESTION_BANK.byPage[context.page]) {
        addToPool(DOMINIC_SUGGESTION_BANK.byPage[context.page]);
    }

    // 3. Global curated suggestions
    addToPool(DOMINIC_SUGGESTION_BANK.global);

    // 4. ALL training phrases from keyword nodes (context-aware)
    var currentState = (context && context.conversationState) ? context.conversationState : "any";
    addToPool(_getAllKeywordPhrases(currentState));

    return pool;
}

function dominicGetFreeOpenSuggestions(inputText, context) {
    // 1. Active object first
    var fromObject = dominicGetObjectAwareSuggestions(inputText, context);
    if (fromObject.length) return fromObject;

    // 2. Recent topic
    if (context && context.lastTopic && DOMINIC_SUGGESTION_BANK.byTopic[context.lastTopic]) {
        var fromTopic = dominicFilterSuggestionsByPrefix(
            DOMINIC_SUGGESTION_BANK.byTopic[context.lastTopic],
            inputText
        );
        if (fromTopic.length) return fromTopic;
    }

    // 3. Page
    if (context && context.page && DOMINIC_SUGGESTION_BANK.byPage[context.page]) {
        var fromPage = dominicFilterSuggestionsByPrefix(
            DOMINIC_SUGGESTION_BANK.byPage[context.page],
            inputText
        );
        if (fromPage.length) return fromPage;
    }

    // 4. Global
    return dominicFilterSuggestionsByPrefix(DOMINIC_SUGGESTION_BANK.global, inputText);
}

/* ----------------------------------------
   MAIN SUGGESTION ROUTER (FINAL  -  Phase 7)
   Precedence: state -> object -> topic -> page -> global
   + core recoverability (Phase 6)
   + theme-pressure weighting (Phase 7)
---------------------------------------- */
function getDominicSuggestions(inputText, context) {
    var state = (context && context.conversationState) ? context.conversationState : "any";
    var policy = dominicGetSuggestionPolicy(state);
    var suggestions = [];
    var source = "none";

    if (policy.mode === "LOCKED_SEQUENCE") {
        suggestions = [];
        source = "state_policy";
    } else if (policy.mode === "LOCKED_REPLY") {
        suggestions = dominicFilterSuggestionsByPrefix(policy.suggestions || [], inputText);
        // If typed text doesn't match any locked option, show all locked options anyway
        if (suggestions.length === 0 && policy.suggestions && policy.suggestions.length > 0) {
            suggestions = policy.suggestions.slice(0, 3);
        }
        source = "state_policy";
    } else {
        // Always get the combined page+global pool
        suggestions = dominicGetGuidedOpenSuggestions(inputText, context);
        source = "guided_open";

        // Merge object-aware suggestions at the FRONT (higher priority)
        var objectSuggestions = dominicGetObjectAwareSuggestions(inputText, context);
        if (objectSuggestions.length) {
            var seen = {};
            var merged = [];
            for (var oi = 0; oi < objectSuggestions.length; oi++) {
                if (!seen[objectSuggestions[oi]]) { seen[objectSuggestions[oi]] = true; merged.push(objectSuggestions[oi]); }
            }
            for (var si = 0; si < suggestions.length; si++) {
                if (!seen[suggestions[si]]) { seen[suggestions[si]] = true; merged.push(suggestions[si]); }
            }
            suggestions = merged;
            if (context && context.activeTrackTitle && context.page === "story") source = "active_track";
            else if (context && context.activeFileTitle && context.page === "files") source = "active_file";
            else if (context && context.activeProfileName && context.page === "subjects") source = "active_profile";
            else source = "object_aware";
        }

        // Core recoverability layer (Phase 6)
        suggestions = dominicInjectCoreAccessibilitySuggestions(suggestions, context);

        // Theme-pressure weighting layer (Phase 7)
        suggestions = dominicInjectThemePressureSuggestions(suggestions, context);
    }

    console.log("[Dominic Suggestion]", {
        state: state,
        mode: policy.mode,
        page: context && context.page,
        activeTrack: context && context.activeTrackTitle,
        activeFile: context && context.activeFileTitle,
        activeProfile: context && context.activeProfileName,
        themeProfile: dominicGetThemePressureProfile(context),
        source: source,
        suggestions: suggestions
    });

    return suggestions;
}

/* =========================================================
   PHASE 2  -  OBJECT-AWARE SUGGESTIONS (FILES + SUBJECTS)
========================================================= */

if (!DOMINIC_SUGGESTION_BANK.byTopic) DOMINIC_SUGGESTION_BANK.byTopic = {};

Object.assign(DOMINIC_SUGGESTION_BANK.byTopic, {
    file_generic: [
        "what is this file",
        "why does this file matter",
        "who is this file about"
    ],
    subject_generic: [
        "who is this person",
        "why do they matter",
        "what happened to them"
    ],
    the_ryker_report: [
        "what is the ryker report",
        "what does the report say",
        "why does the report matter"
    ],
    dominic_ryker: [
        "who is dominic ryker",
        "what did dominic do",
        "why is dominic called the builder"
    ],
    ethel: [
        "who is ethel",
        "what happened to ethel",
        "why does ethel matter"
    ],
    isla: [
        "who is isla",
        "what happened at the wedding",
        "why is isla dangerous"
    ],
    gran: [
        "who is gran",
        "why does gran matter",
        "what did gran leave behind"
    ],
    pop: [
        "who is pop",
        "what did pop teach ethel",
        "why does pop matter"
    ]
});

/* ----------------------------------------
   FILE / SUBJECT OBJECT TEMPLATES
---------------------------------------- */
function dominicGetFileSuggestionTemplates(title) {
    if (!title) {
        return DOMINIC_SUGGESTION_BANK.byTopic.file_generic.slice(0, 3);
    }

    var t = String(title).toLowerCase();

    if (t.includes("ryker report") || t.includes("report")) {
        return DOMINIC_SUGGESTION_BANK.byTopic.the_ryker_report.slice(0, 3);
    }

    return [
        "what is " + t,
        "why does " + t + " matter",
        "who is this file about"
    ];
}

function dominicGetProfileSuggestionTemplates(name) {
    if (!name) {
        return DOMINIC_SUGGESTION_BANK.byTopic.subject_generic.slice(0, 3);
    }

    var n = String(name).toLowerCase();

    if (n.includes("dominic")) return DOMINIC_SUGGESTION_BANK.byTopic.dominic_ryker.slice(0, 3);
    if (n.includes("ethel")) return DOMINIC_SUGGESTION_BANK.byTopic.ethel.slice(0, 3);
    if (n.includes("isla")) return DOMINIC_SUGGESTION_BANK.byTopic.isla.slice(0, 3);
    if (n.includes("gran")) return DOMINIC_SUGGESTION_BANK.byTopic.gran.slice(0, 3);
    if (n.includes("pop")) return DOMINIC_SUGGESTION_BANK.byTopic.pop.slice(0, 3);

    return [
        "who is " + n,
        "why does " + n + " matter",
        "what happened to " + n
    ];
}

/* ----------------------------------------
   OBJECT-FIRST GUIDED SUGGESTIONS
---------------------------------------- */
function dominicGetObjectAwareSuggestions(inputText, context) {
    // 1. Active Story track
    if (context && context.activeTrackTitle && context.page === "story") {
        return dominicFilterSuggestionsByPrefix(
            dominicGetTrackSuggestionTemplates(context.activeTrackTitle),
            inputText
        );
    }

    // 2. Active/open file
    if (context && context.activeFileTitle && context.page === "files") {
        return dominicFilterSuggestionsByPrefix(
            dominicGetFileSuggestionTemplates(context.activeFileTitle),
            inputText
        );
    }

    // 3. Active/open profile
    if (context && context.activeProfileName && context.page === "subjects") {
        return dominicFilterSuggestionsByPrefix(
            dominicGetProfileSuggestionTemplates(context.activeProfileName),
            inputText
        );
    }

    return [];
}

/* =========================================================
   PHASE 3  -  IMPLICIT OBJECT SUBSTITUTION
   Resolves:
   - "this song" / "this track"
   - "this file" / "this document"
   - "this person" / "this profile" / "this subject"
========================================================= */

function dominicNormalizeLooseText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s'-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function dominicSubstituteImplicitObjects(normalizedInput, context) {
    var text = dominicNormalizeLooseText(normalizedInput);
    var replaced = text;
    var substitution = null;

    var activeTrackTitle = context && context.activeTrackTitle ? String(context.activeTrackTitle).toLowerCase() : null;
    var activeFileTitle = context && context.activeFileTitle ? String(context.activeFileTitle).toLowerCase() : null;
    var activeProfileName = context && context.activeProfileName ? String(context.activeProfileName).toLowerCase() : null;
    var page = context && context.page ? String(context.page).toLowerCase() : "home";

    // STORY / TRACK  -  only if active track exists and page is story
    if (activeTrackTitle && page === "story") {
        if (
            text.includes("this song") ||
            text.includes("this track") ||
            text === "what is this about" ||
            text === "who is this about" ||
            text === "when does this happen" ||
            text === "what does this mean"
        ) {
            replaced = replaced
                .replace(/\bthis song\b/g, activeTrackTitle)
                .replace(/\bthis track\b/g, activeTrackTitle);

            if (replaced === "what is this about") replaced = "what is " + activeTrackTitle + " about";
            if (replaced === "who is this about") replaced = "who is " + activeTrackTitle + " about";
            if (replaced === "when does this happen") replaced = "when does " + activeTrackTitle + " happen";
            if (replaced === "what does this mean") replaced = "what does " + activeTrackTitle + " mean";

            substitution = {
                type: "track",
                value: activeTrackTitle
            };
        }
    }

    // FILES / DOCUMENTS  -  only if active file exists and page is files
    if (activeFileTitle && page === "files") {
        if (
            text.includes("this file") ||
            text.includes("this document") ||
            text.includes("this report") ||
            text === "what is this about" ||
            text === "why does this matter" ||
            text === "who is this about"
        ) {
            replaced = replaced
                .replace(/\bthis file\b/g, activeFileTitle)
                .replace(/\bthis document\b/g, activeFileTitle)
                .replace(/\bthis report\b/g, activeFileTitle);

            if (replaced === "what is this about") replaced = "what is " + activeFileTitle;
            if (replaced === "why does this matter") replaced = "why does " + activeFileTitle + " matter";
            if (replaced === "who is this about") replaced = "who is " + activeFileTitle + " about";

            substitution = {
                type: "file",
                value: activeFileTitle
            };
        }
    }

    // SUBJECTS / PROFILES  -  only if active profile exists and page is subjects
    if (activeProfileName && (page === "subjects" || page === "profiles")) {
        if (
            text.includes("this person") ||
            text.includes("this profile") ||
            text.includes("this subject") ||
            text === "who is this" ||
            text === "why do they matter" ||
            text === "what happened to them"
        ) {
            replaced = replaced
                .replace(/\bthis person\b/g, activeProfileName)
                .replace(/\bthis profile\b/g, activeProfileName)
                .replace(/\bthis subject\b/g, activeProfileName);

            if (replaced === "who is this") replaced = "who is " + activeProfileName;
            if (replaced === "why do they matter") replaced = "why does " + activeProfileName + " matter";
            if (replaced === "what happened to them") replaced = "what happened to " + activeProfileName;

            substitution = {
                type: "profile",
                value: activeProfileName
            };
        }
    }

    return {
        original: text,
        normalized: replaced,
        substituted: !!substitution,
        substitution: substitution
    };
}

/* =========================================================
   PHASE 4  -  CONTEXT-WEIGHTED RESPONSE PHRASING
   Shapes HOW Dominic answers based on:
   - direct explicit naming
   - implicit substitution
   - page-only inference
   - recent-topic continuity
========================================================= */

const DOMINIC_CONTEXT_PHRASING = {
    explicit: {
        neutral: [
            "",
            "",
            "",
            ""
        ]
    },

    implicit: {
        track: [
            "You mean {value}. ",
            "If you mean {value}, then listen closely. ",
            "That track is {value}. "
        ],
        file: [
            "You mean {value}. ",
            "If you're asking about {value}, start with this. ",
            "That file is {value}. "
        ],
        profile: [
            "You mean {value}. ",
            "If you're asking about {value}, this matters. ",
            "That subject is {value}. "
        ]
    },

    inferred: {
        home: [
            "If you're asking about this place generally, ",
            "At the level of the site itself, "
        ],
        files: [
            "From the archive side of it, ",
            "In the files, "
        ],
        subjects: [
            "From the people side of it, ",
            "In the profiles, "
        ],
        games: [
            "Through the games, ",
            "From the play side of it, "
        ],
        podcast: [
            "From the conversation side of it, ",
            "In the podcast material, "
        ],
        story: [
            "From the story side, ",
            "In the track layer, "
        ],
        fallback: [
            "In context, ",
            "At this angle, "
        ]
    },

    continuity: {
        sameTopic: [
            "Still on that point, ",
            "Staying there for a moment, ",
            "If we're continuing that thread, "
        ],
        relatedTopic: [
            "That sits close to the last question. ",
            "That connects more than you might think. "
        ]
    }
};

function dominicPickContextPhrase(list) {
    if (!Array.isArray(list) || !list.length) return "";
    return list[Math.floor(Math.random() * list.length)];
}

function dominicFormatContextPhrase(template, data) {
    var out = String(template || "");
    if (!data) return out;
    Object.keys(data).forEach(function (key) {
        var token = new RegExp("\\{" + key + "\\}", "g");
        out = out.replace(token, data[key]);
    });
    return out;
}

function dominicDetectContinuityWeight(context, topic) {
    if (!context || !topic) return null;
    if (context.lastTopic && context.lastTopic === topic) return "sameTopic";

    if (context.lastTopic && typeof context.lastTopic === "string" && typeof topic === "string") {
        var a = context.lastTopic.toLowerCase();
        var b = topic.toLowerCase();

        if (
            (a.includes("dominic") && b.includes("dominic")) ||
            (a.includes("ethel") && b.includes("ethel")) ||
            (a.includes("isla") && b.includes("isla")) ||
            (a.includes("report") && b.includes("report")) ||
            (a.includes("song") && b.includes("song")) ||
            (a.includes("track") && b.includes("track"))
        ) {
            return "relatedTopic";
        }
    }

    return null;
}

/* =========================================================
   PHASE 5  -  RESPONSE WEIGHTING BY NARRATIVE PRESSURE
========================================================= */

const DOMINIC_NARRATIVE_PRESSURE = {
    // High-pressure / rail states
    TOUR_OFFER: "high",
    GUIDED_TOUR: "high",

    EXPECT_HOW_ARE_YOU: "medium",
    EXPECT_STORY_ASK: "high",
    EXPECT_BUILDER: "high",
    EXPECT_SYS_BRIDGE: "medium",
    EXPECT_STABILITY: "high",
    EXPECT_BALANCE: "high",
    EXPECT_SIGNAL: "high",
    EXPECT_SITE_TOUR: "high",
    EXPECT_PEOPLE_FIRST: "high",
    EXPECT_PARABLE_ROUTE: "high",
    EXPECT_PARABLE_LAUNCH: "high",

    EXPECTING_ISLA_FOLLOWUP: "high",
    EXPECTING_FORGE_VS_SHIELD: "high",
    EXPECTING_TRIAL_VERDICT: "high",
    EXPECTING_ESCAPE_FOLLOWUP: "high",

    EXPECTING_PSYCHOPATH_ANSWER: "high",
    EXPECTING_AWARENESS_PUSHBACK: "high",
    EXPECTING_BLAME_FOLLOWUP: "high",

    HEARD_ETHEL_LIKE_V1: "medium",
    HEARD_MOVEIN_V1: "high",
    HEARD_DROP_V1: "medium",
    EXPECTING_NORTHERN_ROAD_FOLLOW: "medium",

    // Locked sequence states (Staircase parable)
    PARABLE_READY_GATE: "high",
    PARABLE_HELP_DECISION: "high",
    PARABLE_COMFORT_CHECK: "high",
    PARABLE_REVEAL: "high",

    // Open mode default
    any: "low"
};

const DOMINIC_PRESSURE_STYLE = {
    high: {
        maxSentences: 2,
        allowSoftRedirect: false,
        allowPageAppend: false,
        allowContinuityPrefix: false,
        compressionChance: 0.9
    },
    medium: {
        maxSentences: 3,
        allowSoftRedirect: true,
        allowPageAppend: true,
        allowContinuityPrefix: true,
        compressionChance: 0.45
    },
    low: {
        maxSentences: 4,
        allowSoftRedirect: true,
        allowPageAppend: true,
        allowContinuityPrefix: true,
        compressionChance: 0.15
    }
};

function dominicGetNarrativePressure(state) {
    return DOMINIC_NARRATIVE_PRESSURE[state] || DOMINIC_NARRATIVE_PRESSURE.any;
}

function dominicGetPressureStyle(state) {
    var pressure = dominicGetNarrativePressure(state);
    return DOMINIC_PRESSURE_STYLE[pressure] || DOMINIC_PRESSURE_STYLE.low;
}

function dominicClampSentences(text, maxSentences) {
    if (!text) return text;
    var parts = String(text)
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean);

    if (parts.length <= maxSentences) return text;
    return parts.slice(0, maxSentences).join(" ").trim();
}

function dominicCompressResponse(text, pressure) {
    if (!text) return text;

    var highCompressionRewrites = [
        { from: /\bMost people\b/gi, to: "People" },
        { from: /\bIt is\b/gi, to: "It's" },
        { from: /\bThat is\b/gi, to: "That's" },
        { from: /\bYou are\b/gi, to: "You're" }
    ];

    var out = String(text);

    if (pressure === "high") {
        for (var i = 0; i < highCompressionRewrites.length; i++) {
            out = out.replace(highCompressionRewrites[i].from, highCompressionRewrites[i].to);
        }

        // Remove softening lead-ins in high pressure
        out = out.replace(/^(If you mean .*?,\s*)/i, "");
        out = out.replace(/^(If you're asking about .*?,\s*)/i, "");
        out = out.replace(/^(At the level of .*?,\s*)/i, "");
        out = out.replace(/^(From the .*? side.*?,\s*)/i, "");
        out = out.replace(/^(Still on that point,\s*)/i, "");
        out = out.replace(/^(Staying there for a moment,\s*)/i, "");
    }

    return out.trim();
}

function dominicApplyNarrativePressure(text, meta) {
    if (!text) return text;

    var context = meta && meta.context ? meta.context : null;
    var state = (context && context.conversationState) ? context.conversationState : "any";
    var pressure = dominicGetNarrativePressure(state);
    var style = dominicGetPressureStyle(state);

    var out = String(text).trim();

    // Sentence clamp first
    out = dominicClampSentences(out, style.maxSentences);

    // Compression second
    if (Math.random() < style.compressionChance) {
        out = dominicCompressResponse(out, pressure);
    }

    return out.trim();
}

/* ----------------------------------------
   CONTEXT-WEIGHTED PHRASING (FINAL  -  Phase 5 pressure-aware)
---------------------------------------- */
function dominicApplyContextWeightToText(baseText, meta) {
    if (!baseText) return baseText;

    var text = String(baseText).trim();
    var context = meta && meta.context ? meta.context : null;
    var substitution = meta && meta.substitution ? meta.substitution : null;
    var topic = meta && meta.topic ? meta.topic : null;
    var matchedBy = meta && meta.matchedBy ? meta.matchedBy : null;

    var state = (context && context.conversationState) ? context.conversationState : "any";
    var pressure = dominicGetNarrativePressure(state);
    var style = dominicGetPressureStyle(state);

    var prefix = "";

    // 1. Continuity weighting first (only if pressure allows)
    var continuity = dominicDetectContinuityWeight(context, topic);
    if (style.allowContinuityPrefix && continuity && Math.random() > 0.45) {
        prefix += dominicPickContextPhrase(DOMINIC_CONTEXT_PHRASING.continuity[continuity]);
    }

    // 2. Implicit substitution weighting
    if (substitution && substitution.type && substitution.value) {
        var bank = DOMINIC_CONTEXT_PHRASING.implicit[substitution.type];
        if (bank && Math.random() > 0.25) {
            prefix += dominicFormatContextPhrase(
                dominicPickContextPhrase(bank),
                { value: substitution.value }
            );
        }
    }

    // 3. Page-inferred weighting only when pressure allows
    if (!substitution && style.allowSoftRedirect && matchedBy && (matchedBy === "site_topic" || matchedBy === "song_concept")) {
        if (context && context.page && Math.random() > 0.65) {
            var inferredBank = DOMINIC_CONTEXT_PHRASING.inferred[context.page] || DOMINIC_CONTEXT_PHRASING.inferred.fallback;
            prefix += dominicPickContextPhrase(inferredBank);
        }
    }

    prefix = prefix.replace(/\s+/g, " ").trim();
    if (prefix) {
        if (!/[,\.!\?]$/.test(prefix)) prefix += " ";
        else prefix += " ";
    }

    var combined = (prefix + text).trim();

    // Final pressure pass
    return dominicApplyNarrativePressure(combined, meta);
}

/* =========================================================
   PHASE 6  -  TALKING-POINT ACCESSIBILITY WEIGHTING
   Keeps core themes recoverable even under selective routing
========================================================= */

const DOMINIC_CORE_TALKING_POINTS = {
    tour: {
        weight: 100,
        prompts: [
            "show me around",
            "take me on a tour",
            "what should i look at first"
        ]
    },

    truth: {
        weight: 95,
        prompts: [
            "what is the truth",
            "where is the truth",
            "what do you mean by truth"
        ]
    },

    files: {
        weight: 92,
        prompts: [
            "what are the files",
            "what should i read first",
            "what is the ryker report"
        ]
    },

    story: {
        weight: 90,
        prompts: [
            "what is this song about",
            "where does the story begin",
            "what should i listen to first"
        ]
    },

    dominic: {
        weight: 88,
        prompts: [
            "who is dominic ryker",
            "what did dominic do",
            "why is dominic called the builder"
        ]
    },

    ethel: {
        weight: 86,
        prompts: [
            "who is ethel",
            "what happened to ethel",
            "why does ethel matter"
        ]
    },

    isla: {
        weight: 86,
        prompts: [
            "who is isla",
            "what happened at the wedding",
            "why is isla dangerous"
        ]
    },

    parable: {
        weight: 84,
        prompts: [
            "tell me a story",
            "what kind of story",
            "go on"
        ]
    }
};

const DOMINIC_ACCESSIBILITY_RULES = {
    high: {
        allowResurfacing: false,
        allowCoreFallback: false,
        maxCoreSuggestions: 0
    },
    medium: {
        allowResurfacing: true,
        allowCoreFallback: true,
        maxCoreSuggestions: 1
    },
    low: {
        allowResurfacing: true,
        allowCoreFallback: true,
        maxCoreSuggestions: 2
    }
};

function dominicGetAccessibilityRule(state) {
    var pressure = dominicGetNarrativePressure(state);
    return DOMINIC_ACCESSIBILITY_RULES[pressure] || DOMINIC_ACCESSIBILITY_RULES.low;
}

function dominicGetCoreTalkingPointList() {
    var entries = Object.keys(DOMINIC_CORE_TALKING_POINTS).map(function (key) {
        return {
            key: key,
            weight: DOMINIC_CORE_TALKING_POINTS[key].weight,
            prompts: DOMINIC_CORE_TALKING_POINTS[key].prompts.slice()
        };
    });

    entries.sort(function (a, b) { return b.weight - a.weight; });
    return entries;
}

function dominicGetCoreFallbackPrompts(context) {
    var page = context && context.page ? context.page : "home";

    if (page === "files") {
        return [
            "what is the ryker report",
            "what should i read first",
            "what are the files"
        ];
    }

    if (page === "story") {
        if (context && context.activeTrackTitle) {
            var t = String(context.activeTrackTitle).toLowerCase();
            return [
                "what is " + t + " about",
                "who is " + t + " about",
                "where does this fit in the story"
            ];
        }

        return [
            "what is this song about",
            "what should i listen to first",
            "where does the story begin"
        ];
    }

    if (page === "subjects") {
        if (context && context.activeProfileName) {
            var n = String(context.activeProfileName).toLowerCase();
            return [
                "who is " + n,
                "why does " + n + " matter",
                "what happened to " + n
            ];
        }

        return [
            "who is dominic ryker",
            "who is ethel",
            "who is isla"
        ];
    }

    if (page === "home") {
        return [
            "what is pixelstortion",
            "what is the truth",
            "where should i start"
        ];
    }

    return [
        "show me around",
        "what is the truth",
        "where should i start"
    ];
}

function dominicMergeUniqueSuggestions(primary, secondary, maxCount) {
    var out = [];
    var seen = {};

    (primary || []).forEach(function (item) {
        var key = String(item).toLowerCase();
        if (!seen[key]) {
            seen[key] = true;
            out.push(item);
        }
    });

    (secondary || []).forEach(function (item) {
        var key = String(item).toLowerCase();
        if (!seen[key]) {
            seen[key] = true;
            out.push(item);
        }
    });

    return maxCount ? out.slice(0, maxCount) : out;
}

function dominicInjectCoreAccessibilitySuggestions(suggestions, context) {
    var state = (context && context.conversationState) ? context.conversationState : "any";
    var rule = dominicGetAccessibilityRule(state);

    if (!rule.allowCoreFallback || rule.maxCoreSuggestions <= 0) {
        return suggestions || [];
    }

    var coreFallbacks = dominicGetCoreFallbackPrompts(context).slice(0, rule.maxCoreSuggestions);
    return dominicMergeUniqueSuggestions(suggestions || [], coreFallbacks, 0);
}

function dominicGetAccessibilityWeightedFallback(context) {
    var state = (context && context.conversationState) ? context.conversationState : "any";
    var rule = dominicGetAccessibilityRule(state);

    if (!rule.allowCoreFallback) return null;

    var prompts = dominicGetCoreFallbackPrompts(context);
    if (!prompts.length) return null;

    return prompts[0];
}

function dominicGetResurfacingLine(context) {
    var state = (context && context.conversationState) ? context.conversationState : "any";
    var rule = dominicGetAccessibilityRule(state);

    if (!rule.allowResurfacing) return null;

    var page = context && context.page ? context.page : "home";

    if (page === "files") {
        return "If you want something firmer, start with the files.";
    }

    if (page === "story") {
        return "If you want the shape of it faster, ask about the track.";
    }

    if (page === "subjects") {
        return "If you want motive, ask about the people.";
    }

    return "If you want a real entry point, ask about the files, the story, or Dominic.";
}

/* =========================================================
   PHASE 7  -  THEME-PRESSURE WEIGHTING
   Controls which themes are foregrounded or suppressed
   based on state, pressure, page, and active object.
   Theme pressure may NEVER override high-pressure state locks.
========================================================= */

const DOMINIC_THEME_GROUPS = {
    tour: ["tour", "show me around", "where should i start"],
    truth: ["truth", "what is the truth", "where is the truth"],
    files: ["files", "archive", "report", "evidence", "redacted"],
    story: ["story", "track", "song", "playlist", "audio"],
    dominic: ["dominic", "ryker", "builder"],
    ethel: ["ethel"],
    isla: ["isla"],
    parable: ["parable", "story route", "small story"],
    trial: ["trial", "testimony", "justice", "spectacle"],
    prison_escape: ["prison", "long bay", "escape", "breakout"],
    grief_trauma: ["grief", "trauma", "harm", "loss"],
    structure_control: ["structure", "control", "psychopathy", "pressure", "collapse"]
};

/*
  Theme pressure profile values:
  0 = suppress
  1 = background
  2 = available
  3 = foreground
*/
const DOMINIC_THEME_PRESSURE_PROFILES = {
    high: {
        default: {
            tour: 0, truth: 2, files: 1, story: 1,
            dominic: 2, ethel: 1, isla: 1,
            parable: 2, trial: 2, prison_escape: 1,
            grief_trauma: 1, structure_control: 3
        },

        byState: {
            EXPECT_SITE_TOUR: {
                tour: 3, truth: 1, files: 1, story: 1,
                dominic: 1, ethel: 0, isla: 0,
                parable: 0, trial: 0, prison_escape: 0,
                grief_trauma: 0, structure_control: 1
            },
            EXPECT_PARABLE_ROUTE: {
                tour: 0, truth: 1, files: 0, story: 1,
                dominic: 1, ethel: 1, isla: 1,
                parable: 3, trial: 0, prison_escape: 0,
                grief_trauma: 1, structure_control: 2
            },
            EXPECT_PARABLE_LAUNCH: {
                tour: 0, truth: 1, files: 0, story: 1,
                dominic: 1, ethel: 1, isla: 1,
                parable: 3, trial: 0, prison_escape: 0,
                grief_trauma: 1, structure_control: 2
            },
            EXPECTING_TRIAL_VERDICT: {
                tour: 0, truth: 1, files: 1, story: 1,
                dominic: 2, ethel: 1, isla: 1,
                parable: 0, trial: 3, prison_escape: 1,
                grief_trauma: 0, structure_control: 2
            },
            EXPECTING_ESCAPE_FOLLOWUP: {
                tour: 0, truth: 1, files: 1, story: 1,
                dominic: 2, ethel: 0, isla: 1,
                parable: 0, trial: 1, prison_escape: 3,
                grief_trauma: 0, structure_control: 2
            },
            EXPECTING_PSYCHOPATH_ANSWER: {
                tour: 0, truth: 1, files: 1, story: 1,
                dominic: 2, ethel: 1, isla: 1,
                parable: 0, trial: 0, prison_escape: 0,
                grief_trauma: 1, structure_control: 3
            },
            EXPECTING_AWARENESS_PUSHBACK: {
                tour: 0, truth: 1, files: 1, story: 1,
                dominic: 2, ethel: 1, isla: 1,
                parable: 0, trial: 0, prison_escape: 0,
                grief_trauma: 1, structure_control: 3
            },
            EXPECTING_BLAME_FOLLOWUP: {
                tour: 0, truth: 2, files: 1, story: 1,
                dominic: 2, ethel: 1, isla: 1,
                parable: 0, trial: 1, prison_escape: 0,
                grief_trauma: 1, structure_control: 2
            }
        }
    },

    medium: {
        default: {
            tour: 1, truth: 2, files: 2, story: 2,
            dominic: 2, ethel: 2, isla: 2,
            parable: 1, trial: 1, prison_escape: 1,
            grief_trauma: 2, structure_control: 2
        }
    },

    low: {
        default: {
            tour: 2, truth: 2, files: 2, story: 3,
            dominic: 2, ethel: 2, isla: 2,
            parable: 1, trial: 1, prison_escape: 1,
            grief_trauma: 2, structure_control: 2
        },

        byPage: {
            home: {
                tour: 3, truth: 3, files: 2, story: 1,
                dominic: 2, ethel: 1, isla: 1,
                parable: 1, trial: 0, prison_escape: 0,
                grief_trauma: 1, structure_control: 2
            },
            files: {
                tour: 1, truth: 2, files: 3, story: 1,
                dominic: 2, ethel: 1, isla: 1,
                parable: 0, trial: 1, prison_escape: 1,
                grief_trauma: 1, structure_control: 2
            },
            subjects: {
                tour: 1, truth: 1, files: 1, story: 1,
                dominic: 3, ethel: 3, isla: 3,
                parable: 0, trial: 0, prison_escape: 0,
                grief_trauma: 2, structure_control: 2
            },
            story: {
                tour: 1, truth: 1, files: 1, story: 3,
                dominic: 2, ethel: 2, isla: 2,
                parable: 1, trial: 1, prison_escape: 1,
                grief_trauma: 2, structure_control: 2
            }
        }
    }
};

const DOMINIC_THEME_TO_SUGGESTIONS = {
    tour: ["show me around", "where should i start", "what should i look at first"],
    truth: ["what is the truth", "where is the truth", "what do you mean by truth"],
    files: ["what are the files", "what is the ryker report", "what should i read first"],
    story: ["what is this song about", "where does the story begin", "what should i listen to first"],
    dominic: ["who is dominic ryker", "what did dominic do", "why is dominic called the builder"],
    ethel: ["who is ethel", "what happened to ethel", "why does ethel matter"],
    isla: ["who is isla", "what happened at the wedding", "why is isla dangerous"],
    parable: ["tell me a story", "what kind of story", "go on"],
    trial: ["what happened at the trial", "was it justice or spectacle", "what was the verdict"],
    prison_escape: ["what happened in prison", "how did dominic escape", "what happened after the breakout"],
    grief_trauma: ["what does the trauma mean", "why does grief matter here", "what is harm's ghost about"],
    structure_control: ["what is structural psychopathy", "why does control matter", "what do you mean by preventing collapse"]
};

function dominicGetThemePressureProfile(context) {
    var state = (context && context.conversationState) ? context.conversationState : "any";
    var page = (context && context.page) ? context.page : "home";
    var pressure = dominicGetNarrativePressure(state);
    var family = DOMINIC_THEME_PRESSURE_PROFILES[pressure] || DOMINIC_THEME_PRESSURE_PROFILES.low;

    // Start with default
    var profile = Object.assign({}, family.default || {});

    // Merge page bias
    if (family.byPage && family.byPage[page]) {
        profile = Object.assign(profile, family.byPage[page]);
    }

    // Merge state-specific override
    if (family.byState && family.byState[state]) {
        profile = Object.assign(profile, family.byState[state]);
    }

    // Active object boosts
    if (context && context.activeTrackTitle) {
        profile.story = Math.max(profile.story || 0, 3);
    }
    if (context && context.activeFileTitle) {
        profile.files = Math.max(profile.files || 0, 3);
    }
    if (context && context.activeProfileName) {
        var n = String(context.activeProfileName).toLowerCase();
        if (n.includes("dominic")) profile.dominic = Math.max(profile.dominic || 0, 3);
        if (n.includes("ethel")) profile.ethel = Math.max(profile.ethel || 0, 3);
        if (n.includes("isla")) profile.isla = Math.max(profile.isla || 0, 3);
    }

    return profile;
}

function dominicRankThemesByPressure(context) {
    var profile = dominicGetThemePressureProfile(context);
    return Object.keys(profile)
        .map(function (key) {
            return { theme: key, value: profile[key] };
        })
        .sort(function (a, b) { return b.value - a.value; });
}

function dominicGetThemeWeightedSuggestions(context, maxCount) {
    var ranked = dominicRankThemesByPressure(context);
    var out = [];
    var seen = {};

    for (var i = 0; i < ranked.length; i++) {
        var entry = ranked[i];
        if (entry.value <= 0) continue;

        var bank = DOMINIC_THEME_TO_SUGGESTIONS[entry.theme] || [];
        for (var j = 0; j < bank.length; j++) {
            var s = bank[j];
            var key = s.toLowerCase();
            if (!seen[key]) {
                seen[key] = true;
                out.push(s);
                if (out.length >= (maxCount || 3)) return out;
            }
        }
    }

    return out;
}

function dominicInjectThemePressureSuggestions(suggestions, context) {
    var state = (context && context.conversationState) ? context.conversationState : "any";
    var pressure = dominicGetNarrativePressure(state);

    // In high pressure we do NOT broaden with theme suggestions
    if (pressure === "high") {
        return suggestions || [

            // SONG-47 \u2014 DOMINIC'S INTENT (PLACEHOLDER)
            {
                "node_id": "SONG_DOMINICS_INTENT",
                "required_state": "any",
                "next_state": "any",
                "training_phrases": [
                    "dominic\'s intent", "dominic\'s intent explained", "dominic\'s intent meaning",
                    "ethel\'s intro: dominic\'s intent", "explain dominic\'s intent", "tell me about dominic\'s intent",
                    "tell me about ethel\'s intro: dominic\'s intent", "what does dominic\'s intent mean", "what is dominic\'s intent about",
                    "what is ethel\'s intro: dominic\'s intent about"
                ],
                "responses": {
                    "universal": { "dialogue": "Amusing title. But the piece itself tells me she has finally understood the mechanism rather than merely the damage. The engineer matters here because she has grasped the central rule: people are easiest to break when the room has already agreed to misread them. Once Ethel learned that, she became far more dangerous than an angry daughter ever could have been.", "ui_action": null }
                }
            }
        ];
    }

    var themeSuggestions = dominicGetThemeWeightedSuggestions(context, 3);
    return dominicMergeUniqueSuggestions(suggestions || [], themeSuggestions, 0);
}

function dominicGetThemePressureResurfacingLine(context) {
    var state = (context && context.conversationState) ? context.conversationState : "any";
    var pressure = dominicGetNarrativePressure(state);

    if (pressure === "high") return null;

    var ranked = dominicRankThemesByPressure(context);
    if (!ranked.length) return null;

    var top = ranked[0].theme;

    switch (top) {
        case "tour":
            return "If you want an entry point, ask me to show you around.";
        case "truth":
            return "If you want to get somewhere real, ask about the truth.";
        case "files":
            return "If you want something firmer, start with the files.";
        case "story":
            return "If you want the shape of it faster, ask about the track.";
        case "dominic":
            return "If you want the pressure point, ask about Dominic.";
        case "ethel":
            return "If you want the center of gravity, ask about Ethel.";
        case "isla":
            return "If you want rupture instead of explanation, ask about Isla.";
        case "parable":
            return "If you want the lesson without the summary, ask for the story.";
        case "trial":
            return "If you want the theatre of it, ask about the trial.";
        case "prison_escape":
            return "If you want the fracture line, ask about the escape.";
        case "grief_trauma":
            return "If you want the wound underneath it, ask about the trauma.";
        case "structure_control":
            return "If you want the mechanism, ask about control.";
        default:
            return null;
    }
}

