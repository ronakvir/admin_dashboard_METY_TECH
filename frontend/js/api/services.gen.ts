// This file is auto-generated by @hey-api/openapi-ts

import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";
import type {
  ApiLogoutCreateData,
  ApiLogoutCreateResponse,
  QuestionnaireApiQuestionnairesCreateData,
  QuestionnaireApiQuestionnairesCreateResponse,
  RestRestCheckRetrieveResponse,
  UsersListData,
  UsersListResponse,
  UsersCreateData,
  UsersCreateResponse,
  UsersRetrieveData,
  UsersRetrieveResponse,
  UsersUpdateData,
  UsersUpdateResponse,
  UsersPartialUpdateData,
  UsersPartialUpdateResponse,
  UsersDestroyData,
  UsersDestroyResponse,
  UsersLoginCreateData,
  UsersLoginCreateResponse,
  UsersLogoutCreateResponse,
} from "./types.gen";

export class ApiService {
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns Logout
   * @throws ApiError
   */
  public static apiLogoutCreate(
    data: ApiLogoutCreateData = {},
  ): CancelablePromise<ApiLogoutCreateResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/api/logout/",
      body: data.requestBody,
      mediaType: "application/json",
    });
  }
}

export class QuestionnaireService {
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns Questionnaire
   * @throws ApiError
   */
  public static questionnaireApiQuestionnairesCreate(
    data: QuestionnaireApiQuestionnairesCreateData,
  ): CancelablePromise<QuestionnaireApiQuestionnairesCreateResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/questionnaire/api/questionnaires/",
      body: data.requestBody,
      mediaType: "application/json",
    });
  }
}

export class RestService {
  /**
   * Check REST API
   * This endpoint checks if the REST API is working.
   * @returns Message
   * @throws ApiError
   */
  public static restRestCheckRetrieve(): CancelablePromise<RestRestCheckRetrieveResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/rest/rest-check/",
    });
  }
}

export class UsersService {
  /**
   * @param data The data for the request.
   * @param data.limit Number of results to return per page.
   * @param data.offset The initial index from which to return the results.
   * @returns PaginatedUserList
   * @throws ApiError
   */
  public static usersList(
    data: UsersListData = {},
  ): CancelablePromise<UsersListResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/users/",
      query: {
        limit: data.limit,
        offset: data.offset,
      },
    });
  }

  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns User
   * @throws ApiError
   */
  public static usersCreate(
    data: UsersCreateData,
  ): CancelablePromise<UsersCreateResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/users/",
      body: data.requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * @param data The data for the request.
   * @param data.id A unique integer value identifying this user.
   * @returns User
   * @throws ApiError
   */
  public static usersRetrieve(
    data: UsersRetrieveData,
  ): CancelablePromise<UsersRetrieveResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/users/{id}/",
      path: {
        id: data.id,
      },
    });
  }

  /**
   * @param data The data for the request.
   * @param data.id A unique integer value identifying this user.
   * @param data.requestBody
   * @returns User
   * @throws ApiError
   */
  public static usersUpdate(
    data: UsersUpdateData,
  ): CancelablePromise<UsersUpdateResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/users/{id}/",
      path: {
        id: data.id,
      },
      body: data.requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * @param data The data for the request.
   * @param data.id A unique integer value identifying this user.
   * @param data.requestBody
   * @returns User
   * @throws ApiError
   */
  public static usersPartialUpdate(
    data: UsersPartialUpdateData,
  ): CancelablePromise<UsersPartialUpdateResponse> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/users/{id}/",
      path: {
        id: data.id,
      },
      body: data.requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * @param data The data for the request.
   * @param data.id A unique integer value identifying this user.
   * @returns void No response body
   * @throws ApiError
   */
  public static usersDestroy(
    data: UsersDestroyData,
  ): CancelablePromise<UsersDestroyResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/users/{id}/",
      path: {
        id: data.id,
      },
    });
  }

  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns Login
   * @throws ApiError
   */
  public static usersLoginCreate(
    data: UsersLoginCreateData,
  ): CancelablePromise<UsersLoginCreateResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/users/login/",
      body: data.requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * @returns unknown No response body
   * @throws ApiError
   */
  public static usersLogoutCreate(): CancelablePromise<UsersLogoutCreateResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/users/logout/",
    });
  }
}
