import { coldColorsList } from "@/app/utils/Constant";
import { secondConverter } from "@/app/utils/Tool";
import styles from "./WebsiteUsageChart.module.css";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieCustomTooltip, pieCustomLabel } from "../Charts";

export default function WebsiteUsageChart({ websites }) {
  return (
    <div className={`${styles.WebsiteUsageChart} Box`}>
      <div className="header">
      <h3>Website Usage</h3>
      </div>
      {websites.length ? (
        <div className={`${styles.contents}`}>
          <div className={styles.chartWrapper}>
            <h3>Visits</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<PieCustomTooltip />} />
                <Pie
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  data={JSON.parse(JSON.stringify(websites))
                    .sort((a, b) => b.v - a.v)
                    .map((website, i) => {
                      const { v, d } = website;
                      const labelVal = `${v} times`;
                      const fill = coldColorsList[i % coldColorsList.length];
                      return { ...website, labelVal, name: d, fill };
                    })}
                  dataKey={"v"}
                  outerRadius={200}
                  innerRadius={150}
                  fill="green"
                  label={pieCustomLabel}
                  minAngle={3}
                ></Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartWrapper}>
            <h3>Time</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<PieCustomTooltip />} />
                <Pie
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  data={JSON.parse(JSON.stringify(websites))
                    .sort((a, b) => b.t - a.t)
                    .map((website, i) => {
                      const { t, d } = website;
                      const { value, type } = secondConverter(t);
                      const labelVal = `${value} ${type}`;
                      const fill = coldColorsList[i % coldColorsList.length];
                      return { ...website, labelVal, name: d, fill };
                    })}
                  dataKey={"t"}
                  outerRadius={200}
                  innerRadius={150}
                  fill="green"
                  label={pieCustomLabel}
                  minAngle={3}
                ></Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <a
          target="blank"
          href="https://chromewebstore.google.com/detail/flozable-tab-monitor/cmbdaanokelibhphiidlikongdoandlj"
          className={styles.noChart}
        >
          <h3>Use chrome extension to see website usage!</h3>
        </a>
      )}
    </div>
  );
}
