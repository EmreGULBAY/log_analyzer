import { finalResult } from "../Interfaces/LogInterface";

export const VisualizeLogs = (data: finalResult[]) => {
  try {
    const labels = data.map((item) => item.key);
    const unfinishedData = data.map((item) => item.unfinished);
    const finishedData = data.map((item) =>
      item.finished.reduce((sum, f) => sum + f.count, 0)
    );
    const chartConfig = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Unfinished",
            data: unfinishedData,
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Finished",
            data: finishedData,
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            stacked: true,
          },
          x: {
            stacked: true,
          },
        },
      },
    };
    return {
      chartConfig,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
};
