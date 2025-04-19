import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { answer_categoryMappingTable, answerTable, categoryTable, question_questionnaireTable, questionnaireTable, questionTable } from "../../database";
import CLogicWorkshop from "./CLogicWorkshop";
import CQuestionnaireSelection from "./CQuestionnaireSelection";


// This whole file can probably be split into 2 or 3 separate components.

// Main Datastructure we need to fetch from the database.
export type QuestionCategory = {
    id: number;
    question: string;
    answers: {
      id: number;
      value: string;
      categories: {
          id: number;
          value: string;
        } [];
      } [];
}

export type Questionnaire_ID_Name = {
  id: number;
  name: string;
}

export type SelectedQuestion = {
  id: number;
  question: string; 
  answer: { 
    id: number;
    value: string; 
    categories: {
      id: number;
      value: string; 
    } []
  } 
}

export interface LogicBuilderStates {
    questionnaireList:      Questionnaire_ID_Name[];                setQuestionnaireList:      Dispatch<SetStateAction<Questionnaire_ID_Name[]>>;
    categoryList:           { id: number, category: string }[];     setCategoryList:           Dispatch<SetStateAction<{ id: number, category: string }[]>>;
    questionList:           QuestionCategory[];                     setQuestionList:           Dispatch<SetStateAction<QuestionCategory[]>>;
    selectedLink:           SelectedQuestion;                       setSelectedLink:           Dispatch<SetStateAction<SelectedQuestion>>;
    linkWorkshop:           boolean;                                setLinkWorkshop:           Dispatch<SetStateAction<boolean>>; 
    selectedQuestionnaire:  Questionnaire_ID_Name;                  setSelectedQuestionnaire:  Dispatch<SetStateAction<Questionnaire_ID_Name>>;
    expandedQuestions:      boolean[];                              setExpandedQuestions:      Dispatch<SetStateAction<boolean[]>>;
}

const LogicBuilder: React.FC = () => {
    const [ questionnaireList, setQuestionnaireList ] = useState<Questionnaire_ID_Name[]>([]);
    const [ categoryList, setCategoryList ] = useState([{ id: 0, category: "" }]);
    const [ questionList, setQuestionList ] = useState<QuestionCategory[]>([]);
    const [ selectedLink, setSelectedLink ] = useState<SelectedQuestion>({} as SelectedQuestion);
    const [ linkWorkshop, setLinkWorkshop ] = useState(false);
    const [ selectedQuestionnaire, setSelectedQuestionnaire ] = useState<Questionnaire_ID_Name>({} as Questionnaire_ID_Name);
    const [ expandedQuestions, setExpandedQuestions ] = useState<boolean[]>([])


    // fetch name/ID of questionnaires from the database on page load
    useEffect(() => {
      setQuestionList([]);
      
      const getDatabaseInformation = async () => {
        const tempQuestionnaireList = [{ id: 0, name: "" }];
        tempQuestionnaireList.splice(0, tempQuestionnaireList.length);

        // API CALLS GO HERE:
        // API CALLS END HERE
        
        // TEMP CODE UNTIL BACKEND COMPLETE

        questionnaireTable.forEach((questionnaire, questionnaireID) =>{
          tempQuestionnaireList.push({ id: questionnaireID, name: questionnaire.name });
        })
        
        // END TEMP CODE

        setQuestionnaireList(tempQuestionnaireList);
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