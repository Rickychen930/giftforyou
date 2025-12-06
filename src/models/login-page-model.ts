export interface LoginState {
  username: string;
  password: string;
  error: string;
  loading: boolean; // ✅ added
}
