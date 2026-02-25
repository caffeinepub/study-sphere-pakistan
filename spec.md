# Specification

## Summary
**Goal:** Fix admin password verification by aligning the SHA-256 hashing implementation between the frontend and backend so that the password `qwet1234` is correctly verified.

**Planned changes:**
- Rewrite `frontend/src/utils/hashPassword.ts` to use the Web Crypto API (SubtleCrypto + TextEncoder) to produce a lowercase hex SHA-256 digest with no transformation of the input string
- Update `backend/main.mo` to store the correct SHA-256 hash (`6b3a55e0261b0304143f805a24924d0c1c44524821305f31d9277843b8a10f4e`) and use strict equality in `verifyAdminPassword`
- Update `backend/migration.mo` to set `adminPasswordHash` to the correct hash value on canister upgrade
- Audit `frontend/src/components/AdminAuthGuard.tsx` to ensure the raw entered password is passed directly to `hashPassword` with no trimming or casing transformations before hashing

**User-visible outcome:** Entering the password `qwet1234` in the admin login prompt successfully authenticates and grants access to the admin panel, while any other password shows an error.
