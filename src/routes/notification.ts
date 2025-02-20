import { NotificationController } from '../controllers/NotificationController';
import router, { type BunRequest } from './router';

const notificationController = new NotificationController();
const APP_VERSION = 'v1';

/**
 * @swagger
 * /v1/notifications:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Send a notification using a template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auth_user_id
 *               - type
 *               - template_id
 *               - template_data
 *               - title
 *               - content
 *             properties:
 *               auth_user_id:
 *                 type: string
 *                 example: "123"
 *               type:
 *                 type: string
 *                 enum: [email, push]
 *                 example: "email"
 *               email:
 *                 type: string
 *                 description: Required for email notifications
 *                 example: "user@example.com"
 *               title:
 *                 type: string
 *                 description: Title of the notification
 *                 example: "Payment Successful"
 *               content:
 *                 type: string
 *                 description: Content of the notification
 *                 example: "Your payment has been processed successfully"
 *               template_id:
 *                 type: number
 *                 example: 1
 *               template_data:
 *                 type: object
 *                 description: Values to replace placeholders in the template
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: User's name for personalization
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     description: User's email for template usage
 *                     example: "john@example.com"
 *                   custom_variables:
 *                     type: object
 *                     description: Any additional template variables
 *                     example: {
 *                       order_id: "ORD123",
 *                       amount: "₺50.00",
 *                       status: "completed"
 *                     }
 *           examples:
 *             email_notification:
 *               summary: Example Email Notification
 *               value: {
 *                 "auth_user_id": "123",
 *                 "type": "email",
 *                 "email": "user@example.com",
 *                 "title": "Payment Confirmation",
 *                 "content": "Your payment has been processed",
 *                 "template_id": 1,
 *                 "template_data": {
 *                   "username": "John Doe",
 *                   "order_id": "ORD123",
 *                   "amount": "₺50.00",
 *                   "status": "completed"
 *                 }
 *               }
 *             push_notification:
 *               summary: Example Push Notification
 *               value: {
 *                 "auth_user_id": "123",
 *                 "type": "push",
 *                 "title": "New Message",
 *                 "content": "You have received a new message",
 *                 "template_id": 2,
 *                 "template_data": {
 *                   "sender": "Jane Doe",
 *                   "message_preview": "Hey, how are you?"
 *                 }
 *               }
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     auth_user_id:
 *                       type: string
 *                       example: "123"
 *                     type:
 *                       type: string
 *                       enum: [email, push]
 *                     title:
 *                       type: string
 *                       example: "Payment Confirmation"
 *                     content:
 *                       type: string
 *                       example: "Your payment has been processed"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     is_read:
 *                       type: boolean
 *                       example: false
 *                     delivery_status:
 *                       type: string
 *                       enum: [pending, sent, delivered, failed]
 *                       example: "delivered"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Template not found
 *       500:
 *         description: Failed to send notification
 */
router.add('POST', `/${APP_VERSION}/notifications`, async (request: BunRequest) => {
  const result = await notificationController.create(request);
  return new Response(JSON.stringify(result.body), {
    headers: { 'Content-Type': 'application/json' },
    status: result.statusCode
  });
});

/**
 * @swagger
 * /v1/notifications/status:
 *   put:
 *     tags:
 *       - Notifications
 *     summary: Update notification read status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auth_user_id
 *               - notification_id
 *               - is_read
 *             properties:
 *               auth_user_id:
 *                 type: string
 *               notification_id:
 *                 type: number
 *               is_read:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification status updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Notification not found
 */
router.add('PUT', `/${APP_VERSION}/notifications/status`, async (request: BunRequest) => {
  const result = await notificationController.updateStatus(request);
  return new Response(JSON.stringify(result.body), {
    headers: { 'Content-Type': 'application/json' },
    status: result.statusCode
  });
});

/**
 * @swagger
 * /v1/notifications:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Delete a notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auth_user_id
 *               - notification_id
 *             properties:
 *               auth_user_id:
 *                 type: string
 *               notification_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Notification not found
 */
router.add('DELETE', `/${APP_VERSION}/notifications`, async (request: BunRequest) => {
  const result = await notificationController.delete(request);
  return new Response(JSON.stringify(result.body), {
    headers: { 'Content-Type': 'application/json' },
    status: result.statusCode
  });
});

export default router;