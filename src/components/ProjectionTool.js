import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import projectionData from '../data/projections.json';
import historicalData from '../data/historical.json';

export default function ProjectionTool() {
  const [technology, setTechnology] = useState('wind');
  const [modelType, setModelType] = useState('Logistic');
  const [trainYear, setTrainYear] = useState('2015');
  const [showOutOfSample, setShowOutOfSample] = useState(false);
  
  // Get unique training years for dropdown
  const trainingYears = useMemo(() => {
    const years = [...new Set(projectionData
                              .filter((d) => d.technology === technology)
                              .map((d) => d.training_year))];
    return years.sort();
  }, [technology]);
  
  // Process data for selected parameters
  const data = useMemo(() => {
    // Filter historical data based on technology
    const filteredHistorical = historicalData.filter(
      (d) => d.technology === technology
    );
    
    // Map historical data to required structure
    const historical = filteredHistorical
    .filter((row) => row.year <= parseInt(trainYear))
    .map((row) => ({
      year: parseInt(row.year),
      actual: row.Actual === 'NA' ? null : parseFloat(row.Actual) * 100,
    }));
    
    // Map out-of-sample data from historical file
    const outOfSample = filteredHistorical
    .filter((row) => row.year > parseInt(trainYear))
    .map((row) => ({
      year: parseInt(row.year),
      actual: row.Actual === 'NA' ? null : parseFloat(row.Actual) * 100,
    }));
    
    // Process projections from projections.json
    const filteredProjections = projectionData.filter(
      (d) =>
        d.technology === technology &&
        d.model === modelType &&
        d.training_year.toString() === trainYear
    );
    
    const projected = filteredProjections.map((row) => ({
      year: parseInt(row.year),
      projected: parseFloat(row.Projected) * 100,
    }));
    
    return { historical, outOfSample, projected };
  }, [technology, modelType, trainYear]);
  
  // Determine Y-axis domain
  const maxY = useMemo(() => {
    const maxProjected = Math.max(...data.projected.map((d) => d.projected || 0));
    const maxHistorical = Math.max(...data.historical.map((d) => d.actual || 0));
    const maxOutOfSample = Math.max(...data.outOfSample.map((d) => d.actual || 0));
    const overallMax = Math.max(maxProjected, maxHistorical, maxOutOfSample);
    return overallMax > 10 ? Math.ceil(overallMax) : 10;
  }, [data]);
  
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
      <CardTitle>Projecting technology deployment using growth curve extrapolation</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="space-y-4">
      <div className="flex gap-4">
      {/* Technology Dropdown */}
    <div className="w-48">
      <select
    value={technology}
    onChange={(e) => setTechnology(e.target.value)}
    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm"
    >
      <option value="wind">Onshore Wind</option>
      <option value="solar">Solar PV</option>
      </select>
      </div>
      
      {/* Model Type Dropdown */}
    <div className="w-48">
      <select
    value={modelType}
    onChange={(e) => setModelType(e.target.value)}
    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm"
    >
      <option value="Logistic">Logistic Growth</option>
      <option value="Exponential">Exponential Growth</option>
      </select>
      </div>
      
      {/* Training Year Dropdown */}
    <div className="w-48">
      <select
    value={trainYear}
    onChange={(e) => setTrainYear(e.target.value)}
    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm"
    >
      {trainingYears.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
      </div>
      </div>
      
      {/* Toggle Out-of-Sample Data */}
    <div>
      <label>
      <input
    type="checkbox"
    checked={showOutOfSample}
    onChange={() => setShowOutOfSample(!showOutOfSample)}
    />
      Show Out-of-Sample Data
    </label>
      </div>
      
      {/* Chart */}
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height={400}>
      <LineChart
    data={data.projected}
    margin={{ top: 20, right: 30, left: 70, bottom: 20 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
    dataKey="year"
    type="number"
    domain={[2000, 2030]}
    ticks={[2000, 2005, 2010, 2015, 2020, 2025, 2030]}
    />
      <YAxis
    domain={[0, maxY]}
    label={{
      value: 'Share of Global Electricity Generation (%)',
      angle: -90,
      position: 'insideLeft',
      offset: 0,
      style: {
        textAnchor: 'middle',
      }
    }}
    />
      <Tooltip formatter={(value) => (value ? value.toFixed(2) + '%' : 'No data')} />
      <Legend />
      
      {/* Projections */}
    <Line
    type="monotone"
    dataKey="projected"
    stroke={modelType === 'Exponential' ? '#9A607F' : '#B4BA39'}
    name="Projection"
    strokeWidth={2}
    dot={false}
    />
      
      {/* Historical Data */}
    <Line
    type="monotone"
    dataKey="actual"
    stroke="#000000"
    name="Historical Data"
    strokeWidth={0}
    dot={{ r: 4, fill: '#000000' }}
    data={data.historical}
    isAnimationActive={false}
    />
      
      {/* Line for Out-of-Sample Actual Data with Hollow Dots */}
    {showOutOfSample && (
      <Line
      type="monotone"
      dataKey="actual"
      stroke="#ffffff00"
      name="Out-of-Sample Data"
      strokeWidth={2}
      dot={{ r: 4, fill: '#B7C6CF', stroke: '#B7C6CF', strokeWidth: 2 }}
      isAnimationActive={false}
      data={data.outOfSample}
      />
    )}
    
    {/* Training Year Marker */}
    <ReferenceLine x={parseInt(trainYear)} stroke="grey" strokeDasharray="5 5" />
      </LineChart>
      </ResponsiveContainer>
      </div>
      </div>
      </CardContent>
      </Card>
  );
}
