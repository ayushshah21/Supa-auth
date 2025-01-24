import { enKnowledgeBase } from './knowledgeBase/en/data';
import { frKnowledgeBase } from './knowledgeBase/fr/data';
import { esKnowledgeBase } from './knowledgeBase/es/data';
import { guKnowledgeBase } from './knowledgeBase/gu/data';

export type KnowledgeBaseEntry = {
  id: string;
  question: string;
  answer: string;
  is_published: boolean;
};

export const getKnowledgeBaseData = (language: string): KnowledgeBaseEntry[] => {
  switch (language) {
    case 'fr':
      return frKnowledgeBase;
    case 'es':
      return esKnowledgeBase;
    case 'gu':
      return guKnowledgeBase;
    default:
      return enKnowledgeBase;
  }
};

// Default export for backward compatibility
export const knowledgeBaseData = enKnowledgeBase;