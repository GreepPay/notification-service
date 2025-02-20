import { DeviceTokenController } from '../controllers/DeviceTokenController';
import router, { type BunRequest } from './router';

const deviceTokenController = new DeviceTokenController();
const APP_VERSION = 'v1';

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceToken:
 *       type: object
 *       required:
 *         - auth_user_id
 *         - device_type
 *         - token
 *       properties:
 *         id:
 *           type: number
 *         auth_user_id:
 *           type: string
 *         device_type:
 *           type: string
 *           enum: [ios, android, web]
 *         token:
 *           type: string
 *         is_active:
 *           type: boolean
 *           default: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /v1/device-tokens:
 *   post:
 *     tags:
 *       - Device Tokens
 *     summary: Register a new device token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auth_user_id
 *               - device_type
 *               - token
 *             properties:
 *               auth_user_id:
 *                 type: string
 *               device_type:
 *                 type: string
 *                 enum: [ios, android, web]
 *               token:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device token registered successfully
 *       400:
 *         description: Invalid input
 */
router.add('POST', `/${APP_VERSION}/device-tokens`, async (request: BunRequest) => {
  const result = await deviceTokenController.register(request);
  return new Response(JSON.stringify(result.body), {
    headers: { 'Content-Type': 'application/json' },
    status: result.statusCode
  });
});

/**
 * @swagger
 * /v1/device-tokens:
 *   put:
 *     tags:
 *       - Device Tokens
 *     summary: Update device token status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auth_user_id
 *               - token
 *             properties:
 *               auth_user_id:
 *                 type: string
 *               token:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Device token updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Device token not found
 */
router.add('PUT', `/${APP_VERSION}/device-tokens`, async (request: BunRequest) => {
  const result = await deviceTokenController.update(request);
  return new Response(JSON.stringify(result.body), {
    headers: { 'Content-Type': 'application/json' },
    status: result.statusCode
  });
});

/**
 * @swagger
 * /v1/device-tokens:
 *   delete:
 *     tags:
 *       - Device Tokens
 *     summary: Delete a device token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auth_user_id
 *               - token
 *             properties:
 *               auth_user_id:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device token deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Device token not found
 */
router.add('DELETE', `/${APP_VERSION}/device-tokens`, async (request: BunRequest) => {
  const result = await deviceTokenController.delete(request);
  return new Response(JSON.stringify(result.body), {
    headers: { 'Content-Type': 'application/json' },
    status: result.statusCode
  });
});

export default router;