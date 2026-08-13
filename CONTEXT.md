# Closure Coordination

This context describes the domain vocabulary for identities, Game Accounts, and application data coordinated through the terminal.

- **Game Account**: a player's account on a specific server channel whose progression, roster, inventory, and schedule are tracked together. _Avoid_: Account, profile, user.
- **User Account**: the identity a person uses to authenticate with Closure and manage their account security. _Avoid_: Account, profile, Game Account.
- **User Session**: the authenticated period in which a person can access protected Closure capabilities as a User Account. _Avoid_: Auth state, login state.
- **Session Principal**: the identity and authorization snapshot carried by a User Session for access decisions during that session. _Avoid_: Auth user, user info, complete User Account.
- **Server Channel**: the distribution or login channel through which a Game Account is accessed, such as the official channel or Bilibili channel. _Avoid_: Platform, device platform.
- **API Node**: an API entry point that Closure can select for its application traffic, such as a domestic or overseas mirror. _Avoid_: Server, network node, Server Channel.
- **Operator Roster**: the collection of Operators owned by a Game Account and their progression state. _Avoid_: Operators view, unit list.
- **Inventory**: the item quantities owned by a Game Account, keyed by the game item ID and displayed with the bundled item table metadata. _Avoid_: Material Inventory, Resources, depot data.
- **Game Log Entry**: an operational record emitted by ArkHost for one Game Account, identified by its monotonically assigned log ID. _Avoid_: Activity Timeline Entry, notification.
- **Layout Size**: the viewport-width classification used to select presentation and navigation behavior. It has exactly two values: Small Screen below 768 logical units and Large Screen at or above 768; device type and physical orientation do not participate. _Avoid_: Compact, desktop layout, mobile layout, tablet layout.
