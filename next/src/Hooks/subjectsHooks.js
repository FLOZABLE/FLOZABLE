import { getSubjects } from "@/Api/subjectsApi";
import { useQuery } from "@tanstack/react-query";

function useSubjects(userInfo) {
  return useQuery({
    queryKey: [`useSubjects`],
    queryFn: getSubjects,
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });
}

export { useSubjects };
