import { Console } from "console";
import React, { ButtonHTMLAttributes, ChangeEvent, createContext, Dispatch, SetStateAction, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ComponentRecents from "./ComponentRecents";
import ComponentList from "./ComponentList";
import ComponentWorkshop from "./ComponentWorkshop";
import ComponentQuestions from "./ComponentQuestions";
import ComponentPreview from "./ComponentPreview";
import { answerTable, question_questionnaireTable, questionnaireTable, questionTable } from "../../database";
import { QuestionnaireFull, QuestionFull } from "../../../api/types.gen";
import { QuestionnairebuilderService } from "../../../api/services.gen";



export interface QuestionnaireStates {
    questionnaires:             QuestionnaireFull[];        setQuestionnaires:          Dispatch<SetStateAction<QuestionnaireFull[]>>;
    questions:                  QuestionFull[];  setQuestions:               Dispatch<SetStateAction<QuestionFull[]>>;
    questionnaireVisibility:    string;                 setQuestionnaireVisibility: Dispatch<SetStateAction<string>>;
    questionnaireList:          QuestionnaireFull[];        setQuestionnaireList:       Dispatch<SetStateAction<QuestionnaireFull[]>>;
    questionType:               string;                 setQuestionType:            Dispatch<SetStateAction<string>>; 
    questionForms:              QuestionFull;               setQuestionForms:           Dispatch<SetStateAction<QuestionFull>>;
    questionnaireWorkshop:      string;                 setQuestionnaireWorkshop:   Dispatch<SetStateAction<string>>;
    currentQuestionnaire:       QuestionnaireFull;          setCurrentQuestionnaire:    Dispatch<SetStateAction<QuestionnaireFull>>;
    questionIsSelected:         boolean;                setQuestionIsSelected:      Dispatch<SetStateAction<boolean>>;
    previewQuestionnaire:       boolean;                setPreviewQuestionnaire:    Dispatch<SetStateAction<boolean>>; 
    recentQuestionnaires:       QuestionnaireFull[];        setRecentQuestionnaires:    Dispatch<SetStateAction<QuestionnaireFull[]>>; 
}


// MAIN FUNCTION
const QuestionnaireBuilder: React.FC = () => {
  const [questionnaires,          setQuestionnaires] = useState<QuestionnaireFull[]>([]);
  const [questions,               setQuestions] = useState<QuestionFull[]>([]);
  const [questionnaireVisibility, setQuestionnaireVisibility] = useState("All");
  const [questionnaireList,       setQuestionnaireList] = useState<QuestionnaireFull[]>([]);
  const [questionType,            setQuestionType] = useState("");
  const [questionForms,           setQuestionForms] = useState<QuestionFull>({ id: 0, type: "multichoice", text: "", answers: [{id: 0, text: ""}, {id: 0, text: ""}] });
  const [questionnaireWorkshop,   setQuestionnaireWorkshop] = useState("");
  const [currentQuestionnaire,    setCurrentQuestionnaire] = useState<QuestionnaireFull>({ id: 0, title: "", status: "", started: 0, completed: 0, last_modified: new Date().toISOString(), questions: []});
  const [questionIsSelected,      setQuestionIsSelected] = useState(false);
  const [previewQuestionnaire,    setPreviewQuestionnaire] = useState(false);
  const [recentQuestionnaires,    setRecentQuestionnaires] = useState<QuestionnaireFull[]>([]);
  
  // Do this everytime I choose a question card
  // This clears the forms and un selects any selected questions.
  useEffect(() => {
    setQuestionIsSelected(false);
    setQuestionForms({id: 0, type: questionType, text: "", answers: [{id: 0, text: ""}, {id: 0, text: ""}]});

  },[questionType] );

  useEffect(() => {

    const getData = () => {
      QuestionnairebuilderService.questionnairebuilderGetquestionnairesRetrieve()
        .then( response => {
          setQuestionnaires(response);
        })
        .catch( error => console.log(error) )

      QuestionnairebuilderService.questionnairebuilderGetquestionsRetrieve()
        .then( response => {
          setQuestions(response);
        })
        .catch( error => console.log(error) )
    }

    getData();
  },[] );

  // Logic to determine if we show the questionnaire list, or the questionnaire workshop
  const questionnaireSection = ()  => {
    if (!questionnaireWorkshop) {
      return (
        <>
          <ComponentRecents 
            questionnaires={questionnaires} setQuestionnaires={setQuestionnaires}
            questions={questions} setQuestions={setQuestions}
            questionnaireVisibility={questionnaireVisibility} setQuestionnaireVisibility={setQuestionnaireVisibility} 
            questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
            questionType={questionType} setQuestionType={setQuestionType}
            questionForms={questionForms} setQuestionForms={setQuestionForms}
            questionnaireWorkshop={questionnaireWorkshop} setQuestionnaireWorkshop={setQuestionnaireWorkshop}
            currentQuestionnaire={currentQuestionnaire} setCurrentQuestionnaire={setCurrentQuestionnaire} 
            questionIsSelected={questionIsSelected} setQuestionIsSelected={setQuestionIsSelected}
            previewQuestionnaire={previewQuestionnaire} setPreviewQuestionnaire={setPreviewQuestionnaire}
            recentQuestionnaires={recentQuestionnaires} setRecentQuestionnaires={setRecentQuestionnaires}
          />
          <hr/>
          <ComponentList 
            questionnaires={questionnaires} setQuestionnaires={setQuestionnaires}
            questions={questions} setQuestions={setQuestions}
            questionnaireVisibility={questionnaireVisibility} setQuestionnaireVisibility={setQuestionnaireVisibility} 
            questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
            questionType={questionType} setQuestionType={setQuestionType}
            questionForms={questionForms} setQuestionForms={setQuestionForms}
            questionnaireWorkshop={questionnaireWorkshop} setQuestionnaireWorkshop={setQuestionnaireWorkshop}
            currentQuestionnaire={currentQuestionnaire} setCurrentQuestionnaire={setCurrentQuestionnaire} 
            questionIsSelected={questionIsSelected} setQuestionIsSelected={setQuestionIsSelected}
            previewQuestionnaire={previewQuestionnaire} setPreviewQuestionnaire={setPreviewQuestionnaire}
            recentQuestionnaires={recentQuestionnaires} setRecentQuestionnaires={setRecentQuestionnaires}
          />
        </>
      )
    }
    else {
      return (

        <ComponentWorkshop 
          questionnaires={questionnaires} setQuestionnaires={setQuestionnaires}
          questions={questions} setQuestions={setQuestions}
          questionnaireVisibility={questionnaireVisibility} setQuestionnaireVisibility={setQuestionnaireVisibility} 
          questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
          questionType={questionType} setQuestionType={setQuestionType}
          questionForms={questionForms} setQuestionForms={setQuestionForms}
          questionnaireWorkshop={questionnaireWorkshop} setQuestionnaireWorkshop={setQuestionnaireWorkshop}
          currentQuestionnaire={currentQuestionnaire} setCurrentQuestionnaire={setCurrentQuestionnaire} 
          questionIsSelected={questionIsSelected} setQuestionIsSelected={setQuestionIsSelected}
          previewQuestionnaire={previewQuestionnaire} setPreviewQuestionnaire={setPreviewQuestionnaire}
          recentQuestionnaires={recentQuestionnaires} setRecentQuestionnaires={setRecentQuestionnaires}
        />

      )
    }
  }

  return (
    !previewQuestionnaire ? (
      <>
        <h3>Questionnaire Builder</h3>
        <hr/>
        {questionnaireSection()}
        <hr/>
        <ComponentQuestions 
          questionnaires={questionnaires} setQuestionnaires={setQuestionnaires}
          questions={questions} setQuestions={setQuestions}
          questionnaireVisibility={questionnaireVisibility} setQuestionnaireVisibility={setQuestionnaireVisibility} 
          questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
          questionType={questionType} setQuestionType={setQuestionType}
          questionForms={questionForms} setQuestionForms={setQuestionForms}
          questionnaireWorkshop={questionnaireWorkshop} setQuestionnaireWorkshop={setQuestionnaireWorkshop}
          currentQuestionnaire={currentQuestionnaire} setCurrentQuestionnaire={setCurrentQuestionnaire} 
          questionIsSelected={questionIsSelected} setQuestionIsSelected={setQuestionIsSelected}
          previewQuestionnaire={previewQuestionnaire} setPreviewQuestionnaire={setPreviewQuestionnaire}
          recentQuestionnaires={recentQuestionnaires} setRecentQuestionnaires={setRecentQuestionnaires}
          />
        <hr/>
        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      </>
      ) : (
        <>
        <h3>Questionnaire Preview</h3>

        <hr/>
        <ComponentPreview 
          questionnaires={questionnaires} setQuestionnaires={setQuestionnaires}
          questions={questions} setQuestions={setQuestions}
          questionnaireVisibility={questionnaireVisibility} setQuestionnaireVisibility={setQuestionnaireVisibility} 
          questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
          questionType={questionType} setQuestionType={setQuestionType}
          questionForms={questionForms} setQuestionForms={setQuestionForms}
          questionnaireWorkshop={questionnaireWorkshop} setQuestionnaireWorkshop={setQuestionnaireWorkshop}
          currentQuestionnaire={currentQuestionnaire} setCurrentQuestionnaire={setCurrentQuestionnaire} 
          questionIsSelected={questionIsSelected} setQuestionIsSelected={setQuestionIsSelected}
          previewQuestionnaire={previewQuestionnaire} setPreviewQuestionnaire={setPreviewQuestionnaire}
          recentQuestionnaires={recentQuestionnaires} setRecentQuestionnaires={setRecentQuestionnaires}
        />
        <hr/>
        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      </>

      )
 
    
    
  );
}

export default QuestionnaireBuilder;
