# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->
<!-- This monorepo requires package-scoped branch names and a package owner -->
<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->
<!-- The walking skeleton must exercise the legacy service adapter as well -->
<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

- Give every functional requirement its own pass/fail criterion, so later stages don't have to invent acceptance checks. (learned 2026-10-04) <!-- cid:261004-poc:requirements-analysis:a63649ae128776bb64109a1dc4ac96d2915d9c43443869da572c51c32731bae2 -->

- When a workflow has no NFR design artifacts (such as poc), build the Build and Test target inventory from the Testing Contract obligations plus the requirements' own NFRs and any measurable functional checks. (learned 2026-10-04) <!-- cid:261004-poc:build-and-test:bd8c8efc1c5711e9941413cb14cbb5a39e6db96c4550d04d499bf141821241a2 -->

## Guard Policy

<!-- Project-specific. Mode: strict, relaxed, or off. Strict here holds for every intent and cannot be changed from chat. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
- When a question has more than four choices, offer the "Not yet defined" choice through the Other escape and say so in the question text; the questions file keeps the full option set. (learned 2026-10-04) <!-- cid:261004-poc:intent-capture:34eb4b826df5aabcfb8a5ef89b4148f7975336941e67b2c12d27dc53ec512e74 -->
- Cross-check all answers for contradictions (for example, a rule that needs several partners vs. a single demo partner) before presenting the consolidated summary, not after it is confirmed. (learned 2026-10-04) <!-- cid:261004-poc:requirements-analysis:9a4cc78eebb5f07fb51cb12debfc0b034e49c1296e0c1ffa9cd6564201bc7b1a -->
- In scopes with no design stage (such as poc), settle open requirement-review findings as numbered decisions in the Code Generation plan, so they are approved with the plan before any code is written. (learned 2026-10-04) <!-- cid:261004-poc:code-generation:7a843aad2d230b94c2214890c16adddaa39584f3d67631b5705720f345fcdc13 -->
