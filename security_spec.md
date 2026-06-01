# Security Specification - ITA GLOBAL TV

## Data Invariants
- A `MediaItem` must have a valid URL, title, and type.
- The `channel` must be one of the defined pre-set channels.
- `createdAt` must be set by the server.

## The Dirty Dozen Payloads (Target: /marketing_media)

1. **Anonymous Write**: Attempt to create a media item without being logged in. (Expect: REJECT)
2. **Standard Student Write**: Attempt to create a media item as a regular student (non-admin). (Expect: REJECT)
3. **ID Poisoning**: Attempt to use a 1MB string as a document ID. (Expect: REJECT)
4. **Invalid Type**: Attempt to set `type` to "malware". (Expect: REJECT)
5. **Ghost Field**: Attempt to add `isAdmin: true` to a media item. (Expect: REJECT)
6. **Overwrite Admin**: Attempt to change the `uploadedBy` field to a different user. (Expect: REJECT)
7. **Time Spoofing**: Attempt to set `createdAt` in the future. (Expect: REJECT)
8. **Channel Hijack**: Attempt to use an invalid channel name. (Expect: REJECT)
9. **Blanket Delete**: Attempt to delete all media as a guest. (Expect: REJECT)
10. **Huge Title**: Attempt to set a title with 100,000 characters. (Expect: REJECT)
11. **Resource Exhaustion**: Attempt to write 1000 items in a single batch as non-admin. (Expect: REJECT)
12. **PII Leak**: (Not applicable as media is public, but metadata must be safe).

## Test Runner Logic
The `firestore.rules` will verify `request.auth.token.email == 'felixbrownz907@gmail.com'` and `request.auth.token.email_verified == true`.
