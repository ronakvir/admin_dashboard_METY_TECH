import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import CQuestionnaireSelection from "./CQuestionnaireSelection";
import { Category, QuestionLogicPage, QuestionnaireLogicPage } from "../../../api/types.gen"
import { LogicbuilderService } from "../../../api/services.gen";

export type SelectedQuestion = {
  id: number;
  text: string; 
  answer: { 
    id: number;
    text: string; 
    categories: {
      id: number;
      text: string; 
      inclusive: boolean;
    } []
  } 
}

export interface LogicBuilderStates {
    questionnaireList:      QuestionnaireLogicPage[]; setQuestionnaireList:      Dispatch<SetStateAction<QuestionnaireLogicPage[]>>;
    categoryList:           Category[];               setCategoryList:           Dispatch<SetStateAction<Category[]>>;
    questionList:           QuestionLogicPage[];      setQuestionList:           Dispatch<SetStateAction<QuestionLogicPage[]>>;
    selectedLink:           SelectedQuestion | null;  setSelectedLink:           Dispatch<SetStateAction<SelectedQuestion | null>>;
    linkWorkshop:           boolean;                  setLinkWorkshop:           Dispatch<SetStateAction<boolean>>; 
    selectedQuestionnaire:  QuestionnaireLogicPage;   setSelectedQuestionnaire:  Dispatch<SetStateAction<QuestionnaireLogicPage>>;
    expandedQuestions:      boolean[];                setExpandedQuestions:      Dispatch<SetStateAction<boolean[]>>;
}

const LogicBuilder: React.FC = () => {
    const [ questionnaireList, setQuestionnaireList ]         = useState<QuestionnaireLogicPage[]>([]);
    const [ categoryList, setCategoryList ]                   = useState<Category[]>([]);
    const [ questionList, setQuestionList ]                   = useState<QuestionLogicPage[]>([]);
    const [selectedLink, setSelectedLink] = useState<SelectedQuestion | null>(null);
    const [ linkWorkshop, setLinkWorkshop ]                   = useState(false);
    const [ selectedQuestionnaire, setSelectedQuestionnaire ] = useState<QuestionnaireLogicPage>({ id: 0, title: "" });
    const [ expandedQuestions, setExpandedQuestions ]         = useState<boolean[]>([])


    // fetch name/ID of questionnaires from the database on page load
    useEffect(() => {
      setQuestionList([]);
      
      const getDatabaseInformation = async () => {
        LogicbuilderService.logicbuilderGetquestionnairesRetrieve()
        .then(response => {
          setQuestionnaireList(response)
        })
        .catch(error => {
          console.log(error);
        })
      }

      getDatabaseInformation();
    }, []);


    return (
      <>
          <h4>Workout Logic Configuration</h4>
          <CQuestionnaireSelection 
            questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
            categoryList={categoryList} setCategoryList={setCategoryList}
            questionList={questionList} setQuestionList={setQuestionList} 
            selectedLink={selectedLink} setSelectedLink={setSelectedLink}
            linkWorkshop={linkWorkshop} setLinkWorkshop={setLinkWorkshop}
            selectedQuestionnaire={selectedQuestionnaire} setSelectedQuestionnaire={setSelectedQuestionnaire}
            expandedQuestions={expandedQuestions} setExpandedQuestions={setExpandedQuestions}
          />


      </>
    );
};

export default LogicBuilder;