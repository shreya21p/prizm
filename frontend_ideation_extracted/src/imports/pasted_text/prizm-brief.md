HACKATHON PROJECT BRIEF

rename the project to prizm
Context Collapse Visualizer
How the same 12 words mean 12 completely different things
Prepared for internal team review  |  Hackathon prep document

Quick Summary
Context Collapse Visualizer is an AI-powered tool that takes any piece of text — a social media post, a news headline, a policy statement — and shows how it lands across 12 different audience segments simultaneously. It exposes the interpretation explosion that happens every time content goes public, and then offers a rewrite that reduces divergence.

84%
of harmful sharing is unintentional (MIT)	12
audience segments per analysis	3-in-1
verify → visualize → rewrite	48h
buildable MVP scope
 
01  THE PROBLEM

What is context collapse?
Context collapse is what happens when a piece of content written for one audience reaches many. A tweet meant for your 200 followers gets retweeted to 200,000 people with completely different backgrounds, fears, and reading contexts. The words stay the same. The meaning explodes.

This is not a fringe problem. It is the default condition of all public communication in 2024.

Who causes harm — and why it matters
The common assumption is that harmful content online is mostly deliberate. The data says otherwise.

MIT Sloan Research Finding (published in Nature)
Of all false or harmful content shared on social media: 51% is driven by inattention (people simply not thinking about impact), 33% by genuine confusion about accuracy, and only 16% by deliberate intent. The large majority of people across the ideological spectrum want to share only accurate, harmless content.

The unintentional harmer
Makes up ~84% of harmful sharing. Causes damage without realizing it. Would choose differently if shown the consequences in advance. This is your user.

•	Good-faith journalist with blind spot
•	Policy communicator with a regional audience gap
•	Brand team that missed a cultural context
•	Activist whose framing alienates allies	The deliberate bad actor
Makes up ~16% of harmful sharing. Knows the damage. Won't be stopped by a tool like this. Not your user — and not your problem to solve.

•	Political disinfo operatives
•	Coordinated inauthentic campaigns
•	Trolls and targeted harassment
•	Clickbait farms optimizing outrage

The pitch line (memorize this)
"84% of harmful sharing is done by people who, if shown the consequences in advance, would have chosen differently. We built the tool that shows them."

 
02  REAL-WORLD EVIDENCE

Famous unintentional harm cases — use these on stage

Justine Sacco (2013) — The definitive context collapse case
Senior director of communications at a major media company. Posted what she thought was dry, ironic satire to her 170 followers before boarding a long-haul flight. By the time she landed, the tweet was the #1 trending topic globally, and she had been fired. She had no idea how the words would read outside her immediate social bubble. She did not intend harm. She caused it anyway.

Why this matters for your pitch
This is context collapse in its purest form. One interpretation in her head. Thousands of others in the world. Context Collapse Visualizer, run before posting, would have shown her exactly what was coming.

Starbucks #SpreadTheCheer (2012)
Starbucks launched a holiday campaign asking customers to use the hashtag #spreadthecheer. What the campaign team did not anticipate: the hashtag was immediately flooded with tweets about Starbucks avoiding UK taxes — displayed live on a giant screen at London's Natural History Museum, where Starbucks sponsored an ice rink. Pure good intentions. Total reputational disaster. The audience segment they missed (tax-angry British consumers) was massive and primed.

Entenmann's #NotGuilty (2011)
The bakery brand used the trending hashtag #notguilty in a promotional tweet without checking what it was trending for. It was the verdict in a high-profile murder trial. They apologized, calling it 'insensitive, albeit completely unintentional.' A 30-second context check would have caught this.

Gal Gadot's Imagine video (2020)
A group of celebrities posted a well-meaning video singing John Lennon's Imagine during COVID lockdowns as a gesture of global solidarity. Gadot later acknowledged it was in 'poor taste' — but the intent was pure. The reception across different audience segments ranged from genuinely moved to furious. Frontline healthcare workers, economically devastated families, and grieving communities were among the segments who read it completely differently from the celebrities' intended message.

The scale in numbers

3-7%
of users produce most harmful content online (Stanford)	43%
is what people THINK that number is — 6x overestimate	1/3+
of Americans have shared false content without knowing it	70%
more likely: false content gets retweeted vs true (MIT, 2018)

 
03  THE PRODUCT

Three-stage pipeline
What started as a single-feature tool has evolved into a three-stage pipeline where each stage answers a distinct question.

Stage	What it does	Question answered	Tech
1	Claim verification	Is this post based on accurate information?	Web search + source credibility signal
2	Context collapse visualization	How will this land across 12 different audience segments?	12-persona prompt chain + divergence UI
3	Safe phrasing suggester	How do I rewrite this to reduce interpretation variance?	Second LLM pass on the 12 outputs

Critical insight on Stage 1
The fact-check layer does NOT gate Stage 2. Both true and false content run through all 12 segments — because knowing how false content lands across different communities is arguably more important for journalists and policy communicators who need to proactively counter it.

The 12 audience segments
Segments must be specific enough to feel real but diverse enough to show the interpretation explosion. Each persona card has: age, geography, occupation, and one psychographic marker.

Example set (India-focused — adapt for your target geography):

• 60-year-old retired teacher, Coimbatore	• 19-year-old engineering student, Delhi
• Small business owner, Patna — low trust in institutions	• 35-year-old IT professional, Bengaluru
• 45-year-old farmer, rural Punjab	• 28-year-old journalist, Mumbai
• First-generation smartphone user, tier-3 town	• 50-year-old government employee, Lucknow
• 22-year-old activist, Chennai	• 40-year-old homemaker, Ahmedabad
• Migrant worker, recently returned from Gulf	• 16-year-old student, consuming content in vernacular language

What we are NOT building (scope boundary)
Explicitly out of scope for the 48h MVP
User accounts and history | Sharing features | Mobile responsiveness | Real-time API connections | Full production database | Onboarding flows

04  ETHICAL POSITION

Two hard questions — and our answers

Q: What about deliberate bad actors who use this as a targeting tool?
A valid concern. Someone who knows their message will cause harm in certain communities could theoretically use Context Collapse to identify which segments to target more precisely. We cannot prevent this entirely. But three things matter here:

•	The 84/16 split means the population of good-faith users vastly outnumbers those who would weaponize it
•	Deliberate targeting tools already exist and are far more sophisticated — this doesn't provide meaningful uplift to bad actors
•	The tool is designed for communicators, not broadcast platforms — the distribution mechanism is different

Our design response
We will add a visible intent disclaimer in the UI: "This tool helps you understand impact, not avoid accountability." Small copy. Big signal to judges.

Q: Does this create reputation-management behavior without genuine attitude change?
Yes. A user who rephrases their post to avoid backlash has not necessarily changed what they believe. This is the difference between behavioral compliance and attitude change. Our answer:

This tool was never designed to change minds. It was designed for good-faith communicators who cause unintentional harm — and for that population, behavioral change IS the goal. If showing someone the impact of their words makes them choose different words, that is a net positive outcome, regardless of whether their internal beliefs shifted.

Pitch framing for this objection
"We're not a therapy tool. We're a communication tool. No communication tool has ever solved the problem of deliberate bad actors — and neither will we. What we do is give the 84% a mirror before they post."

 
05  TWO-WEEK EXECUTION PLAN

Week 1 — Demo design (no product code yet)
Rule
Do not write a single line of product code this week. Everything is demo design.

•	Find 3-5 real, recent Indian headlines that shatter beautifully across segments — farm loan waivers, urban air quality, reservation policy, religious event coverage
•	Map the divergence manually for each headline before building anything — this becomes your ground truth for prompt quality
•	Write all 12 persona cards in full — age, geography, occupation, psychographic marker, key fears, key priors
•	Define the exact 90-second demo flow: what gets pasted, what appears, what the freeze moment is
•	Decide on the claim verification framing: NOT a confidence percentage — a sourcing signal (well-supported / contested / no credible source found)

Week 2 — Build backwards from the demo
Build only what the demo needs. In priority order:

#	Task	Why it's the priority
1	Persona prompt engineering	Bad personas give generic outputs — this is the core IP
2	Divergence visualization UI	The freeze moment for judges — must be spatial, not a list of paragraphs
3	Claim sourcing signal (Stage 1)	Adds credibility; keeps you honest about what the tool can actually do
4	Safe phrasing suggester (Stage 3)	The actionable layer that makes this a tool, not just a demo
5	Input flexibility (headline vs full post)	Nice to have — only if time permits

 
06  PITCH STRATEGY

The demo structure — 90 seconds

0:00 – 0:10	Put a real headline on screen. No explanation. Ask one judge: "What do you think this means?" Get one answer.
0:10 – 0:40	Run it live through the tool. Watch 12 readings appear simultaneously on screen.
0:40 – 0:55	Point to the gap between what the judge said and what 3 of the segments produced. "That gap is the problem."
0:55 – 1:20	Show the safe phrasing suggester rewriting the headline. Show the variance drop across segments.
1:20 – 1:30	"This is for the 84% who cause harm without knowing it. The other 16% are a different problem."

The three things judges need to hear (in order)

•	1. The problem size
Context collapse affects every public communicator — journalists, policy teams, educators, brand managers, activists. It is not niche.

•	2. The specific use case
This tool is for good-faith communicators who cause unintentional harm. Not for fixing bad actors. That clarity makes the pitch credible.

•	3. The business line
B2G: government communications departments and public health agencies. B2B: media organizations and PR firms. Both have compliance and reputational incentives that create willingness to pay.

The one question you must answer cold (in under 10 seconds)
"Who pays for this and why?" Answer: Government communications teams and media organizations pay to avoid the reputational and policy damage that comes from messages that land wrong across different communities. The cost of one PR crisis exceeds the cost of a tool subscription by orders of magnitude.

What makes this different from every other LLM hackathon project
Most LLM projects at hackathons are wrappers: paste text, get output, done. The technical differentiation here is the comparative structure — the same input producing 12 simultaneous divergent readings that the user sees side by side.

That is not a wrapper. That is a new way of seeing communication. Make sure the visualization makes that comparison visceral — not a list of paragraphs, but something spatial and scannable where the divergence is immediately obvious before anyone reads a word.

REFERENCES

MIT Sloan / Nature Communications: Pennycook et al. — Shifting attention to accuracy can reduce misinformation online (2021). Inattention accounts for 51.2% of misinformation sharing.

Stanford Internet Observatory / PNAS Nexus: Americans overestimate how many social media users post harmful content. Actual harmful-content producers: 3-7% of users. Perceived: 43-47% (2025).

MIT Media Lab — Vosoughi, Roy, Aral (Science, 2018): False information is 70% more likely to be retweeted than true information and reaches 1,500 people 6x faster.

Redline Digital / Pew Research: Over one-third of Americans have shared false content without realizing it.