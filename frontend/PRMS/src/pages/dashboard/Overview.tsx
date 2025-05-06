import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Table, Dropdown } from 'react-bootstrap';
import { Line, Doughnut } from 'react-chartjs-2';
import './Overview.scss';

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
    const [metrics, setMetrics] = useState<any>(null);
    const [volumeData, setVolumeData] = useState<any>(null);
    const [topDocuments, setTopDocuments] = useState<any[]>([]);

    useEffect(() => {
        axios.get('http://localhost:9001/p-request/metrics')
            .then(res => { setMetrics(res.data); console.log(res.data) })
            .catch(err => console.error('Metrics error:', err));

        axios.get('http://localhost:9001/p-request/volume')
            .then(res => {

                const labels = res.data.map((d: any) => d.date);
                const professorsData = res.data.map((d: any) => d.professors);
                const studentsData = res.data.map((d: any) => d.students);
                setVolumeData({
                    labels,
                    datasets: [
                        {
                            label: 'Professors',
                            data: professorsData,
                            borderColor: '#4A55A2',
                            backgroundColor: 'rgba(74, 85, 162, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Students',
                            data: studentsData,
                            borderColor: '#8A4FFF',
                            backgroundColor: 'rgba(138, 79, 255, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                });
            })
            .catch(err => console.error('Volume error:', err));

        axios.get('http://localhost:9001/p-request/get-top-documents')
            .then(res => setTopDocuments(res.data))
            .catch(err => console.error('Top documents error:', err));
    }, []);


    useEffect(()    => {

        console.log('TOP DOCS: ', topDocuments)
    })

    const costDistributionData = {
        labels: ['Paper', 'Ink'],
        datasets: [{
            data: [75, 25],
            backgroundColor: ['#7895CB', '#FF9800'],
            hoverOffset: 4,
        }],
    };

    return (
        <div className="dashboard-container">
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

            {metrics && <Row className="metric-row">
                {Object.entries(metrics).map(([key, metric]: any, index: any) => (
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
            }

            <Row style={{
                display: 'flex',
                alignItems: "center",
                justifyContent: "center",
            }}>
                <Col md={8}>
                    <Card className="chart-card">
                        <Card.Body>
                            <Card.Title>Printing Volume</Card.Title>
                            {volumeData ? (
                                <Line data={volumeData} />
                            ) : (
                                <p>Loading volume data...</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="chart-card">
                        <Card.Body>
                            <Card.Title>Ink vs Paper Cost</Card.Title>
                            <Doughnut data={costDistributionData} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row style={{
                marginTop: "20px",
                }}>
                    <Col md={12}>
            
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

                    </Col>
                
            </Row>
        </div>
    );
};

export default DashboardOverview;