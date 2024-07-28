import { getSubjects } from "@/Api/subjectsApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";
import { timelineSort } from "@/app/utils/timelineSorting";
import { useEffect, useState } from "react";

function useSubjects() {
  const { userInfo } = useAccount();

  const queryResult = useQuery({
    queryKey: [`useSubjects`],
    queryFn: getSubjects,
    staleTime: 1000 * 60 * 10,
    enabled: !!userInfo,
  });

  const {
    data: useSubjectsData,
    refetch: useSubjectsRefetch,
    isLoading: useSubjectsIsLoading,
  } = queryResult;

  const [subjects, setSubjects] = useState([]);

  /* const subjects = useSubjectsData?.success
    ? timelineSort(useSubjectsData.subjects)
    : []; */
  useEffect(() => {
    if (useSubjectsData?.success) {
      setSubjects(timelineSort(useSubjectsData.subjects));
    }
  }, [useSubjectsData]);

  return {
    useSubjectsData,
    useSubjectsRefetch,
    useSubjectsIsLoading,
    subjects,
    setSubjects,
    ...queryResult,
  };
}

export { useSubjects };
