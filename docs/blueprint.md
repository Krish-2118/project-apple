# **App Name**: IndiFarm AI

## Core Features:

- Personalized Dashboard: Displays a welcome message and key information at a glance.
- Weather Forecast Integration: Provides current and upcoming weather conditions using hardcoded weather data.
- AI-Powered Yield Prediction: Predicts crop yield based on user-submitted data (crop type, location, area, and sowing date). The prediction is served via tool use from a Python-based ML microservice, called via a Next.js API route.
- Intelligent Agricultural Alerts: Provides actionable advice and timely alerts based on weather forecasts using generative AI as a planning tool. Examples: 'Heavy rain expected. Delay irrigation'.
- Automated Crop Calendar & Task Management: Automatically generates tasks based on a user-selected crop (Rice) and sowing date using hardcoded logic. Provides reminders based on this logic, as well.
- Real-time Inventory Tracking: Tracks inventory levels for Urea and Seeds and facilitates easy updates.
- Community Forum: कृषि चौपाल. Connects farmers by enabling question-and-answer style discussion

## Style Guidelines:

- Primary color: Forest green (#388E3C), representing growth and nature.
- Background color: Light beige (#F5F5DC) creating a neutral and calming backdrop.
- Accent color: Golden yellow (#FFC107) for call-to-actions and highlights.
- Body and headline font: 'PT Sans' for a clean and readable user experience. 'PT Sans' is a humanist sans-serif.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use line-art icons related to farming, weather, and crops.
- Mobile-first, responsive design with a grid layout for the dashboard cards.