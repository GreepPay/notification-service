export interface ResponseBody {
    success: boolean;
    message?: string;
    data?: any;
    error_code?: number;
    errors?: Record<string, any>;
    user?: Record<string, any>;
    access_token?: string;
    token_type?: string;
    expires_in?: number;
  }
  
  export interface HttpResponseType {
    statusCode: number;
    body: ResponseBody;
  }
  
  class HttpResponse {
    /**
     * Return a success response
     * @param {string} message - Success message
     * @param {any} data - Data to be returned
     * @param {number} status - HTTP status code
     */
    static success(message: string, data: any = {}, status: number = 200): HttpResponseType {
      return {
        statusCode: status,
        body: {
          success: true,
          message,
          data,
        }
      };
    }
  
    /**
     * Return an error response
     * @param {string} message - Error message
     * @param {number} status - HTTP status code
     */
    static failure(message: string, status: number = 500): HttpResponseType {
      return {
        statusCode: status,
        body: {
          success: false,
          message,
          error_code: status
        }
      };
    }
  
    /**
     * Return a validation error response
     * @param {Record<string, any>} errors - Validation errors
     * @param {number} status - HTTP status code
     */
    static validationFail(errors: Record<string, any> = {}, status: number = 422): HttpResponseType {
      return {
        statusCode: status,
        body: {
          success: false,
          message: 'Validation failed',
          errors
        }
      };
    }
  
    /**
     * Return a response with JWT token
     * @param {string} token - JWT token
     * @param {Record<string, any>} user - User data
     * @param {number|null} expiresIn - Token expiration time
     */
    static respondWithToken(
      token: string, 
      user: Record<string, any> = {}, 
      expiresIn: number | null = null
    ): HttpResponseType {
      const response: ResponseBody = {
        success: true,
        user,
        access_token: token,
        token_type: 'bearer'
      };
  
      if (expiresIn) {
        response.expires_in = expiresIn;
      }
  
      return {
        statusCode: 200,
        body: response
      };
    }
  
    /**
     * Return a not found response
     * @param {string} message - Not found message
     */
    static notFound(message: string = 'Resource not found'): HttpResponseType {
      return this.failure(message, 404);
    }
  
    /**
     * Return an unauthorized response
     * @param {string} message - Unauthorized message
     */
    static unauthorized(message: string = 'Unauthorized'): HttpResponseType {
      return this.failure(message, 401);
    }
  
    /**
     * Return a forbidden response
     * @param {string} message - Forbidden message
     */
    static forbidden(message: string = 'Forbidden'): HttpResponseType {
      return this.failure(message, 403);
    }
  }
  
  export default HttpResponse;