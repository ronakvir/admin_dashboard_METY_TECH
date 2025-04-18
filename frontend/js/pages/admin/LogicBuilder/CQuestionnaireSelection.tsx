import { categoryTable, question_questionnaireTable, questionTable, answerTable, answer_categoryMappingTable } from "../../database";
import CLogicWorkshop from "./CLogicWorkshop";
import CQuestionnaireTable from "./CQuestionnaireTable";
import { LogicBuilderStates, QuestionCategory } from "./LogicBuilder"

const CQuestionnaireSelection: React.FC<LogicBuilderStates> = ({ 
    questionnaireList,      setQuestionnaireList,
    categoryList,           setCategoryList,
    questionList,           setQuestionList, 
    selectedLink,           setSelectedLink,
    linkWorkshop,           setLinkWorkshop,
    selectedQuestionnaire,  setSelectedQuestionnaire,
    expandedQuestions,      setExpandedQuestions}) => {
    

    function clearStates() {
        setQuestionList([]);
    }


    // Happens when a questionnaire is selected from the dropdown menu
    const selectQuestionnaire = async (questionnaireID: number) => {
        // Reset states
        setSelectedLink({ id: 0, question: "", answer: { id: 0, value: "", categories: [{ id: 0, value: "" }] } });
        setLinkWorkshop(false);
        if (questionnaireID === 0 ){
            setSelectedQuestionnaire({id: 0, name: "" })
            clearStates();
            return;
        }
        
        // Se the selected questionnaire from the list of questionnaires that match the given ID
        questionnaireList.some((questionnaire) => {
            if (questionnaireID === questionnaire.id) setSelectedQuestionnaire(questionnaire);
        })
        
        // Initialize and clear temp objects
        const tempCategoryList = [{ id: 0, category: "" }]
        tempCategoryList.splice(0, tempCategoryList.length);

        const tempQuestionList = [{ id: 0, question: "", answers: [{ id: 0, value: "", categories: [{ id: 0, value: "" }] }] }];
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
        // Ultimately We need a resulting data structure from the database that has the information of the Type: QuestionCategory defined in this file - tempQuestions has the same structure below.
        question_questionnaireTable.forEach((relation, relationKey) => {
            const tempQuestion = { id: 0, question: "", answers: [{ id: 0, value: "", categories: [{ id: 0, value: "" }] }] };
            tempQuestion.answers.splice(0, tempQuestion.answers.length); // reset answers
            // Find the questionID from the question_questionnaire table based on the given questionaireID
            if (questionnaireID === relation.questionnaireID) {
            const questionID = relation.questionID;

            // Set temp object values
            tempQuestion.id = questionID;
            tempQuestion.question = questionTable.get(questionID)?.question as string;

            answerTable.forEach((answer, answerID) => {
                if (questionID === answer.questionID) {
                const tempAnswer = { id: 0, value: "", categories: [{ id: 0, value: "" }] };
                tempAnswer.categories.splice(0, tempAnswer.categories.length);
                tempAnswer.id = answerID;
                tempAnswer.value = answer.text;
                answer_categoryMappingTable.forEach((mapping, mappingKey) => {
                    if (answerID === mapping.answerID && questionnaireID === mapping.questionnaireID) {
                    if (categoryTable.has(mapping.categoryID)){
                        tempAnswer.categories.push({id: mapping.categoryID, value: categoryTable.get(mapping.categoryID)?.category as string });
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

        // Make all rows collapsed
        const tempExpandedQuestionsList: boolean[] = [];
        tempQuestionList.forEach(() => {
            tempExpandedQuestionsList.push(false);
        })
        setExpandedQuestions(tempExpandedQuestionsList);
    }
    
    
    
    
    return (
        <>

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
            <hr/>
            <h4>{selectedQuestionnaire.name}</h4>
            <div style={{display:"flex", flexDirection: "row"}}>
                <CQuestionnaireTable 
                    questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
                    categoryList={categoryList} setCategoryList={setCategoryList}
                    questionList={questionList} setQuestionList={setQuestionList} 
                    selectedLink={selectedLink} setSelectedLink={setSelectedLink}
                    linkWorkshop={linkWorkshop} setLinkWorkshop={setLinkWorkshop}
                    selectedQuestionnaire={selectedQuestionnaire} setSelectedQuestionnaire={setSelectedQuestionnaire}
                    expandedQuestions={expandedQuestions} setExpandedQuestions={setExpandedQuestions}
                />
                <CLogicWorkshop 
                    questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
                    categoryList={categoryList} setCategoryList={setCategoryList}
                    questionList={questionList} setQuestionList={setQuestionList} 
                    selectedLink={selectedLink} setSelectedLink={setSelectedLink}
                    linkWorkshop={linkWorkshop} setLinkWorkshop={setLinkWorkshop}
                    selectedQuestionnaire={selectedQuestionnaire} setSelectedQuestionnaire={setSelectedQuestionnaire}
                    expandedQuestions={expandedQuestions} setExpandedQuestions={setExpandedQuestions}
                />
            </div>

        </>
    )
}
export default CQuestionnaireSelection;