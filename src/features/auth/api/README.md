# Auth Data Module

`AuthAdapter` is the single variation seam between the global App Store and authentication data. The current application wires `MockAuthAdapter`; a future server-backed adapter must keep the same interface, validate Closure Studio response envelopes with the owning Valibot schemas, and return trusted `AuthResult` values.

The module does not read or write the Store. Expected business failures are returned as typed values, while UI copy is selected from i18n resources outside this module.
