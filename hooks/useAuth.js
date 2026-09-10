export function useAuth() {
  return {
    user: null,
    loading: false,
    login: async () => undefined,
    register: async () => undefined,
    logout: async () => undefined,
  };
}
