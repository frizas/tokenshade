# Raybox visual system

The reading surface should remain the focus. Product chrome uses dark ink
`#101923`, warm paper `#FFF1D6`, aqua `#59D8D0`, and coral `#FF6B5F`.

Reusable engine components accept semantic roles such as `surface`, `accent`,
and `warning`; they do not contain Raybox names or literal marketing copy.
Product adapters translate semantic roles into the active theme.

Connection state is presentation-owned:

- reconnecting uses the semantic `warning` role;
- restored sessions use `accent`;
- a disconnected session restores the theme that existed before the session;
- engine cleanup must not force a hard-coded global color.

Static assets and one compositing layer are preferred. Per-frame glow, blur,
and animated ornament are prohibited in the fixture.

The adapter is responsible for user-visible phrases, including reconnect and
offline messages. Reusable engine modules expose status values and callbacks
instead of embedding product prose.
