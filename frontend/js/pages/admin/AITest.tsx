import { AIQuery, QuestionnairebuilderService } from "../../api";
import React, { useState, useEffect } from "react";

const AITest: React.FC = () => {

  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [qResponses, setQResponses] = useState<{question: string, answer: string}[]>([]);
  const [showWorkout, setShowWorkout] = useState(false);

  useEffect(() => {
    // This runs only once, when the component first loads
    getData();
  }, []);

  const resetAll = () => {
    setQResponses([])
    setShowWorkout(false)
    setResponse(null)
  }

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
  };

  const updateResponses = (question: string, answer: { id: number; text: string }, index: number) => {
    const temp = [...qResponses];
    while (temp.length <= index) temp.push({ question: "", answer: "" });
    temp[index] = { question, answer: answer.text };
    setQResponses(temp);

    console.log(questions)

  };

  const triggerQuery = async () => {
    setLoading(true);
    let input = ""

    for (const r of qResponses) {
      input += `${r.question}: ${r.answer}\n`;
    }
    
    try {
      const res = await AIQuery.QueryGemini(input);
      console.log("✅ Clean response:", res);
      setResponse(res);
      setShowWorkout(true);
    } catch (err) {
      console.error("❌ Query error:", err);
      setResponse({ error: "Error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = () => {
    console.log("📝 Submitting responses:", qResponses);
    triggerQuery();
  };

  if (!questionnaires.length) {
    return <div>Loading questionnaires...</div>;
  }

  

  return (
    <>
      {/* Questionnaire View */}
      {response === null || !showWorkout ? (
        <div className="preview-container">
          <div className="header-row">
            <h4>{questionnaires[0]?.title}</h4>
          </div>

          <div className="question-grid">
            {questionnaires[0]?.questions?.map((question: any, index: number) => (
              <div key={index} className="question-card">
                {/* Render Each Question */}
                <h5>{question.text}</h5>
                {(() => {
                  switch (question.type) {
                    case "slider":
                      return (
                        <input
                          type="range"
                          value={qResponses[index]?.answer || 50}
                          onChange={(e) =>
                            updateResponses(
                              question.text,
                              {
                                id: Number(e.target.value),
                                text: e.target.value.toString(),
                              },
                              index
                            )
                          }
                        />
                      );

                    case "text":
                      return (
                        <input
                          type="text"
                          placeholder="Enter your answer"
                          onChange={(e) =>
                            updateResponses(
                              question.text,
                              { id: 0, text: e.target.value },
                              index
                            )
                          }
                        />
                      );

                    case "multichoice":
                      return (question.answers || []).map((answer: any) => (
                        <label key={answer.id}>
                          <input
                            type="radio"
                            name={`q_${index}`}
                            onChange={() =>
                              updateResponses(question.text, answer, index)
                            }
                          />
                          {answer.text}
                        </label>
                      ));
                    {/* Complex Checkbox Logic that also unchecks "None" when others are clicked */}
                    case "checkbox":
                      return (question.answers || []).map((answer: any) => {
                        const isChecked = qResponses[index]?.answer?.split(", ")?.includes(answer.text);

                        return (
                          <label key={answer.id}>
                            <input
                              type="checkbox"
                              name={`q_${index}`}
                              checked={!!isChecked}
                              onChange={(e) => {
                                const temp = [...qResponses];
                                while (temp.length <= index)
                                  temp.push({ question: "", answer: "" });

                                let currentAnswers = temp[index].answer
                                  ? temp[index].answer.split(", ")
                                  : [];

                                const isNone = answer.text.toLowerCase() === "none";

                                if (e.target.checked) {
                                  // ✅ If "None" is selected → clear all others and set only "None"
                                  if (isNone) {
                                    currentAnswers = ["None"];
                                  } else {
                                    // ✅ Otherwise, remove "None" if present and add this option
                                    currentAnswers = currentAnswers.filter(
                                      (a) => a.toLowerCase() !== "none"
                                    );
                                    currentAnswers.push(answer.text);
                                  }
                                } else {
                                  // ✅ If unchecked → remove it
                                  currentAnswers = currentAnswers.filter(
                                    (a) => a !== answer.text
                                  );
                                }

                                temp[index] = {
                                  question: question.text,
                                  answer: currentAnswers.join(", "),
                                };
                                setQResponses(temp);
                              }}
                            />
                            {answer.text}
                          </label>
                        );
                      });
                    default:
                      return null;
                  }
                })()}
              </div>
            ))}
          </div>

          <div className="submit-container">
            <button
              className="btn-primary"
              onClick={submitAnswers}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

          <br />
          {/* Shows with questions and answers are selected */}
          {qResponses.map((response, index) => (
            <label key={index}>
              {response.question}
              <br />
              {response.answer}
            </label>
          ))}

          <style>
            {`
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
            .form-input {
              padding: 6px;
              font-size: 14px;
              border: 1px solid #ccc;
              border-radius: 4px;
              width: 100%;
            }
            .btn-primary {
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              padding: 6px 12px;
              background-color: #007bff;
              color: white;
            }
            .btn-primary:hover {
              opacity: 0.85;
            }
            `}
          </style>
        </div>
      ) : (
        
        <div className="workout-container">
          {/* List the workout playlist */}
          <h1 className="week-title">🏋️ Week {response.week_number + 1}</h1>

          {response.days.map((day, dayIdx) => (
            
            <div key={dayIdx} className="day-card">
              <div className="submit-container">
                <button
                  className="btn-primary"
                  onClick = {() => resetAll()}
                >Return
                </button>
              </div>

              <h2 className="day-title">
                Day {day.day_number + 1}: {day.title}
              </h2>

              <div className="day-meta">
                <span>🎯 Goal: {day.goal}</span>
                <span>⚡ Difficulty: {day.difficulty}</span>
                <span>⏱️ Duration: {(day.total_duration_seconds / 60).toFixed(0)} min</span>
              </div>

              {day.segments.map((segment, segIdx) => (
                <div key={segIdx} className="segment-card">
                  <div className="segment-header">
                    <h3 className="segment-title">{segment.activity}</h3>
                    <div className="segment-info">
                      <span className="segment-rounds">🔁 {segment.sets} {segment.sets === 1 ? "Set" : "Sets"}</span>
                      <span className="segment-time">
                        ⏱️ {Math.floor(segment.duration_seconds / 60)} min
                      </span>
                    </div>
                  </div>

                  <div className="segment-details">
                    {segment.segments.map((ex, exIdx) => (
                      <div key={exIdx} className="exercise-row">
                        <div className="exercise-info">
                          <strong>{ex.exercise}</strong>
                          <span className="duration">{ex.duration_seconds}s</span>
                        </div>
                        {ex.notes && <p className="notes">{ex.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <style>
            {`
            .workout-container {
              font-family: "Inter", sans-serif;
              padding: 24px;
              max-width: 900px;
              margin: 0 auto;
              background: linear-gradient(180deg, #f7f9fc 0%, #eef3f7 100%);
              border-radius: 16px;
              box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
            }

            .week-title {
              text-align: center;
              color: #0a3d62;
              font-size: 28px;
              margin-bottom: 24px;
              font-weight: 700;
            }

            .day-card {
              background: #fff;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 24px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
              transition: transform 0.2s ease;
            }

            .day-card:hover {
              transform: translateY(-2px);
            }

            .day-title {
              color: #1a5276;
              margin-bottom: 8px;
              font-size: 22px;
            }

            .day-meta {
              display: flex;
              gap: 16px;
              flex-wrap: wrap;
              font-size: 14px;
              color: #566573;
              margin-bottom: 12px;
            }

            .segment-card {
              background: #f8faff;
              border-left: 4px solid #007bff;
              padding: 14px 18px;
              border-radius: 8px;
              margin-top: 14px;
            }

            .segment-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }

            .segment-title {
              font-size: 18px;
              color: #007bff;
              margin: 0;
              font-weight: 600;
            }

            .segment-info {
              display: flex;
              gap: 10px;
              align-items: center;
              font-size: 14px;
              color: #566573;
            }

            .segment-rounds {
              background: #eaf3ff;
              color: #0056b3;
              border-radius: 6px;
              padding: 3px 8px;
              font-weight: 500;
            }

            .segment-time {
              color: #85929e;
            }

            .segment-details {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            .exercise-row {
              background: #fff;
              padding: 10px 14px;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }

            .exercise-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 15px;
            }

            .duration {
              color: #117a65;
              font-weight: 500;
            }

            .notes {
              margin-top: 4px;
              font-size: 13px;
              color: #566573;
              font-style: italic;
            }
          `}
          </style>
        </div>
        
      )}
    </>
  );

};

export default AITest;
