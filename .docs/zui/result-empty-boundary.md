# Result and Empty Boundary

Status: production contract implemented, 2026-09-02.

## Product meaning

`ZResult` answers “what happened after an important operation?” It may communicate success, information,
warning or failure, include detailed processing context, and offer next actions. It is a labelled section,
not a live region: the owner that completed the asynchronous task decides whether Alert or Toast should
announce the transition.

`ZEmpty` answers “why does this collection currently contain no items?” It is neutral and covers first use,
filtering with no matches, deliberate clearance and ordinary no-data states. Failure to perform an operation
is not Empty. Empty has no tone because no data is not intrinsically success, warning or danger.

Neither component owns loading. A collection or task owner renders `ZSkeleton`/`ZSpinner` while work is in
progress and chooses Result or Empty only after the outcome is known.

## Shared semantic contract

- Both roots are real `section` elements labelled by an SSR-stable title id.
- Both consume `ZHeading`; `headingLevel` supports 1–6 and never uses `role=heading`.
- Default and custom icons are decorative. The wrapper and built-in Lucide icon are `aria-hidden`, so title
  and description/content are not announced twice.
- `icon={null}` explicitly removes the icon without rendering an empty SVG placeholder.
- Actions are caller-owned button/link snippets and wrap in narrow containers.
- Long CJK and unbroken identifiers use safe wrapping; native section attributes continue to pass through.
- `children` remains a compatibility body. New code uses Result `content` and Empty `description`; providing
  both names at once fails early rather than creating ambiguous order.

## Deliberate differences

| Concern           | ZResult                                                  | ZEmpty                             |
| ----------------- | -------------------------------------------------------- | ---------------------------------- |
| Meaning           | Important operation outcome                              | Collection has no items            |
| Visual semantics  | `info/success/warning/danger`, identical to Alert        | Neutral only                       |
| Body              | Optional rich `content`, center or logical-start aligned | Optional centered `description`    |
| Default icon      | Tone-specific Lucide                                     | Neutral Inbox Lucide               |
| Actions           | Retry, continue, inspect, return                         | Create, clear filter, change scope |
| Live announcement | Never automatic                                          | Never automatic                    |
| Loading           | External owner                                           | External owner                     |

## Mature-library takeaways

- [Ant Design Result](https://ant.design/components/result/) validates the icon/title/subtitle/body/extra
  anatomy. ZUI adopts those regions but keeps only Alert-compatible tones; HTTP codes remain ordinary title
  content rather than expanding the tone union.
- [Ant Design Empty](https://ant.design/components/empty/) validates image/description/footer and recovery
  guidance. ZUI uses Lucide/CSS or a typed Snippet instead of URL-based built-in illustrations and does not
  add a global render-empty singleton.
- MUI has no first-party Result or universal Empty component. ZUI therefore does not disguise Alert,
  CircularProgress or a page template as either contract.
- Naive UI's Result/Empty precedent supports keeping feedback and no-data components separate; ZUI does not
  copy broad preset/status aliases or loading ownership.

## Deferred scope

No HTTP status presets, image URL shorthand, global empty renderer, route navigation, automatic focus,
loading state, live-region priority or page-template layout is part of these components. Those responsibilities
remain with routing, collection, task, Alert/Toast, Skeleton/Spinner and application-shell owners.
