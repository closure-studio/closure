# Closure Coordination

This context describes identities, application connectivity, Game Accounts, and operational information coordinated through the terminal.

## Language

**Game Account**:
A player's account on a specific server channel whose progression, roster, inventory, routines, and schedule are tracked together.
_Avoid_: Account, profile, user

**User Account**:
The identity a person uses to authenticate with Closure and manage their account security.
_Avoid_: Account, profile, Game Account

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

**Routine Task**:
A recurring daily or weekly objective with a completion state and reward.
_Avoid_: Daily, daily task

**Activity Timeline Entry**:
A scheduled event, banner, maintenance window, or notice relevant to a Game Account.
_Avoid_: Timeline event, log item
