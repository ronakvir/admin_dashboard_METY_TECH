import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import ComponentRecents from "./ComponentRecents";
import ComponentList from "./ComponentList";
import ComponentWorkshop from "./ComponentWorkshop";
import ComponentQuestions from "./ComponentQuestions";
import ComponentPreview from "./ComponentPreview";
import { QuestionnaireFull, QuestionFull } from "../../../api/types.gen";
import { QuestionnairebuilderService } from "../../../api/services.gen";

export interface QuestionnaireStates {
  questionnaires: QuestionnaireFull[]; setQuestionnaires: Dispatch<SetStateAction<QuestionnaireFull[]>>;
  questions: QuestionFull[]; setQuestions: Dispatch<SetStateAction<QuestionFull[]>>;
  questionnaireVisibility: string; setQuestionnaireVisibility: Dispatch<SetStateAction<string>>;
  questionnaireList: QuestionnaireFull[]; setQuestionnaireList: Dispatch<SetStateAction<QuestionnaireFull[]>>;
  questionType: string; setQuestionType: Dispatch<SetStateAction<string>>;
  questionForms: QuestionFull; setQuestionForms: Dispatch<SetStateAction<QuestionFull>>;
  questionnaireWorkshop: string; setQuestionnaireWorkshop: Dispatch<SetStateAction<string>>;
  currentQuestionnaire: QuestionnaireFull; setCurrentQuestionnaire: Dispatch<SetStateAction<QuestionnaireFull>>;
  questionIsSelected: boolean; setQuestionIsSelected: Dispatch<SetStateAction<boolean>>;
  previewQuestionnaire: boolean; setPreviewQuestionnaire: Dispatch<SetStateAction<boolean>>;
  recentQuestionnaires: QuestionnaireFull[]; setRecentQuestionnaires: Dispatch<SetStateAction<QuestionnaireFull[]>>;
}

const QuestionnaireBuilder: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireFull[]>([]);
  const [questions, setQuestions] = useState<QuestionFull[]>([]);
  const [questionnaireVisibility, setQuestionnaireVisibility] = useState("All");
  const [questionnaireList, setQuestionnaireList] = useState<QuestionnaireFull[]>([]);
  const [questionType, setQuestionType] = useState("");
  const [questionForms, setQuestionForms] = useState<QuestionFull>({
    id: 0, type: "multichoice", text: "", answers: [{ id: 0, text: "" }, { id: 0, text: "" }]
  });
  const [questionnaireWorkshop, setQuestionnaireWorkshop] = useState("");
  const [currentQuestionnaire, setCurrentQuestionnaire] = useState<QuestionnaireFull>({
    id: 0, title: "", status: "", started: 0, completed: 0,
    last_modified: new Date().toISOString(), questions: []
  });
  const [questionIsSelected, setQuestionIsSelected] = useState(false);
  const [previewQuestionnaire, setPreviewQuestionnaire] = useState(false);
  const [recentQuestionnaires, setRecentQuestionnaires] = useState<QuestionnaireFull[]>([]);

  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  useEffect(() => {
    setQuestionIsSelected(false);
    setQuestionForms({ id: 0, type: questionType, text: "", answers: [{ id: 0, text: "" }, { id: 0, text: "" }] });
  }, [questionType]);

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
  }, []);

  useEffect(() => {
    if (previewQuestionnaire) {
      setCurrentPreviewIndex(0);
    }
  }, [currentQuestionnaire.id, previewQuestionnaire]);

  const questionnaireSection = () => {
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
          <hr />
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
      );
    } else {
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
      );
    }
  };

  const progress = currentQuestionnaire.questions.length > 0
    ? ((currentPreviewIndex + 1) / currentQuestionnaire.questions.length) * 100
    : 0;

  return (
    !previewQuestionnaire ? (
      <>
        <h3>Questionnaire Builder</h3>
        <hr />
        {questionnaireSection()}
        <hr />
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
        <hr />
      </>
    ) : (
      <>
        <h3>Questionnaire Preview</h3>
        <hr />

        {/* Question indicator */}
        {currentQuestionnaire.questions.length > 0 && (
          <div style={{ marginBottom: "0.5rem" }}>
            Question {currentPreviewIndex + 1} of {currentQuestionnaire.questions.length}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ width: "100%", backgroundColor: "#eee", borderRadius: "8px", marginBottom: "1rem" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "20px",
              backgroundColor: "#4caf50",
              borderRadius: "8px",
              transition: "width 0.3s ease"
            }}
          />
        </div>

        {/* Show one question at a time */}
        {currentQuestionnaire.questions.length > 0 && (
          <ComponentPreview
            questionnaires={questionnaires} setQuestionnaires={setQuestionnaires}
            questions={questions} setQuestions={setQuestions}
            questionnaireVisibility={questionnaireVisibility} setQuestionnaireVisibility={setQuestionnaireVisibility}
            questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
            questionType={questionType} setQuestionType={setQuestionType}
            questionForms={questionForms} setQuestionForms={setQuestionForms}
            questionnaireWorkshop={questionnaireWorkshop} setQuestionnaireWorkshop={setQuestionnaireWorkshop}
            currentQuestionnaire={{
              ...currentQuestionnaire,
              questions: [currentQuestionnaire.questions[currentPreviewIndex]]
            }}
            setCurrentQuestionnaire={setCurrentQuestionnaire}
            questionIsSelected={questionIsSelected} setQuestionIsSelected={setQuestionIsSelected}
            previewQuestionnaire={previewQuestionnaire} setPreviewQuestionnaire={setPreviewQuestionnaire}
            recentQuestionnaires={recentQuestionnaires} setRecentQuestionnaires={setRecentQuestionnaires}
          />
        )}

{/* Navigation buttons */}
<div style={{ marginTop: "1rem", display: "flex", gap: "12px", justifyContent: "flex-start" }}>
  <button
    onClick={() => setCurrentPreviewIndex(i => Math.max(i - 1, 0))}
    disabled={currentPreviewIndex === 0}
    style={{
      backgroundColor: "white",
      color: "black",
      border: "2px solid #007bff",
      borderRadius: "4px",
      padding: "6px 16px",
      cursor: currentPreviewIndex === 0 ? "not-allowed" : "pointer",
      fontSize: "14px",
      transition: "all 0.2s ease"
    }}
    onMouseEnter={e => { if(currentPreviewIndex > 0) (e.target as HTMLButtonElement).style.opacity = "0.85"; }}
    onMouseLeave={e => { (e.target as HTMLButtonElement).style.opacity = "1"; }}
  >
    Previous
  </button>
  <button
    onClick={() => setCurrentPreviewIndex(i => Math.min(i + 1, currentQuestionnaire.questions.length - 1))}
    disabled={currentPreviewIndex === currentQuestionnaire.questions.length - 1}
    style={{
      backgroundColor: "white",
      color: "black",
      border: "2px solid #007bff",
      borderRadius: "4px",
      padding: "6px 16px",
      cursor: currentPreviewIndex === currentQuestionnaire.questions.length - 1 ? "not-allowed" : "pointer",
      fontSize: "14px",
      transition: "all 0.2s ease"
    }}
    onMouseEnter={e => { if(currentPreviewIndex < currentQuestionnaire.questions.length - 1) (e.target as HTMLButtonElement).style.opacity = "0.85"; }}
    onMouseLeave={e => { (e.target as HTMLButtonElement).style.opacity = "1"; }}
  >
    Next
  </button>
</div>


        <hr />
      </>
    )
  );
};

export default QuestionnaireBuilder;
