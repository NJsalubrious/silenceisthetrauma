/**
 * ETHEL GALLERY - COMPLETE SONG DATABASE
 * All 44 songs in exact narrative order
 * Updated: January 2026
 */

// Using main branch = auto-updates when you push to git
const IMG_BASE = "../../library/media_covers_song/";

const ARCHIVE_DATA = [
    // =========================================================================
    // MAIN TIMELINE - ALL 44 SONGS IN ORDER
    // =========================================================================

    {
        id: 1,
        title: "My Story",
        artist: "Ethel",
        date: "2024 (ARCHIVE REVIEW)",
        subtitle: "Overview · origin framing · systems learned early",
        videoId: "dLUClmr_Pf4",
        img: "Ethel_My_Story.jpg",
        story: `This is an overview sung by Ethel outlining the first chapter of her story.

Misread early, Ethel learned the hard way. Systems protect themselves, and people don't look until someone makes them.

When the loss of her grandparents forces Ethel to live with an estranged father, she sees the same game play out on a larger stage, built on the same rules she already experienced. But she also knows there are ways around that.

Gran left Ethel a point of contact she could trust and Isla did the rest.

Not typical. Not easy. But Ethel and Isla are neither of these.`,
        lyrics: ``
    },
    {
        id: 2,
        title: "The Drop Pt.1",
        artist: "Ethel",
        date: "NOV 14, 2016 (AGE 15)",
        subtitle: "Outback childhood · perception · testing reality",
        videoId: "zHWwhom80go",
        img: "Ethel_The_Drop_pr_1b__PixelStortion.jpg",
        story: `The world, for Ethel, was three colors. The deep blue of the sky, the impossible red of the desert and the living green of the forest. Home was the border between them all. Home was Gran, who was "fast in all directions," Pop, who was "grounded silence" and Ethel could just be Ethel.

It was a life of unspoken understanding. In her lab, Gran would mutter about "polymer decay" and forget her tea, goggles perched on her head. She wasn't "crazy", she just saw connections from all directions at once.

The "stock kids" wanted the moment, the film, the proof. Ethel just wanted to test their perspectives.`,
        lyrics: ``
    },
    {
        id: 3,
        title: "The Drop Pt.2",
        artist: "Ethel",
        date: "NOV 14, 2016 (AGE 15)",
        subtitle: "Physics over bravado · consequence · perspective shift",
        videoId: "K0ILO8MwX4Y",
        img: "Ethel_The_Drop_pr_2b__PixelStortion.jpg",
        story: `Geometry, she knew, never changes. But perspectives do. Like people with shaped lenses. And that, more than the fall itself, was what Ethel was testing.

She stood at the lip, moss soft under her toes. She wasn't guessing. Ethel was accessing the parallax, the perspective that twisted the view from below. She launched. The fall was pure physics, her arms aligned with the pull, her legs riding the line.`,
        lyrics: ``
    },
    {
        id: 4,
        title: "Structural Psychopathy",
        artist: "Dominic",
        date: "MAR 2019 (PROFILE)",
        subtitle: "Pattern recognition · narrative control · intent masked as reason",
        videoId: "8rvIVBLZg2o",
        img: "Dominic_structural_psychopathy.jpg",
        story: `People don't see the cause. They look at reaction. It's easier that way. They track tone, not the trigger. Outcome, not the structure underneath.

Someone pushes your break line. Then acts shocked when it moves. They call you reactive. But never ask what they did before you broke surface. Dominic knows this pattern. He uses it.`,
        lyrics: ``
    },
    {
        id: 5,
        title: "Polished Vomit",
        artist: "Isla",
        date: "FEB 14, 2019 (THE WEDDING)",
        subtitle: "Mania · exposure · first public fracture",
        videoId: "2hSYNLs7w3w",
        img: "Isla_Polished_vomit.jpg",
        story: `"Polished Vomit" is Isla at a wedding she shouldn't have attended, or couldn't avoid. It's the wedding of Isla's mother and Dominic.

Why is it called "Polished Vomit"? Because that is what she calls her mother. Beautiful on the outside, but inside her mother is a mess dressed up to look like cultured stability.

This is manic Isla. But, even at her most unstable, her mind works like a cipher. Intuitive, creative, unnervingly insightful. Isla is also really good with locks.`,
        lyrics: ``
    },
    {
        id: 6,
        title: "Ride",
        artist: "Ethel",
        date: "JAN 20, 2019 (AGE 17)",
        subtitle: "Moral refusal · quiet withdrawal · first punishment",
        videoId: "0sgcZRtPO6s",
        img: "Ethel_ride__PixelStortion.jpg",
        story: `"Ride" was what Ethel did when she was seventeen, across red dirt on a bike built for escape. Raised by her grandparents in rural Australia, she was already learning to weigh harm and walk her own line.

When others slipped into easy crime and tribal excuses, she stepped back quietly. The system called her "withdrawn," "non-compliant," "hostile." No one saw the choice beneath it.

When she logged into her teacher's computer and uncovered proof of his fraud, the reaction was predictable. He kept his job. She got expelled. That's where it all began.`,
        lyrics: ``
    },
    {
        id: 7,
        title: "Grief",
        artist: "Ethel",
        date: "FEB 28, 2019 (THE CRASH)",
        subtitle: "Loss · rupture · inheritance of truth",
        videoId: "PMy76HBgpL8",
        img: "Ethel_Grief.jpg",
        story: `The two songs "Ride" and "Gotta Move" tell a single episode of Ethel's life.

When the "stock kids" slipped into easy crime, she stepped back. The school psychologists called her "withdrawn, non-compliant." They missed her why.

So, when she saw a real systemic harm, the grant fraud at her school, she acted. The system did what systems do. It protected itself. The teacher stayed. Ethel was expelled.

Then there was a second wall. The one that ended everything. Gran and Pop were gone...`,
        lyrics: ``
    },
    {
        id: 8,
        title: "Gotta Move",
        artist: "Ethel",
        date: "MAR 02, 2019 (LEAVING HOME)",
        subtitle: "Forced choice · motion as survival",
        videoId: "06qE_-OeIT0",
        img: "Ethel_gotta_Move_2.jpg",
        story: `"I just won't break where others end." Ethel sings like she already accepted the outcome. Not dramatic. Not desperate. Just on her way.

She didn't get a real choice. Too much money in the way. Too much force wrapped around her life like it owned her.

So she made one. A mental trick in essence. She decided that this was her own decision. Because the lack of one just wouldn't feel right. No candles. No hymns. No pretty collapse.`,
        lyrics: ``
    },
    {
        id: 9,
        title: "Won't Break Where Others End",
        artist: "Ethel",
        date: "MAR 05, 2019 (MOVE TO MOSMAN)",
        subtitle: "Containment · resolve · reframing coercion",
        videoId: "fJNMlT7UeW0",
        img: "Ethel_wont_break_Wher_Others_End_1.jpg",
        story: `"I just won't break where others end." Ethel sings like she already accepted the outcome. Not dramatic. Not desperate. Just on her way.

She didn't get a real choice. So she made one. A mental trick. She decided that this was her own decision. Because the lack of one just wouldn't feel right.`,
        lyrics: ``
    },
    {
        id: 10,
        title: "Peek-A-Boo",
        artist: "Isla",
        date: "MAR 10, 2019",
        subtitle: "First collision · rivalry · recognition",
        videoId: "K9lQ0IYiMoM",
        img: "Ethel_Peek_A_Boo.jpg",
        story: `Ethel and Isla. Not sisters in blood but in arms. They met in what Isla calls "the crazy house" and what a crazy introduction it was. Isla at her most manic and volatile.

Peek-A-Boo catches that first spark between them. Rivalry, recognition, and a charge that would shadow them both and tie them together, in one form or another, from here on out.`,
        lyrics: ``
    },
    {
        id: 11,
        title: "I Built A Box",
        artist: "Ethel",
        date: "JUN 2019 (MOSMAN)",
        subtitle: "Complicity as defense · mental containment",
        videoId: "0F_prk5dGC4",
        img: "ETHEL_I_built_a_box.jpg",
        story: `"I Built a Box" marks a turning point in Ethel's life, seventeen, principled, caught between choice and coercion.

Raised by her grandparents on solid ground, she knows how to resist pressure, but her father's kind of pressure is something else entirely.

So she reframed survival as a decision, a way to stay intact and eventually turn the tables on him. Her mind builds a box. A quiet set of defenses to keep her safe. It will take years to open.`,
        lyrics: ``
    },
    {
        id: 12,
        title: "Same Breath",
        artist: "Dominic",
        date: "JUL 2019 (NORTHERN ROAD, ITALY)",
        subtitle: "Hero myth exposed · violence normalized",
        videoId: "Ugy7KVuhwpE",
        img: "Witness_Same_Breath_Dominics_Henchman.jpg",
        story: `This event shows Dominic Ryker's terrifying capacity for compartmentalization.

During a convoy ambush, his men froze. Dominic ran a "Straight line", dragged the man out of the line of fire, and saved his life.

"Later," after the threat was neutralized, he executed the same man. The execution served as a brutal message to the rest of his crew. Hero. Killer. Same step.`,
        lyrics: ``
    },
    {
        id: 13,
        title: "Burning Dominic's Bridge",
        artist: "Isla",
        date: "AUG 2019 (THE LEAK)",
        subtitle: "Revenge by procedure · evidence over spectacle",
        videoId: "lwd7KOScg0k",
        img: "Isla_Burning_dominics_the_Bridge.jpg",
        story: `This song marks the night Isla burned Dominic's bridge to freedom. The song is part revenge, part release.

Mara Quinn, Senior Reporter at "The Southern objective" would later write: "Start with the documents. Their path into court isn't a heist narrative. It's procedure."`,
        lyrics: ``
    },
    {
        id: 14,
        title: "For You",
        artist: "Ethel",
        date: "SEP 2019",
        subtitle: "Verdict delivered · rage clarified",
        videoId: "f8o7zb3F-Xk",
        img: "Ethel_For_You_PixelStortion.jpg",
        story: `Ethel yells the verdict: "You made a cage. FOR YOU!!!!!"

This track holds all the tension of that three year window spent in her estranged father's world. The gaslight fog. The psychological shell game. The man who came to kill her one evening...

Silence isn't free and so this track is loud. It's Heavy Metal.`,
        lyrics: ``
    },
    {
        id: 15,
        title: "Broken Edge",
        artist: "Isla",
        date: "OCT 2019",
        subtitle: "Chaos weaponized · bridge destruction",
        videoId: "_gvv_W5_x10",
        img: "ISLA_the_broken_edge.jpg",
        story: `When Ethel met Isla, she met a mind that runs on both chaos and intellect.

Dominic misread her. People don't usually burn the bridge they're standing on.

Bet she won't? You lose.`,
        lyrics: ``
    },
    {
        id: 16,
        title: "Hero / Killer",
        artist: "Ethel",
        date: "FEB 2020 (TRIAL OPENING)",
        subtitle: "Public myth challenged · cost revealed",
        videoId: "YkQOXPzYkkU",
        img: "Ethel_Hero_killer.jpg",
        story: `The song sits at the start of a trial that's been years coming.

Dominic's myth is crumbling in real time and Ethel's not here to mourn it.`,
        lyrics: ``
    },
    {
        id: 17,
        title: "Hero Complex",
        artist: "Dominic",
        date: "FEB 2020 (THE TRIAL START)",
        subtitle: "Rescue as leverage · control through calm",
        videoId: "7gc3DigBW1Y",
        img: "Dominic_Hero_Complex.jpg",
        story: `Dominic sells himself as the steady one who moves when others freeze. In practice he waits, watches who hesitates, then steps in so people remember the move and forget the pause. It is control dressed as calm.

Rescue buys loyalty. Favors turn into a tab.`,
        lyrics: ``
    },
    {
        id: 18,
        title: "Nothing True",
        artist: "Ethel",
        date: "APR 2020 (THE TESTIMONY)",
        subtitle: "Precision speech · denial of narrative hijack",
        videoId: "Bff42Vyv8HM",
        img: "Ethel_Nothing_True.jpg",
        story: `Ethel takes the stand knowing the court wants clarity. A yes or a no. But she knows her father's methods, how stories get reshaped and reused. The lawyers don't.

She answers carefully. Leaves nothing that can be twisted later. It looks cautious, even rigid, but it isn't. It's foresight.`,
        lyrics: ``
    },
    {
        id: 19,
        title: "You Will Thank Me Later",
        artist: "Dominic",
        date: "JUN 2020 (PRISON)",
        subtitle: "Manipulation tutorial · trust as currency",
        videoId: "n6OgobffCzo",
        img: "dominic_you_will_thank_me_later.jpg",
        story: `In the cold, structured walls of prison, Dominic finds his next project. His new cellmate. Not with a show of force. Not with threats. But with a calm voice in a room where the loud have already lost.

This is Dominic's song: A calm, rhythmic guide to turning trust into currency, and a willing man into a spent resource.`,
        lyrics: ``
    },
    {
        id: 20,
        title: "This Isn't Therapy",
        artist: "Isla",
        date: "AUG 2020 (POST-TRIAL RESET)",
        subtitle: "Reclamation · refusal of apology",
        videoId: "0tzOaukuBns",
        img: "Isla_this_isnt_Therapy.jpg",
        story: `This isn't therapy begins after Dominic's trial ends, in an inner west Sydney flat she never asked for but couldn't refuse.

Expelled from the Sydney Conservatorium of Music after a clash that no one can quite retell the same way, Isla continues pushing her musical career with a band drawn from those who saw the same fire others tried to discipline out of her.

The song is her reset. A refusal to apologise for intensity.`,
        lyrics: ``
    },
    {
        id: 21,
        title: "Intro to Shiny Headed Radio Man",
        artist: "Isla",
        date: "SEP 2020",
        subtitle: "Setup · gatekeeper encounter",
        videoId: "dK8mqLNRZ2Q",
        img: "Isla_Into_To_Shiny_Headed_Man.jpg",
        story: `The intro song to "Shiny headed Man" sets the stage for what comes next.

She's chasing an audition that could change everything, but the man who promised to open the door expects payment that isn't music. Typical. Isla's answer isn't retreat but confrontation wrapped in humour and noise.

If the bridge burns, so be it. She'll build her own stage from the ashes and make it louder.`,
        lyrics: ``
    },
    {
        id: 22,
        title: "Shiny Headed Radio Man",
        artist: "Isla",
        date: "SEP 2020",
        subtitle: "Confrontation · power inversion",
        videoId: "UFZeKCcSMoE",
        img: "Isla_Shiny_Headed_Man.jpg",
        story: `Shiny Headed Radio Man is Isla Unleashed. Raw, furious, and done with the gatekeepers.

The song spirals between humor and confrontation, performance and real anger. It's the sound of a woman refusing to barter her worth for permission.`,
        lyrics: ``
    },
    {
        id: 23,
        title: "Stanmore Farewell",
        artist: "Isla",
        date: "DEC 2020 (INNER-WEST EXIT)",
        subtitle: "Restlessness · necessary departure",
        videoId: "-3m2_zUNBlo",
        img: "Isla_Stanemore_Farewell.jpg",
        story: `Stanmore Farewell finds Isla after the noise has faded. The trial of Dominic has ended. The headlines have stopped including her with titles like "Addict Girl". Things seem almost normal.

The song captures the push and pull between gratitude and restlessness. It's not a goodbye in anger, but in necessity. Isla knows she can't stay still.`,
        lyrics: ``
    },
    {
        id: 24,
        title: "Harm's Ghost",
        artist: "Ethel",
        date: "FEB 2021 (POST-TRIAL AFTERMATH)",
        subtitle: "Early intervention ethics · living with foresight",
        videoId: "zh6HEd4lztU",
        img: "Ethel_harms_ghost.jpg",
        story: `Harm's Ghost pulls you inside Ethel's head, into the space between instinct and restraint.

She sees what others either miss or refuse to confront out of fear or uncertainty.

It isn't about fear or control. It's about the moment people see harm coming, know it can be stopped, and still choose to stay quiet.`,
        lyrics: ``
    },
    {
        id: 25,
        title: "No Sparrow Caught Mid Flight",
        artist: "Ethel",
        date: "DEC 2020 (POST-TRIAL)",
        subtitle: "Aftermath · movement without myth",
        videoId: "t6vLU0uqIfc",
        img: "No_Sparrow_Caught_Mid_Flight.jpg",
        story: `The trial's done. He's where he belongs. She's finished what she started. Now comes the quiet part. The part left after.

Ethel's name is still in the headlines. Her face is still tied to his. Work's meant to follow study, but nothing lands.`,
        lyrics: ``
    },
    {
        id: 26,
        title: "Prison Escape",
        artist: "Dominic",
        date: "JAN 2024 (THE ESCAPE)",
        subtitle: "System failure · permission exploited",
        videoId: "6eZwBGXGSO4",
        img: "DOMINIC_dominics.jpg",
        story: `Dominic understands the average person the way others read instructions. He learned by testing limits others never would.

Dominic notices the needs, the mistakes, the misplaced trust, the small openings people leave, and he exploits them fearlessly and without hesitation.`,
        lyrics: ``
    },
    {
        id: 27,
        title: "Guilt Money (Origin)",
        artist: "Kinley",
        date: "FEB 2024 (EMERGENCE)",
        subtitle: "Handler archetype · optics over truth",
        videoId: "uovMKnwE34M",
        img: "KINLEY_ORIGIN_STORY.jpg",
        story: `In the void left after Dominic there are new contenders. Kinley is best seen as the system embodied. A presence that cannot be beaten. Only endured or outmaneuvered.

Kinley is the handler archetype, polished, professional, polite on the surface, but always calculating.`,
        lyrics: ``
    },
    {
        id: 28,
        title: "Ants on the Vine",
        artist: "Ethel",
        date: "MAR 2024 (FIRST SIGNAL)",
        subtitle: "Surveillance noticed · pattern disruption",
        videoId: "e2wt2VSi9xA",
        img: "Ethel_Ants_on_the_Vine.jpg",
        story: `Ethel had been waiting on a Sydney train platform when a woman nearby reacted to something she saw on a digital billboard. Ethel looked closer at the next ad. A timestamp in the corner did not belong.

"Ants on the Vine" begins there, as Ethel follows what others overlook. What she uncovers suggests it is not a one off. Kinley.`,
        lyrics: ``
    },
    {
        id: 29,
        title: "Clipboard Man",
        artist: "Ethel",
        date: "APR 2024 (SURVEILLANCE LOOP)",
        subtitle: "Decoy logic · mirrored watching",
        videoId: "ZAhqNWTHTGU",
        img: "Ethel_Clipboard_Man.jpg",
        story: `"Clipboard Man" unfolds like a quiet chase told in reverse. Ethel knows clipboard man isn't her threat. He's a signal. A reflection. He's part of a larger thing that needs eyes and ears for its own protection.

When surveillance starts to fold back on itself, she sets her own decoy in motion.`,
        lyrics: ``
    },
    {
        id: 30,
        title: "Rattled",
        artist: "Ethel",
        date: "MAY 2024 (DETECTIVE INTERVENTION)",
        subtitle: "Warning · calibration · restraint learned",
        videoId: "qQ1l6JAjE8M",
        img: "Sticky_Rattled_Ethel.jpg",
        story: `"Rattled" unfolds through the voice of Detective "Sticky," a man who spots trouble faster than protocol allows. He's sharp, impatient, allergic to small talk, and just self-aware enough to know it.

When Ethel crosses his path, he recognises the type. Too bright. Too direct. Too unwilling to wait for systems that crawl.`,
        lyrics: ``
    },
    {
        id: 31,
        title: "Red Stick",
        artist: "Ethel",
        date: "JUN 2024 (FIRST TEST)",
        subtitle: "Reaction measured · signal answered",
        videoId: "iTOKsLS3jhM",
        img: "ETHEL_red_stick.jpg",
        story: `It begins with a test. Subtle. Deliberate. Seemingly harmless.

A red stick wedged in the front wheel of her bike. Nothing dramatic, nothing random. A message to measure reaction.

The song follows Ethel as she reads it the way others read handwriting.`,
        lyrics: ``
    },
    {
        id: 32,
        title: "Can You Make A Mistake On Purpose?",
        artist: "Ethel",
        date: "JUL 2024",
        subtitle: "Intentional error · trap construction",
        videoId: "s9Z8dgRk-Q8",
        img: "EEthel_Can_you_make_a_mistake_on_purpose.jpg",
        story: `Transport office. Sensors, logs, timing. Tea break hum. She keeps typing.

Kinley's trick is a screen. Polite on the surface, built to quiet you. Clipboard Man watches for him.

This chapter sets the question: "Can you make a mistake on purpose?"`,
        lyrics: ``
    },
    {
        id: 33,
        title: "Intro to Normal?!",
        artist: "Ethel",
        date: "AUG 2025",
        subtitle: "Psychological framing · moral friction",
        videoId: "V0hvxqMWcnE",
        img: "Ethel_MONOLOGUE_intro_to_Normal.jpg",
        story: `Ethel Monologue cuts to the psychology of difference. Ethel isn't built to conform or defer. Her mind moves fast. Her empathy is active, not polite.

The intro sets up a situation with real harm and consequences. Avoidable but not avoided.`,
        lyrics: ``
    },
    {
        id: 34,
        title: "Normal?!",
        artist: "Ethel",
        date: "AUG 2025",
        subtitle: "Early clarity · misread as deviance",
        videoId: "OxHZnnRhtbk",
        img: "Ethel_Normal_Version_v1.jpg",
        story: `She doesn't quite fit the models. Not avoidant. Not oppositional. Not histrionic. And definitely not lacking empathy, though people tend to think that.

Her reactions aren't late-stage blowups. They're early interventions. Which makes people uncomfortable.`,
        lyrics: ``
    },
    {
        id: 35,
        title: "Normal?! (Special Version)",
        artist: "Ethel",
        date: "AUG 2025",
        subtitle: "Expanded articulation · system critique",
        videoId: "ht9PIloHD0Q",
        img: "Ethel_Normal_Version_2.jpg",
        story: `Ethel is different and sometimes that is what is needed to force a corrupt "normal" to look itself in the mirror.`,
        lyrics: ``
    },
    {
        id: 36,
        title: "Memory Under Water",
        artist: "Isla",
        date: "RETROSPECT (2022)",
        subtitle: "Inherited silence · maternal loss",
        videoId: "nk4Re7OjTTM",
        img: "Isla_memory_underwater.jpg",
        story: `The imagery is delicate, but the meaning isn't. This isn't an elegy. It is an "autopsy of silence". The kind of social composure that buries people long before they die.

What she is describing is her mother's final walk. Quiet, deliberate, unseen. Isla isn't asking for sympathy. She's confronting the inheritance of performance.`,
        lyrics: ``
    },
    {
        id: 37,
        title: "The Porcelain Lie (Raise The Fourth)",
        artist: "Isla",
        date: "RETROSPECT (2024)",
        subtitle: "Imagined ending · survival hinge",
        videoId: "fNVKsxe_EcM",
        img: "Isla_The_Porcelain_Lie.jpg",
        story: `Raise the Fourth (Porcelain Version) sits in the space between memory and possibility. Isla imagines an event that never happened but could have.

For Isla, survival means seeing every possible ending and choosing to keep the hinge singing. Her mouth. Her voice. There are still doors ahead of her.`,
        lyrics: ``
    },
    {
        id: 38,
        title: "Raise The Fourth",
        artist: "Isla",
        date: "RETROSPECT (2024)",
        subtitle: "Frozen moment · rehearsed absence",
        videoId: "ey20cJsY82M",
        img: "ISLA_Raise_the_fourth.jpg",
        story: `Raise the Fourth opens in dissonance. Isla isn't hiding behind metaphor. She's tracing a moment she once imagined might end her and singing about it as if it already has.

In another version, the ending floods. Here, it freezes. A still surface. Porcelain.`,
        lyrics: ``
    },
    {
        id: 39,
        title: "What You Don't See",
        artist: "Isla",
        date: "RETROSPECT (2024)",
        subtitle: "Survival without spectacle · repair",
        videoId: "Y4VC6mh37NI",
        img: "Isla_what_you_Don't_See.jpg",
        story: `What You Don't See tells the story of what survival feels like from Isla's P.O.V. Not the movie version, but the quiet kind that reshapes thought, trust, and belonging.

The song carries the pain of what was done to her, yet it isn't about despair. It's about repair.`,
        lyrics: ``
    },
    {
        id: 40,
        title: "What You Don't See (Symphony)",
        artist: "Isla",
        date: "RETROSPECT (OCT 21, 2025 EVENT)",
        subtitle: "Witnessed survival · public reckoning",
        videoId: "hm2kp7LOhsg",
        img: "What_You_Dont_See_Isla_and Symphony.jpg",
        story: `This is the live version of Isla's song: What you don't see. It's Isla on a piano with a Symphony Orchestra.

Same meaning, grander scale. The orchestra amplifies every fracture, every moment of repair.`,
        lyrics: ``
    },
    {
        id: 41,
        title: "Raise The Fourth (With Symphony)",
        artist: "Isla",
        date: "RETROSPECT (OCT 21, 2025 EVENT)",
        subtitle: "Exposure · endurance held live",
        videoId: "ZBLMDbwcy4g",
        img: "Isla_Raise_the_fourth_isla_with_symphony.jpg",
        story: `Raise the Fourth (A Drop from the Fourth) is Isla at her most exposed. She's singing from that narrow edge between thought and action.

The lyrics unfold like a confession in motion, describing the build-up to a suicide that never happened, told as if it did.

It isn't a song about death, but about recognizing what could have been.`,
        lyrics: ``
    },
    {
        id: 42,
        title: "Give It Back",
        artist: "Isla",
        date: "RETROSPECT (2024)",
        subtitle: "Reclamation · power returned",
        videoId: "Aw2ZAkxp6b0",
        img: "Isla_Give_it_Back.jpg",
        story: `Give It Back sounds like a demand, but it's more layered than that. Isla is reaching toward the years that were never really hers.

What she's really doing is promising to return everything taken from her, only louder. The stage becomes her witness box, the amps her proof.`,
        lyrics: ``
    },
    {
        id: 43,
        title: "Don't Wake Him Yet",
        artist: "Isla",
        date: "RETROSPECT (2022 · remembering AGE 15, 2016)",
        subtitle: "Flight · loss · first irreversible night",
        videoId: "NwqHLFYR1mA",
        img: "Isla_Dont_wake_Him_yet.jpg",
        story: `Don't Wake Him Yet reaches back to when Isla was fifteen and ran away with a boy and her father's credit card.

It begins like a memory wrapped in adventure. A night flight with the glow of airports and the rush of escape. It darkens quietly, one mental image at a time.

A trip that starts in rebellion ends in loss.`,
        lyrics: ``
    },
    {
        id: 44,
        title: "Melody of Normality",
        artist: "Isla",
        date: "RETROSPECT (2024)",
        subtitle: "Reckoning · rage sharpened by memory · scars conducted",
        videoId: "a4TpIhna55k",
        img: "Isla_Melody_of_normality.jpg",
        story: `The fire on stage is real. So is the past she's burning through. Isla's Melody of Normality isn't a song. It's a reckoning — a ritual of rage sharpened by memory, fueled by the kind of pain you don't survive without changing.

This isn't about catharsis. This is about taking every scar and making them watch. The chaos never left. She just learned to conduct it.`,
        lyrics: `Yeah… they know who they are...

Oh… what I would do to those from my past -
Oh…. It would not be nice.

But we turn that all into performance don't we.
Where the hell do you think it all comes from!!!

A nice little melody of normality?
Hell no!!!
Art. Is. Pain!!!!!

I bite back bile just to speak.
Choke on names, not meant to keep.
Laugh out loud, a past bent deep.
Burned the tape but looped the whispers.

Mother danced like wine on fire,
Taught me pain makes people admire.
Her nails, my skin, just a frame to pin.

Old man? Just a last name.
A judge not judged. A family named clean.
Kept me quiet, choked then drowned.
Shattered the glass on shame-soaked ground.

I paint in pain, then throw it wide
Etch the hands that bent my sight.
Scream my damage into form.
Hang the sound on a cruciform.

Not just to heal. This is proof.
You can bleed… and still find truth.

Addict lit in defensive haze,
broken edges, poetic in phrase.
Tried the needle, tried the song,
one felt right. One went wrong.

Gave her keys to court locked dirt,
passwords, patterns, pieces that hurt.
Didn't ask her to forgive me.
Just wanted someone to finally see me.

Can't keep me quiet. I'll tune the scars.
I'll turn their rooms into guitars.
I was taught to freeze behind the door,
I'll be the sound that cracks the floor.

Mic in hand, I'll thread the flame.
Each note sewn with what won't name.
This isn't healing. This is force.
I won't fade out. I'll score the chorus.

It's all still in there.
Still breathing.
Still dressed.
Still… undone.`
    },
    {
        id: 45,
        title: "What This Was Always For",
        artist: "Isla",
        date: "RETROSPECT (RECORDED 2024)",
        subtitle: "Purpose revealed · noise as destiny",
        videoId: "X9EUb1_QC9c",
        img: "Isla_What_This_was_Always_For.jpg",
        story: `ISLA hits like impact and endurance colliding. It's the first song she wrote with her new band with a sound built for distortion and defiance, with Isla's voice cutting clean through the chaos.

The lyrics reclaim what was taken from her. Strength twisted into pain. Silence mistaken for control. She turns both back on themselves.`,
        lyrics: `You built this for fists
For split lips
For broken things that don't scream right
But not for her
Not for the one
Who stopped breathing right, but never died

And you called it power
All those nights in the red
But I hear what you buried
You can't hide it from this throat

You wrote the wall
I crack the wall
This was always waiting for me
This was never noise
It was pressure with no valve
It was a room without exits

You wanted loud
I bring the sound you can't outlive
You kept it hot to cauterize the memory
I breathe it back in

Every night
You called it rage
That's not the word
She had a name
You never learned it

You wrote escape
I wear what followed
You can't mute what this became
You thought she vanished
The girl behind the door
But she learned how to hum in ruin

She tuned her scars
This is not your fire now
This is not your edge now
You built the pit
But I climbed it screaming

I know what this was always for`
    }
];


// Load lyrics from external text file
async function loadLyrics() {
    try {
        const response = await fetch('song_content.txt');
        const text = await response.text();

        const songPattern = /=== SONG (\d+):.*?===[\s\S]*?--- LYRICS ---\s*\n([\s\S]*?)(?=\n=== SONG|\n=== END ===|$)/g;

        let match;
        while ((match = songPattern.exec(text)) !== null) {
            const id = parseInt(match[1]);
            const lyrics = match[2].trim();

            const song = ARCHIVE_DATA.find(s => s.id === id);
            if (song && lyrics && !lyrics.startsWith('[Paste')) {
                song.lyrics = lyrics;
            }
        }

        console.log('Lyrics loaded from song_content.txt');
        if (typeof renderGrid === 'function') renderGrid();
    } catch (e) {
        console.log('Using embedded data (no external lyrics file found)');
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', loadLyrics);
}
