import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { LegalClause } from '../types/legal';
import { calculateContractHealthMetrics } from './RiskAnalysisDashboard';

interface AuditRiskChartProps {
  clauses: LegalClause[];
  onSelectClause?: (clauseId: string) => void;
}

const RISK_COLORS: Record<string, string> = {
  Kritis: '#DC2626',
  Perhatian: '#D97706',
  Standar: '#16A34A',
};

export const AuditRiskChart: React.FC<AuditRiskChartProps> = ({ clauses }) => {
  const riskData = useMemo(() => {
    const counts: Record<string, number> = {
      Kritis: 0,
      Perhatian: 0,
      Standar: 0,
    };

    clauses.forEach((c) => {
      const level = c.riskLevel === 'Kritis' || c.riskLevel === 'Perhatian' ? c.riskLevel : 'Standar';
      counts[level] = (counts[level] || 0) + 1;
    });

    const total = clauses.length || 1;
    return [
      {
        name: 'Kritis',
        value: counts.Kritis,
        percentage: Math.round((counts.Kritis / total) * 100),
        color: RISK_COLORS.Kritis,
        desc: 'Klausul berdampak finansial/hukum langsung',
      },
      {
        name: 'Perhatian',
        value: counts.Perhatian,
        percentage: Math.round((counts.Perhatian / total) * 100),
        color: RISK_COLORS.Perhatian,
        desc: 'Klausul operasional & batas tanggung jawab',
      },
      {
        name: 'Standar',
        value: counts.Standar,
        percentage: Math.round((counts.Standar / total) * 100),
        color: RISK_COLORS.Standar,
        desc: 'Klausul normatif & administrasi kontrak',
      },
    ];
  }, [clauses]);

  const activeChartData = useMemo(
    () => riskData.filter((d) => d.value > 0),
    [riskData]
  );

  const healthMetrics = useMemo(
    () => calculateContractHealthMetrics(clauses),
    [clauses]
  );

  return (
    <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#18181B]">
          Distribusi Tingkat Risiko Pasal
        </span>
        <span className="text-[11px] font-code tabular-nums text-[#57534E]">
          Skor Kesehatan: <strong className="text-[#18181B]">{healthMetrics.healthScore}/100</strong> · {clauses.length} Pasal
        </span>
      </div>

      {/* Recharts PieChart */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={66}
              paddingAngle={3}
              stroke="#FAF9F6"
              strokeWidth={2}
            >
              {activeChartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} Pasal`, `Tingkat ${name}`]}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#D6D0C4',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#18181B',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tabular Summary Breakdown */}
      <div className="space-y-1.5 pt-1 border-t border-[#E5E0D8]">
        {riskData.map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between text-xs py-1 border-b border-[#F0ECE3] last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: row.color }}
                aria-hidden="true"
              />
              <div>
                <span className="font-semibold text-[#18181B]">{row.name}</span>
                <span className="mx-1 text-[#78716C]">·</span>
                <span className="text-[11px] text-[#57534E]">{row.desc}</span>
              </div>
            </div>
            <div className="font-code tabular-nums text-xs font-medium text-[#18181B] whitespace-nowrap ml-2">
              {row.value} Pasal ({row.percentage}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
