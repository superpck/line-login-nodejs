import dotenv from 'dotenv';

dotenv.config();

interface LineLoginConfig {
  channelId: string | undefined;
  channelSecret: string | undefined;
  callbackUrl: string | undefined;
  scope: string;
  state: string;
}

const lineLoginConfig: LineLoginConfig = {
  channelId: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  callbackUrl: process.env.LINE_CALLBACK_URL,
  scope: 'profile openid',
  state: 'random_state_string', // You should generate a random state string for security
};

export default lineLoginConfig;
