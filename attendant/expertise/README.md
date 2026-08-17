# Expertise layer

Structured judgment for the Attendant — **not** visitor-facing dumps.

| Kind | Path |
| --- | --- |
| Product/service cards | `cards/*.json` |
| Guidance | `*.md` listed in `manifest.json` |
| Manifest | `manifest.json` |

Runtime: `php/attendant/src/ExpertiseLibrary.php` selects a small set of cards/guidance per turn from page focus, commercial state, and message topics.

Live package **prices and inclusions** still come from `get_product` / structured catalogue — cards supply judgment only.
