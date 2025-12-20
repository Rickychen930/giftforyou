// src/models/login-page-model.ts

/**
 * State model for LoginController (MVC Controller state).
 * Keep it simple and UI-focused.
 */
export interface LoginState {
  username: string;
  password: string;

  /** Error message to show in the view (empty string = no error) */
  error: string;

  /** True while calling the login API */
  loading: boolean;
}
