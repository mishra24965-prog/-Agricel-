# Security Specification for Agricel Firestore Database

## 1. Data Invariants
- Each user profile `/users/{userId}` is strictly linked to `request.auth.uid`.
- Crop listings require a verified `ownerId` corresponding to the logged-in farmer/FPO.
- Orders store escrow transactions with non-forgeable tracking IDs, buyer IDs, and farmer contact records.
- Weighbridge updates require authenticated logistical input to verify weights and trigger escrow disburse.
- Demands and arbitration tickets require authenticated participants.

## 2. Dirty Dozen Test Cases
1. Unauthenticated write to `/users/{userId}` -> DENIED.
2. User A updating User B's profile document -> DENIED.
3. Injecting a 2MB string into crop name or tracking ID -> DENIED.
4. Anonymous user deleting another user's crop listing -> DENIED.
5. User spoofing another farmer's `ownerId` in listing creation -> DENIED.
6. Corrupted tracking ID with invalid characters -> DENIED.
7. Modifying read-only catch-all documents -> DENIED.
8. Unauthenticated creation of orders -> DENIED.
9. Deleting orders without authorization -> DENIED.
10. Modifying immutable timestamps retroactively -> DENIED.
11. Bypassing schema fields with unknown ghost objects -> DENIED.
12. Attempting to drop the entire collections via root writes -> DENIED.
