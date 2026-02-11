## 🏗️ Phase 1: Infrastructure & The "Identity" Layer

_Goal: Establish the monorepo's connection to Firebase and define the data contract._

- [✅] **1.1 Firebase Project Initialization**
- [✅] Create Google Firebase project (Spark or Blaze plan).
- [✅] Enable **Firestore** in "Test Mode" (initially).
- [✅] Enable **Firebase Auth** (Email/Password & Google).
- [✅] Generate `firebaseConfig` and add to `.env.local` in `apps/web`.

- [✅] **1.2 Monorepo Wiring**
- [✅] Install `firebase` and `react-firebase-hooks` in `apps/web`.
- [✅] Create `apps/web/src/lib/firebase.ts` (Initialize App, Auth, and Firestore).
- [✅] Configure `packages/shared` for shared types/schemas (Zod).

- [✅] **1.3 Auth & Role-Based Onboarding**
- [✅] Implement `SignUp` and `Login` pages using **Shadcn UI** & **Zod**.
- [✅] Create `PostSignUp` page for role selection (Trainee vs. Trainer).
- [✅] Create User document in Firestore upon registration.

- [✅] **1.4 Global State & Guarding**
- [✅] Implement `AuthProvider` (using Context API + Firebase Auth).
- [✅] Protect private routes (redirect unauthenticated users to Login).

---

## 💪 Phase 2: Trainee Core (Activity Logging)

_Goal: The "Input" phase. Getting workout and hike data into the cloud._

- [✅] **2.1 The Workout Engine**
- [✅] Build `WorkoutLogger` component (Multi-step form).
- [✅] Feature: Add/Remove Exercise rows.
- [✅] Feature: Searchable exercise database (local JSON list: "Squat", "Bench", etc.).
- [✅] Implement `handleSaveWorkout`: Validate via Zod → Push to Firestore `/workouts` collection.

- [✅] **2.2 The Hiking Tracker**
- [✅] Build `HikeLogger` UI (Distance, Time, Elevation Gain).
- [✅] Logic: Create a "Muscle Contribution" mapper (e.g., If Elevation > 500ft, add +20% load to Calves/Glutes).
- [✅] Save hike to `/hikes` collection with a `type: "hike"` flag.

- [✅] **2.3 The History Feed**
- [✅] Create a `DashboardFeed` component.
- [✅] Use `useCollectionData` (from `react-firebase-hooks`) for real-time list updates.
- [✅] Design "Activity Cards" in Tailwind that distinguish between a Gym session and a Trail session.

---

## 🎨 Phase 3: The "Muscle Heatmap" & Analytics

_Goal: The "Output" phase. Turning boring data into visual motivation._

- [ ] **3.1 SVG Heatmap Component**
- [ ] Create `MuscleMap.tsx` in `packages/ui`.
- [ ] Map SVG IDs to muscle names (e.g., `id="quads"`, `id="lats"`).
- [ ] Create a prop `intensities: Record<MuscleName, number>` (0 to 1) to drive fill colors.

- [ ] **3.2 The Aggregator Logic**
- [ ] Create a hook `useCalculateMuscleLoad`.
- [ ] Logic: Fetch last 7 days of activities → Sum occurrences of muscle groups → Normalize to a 0–1 scale.

- [ ] **3.3 Recovery & Decay**
- [ ] Implement "Time Decay": If a muscle hasn't been hit in 48 hours, reduce its heatmap intensity by 30% per day.

- [ ] **3.4 Personal Bests (PBs)**
- [ ] Create a "Trophy Room" component.
- [ ] Logic: Scan Firestore `workouts` for the max `weight` per `exerciseName`.

---

## 🤝 Phase 4: Trainer Dashboard & Secure Linking

_Goal: The "Collaboration" phase. Connecting two distinct user types._

- [ ] **4.1 Invitation System**
- [ ] Trainer generates a 6-digit `InviteCode` (stored in `/invites`).
- [ ] Trainee enters code → Firestore update: Set `trainee.trainerId = trainer.uid`.

- [ ] **4.2 The Trainer's Birds-Eye View**
- [ ] Build `TrainerDashboard`: A list of all trainees linked to the current user.
- [ ] Each list item shows a mini-heatmap and "Last Active" timestamp.

- [ ] **4.3 The "Deep Dive" Client View**
- [ ] Allow trainers to click a trainee and view _their_ dashboard as read-only.

- [ ] **4.4 Airtight Security (Firestore Rules)**
- [ ] Draft `firestore.rules`:
- [ ] Trainees can read/write their own docs.
- [ ] Trainers can read docs where `data.trainerId == request.auth.uid`.
- [ ] Block all other cross-user access.

---

## 🍎 Phase 5: Nutrition & Habits

_Goal: Total lifestyle tracking requested by the trainer._

- [ ] **5.1 Simple Macro Tracker**
- [ ] Log Protein, Carbs, Fats, and Calories per day.
- [ ] Visual: A circular progress bar for "Protein Goal" achievement.

- [ ] **5.2 Nutritionix API (Optional/Advanced)**
- [ ] Setup `fetch` call to search food and get instant macro data.

- [ ] **5.3 Daily Habit Check-ins**
- [ ] Simple toggle list: [ ] 4L Water, [ ] 8h Sleep, [ ] Stretching.
- [ ] Store these in a `/dailyHabits` sub-collection under the user.

---

## 🚀 Phase 6: SaaS Polish & Launch Prep

_Goal: Turning a project into a product._

- [ ] **6.1 Premium Tiers**
- [ ] Logic: Free users can only have 1 trainer/client. Pro users are unlimited.
- [ ] Integrate **Stripe Checkout** (Client-side redirect).

- [ ] **6.2 Performance & Indexing**
- [ ] Add Firestore indexes for complex queries (e.g., `where trainerId == X order by timestamp desc`).

- [ ] **6.3 Final Polish**
- [ ] Add "Empty States" (Illustrations for when a user has no workouts yet).
- [ ] Mobile Responsiveness: Ensure the Muscle Map looks good on a phone screen.

- [ ] **6.4 Production Deploy**
- [ ] Run `pnpm build` in the monorepo.
- [ ] Deploy to Firebase Hosting via the GitHub Action provided in your boilerplate.

---
