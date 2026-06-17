import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesChart = ({ dataValues, labels }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0b0f19',
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 12,
        fontFamily: 'Outfit',
        boxPadding: 4,
        callbacks: {
          label: (context) => ` Revenue: ₹${context.raw.toLocaleString()}`,
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.15)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Inter',
            size: 11,
          },
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  const chartData = {
    labels: labels || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        fill: true,
        label: 'Revenue',
        data: dataValues || [12400, 18900, 15600, 24800, 21900, 34500, 29800],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        tension: 0.38,
        borderWidth: 3,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#090d16',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="w-full h-72">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default SalesChart;
