
# 🧠 Smart Dynamic Pricing System

A fully modular and production-grade AI-powered pricing engine built using **Deep Reinforcement Learning** to dynamically adjust product prices based on customer behavior, time of day, competition, and market demand.

---

## 🚀 Project Highlights

- 🎯 **Dueling DQN Agent** for stable and efficient learning
- 🛒 **Simulated E-commerce Environment** with customer segments, competitor dynamics & time-based pricing
- 📊 **Human Baseline Comparisons** (Fixed, Adaptive, Time-based, and Combined strategies)
- 🌐 **React Dashboard** to visualize product trends, customer segmentation, and agent performance
- 🔬 **Reward System** to track improvement over human logic

---

## 🧠 Architecture Overview

```mermaid
graph TD;
    A[React Frontend] --> B[Flask API]
    B --> C[RL Agent (Dueling DQN)]
    B --> D[Market Environment]
    B --> E[Reward System]
    D --> F[Customer Segments]
    D --> G[Product Inventory]
    D --> H[Competitor Prices]
````

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
│   ├── enhanced_api.py
│   ├── enhanced_agent.py
│   ├── enhanced_env.py
│   ├── human_baseline.py
│   └── enhanced_reward_system.py
│
└── README.md
```

---

## 🛠️ Setup & Installation

### 🔹 Frontend

```bash
cd frontend
npm install
npm run dev
```

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

## 📈 Dashboard Features

* 📦 Real-time product pricing recommendations
* 🧍 Customer segment profiles (price sensitivity, quality preference)
* 📊 Reward and profit graphs (agent vs baseline)
* ⏱️ Time-based pricing curves
* 📉 Segment-wise demand and satisfaction impact

---

## 📊 Sample Result

> “The trained AI agent achieved an average profit improvement of **28.6%** over human pricing strategies across multiple simulated scenarios.”

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Credits

* Developed with ❤️ by **Lakshit Mundra**
* Powered by:

  * 🧠 TensorFlow (Deep RL)
  * ⚙️ Flask (API Backend)
  * 🌐 React + Tailwind (Frontend Dashboard)

---


```
