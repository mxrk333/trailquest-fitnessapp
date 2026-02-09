## Technical Design: TrailQuest (Serverless/Firebase)

### 1. Revised System Architecture

By removing the middle tier (tRPC/Functions), the React application communicates directly with Firebase services.

- **Auth:** Firebase Authentication (Identity Platform).
- **Database:** Cloud Firestore (NoSQL).
- **Logic Location:** React Frontend (Context Providers/Hooks).
- **Security:** Firestore Security Rules (The "New Backend").
- **Storage:** Firebase Storage (for meal photos/form videos).

---

### 2. NoSQL Data Structure (Firestore)

Firestore is document-oriented. We will structure the data to minimize "joins" (which don't exist in NoSQL) by denormalizing where necessary.

#### Collections & Documents

- **`users` {collection}**
- `uid` {doc}:
- `displayName`: string
- `role`: "trainee" | "trainer" | "both"
- `trainerId`: string (reference to trainer's UID)
- `muscleHeatmap`: { quads: 0.8, glutes: 0.4, ... } (Calculated on-the-fly or per-log)

- **`workouts` {collection}**
- `workoutId` {doc}:
- `userId`: string (owner)
- `timestamp`: timestamp
- `exercises`: array<{ name: string, sets: number, reps: number, muscles: string[] }>
- `isRestDay`: boolean

- **`hikes` {collection}**
- `hikeId` {doc}:
- `userId`: string
- `distance`: number
- `elevationGain`: number
- `activeMuscles`: string[]

- **`invites` {collection}** (For linking Trainer/Trainee)
- `inviteId` {doc}:
- `trainerId`: string
- `traineeEmail`: string
- `status`: "pending" | "accepted"

---

### 3. Security Rules (The "Rules of Engagement")

Since you aren't using a backend to filter data, your **Security Rules** must ensure trainers can only see their specific clients and trainees can only edit their own data.

```javascript
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Is the user logged in?
    function isSignedIn() { return request.auth != null; }

    match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "trainer");
      allow write: if request.auth.uid == userId;
    }

    match /workouts/{workoutId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid ||
                  get(/databases/$(database)/documents/users/$(resource.data.userId)).data.trainerId == request.auth.uid);
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }

    // Hikes and Nutrition follow a similar pattern...
  }
}

```

---

### 4. Third-Party Integrations

Since we are staying in the frontend, we will use **Client-Side OAuth** for integrations.

- **Strava (Hiking):** Use the [Strava Web Authentication](https://developers.strava.com/docs/authentication/) flow. Since you aren't using a server, you'll use the `implicit` flow or handle the token exchange via a Firebase "Call" if strictly necessary, but most of this can be handled via a redirect back to your React app.
- **Nutritionix:** Standard REST calls from the React app using `fetch` or `axios` inside TanStack Query.
- **Docs:** [Nutritionix Javascript Examples](https://www.google.com/search?q=https://gist.github.com/vinitkumar/9880193)

---

### 5. Implementation in "The Hytel Way"

#### Updated Monorepo Strategy

- **`packages/shared`**: Export Zod schemas for `WorkoutSchema` and `HikeSchema`. Use these inside your React components to validate form state before calling `addDoc()`.
- **`apps/web/src/lib/firebase.ts`**: Initialize the Firebase SDK here.
- **`apps/web/src/hooks/useWorkouts.ts`**: Use TanStack Query with `onSnapshot` to provide real-time updates to the UI.

#### Logic Example (The "Heatmap" Calculation)

Since we aren't using a backend worker, the muscle heatmap logic lives in a **Custom React Hook**:

```typescript
// apps/web/src/hooks/useMuscleLogic.ts
export const useMuscleHeatmap = (userId: string) => {
  return useQuery({
    queryKey: ['heatmap', userId],
    queryFn: async () => {
      const q = query(collection(db, 'workouts'), where('userId', '==', userId), limit(10))
      const snapshots = await getDocs(q)
      // Logic to reduce workout data into a muscle intensity object
      return calculateHeatmap(snapshots.docs.map(d => d.data()))
    },
  })
}
```

---

### 6. Professional Considerations

- **Data Integrity:** Without a backend, if a user's browser crashes mid-transaction, you might get partial data. Use **Firestore Batched Writes** for logging a workout + updating a "last active" timestamp on the user profile simultaneously.
- **Performance:** NoSQL can get expensive if you read too many documents. We should aggregate monthly stats into a `monthly_summary` sub-collection so the Dashboard doesn't have to fetch every single workout ever logged.
