# Authentication API

`AuthAdapter` is the contract shared by mock and remote authentication.
`src/services/api.ts` reads the synchronously hydrated Store once and exports the
selected instances. Queries call these fixed interfaces with an operation signal;
they do not select a mode, replace adapters, or subscribe to configuration changes.
HTTP and registration verification consume the signal. Only the active local
operation can accept a successful session.

The shared `requestEmailCode` operation serves registration and password reset.
`loginWithLinuxDo` is the single exchange operation for Web, Android, and iOS;
each platform initiates Linux.do authorization at its browser boundary, then
passes the validated code and PKCE verifier to this adapter.

Form payloads and OAuth callback parameters are validated at their respective
input boundaries. Adapters receive trusted inputs and validate server responses
and registration verification proofs at ingress. All domain types are inferred
from the owning Valibot schemas.
