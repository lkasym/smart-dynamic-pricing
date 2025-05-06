import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Input
from tensorflow.keras.optimizers import Adam

class EnhancedRewardSystem:
    def __init__(self, baseline_comparison=True, baseline_strategy='combined'):
        self.baseline_comparison = baseline_comparison
        self.baseline_strategy = baseline_strategy
        self.baseline_rewards = []
        self.agent_rewards = []
        self.cumulative_baseline_rewards = []
        self.cumulative_agent_rewards = []
        
    def reset(self):
        """Reset the reward system"""
        self.baseline_rewards = []
        self.agent_rewards = []
        self.cumulative_baseline_rewards = []
        self.cumulative_agent_rewards = []
        
    def add_baseline_reward(self, reward):
        """Add a baseline reward"""
        self.baseline_rewards.append(reward)
        
        # Update cumulative rewards
        if not self.cumulative_baseline_rewards:
            self.cumulative_baseline_rewards.append(reward)
        else:
            self.cumulative_baseline_rewards.append(
                self.cumulative_baseline_rewards[-1] + reward
            )
            
    def add_agent_reward(self, reward):
        """Add an agent reward"""
        self.agent_rewards.append(reward)
        
        # Update cumulative rewards
        if not self.cumulative_agent_rewards:
            self.cumulative_agent_rewards.append(reward)
        else:
            self.cumulative_agent_rewards.append(
                self.cumulative_agent_rewards[-1] + reward
            )
            
    def get_improvement_percentage(self):
        """Calculate the percentage improvement of agent over baseline"""
        if not self.baseline_rewards or not self.agent_rewards:
            return 0.0
            
        total_baseline = sum(self.baseline_rewards)
        total_agent = sum(self.agent_rewards)
        
        if total_baseline <= 0:
            return 0.0  # Avoid division by zero or negative percentages
            
        improvement = ((total_agent - total_baseline) / abs(total_baseline)) * 100
        return improvement
        
    def get_reward_history(self):
        """Get the reward history for both agent and baseline"""
        return {
            'agent_rewards': self.agent_rewards,
            'baseline_rewards': self.baseline_rewards,
            'cumulative_agent_rewards': self.cumulative_agent_rewards,
            'cumulative_baseline_rewards': self.cumulative_baseline_rewards,
            'improvement_percentage': self.get_improvement_percentage()
        }
        
    def calculate_enhanced_reward(self, reward, baseline_reward=None):
        """Calculate an enhanced reward that includes comparison to baseline"""
        if not self.baseline_comparison or baseline_reward is None:
            return reward
            
        # Add a bonus for beating the baseline
        if reward > baseline_reward:
            bonus = 0.2 * (reward - baseline_reward)
            return reward + bonus
        else:
            # Add a penalty for underperforming compared to baseline
            penalty = 0.1 * (baseline_reward - reward)
            return reward - penalty
