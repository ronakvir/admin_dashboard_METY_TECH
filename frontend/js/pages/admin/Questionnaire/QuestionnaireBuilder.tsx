import { Console } from "console";
import React, { ButtonHTMLAttributes, ChangeEvent, createContext, Dispatch, SetStateAction, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ComponentRecents from "./ComponentRecents";
import ComponentList from "./ComponentList";
import ComponentWorkshop from "./ComponentWorkshop";
import ComponentQuestions from "./ComponentQuestions";
import ComponentPreview from "./ComponentPreview";
import { answerTable, question_questionnaireTable, questionnaireTable, questionTable } from "../../database";

export type Question = {
  id: number;
  type: string;
  question: string;
  answers: {
    id: number;
    answer: string;
  }[];
}

export type Questionnaire = {
  id: number;
  name: string;
  status: string;
  started: number;
  completed: number;
  lastModified: string;
  questions: number[];
}

export interface QuestionnaireStates {
    questionnaires:             Questionnaire[];        setQuestionnaires:          Dispatch<SetStateAction<Questionnaire[]>>;
    questions:                  Map<number, Question>;  setQuestions:               Dispatch<SetStateAction<Map<number, Question>>>;
    questionnaireVisibility:    string;                 setQuestionnaireVisibility: Dispatch<SetStateAction<string>>;
    questionnaireList:          Questionnaire[];        setQuestionnaireList:       Dispatch<SetStateAction<Questionnaire[]>>;
    questionType:               string;                 setQuestionType:            Dispatch<SetStateAction<string>>; 
    questionForms:              Question;               setQuestionForms:           Dispatch<SetStateAction<Question>>;
    questionnaireWorkshop:      string;                 setQuestionnaireWorkshop:   Dispatch<SetStateAction<string>>;
    currentQuestionnaire:       Questionnaire;          setCurrentQuestionnaire:    Dispatch<SetStateAction<Questionnaire>>;
    questionIsSelected:         boolean;                setQuestionIsSelected:      Dispatch<SetStateAction<boolean>>;
    previewQuestionnaire:       boolean;                setPreviewQuestionnaire:    Dispatch<SetStateAction<boolean>>; 
    recentQuestionnaires:       Questionnaire[];        setRecentQuestionnaires:    Dispatch<SetStateAction<Questionnaire[]>>; 
}


// MAIN FUNCTION
const QuestionnaireBuilder: React.FC = () => {
  const [questionnaires,          setQuestionnaires] = useState<Questionnaire[]>([]);
  const [questions,               setQuestions] = useState<Map<number, Question>>(new Map<number, Question>());
  const [questionnaireVisibility, setQuestionnaireVisibility] = useState("All");
  const [questionnaireList,       setQuestionnaireList] = useState<Questionnaire[]>([]);
  const [questionType,            setQuestionType] = useState("");
  const [questionForms,           setQuestionForms] = useState<Question>({ id: 0, type: "multichoice", question: "", answers: [{id: 0, answer: ""}, {id: 0, answer: ""}] });
  const [questionnaireWorkshop,   setQuestionnaireWorkshop] = useState("");
  const [currentQuestionnaire,    setCurrentQuestionnaire] = useState<Questionnaire>({ id: 0, name: "", status: "", started: 0, completed: 0, lastModified: new Date().toISOString(), questions: []});
  const [questionIsSelected,      setQuestionIsSelected] = useState(false);
  const [previewQuestionnaire,    setPreviewQuestionnaire] = useState(false);
  const [recentQuestionnaires,    setRecentQuestionnaires] = useState<Questionnaire[]>([]);
  
  // Do this everytime I choose a question card
  // This clears the forms and un selects any selected questions.
  useEffect(() => {
    setQuestionIsSelected(false);
    setQuestionForms({id: 0, type: questionType, question: "", answers: [{id: 0, answer: ""}, {id: 0, answer: ""}]});

  },[questionType] );

  useEffect(() => {
    const tempQuestions = new Map<number, Question>();

    function buildQuestions(): void {
      for (const [questionID, qRow] of questionTable.entries()) {
        const answers = Array.from(answerTable.entries())
          .filter(([_, a]) => a.questionID === questionID)
          .map(([answerID, a]) => ({
            id: answerID,
            answer: a.text
          }));
    
        const question: Question = {
          id: questionID,
          type: qRow.type,
          question: qRow.question,
          answers
        };
    
        tempQuestions.set(questionID, question);
      }
      setQuestions(tempQuestions);
    }

    function getAllQuestionnaires(): Questionnaire[] {
      const tempQuestionnaires: Questionnaire[] = [];
    
      for (const [questionnaireID, qnRow] of questionnaireTable.entries()) {
        const questionIDs = Array.from(question_questionnaireTable.values())
          .filter(rel => rel.questionnaireID === questionnaireID)
          .map(rel => rel.questionID);
    
        const questionnaire: Questionnaire = {
          id: questionnaireID,
          name: qnRow.name,
          status: qnRow.status,
          started: qnRow.started, 
          completed: qnRow.completed, 
          lastModified: qnRow.lastModified,
          questions: questionIDs
        };
    
        tempQuestionnaires.push(questionnaire);
      }
      setQuestionnaires(tempQuestionnaires);
      
      return questionnaires;
    }

    getAllQuestionnaires();
    buildQuestions();
  },[] );

  // Print off the questions array for debugging
  const showQuestions = () => {
    if (questions.size === 0) return <></>;

    const questionsArray = Array.from(questions);
    return questionsArray.map(([id, question], index) => (
      <div>
        <p>Type {index+1}: {question.type}</p>
        <p>Question {index+1}: {question.question}</p>
        {question.answers.map((answer, answerIndex) => (
          <p key={answerIndex}>Answer {answerIndex+1}: {answer.answer}</p>
        ))}
        <hr/>
      </div>
    ))
  };

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
