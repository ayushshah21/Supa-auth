import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { knowledgeBaseData } from "../data/knowledgeBaseData";

export default function KnowledgeBasePage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Enhanced search functionality
  const getSearchResults = () => {
    if (!searchQuery.trim()) return knowledgeBaseData;

    const search = searchQuery.toLowerCase();
    const searchTerms = search.split(" ").filter((term) => term.length > 0);

    return knowledgeBaseData
      .map((qa) => {
        // Calculate relevance score
        let score = 0;
        const questionLower = qa.question.toLowerCase();
        const answerLower = qa.answer.toLowerCase();

        for (const term of searchTerms) {
          // Exact match in question (highest priority)
          if (questionLower.includes(term)) {
            score += 10;
            // Bonus for exact word match
            if (
              questionLower.includes(` ${term} `) ||
              questionLower.startsWith(`${term} `) ||
              questionLower.endsWith(` ${term}`)
            ) {
              score += 5;
            }
          }

          // Match in answer (lower priority)
          if (answerLower.includes(term)) {
            score += 3;
            // Bonus for exact word match in answer
            if (
              answerLower.includes(` ${term} `) ||
              answerLower.startsWith(`${term} `) ||
              answerLower.endsWith(` ${term}`)
            ) {
              score += 2;
            }
          }
        }

        return { qa, score };
      })
      .filter((item) => item.score > 0) // Only keep items with matches
      .sort((a, b) => b.score - a.score) // Sort by relevance score
      .map((item) => item.qa); // Return just the QA items
  };

  const questions = getSearchResults();

  const toggleQuestion = (id: string) => {
    setExpandedIds((prev) => {
      const newIds = new Set(prev);
      if (newIds.has(id)) {
        newIds.delete(id);
      } else {
        newIds.add(id);
      }
      return newIds;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 sm:py-12 md:py-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t("knowledgeBase.title")}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              {t("knowledgeBase.subtitle")}
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm">
            <div className="p-4 sm:p-6 md:p-8">
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("knowledgeBase.searchPlaceholder")}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 pl-12 sm:pl-14 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-4 sm:left-5 top-3.5 sm:top-4 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </div>
              </div>

              {/* Q&A List */}
              <div className="max-w-3xl mx-auto">
                <div className="space-y-4 sm:space-y-6">
                  {questions.map((qa) => (
                    <div
                      key={qa.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <button
                        onClick={() => toggleQuestion(qa.id)}
                        className="w-full text-left py-4 sm:py-6 flex justify-between items-center focus:outline-none group"
                      >
                        <span className="text-base sm:text-lg md:text-xl font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 pr-4 sm:pr-8">
                          {qa.question}
                        </span>
                        {expandedIds.has(qa.id) ? (
                          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-blue-500 transition-transform duration-200" />
                        ) : (
                          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                        )}
                      </button>
                      {expandedIds.has(qa.id) && (
                        <div className="pb-4 sm:pb-6">
                          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-strong:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-ul:text-gray-600 prose-ol:text-gray-600">
                            <div
                              dangerouslySetInnerHTML={{ __html: qa.answer }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {questions.length === 0 && (
                    <div className="text-center py-8 sm:py-12">
                      <div className="text-xl sm:text-2xl font-medium text-gray-500">
                        {searchQuery
                          ? t("knowledgeBase.noResults")
                          : t("knowledgeBase.noQuestions")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
