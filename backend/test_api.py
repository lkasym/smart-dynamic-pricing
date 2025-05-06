#!/usr/bin/env python3
import sys
import time
import logging
import requests
import matplotlib.pyplot as plt
import json
from typing import Any, Dict, List

# ─── Configuration ────────────────────────────────────────────────────────────
BASE_URL = "http://localhost:5000/api"
TRAIN_EPISODES = 10
POLL_INTERVAL = 1  # seconds
BASELINE_STRATEGIES = ["random", "fixed", "time", "combined"]

# ─── Logging Setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(message)s",
    datefmt="%H:%M:%S"
)
log = logging.getLogger("test_backend")

# ─── Helpers ──────────────────────────────────────────────────────────────────
def fetch(path: str, method: str = "get", json_body: Dict[str, Any] = None) -> Any:
    url = f"{BASE_URL}{path}"
    log.debug(f"{method.upper():<5} {url}")
    try:
        resp = getattr(requests, method)(url, json=json_body, timeout=10)
    except requests.RequestException as e:
        log.error(f"Network error calling {path}: {e}")
        sys.exit(1)
    if resp.status_code != 200:
        log.error(f"❌ {method.upper()} {path} → HTTP {resp.status_code}")
        log.error("Response body: %s", resp.text)
        sys.exit(1)
    log.info(f"✅ {method.upper()} {path} → HTTP 200")
    try:
        return resp.json()
    except ValueError:
        log.error(f"Invalid JSON in response from {path}")
        sys.exit(1)

# ─── Validators ───────────────────────────────────────────────────────────────
def validate_keys(obj: Dict[str, Any], keys: List[str], context: str):
    for k in keys:
        if k not in obj:
            log.error(f"Missing key '{k}' in {context} response")
            sys.exit(1)

# ─── Plot Helpers ─────────────────────────────────────────────────────────────
def plot_and_save(fig, filename: str):
    fig.tight_layout()
    fig.savefig(filename)
    plt.close(fig)
    log.info(f"✏️  Saved {filename}")

# ─── Static Endpoint Tests ────────────────────────────────────────────────────
def test_products():
    data = fetch("/products")
    log.info("Products (count=%d): %s", len(data), json.dumps(data[:2], indent=2))
    validate_keys(data[0], ["id","name","base_price","current_price","cost","recommendation"], "GET /products")
    return data


def test_customer_segments():
    data = fetch("/customer_segments")
    log.info("Customer Segments (count=%d): %s", len(data), json.dumps(data, indent=2))
    validate_keys(data[0], ["id","name","price_sensitivity","quality_preference","size"], "GET /customer_segments")
    return data


def test_generate_sample():
    resp = fetch("/generate_sample_data", method="post", json_body={})
    sample = resp.get("products", [])
    log.info("Sample Products (count=%d): %s", len(sample), json.dumps(sample[:2], indent=2))
    return sample


def test_price_demand_data():
    data = fetch("/price_demand_data")
    log.info("Price-Demand-Data (first): %s", json.dumps(data[0], indent=2))
    return data


def test_time_pricing_data():
    tp = fetch("/time_pricing_data")
    log.info("Time Pricing Data: %s", json.dumps(tp, indent=2))
    return tp


def test_customer_segment_data():
    cs = fetch("/customer_segment_data")
    log.info("Customer Segment Data: %s", json.dumps(cs, indent=2))
    return cs

# ─── Training Endpoints ───────────────────────────────────────────────────────
def test_training_status():
    st = fetch("/training_status")
    validate_keys(st, ["isTraining","currentEpisode","totalEpisodes","startTime","endTime"], "GET /training_status")
    return st


def test_training_results():
    res = fetch("/training_results")
    validate_keys(res, ["finalReward","avgLast10","improvementOverBaseline","rewardHistory","baselineHistory"], "GET /training_results")
    return res


def test_baseline_comparison():
    bc = fetch("/baseline_comparison")
    validate_keys(bc, ["agent_rewards","baseline_rewards","cumulative_agent_rewards","cumulative_baseline_rewards","improvement_percentage"], "GET /baseline_comparison")
    return bc

# ─── Training Workflow ────────────────────────────────────────────────────────
def start_training(episodes: int, strategy: str):
    log.info(f"=== Starting {episodes} eps with '{strategy}' baseline ===")
    payload = {"episodes": episodes, "useBaseline": True, "baselineStrategy": strategy}
    resp = fetch("/start_training", method="post", json_body=payload)
    if not resp.get("success"):
        log.error("Failed to start training: %s", resp)
        sys.exit(1)


def wait_for_completion():
    while True:
        st = test_training_status()
        if st["isTraining"]:
            log.info(f"Training... episode {st['currentEpisode']}/{st['totalEpisodes']}")
            time.sleep(POLL_INTERVAL)
        else:
            log.info("Training done.")
            break

# ─── Plotting Results ─────────────────────────────────────────────────────────
def plot_revenue_vs_baseline(results: Dict[str, Any], baseline: Dict[str, Any], strategy: str):
    agent = results["rewardHistory"]
    base = baseline["baseline_rewards"]
    cumA = [sum(agent[:i+1]) for i in range(len(agent))]
    cumB = [sum(base[:i+1]) for i in range(len(base))]
    fig, ax = plt.subplots()
    ax.plot(cumA, marker='o', label="Agent")
    ax.plot(cumB, marker='x', label="Baseline")
    ax.set_title(f"Revenue vs Baseline ({strategy}) +{results['improvementOverBaseline']:.1f}%")
    ax.set_xlabel("Episode")
    ax.set_ylabel("Cumulative Reward")
    ax.legend()
    ax.grid(True)
    plot_and_save(fig, f"rev_vs_base_{strategy}.png")


def plot_agent_rewards(all_results: Dict[str, Dict[str, Any]]):
    fig, ax = plt.subplots()
    for strat, res in all_results.items():
        ax.plot(res['rewardHistory'], marker='o', label=strat)
    ax.set_title("Agent Reward History (all strategies)")
    ax.set_xlabel("Episode")
    ax.set_ylabel("Reward")
    ax.legend()
    ax.grid(True)
    plot_and_save(fig, "agent_reward_history_all.png")

# ─── Main Routine ─────────────────────────────────────────────────────────────
def main():
    log.info("▶︎ Starting full backend test, detailed version…")

    # 1) Static endpoints
    prods = test_products()
    segs = test_customer_segments()
    samp = test_generate_sample()
    pd = test_price_demand_data()
    tp = test_time_pricing_data()
    csd = test_customer_segment_data()

    # 2) Pre-training
    test_training_status()
    test_training_results()

    # 3) Multi-strategy training
    all_results = {}
    all_baselines = {}
    for strat in BASELINE_STRATEGIES:
        start_training(TRAIN_EPISODES, strat)
        wait_for_completion()

        results = test_training_results()
        baseline_comp = test_baseline_comparison()
        log.info("Training Results (%s): %s", strat, json.dumps(results, indent=2))
        log.info("Baseline Comp (%s): %s", strat, json.dumps(baseline_comp, indent=2))

        all_results[strat] = results
        all_baselines[strat] = baseline_comp

        plot_revenue_vs_baseline(results, baseline_comp, strat)

    # 4) Aggregated plots
    plot_agent_rewards(all_results)
    plot_revenue_vs_baseline({strat: {'rewardHistory': res['rewardHistory'], 'improvementOverBaseline': res['improvementOverBaseline'] } for strat, res in all_results.items()},
                             {strat: {'baseline_rewards': bl['baseline_rewards']} for strat, bl in all_baselines.items()},
                             "all")

    log.info("✔︎ All tests completed successfully.")

if __name__ == "__main__":
    main()
