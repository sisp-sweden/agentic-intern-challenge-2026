# Task D — Meta: design a prompt

Fieldnote gets founder applications as free-text — sometimes a tidy paragraph, often a rambling one, occasionally in a mix of English and Swedish. Someone on the team currently reads every single one by hand to pull out four things: **startup name, stage, industry, and what they're actually asking for** (funding, mentorship, an intro, something else). It doesn't scale.

## Your task

Write the **system prompt** you'd give an LLM agent whose job is to read one of these applications and extract those four fields reliably.

The deliverable here *is* the prompt — there's no separate app to build. Five example applications are in `examples/`, each messy in a different, realistic way. Use them to actually test and refine what you write; don't just write a prompt once and assume it holds up.

One of the examples mixes English and Swedish, since that's realistic for us — but you don't need to read Swedish yourself to handle it. The Swedish clauses only add color; every field that example actually states (stage, industry, ask) is stated in the English portions. Like two of the other examples, it never states a startup name at all — that's intentional throughout, testing whether your prompt correctly outputs "not specified" rather than guessing one.

## Submit

- Your final system prompt
- The extracted output it produces for each of the 5 examples
- Your **complete chat transcript** showing how you iterated on it

~20–30 minutes.
