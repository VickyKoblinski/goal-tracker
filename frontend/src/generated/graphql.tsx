import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Auth = {
  __typename?: 'Auth';
  /** JWT Access Token */
  token: Scalars['String'];
  /** This user */
  user: User;
};

export type CreateGoalInput = {
  /** Name of the goal */
  name: Scalars['String'];
  /** The parent goal */
  parent?: InputMaybe<Scalars['ID']>;
};

export type CreateUserInput = {
  /** Email */
  email: Scalars['String'];
  /** Password */
  password: Scalars['String'];
  /** Username */
  username: Scalars['String'];
};

export type DeleteGoalInput = {
  deletionStrategy?: InputMaybe<DeleteGoalStrategy>;
  id: Scalars['ID'];
};

export enum DeleteGoalStrategy {
  Orphan = 'ORPHAN',
  Recursive = 'RECURSIVE'
}

export type EmailVerification = {
  __typename?: 'EmailVerification';
  /** Has email been verified? */
  emailVerified: Scalars['Boolean'];
  /** User ID */
  id: Scalars['ID'];
};

export type Goal = {
  __typename?: 'Goal';
  /** Subtasks */
  children?: Maybe<Array<Goal>>;
  id: Scalars['ID'];
  /** The name of the goal */
  name: Scalars['String'];
  /** The parent goal */
  parent?: Maybe<Goal>;
};

export type LoginUserInput = {
  /** Email */
  email: Scalars['String'];
  /** Password */
  password: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createGoal: Goal;
  deleteGoal: Goal;
  login: Auth;
  register: Auth;
  verifyEmail: EmailVerification;
};


export type MutationCreateGoalArgs = {
  createGoalInput: CreateGoalInput;
};


export type MutationDeleteGoalArgs = {
  deleteGoalInput: DeleteGoalInput;
};


export type MutationLoginArgs = {
  loginUserInput: LoginUserInput;
};


export type MutationRegisterArgs = {
  createUserInput: CreateUserInput;
};


export type MutationVerifyEmailArgs = {
  emailVerificationToken: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  goal: Goal;
  goals: Array<Goal>;
  user: User;
  whoAmI: User;
};


export type QueryGoalArgs = {
  id: Scalars['ID'];
};


export type QueryUserArgs = {
  username: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  /** User's email address */
  email: Scalars['String'];
  /** Email verification status */
  emailVerification: EmailVerification;
  /** User ID */
  id: Scalars['ID'];
  /** Username */
  username: Scalars['ID'];
};

export type SignupMutationVariables = Exact<{
  createUserInput: CreateUserInput;
}>;


export type SignupMutation = { __typename?: 'Mutation', register: { __typename?: 'Auth', token: string } };

export type LoginMutationVariables = Exact<{
  loginUserInput: LoginUserInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'Auth', token: string, user: { __typename?: 'User', username: string, email: string, emailVerification: { __typename?: 'EmailVerification', emailVerified: boolean } } } };

export type VerifyEmailMutationVariables = Exact<{
  emailVerificationToken: Scalars['String'];
}>;


export type VerifyEmailMutation = { __typename?: 'Mutation', verifyEmail: { __typename?: 'EmailVerification', id: string } };

export type WhoAmIQueryVariables = Exact<{ [key: string]: never; }>;


export type WhoAmIQuery = { __typename?: 'Query', whoAmI: { __typename?: 'User', email: string, username: string, emailVerification: { __typename?: 'EmailVerification', emailVerified: boolean } } };


export const SignupDocument = gql`
    mutation Signup($createUserInput: CreateUserInput!) {
  register(createUserInput: $createUserInput) {
    token
  }
}
    `;
export type SignupMutationFn = Apollo.MutationFunction<SignupMutation, SignupMutationVariables>;

/**
 * __useSignupMutation__
 *
 * To run a mutation, you first call `useSignupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupMutation, { data, loading, error }] = useSignupMutation({
 *   variables: {
 *      createUserInput: // value for 'createUserInput'
 *   },
 * });
 */
export function useSignupMutation(baseOptions?: Apollo.MutationHookOptions<SignupMutation, SignupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignupMutation, SignupMutationVariables>(SignupDocument, options);
      }
export type SignupMutationHookResult = ReturnType<typeof useSignupMutation>;
export type SignupMutationResult = Apollo.MutationResult<SignupMutation>;
export type SignupMutationOptions = Apollo.BaseMutationOptions<SignupMutation, SignupMutationVariables>;
export const LoginDocument = gql`
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
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      loginUserInput: // value for 'loginUserInput'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const VerifyEmailDocument = gql`
    mutation VerifyEmail($emailVerificationToken: String!) {
  verifyEmail(emailVerificationToken: $emailVerificationToken) {
    id
  }
}
    `;
export type VerifyEmailMutationFn = Apollo.MutationFunction<VerifyEmailMutation, VerifyEmailMutationVariables>;

/**
 * __useVerifyEmailMutation__
 *
 * To run a mutation, you first call `useVerifyEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyEmailMutation, { data, loading, error }] = useVerifyEmailMutation({
 *   variables: {
 *      emailVerificationToken: // value for 'emailVerificationToken'
 *   },
 * });
 */
export function useVerifyEmailMutation(baseOptions?: Apollo.MutationHookOptions<VerifyEmailMutation, VerifyEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyEmailMutation, VerifyEmailMutationVariables>(VerifyEmailDocument, options);
      }
export type VerifyEmailMutationHookResult = ReturnType<typeof useVerifyEmailMutation>;
export type VerifyEmailMutationResult = Apollo.MutationResult<VerifyEmailMutation>;
export type VerifyEmailMutationOptions = Apollo.BaseMutationOptions<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const WhoAmIDocument = gql`
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

/**
 * __useWhoAmIQuery__
 *
 * To run a query within a React component, call `useWhoAmIQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhoAmIQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhoAmIQuery({
 *   variables: {
 *   },
 * });
 */
export function useWhoAmIQuery(baseOptions?: Apollo.QueryHookOptions<WhoAmIQuery, WhoAmIQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WhoAmIQuery, WhoAmIQueryVariables>(WhoAmIDocument, options);
      }
export function useWhoAmILazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WhoAmIQuery, WhoAmIQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WhoAmIQuery, WhoAmIQueryVariables>(WhoAmIDocument, options);
        }
export type WhoAmIQueryHookResult = ReturnType<typeof useWhoAmIQuery>;
export type WhoAmILazyQueryHookResult = ReturnType<typeof useWhoAmILazyQuery>;
export type WhoAmIQueryResult = Apollo.QueryResult<WhoAmIQuery, WhoAmIQueryVariables>;