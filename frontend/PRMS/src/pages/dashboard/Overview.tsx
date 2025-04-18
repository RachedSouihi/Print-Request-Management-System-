// DashboardOverview.tsx
import { useState } from 'react';
import { Card, Row, Col, Table, Dropdown } from 'react-bootstrap';
import { Line, Doughnut } from 'react-chartjs-2';


import './Overview.scss'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
);


const MetricCard = ({
    title,
    mainValue,
    change,
    changeType,
    breakdown
}: {
    title: string;
    mainValue: string;
    change: string;
    changeType: 'increase' | 'decrease';
    breakdown?: { label: string; value: string; percentage: string }[];
}) => (
    <Card className="dashboard-card">
        <Card.Body>
            <div className="metric-header">
                <h6 className="metric-title">{title}</h6>
                <span className={`badge trend-badge trend-${changeType}`}>
                    {changeType === 'increase' ? '↑' : '↓'} {change}
                </span>
            </div>
            <h3 className="metric-value">{mainValue}</h3>
            {breakdown && (
                <div className="metric-breakdown">
                    {breakdown.map((item, index) => (
                        <div key={index} className="breakdown-item">
                            <span className="breakdown-label">{item.label}</span>
                            <div className="breakdown-values">
                                <span className="breakdown-value">{item.value}</span>
                                <span className="breakdown-percentage">({item.percentage})</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card.Body>
    </Card>
);



const DashboardOverview = () => {
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

    // Mock data
    const metrics = {
        pagesPrinted: {
            value: '12,345',
            change: '+12%',
            changeType: 'increase' as const
        },
        totalCost: {
            value: '$1,234',
            change: '-3%',
            changeType: 'decrease' as const,
            breakdown: [
                { label: 'Paper', value: '$925', percentage: '75%' },
                { label: 'Ink', value: '$309', percentage: '25%' }
            ]
        },
        printRequests: {
            value: '789',
            change: '+8%',
            changeType: 'increase' as const
        },
        activeUsers: {
            value: '143',
            change: '+5%',
            changeType: 'increase' as const,
            breakdown: [
                { label: 'Professors', value: '32', percentage: '22%' },
                { label: 'Students', value: '111', percentage: '78%' }
            ]
        }
    };

    const printingVolumeData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [
            {
                label: 'Professors',
                data: [1200, 1900, 3000, 2500, 2100],
                borderColor: '#4A55A2', // Primary blue
                backgroundColor: 'rgba(74, 85, 162, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Students',
                data: [800, 1500, 2000, 1800, 2400],
                borderColor: '#8A4FFF', // Purple accent
                backgroundColor: 'rgba(138, 79, 255, 0.1)',
                tension: 0.4,
                fill: true
            },
        ],
    };

    const costDistributionData = {
        labels: ['Paper', 'Ink'],
        datasets: [{
            data: [75, 25],
            backgroundColor: ['#7895CB', '#FF9800'],
            hoverOffset: 4,
        }],
    };

    const topDocuments = [
        { subject: 'Math', level: 'Algebra 101', owner: 'Dr. Smith', prints: 45 },
        { subject: 'History', level: 'World War II', owner: 'Prof. Johnson', prints: 32 },
        { subject: 'Biology', level: 'Cell Structure', owner: 'Dr. Williams', prints: 28 },
    ];

    return (
        <div className="dashboard-container">
            {/* Header and Filter */}
            <div className="dashboard-header">
                <div className="header-group">
                    <h1>Overview</h1>
                    <Dropdown className="time-filter-wrapper">
                        <Dropdown.Toggle variant="light" className="time-filter">
                            View by: {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setTimeRange('day')}>Day</Dropdown.Item>
                            <Dropdown.Item onClick={() => setTimeRange('week')}>Week</Dropdown.Item>
                            <Dropdown.Item onClick={() => setTimeRange('month')}>Month</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>

            {/* Metric Cards */}
            <Row className="metric-row">
                {Object.entries(metrics).map(([key, metric], index) => (
                    <Col key={key} xl={3} lg={6} className="metric-col">
                        <MetricCard
                            title={key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                            mainValue={metric.value}
                            change={metric.change}
                            changeType={metric.changeType}
                            breakdown={'breakdown' in metric ? metric.breakdown : undefined}
                        />
                    </Col>
                ))}
            </Row>

            {/* Charts Section */}
            <Row className="charts-row">
                <Col xl={8} className="chart-col">
                    <Card className="volume-chart">
                        <Card.Body>
                            <h5>Printing Volume Over Time</h5>
                            <Line
                                data={printingVolumeData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'top' },
                                    },
                                }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={4} className="chart-col">
                    <Card className="cost-chart">
                        <Card.Body>
                            <h5>Cost Distribution</h5>
                            <Doughnut
                                data={costDistributionData}
                                options={{
                                    plugins: {
                                        tooltip: {
                                            callbacks: {
                                                label: (context) =>
                                                    `${context.label}: $${context.raw as number} (${(((context.raw as number) / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(2)}%)`
                                            }
                                        }
                                    }
                                }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Top Documents Table */}
            <Card className="documents-table">
                <Card.Body>
                    <div className="table-header">
                        <h5>Top Printed Documents</h5>
                    </div>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Level</th>
                                <th>Owner</th>
                                <th>Times Printed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topDocuments.map((doc, i) => (
                                <tr key={i}>
                                    <td>{doc.subject}</td>
                                    <td>{doc.level}</td>
                                    <td>{doc.owner}</td>
                                    <td>{doc.prints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default DashboardOverview;