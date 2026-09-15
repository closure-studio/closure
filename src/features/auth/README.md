# Authentication

The authentication entry uses one terminal panel for email sign-in, registration,
password reset, and Linux DO sign-in. `useAuthEntry` owns its local view, feedback,
and temporary operation lifetime while combining one primary submission mutation
with one independent email-code mutation. Presentation components own input drafts;
Valibot schemas in `src/schemas/auth` validate boundary inputs. Passwords, codes,
PKCE verifiers, and pending authorization objects never enter the App Store.

## Request environment preference

Only the signed-out login entry offers the five-press environment shortcut. It
saves the preference for the next launch and makes a best-effort request to reload
the application. The current API runtime never changes in place and remains valid
if reload fails; the saved preference then applies on the next normal launch. Mock
data lasts for the current runtime, including login/logout, and resets on restart.
Session and node cancellation are independent of adapter selection.

## Linux DO configuration

Set the shared public client ID in the application's `.env`:

```dotenv
EXPO_PUBLIC_LINUXDO_CLIENT_ID=your-public-client-id
```

The authorization endpoint, public client ID, provider callback URI, and scope
are public client configuration. The client secret, token endpoint, and user
info endpoint remain in `idserver`. Website, iOS, and Android start authorization
directly through:

```text
https://connect.linux.do/oauth2/authorize
```

The client generates a 32-byte lowercase hex PKCE verifier and passes its S256
challenge to Linux DO. The fixed `state` value is routing information only.
Passport relays the provider result to the corresponding first-party URI. One
`complete` path validates and consumes the authorization context, then the Query
mutation posts only `code` and `code_verifier` to `POST /oauth/linuxdo/exchange`.
The originating local operation accepts the decoded Closure session only while its
captured cancellation signal remains active. Completion returns the same validated
post-login target on all platforms.

Native production builds use `com.closurestudio.app://oauth/linuxdo` and
development builds use `com.closurestudio.app.dev://oauth/linuxdo`. They keep the
authorization context function-local and use the system authentication session.
Expo Web uses a same-tab redirect because provider COOP headers can sever popup
references. Its `sessionStorage` record contains only the PKCE verifier, expiry,
and validated post-login target. `/auth/callback/linuxdo` is a thin callback input
to the shared completion and exchange path. Changing the native scheme requires
rebuilding the development client or app binary.

`expo-web-browser` owns the native system authentication session; no OAuth
transaction is persisted in Zustand, MMKV, or local storage. Both native and Web
authorizations expire after ten minutes. The local operation signal covers auth-view
changes, route unmount, and a Web redirect abandoned through reload or browser Back.
A synchronous local guard ignores rapid duplicate presses; there is no second
Store-level Promise deduplication. Mock mode returns a
deterministic schema-valid completion without contacting Linux DO.

## Verification

Run `npm run quality`, `npm run export:all`, and `npx expo config --type public`.
Unit tests cover direct Linux DO authorization, PKCE construction, bounded
same-tab Web context and one-time consumption, callback and return-target
validation, cancellation, timeout, StrictMode replay, local duplicate-submit
protection, the exchange contract, and browser handoff completion.
Device testing is still required to verify iOS and Android system-browser return
behavior after rebuilding the native development clients.
