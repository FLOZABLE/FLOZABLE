import ApexChart from 'apexcharts';
import Chart from 'react-apexcharts';
import styled from 'styled-components';
import { colorsList } from '../../constant';
import { useEffect, useState } from 'react';

const StyleWrapper = styled.div`
.wrapper {
  position: relative;
}

.unselected :not(path[selected="true"]) {
  stroke: #f2f3f4;
}

path {
  filter: none;
  cursor: pointer;
  transition: stroke .3s ease-in-out;
}

.viewer {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-contents: center;
  align-items: center;
}
`;

function RadialBarChart({ series, colors = colorsList, selected, setSelected }) {

  const [ratio, setRatio] = useState("");
  const [percentage, setPercentage] = useState("");

  useEffect(() => {
    if (!series) return;

    console.log("Set Selected to ", selected)

    let total = 0;
    let completed = 0;
    /* console.log(selected) */
    if (selected < 0) {
      //total
      series.map(data => {
        total += data.total;
        completed += data.completed;
      })
    } else {
      total = series[selected].total;
      completed = series[selected].completed;
    };
    setRatio(`${completed}/${total}`);
    setPercentage((Math.round(completed/total * 1000)/10) + "%");
  }, [series, selected]);

  return (
    <StyleWrapper>
      <div className="wrapper">
        <div className={selected < 0 ? '' : 'unselected'}>
          <Chart
            options={{
              chart: {
                events: {
                  click: function (event, chartContext, config) {
                    const index = event.srcElement.getAttribute("j");
                    if (index === null) return;
                    const selected = event.srcElement.getAttribute("selected") === "true";
                    console.log("71", selected)
                    if (!selected) {
                      setSelected(-1);
                      console.log("Setting to -1");
                    } else {
                      setSelected(parseInt(index));
                      console.log("Setting to ", parseInt(index));
                    };
                  },
                },
                selection: {
                  enabled: false
                }
              },
              states: {
                hover: {
                  filter: {
                    type: 'none'
                    /* type: 'lighten', value: 1 */
                  }
                }
              },
              plotOptions: {
                radialBar: {
                  hollow: {
                    size: '30%',
                  },
                  dataLabels: {

                    name: {
                      fontSize: '100px',
                      show: false
                    },
                    value: {
                      fontSize: '13px',
                      show: false,
                      formatter: (val) => {
                        return val
                      }
                    },
                    total: {
                      show: true,
                      label: 'Total',
                      formatter: function (w) {
                        return null
                      }
                    },
                  },
                  track: {
                    /* background: ['#000', '#fff'] */
                    /* strokeWidth: '200%' */
                  },
                },
              },
              stroke: {
                lineCap: "round"
              },
              fill: {
                colors: colors
              }
            }}
            series={series.map(data => { return data.val })}
            type="radialBar"
          />
        </div>
        <div className="viewer">
          <div className="percentage">
            {percentage}
          </div>
          <div className="ratio">
          {ratio}
          </div>
          complete
        </div>
      </div>
    </StyleWrapper>
  );
};

export default RadialBarChart;