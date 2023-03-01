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
}

type Payload = {
  [Types.INITIAL]: {
    isAuthenticated: boolean;
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
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

        const { data } = await whoAmILazyQuery();
        if (!data) throw new Error('User not found');

        const user = data.whoAmI;

        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: true,
            user,
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: false,
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

    localStorage.setItem('accessToken', data?.register.token);

    const { password, ...user } = createUserInput;

    dispatch({
      type: Types.REGISTER,
      payload: {
        user,
      },
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
      user: state.user,
      method: 'jwt',
      login,
      loginWithGoogle: () => {},
      loginWithGithub: () => {},
      loginWithTwitter: () => {},
      register,
      logout,
    }),
    [state.isAuthenticated, state.isInitialized, state.user, login, logout, register]
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
      id
      username
    }
  }
`;
