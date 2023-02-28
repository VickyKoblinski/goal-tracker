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
};

export type CreateGoalInput = {
  /** Name of the goal */
  name: Scalars['String'];
  /** The parent goal */
  parent?: InputMaybe<Scalars['ID']>;
};

export type CreateUserInput = {
  /** Email address */
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
  /** Password */
  password: Scalars['String'];
  /** Username */
  username: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createGoal: Goal;
  deleteGoal: Goal;
  login: Auth;
  register: Auth;
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
  /** User ID */
  id: Scalars['ID'];
  /** Username */
  username: Scalars['ID'];
};

export type SignupMutationVariables = Exact<{
  createUserInput: CreateUserInput;
}>;


export type SignupMutation = { __typename?: 'Mutation', register: { __typename?: 'Auth', token: string } };


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