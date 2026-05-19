async function initLakeApp() {
  // Fetch 3 years of daily data
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const startDate = threeYearsAgo.toISOString().split('T')[0];

  const USGS_API = `https://waterservices.usgs.gov/nwis/dv/?format=json&sites=10010000&startDT=${startDate}&parameterCd=62614&siteStatus=all`;

  try {
    const response = await fetch(USGS_API);
    const data = await response.json();
    const timeSeries = data.value.timeSeries[0].values[0].value;

    const labels = timeSeries.map((entry) => entry.dateTime.split('T')[0]);
    const values = timeSeries.map((entry) => parseFloat(entry.value));

    const currentElevation = values[values.length - 1];

    document.getElementById('lake-elevation').innerText =
      currentElevation.toFixed(1);

    const ctx = document.getElementById('lakeChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Lake Elevation (ft)',
            data: values,
            borderColor: '#0077be',
            backgroundColor: 'rgba(0, 119, 190, 0.1)',
            borderWidth: 2,
            fill: true,
            pointRadius: 0,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          // Added a line to show where "Healthy" is
          autocolors: false,
          annotation: {
            annotations: {
              line1: {
                type: 'line',
                yMin: 4198,
                yMax: 4198,
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 2,
                label: { content: 'Healthy Level', enabled: true },
              },
            },
          },
        },
        scales: {
          y: {
            // Updated min to show the 2022 crisis point for context
            min: 4188,
            title: { display: true, text: 'Elevation (feet)' },
          },
          x: {
            ticks: { maxTicksLimit: 10 },
          },
        },
      },
    });
  } catch (error) {
    console.error('USGS Fetch Error:', error);
    document.getElementById('lake-percent').innerText = 'Offline';
  }
}

initLakeApp();
