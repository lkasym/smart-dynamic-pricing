import numpy as np
import random
import pandas as pd
from datetime import datetime, timedelta

class MarketEnvironment:
    def __init__(self, num_products=5, num_customer_segments=3, time_periods=24, competitors=2):
        self.num_products = num_products
        self.num_customer_segments = num_customer_segments
        self.time_periods = time_periods
        self.competitors = competitors
        self.current_time = 0

        # Initialize products and remember their starting stock
        self.products = self._initialize_products()
        self._initial_stocks = [p['stock'] for p in self.products]

        self.customer_segments = self._initialize_customer_segments()
        self.competitor_prices = self._initialize_competitor_prices()
        self.time_factors = self._initialize_time_factors()

        self.state_size = self._calculate_state_size()
        self.action_size = self._calculate_action_size()
        self.reset()
        
    def _initialize_products(self):
        """Initialize product data with realistic attributes"""
        product_names = [
            "Premium Headphones", "Wireless Keyboard", "Smart Watch", 
            "Bluetooth Speaker", "Gaming Mouse", "External SSD",
            "Wireless Earbuds", "Mechanical Keyboard", "Webcam HD"
        ]
        
        products = []
        for i in range(min(self.num_products, len(product_names))):
            base_price = random.uniform(50, 200)
            products.append({
                'id': i,
                'name': product_names[i],
                'base_price': base_price,
                'current_price': base_price,
                'cost': base_price * 0.6,
                'stock': random.randint(50, 200),
                'demand_elasticity': -1.2 - random.random() * 0.8,  # Between -1.2 and -2.0
                'category': random.choice(['Audio', 'Computing', 'Wearable', 'Gaming', 'Storage']),
                'quality': random.uniform(0.7, 1.0),
                'seasonality': random.uniform(0.8, 1.2)
            })
        return products
    
    def _initialize_customer_segments(self):
        """Initialize customer segments with different price sensitivities"""
        segments = []
        segment_names = ['Budget', 'Mainstream', 'Premium']
        
        for i in range(self.num_customer_segments):
            name = segment_names[i] if i < len(segment_names) else f"Segment {i+1}"
            if name == 'Budget':
                price_sensitivity = random.uniform(1.5, 2.0)
                quality_preference = random.uniform(0.3, 0.6)
                size = random.uniform(0.4, 0.5)
            elif name == 'Mainstream':
                price_sensitivity = random.uniform(1.0, 1.5)
                quality_preference = random.uniform(0.6, 0.8)
                size = random.uniform(0.3, 0.4)
            else:
                price_sensitivity = random.uniform(0.5, 1.0)
                quality_preference = random.uniform(0.8, 1.0)
                size = random.uniform(0.1, 0.3)
                
            segments.append({
                'id': i,
                'name': name,
                'price_sensitivity': price_sensitivity,
                'quality_preference': quality_preference,
                'size': size,
                'loyalty': random.uniform(0.1, 0.4)
            })
            
        # Normalize segment sizes to sum to 1
        total_size = sum(seg['size'] for seg in segments)
        for seg in segments:
            seg['size'] /= total_size
            
        return segments
    
    def _initialize_competitor_prices(self):
        """Initialize competitor pricing strategies"""
        competitor_prices = {}
        for c in range(self.competitors):
            competitor_prices[c] = {}
            for product in self.products:
                factor = random.uniform(0.9, 1.1)
                competitor_prices[c][product['id']] = product['base_price'] * factor
        return competitor_prices
    
    def _initialize_time_factors(self):
        """Initialize time-based factors affecting demand"""
        factors = []
        for t in range(self.time_periods):
            hour = t % 24
            if hour < 4:
                f = random.uniform(0.7, 0.9)
            elif hour < 8:
                f = random.uniform(0.9, 1.1)
            elif hour < 12:
                f = random.uniform(1.0, 1.2)
            elif hour < 16:
                f = random.uniform(1.1, 1.3)
            else:
                f = random.uniform(0.5, 0.7)
            factors.append(f)
        return factors
    
    def _calculate_state_size(self):
        """Calculate the size of the state space"""
        # prices + competitor prices + time + stock + recent demand
        return self.num_products * (1 + self.competitors) + 1 + self.num_products * 2
    
    def _calculate_action_size(self):
        """Calculate the size of the action space"""
        # 5 discrete price levels per product
        return 5 ** self.num_products
    
    def reset(self):
        """Reset the environment to initial state (including restocking)"""
        self.current_time = 0
        self.total_profit = 0
        self.recent_demand = {p['id']: 0 for p in self.products}
        self.customer_satisfaction = 0.5
        
        # Restore each product’s price and **stock**
        for idx, product in enumerate(self.products):
            product['current_price'] = product['base_price']
            product['stock']         = self._initial_stocks[idx]
            
        # Re‑randomize competitor prices
        for c in range(self.competitors):
            for product in self.products:
                adj = random.uniform(-0.05, 0.05)
                ratio = product['current_price'] / product['base_price']
                self.competitor_prices[c][product['id']] = product['base_price'] * (ratio + adj)
                
        return self._get_state()
    
    def _get_state(self):
        """Get the current state representation"""
        state = []
        # normalized own prices
        for p in self.products:
            state.append(p['current_price'] / p['base_price'])
        # normalized competitor prices
        for c in range(self.competitors):
            for p in self.products:
                state.append(self.competitor_prices[c][p['id']] / p['base_price'])
        # time, stock, recent demand
        state.append(self.current_time / self.time_periods)
        for p in self.products:
            state.append(min(1.0, p['stock'] / 100))
        for _, d in self.recent_demand.items():
            state.append(min(1.0, d / 50))
        return np.array([state])
    
    # ... rest of class unchanged (step, get_products, get_customer_segments, etc.) ...

    
    def _price_to_action(self, prices):
        """Convert price adjustments to a single action index"""
        # This is a simplified version - in a real system, you'd need a more sophisticated mapping
        price_levels = [-0.1, -0.05, 0, 0.05, 0.1]  # -10%, -5%, 0%, +5%, +10%
        
        # Find the closest price level for each product
        price_indices = []
        for i, product in enumerate(self.products):
            price_ratio = prices[i] / product['base_price'] - 1.0  # Convert to percentage change
            closest_idx = min(range(len(price_levels)), key=lambda j: abs(price_levels[j] - price_ratio))
            price_indices.append(closest_idx)
            
        # Convert multi-dimensional action to a single index
        action_idx = 0
        for i, idx in enumerate(price_indices):
            action_idx += idx * (5 ** i)
            
        return action_idx
    
    def _action_to_prices(self, action):
        """Convert a single action index to price adjustments"""
        price_levels = [-0.1, -0.05, 0, 0.05, 0.1]  # -10%, -5%, 0%, +5%, +10%
        
        # Convert action index to multi-dimensional action
        price_indices = []
        temp_action = action
        for i in range(self.num_products):
            price_indices.append(temp_action % 5)
            temp_action //= 5
            
        # Apply price adjustments
        new_prices = []
        for i, product in enumerate(self.products):
            if i < len(price_indices):
                price_adjustment = price_levels[price_indices[i]]
                new_price = product['base_price'] * (1 + price_adjustment)
                new_prices.append(new_price)
            else:
                new_prices.append(product['current_price'])
                
        return new_prices
    
    def step(self, action):
        """Take a step in the environment with the given action"""
        # Convert action to price adjustments
        new_prices = self._action_to_prices(action)
        
        # Update product prices
        for i, product in enumerate(self.products):
            if i < len(new_prices):
                product['current_price'] = new_prices[i]
                
        # Calculate demand and revenue
        total_revenue = 0
        total_cost = 0
        
        # Update competitor prices with some randomness
        for competitor in range(self.competitors):
            for product in self.products:
                # Competitors adjust prices based on our prices and some randomness
                competitor_adjustment = random.uniform(-0.05, 0.05)
                price_ratio = product['current_price'] / product['base_price']
                self.competitor_prices[competitor][product['id']] = product['base_price'] * (price_ratio + competitor_adjustment)
                
        # Calculate demand for each product from each customer segment
        for product in self.products:
            product_demand = 0
            
            for segment in self.customer_segments:
                # Base demand depends on segment size
                base_segment_demand = 100 * segment['size']
                
                # Price sensitivity effect
                own_price_effect = (product['base_price'] / product['current_price']) ** segment['price_sensitivity']
                
                # Competitor price effect
                competitor_price_effect = 1.0
                for competitor in range(self.competitors):
                    competitor_price = self.competitor_prices[competitor][product['id']]
                    if competitor_price < product['current_price']:
                        # Lower competitor prices reduce our demand
                        price_diff_ratio = competitor_price / product['current_price']
                        competitor_price_effect *= 0.5 + 0.5 * price_diff_ratio
                
                # Quality preference effect
                quality_effect = 0.5 + 0.5 * (product['quality'] ** segment['quality_preference'])
                
                # Time of day effect
                time_effect = self.time_factors[self.current_time % len(self.time_factors)]
                
                # Customer satisfaction and loyalty effect
                loyalty_effect = 1.0 + segment['loyalty'] * self.customer_satisfaction
                
                # Seasonality effect
                seasonality_effect = product['seasonality']
                
                # Calculate segment demand for this product
                segment_demand = base_segment_demand * own_price_effect * competitor_price_effect * quality_effect * time_effect * loyalty_effect * seasonality_effect
                
                # Add randomness
                segment_demand *= random.uniform(0.9, 1.1)
                
                # Add to total product demand
                product_demand += segment_demand
                
            # Ensure demand doesn't exceed stock
            product_demand = min(product_demand, product['stock'])
            product_demand = max(0, int(product_demand))
            
            # Update product stock
            product['stock'] -= product_demand
            
            # Update recent demand
            self.recent_demand[product['id']] = product_demand
            
            # Calculate revenue and cost
            product_revenue = product_demand * product['current_price']
            product_cost = product_demand * product['cost']
            
            total_revenue += product_revenue
            total_cost += product_cost
            
        # Calculate profit
        profit = total_revenue - total_cost
        self.total_profit += profit
        
        # Update customer satisfaction based on pricing
        price_satisfaction = 0
        for product in self.products:
            price_ratio = product['current_price'] / product['base_price']
            if price_ratio < 0.9:  # Customers like lower prices
                price_satisfaction += 0.1
            elif price_ratio > 1.1:  # Customers dislike higher prices
                price_satisfaction -= 0.1
                
        # Adjust overall satisfaction (with some memory of previous satisfaction)
        self.customer_satisfaction = 0.8 * self.customer_satisfaction + 0.2 * (0.5 + price_satisfaction)
        self.customer_satisfaction = max(0, min(1, self.customer_satisfaction))
        
        # Move to next time period
        self.current_time += 1
        done = self.current_time >= self.time_periods
        
        # Calculate reward (profit)
        reward = profit
        
        # Get next state
        next_state = self._get_state()
        
        # Additional info
        info = {
            'revenue': total_revenue,
            'cost': total_cost,
            'profit': profit,
            'total_profit': self.total_profit,
            'customer_satisfaction': self.customer_satisfaction,
            'demand': self.recent_demand
        }
        
        return next_state, reward, done, info
    
    def get_products(self):
        """Return the current product data"""
        return self.products
    
    def get_customer_segments(self):
        """Return the customer segment data"""
        return self.customer_segments
