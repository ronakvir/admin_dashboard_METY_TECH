import { LogicPageService } from "../../../api/services.gen"
import { categoryTable, question_questionnaireTable, questionTable, answerTable, answer_categoryMappingTable } from "../../database";
import CLogicWorkshop from "./CLogicWorkshop";
import CQuestionnaireTable from "./CQuestionnaireTable";
import { LogicBuilderStates } from "./LogicBuilder"

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
        setSelectedLink({ id: 0, text: "", answer: { id: 0, text: "", categories: [{ id: 0, text: "", inclusive: true}] } });
        setLinkWorkshop(false);
        if (questionnaireID === 0 ){
            setSelectedQuestionnaire({id: 0, title: "" })
            clearStates();
            return;
        }
        
        // Set the selected questionnaire from the list of questionnaires that match the given ID
        questionnaireList.some((questionnaire) => {
            if (questionnaireID === questionnaire.id) setSelectedQuestionnaire(questionnaire);
        })

        // API call for Questionnaire List
        LogicPageService.getQuestions(questionnaireID)
            .then( response => {
                console.log(response);
                setQuestionList(response);

                // Make all rows collapsed
                const tempExpandedQuestionsList: boolean[] = [];
                response.forEach(() => {
                    tempExpandedQuestionsList.push(false);
                })
                setExpandedQuestions(tempExpandedQuestionsList);
            })
            .catch( error => {
                console.log(error);
            })

        // API call for Category List
        LogicPageService.getCategories()
            .then( response => {
                console.log(response);
                setCategoryList(response);

            })
            .catch( error => {
                console.log(error);
            })
    }
    
    
    
    
    return (
        <>
            <h6>Select Questionnaire</h6>
            <select onChange={async (event) => selectQuestionnaire(parseInt(event.target.value))}>
            <option value="0" key="">Choose a questionnaire to configure</option>
            {questionnaireList.map((questionnaire, index) => {
                return(
                    <option value={questionnaire.id} key={questionnaire.id}>{questionnaire.title}</option>
                )
                })
            }
            </select>
            <hr/>
            <h4>{selectedQuestionnaire.title}</h4>
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