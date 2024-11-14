let currentChart = null;

async function fetchData() {
  const loading = document.getElementById("loading");
  loading.style.display = "block";

  const selectedActions = Array.from(
    document.querySelectorAll('input[id^="action-"]:checked')
  ).map((cb) => cb.value);

  const selectedChannels = Array.from(
    document.querySelectorAll('input[id^="channel-"]:checked')
  ).map((cb) => cb.value);

  const filters = {
    frequency: document.getElementById("frequency").value,
    action: selectedActions,
    channelCode: selectedChannels,
  };

  try {
    const response = await fetch("/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    });

    const { chartConfig, rawData } = await response.json();

    const labels = rawData.map((item) => item.key);
    const unfinishedData = rawData.map((item) => item.unfinished);
    const finishedData = rawData.map((item) =>
      item.finished.reduce((sum, f) => sum + f.count, 0)
    );

    const formatDateLabel = (timestamp) => {
      const d = new Date(timestamp);
      return {
        date: d.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    };

    const uniqueDates = [
      ...new Set(
        labels.map((date) =>
          new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        )
      ),
    ];

    const existingDateInfo = document.querySelector(".date-info");
    if (existingDateInfo) {
      existingDateInfo.remove();
    }

    const container = document.querySelector(".container");
    const dateInfo = document.createElement("div");
    dateInfo.className = "date-info";
    dateInfo.style.margin = "20px 0";
    dateInfo.style.fontSize = "16px";
    dateInfo.style.fontWeight = "bold";
    dateInfo.textContent = `Showing data for: ${uniqueDates.join(" and ")}`;
    container.insertBefore(
      dateInfo,
      document.querySelector(".chart-container")
    );

    const chartConfiguration = {
      type: "bar",
      data: {
        labels: labels.map((date) => formatDateLabel(date).time),
        datasets: [
          {
            label: "Finished",
            data: finishedData,
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "Unfinished",
            data: unfinishedData,
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text:
              uniqueDates.length > 1
                ? "Finished vs Unfinished Logs (Multiple Days)"
                : `Finished vs Unfinished Logs (${uniqueDates[0]})`,
            font: {
              size: 16,
            },
          },
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            stacked: true,
            title: {
              display: true,
              text: "Count",
            },
          },
          x: {
            stacked: true,
            title: {
              display: true,
              text: "Time",
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    if (currentChart) {
      currentChart.destroy();
    }

    const ctx = document.getElementById("myChart").getContext("2d");
    currentChart = new Chart(ctx, chartConfiguration);
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Error fetching data. Please try again.");
  } finally {
    loading.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", fetchData);
