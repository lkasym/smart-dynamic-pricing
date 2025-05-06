# Smart Dynamic Pricing System

A comprehensive AI-powered pricing optimization system that uses reinforcement learning to maximize revenue and profit.

## Features

- **AI-Powered Pricing**: Uses TensorFlow reinforcement learning to optimize pricing strategies
- **Real-Time Visualization**: Interactive 2D charts showing price-demand relationships
- **Business Metrics**: Track revenue, customer segments, and price sensitivity
- **Human Baseline Comparison**: Compare AI performance against traditional pricing strategies
- **Colorful UI**: Beautiful, intuitive interface with real-time updates

## Requirements

- Python 3.8 or higher
- Node.js 14 or higher
- npm 6 or higher

## Quick Start

### Windows

1. Make sure Python and Node.js are installed on your system
2. Double-click `start_windows.bat` to start both backend and frontend
3. Wait for the application to open in your browser (http://localhost:3000)

### Linux/Mac

1. Make sure Python and Node.js are installed on your system
2. Open a terminal in the project directory
3. Make the start script executable: `chmod +x start.sh`
4. Run the start script: `./start.sh`
5. Wait for the application to open in your browser (http://localhost:3000)

## Using the Application

1. **Generate Sample Data**: Click the "Generate Sample Data" button to create product data
2. **Configure Training**: Set episodes and other parameters in the Training tab
3. **Start Training**: Click "Start Training" to begin the AI training process
4. **View Results**: Explore the different tabs to see visualizations and metrics
5. **Compare Performance**: See how the AI compares to human baseline strategies

## Project Structure

- **frontend/**: React frontend application
  - **src/**: Source code
    - **components/**: UI components and visualizations
    - **api/**: API client for backend communication
    - **pages/**: Main application pages
    - **contexts/**: React context providers
  - **public/**: Static assets

- **backend/**: Python backend application
  - **enhanced_api.py**: Flask API server
  - **enhanced_agent.py**: DQN reinforcement learning agent
  - **enhanced_env.py**: Market environment simulation
  - **human_baseline.py**: Human pricing strategy baseline
  - **enhanced_reward_system.py**: Reward calculation system

## Troubleshooting

- If the backend fails to start, check that all Python dependencies are installed
- If the frontend fails to start, try running `npm install` in the frontend directory
- Make sure ports 3000 and 5000 are available on your system

## License

This project is for educational purposes only.
