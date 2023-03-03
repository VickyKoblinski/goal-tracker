import { CreateUserInput, LoginUserInput } from '@/generated/graphql';
// ----------------------------------------------------------------------

export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUserType = null | Record<string, any>;

export type AuthStateType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasVerifiedEmail: boolean;
  user: AuthUserType;
};

// ----------------------------------------------------------------------

export type JWTContextType = {
  method: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasVerifiedEmail: boolean;
  user: AuthUserType;
  login: (loginUserInput: LoginUserInput) => Promise<void>;
  register: (createUserInput: CreateUserInput) => Promise<void>;
  logout: () => void;
  loginWithGoogle?: () => void;
  loginWithGithub?: () => void;
  loginWithTwitter?: () => void;
  verify: (emailVerificationToken: string) => Promise<void>;
};
