import { Console } from "console";
import React, { ButtonHTMLAttributes, ChangeEvent, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
//import QuestionnaireBuilder from "./QuestionnaireBuilder";

// Questionnaire Data Class, the purpose of this is to create a names object with thiese fields.
class QuestionnaireData {
  name: string;
  questions: string;
  status: string;
  responses: string;

  constructor (name: string, questions: string, status: string, responses: string) {
    this.name = name;
    this.questions = questions;
    this.status = status;
    this.responses = responses;
  }
}

type Question = {
  id: string;
  type: string;
  question: string;
  answers: string[];
}

type Questionnaire = {
  id: string;
  name: string;
  questions: Question[];
}

// This is acting like an API call response for the list of questionnaires in the database
let questionnaireAPIResponse = [
  new QuestionnaireData("Fitness Goal Assessment", "12", "Active", "1005"),
  new QuestionnaireData("Health History Form", "15", "Active", "52"),
  new QuestionnaireData("Workout Preference", "13", "Draft", "135"),
  new QuestionnaireData("Nutrition Assessment", "10", "Template", "521"),
  new QuestionnaireData("Workout Preference", "9", "Active", "135"),
  new QuestionnaireData("Nutrition Assessment", "20", "Active", "125")
]

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
let questionAPIResponse = [
  {
    id: "123",
    type: "multichoice",
    question: "What is your name?",
    answers: [
    "Ronak",
    "Joshua"
    ],
  }, {
    id: "321",
    type: "text",
    question: "What are you looking to get out of this?",
    answers: []
  }
];

// MAIN FUNCTION
const QuestionnaireBuilder: React.FC = () => {

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [questions, setQuestions] = useState(questionAPIResponse);
  const [questionnaireVisibility, setQuestionnaireVisibility] = useState("All");
  const [filter, setFilter] = useState(new RegExp(`.*`));
  const [questionnaireSelection, setQuestionnaireSelection] = useState(questionnaireAPIResponse);
  const [selectedOption, setSelectedOption] = useState("");
  const [questionForms, setQuestionForms] = useState({ id: "", type: "multichoice", question: "", answers: ["", ""] });
  const [questionnaireWorkshop, setQuestionnaireWorkshop] = useState("");
  const [currentQuestionnaire, setCurrentQuestionnaire] = useState<Questionnaire>({ id: "", name: "", questions: []});
  const [questionIsSelected, setQuestionIsSelected] = useState(false);

  // Logic to determine if we show the questionnaire list, or the questionnaire workshop
  const questionnaireSection = ()  => {
    if (questionnaireWorkshop === "") {
      return (
        <>
          {recentQuestionnairesSection()}
          {filteredQuestionaireSection()}
        </>
      )
    }
    else {
      return (
        <>
          {questionnaireWorkshopView()}
        </>
      )
    }
  }

  // The Questionnaire Cards
  const recentQuestionnairesSection = () =>{
    return (
      <div style={{display: "flex", flexDirection: "column"}}>
        <h4 style={{display: "flex", justifyContent: "left"}}>Recent Questionnaires</h4>
        <div style={{display: "flex", flexDirection: "row"}}>
          {questionnaireAPIResponse.map((questionnaire, index) => 
            {
              if (index >= 4) return;
              
              return  (
                <div style={{width: "200px", height: "225px", backgroundColor: "lightgrey", borderRadius: "15px", overflow: "hidden", margin: "5px", padding: "10px"}}>
                  <h3>{questionnaire.name}</h3>
                  <p>{questionnaire.questions} questions - {questionnaire.status} - {questionnaire.responses} responses</p>
                  <button>
                    Edit
                  </button>
                  <button>
                    Preview
                  </button>
                </div>
              )
            }
        )}
        </div>
      </div>
    )
  }

  // Updates the filter every time they type in the form
  const changeFilter = (value: ChangeEvent<HTMLInputElement>) => {
    setFilter(new RegExp(`.*${value.target.value.toLowerCase()}.*`));
  }

  // Updates the filterable list of questionnaires depending on which button they click
  useEffect(() => {
    const questionnaires = [];
    for (let i = 0; i < questionnaireAPIResponse.length; i++) {
      if (questionnaireAPIResponse[i].status === questionnaireVisibility || questionnaireVisibility === "All") {
        questionnaires.push(questionnaireAPIResponse[i]);
      }
    }
    setQuestionnaireSelection(questionnaires);
  },[questionnaireVisibility, questionnaireAPIResponse]);

  // Shows the list of filterable questionnaires
  const filteredQuestionaireSection = () => {
    let count = 0;
    return (
      <div style={{display: "flex", flexDirection: "column"}}>
        <div style={{display: "flex"}}>
          <button onClick={() => setQuestionnaireVisibility("All")} >All Questionnaires</button>
          <button onClick={() => setQuestionnaireVisibility("Template")}>Templates</button>
          <button onClick={() => setQuestionnaireVisibility("Active")}>Published</button>
          <button onClick={() => setQuestionnaireVisibility("Draft")}>Drafts</button>
          <p>Filter</p>
          <input onChange={changeFilter}></input>
          <button onClick={() => setQuestionnaireWorkshop("yes")}>Create New</button>
        </div>
        <h4 style={{display: "flex", justifyContent: "left"}}>{questionnaireVisibility} Questionnaires</h4>
        <div style={{display: "flex", flexDirection: "column"}}>
          {questionnaireSelection.map((questionnaire) => 
            {
              // Dont populate with items that dont match the filter
              if (!filter.test(questionnaire.name.toLowerCase())) return;
              // Only populate 5 items
              if (count >= 5) return;

              count++;
              return (
                <div style={{display: "flex", justifyContent: "left", flexDirection: "row", width: "fit-content", height: "35px", backgroundColor: "lightgrey", margin: "5px"}}>
                  <p style={{display: "flex", justifyContent: "left",width: "250px", margin: "5px"}}>{questionnaire.name}</p>
                  <p style={{display: "flex", justifyContent: "left", width: "140px", margin: "5px"}}>{questionnaire.questions} questions</p>
                  <p style={{display: "flex", justifyContent: "left", width: "140px", margin: "5px"}}>{questionnaire.status}</p>
                  <p style={{display: "flex", justifyContent: "left", width: "140px", margin: "5px"}}>{questionnaire.responses} responses</p>
                  <button>
                    Edit
                  </button>
                  <button>
                    Preview
                  </button>
                </div>
              )
            }
          )}
        </div>
      </div>
    )
  }

  // Update the questionnaire form fields when we open the workshop view.
  useEffect(() => {
    setCurrentQuestionnaire({ id: "", name: "", questions: []});
    setSelectedOption("multichoice");
  },[questionnaireWorkshop]);
  
  // THis is the view that lets you create a new questionnaire or modify a current one
  const questionnaireWorkshopView = () => {
    return (
      <div style={{display: "flex", flexDirection: "column", justifyContent: "left"}}>
        {/* Updates the Questionnaire Title and input field*/}
        <input style={{width: "425px"}} placeholder="Questionnaire Title" onChange={(value) => setCurrentQuestionnaire({...currentQuestionnaire, name: value.target.value})} />
        <div style={{display: "flex", flexDirection: "row", justifyContent: "left"}}>
          {currentQuestionnaire.questions.map((question, index) => (
            <>
              <div style={{borderStyle: "bold", borderColor: "black"}}>
                <p>Type: {question.type}</p>
                <p>Question: {question.question}</p>
                <p># of Answers: {question.answers.length}</p>
                <br/>
              </div>
              <button onClick={() => removeFromQuestionnaire(question, index)}>X</button>
            </>
            )
            )}
        </div>
        <div style={{display: "flex", flexDirection: "row"}}>
          <button style={{width: "415px"}} onClick={() => createQuestionnaire()}> Create Questionnaire</button>
          <button style={{width: "415px"}} onClick={() => cancelQuestionnaire()}> Cancel/Discard</button>
        </div>

      </div>
    )
  }

  // Finalize and create the questionnaire
  const createQuestionnaire = () => {
    if (currentQuestionnaire.questions.length < 8 || currentQuestionnaire.name == "") {

      alert("You must have at least 8 questions and name the questionnaire!");
    }

    alert("Questionnaire Created Successfully!");
    setQuestionnaires([ ...questionnaires, currentQuestionnaire ]);
    setCurrentQuestionnaire({ id: "", name: "", questions: []});
    setQuestionnaireWorkshop("");
    // SEND API CALL TO ADD A NEW QUESTIONNAIRE TO DB
  }

  // CAncel Questionnaire creation
  const cancelQuestionnaire = () => {
    setCurrentQuestionnaire({ id: "", name: "", questions: []});
    setQuestionnaireWorkshop("");
  }

  // Question Section - These are the Question Type Cards
  const addQuestionSection = () => {
    return(
      <div style={{display: "flex", flexDirection: "column"}}>
        <h4 style={{display: "flex", justifyContent: "left"}}>Question Types</h4>
        <div style={{display: "flex", flexDirection: "row"}}>
          {questionTypesAPIResponse.map((type, index) => 
            {
              if (index >= 4) return;
              
              // Create the Cards
              return  (
                <div style={{width: "200px", height: "225px", backgroundColor: "lightgrey", borderRadius: "15px", overflow: "hidden", margin: "5px", padding: "10px"}}>
                  <h3>{type.name}</h3>
                  <p>Used in {type.usedInCount} questionnaires</p>
                  <button onClick={() => { 
                    setSelectedOption(type.value);
                    }}>
                    Add
                  </button>
                </div>
              )
            }
          )}
        </div>
        {questionSelection()}
      </div>
    )
  }

  // Do this everytime I choose a question card
  // This clears the forms and un selects any selected questions.
  useEffect(() => {
    setQuestionIsSelected(false);
    setQuestionForms({id: "", type: selectedOption, question: "", answers: ["", ""]});
    console.log(selectedOption);
  },[selectedOption] );

  // Print off the questions array for debugging
  const showQuestions = () => {
    if (questions.length === 0) {
      return <></>;
    }
    return questions.map((question, index) => (
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

  // Updates the formData data everytime they type in a form field
  const changeFormData = (value: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionForms({ ...questionForms, [value.target.name]: value.target.value });
  }

  // Updates the formData answers every time a answer field is added or removed
  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...questionForms.answers];
    newAnswers[index] = value;
    setQuestionForms({ ...questionForms, answers: newAnswers });
  }
  
  // Adds a new answer field to the formData.answers array
  const addAnswerField = () => {
    setQuestionForms({ ...questionForms, answers: [ ...questionForms.answers, ""] })
  }

  // Removes an answer field from ther formData.answers array based on the given index
  const removeAnswerField = async (index: number) => {
    if (questionForms.answers.length < 3) {
      return;
    }
    const updatedAnswers = [...questionForms.answers];
    updatedAnswers.splice(index, 1);
    setQuestionForms({ ...questionForms, answers: updatedAnswers })
  }

  // Adds the completed question to the questions array.
  // This will eventually be changed to adding it to the database.
  const addQuestion = () => {
    if (questionForms.question.trim() == "") {
      alert("You must enter a question first!");
      return;
    }

    const id = (Math.random() * 999999).toString();
    questionForms.id = id;

    setQuestions([ ...questions, questionForms ]);
    setQuestionForms({ id: "", type: "", question: "", answers: [""] });
  }


  // which question types are we working with??
  // creates those form fields and shows a list of them
  const questionSelection = () => {
    if (selectedOption === "") return <></>;

    return (
      <div style={{display: "flex", flexDirection: "row", gap: "5px"}}>
        <div style={{display: "flex", flexDirection: "column", gap: "5px", justifyContent: "left"}}>
          <div style={{display: "flex", flexDirection: "row", gap: "5px"}}>
            <h4 style={{display: "flex", justifyContent: "left"}}>Add {selectedOption} Question</h4>
            <button style={{display: "inline", maxWidth: "100"}} onClick={() => setSelectedOption("")}>Cancel</button>
          </div>
          <input onChange={changeFormData} name="question" style={{display: "inline", width: "530px"}} type="text" placeholder="Question" value={questionForms.question} />
          
          {// This checks if the button clicked was a checkbox  or multichoice type question card.
            (selectedOption === "checkbox" || selectedOption === "multichoice") && (
              <>
                <button style={{width: "200px"}} onClick={addAnswerField}>Add Answer</button>
                {questionForms.answers.map((answer, index) =>(
                  <div style={{display: "flex", flexDirection:"row"}} key={index}>
                    <input onChange={(e) => updateAnswer(index, e.target.value)} name="answer" style={{display: "inline", maxWidth: "200px"}} type="text" placeholder="Answer" value={questionForms.answers[index]} />
                    <button onClick={async () => removeAnswerField(index)}>X</button>
                  </div>
                ))}
              </>
            )
          }

          <button style={{display: "inline", maxWidth: "200px"}} onClick={async () => addQuestion()}>Add Question</button>
        </div>

        <div style={{height: "250px", width: "300px", gap: "5px", justifyContent: "right", borderStyle: "solid",borderColor:"black"}}>
          <table>
            <thead>
              <tr>
                <th>Question</th>
              </tr>
            </thead>
            <tbody style={{overflowY: "auto"}}>
              {questions.map(question => {
                if (question.type !== selectedOption) return;
                return (
                  <tr className="questionRow" onClick={() => selectQuestion(question)} style={{height: "20px",backgroundColor: questionForms.id === question.id ? "grey" : "white"}}>
                    <td style={{justifyContent: "left"}}>{question.question}</td>
                  </tr>
                );
              })}

            </tbody>
          </table>
          {questionnaireWorkshop !== "" ? <button onClick={() => addToQuestionnaire()}>Add to Questionnaire</button> : <></>}
        </div>

      </div>
    )

  }

  // Helper Function to click on a question item from the list.
  const selectQuestion = (question: {id: string; type: string; question: string; answers: string[]}) => {
    if (questionForms.id === question.id) setQuestionIsSelected(false);
    else setQuestionIsSelected(true);

    setQuestionForms(current => 
      current.id === question.id  ?  {id: "", type: selectedOption, question: "", answers: ["", ""]} : question);
  }
  
  // Add the selected question to the current Questionnaire
  const addToQuestionnaire = () => {
    if (!questionIsSelected) return;

    setCurrentQuestionnaire({ ...currentQuestionnaire, questions: [...currentQuestionnaire.questions, questionForms]});
    setQuestionIsSelected(false);
    setQuestionForms({ id: "", type: "", question: "", answers: [""] });
  }

  // Remove a question from the current Questionnaire
  const removeFromQuestionnaire = (question: Question, index: number) => {
    const updatedQuestions = [ ...currentQuestionnaire.questions ];
    updatedQuestions.splice(index, 1);
    setCurrentQuestionnaire({ ...currentQuestionnaire, questions: updatedQuestions })
  }


  return (
    <>
      <h1>Questionnaire Builder</h1>
      {questionnaireSection()}
      {addQuestionSection()}
      <hr/>

    </>
  );
}

export default QuestionnaireBuilder;
