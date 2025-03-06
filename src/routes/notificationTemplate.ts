import { NotificationTemplateController } from "../controllers/NotificationTemplateController";
import router, { type BunRequest } from "./router";

const templateController = new NotificationTemplateController();
const APP_VERSION = "v1";

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationTemplate:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - subject
 *         - content
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [email, push]
 *         subject:
 *           type: string
 *         content:
 *           type: string
 *         metadata:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /v1/notification-templates:
 *   post:
 *     tags:
 *       - Notification Templates
 *     summary: Create a new notification template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - subject
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [email, push]
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                     description: Category of the notification template
 *                     example: "onboarding"
 *                   requiredVariables:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of variables required by the template
 *                     example: ["username", "email"]
 *                 example:
 *                   category: "onboarding"
 *                   requiredVariables: ["username", "email"]
 *     responses:
 *       201:
 *         description: Template created successfully
 *       409:
 *         description: Template with this name already exists
 */
router.add(
  "POST",
  `/${APP_VERSION}/notification-templates`,
  async (request: BunRequest) => {
    const result = await templateController.create(request);
    return new Response(JSON.stringify(result.body), {
      headers: { "Content-Type": "application/json" },
      status: result.statusCode,
    });
  }
);

/**
 * @swagger
 * /v1/notification-templates:
 *   put:
 *     tags:
 *       - Notification Templates
 *     summary: Update a notification template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: number
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [email, push]
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       404:
 *         description: Template not found
 */
router.add(
  "PUT",
  `/${APP_VERSION}/notification-templates`,
  async (request: BunRequest) => {
    const result = await templateController.update(request);
    return new Response(JSON.stringify(result.body), {
      headers: { "Content-Type": "application/json" },
      status: result.statusCode,
    });
  }
);

/**
 * @swagger
 * /v1/notification-templates:
 *   delete:
 *     tags:
 *       - Notification Templates
 *     summary: Delete a notification template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 */
router.add(
  "DELETE",
  `/${APP_VERSION}/notification-templates`,
  async (request: BunRequest) => {
    const result = await templateController.delete(request);
    return new Response(JSON.stringify(result.body), {
      headers: { "Content-Type": "application/json" },
      status: result.statusCode,
    });
  }
);

export default router;
