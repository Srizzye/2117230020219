# Stage 1 – REST API Design & Real-Time Notification Architecture

Objective

Design a backend notification system for a campus platform where students receive real-time updates related to:

Placements,Results,Events

The system should support scalable REST APIs and real-time delivery mechanisms.

REST API Endpoints

1. Get All Notifications

Endpoint

GET /notifications

Description
Fetches all notifications for a student.

Response
"id": "a1b2c3",
"type": "Placement",
"message": "Amazon hiring drive",
"timestamp": "....."

2. Get Top Priority Notifications
   Endpoint

GET /notifications/top

Description

Returns top priority notifications sorted by importance and recency.

3. Create Notification
   Endpoint

POST /notifications

Request Body
{
"type": "Placement",
"message": "Microsoft hiring drive"
}

4. Mark Notification as Read
   Endpoint

PUT /notifications/:id/read

Description

Marks a notification as read for a student.

Notification Schema
{
"id": "UUID",
"studentId": 1042,
"type": "Placement",
"message": "Amazon hiring drive",
"isRead": false,
"timestamp": "......"
}

Real-Time Notification Strategy
To make the notification system feel faster and more interactive, real-time communication can be used so that students receive notifications instantly without refreshing the page.
Why WebSockets?
WebSockets are preferred because they allow continuous two-way communication between the client and the server. Once a connection is established, notifications can be pushed instantly to users in real time.

This makes WebSockets highly suitable for scalable real-time notification systems used in campus platforms.

# Stage 2 – Database Design & Scalability

Database Choice
For this notification system, PostgreSQL is selected as the primary database because it offers strong reliability, consistency, and efficient query handling. Since notifications involve frequent reads, sorting, filtering, and updates, PostgreSQL provides a stable and scalable solution for managing large amounts of structured data.
The database is designed around a notifications table that stores important information such as the student ID, notification type, message content, read status, and creation timestamp. This structure allows the system to efficiently track and manage notifications for each student.
As the platform grows and more students begin using the system, certain scalability challenges can appear. Fetching and sorting notifications for thousands of users may gradually increase query execution time and database load. Operations such as retrieving unread notifications or sorting notifications by recent activity can become expensive when the dataset becomes very large.
To improve performance, indexing can be introduced on frequently queried fields such as studentId, isRead, and createdAt. This helps the database locate records much faster without scanning the entire table repeatedly.
CREATE INDEX idx_notificationsON notifications(studentId, isRead, createdAt DESC);
Pagination is another important optimization technique. Instead of loading every notification at once, the system can fetch notifications in smaller batches. This reduces payload size, improves response time, and creates a smoother user experience.
Example:
GET /notifications?page=1&limit=20
To further reduce database load, Redis caching can be used for frequently accessed data such as unread notification counts and priority inbox results. This minimizes repeated database queries and significantly improves response speed.
For handling large-scale traffic, the system can also adopt horizontal scaling techniques such as read replicas, load balancing, and microservice-based architecture. These approaches help distribute traffic efficiently and ensure that the notification system remains stable and responsive even during peak usage periods.

# Stage 3 – Query Optimization

The existing query is used to fetch unread notifications for a specific student and display them in descending order based on the latest notifications.

SELECT \* FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;

Although this query works correctly, it may become slower when the number of notifications increases significantly. One major issue is the use of SELECT \*, which fetches every column from the table even if all the data is not required. This increases unnecessary data transfer and slightly impacts performance.

Another important issue is the absence of a proper composite index. Without indexing, the database may perform a full table scan to find matching records and sort them. This can become expensive when the table contains millions of notifications.

To improve performance, the query can be optimized by fetching only the required columns instead of retrieving all data.

SELECT id, type, message, createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;

A composite index can also be added on frequently queried columns such as studentID, isRead, and createdAt.

CREATE INDEX idx_notifications
ON notifications(studentID, isRead, createdAt DESC);

This helps the database quickly locate unread notifications for a student while also improving sorting performance.

Adding indexes on every column is generally not recommended because too many indexes increase storage usage and slow down insert or update operations. Indexes should only be added on columns that are frequently used for filtering, searching, or sorting.

For example, if placement notifications are accessed often, the following query can be used:

SELECT \*
FROM notifications
WHERE notificationType = 'Placement';

# Stage 4 – Performance Improvements

In the current design, notifications are fetched every time the user opens or refreshes the page. As the number of users increases, this may create higher database load and slower response times, which can negatively affect the overall user experience.

To improve performance, caching can be introduced using Redis. Frequently accessed data such as unread notification counts or recently fetched notifications can be stored temporarily in memory. This reduces repeated database queries and improves response speed.

Pagination is another useful optimization technique. Instead of loading every notification at once, notifications can be fetched in smaller batches.

Example:

GET /notifications?page=1&limit=20

This reduces payload size, decreases server load, and improves frontend rendering performance.

Lazy loading can also be implemented so that additional notifications are loaded only when the user scrolls further down the page. This avoids unnecessary data loading during the initial request.

For real-time updates, WebSockets can be used to push only newly arriving notifications instead of repeatedly fetching all notifications from the server. This improves efficiency and provides a smoother user experience.

# Stage 5 – Reliable Notification Delivery

In the existing implementation, notifications are processed synchronously.

function notify_all(student_ids, message):
for student_id in student_ids:
send_email(student_id, message)
save_to_db(student_id, message)
push_to_app(student_id, message)

Although this approach is simple, it may create performance and reliability issues when notifications need to be sent to a large number of users.

Since emails are sent one by one, the entire process becomes slower as the number of students increases. Another problem occurs when email delivery fails in the middle of execution. In such situations, some users may receive notifications while others may not, resulting in inconsistent delivery.

The current approach is also blocking in nature. If one notification fails or takes too much time, the entire process becomes delayed.

To improve reliability and scalability, a queue-based architecture can be used with technologies such as RabbitMQ or Kafka. Instead of directly sending notifications, notification jobs are first pushed into a queue. Background workers then process these jobs asynchronously.

Failed notifications can automatically be retried using retry mechanisms, while permanently failed jobs can be moved into dead letter queues for later inspection.

Improved flow:

Push notification jobs into a queue
Background workers process notifications asynchronously
Retry failed notifications automatically

Example pseudocode:

function notify_all(student_ids, message):

    push_to_queue(student_ids, message)

worker():

    send_email()

    save_to_db()

    push_realtime_notification()

This approach improves scalability, fault tolerance, reliability, and overall system performance.
