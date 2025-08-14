"use client";
import { QuizData } from "@/types/question";
import { useEffect, useState } from "react";

import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import { saveArchiveMetadata } from "@/lib/firebase/archive";
import LoadingIndicator from "@/components/LoadingIndicator";

// 메타데이터의 초기값 정의
const initialMetadata = {
  id: "wp202408-React-001-O",
  title: "리액트 기본 개념 문제세트(객관식)",
  description: "리액트 입문자를 위한 기본 개념 점검용 객관식 문제 10문항",
  subject: "리액트(객관식)",
  category: ["React", "Frontend"],
  difficulty: "Beginner",
  version: "v1.0",
  created_at: "2025-08-04",
  updated_at: "2025-08-04",
  author: "ChatGPT + User",
  source: "직접 제작",
  tags: ["React", "JavaScript", "프론트엔드"],
  license: "CC BY-NC-SA",
  num_questions: 0,
};

// 질문 객체의 초기값 정의
const initialQuestion = {
  id: 0,
  type: "objective",
  question: {
    questionText: "",
    questionExplanation: [],
  },
  choices: [
    { choice: "", choiceExplanation: "" },
    { choice: "", choiceExplanation: "" },
    { choice: "", choiceExplanation: "" },
  ],
  answer: {
    answerText: "",
    answerExplanation: "",
  },
  tags: ["", ""],
};

export default function JsonEditor() {
  const [data, setData] = useState<QuizData>({
    metadata: initialMetadata,
    questions: [],
  });
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [jsonPreview, setJsonPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    try {
      setUserId(user?.uid || null);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Firebase Storage에 데이터 저장 & Firebase에 Metadata 저장
  const saveData = async (currentData: QuizData) => {
    if (!user) {
      console.error("User not authenticated. Cannot save data.");
      return;
    }

    const fileName = `archive-${Date.now()}.json`;
    const storagePath = `archives/${fileName}`;
    const fileRef = ref(storage, storagePath);
    const jsonData = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([jsonData], { type: "application/json" });
    try {
      await uploadBytes(fileRef, dataBlob);
      await saveArchiveMetadata({
        title: data.metadata.title ?? fileName.replace(".json", ""),
        uploader: user.displayName || "unknown",
        description: data.metadata.description ?? "설명이 없습니다.",
        questionsCount: data.metadata.num_questions,
        storagePath,
      });
      console.log("File successfully uploaded to Storage!");
    } catch (e) {
      console.error("Error uploading file to Storage: ", e);
    }
  };

  // 데이터 변경 핸들러
  const handleDataChange = (newData: QuizData) => {
    setData(newData);
    // saveData(newData);
    setJsonPreview(JSON.stringify(newData, null, 2));
  };

  const handleSave = () => {
    saveData(data);
  };

  // 메타데이터 변경 핸들러
  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleDataChange({
      ...data,
      metadata: { ...data.metadata, [name]: value },
    });
  };

  // 새로운 질문 추가
  const addQuestion = () => {
    const newQuestion = {
      ...initialQuestion,
      id:
        data.questions.length > 0
          ? Math.max(...data.questions.map((q) => q.id)) + 1
          : 1,
    };
    handleDataChange({
      ...data,
      questions: [...data.questions, newQuestion],
    });
    setEditingQuestion(newQuestion.id);
  };

  // 질문 삭제
  const deleteQuestion = (id: number) => {
    const filteredQuestions = data.questions.filter((q) => q.id !== id);
    handleDataChange({
      ...data,
      questions: filteredQuestions,
    });
    if (editingQuestion === id) {
      setEditingQuestion(null);
    }
  };

  // 질문 편집 핸들러
  const handleQuestionEdit = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, dataset } = e.target;
    const { index, field, subfield, subprop } = dataset;

    // subfield를 숫자로 변환하여 사용하거나, 존재하지 않을 경우를 대비
    const subfieldIndex = subfield ? parseInt(subfield) : null;

    const updatedQuestions = (data.questions ?? []).map((q) => {
      if (q.id === parseInt(index!)) {
        let newQuestion = { ...q };

        if (field === "questionText") {
          newQuestion.question.questionText = value;
        }
        // 👇 변경점: choices 편집 로직을 객체에 맞게 수정합니다.
        else if (field === "choices" && subfieldIndex !== null && subprop) {
          // 불변성을 위해 배열과 객체를 모두 복사합니다.
          const newChoices = [...(newQuestion.choices ?? [])];
          const newChoiceItem = { ...newChoices[subfieldIndex] };

          // subprop('choice' 또는 'choiceExplanation')에 따라 값을 업데이트합니다.
          newChoiceItem[subprop as keyof typeof newChoiceItem] = value;

          newChoices[subfieldIndex] = newChoiceItem;
          newQuestion.choices = newChoices;
        } else if (field === "answerText") {
          newQuestion.answer.answerText = value;
        } else if (field === "answerExplanation") {
          newQuestion.answer.answerExplanation = value;
        } else if (field === "tags" && subfieldIndex !== null) {
          // ... (tags 로직은 기존과 동일)
        }
        return newQuestion;
      }
      return q;
    });

    handleDataChange({
      ...data,
      questions: updatedQuestions,
    });
  };

  // JSON 파일 다운로드 핸들러
  const handleDownload = () => {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quiz_data_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate JSON file.", e);
    }
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  // 컴포넌트 렌더링
  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans antialiased text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700">
          JSON 기반 퀴즈 편집기
        </h1>

        {/* 사용자 ID 표시 */}
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <h2 className="text-xl font-bold">사용자 ID</h2>
          <p className="text-sm font-mono break-all">{user?.uid || "익명"}</p>
          <p className="text-xs text-gray-500 mt-2">
            이 ID는 데이터 저장에 사용됩니다. 이 애플리케이션에서는 모든
            사용자가 익명으로 로그인하고 데이터를 공유합니다.
          </p>
        </div>

        {/* 메타데이터 편집 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            문서 메타데이터
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(data.metadata).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700">
                  {key}
                </label>
                <input
                  type="text"
                  name={key}
                  value={data.metadata[key as keyof typeof data.metadata] || ""}
                  onChange={handleMetadataChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  readOnly={[
                    "created_at",
                    "updated_at",
                    "num_questions",
                  ].includes(key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 질문 목록 및 편집 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">질문 목록</h2>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              {data.questions.length}개의 질문
            </p>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-lg hover:bg-indigo-700 transition duration-300"
            >
              + 새 질문 추가
            </button>
          </div>
          <div className="space-y-4">
            {data.questions.map((q, index) => (
              <div
                key={q.id}
                className={`p-4 rounded-md border-2 cursor-pointer transition duration-200 ease-in-out ${
                  editingQuestion === q.id
                    ? "bg-indigo-50 border-indigo-500"
                    : "bg-gray-50 hover:bg-gray-100 border-transparent"
                }`}
                onClick={() => setEditingQuestion(q.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {index + 1}. {q.question.questionText || "새 질문"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteQuestion(q.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingQuestion && (
            <div className="mt-8 p-6 bg-indigo-50 rounded-lg border-2 border-indigo-500">
              <h3 className="text-xl font-bold mb-4">
                질문 #{editingQuestion} 편집
              </h3>
              {data.questions.find((q) => q.id === editingQuestion) && (
                <div className="space-y-4">
                  {/* 질문 텍스트 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      질문 내용
                    </label>
                    <textarea
                      name="questionText"
                      data-index={editingQuestion}
                      data-field="questionText"
                      value={
                        data.questions.find((q) => q.id === editingQuestion)
                          ?.question.questionText || ""
                      }
                      onChange={handleQuestionEdit}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      rows={3}
                    ></textarea>
                  </div>

                  {/* 선택지 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      선택지 및 해설
                    </label>
                    <div className="space-y-4 mt-1">
                      {(
                        data.questions.find((q) => q.id === editingQuestion)
                          ?.choices ?? []
                      ).map((choiceItem, choiceIndex) => (
                        // 👇 변경점: 각 선택지마다 choice와 choiceExplanation을 위한 입력 필드를 만듭니다.
                        <div
                          key={choiceIndex}
                          className="p-2 border rounded-md bg-gray-50"
                        >
                          <input
                            type="text"
                            placeholder={`선택지 ${choiceIndex + 1}`}
                            data-index={editingQuestion}
                            data-field="choices"
                            data-subfield={choiceIndex}
                            data-subprop="choice" // 'choice' 속성을 수정하도록 지정
                            value={choiceItem.choice}
                            onChange={handleQuestionEdit}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <textarea
                            placeholder={`선택지 ${choiceIndex + 1} 해설`}
                            data-index={editingQuestion}
                            data-field="choices"
                            data-subfield={choiceIndex}
                            data-subprop="choiceExplanation" // 'choiceExplanation' 속성을 수정하도록 지정
                            value={choiceItem.choiceExplanation}
                            onChange={handleQuestionEdit}
                            rows={1}
                            className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 정답 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      정답 텍스트
                    </label>
                    <input
                      type="text"
                      name="answerText"
                      data-index={editingQuestion}
                      data-field="answerText"
                      value={
                        data.questions.find((q) => q.id === editingQuestion)
                          ?.answer.answerText || ""
                      }
                      onChange={handleQuestionEdit}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>

                  {/* 정답 해설 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      정답 해설
                    </label>
                    <textarea
                      name="answerExplanation"
                      data-index={editingQuestion}
                      data-field="answerExplanation"
                      value={
                        data.questions.find((q) => q.id === editingQuestion)
                          ?.answer.answerExplanation
                      }
                      onChange={handleQuestionEdit}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      rows={2}
                    ></textarea>
                  </div>

                  {/* 태그 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      태그 (쉼표로 구분)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      data-index={editingQuestion}
                      data-field="tags"
                      value={data.questions
                        .find((q) => q.id === editingQuestion)
                        ?.tags.join(", ")}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(",")
                          .map((tag) => tag.trim());
                        const updatedQuestions = data.questions.map((q) => {
                          if (q.id === editingQuestion) {
                            return { ...q, tags: tags };
                          }
                          return q;
                        });
                        handleDataChange({
                          ...data,
                          questions: updatedQuestions,
                        });
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* JSON 미리보기 및 다운로드 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            JSON 미리보기
          </h2>
          <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
          {/* <div className="mt-4 flex justify-end"> */}
          <div className="mt-4 flex justify-end space-x-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-lg hover:bg-green-700 transition duration-300"
            >
              Save
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-lg hover:bg-green-700 transition duration-300"
            >
              JSON 파일 다운로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
