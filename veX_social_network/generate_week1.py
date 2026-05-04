#!/usr/bin/env python3
"""Generate week_01.json for veX scheduled posts."""
import json, os
from datetime import datetime, timedelta

BASE = datetime(2026, 5, 5, 0, 0, 0)  # Start date

# (day_offset, hour, minute, handle, display_name, avatar, content, image, image_alt, reply_to, post_type)
# Using existing handles from profiles.json where available

RAW = [
# DAY 1
(0,6,14,"@marcus_vane","Marcus Vane","","Quarterly compliance review complete. Eighteen jurisdictions. All green. The machine doesn't need a driver. It needs maintenance.",None,None,None,"post"),
(0,6,45,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] Found this in the archives. The first band. Back when the Conservatorium of Music Sydney kicked her out but she kept the band going anyway. The Stanmore years began here.","characters/Isla_first_band_from_conservatoriumOfMusicSydney_kiickedOutOfConservatoriumButKeptBandUndtillSheLetf_SeeStanmoreye.jpg","Early band photo after being kicked out of Conservatorium",None,"post"),
(0,7,2,"@the_barista","Penelope","","New regular. Third Tuesday in a row. Long black, no sugar, pays cash. Sits facing the door. Tips exactly 10%. I shouldn't notice these things but I do.",None,None,None,"post"),
(0,7,45,"@truckie_dave","Truckie Dave","","Three hours at the boom gate. Gazza reckons the scanner's updating. Always updating. Never updated. Had to eat me sandwich cold. Unacceptable.",None,None,None,"post"),
(0,9,10,"@iron_irene","'Iron' Irene","","Bail application denied. Defence argued community ties. His passport has more stamps than a post office. Try again, sweetheart.",None,None,None,"post"),
(0,12,30,"@elena_corves","Elena Corves","","Dinner at Per Se. The General Counsel brought his wife. She wore the necklace from the Hamptons weekend. Bold choice. I complimented it.",None,None,None,"post"),
(0,13,15,"@the_liability","The Liability","","Great news. Registered the business with SafeWork NSW. We are now officially Sunrise Pool Supplies Pty Ltd. Inspector comes Tuesday. Should probably move the... equipment.",None,None,None,"post"),
(0,14,20,"@agent_miller","Agent Allie Miller","","Third coffee. Pulled the Jersey City permit archive for 1999. Cross-referencing with the holding company filings. My boss asked why I'm still on this. I said I like reading.",None,None,None,"post"),
(0,15,0,"@ross_kinley","Ross Kinley","","Proud to announce $14M in community infrastructure upgrades for Western Sydney. Roads, bridges, futures. Building tomorrow, today.",None,None,None,"post"),
(0,16,30,"@jack_shiv","Jack 'The Shiv'","","Got a call from a bloke I haven't heard from in eight years. Used to drink at the same pub. He sounded different. Scared, maybe. Buying him lunch on Thursday.",None,None,None,"post"),
(0,17,0,"@sarah_k","Sarah K","","Started pulling the thread on the Barangaroo rezoning. The shell company has a PO box in George Town. The PO box has a PO box. This is going to be a long week.",None,None,None,"post"),
(0,17,45,"@uni_vc","University VC","","Excellent news: international applications up 38% for Semester 2. Our Global Pathways initiative is resonating.",None,None,None,"post"),
(0,18,15,"@shazza","Shazza","","Someone submitted a fuel receipt from a Shell station that closed in 2019. The Shell station is now a Bunnings. Do they think I don't use Google Maps? Claim rejected.",None,None,None,"post"),
(0,19,0,"@dr_alfayed","Dr. Al-Fayed","","Spent the morning reviewing old files. Some cases age like wine. Others age like evidence. The Harrington file is the latter.",None,None,None,"post"),
(0,20,30,"@pieter_block","Pieter 'The Block'","","Container 4471-B listed as agricultural equipment. Weight discrepancy of 340kg. Holding for secondary inspection. The captain can call whoever he wants. Gate 7 stays closed.",None,None,None,"post"),
# DAY 2
(1,6,45,"@elena_corves","Elena Corves","","Coffee with Martin from Deutsche. He looks thinner. Stress does that. I asked about his daughter's recital. He changed the subject. Interesting.",None,None,None,"post"),
(1,7,0,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] Throwback to the Factory Theatre acoustic sessions during the Stanmore era. Stripped back, raw, and bleeding on the fretboard.","characters/isla_factor_theatre_stanmore_years_acousticSession_1.jpg","Isla acoustic session at Factory Theatre Stanmore",None,"post"),
(1,7,15,"@truckie_dave","Truckie Dave","","Early start. 4 AM. Roads are empty. This is when I love the job. No traffic, no questions, just the road and the radio. Dropped the load by six. Beautiful.","post_images/truckie_dave_dashcam.jpg","Dashcam view approaching Gate 4 at dawn",None,"post"),
(1,8,0,"@the_barista","Penelope","","Tuesday guy is back. Same order. Same table. But he got a phone call and stepped outside. I could see his reflection in the window. He wasn't happy.",None,None,None,"post"),
(1,9,30,"@ross_kinley","Ross Kinley","","Productive meeting with the Roads Minister this morning. Infrastructure isn't glamorous, but it's the backbone of every community. More announcements soon.",None,None,None,"post"),
(1,10,15,"@stevo","Stevo","","Sent Sandra the pre-tenancy photos. Time-stamped, geo-tagged, professionally labelled. She cannot dispute the stain in the garage. The soil report confirms it.",None,None,None,"post"),
(1,11,0,"@iron_irene","'Iron' Irene","","Witness box. Day one. He looked at his lawyer for help. His lawyer looked at the ceiling. We're going to have a lovely week together.",None,None,None,"post"),
(1,13,0,"@agent_miller","Agent Allie Miller","","The 1999 permit connects to a company dissolved in 2003. The director of that company is now on the board of a Zurich-registered holding firm. Six degrees. Getting warmer.",None,None,None,"post"),
(1,14,30,"@sarah_lin","Sarah Lin","","Acquired the .com, .net, and .org for a rather interesting company name this morning. Protective registration, of course. The company hasn't launched yet. I like to plan ahead.",None,None,None,"post"),
(1,15,45,"@jack_shiv","Jack 'The Shiv'","","Went through my old notebooks. Three names keep coming up in different stories across different decades. The same three names. Coincidence is just a pattern without a journalist.",None,None,None,"post"),
(1,16,15,"@daz_omalley","Daz O'Malley","","Safety audit at the Parramatta site. Found a loose bolt on the scaffolding. Shut the whole thing down for 48 hours. Management screamed. The bolt didn't.",None,None,None,"post"),
(1,17,0,"@the_liability","The Liability","","Boss asked me to clean up the office. I cleaned up the office. Mopped, swept, put the chemicals in the proper storage cabinet. Even labelled them. Now he's angry about the labels. Can't win.",None,None,None,"post"),
(1,18,0,"@dr_alfayed","Dr. Al-Fayed","","A colleague asked why I keep Harrington's file on my desk. I said it reminds me that patience is a medical instrument.",None,None,None,"post"),
(1,19,30,"@kaylee","Kaylee","","Made snickerdoodles for the night shift. Kevin left his badge on the counter AGAIN. I put it in the lost and found. I'm too nice.",None,None,None,"post"),
(1,20,0,"@uni_vc","University VC","","Concerning reports that the proposed fee cap may impact our research output. Education is an investment. Capping investment is capping aspiration.",None,None,None,"post"),
(1,21,15,"@isla_band","Isla","characters/Isla_veX.jpg","Someone snuck smoke bombs into the arena. We had to stop the show. Crazy Americans.","characters/isla_dynamic_pose_singingintoMic_arena_pyro_in_background_1.jpg","Smoke filling a concert arena",None,"post"),
(1,22,30,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] The rhythm section is the foundation. Dominic holding it down on bass like a concrete pillar.","characters/Isla_band_BassistDominic_Ryker_veX.jpg","Dominic Ryker playing bass on stage",None,"post"),
# DAY 3
(2,6,30,"@the_barista","Penelope","","Okay so Tuesday guy didn't come in today. He comes every Tuesday and Thursday. It's Thursday. He's not here. His table is empty. I shouldn't care. I care.",None,None,None,"post"),
(2,6,45,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] The Black Courtroom stage design coming together. Wait until you see what we do with the gavel in the second act.","characters/Isla_concert_stage_photo_the_black_courtroom_stage_2.jpg","The Black Courtroom stage design",None,"post"),
(2,7,0,"@elena_corves","Elena Corves","","Flew to DC for a lunch meeting. The restaurant was empty except for us. She chose it. She always chooses empty restaurants. We discussed personnel realignment. She agreed to everything. Smart woman.",None,None,None,"post"),
(2,8,0,"@truckie_dave","Truckie Dave","","New bloke at Gate 4. Asking questions. What's in the container? Mate, it says textiles. Read the manifest. I don't write the manifest. I drive the truck. Get the barrier up.",None,None,None,"post"),
(2,9,15,"@iron_irene","'Iron' Irene","","Witness box. Day two. He contradicted himself three times before morning tea. His lawyer requested a recess. I requested a sandwich. Both granted.","post_images/iron_irene_courtroom.jpg","Empty courtroom witness box",None,"post"),
(2,11,0,"@agent_miller","Agent Allie Miller","","Ran the Zurich holding company through the FinCEN database. Fourteen suspicious activity reports in eleven months. Fourteen. And nobody actioned a single one.",None,None,None,"post"),
(2,12,0,"@ross_kinley","Ross Kinley","","Some wonderful community feedback on the Blacktown interchange upgrade. Infrastructure done right means fewer delays and more time with family.",None,None,None,"post"),
(2,13,30,"@ash","Ash","","The spreadsheet has 4,000 rows but column F goes blank after row 2,046. I mentioned it to the manager. She said just skip it. You can't just skip 1,954 rows. That's not how numbers work.",None,None,None,"post"),
(2,14,0,"@sarah_k","Sarah K","","The PO box in George Town is registered to a law firm. The law firm has three partners. One of them lives in Sydney. This is going to take a while. I have time.",None,None,None,"post"),
(2,15,30,"@bigmarge","Big Marge","","Some suit walked in last night with two blokes who looked like they eat protein powder for breakfast. Ordered a Grange. Threatened my glassie. I barred them. For life. My pub. My rules.",None,None,None,"post"),
(2,16,0,"@jack_shiv","Jack 'The Shiv'","","Lunch with the old contact. He didn't eat. Just sat there shredding a napkin. Gave me a name. A new one. I'll run it tonight.",None,None,None,"post"),
(2,17,15,"@the_liability","The Liability","","The SafeWork inspector called to confirm Tuesday. She asked if we have a Material Safety Data Sheet for our chemicals. I said of course. We don't. Does anyone know what a Material Safety Data Sheet is?",None,None,None,"post"),
(2,18,30,"@frau_edelstein","Frau Edelstein","","Transaction 402 in the Vane quarterly lacks a counter-party signature. I have requested clarification. Until then, the account is under review. Switzerland does not have glitches.",None,None,None,"post"),
(2,19,15,"@dr_alfayed","Dr. Al-Fayed","","Received a phone call this afternoon from a DCI suggesting I move on from an old case. I moved on. I moved on to the next page of the file.",None,None,None,"post"),
(2,20,0,"@silas_kovic","Silas Kovic","","Minor supply chain disruption in the North Sea corridor. Container 4471-B held at Gate 7 for re-inspection. These delays cost time and money. Patience.",None,None,None,"post"),
# DAY 4
(3,7,0,"@elena_corves","Elena Corves","","Back in New York. Quiet evening. Reviewed the DC files. Everyone has a gap year. Martin's was 2014. Six months. No credit cards. Why does nobody use their credit cards in Bangkok?",None,None,None,"post"),
(3,7,15,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] On set for the new music video. Fireballs in the background, guitar in hand. The heat in that room was unbearable. She didn't flinch.","characters/isla_dynamic_pose_studiophoto_musicVideo_withFire_1.jpg","Isla on music video set with fireballs",None,"post"),
(3,8,0,"@the_barista","Penelope","","He came back. Different day though. Not Tuesday or Thursday. Saturday. Nobody changes their pattern without a reason. His hands were shaking when he picked up the cup. Barely noticeable. I noticed.",None,None,None,"post"),
(3,8,45,"@truckie_dave","Truckie Dave","","Weekend run. Quiet roads. Dropped the load early. Gazza's back on Gate 4. Waved me through like always. Good bloke, Gaz. Salt of the earth.",None,None,None,"post"),
(3,10,0,"@iron_irene","'Iron' Irene","","Weekend prep. Reading the financials for Monday's cross-examination. His accountant used the word restructure fourteen times. I've highlighted each one. Monday is going to be fun.",None,None,None,"post"),
(3,11,0,"@agent_miller","Agent Allie Miller","","Saturday morning. Office is empty. I've got the whole floor to myself and the Ryker file spread across three desks. Some people do puzzles on the weekend. This is mine.","post_images/agent_miller_desk.jpg","FBI desk cluttered with files and coffee cups",None,"post"),
(3,12,0,"@ross_kinley","Ross Kinley","","Great community turnout at the Penrith town hall this morning. Asked about school zone upgrades and bus shelters. This is what representation looks like.",None,None,None,"post"),
(3,13,30,"@jack_shiv","Jack 'The Shiv'","","Ran the name my contact gave me. It connects to a property company dissolved in 2004. The same year a building in Parramatta had a structural issue that killed two workers. The inquest was inconclusive.",None,None,None,"post"),
(3,14,15,"@uni_vc","University VC","","Met with the Shenzhen delegation. Extraordinary interest in our Executive MBA. We're exploring a bespoke accelerated pathway for their cohort. Flexibility is the cornerstone of global education.",None,None,None,"post"),
(3,15,0,"@sarah_lin","Sarah Lin","","Interesting morning. A mid-size tech company launched a product using a name remarkably similar to a domain I registered three years ago. I've sent a polite letter. These things resolve themselves.",None,None,None,"post"),
(3,16,30,"@dr_alfayed","Dr. Al-Fayed","","Saturday. The morgue is quiet. I prefer it this way. Reviewed the toxicology from a 2018 case filed as natural causes. The potassium levels were not natural.",None,None,None,"post"),
(3,17,15,"@stevo","Stevo","","Woke up at 5 AM worrying about the bond. Drove to the property. Took thirty-seven photos of the bathroom grout. Sandra will not beat me on this. I am a professional tenant.",None,None,None,"post"),
(3,18,0,"@kaylee","Kaylee","","Saturday shift. Server room was warm again. The intake vent needs cleaning. I told maintenance. They said Monday. I said okay. Brought iced tea for the guys instead.",None,None,None,"post"),
(3,19,0,"@the_liability","The Liability","","Created a Workplace Health and Safety folder on the shared drive. Put all our documents in it. Boss said why is that on the SHARED drive. I said for transparency. He went very quiet.",None,None,None,"post"),
(3,20,15,"@arthur_penn","Arthur Penn","","Property inspection complete. Three permit violations documented. One minor. Two significant. The fire exit is not a fire exit if it opens into a wall. Remediation timeline: 14 days.",None,None,None,"post"),
(3,21,30,"@isla_band","Isla","characters/Isla_veX.jpg","The witness box stage. Every night. They sit in the chair and I scream the verdict at them.","characters/Isla_concert_stage_photo_the_witness_box_stage_1.jpg","The witness box stage design at an Isla concert",None,"post"),
(3,22,15,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] Promo art drop. High heels on fire, fireball in the background. The aesthetic is complete destruction.","characters/isla_dynamic_pose_art_promo_photo_withFireballInBackgroundAnd IslaWithGutar_artyHighHeelsOnFireAndHuitarInhand_leg.jpg","Promo art of Isla with high heels on fire and fireball background",None,"post"),
# DAY 5
(4,6,30,"@the_barista","Penelope","","Spent last night on the ASIC register. Couldn't sleep anyway. The company on his loyalty card doesn't match any registered entity in New South Wales. The ABN is valid but dormant since 2021. Brain itch. Big one.",None,None,None,"post"),
(4,6,45,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] Close up. That snarl isn't an act. That's ten years of venom finally finding a microphone.","characters/isla_dynamic_pose_screaming_snarl_mic_closeup_1.jpg","Isla screaming into the mic closeup",None,"post"),
(4,7,15,"@elena_corves","Elena Corves","","Monday morning briefing. The Zurich team is nervous about the compliance freeze. I told them to breathe. Paperwork is resolved with paperwork. Panic is resolved with discipline.",None,None,None,"post"),
(4,9,0,"@iron_irene","'Iron' Irene","","Cross-examination. Day three. Used the word restructure fourteen times. He flinched on the twelfth. We'll come back to that one tomorrow.",None,None,None,"post"),
(4,10,0,"@truckie_dave","Truckie Dave","","Deadset joke at the port today. New security protocol. Had to fill out a form for the form. The form asked for the nature of goods. I wrote heavy. They weren't impressed.",None,None,None,"post"),
(4,11,30,"@agent_miller","Agent Allie Miller","","The Zurich holding company has a beneficial owner listed as a trust in the Channel Islands. The trust has a single beneficiary. The beneficiary's address is a parking lot in Delaware. I love this job.",None,None,None,"post"),
(4,12,30,"@sarah_k","Sarah K","","Doorknocked the Sydney partner from the George Town firm. His wife answered. She said he was travelling. I asked where. She closed the door. People don't close doors when the answer is Bali.",None,None,None,"post"),
(4,13,45,"@jack_shiv","Jack 'The Shiv'","","The name from Thursday connects to the dissolved company. The dissolved company connects to a current entity registered in the same suburb. The director uses a P.O. box. Nobody with nothing to hide uses a P.O. box.",None,None,None,"post"),
(4,14,30,"@ross_kinley","Ross Kinley","","Infrastructure investment creates jobs, strengthens communities, and builds resilience. We need leaders who understand this. Not critics who obstruct from the sidelines.",None,None,None,"post"),
(4,15,30,"@the_liability","The Liability","","SafeWork inspector came today. She was very impressed by the fire blanket. Less impressed by the ventilation system. I said it was under renovation. She said what ventilation system. We are having follow-up discussions.","post_images/spud_safework_cert.jpg","SafeWork NSW certificate for Sunrise Pool Supplies",None,"post"),
(4,16,30,"@dr_alfayed","Dr. Al-Fayed","","Pulled the tissue samples from the 2018 case. Sent them to an independent lab. If the original findings were correct, there is nothing to worry about. If they were not, someone should worry a great deal.",None,None,None,"post"),
(4,17,30,"@pieter_block","Pieter 'The Block'","","Container 4471-B cleared after secondary inspection revealed a manifest discrepancy of 12 units. The Captain blamed translation error. From what language? Mathematics is universal. Report filed.",None,None,None,"post"),
(4,18,15,"@daz_omalley","Daz O'Malley","","Management at Parramatta want to restart before the 48 hours are up. I said the bolt needs testing by the certifier. The certifier is in Wollongong. Coming Thursday. Should've thought about the bolt.",None,None,None,"post"),
(4,19,0,"@uni_vc","University VC","","Alarming editorial in the SMH suggesting university fees should be means-tested. Education is not a charity. It is an engine of economic growth.",None,None,None,"post"),
(4,20,0,"@sarah_lin","Sarah Lin","","The tech company responded to my letter. They've offered to discuss licensing terms. I appreciate their willingness to engage. I expect it will be productive.",None,None,None,"post"),
# DAY 6
(5,6,30,"@the_barista","Penelope","","I found the dormant ABN. It was registered to an address in Mosman. The address is a house. The house is currently listed as FOR SALE. I should stop looking. I'm not going to stop looking.","post_images/mosman_glass_house_forsale.jpg","Mosman waterfront house with FOR SALE sign at dusk",None,"post"),
(5,6,45,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] More exclusive promo art. The skeleton spine design. Bare bones structure. Stripped of all the meat and lies.","characters/isla_dynamic_pose_art_promo_photo_islaSkeletonDesignSpine_arty_design_1.jpg","Promo art of Isla with skeleton spine design",None,"post"),
(5,7,30,"@elena_corves","Elena Corves","","Drinks with a former colleague. He mentioned retirement. I said that sounded lovely. He said he was thinking about writing a memoir. I said that sounded less lovely. He understood.",None,None,None,"post"),
(5,8,15,"@truckie_dave","Truckie Dave","","Boring run today. Nothing to report. Textiles in, textiles out. The scanner worked. Gazza was professional. Nobody asked questions. Perfect day at the office.",None,None,None,"post"),
(5,9,30,"@iron_irene","'Iron' Irene","","Day four. He cried. His lawyer asked for compassionate consideration. I asked for the financial records from 2019. Compassion and compliance are not mutually exclusive.",None,None,None,"post"),
(5,11,0,"@agent_miller","Agent Allie Miller","","Delaware parking lot. I drove past it this morning. It's a strip mall. There's a nail salon and a tax office. The tax office has no sign. The door was locked at 10 AM on a Tuesday. I took a photo.",None,None,None,"post"),
(5,12,30,"@jack_shiv","Jack 'The Shiv'","","Somebody left a note under my door last night. STOP DIGGING. Mate, I've been digging since 1986. You're gonna need a bigger note.","post_images/jack_note_under_door.jpg","Handwritten note reading STOP DIGGING on a doormat",None,"post"),
(5,13,30,"@ross_kinley","Ross Kinley","","Critical milestone: the Western Sydney transport corridor study has been approved. This project will transform how communities connect. Proud to lead this initiative.",None,None,None,"post"),
(5,14,30,"@dr_alfayed","Dr. Al-Fayed","","Independent lab results arrived. The potassium levels are consistent with my original findings, not with the revised report filed by the attending physician. I have written to the coroner's office.",None,None,None,"post"),
(5,15,15,"@the_liability","The Liability","","Follow-up with SafeWork went well. She said we need a Chemical Management Plan. I said absolutely. Does anyone know what a Chemical Management Plan is? Asking for a friend.",None,None,None,"post"),
(5,16,0,"@kaylee","Kaylee","","Baked lemon bars for the server room. The lead engineer said I shouldn't be in there during maintenance windows. I said I was just dropping off food. He said thanks. Maintenance windows are interesting.",None,None,None,"post"),
(5,17,0,"@ash","Ash","","Column F is still blank after row 2,046. I wrote a script to check the pattern. The blanks aren't random. They correspond to invoices from a single vendor. The vendor name is redacted. I deleted the script. Not my problem.",None,None,None,"post"),
(5,18,0,"@sarah_k","Sarah K","","The Sydney partner's wife called back. She apologised for being short. She said he's been travelling a lot. Zurich, then London. She sounded tired. The tired that comes from not knowing.",None,None,None,"post"),
(5,19,0,"@stevo","Stevo","","Sandra acknowledged receipt of the pre-tenancy photos. No disputes yet. I am cautiously optimistic. The soil report was thorough. pH levels conclusive. We are in the clear.",None,None,None,"post"),
(5,20,0,"@bigmarge","Big Marge","","Quiet night. Just the regulars. Old Tony played the pokies for three hours and won twelve dollars. He bought a schooner with it. That's the economy working as intended.",None,None,None,"post"),
(5,21,45,"@isla_band","Isla","characters/Isla_veX.jpg","Same guy. Every show. Up in the rafters. I see you mate.","characters/Isla_brutal_screamOon_stage_concert_photo_1.jpg","Isla pointing up to the rafters during a concert",None,"post"),
(5,22,15,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] Leather and black lipstick. She rarely wears it, but when she does, you know exactly what kind of set it's going to be.","characters/Isla_singing_on_stage_leatherAndBlackLipstickWhichSheRarelyWears_1.jpg","Isla singing on stage in leather and black lipstick",None,"post"),
# DAY 7
(6,6,30,"@the_barista","Penelope","","Ryker Holdings. I Googled it. Dominic Ryker. Property developer. Escaped prison. Amber alert. This is the guy whose company name was on Tuesday Guy's loyalty card. I need to think about this.",None,None,None,"post"),
(6,6,45,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] Walking across the stage. Serious look. Pyro going off behind her. Just another Tuesday on the road.","characters/isla_dynamic_pose_wallkingAcrossStage_seriousLook_arena_pyro_in_background_1.jpg","Isla walking across stage with pyro in background",None,"post"),
(6,7,30,"@elena_corves","Elena Corves","","Quiet Sunday. Reviewed personnel files from home. Made notes. Filed them in the safe. Some notes are more valuable kept than shared. That's the whole business, really.",None,None,None,"post"),
(6,8,30,"@truckie_dave","Truckie Dave","","Day off. Took the missus to Cronulla. She asked why I'm always on the phone. I said work. She said it's Sunday. I said logistics never sleep. She didn't buy it. Smart woman.",None,None,None,"post"),
(6,10,0,"@iron_irene","'Iron' Irene","","Weekend. Reading the transcript from last week. He contradicted himself nine times across four days. His lawyer is going to request a mistrial. He won't get one. See you Monday, sunshine.",None,None,None,"post"),
(6,11,0,"@agent_miller","Agent Allie Miller","","Sunday. Took the file home again. My neighbour asked if I ever take a day off. I said yes. She said when. I said when the file closes. She brought me a lasagna.",None,None,None,"post"),
(6,12,0,"@ross_kinley","Ross Kinley","","Sunday reflection. Public service isn't about headlines. It's about the quiet work. The permits, the plans, the approvals that change lives. Grateful to serve.",None,None,None,"post"),
(6,13,0,"@jack_shiv","Jack 'The Shiv'","","Sunday at the Cauliflower Hotel. Two beers and the notebook. The three names. The dissolved company. The P.O. box. The new name from Thursday. They're all pointing at the same postcode. This is a map.",None,None,None,"post"),
(6,14,0,"@the_liability","The Liability","","Created the Chemical Management Plan. Listed all our chemicals. Hydrochloric acid, pseudoephedrine, acetone... wait. Should I list ALL of them? I'll list the pool ones. Chlorine and more chlorine.",None,None,None,"post"),
(6,15,30,"@dr_alfayed","Dr. Al-Fayed","","Wrote to the Crown Prosecution Service this morning. Attached the independent lab analysis. Requested the Harrington case be reopened. The dead have waited fifteen years. A few more weeks is nothing.",None,None,None,"post"),
(6,16,15,"@sarah_lin","Sarah Lin","","The licensing call went well. They've agreed to a preliminary settlement. The number was generous. In my experience, generosity at the negotiating table usually means the alternative was worse. For them.",None,None,None,"post"),
(6,17,0,"@frau_edelstein","Frau Edelstein","","Mr. Vane's office has provided the missing counter-party signature. It appears authentic. I am verifying the signatory against our records. Verification takes the time it takes. The Alps are patient.",None,None,None,"post"),
(6,18,0,"@uni_vc","University VC","","Finalising the Semester 2 enrolment numbers. We project a record intake. The Global Pathways program is exceeding all targets. I've recommended expanding to three additional markets.",None,None,None,"post"),
(6,19,0,"@the_barista","Penelope","","Dominic Ryker. I've heard that name. Property developer. Escaped prison. The company on Tuesday Guy's loyalty card is connected to Ryker Holdings. I need to not think about this. I'm thinking about this.",None,None,None,"post"),
(6,20,0,"@marcus_vane","Marcus Vane","","Compliance matter resolved. The counter-party signature has been verified. Business continues. Disruptions are temporary. The architecture endures.",None,None,None,"post"),
(6,21,0,"@isla_band","Isla","characters/Isla_veX.jpg","[CREW] Don't miss out on the next tour. Tickets on sale Friday.","characters/isla_dynamic_pose_sining_mic_closeup_1.jpg","Isla singing into mic closeup",None,"post"),
]

def build_posts():
    posts = []
    for i, r in enumerate(RAW):
        day, h, m, handle, display, avatar, content, image, image_alt, reply_to, ptype = r
        ts = BASE + timedelta(days=day, hours=h, minutes=m)
        post = {
            "id": f"sched_w1_{i+1:03d}",
            "handle": handle,
            "display_name": display,
            "avatar": avatar,
            "content": content,
            "timestamp": ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "reply_to": reply_to,
            "link": None,
            "image": image,
            "image_alt": image_alt,
            "type": ptype,
            "pinned": False
        }
        posts.append(post)
    return posts

if __name__ == "__main__":
    posts = build_posts()
    out = os.path.join(os.path.dirname(__file__), "scheduled_posts", "week_01.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    print(f"Generated {len(posts)} posts -> {out}")
