import React, { useEffect, useState } from "react";
import { answer_categoryMappingTable, answerTable, categoryTable, question_questionnaireTable, questionnaireTable, questionTable } from "./database";

export type VideoData = {
  id: number;
  title: string;
  duration: string;
  
}



const LogicBuilder: React.FC = () => {
  const [ questionnaireList, setQuestionnaireList ] = useState([{id: 0, name: "" }]);
  const [ categoryList, setCategoryList ] = useState([{ id: 0, category: "" }]);
  const [ questionList, setQuestionList ] = useState([{ id: 0, question: { id: 0, value: "" }, answers: [{ id: 0, value: "", categories: [{ id: 0, value: "" }] }] }]);
  const [ selectedLink, setSelectedLink ] = useState({ id: 0, question: { id: 0, value: "" }, answer: { id: 0, value: "", categories: [{ id: 0, value: "" }] } });
  

  const [ linkWorkshop, setLinkWorkshop ] = useState(false);
  const [ selectedQuestionnaire, setSelectedQuestionnaire ] = useState({id: 0, name: "" });


  useEffect(() => {
    setQuestionList([]);
    // fetch all data from the database on page load
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



  function clearStates() {
    setQuestionList([]);
  }

  const selectQuestionnaire = async (questionnaireID: number) => {
    if (questionnaireID === 0 ){
      await setSelectedQuestionnaire({id: 0, name: "" })
      clearStates();
      return;
    }

    questionnaireList.some((questionnaire) => {
      if (questionnaireID === questionnaire.id) setSelectedQuestionnaire(questionnaire);
    })
    
    const tempCategoryList = [{ id: 0, category: "" }]
    tempCategoryList.splice(0, tempCategoryList.length);

    const tempQuestionList = [{ id: 0, question: { id: 0, value: "" }, answers: [{ id: 0, value: "", categories: [{ id: 0, value: "" }] }] }];
    tempQuestionList.splice(0, tempQuestionList.length);

    


    // API CALLS GO HERE:
    // API CALLS END HERE
    
    // TEMP CODE UNTIL BACKEND COMPLETE:

    // Populate the category state. We need to fetch all categories from the database
    categoryTable.forEach((category, categoryID) => { tempCategoryList.push({id: categoryID, category: category.category}); })
    setCategoryList(tempCategoryList);

    // Populate the questionList state. 
    // 1. We need to find all questions associated with the selected questionnaire, fetch it's id and value.
    // 2. On each question, we need to fetch every answer associated with it. this will be put in an array of it id, value, and categories linked to it.
    // 3. IMPORTANT: the categories mentioned above should be linked to both the answer id and the questionnaire we are working with. 
    question_questionnaireTable.forEach((relation, relationKey) => {
      const tempQuestion = { id: 0, question: { id: 0, value: "" }, answers: [{ id: 0, value: "", categories: [{ id: 0, value: "" }] }] };
      tempQuestion.answers.splice(0, tempQuestion.answers.length); // reset answers
      // Find the questionID
      if (questionnaireID === relation.questionnaireID) {
        console.log("TEST")
        const questionID = relation.questionID;

        
        tempQuestion.question.id = questionID;
        tempQuestion.question.value = questionTable.get(questionID)?.question as string;

        answerTable.forEach((answer, answerID) => {
          if (questionID === answer.questionID) {
            const tempAnswer = { id: 0, value: "", categories: [{ id: 0, value: "" }] };
            tempAnswer.categories.splice(0, tempAnswer.categories.length);
            tempAnswer.id = answerID;
            tempAnswer.value = answer.text;
            answer_categoryMappingTable.forEach((mapping, mappingKey) => {
              if (answerID === mapping.answerID && questionnaireID === mapping.questionnaireID) {
                if (categoryTable.has(mapping.categoryID)){
                  tempAnswer.categories.push({id: mapping.categoryID, value: categoryTable.get(mapping.categoryID)?.category });
                  tempQuestion.id = mappingKey;
                }
              }
            })
            tempQuestion.answers.push(tempAnswer);
          }
        })
      }
      tempQuestionList.push(tempQuestion);
    })
    setQuestionList(tempQuestionList);
    // END TEMP CODE
  }


  const clickEditLinkButton = (question, linkID, answer) => {
    const modifiedQuestion = { id: linkID, question: { id: question.question.id, value: question.question.value }, answer: answer }
    setSelectedLink(modifiedQuestion); 
    setLinkWorkshop(true);
    console.log(JSON.stringify(answer));
  }

  return (
    <>
        <h4>Workout Logic Configuration</h4>
        <h6>Select Questionnaire</h6>
        <select onChange={async (event) => selectQuestionnaire(parseInt(event.target.value))}>
          <option value="0" key="">Choose a questionnaire to configure</option>
          {questionnaireList.map((questionnaire, index) => {
              return(
                <option value={questionnaire.id} key={questionnaire.id}>{questionnaire.name}</option>
              )
            })
          }
        </select>
        <div>
          <h4>{selectedQuestionnaire.name}</h4>
        
          {questionList.length > 0 &&
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Response</th>
                <th>Linked Categories</th>
                <th>Actions</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {questionList.map((question, mappingIndex) => {
                return(
                  <tr key={mappingIndex} style={{border: "1px solid"}}>
                    <td>{question.question.value}</td>
                    <td>
                      <div style={{display: "flex", flexDirection: "column"}}>   
                        {question.answers.map((answer, answerIndex) => {
                          return (
                            <>                 
                              {answer.value}
                              <br/>
                            </>   
                          ) 
                        })}
                      </div>
                    </td>
                    <td>
                      <div style={{display: "flex", flexDirection: "column"}}>   
                          {question.answers.map((answer, answerIndex) => {
                            return (
                              <>                 
                                Categories Linked: {answer.categories.length}
                                <br/>
                              </>   
                            ) 
                          })}
                        </div>
                      </td>
                      <td>
                        <div style={{display: "flex", flexDirection: "column"}}>   
                          {question.answers.map((answer, answerIndex) => {
                            return (
                              <>     
                                <div style={{display: "flex", flexDirection: "row", height:"23px"}}> 
                                  <button onClick={() => clickEditLinkButton(question, mappingIndex, answer)}>E</button>
                                  <button onClick={() => answer_categoryMappingTable.delete(mappingIndex)}>X</button>
                                </div>
                              </>   
                            ) 
                          })}
                        </div>
                      </td>
                  </tr> 
                )
              })}
            </tbody>
          </table>
        }
        </div>

        {linkWorkshop && (
          <div>
            <h4>Rule Configuration</h4>

            <h6>Question: {selectedLink?.question?.value}</h6>

            <h6>Response: {selectedLink?.answer?.value}</h6>


            <h4>Linked Categories</h4>

            {selectedLink?.answer?.categories.map((category, index) => {
              return (
                <h6>{category.value}</h6>
              )
            })}
            <select>
              {categoryList.map((category) => {
                if (selectedLink?.answer?.categories.some((categoryCheck) => category.id === categoryCheck.id)) return;
                return(<option value={category.category}>{category.category}</option>)
              })}
            </select>
            <button>Link another category</button>
            <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/>
          </div>
        )}
    </>
  );
};

export default LogicBuilder;
