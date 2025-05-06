import numpy as np
import pandas as pd
from enhanced_env import MarketEnvironment

class HumanBaseline:
    def __init__(self, env, strategy='combined'):
        self.env = env
        self.strategy = strategy  # 'fixed', 'adaptive', 'time', or 'combined'
        self.products = env.get_products()
        self.customer_segments = env.get_customer_segments()
        self.price_history = {p['id']: [] for p in self.products}
        self.demand_history = {p['id']: [] for p in self.products}
        self.revenue_history = []
        self.profit_history = []
        
    def reset(self):
        """Reset the baseline strategy"""
        self.price_history = {p['id']: [] for p in self.products}
        self.demand_history = {p['id']: [] for p in self.products}
        self.revenue_history = []
        self.profit_history = []
        
    def fixed_pricing_strategy(self, state):
        """Simple fixed pricing strategy - prices at 10% markup from base price"""
        prices = []
        for product in self.products:
            prices.append(product['base_price'] * 1.1)
        return prices
    
    def adaptive_pricing_strategy(self, state):
        """Adaptive pricing based on recent demand"""
        prices = []
        for product in self.products:
            product_id = product['id']
            
            # If we have demand history, adjust price based on recent demand
            if len(self.demand_history[product_id]) > 0:
                recent_demand = self.demand_history[product_id][-1]
                
                # If demand is high, increase price
                if recent_demand > 30:
                    price = product['base_price'] * 1.15
                # If demand is medium, slight increase
                elif recent_demand > 15:
                    price = product['base_price'] * 1.05
                # If demand is low, decrease price
                else:
                    price = product['base_price'] * 0.95
            else:
                # Start with a small markup
                price = product['base_price'] * 1.05
                
            prices.append(price)
        return prices
    
    def time_based_pricing_strategy(self, state):
        """Time-based pricing strategy"""
        prices = []
        
        # Extract current time from state
        current_time = int(state[0][self.env.num_products * (1 + self.env.competitors)] * self.env.time_periods)
        
        # Time of day pricing factors
        time_of_day = current_time % 24
        
        # Morning hours (6-10 AM): Lower prices
        if time_of_day < 4:
            price_factor = 0.95
        # Midday hours (10 AM - 2 PM): Standard prices
        elif time_of_day < 8:
            price_factor = 1.0
        # Afternoon hours (2-6 PM): Slightly higher prices
        elif time_of_day < 12:
            price_factor = 1.05
        # Evening hours (6-10 PM): Peak prices
        elif time_of_day < 16:
            price_factor = 1.15
        # Night hours (10 PM - 6 AM): Discount prices
        else:
            price_factor = 0.9
            
        for product in self.products:
            prices.append(product['base_price'] * price_factor)
            
        return prices
    
    def combined_strategy(self, state):
        """Combined strategy using time, demand, and competitor information"""
        prices = []
        
        # Extract current time from state
        current_time = int(state[0][self.env.num_products * (1 + self.env.competitors)] * self.env.time_periods)
        
        # Time of day pricing factors
        time_of_day = current_time % 24
        
        # Morning hours (6-10 AM): Lower prices
        if time_of_day < 4:
            time_factor = 0.95
        # Midday hours (10 AM - 2 PM): Standard prices
        elif time_of_day < 8:
            time_factor = 1.0
        # Afternoon hours (2-6 PM): Slightly higher prices
        elif time_of_day < 12:
            time_factor = 1.05
        # Evening hours (6-10 PM): Peak prices
        elif time_of_day < 16:
            time_factor = 1.15
        # Night hours (10 PM - 6 AM): Discount prices
        else:
            time_factor = 0.9
            
        # Extract competitor prices from state
        competitor_prices = {}
        for i in range(self.env.num_products):
            competitor_prices[i] = []
            for c in range(self.env.competitors):
                idx = self.env.num_products + c * self.env.num_products + i
                competitor_prices[i].append(state[0][idx] * self.products[i]['base_price'])
        
        for i, product in enumerate(self.products):
            product_id = product['id']
            base_price = product['base_price']
            
            # Start with time-based factor
            price = base_price * time_factor
            
            # Adjust based on recent demand if available
            if len(self.demand_history[product_id]) > 0:
                recent_demand = self.demand_history[product_id][-1]
                
                # If demand is high, increase price
                if recent_demand > 30:
                    price *= 1.1
                # If demand is medium, slight increase
                elif recent_demand > 15:
                    price *= 1.02
                # If demand is low, decrease price
                else:
                    price *= 0.95
            
            # Adjust based on competitor prices
            if i in competitor_prices and competitor_prices[i]:
                avg_competitor_price = sum(competitor_prices[i]) / len(competitor_prices[i])
                
                # If our price is much higher than competitors, reduce it
                if price > avg_competitor_price * 1.1:
                    price = avg_competitor_price * 1.05
                # If our price is much lower than competitors, increase it slightly
                elif price < avg_competitor_price * 0.9:
                    price = avg_competitor_price * 0.95
            
            prices.append(price)
            
        return prices
    
    def select_action(self, state):
        """Select pricing action based on the chosen strategy"""
        if self.strategy == 'fixed':
            prices = self.fixed_pricing_strategy(state)
        elif self.strategy == 'adaptive':
            prices = self.adaptive_pricing_strategy(state)
        elif self.strategy == 'time':
            prices = self.time_based_pricing_strategy(state)
        else:  # combined or default
            prices = self.combined_strategy(state)
            
        # Convert prices to action index
        action = self.env._price_to_action(prices)
        
        return action, prices
    
    def run_episode(self):
        """Run a full episode with the baseline strategy"""
        state = self.env.reset()
        self.reset()
        
        done = False
        total_reward = 0
        
        while not done:
            action, prices = self.select_action(state)
            
            # Update price history
            for i, product in enumerate(self.products):
                if i < len(prices):
                    self.price_history[product['id']].append(prices[i])
            
            next_state, reward, done, info = self.env.step(action)
            
            # Update demand history
            for product_id, demand in info['demand'].items():
                self.demand_history[product_id].append(demand)
                
            # Update revenue and profit history
            self.revenue_history.append(info['revenue'])
            self.profit_history.append(info['profit'])
            
            state = next_state
            total_reward += reward
            
        return total_reward, self.revenue_history, self.profit_history
    
    def get_performance_metrics(self):
        """Get performance metrics for the baseline strategy"""
        total_revenue = sum(self.revenue_history)
        total_profit = sum(self.profit_history)
        
        return {
            'total_revenue': total_revenue,
            'total_profit': total_profit,
            'revenue_history': self.revenue_history,
            'profit_history': self.profit_history,
            'price_history': self.price_history,
            'demand_history': self.demand_history
        }
