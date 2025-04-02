import {Svg, Rect, Text as SvgText, G} from 'react-native-svg';

const WeeklyBarChart = ({data}) => {
  const maxHours = Math.max(1, ...data.map(d => d.hours)); // Avoid division by zero
  const chartHeight = 150;
  const barWidth = 30;
  const spacing = 10;

  return (
    <Svg height={chartHeight + 50} width="100%">
      {data.map((day, index) => {
        const barHeight = (day.hours / maxHours) * chartHeight;
        return (
          <G
            key={day.day}
            x={index * (barWidth + spacing) + 20}
            y={chartHeight}>
            <Rect
              y={-barHeight}
              width={barWidth}
              height={barHeight}
              fill={day.hours > 0 ? '#51459d' : '#e0e0e0'}
              rx={4} // Rounded corners
            />
            <SvgText
              y={20}
              x={barWidth / 2}
              textAnchor="middle"
              fill="#666"
              fontSize={12}>
              {day.day}
            </SvgText>
            {day.hours > 0 && (
              <SvgText
                y={-barHeight - 5}
                x={barWidth / 2}
                textAnchor="middle"
                fill="#51459d"
                fontSize={10}>
                {day.hours}h
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
};

export default WeeklyBarChart;
