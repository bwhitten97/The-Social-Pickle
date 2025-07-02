# The Social Pickle – Project Overview (Palmer Wenzel Template)

**Last updated:** 2025-07-01  
**Authors:** Blake Whitten & ChatGPT (o3)

---

## 1. Objective / Vision
> The Social Pickle makes it effortless for recreational *pickleball* players to find compatible partners, fill open games, and connect through in-app chat—starting with busy adults who want social, spontaneous exercise without the hassle of group texts or awkward skill mismatches.

## 2. Success Metrics (define “done”)
- **1,000 Monthly Active Users (MAU)** by end of **Q4 2025**
- **Week-4 retention ≥ 35 %** for beta cohort
- **60 % of scheduled games** created in-app actually occur (verified feedback loop)
- **NPS ≥ 40** from at least 50 survey responses

## 3. Problem Statement
1. Players rely on fragmented Facebook groups / group texts to find partners → high dropout & coordination overhead.
2. Scheduling pick-up games is ad-hoc; last-minute cancellations leave courts unused and players scrambling.
3. Newcomers struggle to gauge others’ skill levels and vibe, leading to mismatches and awkward games.

## 4. Proposed Solution (MVP)
- **Mobile-first PWA** (built in Cursor using Claude Code) with:
  - Swipe-style **“Find a Partner”** feed filtered by zip code, skill rating, and availability.
  - In-app **chat** once both players “like” the match.
  - **“Need a 4th?” board** for drop-in listings (inspired by your TeeUp feature).

## 5. Scope & Guardrails
| In-scope (v1) | Out-of-scope (v1) |
|---------------|-------------------|
| Profile, match feed, chat, listing board | Payments, club management features, tournament brackets, iOS/Android native builds, advanced ranking algorithms |

## 6. Key Users / Stakeholders
- **Primary user:** Casual pickleball players (ages 25-55, USTA 2.5-4.0 equivalent).
- **Secondary:** Rec-center managers who want higher court utilization.
- **Internal stakeholders:** Founder (Blake), Product (ChatGPT co-pilot), Contract dev(s), Designer.

## 7. Assumptions & Dependencies
- Users comfortable with PWA installation; App-Store presence not required at launch.
- Budget available for **$99/mo** OpenAI key + hosting.

## 8. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Players churn if no partners nearby | Med | High | Seed launch in two target zip codes with existing pickleball meetup lists |
| Data privacy for chat | Med | Med | Use end-to-end encryption lib from day 1 |

## 9. Timeline / Milestones (high level)
| Date (2025) | Milestone |
|-------------|-----------|
| **Jul 8** | Finalize vision & success metrics |
| **Jul 15** | Click-through Figma prototype |
| **Aug 5** | MVP alpha (find partner + chat) |
| **Sep 2** | Closed beta (25 users) |
| **Oct 14** | Public beta in two zip codes |
| **Dec 1** | GA launch & KPI review |

## 10. Next Steps (this week)
1. Blake to review/adjust **Vision** and confirm success metrics.  
2. ChatGPT to spin up **Cursor repo** with Claude Code pre-configured.  
3. Conduct **5 user interviews** to validate core pain points & willingness to try the app.

---

### How to use this doc
Save this file as `PROJECT_OVERVIEW.md` in your Cursor repo root. Claude Code will reference it for context. Keep edits atomic and commit messages descriptive.
