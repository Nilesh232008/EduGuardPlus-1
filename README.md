# 🎓 EduGuard — React Native App

Proactive Assistants Prevent and Reduce Risk of School Dropout Students Using ML 

---

## 📁 Project Structure

```
EduGuard/
├── App.js                          ← Root entry point
├── package.json
├── babel.config.js
└── src/
    ├── constants/
    │   └── theme.js                ← Colors, fonts, sizes, shadows
    ├── services/
    │   ├── firebase.js             ← Firebase app init (Auth + RTDB)
    │   ├── AuthContext.js          ← Global auth state + role detection
    │   └── api.js                  ← All Firebase REST URL helpers
    ├── components/
    │   └── index.js                ← Shared UI components
    ├── navigation/
    │   └── RootNavigator.js        ← Single entry, routes by role
    └── screens/
        ├── auth/
        │   └── LoginScreen.js      ← Single login for all roles
        ├── superadmin/
        │   └── SuperAdminDashboard.js
        ├── admin/
        │   └── AdminDashboard.js
        ├── teacher/
        │   └── TeacherDashboard.js
        └── parent/
            └── ParentDashboard.js
```

---

## 🔐 How Login Works

1. User enters email + password on **one single LoginScreen**
2. Firebase Authentication verifies credentials
3. App fetches `/Users/{uid}` from Realtime Database to get `role`
4. `RootNavigator` automatically routes to the correct dashboard:

| Firebase Role | Dashboard         | Color   |
|---------------|-------------------|---------|
| `superadmin`  | SuperAdminDashboard | Violet |
| `admin`       | AdminDashboard    | Indigo  |
| `educator` / `teacher` | TeacherDashboard | Green |
| `parent`      | ParentDashboard   | Amber   |

---

## 📊 Dashboards

### 🛡️ Super Admin
- Platform-wide stats (users, admins, teachers, students, classes, parents)
- Risk summary (High / Medium / Low)
- All admins list with college info
- All teachers list
- All students with risk badges
- All notices

### 🔷 Admin
- Tabbed: Overview / Classes / Students / Notices
- Attendance bar charts per class/date
- Class details with teacher info and student count
- Student list with performance metrics + risk badges

### 👩‍🏫 Teacher
- Tabbed: Home / Students / Homework / Attendance / Notices
- Filtered to **this teacher's** classes and students only
- Attendance records with present/total counts
- Homework assignments posted per class

### 👨‍👩‍👧 Parent
- Tabbed: My Child / Homework / Notices
- Multi-child selector (if more than one child)
- Child profile card with avatar
- Performance metrics: marks, attendance, behavior, risk score, fees
- Daily attendance: Present / Absent per date
- Filtered homework for child's class

---

## 🚀 Setup

### 1. Install dependencies
```bash
npx create-expo-app EduGuard --template blank
# Then replace files with this project, then:
npm install
```

### 2. Or clone and install
```bash
cd EduGuard
npm install
```

### 3. Run
```bash
npx expo start
# Press 'a' for Android, 'i' for iOS, 'w' for web
```


---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `firebase` | Auth + Realtime Database |
| `@react-navigation/native` | Navigation container |
| `@react-navigation/native-stack` | Stack navigator |
| `react-native-screens` | Native screen optimization |
| `react-native-safe-area-context` | Safe area support |
| `expo` | Development framework |

---

## 🔑 Firebase Collections Used

| URL | Used By |
|-----|---------|
| `/Users/{uid}` | Role detection on login |
| `/Admins` | Super Admin |
| `/Super Admin` | Super Admin |
| `/Teachers` | Super Admin, Admin |
| `/Students` | All dashboards |
| `/Classes` | Admin, Teacher |
| `/Attendance` | Admin, Teacher, Parent |
| `/Homework` | Teacher, Parent |
| `/HomeworkStatus` | Teacher |
| `/Notices` | All dashboards |

---

## 🎨 Theme Colors

| Role | Color |
|------|-------|
| Super Admin | `#7C3AED` Violet |
| Admin | `#4F46E5` Indigo |
| Teacher | `#059669` Green |
| Parent | `#D97706` Amber |

---

## ✅ Features

- [x] Single login screen for all roles
- [x] Auto role-detection from Firebase
- [x] Pull-to-refresh on all dashboards
- [x] Error handling with error boxes
- [x] Loading states
- [x] Tabbed navigation per dashboard
- [x] Risk level badges (LOW / MEDIUM / HIGH)
- [x] Attendance bar charts
- [x] Multi-child support for parents
- [x] Notices board
- [x] Homework tracking
"# EduGuardPlus" 
"# EduGuardPlus" 
