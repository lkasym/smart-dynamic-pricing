#!/usr/bin/env python3
from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import random
import time
import threading

from enhanced_env import MarketEnvironment
from enhanced_agent import DQNAgent
from human_baseline import HumanBaseline
from enhanced_reward_system import EnhancedRewardSystem

app = Flask(__name__)
CORS(app)

# ─── Globals ──────────────────────────────────────────────────────────────────
env = MarketEnvironment(num_products=5, num_customer_segments=3, time_periods=24, competitors=2)
state_size = env.state_size
action_size = env.action_size

agent    = DQNAgent(state_size, action_size)
baseline = HumanBaseline(env, strategy='combined')
reward_system = EnhancedRewardSystem(baseline_comparison=True)

training_status = {
    "isTraining": False,
    "currentEpisode": 0,
    "totalEpisodes": 0,
    "startTime": None,
    "endTime": None
}

training_results = {
    "finalReward": 0,
    "avgLast10": 0,
    "improvementOverBaseline": 0,
    "rewardHistory": [],
    "baselineHistory": []
}

training_thread = None


# ─── Core Training Loop ───────────────────────────────────────────────────────
def train_agent(episodes=10, use_baseline=True, baseline_strategy='combined'):
    global training_status, training_results, env, agent, baseline, reward_system

    training_status.update({
        "isTraining": True,
        "currentEpisode": 0,
        "totalEpisodes": episodes,
        "startTime": time.time(),
        "endTime": None
    })

    reward_system.reset()
    agent.epsilon = 1.0
    agent.update_target_model()

    if baseline.strategy != baseline_strategy:
        baseline.strategy = baseline_strategy

    # Pre-generate seeds for reproducibility
    seeds = [random.randrange(2**32) for _ in range(episodes)]

    for ep in range(episodes):
        seed = seeds[ep]
        training_status["currentEpisode"] = ep + 1

        # 1) Baseline run
        if use_baseline:
            random.seed(seed)
            np.random.seed(seed)
            b_reward, _, _ = baseline.run_episode()
            reward_system.add_baseline_reward(b_reward)

        # 2) Agent run
        random.seed(seed)
        np.random.seed(seed)
        state = env.reset()
        total_reward = 0
        done = False

        while not done:
            action = agent.act(state)
            next_state, reward, done, _ = env.step(action)
            agent.remember(state, action, reward, next_state, done)
            state = next_state
            total_reward += reward
            if len(agent.memory) > agent.batch_size:
                agent.replay()

        reward_system.add_agent_reward(total_reward)

        if (ep + 1) % 10 == 0:
            agent.update_target_model()

        # Update results
        hist = reward_system.agent_rewards
        training_results.update({
            "rewardHistory": hist,
            "baselineHistory": reward_system.baseline_rewards,
            "finalReward": hist[-1],
            "avgLast10": float(np.mean(hist[-10:])),
            "improvementOverBaseline": reward_system.get_improvement_percentage()
        })

        time.sleep(0.1)

    training_status.update({
        "isTraining": False,
        "endTime": time.time()
    })
    agent.save("smart_pricing_model.h5")


# ─── Helpers for static endpoints ─────────────────────────────────────────────
def _compute_price_demand(env):
    out = []
    for product in env.get_products():
        bp = product['base_price']
        pts = [bp * f for f in (0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3)]
        demand = [max(0, 100*(bp/p)**1.5) for p in pts]
        revenue = [p*d/100 for p,d in zip(pts,demand)]
        out.append((product, pts, demand, revenue))
    return out

def _compute_time_pricing():
    times = ['6 AM','8 AM','10 AM','12 PM','2 PM','4 PM','6 PM','8 PM','10 PM']
    mults = [0.85,0.9,0.95,1.0,1.05,1.1,1.15,1.1,1.0]
    return {"timeOfDay": times, "weekdays": ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], "priceMultipliers": mults}

def _compute_segment_data(env):
    segs = env.get_customer_segments()
    return [
        {
            "name": s['name'],
            "value": round(s['size']*100,1),
            "priceSensitivity": round(s['price_sensitivity'],2),
            "qualityPreference": round(s['quality_preference'],2)
        }
        for s in segs
    ]


# ─── API Endpoints ────────────────────────────────────────────────────────────
@app.route('/api/start_training', methods=['POST'])
def start_training():
    global training_thread
    data = request.json or {}
    episodes = int(data.get('episodes', 10))
    episodes = max(1, min(episodes, 1000))
    use_baseline = bool(data.get('useBaseline', True))
    baseline_strategy = data.get('baselineStrategy', 'combined')

    if training_thread and training_thread.is_alive():
        return jsonify({"success": False, "message": "Training already in progress"}), 400

    training_thread = threading.Thread(
        target=train_agent,
        args=(episodes, use_baseline, baseline_strategy),
        daemon=True
    )
    training_thread.start()
    return jsonify({"success": True, "message": f"Training started for {episodes} episodes"})


@app.route('/api/training_status', methods=['GET'])
def get_status():
    return jsonify(training_status)


@app.route('/api/training_results', methods=['GET'])
def get_results():
    return jsonify(training_results)


@app.route('/api/products', methods=['GET'])
def get_products():
    prods = env.get_products()
    for p in prods:
        bp, cp = p['base_price'], p['current_price']
        p['recommendation'] = (
            'Increase Price' if cp < bp*0.9 else
            'Decrease Price' if cp > bp*1.1 else
            'Maintain Price'
        )
    return jsonify(prods)


@app.route('/api/customer_segments', methods=['GET'])
def get_customer_segments():
    return jsonify(env.get_customer_segments())


@app.route('/api/generate_sample_data', methods=['POST'])
def generate_sample_data():
    global env
    env = MarketEnvironment(num_products=5, num_customer_segments=3, time_periods=24, competitors=2)
    return jsonify({"products": env.get_products()})


@app.route('/api/baseline_comparison', methods=['GET'])
def baseline_comp():
    return jsonify(reward_system.get_reward_history())


@app.route('/api/price_demand_data', methods=['GET'])
def price_demand_data():
    out = []
    for p, pts, dm, rv in _compute_price_demand(env):
        out.append({
            "product": p['name'],
            "pricePoints": [round(x,2) for x in pts],
            "demand": [round(x,2) for x in dm],
            "revenue": [round(x,2) for x in rv]
        })
    return jsonify(out)


@app.route('/api/time_pricing_data', methods=['GET'])
def time_pricing_data():
    return jsonify(_compute_time_pricing())


@app.route('/api/customer_segment_data', methods=['GET'])
def customer_segment_data():
    return jsonify(_compute_segment_data(env))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
