# Closure Coordination

This context describes identities, application connectivity, Game Accounts, and operational information coordinated through the terminal.

## Language

**Game Account**:
A player's account on a specific server channel whose progression, roster, inventory, and schedule are tracked together.
_Avoid_: Account, profile, user

**User Account**:
The identity a person uses to authenticate with Closure and manage their account security.
_Avoid_: Account, profile, Game Account

**User Session**:
The authenticated period in which a person can access protected Closure capabilities as a User Account.
_Avoid_: Auth state, login state

**Session Principal**:
The identity and authorization snapshot carried by a User Session for access decisions during that session.
_Avoid_: Auth user, user info, complete User Account

**Server Channel**:
The distribution or login channel through which a Game Account is accessed, such as the official channel or Bilibili channel.
_Avoid_: Platform, device platform

**API Node**:
An API entry point that Closure can select for its application traffic, such as a domestic or overseas mirror.
_Avoid_: Server, network node, Server Channel

**Operator Roster**:
The collection of Operators owned by a Game Account and their progression state.
_Avoid_: Operators view, unit list

**Inventory**:
The item quantities owned by a Game Account, keyed by the game item ID and displayed with the bundled item table metadata.
_Avoid_: Material Inventory, Resources, depot data

**Activity Timeline Entry**:
A scheduled event, banner, maintenance window, or notice relevant to a Game Account.
_Avoid_: Timeline event, log item

**Layout Size**:
The viewport-width classification used to select presentation and navigation behavior. It has exactly two values: Small Screen below 768 logical units and Large Screen at or above 768; device type and physical orientation do not participate.
_Avoid_: Compact, desktop layout, mobile layout, tablet layout

**UI Settings**:
Application-wide presentation preferences explicitly chosen by a person and retained across sessions. Layout Size, language, and framework-owned theme state are separate concerns.
_Avoid_: App settings, preferences, theme settings
