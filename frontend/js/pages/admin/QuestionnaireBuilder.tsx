import { Console } from "console";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";


const QuestionnaireBuilder: React.FC = () => {
  // Holds the CURRENT question data
  const [formData, setFormData] = useState({ question: "", answers: [""] });
  // Contains the state of what type of question is being added
  const [selectedOption, setSelectedOption] = useState("text");
  
  // These are placeholder until I figure out how to do database things
  const [questions, setQuestions] = useState([formData]);
  const questionnaires = [];

  // Variable that is assigned the add question JSX code
  let questionForms;
  
  // Print off the questions array for debugging
  const showQuestions = () => {
    return questions.map((question, index) => (
      <div>
        <p >Question {index+1}: {question.question}</p>
        {question.answers.map((answer, answerIndex) => (
          <p key={answerIndex}>Answer {answerIndex+1}: {answer}</p>
        ))}
        <hr/>
      </div>
    ))};

  // Updates the formData data everytime they type in a form field
  const changeFormData = (value: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [value.target.name]: value.target.value });
  }

  // Updates the formData answers every time a answer field is added or removed
  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });
  };
  
  // changes the page state when a dropdown menu item is selected
  const changeDropdown = async (value: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(value.target.value);
  }

  // Adds a new answer field to the formData.answers array
  const addAnswerField = () => {
    setFormData({ ...formData, answers: [ ...formData.answers, ""] })
  }

  // Removes an answer field from ther formData.answers array based on the given index
  const removeAnswerField = async (index: number) => {
    if (formData.answers.length < 2) {
      return;
    }
    const updatedAnswers = [...formData.answers];
    updatedAnswers.splice(index, 1);
    setFormData({ ...formData, answers: updatedAnswers })
  }

  // Adds the completed question to the questions array.
  // This will eventually be changed to adding it to the database.
  const addQuestion = () => {
    if (formData.question.trim() == "") return;

    setQuestions([ ...questions, formData ]);
    setFormData({ question: "", answers: [""] });
  }; 

  // Switch-Case to determine which add-question fields should be showm
  // Sets the JSX code to questionForms variabel
  switch (selectedOption) {
    case "slider":
    case "text":
      questionForms = 
      <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
        <input onChange={changeFormData} name="question" style={{display: "inline", maxWidth: "200px"}} type="text" placeholder="Question" value={formData.question} />
        <button style={{display: "inline", maxWidth: "200px"}} onClick={async () => addQuestion()}>Add Question</button>
      </div>;
      break;
    
    case "checkbox":
    case "multichoice":
      questionForms = 
        <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
          <button onClick={addAnswerField}>Add Answer</button>
          <input onChange={changeFormData} name="question" style={{display: "inline", maxWidth: "200px"}} type="text" placeholder="Question" value={formData.question} />
          
          {formData.answers.map((answer, index) =>(
            <div style={{display: "flex", flexDirection:"row"}} key={index}>
              <input onChange={(e) => updateAnswer(index, e.target.value)} name="answer" style={{display: "inline", maxWidth: "200px"}} type="text" placeholder="Answer" value={formData.answers[index]} />
              <button onClick={async () => removeAnswerField(index)}>X</button>
            </div>
          ))}
          <button style={{display: "inline", maxWidth: "200px"}} onClick={async () => addQuestion()}>Add Question</button>
        </div>;
        break;
  }


  return (
    <>
      <h1>Questionnaire Builder</h1>
      <select style={{display: "inline"}} value={selectedOption} onChange={changeDropdown}>
        <option value="text">Text Input</option>
        <option value="multichoice">Multiple Choice</option>
        <option value="slider">Slider Value</option>
        <option value="checkbox">Checkbox</option>
      </select>
      {questionForms}
      <hr/>
      <h3>Questions List</h3>
      {showQuestions()}

    </>
  );
}

export default QuestionnaireBuilder;
