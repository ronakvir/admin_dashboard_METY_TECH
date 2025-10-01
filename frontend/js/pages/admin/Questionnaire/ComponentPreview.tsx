import { useEffect, FC, useState } from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder"
import { QuestionnairebuilderService } from "../../../api/services.gen";
import { VideoResponse } from "../../../api/types.gen";

const ComponentPreview: FC<QuestionnaireStates> = ({ 
    currentQuestionnaire, setCurrentQuestionnaire, 
    previewQuestionnaire, setPreviewQuestionnaire
}) => {
    const [tempSliderValue, setTempSliderValue] = useState(50);
    const [qResponses, setQResponses] = useState<number[]>(new Array(currentQuestionnaire.questions.length));
    const [matchedVideos, setMatchedVideos] = useState<VideoResponse[]>([]);

    const returnToDashboard = () => {
        setCurrentQuestionnaire({ id: 0, title: "", status: "", started: 0, completed: 0, last_modified: new Date().toISOString(), questions: []});
        setPreviewQuestionnaire(false);
    };

    const updateResponses = (answer: {id: number, text: string}, index: number) => {
        const tempResponses = [ ...qResponses ];
        tempResponses[index] = answer.id;
        setQResponses(tempResponses);
    };

    const submitAnswers = () => {
        const requestData = {
            questionnaire_id: currentQuestionnaire.id,
            answer_ids: qResponses
        };
        QuestionnairebuilderService.questionnairebuilderGetvideosCreate({ requestBody: requestData })
            .then(response => setMatchedVideos(response))
            .catch(error => console.log(error));
    };

    return (
      <div className="preview-container">
        {/* Header */}
        <div className="header-row">
          <h4 style={{ margin: 0 }}>{currentQuestionnaire.title}</h4>
          <button className="btn-back" onClick={returnToDashboard}>Return</button>
        </div>

        {/* Question Grid */}
        <div className="question-grid">
          {currentQuestionnaire.questions.map((question: any, index: number) => (
            <div key={index} className="question-card">
              <h5>{question?.text}</h5>
              {(() => {
                let type = question?.type;
                if (type === "slider") {
                  return (
                    <input
                      type="range"
                      value={tempSliderValue}
                      onChange={(e) => setTempSliderValue(Number(e.target.value))}
                      className="form-input"
                    />
                  );
                } else if (type === "text") {
                  return (
                    <input
                      type="text"
                      placeholder="Enter your answer"
                      className="form-input"
                    />
                  );
                } else {
                  return question?.answers.map((answer: any) => {
                    if (type === "multichoice") {
                      return (
                        <label key={answer.id} className="option-row">
                          <input
                            type="radio"
                            name={question.text}
                            onChange={() => updateResponses(answer, index)}
                          />
                          {answer.text}
                        </label>
                      );
                    } else if (type === "checkbox") {
                      return (
                        <label key={answer.id} className="option-row">
                          <input type="checkbox" name={question.text} />
                          {answer.text}
                        </label>
                      );
                    }
                  });
                }
              })()}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="submit-container">
         <button className="btn-primary" onClick={submitAnswers}>
        Submit
        </button>
        </div>

        {/* Results */}
        <div className="results-panel">
          {matchedVideos.length > 0 ? (
            matchedVideos.map((video, index) => (
              <div key={video.id} className="video-card">
                <p><strong>{index + 1}: {video.title}</strong></p>
                <p><strong>Duration:</strong> {video.duration}</p>
                <p><strong>Description:</strong> {video.description}</p>
                {video.url && (
                  <p>
                    <strong>URL:</strong>{" "}
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      {video.url}
                    </a>
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="video-card empty">
              <p>No videos found matching your responses.</p>
            </div>
          )}
        </div>

        {/* Styles */}
        <style>{`
          .preview-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 900px;
          }
          .submit-container {
            display: flex;
            justify-content: center;
            margin-top: 10px;
            margin-bottom: 0px;
          }
          .submit-container .btn-primary {
            width: 100%;
            max-width: 900px;
            text-align: center;
          }
          .header-row {
            display: flex;
            justify-content: left;
            gap: 16px;
            align-items: center;
            margin-bottom: 12px;
          }
          .question-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
          }
          .question-card {
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .option-row {
            display: flex;
            gap: 8px;
            align-items: center;
            font-size: 14px;
          }
          .results-panel {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 20px;
          }
          .video-card {
            border: 1px solid #ccc;
            border-radius: 6px;
            padding: 12px;
            background: #fff;
          }
          .video-card.empty {
            text-align: center;
            background: #f5f5f5;
            color: #666;
          }
          .form-input {
            padding: 6px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100%;
          }
          .btn-back, .btn-primary {
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            padding: 6px 12px;
          }
          .btn-back {
            background-color: #6c757d;
            color: white;
          }
          .btn-primary {
            background-color: #007bff;
            color: white;
          }
          .btn-back:hover, .btn-primary:hover {
            opacity: 0.85;
          }
        `}</style>
      </div>
    );
};

export default ComponentPreview;