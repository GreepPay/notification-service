import { NotificationController } from '../controllers/NotificationController';
import router, { type BunRequest } from './router';

const notificationController = new NotificationController();
const APP_VERSION = 'v1';

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - auth_user_id
 *         - type
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: number
 *         auth_user_id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [email, push]
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         email:
 *           type: string
 *         is_read:
 *           type: boolean
 *           default: false
 *         delivery_status:
 *           type: string
 *           enum: [pending, sent, delivered, failed]
 *           default: pending
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /v1/notifications:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Create a new notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auth_user_id
 *               - type
 *               - title
 *               - content
 *             properties:
 *               auth_user_id:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [email, push]
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid input
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
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get user's notifications
 *     parameters:
 *       - in: query
 *         name: auth_user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       400:
 *         description: auth_user_id is required
 *       500:
 *         description: Internal server error
 */
router.add('GET', `/${APP_VERSION}/notifications`, async (request: BunRequest) => {
  const result = await notificationController.getUserNotifications(request);
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
 *       500:
 *         description: Internal server error
 */
router.add('DELETE', `/${APP_VERSION}/notifications`, async (request: BunRequest) => {
  const result = await notificationController.delete(request);
  return new Response(JSON.stringify(result.body), {
    headers: { "Content-Type": "application/json" },
    status: result.statusCode
  });
});

export default router;