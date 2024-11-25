import { WorkersContext } from "@/app/utils/Contexts";
import { useEffect, useRef } from "react";

export default function WorkersProvider({ children }) {
  const membersTimerWorkerRef = useRef(null);
  const subjectsTimerWorkerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    membersTimerWorkerRef.current = new Worker("/workers/timerWorker.js");
    subjectsTimerWorkerRef.current = new Worker(
      "/workers/subjectTimerWorker.js"
    );

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("scope is: ", registration.scope);
        });
    }

    return () => {
      membersTimerWorkerRef.current?.terminate();
      subjectsTimerWorkerRef.current?.terminate();
    };
  }, []);

  return (
    <WorkersContext.Provider
      value={{ membersTimerWorkerRef, subjectsTimerWorkerRef }}
    >
      {children}
    </WorkersContext.Provider>
  );
}
