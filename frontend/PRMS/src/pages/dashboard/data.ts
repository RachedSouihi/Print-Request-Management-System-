import { PrintRequest } from './PRManagement';

const sampleRequests: PrintRequest[] = [
  {
    id: "1",
    title: "Math Homework",
    user: "student1@school.com",
    date: "2023-10-01",
    copies: 10,
    paperType: "A4",
    inkUsage: "5.00",
    status: "pending",
    urgency: "low",
    statusHistory: [
      { status: "submitted", timestamp: "2023-10-01T08:00:00Z" },
      { status: "pending", timestamp: "2023-10-01T09:00:00Z" }
    ]
  },
  {
    id: "2",
    title: "Research Paper",
    user: "prof1@school.com",
    date: "2023-10-02",
    copies: 50,
    paperType: "A3",
    inkUsage: "25.00",
    status: "in-progress",
    urgency: "high",
    statusHistory: [
      { status: "submitted", timestamp: "2023-10-02T08:00:00Z" },
      { status: "in-progress", timestamp: "2023-10-02T09:00:00Z" }
    ]
  },
  {
    id: "3",
    title: "Science Project",
    user: "student2@school.com",
    date: "2023-10-03",
    copies: 20,
    paperType: "A4",
    inkUsage: "10.00",
    status: "completed",
    urgency: "medium",
    statusHistory: [
      { status: "submitted", timestamp: "2023-10-03T08:00:00Z" },
      { status: "completed", timestamp: "2023-10-03T09:00:00Z" }
    ]
  },
  {
    id: "4",
    title: "History Essay",
    user: "student3@school.com",
    date: "2023-10-04",
    copies: 15,
    paperType: "A4",
    inkUsage: "7.50",
    status: "pending",
    urgency: "low",
    statusHistory: [
      { status: "submitted", timestamp: "2023-10-04T08:00:00Z" },
      { status: "pending", timestamp: "2023-10-04T09:00:00Z" }
    ]
  },
  {
    id: "5",
    title: "Lab Report",
    user: "prof2@school.com",
    date: "2023-10-05",
    copies: 30,
    paperType: "A3",
    inkUsage: "15.00",
    status: "in-progress",
    urgency: "high",
    statusHistory: [
      { status: "submitted", timestamp: "2023-10-05T08:00:00Z" },
      { status: "in-progress", timestamp: "2023-10-05T09:00:00Z" }
    ]
  },
  {
    id: "6",
    title: "English Assignment",
    user: "student4@school.com",
    date: "2023-10-06",
    copies: 25,
    paperType: "A4",
    inkUsage: "12.50",
    status: "pending",
    urgency: "medium",
    statusHistory: [
      { status: "submitted", timestamp: "2023-10-06T08:00:00Z" },
      { status: "pending", timestamp: "2023-10-06T09:00:00Z" }
    ]
  },
  {
    id: "7",
    title: "Physics Notes",
    user: "student5@school.com",
    date: "2023-10-07",
    copies: 40,
    paperType: "A4",
    inkUsage: "20.00",
    status: "completed",
    urgency: "low",
    statusHistory: [
      { status: "submitted", timestamp: "2023-10-07T08:00:00Z" },
      { status: "completed", timestamp: "2023-10-07T09:00:00Z" }
    ]
  },
  {
    id: "8",
    title: "Chemistry Lab",
    user: "prof3@school.com",
    date: "2023-10-08",
    copies: 35,
    paperType: "A3",
    inkUsage: "17.50",
    status: "in-progress",
    urgency: "high",
    statusHistory: [
      { status: "submitted", timestamp: "2023-10-08T08:00:00Z" },
      { status: "in-progress", timestamp: "2023-10-08T09:00:00Z" }
    ]
  },
  {
    id: "9",
    title: "Biology Report",
    user: "student6@school.com",
    date: "2023-10-09",
    copies: 10,
    paperType: "A4",
    inkUsage: "5.00",
    status: "pending",
    urgency: "medium",
    statusHistory: [
      { status: "submitted", timestamp: "2023-10-09T08:00:00Z" },
      { status: "pending", timestamp: "2023-10-09T09:00:00Z" }
    ]
  },
  {
    id: "10",
    title: "Geography Project",
    user: "student7@school.com",
    date: "2023-10-10",
    copies: 20,
    paperType: "A4",
    inkUsage: "10.00",
    status: "completed",
    urgency: "low",
    statusHistory: [
      { status: "submitted", timestamp: "2023-10-10T08:00:00Z" },
      { status: "completed", timestamp: "2023-10-10T09:00:00Z" }
    ]
  },
];


const status = [
    {
      // ... existing properties
      statusHistory: [
        { status: 'Submitted', timestamp: '2023-10-01 09:00' },
        { status: 'Under Review', timestamp: '2023-10-01 10:30' },
        { status: 'Processing', timestamp: '2023-10-01 14:15' }
      ]
    }
  ];

export default sampleRequests;