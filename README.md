# Fieldnote — agentic intern challenge (Fall 2026)

Welcome. This is a take-home for SISP's Fall 2026 intern intake, built around one idea:

> **We're grading the transcript, not just the solution.** The code or query you hand in is evidence that your process worked — the thing we're actually assessing is *how you directed a model to get there*.

We're looking for people who can **conduct**, not just play solo. Someone who frames a problem clearly, breaks it down, pushes back on a model's mistakes, and verifies the result is worth more to us than someone who's a strong solo coder but hands off to a model uncritically. You don't need a CS degree or years of programming experience to score well here — you need to reason clearly and steer well.

## The rules, plainly

- **Use an LLM. We expect it and want to see it.** Use whichever model you like — Claude, ChatGPT, Gemini, Copilot, whatever you're comfortable with. Tell us which one in your submission (see below). We don't enforce this; the point is we're judging what you did with it, not which logo is on it.
- **Every task is designed to be a little "LLM-hard."** A prompt that one-shots the answer without any back-and-forth usually means the task's edge cases got missed, not that you found a shortcut. A shorter transcript isn't automatically better — a shallow transcript that landed a mediocre result is a worse signal than a longer one that visibly caught and fixed a mistake.
- **Time estimate: ~2 hours total**, roughly 20–40 minutes per task. This is a rough budget, not a hard stopwatch — we'd rather you finish with a clear head than rush the last task.

## The 4 tasks

| | Task | Tests |
|---|---|---|
| A | [Debug](tasks/a-debug/) | Comprehension, not trusting the first diagnosis |
| B | [SQL / data](tasks/b-sql-data/) | Giving a model the context it needs, edge-case rigor |
| C | [Open-ended build](tasks/c-open-ended-build/) | Decomposition, handling an underspecified brief |
| D | [Meta: design a prompt](tasks/d-meta-prompt/) | Prompting as the deliverable itself |

Each task folder has its own README with the brief and any starter files.

## What to submit, per task

For **each** of the 4 tasks, submit:

1. **Your solution** (code, query, or written answer — whatever the task asks for).
2. **Your complete chat transcript** with the model you used — the whole conversation, not a summary or the highlights. This is the part we actually read first.
3. **Which model you used** (one line is fine).

Submit everything through the form here: **[submission form link — TBD, points to the private eval repo's hosted form]**.

There's no fork, no PR, no git required — paste your answers into the form as plain text. If you're more comfortable writing code than using git, that's exactly who this format is for.

## Why we're doing it this way

Most take-home tests were designed for a world where you solved problems alone. That's no longer the job — at SISP, working with LLMs and agentic workflows is part of how we build things day to day. Testing whether you can grind out a correct answer unaided tells us less about how you'll actually perform here than testing whether you can direct a very capable model through a hard, ambiguous problem. That's what this challenge is actually measuring.

Good luck — and don't be shy about showing us where the model got something wrong and you caught it. That's the best signal you can give us.
