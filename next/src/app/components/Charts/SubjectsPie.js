import { updateTimeUsagePie } from "@/app/utils/StatTools";
import { DateTime } from "luxon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PieCustomTooltip, pieCustomLabel } from "./Charts";
import { coldColorsList } from "@/app/utils/Constant";
import { secondConverter } from "@/app/utils/Tool";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useSubjects } from "@/Hooks/subjectsHooks";

function SubjectsPie({ viewDate, statsViewer }) {
  const { subjects } = useSubjects();

  const [subjectsPie, setSubjectsPie] = useState([]);

  useEffect(() => {
    if (!subjects || !viewDate || !statsViewer) return;

    const viewDateTime = DateTime.fromJSDate(viewDate);
    //subject time usage pie chart
    const subjectsPie = updateTimeUsagePie(subjects, viewDateTime, statsViewer);
    setSubjectsPie(
      subjectsPie.reduce((accumulator, data, i) => {
        const value = data.value;
        if (value) {
          const name = data.info.name;
          const fill =
            coldColorsList[accumulator.length % coldColorsList.length];
          const labelVal = secondConverter(value);
          accumulator.push({
            value,
            name,
            fill,
            labelVal: `${labelVal.value} ${labelVal.type}`,
          });
        }
        return accumulator;
      }, [])
    );
  }, [subjects, viewDate, statsViewer]);

  return (
    <>
      {subjectsPie.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<PieCustomTooltip />} />
            <Pie
              cx="50%"
              cy="50%"
              labelLine={false}
              data={subjectsPie}
              dataKey={"value"}
              outerRadius={"100%"}
              innerRadius={"75%"}
              fill="green"
              label={pieCustomLabel}
            ></Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            alignSelf: "center",
            fontSize: "2rem",
            textDecoration: "underline",
          }}
        >
          <Link href="/dashboard/study">
            <h3>Study to see stats!</h3>
          </Link>
        </div>
      )}
    </>
  );
}

export default SubjectsPie;
