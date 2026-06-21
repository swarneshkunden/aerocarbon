import { NextResponse } from 'next/server';

const MOCK_DATA = {
  todayEmissions: 8.2,
  unit: 'kg CO2e',
  trend: -14,
  weeklyData: [
    { day: 'Mon', emissions: 6.2 }, { day: 'Tue', emissions: 9.4 },
    { day: 'Wed', emissions: 7.1 }, { day: 'Thu', emissions: 11.2 },
    { day: 'Fri', emissions: 8.8 }, { day: 'Sat', emissions: 6.5 },
    { day: 'Sun', emissions: 8.2 }
  ],
  aiSuggestion: 'Try cycling to work — saves 2.1 kg CO₂e and improves air quality.',
  airQuality: 'Excellent',
};

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${backendUrl}/api/dashboard`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(MOCK_DATA);
  }
}
