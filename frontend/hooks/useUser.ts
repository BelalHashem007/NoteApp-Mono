import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/usersApi";

export const useUser = () => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
    staleTime: Infinity,
  });

  const setUser = (userData: User) => {
    queryClient.setQueryData(["user"], userData);
  };

  return { user: data?.data, setUser };
};
