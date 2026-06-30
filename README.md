# YourSpace: The AI-Powered Creative Ecosystem

## 🚀 Smart Summary (Executive Briefing)
**YourSpace** is a comprehensive, full-stack platform engineered for the modern creator economy. It serves as a "digital sanctuary" where artists, musicians, and writers can leverage cutting-edge AI to transcend creative boundaries. By integrating **Google Genkit** and **Gemini 2.0 Flash**, YourSpace provides an intelligent infrastructure for content generation, real-time collaboration, and sustainable monetization.

---

## ✨ Features Deep-Dive

### 🤖 AI-Powered Creative Studio
*   **AI Lyric Studio**: Overcome writer's block with structured song generation based on mood, genre, and keywords.
*   **Image Generation & Enhancement**: Create high-fidelity visual assets from text prompts and aesthetically enhance existing imagery.
*   **Vibe Tagging & Content Refinement**: Automatically categorize creative work by "vibe" and receive AI-driven suggestions for improvement.
*   **Mentor AI**: A persistent AI companion providing real-time guidance and platform navigation.

### 🤝 Collaboration & Community
*   **Real-Time Collaborative Canvas**: A shared visual brainstorming space for teams and individual creators.
*   **Collaboration Suggester**: An intelligent engine that matches creators based on complementary skills and interests.
*   **Guilds & Hubs**: Dedicated community spaces for specialized creative niches.
*   **Whisper-Net**: A specialized messaging overlay for seamless, non-intrusive communication.

### 💰 Creator Economy & Management
*   **Modular Profiles**: Fully customizable "Sanctuaries" that allow creators to showcase their unique brand identity.
*   **Creator Dashboard & Analytics**: Centralized tracking for content performance and audience engagement.
*   **Monetization Engine**: Integrated support for subscriptions, direct sales, and earnings tracking.
*   **Portfolio Generator**: Instant, professional portfolio creation powered by your uploaded masterpieces.

### 🎮 Entertainment & Engagement
*   **YourSpace Arcade**: A curated collection of interactive experiences and classic-style games.
*   **YourSpace Radio**: A continuous stream of creator-focused audio content and DJ-led commentary.
*   **Interactive Walkthrough**: A "TV-channel" style guided tour of the platform’s core capabilities.

---

## 🏗️ Architecture & Directory Layout

The project follows a modular, feature-first architecture built on the **Next.js App Router**. For a deep-dive into the design philosophy and module-level details, see the [Architectural Audit](./ARCHITECTURAL_AUDIT.md).

### Core Directories
*   **`/ai`**: The brain of the application. Contains **Genkit** flow definitions (`/flows`) that encapsulate complex AI logic as type-safe Server Actions.
*   **`/app`**: The routing and page layer. Implements the Next.js App Router pattern, including specialized layouts for the interactive labs.
*   **`/components`**:
    *   `branding/`: Core brand identity and logo components.
    *   `feature/`: Complex, domain-specific components (Canvas, Walkthrough, Mentor AI).
    *   `layout/`: Global UI elements (Header, Footer, Navigation).
    *   `ui/`: Reusable, low-level design primitives.
*   **`/config`**: Centralized configuration and static data definitions for games, dashboard metrics, and onboarding flows.
*   **`/contexts`**: React Context providers for global UI states (Theme, User, AI Drawers).
*   **`/lib`**: Core utilities and external integrations.
    *   `firebase/`: Client-side initialization for Auth, Firestore, and Storage.
    *   `theme/`: A proprietary theme engine supporting real-time switching and custom user themes.
*   **`/hooks`**: Custom React hooks for shared behavioral logic.

---

## 🛠️ Setup & Installation

### Prerequisites
*   Node.js (Latest LTS recommended)
*   A Firebase Project
*   Google AI API Key (for Gemini)

### Installation
1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd yourspace
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Configuration**:
    Create a `.env.local` file in the root and add your credentials:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    GOOGLE_GENAI_API_KEY=your_gemini_api_key
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

### Testing
The project uses **Vitest** for unit and integration testing.
```bash
npm test
```

---

## 📦 Major Dependencies

| Dependency | Purpose |
| :--- | :--- |
| **Next.js 15** | React Framework for Production |
| **Genkit** | AI Integration Framework |
| **Firebase** | Authentication, Database (Firestore), and Storage |
| **Zod** | Type-safe Schema Validation |
| **Tailwind CSS** | Utility-first CSS Framework |
| **Lucide React** | Icon Library |
| **Vitest** | Next-generation Testing Framework |

---

## 🎨 Theming System
YourSpace features a custom-built theming engine located in `lib/theme`. It supports:
-   **Light & Dark Modes**: Standard system-wide preferences.
-   **Custom Themes**: User-defined color palettes and design tokens.
-   **No-FOUC Initialization**: A specialized script in `RootLayout` ensures the theme is applied before the first paint.
