import { Console } from "console";
import React, { ButtonHTMLAttributes, ChangeEvent, createContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ComponentRecents from "./ComponentRecents";
import ComponentList from "./ComponentList";
import ComponentWorkshop from "./ComponentWorkshop";
import ComponentQuestions from "./ComponentQuestions";
import ComponentPreview from "./ComponentPreview";


export type Question = {

  id: string;
  type: string;
  question: string;
  answers: string[];
}

export type Questionnaire = {
  id: string;
  name: string;
  status: string;
  responses: string;
  lastModified: string;
  questions: string[];
}




// This is acting like an API call response for the list of questions in the database
let questionTypesAPIResponse = [
  {
    name: "Multiple Choice", 
    value: "multichoice",
    usedInCount: "5"
  }, {
    name: "Checkbox",
    value: "checkbox",
    usedInCount: "10"
  }, {
    name: "Slider Scale", 
    value: "slider",
    usedInCount: "1"
  }, {
    name: "Text Input", 
    value: "text",
    usedInCount: "2"
  }
];

// This is acting like an API call response for the list of questions in the database
let questionAPIResponse = new Map([
  ["000001", { id: "000001", type: "multichoice", question: "Favorite color?", answers: ["Red", "Blue", "Green", "Yellow"] }],
  ["000002", { id: "000002", type: "checkbox", question: "Programming languages?", answers: ["JS", "Python", "Java", "C++", "Ruby"] }],
  ["000003", { id: "000003", type: "text", question: "Your career goals?", answers: [] }],
  ["000004", { id: "000004", type: "slider", question: "Job satisfaction?", answers: [] }],
  ["000005", { id: "000005", type: "multichoice", question: "Preferred transport?", answers: ["Car", "Bike", "Train", "Plane", "Walk"] }],
  ["000006", { id: "000006", type: "checkbox", question: "Hobbies?", answers: ["Reading", "Gaming", "Hiking", "Cooking"] }],
  ["000007", { id: "000007", type: "text", question: "Describe your weekend.", answers: [] }],
  ["000008", { id: "000008", type: "slider", question: "Work-life balance importance?", answers: [] }],
  ["000009", { id: "000009", type: "multichoice", question: "Favorite season?", answers: ["Spring", "Summer", "Autumn", "Winter"] }],
  ["000010", { id: "000010", type: "checkbox", question: "Languages spoken?", answers: ["English", "Spanish", "French", "German", "Chinese"] }],
  ["000011", { id: "000011", type: "text", question: "Your dream job?", answers: [] }],
  ["000012", { id: "000012", type: "slider", question: "How active are you?", answers: [] }],
  ["000013", { id: "000013", type: "multichoice", question: "Favorite beverage?", answers: ["Coffee", "Tea", "Soda", "Water", "Juice"] }],
  ["000014", { id: "000014", type: "checkbox", question: "Sports followed?", answers: ["Soccer", "Basketball", "Tennis", "Cricket"] }],
  ["000015", { id: "000015", type: "text", question: "What’s the last book you read?", answers: [] }],
  ["000016", { id: "000016", type: "slider", question: "Enjoy cooking?", answers: [] }],
  ["000017", { id: "000017", type: "multichoice", question: "Preferred music genre?", answers: ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop"] }],
  ["000018", { id: "000018", type: "checkbox", question: "Social media used?", answers: ["Facebook", "Twitter", "Instagram", "Reddit", "TikTok"] }],
  ["000019", { id: "000019", type: "text", question: "What do you want to learn this year?", answers: [] }],
  ["000020", { id: "000020", type: "slider", question: "Comfortable with public speaking?", answers: [] }],
  ["000021", { id: "000021", type: "multichoice", question: "Favorite movie genre?", answers: ["Action", "Comedy", "Drama", "Sci-Fi", "Horror"] }],
  ["000022", { id: "000022", type: "checkbox", question: "Outdoor activities?", answers: ["Camping", "Fishing", "Cycling", "Skiing", "Kayaking"] }],
  ["000023", { id: "000023", type: "text", question: "If you could live anywhere, where?", answers: [] }],
  ["000024", { id: "000024", type: "slider", question: "How tech-savvy are you?", answers: [] }],
  ["000025", { id: "000025", type: "multichoice", question: "Favorite meal?", answers: ["Breakfast", "Lunch", "Dinner", "Snacks"] }],
  ["000026", { id: "000026", type: "checkbox", question: "Board games you like?", answers: ["Chess", "Monopoly", "Scrabble", "Risk", "Catan"] }],
  ["000027", { id: "000027", type: "text", question: "One word to describe yourself?", answers: [] }],
  ["000028", { id: "000028", type: "slider", question: "Do you enjoy traveling?", answers: [] }],
  ["000029", { id: "000029", type: "multichoice", question: "Preferred pet?", answers: ["Dog", "Cat", "Bird", "Fish", "Reptile"] }],
  ["000030", { id: "000030", type: "checkbox", question: "Favorite travel destinations?", answers: ["Japan", "Italy", "France", "USA", "Australia"] }]
]);

// This is acting like an API call response for the list of questionnaires in the database
let questionnaireAPIResponse = [
  { id: "000001", name: "Survey on Preferences", status: "Active", responses: "132", lastModified: "2025-03-21", questions: ["000001", "000002", "000003", "000004", "000005", "000006", "000007", "000009", "000013"] },
  { id: "000002", name: "Work and Lifestyle Survey", status: "Template", responses: "98", lastModified: "2025-03-22", questions: ["000003", "000004", "000008", "000012", "000017", "000020", "000022", "000025"] },
  { id: "000003", name: "Technology and Hobbies", status: "Draft", responses: "245", lastModified: "2025-03-22", questions: ["000006", "000007", "000013", "000018", "000019", "000027", "000024"] },
  { id: "000004", name: "Travel and Preferences", status: "Template", responses: "76", lastModified: "2025-03-20", questions: ["000010", "000014", "000022", "000030", "000029", "000024", "000017", "000025"] },
  { id: "000005", name: "Personal Growth and Learning", status: "Draft", responses: "310", lastModified: "2025-03-19", questions: ["000011", "000015", "000019", "000027", "000024", "000016", "000013", "000028"] },
  { id: "000006", name: "Health and Lifestyle", status: "Template", responses: "189", lastModified: "2025-03-18", questions: ["000016", "000017", "000028", "000024", "000027", "000012", "000021"] },
  { id: "000007", name: "Career and Professional Development", status: "Active", responses: "54", lastModified: "2025-03-17", questions: ["000003", "000008", "000012", "000023", "000019", "000027", "000022"] },
  { id: "000008", name: "Social Media and Entertainment", status: "Active", responses: "221", lastModified: "2025-03-16", questions: ["000018", "000021", "000014", "000025", "000022", "000027", "000026", "000023"] },
  { id: "000009", name: "Outdoor Activities", status: "Active", responses: "402", lastModified: "2025-03-23", questions: ["000022", "000027", "000029", "000028", "000016", "000019", "000023", "000015"] },
  { id: "000010", name: "Food and Drink Preferences", status: "Active", responses: "167", lastModified: "2025-03-23", questions: ["000025", "000013", "000029", "000014", "000018", "000017", "000019", "000022"] }
];


// MAIN FUNCTION
const QuestionnaireBuilder: React.FC = () => {
  

  const [questionnaires,          setQuestionnaires] = useState(questionnaireAPIResponse);
  const [questions,               setQuestions] = useState<Map<string, Question>>(questionAPIResponse);
  const [questionnaireVisibility, setQuestionnaireVisibility] = useState("All");
  const [questionnaireList,       setQuestionnaireList] = useState(questionnaireAPIResponse);
  const [questionType,            setQuestionType] = useState("");
  const [questionForms,           setQuestionForms] = useState<Question>({ id: "", type: "multichoice", question: "", answers: ["", ""] });
  const [questionnaireWorkshop,   setQuestionnaireWorkshop] = useState("");
  const [currentQuestionnaire,    setCurrentQuestionnaire] = useState<Questionnaire>({ id: "", name: "", status: "", responses: "", lastModified: "", questions: []});
  const [questionIsSelected,      setQuestionIsSelected] = useState(false);
  const [previewQuestionnaire,    setPreviewQuestionnaire] = useState(false);



  // Do this everytime I choose a question card
  // This clears the forms and un selects any selected questions.
  useEffect(() => {
    setQuestionIsSelected(false);
    setQuestionForms({id: "", type: questionType, question: "", answers: ["", ""]});
    console.log(questionType);
  },[questionType] );

  // Print off the questions array for debugging
  const showQuestions = () => {
    if (questions.size === 0) return <></>;

    const questionsArray = Array.from(questions);
    return questionsArray.map(([id, question], index) => (
      <div>
        <p>Type {index+1}: {question.type}</p>
        <p>Question {index+1}: {question.question}</p>
        {question.answers.map((answer, answerIndex) => (
          <p key={answerIndex}>Answer {answerIndex+1}: {answer}</p>
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
          />
          <hr/>
          <ComponentList 
            questionnaires={questionnaires} setQuestionnaires={setQuestionnaires}
            questionnaireVisibility={questionnaireVisibility} setQuestionnaireVisibility={setQuestionnaireVisibility} 
            questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
            questionType={questionType} setQuestionType={setQuestionType}
            questionnaireWorkshop={questionnaireWorkshop} setQuestionnaireWorkshop={setQuestionnaireWorkshop}
            currentQuestionnaire={currentQuestionnaire} setCurrentQuestionnaire={setCurrentQuestionnaire} 
            previewQuestionnaire={previewQuestionnaire} setPreviewQuestionnaire={setPreviewQuestionnaire}
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
          />
        <hr/>
        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      </>

      )
 
    
    
  );
}

export default QuestionnaireBuilder;
