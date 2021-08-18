import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  ResponsiveContainer,
  Line,
} from 'recharts';

const GraphSection = ({ data, xKey, yKey }) => {
  return (
    <ResponsiveContainer>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tick={false} />
        <YAxis dataKey={yKey} />
        <Tooltip />
        <Line type="monotone" dataKey={xKey} stroke="#A6CEE3" />
        <Line type="monotone" dataKey={yKey} stroke="#A6CEE3" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GraphSection;
