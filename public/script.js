const colorBox = document.getElementById("colorBox");
const hexCode = document.getElementById("hexCode");
const ctx = document.getElementById("colorChart").getContext("2d");
const resetBtn = document.getElementById("resetBtn");

let chartData = {
  labels: [],
  datasets: [
    { label: "R", borderColor: "red", data: [], fill: false },
    { label: "G", borderColor: "lime", data: [], fill: false },
    { label: "B", borderColor: "blue", data: [], fill: false }
  ]
};

const chart = new Chart(ctx, {
  type: "line",
  data: chartData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: "#ccc" } },
      y: {
        beginAtZero: true,
        max: 255,
        ticks: { color: "#ccc" }
      }
    },
    plugins: { legend: { labels: { color: "#fff" } } }
  }
});

resetBtn.addEventListener("click", () => {
  chartData.labels = [];
  chartData.datasets.forEach(ds => (ds.data = []));
  chart.update();
});

async function fetchData() {
  try {
    const res = await fetch("/data");
    const data = await res.json();

    colorBox.style.backgroundColor = data.hex;
    hexCode.textContent = data.hex;

    const now = new Date().toLocaleTimeString("th-TH", { hour12: false });
    chartData.labels.push(now);
    chartData.datasets[0].data.push(data.r);
    chartData.datasets[1].data.push(data.g);
    chartData.datasets[2].data.push(data.b);

    if (chartData.labels.length > 30) {
      chartData.labels.shift();
      chartData.datasets.forEach(ds => ds.data.shift());
    }

    chart.update();
  } catch (err) {
    console.error(err);
  }
}

setInterval(fetchData, 1000);
