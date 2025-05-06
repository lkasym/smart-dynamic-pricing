import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Input, Lambda, Add, Subtract
from tensorflow.keras.optimizers import Adam
import random
from collections import deque

class DQNAgent:
    def __init__(
        self,
        state_size,
        action_size,
        learning_rate=0.0005,
        gamma=0.95,
        epsilon=1.0,
        epsilon_decay=0.995,
        epsilon_min=0.05,
        batch_size=64,
        memory_size=5000
    ):
        self.state_size = state_size
        self.action_size = action_size
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min
        self.batch_size = batch_size
        self.memory = deque(maxlen=memory_size)

        # Build online and target networks using dueling architecture
        self.model = self._build_model(dueling=True)
        self.target_model = self._build_model(dueling=True)
        self.update_target_model()

    def _build_model(self, dueling=False):
        inputs = Input(shape=(self.state_size,))
        x = Dense(64, activation='relu')(inputs)
        x = Dense(64, activation='relu')(x)

        if dueling:
            # Dueling: separate streams for state-value and advantage
            value_fc = Dense(32, activation='relu')(x)
            value = Dense(1, activation='linear')(value_fc)

            adv_fc = Dense(32, activation='relu')(x)
            advantage = Dense(self.action_size, activation='linear')(adv_fc)

            # Combine value and advantage
            advantage_mean = Lambda(lambda a: tf.reduce_mean(a, axis=1, keepdims=True))(advantage)
            adv_sub = Subtract()([advantage, advantage_mean])
            q_vals = Add()([value, adv_sub])
        else:
            q_vals = Dense(self.action_size, activation='linear')(x)

        model = Model(inputs, q_vals)
        model.compile(
            loss=tf.keras.losses.Huber(),  # Huber for stability
            optimizer=Adam(learning_rate=self.learning_rate)
        )
        return model

    def update_target_model(self):
        self.target_model.set_weights(self.model.get_weights())

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def act(self, state, training=True):
        if training and np.random.rand() < self.epsilon:
            return random.randrange(self.action_size)
        q = self.model.predict(state, verbose=0)
        return np.argmax(q[0])

    def replay(self):
        if len(self.memory) < self.batch_size:
            return

        minibatch = random.sample(self.memory, self.batch_size)
        states = np.vstack([m[0] for m in minibatch])
        actions = np.array([m[1] for m in minibatch])
        rewards = np.array([m[2] for m in minibatch])
        next_states = np.vstack([m[3] for m in minibatch])
        dones = np.array([m[4] for m in minibatch])

        # Double DQN target calculation
        # 1) online picks best next action
        q_next_online = self.model.predict(next_states, verbose=0)
        next_actions = np.argmax(q_next_online, axis=1)
        # 2) target network evaluates it
        q_next_target = self.target_model.predict(next_states, verbose=0)
        target_q = rewards + (1 - dones) * self.gamma * q_next_target[np.arange(self.batch_size), next_actions]

        # current Q-values
        q_vals = self.model.predict(states, verbose=0)
        q_vals[np.arange(self.batch_size), actions] = target_q

        # train
        self.model.fit(states, q_vals, epochs=1, verbose=0)

        # decay epsilon
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    def save(self, name):
        self.model.save_weights(name)

    def load(self, name):
        self.model.load_weights(name)
