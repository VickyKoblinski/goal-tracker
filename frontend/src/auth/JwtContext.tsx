import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios from '../utils/axios';
import localStorageAvailable from '../utils/localStorageAvailable';
//
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType, JWTContextType } from './types';
import { gql } from '@apollo/client';
import {
  CreateUserInput,
  useSignupMutation,
  useWhoAmILazyQuery,
  useLoginMutation,
  useVerifyEmailMutation,
  LoginUserInput,
} from '@/generated/graphql';

// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
  VERIFY = 'VERIFY',
}

type Payload = {
  [Types.INITIAL]: {
    isAuthenticated: boolean;
    hasVerifiedEmail: boolean;
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
    hasVerifiedEmail: boolean;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
  [Types.VERIFY]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  isInitialized: false,
  isAuthenticated: false,
  hasVerifiedEmail: false,
  user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      hasVerifiedEmail: action.payload.hasVerifiedEmail,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
      hasVerifiedEmail: action.payload.hasVerifiedEmail,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }
  if (action.type === Types.VERIFY) {
    return {
      ...state,
      hasVerifiedEmail: true,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<JWTContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [signupMutation] = useSignupMutation();
  const [whoAmILazyQuery] = useWhoAmILazyQuery();
  const [loginMutation] = useLoginMutation();
  const [verifyEmailMutation] = useVerifyEmailMutation();

  const storageAvailable = localStorageAvailable();

  const initialize = useCallback(async () => {
    try {
      const accessToken = storageAvailable ? localStorage.getItem('accessToken') : '';
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const { data, error } = await whoAmILazyQuery();
        if (!data) throw new Error('User not found');

        const user = data.whoAmI;

        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: true,
            hasVerifiedEmail: user.emailVerification.emailVerified, // get result from query
            user,
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: false,
            hasVerifiedEmail: false,
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.INITIAL,
        payload: {
          isAuthenticated: false,
          hasVerifiedEmail: false,
          user: null,
        },
      });
    }
  }, [storageAvailable]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (loginUserInput: LoginUserInput) => {
    const { data, errors } = await loginMutation({
      variables: {
        loginUserInput,
      },
    });
    if (!data) throw errors;

    setSession(data.login.token);

    dispatch({
      type: Types.LOGIN,
      payload: {
        user: loginUserInput,
        hasVerifiedEmail: data.login.user.emailVerification.emailVerified,
      },
    });
  }, []);

  // REGISTER
  const register = useCallback(async (createUserInput: CreateUserInput) => {
    const { data } = await signupMutation({
      variables: {
        createUserInput,
      },
    });
    if (!data) throw new Error('Signup failed');

    setSession(data?.register.token);

    const { password, ...user } = createUserInput;

    dispatch({
      type: Types.REGISTER,
      payload: {
        user,
      },
    });
  }, []);

  // VERIFY EMAIL
  const verify = useCallback(async (emailVerificationToken: string) => {
    const { data } = await verifyEmailMutation({
      variables: {
        emailVerificationToken,
      },
    });
    if (!data) throw new Error('verification failed');

    dispatch({
      type: Types.VERIFY,
    });
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    setSession(null);
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      hasVerifiedEmail: state.hasVerifiedEmail,
      user: state.user,
      method: 'jwt',
      login,
      loginWithGoogle: () => {},
      loginWithGithub: () => {},
      loginWithTwitter: () => {},
      register,
      logout,
      verify,
    }),
    [
      state.isAuthenticated,
      state.isInitialized,
      state.user,
      login,
      logout,
      register,
      state.hasVerifiedEmail,
      verify,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

gql`
  mutation Signup($createUserInput: CreateUserInput!) {
    register(createUserInput: $createUserInput) {
      token
    }
  }
`;

gql`
  mutation Login($loginUserInput: LoginUserInput!) {
    login(loginUserInput: $loginUserInput) {
      token
      user {
        username
        email
        emailVerification {
          emailVerified
        }
      }
    }
  }
`;

gql`
  mutation VerifyEmail($emailVerificationToken: String!) {
    verifyEmail(emailVerificationToken: $emailVerificationToken) {
      id
    }
  }
`;

gql`
  query WhoAmI {
    whoAmI {
      email
      username
      emailVerification {
        emailVerified
      }
    }
  }
`;
