// This file is auto-generated by @hey-api/openapi-ts

export type Login = {
  email: string;
  password: string;
};

export type Logout = {
  readonly detail: string;
};

export type Message = {
  message: string;
};

export type PaginatedUserList = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Array<User>;
};

export type PatchedUser = {
  readonly id?: number;
  email?: string;
  /**
   * Designates whether this user should be treated as active. Unselect this instead of deleting accounts.
   */
  is_active?: boolean;
  /**
   * Designates whether the user can log into this admin site.
   */
  is_staff?: boolean;
  /**
   * Designates that this user has all permissions without explicitly assigning them.
   */
  is_superuser?: boolean;
  readonly created?: string;
  readonly modified?: string;
  last_login?: string | null;
};

export type Questionnaire = {
  id: number;
  title: string;
  status: string;
  completed: number;
  started: number;
  last_modified: string;
  questions: number[];
};

export type Question = {
  id: number;
  text: string;
  answers: Answer[];
};

export type QuestionnaireNoID = {
  title: string;
  status: string;
  completed: number;
  started: number;
  last_modified: string;
  questions: QuestionFull[];
};

export type QuestionnaireFull = {
  id: number;
  title: string;
  status: string;
  completed: number;
  started: number;
  last_modified: string;
  questions: QuestionFull[];
};

export type QuestionFull = {
  id: number;
  text: string;
  type: string;
  answers: Answer[];
};

export type Answer = {
  id: number;
  text: string;
};

export type VideoSearchFields = {
  title: string;
  duration: string;
  category: string;
}

export type VideoData = {
  id: number;
  title: string;
  description: string;
  duration: string;
  categories: {
    id: number; 
    text: string;
  }[];
}


export type QuestionnaireLogicPage = {
  id: number;
  title: string;
};

export type QuestionLogicPage = {
  id: number;
  text: string;
  answers: AnswerLogicPage[];
};

export type AnswerLogicPage = {
  id: number;
  text: string;
  categories: AnswerCategories[]
};

export type AnswerCategories = {
  id: number;
  text: string;
  inclusive: boolean;
}
export type Category = {
  id: number;
  text: string;
}


export type VideoCount = {
  id: number;
  title: string;
  duration: string;
  description: string;
  count: number;
}

export type FilterByIDs = {
  inclusive: number[];
  exclusive: number[];
}

export type AnswerCategoryMappingNoID = {
  questionnaire_id: number;
  answer_id: number;
  category_id: number;
  inclusive: boolean;
}

export type AddMappingRequest = {
  requestBody: AnswerCategoryMappingNoID;
}


export type AnswerCategoryMapping = {
  id: number;
  questionnaire_id: number;
  answer_id: number;
  category_id: number;
  inclusive: boolean;
}

export type User = {
  readonly id: number;
  email: string;
  /**
   * Designates whether this user should be treated as active. Unselect this instead of deleting accounts.
   */
  is_active?: boolean;
  /**
   * Designates whether the user can log into this admin site.
   */
  is_staff?: boolean;
  /**
   * Designates that this user has all permissions without explicitly assigning them.
   */
  is_superuser?: boolean;
  readonly created: string;
  readonly modified: string;
  last_login?: string | null;
};

export type ApiLogoutCreateData = {
  requestBody?: Logout;
};

export type ApiLogoutCreateResponse = Logout;

export type QuestionnaireApiQuestionnairesCreateData = {
  requestBody: Questionnaire;
};

export type QuestionnaireApiQuestionnairesCreateResponse = Questionnaire;

export type RestRestCheckRetrieveResponse = Message;

export type UsersListData = {
  /**
   * Number of results to return per page.
   */
  limit?: number;
  /**
   * The initial index from which to return the results.
   */
  offset?: number;
};

export type UsersListResponse = PaginatedUserList;

export type UsersCreateData = {
  requestBody: User;
};

export type UsersCreateResponse = User;

export type UsersRetrieveData = {
  /**
   * A unique integer value identifying this user.
   */
  id: number;
};


export type UsersRetrieveResponse = User;

export type UsersUpdateData = {
  /**
   * A unique integer value identifying this user.
   */
  id: number;
  requestBody: User;
};

export type UsersUpdateResponse = User;

export type UsersPartialUpdateData = {
  /**
   * A unique integer value identifying this user.
   */
  id: number;
  requestBody?: PatchedUser;
};

export type UsersPartialUpdateResponse = User;

export type UsersDestroyData = {
  /**
   * A unique integer value identifying this user.
   */
  id: number;
};

export type UsersDestroyResponse = void;

export type UsersLoginCreateData = {
  requestBody: Login;
};

export type UsersLoginCreateResponse = Login;

export type $OpenApiTs = {
  "/api/api/logout/": {
    post: {
      req: ApiLogoutCreateData;
      res: {
        200: Logout;
      };
    };
  };

  "/api/resetalldata/": {
    get: {
      res: {
        204: Message[];
      };
    };
  };

  "/api/videomanagement/getvideos/{title}/{duration}/{category}": {
    post: {
      res: {
        200: VideoData[];
      };
    };
  };

  "/api/videomanagement/deletevideo/{id}": {
    post: {
      res: {
        204: Message;
      };
    };
  };

  "/api/videomanagement/createvideo/": {
    post: {
      req: VideoData;
      res: {
        201: {id: number};
      };
    };
  };
  

  "/api/questionnairebuilder/getquestionnaires/": {
    get: {
      res: {
        200: QuestionnaireFull[];
      };
    };
  };

  "/api/questionnairebuilder/createquestionnaire/": {
    post: {
      req: Questionnaire;
      res: {
        201: {id: number};
      };
    };
  };

  "/api/questionnairebuilder/deletequestionnaire/{id}": {
    delete: {
      res: {
        204: Message;
      };
    };
  };


  "/api/questionnairebuilder/getquestions/": {
    get: {
      res: {
        200: QuestionFull[];
      };
    };
  };

  "/api/questionnairebuilder/addquestion/": {
    post: {
      req: QuestionFull;
      res: {
        201: QuestionFull;
      };
    };
  };

  "/api/questionnairebuilder/deletequestion/{id}": {
    delete: {
      res: {
        204: Message;
      };
    };
  };

  "/api/questionnairebuilder/getVideos/": {
    post: {
      req: {questionnaire_id: number, answer_ids: number[]};
      res: {
        201: VideoCount[];
      };
    };
  };



  "/api/logicbuilder/getquestionnaires/": {
    get: {
      res: {
        200: QuestionnaireLogicPage[];
      };
    };
  };

  "/api/logicbuilder/deletemapping/{questionnaire_id}/{answer_id}": {
    delete: {
      res: {
        204: Message;
      };
    };
  };

  "/api/logicbuilder/addmapping/": {
    post: {
      req: AnswerCategoryMappingNoID;
      res: {
        201: AnswerCategoryMapping;
      };
    };
  };

  "/api/logicbuilder/getcategories/": {
    get: {
      res: {
        200: Category[];
      };
    };
  };

  "/api/logicbuilder/getquestions/{questionnaire_id}": {
    get: {
      res: {
        200: QuestionLogicPage[];
      };
    };
  };

  "/api/rest/rest-check/": {
    get: {
      res: {
        200: Message;
      };
    };
  };
  "/api/users/": {
    get: {
      req: UsersListData;
      res: {
        200: PaginatedUserList;
      };
    };
    post: {
      req: UsersCreateData;
      res: {
        201: User;
      };
    };
  };
  "/api/users/{id}/": {
    get: {
      req: UsersRetrieveData;
      res: {
        200: User;
      };
    };
    put: {
      req: UsersUpdateData;
      res: {
        200: User;
      };
    };
    patch: {
      req: UsersPartialUpdateData;
      res: {
        200: User;
      };
    };
    delete: {
      req: UsersDestroyData;
      res: {
        /**
         * No response body
         */
        204: void;
      };
    };
  };
  "/api/users/login/": {
    post: {
      req: UsersLoginCreateData;
      res: {
        200: Login;
      };
    };
  };
};
