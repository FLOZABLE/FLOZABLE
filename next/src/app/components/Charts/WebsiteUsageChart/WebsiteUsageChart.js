import { SUBJECTS_PIE_COLORS } from "@/app/utils/Constant";
import { secondConverter } from "@/app/utils/Tool";
import styles from "./WebsiteUsageChart.module.css";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieCustomTooltip } from "../Charts";
import { useExtensionUsage } from "@/Hooks/extensionHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { useEffect, useState } from "react";

export default function WebsiteUsageChart({}) {
  const [durations, setDurations] = useState([]);
  const [visits, setVisits] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [totalDuration, setTotalDuration] = useState("0 seconds");
  const [totalVisits, setTotalVisits] = useState("0 times");

  const { extensionUsageData, extensionUsageIsLoading } = useExtensionUsage(
    new Date(new Date().setHours(0, 0, 0, 0)),
    "day"
  );

  useEffect(() => {
    if (!extensionUsageData?.success) return;

    const usage = extensionUsageData.data.usage.map((website, i) => ({
      ...website,
      name: website.website,
      fill: SUBJECTS_PIE_COLORS[i % SUBJECTS_PIE_COLORS.length],
    }));

    const durations = usage
      .slice()
      .sort((a, b) => a.duration - b.duration)
      .map((website) => ({
        ...website,
        labelVal: secondConverter({ sec: website.duration }),
      }));
    setDurations(durations);

    const totalDuration = usage.reduce((a, b) => {
      return a + b.duration;
    }, 0);
    const formattedTotalVisits = secondConverter({
      sec: totalDuration,
      options: ["seconds", "minutes", "hours"],
    });
    setTotalDuration(formattedTotalVisits);

    const visits = usage
      .slice()
      .sort((a, b) => a.visits - b.visits)
      .map((website) => ({ ...website, labelVal: website.visits + " times" }));
    setVisits(visits);

    const totalVisits = usage.reduce((a, b) => {
      return a + b.visits;
    }, 0);
    setTotalVisits(totalVisits + " times");
  }, [extensionUsageData]);

  if (extensionUsageIsLoading) {
    return <CircularLoading />;
  }

  return (
    <div className={`${styles.WebsiteUsageChart} Box`}>
      <div className="header">
        <h3>Website Usage</h3>
      </div>
      {durations.length ? (
        <div className={`${styles.contents}`}>
          <div className={styles.chartsContainer}>
            <div className={styles.chartWrapper}>
              <h3>Duration</h3>
              <div className={styles.totalTime}>
                <p className={styles.time}>{totalDuration}</p>
                <p className={styles.text}>Total</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<PieCustomTooltip />} />
                  <Pie
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    data={durations.filter(
                      (duration) => !filteredWebsites.includes(duration.website)
                    )}
                    dataKey={"duration"}
                    outerRadius={"100%"}
                    innerRadius={"65%"}
                    fill="green"
                  ></Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.chartWrapper}>
              <h3>Visits</h3>
              <div className={styles.totalTime}>
                <p className={styles.time}>{totalVisits}</p>
                <p className={styles.text}>Total</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<PieCustomTooltip />} />
                  <Pie
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    data={visits.filter(
                      (visit) => !filteredWebsites.includes(visit.website)
                    )}
                    dataKey={"visits"}
                    outerRadius={"100%"}
                    innerRadius={"65%"}
                    fill="green"
                  ></Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.labels}>
            {durations.map((duration, i) => {
              return (
                <div
                  className={`${styles.label} ${
                    filteredWebsites.includes(duration.website)
                      ? styles.filtered
                      : null
                  }`}
                  key={i}
                  onClick={() => {
                    if (filteredWebsites.includes(duration.website)) {
                      setFilteredWebsites(
                        filteredWebsites.filter(
                          (website) => website !== duration.website
                        )
                      );
                    } else {
                      setFilteredWebsites([
                        ...filteredWebsites,
                        duration.website,
                      ]);
                    }
                  }}
                >
                  <div
                    className={styles.color}
                    style={{ backgroundColor: duration.fill }}
                  ></div>
                  <p className={`overflowDot ${styles.name}`}>
                    {duration.website}
                  </p>
                  <p>
                    {secondConverter({ sec: duration.duration })},{" "}
                    {duration.visits} times
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <a
          target="blank"
          href="https://chromewebstore.google.com/detail/flozable-tab-monitor/cmbdaanokelibhphiidlikongdoandlj"
          className={styles.noChart}
        >
          <h3 className={styles.chromeExtensionLink}>
            Use chrome extension to see website usage!
          </h3>
        </a>
      )}
    </div>
  );
}
