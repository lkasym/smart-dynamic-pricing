
# 🧠 Smart Dynamic Pricing System

A fully modular and production-grade AI-powered pricing engine built using **Deep Reinforcement Learning** to dynamically adjust product prices based on customer behavior, time of day, competition, and market demand.

![Banner](banner.png)

---

## 🚀 Project Highlights

- 🎯 **Dueling DQN Agent** for stable and efficient learning  
- 🛒 **Simulated E-commerce Environment** with customer segments, competitor dynamics & time-based pricing  
- 📊 **Human Baseline Comparisons** (Fixed, Adaptive, Time-based, and Combined strategies)  
- 🌐 **React Dashboard** to visualize product trends, customer segmentation, and agent performance  
- 🔬 **Reward System** to track improvement over human logic  

---

## 🧠 Architecture Overview

```

Frontend (React Dashboard)
↓
Flask API Server
↓
+----------------------+
\|   Dueling DQN Agent  |
\|   Reward System      |
\|   Market Environment |
+----------------------+
↓
Customer Segments, Products, Time-of-Day, Competitor Pricing

```

---

## 📂 Project Structure

```

smart-dynamic-pricing/
│
├── frontend/               # React + Tailwind dashboard
│   ├── src/
│   ├── public/
│   └── ...
│
├── backend/                # Flask + DQN model + API
│   ├── enhanced\_api.py
│   ├── enhanced\_agent.py
│   ├── enhanced\_env.py
│   ├── human\_baseline.py
│   └── enhanced\_reward\_system.py
│
├── banner.png
├── dashboard.png
├── business\_metrics.png
└── README.md

````

---

## 🛠️ Setup & Installation

### 🔹 Frontend


cd frontend
npm install
npm run dev
````

> Runs at `http://localhost:3000/` by default

---

### 🔹 Backend (Flask API)

```bash
cd backend
pip install -r requirements.txt
python enhanced_api.py
```

> Runs at `http://localhost:5000/`

Make sure to use **Python 3.8+** and **Node.js 16+**

---

## 📈 Live Dashboard Previews

### 📊 Revenue, Retention, and Segments

![Dashboard Overview](dashboard.png)

---

### 📈 Customer Metrics and Revenue vs Baseline

![Business Metrics](business_metrics.png)

---

## 🧪 How It Works

1. The agent uses a **Dueling Double DQN** to learn dynamic pricing strategies
2. The environment simulates:

   * Time-of-day influence
   * Customer segment preferences
   * Competitor price adjustments
3. Agent is rewarded based on:

   * 💰 Profit earned
   * 📈 Improvement over human baseline strategies
4. All insights are visualized in a user-friendly frontend

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Credits

* Developed  by **Lakshit Mundra**
* Powered by:

  * 🧠 TensorFlow (Deep RL)
  * ⚙️ Flask (API Backend)
  * 🌐 React + Tailwind (Frontend Dashboard)

---

## 🌟 Star this repo if you like the project!
hen you are!
```
