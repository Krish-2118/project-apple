# IndiFarm AI: AI-Powered Agricultural Assistant

IndiFarm AI is a next-generation web application designed to empower Indian farmers by providing data-driven, AI-powered insights for crop management, yield prediction, and market analysis. This project leverages a modern, server-centric architecture to deliver a fast, responsive, and intelligent user experience.

## Technical Architecture

The application is built on a scalable, decoupled architecture that separates the user interface, backend logic, and AI processing into distinct layers. This design ensures maintainability, scalability, and high performance.

### Architecture Diagram

```
+----------------+      +-------------------------+      +-----------------------+
|                |      |                         |      |                       |
|   User         |----->|   Next.js Frontend      |----->|   Next.js Backend     |
| (Farmer)       |      | (React Server Components|      |   (API Routes &       |
|                |      |  ShadCN UI, Tailwind)   |      |    Server Actions)    |
+----------------+      +-------------------------+      +-----------------------+
                             |         ^                            |
                             |         | (Results)                  | (AI Flow Trigger)
                             v         |                            v
+----------------+      +-------------------------+      +-----------------------+
|                |      |                         |      |                       |
|   Firebase     |<-----|   AI Orchestration      |----->|   Google AI           |
|  (Firestore,  |      |   (Genkit Flows)        |      |  (Gemini Models)      |
|   Storage)     |      |                         |      |                       |
+----------------+      +-------------------------+      +-----------------------+
                                     |
                                     | (Prediction Call)
                                     v
                           +-------------------------+
                           |                         |
                           |  ML Microservice        |
                           |  (Python Simulation)    |
                           |                         |
                           +-------------------------+
```

### Architectural Components

1.  **Client-Layer (Next.js Frontend)**
    *   **Framework**: Built with **Next.js 14+** using the **App Router**. This enables a hybrid rendering approach, combining the best of server-side rendering (SSR) for fast initial loads and client-side navigation.
    *   **UI Components**: We leverage **React Server Components (RSC)** by default to minimize the client-side JavaScript bundle, pushing rendering logic to the server wherever possible for optimal performance.
    *   **Styling**: The UI is crafted with **ShadCN/UI** components and styled with **Tailwind CSS**. This provides a highly customizable and modern design system built on best practices.
    *   **State Management**: Client-side state is managed using React Hooks (`useState`, `useEffect`) and a reactive data flow from server to client. For cross-page state, we use browser `sessionStorage` to ensure a seamless multi-step form experience.

2.  **Backend & Business Logic (Next.js API Routes & Server Actions)**
    *   The Next.js backend serves as the primary interface between the client and our services.
    *   **Server Actions** are used for form submissions, providing a seamless RPC-like experience without the need to manually create API endpoints.
    *   **API Routes** are reserved for more complex backend logic or when direct client-side fetching is required.

3.  **AI Orchestration Layer (Genkit)**
    *   **Genkit** is the core of our AI functionality. It acts as an orchestration layer to define, manage, and execute complex AI workflows, or "flows".
    *   **Flows**: Each major AI feature (Crop Recommendation, Market Analysis, Yield Enhancement) is encapsulated in a Genkit flow. These flows define the prompts, data schemas (using Zod), and interactions with the underlying AI models.
    *   **Model Integration**: Genkit seamlessly integrates with **Google's Gemini family of models**, allowing us to leverage powerful generative AI for tasks like generating advice and analyzing market data in a structured JSON format.

4.  **Machine Learning Microservice (Simulated)**
    *   The core **Yield Prediction** logic is encapsulated in a simulated Python-based microservice. This represents a production-grade approach where a dedicated, trained machine learning model (e.g., a TensorFlow or PyTorch model) is hosted independently.
    *   In our architecture, the Genkit `predictYieldFlow` makes a call to this service. This decoupled design allows the data science and web development workflows to remain independent. The simulation in `yield-prediction.ts` uses a deterministic algorithm with modifiers for various factors (soil, state, sowing date) to mimic a real ML model's output.

5.  **Database & Storage (Firebase)**
    *   **Firestore**: Used as our primary database for storing semi-structured data like community forum posts, user profiles, and farm details. Its real-time capabilities are ideal for a dynamic application.
    *   **Firebase Storage**: Designated for handling user-generated content such as farm photos or profile pictures in future implementations.

### Data Flow Example: AI Farming Analysis

1.  **Input**: The farmer enters land parameters (soil type, state, rainfall) on the `/dashboard/tools` page.
2.  **Recommendation**: A Server Action triggers the `cropRecommendationFlow` in Genkit. The flow prompts the Gemini model, which returns a list of suitable crops.
3.  **Selection**: The farmer selects a crop and provides a sowing month on the same page.
4.  **Analysis Trigger**: On clicking "Predict & Analyze," a Server Action initiates three parallel AI flows:
    *   The `predictYieldFlow` calls our simulated Python ML microservice.
    *   The `marketAnalysisFlow` prompts Gemini for market trends and Mandi prices.
    *   The `yieldEnhancementFlow` prompts Gemini for actionable tips, using the result from the yield prediction as context.
5.  **Data Aggregation**: The Next.js backend waits for all three flows to complete (`Promise.all`).
6.  **State Transfer**: The aggregated results are stored in the browser's `sessionStorage`.
7.  **Display**: The user is redirected to the `/dashboard/tools/results` page, which reads the data from `sessionStorage` and displays the comprehensive analysis report.

## Technology Stack

-   **Frontend**: Next.js, React, TypeScript, ShadCN/UI, Tailwind CSS
-   **Backend**: Next.js (API Routes, Server Actions)
-   **AI**: Genkit, Google AI (Gemini)
-   **Database**: Firebase Firestore
-   **Deployment**: Firebase App Hosting / Vercel

## Key Features

-   **AI-Powered Crop Recommendation**: Suggests optimal crops based on soil, climate, and location.
-   **Predictive Yield Analysis**: Forecasts crop yield using a simulated ML model.
-   **Intelligent Market Insights**: Provides current market prices and demand forecasts.
-   **Actionable Farming Advice**: Generates personalized tips to enhance yield and respond to weather.
-   **Community Forum**: A platform for farmers to connect and share knowledge.
-   **Personalized Dashboard**: At-a-glance view of weather, inventory, and notifications.
