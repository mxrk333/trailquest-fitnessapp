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
  - [✅] Fix `profileLoading` race condition in `ProtectedRoute`.

---

## 💪 Phase 2: Trainee Core (Activity Logging)

_Goal: The "Input" phase. Getting workout and hike data into the cloud._

- [✅] **2.1 The Workout Engine**

  - [✅] Build `WorkoutLogger` component (Multi-step form).
  - [✅] Feature: Add/Remove Exercise rows.
  - [✅] Feature: Searchable exercise database (local JSON list: "Squat", "Bench", etc.).
  - [✅] Implement `handleSaveWorkout`: Validate via Zod → Push to Firestore `/workouts` collection.
  - [✅] Edit existing workouts via query params (`/log-activity?type=workout&id=...`).
  - [✅] Delete workouts from activity feed.

- [✅] **2.2 The Hiking Tracker**

  - [✅] Build `HikeLogger` UI (Distance, Time, Elevation Gain, Mountain name).
  - [✅] Logic: Create a "Muscle Contribution" mapper (e.g., If Elevation > 500ft, add +20% load to Calves/Glutes).
  - [✅] Save hike to `/hikes` collection with a `type: "hike"` flag.
  - [✅] Date field for logging past hikes.

- [✅] **2.3 Rest Day Logging**

  - [✅] Build `RestDayLogger` UI (Complete Rest / Active Recovery).
  - [✅] Save to `/rest_days` collection.

- [✅] **2.4 The History Feed**
  - [✅] Create a `DashboardFeed` component.
  - [✅] Design "Activity Cards" in Tailwind distinguishing Gym, Trail, Nutrition, and Rest sessions.
  - [✅] Flat layout without nested box-in-box pattern.
  - [✅] Clickable cards with detail modal + edit/delete actions.
  - [✅] "Assigned to You" section for pending trainer tasks.
  - [✅] Scrollable feed with max-height constraint.

---

## 🎨 Phase 3: The "Muscle Heatmap" & Analytics

_Goal: The "Output" phase. Turning boring data into visual motivation._

- [✅] **3.1 SVG Heatmap Component**

  - [✅] Create `MuscleHeatmap.tsx` dashboard component.
  - [✅] Front/Back body toggle with SVG muscle regions.
  - [✅] Map SVG IDs to muscle names and drive fill colors from intensity data.

- [✅] **3.2 The Aggregator Logic**

  - [✅] Logic: Fetch last 7 days of activities → Sum occurrences of muscle groups → Normalize to a 0–1 scale.
  - [✅] Include hike-sourced muscle data in aggregation.

- [✅] **3.3 Recovery & Decay**

  - [✅] Implement "Time Decay": Reduce heatmap intensity based on time since last workout.
  - [✅] `ReadinessCard` component with Trail Readiness score (0–100) and recovery insights.

- [✅] **3.4 Analytics Page**

  - [✅] `VolumeTrendChart` with weekly volume trends.
  - [✅] `AnalyticsPage` dashboard accessible via sidebar.

- [✅] **3.5 Personal Bests (PBs)**
  - [✅] Create a "Trophy Room" component.
  - [✅] Logic: Scan Firestore `workouts` for the max `weight` per `exerciseName`.

---

## 🤝 Phase 4: Trainer Dashboard & Secure Linking

_Goal: The "Collaboration" phase. Connecting two distinct user types._

- [✅] **4.1 Trainer–Trainee Linking**

  - [✅] Trainer adds client by email (`addClientToTrainer` service).
  - [✅] Pending approval flow: trainee sees pending trainer request, can accept/reject.
  - [ ] _(Optional)_ 6-digit `InviteCode` system via `/invites` collection.

- [✅] **4.2 The Trainer's Birds-Eye View**

  - [✅] Build `TrainerDashboard`: List of all trainees linked to the current user.
  - [✅] `ClientRow` component with client details.
  - [✅] Pending client requests with approve/reject actions.

- [✅] **4.3 The "Deep Dive" Client View**

  - [✅] `ClientDetailPage`: Trainer views trainee dashboard as read-only.
  - [✅] Trainee's heatmap, recent activity, and nutrition visible to trainer.

- [✅] **4.4 Trainer Activity Assignment**

  - [✅] `AssignActivity` page: Trainer assigns workouts, hikes, nutrition, rest days to trainees.
  - [✅] `TrainerAssignmentsPage`: View all assigned tasks and their statuses.

- [✅] **4.5 Firestore Security Rules**
  - [✅] Trainees can read/write their own docs.
  - [✅] Trainers can read/write docs where `trainerId == request.auth.uid`.
  - [✅] Messages collection secured to participants only.
  - [✅] Review and harden catch-all rule (previously allowed all authenticated access — now removed).

---

## 💬 Phase 4.5: Real-Time Chat

_Goal: Enable communication between trainers and trainees._

- [✅] **4.5.1 Chat System**
  - [✅] `ChatProvider` context for real-time messaging.
  - [✅] `ChatDrawer` UI component (slide-out panel).
  - [✅] Contact list for choosing conversations.
  - [✅] Messages stored in Firestore `/messages` collection.

---

## 🍎 Phase 5: Nutrition & Habits

_Goal: Total lifestyle tracking requested by the trainer._

- [✅] **5.1 Simple Macro Tracker**

  - [✅] Log Protein, Carbs, Fats, Calories, and Water per meal.
  - [✅] `NutritionWidget` on dashboard with live daily totals.
  - [✅] Edit/delete nutrition logs from activity feed.

- [ ] **5.2 Nutritionix API (Optional/Advanced)**

  - [ ] Setup `fetch` call to search food and get instant macro data.

- [✅] **5.3 Daily Habit Check-ins**
  - [✅] Simple toggle list: [ ] 4L Water, [ ] 8h Sleep, [ ] Stretching.
  - [✅] Store these in a `/dailyHabits` sub-collection under the user.

---

## 🛡️ Phase 5.5: Admin Panel

_Goal: Platform-level administration and oversight._

- [✅] **5.5.1 Admin Dashboard**
  - [✅] `AdminDashboard` page for platform management.
  - [✅] `PendingApproval` page for reviewing user accounts.

---

## 🚀 Phase 6: SaaS Polish & Launch Prep

_Goal: Turning a project into a product._

- [✅] **6.1 Premium Tiers**

  - [✅] Logic: Free users can only have 1 trainer/client. Pro users are unlimited.
  - [✅] Mock payment flow (Firestore-backed, no real Stripe).

- [✅] **6.2 Performance & Indexing**

  - [✅] Add Firestore indexes for complex queries (e.g., `where trainerId == X order by timestamp desc`).
  - [ ] Aggregate monthly stats into `monthly_summary` sub-collection (optional/future).

- [✅] **6.3 Final Polish**

  - [✅] Add "Empty States" (Illustrations for when a user has no workouts yet).
  - [✅] Mobile Responsiveness: Muscle Map uses SVG viewBox for responsive scaling.
  - [✅] Review UI color consistency across all pages.

- [✅] **6.4 Production Deploy**
  - [✅] Run `pnpm build` in the monorepo — passes with 0 errors.
  - [ ] Deploy to Firebase Hosting via the GitHub Action provided in your boilerplate.
