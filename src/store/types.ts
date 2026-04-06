export type Indexed = Record<string, unknown>;

export type User = {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
};

export type AppState = {
  user: User | null;
  authLoading: boolean;
  authError: string | null;
};
